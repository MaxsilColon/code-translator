// Unit tests for JavaParser
import { JavaParser } from '../JavaParser';
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';

// Mock java-parser to avoid ES module issues in Jest
jest.mock('java-parser');

/**
 * Validates: Requirements 2.1, 2.2, 8.1, 8.2
 */
describe('JavaParser', () => {
  let parser: JavaParser;

  beforeEach(() => {
    parser = new JavaParser();
  });

  describe('parse()', () => {
    it('should parse a simple Java class', () => {
      const javaCode = `
        public class Calculator {
          public int add(int a, int b) {
            return a + b;
          }
        }
      `;

      const result = parser.parse(javaCode, 'Calculator.java');

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.ast).toBeDefined();
      expect(result.ast.type).toBe('Program');
    });

    it('should parse an empty file', () => {
      const javaCode = '';

      const result = parser.parse(javaCode, 'Empty.java');

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.ast.type).toBe('Program');
    });

    it('should handle syntax errors with location information', () => {
      // Missing semicolon
      const javaCode = `
        public class Test {
          public void method() {
            int x = 5
          }
        }
      `;

      const result = parser.parse(javaCode, 'Test.java');

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      
      const error = result.errors[0];
      expect(error.message).toBeDefined();
      expect(error.line).toBeGreaterThan(0);
      expect(error.column).toBeGreaterThanOrEqual(0);
      expect(error.file).toBe('Test.java');
    });

    it('should parse a class with multiple methods', () => {
      const javaCode = `
        public class Math {
          public int add(int a, int b) {
            return a + b;
          }
          
          public int subtract(int a, int b) {
            return a - b;
          }
        }
      `;

      const result = parser.parse(javaCode, 'Math.java');

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should parse a class with comments', () => {
      const javaCode = `
        // This is a calculator class
        public class Calculator {
          /* 
           * Adds two numbers
           */
          public int add(int a, int b) {
            return a + b; // Return the sum
          }
        }
      `;

      const result = parser.parse(javaCode, 'Calculator.java');

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle completely invalid Java code', () => {
      const javaCode = 'this is not valid java code at all!!!';

      const result = parser.parse(javaCode, 'Invalid.java');

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].file).toBe('Invalid.java');
    });
  });

  describe('parseFile()', () => {
    const testFilePath = join(__dirname, 'test-temp.java');

    afterEach(() => {
      try {
        unlinkSync(testFilePath);
      } catch (e) {
        // File might not exist
      }
    });

    it('should parse a valid Java file', () => {
      const javaCode = `
        public class FileTest {
          public void test() {
            System.out.println("Hello");
          }
        }
      `;
      
      writeFileSync(testFilePath, javaCode, 'utf-8');

      const result = parser.parseFile(testFilePath);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.ast.type).toBe('Program');
    });

    it('should handle file not found error', () => {
      const nonExistentPath = join(__dirname, 'does-not-exist.java');

      const result = parser.parseFile(nonExistentPath);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toContain('Failed to read file');
      expect(result.errors[0].file).toBe(nonExistentPath);
    });

    it('should handle file with syntax errors', () => {
      const javaCode = `
        public class BadSyntax {
          public void method() {
            // Missing closing brace
        }
      `;
      
      writeFileSync(testFilePath, javaCode, 'utf-8');

      const result = parser.parseFile(testFilePath);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
