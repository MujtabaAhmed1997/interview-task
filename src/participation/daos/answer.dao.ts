import { Op, Transaction } from 'sequelize';
import { ParticipantAnswerOptionModel } from '../models/participant-answer-option.model';
import { ParticipantAnswerModel } from '../models/participant-answer.model';
import { SelectedAnswer } from '../types/selected-answer';

export class AnswerDAO {
  async replaceAnswers(participationId: string, answers: SelectedAnswer[], transaction: Transaction): Promise<void> {
    const questionIds = answers.map((answer) => answer.questionId);
    await ParticipantAnswerModel.destroy({ where: { participationId, questionId: { [Op.in]: questionIds } }, transaction });

    const createdAnswers = await ParticipantAnswerModel.bulkCreate(
      answers.map((answer) => ({ participationId, questionId: answer.questionId })),
      { transaction },
    );

    const optionRows = createdAnswers.flatMap((created, index) => answers[index].optionIds.map((optionId) => ({ answerId: created.id, optionId })));
    if (optionRows.length > 0) {
      await ParticipantAnswerOptionModel.bulkCreate(optionRows, { transaction });
    }
  }

  async getSelectedByParticipation(participationId: string, transaction?: Transaction): Promise<SelectedAnswer[]> {
    const answers = await ParticipantAnswerModel.findAll({
      where: { participationId },
      include: [{ model: ParticipantAnswerOptionModel, as: 'selectedOptions' }],
      transaction,
    });
    return answers.map((answer) => ({ questionId: answer.questionId, optionIds: (answer.selectedOptions ?? []).map((selected) => selected.optionId) }));
  }
}
