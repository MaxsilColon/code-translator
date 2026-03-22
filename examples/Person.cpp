// Header (.h)
#ifndef PERSON_H
#define PERSON_H

#include <string>

class Person {
public:
  // Constructor
  Person(std::string name, int age);
  
  // Getter for name
  std::string getName();
  
  // Setter for name
  void setName(std::string name);
  
  // Getter for age
  int getAge();
  
  // Setter for age
  void setAge(int age);
  
  // Check if person is adult
  bool isAdult();
  
  // Get person info as string
  std::string toString();

private:
  std::string name;
  int age;
};

#endif // PERSON_H

// Source (.cpp)
#include "Person.h"

Person::Person(std::string name, int age) {
  this->name = name;
  this->age = age;
}

std::string Person::getName() {
  return this->name;
}

void Person::setName(std::string name) {
  this->name = name;
}

int Person::getAge() {
  return this->age;
}

void Person::setAge(int age) {
  this->age = age;
}

bool Person::isAdult() {
  return this->age >= 18;
}

std::string Person::toString() {
  return this->name + " (" + std::to_string(this->age) + " years old)";
}
