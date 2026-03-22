public class ControlFlow {
  // Demonstrates for loop
  public int sum(int n) {
    int total = 0;
    for (int i = 1; i <= n; i++) {
      total += i;
    }
    return total;
  }
  
  // Demonstrates while loop
  public int factorial(int n) {
    int result = 1;
    int i = 1;
    while (i <= n) {
      result *= i;
      i++;
    }
    return result;
  }
  
  // Demonstrates if-else
  public String classify(int number) {
    if (number > 0) {
      return "positive";
    } else if (number < 0) {
      return "negative";
    } else {
      return "zero";
    }
  }
  
  // Demonstrates switch statement
  public String getDayName(int day) {
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
  
  // Demonstrates try-catch
  public int safeDivide(int a, int b) {
    try {
      return a / b;
    } catch (Exception e) {
      return 0;
    }
  }
}
