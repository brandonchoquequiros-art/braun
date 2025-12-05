
export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  SCANNER = 'SCANNER',
  STUDY_BUDDY = 'STUDY_BUDDY',
  CREATIVE_LAB = 'CREATIVE_LAB',
  RESOURCES = 'RESOURCES',
  STORE = 'STORE',
  AR_LAB = 'AR_LAB'
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  SHORT_ANSWER = 'SHORT_ANSWER'
}

export interface QuizQuestion {
  type: QuestionType;
  question: string;
  options?: string[]; // Only for multiple choice
  correctAnswer?: number; // Index for MC
  answerKey?: string; // Ideal answer for short answer
  explanation: string;
}

export interface ScanResult {
  id: string;
  title: string;
  summary: string;
  quiz: QuizQuestion[];
  date: Date;
}

export enum ChatMode {
  TEXT = 'TEXT',
  VOICE = 'VOICE'
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export enum AspectRatio {
  SQUARE = '1:1',
  LANDSCAPE = '16:9',
  PORTRAIT = '9:16',
  STANDARD = '4:3'
}

export enum ImageResolution {
  RES_1K = '1K',
  RES_2K = '2K',
  RES_4K = '4K'
}

// Store Types
export type StoreCategory = 'MAPAS' | 'INFORMES' | 'PLANIFICADORES' | 'MENTALES' | 'ORGANIGRAMAS' | 'TIEMPO' | 'IA_GENERATOR';

export interface StoreItem {
  id: string;
  title: string;
  category: StoreCategory;
  description: string;
  price: number; // Virtual currency or free (Bs.)
  previewUrl: string; // Image URL
  features: string[];
  isGenerator?: boolean; // If true, this item triggers an AI generation flow
  arModelUrl?: string; // URL to the .glb/.gltf file for AR
}