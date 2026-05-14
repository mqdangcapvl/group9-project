#ifndef FOOD_H
#define FOOD_H

#include <string>

using namespace std;

class Food {

private:
    int id;
    string name;
    string category;
    double price;
    int quantity;
public:
    Food( int id = 0, string name = "", string category = "", double price = 0, int quantity = 0);
    
    int getId() const;
    string getName() const;
    string getCategory() const;
    double getPrice() const;
    int getQuantity() const;
    
    void setQuantity(int q);
    bool reduceQuantity(int q);
};

#endif