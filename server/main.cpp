#include "server.h"

using namespace std;

pqxx::connection *conn;

int main() {
    int server_fd = socket(AF_INET, SOCK_STREAM, 0);
    sockaddr_in addr{};
    addr.sin_family = AF_INET;
    addr.sin_port = htons(8080);
    addr.sin_addr.s_addr = INADDR_ANY;

    bind(server_fd, (struct sockaddr *) &addr, sizeof(addr));
    listen(server_fd, 1);

    cout << "REST API is running on port 8080...\n";
    conn = new pqxx::connection("dbname=online-library user=postgres password=secret host=localhost");
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
    delete conn;
    close(server_fd);
    return 0;
}
