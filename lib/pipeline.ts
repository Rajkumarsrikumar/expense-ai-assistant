/**
 * Stub extraction pipeline - deterministic rules.
 * Replace with real OCR/AI later.
 */

export interface ExtractionResult {
  txn_date: string | null;
  merchant_raw: string | null;
  merchant_normalized: string | null;
  amount_original: number | null;
  currency_original: string | null;
  category: string | null;
  confidence: number;
  needs_review: boolean;
}

const CURRENCY_PATTERNS: Record<string, RegExp> = {
  USD: /\b(usd|dollar|\$)\b/i,
  SGD: /\b(sgd|singapore)\b/i,
  JPY: /\b(jpy|yen|¥)\b/i,
  EUR: /\b(eur|euro|€)\b/i,
  GBP: /\b(gbp|pound|£)\b/i,
  AUD: /\b(aud)\b/i,
};

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Food: ['restaurant', 'cafe', 'coffee', 'food', 'grocery', 'supermarket', 'dining', 'meal'],
  Transport: ['uber', 'grab', 'taxi', 'petrol', 'gas', 'parking', 'transit', 'bus', 'train'],
  Shopping: ['amazon', 'shop', 'store', 'retail', 'mall'],
  Utilities: ['electric', 'water', 'internet', 'phone', 'utility'],
  Healthcare: ['pharmacy', 'clinic', 'hospital', 'medical', 'health'],
  Entertainment: ['movie', 'netflix', 'spotify', 'game', 'entertainment'],
};

export function extractFromFilename(filename: string): Partial<ExtractionResult> {
  const result: Partial<ExtractionResult> = {};
  const lower = filename.toLowerCase();

  // Infer currency from filename
  for (const [curr, pattern] of Object.entries(CURRENCY_PATTERNS)) {
    if (pattern.test(filename)) {
      result.currency_original = curr;
      break;
    }
  }

  // Try to parse amount from filename (e.g. receipt_50_usd.pdf, 123.45.pdf)
  const amountMatch = filename.match(/(\d+[.,]\d{2})|(\d+)/);
  if (amountMatch) {
    const amt = parseFloat(amountMatch[1]?.replace(',', '.') || amountMatch[2] || '0');
    if (amt > 0 && amt < 1_000_000) {
      result.amount_original = amt;
    }
  }

  return result;
}

export function extractFromText(text: string): Partial<ExtractionResult> {
  const result: Partial<ExtractionResult> = {};
  const lower = text.toLowerCase();

  // Parse amount - look for patterns like $123.45, 123.45 USD, etc.
  const amountRegex = /(?:USD|SGD|EUR|GBP|JPY|\$|€|£|¥)\s*(\d+[.,]\d{2})|(\d+[.,]\d{2})\s*(?:USD|SGD|EUR|GBP|JPY)?|total[:\s]+(\d+[.,]\d{2})/gi;
  const amountMatch = amountRegex.exec(text);
  if (amountMatch) {
    const amtStr = (amountMatch[1] || amountMatch[2] || amountMatch[3] || '').replace(',', '.');
    const amt = parseFloat(amtStr);
    if (amt > 0 && amt < 1_000_000) {
      result.amount_original = amt;
    }
  }

  // Infer currency from text
  for (const [curr, pattern] of Object.entries(CURRENCY_PATTERNS)) {
    if (pattern.test(text)) {
      result.currency_original = curr;
      break;
    }
  }

  // Try to extract date (YYYY-MM-DD, DD/MM/YYYY, etc.)
  const dateMatch = text.match(/(\d{4})-(\d{2})-(\d{2})|(\d{2})\/(\d{2})\/(\d{4})|(\d{2})-(\d{2})-(\d{4})/);
  if (dateMatch) {
    if (dateMatch[1]) {
      result.txn_date = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`;
    } else if (dateMatch[4]) {
      result.txn_date = `${dateMatch[6]}-${dateMatch[5]}-${dateMatch[4]}`;
    } else if (dateMatch[7]) {
      result.txn_date = `${dateMatch[9]}-${dateMatch[8]}-${dateMatch[7]}`;
    }
  }

  return result;
}

function normalizeMerchant(raw: string | null | undefined): string | null {
  if (!raw || !raw.trim()) return null;
  return raw
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\b(pte|ltd|inc|llc|co)\b\.?/gi, '')
    .trim()
    .slice(0, 200) || null;
}

function categorize(merchant: string | null): { category: string | null; confidence: number } {
  if (!merchant) return { category: null, confidence: 0 };
  const lower = merchant.toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((k) => lower.includes(k))) {
      return { category: cat, confidence: 0.7 };
    }
  }
  return { category: null, confidence: 0.3 };
}

export function runStubExtractor(
  filename: string,
  textInput?: string | null
): ExtractionResult {
  const fromFile = extractFromFilename(filename);
  const fromText = textInput ? extractFromText(textInput) : {};

  const merged = {
    txn_date: fromText.txn_date || fromFile.txn_date || null,
    merchant_raw: fromText.merchant_raw || fromFile.merchant_raw || null,
    amount_original: fromText.amount_original ?? fromFile.amount_original ?? null,
    currency_original: fromText.currency_original || fromFile.currency_original || null,
  };

  const merchantNorm = normalizeMerchant(merged.merchant_raw || filename.replace(/\.[^.]+$/, ''));
  const { category, confidence: catConf } = categorize(merchantNorm);

  // Compute overall confidence
  let confidence = 0.5;
  if (merged.amount_original != null) confidence += 0.2;
  if (merged.currency_original) confidence += 0.15;
  if (merged.txn_date) confidence += 0.1;
  if (category) confidence = Math.max(confidence, catConf);

  const needs_review =
    merged.amount_original == null ||
    !merged.currency_original ||
    !merged.txn_date ||
    confidence < 0.5;

  return {
    txn_date: merged.txn_date,
    merchant_raw: merged.merchant_raw,
    merchant_normalized: merchantNorm,
    amount_original: merged.amount_original,
    currency_original: merged.currency_original,
    category,
    confidence: Math.min(1, confidence),
    needs_review,
  };
}
