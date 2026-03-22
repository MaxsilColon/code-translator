// Base CodeGenerator class
import { ASTNode } from '../ast';
import { GeneratorOptions, GenerateResult } from './types';

export abstract class CodeGenerator {
  abstract generate(ast: ASTNode, options: GeneratorOptions): GenerateResult;
}
