#include "crow.h"
#include <pqxx/pqxx>

crow::json::wvalue get_books_from_db() {
    crow::json::wvalue result;
    try {
        pqxx::connection conn("dbname=online-library user=user1");

        pqxx::work txn(conn);
        pqxx::result r =txn.exec("SELECT id, title, author, file_path, tags FROM books");
        int i=0;
        for (const auto& row:r) {
            result[i]["id"] = row["id"].as<int>();
            result[i]["title"] = row["title"].c_str();
            result[i]["author"] = row["author"].c_str();
            result[i]["file_path"] = row["file_path"].c_str();
            result[i]["tags"] = row["tags"].c_str();
            i++;
        }
    }catch (const std::exception& e) {
        std::cerr << "Ошибка базы данных: " << e.what() << std::endl;
    }
    return result;
}

int main() {
    crow::SimpleApp app;
    CROW_ROUTE(app, "/books")([] {
        return get_books_from_db(); // Возвращает JSON со списком книг
    });

    app.port(18080).multithreaded().run();
}