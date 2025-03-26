window.addEventListener("DOMContentLoaded", () => {
    fetch("http://localhost:8080/books")
        .then(res => res.json())
        .then(data => {
            const BookList = document.getElementById('book-list');
            if (!BookList) {
                console.error("❌ Элемент с id='book-list' не найден в HTML.");
                return;
            }

            BookList.innerHTML = ''; // Очистка текста "Загрузка книг..."

            data.forEach(book => {
                const div = document.createElement('div');
                div.className = 'book-card';

                div.innerHTML = `
                    <img src="${book.cover}" alt="Обложка книги" class="book-cover">
                    <h3>${book.title}</h3>
                    <p><strong>Автор:</strong> ${book.author}</p>
                    <p><strong>Жанр:</strong> ${book.tags || '—'}</p>
                    <a href="${book.pdf}" target="_blank">📖 Читать</a>
                `;

                BookList.appendChild(div);
            });
        })
        .catch(err => {
            const BookList = document.getElementById('book-list');
            if (BookList) {
                BookList.textContent = "❌ Ошибка загрузки книг с сервера.";
            }
            console.error("Ошибка загрузки книг:", err);
        });
});
