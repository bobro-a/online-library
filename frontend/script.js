fetch("http://localhost:8080/books")
    .then(res => res.json())
    .then(data => {
        const BookList = document.getElementById('book-list');
        BookList.innerHTML = ''; //Очистка текста в div

        data.forEach(book => {
            const div = document.createElement('div');
            div.className = 'book-card';
            div.innerHTML = `
              <h3>${book.title}</h3>
              <p><strong>Автор:</strong> ${book.author}</p>
              <p><strong>Жанр:</strong> ${book.tags}</p>
              <a href="${pdf}" target="_blank">Читать</a>
            `;
            BookList.appendChild(div);
        });
    })
    .catch(err => {
        document.getElementById("books").textContent = "Ошибка загрузки книг.";
        console.error(err);
        // console.error('Ошибка загрузки книг:', err);
        // const BookList = document.getElementById('book-list');
        // BookList.innerHTML = 'Не удалось загрузить книги. Попробуйте позже.';
    })