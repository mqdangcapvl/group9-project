#ifndef MEMBERMANAGER_H
#define MEMBERMANAGER_H

#include <vector>
#include "Member.h"

class MemberManager {
private:
    vector<Member> members;
public:
    void loadMembers(
        const string& filename
    );
    vector<Member> getMembers() const;
    bool hasActiveMemberByName(
    const string& name
    ) const;
};
    
#endif