#include "Inventory.h"

#include <algorithm>
#include <cctype>
#include <fstream>
#include <sstream>

static string normalizeText(string value) {
    value.erase( value.begin(), find_if( value.begin(), value.end(), [](unsigned char ch) {
        return !isspace(ch);
        })
    );

    value.erase( find_if( value.rbegin(), value.rend(), [](unsigned char ch) { return !isspace(ch); } ).base(),
    value.end()
    );

    transform( value.begin(), value.end(), value.begin(), [](unsigned char ch) {
        return tolower(ch);
    });
    return value;
}

void Inventory::loadFoods(const string& filename) {
    foods.clear();

    ifstream file(filename);
    string line;

    while (getline(file, line)) {
        if (line.empty()) {
            continue;
        }

        stringstream ss(line);

        string idStr;
        string name;
        string category;
        string priceStr;
        string quantityStr;

        getline(ss, idStr, ',');
        getline(ss, name, ',');
        getline(ss, category, ',');
        getline(ss, priceStr, ',');
        getline(ss, quantityStr, ',');

        foods.push_back(
            Food( stoi(idStr), name, category, stod(priceStr), stoi(quantityStr) )
        );
    }

    file.close();
}

vector<Food> Inventory::getFoods() const {
    return foods;
}

Food* Inventory::findFood(int id) {
    for (Food& food : foods) {
        if (food.getId() == id) {
            return &food;
        }
    }

    return nullptr;
}

void Inventory::saveFoods(const string& filename) {
    ofstream file(filename);

    for (Food& food : foods) {
        file << food.getId() << "," << food.getName() << "," << food.getCategory() << "," << food.getPrice() << "," << food.getQuantity() << endl;
    }

    file.close();
}

void Inventory::addFood(const Food& food) {
    foods.push_back(food);

    saveFoods("../database/foods.txt");
}

bool Inventory::removeFood(int id) {
    for ( auto it = foods.begin(); it != foods.end(); ++it) {
        if (it->getId() == id) {
            foods.erase(it);
            saveFoods("../database/foods.txt");
            return true;
        }
    }
    return false;
}

vector<InventoryItem> Inventory::loadInventoryItems(const string& filename) {
    vector<InventoryItem> items;

    ifstream file(filename);
    string line;

    while (getline(file, line)) {
        if (line.empty() || line.find("format") == 0) {
            continue;
        }

        stringstream ss(line);

        string idStr;
        string name;
        string category;
        string quantityStr;
        string unit;
        string minStockStr;
        string priceStr;

        getline(ss, idStr, ',');
        getline(ss, name, ',');
        getline(ss, category, ',');
        getline(ss, quantityStr, ',');
        getline(ss, unit, ',');
        getline(ss, minStockStr, ',');
        getline(ss, priceStr, ',');

        InventoryItem item;

        item.id = stoi(idStr);
        item.name = name;
        item.category = category;
        item.quantity = stoi(quantityStr);
        item.unit = unit;
        item.minStock = stoi(minStockStr);
        item.price = stod(priceStr);

        items.push_back(item);
    }

    file.close();

    return items;
}

void Inventory::saveInventoryItems( const string& filename, const vector<InventoryItem>& items ) {
    ofstream file(filename);

    for (const InventoryItem& item : items) {
        file << item.id << "," << item.name << "," << item.category << "," << item.quantity << "," << item.unit << "," << item.minStock << "," << item.price << endl;
    }

    file.close();
}

bool Inventory::reduceInventoryByName( const string& filename, const string& itemName, int quantity, string& error ) {
    if (quantity <= 0) {
        error = "Quantity must be greater than 0";
        return false;
    }

    vector<InventoryItem> items = loadInventoryItems(filename);
    string targetName = normalizeText(itemName);

    int totalAvailable = 0;

    for (const InventoryItem& item : items) {
        if (normalizeText(item.name) == targetName) {
            totalAvailable += item.quantity;
        }
    }

    if (totalAvailable == 0) {
        error = "Food " + itemName + " does not exist in inventory";
        return false;
    }

    if (totalAvailable < quantity) {
        error = "Not enough " + itemName + " in inventory";
        return false;
    }

    int remaining = quantity;

    for (InventoryItem& item : items) {
        if (normalizeText(item.name) != targetName) {
            continue;
        }

        int used = min(item.quantity, remaining);
        item.quantity -= used;
        remaining -= used;

        if (remaining == 0) {
            break;
        }
    }

    saveInventoryItems(filename, items);
    return true;
}
bool Inventory::increaseInventoryByName( const string& filename, const string& itemName, int quantity, string& error ) {
    if (quantity <= 0) {
        error = "Quantity must be greater than 0";
        return false;
    }

    vector<InventoryItem> items = loadInventoryItems(filename);
    string targetName = normalizeText(itemName);

    for (InventoryItem& item : items) {
        if (normalizeText(item.name) == targetName) {
            item.quantity += quantity;
            saveInventoryItems(filename, items);
            return true;
        }
    }

    error = "Food " + itemName + " does not exist in inventory";
    return false;
}