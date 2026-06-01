#include "MemberManager.h"

#include <fstream>
#include <sstream>

void MemberManager::loadMembers(const string& filename) {
    members.clear();
    ifstream file(filename);
    string line;
    while (getline(file, line)) {
        stringstream ss(line);
        string idStr;
        string name;
        string phone;
        string citizenId;
        string joinDate;
        string activeStr;

        getline(ss, idStr, ',');
        getline(ss, name, ',');
        getline(ss, phone, ',');
        getline(ss, citizenId, ',');
        getline(ss, joinDate, ',');
        getline(ss, activeStr, ',');

        members.push_back(
            Member( stoi(idStr), name, phone, citizenId, joinDate, activeStr == "1" )
        );
    }
    file.close();
}
vector<Member>
MemberManager::getMembers() const {
    return members;
}
bool MemberManager::hasActiveMemberByName(const string& name) const {
    for (const Member& member : members) {
        if (member.getName() == name &&member.isActive()) {
            return true;
        }
    }

    return false;
}
