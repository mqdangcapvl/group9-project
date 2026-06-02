#ifndef WORKINGEMPLOYEE_H
#define WORKINGEMPLOYEE_H

#include <vector>

#include "Employee.h"
#include "Table.h"
#include "TableAttendant.h"

class WorkingEmployee : public Employee, public TableAttendant {
private:
    vector<Table*> assignedTables;

public:
    WorkingEmployee();

    bool assignTable(Table* table) override;

    int getAssignedTableCount() const override;

    vector<Table*> getAssignedTables() const override;
};

#endif