#include "EmployeeManager.h"

#include <fstream>
#include <sstream>

EmployeeManager::~EmployeeManager() {
    for (Employee* e : employees) {
        delete e;
    }
}

void EmployeeManager::loadEmployees(const string& filename) {
    for (Employee* e : employees) {
        delete e;
    }
    employees.clear();

    ifstream file(filename);

    string line;
    while (getline(file, line)) {

        stringstream ss(line);

        string type;

        getline(ss, type, ',');

        string idStr;
        string name;
        string ageStr;
        string cccd;
        string salaryStr;
        string hoursStr;
        string bonusStr;

        getline(ss, idStr, ',');
        getline(ss, name, ',');
        getline(ss, ageStr, ',');
        getline(ss, cccd, ',');
        getline(ss, salaryStr, ',');
        getline(ss, hoursStr, ',');

        int id = stoi(idStr);

        int age = stoi(ageStr);

        double salary = stod(salaryStr);

        int hours = stoi(hoursStr);

        // Manager

        if (type == "MANAGER") {
            getline(ss, bonusStr, ',');

            double bonus = stod(bonusStr);

            employees.push_back(
                new Manager( name, age, cccd, id, salary, hours, bonus )
            );
        }

        // Fulltime

        else if (type == "FULLTIME") {
            employees.push_back(
                new FullTimeEmployee( name, age, cccd, id, salary, hours )
            );
        }

        // Parttime

        else if (type == "PARTTIME") {
            employees.push_back(
                new PartTimeEmployee( name, age, cccd, id, salary, hours )
            );
        }
    }

    file.close();
}

void EmployeeManager::saveEmployees(const string& filename) {
    ofstream file(filename);

    for (Employee* e : employees) {
        Manager* manager = dynamic_cast<Manager*>(e);

        PartTimeEmployee* partTime = dynamic_cast<PartTimeEmployee*>(e);

        FullTimeEmployee* fullTime = dynamic_cast<FullTimeEmployee*>(e);

        // Manager

        if (manager) {
            file << "MANAGER," << manager->getId() << "," << manager->getName() << "," << manager->getAge() << "," << manager->getCccd() << "," << manager->getSalaryPerHour() << "," << manager->getWorkedHours() << "," << manager->getBonus() << endl;
        }

        // Parttime

        else if (partTime) {
            file << "PARTTIME," << partTime->getId() << "," << partTime->getName() << "," << partTime->getAge() << "," << partTime->getCccd() << "," << partTime->getSalaryPerHour() << "," << partTime->getWorkedHours() << endl;
        }

        // Fulltime

        else if (fullTime) {
            file << "FULLTIME," << fullTime->getId() << "," << fullTime->getName() << "," << fullTime->getAge() << "," << fullTime->getCccd() << "," << fullTime->getSalaryPerHour() << "," << fullTime->getWorkedHours() << endl;
        }
    }
    file.close();
}

void EmployeeManager::addEmployee(Employee* employee) {
    employees.push_back(employee);

    saveEmployees("../database/employees.txt");
}

bool EmployeeManager::removeEmployee(int id) {
    for ( auto it = employees.begin(); it != employees.end(); ++it) {

        if ((*it)->getId() == id) {
            delete *it;
            employees.erase(it);

            saveEmployees( "../database/employees.txt" );
            SalaryManager salaryManager;

            salaryManager.removeSalaryByEmployeeId( id, "../database/salaries.txt" );
            return true;
        }
    }

    return false;
}

vector<Employee*>
EmployeeManager::getEmployees() const {
    return employees;
}

Employee* EmployeeManager::findEmployee(int id) {
    for (Employee* e : employees) {
        if (e->getId() == id) {
            return e;
        }
    }
    return nullptr;
}