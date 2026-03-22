// JavaScript Validator implementation
import { CodeValidator } from './CodeValidator';
import { ValidationResult, ValidationError } from './types';
import { parse } from '@babel/parser';

export class JavaScriptValidator extends CodeValidator {
  validate(code: string): ValidationResult {
    const errors: ValidationError[] = [];

    // Handle empty code
    if (!code || code.trim() === '') {
      return { valid: true, errors: [] };
    }

    try {
      // Parse JavaScript code using Babel parser
      parse(code, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript'],
        errorRecovery: true,
      });

      return { valid: true, errors: [] };
    } catch (error: any) {
      // Extract error information
      const message = error.message || 'Unknown syntax error';
      const line = error.loc?.line || 0;
      const column = error.loc?.column || 0;

      errors.push({
        message,
        line,
        column,
      });

      return { valid: false, errors };
    }
  }
}
