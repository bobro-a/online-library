create table users(
    id serial primary key,
    username text unique not null,
    password text not null
);

create table books(
    id serial primary key,
    title text not null,
    book_path text not null,
    cover_path text not null,
    author text not null,
    tags text not null,
    rating numeric,
    year int
);

create table reviews (
                         id serial primary key,
                         book_id int references books(id),
                         username text,
                         text text
);

create table favorites (
                           user_id int references users(id),
                           book_id int references books(id),
                           primary key(user_id, book_id)
);

insert into books(title,book_path,cover_path,author,tags,rating,year)
values
    ('Анна Каренина','/database/books/Anna_Karenina.pdf','/database/covers/Anna_Karenina.jpg','Лев Николаевич Толстой','классика',0,1878),
    ('Мастер и Маргарита','/database/books/Master_Margarita.pdf','/database/covers/Master_Margarita.jpg','Михаил Афанасьевич Булгаков','классика',0,1967),
    ('Портрет Дориана Грея','/database/books/Portret_Doriana_Greya.pdf','/database/covers/Portret_Doriana_Greya.jpg','Оскар Уайлд','зарубежная классика',0,1890);