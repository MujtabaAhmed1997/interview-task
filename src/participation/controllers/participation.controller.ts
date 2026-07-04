import { Request, Response } from 'express';
import { RouterClass } from '../../common/base/router.class';
import { HttpStatusCode } from '../../common/enums/http-status.enum';
import { ApiError, apiOk } from '../../common/errors/api.error';
import { authRequired } from '../../common/middlewares/auth.middleware';
import { AuthUser } from '../../common/types/auth-user';
import { QuestionAdminResponse } from '../../question/responses/question-admin.response';
import { QuestionParticipantResponse } from '../../question/responses/question-participant.response';
import { contestParamValidator } from '../requests/contest-param.request';
import { participationIdValidator } from '../requests/participation-id.request';
import { saveAnswersValidator } from '../requests/save-answers.request';
import { ParticipationResponse } from '../responses/participation.response';
import { SubmitResultResponse } from '../responses/submit-result.response';
import { ParticipationService } from '../services/participation.service';

export class ParticipationController extends RouterClass {
  private readonly participationService: ParticipationService;

  constructor(participationService: ParticipationService = new ParticipationService()) {
    super();
    this.participationService = participationService;
  }

  protected register(): void {
    this.router.post('/contests/:id/join', authRequired, ...contestParamValidator, this.handle(this.join.bind(this)));
    this.router.get('/contests/:id/questions', authRequired, ...contestParamValidator, this.handle(this.questions.bind(this)));
    this.router.post('/contests/:id/answers', authRequired, ...saveAnswersValidator, this.handle(this.saveAnswers.bind(this)));
    this.router.post('/contests/:id/submit', authRequired, ...contestParamValidator, this.handle(this.submit.bind(this)));
    this.router.get('/participations/:id', authRequired, ...participationIdValidator, this.handle(this.getParticipation.bind(this)));
  }

  private actor(req: Request): AuthUser {
    if (!req.user) {
      throw ApiError.unauthorized();
    }
    return req.user;
  }

  private async join(req: Request, res: Response): Promise<void> {
    const participation = await this.participationService.join(req.params.id, this.actor(req));
    apiOk(res, new ParticipationResponse(participation), HttpStatusCode.CREATED);
  }

  private async questions(req: Request, res: Response): Promise<void> {
    const { questions, isAdminView } = await this.participationService.getQuestionsForViewer(req.params.id, this.actor(req));
    const data = isAdminView ? questions.map((question) => new QuestionAdminResponse(question)) : questions.map((question) => new QuestionParticipantResponse(question));
    apiOk(res, data);
  }

  private async saveAnswers(req: Request, res: Response): Promise<void> {
    const participation = await this.participationService.saveAnswers(req.params.id, this.actor(req).id, { answers: req.body.answers });
    apiOk(res, new ParticipationResponse(participation));
  }

  private async submit(req: Request, res: Response): Promise<void> {
    const participation = await this.participationService.submit(req.params.id, this.actor(req).id);
    apiOk(res, new SubmitResultResponse(participation));
  }

  private async getParticipation(req: Request, res: Response): Promise<void> {
    const participation = await this.participationService.getParticipation(req.params.id, this.actor(req));
    apiOk(res, new ParticipationResponse(participation));
  }
}
