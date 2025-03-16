create table users(
    id serial primary key,
    username text unique not null,
    password text not null
);

create table books(
    id serial primary key,
    title text not null,
    file_path text not null,
    author text not null,
    tags text not null
);
insert into books(title,file_path,author,tags)
values
    ('Анна Каренина','./books/Anna_Karenina.pdf','Лев Николаевич Толстой','классика'),
    ('Мастер и Маргарита','./books/Master_Margarita.pdf','Михаил Афанасьевич Булгаков','классика'),
    ('Портрет Дориана Грея','./books/Portret_Doriana_Greya.pdf','Оскар Уайлд','зарубежная классика');