// Base CodeValidator class
import { ValidationResult } from './types';

export abstract class CodeValidator {
  abstract validate(code: string): ValidationResult;
}
