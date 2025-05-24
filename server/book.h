#pragma once
#include "message.h"
using namespace std;

extern pqxx::connection *conn;

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

string bookToJson(Book &book);
string booksToJson(vector<Book> &books);
optional<Book> findBookById(int id);
vector<Book> getAllBooks();
string getField(const string &body, const string &field);

string hGetBooks(const string & req) {
    size_t pos = req.find("GET /books/");
    if (pos != string::npos) {
        size_t start = pos + 11;
        size_t end = req.find(' ', start);
        string id_str = req.substr(start, end - start);

        try {
            int id = stoi(id_str);
            auto book = findBookById(id);
            if (book) {
                string body = bookToJson(*book);
                return httpReq(200,body,"application/json");
            } else {
                return httpReq(404,"Book not found");
            }
        } catch (...) {
            return httpReq(400,"Invalid ID");
        }
    }

    auto books = getAllBooks();
    string body = booksToJson(books);
    return httpReq(200,body,"application/json");
}
string hRate(const string & req) {
    size_t body_pos = req.find("\r\n\r\n");
    if (body_pos == string::npos) return "400 Bad Request";
    string body = req.substr(body_pos + 4);

    string book_id_str = getField(body, "book_id");
    string rating_str = getField(body, "rating");

    try {
        int book_id = stoi(book_id_str);
        double new_rating = stod(rating_str);
        if (new_rating < 0 || new_rating > 5) throw runtime_error("Invalid rating");

        pqxx::work txn(*conn);

        // Получаем текущий рейтинг
        // Получаем текущие total_rating и votes
        auto r = txn.exec_params("SELECT total_rating, votes FROM books WHERE id = $1", book_id);
        if (r.empty())
            return httpReq(404,"Book not found");

        double total = r[0][0].as<double>();
        int votes = r[0][1].as<int>();

        total += new_rating;
        votes += 1;
        double updated_rating = total / votes;

        // Обновляем книгу
        txn.exec_params("UPDATE books SET total_rating = $1, votes = $2, rating = $3 WHERE id = $4",
                        total, votes, updated_rating, book_id);

        txn.commit();
        string message = "Rating updated";
        return httpReq(200,message);
    } catch (...) {
        return httpReq(400,"Invalid input");
    }
}
