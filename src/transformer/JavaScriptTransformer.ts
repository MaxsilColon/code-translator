// JavaScript Transformer implementation
import {
  ASTNode,
  ClassDeclaration,
  MethodDeclaration,
  TypeAnnotation,
  ProgramNode,
  VariableDeclaration,
  Modifier,
} from '../ast';
import { Transformer } from './Transformer';
import { TransformOptions, TransformResult, TransformWarning } from './types';
import { mapTypeAnnotation } from './TypeMapper';

export class JavaScriptTransformer extends Transformer {
  private warnings: TransformWarning[] = [];

  transform(ast: ASTNode, options: TransformOptions): TransformResult {
    this.warnings = [];
    const transformedAst = this.transformNode(ast, options);
    return {
      ast: transformedAst,
      warnings: this.warnings,
    };
  }

  private transformNode(node: ASTNode, options: TransformOptions): ASTNode {
    switch (node.type) {
      case 'Program':
        return this.transformProgram(node as ProgramNode, options);
      case 'ClassDeclaration':
        return this.transformClass(node as ClassDeclaration);
      case 'MethodDeclaration':
        return this.transformMethod(node as MethodDeclaration);
      case 'VariableDeclaration':
        return this.transformVariableDeclaration(node as VariableDeclaration);
      default:
        return node;
    }
  }

  private transformProgram(node: ProgramNode, options: TransformOptions): ProgramNode {
    return {
      ...node,
      body: node.body.map(decl => this.transformNode(decl, options) as any),
    };
  }

  private transformClass(node: ClassDeclaration): ClassDeclaration {
    // Transform class members
    const transformedMembers = node.members.map(member => {
      if (member.type === 'MethodDeclaration') {
        return this.transformMethod(member);
      } else if (member.type === 'VariableDeclaration') {
        return this.transformVariableDeclaration(member);
      }
      return member;
    });

    // Filter out Java-specific modifiers that don't apply to JavaScript
    const jsModifiers = this.filterModifiersForJS(node.modifiers);

    // Warn about unsupported features
    if (node.implements && node.implements.length > 0) {
      this.warnings.push({
        message: 'JavaScript does not have native interface implementation. Interfaces will be omitted.',
        node,
        suggestion: 'Consider using TypeScript for interface support, or document the expected interface in comments.',
      });
    }

    return {
      ...node,
      members: transformedMembers,
      modifiers: jsModifiers,
    };
  }

  private transformMethod(node: MethodDeclaration): MethodDeclaration {
    // Transform return type
    const transformedReturnType = this.transformType(node.returnType);

    // Transform parameters
    const transformedParameters = node.parameters.map(param => ({
      ...param,
      typeAnnotation: this.transformType(param.typeAnnotation),
    }));

    // Filter modifiers for JavaScript
    const jsModifiers = this.filterModifiersForJS(node.modifiers);

    // Warn about synchronized methods
    if (node.modifiers.includes('synchronized')) {
      this.warnings.push({
        message: `Method '${node.name}' is synchronized. JavaScript does not have built-in synchronization.`,
        node,
        suggestion: 'Consider using async/await patterns or mutex libraries for concurrency control.',
      });
    }

    return {
      ...node,
      returnType: transformedReturnType,
      parameters: transformedParameters,
      modifiers: jsModifiers,
    };
  }

  private transformVariableDeclaration(node: VariableDeclaration): VariableDeclaration {
    const transformedType = this.transformType(node.typeAnnotation);
    const jsModifiers = this.filterModifiersForJS(node.modifiers);

    // Warn about volatile or transient fields
    if (node.modifiers.includes('volatile')) {
      this.warnings.push({
        message: `Variable '${node.name}' is volatile. JavaScript does not have volatile semantics.`,
        node,
        suggestion: 'Consider using appropriate synchronization patterns if needed.',
      });
    }

    if (node.modifiers.includes('transient')) {
      this.warnings.push({
        message: `Variable '${node.name}' is transient. JavaScript does not have transient semantics.`,
        node,
        suggestion: 'Handle serialization manually if needed.',
      });
    }

    return {
      ...node,
      typeAnnotation: transformedType,
      modifiers: jsModifiers,
    };
  }

  private transformType(type: TypeAnnotation): TypeAnnotation {
    return mapTypeAnnotation(type, 'javascript');
  }

  private filterModifiersForJS(modifiers: Modifier[]): Modifier[] {
    // JavaScript supports: public, private, static
    // Filter out Java-specific modifiers
    const supportedModifiers: Modifier[] = ['public', 'private', 'static'];
    return modifiers.filter(mod => supportedModifiers.includes(mod));
  }
}
