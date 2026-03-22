class ControlFlow {
  // Demonstrates for loop
  sum(n) {
    let total = 0;
    for (let i = 1; i <= n; i++) {
      total += i;
    }
    return total;
  }

  // Demonstrates while loop
  factorial(n) {
    let result = 1;
    let i = 1;
    while (i <= n) {
      result *= i;
      i++;
    }
    return result;
  }

  // Demonstrates if-else
  classify(number) {
    if (number > 0) {
      return "positive";
    } else if (number < 0) {
      return "negative";
    } else {
      return "zero";
    }
  }

  // Demonstrates switch statement
  getDayName(day) {
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
  safeDivide(a, b) {
    try {
      return a / b;
    } catch (e) {
      return 0;
    }
  }
}
