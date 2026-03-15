import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as rateService from './rate.service';

export const getRates = asyncHandler(async (_req: Request, res: Response) => {
  const rates = await rateService.getRates();
  res.json({ success: true, data: rates });
});

export const getCurrentRate = asyncHandler(async (_req: Request, res: Response) => {
  const rate = await rateService.getCurrentRate();
  res.json({ success: true, data: rate });
});

export const createRate = asyncHandler(async (req: Request, res: Response) => {
  const rate = await rateService.createRate({ ...req.body, setBy: req.user!.id });
  res.status(201).json({ success: true, data: rate });
});
