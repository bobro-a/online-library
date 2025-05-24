#pragma once
#include <optional>
#include <vector>
#include <pqxx/pqxx>
#include <iostream>
#include "book.h"

using namespace std;


extern pqxx::connection *conn;

vector<Book> searchBooksBy(const string &parameter, const string &value) {
    vector<Book> result;
    try {
        pqxx::work txn(*conn);
        string query = "SELECT * FROM books";
        if (!parameter.empty() && !value.empty()) {
            query += " WHERE ";
            if (parameter == "year") query += parameter + " = " + value;
            if (parameter == "rating") {
                double val = stod(value);
                query += parameter + " BETWEEN " + to_string(val - 0.05) + " AND " + to_string(val + 0.05);
            } else query += parameter + " ILIKE '%" + value + "%'";
        }
        auto r = txn.exec_params(query);
        for (auto row: r) {
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

string hSearch(const string &req) {
    size_t queryPos = req.find("?");
    string queryStr = req.substr(queryPos + 1, req.find(' ', queryPos) - queryPos - 1);

    map<string, string> params;
    istringstream queryStream(queryStr);
    string pair;
    while (getline(queryStream, pair, '&')) {
        size_t eq = pair.find('=');
        if (eq != string::npos) {
            string key = pair.substr(0, eq);
            string val = pair.substr(eq + 1);
            for (auto &c: val) if (c == '+') c = ' ';
            params[key] = val;
        }
    }

    string title = params["title"];
    string author = params["author"];
    string tags = params["tags"];
    string rating = params["rating"];
    string year = params["year"];

    vector<Book> books;
    if (!title.empty()) books = searchBooksBy("title", title);
    else if (!author.empty()) books = searchBooksBy("author", author);
    else if (!tags.empty()) books = searchBooksBy("tags", tags);
    else if (!rating.empty()) books = searchBooksBy("rating", rating);
    else if (!year.empty()) books = searchBooksBy("year", year);
    string body = booksToJson(books);
    return httpReq(200, body, "application/json");
}
