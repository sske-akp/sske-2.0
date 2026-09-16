/**
 * Motor Serials & Dual-Unit (Pump + Motor Set) Helper
 *
 * Handles logic for:
 * 1. Tracking Pump (P) vs Motor (M) availability
 * 2. Merging when both halves of a set are scanned:
 *    - Only P scanned -> stored as "25330976 (P)"
 *    - Only M scanned -> stored as "25330976 (M)"
 *    - Both scanned   -> stored as "25330976" (green badge)
 * 3. Single unit models:
 *    - Do not raise P/M colors, stored as plain "25330976" (neutral badge)
 */

export type SerialBadgeStatus =
  | "COMPLETE_SET" // Both Pump & Motor available (Green)
  | "PUMP_ONLY" // Only Pump available (Amber/Orange)
  | "MOTOR_ONLY" // Only Motor available (Amber/Orange)
  | "STANDARD"; // Single unit / model without P+M tracking (Neutral)

export interface ParsedSerialEntry {
  baseSerial: string;
  itemType: "P" | "M" | null;
  raw: string;
}

export interface SerialStatusInfo {
  status: SerialBadgeStatus;
  baseSerial: string;
  badgeLabel?: string;
  badgeTooltip: string;
}

const DUAL_SET_STORAGE_KEY = "sske_motors_dual_set_settings_v1";

/**
 * Parses a stored serial string to determine its base number and P/M tag.
 * Supports:
 * - "25330976 (P)" -> base "25330976", itemType "P"
 * - "25330976 (M)" -> base "25330976", itemType "M"
 * - "25330976 P"   -> base "25330976", itemType "P"
 * - "25330976 M"   -> base "25330976", itemType "M"
 * - "25330976"     -> base "25330976", itemType null
 */
export function parseSerialEntry(raw: string): ParsedSerialEntry {
  const trimmed = (raw || "").trim();

  const pMatch = trimmed.match(/^(.+?)\s*(?:\([Pp]\)|\b[Pp]\b)$/);
  const mMatch = trimmed.match(/^(.+?)\s*(?:\([Mm]\)|\b[Mm]\b)$/);

  if (pMatch) {
    return {
      baseSerial: pMatch[1].trim(),
      itemType: "P",
      raw: trimmed,
    };
  }

  if (mMatch) {
    return {
      baseSerial: mMatch[1].trim(),
      itemType: "M",
      raw: trimmed,
    };
  }

  return {
    baseSerial: trimmed,
    itemType: null,
    raw: trimmed,
  };
}

/**
 * Returns the status, base serial, and display labels for a serial badge.
 */
export function getSerialStatus(
  serial: string,
  isDualSet: boolean
): SerialStatusInfo {
  const parsed = parseSerialEntry(serial);

  if (!isDualSet) {
    return {
      status: "STANDARD",
      baseSerial: parsed.baseSerial,
      badgeTooltip: "Standard unit serial number",
    };
  }

  if (parsed.itemType === "P") {
    return {
      status: "PUMP_ONLY",
      baseSerial: parsed.baseSerial,
      badgeLabel: "(P)",
      badgeTooltip: "Incomplete Set: Only Pump (P) is in stock. Motor pending.",
    };
  }

  if (parsed.itemType === "M") {
    return {
      status: "MOTOR_ONLY",
      baseSerial: parsed.baseSerial,
      badgeLabel: "(M)",
      badgeTooltip: "Incomplete Set: Only Motor (M) is in stock. Pump pending.",
    };
  }

  // Pure serial in a Dual Set model means BOTH Motor and Pump are available!
  return {
    status: "COMPLETE_SET",
    baseSerial: parsed.baseSerial,
    badgeLabel: "Complete",
    badgeTooltip: "Complete Set: Both Motor and Pump are available in stock.",
  };
}

/**
 * Reconciles existing model serials with incoming scanned or entered serials.
 * If both P and M are present for a serial:
 * -> stored as pure base serial "25330976"
 * If only one is present:
 * -> stored with suffix "(P)" or "(M)"
 * If model is NOT a dual set:
 * -> stored as pure base serial without any color tags
 */
export function reconcileSerials(
  existingSerials: string[],
  incomingItems: Array<{ serial: string; itemType?: string | null }>,
  isDualSet: boolean
): { updatedSerials: string[]; newlyCompletedCount: number; addedCount: number } {
  // Map of baseSerial -> { hasP: boolean, hasM: boolean, wasCompleteBefore: boolean }
  const state = new Map<
    string,
    { hasP: boolean; hasM: boolean; wasCompleteBefore: boolean }
  >();

  // 1. Populate existing entries
  for (const s of existingSerials) {
    const { baseSerial, itemType } = parseSerialEntry(s);
    if (!baseSerial) continue;

    if (!isDualSet) {
      state.set(baseSerial, { hasP: true, hasM: true, wasCompleteBefore: true });
    } else if (itemType === "P") {
      state.set(baseSerial, { hasP: true, hasM: false, wasCompleteBefore: false });
    } else if (itemType === "M") {
      state.set(baseSerial, { hasP: false, hasM: true, wasCompleteBefore: false });
    } else {
      // Plain serial in a dual set was already complete
      state.set(baseSerial, { hasP: true, hasM: true, wasCompleteBefore: true });
    }
  }

  const existingCount = state.size;
  let newlyCompletedCount = 0;

  // 2. Merge incoming items
  for (const item of incomingItems) {
    const base = item.serial.trim();
    if (!base) continue;

    const parsed = parseSerialEntry(base);
    const actualBase = parsed.baseSerial;
    // Prefer explicitly provided itemType, otherwise check parsed suffix
    const type = (item.itemType || parsed.itemType || "").toUpperCase();

    if (!isDualSet || !type) {
      // Single unit model: always plain serial
      state.set(actualBase, {
        hasP: true,
        hasM: true,
        wasCompleteBefore: true,
      });
      continue;
    }

    const current = state.get(actualBase) || {
      hasP: false,
      hasM: false,
      wasCompleteBefore: false,
    };

    const hadBothBefore = current.hasP && current.hasM;

    if (type === "P") current.hasP = true;
    if (type === "M") current.hasM = true;

    if (!hadBothBefore && current.hasP && current.hasM) {
      newlyCompletedCount++;
    }

    state.set(actualBase, current);
  }

  // 3. Render final serial string array
  const updatedSerials: string[] = [];

  for (const [base, { hasP, hasM }] of state.entries()) {
    if (!isDualSet) {
      updatedSerials.push(base);
    } else if (hasP && hasM) {
      // Both available -> pure serial!
      updatedSerials.push(base);
    } else if (hasP) {
      updatedSerials.push(`${base} (P)`);
    } else if (hasM) {
      updatedSerials.push(`${base} (M)`);
    } else {
      updatedSerials.push(base);
    }
  }

  const addedCount = state.size - existingCount;

  return {
    updatedSerials,
    newlyCompletedCount,
    addedCount,
  };
}

/**
 * Load saved Dual Set configuration map from localStorage.
 */
export function getSavedDualSetMap(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(DUAL_SET_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

/**
 * Save Dual Set configuration for a model.
 */
export function saveModelDualSet(
  modelIdentifier: string,
  isDualSet: boolean
): void {
  if (typeof window === "undefined") return;
  try {
    const map = getSavedDualSetMap();
    map[modelIdentifier] = isDualSet;
    // Also save normalized key
    const normKey = modelIdentifier.replace(/\s*\+\s*/g, "+").toLowerCase();
    map[normKey] = isDualSet;
    localStorage.setItem(DUAL_SET_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Non-fatal
  }
}

/**
 * Determines whether a model is a Dual Set (tracks P and M).
 * Rules:
 * 1. Explicit saved preference in localStorage (by model ID or model name).
 * 2. If any serial contains "(P)" or "(M)", defaults to true.
 * 3. Default fallback: true (motors in this business typically have pump+motor pairs).
 */
export function isModelDualSet(
  modelId: string,
  modelName: string,
  existingSerials: string[] = []
): boolean {
  const map = getSavedDualSetMap();

  if (modelId in map) return map[modelId];

  const normName = (modelName || "")
    .replace(/\s*\+\s*/g, "+")
    .toLowerCase()
    .trim();
  if (normName in map) return map[normName];

  // If serials contain (P) or (M), it's definitely a dual set
  const hasPmSerials = existingSerials.some((s) => /\([PpMm]\)/.test(s));
  if (hasPmSerials) return true;

  return true; // Default
}
