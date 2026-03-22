// Mock for java-parser library
export function parse(source: string): any {
  // Simulate parsing - throw error for invalid syntax
  if (source.includes('this is not valid java code')) {
    const error: any = new Error('Syntax error: unexpected token');
    error.token = {
      startLine: 1,
      startColumn: 0
    };
    throw error;
  }
  
  // Check for missing semicolon
  if (source.includes('int x = 5') && !source.includes('int x = 5;')) {
    const error: any = new Error('Syntax error: expected ";" at line 4 column 17');
    error.token = {
      startLine: 4,
      startColumn: 17
    };
    throw error;
  }
  
  // Check for missing closing brace
  if (source.includes('// Missing closing brace') && source.split('{').length > source.split('}').length) {
    const error: any = new Error('Syntax error: expected "}" at line 5 column 9');
    error.token = {
      startLine: 5,
      startColumn: 9
    };
    throw error;
  }
  
  // Check for invalid syntax patterns
  if (source.includes('invalid syntax')) {
    const error: any = new Error('Syntax error: unexpected token');
    error.token = {
      startLine: 1,
      startColumn: 20
    };
    throw error;
  }
  
  // Return a mock CST for Calculator class
  if (source.includes('class Calculator')) {
    return {
      name: 'compilationUnit',
      children: {
        ordinaryCompilationUnit: [{
          name: 'ordinaryCompilationUnit',
          children: {
            typeDeclaration: [{
              name: 'typeDeclaration',
              children: {
                classDeclaration: [{
                  name: 'classDeclaration',
                  children: {
                    classModifier: [{
                      name: 'classModifier',
                      children: {
                        Public: [{
                          image: 'public',
                          startLine: 1,
                          startColumn: 1
                        }]
                      }
                    }],
                    normalClassDeclaration: [{
                      name: 'normalClassDeclaration',
                      children: {
                        typeIdentifier: [{
                          children: {
                            Identifier: [{
                              image: 'Calculator',
                              startLine: 1,
                              startColumn: 14
                            }]
                          }
                        }],
                        classBody: [{
                          children: {
                            classBodyDeclaration: [
                              // Field: private int value
                              {
                                children: {
                                  modifier: [{
                                    children: {
                                      Private: [{
                                        image: 'private',
                                        startLine: 2,
                                        startColumn: 3
                                      }]
                                    }
                                  }],
                                  classMemberDeclaration: [{
                                    children: {
                                      fieldDeclaration: [{
                                        children: {
                                          unannType: [{
                                            children: {
                                              unannPrimitiveTypeWithOptionalDimsSuffix: [{
                                                children: {
                                                  primitiveType: [{
                                                    children: {
                                                      Int: [{
                                                        image: 'int',
                                                        startLine: 2,
                                                        startColumn: 11
                                                      }]
                                                    }
                                                  }]
                                                }
                                              }]
                                            }
                                          }],
                                          variableDeclaratorList: [{
                                            children: {
                                              variableDeclarator: [{
                                                children: {
                                                  variableDeclaratorId: [{
                                                    children: {
                                                      Identifier: [{
                                                        image: 'value',
                                                        startLine: 2,
                                                        startColumn: 15
                                                      }]
                                                    }
                                                  }]
                                                }
                                              }]
                                            }
                                          }]
                                        }
                                      }]
                                    }
                                  }]
                                }
                              },
                              // Constructor
                              {
                                children: {
                                  modifier: [{
                                    children: {
                                      Public: [{
                                        image: 'public',
                                        startLine: 4,
                                        startColumn: 3
                                      }]
                                    }
                                  }],
                                  constructorDeclaration: [{
                                    children: {
                                      simpleTypeName: [{
                                        children: {
                                          Identifier: [{
                                            image: 'Calculator',
                                            startLine: 4,
                                            startColumn: 10
                                          }]
                                        }
                                      }],
                                      constructorDeclarator: [{
                                        children: {
                                          formalParameterList: [{
                                            children: {
                                              formalParameter: [{
                                                children: {
                                                  unannType: [{
                                                    children: {
                                                      unannPrimitiveTypeWithOptionalDimsSuffix: [{
                                                        children: {
                                                          primitiveType: [{
                                                            children: {
                                                              Int: [{
                                                                image: 'int',
                                                                startLine: 4,
                                                                startColumn: 21
                                                              }]
                                                            }
                                                          }]
                                                        }
                                                      }]
                                                    }
                                                  }],
                                                  variableDeclaratorId: [{
                                                    children: {
                                                      Identifier: [{
                                                        image: 'value',
                                                        startLine: 4,
                                                        startColumn: 25
                                                      }]
                                                    }
                                                  }]
                                                }
                                              }]
                                            }
                                          }]
                                        }
                                      }],
                                      constructorBody: [{
                                        children: {
                                          block: [{
                                            children: {
                                              blockStatements: [{
                                                children: {
                                                  blockStatement: [{
                                                    children: {
                                                      statement: [{
                                                        children: {
                                                          expressionStatement: [{
                                                            children: {
                                                              statementExpression: [{
                                                                children: {
                                                                  primary: [{
                                                                    children: {
                                                                      This: [{
                                                                        image: 'this',
                                                                        startLine: 5,
                                                                        startColumn: 5
                                                                      }]
                                                                    }
                                                                  }]
                                                                }
                                                              }]
                                                            }
                                                          }]
                                                        }
                                                      }]
                                                    }
                                                  }]
                                                }
                                              }]
                                            }
                                          }]
                                        }
                                      }]
                                    }
                                  }]
                                }
                              },
                              // Method: getValue
                              {
                                children: {
                                  modifier: [{
                                    children: {
                                      Public: [{
                                        image: 'public',
                                        startLine: 8,
                                        startColumn: 3
                                      }]
                                    }
                                  }],
                                  classMemberDeclaration: [{
                                    children: {
                                      methodDeclaration: [{
                                        children: {
                                          methodHeader: [{
                                            children: {
                                              result: [{
                                                children: {
                                                  unannType: [{
                                                    children: {
                                                      unannPrimitiveTypeWithOptionalDimsSuffix: [{
                                                        children: {
                                                          primitiveType: [{
                                                            children: {
                                                              Int: [{
                                                                image: 'int',
                                                                startLine: 8,
                                                                startColumn: 10
                                                              }]
                                                            }
                                                          }]
                                                        }
                                                      }]
                                                    }
                                                  }]
                                                }
                                              }],
                                              methodDeclarator: [{
                                                children: {
                                                  Identifier: [{
                                                    image: 'getValue',
                                                    startLine: 8,
                                                    startColumn: 14
                                                  }]
                                                }
                                              }]
                                            }
                                          }],
                                          methodBody: [{
                                            children: {
                                              block: [{
                                                children: {
                                                  blockStatements: [{
                                                    children: {
                                                      blockStatement: [{
                                                        children: {
                                                          statement: [{
                                                            children: {
                                                              returnStatement: [{
                                                                children: {
                                                                  expression: [{
                                                                    children: {
                                                                      primary: [{
                                                                        children: {
                                                                          Identifier: [{
                                                                            image: 'value',
                                                                            startLine: 9,
                                                                            startColumn: 12
                                                                          }]
                                                                        }
                                                                      }]
                                                                    }
                                                                  }]
                                                                }
                                                              }]
                                                            }
                                                          }]
                                                        }
                                                      }]
                                                    }
                                                  }]
                                                }
                                              }]
                                            }
                                          }]
                                        }
                                      }]
                                    }
                                  }]
                                }
                              },
                              // Method: add
                              {
                                children: {
                                  modifier: [{
                                    children: {
                                      Public: [{
                                        image: 'public',
                                        startLine: 12,
                                        startColumn: 3
                                      }]
                                    }
                                  }],
                                  classMemberDeclaration: [{
                                    children: {
                                      methodDeclaration: [{
                                        children: {
                                          methodHeader: [{
                                            children: {
                                              result: [{
                                                children: {
                                                  unannType: [{
                                                    children: {
                                                      unannPrimitiveTypeWithOptionalDimsSuffix: [{
                                                        children: {
                                                          primitiveType: [{
                                                            children: {
                                                              Int: [{
                                                                image: 'int',
                                                                startLine: 12,
                                                                startColumn: 10
                                                              }]
                                                            }
                                                          }]
                                                        }
                                                      }]
                                                    }
                                                  }]
                                                }
                                              }],
                                              methodDeclarator: [{
                                                children: {
                                                  Identifier: [{
                                                    image: 'add',
                                                    startLine: 12,
                                                    startColumn: 14
                                                  }],
                                                  formalParameterList: [{
                                                    children: {
                                                      formalParameter: [{
                                                        children: {
                                                          unannType: [{
                                                            children: {
                                                              unannPrimitiveTypeWithOptionalDimsSuffix: [{
                                                                children: {
                                                                  primitiveType: [{
                                                                    children: {
                                                                      Int: [{
                                                                        image: 'int',
                                                                        startLine: 12,
                                                                        startColumn: 18
                                                                      }]
                                                                    }
                                                                  }]
                                                                }
                                                              }]
                                                            }
                                                          }],
                                                          variableDeclaratorId: [{
                                                            children: {
                                                              Identifier: [{
                                                                image: 'x',
                                                                startLine: 12,
                                                                startColumn: 22
                                                              }]
                                                            }
                                                          }]
                                                        }
                                                      }]
                                                    }
                                                  }]
                                                }
                                              }]
                                            }
                                          }],
                                          methodBody: [{
                                            children: {
                                              block: [{
                                                children: {
                                                  blockStatements: [{
                                                    children: {
                                                      blockStatement: [{
                                                        children: {
                                                          statement: [{
                                                            children: {
                                                              returnStatement: [{
                                                                children: {
                                                                  expression: [{
                                                                    children: {
                                                                      primary: [{
                                                                        children: {
                                                                          Identifier: [{
                                                                            image: 'value',
                                                                            startLine: 13,
                                                                            startColumn: 12
                                                                          }]
                                                                        }
                                                                      }]
                                                                    }
                                                                  }]
                                                                }
                                                              }]
                                                            }
                                                          }]
                                                        }
                                                      }]
                                                    }
                                                  }]
                                                }
                                              }]
                                            }
                                          }]
                                        }
                                      }]
                                    }
                                  }]
                                }
                              }
                            ]
                          }
                        }]
                      }
                    }]
                  }
                }]
              }
            }]
          }
        }]
      }
    };
  }
  
  // Return a mock CST for valid code
  return {
    name: 'compilationUnit',
    children: {
      typeDeclaration: []
    }
  };
}
