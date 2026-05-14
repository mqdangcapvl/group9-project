#ifndef PERSON_H
#define PERSON_H

#include <string>

using namespace std;

class Person {

protected:
    string name;
    int age;
    string cccd;

private:
    static int totalPersons;

public:
    Person(
        string name = "",
        int age = 0,
        string cccd = ""
    );

    virtual ~Person();
    string getName() const;
    int getAge() const;
    string getCccd() const;
    
    void setName(string name);
    void setAge(int age);
    void setCccd(string cccd);
    static int getTotalPersons();
};

#endif