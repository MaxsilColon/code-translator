// Unit tests for JavaScriptTransformer
import { JavaScriptTransformer } from '../JavaScriptTransformer';
import {
  ProgramNode,
  ClassDeclaration,
  MethodDeclaration,
  VariableDeclaration,
  BlockStatement,
} from '../../ast';
import { TransformOptions } from '../types';

describe('JavaScriptTransformer', () => {
  let transformer: JavaScriptTransformer;
  let defaultOptions: TransformOptions;

  beforeEach(() => {
    transformer = new JavaScriptTransformer();
    defaultOptions = {
      targetLang: 'javascript',
      preserveComments: true,
      typeMapping: 'loose',
    };
  });

  describe('transform', () => {
    it('should transform a simple program', () => {
      const program: ProgramNode = {
        type: 'Program',
        body: [],
        imports: [],
      };

      const result = transformer.transform(program, defaultOptions);

      expect(result.ast.type).toBe('Program');
      expect(result.warnings).toEqual([]);
    });

    it('should transform a class with methods', () => {
      const method: MethodDeclaration = {
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
        body: { type: 'BlockStatement', body: [] } as BlockStatement,
        modifiers: ['public'],
      };

      const classDecl: ClassDeclaration = {
        type: 'ClassDeclaration',
        name: 'Calculator',
        members: [method],
        modifiers: ['public'],
      };

      const program: ProgramNode = {
        type: 'Program',
        body: [classDecl],
        imports: [],
      };

      const result = transformer.transform(program, defaultOptions);

      expect(result.ast.type).toBe('Program');
      const transformedClass = (result.ast as ProgramNode).body[0] as ClassDeclaration;
      expect(transformedClass.name).toBe('Calculator');
      expect(transformedClass.members).toHaveLength(1);

      const transformedMethod = transformedClass.members[0] as MethodDeclaration;
      expect(transformedMethod.name).toBe('add');
      expect(transformedMethod.returnType.name).toBe('number'); // int -> number
      expect(transformedMethod.parameters[0].typeAnnotation.name).toBe('number');
    });
  });

  describe('transformClass', () => {
    it('should filter Java-specific modifiers', () => {
      const classDecl: ClassDeclaration = {
        type: 'ClassDeclaration',
        name: 'MyClass',
        members: [],
        modifiers: ['public', 'final', 'abstract'],
      };

      const program: ProgramNode = {
        type: 'Program',
        body: [classDecl],
        imports: [],
      };

      const result = transformer.transform(program, defaultOptions);
      const transformedClass = (result.ast as ProgramNode).body[0] as ClassDeclaration;

      // Only 'public' should remain (final and abstract are not supported in JS)
      expect(transformedClass.modifiers).toEqual(['public']);
    });

    it('should warn about interface implementation', () => {
      const classDecl: ClassDeclaration = {
        type: 'ClassDeclaration',
        name: 'MyClass',
        implements: ['Serializable', 'Comparable'],
        members: [],
        modifiers: ['public'],
      };

      const program: ProgramNode = {
        type: 'Program',
        body: [classDecl],
        imports: [],
      };

      const result = transformer.transform(program, defaultOptions);

      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].message).toContain('interface');
    });
  });

  describe('transformMethod', () => {
    it('should transform method with type mapping', () => {
      const method: MethodDeclaration = {
        type: 'MethodDeclaration',
        name: 'getString',
        parameters: [],
        returnType: { name: 'String', primitive: false, nullable: false },
        body: { type: 'BlockStatement', body: [] } as BlockStatement,
        modifiers: ['public'],
      };

      const classDecl: ClassDeclaration = {
        type: 'ClassDeclaration',
        name: 'MyClass',
        members: [method],
        modifiers: ['public'],
      };

      const program: ProgramNode = {
        type: 'Program',
        body: [classDecl],
        imports: [],
      };

      const result = transformer.transform(program, defaultOptions);
      const transformedClass = (result.ast as ProgramNode).body[0] as ClassDeclaration;
      const transformedMethod = transformedClass.members[0] as MethodDeclaration;

      expect(transformedMethod.returnType.name).toBe('string'); // String -> string
    });

    it('should warn about synchronized methods', () => {
      const method: MethodDeclaration = {
        type: 'MethodDeclaration',
        name: 'syncMethod',
        parameters: [],
        returnType: { name: 'void', primitive: true, nullable: false },
        body: { type: 'BlockStatement', body: [] } as BlockStatement,
        modifiers: ['public', 'synchronized'],
      };

      const classDecl: ClassDeclaration = {
        type: 'ClassDeclaration',
        name: 'MyClass',
        members: [method],
        modifiers: ['public'],
      };

      const program: ProgramNode = {
        type: 'Program',
        body: [classDecl],
        imports: [],
      };

      const result = transformer.transform(program, defaultOptions);

      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].message).toContain('synchronized');
    });
  });

  describe('transformType', () => {
    it('should map primitive types correctly', () => {
      const types = [
        { java: 'int', js: 'number' },
        { java: 'boolean', js: 'boolean' },
        { java: 'String', js: 'string' },
        { java: 'void', js: 'void' },
      ];

      types.forEach(({ java, js }) => {
        const method: MethodDeclaration = {
          type: 'MethodDeclaration',
          name: 'test',
          parameters: [],
          returnType: { name: java, primitive: true, nullable: false },
          body: { type: 'BlockStatement', body: [] } as BlockStatement,
          modifiers: [],
        };

        const classDecl: ClassDeclaration = {
          type: 'ClassDeclaration',
          name: 'Test',
          members: [method],
          modifiers: [],
        };

        const program: ProgramNode = {
          type: 'Program',
          body: [classDecl],
          imports: [],
        };

        const result = transformer.transform(program, defaultOptions);
        const transformedClass = (result.ast as ProgramNode).body[0] as ClassDeclaration;
        const transformedMethod = transformedClass.members[0] as MethodDeclaration;

        expect(transformedMethod.returnType.name).toBe(js);
      });
    });

    it('should map collection types correctly', () => {
      const types = [
        { java: 'List', js: 'Array' },
        { java: 'ArrayList', js: 'Array' },
        { java: 'Map', js: 'Map' },
        { java: 'Set', js: 'Set' },
      ];

      types.forEach(({ java, js }) => {
        const method: MethodDeclaration = {
          type: 'MethodDeclaration',
          name: 'test',
          parameters: [],
          returnType: { name: java, primitive: false, nullable: false },
          body: { type: 'BlockStatement', body: [] } as BlockStatement,
          modifiers: [],
        };

        const classDecl: ClassDeclaration = {
          type: 'ClassDeclaration',
          name: 'Test',
          members: [method],
          modifiers: [],
        };

        const program: ProgramNode = {
          type: 'Program',
          body: [classDecl],
          imports: [],
        };

        const result = transformer.transform(program, defaultOptions);
        const transformedClass = (result.ast as ProgramNode).body[0] as ClassDeclaration;
        const transformedMethod = transformedClass.members[0] as MethodDeclaration;

        expect(transformedMethod.returnType.name).toBe(js);
      });
    });
  });

  describe('transformVariableDeclaration', () => {
    it('should transform variable with type mapping', () => {
      const variable: VariableDeclaration = {
        type: 'VariableDeclaration',
        name: 'count',
        typeAnnotation: { name: 'int', primitive: true, nullable: false },
        modifiers: ['private'],
      };

      const classDecl: ClassDeclaration = {
        type: 'ClassDeclaration',
        name: 'MyClass',
        members: [variable],
        modifiers: ['public'],
      };

      const program: ProgramNode = {
        type: 'Program',
        body: [classDecl],
        imports: [],
      };

      const result = transformer.transform(program, defaultOptions);
      const transformedClass = (result.ast as ProgramNode).body[0] as ClassDeclaration;
      const transformedVar = transformedClass.members[0] as VariableDeclaration;

      expect(transformedVar.typeAnnotation.name).toBe('number');
    });

    it('should warn about volatile variables', () => {
      const variable: VariableDeclaration = {
        type: 'VariableDeclaration',
        name: 'flag',
        typeAnnotation: { name: 'boolean', primitive: true, nullable: false },
        modifiers: ['private', 'volatile'],
      };

      const classDecl: ClassDeclaration = {
        type: 'ClassDeclaration',
        name: 'MyClass',
        members: [variable],
        modifiers: ['public'],
      };

      const program: ProgramNode = {
        type: 'Program',
        body: [classDecl],
        imports: [],
      };

      const result = transformer.transform(program, defaultOptions);

      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].message).toContain('volatile');
    });

    it('should warn about transient variables', () => {
      const variable: VariableDeclaration = {
        type: 'VariableDeclaration',
        name: 'temp',
        typeAnnotation: { name: 'int', primitive: true, nullable: false },
        modifiers: ['private', 'transient'],
      };

      const classDecl: ClassDeclaration = {
        type: 'ClassDeclaration',
        name: 'MyClass',
        members: [variable],
        modifiers: ['public'],
      };

      const program: ProgramNode = {
        type: 'Program',
        body: [classDecl],
        imports: [],
      };

      const result = transformer.transform(program, defaultOptions);

      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].message).toContain('transient');
    });
  });
});
