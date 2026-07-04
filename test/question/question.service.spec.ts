import { ApiError } from '../../src/common/errors/api.error';
import { ContestErrorCode } from '../../src/contest/enums/contest-error-code.enum';
import { ContestService } from '../../src/contest/services/contest.service';
import { OptionDAO } from '../../src/question/daos/option.dao';
import { QuestionDAO } from '../../src/question/daos/question.dao';
import { OptionDTO } from '../../src/question/dtos/option.dto';
import { QuestionDTO } from '../../src/question/dtos/question.dto';
import { QuestionErrorCode } from '../../src/question/enums/question-error-code.enum';
import { QuestionType } from '../../src/question/enums/question-type.enum';
import { QuestionParticipantResponse } from '../../src/question/responses/question-participant.response';
import { assertValidOptionSet } from '../../src/question/services/option-set.rule';
import { QuestionService } from '../../src/question/services/question.service';

const opt = (isCorrect: boolean): { isCorrect: boolean } => ({ isCorrect });

describe('assertValidOptionSet', () => {
  it('accepts a single-select with exactly one correct option', () => {
    expect(() => assertValidOptionSet(QuestionType.SINGLE_SELECT, [opt(true), opt(false)])).not.toThrow();
  });

  it('rejects a single-select with two correct options', () => {
    expect(() => assertValidOptionSet(QuestionType.SINGLE_SELECT, [opt(true), opt(true)])).toThrow(ApiError);
  });

  it('rejects a single-select with no correct option', () => {
    expect(() => assertValidOptionSet(QuestionType.SINGLE_SELECT, [opt(false), opt(false)])).toThrow(ApiError);
  });

  it('accepts a true/false with two options and one correct', () => {
    expect(() => assertValidOptionSet(QuestionType.TRUE_FALSE, [opt(true), opt(false)])).not.toThrow();
  });

  it('rejects a true/false with three options', () => {
    expect(() => assertValidOptionSet(QuestionType.TRUE_FALSE, [opt(true), opt(false), opt(false)])).toThrow(ApiError);
  });

  it('accepts a multi-select with at least one correct', () => {
    expect(() => assertValidOptionSet(QuestionType.MULTI_SELECT, [opt(true), opt(true), opt(false)])).not.toThrow();
  });

  it('rejects a multi-select with no correct option', () => {
    expect(() => assertValidOptionSet(QuestionType.MULTI_SELECT, [opt(false), opt(false)])).toThrow(ApiError);
  });
});

describe('QuestionParticipantResponse', () => {
  it('drops is_correct from every option', () => {
    const dto = new QuestionDTO();
    dto.id = 'q1';
    dto.contestId = 'c1';
    dto.type = QuestionType.SINGLE_SELECT;
    dto.text = 'Q';
    dto.points = 1;
    dto.position = 0;
    dto.options = [Object.assign(new OptionDTO(), { id: 'o1', questionId: 'q1', text: 'A', isCorrect: true, position: 0 })];

    const response = JSON.parse(JSON.stringify(new QuestionParticipantResponse(dto)));

    expect(response.options[0]).toEqual({ id: 'o1', text: 'A', position: 0 });
    expect(response.options[0].isCorrect).toBeUndefined();
  });
});

describe('QuestionService.createQuestion', () => {
  it('propagates CONTEST_NOT_FOUND when the parent contest is missing', async () => {
    const contestService = { getById: jest.fn().mockRejectedValue(ApiError.notFound('Contest not found', ContestErrorCode.CONTEST_NOT_FOUND)) } as unknown as ContestService;
    const service = new QuestionService({} as QuestionDAO, {} as OptionDAO, contestService, { del: jest.fn() } as never);

    await expect(
      service.createQuestion('missing-contest', {
        type: QuestionType.SINGLE_SELECT,
        text: 'Q',
        options: [
          { text: 'A', isCorrect: true },
          { text: 'B', isCorrect: false },
        ],
      }),
    ).rejects.toMatchObject({ status: 404, subCode: ContestErrorCode.CONTEST_NOT_FOUND });
  });
});

describe('QuestionErrorCode', () => {
  it('exposes the not-found and invalid-set codes', () => {
    expect(QuestionErrorCode.INVALID_OPTION_SET).toBe('INVALID_OPTION_SET');
    expect(QuestionErrorCode.QUESTION_NOT_FOUND).toBe('QUESTION_NOT_FOUND');
  });
});
