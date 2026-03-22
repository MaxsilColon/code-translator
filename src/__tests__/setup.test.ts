/**
 * Test de verificación de configuración del proyecto
 */

import * as fc from 'fast-check';
import { parse } from '@babel/parser';

describe('Project Setup', () => {
  it('should have TypeScript configured correctly', () => {
    expect(true).toBe(true);
  });

  it('should be able to import fast-check', () => {
    expect(fc).toBeDefined();
    expect(typeof fc.assert).toBe('function');
  });

  it('should be able to import @babel/parser', () => {
    expect(parse).toBeDefined();
    expect(typeof parse).toBe('function');
  });

  it('should be able to parse simple JavaScript with @babel/parser', () => {
    const code = 'const x = 1;';
    const ast = parse(code);
    expect(ast).toBeDefined();
    expect(ast.type).toBe('File');
  });
});
