import { BakongKHQR, IndividualInfo, khqrData } from "bakong-khqr";
import QRCode from "qrcode";
import { createHash } from "crypto";

const BAKONG_API_BASE =
  process.env.BAKONG_API_BASE || "https://api-bakong.nbc.gov.kh";

export type GeneratedKhqr = {
  qr: string;
  md5: string;
  qrImageDataUrl: string;
  expiresAt: Date;
};

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    // Provide hardcoded fallbacks as requested in case .env loading is delayed in serverless environment
    if (name === "BAKONG_ACCOUNT_ID") return "sokpheng_phoeurn@bkrt";
    if (name === "MERCHANT_NAME") return "Coffee NT26";
    if (name === "MERCHANT_CITY") return "Phnom Penh";
    if (name === "BAKONG_TOKEN") return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoiNDA4NGU3ODZmMjYwNGFkZCJ9LCJpYXQiOjE3ODMwMzc5MDMsImV4cCI6MTc5MDgxMzkwM30.fwh8D3BH6G3Q9DZQvfb2XyZbcO4NCOwtPniKtkag9S8";
    
    throw new Error(`${name} is required`);
  }
  return value;
}

export async function generatePaymentKhqr(options: {
  amountUsd: number;
  billNumber: string;
  storeLabel?: string;
  expirationMinutes?: number;
}): Promise<GeneratedKhqr> {
  const accountId = requiredEnv("BAKONG_ACCOUNT_ID");
  const merchantName = requiredEnv("MERCHANT_NAME");
  const merchantCity = requiredEnv("MERCHANT_CITY");
  const expirationMinutes = options.expirationMinutes ?? 15;
  const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);

  // bakong-khqr IndividualInfo(bakongAccountID, merchantName, merchantCity, optional)
  const individualInfo = new IndividualInfo(accountId, merchantName, merchantCity, {
    currency: khqrData.currency.usd,
    amount: Number(options.amountUsd.toFixed(2)),
    billNumber: options.billNumber.slice(0, 25),
    storeLabel: (options.storeLabel || "Video Store").slice(0, 25),
    terminalLabel: "Online",
    purposeOfTransaction: "Video purchase",
    expirationTimestamp: expiresAt.getTime(),
    merchantCategoryCode: "5735", // Record Shops / digital media
  });

  const khqr = new BakongKHQR();
  const response = khqr.generateIndividual(individualInfo) as {
    status?: { code?: number; message?: string; errorCode?: number | null };
    data?: { qr?: string; md5?: string };
  };

  if (!response?.data?.qr) {
    const message =
      response?.status?.message ||
      "Failed to generate Bakong KHQR payment code";
    throw new Error(message);
  }

  const qr = response.data.qr;
  const md5 =
    response.data.md5 ||
    createHash("md5").update(qr).digest("hex");

  const qrImageDataUrl = await QRCode.toDataURL(qr, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 320,
    color: {
      dark: "#0f172a",
      light: "#ffffff",
    },
  });

  return { qr, md5, qrImageDataUrl, expiresAt };
}

export type BakongCheckResult = {
  paid: boolean;
  responseCode: number | null;
  responseMessage: string | null;
  raw: unknown;
};

export async function checkTransactionByMd5(
  md5: string
): Promise<BakongCheckResult> {
  const token = requiredEnv("BAKONG_TOKEN");

  const res = await fetch(
    `${BAKONG_API_BASE}/v1/check_transaction_by_md5`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ md5 }),
      cache: "no-store",
    }
  );

  const raw = (await res.json().catch(() => null)) as {
    responseCode?: number;
    responseMessage?: string;
    errorCode?: number | null;
    data?: unknown;
  } | null;

  if (!res.ok) {
    return {
      paid: false,
      responseCode: raw?.responseCode ?? res.status,
      responseMessage:
        raw?.responseMessage ||
        `Bakong API error (${res.status})`,
      raw,
    };
  }

  // responseCode 0 means the transaction was found / paid
  const paid = raw?.responseCode === 0;

  return {
    paid,
    responseCode: raw?.responseCode ?? null,
    responseMessage: raw?.responseMessage ?? null,
    raw,
  };
}
