#ifndef ACCOUNTMANAGER_H
#define ACCOUNTMANAGER_H

#include "Account.h"
#include <vector>

class AccountManager {
private:
    vector<Account> accounts;

public:
    void loadAccounts(const string& filename);

    bool login( const string& username, const string& password, Account& loggedInAccount);
};

#endif