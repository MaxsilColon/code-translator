import { CppValidator } from '../CppValidator';

describe('CppValidator', () => {
  let validator: CppValidator;

  beforeEach(() => {
    validator = new CppValidator();
  });

  describe('valid C++ code', () => {
    it('should validate simple variable declaration', () => {
      const code = 'int x = 5;';
      const result = validator.validate(code);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate class declaration', () => {
      const code = `
        class Calculator {
        public:
          int add(int a, int b) {
            return a + b;
          }
        };
      `;
      const result = validator.validate(code);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate function declaration', () => {
      const code = `
        int add(int a, int b) {
          return a + b;
        }
      `;
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

    it('should validate namespace declaration', () => {
      const code = `
        namespace MyNamespace {
          int x = 5;
        }
      `;
      const result = validator.validate(code);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate preprocessor directives', () => {
      const code = `
        #include <iostream>
        #define MAX 100
        
        int main() {
          return 0;
        }
      `;
      const result = validator.validate(code);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('invalid C++ code', () => {
    it('should detect missing semicolon', () => {
      const code = `
        int x = 5
        int y = 10;
      `;
      const result = validator.validate(code);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toContain('semicolon');
    });

    it('should detect unmatched braces', () => {
      const code = `
        class Calculator {
          int add(int a, int b) {
            return a + b;
          }
      `;
      const result = validator.validate(code);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toContain('brace');
    });

    it('should detect unmatched parentheses', () => {
      const code = `
        int add(int a, int b {
          return a + b;
        }
      `;
      const result = validator.validate(code);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toContain('parenthes');
    });

    it('should provide error location for missing semicolon', () => {
      const code = 'int x = 5';
      const result = validator.validate(code);

      expect(result.valid).toBe(false);
      expect(result.errors[0].line).toBe(1);
      expect(result.errors[0].column).toBeGreaterThan(0);
    });
  });

  describe('edge cases', () => {
    it('should handle code with comments', () => {
      const code = `
        // This is a comment
        int x = 5;
        /* Multi-line
           comment */
        int y = 10;
      `;
      const result = validator.validate(code);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle struct declaration', () => {
      const code = `
        struct Point {
          int x;
          int y;
        };
      `;
      const result = validator.validate(code);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle enum declaration', () => {
      const code = `
        enum Color {
          RED,
          GREEN,
          BLUE
        };
      `;
      const result = validator.validate(code);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle access modifiers', () => {
      const code = `
        class MyClass {
        public:
          int x;
        private:
          int y;
        protected:
          int z;
        };
      `;
      const result = validator.validate(code);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle return statements', () => {
      const code = `
        int getValue() {
          return 42;
        }
      `;
      const result = validator.validate(code);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('complex scenarios', () => {
    it('should validate complete class with multiple methods', () => {
      const code = `
        #include <string>
        
        class Calculator {
        private:
          int result;
          
        public:
          Calculator() {
            result = 0;
          }
          
          int add(int a, int b) {
            return a + b;
          }
          
          int subtract(int a, int b) {
            return a - b;
          }
        };
      `;
      const result = validator.validate(code);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle nested braces', () => {
      const code = `
        void test() {
          if (true) {
            for (int i = 0; i < 10; i++) {
              int x = i;
            }
          }
        }
      `;
      const result = validator.validate(code);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});
