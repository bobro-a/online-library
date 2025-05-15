#pragma once
#include <fstream>
#include "search.h"

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
           "\"tags\":\"" + std::to_string(book.rating) + "\","
           "\"tags\":\"" + std::to_string(book.year) + "\""
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

string handleRequest(const string &req) {
    if (req.find("GET /books") == 0) {
        // Проверка на GET /books/{id}
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
                    return "HTTP/1.1 200 OK\r\n"
                           "Content-Type: application/json\r\n"
                           "Access-Control-Allow-Origin: *\r\n"
                           "Content-Length: " + to_string(body.size()) + "\r\n\r\n" + body;
                } else {
                    return "HTTP/1.1 404 Not Found\r\n"
                            "Content-Type: text/plain\r\n"
                            "Access-Control-Allow-Origin: *\r\n"
                            "\r\nBook not found";
                }
            } catch (...) {
                return "HTTP/1.1 400 Bad Request\r\n"
                        "Content-Type: text/plain\r\n"
                        "Access-Control-Allow-Origin: *\r\n"
                        "\r\nInvalid ID";
            }
        }

        // Если просто GET /books — вернуть все
        auto books = getAllBooks();
        string body = booksToJson(books);
        return "HTTP/1.1 200 OK\r\n"
               "Content-Type: application/json\r\n"
               "Access-Control-Allow-Origin: *\r\n"
               "Content-Length: " + to_string(body.size()) + "\r\n\r\n" + body;
    }
    if (req.find("GET /search?") == 0) {
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
        return "HTTP/1.1 200 OK\r\n"
               "Content-Type: application/json\r\n"
               "Access-Control-Allow-Origin: *\r\n"
               "Content-Length: " + to_string(body.size()) + "\r\n\r\n" + body;
    }
    if (req.find("GET /download/") == 0) {
        size_t start = req.find("/download/") + 10;
        size_t end = req.find(' ', start);
        string id_str = req.substr(start, end - start);

        try {
            int id = stoi(id_str);
            auto book = findBookById(id);
            if (book) {
                ifstream file("." + book->pdf_url, ios::binary);
                if (file) {
                    string content((istreambuf_iterator<char>(file)), istreambuf_iterator<char>());
                    return "HTTP/1.1 200 OK\r\n"
                           "Content-Type: application/pdf\r\n"
                           "Content-Disposition: attachment; filename=\"" + book->title + ".pdf\"\r\n"
                           "Access-Control-Allow-Origin: *\r\n"
                           "Content-Length: " + to_string(content.size()) + "\r\n\r\n" + content;
                }
            }
            return "HTTP/1.1 404 Not Found\r\n\r\nFile not found";
        } catch (...) {
            return "HTTP/1.1 400 Bad Request\r\n\r\nInvalid ID";
        }
    }
    if (req.find("POST /review") == 0) {
        size_t body_pos = req.find("\r\n\r\n");
        if (body_pos == string::npos) return "400 Bad Request";

        string body = req.substr(body_pos + 4);
        string book_id_str, username, text;

        // простой JSON-парсинг руками (лучше заменить на nlohmann/json)
        auto getField = [&](const string &field) {
            size_t pos = body.find("\"" + field + "\":\"");
            if (pos == string::npos) return string();
            pos += field.length() + 4;
            size_t end = body.find('"', pos);
            return body.substr(pos, end - pos);
        };

        book_id_str = getField("book_id");
        username = getField("username");
        text = getField("text");

        try {
            pqxx::work txn(*conn);
            txn.exec_params("INSERT INTO reviews(book_id, username, text) VALUES($1, $2, $3)",
                            stoi(book_id_str), username, text);
            txn.commit();
            return "HTTP/1.1 200 OK\r\n\r\nReview submitted";
        } catch (...) {
            return "HTTP/1.1 500 Internal Server Error\r\n\r\n";
        }
    }
    if (req.find("POST /rate") == 0) {
        size_t body_pos = req.find("\r\n\r\n");
        if (body_pos == string::npos) return "400 Bad Request";
        string body = req.substr(body_pos + 4);

        auto getField = [&](const string &field) {
            size_t pos = body.find("\"" + field + "\":\"");
            if (pos == string::npos) return string();
            pos += field.length() + 4;
            size_t end = body.find('"', pos);
            return body.substr(pos, end - pos);
        };

        string book_id_str = getField("book_id");
        string rating_str = getField("rating");

        try {
            int book_id = stoi(book_id_str);
            double new_rating = stod(rating_str);
            if (new_rating < 0 || new_rating > 5) throw runtime_error("Invalid rating");

            pqxx::work txn(*conn);

            // Получаем текущий рейтинг
            auto r = txn.exec_params("SELECT rating FROM books WHERE id = $1", book_id);
            if (r.empty()) return "HTTP/1.1 404 Not Found\r\n\r\nBook not found";

            double current_rating = r[0][0].as<double>();
            double updated_rating = (current_rating + new_rating) / 2.0;

            // Обновляем рейтинг
            txn.exec_params("UPDATE books SET rating = $1 WHERE id = $2", updated_rating, book_id);
            txn.commit();

            return "HTTP/1.1 200 OK\r\n\r\nRating updated";
        } catch (...) {
            return "HTTP/1.1 400 Bad Request\r\n\r\nInvalid input";
        }
    }
    if (req.find("POST /register") == 0 || req.find("POST /login") == 0) {
        bool isLogin = req.find("POST /login") == 0;
        size_t body_pos = req.find("\r\n\r\n");
        if (body_pos == string::npos) return "400 Bad Request";
        string body = req.substr(body_pos + 4);

        auto getField = [&](const string &field) {
            size_t pos = body.find("\"" + field + "\":\"");
            if (pos == string::npos) return string();
            pos += field.length() + 4;
            size_t end = body.find('"', pos);
            return body.substr(pos, end - pos);
        };

