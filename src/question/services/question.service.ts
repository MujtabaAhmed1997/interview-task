import { ServiceCRUD } from '../../common/base/service.crud';
import { CacheService, cacheService } from '../../common/cache/cache.service';
import { sequelize } from '../../common/config/database';
import { CacheKeyPrefix } from '../../common/enums/cache-key.enum';
import { ApiError } from '../../common/errors/api.error';
import { ContestService } from '../../contest/services/contest.service';
import { OptionDAO } from '../daos/option.dao';
import { QuestionDAO } from '../daos/question.dao';
import { OptionDTO } from '../dtos/option.dto';
import { QuestionDTO } from '../dtos/question.dto';
import { QuestionErrorCode } from '../enums/question-error-code.enum';
import { CreateOptionInput } from '../requests/create-option.request';
import { CreateQuestionInput } from '../requests/create-question.request';
import { UpdateOptionInput } from '../requests/update-option.request';
import { UpdateQuestionInput } from '../requests/update-question.request';
import { assertValidOptionSet } from './option-set.rule';

export class QuestionService extends ServiceCRUD<QuestionDTO, QuestionDAO> {
  private readonly optionDao: OptionDAO;
  private readonly contestService: ContestService;
  private readonly cache: CacheService;

  constructor(
    dao: QuestionDAO = new QuestionDAO(),
    optionDao: OptionDAO = new OptionDAO(),
    contestService: ContestService = new ContestService(),
    cache: CacheService = cacheService,
  ) {
    super(dao);
    this.optionDao = optionDao;
    this.contestService = contestService;
    this.cache = cache;
  }

  async createQuestion(contestId: string, input: CreateQuestionInput): Promise<QuestionDTO> {
    await this.contestService.getById(contestId);
    assertValidOptionSet(input.type, input.options);
    const question = await sequelize.transaction(async (transaction) => {
      const created = await this.dao.create({ contestId, type: input.type, text: input.text, points: input.points ?? 1, position: input.position ?? 0 }, transaction);
      await this.optionDao.createMany(
        input.options.map((option, index) => ({ questionId: created.id, text: option.text, isCorrect: option.isCorrect, position: option.position ?? index })),
        transaction,
      );
      return created;
    });
    await this.bustContestQuestions(contestId);
    return this.requireQuestionWithOptions(question.id);
  }

  async updateQuestion(questionId: string, input: UpdateQuestionInput): Promise<QuestionDTO> {
    const existing = await this.requireQuestion(questionId);
    await this.dao.update(questionId, this.toQuestionPayload(input));
    await this.bustContestQuestions(existing.contestId);
    return this.requireQuestionWithOptions(questionId);
  }

  async removeQuestion(questionId: string): Promise<void> {
    const existing = await this.requireQuestion(questionId);
    await this.dao.remove(questionId);
    await this.bustContestQuestions(existing.contestId);
  }

  async listByContest(contestId: string): Promise<QuestionDTO[]> {
    await this.contestService.getById(contestId);
    return this.dao.findByContest(contestId);
  }

  async addOption(questionId: string, input: CreateOptionInput): Promise<OptionDTO> {
    const question = await this.requireQuestion(questionId);
    const option = await sequelize.transaction(async (transaction) => {
      const created = await this.optionDao.create({ questionId, text: input.text, isCorrect: input.isCorrect, position: input.position ?? 0 }, transaction);
      assertValidOptionSet(question.type, await this.optionDao.findByQuestion(questionId, transaction));
      return created;
    });
    await this.bustContestQuestions(question.contestId);
    return option;
  }

  async updateOption(optionId: string, input: UpdateOptionInput): Promise<OptionDTO> {
    const option = await this.requireOption(optionId);
    const question = await this.requireQuestion(option.questionId);
    const updated = await sequelize.transaction(async (transaction) => {
      const result = await this.optionDao.update(optionId, this.toOptionPayload(input), transaction);
      assertValidOptionSet(question.type, await this.optionDao.findByQuestion(option.questionId, transaction));
      return result;
    });
    await this.bustContestQuestions(question.contestId);
    return updated;
  }

  async removeOption(optionId: string): Promise<void> {
    const option = await this.requireOption(optionId);
    const question = await this.requireQuestion(option.questionId);
    await sequelize.transaction(async (transaction) => {
      await this.optionDao.remove(optionId, transaction);
      assertValidOptionSet(question.type, await this.optionDao.findByQuestion(option.questionId, transaction));
    });
    await this.bustContestQuestions(question.contestId);
  }

  private async requireQuestion(id: string): Promise<QuestionDTO> {
    const question = await this.dao.findByIdOrNull(id);
    if (!question) {
      throw ApiError.notFound('Question not found', QuestionErrorCode.QUESTION_NOT_FOUND);
    }
    return question;
  }

  private async requireQuestionWithOptions(id: string): Promise<QuestionDTO> {
    const question = await this.dao.findByIdWithOptions(id);
    if (!question) {
      throw ApiError.notFound('Question not found', QuestionErrorCode.QUESTION_NOT_FOUND);
    }
    return question;
  }

  private async requireOption(id: string): Promise<OptionDTO> {
    const option = await this.optionDao.findByIdOrNull(id);
    if (!option) {
      throw ApiError.notFound('Option not found', QuestionErrorCode.OPTION_NOT_FOUND);
    }
    return option;
  }

  private toQuestionPayload(input: UpdateQuestionInput): Partial<QuestionDTO> {
    const payload: Partial<QuestionDTO> = {};
    if (input.text !== undefined) {
      payload.text = input.text;
    }
    if (input.points !== undefined) {
      payload.points = input.points;
    }
    if (input.position !== undefined) {
      payload.position = input.position;
    }
    return payload;
  }

  private toOptionPayload(input: UpdateOptionInput): Partial<OptionDTO> {
    const payload: Partial<OptionDTO> = {};
    if (input.text !== undefined) {
      payload.text = input.text;
    }
    if (input.isCorrect !== undefined) {
      payload.isCorrect = input.isCorrect;
    }
    if (input.position !== undefined) {
      payload.position = input.position;
    }
    return payload;
  }

  private async bustContestQuestions(contestId: string): Promise<void> {
    await this.cache.del(`${CacheKeyPrefix.CONTEST_QUESTIONS}:${contestId}`);
  }
}
