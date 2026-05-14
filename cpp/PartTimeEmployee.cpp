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
  FullTimeEmployee(
    name,
    age,
    cccd,
    id,
    salaryPerHour,
    workedHours
)

{
    setSalaryPolicy(
        new PartTimeSalary(
            salaryPerHour,
            workedHours,
            0
        )
    );
}

double PartTimeEmployee::calculateSalary() const {
    return salaryPolicy->calculate();
}
