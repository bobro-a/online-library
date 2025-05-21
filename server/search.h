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

vector<Book> searchBooksBy(const string &parameter, const string& value) {
    vector<Book> result;
    try {
        pqxx::work txn(*conn);
        string query = "SELECT * FROM books";
        if (!parameter.empty() && !value.empty()) {
            query += " WHERE ";
            if (parameter=="year") query += parameter + " = " + value;
            if (parameter == "rating") {
                double val = stod(value);
                query += parameter + " BETWEEN " + to_string(val - 0.05) + " AND " + to_string(val + 0.05);
            }

            else query += parameter + " ILIKE '%" + value + "%'";
        }
        auto r = txn.exec_params(query);
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
