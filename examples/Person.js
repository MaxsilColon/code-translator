class Person {
  name;
  age;

  // Constructor
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }

  // Getter for name
  getName() {
    return this.name;
  }

  // Setter for name
  setName(name) {
    this.name = name;
  }

  // Getter for age
  getAge() {
    return this.age;
  }

  // Setter for age
  setAge(age) {
    this.age = age;
  }

  // Check if person is adult
  isAdult() {
    return this.age >= 18;
  }

  // Get person info as string
  toString() {
    return this.name + " (" + this.age + " years old)";
  }
}
