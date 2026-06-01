#include "Food.h"

Food::Food( int id, string name, string category, double price, int quantity ) {
    this->id = id;
    this->name = name;
    this->category = category;
    this->price = price;
    this->quantity = quantity;
}

int Food::getId() const {
    return id;
}

string Food::getName() const {
    return name;
}

string Food::getCategory() const {
    return category;
}

double Food::getPrice() const {
    return price;
}

int Food::getQuantity() const {
    return quantity;
}

void Food::setQuantity(int q) {
    quantity = q;
}

bool Food::reduceQuantity(int q) {
    if (quantity >= q) {
        quantity -= q;
        return true;
    }

    return false;
}