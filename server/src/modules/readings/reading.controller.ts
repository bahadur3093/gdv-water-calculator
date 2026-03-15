import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as readingService from './reading.service';

export const getReadings = asyncHandler(async (_req: Request, res: Response) => {
  const readings = await readingService.getReadings();
  res.json({ success: true, data: readings });
});

export const getReadingsByVilla = asyncHandler(async (req: Request, res: Response) => {
  const readings = await readingService.getReadingsByVilla(req.params.villaId);
  res.json({ success: true, data: readings });
});

export const submitReading = asyncHandler(async (req: Request, res: Response) => {
  const reading = await readingService.submitReading(
    { ...req.body, readerId: req.user!.id },
    req.file
  );
  res.status(201).json({ success: true, data: reading });
});
