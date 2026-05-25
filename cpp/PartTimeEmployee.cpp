#include "PartTimeEmployee.h"

PartTimeEmployee::PartTimeEmployee(
    string name,
    int age,
    string cccd,
    int id,
    double salaryPerHour,
    int workedHours
)

: Person(name, age, cccd),
  Employee(name, age, cccd, id)

{
    this->salaryPerHour =
        salaryPerHour;

    this->workedHours =
        workedHours;

    salaryPolicy =
        new PartTimeSalary(
            salaryPerHour,
            workedHours,
            0
        );
}

PartTimeEmployee::~PartTimeEmployee() {
    delete salaryPolicy;
}

double PartTimeEmployee::calculateSalary() const {
    return salaryPolicy->calculate();
}

double PartTimeEmployee::getSalaryPerHour() const {
    return salaryPerHour;
}

int PartTimeEmployee::getWorkedHours() const {
    return workedHours;
}

void PartTimeEmployee::setSalaryPolicy(
    Salary* policy
) {
    delete salaryPolicy;

    salaryPolicy = policy;
}