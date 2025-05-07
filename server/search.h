#pragme once
#include <optional>
#include <vector>
using namespace std;

extern pqxx::connection* conn;

vector<Book> searchBooksBy(vector<Book> &books, string& parametr,typename value) {
    vector<Book> result;
    try {
        pqxx::work txn(*conn);
        string query="SELECT * FROM books";
        if (!parametr.empty()) {
            query+=" WHERE ";
            if (parametr=="title") query+="title ILIKE %"+value+"%";
        }
        auto r = txn.exec_params(query);
    } catch (const exception &e) {
        cerr << "DB Error: " << e.what() << endl;
    }
    return result;
}
