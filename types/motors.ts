export interface MotorAPI {
  id: string;
  hp: string;
  model?: string | null;
  serials: string[];
  created_at?: string | null;
  updated_at?: string | null;
}

export interface MotorFormData {
  hp: string;
  model?: string | null;
  serials?: string[];
}

export interface MotorSerialsAddBatch {
  serials: string[];
}

export interface MotorHpRenameData {
  new_hp: string;
}

// UI representation grouped per HP
export interface MotorModelView {
  id: string;
  name: string;
  serials: string[];
  createdAt?: string;
}

export interface HpCategoryView {
  id: string; // hp value or synthetic id
  hp: string;
  models: MotorModelView[];
}

export type HpCategory = HpCategoryView;
export type MotorModel = MotorModelView;
