import { HpCategory } from "@/types/motors";

export const STORAGE_KEY = "sske_manage_motors_data_v1";

export const DEFAULT_MOTOR_DATA: HpCategory[] = [
  {
    id: "hp-0.5",
    hp: "0.5 HP",
    models: [
      {
        id: "mod-05-1",
        name: "Mini Champ I",
        serials: ["MC-05-8910", "MC-05-8911", "MC-05-8912"],
      },
      {
        id: "mod-05-2",
        name: "Jalraaj 0.5",
        serials: ["KJ-05-4421", "KJ-05-4422"],
      },
    ],
  },
  {
    id: "hp-1.0",
    hp: "1.0 HP",
    models: [
      {
        id: "mod-10-1",
        name: "Mini Sapphire II",
        serials: ["MS-10-3301", "MS-10-3302", "MS-10-3303", "MS-10-3304"],
      },
      {
        id: "mod-10-2",
        name: "Monobloc 1.0",
        serials: ["MB-10-5512", "MB-10-5513"],
      },
      {
        id: "mod-10-3",
        name: "KDS-112++",
        serials: ["KD-10-9081"],
      },
    ],
  },
  {
    id: "hp-1.5",
    hp: "1.5 HP",
    models: [
      {
        id: "mod-15-1",
        name: "DMS02 Self-Priming",
        serials: ["DM-15-7720", "DM-15-7721"],
      },
      {
        id: "mod-15-2",
        name: "Selprime 1.5",
        serials: ["SP-15-1105"],
      },
    ],
  },
  {
    id: "hp-2.0",
    hp: "2.0 HP",
    models: [
      {
        id: "mod-20-1",
        name: "KDS-214 High Flow",
        serials: ["KD-20-4100", "KD-20-4101", "KD-20-4102"],
      },
      {
        id: "mod-20-2",
        name: "MBG-20 Monobloc",
        serials: ["MB-20-8840"],
      },
    ],
  },
  {
    id: "hp-3.0",
    hp: "3.0 HP",
    models: [
      {
        id: "mod-30-1",
        name: "Openwell Submersible 3HP",
        serials: ["OW-30-6619", "OW-30-6620"],
      },
    ],
  },
  {
    id: "hp-5.0",
    hp: "5.0 HP",
    models: [
      {
        id: "mod-50-1",
        name: "Agricultural Monobloc 5HP",
        serials: ["AG-50-2001"],
      },
    ],
  },
];

export function loadMotorData(): HpCategory[] {
  if (typeof window === "undefined") return DEFAULT_MOTOR_DATA;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_MOTOR_DATA));
      return DEFAULT_MOTOR_DATA;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (err) {
    console.error("Failed to load motors data from localStorage:", err);
  }
  return DEFAULT_MOTOR_DATA;
}

export function saveMotorData(data: HpCategory[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error("Failed to save motors data to localStorage:", err);
  }
}
