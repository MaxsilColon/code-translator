public class Calculator {
  // Adds two numbers
  public int add(int a, int b) {
    return a + b;
  }
  
  // Subtracts two numbers
  public int subtract(int a, int b) {
    return a - b;
  }
  
  /* 
   * Multiplies two numbers
   */
  public int multiply(int a, int b) {
    return a * b;
  }
  
  /**
   * Divides two numbers
   * Returns 0 if divisor is zero
   */
  public double divide(double a, double b) {
    if (b == 0) {
      return 0;
    }
    return a / b;
  }
}
