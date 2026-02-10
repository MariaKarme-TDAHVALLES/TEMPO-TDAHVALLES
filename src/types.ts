
export enum ProfileType {
  CHILD = 'child',
  TEEN = 'teen',
  ADULT = 'adult'
}

export enum AlarmType {
  SIREN = 'SIREN',
  SEISMIC = 'SEISMIC',
  NEON_PULSE = 'NEON_PULSE'
}

export enum MusicType {
  NONE = 'NONE',
  RELAXING = 'RELAXING',
  ALPHA_WAVES = 'ALPHA_WAVES',
  WHITE_NOISE = 'WHITE_NOISE',
  EIGHTIES = 'EIGHTIES',
  CLASSICAL = 'CLASSICAL'
}

export enum VoiceChoice {
  MALE = 'MALE',
  FEMALE = 'FEMALE'
}

export enum Language {
  CATALAN = 'ca',
  SPANISH = 'es',
  ENGLISH = 'en',
  GERMAN = 'de',
  FRENCH = 'fr',
  ARANESE = 'oc',
  ITALIAN = 'it',
  BASQUE = 'eu',
  GALICIAN = 'gl'
}

export interface TaskStep {
  id: string;
  text: string;
  completed: boolean;
  icon?: string;
}

export interface Task {
  id: string;
  title: string;
  durationMinutes: number;
  aiEstimatedMinutes?: number; // What the AI thought it would take
  aiFeedback?: string; // The reality check message
  completed: boolean;
  steps: TaskStep[];
  completedAt?: Date;
  onTime?: boolean;
}

export interface CalendarTask {
  id: string;
  day: number; // 0-6
  time: string;
  title: string;
  duration?: number;
}

export interface Accessory {
  id: string;
  name: string;
  icon: string;
  cost: number;
  category: 'wearable' | 'house' | 'avatar';
}

export interface LeisureActivity {
  id: string;
  text: string;
  icon: string;
  type: 'indoor' | 'outdoor' | 'injury';
}

export interface RewardSuggestion {
  text: string;
  icon: string;
}

export interface Recipe {
  name: string;
  time: string;
  ingredients: string[];
}
