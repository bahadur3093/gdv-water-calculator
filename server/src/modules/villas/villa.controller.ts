import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as villaService from './villa.service';

export const getVillas = asyncHandler(async (_req: Request, res: Response) => {
  const villas = await villaService.getVillas();
  res.json({ success: true, data: villas });
});

export const createVilla = asyncHandler(async (req: Request, res: Response) => {
  const villa = await villaService.createVilla(req.body);
  res.status(201).json({ success: true, data: villa });
});

export const updateVilla = asyncHandler(async (req: Request, res: Response) => {
  const villa = await villaService.updateVilla(req.params.id, req.body);
  res.json({ success: true, data: villa });
});
