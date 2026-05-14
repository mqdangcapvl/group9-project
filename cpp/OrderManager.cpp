#include "OrderManager.h"

#include <fstream>
#include <sstream>

static string ordersFile =
    "../database/orders.txt";

static vector<string> orderStatuses;

void OrderManager::loadOrders(
    const string& filename
) {
    orders.clear();
    orderStatuses.clear();

    ifstream file(filename);

    string line;

    while (getline(file, line)) {
        if (line.empty()) {
            continue;
        }

        stringstream ss(line);

        string tableNumber;
        string foodName;
        string quantityStr;
        string priceStr;
        string status;

        getline(ss, tableNumber, ',');
        getline(ss, foodName, ',');
        getline(ss, quantityStr, ',');
        getline(ss, priceStr, ',');
        getline(ss, status, ',');

        if (status.empty()) {
            status = "ACTIVE";
        }

        orders.push_back(
            Order(
                tableNumber,
                foodName,
                stoi(quantityStr),
                stod(priceStr)
            )
        );

        orderStatuses.push_back(status);
    }

    file.close();
}

void OrderManager::saveOrders(
    const string& filename
) {
    ofstream file(filename);

    for (int i = 0; i < orders.size(); i++) {
        const Order& order = orders[i];

        string status =
            i < orderStatuses.size()
                ? orderStatuses[i]
                : "ACTIVE";

        file
            << order.getTableNumber()
            << ","
            << order.getFoodName()
            << ","
            << order.getQuantity()
            << ","
            << order.getPrice()
            << ","
            << status
            << endl;
    }

    file.close();
}

vector<Order> OrderManager::getOrders() const {
    return orders;
}

vector<Order> OrderManager::getTableOrders(
    const string& tableNumber
) const {
    vector<Order> result;

    for (const Order& order : orders) {
        if (order.getTableNumber() == tableNumber) {
            result.push_back(order);
        }
    }

    return result;
}

void OrderManager::addOrder(
    const Order& order
) {
    orders.push_back(order);
    orderStatuses.push_back("ACTIVE");

    saveOrders(ordersFile);
}

bool OrderManager::markTableOrdersDone(
    const string& tableNumber
) {
    bool changed = false;

    for (int i = 0; i < orders.size(); i++) {
        if (orders[i].getTableNumber() == tableNumber) {
            if (i >= orderStatuses.size()) {
                orderStatuses.push_back("DONE");
            } else {
                orderStatuses[i] = "DONE";
            }

            changed = true;
        }
    }

    if (changed) {
        saveOrders(ordersFile);
    }

    return changed;
}

bool OrderManager::deleteTableOrders(
    const string& tableNumber
) {
    vector<Order> keptOrders;
    vector<string> keptStatuses;

    bool deleted = false;

    for (int i = 0; i < orders.size(); i++) {
        if (orders[i].getTableNumber() == tableNumber) {
            deleted = true;
            continue;
        }

        keptOrders.push_back(orders[i]);

        keptStatuses.push_back(
            i < orderStatuses.size()
                ? orderStatuses[i]
                : "ACTIVE"
        );
    }

    orders = keptOrders;
    orderStatuses = keptStatuses;

    if (deleted) {
        saveOrders(ordersFile);
    }

    return deleted;
}

void OrderManager::clearTableOrders(
    const string& tableNumber
) {
    deleteTableOrders(tableNumber);
}

string OrderManager::getOrderStatus(
    const Order& order
) const {
    for (int i = 0; i < orders.size(); i++) {
        if (
            orders[i].getTableNumber() == order.getTableNumber()
            && orders[i].getFoodName() == order.getFoodName()
            && orders[i].getQuantity() == order.getQuantity()
            && orders[i].getPrice() == order.getPrice()
        ) {
            return i < orderStatuses.size()
                ? orderStatuses[i]
                : "ACTIVE";
        }
    }

    return "ACTIVE";
}

double OrderManager::calculateTableFoodTotal(
    const string& tableNumber
) const {
    double total = 0;

    for (const Order& order : orders) {
        if (order.getTableNumber() == tableNumber) {
            total += order.getTotal();
        }
    }

    return total;
}
