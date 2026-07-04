import { CreationAttributes, Transaction } from 'sequelize';
import { BaseDAO } from '../../common/base/base.dao';
import { DbSort } from '../../common/enums/db-sort.enum';
import { OptionDTO } from '../dtos/option.dto';
import { OptionModel } from '../models/option.model';

export const optionToDTO = (entity: OptionModel): OptionDTO => {
  const dto = new OptionDTO();
  dto.id = entity.id;
  dto.questionId = entity.questionId;
  dto.text = entity.text;
  dto.isCorrect = entity.isCorrect;
  dto.position = entity.position;
  dto.createdAt = entity.createdAt;
  dto.updatedAt = entity.updatedAt;
  return dto;
};

export class OptionDAO extends BaseDAO<OptionModel, OptionDTO> {
  constructor() {
    super(OptionModel);
  }

  protected toDTO(entity: OptionModel): OptionDTO {
    return optionToDTO(entity);
  }

  async createMany(rows: Array<CreationAttributes<OptionModel>>, transaction?: Transaction): Promise<void> {
    await this.model.bulkCreate(rows, { transaction });
  }

  async findByQuestion(questionId: string, transaction?: Transaction): Promise<OptionDTO[]> {
    const entities = await this.model.findAll({ where: { questionId }, order: [['position', DbSort.ASC]], transaction });
    return entities.map(optionToDTO);
  }
}
