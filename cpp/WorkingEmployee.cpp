#include "WorkingEmployee.h"

WorkingEmployee::WorkingEmployee() : Employee() {}

bool WorkingEmployee::assignTable(Table* table) {
    if (!table) {
        return false;
    }

    // VIP table can be handled by only one working employee.
    if (table->getType() == "VIP") {
        if (assignedTables.size() >= 1) {
            return false;
        }
    } 
    else {
        int normalCount = 0;
        // Normal tables can be handled by up to two working employees.
        for (Table* t : assignedTables) {
            if (t->getType() != "VIP") {
                normalCount++;
            }
        }
        if (normalCount >= 2) {
            return false;
        }
    }
    assignedTables.push_back(table);

    return true;
}

int WorkingEmployee::getAssignedTableCount() const {
    return assignedTables.size();
}

vector<Table*> WorkingEmployee::getAssignedTables() const {
    return assignedTables;
}