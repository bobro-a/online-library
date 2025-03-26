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
    tags text not null
);
insert into books(title,book_path,cover_path,author,tags)
values
    ('Анна Каренина','/database/books/Anna_Karenina.pdf','/database/covers/Anna_Karenina.jpg','Лев Николаевич Толстой','классика'),
    ('Мастер и Маргарита','/database/books/Master_Margarita.pdf','/database/covers/Master_Margarita.jpg','Михаил Афанасьевич Булгаков','классика'),
    ('Портрет Дориана Грея','/database/books/Portret_Doriana_Greya.pdf','/database/covers/Portret_Doriana_Greya.jpg','Оскар Уайлд','зарубежная классика');