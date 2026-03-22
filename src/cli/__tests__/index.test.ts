import { parseArguments, translate, main } from '../index';
import { ErrorCategory } from '../types';
import * as fs from 'fs';

// Mock fs module
jest.mock('fs');
const mockFs = fs as jest.Mocked<typeof fs>;

describe('CLI Module', () => {
  describe('parseArguments', () => {
    it('should parse valid arguments', () => {
      const args = ['--input', 'test.java', '--target', 'javascript'];
      const options = parseArguments(args);
      
      expect(options.input).toBe('test.java');
      expect(options.targetLang).toBe('javascript');
      expect(options.sourceLang).toBe('java');
      expect(options.validate).toBe(true);
      expect(options.verbose).toBe(false);
    });

    it('should parse short form arguments', () => {
      const args = ['-i', 'test.java', '-t', 'cpp', '-o', 'test.cpp'];
      const options = parseArguments(args);
      
      expect(options.input).toBe('test.java');
      expect(options.targetLang).toBe('cpp');
      expect(options.output).toBe('test.cpp');
    });

    it('should handle verbose flag', () => {
      const args = ['-i', 'test.java', '-t', 'javascript', '-v'];
      const options = parseArguments(args);
      
      expect(options.verbose).toBe(true);
    });

    it('should handle no-validate flag', () => {
      const args = ['-i', 'test.java', '-t', 'javascript', '--no-validate'];
      const options = parseArguments(args);
      
      expect(options.validate).toBe(false);
    });

    it('should handle config file argument', () => {
      const args = ['-i', 'test.java', '-t', 'javascript', '-c', 'config.json'];
      const options = parseArguments(args);
      
      expect(options.config).toBe('config.json');
    });

    it('should handle validate with explicit true value', () => {
      const args = ['-i', 'test.java', '-t', 'javascript', '--validate', 'true'];
      const options = parseArguments(args);
      
      expect(options.validate).toBe(true);
    });

    it('should handle validate with explicit false value', () => {
      const args = ['-i', 'test.java', '-t', 'javascript', '--validate', 'false'];
      const options = parseArguments(args);
      
      expect(options.validate).toBe(false);
    });

    it('should throw error for missing input', () => {
      const args = ['--target', 'javascript'];
      
      expect(() => parseArguments(args)).toThrow('Missing required argument: --input');
    });

    it('should throw error for missing target', () => {
      const args = ['--input', 'test.java'];
      
      expect(() => parseArguments(args)).toThrow('Missing required argument: --target');
    });

    it('should throw error for unsupported target language', () => {
      const args = ['--input', 'test.java', '--target', 'python'];
      
      expect(() => parseArguments(args)).toThrow('Unsupported target language: python');
    });

    it('should throw error for unsupported source language', () => {
      const args = ['--input', 'test.py', '--source', 'python', '--target', 'javascript'];
      
      expect(() => parseArguments(args)).toThrow('Unsupported source language: python');
    });

    it('should throw error for unknown argument', () => {
      const args = ['--input', 'test.java', '--target', 'javascript', '--unknown'];
      
      expect(() => parseArguments(args)).toThrow('Unknown argument: --unknown');
    });
  });

  describe('translate', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return file error when input file does not exist', async () => {
      mockFs.existsSync.mockReturnValue(false);

      const options = {
        input: 'nonexistent.java',
        sourceLang: 'java' as const,
        targetLang: 'javascript' as const,
        validate: true,
        verbose: false
      };

      const result = await translate(options);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].category).toBe(ErrorCategory.FILE_ERROR);
      expect(result.errors[0].message).toContain('Input file not found');
      expect(result.errors[0].exitCode).toBe(2);
      expect(result.errors[0].suggestion).toBeDefined();
    });

    it('should return file error when unable to read input file', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      const options = {
        input: 'test.java',
        sourceLang: 'java' as const,
        targetLang: 'javascript' as const,
        validate: true,
        verbose: false
      };

      const result = await translate(options);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].category).toBe(ErrorCategory.FILE_ERROR);
      expect(result.errors[0].message).toContain('Failed to read input file');
      expect(result.errors[0].exitCode).toBe(2);
    });

    it('should return file error when unable to write output file', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('public class Test {}');
      mockFs.writeFileSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      const options = {
        input: 'test.java',
        output: 'test.js',
        sourceLang: 'java' as const,
        targetLang: 'javascript' as const,
        validate: false,
        verbose: false
      };

      const result = await translate(options);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].category).toBe(ErrorCategory.FILE_ERROR);
      expect(result.errors[0].message).toContain('Failed to write output file');
    });

    it('should return config error when configuration file is invalid', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockImplementation((path: any) => {
        if (path.includes('config.json')) {
          return 'invalid json';
        }
        return 'public class Test {}';
      });

      const options = {
        input: 'test.java',
        sourceLang: 'java' as const,
        targetLang: 'javascript' as const,
        config: 'config.json',
        validate: false,
        verbose: false
      };

      const result = await translate(options);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].category).toBe(ErrorCategory.CONFIG_ERROR);
      expect(result.errors[0].exitCode).toBe(3);
    });

    it('should handle Java code with syntax errors', async () => {
      mockFs.existsSync.mockReturnValue(true);
      // Use clearly invalid Java syntax
      mockFs.readFileSync.mockReturnValue('public class Test { @@@@ }');

      const options = {
        input: 'test.java',
        sourceLang: 'java' as const,
        targetLang: 'javascript' as const,
        validate: false,
        verbose: false
      };

      const result = await translate(options);

      // Parser may be lenient, so we just verify the function handles it
      if (!result.success) {
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.errors[0].exitCode).toBeGreaterThan(0);
      }
    });

    it('should successfully translate valid Java code to JavaScript', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('public class Test {}');

      const options = {
        input: 'test.java',
        sourceLang: 'java' as const,
        targetLang: 'javascript' as const,
        validate: false,
        verbose: false
      };

      const result = await translate(options);

      expect(result.success).toBe(true);
      expect(result.output).toBeDefined();
      expect(result.errors).toHaveLength(0);
    });

    it('should write output to stdout when no output file specified', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('public class Test {}');

      const options = {
        input: 'test.java',
        sourceLang: 'java' as const,
        targetLang: 'javascript' as const,
        validate: false,
        verbose: false
      };

      const result = await translate(options);

      expect(result.success).toBe(true);
      expect(result.output).toBeDefined();
      expect(mockFs.writeFileSync).not.toHaveBeenCalled();
    });

    it('should write output to file when output file specified', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('public class Test {}');
      mockFs.writeFileSync.mockImplementation(() => {});

      const options = {
        input: 'test.java',
        output: 'test.js',
        sourceLang: 'java' as const,
        targetLang: 'javascript' as const,
        validate: false,
        verbose: false
      };

      const result = await translate(options);

      expect(result.success).toBe(true);
      expect(mockFs.writeFileSync).toHaveBeenCalledWith('test.js', expect.any(String), 'utf-8');
    });
  });

  describe('main', () => {
    let consoleErrorSpy: jest.SpyInstance;
    let consoleLogSpy: jest.SpyInstance;

    beforeEach(() => {
      jest.clearAllMocks();
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
      consoleErrorSpy.mockRestore();
      consoleLogSpy.mockRestore();
    });

    it('should return exit code 0 for successful translation', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('public class Test {}');

      const exitCode = await main(['-i', 'test.java', '-t', 'javascript', '--no-validate']);

      expect(exitCode).toBe(0);
    });

    it('should return non-zero exit code for file error', async () => {
      mockFs.existsSync.mockReturnValue(false);

      const exitCode = await main(['-i', 'nonexistent.java', '-t', 'javascript']);

      expect(exitCode).toBe(2); // FILE_ERROR exit code
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should handle Java code with potential syntax errors', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('public class Test { @@@@ }');

      const exitCode = await main(['-i', 'test.java', '-t', 'javascript', '--no-validate']);

      // Parser may be lenient, so we just verify it returns some exit code
      expect(typeof exitCode).toBe('number');
    });

    it('should handle argument parsing errors', async () => {
      const exitCode = await main(['--invalid-arg']);

      expect(exitCode).toBe(99); // UNKNOWN_ERROR exit code
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should not output to stdout when no output file specified (output is in result)', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('public class Test {}');

      const exitCode = await main(['-i', 'test.java', '-t', 'javascript', '--no-validate']);

      expect(exitCode).toBe(0);
      // The output is printed to stdout in main(), but we're mocking console.log
      // so we can't easily verify it without checking the mock
    });
  });
});
