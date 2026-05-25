#ifndef EMPLOYEE_H
#define EMPLOYEE_H

#include "Person.h"
#include "Salary.h"

class Employee : virtual public Person {

protected:
    int id;
    double salaryPerHour;
    int workedHours;
    Salary* salaryPolicy;
private:
    static int totalEmployees;

public:
    Employee( string name = "", int age = 0, string cccd = "", int id = 0);

    virtual ~Employee();
    virtual double calculateSalary() const = 0;

    int getId() const;
    string getName() const;
    static int getTotalEmployees();
};

#endif