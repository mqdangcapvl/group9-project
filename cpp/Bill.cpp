#include "Bill.h"

Bill::Bill() {
    memberDiscount = false;
    tablePrice = 0;
    tableLabel = "";
}

void Bill::setTablePrice(double price) {
    tablePrice = price;
}

void Bill::setTableLabel(string label) {
    tableLabel = label;
}

void Bill::applyMemberDiscount(bool status) {
    memberDiscount = status;
}

void Bill::addFood(Food food,int quantity) {
    orderedFoods.push_back(
        make_pair(
            food,
            quantity
        )
    );
}

double Bill::calculateFoodTotal() const {
    double total = 0;
    for (const pair<Food, int>& item: orderedFoods) {
        total += item.first.getPrice() * item.second;
    }

    return total;
}

double Bill::calculateTotal() const {
    double total = tablePrice + calculateFoodTotal();
    if (memberDiscount) {
        total *= 0.9;
    }

    return total;
}

bool Bill::getMemberDiscount() const {
    return memberDiscount;
}

double Bill::getTablePrice() const {
    return tablePrice;
}

string Bill::getTableLabel() const {
    return tableLabel;
}

vector<pair<Food, int>>
Bill::getOrderedFoods() const {
    return orderedFoods;
}