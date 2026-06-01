#include "Manager.h"

int Manager::totalManagers = 0;

Manager::Manager( string name, int age, string cccd, int id, double salaryPerHour, int workedHours, double bonus ) : Person(name, age, cccd),
FullTimeEmployee( name, age, cccd, id, salaryPerHour, workedHours ) {
    this->bonus = bonus;
    setSalaryPolicy(
        new ManagerSalary( salaryPerHour, workedHours, bonus )
    );
    totalManagers++;
}

double Manager::calculateSalary() const {
    return salaryPolicy->calculate();
}

double Manager::getBonus() const {
    return bonus;
}

int Manager::getTotalManagers() {
    return totalManagers;
}
