#ifndef PARTTIMEEMPLOYEE_H
#define PARTTIMEEMPLOYEE_H

#include "FullTimeEmployee.h"

class PartTimeEmployee
    : public FullTimeEmployee {

public:
    PartTimeEmployee(
        string name = "",
        int age = 0,
        string cccd = "",
        int id = 0,
        double salaryPerHour = 0,
        int workedHours = 0
    );

    double calculateSalary() const override;
};

#endif