#pragma once


pqxx::work conn() {
    pqxx::connection conn("dbname=online-library user=postgres password=secret host=localhost");
    pqxx::work txn(conn);
    return txn;
}
