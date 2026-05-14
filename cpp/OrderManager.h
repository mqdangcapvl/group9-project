#ifndef ORDERMANAGER_H
#define ORDERMANAGER_H

#include <string>
#include <vector>

#include "Order.h"

using namespace std;

class OrderManager {

private:
    vector<Order> orders;

public:
    void loadOrders( const string& filename );
    void saveOrders( const string& filename );

    vector<Order> getOrders() const;
    vector<Order> getTableOrders( const string& tableNumber ) const;

    void addOrder( const Order& order );

    bool markTableOrdersDone( const string& tableNumber );
    bool deleteTableOrders( const string& tableNumber );

    void clearTableOrders( const string& tableNumber );
    string getOrderStatus( const Order& order ) const;
    double calculateTableFoodTotal( const string& tableNumber ) const;
};

#endif
