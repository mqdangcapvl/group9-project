#ifndef INVENTORY_H
#define INVENTORY_H

#include <vector>
#include "Food.h"
#include <string>

struct InventoryItem {
    int id;
    string name;
    string category;
    int quantity;
    string unit;
    int minStock;
    double price;
};

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

    vector<InventoryItem> loadInventoryItems(const string& filename);
    
    void saveInventoryItems(const string& filename, const vector<InventoryItem>& items);
    bool reduceInventoryByName(
        const string& filename,
        const string& itemName,
        int quantity,
        string& error
    );
};

#endif