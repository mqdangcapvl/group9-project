#include "AccountManager.h"
#include <fstream>
#include <sstream>

void AccountManager::loadAccounts(const string& filename) {
    accounts.clear();

    ifstream file(filename);

    string line;

    while (getline(file, line)) {

        stringstream ss(line);

        string idStr;
        string username;
        string password;
        string role;

        getline(ss, idStr, ',');
        getline(ss, username, ',');
        getline(ss, password, ',');
        getline(ss, role, ',');

        int id = stoi(idStr);

        accounts.push_back(
            Account(id, username, password, role)
        );
    }

    file.close();
}

bool AccountManager::login(
    const string& username,
    const string& password,
    Account& loggedInAccount
) {

    for (auto& acc : accounts) {

        if (acc.getUsername() == username &&acc.getPassword() == password) {
            loggedInAccount = acc;
            return true;
        }
    }
    return false;
}