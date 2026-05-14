#include "Account.h"

Account::Account(int id, string username, string password, string role) {
    this->id = id;
    this->username = username;
    this->password = password;
    this->role = role;
}

int Account::getId() const {
    return id;
}

string Account::getUsername() const {
    return username;
}

string Account::getPassword() const {
    return password;
}

string Account::getRole() const {
    return role;
}