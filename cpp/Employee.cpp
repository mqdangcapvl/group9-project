#include "Employee.h"

int Employee::totalEmployees = 0;

Employee::Employee(
    string name,
    int age,
    string cccd,
    int id
)
: Person(name, age, cccd)
{
    this->id = id;

    totalEmployees++;
}

Employee::~Employee() {
    totalEmployees--;
}

int Employee::getId() const {
    return id;
}

string Employee::getName() const {
    return name;
}

int Employee::getTotalEmployees() {
    return totalEmployees;
}