#include "FullTimeEmployee.h"

FullTimeEmployee::FullTimeEmployee( string name, int age, string cccd, int id, double salaryPerHour, int workedHours ) : Person(name, age, cccd), Employee(name, age, cccd, id) {
    this->salaryPerHour = salaryPerHour;
    this->workedHours = workedHours;
    salaryPolicy = new FullTimeSalary( salaryPerHour, workedHours, 0 );
}

FullTimeEmployee::~FullTimeEmployee() {
    delete salaryPolicy;
}

double FullTimeEmployee::calculateSalary() const {
    return salaryPolicy->calculate();
}

double FullTimeEmployee::getSalaryPerHour() const {
    return salaryPerHour;
}

int FullTimeEmployee::getWorkedHours() const {
    return workedHours;
}

void FullTimeEmployee::setSalaryPolicy(Salary* policy) {
    delete salaryPolicy;
    salaryPolicy = policy;
}
