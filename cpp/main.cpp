#include <algorithm>
#include <cctype>
#include <ctime>
#include <fstream>
#include <iomanip>
#include <iostream>
#include <sstream>
#include <string>
#include <vector>

#include "AccountManager.h"
#include "EmployeeManager.h"
#include "Inventory.h"
#include "TableManager.h"
#include "OrderManager.h"
#include "MemberManager.h"
#include "Salary.h"

using namespace std;

static string jsonEscape(const string& value) {
    string result;

    for (char ch : value) {
        if (ch == '"') {
            result += "\\\"";
        } else if (ch == '\\') {
            result += "\\\\";
        } else {
            result += ch;
        }
    }

    return result;
}

static string normalizeTextMain(string value) {
    value.erase(
        value.begin(),
        find_if(
            value.begin(),
            value.end(),
            [](unsigned char ch) {
                return !isspace(ch);
            }
        )
    );

    value.erase(
        find_if(
            value.rbegin(),
            value.rend(),
            [](unsigned char ch) {
                return !isspace(ch);
            }
        ).base(),
        value.end()
    );

    transform(
        value.begin(),
        value.end(),
        value.begin(),
        [](unsigned char ch) {
            return tolower(ch);
        }
    );

    return value;
}

static vector<string> readLines(const string& filename) {
    vector<string> lines;
    ifstream file(filename);
    string line;

    while (getline(file, line)) {
        if (!line.empty() && line.find("format") != 0) {
            lines.push_back(line);
        }
    }

    return lines;
}

static void writeLines(const string& filename, const vector<string>& lines) {
    ofstream file(filename);

    for (const string& line : lines) {
        file << line << endl;
    }
}

static vector<string> splitCsv(const string& line) {
    vector<string> parts;
    stringstream ss(line);
    string part;

    while (getline(ss, part, ',')) {
        parts.push_back(part);
    }

    return parts;
}

static string todayString() {
    time_t now = time(nullptr);
    tm* local = localtime(&now);

    stringstream ss;
    ss << put_time(local, "%Y-%m-%d");

    return ss.str();
}
static string nowDateTimeString() {
    time_t now = time(nullptr);
    tm* local = localtime(&now);

    stringstream ss;
    ss << put_time(local, "%Y-%m-%d %H:%M:%S");

    return ss.str();
}

static string addBillMetadata(const string& json) {
    if (json.size() < 2 || json[0] != '{') {
        return json;
    }

    string result = "{";
    result += "\"id\":" + to_string(time(nullptr)) + ",";
    result += "\"paidAt\":\"" + nowDateTimeString() + "\",";
    result += "\"paidAtText\":\"" + nowDateTimeString() + "\",";

    result += json.substr(1);

    return result;
}
static string employeePositionFromType(const string& type) {
    if (type == "MANAGER") {
        return "Manager";
    }

    if (type == "PARTTIME") {
        return "Part-time Employee";
    }

    return "Full-time Employee";
}

static string employeeTypeFromPosition(const string& position) {
    if (position == "Manager") {
        return "MANAGER";
    }

    if (position == "Part-time Employee") {
        return "PARTTIME";
    }

    return "FULLTIME";
}

static double calculateSalaryByType(
    const string& type,
    double baseSalary,
    int hoursWorked,
    double bonus
) {
    if (type == "PARTTIME") {
        PartTimeSalary salary(baseSalary, hoursWorked, bonus);
        return salary.calculate();
    }

    if (type == "MANAGER") {
        ManagerSalary salary(baseSalary, hoursWorked, bonus);
        return salary.calculate();
    }

    FullTimeSalary salary(baseSalary, hoursWorked, bonus);
    return salary.calculate();
}

static int nextIdFromFile(const string& filename, int idIndex) {
    vector<string> lines = readLines(filename);
    int maxId = 0;

    for (const string& line : lines) {
        vector<string> parts = splitCsv(line);

        if (parts.size() > idIndex) {
            maxId = max(maxId, stoi(parts[idIndex]));
        }
    }

    return maxId + 1;
}

static void printInventoryItems(vector<InventoryItem> items) {
    cout << "[";

    for (int i = 0; i < items.size(); i++) {
        InventoryItem item = items[i];

        cout << "{" << "\"id\":" << item.id << "," << "\"name\":\"" << jsonEscape(item.name) << "\"," << "\"category\":\"" << jsonEscape(item.category) << "\"," << "\"quantity\":" << item.quantity << "," << "\"unit\":\"" << jsonEscape(item.unit) << "\"," << "\"minStock\":" << item.minStock << "," << "\"price\":" << item.price << "," << "\"status\":\"" << (item.quantity <= item.minStock ? "Low Stock" : "In Stock") << "\"," << "\"totalValue\":" << item.quantity * item.price << "}";

        if (i != items.size() - 1) {
            cout << ",";
        }
    }

    cout << "]";
}

int main(int argc, char* argv[]) {
    if (argc < 2) {
        cout << "INVALID_COMMAND";
        return 0;
    }

    string command = argv[1];

    if (command == "login") {
        if (argc < 4) {
            cout << "{\"success\":false}";
            return 0;
        }

        AccountManager manager;
        manager.loadAccounts("../database/accounts.txt");

        Account loggedIn;
        bool success = manager.login(argv[2], argv[3], loggedIn);

        if (success) {
            cout
                << "{"
                << "\"success\":true,"
                << "\"username\":\"" << jsonEscape(loggedIn.getUsername()) << "\","
                << "\"role\":\"" << jsonEscape(loggedIn.getRole()) << "\""
                << "}";
        } else {
            cout << "{\"success\":false}";
        }

        return 0;
    }

    TableManager tableManager;
    tableManager.loadTables("../database/tables.txt");

    Inventory inventory;
    inventory.loadFoods("../database/foods.txt");

    OrderManager orderManager;
    orderManager.loadOrders("../database/orders.txt");

    if (command == "getTables") {
        vector<Table*> tables = tableManager.getTables();

        cout << "[";

        for (int i = 0; i < tables.size(); i++) {
            Table* table = tables[i];
            cout << "{" << "\"id\":" << table->getTableId() << "," << "\"number\":\"" << jsonEscape(table->getLabel()) << "\"," << "\"type\":\"" << jsonEscape(table->getType()) << "\"," << "\"status\":\"" << (table->getStatus() ? "occupied" : "available") << "\"," << "\"duration\":" << table->getPlayedMinutes() << "," << "\"pricePerHour\":" << table->getPricePerHour() << "}";
            if (i != tables.size() - 1) {
                cout << ",";
            }
        }

        cout << "]";
        return 0;
    }

    if (command == "startTable") {
        if (argc < 3) {
            cout << "{\"success\":false}";
            return 0;
        }

        bool success = tableManager.startTable(stoi(argv[2]));

        cout << "{\"success\":" << (success ? "true" : "false") << "}";
        return 0;
    }

    if (command == "endTable") {
        if (argc < 3) {
            cout << "{\"success\":false}";
            return 0;
        }

        bool success = tableManager.endTable(stoi(argv[2]));

        cout << "{\"success\":" << (success ? "true" : "false") << "}";
        return 0;
    }

    if (command == "getMenu") {
    vector<InventoryItem> items =
        inventory.loadInventoryItems("../database/inventory.txt");

    printInventoryItems(items);
    return 0;
    }

    if (command == "getInventory") {
        vector<InventoryItem> items =
            inventory.loadInventoryItems("../database/inventory.txt");

        int lowStockCount = 0;
        double totalValue = 0;

        for (const InventoryItem& item : items) {
            if (item.quantity <= item.minStock) {
                lowStockCount++;
            }

            totalValue += item.quantity * item.price;
        }

        cout << "{";
        cout << "\"summary\":{";
        cout << "\"totalItems\":" << items.size() << ",";
        cout << "\"lowStockItems\":" << lowStockCount << ",";
        cout << "\"totalValue\":" << totalValue;
        cout << "},";
        cout << "\"items\":";

        printInventoryItems(items);

        cout << "}";
        return 0;
    }

    if (command == "addInventoryItem") {
        if (argc < 8) {
            cout << "{\"success\":false,\"error\":\"Missing inventory fields\"}";
            return 0;
        }

        string name = argv[2];
        string category = argv[3];
        int quantity = stoi(argv[4]);
        string unit = argv[5];
        int minStock = stoi(argv[6]);
        double price = stod(argv[7]);

        vector<InventoryItem> items =
            inventory.loadInventoryItems("../database/inventory.txt");

        bool updated = false;

        for (InventoryItem& item : items) {
            if (
                normalizeTextMain(item.name) == normalizeTextMain(name) &&
                normalizeTextMain(item.category) == normalizeTextMain(category) &&
                normalizeTextMain(item.unit) == normalizeTextMain(unit)
            ) {
                item.quantity += quantity;
                item.minStock = minStock;
                item.price = price;
                updated = true;
                break;
            }
        }

        if (!updated) {
            InventoryItem item;
            item.id = nextIdFromFile("../database/inventory.txt", 0);
            item.name = name;
            item.category = category;
            item.quantity = quantity;
            item.unit = unit;
            item.minStock = minStock;
            item.price = price;

            items.push_back(item);
        }

        inventory.saveInventoryItems("../database/inventory.txt", items);

        cout << "{\"success\":true}";
        return 0;
    }

    if (command == "getOrders") {
        vector<Order> orders = orderManager.getOrders();
        vector<string> tableNumbers;

        for (const Order& order : orders) {
            if (
                find(
                    tableNumbers.begin(),
                    tableNumbers.end(),
                    order.getTableNumber()
                ) == tableNumbers.end()
            ) {
                tableNumbers.push_back(order.getTableNumber());
            }
        }

        cout << "[";

        for (int i = 0; i < tableNumbers.size(); i++) {
            string tableNumber = tableNumbers[i];
            double total = 0;
            bool firstItem = true;

            cout
                << "{"
                << "\"id\":" << i + 1 << ","
                << "\"tableNumber\":\"" << jsonEscape(tableNumber) << "\","
                << "\"items\":[";

            for (const Order& order : orders) {
                if (order.getTableNumber() != tableNumber) {
                    continue;
                }

                if (!firstItem) {
                    cout << ",";
                }

                cout << "{" << "\"name\":\"" << jsonEscape(order.getFoodName()) << "\"," << "\"quantity\":" << order.getQuantity() << "," << "\"price\":" << order.getPrice() << "," << "\"amount\":" << order.getTotal() << "," << "\"status\":\"" << orderManager.getOrderStatus(order) << "\"" << "}";

                total += order.getTotal();
                firstItem = false;
            }

            cout << "]," << "\"total\":" << total << "}";

            if (i != tableNumbers.size() - 1) {
                cout << ",";
            }
        }

        cout << "]";
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
            inventory.reduceInventoryByName(
                "../database/inventory.txt",
                foodName,
                quantity,
                error
            );

        if (!inventoryReduced) {
            cout << "{" << "\"success\":false," << "\"error\":\"" << jsonEscape(error) << "\"" << "}";
            return 0;
        }

        orderManager.addOrder(
            Order(tableNumber, foodName, quantity, price)
        );

        cout << "{\"success\":true}";
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
        vector<Order> tableOrders =
            orderManager.getTableOrders(tableNumber);

        string error;

        for (const Order& order : tableOrders) {
            inventory.increaseInventoryByName(
                "../database/inventory.txt",
                order.getFoodName(),
                order.getQuantity(),
                error
            );
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
        string memberName = argc >= 4 ? argv[3] : "";

        Table* selectedTable = nullptr;

        for (Table* table : tableManager.getTables()) {
            if (table->getLabel() == tableNumber) {
                selectedTable = table;
                break;
            }
        }

        if (!selectedTable) {
            cout << "{\"success\":false,\"error\":\"Table not found\"}";
            return 0;
        }

        vector<Order> tableOrders =
            orderManager.getTableOrders(tableNumber);

        double tableCharge =
            selectedTable->calculateCurrentPrice();

        double foodTotal =
            orderManager.calculateTableFoodTotal(tableNumber);

        bool memberApplied = false;

        if (memberName != "") {
            MemberManager memberManager;
            memberManager.loadMembers("../database/members.txt");

            memberApplied =
                memberManager.hasActiveMemberByName(memberName);
        }

        double subtotal = tableCharge + foodTotal;
        double discount = memberApplied ? subtotal * 0.1 : 0;
        double total = subtotal - discount;

        cout << "{" << "\"success\":true," << "\"tableNumber\":\"" << jsonEscape(tableNumber) << "\"," << "\"tableCharge\":" << tableCharge << "," << "\"foodTotal\":" << foodTotal << "," << "\"discount\":" << discount << "," << "\"total\":" << total << "," << "\"memberApplied\":" << (memberApplied ? "true" : "false") << "," << "\"orders\":[";

        for (int i = 0; i < tableOrders.size(); i++) {
            Order order = tableOrders[i];

            cout << "{" << "\"name\":\"" << jsonEscape(order.getFoodName()) << "\"," << "\"quantity\":" << order.getQuantity() << "," << "\"price\":" << order.getPrice() << "," << "\"amount\":" << order.getTotal() << "}";

            if (i != tableOrders.size() - 1) {
                cout << ",";
            }
        }

        cout << "]}";
        return 0;
    }

    if (command == "getEmployees") {
        EmployeeManager employeeManager;
        employeeManager.loadEmployees("../database/employees.txt");

        vector<Employee*> employees =
            employeeManager.getEmployees();

        cout << "[";

        for (int i = 0; i < employees.size(); i++) {
            Employee* employee = employees[i];

            string type = "FULLTIME";
            double salaryPerHour = 0;
            int workedHours = 0;
            double bonus = 0;

            Manager* manager = dynamic_cast<Manager*>(employee);
            PartTimeEmployee* partTime = dynamic_cast<PartTimeEmployee*>(employee);
            FullTimeEmployee* fullTime = dynamic_cast<FullTimeEmployee*>(employee);

            if (manager) {
                type = "MANAGER";
                salaryPerHour = manager->getSalaryPerHour();
                workedHours = manager->getWorkedHours();
                bonus = manager->getBonus();
            } else if (partTime) {
                type = "PARTTIME";
                salaryPerHour = partTime->getSalaryPerHour();
                workedHours = partTime->getWorkedHours();
            } else if (fullTime) {
                type = "FULLTIME";
                salaryPerHour = fullTime->getSalaryPerHour();
                workedHours = fullTime->getWorkedHours();
            }

            cout << "{" << "\"id\":" << employee->getId() << "," << "\"name\":\"" << jsonEscape(employee->getName()) << "\"," << "\"age\":" << employee->getAge() << "," << "\"cccd\":\"" << jsonEscape(employee->getCccd()) << "\"," << "\"type\":\"" << type << "\"," << "\"position\":\"" << employeePositionFromType(type) << "\"," << "\"salaryPerHour\":" << salaryPerHour << "," << "\"workedHours\":" << workedHours << "," << "\"bonus\":" << bonus << "}";

            if (i != employees.size() - 1) {
                cout << ",";
            }
        }

        cout << "]";
        return 0;
    }

    if (command == "addEmployeeAuto") {
        if (argc < 9) {
            cout << "{\"success\":false,\"error\":\"Missing employee fields\"}";
            return 0;
        }

        string position = argv[2];
        string type = employeeTypeFromPosition(position);
        string name = argv[3];
        int age = stoi(argv[4]);
        string cccd = argv[5];
        double salaryPerHour = stod(argv[6]);
        int workedHours = stoi(argv[7]);
        double bonus = stod(argv[8]);

        int id = nextIdFromFile("../database/employees.txt", 1);

        EmployeeManager employeeManager;
        employeeManager.loadEmployees("../database/employees.txt");

        Employee* employee = nullptr;

        if (type == "MANAGER") {
            employee = new Manager(
                name,
                age,
                cccd,
                id,
                salaryPerHour,
                workedHours,
                bonus
            );
        } else if (type == "PARTTIME") {
            employee = new PartTimeEmployee(
                name,
                age,
                cccd,
                id,
                salaryPerHour,
                workedHours
            );
        } else {
            employee = new FullTimeEmployee(
                name,
                age,
                cccd,
                id,
                salaryPerHour,
                workedHours
            );
        }

        employeeManager.addEmployee(employee);

        cout << "{\"success\":true}";
        return 0;
    }

    if (command == "addEmployee") {
        if (argc < 9) {
            cout << "{\"success\":false,\"error\":\"Missing arguments\"}";
            return 0;
        }

        string type = argv[2];
        int id = stoi(argv[3]);
        string name = argv[4];
        int age = stoi(argv[5]);
        string cccd = argv[6];
        double salaryPerHour = stod(argv[7]);
        int workedHours = stoi(argv[8]);
        double bonus = argc >= 10 ? stod(argv[9]) : 0;

        EmployeeManager employeeManager;
        employeeManager.loadEmployees("../database/employees.txt");

        Employee* employee = nullptr;

        if (type == "MANAGER") {
            employee = new Manager(
                name,
                age,
                cccd,
                id,
                salaryPerHour,
                workedHours,
                bonus
            );
        } else if (type == "PARTTIME") {
            employee = new PartTimeEmployee(
                name,
                age,
                cccd,
                id,
                salaryPerHour,
                workedHours
            );
        } else if (type == "FULLTIME") {
            employee = new FullTimeEmployee(
                name,
                age,
                cccd,
                id,
                salaryPerHour,
                workedHours
            );
        } else {
            cout << "{\"success\":false,\"error\":\"Invalid employee type\"}";
            return 0;
        }

        employeeManager.addEmployee(employee);

        cout << "{\"success\":true}";
        return 0;
    }

    if (command == "deleteEmployee") {
        if (argc < 3) {
            cout << "{\"success\":false}";
            return 0;
        }

        EmployeeManager employeeManager;
        employeeManager.loadEmployees("../database/employees.txt");

        bool success =
            employeeManager.removeEmployee(stoi(argv[2]));

        vector<string> assignmentLines =
            readLines("../database/employee_assignments.txt");

        vector<string> keptAssignments;

        for (const string& line : assignmentLines) {
            vector<string> parts = splitCsv(line);

            if (parts.size() > 0 && stoi(parts[0]) == stoi(argv[2])) {
                continue;
            }

            keptAssignments.push_back(line);
        }

        writeLines("../database/employee_assignments.txt", keptAssignments);

        cout << "{\"success\":" << (success ? "true" : "false") << "}";
        return 0;
    }

    if (command == "getSalaries") {
        vector<string> lines =
            readLines("../database/salaries.txt");

        double totalSalaries = 0;
        int calculatedCount = 0;

        vector<vector<string>> salaryRows;

        for (const string& line : lines) {
            vector<string> parts = splitCsv(line);

            if (parts.size() < 5) {
                continue;
            }

            totalSalaries += stod(parts[4]);
            calculatedCount++;

            salaryRows.push_back(parts);
        }

        cout << "{";
        cout << "\"summary\":{";
        cout << "\"totalSalaries\":" << totalSalaries << ",";
        cout << "\"calculatedCount\":" << calculatedCount;
        cout << "},";

        cout << "\"salaries\":[";

        for (int i = 0; i < salaryRows.size(); i++) {
            vector<string> parts = salaryRows[i];

            cout
                << "{"
                << "\"employeeId\":" << parts[0] << ","
                << "\"baseSalary\":" << parts[1] << ","
                << "\"hoursWorked\":" << parts[2] << ","
                << "\"bonus\":" << parts[3] << ","
                << "\"totalSalary\":" << parts[4]
                << "}";

            if (i != salaryRows.size() - 1) {
                cout << ",";
            }
        }

        cout << "]";
        cout << "}";

        return 0;
    }

    if (command == "saveSalary") {
        if (argc < 6) {
            cout << "{\"success\":false,\"error\":\"Missing salary fields\"}";
            return 0;
        }

        int employeeId = stoi(argv[2]);
        double baseSalary = stod(argv[3]);
        int hoursWorked = stoi(argv[4]);
        double bonus = stod(argv[5]);

        vector<string> employeeLines =
            readLines("../database/employees.txt");

        string type = "FULLTIME";
        bool employeeFound = false;

        for (const string& line : employeeLines) {
            vector<string> parts = splitCsv(line);

            if (parts.size() > 1 && stoi(parts[1]) == employeeId) {
                type = parts[0];
                employeeFound = true;
                break;
            }
        }

        if (!employeeFound) {
            cout << "{\"success\":false,\"error\":\"Employee not found\"}";
            return 0;
        }

        double totalSalary =
            calculateSalaryByType(
                type,
                baseSalary,
                hoursWorked,
                bonus
            );

        vector<string> lines =
            readLines("../database/salaries.txt");

        vector<string> nextLines;
        bool updated = false;

        for (const string& line : lines) {
            vector<string> parts = splitCsv(line);

            if (parts.size() > 0 && stoi(parts[0]) == employeeId) {
                stringstream ss;
                ss
                    << employeeId << ","
                    << baseSalary << ","
                    << hoursWorked << ","
                    << bonus << ","
                    << totalSalary;

                nextLines.push_back(ss.str());
                updated = true;
            } else {
                nextLines.push_back(line);
            }
        }

        if (!updated) {
            stringstream ss;
            ss
                << employeeId << ","
                << baseSalary << ","
                << hoursWorked << ","
                << bonus << ","
                << totalSalary;

            nextLines.push_back(ss.str());
        }

        writeLines("../database/salaries.txt", nextLines);

        cout << "{" << "\"success\":true," << "\"salary\":{" << "\"employeeId\":" << employeeId << "," << "\"baseSalary\":" << baseSalary << "," << "\"hoursWorked\":" << hoursWorked << "," << "\"bonus\":" << bonus << "," << "\"totalSalary\":" << totalSalary << "}" << "}";

        return 0;
    }

    if (command == "getMembers") {
        MemberManager memberManager;
        memberManager.loadMembers("../database/members.txt");

        vector<Member> members =
            memberManager.getMembers();

        int activeMembers = 0;

        for (const Member& member : members) {
            if (member.isActive()) {
                activeMembers++;
            }
        }

        cout << "{";
        cout << "\"summary\":{";
        cout << "\"totalMembers\":" << members.size() << ",";
        cout << "\"activeMembers\":" << activeMembers;
        cout << "},";
        cout << "\"members\":[";

        for (int i = 0; i < members.size(); i++) {
            Member member = members[i];

            cout
                << "{"
                << "\"id\":" << member.getId() << ","
                << "\"name\":\"" << jsonEscape(member.getName()) << "\","
                << "\"phoneNumber\":\"" << jsonEscape(member.getPhoneNumber()) << "\","
                << "\"citizenId\":\"" << jsonEscape(member.getCitizenId()) << "\","
                << "\"joinDate\":\"" << jsonEscape(member.getJoinDate()) << "\","
                << "\"joinDateText\":\"" << jsonEscape(member.getJoinDate()) << "\","
                << "\"status\":\"" << (member.isActive() ? "active" : "inactive") << "\""
                << "}";

            if (i != members.size() - 1) {
                cout << ",";
            }
        }

        cout << "]}";
        return 0;
    }

    if (command == "addMember") {
        if (argc < 5) {
            cout << "{\"success\":false,\"error\":\"Missing member fields\"}";
            return 0;
        }

        int id = nextIdFromFile("../database/members.txt", 0);

        vector<string> lines =
            readLines("../database/members.txt");

        stringstream ss;
        ss
            << id << ","
            << argv[2] << ","
            << argv[3] << ","
            << argv[4] << ","
            << todayString() << ","
            << "1";

        lines.push_back(ss.str());
        writeLines("../database/members.txt", lines);

        cout << "{\"success\":true}";
        return 0;
    }

    if (command == "deleteMember") {
        if (argc < 3) {
            cout << "{\"success\":false}";
            return 0;
        }

        int id = stoi(argv[2]);

        vector<string> lines = readLines("../database/members.txt");

        vector<string> nextLines;
        bool deleted = false;

        for (const string& line : lines) {
            vector<string> parts = splitCsv(line);

            if (parts.size() > 0 && stoi(parts[0]) == id) {
                deleted = true;
                continue;
            }

            nextLines.push_back(line);
        }

        writeLines("../database/members.txt", nextLines);

        cout << "{\"success\":" << (deleted ? "true" : "false") << "}";
        return 0;
    }

    if (command == "getEmployeeAssignments") {
        vector<string> lines =
            readLines("../database/employee_assignments.txt");

        cout << "[";

        for (int i = 0; i < lines.size(); i++) {
            vector<string> parts = splitCsv(lines[i]);

            if (parts.size() < 2) {
                continue;
            }

            cout << "{" << "\"employeeId\":" << parts[0] << "," << "\"tableId\":" << parts[1] << "}";

            if (i != lines.size() - 1) {
                cout << ",";
            }
        }

        cout << "]";
        return 0;
    }

    if (command == "saveEmployeeAssignments") {
        if (argc < 3) {
            cout << "{\"success\":false,\"error\":\"Missing employeeId\"}";
            return 0;
        }

        int employeeId = stoi(argv[2]);
        vector<int> tableIds;

        for (int i = 3; i < argc; i++) {
            tableIds.push_back(stoi(argv[i]));
        }

        vector<string> lines = readLines("../database/employee_assignments.txt");

        vector<string> nextLines;

        for (const string& line : lines) {
            vector<string> parts = splitCsv(line);

            if (parts.size() < 2) {
                continue;
            }

            int currentEmployeeId = stoi(parts[0]);
            int currentTableId = stoi(parts[1]);

            if (currentEmployeeId == employeeId) {
                continue;
            }

            for (int tableId : tableIds) {
                if (currentTableId == tableId) {
                    cout << "{\"success\":false,\"error\":\"This table is already assigned\"}";
                    return 0;
                }
            }

            nextLines.push_back(line);
        }

        for (int tableId : tableIds) {
            stringstream ss;
            ss << employeeId << "," << tableId;
            nextLines.push_back(ss.str());
        }

        writeLines("../database/employee_assignments.txt", nextLines);

        cout << "{\"success\":true}";
        return 0;
    }

    if (command == "deleteEmployeeAssignments") {
        if (argc < 3) {
            cout << "{\"success\":false}";
            return 0;
        }

        int employeeId = stoi(argv[2]);

        vector<string> lines = readLines("../database/employee_assignments.txt");

        vector<string> nextLines;
        bool deleted = false;

        for (const string& line : lines) {
            vector<string> parts = splitCsv(line);

            if (parts.size() > 0 && stoi(parts[0]) == employeeId) {
                deleted = true;
                continue;
            }

            nextLines.push_back(line);
        }

        writeLines("../database/employee_assignments.txt", nextLines);

        cout << "{\"success\":" << (deleted ? "true" : "false") << "}";
        return 0;
    }

    if (command == "getBillHistory") {
        string tableNumber = argc >= 3 ? argv[2] : "";

        vector<string> lines = readLines("../database/bill.txt");

        cout << "[";

        bool first = true;

        for (const string& line : lines) {
            if (
                tableNumber != "" &&
                line.find("\"tableNumber\":\"" + tableNumber + "\"") == string::npos
            ) {
                continue;
            }

            if (!first) {
                cout << ",";
            }

            cout << line;
            first = false;
        }

        cout << "]";
        return 0;
    }

    if (command == "saveBillHistory") {
        if (argc < 3) {
            cout << "{\"success\":false,\"error\":\"Missing bill data\"}";
            return 0;
        }

        string billJson =
            addBillMetadata(argv[2]);

        ofstream file("../database/bill.txt", ios::app);
        file << billJson << endl;
        file.close();

        cout << "{\"success\":true}";
        return 0;
    }

    if (command == "getDashboard") {
        vector<string> tableLines = readLines("../database/tables.txt");
        vector<string> employeeLines = readLines("../database/employees.txt");
        vector<InventoryItem> inventoryItems = inventory.loadInventoryItems("../database/inventory.txt");
        vector<Order> orders = orderManager.getOrders();

        int totalTables = tableLines.size();
        int occupiedTables = 0;
        int vipTables = 0;
        int vipOccupied = 0;
        int normalTables = 0;
        int normalOccupied = 0;
        int lowStockItems = 0;

        vector<string> recentActivities;

        for (const string& line : tableLines) {
            vector<string> parts = splitCsv(line);

            if (parts.size() < 4) {
                continue;
            }

            bool occupied = parts[3] == "occupied";
            bool vip = parts[1] == "VIP";

            if (occupied) {
                occupiedTables++;
                recentActivities.push_back("Table " + parts[0] + " started");
            }

            if (vip) {
                vipTables++;
                if (occupied) {
                    vipOccupied++;
                }
            } else {
                normalTables++;
                if (occupied) {
                    normalOccupied++;
                }
            }
        }

        for (const InventoryItem& item : inventoryItems) {
            if (item.quantity <= item.minStock) {
                lowStockItems++;
                recentActivities.push_back(item.name + " low stock");
            }
        }

        for (const Order& order : orders) {
            recentActivities.push_back("Food order - Table " + order.getTableNumber());
        }

        cout << "{";

        cout << "\"summary\":{";
        cout << "\"totalEmployees\":" << employeeLines.size() << ",";
        cout << "\"totalTables\":" << totalTables << ",";
        cout << "\"occupiedTables\":" << occupiedTables << ",";
        cout << "\"availableTables\":" << totalTables - occupiedTables << ",";
        cout << "\"vipTables\":" << vipTables << ",";
        cout << "\"vipOccupied\":" << vipOccupied << ",";
        cout << "\"normalTables\":" << normalTables << ",";
        cout << "\"normalOccupied\":" << normalOccupied << ",";
        cout << "\"inventoryItems\":" << inventoryItems.size() << ",";
        cout << "\"foodItems\":" << inventoryItems.size() << ",";
        cout << "\"lowStockItems\":" << lowStockItems;
        cout << "},";

        cout << "\"recentActivities\":[";
        for (int i = 0; i < recentActivities.size() && i < 5; i++) {
            cout << "\"" << jsonEscape(recentActivities[i]) << "\"";

            if (i != recentActivities.size() - 1 && i < 4) {
                cout << ",";
            }
        }
        cout << "]";

        cout << "}";

        return 0;
    }

    cout << "UNKNOWN_COMMAND";
    return 0;
}