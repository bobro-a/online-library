#pragme once
#include <optional>


void searchBooksBy(vector<Book> &books, std::optional<string> parametr) {
    try {
        if (parametr!="title"
            && parametr!="author"
            && parametr!="tags"
            && parametr!="year"
            && parametr!="rating") {
            //TODO сделать так, чтобы выводилось на сайте сообщение об ошибке
        }else {

        }
    } catch (const exception &e) {
        cerr << "DB Error: " << e.what() << endl;
    }
}
