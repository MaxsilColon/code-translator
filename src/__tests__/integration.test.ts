// Integration tests for the complete translation pipeline
import { JavaParser } from '../parser';
import { JavaScriptTransformer, CppTransformer } from '../transformer';
import { JavaScriptGenerator, CppGenerator } from '../generator';
import { JavaScriptValidator, CppValidator } from '../validator';
import { ConfigurationManager } from '../config';

describe('End-to-End Integration Tests', () => {
  const simpleJavaClass = `
public class Calculator {
  private int value;
  
  public Calculator(int value) {
    this.value = value;
  }
  
  public int getValue() {
    return value;
  }
  
  public int add(int x) {
    return value + x;
  }
}
`.trim();

  describe('Java to JavaScript translation', () => {
    it('should translate a simple Java class to JavaScript', () => {
      // Parse
      const parser = new JavaParser();
      const parseResult = parser.parse(simpleJavaClass, 'Calculator.java');
      
      expect(parseResult.success).toBe(true);
      expect(parseResult.errors).toHaveLength(0);
      expect(parseResult.ast).toBeDefined();
      expect(parseResult.ast.type).toBe('Program');
      
      // Transform
      const transformer = new JavaScriptTransformer();
      const transformResult = transformer.transform(parseResult.ast, {
        targetLang: 'javascript',
        preserveComments: true,
        typeMapping: 'strict'
      });
      
      expect(transformResult.ast).toBeDefined();
      
      // Generate
      const generator = new JavaScriptGenerator();
      const config = ConfigurationManager.getDefault();
      const generateResult = generator.generate(transformResult.ast, {
        indentStyle: config.format.indentStyle,
        indentWidth: config.format.indentWidth,
        lineEnding: config.format.lineEnding,
        preserveComments: config.translation.preserveComments
      });
      
      expect(generateResult.code).toBeTruthy();
      expect(generateResult.code.length).toBeGreaterThan(0);
      expect(generateResult.code).toContain('class Calculator');
      expect(generateResult.code).toContain('getValue()');
      expect(generateResult.code).toContain('add(');
      
      // Validate
      const validator = new JavaScriptValidator();
      const validationResult = validator.validate(generateResult.code);
      
      if (!validationResult.valid) {
        console.log('Generated code:', generateResult.code);
        console.log('Validation errors:', validationResult.errors);
      }
      
      expect(validationResult.valid).toBe(true);
      expect(validationResult.errors).toHaveLength(0);
    });
  });

  describe('Java to C++ translation', () => {
    it('should translate a simple Java class to C++', () => {
      // Parse
      const parser = new JavaParser();
      const parseResult = parser.parse(simpleJavaClass, 'Calculator.java');
      
      expect(parseResult.success).toBe(true);
      expect(parseResult.errors).toHaveLength(0);
      
      // Transform
      const transformer = new CppTransformer();
      const transformResult = transformer.transform(parseResult.ast, {
        targetLang: 'cpp',
        preserveComments: true,
        typeMapping: 'strict'
      });
      
      expect(transformResult.ast).toBeDefined();
      
      // Generate
      const generator = new CppGenerator();
      const config = ConfigurationManager.getDefault();
      const generateResult = generator.generate(transformResult.ast, {
        indentStyle: config.format.indentStyle,
        indentWidth: config.format.indentWidth,
        lineEnding: config.format.lineEnding,
        preserveComments: config.translation.preserveComments
      });
      
      expect(generateResult.code).toBeTruthy();
      expect(generateResult.code.length).toBeGreaterThan(0);
      expect(generateResult.code).toContain('class Calculator');
      expect(generateResult.code).toContain('getValue()');
      expect(generateResult.code).toContain('add(');
      
      // Validate
      const validator = new CppValidator();
      const validationResult = validator.validate(generateResult.code);
      
      expect(validationResult.valid).toBe(true);
    });
  });

  describe('Error handling integration', () => {
    it('should handle syntax errors gracefully', () => {
      const invalidJava = 'public class Invalid { invalid syntax }';
      
      const parser = new JavaParser();
      const parseResult = parser.parse(invalidJava, 'Invalid.java');
      
      expect(parseResult.success).toBe(false);
      expect(parseResult.errors.length).toBeGreaterThan(0);
      expect(parseResult.errors[0].message).toBeTruthy();
      expect(parseResult.errors[0].line).toBeGreaterThan(0);
    });
  });
});
