#pragma once
#include <netinet/in.h>
#include <unistd.h>
#include <optional>
#include <vector>
#include <pqxx/pqxx>
#include <iostream>
#include "book.h"

using namespace std;


extern pqxx::connection *conn;

vector<Book> searchBooksBy(const string &parametr, const string& value) {
    vector<Book> result;
    try {
        pqxx::work txn(*conn);
        string query = "SELECT * FROM books";
        if (!parametr.empty() && !value.empty()) {
            query += " WHERE ";
            if (parametr=="rating" || parametr=="year") query += parametr + " = " + value;
            else query += parametr + " ILIKE '%" + value + "%'";
        }
        auto r = txn.exec(query);
        for (auto row : r) {
            Book book;
            book.id = row["id"].as<int>();
            book.title = row["title"].as<string>();
            book.author = row["author"].as<string>();
            book.cover_url = row["cover_path"].as<string>();
            book.pdf_url = row["book_path"].as<string>();
            book.tags = row["tags"].as<string>();
            book.rating = row["rating"].as<double>();
            book.year = row["year"].as<int>();
            result.push_back(book);
        }
    } catch (const exception &e) {
        cerr << "DB Error: " << e.what() << endl;
    }
    return result;
}
