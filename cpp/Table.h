#ifndef TABLE_H
#define TABLE_H

#include <ctime>
#include <string>

#include "Bill.h"

using namespace std;

class Table : virtual public Bill {

protected:
    int tableId;
    bool status;
    double pricePerHour;
    string label;
    string type;
    time_t startTime;

private:
    static int totalTables;

public:
    Table(
        int id = 0,
        double pricePerHour = 50000,
        string label = "",
        string type = "NORMAL"
    );

    virtual void turnOn();
    virtual void turnOff();
    double calculateCurrentPrice() const;
    int getPlayedMinutes() const;
    Bill& getBill();

    string getLabel() const;
    string getType() const;
    int getTableId() const;
    bool getStatus() const;

    double getPricePerHour() const;
    time_t getStartTime() const;
    void setStartTime(time_t startTime);
    static int getTotalTables();
    virtual ~Table();
};

class VIPTable : public Table {

public:
    VIPTable(
        int id = 0,
        double pricePerHour = 100000
    );
};

class NormalTableA : public Table {

public:
    NormalTableA(
        int id = 0,
        double pricePerHour = 50000
    );
};

class NormalTableB : public Table {

public:
    NormalTableB(
        int id = 0,
        double pricePerHour = 30000
    );
};

#endif
