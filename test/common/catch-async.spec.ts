import { NextFunction, Request, Response } from 'express';
import { catchAsync } from '../../src/common/util/catch.async';

describe('catchAsync', () => {
  it('forwards a rejected promise to next', async () => {
    const error = new Error('boom');
    const handler = catchAsync(async () => {
      throw error;
    });
    const next = jest.fn() as unknown as NextFunction;
    handler({} as Request, {} as Response, next);
    await new Promise((resolve) => setImmediate(resolve));
    expect(next).toHaveBeenCalledWith(error);
  });

  it('does not call next on success', async () => {
    const handler = catchAsync(async (_req, res) => {
      res.end();
    });
    const next = jest.fn() as unknown as NextFunction;
    const res = { end: jest.fn() } as unknown as Response;
    handler({} as Request, res, next);
    await new Promise((resolve) => setImmediate(resolve));
    expect(next).not.toHaveBeenCalled();
  });
});
