import { Transaction, UniqueConstraintError } from 'sequelize';
import { PaginatedResult, PaginationParams } from '../../common/base/pagination';
import { ServiceCRUD } from '../../common/base/service.crud';
import { CacheService, cacheService } from '../../common/cache/cache.service';
import { sequelize } from '../../common/config/database';
import { CacheKeyPrefix } from '../../common/enums/cache-key.enum';
import { UserRole } from '../../common/enums/user-role.enum';
import { ApiError } from '../../common/errors/api.error';
import { AuthUser } from '../../common/types/auth-user';
import { ContestDTO } from '../../contest/dtos/contest.dto';
import { ContestAccessLevel } from '../../contest/enums/contest-access-level.enum';
import { ContestStatus } from '../../contest/enums/contest-status.enum';
import { deriveContestStatus } from '../../contest/responses/contest.response';
import { ContestService } from '../../contest/services/contest.service';
import { QuestionDTO } from '../../question/dtos/question.dto';
import { QuestionService } from '../../question/services/question.service';
import { AnswerDAO } from '../daos/answer.dao';
import { ParticipationDAO } from '../daos/participation.dao';
import { ParticipationDTO } from '../dtos/participation.dto';
import { ParticipationErrorCode } from '../enums/participation-error-code.enum';
import { ParticipationStatus } from '../enums/participation-status.enum';
import { SaveAnswersInput } from '../requests/save-answers.request';
import { RankedParticipation, TopParticipation } from '../types/ranked-participation';
import { SelectedAnswer } from '../types/selected-answer';
import { GradableQuestion, scoreSubmission } from './scoring';

export class ParticipationService extends ServiceCRUD<ParticipationDTO, ParticipationDAO> {
  private readonly answerDao = new AnswerDAO();
  private readonly contestService: ContestService;
  private readonly questionService: QuestionService;
  private readonly cache: CacheService;

  constructor(
    dao: ParticipationDAO = new ParticipationDAO(),
    contestService: ContestService = new ContestService(),
    questionService: QuestionService = new QuestionService(),
    cache: CacheService = cacheService,
  ) {
    super(dao);
    this.contestService = contestService;
    this.questionService = questionService;
    this.cache = cache;
  }

  async join(contestId: string, user: AuthUser): Promise<ParticipationDTO> {
    const contest = await this.requireActiveContest(contestId);
    this.assertAccess(contest, user);
    if (await this.dao.findByContestAndUser(contestId, user.id)) {
      throw ApiError.conflict('You have already joined this contest', ParticipationErrorCode.ALREADY_JOINED);
    }
    try {
      return await this.dao.create({ contestId, userId: user.id, startedAt: new Date() });
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw ApiError.conflict('You have already joined this contest', ParticipationErrorCode.ALREADY_JOINED);
      }
      throw error;
    }
  }

  async getQuestionsForViewer(contestId: string, user: AuthUser): Promise<{ questions: QuestionDTO[]; isAdminView: boolean }> {
    await this.contestService.getById(contestId);
    if (user.role === UserRole.ADMIN) {
      return { questions: await this.questionService.listByContest(contestId), isAdminView: true };
    }
    if (!(await this.dao.findByContestAndUser(contestId, user.id))) {
      throw ApiError.forbidden('You must join the contest to view its questions', ParticipationErrorCode.NOT_JOINED);
    }
    return { questions: await this.questionService.listByContest(contestId), isAdminView: false };
  }

  async saveAnswers(contestId: string, userId: string, input: SaveAnswersInput): Promise<ParticipationDTO> {
    const participation = await this.requireInProgress(contestId, userId);
    await this.validateAnswers(contestId, input.answers);
    await sequelize.transaction((transaction) => this.answerDao.replaceAnswers(participation.id, input.answers, transaction));
    return participation;
  }

  async submit(contestId: string, userId: string): Promise<ParticipationDTO> {
    const participation = await this.requireInProgress(contestId, userId);
    const questions = await this.questionService.listByContest(contestId);
    const updated = await sequelize.transaction(async (transaction) => {
      const selected = await this.answerDao.getSelectedByParticipation(participation.id, transaction);
      const score = scoreSubmission(this.buildGradables(questions, selected));
      return this.dao.update(participation.id, { status: ParticipationStatus.SUBMITTED, score, submittedAt: new Date() }, transaction);
    });
    await this.bustLeaderboard(contestId);
    return updated;
  }

  async getRankedSubmitted(contestId: string, params: PaginationParams): Promise<PaginatedResult<RankedParticipation>> {
    return this.dao.getRankedSubmitted(contestId, params);
  }

  async getTopSubmitted(contestId: string, limit: number, transaction?: Transaction): Promise<TopParticipation[]> {
    return this.dao.getTopSubmitted(contestId, limit, transaction);
  }

  async listByUser(userId: string, params: PaginationParams, status?: ParticipationStatus): Promise<PaginatedResult<ParticipationDTO>> {
    return this.dao.findByUser(params, userId, status);
  }

  async getParticipation(participationId: string, user: AuthUser): Promise<ParticipationDTO> {
    const participation = await this.dao.findByIdOrNull(participationId);
    if (!participation) {
      throw ApiError.notFound('Participation not found', ParticipationErrorCode.PARTICIPATION_NOT_FOUND);
    }
    if (participation.userId !== user.id && user.role !== UserRole.ADMIN) {
      throw ApiError.forbidden('You can only view your own participation', ParticipationErrorCode.NOT_OWNER);
    }
    return participation;
  }

  private async requireActiveContest(contestId: string): Promise<ContestDTO> {
    const contest = await this.contestService.getById(contestId);
    if (deriveContestStatus(contest.startTime, contest.endTime) !== ContestStatus.ACTIVE) {
      throw ApiError.badRequest('Contest is not currently active', ParticipationErrorCode.CONTEST_NOT_ACTIVE);
    }
    return contest;
  }

  private assertAccess(contest: ContestDTO, user: AuthUser): void {
    if (contest.accessLevel === ContestAccessLevel.VIP && user.role !== UserRole.VIP && user.role !== UserRole.ADMIN) {
      throw ApiError.forbidden('This contest requires VIP access', ParticipationErrorCode.ACCESS_DENIED_LEVEL);
    }
  }

  private async requireInProgress(contestId: string, userId: string): Promise<ParticipationDTO> {
    const participation = await this.dao.findByContestAndUser(contestId, userId);
    if (!participation) {
      throw ApiError.forbidden('You must join the contest first', ParticipationErrorCode.NOT_JOINED);
    }
    if (participation.status === ParticipationStatus.SUBMITTED) {
      throw ApiError.conflict('You have already submitted this contest', ParticipationErrorCode.ALREADY_SUBMITTED);
    }
    return participation;
  }

  private async validateAnswers(contestId: string, answers: SelectedAnswer[]): Promise<void> {
    const questions = await this.questionService.listByContest(contestId);
    const optionsByQuestion = new Map(questions.map((question) => [question.id, new Set(question.options.map((option) => option.id))]));
    for (const answer of answers) {
      const optionSet = optionsByQuestion.get(answer.questionId);
      if (!optionSet || !answer.optionIds.every((optionId) => optionSet.has(optionId))) {
        throw ApiError.badRequest('Answer references a question or option outside this contest', ParticipationErrorCode.INVALID_ANSWER);
      }
    }
  }

  private buildGradables(questions: QuestionDTO[], selected: SelectedAnswer[]): GradableQuestion[] {
    const selectedByQuestion = new Map(selected.map((answer) => [answer.questionId, answer.optionIds]));
    return questions.map((question) => ({
      points: question.points,
      correctOptionIds: question.options.filter((option) => option.isCorrect).map((option) => option.id),
      selectedOptionIds: selectedByQuestion.get(question.id) ?? [],
    }));
  }

  private async bustLeaderboard(contestId: string): Promise<void> {
    await this.cache.delByPrefix(`${CacheKeyPrefix.CONTEST_LEADERBOARD}:${contestId}`);
  }
}
