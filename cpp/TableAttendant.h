#ifndef TABLEATTENDANT_H
#define TABLEATTENDANT_H

#include <vector>

#include "Table.h"

using namespace std;

class TableAttendant {
public:
    virtual bool assignTable(Table* table) = 0;
    virtual int getAssignedTableCount() const = 0;
    virtual vector<Table*> getAssignedTables() const = 0;

    virtual ~TableAttendant() {}
};

#endif