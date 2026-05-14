#include "WorkingEmployee.h"

WorkingEmployee::WorkingEmployee()

: Employee()

{}

bool WorkingEmployee::assignTable(
    Table* table
) {

    if (!table)
        return false;

    // vip table chi duoc phuc vu boi 1 nhan vien

    if (
        table->getType()
        == "VIP"
    ) {

        if (
            assignedTables.size()
            >= 1
        ) {

            return false;
        }
    }

    // nhung ban thuong thi duoc phuc vu boi toi da 2 nhan vien

    else {

        int normalCount = 0;

        for (
            Table* t
            : assignedTables
        ) {

            if (
                t->getType()
                != "VIP"
            ) {

                normalCount++;
            }
        }

        if (normalCount >= 2) {

            return false;
        }
    }

    assignedTables.push_back(
        table
    );

    return true;
}

int WorkingEmployee::getAssignedTableCount() const {

    return assignedTables.size();
}

vector<Table*>
WorkingEmployee::getAssignedTables() const {

    return assignedTables;
}