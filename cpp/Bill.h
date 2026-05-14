#ifndef BILL_H
#define BILL_H

#include <vector>
#include <utility>

#include "Food.h"

using namespace std;

class Bill {

private:
    bool memberDiscount;
    vector<pair<Food, int>> orderedFoods;

    double tablePrice;
    string tableLabel;

public:
    Bill();

    void applyMemberDiscount( bool status );
    void setTablePrice( double price );
    void setTableLabel( string label );
    void addFood( Food food, int quantity );

    double calculateFoodTotal() const;
    double calculateTotal() const;

    bool getMemberDiscount() const;
    double getTablePrice() const;
    string getTableLabel() const;

    vector<pair<Food, int>>
    getOrderedFoods() const;
};

#endif