/**
 * Barcode & QR Code Parser for Motor Inventory
 *
 * Supported formats:
 * 1. 4-part format: "model_number company_code serial_number pump_or_motor"
 *    e.g. "AFS007S + B10 38DBE + 18FAE 25330976 P"
 *    -> Model: "AFS007S+B10"
 *    -> Company Code: "38DBE+18FAE" (ignored / metadata)
 *    -> Serial: "25330976"
 *    -> Type: "P" (Pump)
 *
 * 2. 2-part format: "model_number serial_number[P|M]"
 *    e.g. "ASMSP1570B 33108408P" or "ASMSP1570B 33108408 P"
 *    -> Model: "ASMSP1570B"
 *    -> Serial: "33108408"
 *    -> Type: "P" (Pump)
 *
 * 3. Standalone serials:
 *    e.g. "MC-05-8910", "33108408P", or "25330976"
 */

export interface ParsedBarcodeResult {
  /** Original unparsed text read from the scanner */
  raw: string;
  /** Whether the scanned text passed validation */
  isValid: boolean;
  /** Extracted clean serial number */
  serial: string;
  /** Extracted model name/code (if present in barcode) */
  model?: string;
  /** Ignored company code if present in 4-part format */
  companyCode?: string;
  /** Extracted HP rating (if present) */
  hp?: string;
  /** 'P' for Pump, 'M' for Motor, or undefined */
  itemType?: "P" | "M" | string;
  /** Detected format identifier or pattern name */
  formatDetected: string;
  /** Validation error message if invalid */
  error?: string;
  /** Extra key-value pairs decoded from barcode */
  extra?: Record<string, string>;
}

export interface BarcodeFormatConfig {
  /** Minimum serial length */
  minLength?: number;
  /** Maximum serial length */
  maxLength?: number;
}

export const CURRENT_FORMAT_CONFIG: BarcodeFormatConfig = {
  minLength: 2,
  maxLength: 128,
};

/**
 * Validates raw barcode text.
 */
export function validateMotorBarcode(
  rawText: string,
  config: BarcodeFormatConfig = CURRENT_FORMAT_CONFIG
): { valid: boolean; reason?: string } {
  const text = (rawText || "").trim();

  if (!text) {
    return { valid: false, reason: "Scanned text is empty" };
  }

  if (config.minLength && text.length < config.minLength) {
    return {
      valid: false,
      reason: `Too short (min ${config.minLength} characters)`,
    };
  }

  if (config.maxLength && text.length > config.maxLength) {
    return {
      valid: false,
      reason: `Too long (max ${config.maxLength} characters)`,
    };
  }

  return { valid: true };
}

/**
 * Decoupled parser that extracts model_number, serial_number, and pump_or_motor.
 */
export function parseMotorBarcode(
  rawText: string,
  config: BarcodeFormatConfig = CURRENT_FORMAT_CONFIG
): ParsedBarcodeResult {
  const text = (rawText || "").trim();
  const validation = validateMotorBarcode(text, config);

  if (!validation.valid) {
    return {
      raw: text,
      isValid: false,
      serial: text,
      formatDetected: "INVALID",
      error: validation.reason,
    };
  }

  // 1. Normalize spaces around '+' so composite model names like 'AFS007S + B10'
  // and company codes like '38DBE + 18FAE' stay intact as single tokens ('AFS007S+B10')
  const normalized = text.replace(/\s*\+\s*/g, "+");
  const tokens = normalized.split(/\s+/).filter(Boolean);

  let model: string | undefined = undefined;
  let companyCode: string | undefined = undefined;
  let serial: string | undefined = undefined;
  let itemType: string | undefined = undefined; // 'P' or 'M'
  let formatDetected = "STANDARD_RAW_SERIAL";

  // Check if last token is solely 'P' or 'M' (pump vs motor indicator)
  let typeFromEnd: string | undefined = undefined;
  if (tokens.length >= 2 && /^[PM]$/i.test(tokens[tokens.length - 1])) {
    typeFromEnd = tokens[tokens.length - 1].toUpperCase();
    tokens.pop();
  }

  // Inspect the current last token for the serial number (may have attached 'P' or 'M', e.g. '33108408P')
  if (tokens.length >= 1) {
    const candidate = tokens[tokens.length - 1];

    // Pattern A: digits followed by attached P or M (e.g. 33108408P or 33108408M)
    const attachedMatch = candidate.match(/^(\d{5,16})([PM])$/i);
    // Pattern B: pure digits (e.g. 25330976 or 33108408)
    const pureDigitsMatch = candidate.match(/^(\d{5,16})$/);

    if (attachedMatch) {
      serial = attachedMatch[1];
      itemType = typeFromEnd || attachedMatch[2].toUpperCase();
      tokens.pop();
    } else if (pureDigitsMatch) {
      serial = pureDigitsMatch[1];
      itemType = typeFromEnd;
      tokens.pop();
    } else if (typeFromEnd) {
      // If trailing P/M was found, whatever precedes it in this token is the serial
      serial = candidate;
      itemType = typeFromEnd;
      tokens.pop();
    }
  }

  // Determine model & company code from remaining tokens
  if (tokens.length >= 2) {
    // 4-part format: model_number company_code [serial_number pump_or_motor]
    model = tokens[0];
    companyCode = tokens.slice(1).join(" ");
    formatDetected = "MOTOR_BARCODE_4PART";
  } else if (tokens.length === 1) {
    if (serial) {
      // 2-part format: model_number [serial_number]
      model = tokens[0];
      formatDetected = "MOTOR_BARCODE_2PART";
    } else {
      // Single token without attached serial: it's a standalone serial
      serial = tokens[0];
      formatDetected = "STANDALONE_SERIAL";
    }
  } else if (tokens.length === 0) {
    // Only serial and/or type was present
    if (!serial) {
      serial = text;
    }
    formatDetected = "STANDALONE_SERIAL_WITH_TYPE";
  }

  return {
    raw: text,
    isValid: Boolean(serial),
    serial: serial || text,
    model,
    companyCode,
    itemType,
    formatDetected,
  };
}

/**
 * Helper to get human-friendly label for Pump vs Motor indicator
 */
export function getItemTypeLabel(itemType?: string): string | null {
  if (!itemType) return null;
  const upper = itemType.toUpperCase();
  if (upper === "P") return "Pump";
  if (upper === "M") return "Motor";
  return upper;
}
