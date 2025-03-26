#include <iostream>
#include <string>
#include <pqxx/pqxx>
#include <optional>
#include <vector>
#include <netinet/in.h>
#include <unistd.h>

using namespace std;

struct Book {
    int id;
    string title;
    string author;
    string cover_url;
    string pdf_url;
    string tags;
};

string bookToJson(Book &book) {
    return "{"
           "\"id\":" + to_string(book.id) + ","
           "\"title\":\"" + book.title + "\","
           "\"author\":\"" + book.author + "\","
           "\"cover\":\"" + book.cover_url + "\","
           "\"pdf\":\"" + book.pdf_url + "\","
           "\"tags\":\"" + book.tags + "\""
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
        pqxx::connection conn("dbname=online-library user=postgres password=secret host=localhost");
        pqxx::work txn(conn);
        auto r = txn.exec_params("SELECT id, title, author, book_path, cover_path, tags FROM books WHERE id = $1", id);

        if (!r.empty()) {
            Book book;
            book.id = r[0]["id"].as<int>();
            book.title = r[0]["title"].as<string>();
            book.author = r[0]["author"].as<string>();
            book.cover_url = r[0]["cover_path"].as<string>();
            book.pdf_url = r[0]["book_path"].as<string>();
            book.tags = r[0]["tags"].as<string>();
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
        pqxx::connection conn("dbname=online-library user=postgres password=secret host=localhost");
        pqxx::work txn(conn);
        auto r = txn.exec("SELECT id, title, author, book_path, cover_path, tags FROM books");

        for (auto row: r) {
            Book book;
            book.id = row["id"].as<int>();
            book.title = row["title"].as<string>();
            book.author = row["author"].as<string>();
            book.cover_url = row["cover_path"].as<string>();
            book.pdf_url = row["book_path"].as<string>();
            book.tags = row["tags"].as<string>();
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
                    return "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nContent-Length: " +
                           to_string(body.size()) + "\r\n\r\n" + body;
                } else {
                    return "HTTP/1.1 404 Not Found\r\nContent-Type: text/plain\r\n\r\nBook not found";
                }
            } catch (...) {
                return "HTTP/1.1 400 Bad Request\r\nContent-Type: text/plain\r\n\r\nInvalid ID";
            }
        }

        // Если просто GET /books — вернуть все
        auto books = getAllBooks();
        string body = booksToJson(books);
        return "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nContent-Length: " +
               to_string(body.size()) + "\r\n\r\n" + body;
    }

    return "HTTP/1.1 404 Not Found\r\nContent-Type: text/plain\r\n\r\nNot found";
}

int main() {
    int server_fd = socket(AF_INET, SOCK_STREAM, 0);
    sockaddr_in addr{};
    addr.sin_family = AF_INET;
    addr.sin_port = htons(8080);
    addr.sin_addr.s_addr = INADDR_ANY;

    bind(server_fd, (struct sockaddr *) &addr, sizeof(addr));
    listen(server_fd, 1);

    cout << "REST API is running on port 8080...\n";

    while (true) {
        int client_fd = accept(server_fd, nullptr, nullptr);
        char buffer[4096];
        int bytes = read(client_fd, buffer, sizeof(buffer) - 1);
        if (bytes > 0) {
            buffer[bytes] = '\0';
            string request(buffer);
            string response = handleRequest(request);
            send(client_fd, response.c_str(), response.size(), 0);
        }
        close(client_fd);
    }

    close(server_fd);
    return 0;
}
