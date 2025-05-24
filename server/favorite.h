#pragma once
string getField(const string &body, const string &field);

string hFavorite(const string &req) {
    size_t body_pos = req.find("\r\n\r\n");
    if (body_pos == string::npos) return "400 Bad Request";
    string body = req.substr(body_pos + 4);

    string username = getField(body, "username");
    string book_id_str = getField(body, "book_id");
    string action = getField(body, "action");

    try {
        pqxx::work txn(*conn);
        auto r = txn.exec_params("SELECT id FROM users WHERE username=$1", username);
        if (r.empty()) {
            string msg = "User not found";
            return httpReq(404,msg);
        }
        int user_id = r[0][0].as<int>();
        int book_id = stoi(book_id_str);

        if (action == "add") {
            txn.exec_params("INSERT INTO favorites(user_id, book_id) VALUES($1, $2) ON CONFLICT DO NOTHING",
                            user_id, book_id);
        } else if (action == "remove") {
            txn.exec_params("DELETE FROM favorites WHERE user_id=$1 AND book_id=$2", user_id, book_id);
        }
        txn.commit();
        string msg = "Favorite updated";
        return httpReq(200,msg);
    } catch (...) {
        return httpReq(400,"Invalid input");
    }
}

string hFavoritesList(const string &req) {
    size_t qpos = req.find("username=");
    if (qpos == string::npos) return "400 Bad Request";
    string username = req.substr(qpos + 9);
    size_t space = username.find(' ');
    if (space != string::npos) username = username.substr(0, space);

    try {
        pqxx::work txn(*conn);
        auto u = txn.exec_params("SELECT id FROM users WHERE username=$1", username);
        if (u.empty()) {
            string message = "User not found";
            return httpReq(404, message);
        }
        int user_id = u[0][0].as<int>();
        auto r = txn.exec_params(
            "SELECT b.* FROM books b JOIN favorites f ON b.id = f.book_id WHERE f.user_id = $1", user_id
        );

        vector<Book> books;
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

        string body = booksToJson(books);
        return httpReq(200, body, "application/json");
    } catch (...) {
        string msg = "Internal server error";
        return httpReq(500, msg);
    }
}
