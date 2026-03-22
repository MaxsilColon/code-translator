// C++ Transformer implementation
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

export class CppTransformer extends Transformer {
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

    // Map Java modifiers to C++ equivalents
    const cppModifiers = this.mapModifiersForCpp(node.modifiers);

    // Warn about features that need special handling in C++
    if (node.implements && node.implements.length > 0) {
      this.warnings.push({
        message: 'C++ uses multiple inheritance for interface implementation. Ensure proper virtual destructors.',
        node,
        suggestion: 'Implement interfaces as abstract base classes with pure virtual functions.',
      });
    }

    return {
      ...node,
      members: transformedMembers,
      modifiers: cppModifiers,
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

    // Map modifiers for C++
    const cppModifiers = this.mapModifiersForCpp(node.modifiers);

    // Warn about synchronized methods
    if (node.modifiers.includes('synchronized')) {
      this.warnings.push({
        message: `Method '${node.name}' is synchronized. C++ requires explicit mutex usage.`,
        node,
        suggestion: 'Use std::mutex and std::lock_guard for thread synchronization.',
      });
    }

    // Warn about native methods
    if (node.modifiers.includes('native')) {
      this.warnings.push({
        message: `Method '${node.name}' is native. This requires platform-specific implementation.`,
        node,
        suggestion: 'Implement the method body with appropriate platform-specific code.',
      });
    }

    return {
      ...node,
      returnType: transformedReturnType,
      parameters: transformedParameters,
      modifiers: cppModifiers,
    };
  }

  private transformVariableDeclaration(node: VariableDeclaration): VariableDeclaration {
    const transformedType = this.transformType(node.typeAnnotation);
    const cppModifiers = this.mapModifiersForCpp(node.modifiers);

    // Warn about volatile fields
    if (node.modifiers.includes('volatile')) {
      this.warnings.push({
        message: `Variable '${node.name}' is volatile. C++ volatile has different semantics than Java.`,
        node,
        suggestion: 'Use std::atomic for thread-safe operations instead of volatile.',
      });
    }

    // Warn about transient fields
    if (node.modifiers.includes('transient')) {
      this.warnings.push({
        message: `Variable '${node.name}' is transient. C++ does not have built-in serialization.`,
        node,
        suggestion: 'Handle serialization manually using appropriate libraries.',
      });
    }

    return {
      ...node,
      typeAnnotation: transformedType,
      modifiers: cppModifiers,
    };
  }

  private transformType(type: TypeAnnotation): TypeAnnotation {
    return mapTypeAnnotation(type, 'cpp');
  }

  private mapModifiersForCpp(modifiers: Modifier[]): Modifier[] {
    // C++ supports: public, private, protected, static
    // final -> const (handled in code generation)
    // abstract -> pure virtual (handled in code generation)
    const supportedModifiers: Modifier[] = ['public', 'private', 'protected', 'static', 'final', 'abstract'];
    return modifiers.filter(mod => supportedModifiers.includes(mod));
  }
}
