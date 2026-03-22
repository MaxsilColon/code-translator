public class Person {
  private String name;
  private int age;
  
  // Constructor
  public Person(String name, int age) {
    this.name = name;
    this.age = age;
  }
  
  // Getter for name
  public String getName() {
    return name;
  }
  
  // Setter for name
  public void setName(String name) {
    this.name = name;
  }
  
  // Getter for age
  public int getAge() {
    return age;
  }
  
  // Setter for age
  public void setAge(int age) {
    this.age = age;
  }
  
  // Check if person is adult
  public boolean isAdult() {
    return age >= 18;
  }
  
  // Get person info as string
  public String toString() {
    return name + " (" + age + " years old)";
  }
}
