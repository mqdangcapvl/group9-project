#ifndef MANAGER_H
#define MANAGER_H

#include "FullTimeEmployee.h"

class Manager : public FullTimeEmployee {

private:
    double bonus;
    static int totalManagers;

public:
    Manager( string name = "", int age = 0, string cccd = "", int id = 0, double salaryPerHour = 0, int workedHours = 0, double bonus = 0 );

    double calculateSalary() const override;

    double getBonus() const;
    static int getTotalManagers();
};

#endif