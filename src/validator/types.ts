// Validator types and interfaces
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  message: string;
  line: number;
  column: number;
}
