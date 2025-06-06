create table users
(
    id       serial primary key,
    username text unique not null,
    password text        not null
);

create table books
(
    id           serial primary key,
    title        text not null,
    book_path    text not null,
    cover_path   text not null,
    author       text not null,
    tags         text not null,
    rating       double PRECISION DEFAULT 0,
    total_rating DOUBLE PRECISION DEFAULT 0,
    votes        INTEGER          DEFAULT 0,
    year         int
);

create table reviews
(
    id         serial primary key,
    book_id    int references books (id),
    username   text,
    text       text,
    created_at TIMESTAMP DEFAULT now()
);


create table favorites
(
    user_id int references users (id),
    book_id int references books (id),
    primary key (user_id, book_id)
);

insert into books(title, book_path, cover_path, author, tags, year)
values ('Анна Каренина', '/database/books/Anna_Karenina.pdf', '/database/covers/Anna_Karenina.jpg',
        'Лев Николаевич Толстой', 'классика', 1878),
       ('Мастер и Маргарита', '/database/books/Master_Margarita.pdf', '/database/covers/Master_Margarita.jpg',
        'Михаил Афанасьевич Булгаков', 'классика', 1967),
       ('Портрет Дориана Грея', '/database/books/Portret_Doriana_Greya.pdf',
        '/database/covers/Portret_Doriana_Greya.jpg', 'Оскар Уайлд', 'зарубежная классика', 1890),
       ('Гарри Поттер и философский камень', '/database/books/1_Harry-Potter-and-Philosophers-Stone.pdf',
        '/database/covers/1_Harry-Potter-and-Philosophers-Stone.jpg', 'Джоан Роулинг', 'Фэнтези', 1997),
       ('Война и мир', '/database/books/Tolstoy_Voina_i_mir.pdf',
        '/database/covers/Tolstoy_Voina_i_mir.jpg', 'Лев Николаевич Толстой', 'Исторический роман', 1865),
       ('Голодные игры', '/database/books/Hungry_games.pdf',
        '/database/covers/Hungry_games.jpg', 'Сьюзен Коллинз', 'Антиутопия', 2008),
       ('Три мушкетёра', '/database/books/Dyuma_Tri_mushketera.pdf',
        '/database/covers/Dyuma_Tri_mushketera.jpg', 'Александр Дюма', 'Историко-приключенческий роман', 1844);


SELECT *
FROM books;