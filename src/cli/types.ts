// CLI types and interfaces
export interface CLIOptions {
  input: string;
  output?: string;
  sourceLang: 'java';
  targetLang: 'javascript' | 'cpp';
  config?: string;
  validate?: boolean;
  verbose?: boolean;
}

export interface TranslationResult {
  success: boolean;
  output?: string;
  errors: TranslationError[];
  warnings: string[];
}

export interface TranslationError {
  category: ErrorCategory;
  message: string;
  location?: ErrorLocation;
  suggestion?: string;
  exitCode: number;
}

export interface ErrorLocation {
  file: string;
  line: number;
  column: number;
  snippet?: string;
}

export enum ErrorCategory {
  SYNTAX_ERROR = 'SYNTAX_ERROR',
  FILE_ERROR = 'FILE_ERROR',
  CONFIG_ERROR = 'CONFIG_ERROR',
  TRANSLATION_ERROR = 'TRANSLATION_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR'
}

export const ERROR_EXIT_CODES = {
  SUCCESS: 0,
  SYNTAX_ERROR: 1,
  FILE_ERROR: 2,
  CONFIG_ERROR: 3,
  TRANSLATION_ERROR: 4,
  VALIDATION_ERROR: 5,
  UNKNOWN_ERROR: 99
} as const;

