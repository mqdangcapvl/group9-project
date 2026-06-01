#include "TableManager.h"

#include <fstream>
#include <sstream>

TableManager::~TableManager() {
    for (Table* t : tables) {
        delete t;
    }
}

void TableManager::loadTables(const string& filename) {
    for (Table* t : tables) {
        delete t;
    }

    tables.clear();

    ifstream file(filename);
    string line;

    while (getline(file, line)) {
        if (line.empty()) {
            continue;
        }

        stringstream ss(line);

        string idStr;
        string type;
        string priceStr;
        string statusStr;
        string startTimeStr;

        if ( !getline(ss, idStr, ',') || !getline(ss, type, ',') || !getline(ss, priceStr, ',') || !getline(ss, statusStr, ',')) {
            continue;
        }

        getline(ss, startTimeStr, ',');
        int id = stoi(idStr);
        double price = stod(priceStr);

        Table* table = nullptr;

        if (type == "VIP") {
            table = new VIPTable( id, price );

        } 
        else if (type == "NORMAL_A") {
            table = new NormalTableA( id, price );

        } 
        else {
            table = new NormalTableB( id, price );
        }
        if (statusStr == "occupied") {
            table->turnOn();
            if (!startTimeStr.empty()) {
                time_t savedStartTime =static_cast<time_t>(stoll(startTimeStr));
                if (savedStartTime > 0) {
                    table->setStartTime(savedStartTime);
                }
            }
        }

        tables.push_back(table);
    }

    file.close();
}

void TableManager::saveTables(const string& filename) {
    ofstream file(filename);

    for (Table* t : tables) { 
        file << t->getTableId() << "," << t->getType() << "," << t->getPricePerHour() << "," << ( t->getStatus() ? "occupied" : "available" ) << "," << ( t->getStatus() ? t->getStartTime() : 0 ) << endl;
    }

    file.close();
}

vector<Table*>
TableManager::getTables() const {
    return tables;
}

Table* TableManager::findTable(int id) {
    for (Table* t : tables) {
        if (t->getTableId() == id)
            return t;
    }

    return nullptr;
}

bool TableManager::startTable(int id) {
    Table* table = findTable(id);
    if (!table)
        return false;
    table->turnOn();

    saveTables("../database/tables.txt");

    return true;
}

bool TableManager::endTable(int id) {
    Table* table = findTable(id);

    if (!table)
        return false;

    table->turnOff();

    saveTables("../database/tables.txt");

    return true;
}
