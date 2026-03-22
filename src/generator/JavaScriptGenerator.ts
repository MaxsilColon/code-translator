// JavaScript Generator implementation
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
  ImportDeclaration,
  Comment,
} from '../ast';
import { CodeGenerator } from './CodeGenerator';
import { GeneratorOptions, GenerateResult } from './types';

export class JavaScriptGenerator extends CodeGenerator {
  private options!: GeneratorOptions;
  private indentLevel: number = 0;

  generate(ast: ASTNode, options: GeneratorOptions): GenerateResult {
    this.options = options;
    this.indentLevel = 0;

    const code = this.generateNode(ast);
    return { code };
  }

  private generateNode(node: ASTNode): string {
    switch (node.type) {
      case 'Program':
        return this.generateProgram(node as ProgramNode);
      case 'ClassDeclaration':
        return this.generateClass(node as ClassDeclaration);
      case 'MethodDeclaration':
        return this.generateMethod(node as MethodDeclaration);
      case 'ConstructorDeclaration':
        return this.generateConstructor(node as ConstructorDeclaration);
      case 'VariableDeclaration':
        return this.generateVariableDeclaration(node as VariableDeclaration);
      case 'ImportDeclaration':
        return this.generateImport(node as ImportDeclaration);
      default:
        if (this.isStatement(node)) {
          return this.generateStatement(node as Statement);
        }
        if (this.isExpression(node)) {
          return this.generateExpression(node as Expression);
        }
        return '';
    }
  }

  private generateProgram(node: ProgramNode): string {
    const parts: string[] = [];

    // Generate imports
    if (node.imports && node.imports.length > 0) {
      const imports = node.imports.map(imp => this.generateImport(imp)).join('\n');
      parts.push(imports);
      parts.push('');
    }

    // Generate body declarations
    const body = node.body.map(decl => this.generateNode(decl)).filter(s => s).join('\n\n');
    if (body) {
      parts.push(body);
    }

    return parts.join('\n');
  }

  private generateImport(node: ImportDeclaration): string {
    if (node.specifiers.length === 0) {
      return `import '${node.source}';`;
    }
    const specifiers = node.specifiers.join(', ');
    return `import { ${specifiers} } from '${node.source}';`;
  }

  generateClass(node: ClassDeclaration): string {
    const parts: string[] = [];

    // Add comments if present
    if (this.options.preserveComments && node.comments) {
      parts.push(this.generateComments(node.comments));
    }

    // Class declaration
    let classDecl = 'class ' + node.name;
    if (node.superClass) {
      classDecl += ' extends ' + node.superClass;
    }
    classDecl += ' {';
    parts.push(classDecl);

    this.indentLevel++;

    // Generate class members
    const members = node.members.map(member => {
      let memberCode: string;
      
      // Handle class fields differently - no let/const keyword
      if (member.type === 'VariableDeclaration') {
        memberCode = this.generateClassField(member as VariableDeclaration);
      } else {
        memberCode = this.generateNode(member);
      }
      
      return memberCode ? this.indent() + memberCode : '';
    }).filter(s => s);

    if (members.length > 0) {
      parts.push(members.join('\n\n'));
    }

    this.indentLevel--;
    parts.push('}');

    return parts.join('\n');
  }

  /**
   * Generate a class field (without let/const keyword)
   */
  private generateClassField(node: VariableDeclaration): string {
    const parts: string[] = [];

    // Add comments if present
    if (this.options.preserveComments && node.comments) {
      parts.push(this.generateComments(node.comments));
    }

    let decl = node.name;
    if (node.initializer) {
      decl += ' = ' + this.generateExpression(node.initializer);
    }
    decl += ';';
    
    parts.push(decl);
    return parts.join('\n');
  }

  generateMethod(node: MethodDeclaration): string {
    const parts: string[] = [];

    // Add comments if present
    if (this.options.preserveComments && node.comments) {
      parts.push(this.generateComments(node.comments));
    }

    // Check if this is a constructor
    const isConstructor = (node as any).isConstructor === true;
    
    // Method signature
    const isStatic = node.modifiers.includes('static');
    const params = node.parameters.map(p => p.name).join(', ');
    
    let methodDecl = '';
    if (isStatic && !isConstructor) {
      methodDecl += 'static ';
    }
    
    // Use 'constructor' for constructors, otherwise use the method name
    const methodName = isConstructor ? 'constructor' : node.name;
    methodDecl += `${methodName}(${params})`;
    
    // Method body
    const body = this.generateStatement(node.body);
    parts.push(methodDecl + ' ' + body);

    return parts.join('\n');
  }

  private generateConstructor(node: ConstructorDeclaration): string {
    const parts: string[] = [];

    // Add comments if present
    if (this.options.preserveComments && node.comments) {
      parts.push(this.generateComments(node.comments));
    }

    const params = node.parameters.map(p => p.name).join(', ');
    const body = this.generateStatement(node.body);
    parts.push(`constructor(${params}) ${body}`);

    return parts.join('\n');
  }

  private generateVariableDeclaration(node: VariableDeclaration): string {
    const parts: string[] = [];

    // Add comments if present
    if (this.options.preserveComments && node.comments) {
      parts.push(this.generateComments(node.comments));
    }

    const isFinal = node.modifiers.includes('final');
    const keyword = isFinal ? 'const' : 'let';
    
    let decl = `${keyword} ${node.name}`;
    if (node.initializer) {
      decl += ' = ' + this.generateExpression(node.initializer);
    }
    decl += ';';
    
    parts.push(decl);
    return parts.join('\n');
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
        const isFinal = varDecl.modifiers.includes('final');
        const keyword = isFinal ? 'const' : 'let';
        init = `${keyword} ${varDecl.name}`;
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
      const param = node.handler.param.name;
      const catchBlock = this.generateStatement(node.handler.body);
      parts.push(` catch (${param}) ${catchBlock}`);
    }
    
    if (node.finalizer) {
      const finallyBlock = this.generateStatement(node.finalizer);
      parts.push(` finally ${finallyBlock}`);
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

  private generateBreakStatement(node: BreakStatement): string {
    return node.label ? `break ${node.label};` : 'break;';
  }

  private generateContinueStatement(node: ContinueStatement): string {
    return node.label ? `continue ${node.label};` : 'continue;';
  }

  private generateVariableDeclarationStatement(node: VariableDeclarationStatement): string {
    return node.declarations.map(decl => this.generateVariableDeclaration(decl)).join('\n');
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
      return 'null';
    }
    if (typeof node.value === 'string') {
      return `'${node.value}'`;
    }
    return String(node.value);
  }

  private generateBinaryExpression(node: BinaryExpression): string {
    const left = this.generateExpression(node.left);
    const right = this.generateExpression(node.right);
    return `${left} ${node.operator} ${right}`;
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
    return `[${elements}]`;
  }

  private generateObjectExpression(node: ObjectExpression): string {
    if (node.properties.length === 0) {
      return '{}';
    }
    
    const props = node.properties.map(prop => {
      const key = this.generateExpression(prop.key);
      const value = this.generateExpression(prop.value);
      return `${key}: ${value}`;
    }).join(', ');
    
    return `{ ${props} }`;
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
