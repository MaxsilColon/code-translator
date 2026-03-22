// Base Transformer class
import { ASTNode } from '../ast';
import { TransformOptions, TransformResult } from './types';

export abstract class Transformer {
  abstract transform(ast: ASTNode, options: TransformOptions): TransformResult;
}
