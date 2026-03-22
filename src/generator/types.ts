// Generator types and interfaces
export interface GeneratorOptions {
  indentStyle: 'spaces' | 'tabs';
  indentWidth: number;
  lineEnding: 'lf' | 'crlf';
  preserveComments: boolean;
}

export interface GenerateResult {
  code: string;
  sourceMap?: SourceMap;
}

export interface SourceMap {
  version: number;
  sources: string[];
  mappings: string;
}
