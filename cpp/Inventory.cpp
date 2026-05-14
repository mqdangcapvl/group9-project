#include "Inventory.h"

#include <fstream>
#include <sstream>

void Inventory::loadFoods(
    const string& filename
) {
    foods.clear();
    ifstream file(filename);
    string line;

    while (getline(file, line)) {

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
            Food(
                stoi(idStr),
                name,
                category,
                stod(priceStr),
                stoi(quantityStr)
            )
        );
    }

    file.close();
}

    vector<Food>
    Inventory::getFoods() const {
        return foods;
    }

    Food* Inventory::findFood(int id) {
        for (Food& food : foods) {
            if (food.getId() == id)
                return &food;
        }

        return nullptr;
    }

    void Inventory::saveFoods(
        const string& filename
    ) {
        ofstream file(filename);

        for (Food& food : foods) {
            file
                << food.getId() << ","
                << food.getName() << ","
                << food.getCategory() << ","
                << food.getPrice() << ","
                << food.getQuantity()
                << endl;
        }

        file.close();
    }
    void Inventory::addFood(
        const Food& food
    ) {

        foods.push_back(food);

        saveFoods(
            "../database/foods.txt"
        );
    }

    bool Inventory::removeFood(int id) {

        for (
            auto it = foods.begin();
            it != foods.end();
            ++it
        ) {

            if (it->getId() == id) {

                foods.erase(it);

                saveFoods(
                    "../database/foods.txt"
                );

                return true;
            }
        }

        return false;
    }