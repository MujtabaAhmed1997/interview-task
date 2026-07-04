import { BaseDAO } from '../../common/base/base.dao';
import { DbSort } from '../../common/enums/db-sort.enum';
import { QuestionDTO } from '../dtos/question.dto';
import { OptionModel } from '../models/option.model';
import { QuestionModel } from '../models/question.model';
import { optionToDTO } from './option.dao';

const OPTIONS_INCLUDE = [{ model: OptionModel, as: 'options' }];

export class QuestionDAO extends BaseDAO<QuestionModel, QuestionDTO> {
  constructor() {
    super(QuestionModel);
  }

  protected toDTO(entity: QuestionModel): QuestionDTO {
    const dto = new QuestionDTO();
    dto.id = entity.id;
    dto.contestId = entity.contestId;
    dto.type = entity.type;
    dto.text = entity.text;
    dto.points = entity.points;
    dto.position = entity.position;
    dto.options = (entity.options ?? []).map(optionToDTO);
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }

  async findByIdWithOptions(id: string): Promise<QuestionDTO | null> {
    const entity = await this.model.findByPk(id, {
      include: OPTIONS_INCLUDE,
      order: [[{ model: OptionModel, as: 'options' }, 'position', DbSort.ASC]],
    });
    return entity ? this.toDTO(entity) : null;
  }

  async findByContest(contestId: string): Promise<QuestionDTO[]> {
    const entities = await this.model.findAll({
      where: { contestId },
      include: OPTIONS_INCLUDE,
      order: [
        ['position', DbSort.ASC],
        [{ model: OptionModel, as: 'options' }, 'position', DbSort.ASC],
      ],
    });
    return entities.map((entity) => this.toDTO(entity));
  }
}
