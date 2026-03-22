// C++ Validator implementation
import { CodeValidator } from './CodeValidator';
import { ValidationResult, ValidationError } from './types';

export class CppValidator extends CodeValidator {
  validate(code: string): ValidationResult {
    const errors: ValidationError[] = [];

    // Handle empty code
    if (!code || code.trim() === '') {
      return { valid: true, errors: [] };
    }

    // Basic C++ syntax validation
    // Check for common syntax errors
    const lines = code.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const lineNumber = i + 1;

      // Skip empty lines and comments
      if (!line || line.startsWith('//') || line.startsWith('/*') || line.startsWith('*')) {
        continue;
      }

      // Check for statements that should end with semicolon
      // (excluding lines with braces, preprocessor directives, and namespace declarations)
      if (
        !line.endsWith(';') &&
        !line.endsWith('{') &&
        !line.endsWith('}') &&
        !line.startsWith('#') &&
        !line.includes('namespace') &&
        !line.startsWith('class') &&
        !line.startsWith('struct') &&
        !line.startsWith('enum') &&
        !line.includes('public:') &&
        !line.includes('private:') &&
        !line.includes('protected:') &&
        line.length > 0
      ) {
        // Check if it looks like a statement (contains assignment, function call, or return)
        if (
          line.includes('=') ||
          line.includes('return') ||
          (line.includes('(') && line.includes(')') && !line.includes('if') && !line.includes('while') && !line.includes('for'))
        ) {
          errors.push({
            message: 'Expected semicolon at end of statement',
            line: lineNumber,
            column: line.length,
          });
        }
      }
    }

    // Check for overall brace balance
    const totalOpenBraces = (code.match(/{/g) || []).length;
    const totalCloseBraces = (code.match(/}/g) || []).length;

    if (totalOpenBraces !== totalCloseBraces) {
      errors.push({
        message: `Unmatched braces: ${totalOpenBraces} opening, ${totalCloseBraces} closing`,
        line: lines.length,
        column: 0,
      });
    }

    // Check for overall parenthesis balance
    const totalOpenParens = (code.match(/\(/g) || []).length;
    const totalCloseParens = (code.match(/\)/g) || []).length;

    if (totalOpenParens !== totalCloseParens) {
      errors.push({
        message: `Unmatched parentheses: ${totalOpenParens} opening, ${totalCloseParens} closing`,
        line: lines.length,
        column: 0,
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
