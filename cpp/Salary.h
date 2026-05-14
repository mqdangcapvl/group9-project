#ifndef SALARY_H
#define SALARY_H

#include <string>

using namespace std;

class Salary {

public:
    virtual double calculate() const = 0;
    virtual ~Salary() {}
};


// fulltime salary

class FullTimeSalary : public Salary {

private:
    double salaryPerHour;
    int workedHours;
    double bonus;

public:
    FullTimeSalary(
        double salaryPerHour = 0,
        int workedHours = 0,
        double bonus = 0
    );

    double calculate() const override;
};


// parttime salary

class PartTimeSalary : public Salary {

private:

    double salaryPerHour;

    int workedHours;

    double bonus;

public:
    PartTimeSalary(
        double salaryPerHour = 0,
        int workedHours = 0,
        double bonus = 0
    );

    double calculate() const override;
};


// manager salary

class ManagerSalary : public Salary {

private:
    double salaryPerHour;
    int workedHours;
    double bonus;

public:
    ManagerSalary(
        double salaryPerHour = 0,
        int workedHours = 0,
        double bonus = 0
    );

    double calculate() const override;
};


// salary manager

class SalaryManager {

public:
    bool removeSalaryByEmployeeId(
        int employeeId,
        const string& filename =
            "../database/salaries.txt"
    );
};

#endif