// Configuration Manager implementation
import * as fs from 'fs';
import * as path from 'path';
import { TranslatorConfig } from './types';

export class ConfigurationManager {
  static load(filepath?: string): TranslatorConfig {
    if (!filepath) {
      return this.getDefault();
    }

    try {
      const absolutePath = path.resolve(filepath);
      
      if (!fs.existsSync(absolutePath)) {
        throw new Error(`Configuration file not found: ${filepath}`);
      }

      const fileContent = fs.readFileSync(absolutePath, 'utf-8');
      const parsedConfig = JSON.parse(fileContent);

      // Validate and merge with defaults
      return this.merge(this.getDefault(), parsedConfig);
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`Invalid JSON in configuration file: ${filepath}`);
      }
      throw error;
    }
  }

  static getDefault(): TranslatorConfig {
    return {
      format: {
        indentStyle: 'spaces',
        indentWidth: 2,
        lineEnding: 'lf'
      },
      translation: {
        preserveComments: true,
        strictTypeMapping: false,
        generateSourceMaps: false
      },
      validation: {
        enabled: true,
        strict: false
      },
      typeMapping: {}
    };
  }

  static merge(base: TranslatorConfig, override: Partial<TranslatorConfig>): TranslatorConfig {
    return {
      format: {
        ...base.format,
        ...(override.format || {})
      },
      translation: {
        ...base.translation,
        ...(override.translation || {})
      },
      validation: {
        ...base.validation,
        ...(override.validation || {})
      },
      typeMapping: {
        ...base.typeMapping,
        ...(override.typeMapping || {})
      }
    };
  }
}
