#ifndef EMPLOYEEMANAGER_H
#define EMPLOYEEMANAGER_H

#include <vector>

#include "Employee.h"
#include "Manager.h"
#include "PartTimeEmployee.h"
#include "FulltimeEmployee.h"

class EmployeeManager {

private:
    vector<Employee*> employees;
public:
    ~EmployeeManager();

    void loadEmployees( const string& filename);
    void saveEmployees( const string& filename);
    void addEmployee( Employee* employee);
    bool removeEmployee(int id);

    vector<Employee*> getEmployees() const;
    Employee* findEmployee(int id);
};

#endif