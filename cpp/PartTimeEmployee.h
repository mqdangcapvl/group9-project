#ifndef PARTTIMEEMPLOYEE_H
#define PARTTIMEEMPLOYEE_H

#include "Employee.h"
#include "Salary.h"

class PartTimeEmployee : public Employee {

public:
    PartTimeEmployee( string name = "", int age = 0, string cccd = "", int id = 0, double salaryPerHour = 0, int workedHours = 0 );

    ~PartTimeEmployee();

    double calculateSalary() const override;
    double getSalaryPerHour() const;
    int getWorkedHours() const;

    void setSalaryPolicy(Salary* policy);
};

#endif