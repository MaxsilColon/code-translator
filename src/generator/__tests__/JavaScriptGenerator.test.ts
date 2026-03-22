// Unit tests for JavaScriptGenerator
import { JavaScriptGenerator } from '../JavaScriptGenerator';
import { GeneratorOptions } from '../types';
import {
  ProgramNode,
  ClassDeclaration,
  MethodDeclaration,
  VariableDeclaration,
  BlockStatement,
  ReturnStatement,
  Literal,
  BinaryExpression,
  IfStatement,
  ForStatement,
  WhileStatement,
  CallExpression,
  Comment,
} from '../../ast';

describe('JavaScriptGenerator', () => {
  let generator: JavaScriptGenerator;
  let defaultOptions: GeneratorOptions;

  beforeEach(() => {
    generator = new JavaScriptGenerator();
    defaultOptions = {
      indentStyle: 'spaces',
      indentWidth: 2,
      lineEnding: 'lf',
      preserveComments: true,
    };
  });

  describe('generateClass', () => {
    it('should generate a simple JavaScript class', () => {
      const classNode: ClassDeclaration = {
        type: 'ClassDeclaration',
        name: 'Calculator',
        members: [],
        modifiers: [],
      };

      const result = generator.generate(classNode, defaultOptions);
      
      expect(result.code).toContain('class Calculator');
      expect(result.code).toContain('{');
      expect(result.code).toContain('}');
    });

    it('should generate a class with a superclass', () => {
      const classNode: ClassDeclaration = {
        type: 'ClassDeclaration',
        name: 'AdvancedCalculator',
        superClass: 'Calculator',
        members: [],
        modifiers: [],
      };

      const result = generator.generate(classNode, defaultOptions);
      
      expect(result.code).toContain('class AdvancedCalculator extends Calculator');
    });

    it('should generate a class with methods', () => {
      const methodNode: MethodDeclaration = {
        type: 'MethodDeclaration',
        name: 'add',
        parameters: [
          {
            type: 'Parameter',
            name: 'a',
            typeAnnotation: { name: 'int', primitive: true, nullable: false },
          },
          {
            type: 'Parameter',
            name: 'b',
            typeAnnotation: { name: 'int', primitive: true, nullable: false },
          },
        ],
        returnType: { name: 'int', primitive: true, nullable: false },
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ReturnStatement',
              argument: {
                type: 'BinaryExpression',
                operator: '+',
                left: { type: 'Identifier', name: 'a' },
                right: { type: 'Identifier', name: 'b' },
              } as BinaryExpression,
            } as ReturnStatement,
          ],
        } as BlockStatement,
        modifiers: [],
      };

      const classNode: ClassDeclaration = {
        type: 'ClassDeclaration',
        name: 'Calculator',
        members: [methodNode],
        modifiers: [],
      };

      const result = generator.generate(classNode, defaultOptions);
      
      expect(result.code).toContain('class Calculator');
      expect(result.code).toContain('add(a, b)');
      expect(result.code).toContain('return a + b');
    });

    it('should generate a class with static methods', () => {
      const methodNode: MethodDeclaration = {
        type: 'MethodDeclaration',
        name: 'staticMethod',
        parameters: [],
        returnType: { name: 'void', primitive: true, nullable: false },
        body: {
          type: 'BlockStatement',
          body: [],
        } as BlockStatement,
        modifiers: ['static'],
      };

      const classNode: ClassDeclaration = {
        type: 'ClassDeclaration',
        name: 'Utils',
        members: [methodNode],
        modifiers: [],
      };

      const result = generator.generate(classNode, defaultOptions);
      
      expect(result.code).toContain('static staticMethod()');
    });
  });

  describe('generateMethod', () => {
    it('should generate a method with parameters', () => {
      const methodNode: MethodDeclaration = {
        type: 'MethodDeclaration',
        name: 'multiply',
        parameters: [
          {
            type: 'Parameter',
            name: 'x',
            typeAnnotation: { name: 'int', primitive: true, nullable: false },
          },
          {
            type: 'Parameter',
            name: 'y',
            typeAnnotation: { name: 'int', primitive: true, nullable: false },
          },
        ],
        returnType: { name: 'int', primitive: true, nullable: false },
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ReturnStatement',
              argument: {
                type: 'BinaryExpression',
                operator: '*',
                left: { type: 'Identifier', name: 'x' },
                right: { type: 'Identifier', name: 'y' },
              } as BinaryExpression,
            } as ReturnStatement,
          ],
        } as BlockStatement,
        modifiers: [],
      };

      const result = generator.generate(methodNode, defaultOptions);
      
      expect(result.code).toContain('multiply(x, y)');
      expect(result.code).toContain('return x * y');
    });

    it('should generate a method without parameters', () => {
      const methodNode: MethodDeclaration = {
        type: 'MethodDeclaration',
        name: 'getValue',
        parameters: [],
        returnType: { name: 'int', primitive: true, nullable: false },
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ReturnStatement',
              argument: {
                type: 'Literal',
                value: 42,
                raw: '42',
              } as Literal,
            } as ReturnStatement,
          ],
        } as BlockStatement,
        modifiers: [],
      };

      const result = generator.generate(methodNode, defaultOptions);
      
      expect(result.code).toContain('getValue()');
      expect(result.code).toContain('return 42');
    });
  });

  describe('generateStatement', () => {
    it('should generate an if statement', () => {
      const ifNode: IfStatement = {
        type: 'IfStatement',
        test: {
          type: 'BinaryExpression',
          operator: '>',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Literal', value: 0, raw: '0' },
        } as BinaryExpression,
        consequent: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ReturnStatement',
              argument: { type: 'Literal', value: true, raw: 'true' },
            } as ReturnStatement,
          ],
        } as BlockStatement,
      };

      const result = generator.generate(ifNode, defaultOptions);
      
      expect(result.code).toContain('if (x > 0)');
      expect(result.code).toContain('return true');
    });

    it('should generate an if-else statement', () => {
      const ifNode: IfStatement = {
        type: 'IfStatement',
        test: {
          type: 'BinaryExpression',
          operator: '>',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Literal', value: 0, raw: '0' },
        } as BinaryExpression,
        consequent: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ReturnStatement',
              argument: { type: 'Literal', value: 1, raw: '1' },
            } as ReturnStatement,
          ],
        } as BlockStatement,
        alternate: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ReturnStatement',
              argument: { type: 'Literal', value: -1, raw: '-1' },
            } as ReturnStatement,
          ],
        } as BlockStatement,
      };

      const result = generator.generate(ifNode, defaultOptions);
      
      expect(result.code).toContain('if (x > 0)');
      expect(result.code).toContain('else');
      expect(result.code).toContain('return 1');
      expect(result.code).toContain('return -1');
    });

    it('should generate a for loop', () => {
      const forNode: ForStatement = {
        type: 'ForStatement',
        init: {
          type: 'VariableDeclaration',
          name: 'i',
          typeAnnotation: { name: 'int', primitive: true, nullable: false },
          initializer: { type: 'Literal', value: 0, raw: '0' },
          modifiers: [],
        } as VariableDeclaration,
        test: {
          type: 'BinaryExpression',
          operator: '<',
          left: { type: 'Identifier', name: 'i' },
          right: { type: 'Literal', value: 10, raw: '10' },
        } as BinaryExpression,
        update: {
          type: 'UpdateExpression',
          operator: '++',
          argument: { type: 'Identifier', name: 'i' },
          prefix: false,
        },
        body: {
          type: 'BlockStatement',
          body: [],
        } as BlockStatement,
      };

      const result = generator.generate(forNode, defaultOptions);
      
      expect(result.code).toContain('for (let i = 0; i < 10; i++)');
    });

    it('should generate a while loop', () => {
      const whileNode: WhileStatement = {
        type: 'WhileStatement',
        test: {
          type: 'BinaryExpression',
          operator: '>',
          left: { type: 'Identifier', name: 'count' },
          right: { type: 'Literal', value: 0, raw: '0' },
        } as BinaryExpression,
        body: {
          type: 'BlockStatement',
          body: [],
        } as BlockStatement,
      };

      const result = generator.generate(whileNode, defaultOptions);
      
      expect(result.code).toContain('while (count > 0)');
    });
  });

  describe('generateExpression', () => {
    it('should generate a binary expression', () => {
      const expr: BinaryExpression = {
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      };

      const result = generator.generateExpression(expr);
      
      expect(result).toBe('a + b');
    });

    it('should generate a call expression', () => {
      const expr: CallExpression = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'foo' },
        arguments: [
          { type: 'Literal', value: 1, raw: '1' },
          { type: 'Literal', value: 2, raw: '2' },
        ],
      };

      const result = generator.generateExpression(expr);
      
      expect(result).toBe('foo(1, 2)');
    });

    it('should generate a literal expression', () => {
      const stringLiteral: Literal = {
        type: 'Literal',
        value: 'hello',
        raw: '"hello"',
      };

      const result = generator.generateExpression(stringLiteral);
      
      expect(result).toBe("'hello'");
    });

    it('should generate null literal', () => {
      const nullLiteral: Literal = {
        type: 'Literal',
        value: null,
        raw: 'null',
      };

      const result = generator.generateExpression(nullLiteral);
      
      expect(result).toBe('null');
    });
  });

  describe('indentation', () => {
    it('should apply spaces indentation', () => {
      const classNode: ClassDeclaration = {
        type: 'ClassDeclaration',
        name: 'Test',
        members: [
          {
            type: 'MethodDeclaration',
            name: 'test',
            parameters: [],
            returnType: { name: 'void', primitive: true, nullable: false },
            body: {
              type: 'BlockStatement',
              body: [],
            } as BlockStatement,
            modifiers: [],
          } as MethodDeclaration,
        ],
        modifiers: [],
      };

      const options: GeneratorOptions = {
        indentStyle: 'spaces',
        indentWidth: 4,
        lineEnding: 'lf',
        preserveComments: false,
      };

      const result = generator.generate(classNode, options);
      
      // Check that method is indented with 4 spaces
      expect(result.code).toMatch(/\n {4}test\(\)/);
    });

    it('should apply tabs indentation', () => {
      const classNode: ClassDeclaration = {
        type: 'ClassDeclaration',
        name: 'Test',
        members: [
          {
            type: 'MethodDeclaration',
            name: 'test',
            parameters: [],
            returnType: { name: 'void', primitive: true, nullable: false },
            body: {
              type: 'BlockStatement',
              body: [],
            } as BlockStatement,
            modifiers: [],
          } as MethodDeclaration,
        ],
        modifiers: [],
      };

      const options: GeneratorOptions = {
        indentStyle: 'tabs',
        indentWidth: 1,
        lineEnding: 'lf',
        preserveComments: false,
      };

      const result = generator.generate(classNode, options);
      
      // Check that method is indented with tab
      expect(result.code).toMatch(/\n\ttest\(\)/);
    });
  });

  describe('comment preservation', () => {
    it('should preserve line comments when enabled', () => {
      const comment: Comment = {
        type: 'LineComment',
        value: 'This is a test class',
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 20 },
          file: 'test.java',
        },
      };

      const classNode: ClassDeclaration = {
        type: 'ClassDeclaration',
        name: 'Test',
        members: [],
        modifiers: [],
        comments: [comment],
      };

      const options: GeneratorOptions = {
        ...defaultOptions,
        preserveComments: true,
      };

      const result = generator.generate(classNode, options);
      
      expect(result.code).toContain('// This is a test class');
    });

    it('should preserve block comments when enabled', () => {
      const comment: Comment = {
        type: 'BlockComment',
        value: 'Multi-line comment',
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 20 },
          file: 'test.java',
        },
      };

      const classNode: ClassDeclaration = {
        type: 'ClassDeclaration',
        name: 'Test',
        members: [],
        modifiers: [],
        comments: [comment],
      };

      const options: GeneratorOptions = {
        ...defaultOptions,
        preserveComments: true,
      };

      const result = generator.generate(classNode, options);
      
      expect(result.code).toContain('/* Multi-line comment */');
    });

    it('should not preserve comments when disabled', () => {
      const comment: Comment = {
        type: 'LineComment',
        value: 'This should not appear',
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 20 },
          file: 'test.java',
        },
      };

      const classNode: ClassDeclaration = {
        type: 'ClassDeclaration',
        name: 'Test',
        members: [],
        modifiers: [],
        comments: [comment],
      };

      const options: GeneratorOptions = {
        ...defaultOptions,
        preserveComments: false,
      };

      const result = generator.generate(classNode, options);
      
      expect(result.code).not.toContain('This should not appear');
    });
  });

  describe('edge cases', () => {
    it('should handle empty class', () => {
      const classNode: ClassDeclaration = {
        type: 'ClassDeclaration',
        name: 'Empty',
        members: [],
        modifiers: [],
      };

      const result = generator.generate(classNode, defaultOptions);
      
      expect(result.code).toContain('class Empty');
      expect(result.code).toContain('{');
      expect(result.code).toContain('}');
    });

    it('should handle variable declarations with const', () => {
      const varNode: VariableDeclaration = {
        type: 'VariableDeclaration',
        name: 'PI',
        typeAnnotation: { name: 'double', primitive: true, nullable: false },
        initializer: { type: 'Literal', value: 3.14, raw: '3.14' },
        modifiers: ['final'],
      };

      const classNode: ClassDeclaration = {
        type: 'ClassDeclaration',
        name: 'Constants',
        members: [varNode],
        modifiers: [],
      };

      const result = generator.generate(classNode, defaultOptions);
      
      // Class fields don't use const/let keywords in modern JavaScript
      expect(result.code).toContain('PI = 3.14');
      expect(result.code).not.toContain('const PI');
    });

    it('should handle variable declarations with let', () => {
      const varNode: VariableDeclaration = {
        type: 'VariableDeclaration',
        name: 'counter',
        typeAnnotation: { name: 'int', primitive: true, nullable: false },
        initializer: { type: 'Literal', value: 0, raw: '0' },
        modifiers: [],
      };

      const classNode: ClassDeclaration = {
        type: 'ClassDeclaration',
        name: 'Counter',
        members: [varNode],
        modifiers: [],
      };

      const result = generator.generate(classNode, defaultOptions);
      
      // Class fields don't use const/let keywords in modern JavaScript
      expect(result.code).toContain('counter = 0');
      expect(result.code).not.toContain('let counter');
    });
  });

  describe('program generation', () => {
    it('should generate a complete program with imports', () => {
      const program: ProgramNode = {
        type: 'Program',
        body: [
          {
            type: 'ClassDeclaration',
            name: 'Main',
            members: [],
            modifiers: [],
          } as ClassDeclaration,
        ],
        imports: [
          {
            type: 'ImportDeclaration',
            source: './utils',
            specifiers: ['helper'],
            isStatic: false,
          },
        ],
      };

      const result = generator.generate(program, defaultOptions);
      
      expect(result.code).toContain("import { helper } from './utils'");
      expect(result.code).toContain('class Main');
    });
  });
});
