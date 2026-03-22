// Unit tests for CppGenerator
import { CppGenerator } from '../CppGenerator';
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
  TryStatement,
  CatchClause,
  Parameter,
  Comment,
} from '../../ast';

describe('CppGenerator', () => {
  let generator: CppGenerator;
  let defaultOptions: GeneratorOptions;

  beforeEach(() => {
    generator = new CppGenerator();
    defaultOptions = {
      indentStyle: 'spaces',
      indentWidth: 2,
      lineEnding: 'lf',
      preserveComments: true,
    };
  });

  describe('generate', () => {
    it('should generate both header and source files', () => {
      const program: ProgramNode = {
        type: 'Program',
        body: [
          {
            type: 'ClassDeclaration',
            name: 'Calculator',
            members: [],
            modifiers: [],
          } as ClassDeclaration,
        ],
        imports: [],
      };

      const result = generator.generate(program, defaultOptions);
      
      expect(result.code).toContain('// Header (.h)');
      expect(result.code).toContain('// Source (.cpp)');
      expect(result.code).toContain('#ifndef _GENERATED_H_');
      expect(result.code).toContain('#define _GENERATED_H_');
      expect(result.code).toContain('#endif');
    });

    it('should include necessary C++ headers', () => {
      const program: ProgramNode = {
        type: 'Program',
        body: [
          {
            type: 'ClassDeclaration',
            name: 'Test',
            members: [],
            modifiers: [],
          } as ClassDeclaration,
        ],
        imports: [],
      };

      const result = generator.generate(program, defaultOptions);
      
      expect(result.code).toContain('#include <string>');
      expect(result.code).toContain('#include <vector>');
      expect(result.code).toContain('#include <map>');
    });
  });

  describe('generateClass', () => {
    it('should generate a simple C++ class header', () => {
      const classNode: ClassDeclaration = {
        type: 'ClassDeclaration',
        name: 'Calculator',
        members: [],
        modifiers: [],
      };

      const result = generator.generate(classNode, defaultOptions);
      
      expect(result.code).toContain('class Calculator');
      expect(result.code).toContain('public:');
      expect(result.code).toContain('Calculator();');
      expect(result.code).toContain('};');
    });

    it('should generate a class with inheritance', () => {
      const classNode: ClassDeclaration = {
        type: 'ClassDeclaration',
        name: 'AdvancedCalculator',
        superClass: 'Calculator',
        members: [],
        modifiers: [],
      };

      const result = generator.generate(classNode, defaultOptions);
      
      expect(result.code).toContain('class AdvancedCalculator : public Calculator');
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
      
      expect(result.code).toContain('int add(int a, int b);');
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
      
      expect(result.code).toContain('static void staticMethod();');
    });

    it('should generate a class with private fields', () => {
      const fieldNode: VariableDeclaration = {
        type: 'VariableDeclaration',
        name: 'value',
        typeAnnotation: { name: 'int', primitive: true, nullable: false },
        modifiers: ['private'],
      };

      const classNode: ClassDeclaration = {
        type: 'ClassDeclaration',
        name: 'Counter',
        members: [fieldNode],
        modifiers: [],
      };

      const result = generator.generate(classNode, defaultOptions);
      
      expect(result.code).toContain('private:');
      expect(result.code).toContain('int value;');
    });
  });

  describe('generateMethod', () => {
    it('should generate a method header with parameters', () => {
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
          body: [],
        } as BlockStatement,
        modifiers: [],
      };

      const result = generator.generateMethod(methodNode);
      
      expect(result).toContain('int multiply(int x, int y);');
    });

    it('should generate a method with String return type', () => {
      const methodNode: MethodDeclaration = {
        type: 'MethodDeclaration',
        name: 'getName',
        parameters: [],
        returnType: { name: 'String', primitive: false, nullable: false },
        body: {
          type: 'BlockStatement',
          body: [],
        } as BlockStatement,
        modifiers: [],
      };

      const result = generator.generateMethod(methodNode);
      
      expect(result).toContain('std::string getName();');
    });
  });

  describe('type mapping', () => {
    it('should map Java primitive types to C++ types', () => {
      const methodNode: MethodDeclaration = {
        type: 'MethodDeclaration',
        name: 'test',
        parameters: [
          {
            type: 'Parameter',
            name: 'flag',
            typeAnnotation: { name: 'boolean', primitive: true, nullable: false },
          },
        ],
        returnType: { name: 'void', primitive: true, nullable: false },
        body: {
          type: 'BlockStatement',
          body: [],
        } as BlockStatement,
        modifiers: [],
      };

      const result = generator.generateMethod(methodNode);
      
      expect(result).toContain('void test(bool flag);');
    });

    it('should map Java String to std::string', () => {
      const methodNode: MethodDeclaration = {
        type: 'MethodDeclaration',
        name: 'process',
        parameters: [
          {
            type: 'Parameter',
            name: 'text',
            typeAnnotation: { name: 'String', primitive: false, nullable: false },
          },
        ],
        returnType: { name: 'String', primitive: false, nullable: false },
        body: {
          type: 'BlockStatement',
          body: [],
        } as BlockStatement,
        modifiers: [],
      };

      const result = generator.generateMethod(methodNode);
      
      expect(result).toContain('std::string process(std::string text);');
    });

    it('should map Java List to std::vector', () => {
      const methodNode: MethodDeclaration = {
        type: 'MethodDeclaration',
        name: 'getItems',
        parameters: [],
        returnType: {
          name: 'List',
          primitive: false,
          nullable: false,
          generic: [{ name: 'int', primitive: true, nullable: false }],
        },
        body: {
          type: 'BlockStatement',
          body: [],
        } as BlockStatement,
        modifiers: [],
      };

      const result = generator.generateMethod(methodNode);
      
      expect(result).toContain('std::vector<int> getItems();');
    });

    it('should map Java Map to std::map', () => {
      const methodNode: MethodDeclaration = {
        type: 'MethodDeclaration',
        name: 'getMap',
        parameters: [],
        returnType: {
          name: 'Map',
          primitive: false,
          nullable: false,
          generic: [
            { name: 'String', primitive: false, nullable: false },
            { name: 'int', primitive: true, nullable: false },
          ],
        },
        body: {
          type: 'BlockStatement',
          body: [],
        } as BlockStatement,
        modifiers: [],
      };

      const result = generator.generateMethod(methodNode);
      
      expect(result).toContain('std::map<std::string, int> getMap();');
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
      
      expect(result.code).toContain('for (int i = 0; i < 10; i++)');
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

    it('should generate a try-catch statement', () => {
      const tryNode: TryStatement = {
        type: 'TryStatement',
        block: {
          type: 'BlockStatement',
          body: [],
        } as BlockStatement,
        handler: {
          type: 'CatchClause',
          param: {
            type: 'Parameter',
            name: 'e',
            typeAnnotation: { name: 'Exception', primitive: false, nullable: false },
          } as Parameter,
          body: {
            type: 'BlockStatement',
            body: [],
          } as BlockStatement,
        } as CatchClause,
      };

      const result = generator.generate(tryNode, defaultOptions);
      
      expect(result.code).toContain('try');
      expect(result.code).toContain('catch (Exception e)');
    });

    it('should handle finally blocks with a comment', () => {
      const tryNode: TryStatement = {
        type: 'TryStatement',
        block: {
          type: 'BlockStatement',
          body: [],
        } as BlockStatement,
        finalizer: {
          type: 'BlockStatement',
          body: [],
        } as BlockStatement,
      };

      const result = generator.generate(tryNode, defaultOptions);
      
      expect(result.code).toContain('// TODO: Emulate finally block behavior');
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

    it('should map === to ==', () => {
      const expr: BinaryExpression = {
        type: 'BinaryExpression',
        operator: '===',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      };

      const result = generator.generateExpression(expr);
      
      expect(result).toBe('a == b');
    });

    it('should map !== to !=', () => {
      const expr: BinaryExpression = {
        type: 'BinaryExpression',
        operator: '!==',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      };

      const result = generator.generateExpression(expr);
      
      expect(result).toBe('a != b');
    });

    it('should generate null as nullptr', () => {
      const nullLiteral: Literal = {
        type: 'Literal',
        value: null,
        raw: 'null',
      };

      const result = generator.generateExpression(nullLiteral);
      
      expect(result).toBe('nullptr');
    });

    it('should generate string literals with double quotes', () => {
      const stringLiteral: Literal = {
        type: 'Literal',
        value: 'hello',
        raw: '"hello"',
      };

      const result = generator.generateExpression(stringLiteral);
      
      expect(result).toBe('"hello"');
    });

    it('should generate boolean literals', () => {
      const trueLiteral: Literal = {
        type: 'Literal',
        value: true,
        raw: 'true',
      };

      const falseLiteral: Literal = {
        type: 'Literal',
        value: false,
        raw: 'false',
      };

      expect(generator.generateExpression(trueLiteral)).toBe('true');
      expect(generator.generateExpression(falseLiteral)).toBe('false');
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
      expect(result.code).toMatch(/\n {4}void test\(\);/);
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
      expect(result.code).toMatch(/\n\tvoid test\(\);/);
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
      expect(result.code).toContain('public:');
      expect(result.code).toContain('Empty();');
    });

    it('should handle object expressions with a comment', () => {
      const objExpr = {
        type: 'ObjectExpression',
        properties: [],
      };

      const result = generator.generateExpression(objExpr as any);
      
      expect(result).toContain('Object literal not supported in C++');
    });
  });
});
