#pragma once

string hComments(const string& req) {
    size_t id_pos = req.find("book_id=") + 8;
    size_t end = req.find(' ', id_pos);
    string id_str = req.substr(id_pos, end - id_pos);

    try {
        int book_id = stoi(id_str);
        pqxx::work txn(*conn);
        auto r = txn.exec_params("SELECT text, username, created_at FROM reviews WHERE book_id=$1", book_id);

        string json = "[";
        for (int i = 0; i < r.size(); ++i) {
            json += "{";
            json += "\"content\":\"" + r[i]["text"].as<string>() + "\",";
            json += "\"user\":\"" + r[i]["username"].as<string>() + "\",";
            json += "\"created_at\":\"" + r[i]["created_at"].as<string>() + "\"";
            json += "}";
            if (i != r.size() - 1) json += ",";
        }
        json += "]";

        return httpReq(200,json,"application/json");
    } catch (...) {
        return httpReq(400,"Invalid book_id");
    }
}
string hComment(const string& req) {
    size_t body_pos = req.find("\r\n\r\n");
    if (body_pos == string::npos) return "400 Bad Request";

    string body = req.substr(body_pos + 4);
    string book_id_str, username, text;

    book_id_str = getField(body, "book_id");
    username = getField(body, "username");
    text = getField(body, "text");

    try {
        pqxx::work txn(*conn);
        txn.exec_params("INSERT INTO reviews(book_id, username, text) VALUES($1, $2, $3)",
                        stoi(book_id_str), username, text);
        txn.commit();
        string msg = "{\"status\":\"ok\",\"message\":\"Review submitted\"}";
        return httpReq(200,msg,"application/json");
    } catch (...) {
        return httpReq(500,"Internal server error");
    }
}

string hAuth(const string& req) {
    bool isLogin = req.find("POST /login") == 0;
        size_t body_pos = req.find("\r\n\r\n");
        if (body_pos == string::npos) return "400 Bad Request";
        string body = req.substr(body_pos + 4);
        string username = getField(body, "username");
        string password = getField(body, "password");

        try {
            pqxx::work txn(*conn);
            if (isLogin) {
                auto r = txn.exec_params("SELECT password FROM users WHERE username=$1", username);
                string msg = "Invalid credentials";

                if (r.empty()) {
                    return httpReq(401,msg);
                }

                string storedPassword = r[0][0].as<string>();
                if (storedPassword != password) {
                    return httpReq(401,msg);
                }
            } else {
                if (username.empty() || password.empty()) {
                    string msg = "Username and password required";
                    return httpReq(400,msg);
                }
                txn.exec_params("INSERT INTO users(username, password) VALUES ($1, $2)", username, password);
            }
            txn.commit();
            string msg = "Success";
            return httpReq(200,msg);
        } catch (const pqxx::unique_violation &e) {
            string msg = "Username already exists";
            return httpReq(409,msg);
        } catch (const std::exception &e) {
            string msg = "Error: ";
            msg += e.what();
            return httpReq(400,msg);
        }
}