// Transformer types and interfaces
import { ASTNode } from '../ast';

export interface TransformOptions {
  targetLang: 'javascript' | 'cpp';
  preserveComments: boolean;
  typeMapping: TypeMappingStrategy;
}

export interface TransformResult {
  ast: ASTNode;
  warnings: TransformWarning[];
}

export interface TransformWarning {
  message: string;
  node: ASTNode;
  suggestion?: string;
}

export type TypeMappingStrategy = 'strict' | 'loose';
