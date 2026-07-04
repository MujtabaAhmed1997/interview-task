import { Request, Response } from 'express';
import { RouterClass } from '../../common/base/router.class';
import { HttpStatusCode } from '../../common/enums/http-status.enum';
import { UserRole } from '../../common/enums/user-role.enum';
import { apiOk } from '../../common/errors/api.error';
import { authRequired } from '../../common/middlewares/auth.middleware';
import { requireRoles } from '../../common/middlewares/role.middleware';
import { createOptionValidator } from '../requests/create-option.request';
import { createQuestionValidator } from '../requests/create-question.request';
import { entityIdValidator } from '../requests/entity-id.request';
import { updateOptionValidator } from '../requests/update-option.request';
import { updateQuestionValidator } from '../requests/update-question.request';
import { OptionAdminResponse } from '../responses/option-admin.response';
import { QuestionAdminResponse } from '../responses/question-admin.response';
import { QuestionService } from '../services/question.service';

export class QuestionController extends RouterClass {
  private readonly questionService: QuestionService;

  constructor(questionService: QuestionService = new QuestionService()) {
    super();
    this.questionService = questionService;
  }

  protected register(): void {
    this.router.post('/contests/:id/questions', authRequired, requireRoles(UserRole.ADMIN), ...createQuestionValidator, this.handle(this.createQuestion.bind(this)));
    this.router.put('/questions/:id', authRequired, requireRoles(UserRole.ADMIN), ...updateQuestionValidator, this.handle(this.updateQuestion.bind(this)));
    this.router.delete('/questions/:id', authRequired, requireRoles(UserRole.ADMIN), ...entityIdValidator, this.handle(this.removeQuestion.bind(this)));
    this.router.post('/questions/:id/options', authRequired, requireRoles(UserRole.ADMIN), ...createOptionValidator, this.handle(this.addOption.bind(this)));
    this.router.put('/options/:id', authRequired, requireRoles(UserRole.ADMIN), ...updateOptionValidator, this.handle(this.updateOption.bind(this)));
    this.router.delete('/options/:id', authRequired, requireRoles(UserRole.ADMIN), ...entityIdValidator, this.handle(this.removeOption.bind(this)));
  }

  private async createQuestion(req: Request, res: Response): Promise<void> {
    const question = await this.questionService.createQuestion(req.params.id, {
      type: req.body.type,
      text: req.body.text,
      points: req.body.points,
      position: req.body.position,
      options: req.body.options,
    });
    apiOk(res, new QuestionAdminResponse(question), HttpStatusCode.CREATED);
  }

  private async updateQuestion(req: Request, res: Response): Promise<void> {
    const question = await this.questionService.updateQuestion(req.params.id, { text: req.body.text, points: req.body.points, position: req.body.position });
    apiOk(res, new QuestionAdminResponse(question));
  }

  private async removeQuestion(req: Request, res: Response): Promise<void> {
    await this.questionService.removeQuestion(req.params.id);
    apiOk(res, {});
  }

  private async addOption(req: Request, res: Response): Promise<void> {
    const option = await this.questionService.addOption(req.params.id, { text: req.body.text, isCorrect: req.body.isCorrect, position: req.body.position });
    apiOk(res, new OptionAdminResponse(option), HttpStatusCode.CREATED);
  }

  private async updateOption(req: Request, res: Response): Promise<void> {
    const option = await this.questionService.updateOption(req.params.id, { text: req.body.text, isCorrect: req.body.isCorrect, position: req.body.position });
    apiOk(res, new OptionAdminResponse(option));
  }

  private async removeOption(req: Request, res: Response): Promise<void> {
    await this.questionService.removeOption(req.params.id);
    apiOk(res, {});
  }
}
