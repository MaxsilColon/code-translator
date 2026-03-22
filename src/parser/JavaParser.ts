// JavaParser implementation
import { readFileSync } from 'fs';
import { parse as javaParserParse } from 'java-parser';
import { ParseResult, ParseError } from './types';
import { ProgramNode, ASTNode } from '../ast/types';

export class JavaParser {
  /**
   * Parse Java source code and convert to AST
   * @param source Java source code string
   * @param filename Source filename for error reporting
   * @returns ParseResult with AST and any errors
   */
  parse(source: string, filename: string): ParseResult {
    try {
      // Parse Java code using java-parser library
      const cst = javaParserParse(source);
      
      // Convert CST to our AST format
      const ast = this.convertToAST(cst, filename);
      
      return {
        ast,
        errors: [],
        success: true
      };
    } catch (error: any) {
      // Handle syntax errors
      const parseError = this.createParseError(error, filename);
      
      // Return a minimal valid AST for error cases
      const emptyProgram: ProgramNode = {
        type: 'Program',
        body: [],
        imports: [],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 0 },
          file: filename
        }
      };
      
      return {
        ast: emptyProgram,
        errors: [parseError],
        success: false
      };
    }
  }

  /**
   * Parse Java source file
   * @param filepath Path to Java source file
   * @returns ParseResult with AST and any errors
   */
  parseFile(filepath: string): ParseResult {
    try {
      const source = readFileSync(filepath, 'utf-8');
      return this.parse(source, filepath);
    } catch (error: any) {
      // Handle file reading errors
      const parseError: ParseError = {
        message: `Failed to read file: ${error.message}`,
        line: 0,
        column: 0,
        file: filepath
      };
      
      const emptyProgram: ProgramNode = {
        type: 'Program',
        body: [],
        imports: [],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 0 },
          file: filepath
        }
      };
      
      return {
        ast: emptyProgram,
        errors: [parseError],
        success: false
      };
    }
  }

  /**
   * Convert java-parser CST to our AST format
   */
  private convertToAST(cst: any, filename: string): ASTNode {
    const program: ProgramNode = {
      type: 'Program',
      body: [],
      imports: [],
      loc: {
        start: { line: 1, column: 0 },
        end: { line: 1, column: 0 },
        file: filename
      }
    };

    if (!cst || !cst.children) {
      return program;
    }

    // Extract imports
    const imports = this.extractImports(cst, filename);
    program.imports = imports;

    // Extract type declarations (classes, interfaces, etc.)
    const typeDeclarations = this.extractTypeDeclarations(cst, filename);
    program.body = typeDeclarations;

    return program;
  }

  /**
   * Extract import declarations from CST
   */
  private extractImports(cst: any, filename: string): any[] {
    const imports: any[] = [];
    
    // Navigate to import declarations in CST
    const ordinaryCompUnit = cst.children?.ordinaryCompilationUnit?.[0];
    if (!ordinaryCompUnit?.children?.importDeclaration) {
      return imports;
    }

    // Process each import
    for (const importDecl of ordinaryCompUnit.children.importDeclaration) {
      const importPath = this.extractImportPath(importDecl);
      if (importPath) {
        imports.push({
          type: 'ImportDeclaration',
          source: importPath,
          loc: this.extractLocation(importDecl, filename)
        });
      }
    }

    return imports;
  }

  /**
   * Extract import path from import declaration
   */
  private extractImportPath(importDecl: any): string | null {
    // Navigate through CST to find package or type name
    const packageOrTypeName = importDecl.children?.packageOrTypeName?.[0];
    if (!packageOrTypeName) return null;

    const identifiers = packageOrTypeName.children?.Identifier || [];
    return identifiers.map((id: any) => id.image).join('.');
  }

  /**
   * Extract type declarations (classes) from CST
   */
  private extractTypeDeclarations(cst: any, filename: string): any[] {
    const declarations: any[] = [];
    
    const ordinaryCompUnit = cst.children?.ordinaryCompilationUnit?.[0];
    if (!ordinaryCompUnit?.children?.typeDeclaration) {
      return declarations;
    }

    for (const typeDecl of ordinaryCompUnit.children.typeDeclaration) {
      const classDecl = typeDecl.children?.classDeclaration?.[0];
      if (classDecl) {
        const classNode = this.extractClassDeclaration(classDecl, filename);
        if (classNode) {
          declarations.push(classNode);
        }
      }
    }

    return declarations;
  }

  /**
   * Extract class declaration from CST
   */
  private extractClassDeclaration(classDecl: any, filename: string): any {
    const normalClassDecl = classDecl.children?.normalClassDeclaration?.[0];
    if (!normalClassDecl) return null;

    // Extract class name
    const className = normalClassDecl.children?.typeIdentifier?.[0]?.children?.Identifier?.[0]?.image || 'Unknown';

    // Extract modifiers
    const modifiers = this.extractModifiers(classDecl.children?.classModifier || []);

    // Extract superclass
    let superClass: string | undefined;
    const superclass = normalClassDecl.children?.superclass?.[0];
    if (superclass) {
      const classType = superclass.children?.classType?.[0];
      const identifier = classType?.children?.Identifier?.[0];
      if (identifier) {
        superClass = identifier.image;
      }
    }

    // Extract interfaces
    const implementsList: string[] = [];
    const superinterfaces = normalClassDecl.children?.superinterfaces?.[0];
    if (superinterfaces) {
      const interfaceTypeList = superinterfaces.children?.interfaceTypeList?.[0];
      if (interfaceTypeList?.children?.interfaceType) {
        for (const interfaceType of interfaceTypeList.children.interfaceType) {
          const classType = interfaceType.children?.classType?.[0];
          const identifier = classType?.children?.Identifier?.[0];
          if (identifier) {
            implementsList.push(identifier.image);
          }
        }
      }
    }

    // Extract class body members
    const members = this.extractClassBodyMembers(normalClassDecl, filename);

    return {
      type: 'ClassDeclaration',
      name: className,
      superClass,
      implements: implementsList.length > 0 ? implementsList : undefined,
      members,
      modifiers,
      loc: this.extractLocation(classDecl, filename)
    };
  }

  /**
   * Extract class body members (fields and methods)
   */
  private extractClassBodyMembers(normalClassDecl: any, filename: string): any[] {
    const members: any[] = [];
    
    const classBody = normalClassDecl.children?.classBody?.[0];
    if (!classBody?.children?.classBodyDeclaration) {
      return members;
    }

    for (const bodyDecl of classBody.children.classBodyDeclaration) {
      // Extract field declarations
      const classMemberDecl = bodyDecl.children?.classMemberDeclaration?.[0];
      if (classMemberDecl) {
        // Field declaration
        const fieldDecl = classMemberDecl.children?.fieldDeclaration?.[0];
        if (fieldDecl) {
          const field = this.extractFieldDeclaration(fieldDecl, bodyDecl, filename);
          if (field) members.push(field);
        }

        // Method declaration
        const methodDecl = classMemberDecl.children?.methodDeclaration?.[0];
        if (methodDecl) {
          const method = this.extractMethodDeclaration(methodDecl, bodyDecl, filename);
          if (method) members.push(method);
        }
      }

      // Constructor declaration
      const constructorDecl = bodyDecl.children?.constructorDeclaration?.[0];
      if (constructorDecl) {
        const constructor = this.extractConstructorDeclaration(constructorDecl, bodyDecl, filename);
        if (constructor) members.push(constructor);
      }
    }

    return members;
  }

  /**
   * Extract field declaration
   */
  private extractFieldDeclaration(fieldDecl: any, bodyDecl: any, filename: string): any {
    const unannType = fieldDecl.children?.unannType?.[0];
    const typeAnnotation = this.extractTypeAnnotation(unannType);

    const variableDeclaratorList = fieldDecl.children?.variableDeclaratorList?.[0];
    const variableDeclarator = variableDeclaratorList?.children?.variableDeclarator?.[0];
    const variableDeclaratorId = variableDeclarator?.children?.variableDeclaratorId?.[0];
    const fieldName = variableDeclaratorId?.children?.Identifier?.[0]?.image || 'unknown';

    const modifiers = this.extractModifiers(bodyDecl.children?.modifier || []);

    return {
      type: 'VariableDeclaration',
      name: fieldName,
      typeAnnotation,
      modifiers,
      loc: this.extractLocation(fieldDecl, filename)
    };
  }

  /**
   * Extract method declaration
   */
  private extractMethodDeclaration(methodDecl: any, bodyDecl: any, filename: string): any {
    const methodHeader = methodDecl.children?.methodHeader?.[0];
    const methodDeclarator = methodHeader?.children?.methodDeclarator?.[0];
    const methodName = methodDeclarator?.children?.Identifier?.[0]?.image || 'unknown';

    // Extract return type
    const result = methodHeader?.children?.result?.[0];
    const returnType = this.extractReturnType(result);

    // Extract parameters
    const parameters = this.extractParameters(methodDeclarator);

    // Extract modifiers
    const modifiers = this.extractModifiers(bodyDecl.children?.modifier || []);

    // Extract method body
    const methodBody = methodDecl.children?.methodBody?.[0];
    const body = this.extractMethodBody(methodBody, filename);

    return {
      type: 'MethodDeclaration',
      name: methodName,
      parameters,
      returnType,
      body,
      modifiers,
      loc: this.extractLocation(methodDecl, filename)
    };
  }

  /**
   * Extract constructor declaration
   */
  private extractConstructorDeclaration(constructorDecl: any, bodyDecl: any, filename: string): any {
    const simpleTypeName = constructorDecl.children?.simpleTypeName?.[0];
    const constructorName = simpleTypeName?.children?.Identifier?.[0]?.image || 'constructor';

    const constructorDeclarator = constructorDecl.children?.constructorDeclarator?.[0];
    const parameters = this.extractParameters(constructorDeclarator);

    const modifiers = this.extractModifiers(bodyDecl.children?.modifier || []);

    const constructorBody = constructorDecl.children?.constructorBody?.[0];
    const body = this.extractMethodBody(constructorBody, filename);

    return {
      type: 'MethodDeclaration',
      name: constructorName,
      parameters,
      returnType: { name: 'void', primitive: true, nullable: false },
      body,
      modifiers,
      isConstructor: true,
      loc: this.extractLocation(constructorDecl, filename)
    };
  }

  /**
   * Extract method parameters
   */
  private extractParameters(methodDeclarator: any): any[] {
    const parameters: any[] = [];
    
    const formalParameterList = methodDeclarator?.children?.formalParameterList?.[0];
    if (!formalParameterList) return parameters;

    const formalParameters = formalParameterList.children?.formalParameter || [];
    for (const param of formalParameters) {
      const unannType = param.children?.unannType?.[0];
      const typeAnnotation = this.extractTypeAnnotation(unannType);

      const variableDeclaratorId = param.children?.variableDeclaratorId?.[0];
      const paramName = variableDeclaratorId?.children?.Identifier?.[0]?.image || 'param';

      parameters.push({
        type: 'Parameter',
        name: paramName,
        typeAnnotation
      });
    }

    return parameters;
  }

  /**
   * Extract type annotation from unannType
   */
  private extractTypeAnnotation(unannType: any): any {
    if (!unannType) {
      return { name: 'void', primitive: true, nullable: false };
    }

    // Primitive type
    const primitiveType = unannType.children?.unannPrimitiveTypeWithOptionalDimsSuffix?.[0]
      ?.children?.primitiveType?.[0];
    if (primitiveType) {
      const typeName = Object.keys(primitiveType.children)[0];
      return {
        name: typeName.toLowerCase(),
        primitive: true,
        nullable: false
      };
    }

    // Reference type
    const unannReferenceType = unannType.children?.unannReferenceType?.[0];
    if (unannReferenceType) {
      const unannClassOrInterfaceType = unannReferenceType.children?.unannClassOrInterfaceType?.[0];
      if (unannClassOrInterfaceType) {
        const unannClassType = unannClassOrInterfaceType.children?.unannClassType?.[0];
        if (unannClassType) {
          const identifier = unannClassType.children?.Identifier?.[0];
          if (identifier) {
            return {
              name: identifier.image,
              primitive: false,
              nullable: true
            };
          }
        }
      }
    }

    return { name: 'Object', primitive: false, nullable: true };
  }

  /**
   * Extract return type from result
   */
  private extractReturnType(result: any): any {
    if (!result) {
      return { name: 'void', primitive: true, nullable: false };
    }

    // Check for void
    if (result.children?.Void) {
      return { name: 'void', primitive: true, nullable: false };
    }

    // Extract unannType
    const unannType = result.children?.unannType?.[0];
    return this.extractTypeAnnotation(unannType);
  }

  /**
   * Extract method body
   */
  private extractMethodBody(methodBody: any, filename: string): any {
    if (!methodBody || !methodBody.children?.block) {
      return {
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 0 }, file: filename }
      };
    }

    const block = methodBody.children.block[0];
    const statements = this.extractBlockStatements(block, filename);

    return {
      type: 'BlockStatement',
      body: statements,
      loc: this.extractLocation(block, filename)
    };
  }

  /**
   * Extract statements from block
   */
  private extractBlockStatements(block: any, filename: string): any[] {
    const statements: any[] = [];
    
    const blockStatements = block?.children?.blockStatements?.[0];
    if (!blockStatements?.children?.blockStatement) {
      return statements;
    }

    for (const blockStatement of blockStatements.children.blockStatement) {
      const statement = this.extractStatement(blockStatement, filename);
      if (statement) {
        statements.push(statement);
      }
    }

    return statements;
  }

  /**
   * Extract a single statement
   */
  private extractStatement(blockStatement: any, filename: string): any {
    // Local variable declaration
    const localVarDecl = blockStatement.children?.localVariableDeclarationStatement?.[0]
      ?.children?.localVariableDeclaration?.[0];
    if (localVarDecl) {
      return this.extractLocalVariableDeclaration(localVarDecl, filename);
    }

    // Statement (return, if, while, etc.)
    const statement = blockStatement.children?.statement?.[0];
    if (statement) {
      // Return statement
      if (statement.children?.returnStatement) {
        return this.extractReturnStatement(statement.children.returnStatement[0], filename);
      }

      // Expression statement
      if (statement.children?.expressionStatement) {
        return this.extractExpressionStatement(statement.children.expressionStatement[0], filename);
      }

      // If statement
      if (statement.children?.ifStatement) {
        return this.extractIfStatement(statement.children.ifStatement[0], filename);
      }

      // While statement
      if (statement.children?.whileStatement) {
        return this.extractWhileStatement(statement.children.whileStatement[0], filename);
      }

      // For statement
      if (statement.children?.forStatement) {
        return this.extractForStatement(statement.children.forStatement[0], filename);
      }
    }

    // Fallback: create a placeholder statement
    return {
      type: 'ExpressionStatement',
      expression: { type: 'Identifier', name: 'unknown' },
      loc: this.extractLocation(blockStatement, filename)
    };
  }

  /**
   * Extract local variable declaration
   */
  private extractLocalVariableDeclaration(localVarDecl: any, filename: string): any {
    const unannType = localVarDecl.children?.unannType?.[0];
    const typeAnnotation = this.extractTypeAnnotation(unannType);

    const variableDeclaratorList = localVarDecl.children?.variableDeclaratorList?.[0];
    const variableDeclarator = variableDeclaratorList?.children?.variableDeclarator?.[0];
    const variableDeclaratorId = variableDeclarator?.children?.variableDeclaratorId?.[0];
    const varName = variableDeclaratorId?.children?.Identifier?.[0]?.image || 'unknown';

    // Extract initializer if present
    let initializer;
    const variableInitializer = variableDeclarator?.children?.variableInitializer?.[0];
    if (variableInitializer) {
      initializer = this.extractExpression(variableInitializer.children?.expression?.[0], filename);
    }

    return {
      type: 'VariableDeclaration',
      name: varName,
      typeAnnotation,
      initializer,
      modifiers: [],
      loc: this.extractLocation(localVarDecl, filename)
    };
  }

  /**
   * Extract return statement
   */
  private extractReturnStatement(returnStmt: any, filename: string): any {
    const expression = returnStmt.children?.expression?.[0];
    const argument = expression ? this.extractExpression(expression, filename) : null;

    return {
      type: 'ReturnStatement',
      argument,
      loc: this.extractLocation(returnStmt, filename)
    };
  }

  /**
   * Extract expression statement
   */
  private extractExpressionStatement(exprStmt: any, filename: string): any {
    const statementExpression = exprStmt.children?.statementExpression?.[0];
    const expression = this.extractExpression(statementExpression, filename);

    return {
      type: 'ExpressionStatement',
      expression,
      loc: this.extractLocation(exprStmt, filename)
    };
  }

  /**
   * Extract if statement
   */
  private extractIfStatement(ifStmt: any, filename: string): any {
    const expression = ifStmt.children?.expression?.[0];
    const test = this.extractExpression(expression, filename);

    const statement = ifStmt.children?.statement?.[0];
    const consequent = this.extractStatement({ children: { statement: [statement] } }, filename);

    let alternate = null;
    if (ifStmt.children?.Else) {
      const elseStatement = ifStmt.children?.statement?.[1];
      if (elseStatement) {
        alternate = this.extractStatement({ children: { statement: [elseStatement] } }, filename);
      }
    }

    return {
      type: 'IfStatement',
      test,
      consequent,
      alternate,
      loc: this.extractLocation(ifStmt, filename)
    };
  }

  /**
   * Extract while statement
   */
  private extractWhileStatement(whileStmt: any, filename: string): any {
    const expression = whileStmt.children?.expression?.[0];
    const test = this.extractExpression(expression, filename);

    const statement = whileStmt.children?.statement?.[0];
    const body = this.extractStatement({ children: { statement: [statement] } }, filename);

    return {
      type: 'WhileStatement',
      test,
      body,
      loc: this.extractLocation(whileStmt, filename)
    };
  }

  /**
   * Extract for statement
   */
  private extractForStatement(forStmt: any, filename: string): any {
    // Simplified for statement extraction
    return {
      type: 'ForStatement',
      init: null,
      test: null,
      update: null,
      body: { type: 'BlockStatement', body: [] },
      loc: this.extractLocation(forStmt, filename)
    };
  }

  /**
   * Extract expression
   */
  private extractExpression(expression: any, filename: string): any {
    if (!expression) {
      return { type: 'Identifier', name: 'unknown' };
    }

    // Primary expression
    const primary = expression.children?.primary?.[0];
    if (primary) {
      return this.extractPrimaryExpression(primary, filename);
    }

    // Binary expression (simplified)
    const binaryOp = expression.children?.binaryOperator?.[0];
    if (binaryOp) {
      return {
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Identifier', name: 'left' },
        right: { type: 'Identifier', name: 'right' },
        loc: this.extractLocation(expression, filename)
      };
    }

    return { type: 'Identifier', name: 'expr' };
  }

  /**
   * Extract primary expression
   */
  private extractPrimaryExpression(primary: any, filename: string): any {
    // Literal
    const literal = primary.children?.literal?.[0];
    if (literal) {
      return this.extractLiteral(literal, filename);
    }

    // this
    if (primary.children?.This) {
      return { type: 'ThisExpression', loc: this.extractLocation(primary, filename) };
    }

    // Identifier
    const identifier = primary.children?.Identifier?.[0];
    if (identifier) {
      return { type: 'Identifier', name: identifier.image, loc: this.extractLocation(primary, filename) };
    }

    // Field access (this.field)
    const fieldAccess = primary.children?.fieldAccess?.[0];
    if (fieldAccess) {
      return this.extractFieldAccess(fieldAccess, filename);
    }

    return { type: 'Identifier', name: 'unknown' };
  }

  /**
   * Extract field access expression
   */
  private extractFieldAccess(fieldAccess: any, filename: string): any {
    const identifier = fieldAccess.children?.Identifier?.[0];
    const property = identifier?.image || 'field';

    return {
      type: 'MemberExpression',
      object: { type: 'ThisExpression' },
      property: { type: 'Identifier', name: property },
      computed: false,
      loc: this.extractLocation(fieldAccess, filename)
    };
  }

  /**
   * Extract literal value
   */
  private extractLiteral(literal: any, filename: string): any {
    // Integer literal
    const intLiteral = literal.children?.integerLiteral?.[0];
    if (intLiteral) {
      const decimalLiteral = intLiteral.children?.DecimalLiteral?.[0];
      if (decimalLiteral) {
        return {
          type: 'Literal',
          value: parseInt(decimalLiteral.image, 10),
          raw: decimalLiteral.image,
          loc: this.extractLocation(literal, filename)
        };
      }
    }

    // String literal
    const stringLiteral = literal.children?.StringLiteral?.[0];
    if (stringLiteral) {
      const value = stringLiteral.image.slice(1, -1); // Remove quotes
      return {
        type: 'Literal',
        value,
        raw: stringLiteral.image,
        loc: this.extractLocation(literal, filename)
      };
    }

    // Boolean literal
    const booleanLiteral = literal.children?.booleanLiteral?.[0];
    if (booleanLiteral) {
      const value = booleanLiteral.children?.True ? true : false;
      return {
        type: 'Literal',
        value,
        raw: value.toString(),
        loc: this.extractLocation(literal, filename)
      };
    }

    // Null literal
    if (literal.children?.Null) {
      return {
        type: 'Literal',
        value: null,
        raw: 'null',
        loc: this.extractLocation(literal, filename)
      };
    }

    return {
      type: 'Literal',
      value: 0,
      raw: '0',
      loc: this.extractLocation(literal, filename)
    };
  }

  /**
   * Extract modifiers from CST
   */
  private extractModifiers(modifierNodes: any[]): string[] {
    const modifiers: string[] = [];
    
    for (const modNode of modifierNodes) {
      const children = modNode.children || {};
      for (const key of Object.keys(children)) {
        if (children[key]?.[0]?.image) {
          modifiers.push(children[key][0].image);
        }
      }
    }

    return modifiers;
  }

  /**
   * Extract source location from CST node
   */
  private extractLocation(node: any, filename: string): any {
    // Try to find location from first token
    let startLine = 1;
    let startColumn = 0;
    let endLine = 1;
    let endColumn = 0;

    // Recursively search for tokens with location info
    const findLocation = (obj: any): any => {
      if (!obj) return null;
      
      if (obj.startLine !== undefined) {
        return {
          startLine: obj.startLine,
          startColumn: obj.startColumn || 0,
          endLine: obj.endLine || obj.startLine,
          endColumn: obj.endColumn || 0
        };
      }

      if (obj.children) {
        for (const key of Object.keys(obj.children)) {
          const child = obj.children[key];
          if (Array.isArray(child)) {
            for (const item of child) {
              const loc = findLocation(item);
              if (loc) return loc;
            }
          }
        }
      }

      return null;
    };

    const loc = findLocation(node);
    if (loc) {
      startLine = loc.startLine;
      startColumn = loc.startColumn;
      endLine = loc.endLine;
      endColumn = loc.endColumn;
    }

    return {
      start: { line: startLine, column: startColumn },
      end: { line: endLine, column: endColumn },
      file: filename
    };
  }

  /**
   * Create a ParseError from an exception
   */
  private createParseError(error: any, filename: string): ParseError {
    // Extract line and column from error if available
    let line = 1;
    let column = 0;
    let message = error.message || 'Syntax error';
    
    // java-parser errors typically include location information
    if (error.token) {
      line = error.token.startLine || 1;
      column = error.token.startColumn || 0;
    }
    
    // Try to extract location from error message patterns
    const locationMatch = message.match(/line (\d+).*column (\d+)/i);
    if (locationMatch) {
      line = parseInt(locationMatch[1], 10);
      column = parseInt(locationMatch[2], 10);
    }
    
    return {
      message,
      line,
      column,
      file: filename
    };
  }
}
