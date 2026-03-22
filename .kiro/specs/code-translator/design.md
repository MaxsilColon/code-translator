# Documento de Diseño Técnico: Traductor de Código

## Visión General

El Traductor de Código es un sistema de transpilación que convierte código fuente de Java a JavaScript o C++. El sistema utiliza una arquitectura de tres fases: análisis sintáctico (parsing), transformación mediante AST (Abstract Syntax Tree), y generación de código. Esta arquitectura permite separar las preocupaciones de análisis del lenguaje origen, representación intermedia, y generación del lenguaje destino.

El sistema está implementado en Node.js con TypeScript para aprovechar el tipado estático y el ecosistema de herramientas de JavaScript. La arquitectura modular permite extender el sistema para soportar lenguajes adicionales en el futuro.

### Objetivos de Diseño

1. **Corrección**: El código generado debe ser funcionalmente equivalente al código original
2. **Legibilidad**: El código generado debe seguir las convenciones idiomáticas del lenguaje destino
3. **Extensibilidad**: La arquitectura debe permitir agregar nuevos lenguajes origen y destino
4. **Mantenibilidad**: El código debe ser claro, bien documentado y fácil de modificar
5. **Robustez**: El sistema debe manejar errores gracefully y proporcionar mensajes útiles

## Arquitectura

### Arquitectura de Alto Nivel

El sistema sigue una arquitectura de pipeline de tres fases:

```
Código Fuente (Java)
        ↓
    [Parser]
        ↓
      [AST]
        ↓
  [Transformer]
        ↓
   [AST Destino]
        ↓
   [Generator]
        ↓
Código Destino (JS/C++)
```

### Componentes Principales

1. **CLI (Command Line Interface)**: Punto de entrada del sistema, maneja argumentos y orquesta el proceso
2. **Parser**: Analiza el código Java y construye el AST
3. **AST (Abstract Syntax Tree)**: Representación intermedia independiente del lenguaje
4. **Transformer**: Transforma el AST para adaptarlo al lenguaje destino
5. **Generator**: Genera código en el lenguaje destino a partir del AST
6. **Validator**: Valida la sintaxis del código generado
7. **Configuration Manager**: Maneja la configuración del sistema

### Flujo de Datos

1. El usuario invoca el CLI con archivo fuente, lenguaje origen y destino
2. El Configuration Manager carga la configuración (si existe)
3. El Parser lee el archivo y genera el AST
4. El Transformer adapta el AST al lenguaje destino
5. El Generator produce el código destino
6. El Validator verifica la sintaxis del código generado (opcional)
7. El resultado se escribe al archivo de salida o stdout

## Componentes e Interfaces

### 1. CLI Module

**Responsabilidad**: Interfaz de línea de comandos y orquestación del proceso de traducción.

**Interfaz**:
```typescript
interface CLIOptions {
  input: string;           // Archivo de entrada
  output?: string;         // Archivo de salida (opcional)
  sourceLang: 'java';      // Lenguaje origen
  targetLang: 'javascript' | 'cpp';  // Lenguaje destino
  config?: string;         // Archivo de configuración (opcional)
  validate?: boolean;      // Validar código generado (default: true)
  verbose?: boolean;       // Modo verbose para debugging
}

function main(args: string[]): Promise<number>;
function parseArguments(args: string[]): CLIOptions;
function translate(options: CLIOptions): Promise<TranslationResult>;
```

### 2. Parser Module

**Responsabilidad**: Análisis sintáctico del código Java y construcción del AST.

**Interfaz**:
```typescript
interface ParseResult {
  ast: ASTNode;
  errors: ParseError[];
  success: boolean;
}

interface ParseError {
  message: string;
  line: number;
  column: number;
  file: string;
}

class JavaParser {
  parse(source: string, filename: string): ParseResult;
  parseFile(filepath: string): ParseResult;
}
```

**Implementación**: Utilizaremos la biblioteca `java-parser` de Chevrotain o `@java-ast/parser` para el análisis sintáctico de Java.

### 3. AST Module

**Responsabilidad**: Definición de la estructura del AST y operaciones sobre él.

**Interfaz**:
```typescript
type ASTNode = 
  | ProgramNode
  | ClassDeclaration
  | MethodDeclaration
  | VariableDeclaration
  | Statement
  | Expression;

interface ASTNodeBase {
  type: string;
  loc?: SourceLocation;
  comments?: Comment[];
}

interface SourceLocation {
  start: { line: number; column: number };
  end: { line: number; column: number };
  file: string;
}

interface ProgramNode extends ASTNodeBase {
  type: 'Program';
  body: Declaration[];
  imports: ImportDeclaration[];
}

interface ClassDeclaration extends ASTNodeBase {
  type: 'ClassDeclaration';
  name: string;
  superClass?: string;
  implements?: string[];
  members: ClassMember[];
  modifiers: Modifier[];
}

interface MethodDeclaration extends ASTNodeBase {
  type: 'MethodDeclaration';
  name: string;
  parameters: Parameter[];
  returnType: TypeAnnotation;
  body: BlockStatement;
  modifiers: Modifier[];
}

interface VariableDeclaration extends ASTNodeBase {
  type: 'VariableDeclaration';
  name: string;
  typeAnnotation: TypeAnnotation;
  initializer?: Expression;
  modifiers: Modifier[];
}

// Tipos de datos
interface TypeAnnotation {
  name: string;
  primitive: boolean;
  nullable: boolean;
  generic?: TypeAnnotation[];
}

// Expresiones
type Expression =
  | Identifier
  | Literal
  | BinaryExpression
  | UnaryExpression
  | CallExpression
  | MemberExpression
  | ArrayExpression
  | ObjectExpression;

// Statements
type Statement =
  | BlockStatement
  | IfStatement
  | ForStatement
  | WhileStatement
  | DoWhileStatement
  | SwitchStatement
  | TryStatement
  | ReturnStatement
  | ThrowStatement
  | ExpressionStatement;

interface Comment {
  type: 'LineComment' | 'BlockComment';
  value: string;
  loc: SourceLocation;
}
```

### 4. Transformer Module

**Responsabilidad**: Transformar el AST para adaptarlo al lenguaje destino.

**Interfaz**:
```typescript
interface TransformOptions {
  targetLang: 'javascript' | 'cpp';
  preserveComments: boolean;
  typeMapping: TypeMappingStrategy;
}

interface TransformResult {
  ast: ASTNode;
  warnings: TransformWarning[];
}

interface TransformWarning {
  message: string;
  node: ASTNode;
  suggestion?: string;
}

abstract class Transformer {
  abstract transform(ast: ASTNode, options: TransformOptions): TransformResult;
}

class JavaScriptTransformer extends Transformer {
  transform(ast: ASTNode, options: TransformOptions): TransformResult;
  private transformClass(node: ClassDeclaration): ASTNode;
  private transformMethod(node: MethodDeclaration): ASTNode;
  private transformType(type: TypeAnnotation): TypeAnnotation;
}

class CppTransformer extends Transformer {
  transform(ast: ASTNode, options: TransformOptions): TransformResult;
  private transformClass(node: ClassDeclaration): ASTNode;
  private transformMethod(node: MethodDeclaration): ASTNode;
  private transformType(type: TypeAnnotation): TypeAnnotation;
}
```

### 5. Generator Module

**Responsabilidad**: Generar código en el lenguaje destino a partir del AST.

**Interfaz**:
```typescript
interface GeneratorOptions {
  indentStyle: 'spaces' | 'tabs';
  indentWidth: number;
  lineEnding: 'lf' | 'crlf';
  preserveComments: boolean;
}

interface GenerateResult {
  code: string;
  sourceMap?: SourceMap;
}

abstract class CodeGenerator {
  abstract generate(ast: ASTNode, options: GeneratorOptions): GenerateResult;
}

class JavaScriptGenerator extends CodeGenerator {
  generate(ast: ASTNode, options: GeneratorOptions): GenerateResult;
  private generateClass(node: ClassDeclaration): string;
  private generateMethod(node: MethodDeclaration): string;
  private generateStatement(node: Statement): string;
  private generateExpression(node: Expression): string;
}

class CppGenerator extends CodeGenerator {
  generate(ast: ASTNode, options: GeneratorOptions): GenerateResult;
  private generateClass(node: ClassDeclaration): string;
  private generateMethod(node: MethodDeclaration): string;
  private generateStatement(node: Statement): string;
  private generateExpression(node: Expression): string;
}
```

### 6. Validator Module

**Responsabilidad**: Validar la sintaxis del código generado.

**Interfaz**:
```typescript
interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

interface ValidationError {
  message: string;
  line: number;
  column: number;
}

abstract class CodeValidator {
  abstract validate(code: string): ValidationResult;
}

class JavaScriptValidator extends CodeValidator {
  validate(code: string): ValidationResult;
}

class CppValidator extends CodeValidator {
  validate(code: string): ValidationResult;
}
```

**Implementación**: 
- Para JavaScript: usar `@babel/parser` o `acorn` para validar sintaxis
- Para C++: usar `clang-format` o validación básica de sintaxis

### 7. Configuration Manager

**Responsabilidad**: Cargar y gestionar la configuración del traductor.

**Interfaz**:
```typescript
interface TranslatorConfig {
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

class ConfigurationManager {
  static load(filepath?: string): TranslatorConfig;
  static getDefault(): TranslatorConfig;
  static merge(base: TranslatorConfig, override: Partial<TranslatorConfig>): TranslatorConfig;
}
```

## Modelos de Datos

### Mapeo de Tipos

El sistema mantiene tablas de mapeo de tipos entre Java y los lenguajes destino:

**Java → JavaScript**:
```typescript
const JAVA_TO_JS_TYPES: Record<string, string> = {
  'int': 'number',
  'long': 'number',
  'float': 'number',
  'double': 'number',
  'boolean': 'boolean',
  'char': 'string',
  'String': 'string',
  'void': 'void',
  'Object': 'any',
  'List': 'Array',
  'ArrayList': 'Array',
  'Map': 'Map',
  'HashMap': 'Map',
  'Set': 'Set',
  'HashSet': 'Set',
};
```

**Java → C++**:
```typescript
const JAVA_TO_CPP_TYPES: Record<string, string> = {
  'int': 'int',
  'long': 'long',
  'float': 'float',
  'double': 'double',
  'boolean': 'bool',
  'char': 'char',
  'String': 'std::string',
  'void': 'void',
  'Object': 'void*',
  'List': 'std::vector',
  'ArrayList': 'std::vector',
  'Map': 'std::map',
  'HashMap': 'std::unordered_map',
  'Set': 'std::set',
  'HashSet': 'std::unordered_set',
};
```

### Mapeo de Estructuras de Control

**Bucles**:
- Java `for (int i = 0; i < n; i++)` → JS `for (let i = 0; i < n; i++)`
- Java `for (Type item : collection)` → JS `for (const item of collection)`
- Java `while (condition)` → JS/C++ `while (condition)` (directo)

**Condicionales**:
- Java `if/else` → JS/C++ `if/else` (directo)
- Java `switch` → JS `switch` (directo), C++ `switch` (directo)

**Manejo de Excepciones**:
- Java `try-catch-finally` → JS `try-catch-finally` (directo)
- Java `try-catch-finally` → C++ `try-catch` (finally requiere emulación)

### Estructura de Archivos de Configuración

```json
{
  "format": {
    "indentStyle": "spaces",
    "indentWidth": 2,
    "lineEnding": "lf"
  },
  "translation": {
    "preserveComments": true,
    "strictTypeMapping": false,
    "generateSourceMaps": false
  },
  "validation": {
    "enabled": true,
    "strict": false
  },
  "typeMapping": {
    "CustomType": {
      "javascript": "CustomJSType",
      "cpp": "CustomCppType"
    }
  }
}
```


## Propiedades de Corrección

*Una propiedad es una característica o comportamiento que debe ser verdadero en todas las ejecuciones válidas de un sistema - esencialmente, una declaración formal sobre lo que el sistema debe hacer. Las propiedades sirven como puente entre las especificaciones legibles por humanos y las garantías de corrección verificables por máquinas.*

### Propiedad 1: Round-trip de Parsing

*Para cualquier* código Java sintácticamente válido, parsearlo para obtener un AST, imprimirlo de vuelta a código Java, y parsearlo nuevamente debe producir un AST estructuralmente equivalente al original.

**Valida: Requisitos 2.1, 2.4, 2.5**

### Propiedad 2: Errores de Sintaxis Incluyen Ubicación

*Para cualquier* código Java con errores de sintaxis, el parser debe retornar un mensaje de error que incluya el número de línea y columna donde ocurrió el error.

**Valida: Requisitos 2.2, 6.3**

### Propiedad 3: Código Generado es Sintácticamente Válido

*Para cualquier* AST válido y lenguaje destino (JavaScript o C++), el código generado debe ser sintácticamente válido según las reglas del lenguaje destino, verificable mediante un parser del lenguaje destino.

**Valida: Requisitos 3.1, 10.1**

### Propiedad 4: Indentación Sigue Configuración

*Para cualquier* código generado, cuando se especifica una configuración de formato (estilo de indentación y ancho), el código debe usar consistentemente ese estilo de indentación en todas las líneas indentadas.

**Valida: Requisitos 3.2, 9.2, 9.3**

### Propiedad 5: Convenciones de Nomenclatura del Lenguaje Destino

*Para cualquier* identificador (variable, función, clase) en el código generado para JavaScript, los nombres deben seguir la convención camelCase; para C++, los nombres deben seguir las convenciones estándar de C++ (snake_case para variables, PascalCase para clases).

**Valida: Requisitos 3.3**

### Propiedad 6: Mapeo Consistente de Tipos

*Para cualquier* declaración de variable o parámetro con un tipo Java (primitivo o complejo), el tipo debe mapearse consistentemente al tipo equivalente en el lenguaje destino según la tabla de mapeo de tipos definida.

**Valida: Requisitos 4.1, 4.2**

### Propiedad 7: Preservación de Nullabilidad

*Para cualquier* tipo en Java que sea explícitamente nullable (anotado o inferido), el tipo generado en el lenguaje destino debe preservar la semántica de nullabilidad cuando el lenguaje destino lo soporte (TypeScript con tipos opcionales, C++ con std::optional).

**Valida: Requisitos 4.4**

### Propiedad 8: Preservación de Estructuras de Control

*Para cualquier* estructura de control en el código Java (bucles for/while/do-while, condicionales if/else/switch, bloques try-catch-finally), debe existir una estructura de control equivalente en el código generado que preserve la misma semántica de flujo de control.

**Valida: Requisitos 5.1, 5.2, 5.3**

### Propiedad 9: Errores Incluyen Mensaje Descriptivo

*Para cualquier* entrada que cause un error de traducción (sintaxis inválida, construcción no soportada, etc.), el traductor debe retornar un mensaje de error que explique la razón del fallo.

**Valida: Requisitos 6.1**

### Propiedad 10: Código de Salida Refleja Resultado

*Para cualquier* ejecución del traductor vía CLI, el código de salida debe ser 0 si la traducción fue exitosa, y no-cero si ocurrió algún error durante el proceso.

**Valida: Requisitos 7.5**

### Propiedad 11: Preservación de Comentarios

*Para cualquier* código Java que contenga comentarios (de línea o de bloque), el código generado debe preservar esos comentarios con el contenido original intacto, adaptando únicamente la sintaxis de comentarios al formato del lenguaje destino (// y /* */ se mantienen para JS, se adaptan para C++ si es necesario).

**Valida: Requisitos 8.1, 8.2, 8.3, 8.4**

## Manejo de Errores

El sistema debe manejar errores de manera robusta y proporcionar información útil al usuario:

### Categorías de Errores

1. **Errores de Sintaxis**: Código Java inválido
   - Detectado por: Parser
   - Respuesta: Retornar ParseError con ubicación exacta
   - Código de salida: 1

2. **Errores de Archivo**: Archivo no encontrado, sin permisos de lectura/escritura
   - Detectado por: CLI/File System
   - Respuesta: Mensaje de error descriptivo
   - Código de salida: 2

3. **Errores de Configuración**: Archivo de configuración inválido
   - Detectado por: ConfigurationManager
   - Respuesta: Mensaje indicando qué parte de la configuración es inválida
   - Código de salida: 3

4. **Errores de Traducción**: Construcción no soportada, mapeo de tipo imposible
   - Detectado por: Transformer
   - Respuesta: TransformWarning o error con sugerencias
   - Código de salida: 4

5. **Errores de Validación**: Código generado sintácticamente inválido
   - Detectado por: Validator
   - Respuesta: ValidationError con ubicación en código generado
   - Código de salida: 5

### Estrategia de Recuperación

- **Errores de Sintaxis**: Detener el procesamiento, reportar todos los errores encontrados hasta el punto de fallo
- **Construcciones No Soportadas**: Generar comentario TODO en el código destino, continuar con el resto del código
- **Mapeo de Tipos Ambiguo**: Usar el tipo más cercano, agregar comentario explicativo, emitir warning
- **Errores de Validación**: Reportar el error pero aún así escribir el código generado para inspección

### Formato de Mensajes de Error

```typescript
interface ErrorMessage {
  severity: 'error' | 'warning' | 'info';
  code: string;  // e.g., "PARSE_ERROR", "UNSUPPORTED_CONSTRUCT"
  message: string;
  location?: {
    file: string;
    line: number;
    column: number;
    snippet?: string;  // Fragmento de código relevante
  };
  suggestion?: string;  // Sugerencia para resolver el error
}
```

Ejemplo de salida:
```
ERROR [PARSE_ERROR]: Expected ';' after statement
  at Calculator.java:15:23
  
  13 |   public int add(int a, int b) {
  14 |     int result = a + b
  15 |     return result
     |                   ^
  16 |   }
  
  Suggestion: Add a semicolon at the end of the statement
```

## Estrategia de Testing

### Enfoque Dual de Testing

El sistema requiere dos tipos complementarios de pruebas:

1. **Pruebas Unitarias**: Verifican ejemplos específicos, casos borde y condiciones de error
2. **Pruebas Basadas en Propiedades**: Verifican propiedades universales a través de múltiples entradas generadas

Ambos tipos son necesarios para cobertura completa: las pruebas unitarias capturan bugs concretos, mientras que las pruebas de propiedades verifican la corrección general.

### Configuración de Pruebas Basadas en Propiedades

**Biblioteca**: Utilizaremos `fast-check` para TypeScript, que es la biblioteca estándar para property-based testing en el ecosistema Node.js.

**Configuración**:
- Mínimo 100 iteraciones por prueba de propiedad (debido a la naturaleza aleatoria)
- Cada prueba debe referenciar su propiedad del documento de diseño
- Formato de etiqueta: `Feature: code-translator, Property {número}: {texto de la propiedad}`

**Ejemplo de Prueba de Propiedad**:

```typescript
import fc from 'fast-check';

// Feature: code-translator, Property 1: Round-trip de Parsing
describe('Parser round-trip property', () => {
  it('should preserve AST structure through parse-print-parse cycle', () => {
    fc.assert(
      fc.property(
        javaCodeArbitrary(),  // Generador de código Java válido
        (javaCode) => {
          const ast1 = parser.parse(javaCode);
          const printed = prettyPrint(ast1.ast);
          const ast2 = parser.parse(printed);
          
          expect(astEquals(ast1.ast, ast2.ast)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: code-translator, Property 3: Código Generado es Sintácticamente Válido
describe('Generated code validity property', () => {
  it('should generate syntactically valid JavaScript for any valid AST', () => {
    fc.assert(
      fc.property(
        validASTArbitrary(),  // Generador de AST válidos
        (ast) => {
          const jsCode = jsGenerator.generate(ast, defaultOptions);
          const validation = jsValidator.validate(jsCode.code);
          
          expect(validation.valid).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Pruebas Unitarias

Las pruebas unitarias deben enfocarse en:

1. **Ejemplos Específicos**: Casos concretos de traducción
   - Clase simple de Java → JavaScript
   - Método con parámetros → función JavaScript
   - Bucle for → bucle for en destino

2. **Casos Borde**:
   - Archivo vacío
   - Código con solo comentarios
   - Clases sin métodos
   - Métodos sin parámetros
   - Tipos genéricos complejos

3. **Condiciones de Error**:
   - Sintaxis inválida
   - Archivo no encontrado
   - Configuración malformada
   - Construcciones no soportadas

4. **Integración entre Componentes**:
   - CLI → Parser → Transformer → Generator
   - ConfigurationManager → Generator (aplicación de formato)
   - Parser → Validator (detección de errores)

**Ejemplo de Prueba Unitaria**:

```typescript
describe('JavaScriptGenerator', () => {
  it('should translate a simple Java class to JavaScript', () => {
    const javaCode = `
      public class Calculator {
        public int add(int a, int b) {
          return a + b;
        }
      }
    `;
    
    const ast = parser.parse(javaCode);
    const jsCode = jsGenerator.generate(ast.ast, defaultOptions);
    
    expect(jsCode.code).toContain('class Calculator');
    expect(jsCode.code).toContain('add(a, b)');
    expect(jsCode.code).toContain('return a + b');
  });
  
  it('should handle empty input gracefully', () => {
    const ast = parser.parse('');
    const jsCode = jsGenerator.generate(ast.ast, defaultOptions);
    
    expect(jsCode.code).toBe('');
  });
  
  it('should preserve comments in generated code', () => {
    const javaCode = `
      // This is a calculator
      public class Calculator {
        /* Adds two numbers */
        public int add(int a, int b) {
          return a + b;
        }
      }
    `;
    
    const ast = parser.parse(javaCode);
    const jsCode = jsGenerator.generate(ast.ast, { ...defaultOptions, preserveComments: true });
    
    expect(jsCode.code).toContain('// This is a calculator');
    expect(jsCode.code).toContain('/* Adds two numbers */');
  });
});
```

### Cobertura de Testing

Objetivo de cobertura:
- **Cobertura de líneas**: Mínimo 80%
- **Cobertura de ramas**: Mínimo 75%
- **Cobertura de funciones**: Mínimo 85%

Áreas críticas que requieren 100% de cobertura:
- Mapeo de tipos (JAVA_TO_JS_TYPES, JAVA_TO_CPP_TYPES)
- Manejo de errores (todas las categorías de error)
- Validación de sintaxis

### Estrategia de Testing por Componente

| Componente | Pruebas Unitarias | Pruebas de Propiedades | Prioridad |
|------------|-------------------|------------------------|-----------|
| Parser | Ejemplos específicos, errores de sintaxis | Round-trip, errores incluyen ubicación | Alta |
| Transformer | Mapeos específicos, casos borde | Preservación de estructura | Alta |
| Generator | Ejemplos de código, formato | Validez sintáctica, indentación | Alta |
| Validator | Código válido/inválido | Consistencia de validación | Media |
| CLI | Argumentos, archivos I/O | Código de salida | Media |
| ConfigManager | Carga de config, defaults | Merge de configuración | Baja |

### Generadores para Property-Based Testing

Necesitamos implementar generadores (arbitraries) para:

1. **Código Java Válido**: Genera programas Java sintácticamente correctos
   - Clases simples con campos y métodos
   - Diferentes tipos de datos
   - Estructuras de control variadas

2. **AST Válidos**: Genera árboles de sintaxis abstracta bien formados
   - Nodos con tipos correctos
   - Referencias válidas
   - Estructura jerárquica consistente

3. **Configuraciones**: Genera objetos de configuración válidos
   - Diferentes estilos de indentación
   - Opciones booleanas
   - Mapeos de tipos personalizados

**Ejemplo de Generador**:

```typescript
// Generador de código Java simple
function javaCodeArbitrary(): fc.Arbitrary<string> {
  return fc.record({
    className: fc.stringOf(fc.char().filter(c => /[a-zA-Z]/.test(c)), { minLength: 1, maxLength: 20 }),
    methods: fc.array(javaMethodArbitrary(), { maxLength: 5 })
  }).map(({ className, methods }) => {
    const methodsCode = methods.map(m => m.code).join('\n\n  ');
    return `public class ${className} {\n  ${methodsCode}\n}`;
  });
}

function javaMethodArbitrary(): fc.Arbitrary<{ code: string }> {
  return fc.record({
    name: fc.stringOf(fc.char().filter(c => /[a-z]/.test(c)), { minLength: 1, maxLength: 15 }),
    returnType: fc.constantFrom('int', 'String', 'boolean', 'void'),
    body: fc.constantFrom('return 0;', 'return "";', 'return true;', '')
  }).map(({ name, returnType, body }) => ({
    code: `public ${returnType} ${name}() {\n    ${body}\n  }`
  }));
}
```

### Integración Continua

- Ejecutar todas las pruebas en cada commit
- Pruebas de propiedades con semilla fija para reproducibilidad
- Reportar fallos de propiedades con el caso mínimo que causa el fallo (shrinking)
- Mantener un registro de casos que han causado fallos para regresión

