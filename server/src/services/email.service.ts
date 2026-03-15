import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from '../utils/logger';

const transporter = nodemailer.createTransport({
  service: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: env.GMAIL_USER,
    pass: env.GMAIL_APP_PASSWORD,
  },
});

export interface BillEmailData {
  to: string;
  name: string;
  villaNumber: string;
  billingMonth: string;
  unitsConsumed: number;
  ratePerUnit: number;
  amount: number;
  photoUrl?: string; // Cloudinary URL for the meter reading photo
}

export const sendBillEmail = async (data: BillEmailData): Promise<void> => {
  const { to, name, villaNumber, billingMonth, unitsConsumed, ratePerUnit, amount, photoUrl } = data;

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px;color:#1a1a1a;">
      <h2 style="color:#1e3a5f;margin-bottom:4px;">Water Bill — ${billingMonth}</h2>
      <p style="color:#666;margin-top:0;">Villa ${villaNumber} · GDV</p>
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
      <p>Dear ${name},</p>
      <p>Your water usage bill for <strong>Villa ${villaNumber}</strong> for <strong>${billingMonth}</strong> is ready.</p>
      ${photoUrl ? `
      <div style="margin:20px 0;text-align:center;">
        <h3 style="color:#1e3a5f;font-size:16px;margin-bottom:12px;">Meter Reading Photo</h3>
        <img src="${photoUrl}" alt="Meter reading for Villa ${villaNumber}" 
             style="max-width:100%;height:auto;border:2px solid #e0e0e0;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);" />
        <p style="font-size:12px;color:#666;margin-top:8px;">Meter reading captured for billing period</p>
      </div>
      ` : ''}
      <table style="width:100%;border-collapse:collapse;margin:24px 0;font-size:15px;">
        <tr style="background:#f8f9fa;">
          <td style="padding:12px 16px;border:1px solid #e0e0e0;">Units consumed</td>
          <td style="padding:12px 16px;border:1px solid #e0e0e0;text-align:right;">${unitsConsumed} units</td>
        </tr>
        <tr>
          <td style="padding:12px 16px;border:1px solid #e0e0e0;">Rate per unit</td>
          <td style="padding:12px 16px;border:1px solid #e0e0e0;text-align:right;">₹${ratePerUnit.toFixed(2)}</td>
        </tr>
        <tr style="background:#e8f4fd;font-weight:bold;">
          <td style="padding:14px 16px;border:1px solid #b8d9f5;">Total amount due</td>
          <td style="padding:14px 16px;border:1px solid #b8d9f5;text-align:right;">₹${amount.toFixed(2)}</td>
        </tr>
      </table>
      <p style="font-size:13px;color:#999;margin-top:32px;">
        This is an automated message from the Aqua47 water management system.<br/>
        Please do not reply to this email.
      </p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `GDV Water Billing <${env.GMAIL_USER}>`,
      to,
      subject: `Water Bill — Villa ${villaNumber} — ${billingMonth}`,
      html,
    });
    logger.info(`Bill email sent to ${to} for villa ${villaNumber}`);
  } catch (error) {
    logger.error('Failed to send bill email:', error);
    throw error;
  }
};