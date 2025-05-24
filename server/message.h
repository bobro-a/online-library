#include <string>
using namespace std;

string httpReq(int code, const string &body, const string &contentType = "text/plain") {
    string status;
    switch (code) {
        case 200: status = "200 OK"; break;
        case 204: status = "204 No Content"; break;
        case 400: status = "400 Bad Request"; break;
        case 401: status = "401 Unauthorized"; break;
        case 404: status = "404 Not Found"; break;
        case 409: status = "409 Conflict"; break;
        case 500: status = "500 Internal Server Error"; break;
        default: status = to_string(code) + " Unknown";
    }

    return "HTTP/1.1 " + status + "\r\n"
           "Access-Control-Allow-Origin: *\r\n"
           "Content-Type: " + contentType + "\r\n"
           "Content-Length: " + to_string(body.size()) + "\r\n\r\n" + body;
}