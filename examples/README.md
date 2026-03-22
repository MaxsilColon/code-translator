# Code Translator Examples

This directory contains example Java source files and their translated JavaScript and C++ equivalents.

## Examples

### 1. Calculator.java
A simple calculator class demonstrating:
- Basic arithmetic methods
- Comment preservation (single-line and multi-line)
- Conditional logic (if statement)
- Type mapping (int, double)

**Translation commands:**
```bash
# To JavaScript
code-translator --input examples/Calculator.java --output examples/Calculator.js --source java --target javascript

# To C++
code-translator --input examples/Calculator.java --output examples/Calculator.cpp --source java --target cpp
```

### 2. Person.java
A Person class demonstrating:
- Private fields
- Constructor
- Getters and setters
- Boolean return type
- String concatenation
- Field access with `this`

**Translation commands:**
```bash
# To JavaScript
code-translator --input examples/Person.java --output examples/Person.js --source java --target javascript

# To C++
code-translator --input examples/Person.java --output examples/Person.cpp --source java --target cpp
```

### 3. ControlFlow.java
A class demonstrating control flow structures:
- For loops
- While loops
- If-else statements
- Switch statements
- Try-catch exception handling

**Translation commands:**
```bash
# To JavaScript
code-translator --input examples/ControlFlow.java --output examples/ControlFlow.js --source java --target javascript

# To C++
code-translator --input examples/ControlFlow.java --output examples/ControlFlow.cpp --source java --target cpp
```

## Configuration File

The `translator.config.json` file shows how to customize the translation behavior:

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

**Using the configuration:**
```bash
code-translator --input examples/Calculator.java --output output.js --source java --target javascript --config examples/translator.config.json
```

## Key Translation Features

### Comment Preservation
All comments (single-line `//` and multi-line `/* */`) are preserved in the translated code.

### Type Mapping
Java types are automatically mapped to their equivalents:
- `int`, `double` → JavaScript `number`, C++ `int`/`double`
- `String` → JavaScript `string`, C++ `std::string`
- `boolean` → JavaScript `boolean`, C++ `bool`

### Code Structure
- Java classes → JavaScript classes / C++ classes with header/source split
- Java methods → JavaScript methods / C++ member functions
- Java constructors → JavaScript constructors / C++ constructors

### C++ Output Format
C++ translations generate both header (.h) and source (.cpp) files in a single output file, separated by comments. You can split them manually or use a post-processing script.

## Testing Your Translations

After translating, you can test the generated code:

**JavaScript:**
```bash
node -c examples/Calculator.js  # Check syntax
```

**C++:**
```bash
g++ -c examples/Calculator.cpp -o Calculator.o  # Compile to object file
```

## Limitations

These examples demonstrate the current capabilities of the translator. For known limitations, see the main README.md file.
