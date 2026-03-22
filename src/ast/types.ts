// AST Node Types and Interfaces
// Defines the structure of the Abstract Syntax Tree used for code translation

// ============================================================================
// Base Types
// ============================================================================

/**
 * Source location information for AST nodes
 */
export interface SourceLocation {
  start: { line: number; column: number };
  end: { line: number; column: number };
  file: string;
}

/**
 * Base interface for all AST nodes
 */
export interface ASTNodeBase {
  type: string;
  loc?: SourceLocation;
  comments?: Comment[];
}

// ============================================================================
// Comment Types
// ============================================================================

export interface Comment {
  type: 'LineComment' | 'BlockComment';
  value: string;
  loc: SourceLocation;
}

// ============================================================================
// Modifier Types
// ============================================================================

export type Modifier = 
  | 'public'
  | 'private'
  | 'protected'
  | 'static'
  | 'final'
  | 'abstract'
  | 'synchronized'
  | 'volatile'
  | 'transient'
  | 'native';

// ============================================================================
// Type Annotation
// ============================================================================

export interface TypeAnnotation {
  name: string;
  primitive: boolean;
  nullable: boolean;
  generic?: TypeAnnotation[];
}

// ============================================================================
// Program and Declarations
// ============================================================================

export interface ProgramNode extends ASTNodeBase {
  type: 'Program';
  body: Declaration[];
  imports: ImportDeclaration[];
}

export interface ImportDeclaration extends ASTNodeBase {
  type: 'ImportDeclaration';
  source: string;
  specifiers: string[];
  isStatic: boolean;
}

export type Declaration =
  | ClassDeclaration
  | InterfaceDeclaration
  | MethodDeclaration
  | VariableDeclaration;

// ============================================================================
// Class and Interface Declarations
// ============================================================================

export interface ClassDeclaration extends ASTNodeBase {
  type: 'ClassDeclaration';
  name: string;
  superClass?: string;
  implements?: string[];
  members: ClassMember[];
  modifiers: Modifier[];
}

export interface InterfaceDeclaration extends ASTNodeBase {
  type: 'InterfaceDeclaration';
  name: string;
  extends?: string[];
  members: InterfaceMember[];
  modifiers: Modifier[];
}

export type ClassMember =
  | MethodDeclaration
  | VariableDeclaration
  | ConstructorDeclaration;

export type InterfaceMember =
  | MethodSignature
  | PropertySignature;

// ============================================================================
// Method and Constructor Declarations
// ============================================================================

export interface MethodDeclaration extends ASTNodeBase {
  type: 'MethodDeclaration';
  name: string;
  parameters: Parameter[];
  returnType: TypeAnnotation;
  body: BlockStatement;
  modifiers: Modifier[];
}

export interface ConstructorDeclaration extends ASTNodeBase {
  type: 'ConstructorDeclaration';
  parameters: Parameter[];
  body: BlockStatement;
  modifiers: Modifier[];
}

export interface MethodSignature extends ASTNodeBase {
  type: 'MethodSignature';
  name: string;
  parameters: Parameter[];
  returnType: TypeAnnotation;
}

export interface PropertySignature extends ASTNodeBase {
  type: 'PropertySignature';
  name: string;
  typeAnnotation: TypeAnnotation;
}

export interface Parameter extends ASTNodeBase {
  type: 'Parameter';
  name: string;
  typeAnnotation: TypeAnnotation;
  defaultValue?: Expression;
}

// ============================================================================
// Variable Declaration
// ============================================================================

export interface VariableDeclaration extends ASTNodeBase {
  type: 'VariableDeclaration';
  name: string;
  typeAnnotation: TypeAnnotation;
  initializer?: Expression;
  modifiers: Modifier[];
}

// ============================================================================
// Statements
// ============================================================================

export type Statement =
  | BlockStatement
  | IfStatement
  | ForStatement
  | WhileStatement
  | DoWhileStatement
  | SwitchStatement
  | TryStatement
  | ReturnStatement
  | ThrowStatement
  | ExpressionStatement
  | BreakStatement
  | ContinueStatement
  | VariableDeclarationStatement;

export interface BlockStatement extends ASTNodeBase {
  type: 'BlockStatement';
  body: Statement[];
}

export interface IfStatement extends ASTNodeBase {
  type: 'IfStatement';
  test: Expression;
  consequent: Statement;
  alternate?: Statement;
}

export interface ForStatement extends ASTNodeBase {
  type: 'ForStatement';
  init?: VariableDeclaration | Expression;
  test?: Expression;
  update?: Expression;
  body: Statement;
}

export interface WhileStatement extends ASTNodeBase {
  type: 'WhileStatement';
  test: Expression;
  body: Statement;
}

export interface DoWhileStatement extends ASTNodeBase {
  type: 'DoWhileStatement';
  body: Statement;
  test: Expression;
}

export interface SwitchStatement extends ASTNodeBase {
  type: 'SwitchStatement';
  discriminant: Expression;
  cases: SwitchCase[];
}

export interface SwitchCase extends ASTNodeBase {
  type: 'SwitchCase';
  test?: Expression; // null for default case
  consequent: Statement[];
}

export interface TryStatement extends ASTNodeBase {
  type: 'TryStatement';
  block: BlockStatement;
  handler?: CatchClause;
  finalizer?: BlockStatement;
}

export interface CatchClause extends ASTNodeBase {
  type: 'CatchClause';
  param: Parameter;
  body: BlockStatement;
}

export interface ReturnStatement extends ASTNodeBase {
  type: 'ReturnStatement';
  argument?: Expression;
}

export interface ThrowStatement extends ASTNodeBase {
  type: 'ThrowStatement';
  argument: Expression;
}

export interface ExpressionStatement extends ASTNodeBase {
  type: 'ExpressionStatement';
  expression: Expression;
}

export interface BreakStatement extends ASTNodeBase {
  type: 'BreakStatement';
  label?: string;
}

export interface ContinueStatement extends ASTNodeBase {
  type: 'ContinueStatement';
  label?: string;
}

export interface VariableDeclarationStatement extends ASTNodeBase {
  type: 'VariableDeclarationStatement';
  declarations: VariableDeclaration[];
}

// ============================================================================
// Expressions
// ============================================================================

export type Expression =
  | Identifier
  | Literal
  | BinaryExpression
  | UnaryExpression
  | CallExpression
  | MemberExpression
  | ArrayExpression
  | ObjectExpression
  | AssignmentExpression
  | UpdateExpression
  | LogicalExpression
  | ConditionalExpression
  | NewExpression
  | ThisExpression
  | ArrayAccessExpression;

export interface Identifier extends ASTNodeBase {
  type: 'Identifier';
  name: string;
}

export interface Literal extends ASTNodeBase {
  type: 'Literal';
  value: string | number | boolean | null;
  raw: string;
}

export interface BinaryExpression extends ASTNodeBase {
  type: 'BinaryExpression';
  operator: BinaryOperator;
  left: Expression;
  right: Expression;
}

export type BinaryOperator =
  | '+' | '-' | '*' | '/' | '%'
  | '==' | '!=' | '===' | '!=='
  | '<' | '<=' | '>' | '>='
  | '&' | '|' | '^' | '<<' | '>>' | '>>>';

export interface UnaryExpression extends ASTNodeBase {
  type: 'UnaryExpression';
  operator: UnaryOperator;
  argument: Expression;
  prefix: boolean;
}

export type UnaryOperator =
  | '+' | '-' | '!' | '~' | 'typeof' | 'void' | 'delete';

export interface CallExpression extends ASTNodeBase {
  type: 'CallExpression';
  callee: Expression;
  arguments: Expression[];
}

export interface MemberExpression extends ASTNodeBase {
  type: 'MemberExpression';
  object: Expression;
  property: Expression;
  computed: boolean;
}

export interface ArrayExpression extends ASTNodeBase {
  type: 'ArrayExpression';
  elements: (Expression | null)[];
}

export interface ObjectExpression extends ASTNodeBase {
  type: 'ObjectExpression';
  properties: Property[];
}

export interface Property extends ASTNodeBase {
  type: 'Property';
  key: Expression;
  value: Expression;
  kind: 'init' | 'get' | 'set';
}

export interface AssignmentExpression extends ASTNodeBase {
  type: 'AssignmentExpression';
  operator: AssignmentOperator;
  left: Expression;
  right: Expression;
}

export type AssignmentOperator =
  | '=' | '+=' | '-=' | '*=' | '/=' | '%='
  | '&=' | '|=' | '^=' | '<<=' | '>>=' | '>>>=';

export interface UpdateExpression extends ASTNodeBase {
  type: 'UpdateExpression';
  operator: '++' | '--';
  argument: Expression;
  prefix: boolean;
}

export interface LogicalExpression extends ASTNodeBase {
  type: 'LogicalExpression';
  operator: '&&' | '||';
  left: Expression;
  right: Expression;
}

export interface ConditionalExpression extends ASTNodeBase {
  type: 'ConditionalExpression';
  test: Expression;
  consequent: Expression;
  alternate: Expression;
}

export interface NewExpression extends ASTNodeBase {
  type: 'NewExpression';
  callee: Expression;
  arguments: Expression[];
}

export interface ThisExpression extends ASTNodeBase {
  type: 'ThisExpression';
}

export interface ArrayAccessExpression extends ASTNodeBase {
  type: 'ArrayAccessExpression';
  array: Expression;
  index: Expression;
}

// ============================================================================
// Union Type for All AST Nodes
// ============================================================================

export type ASTNode =
  | ProgramNode
  | ImportDeclaration
  | ClassDeclaration
  | InterfaceDeclaration
  | MethodDeclaration
  | ConstructorDeclaration
  | MethodSignature
  | PropertySignature
  | Parameter
  | VariableDeclaration
  | Statement
  | Expression
  | Comment
  | SwitchCase
  | CatchClause
  | Property;
