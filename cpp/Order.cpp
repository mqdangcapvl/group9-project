#include "Order.h"

Order::Order(
    string tableNumber,
    string foodName,
    int quantity,
    double price
) {

    this->tableNumber =
        tableNumber;

    this->foodName =
        foodName;

    this->quantity =
        quantity;

    this->price =
        price;
}

string Order::getTableNumber() const {

    return tableNumber;
}

string Order::getFoodName() const {

    return foodName;
}

int Order::getQuantity() const {

    return quantity;
}

double Order::getPrice() const {

    return price;
}

double Order::getTotal() const {

    return quantity * price;
}