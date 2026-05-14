#ifndef WORKINGEMPLOYEE_H
#define WORKINGEMPLOYEE_H

#include <vector>

#include "Employee.h"
#include "Table.h"

class WorkingEmployee: public Employee {
private:
    vector<Table*> assignedTables;

public:
    WorkingEmployee();

    bool assignTable(Table* table);

    int getAssignedTableCount() const;

    vector<Table*>
    getAssignedTables() const;
};

#endif