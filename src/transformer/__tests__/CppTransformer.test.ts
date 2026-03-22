// Unit tests for CppTransformer
import { CppTransformer } from '../CppTransformer';
import {
  ProgramNode,
  ClassDeclaration,
  MethodDeclaration,
  VariableDeclaration,
  BlockStatement,
} from '../../ast';
import { TransformOptions } from '../types';

describe('CppTransformer', () => {
  let transformer: CppTransformer;
  let defaultOptions: TransformOptions;

  beforeEach(() => {
    transformer = new CppTransformer();
    defaultOptions = {
      targetLang: 'cpp',
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
      expect(transformedMethod.returnType.name).toBe('int'); // int stays int in C++
      expect(transformedMethod.parameters[0].typeAnnotation.name).toBe('int');
    });
  });

  describe('transformClass', () => {
    it('should preserve C++-compatible modifiers', () => {
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

      // public, final, and abstract should be preserved
      expect(transformedClass.modifiers).toContain('public');
      expect(transformedClass.modifiers).toContain('final');
      expect(transformedClass.modifiers).toContain('abstract');
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
      expect(result.warnings[0].message).toContain('multiple inheritance');
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

      expect(transformedMethod.returnType.name).toBe('std::string'); // String -> std::string
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
      expect(result.warnings[0].message).toContain('mutex');
    });

    it('should warn about native methods', () => {
      const method: MethodDeclaration = {
        type: 'MethodDeclaration',
        name: 'nativeMethod',
        parameters: [],
        returnType: { name: 'void', primitive: true, nullable: false },
        body: { type: 'BlockStatement', body: [] } as BlockStatement,
        modifiers: ['public', 'native'],
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
      expect(result.warnings[0].message).toContain('native');
    });
  });

  describe('transformType', () => {
    it('should map primitive types correctly', () => {
      const types = [
        { java: 'int', cpp: 'int' },
        { java: 'boolean', cpp: 'bool' },
        { java: 'String', cpp: 'std::string' },
        { java: 'void', cpp: 'void' },
      ];

      types.forEach(({ java, cpp }) => {
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

        expect(transformedMethod.returnType.name).toBe(cpp);
      });
    });

    it('should map collection types correctly', () => {
      const types = [
        { java: 'List', cpp: 'std::vector' },
        { java: 'ArrayList', cpp: 'std::vector' },
        { java: 'Map', cpp: 'std::map' },
        { java: 'HashMap', cpp: 'std::unordered_map' },
        { java: 'Set', cpp: 'std::set' },
      ];

      types.forEach(({ java, cpp }) => {
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

        expect(transformedMethod.returnType.name).toBe(cpp);
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

      expect(transformedVar.typeAnnotation.name).toBe('int');
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
      expect(result.warnings[0].suggestion).toContain('atomic');
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
