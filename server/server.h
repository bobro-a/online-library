#pragma once
#include <fstream>
#include "search.h"
#include "favorite.h"
#include "user.h"

using namespace std;

extern pqxx::connection *conn;

string bookToJson(Book &book) {
    return "{"
           "\"id\":" + to_string(book.id) + ","
           "\"title\":\"" + book.title + "\","
           "\"author\":\"" + book.author + "\","
           "\"cover\":\"" + book.cover_url + "\","
           "\"pdf\":\"" + book.pdf_url + "\","
           "\"tags\":\"" + book.tags + "\","
           "\"rating\":" + std::to_string(book.rating) + ","
           "\"year\":" + std::to_string(book.year) +
           "}";
}

string booksToJson(vector<Book> &books) {
    string json = "[";
    for (int i = 0; i < books.size(); ++i) {
        json += bookToJson(books[i]);
        if (i != books.size() - 1) json += ",";
    }
    json += "]";
    return json;
}

optional<Book> findBookById(int id) {
    try {
        pqxx::work txn(*conn);
        auto r = txn.exec_params("SELECT * FROM books WHERE id = $1", id);

        if (!r.empty()) {
            Book book;
            book.id = r[0]["id"].as<int>();
            book.title = r[0]["title"].as<string>();
            book.author = r[0]["author"].as<string>();
            book.cover_url = r[0]["cover_path"].as<string>();
            book.pdf_url = r[0]["book_path"].as<string>();
            book.tags = r[0]["tags"].as<string>();
            book.rating = r[0]["rating"].as<double>();
            book.year = r[0]["year"].as<int>();
            return book;
        }
    } catch (const exception &e) {
        cerr << "DB Error: " << e.what() << endl;
    }
    return nullopt;
}

vector<Book> getAllBooks() {
    vector<Book> books;
    try {
        pqxx::work txn(*conn);
        auto r = txn.exec("SELECT * FROM books");

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
            books.push_back(book);
        }
    } catch (const exception &e) {
        cerr << "DB Error: " << e.what() << endl;
    }
    return books;
}

string getField(const string &body, const string &field) {
    size_t pos = body.find("\"" + field + "\":");
    if (pos == string::npos) return string();
    pos += field.length() + 3;

    // строка
    if (body[pos] == '"') {
        ++pos;
        size_t end = body.find('"', pos);
        return body.substr(pos, end - pos);
    }

    // число
    size_t end = body.find_first_of(",}", pos);
    return body.substr(pos, end - pos);
}

string msgNotFound() {
    return "HTTP/1.1 404 Not Found\r\n"
                "Content-Type: text/plain\r\n"
                "Access-Control-Allow-Origin: *\r\n"
                "\r\nNot found";
}
string hOptions() {
    return "HTTP/1.1 204 No Content\r\n"
                "Access-Control-Allow-Origin: *\r\n"
                "Access-Control-Allow-Methods: GET, POST, OPTIONS\r\n"
                "Access-Control-Allow-Headers: Content-Type\r\n"
                "Access-Control-Max-Age: 86400\r\n"
                "\r\n";
}

string extractBody(const string &req) {
    size_t body_pos = req.find("\r\n\r\n");
    return (body_pos != string::npos) ? req.substr(body_pos + 4) : "";
}

string handleRequest(const string &req) {
    if (req.find("OPTIONS")==0) return hOptions();
    if (req.find("GET /books")==0) return hGetBooks(req);
    if (req.find("GET /search?")==0) return hSearch(req);
    if (req.find("GET /comments?book_id=")==0) return hComments(req);
    if (req.find("GET /favorites?")==0) return hFavoritesList(req);
    if (req.find("POST /comment")==0) return hComment(extractBody(req));
    if (req.find("POST /rate")==0) return hRate(extractBody(req));
    if (req.find("POST /login")==0) return hAuth(req);
    if (req.find("POST /register")==0) return hAuth(req);
    if (req.find("POST /favorite")==0) return hFavorite(extractBody(req));

    return msgNotFound();
}
