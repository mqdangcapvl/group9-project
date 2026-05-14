#ifndef ORDER_H
#define ORDER_H

#include <string>

using namespace std;

class Order {

private:
    string tableNumber;
    string foodName;
    int quantity;
    double price;

public:
    Order( string tableNumber = "", string foodName = "", int quantity = 0, double price = 0 );

    string getTableNumber() const;
    string getFoodName() const;

    int getQuantity() const;

    double getPrice() const;
    double getTotal() const;
};

#endif