// Header (.h)
#ifndef CONTROLFLOW_H
#define CONTROLFLOW_H

#include <string>

class ControlFlow {
public:
  // Demonstrates for loop
  int sum(int n);
  
  // Demonstrates while loop
  int factorial(int n);
  
  // Demonstrates if-else
  std::string classify(int number);
  
  // Demonstrates switch statement
  std::string getDayName(int day);
  
  // Demonstrates try-catch
  int safeDivide(int a, int b);
};

#endif // CONTROLFLOW_H

// Source (.cpp)
#include "ControlFlow.h"
#include <stdexcept>

int ControlFlow::sum(int n) {
  int total = 0;
  for (int i = 1; i <= n; i++) {
    total += i;
  }
  return total;
}

int ControlFlow::factorial(int n) {
  int result = 1;
  int i = 1;
  while (i <= n) {
    result *= i;
    i++;
  }
  return result;
}

std::string ControlFlow::classify(int number) {
  if (number > 0) {
    return "positive";
  } else if (number < 0) {
    return "negative";
  } else {
    return "zero";
  }
}

std::string ControlFlow::getDayName(int day) {
  switch (day) {
    case 1:
      return "Monday";
    case 2:
      return "Tuesday";
    case 3:
      return "Wednesday";
    case 4:
      return "Thursday";
    case 5:
      return "Friday";
    case 6:
      return "Saturday";
    case 7:
      return "Sunday";
    default:
      return "Invalid day";
  }
}

int ControlFlow::safeDivide(int a, int b) {
  try {
    return a / b;
  } catch (std::exception& e) {
    return 0;
  }
}
