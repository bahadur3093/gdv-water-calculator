import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as billingService from './billing.service';

export const getBills = asyncHandler(async (_req: Request, res: Response) => {
  const bills = await billingService.getBills();
  res.json({ success: true, data: bills });
});

export const getBillsByVilla = asyncHandler(async (req: Request, res: Response) => {
  const bills = await billingService.getBillsByVilla(req.params.villaId);
  res.json({ success: true, data: bills });
});

export const getBillById = asyncHandler(async (req: Request, res: Response) => {
  const bill = await billingService.getBillById(req.params.id);
  res.json({ success: true, data: bill });
});

export const sendBillEmail = asyncHandler(async (req: Request, res: Response) => {
  await billingService.sendBillEmailById(req.params.id);
  res.json({ success: true, message: 'Bill email sent successfully' });
});

export const markAsPaid = asyncHandler(async (req: Request, res: Response) => {
  const bill = await billingService.markAsPaid(req.params.id);
  res.json({ success: true, data: bill });
});
