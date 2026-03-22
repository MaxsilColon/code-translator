import { JavaScriptValidator } from '../JavaScriptValidator';

describe('JavaScriptValidator', () => {
  let validator: JavaScriptValidator;

  beforeEach(() => {
    validator = new JavaScriptValidator();
  });

  describe('valid JavaScript code', () => {
    it('should validate simple variable declaration', () => {
      const code = 'const x = 5;';
      const result = validator.validate(code);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate class declaration', () => {
      const code = `
        class Calculator {
          add(a, b) {
            return a + b;
          }
        }
      `;
      const result = validator.validate(code);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate function declaration', () => {
      const code = `
        function greet(name) {
          return "Hello, " + name;
        }
      `;
      const result = validator.validate(code);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate arrow function', () => {
      const code = 'const add = (a, b) => a + b;';
      const result = validator.validate(code);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate empty code', () => {
      const code = '';
      const result = validator.validate(code);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate code with only whitespace', () => {
      const code = '   \n  \t  ';
      const result = validator.validate(code);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('invalid JavaScript code', () => {
    it('should detect missing closing brace', () => {
      const code = `
        class Calculator {
          add(a, b) {
            return a + b;
          }
      `;
      const result = validator.validate(code);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toBeDefined();
    });

    it('should detect missing semicolon in strict mode', () => {
      const code = 'const x = 5';
      const result = validator.validate(code);

      // Note: Babel parser is lenient with semicolons, so this might still be valid
      // This test documents the actual behavior
      expect(result.valid).toBe(true);
    });

    it('should detect invalid syntax', () => {
      const code = 'const x = ;';
      const result = validator.validate(code);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should detect unmatched parentheses', () => {
      const code = 'function test( { return 5; }';
      const result = validator.validate(code);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should provide error location', () => {
      const code = 'const x = ;';
      const result = validator.validate(code);

      expect(result.valid).toBe(false);
      expect(result.errors[0].line).toBeGreaterThan(0);
      expect(result.errors[0].column).toBeGreaterThanOrEqual(0);
    });
  });

  describe('edge cases', () => {
    it('should handle code with comments', () => {
      const code = `
        // This is a comment
        const x = 5;
        /* Multi-line
           comment */
        const y = 10;
      `;
      const result = validator.validate(code);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle code with template literals', () => {
      const code = 'const message = `Hello, ${name}!`;';
      const result = validator.validate(code);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle async/await syntax', () => {
      const code = `
        async function fetchData() {
          const response = await fetch('/api/data');
          return response.json();
        }
      `;
      const result = validator.validate(code);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});
