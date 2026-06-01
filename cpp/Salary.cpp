#include "Salary.h"

#include <fstream>
#include <sstream>
#include <vector>

using namespace std;

// full-time salary

FullTimeSalary::FullTimeSalary( double salaryPerHour, int workedHours, double bonus) {
    this->salaryPerHour = salaryPerHour;
    this->workedHours = workedHours;
    this->bonus = bonus;
}
double FullTimeSalary::calculate() const {
    return
        (salaryPerHour * workedHours) + bonus;
}

// luong part-time

PartTimeSalary::PartTimeSalary( double salaryPerHour, int workedHours, double bonus ) {
    this->salaryPerHour = salaryPerHour;
    this->workedHours = workedHours;
    this->bonus = bonus;
}
double PartTimeSalary::calculate() const {
    return
    ((salaryPerHour * workedHours) + bonus) * 0.8;
}

// manager salary

ManagerSalary::ManagerSalary(double salaryPerHour,int workedHours,double bonus) {
    this->salaryPerHour = salaryPerHour;
    this->workedHours = workedHours;
    this->bonus = bonus;
}
double ManagerSalary::calculate() const {
    return(salaryPerHour * workedHours)+ (bonus * 2);
}

// xoa luong theo id nhan vien

bool SalaryManager::removeSalaryByEmployeeId(int employeeId,const string& filename) {
    ifstream file(filename);
    if (!file.is_open()) {
        return false;
    }
    vector<string> keptLines;
    string line;
    bool removed = false;

    while (getline(file, line)) {
        if (line.empty()) {
            continue;
        }
        stringstream ss(line);
        string employeeIdStr;
        getline(ss, employeeIdStr, ',');
        try {
            int currentEmployeeId = stoi(employeeIdStr);
            if ( currentEmployeeId == employeeId ) { 
                removed = true;
                continue;
            }
        } 
        catch (...) {
        }
        keptLines.push_back(line);
    }

    file.close();

    ofstream output(filename);
    for ( const string& keptLine : keptLines ) {
        output << keptLine << endl;
    }
    output.close();

    return removed;
}