#ifndef FULLTIMEEMPLOYEE_H
#define FULLTIMEEMPLOYEE_H

#include "Employee.h"
#include "Salary.h"

class FullTimeEmployee : public Employee {

protected:
    double salaryPerHour;
    int workedHours;
    Salary* salaryPolicy;

public:
    FullTimeEmployee( string name = "", int age = 0, string cccd = "", int id = 0, double salaryPerHour = 0, int workedHours = 0);
    virtual ~FullTimeEmployee();

    double calculateSalary() const override;
    double getSalaryPerHour() const;
    int getWorkedHours() const;

    void setSalaryPolicy( Salary* policy );
};

#endif