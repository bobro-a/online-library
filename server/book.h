#pragma once
#include <string>

using namespace std;
struct Book {
    int id;
    string title;
    string author;
    string cover_url;
    string pdf_url;
    string tags;
    double rating;
    int year;
};