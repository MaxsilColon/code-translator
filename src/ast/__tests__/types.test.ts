import {
  ASTNode,
  ASTNodeBase,
  SourceLocation,
  ProgramNode,
  ClassDeclaration,
  MethodDeclaration,
  VariableDeclaration,
  Expression,
  Statement,
  TypeAnnotation,
  Comment,
  Modifier,
  Identifier,
  Literal,
  BlockStatement,
} from '../types';

describe('AST Types', () => {
  describe('Base Types', () => {
    it('should create a valid SourceLocation', () => {
      const loc: SourceLocation = {
        start: { line: 1, column: 0 },
        end: { line: 1, column: 10 },
        file: 'test.java',
      };

      expect(loc.start.line).toBe(1);
      expect(loc.file).toBe('test.java');
    });

    it('should create a valid ASTNodeBase', () => {
      const node: ASTNodeBase = {
        type: 'TestNode',
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
          file: 'test.java',
        },
      };

      expect(node.type).toBe('TestNode');
      expect(node.loc).toBeDefined();
    });
  });

  describe('Comment Types', () => {
    it('should create a valid LineComment', () => {
      const comment: Comment = {
        type: 'LineComment',
        value: 'This is a comment',
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 20 },
          file: 'test.java',
        },
      };

      expect(comment.type).toBe('LineComment');
      expect(comment.value).toBe('This is a comment');
    });

    it('should create a valid BlockComment', () => {
      const comment: Comment = {
        type: 'BlockComment',
        value: 'Multi-line comment',
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 3, column: 2 },
          file: 'test.java',
        },
      };

      expect(comment.type).toBe('BlockComment');
    });
  });

  describe('Modifier Types', () => {
    it('should accept valid modifiers', () => {
      const modifiers: Modifier[] = ['public', 'static', 'final'];

      expect(modifiers).toContain('public');
      expect(modifiers).toContain('static');
      expect(modifiers).toContain('final');
    });
  });

  describe('TypeAnnotation', () => {
    it('should create a primitive type annotation', () => {
      const type: TypeAnnotation = {
        name: 'int',
        primitive: true,
        nullable: false,
      };

      expect(type.name).toBe('int');
      expect(type.primitive).toBe(true);
      expect(type.nullable).toBe(false);
    });

    it('should create a generic type annotation', () => {
      const type: TypeAnnotation = {
        name: 'List',
        primitive: false,
        nullable: false,
        generic: [
          {
            name: 'String',
            primitive: false,
            nullable: false,
          },
        ],
      };

      expect(type.name).toBe('List');
      expect(type.generic).toHaveLength(1);
      expect(type.generic![0].name).toBe('String');
    });
  });

  describe('Node Types', () => {
    it('should create a valid ProgramNode', () => {
      const program: ProgramNode = {
        type: 'Program',
        body: [],
        imports: [],
      };

      expect(program.type).toBe('Program');
      expect(program.body).toEqual([]);
      expect(program.imports).toEqual([]);
    });

    it('should create a valid ClassDeclaration', () => {
      const classDecl: ClassDeclaration = {
        type: 'ClassDeclaration',
        name: 'Calculator',
        members: [],
        modifiers: ['public'],
      };

      expect(classDecl.type).toBe('ClassDeclaration');
      expect(classDecl.name).toBe('Calculator');
      expect(classDecl.modifiers).toContain('public');
    });

    it('should create a valid MethodDeclaration', () => {
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
        body: {
          type: 'BlockStatement',
          body: [],
        },
        modifiers: ['public'],
      };

      expect(method.type).toBe('MethodDeclaration');
      expect(method.name).toBe('add');
      expect(method.parameters).toHaveLength(2);
      expect(method.returnType.name).toBe('int');
    });

    it('should create a valid VariableDeclaration', () => {
      const varDecl: VariableDeclaration = {
        type: 'VariableDeclaration',
        name: 'count',
        typeAnnotation: { name: 'int', primitive: true, nullable: false },
        modifiers: ['private'],
      };

      expect(varDecl.type).toBe('VariableDeclaration');
      expect(varDecl.name).toBe('count');
      expect(varDecl.typeAnnotation.name).toBe('int');
    });
  });

  describe('Expression Types', () => {
    it('should create a valid Identifier', () => {
      const id: Identifier = {
        type: 'Identifier',
        name: 'myVariable',
      };

      expect(id.type).toBe('Identifier');
      expect(id.name).toBe('myVariable');
    });

    it('should create a valid Literal', () => {
      const literal: Literal = {
        type: 'Literal',
        value: 42,
        raw: '42',
      };

      expect(literal.type).toBe('Literal');
      expect(literal.value).toBe(42);
      expect(literal.raw).toBe('42');
    });

    it('should accept Expression union type', () => {
      const expr1: Expression = {
        type: 'Identifier',
        name: 'x',
      };

      const expr2: Expression = {
        type: 'Literal',
        value: 10,
        raw: '10',
      };

      expect(expr1.type).toBe('Identifier');
      expect(expr2.type).toBe('Literal');
    });
  });

  describe('Statement Types', () => {
    it('should create a valid BlockStatement', () => {
      const block: BlockStatement = {
        type: 'BlockStatement',
        body: [],
      };

      expect(block.type).toBe('BlockStatement');
      expect(block.body).toEqual([]);
    });

    it('should accept Statement union type', () => {
      const stmt: Statement = {
        type: 'BlockStatement',
        body: [],
      };

      expect(stmt.type).toBe('BlockStatement');
    });
  });

  describe('ASTNode Union Type', () => {
    it('should accept any valid AST node type', () => {
      const node1: ASTNode = {
        type: 'Program',
        body: [],
        imports: [],
      };

      const node2: ASTNode = {
        type: 'ClassDeclaration',
        name: 'Test',
        members: [],
        modifiers: [],
      };

      const node3: ASTNode = {
        type: 'Identifier',
        name: 'test',
      };

      expect(node1.type).toBe('Program');
      expect(node2.type).toBe('ClassDeclaration');
      expect(node3.type).toBe('Identifier');
    });
  });

  describe('Node Structure Validation', () => {
    it('should create a complete class with methods', () => {
      const classNode: ClassDeclaration = {
        type: 'ClassDeclaration',
        name: 'Calculator',
        modifiers: ['public'],
        members: [
          {
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
                  },
                },
              ],
            },
            modifiers: ['public'],
          },
        ],
      };

      expect(classNode.name).toBe('Calculator');
      expect(classNode.members).toHaveLength(1);
      expect(classNode.members[0].type).toBe('MethodDeclaration');
    });
  });
});
