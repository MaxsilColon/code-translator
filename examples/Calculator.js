class Calculator {
  // Adds two numbers
  add(a, b) {
    return a + b;
  }

  // Subtracts two numbers
  subtract(a, b) {
    return a - b;
  }

  /* 
   * Multiplies two numbers
   */
  multiply(a, b) {
    return a * b;
  }

  /**
   * Divides two numbers
   * Returns 0 if divisor is zero
   */
  divide(a, b) {
    if (b === 0) {
      return 0;
    }
    return a / b;
  }
}
