// Header (.h)
#ifndef CALCULATOR_H
#define CALCULATOR_H

class Calculator {
public:
  // Adds two numbers
  int add(int a, int b);
  
  // Subtracts two numbers
  int subtract(int a, int b);
  
  /* 
   * Multiplies two numbers
   */
  int multiply(int a, int b);
  
  /**
   * Divides two numbers
   * Returns 0 if divisor is zero
   */
  double divide(double a, double b);
};

#endif // CALCULATOR_H

// Source (.cpp)
#include "Calculator.h"

int Calculator::add(int a, int b) {
  return a + b;
}

int Calculator::subtract(int a, int b) {
  return a - b;
}

int Calculator::multiply(int a, int b) {
  return a * b;
}

double Calculator::divide(double a, double b) {
  if (b == 0) {
    return 0;
  }
  return a / b;
}
