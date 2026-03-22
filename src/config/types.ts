// Configuration types and interfaces
export interface TranslatorConfig {
  format: {
    indentStyle: 'spaces' | 'tabs';
    indentWidth: number;
    lineEnding: 'lf' | 'crlf';
  };
  translation: {
    preserveComments: boolean;
    strictTypeMapping: boolean;
    generateSourceMaps: boolean;
  };
  validation: {
    enabled: boolean;
    strict: boolean;
  };
  typeMapping: {
    [javaType: string]: {
      javascript?: string;
      cpp?: string;
    };
  };
}
