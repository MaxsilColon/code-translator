// Type Mapper - Maps Java types to JavaScript and C++ types
import { TypeAnnotation } from '../ast';

/**
 * Mapping table from Java types to JavaScript types
 */
export const JAVA_TO_JS_TYPES: Record<string, string> = {
  // Primitive types
  'int': 'number',
  'long': 'number',
  'float': 'number',
  'double': 'number',
  'boolean': 'boolean',
  'char': 'string',
  'byte': 'number',
  'short': 'number',
  
  // Reference types
  'String': 'string',
  'void': 'void',
  'Object': 'any',
  
  // Collection types
  'List': 'Array',
  'ArrayList': 'Array',
  'LinkedList': 'Array',
  'Map': 'Map',
  'HashMap': 'Map',
  'TreeMap': 'Map',
  'Set': 'Set',
  'HashSet': 'Set',
  'TreeSet': 'Set',
};

/**
 * Mapping table from Java types to C++ types
 */
export const JAVA_TO_CPP_TYPES: Record<string, string> = {
  // Primitive types
  'int': 'int',
  'long': 'long',
  'float': 'float',
  'double': 'double',
  'boolean': 'bool',
  'char': 'char',
  'byte': 'int8_t',
  'short': 'short',
  
  // Reference types
  'String': 'std::string',
  'void': 'void',
  'Object': 'void*',
  
  // Collection types
  'List': 'std::vector',
  'ArrayList': 'std::vector',
  'LinkedList': 'std::list',
  'Map': 'std::map',
  'HashMap': 'std::unordered_map',
  'TreeMap': 'std::map',
  'Set': 'std::set',
  'HashSet': 'std::unordered_set',
  'TreeSet': 'std::set',
};

/**
 * Maps a Java type to the target language type
 * @param javaType - The Java type name
 * @param targetLang - The target language ('javascript' or 'cpp')
 * @returns The mapped type name, or the original type if no mapping exists
 */
export function mapType(javaType: string, targetLang: 'javascript' | 'cpp'): string {
  const mappingTable = targetLang === 'javascript' ? JAVA_TO_JS_TYPES : JAVA_TO_CPP_TYPES;
  return mappingTable[javaType] || javaType;
}

/**
 * Maps a TypeAnnotation to the target language
 * @param typeAnnotation - The type annotation to map
 * @param targetLang - The target language ('javascript' or 'cpp')
 * @returns A new TypeAnnotation with the mapped type
 */
export function mapTypeAnnotation(
  typeAnnotation: TypeAnnotation,
  targetLang: 'javascript' | 'cpp'
): TypeAnnotation {
  const mappedName = mapType(typeAnnotation.name, targetLang);
  
  // Map generic types recursively
  const mappedGeneric = typeAnnotation.generic?.map(g => mapTypeAnnotation(g, targetLang));
  
  return {
    name: mappedName,
    primitive: typeAnnotation.primitive,
    nullable: typeAnnotation.nullable,
    generic: mappedGeneric,
  };
}
