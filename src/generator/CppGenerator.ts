// C++ Generator implementation
import {
  ASTNode,
  ProgramNode,
  ClassDeclaration,
  MethodDeclaration,
  VariableDeclaration,
  Statement,
  Expression,
  BlockStatement,
  IfStatement,
  ForStatement,
  WhileStatement,
  DoWhileStatement,
  SwitchStatement,
  TryStatement,
  ReturnStatement,
  ThrowStatement,
  ExpressionStatement,
  BreakStatement,
  ContinueStatement,
  VariableDeclarationStatement,
  Identifier,
  Literal,
  BinaryExpression,
  UnaryExpression,
  CallExpression,
  MemberExpression,
  ArrayExpression,
  ObjectExpression,
  AssignmentExpression,
  UpdateExpression,
  LogicalExpression,
  ConditionalExpression,
  NewExpression,
  ArrayAccessExpression,
  ConstructorDeclaration,
  Comment,
  TypeAnnotation,
} from '../ast';
import { CodeGenerator } from './CodeGenerator';
import { GeneratorOptions, GenerateResult } from './types';

export class CppGenerator extends CodeGenerator {
  private options!: GeneratorOptions;
  private indentLevel: number = 0;

  generate(ast: ASTNode, options: GeneratorOptions): GenerateResult {
    this.options = options;
    this.indentLevel = 0;

    // For Program and ClassDeclaration, generate both header and source files
    if (ast.type === 'Program' || ast.type === 'ClassDeclaration') {
      const headerCode = this.generateHeader(ast);
      const sourceCode = this.generateSource(ast);

      // Combine header and source with a separator comment
      const code = `// Header (.h)\n${headerCode}\n\n// Source (.cpp)\n${sourceCode}`;
      return { code };
    }

    // For other node types (statements, expressions), generate directly
    if (this.isStatement(ast)) {
      return { code: this.generateStatement(ast as Statement) };
    }
    if (this.isExpression(ast)) {
      return { code: this.generateExpression(ast as Expression) };
    }

    return { code: '' };
  }

  private generateHeader(node: ASTNode): string {
    if (node.type === 'Program') {
      const program = node as ProgramNode;
      const parts: string[] = [];

      // Header guard
      const guardName = '_GENERATED_H_';
      parts.push(`#ifndef ${guardName}`);
      parts.push(`#define ${guardName}`);
      parts.push('');

      // Includes
      parts.push('#include <string>');
      parts.push('#include <vector>');
      parts.push('#include <map>');
      parts.push('');

      // Class declarations
      for (const decl of program.body) {
        if (decl.type === 'ClassDeclaration') {
          parts.push(this.generateClassHeader(decl as ClassDeclaration));
          parts.push('');
        }
      }

      parts.push(`#endif // ${guardName}`);
      return parts.join('\n');
    }

    if (node.type === 'ClassDeclaration') {
      return this.generateClassHeader(node as ClassDeclaration);
    }

    return '';
  }

  private generateSource(node: ASTNode): string {
    if (node.type === 'Program') {
      const program = node as ProgramNode;
      const parts: string[] = [];

      // Include the header
      parts.push('#include "generated.h"');
      parts.push('');

      // Class implementations
      for (const decl of program.body) {
        if (decl.type === 'ClassDeclaration') {
          parts.push(this.generateClassSource(decl as ClassDeclaration));
          parts.push('');
        }
      }

      return parts.join('\n');
    }

    if (node.type === 'ClassDeclaration') {
      return this.generateClassSource(node as ClassDeclaration);
    }

    return '';
  }

  private generateClassHeader(node: ClassDeclaration): string {
    const parts: string[] = [];

    // Add comments if present
    if (this.options.preserveComments && node.comments) {
      parts.push(this.generateComments(node.comments));
    }

    // Class declaration
    let classDecl = 'class ' + node.name;
    if (node.superClass) {
      classDecl += ' : public ' + node.superClass;
    }
    classDecl += ' {';
    parts.push(classDecl);

    // Public section
    parts.push('public:');
    this.indentLevel++;

    // Constructor
    const constructors = node.members.filter(m => m.type === 'ConstructorDeclaration');
    if (constructors.length > 0) {
      for (const ctor of constructors) {
        const ctorDecl = this.generateConstructorHeader(ctor as ConstructorDeclaration, node.name);
        parts.push(this.indent() + ctorDecl);
      }
    } else {
      // Default constructor
      parts.push(this.indent() + `${node.name}();`);
    }

    // Methods
    const methods = node.members.filter(m => m.type === 'MethodDeclaration');
    for (const method of methods) {
      const methodDecl = this.generateMethodHeader(method as MethodDeclaration);
      parts.push(this.indent() + methodDecl);
    }

    // Private section for fields
    const fields = node.members.filter(m => m.type === 'VariableDeclaration');
    if (fields.length > 0) {
      this.indentLevel--;
      parts.push('private:');
      this.indentLevel++;

      for (const field of fields) {
        const fieldDecl = this.generateFieldDeclaration(field as VariableDeclaration);
        parts.push(this.indent() + fieldDecl);
      }
    }

    this.indentLevel--;
    parts.push('};');

    return parts.join('\n');
  }

  private generateClassSource(node: ClassDeclaration): string {
    const parts: string[] = [];

    // Constructor implementations
    const constructors = node.members.filter(m => m.type === 'ConstructorDeclaration');
    if (constructors.length > 0) {
      for (const ctor of constructors) {
        parts.push(this.generateConstructorImpl(ctor as ConstructorDeclaration, node.name));
        parts.push('');
      }
    } else {
      // Default constructor implementation
      parts.push(`${node.name}::${node.name}() {}`);
      parts.push('');
    }

    // Method implementations
    const methods = node.members.filter(m => m.type === 'MethodDeclaration');
    for (const method of methods) {
      parts.push(this.generateMethodImpl(method as MethodDeclaration, node.name));
      parts.push('');
    }

    return parts.join('\n');
  }

  private generateConstructorHeader(node: ConstructorDeclaration, className: string): string {
    const params = node.parameters.map(p => 
      `${this.mapType(p.typeAnnotation)} ${p.name}`
    ).join(', ');
    return `${className}(${params});`;
  }

  private generateConstructorImpl(node: ConstructorDeclaration, className: string): string {
    const params = node.parameters.map(p => 
      `${this.mapType(p.typeAnnotation)} ${p.name}`
    ).join(', ');
    
    const body = this.generateStatement(node.body);
    return `${className}::${className}(${params}) ${body}`;
  }

  private generateMethodHeader(node: MethodDeclaration): string {
    const returnType = this.mapType(node.returnType);
    const params = node.parameters.map(p => 
      `${this.mapType(p.typeAnnotation)} ${p.name}`
    ).join(', ');
    
    let methodDecl = '';
    if (node.modifiers.includes('static')) {
      methodDecl += 'static ';
    }
    methodDecl += `${returnType} ${node.name}(${params});`;
    
    return methodDecl;
  }

  private generateMethodImpl(node: MethodDeclaration, className: string): string {
    const parts: string[] = [];

    // Add comments if present
    if (this.options.preserveComments && node.comments) {
      parts.push(this.generateComments(node.comments));
    }

    const returnType = this.mapType(node.returnType);
    const params = node.parameters.map(p => 
      `${this.mapType(p.typeAnnotation)} ${p.name}`
    ).join(', ');
    
    const isStatic = node.modifiers.includes('static');
    const qualifier = isStatic ? '' : `${className}::`;
    
    const body = this.generateStatement(node.body);
    parts.push(`${returnType} ${qualifier}${node.name}(${params}) ${body}`);

    return parts.join('\n');
  }

  private generateFieldDeclaration(node: VariableDeclaration): string {
    const type = this.mapType(node.typeAnnotation);
    return `${type} ${node.name};`;
  }

  generateClass(node: ClassDeclaration): string {
    // This is called from the base generate method
    return this.generateClassHeader(node);
  }

  generateMethod(node: MethodDeclaration): string {
    return this.generateMethodHeader(node);
  }

  generateStatement(node: Statement): string {
    switch (node.type) {
      case 'BlockStatement':
        return this.generateBlockStatement(node as BlockStatement);
      case 'IfStatement':
        return this.generateIfStatement(node as IfStatement);
      case 'ForStatement':
        return this.generateForStatement(node as ForStatement);
      case 'WhileStatement':
        return this.generateWhileStatement(node as WhileStatement);
      case 'DoWhileStatement':
        return this.generateDoWhileStatement(node as DoWhileStatement);
      case 'SwitchStatement':
        return this.generateSwitchStatement(node as SwitchStatement);
      case 'TryStatement':
        return this.generateTryStatement(node as TryStatement);
      case 'ReturnStatement':
        return this.generateReturnStatement(node as ReturnStatement);
      case 'ThrowStatement':
        return this.generateThrowStatement(node as ThrowStatement);
      case 'ExpressionStatement':
        return this.generateExpressionStatement(node as ExpressionStatement);
      case 'BreakStatement':
        return this.generateBreakStatement(node as BreakStatement);
      case 'ContinueStatement':
        return this.generateContinueStatement(node as ContinueStatement);
      case 'VariableDeclarationStatement':
        return this.generateVariableDeclarationStatement(node as VariableDeclarationStatement);
      default:
        return '';
    }
  }

  private generateBlockStatement(node: BlockStatement): string {
    const parts: string[] = ['{'];
    
    this.indentLevel++;
    const statements = node.body.map(stmt => {
      const stmtCode = this.generateStatement(stmt);
      return stmtCode ? this.indent() + stmtCode : '';
    }).filter(s => s);
    
    if (statements.length > 0) {
      parts.push(statements.join('\n'));
    }
    
    this.indentLevel--;
    parts.push(this.indent() + '}');
    
    return parts.join('\n');
  }

  private generateIfStatement(node: IfStatement): string {
    const test = this.generateExpression(node.test);
    const consequent = this.generateStatement(node.consequent);
    
    let result = `if (${test}) ${consequent}`;
    
    if (node.alternate) {
      const alternate = this.generateStatement(node.alternate);
      result += ` else ${alternate}`;
    }
    
    return result;
  }

  private generateForStatement(node: ForStatement): string {
    let init = '';
    if (node.init) {
      if ((node.init as any).type === 'VariableDeclaration') {
        const varDecl = node.init as VariableDeclaration;
        const type = this.mapType(varDecl.typeAnnotation);
        init = `${type} ${varDecl.name}`;
        if (varDecl.initializer) {
          init += ' = ' + this.generateExpression(varDecl.initializer);
        }
      } else {
        init = this.generateExpression(node.init as Expression);
      }
    }
    
    const test = node.test ? this.generateExpression(node.test) : '';
    const update = node.update ? this.generateExpression(node.update) : '';
    const body = this.generateStatement(node.body);
    
    return `for (${init}; ${test}; ${update}) ${body}`;
  }

  private generateWhileStatement(node: WhileStatement): string {
    const test = this.generateExpression(node.test);
    const body = this.generateStatement(node.body);
    return `while (${test}) ${body}`;
  }

  private generateDoWhileStatement(node: DoWhileStatement): string {
    const body = this.generateStatement(node.body);
    const test = this.generateExpression(node.test);
    return `do ${body} while (${test});`;
  }

  private generateSwitchStatement(node: SwitchStatement): string {
    const discriminant = this.generateExpression(node.discriminant);
    const parts: string[] = [`switch (${discriminant}) {`];
    
    this.indentLevel++;
    for (const caseNode of node.cases) {
      if (caseNode.test) {
        const test = this.generateExpression(caseNode.test);
        parts.push(this.indent() + `case ${test}:`);
      } else {
        parts.push(this.indent() + 'default:');
      }
      
      this.indentLevel++;
      for (const stmt of caseNode.consequent) {
        const stmtCode = this.generateStatement(stmt);
        if (stmtCode) {
          parts.push(this.indent() + stmtCode);
        }
      }
      this.indentLevel--;
    }
    this.indentLevel--;
    
    parts.push(this.indent() + '}');
    return parts.join('\n');
  }

  private generateTryStatement(node: TryStatement): string {
    const parts: string[] = [];
    const tryBlock = this.generateStatement(node.block);
    parts.push(`try ${tryBlock}`);
    
    if (node.handler) {
      const paramType = this.mapType(node.handler.param.typeAnnotation);
      const param = node.handler.param.name;
      const catchBlock = this.generateStatement(node.handler.body);
      parts.push(` catch (${paramType} ${param}) ${catchBlock}`);
    }
    
    // Note: C++ doesn't have finally, so we emit a comment
    if (node.finalizer) {
      parts.push('\n' + this.indent() + '// TODO: Emulate finally block behavior');
      const finallyBlock = this.generateStatement(node.finalizer);
      parts.push(finallyBlock);
    }
    
    return parts.join('');
  }

  private generateReturnStatement(node: ReturnStatement): string {
    if (node.argument) {
      return 'return ' + this.generateExpression(node.argument) + ';';
    }
    return 'return;';
  }

  private generateThrowStatement(node: ThrowStatement): string {
    return 'throw ' + this.generateExpression(node.argument) + ';';
  }

  private generateExpressionStatement(node: ExpressionStatement): string {
    return this.generateExpression(node.expression) + ';';
  }

  private generateBreakStatement(_node: BreakStatement): string {
    return 'break;';
  }

  private generateContinueStatement(_node: ContinueStatement): string {
    return 'continue;';
  }

  private generateVariableDeclarationStatement(node: VariableDeclarationStatement): string {
    return node.declarations.map(decl => {
      const type = this.mapType(decl.typeAnnotation);
      let result = `${type} ${decl.name}`;
      if (decl.initializer) {
        result += ' = ' + this.generateExpression(decl.initializer);
      }
      result += ';';
      return result;
    }).join('\n');
  }

  generateExpression(node: Expression): string {
    switch (node.type) {
      case 'Identifier':
        return (node as Identifier).name;
      case 'Literal':
        return this.generateLiteral(node as Literal);
      case 'BinaryExpression':
        return this.generateBinaryExpression(node as BinaryExpression);
      case 'UnaryExpression':
        return this.generateUnaryExpression(node as UnaryExpression);
      case 'CallExpression':
        return this.generateCallExpression(node as CallExpression);
      case 'MemberExpression':
        return this.generateMemberExpression(node as MemberExpression);
      case 'ArrayExpression':
        return this.generateArrayExpression(node as ArrayExpression);
      case 'ObjectExpression':
        return this.generateObjectExpression(node as ObjectExpression);
      case 'AssignmentExpression':
        return this.generateAssignmentExpression(node as AssignmentExpression);
      case 'UpdateExpression':
        return this.generateUpdateExpression(node as UpdateExpression);
      case 'LogicalExpression':
        return this.generateLogicalExpression(node as LogicalExpression);
      case 'ConditionalExpression':
        return this.generateConditionalExpression(node as ConditionalExpression);
      case 'NewExpression':
        return this.generateNewExpression(node as NewExpression);
      case 'ThisExpression':
        return 'this';
      case 'ArrayAccessExpression':
        return this.generateArrayAccessExpression(node as ArrayAccessExpression);
      default:
        return '';
    }
  }

  private generateLiteral(node: Literal): string {
    if (node.value === null) {
      return 'nullptr';
    }
    if (typeof node.value === 'string') {
      return `"${node.value}"`;
    }
    if (typeof node.value === 'boolean') {
      return node.value ? 'true' : 'false';
    }
    return String(node.value);
  }

  private generateBinaryExpression(node: BinaryExpression): string {
    const left = this.generateExpression(node.left);
    const right = this.generateExpression(node.right);
    
    // Map Java operators to C++
    let op = node.operator;
    if (op === '===') op = '==';
    if (op === '!==') op = '!=';
    
    return `${left} ${op} ${right}`;
  }

  private generateUnaryExpression(node: UnaryExpression): string {
    const arg = this.generateExpression(node.argument);
    if (node.prefix) {
      return `${node.operator}${arg}`;
    }
    return `${arg}${node.operator}`;
  }

  private generateCallExpression(node: CallExpression): string {
    const callee = this.generateExpression(node.callee);
    const args = node.arguments.map(arg => this.generateExpression(arg)).join(', ');
    return `${callee}(${args})`;
  }

  private generateMemberExpression(node: MemberExpression): string {
    const object = this.generateExpression(node.object);
    const property = this.generateExpression(node.property);
    
    if (node.computed) {
      return `${object}[${property}]`;
    }
    return `${object}.${property}`;
  }

  private generateArrayExpression(node: ArrayExpression): string {
    const elements = node.elements.map(el => el ? this.generateExpression(el) : '').join(', ');
    return `{${elements}}`;
  }

  private generateObjectExpression(_node: ObjectExpression): string {
    // C++ doesn't have object literals, so we emit a comment
    return '/* Object literal not supported in C++ */';
  }

  private generateAssignmentExpression(node: AssignmentExpression): string {
    const left = this.generateExpression(node.left);
    const right = this.generateExpression(node.right);
    return `${left} ${node.operator} ${right}`;
  }

  private generateUpdateExpression(node: UpdateExpression): string {
    const arg = this.generateExpression(node.argument);
    if (node.prefix) {
      return `${node.operator}${arg}`;
    }
    return `${arg}${node.operator}`;
  }

  private generateLogicalExpression(node: LogicalExpression): string {
    const left = this.generateExpression(node.left);
    const right = this.generateExpression(node.right);
    return `${left} ${node.operator} ${right}`;
  }

  private generateConditionalExpression(node: ConditionalExpression): string {
    const test = this.generateExpression(node.test);
    const consequent = this.generateExpression(node.consequent);
    const alternate = this.generateExpression(node.alternate);
    return `${test} ? ${consequent} : ${alternate}`;
  }

  private generateNewExpression(node: NewExpression): string {
    const callee = this.generateExpression(node.callee);
    const args = node.arguments.map(arg => this.generateExpression(arg)).join(', ');
    return `new ${callee}(${args})`;
  }

  private generateArrayAccessExpression(node: ArrayAccessExpression): string {
    const array = this.generateExpression(node.array);
    const index = this.generateExpression(node.index);
    return `${array}[${index}]`;
  }

  private generateComments(comments: Comment[]): string {
    return comments.map(comment => {
      if (comment.type === 'LineComment') {
        return this.indent() + '// ' + comment.value;
      } else {
        return this.indent() + '/* ' + comment.value + ' */';
      }
    }).join('\n');
  }

  private mapType(type: TypeAnnotation): string {
    // Map Java types to C++ types
    const typeMap: Record<string, string> = {
      'int': 'int',
      'long': 'long',
      'float': 'float',
      'double': 'double',
      'boolean': 'bool',
      'char': 'char',
      'String': 'std::string',
      'void': 'void',
      'Object': 'void*',
      'List': 'std::vector',
      'ArrayList': 'std::vector',
      'Map': 'std::map',
      'HashMap': 'std::unordered_map',
      'Set': 'std::set',
      'HashSet': 'std::unordered_set',
    };

    let cppType = typeMap[type.name] || type.name;

    // Handle generics
    if (type.generic && type.generic.length > 0) {
      const genericTypes = type.generic.map(g => this.mapType(g)).join(', ');
      cppType += `<${genericTypes}>`;
    }

    return cppType;
  }

  private indent(): string {
    if (this.options.indentStyle === 'tabs') {
      return '\t'.repeat(this.indentLevel);
    }
    return ' '.repeat(this.indentLevel * this.options.indentWidth);
  }

  private isStatement(node: ASTNode): boolean {
    const statementTypes = [
      'BlockStatement', 'IfStatement', 'ForStatement', 'WhileStatement',
      'DoWhileStatement', 'SwitchStatement', 'TryStatement', 'ReturnStatement',
      'ThrowStatement', 'ExpressionStatement', 'BreakStatement', 'ContinueStatement',
      'VariableDeclarationStatement'
    ];
    return statementTypes.includes(node.type);
  }

  private isExpression(node: ASTNode): boolean {
    const expressionTypes = [
      'Identifier', 'Literal', 'BinaryExpression', 'UnaryExpression',
      'CallExpression', 'MemberExpression', 'ArrayExpression', 'ObjectExpression',
      'AssignmentExpression', 'UpdateExpression', 'LogicalExpression',
      'ConditionalExpression', 'NewExpression', 'ThisExpression', 'ArrayAccessExpression'
    ];
    return expressionTypes.includes(node.type);
  }
}
