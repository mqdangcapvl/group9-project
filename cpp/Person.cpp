#include "Person.h"

int Person::totalPersons = 0;

Person::Person( string name, int age, string cccd ) {
    this->name = name;
    this->age = age;
    this->cccd = cccd;
    totalPersons++;
}
Person::~Person() {
    totalPersons--;
}
string Person::getName() const {
    return name;
}
int Person::getAge() const {
    return age;
}
string Person::getCccd() const {
    return cccd;
}
void Person::setName(string name) {
    this->name = name;
}
void Person::setAge(int age) {
    this->age = age;
}
void Person::setCccd(string cccd) {
    this->cccd = cccd;
}
int Person::getTotalPersons() {
    return totalPersons;
}