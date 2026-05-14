#ifndef TABLEMANAGER_H
#define TABLEMANAGER_H

#include <vector>

#include "Table.h"

class TableManager {
private:
    vector<Table*> tables;

public:
    ~TableManager();

    void loadTables(const string& filename);
    void saveTables(const string& filename);

    vector<Table*> getTables() const;
    Table* findTable(int id);

    bool startTable(int id);
    bool endTable(int id);
};

#endif