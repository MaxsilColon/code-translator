import * as fs from 'fs';
import * as path from 'path';
import { ConfigurationManager } from '../ConfigurationManager';
import { TranslatorConfig } from '../types';

describe('ConfigurationManager', () => {
  const testConfigDir = path.join(__dirname, 'test-configs');
  
  beforeAll(() => {
    // Create test config directory
    if (!fs.existsSync(testConfigDir)) {
      fs.mkdirSync(testConfigDir, { recursive: true });
    }
  });

  afterAll(() => {
    // Clean up test config directory
    if (fs.existsSync(testConfigDir)) {
      fs.rmSync(testConfigDir, { recursive: true, force: true });
    }
  });

  describe('getDefault', () => {
    it('should return default configuration with reasonable values', () => {
      const config = ConfigurationManager.getDefault();

      expect(config.format.indentStyle).toBe('spaces');
      expect(config.format.indentWidth).toBe(2);
      expect(config.format.lineEnding).toBe('lf');
      expect(config.translation.preserveComments).toBe(true);
      expect(config.translation.strictTypeMapping).toBe(false);
      expect(config.translation.generateSourceMaps).toBe(false);
      expect(config.validation.enabled).toBe(true);
      expect(config.validation.strict).toBe(false);
      expect(config.typeMapping).toEqual({});
    });
  });

  describe('load', () => {
    it('should load valid configuration from file', () => {
      const configPath = path.join(testConfigDir, 'valid-config.json');
      const configData = {
        format: {
          indentStyle: 'tabs',
          indentWidth: 4
        },
        translation: {
          preserveComments: false
        }
      };

      fs.writeFileSync(configPath, JSON.stringify(configData, null, 2));

      const config = ConfigurationManager.load(configPath);

      expect(config.format.indentStyle).toBe('tabs');
      expect(config.format.indentWidth).toBe(4);
      expect(config.translation.preserveComments).toBe(false);
      // Should merge with defaults
      expect(config.format.lineEnding).toBe('lf');
      expect(config.validation.enabled).toBe(true);
    });

    it('should return default configuration when no filepath provided', () => {
      const config = ConfigurationManager.load();
      const defaultConfig = ConfigurationManager.getDefault();

      expect(config).toEqual(defaultConfig);
    });

    it('should throw error when configuration file not found', () => {
      const nonExistentPath = path.join(testConfigDir, 'non-existent.json');

      expect(() => {
        ConfigurationManager.load(nonExistentPath);
      }).toThrow(/Configuration file not found/);
    });

    it('should throw error when configuration file contains invalid JSON', () => {
      const invalidConfigPath = path.join(testConfigDir, 'invalid-config.json');
      fs.writeFileSync(invalidConfigPath, '{ invalid json }');

      expect(() => {
        ConfigurationManager.load(invalidConfigPath);
      }).toThrow(/Invalid JSON in configuration file/);
    });

    it('should load configuration with custom type mappings', () => {
      const configPath = path.join(testConfigDir, 'custom-types.json');
      const configData = {
        typeMapping: {
          'CustomType': {
            javascript: 'CustomJSType',
            cpp: 'CustomCppType'
          }
        }
      };

      fs.writeFileSync(configPath, JSON.stringify(configData, null, 2));

      const config = ConfigurationManager.load(configPath);

      expect(config.typeMapping['CustomType']).toEqual({
        javascript: 'CustomJSType',
        cpp: 'CustomCppType'
      });
    });
  });

  describe('merge', () => {
    it('should merge partial configuration with base configuration', () => {
      const base = ConfigurationManager.getDefault();
      const override: Partial<TranslatorConfig> = {
        format: {
          indentStyle: 'tabs',
          indentWidth: 4,
          lineEnding: 'crlf'
        }
      };

      const merged = ConfigurationManager.merge(base, override);

      expect(merged.format.indentStyle).toBe('tabs');
      expect(merged.format.indentWidth).toBe(4);
      expect(merged.format.lineEnding).toBe('crlf');
      // Other sections should remain from base
      expect(merged.translation).toEqual(base.translation);
      expect(merged.validation).toEqual(base.validation);
    });

    it('should handle empty override', () => {
      const base = ConfigurationManager.getDefault();
      const merged = ConfigurationManager.merge(base, {});

      expect(merged).toEqual(base);
    });

    it('should merge nested properties correctly', () => {
      const base = ConfigurationManager.getDefault();
      const override: Partial<TranslatorConfig> = {
        translation: {
          preserveComments: false,
          strictTypeMapping: true,
          generateSourceMaps: true
        }
      };

      const merged = ConfigurationManager.merge(base, override);

      expect(merged.translation.preserveComments).toBe(false);
      expect(merged.translation.strictTypeMapping).toBe(true);
      expect(merged.translation.generateSourceMaps).toBe(true);
      // Other sections should remain from base
      expect(merged.format).toEqual(base.format);
    });

    it('should merge type mappings', () => {
      const base = ConfigurationManager.getDefault();
      base.typeMapping = {
        'Type1': { javascript: 'JSType1' }
      };

      const override: Partial<TranslatorConfig> = {
        typeMapping: {
          'Type2': { cpp: 'CppType2' }
        }
      };

      const merged = ConfigurationManager.merge(base, override);

      expect(merged.typeMapping['Type1']).toEqual({ javascript: 'JSType1' });
      expect(merged.typeMapping['Type2']).toEqual({ cpp: 'CppType2' });
    });
  });
});
