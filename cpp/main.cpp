#include <iostream>
#include <string>

#include "AccountManager.h"
#include "EmployeeManager.h"
#include "Inventory.h"
#include "TableManager.h"
#include "OrderManager.h"
#include "MemberManager.h"


using namespace std;

int main( int argc, char* argv[] ) {
    // argc = 1 -> no command
    if (argc < 2) {
        cout << "INVALID_COMMAND";
        return 0;
    }

    string command = argv[1];

    //  login
    if (command == "login") {
        if (argc < 4) {
            cout << "FAILED";
            return 0;
        }

        string username =argv[2];

        string password =argv[3];

        AccountManager manager;

        manager.loadAccounts("D:/group prj/database/accounts.txt");

        Account loggedIn;

        bool success = manager.login(username,password,loggedIn);

        if (success) {
            cout << "{" << "\"success\":true," << "\"username\":\"" << loggedIn.getUsername() << "\"," << "\"role\":\"" << loggedIn.getRole() << "\"" << "}";

        } else {
            cout << "{" << "\"success\":false" << "}";
        }
        return 0;
    }
    // tables

    TableManager tableManager;

    tableManager.loadTables("../database/tables.txt");

    if (command == "getTables") {
        vector<Table*> tables = tableManager.getTables();
        cout << "[";
        for (int i = 0;i < tables.size();i++) {
            Table* t = tables[i];
            cout << "{" << "\"id\":" << t->getTableId() << "," << "\"number\":\"" << t->getLabel() << "\"," << "\"type\":\"" << t->getType() << "\"," << "\"status\":\"" << ( t->getStatus() ? "occupied" : "available" ) << "\"," << "\"duration\":" << t->getPlayedMinutes() << "," << "\"pricePerHour\":" << t->getPricePerHour() << "}";
            if (i != tables.size() - 1) {
                cout << ",";
            }
        }
        cout << "]";
        return 0;
    }

    if (command == "startTable") {
        if (argc < 3) {
            cout << "FAILED";
            return 0;
        }
        int id = stoi(argv[2]);
        bool success = tableManager.startTable(id);
        cout << ( success ? "SUCCESS" : "FAILED" );

        return 0;
    }

    if (command == "endTable") {
        if (argc < 3) {
            cout << "FAILED";
            return 0;
        }
        int id = stoi(argv[2]);
        bool success = tableManager.endTable(id);
        cout << ( success ? "SUCCESS" : "FAILED" );

        return 0;
    }
    // loads

    Inventory inventory;
    inventory.loadFoods("../database/foods.txt");
    if (command == "getFoods") {
        vector<Food> foods =
            inventory.getFoods();
        cout << "[";
        for ( int i = 0; i < foods.size(); i++ ) {
            Food food = foods[i];
            cout << "{" << "\"id\":" << food.getId() << "," << "\"name\":\"" << food.getName() << "\"," << "\"category\":\"" << food.getCategory() << "\"," << "\"price\":" << food.getPrice() << "," << "\"quantity\":" << food.getQuantity() << "}";
            if (i != foods.size() - 1) {
                cout << ",";
            }
        }
        cout << "]";

        return 0;
    }
    // orders

    OrderManager orderManager;
    orderManager.loadOrders("../database/orders.txt");

    if (command == "getOrders") {
        vector<Order> orders = orderManager.getOrders();
        cout << "[";

        for (int i = 0; i < orders.size(); i++) {
            Order order = orders[i];

            cout << "{" << "\"tableNumber\":\"" << order.getTableNumber() << "\"," << "\"name\":\"" << order.getFoodName() << "\"," << "\"quantity\":" << order.getQuantity() << "," << "\"price\":" << order.getPrice() << "," << "\"status\":\"" << orderManager.getOrderStatus(order) << "\"" << "}";

            if (i != orders.size() - 1) {
                cout << ",";
            }
        }

        cout << "]";
        return 0;
    }

    if (command == "doneOrder") {
        if (argc < 3) {
            cout << "{\"success\":false}";
            return 0;
        }

        bool success = orderManager.markTableOrdersDone(argv[2]);

        cout << "{\"success\":" << (success ? "true" : "false") << "}";
        return 0;
    }

    if (command == "deleteOrder") {
        if (argc < 3) {
            cout << "{\"success\":false}";
            return 0;
        }

        string tableNumber = argv[2];

        vector<Order> tableOrders = orderManager.getTableOrders(tableNumber);

        string error;

        for (const Order& order : tableOrders) {
            inventory.increaseInventoryByName( "../database/inventory.txt", order.getFoodName(), order.getQuantity(), error );
        }
        bool success = orderManager.deleteTableOrders(tableNumber);

        cout << "{\"success\":" << (success ? "true" : "false") << "}";
        return 0;
    }

    if (command == "calculateBill") {

    if (argc < 3) {
        cout << "{\"success\":false}";
        return 0;
    }

    string tableNumber = argv[2];

    string memberName = "";

    if (argc >= 4) {
        memberName = argv[3];
    }

    Table* selectedTable = nullptr;

    vector<Table*> tables = tableManager.getTables();

    for (Table* table : tables) {
        if (table->getLabel() == tableNumber) {
            selectedTable = table;
            break;
        }
    }

    if (!selectedTable) {
        cout << "{\"success\":false}";
        return 0;
    }

    vector<Order> tableOrders = orderManager.getTableOrders(tableNumber);
    double tableCharge = selectedTable->calculateCurrentPrice();
    double foodTotal = orderManager.calculateTableFoodTotal(tableNumber);
    bool memberApplied = false;

    if (memberName != "") {
        MemberManager memberManager;
        memberManager.loadMembers("../database/members.txt");
        memberApplied = memberManager.hasActiveMemberByName( memberName );
    }

    double subtotal = tableCharge + foodTotal;
    double discount = memberApplied ? subtotal * 0.1 : 0;
    double total = subtotal - discount;
    cout << "{" << "\"success\":true," << "\"tableNumber\":\"" << tableNumber << "\"," << "\"tableCharge\":" << tableCharge << "," << "\"foodTotal\":" << foodTotal << "," << "\"discount\":" << discount << "," << "\"total\":" << total << "," << "\"memberApplied\":" << (memberApplied? "true": "false")<< ","<< "\"orders\":[";
    for (int i = 0; i < tableOrders.size(); i++) {
        Order order = tableOrders[i];
        cout << "{" << "\"name\":\"" << order.getFoodName() << "\"," << "\"quantity\":" << order.getQuantity() << "," << "\"price\":" << order.getPrice() << "," << "\"amount\":" << order.getTotal() << "}";
        if (i != tableOrders.size() - 1) {
            cout << ",";
        }
    }
    cout << "]}";

    return 0;
}
if (command == "addOrder") {
    if (argc < 6) {
        cout << "{\"success\":false,\"error\":\"Missing order fields\"}";
        return 0;
    }

    string tableNumber = argv[2];
    string foodName = argv[3];
    int quantity = stoi(argv[4]);
    double price = stod(argv[5]);

    string error;

    bool inventoryReduced =
        inventory.reduceInventoryByName( "../database/inventory.txt", foodName, quantity, error );
    if (!inventoryReduced) {
        cout << "{" << "\"success\":false," << "\"error\":\"" << error << "\"" << "}";
        return 0;
    }
    orderManager.addOrder(Order(tableNumber, foodName, quantity, price));

    cout << "{\"success\":true}";
    return 0;
}

if (command == "calculateBill") {
    if (argc < 3) {
        cout << "{\"success\":false}";
        return 0;
    }

    string tableNumber = argv[2];
    string memberName = argc >= 4 ? argv[3] : "";

    Table* selectedTable = nullptr;

    for (Table* table : tableManager.getTables()) {
        if (table->getLabel() == tableNumber) {
            selectedTable = table;
            break;
        }
    }

    if (!selectedTable) {
        cout << "{\"success\":false}";
        return 0;
    }

    vector<Order> tableOrders = orderManager.getTableOrders(tableNumber);
    double tableCharge = selectedTable->calculateCurrentPrice();
    double foodTotal = orderManager.calculateTableFoodTotal(tableNumber);
    bool memberApplied = false;

    if (memberName != "") {
        MemberManager memberManager;
        memberManager.loadMembers("../database/members.txt");

        for (Member member : memberManager.getMembers()) {
            if (member.getName() == memberName &&member.isActive()) {
                memberApplied = true;
                break;
            }
        }
    }

    double subtotal = tableCharge + foodTotal;
    double discount = memberApplied ? subtotal * 0.1 : 0;
    double total = subtotal - discount;

    cout << "{" << "\"success\":true," << "\"tableNumber\":\"" << tableNumber << "\"," << "\"tableCharge\":" << tableCharge << "," << "\"foodTotal\":" << foodTotal << "," << "\"discount\":" << discount << "," << "\"total\":" << total << "," << "\"memberApplied\":" << (memberApplied ? "true" : "false") << "," << "\"orders\":[";

    for (int i = 0; i < tableOrders.size(); i++) {
        Order order = tableOrders[i];

        cout << "{" << "\"name\":\"" << order.getFoodName() << "\"," << "\"quantity\":" << order.getQuantity() << "," << "\"price\":" << order.getPrice() << "," << "\"amount\":" << order.getTotal() << "}";

        if (i != tableOrders.size() - 1) {
            cout << ",";
        }
    }

    cout << "]}";
    return 0;
}
    if (command == "deleteEmployee") {
        if (argc < 3) {
            cout << "{\"success\":false}";
            return 0;
        }
        int id = stoi(argv[2]);
        EmployeeManager employeeManager;
        employeeManager.loadEmployees("../database/employees.txt");
        bool success = employeeManager.removeEmployee(id);
        cout << "{" << "\"success\":" << ( success ? "true" : "false" ) << "}";

        return 0;
    }

if (command == "addEmployee") {
    if (argc < 9) {
        cout << "{" << "\"success\":false," << "\"error\":\"Missing arguments\"" << "}";

        return 0;
    }
    string type = argv[2];

    int id = stoi(argv[3]);
    string name = argv[4];
    int age = stoi(argv[5]);
    string cccd = argv[6];

    double salaryPerHour = stod(argv[7]);
    int workedHours = stoi(argv[8]);
    double bonus = 0;

    if ( type == "MANAGER" && argc >= 10 ) {
        bonus = stod(argv[9]);
    }
    EmployeeManager employeeManager;
    employeeManager.loadEmployees("../database/employees.txt");
    Employee* employee = nullptr;

    // fulltime employee

    if (type == "FULLTIME") {
        employee = new FullTimeEmployee(name,age,cccd,id,salaryPerHour,workedHours);
    }

    // partime employee

    else if (type == "PARTTIME") {
        employee = new PartTimeEmployee(name,age,cccd,id,salaryPerHour,workedHours);
    }

    // manager 

    else if (type == "MANAGER") {
        employee = new Manager( name, age, cccd, id, salaryPerHour, workedHours, bonus );
    }

    // invalid type
    else {
        cout << "{" << "\"success\":false," << "\"error\":\"Invalid employee type\"" << "}";
        return 0;
    }
    employeeManager.addEmployee(employee);
    cout << "{" << "\"success\":true" << "}";

    return 0;
}
    cout << "UNKNOWN_COMMAND";

    return 0;
}