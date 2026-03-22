#!/usr/bin/env node
// CLI entry point
import * as fs from 'fs';
import { CLIOptions, TranslationResult, TranslationError, ErrorCategory, ERROR_EXIT_CODES, ErrorLocation } from './types';
import { JavaParser } from '../parser';
import { JavaScriptTransformer, CppTransformer } from '../transformer';
import { JavaScriptGenerator, CppGenerator } from '../generator';
import { JavaScriptValidator, CppValidator } from '../validator';
import { ConfigurationManager } from '../config';
import { GeneratorOptions } from '../generator/types';
import { TransformOptions } from '../transformer/types';

function createError(
  category: ErrorCategory,
  message: string,
  location?: ErrorLocation,
  suggestion?: string
): TranslationError {
  return {
    category,
    message,
    location,
    suggestion,
    exitCode: ERROR_EXIT_CODES[category] || ERROR_EXIT_CODES.UNKNOWN_ERROR
  };
}

function formatError(error: TranslationError): string {
  let output = `ERROR [${error.category}]: ${error.message}`;
  
  if (error.location) {
    output += `\n  at ${error.location.file}:${error.location.line}:${error.location.column}`;
    
    if (error.location.snippet) {
      output += `\n\n${error.location.snippet}`;
    }
  }
  
  if (error.suggestion) {
    output += `\n\n  Suggestion: ${error.suggestion}`;
  }
  
  return output;
}

export function parseArguments(args: string[]): CLIOptions {
  const options: Partial<CLIOptions> = {
    sourceLang: 'java',
    validate: true,
    verbose: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--input':
      case '-i':
        options.input = args[++i];
        break;
      case '--output':
      case '-o':
        options.output = args[++i];
        break;
      case '--source':
      case '-s':
        if (args[i + 1] !== 'java') {
          throw new Error(`Unsupported source language: ${args[i + 1]}. Only 'java' is supported.`);
        }
        options.sourceLang = 'java';
        i++;
        break;
      case '--target':
      case '-t':
        const target = args[++i];
        if (target !== 'javascript' && target !== 'cpp') {
          throw new Error(`Unsupported target language: ${target}. Supported: javascript, cpp`);
        }
        options.targetLang = target;
        break;
      case '--config':
      case '-c':
        options.config = args[++i];
        break;
      case '--validate':
        options.validate = args[++i] === 'true';
        break;
      case '--no-validate':
        options.validate = false;
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  // Validate required arguments
  if (!options.input) {
    throw new Error('Missing required argument: --input');
  }
  if (!options.targetLang) {
    throw new Error('Missing required argument: --target');
  }

  return options as CLIOptions;
}

function printHelp(): void {
  console.log(`
Code Translator - Convert Java code to JavaScript or C++

Usage: code-translator [options]

Options:
  -i, --input <file>       Input Java source file (required)
  -o, --output <file>      Output file (optional, defaults to stdout)
  -s, --source <lang>      Source language (default: java)
  -t, --target <lang>      Target language: javascript, cpp (required)
  -c, --config <file>      Configuration file (optional)
  --validate <bool>        Validate generated code (default: true)
  --no-validate            Disable validation
  -v, --verbose            Enable verbose output
  -h, --help               Show this help message

Examples:
  code-translator -i Calculator.java -t javascript -o Calculator.js
  code-translator -i Main.java -t cpp -o Main.cpp --config config.json
  code-translator -i App.java -t javascript --no-validate

Exit Codes:
  0 - Success
  1 - Syntax error in source code
  2 - File error (not found, no permissions)
  3 - Configuration error
  4 - Translation error (unsupported construct)
  5 - Validation error in generated code
`);
}

export async function translate(options: CLIOptions): Promise<TranslationResult> {
  const result: TranslationResult = {
    success: false,
    errors: [],
    warnings: []
  };

  try {
    // Load configuration
    let config;
    try {
      config = options.config 
        ? ConfigurationManager.load(options.config)
        : ConfigurationManager.getDefault();

      if (options.verbose) {
        console.log('Configuration loaded:', JSON.stringify(config, null, 2));
      }
    } catch (error) {
      result.errors.push(createError(
        ErrorCategory.CONFIG_ERROR,
        `Failed to load configuration: ${error instanceof Error ? error.message : String(error)}`,
        undefined,
        'Check that the configuration file exists and is valid JSON'
      ));
      return result;
    }

    // Read input file
    if (!fs.existsSync(options.input)) {
      result.errors.push(createError(
        ErrorCategory.FILE_ERROR,
        `Input file not found: ${options.input}`,
        undefined,
        'Check that the file path is correct and the file exists'
      ));
      return result;
    }

    let sourceCode: string;
    try {
      sourceCode = fs.readFileSync(options.input, 'utf-8');
      if (options.verbose) {
        console.log(`Read ${sourceCode.length} characters from ${options.input}`);
      }
    } catch (error) {
      result.errors.push(createError(
        ErrorCategory.FILE_ERROR,
        `Failed to read input file: ${error instanceof Error ? error.message : String(error)}`,
        undefined,
        'Check that you have read permissions for the file'
      ));
      return result;
    }

    // Parse Java code
    const parser = new JavaParser();
    const parseResult = parser.parse(sourceCode, options.input);

    if (!parseResult.success || parseResult.errors.length > 0) {
      result.errors.push(...parseResult.errors.map(e => {
        // Extract code snippet around error location
        const lines = sourceCode.split('\n');
        const errorLine = e.line - 1;
        const snippet = lines.slice(Math.max(0, errorLine - 1), Math.min(lines.length, errorLine + 2))
          .map((line, idx) => {
            const lineNum = errorLine - 1 + idx + 1;
            const prefix = lineNum === e.line ? '>' : ' ';
            return `  ${prefix} ${lineNum.toString().padStart(3)} | ${line}`;
          })
          .join('\n');

        return createError(
          ErrorCategory.SYNTAX_ERROR,
          e.message,
          {
            file: e.file,
            line: e.line,
            column: e.column,
            snippet
          },
          'Fix the syntax error in the source code'
        );
      }));
      return result;
    }

    if (options.verbose) {
      console.log('Parsing completed successfully');
    }

    // Transform AST
    const transformOptions: TransformOptions = {
      targetLang: options.targetLang,
      preserveComments: config.translation.preserveComments,
      typeMapping: 'strict'
    };

    const transformer = options.targetLang === 'javascript' 
      ? new JavaScriptTransformer()
      : new CppTransformer();

    let transformResult;
    try {
      transformResult = transformer.transform(parseResult.ast, transformOptions);

      if (transformResult.warnings.length > 0) {
        result.warnings.push(...transformResult.warnings.map(w => 
          `Warning: ${w.message}${w.suggestion ? ` (Suggestion: ${w.suggestion})` : ''}`
        ));
      }

      if (options.verbose) {
        console.log('Transformation completed');
        if (transformResult.warnings.length > 0) {
          console.log(`Warnings: ${transformResult.warnings.length}`);
        }
      }
    } catch (error) {
      result.errors.push(createError(
        ErrorCategory.TRANSLATION_ERROR,
        `Transformation failed: ${error instanceof Error ? error.message : String(error)}`,
        undefined,
        'The source code may contain constructs that are not supported for translation'
      ));
      return result;
    }

    // Generate code
    const generatorOptions: GeneratorOptions = {
      indentStyle: config.format.indentStyle,
      indentWidth: config.format.indentWidth,
      lineEnding: config.format.lineEnding,
      preserveComments: config.translation.preserveComments
    };

    const generator = options.targetLang === 'javascript'
      ? new JavaScriptGenerator()
      : new CppGenerator();

    let generateResult;
    try {
      generateResult = generator.generate(transformResult.ast, generatorOptions);

      if (options.verbose) {
        console.log('Code generation completed');
        console.log(`Generated ${generateResult.code.length} characters`);
      }
    } catch (error) {
      result.errors.push(createError(
        ErrorCategory.TRANSLATION_ERROR,
        `Code generation failed: ${error instanceof Error ? error.message : String(error)}`,
        undefined,
        'The transformed AST may contain invalid structures'
      ));
      return result;
    }

    // Validate generated code (if enabled)
    if (options.validate !== false && config.validation.enabled) {
      const validator = options.targetLang === 'javascript'
        ? new JavaScriptValidator()
        : new CppValidator();

      const validationResult = validator.validate(generateResult.code);

      if (!validationResult.valid) {
        result.errors.push(...validationResult.errors.map(e => {
          // Extract code snippet around error location
          const lines = generateResult.code.split('\n');
          const errorLine = e.line - 1;
          const snippet = lines.slice(Math.max(0, errorLine - 1), Math.min(lines.length, errorLine + 2))
            .map((line, idx) => {
              const lineNum = errorLine - 1 + idx + 1;
              const prefix = lineNum === e.line ? '>' : ' ';
              return `  ${prefix} ${lineNum.toString().padStart(3)} | ${line}`;
            })
            .join('\n');

          return createError(
            ErrorCategory.VALIDATION_ERROR,
            e.message,
            {
              file: options.output || '<stdout>',
              line: e.line,
              column: e.column,
              snippet
            },
            'The generated code contains syntax errors. This may be a bug in the translator.'
          );
        }));
        return result;
      }

      if (options.verbose) {
        console.log('Validation passed');
      }
    }

    // Write output
    result.output = generateResult.code;
    
    if (options.output) {
      try {
        fs.writeFileSync(options.output, generateResult.code, 'utf-8');
        if (options.verbose) {
          console.log(`Output written to ${options.output}`);
        }
      } catch (error) {
        result.errors.push(createError(
          ErrorCategory.FILE_ERROR,
          `Failed to write output file: ${error instanceof Error ? error.message : String(error)}`,
          undefined,
          'Check that you have write permissions for the output directory'
        ));
        return result;
      }
    }

    result.success = true;
    return result;

  } catch (error) {
    result.errors.push(createError(
      ErrorCategory.TRANSLATION_ERROR,
      error instanceof Error ? error.message : String(error)
    ));
    return result;
  }
}

export async function main(args: string[]): Promise<number> {
  try {
    const options = parseArguments(args);
    
    if (options.verbose) {
      console.log('Starting translation with options:', options);
    }

    const result = await translate(options);

    // Print warnings
    if (result.warnings.length > 0) {
      result.warnings.forEach(w => console.warn(w));
    }

    // Print errors with formatting
    if (result.errors.length > 0) {
      result.errors.forEach(e => console.error(formatError(e)));
      // Return the exit code of the first error
      return result.errors[0].exitCode;
    }

    // Print output to stdout if no output file specified
    if (!options.output && result.output) {
      console.log(result.output);
    }

    if (options.verbose) {
      console.log('Translation completed successfully');
    }

    return ERROR_EXIT_CODES.SUCCESS;

  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : String(error));
    return ERROR_EXIT_CODES.UNKNOWN_ERROR;
  }
}

// Run CLI if executed directly
if (require.main === module) {
  main(process.argv.slice(2))
    .then(exitCode => process.exit(exitCode))
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(ERROR_EXIT_CODES.UNKNOWN_ERROR);
    });
}
