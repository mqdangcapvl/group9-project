#ifndef ACCOUNT_H
#define ACCOUNT_H

#include <iostream>
#include <string>
using namespace std;

class Account {
private:
    int id;
    string username;
    string password;
    string role;

public:
    Account( int id = 0, string username = "", string password = "", string role = "");

    int getId() const;
    string getUsername() const;
    string getPassword() const;
    string getRole() const;
};

#endif