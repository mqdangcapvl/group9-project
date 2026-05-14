#include "Member.h"

Member::Member(
    int id,
    string memberName,
    string phoneNumber,
    string citizenId,
    string joinDate,
    bool active
) {
    this->id = id;
    this->memberName = memberName;
    this->phoneNumber = phoneNumber;
    this->citizenId = citizenId;
    this->joinDate = joinDate;
    this->active = active;
}

int Member::getId() const {
    return id;
}

string Member::getName() const {
    return memberName;
}

string Member::getPhoneNumber() const {
    return phoneNumber;
}

string Member::getCitizenId() const {
    return citizenId;
}

string Member::getJoinDate() const {
    return joinDate;
}

bool Member::isActive() const {
    return active;
}