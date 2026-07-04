export abstract class DTO {
  id!: string;
  createdAt!: Date;
  updatedAt!: Date;
}

export type DTOCreate<T extends DTO> = Omit<T, keyof DTO>;

export type DTOPatch<T extends DTO> = Partial<DTOCreate<T>>;
