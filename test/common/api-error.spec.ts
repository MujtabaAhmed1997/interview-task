import { Response } from 'express';
import { ApiErrorCode } from '../../src/common/enums/api-error-code.enum';
import { CommonErrorCode } from '../../src/common/enums/common-error-code.enum';
import { HttpStatusCode } from '../../src/common/enums/http-status.enum';
import { ApiError, apiError, apiOk } from '../../src/common/errors/api.error';

const createRes = (): Response => {
  return { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() } as unknown as Response;
};

describe('response envelope', () => {
  it('apiOk returns result with errors null', () => {
    const res = createRes();
    apiOk(res, { id: '1' });
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.OK);
    expect(res.json).toHaveBeenCalledWith({ result: { id: '1' }, errors: null });
  });

  it('apiError returns result null with a mandatory subCode', () => {
    const res = createRes();
    apiError(res, ApiError.notFound('missing'));
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.NOT_FOUND);
    expect(res.json).toHaveBeenCalledWith({
      result: null,
      errors: [{ code: ApiErrorCode.NOT_FOUND, subCode: CommonErrorCode.RESOURCE_NOT_FOUND, message: 'missing' }],
    });
  });

  it('maps an unknown error to a 500 internal envelope', () => {
    const res = createRes();
    apiError(res, new Error('boom'));
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.INTERNAL_SERVER_ERROR);
    expect(res.json).toHaveBeenCalledWith({
      result: null,
      errors: [{ code: ApiErrorCode.INTERNAL, subCode: CommonErrorCode.INTERNAL_ERROR, message: 'Internal server error' }],
    });
  });

  it('carries a subCode and status on every ApiError', () => {
    const error = ApiError.forbidden();
    expect(error.status).toBe(HttpStatusCode.FORBIDDEN);
    expect(error.subCode).toBe(CommonErrorCode.FORBIDDEN);
    expect(error.errors[0].subCode).toBe(CommonErrorCode.FORBIDDEN);
  });
});
