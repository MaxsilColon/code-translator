// Unit tests for TypeMapper module
import { mapType, mapTypeAnnotation, JAVA_TO_JS_TYPES, JAVA_TO_CPP_TYPES } from '../TypeMapper';
import { TypeAnnotation } from '../../ast';

describe('TypeMapper', () => {
  describe('JAVA_TO_JS_TYPES', () => {
    it('should map primitive types correctly', () => {
      expect(JAVA_TO_JS_TYPES['int']).toBe('number');
      expect(JAVA_TO_JS_TYPES['long']).toBe('number');
      expect(JAVA_TO_JS_TYPES['float']).toBe('number');
      expect(JAVA_TO_JS_TYPES['double']).toBe('number');
      expect(JAVA_TO_JS_TYPES['boolean']).toBe('boolean');
      expect(JAVA_TO_JS_TYPES['char']).toBe('string');
      expect(JAVA_TO_JS_TYPES['byte']).toBe('number');
      expect(JAVA_TO_JS_TYPES['short']).toBe('number');
    });

    it('should map reference types correctly', () => {
      expect(JAVA_TO_JS_TYPES['String']).toBe('string');
      expect(JAVA_TO_JS_TYPES['void']).toBe('void');
      expect(JAVA_TO_JS_TYPES['Object']).toBe('any');
    });

    it('should map collection types correctly', () => {
      expect(JAVA_TO_JS_TYPES['List']).toBe('Array');
      expect(JAVA_TO_JS_TYPES['ArrayList']).toBe('Array');
      expect(JAVA_TO_JS_TYPES['LinkedList']).toBe('Array');
      expect(JAVA_TO_JS_TYPES['Map']).toBe('Map');
      expect(JAVA_TO_JS_TYPES['HashMap']).toBe('Map');
      expect(JAVA_TO_JS_TYPES['TreeMap']).toBe('Map');
      expect(JAVA_TO_JS_TYPES['Set']).toBe('Set');
      expect(JAVA_TO_JS_TYPES['HashSet']).toBe('Set');
      expect(JAVA_TO_JS_TYPES['TreeSet']).toBe('Set');
    });
  });

  describe('JAVA_TO_CPP_TYPES', () => {
    it('should map primitive types correctly', () => {
      expect(JAVA_TO_CPP_TYPES['int']).toBe('int');
      expect(JAVA_TO_CPP_TYPES['long']).toBe('long');
      expect(JAVA_TO_CPP_TYPES['float']).toBe('float');
      expect(JAVA_TO_CPP_TYPES['double']).toBe('double');
      expect(JAVA_TO_CPP_TYPES['boolean']).toBe('bool');
      expect(JAVA_TO_CPP_TYPES['char']).toBe('char');
      expect(JAVA_TO_CPP_TYPES['byte']).toBe('int8_t');
      expect(JAVA_TO_CPP_TYPES['short']).toBe('short');
    });

    it('should map reference types correctly', () => {
      expect(JAVA_TO_CPP_TYPES['String']).toBe('std::string');
      expect(JAVA_TO_CPP_TYPES['void']).toBe('void');
      expect(JAVA_TO_CPP_TYPES['Object']).toBe('void*');
    });

    it('should map collection types correctly', () => {
      expect(JAVA_TO_CPP_TYPES['List']).toBe('std::vector');
      expect(JAVA_TO_CPP_TYPES['ArrayList']).toBe('std::vector');
      expect(JAVA_TO_CPP_TYPES['LinkedList']).toBe('std::list');
      expect(JAVA_TO_CPP_TYPES['Map']).toBe('std::map');
      expect(JAVA_TO_CPP_TYPES['HashMap']).toBe('std::unordered_map');
      expect(JAVA_TO_CPP_TYPES['TreeMap']).toBe('std::map');
      expect(JAVA_TO_CPP_TYPES['Set']).toBe('std::set');
      expect(JAVA_TO_CPP_TYPES['HashSet']).toBe('std::unordered_set');
      expect(JAVA_TO_CPP_TYPES['TreeSet']).toBe('std::set');
    });
  });

  describe('mapType', () => {
    it('should map Java primitive types to JavaScript', () => {
      expect(mapType('int', 'javascript')).toBe('number');
      expect(mapType('boolean', 'javascript')).toBe('boolean');
      expect(mapType('String', 'javascript')).toBe('string');
    });

    it('should map Java primitive types to C++', () => {
      expect(mapType('int', 'cpp')).toBe('int');
      expect(mapType('boolean', 'cpp')).toBe('bool');
      expect(mapType('String', 'cpp')).toBe('std::string');
    });

    it('should map Java collection types to JavaScript', () => {
      expect(mapType('List', 'javascript')).toBe('Array');
      expect(mapType('ArrayList', 'javascript')).toBe('Array');
      expect(mapType('Map', 'javascript')).toBe('Map');
      expect(mapType('HashMap', 'javascript')).toBe('Map');
      expect(mapType('Set', 'javascript')).toBe('Set');
      expect(mapType('HashSet', 'javascript')).toBe('Set');
    });

    it('should map Java collection types to C++', () => {
      expect(mapType('List', 'cpp')).toBe('std::vector');
      expect(mapType('ArrayList', 'cpp')).toBe('std::vector');
      expect(mapType('LinkedList', 'cpp')).toBe('std::list');
      expect(mapType('Map', 'cpp')).toBe('std::map');
      expect(mapType('HashMap', 'cpp')).toBe('std::unordered_map');
      expect(mapType('Set', 'cpp')).toBe('std::set');
      expect(mapType('HashSet', 'cpp')).toBe('std::unordered_set');
    });

    it('should return original type for unknown types (fallback)', () => {
      expect(mapType('CustomType', 'javascript')).toBe('CustomType');
      expect(mapType('CustomType', 'cpp')).toBe('CustomType');
      expect(mapType('UnknownClass', 'javascript')).toBe('UnknownClass');
      expect(mapType('UnknownClass', 'cpp')).toBe('UnknownClass');
    });
  });

  describe('mapTypeAnnotation', () => {
    it('should map simple type annotations to JavaScript', () => {
      const javaType: TypeAnnotation = {
        name: 'int',
        primitive: true,
        nullable: false,
      };

      const result = mapTypeAnnotation(javaType, 'javascript');

      expect(result.name).toBe('number');
      expect(result.primitive).toBe(true);
      expect(result.nullable).toBe(false);
    });

    it('should map simple type annotations to C++', () => {
      const javaType: TypeAnnotation = {
        name: 'String',
        primitive: false,
        nullable: false,
      };

      const result = mapTypeAnnotation(javaType, 'cpp');

      expect(result.name).toBe('std::string');
      expect(result.primitive).toBe(false);
      expect(result.nullable).toBe(false);
    });

    it('should preserve nullable property', () => {
      const javaType: TypeAnnotation = {
        name: 'String',
        primitive: false,
        nullable: true,
      };

      const jsResult = mapTypeAnnotation(javaType, 'javascript');
      const cppResult = mapTypeAnnotation(javaType, 'cpp');

      expect(jsResult.nullable).toBe(true);
      expect(cppResult.nullable).toBe(true);
    });

    it('should map generic types recursively', () => {
      const javaType: TypeAnnotation = {
        name: 'List',
        primitive: false,
        nullable: false,
        generic: [
          {
            name: 'String',
            primitive: false,
            nullable: false,
          },
        ],
      };

      const jsResult = mapTypeAnnotation(javaType, 'javascript');

      expect(jsResult.name).toBe('Array');
      expect(jsResult.generic).toBeDefined();
      expect(jsResult.generic![0].name).toBe('string');
    });

    it('should map complex nested generic types', () => {
      const javaType: TypeAnnotation = {
        name: 'Map',
        primitive: false,
        nullable: false,
        generic: [
          {
            name: 'String',
            primitive: false,
            nullable: false,
          },
          {
            name: 'List',
            primitive: false,
            nullable: false,
            generic: [
              {
                name: 'int',
                primitive: true,
                nullable: false,
              },
            ],
          },
        ],
      };

      const cppResult = mapTypeAnnotation(javaType, 'cpp');

      expect(cppResult.name).toBe('std::map');
      expect(cppResult.generic).toBeDefined();
      expect(cppResult.generic![0].name).toBe('std::string');
      expect(cppResult.generic![1].name).toBe('std::vector');
      expect(cppResult.generic![1].generic![0].name).toBe('int');
    });

    it('should handle unknown types with fallback', () => {
      const javaType: TypeAnnotation = {
        name: 'CustomClass',
        primitive: false,
        nullable: false,
      };

      const jsResult = mapTypeAnnotation(javaType, 'javascript');
      const cppResult = mapTypeAnnotation(javaType, 'cpp');

      expect(jsResult.name).toBe('CustomClass');
      expect(cppResult.name).toBe('CustomClass');
    });
  });
});
