# Traductor de Código Java

Traductor de código que convierte Java a JavaScript o C++.

## Instalación

```bash
pnpm install
pnpm run build
```

## Uso

```bash
# Traducir a JavaScript
node dist/cli/index.js -i archivo.java -t javascript -o salida.js

# Traducir a C++
node dist/cli/index.js -i archivo.java -t cpp -o salida.cpp

# Ver en consola
node dist/cli/index.js -i archivo.java -t javascript
```

## Opciones

- `-i, --input` - Archivo Java de entrada (requerido)
- `-o, --output` - Archivo de salida (opcional)
- `-t, --target` - Lenguaje destino: `javascript` o `cpp` (requerido)
- `-c, --config` - Archivo de configuración (opcional)
- `--no-validate` - Deshabilitar validación
- `-v, --verbose` - Modo verbose

## Tests

```bash
pnpm test
```

## Estructura

```
src/
├── ast/          # Definiciones del AST
├── parser/       # Parser de Java
├── transformer/  # Transformación del AST
├── generator/    # Generación de código
├── validator/    # Validación de sintaxis
├── config/       # Configuración
└── cli/          # Interfaz de línea de comandos
```
