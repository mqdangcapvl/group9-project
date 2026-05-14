#ifndef INVENTORY_H
#define INVENTORY_H

#include <vector>

#include "Food.h"

class Inventory {
private:
    vector<Food> foods;
public:
    void loadFoods( const string& filename);

    vector<Food> getFoods() const;
    Food* findFood(int id);

    void saveFoods( const string& filename );

    void addFood( const Food& food);

    bool removeFood(int id);
};

#endif