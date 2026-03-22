// Parser types and interfaces
import { ASTNode } from '../ast';

export interface ParseResult {
  ast: ASTNode;
  errors: ParseError[];
  success: boolean;
}

export interface ParseError {
  message: string;
  line: number;
  column: number;
  file: string;
}
