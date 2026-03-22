# AST Module

Este módulo define las interfaces del Abstract Syntax Tree (AST) utilizado por el traductor de código.

## Estructura

El AST está diseñado para representar código Java de manera independiente del lenguaje, permitiendo su transformación a JavaScript o C++.

### Tipos Base

- **ASTNodeBase**: Interfaz base para todos los nodos del AST
- **SourceLocation**: Información de ubicación en el código fuente (línea, columna, archivo)
- **Comment**: Comentarios de línea o bloque

### Declaraciones

- **ProgramNode**: Nodo raíz que contiene el programa completo
- **ClassDeclaration**: Declaración de clase
- **InterfaceDeclaration**: Declaración de interfaz
- **MethodDeclaration**: Declaración de método
- **VariableDeclaration**: Declaración de variable
- **ImportDeclaration**: Declaración de importación

### Statements (Sentencias)

- **BlockStatement**: Bloque de código
- **IfStatement**: Condicional if/else
- **ForStatement**: Bucle for
- **WhileStatement**: Bucle while
- **DoWhileStatement**: Bucle do-while
- **SwitchStatement**: Sentencia switch
- **TryStatement**: Bloque try-catch-finally
- **ReturnStatement**: Sentencia return
- **ThrowStatement**: Sentencia throw
- **ExpressionStatement**: Expresión como sentencia
- **BreakStatement**: Sentencia break
- **ContinueStatement**: Sentencia continue

### Expressions (Expresiones)

- **Identifier**: Identificador
- **Literal**: Literal (string, number, boolean, null)
- **BinaryExpression**: Expresión binaria (+, -, *, /, etc.)
- **UnaryExpression**: Expresión unaria (!, -, +, etc.)
- **CallExpression**: Llamada a función
- **MemberExpression**: Acceso a miembro (obj.prop)
- **ArrayExpression**: Literal de array
- **ObjectExpression**: Literal de objeto
- **AssignmentExpression**: Asignación
- **UpdateExpression**: Incremento/decremento (++, --)
- **LogicalExpression**: Expresión lógica (&&, ||)
- **ConditionalExpression**: Operador ternario (? :)
- **NewExpression**: Expresión new
- **ThisExpression**: Palabra clave this
- **ArrayAccessExpression**: Acceso a array (arr[i])

### Tipos y Modificadores

- **TypeAnnotation**: Anotación de tipo con soporte para genéricos
- **Modifier**: Modificadores de acceso y comportamiento (public, private, static, etc.)
- **Parameter**: Parámetro de función/método

## Uso

```typescript
import { ASTNode, ProgramNode, ClassDeclaration } from './ast';

// Crear un nodo de programa
const program: ProgramNode = {
  type: 'Program',
  body: [],
  imports: []
};

// Crear una declaración de clase
const classDecl: ClassDeclaration = {
  type: 'ClassDeclaration',
  name: 'MyClass',
  members: [],
  modifiers: ['public']
};
```

## Validación de Requisitos

Este módulo satisface los siguientes requisitos del spec:

- **Requisito 2.1**: Análisis sintáctico del código fuente - El AST proporciona la estructura para representar código parseado
- **Requisito 2.3**: Reconocimiento de construcciones sintácticas - El AST incluye tipos para todas las construcciones estándar de Java

## Notas de Implementación

- Todos los nodos extienden `ASTNodeBase` para consistencia
- La información de ubicación (`SourceLocation`) es opcional pero recomendada para mensajes de error precisos
- Los comentarios se preservan en el AST para cumplir con el requisito de preservación de comentarios
- Los tipos genéricos se representan recursivamente en `TypeAnnotation`
