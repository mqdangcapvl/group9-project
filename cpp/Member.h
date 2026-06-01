#ifndef MEMBER_H
#define MEMBER_H

#include <iostream>
#include <string>

using namespace std;

class Member {
private:
    int id;
    string memberName;
    string phoneNumber;
    string citizenId;
    string joinDate;
    bool active;
public:
    Member( int id = 0, string memberName = "", string phoneNumber = "", string citizenId = "", string joinDate = "", bool active = true);

    int getId() const;
    string getName() const;
    string getPhoneNumber() const;
    string getCitizenId() const;
    string getJoinDate() const;
    bool isActive() const;
};

#endif