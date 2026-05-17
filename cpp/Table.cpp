#include "Table.h"

int Table::totalTables = 0;

Table::Table(
    int id,
    double pricePerHour,
    string label,
    string type
) {
    this->tableId = id;
    this->pricePerHour = pricePerHour;
    this->label = label;
    this->type = type;
    this->status = false;
    this->startTime = 0;

    setTableLabel(label);

    totalTables++;
}

void Table::turnOn() {
    status = true;
    startTime = time(nullptr);
}

void Table::turnOff() {
    double currentPrice =
        calculateCurrentPrice();

    status = false;

    setTablePrice(currentPrice);

    startTime = 0;
}

double Table::calculateCurrentPrice() const {
    if (!status || startTime == 0)
        return 0;

    time_t now = time(nullptr);

    double playedSeconds =
        difftime(now, startTime);

    double playedHours =
        playedSeconds / 3600.0;

    return playedHours *
           pricePerHour;
}

int Table::getPlayedMinutes() const {
    if (!status || startTime == 0)
        return 0;

    time_t now = time(nullptr);

    return static_cast<int>(
        difftime(now, startTime) / 60
    );
}

Bill& Table::getBill() {
    return *this;
}

string Table::getLabel() const {
    return label;
}

string Table::getType() const {
    return type;
}

int Table::getTableId() const {
    return tableId;
}

bool Table::getStatus() const {
    return status;
}

double Table::getPricePerHour() const {
    return pricePerHour;
}

time_t Table::getStartTime() const {
    return startTime;
}

void Table::setStartTime(time_t startTime) {
    this->startTime = startTime;
}

int Table::getTotalTables() {
    return totalTables;
}

Table::~Table() {
    totalTables--;
}

// Vip

VIPTable::VIPTable(
    int id,
    double pricePerHour
)

: Table(
      id,
      pricePerHour,
      "VIP-" + to_string(id),
      "VIP"
  )

{}

// Normal A

NormalTableA::NormalTableA(
    int id,
    double pricePerHour
)

: Table(
      id,
      pricePerHour,
      "A-" + to_string(id),
      "NORMAL_A"
  )

{}
// Normal B

NormalTableB::NormalTableB(
    int id,
    double pricePerHour
)

: Table(
      id,
      pricePerHour,
      "B-" + to_string(id),
      "NORMAL_B"
  )

{}
