let books = [];  // Сохраняем список книг для фильтрации

window.addEventListener('DOMContentLoaded', () => {
    fetch('http://localhost:8080/books')
        .then(res => res.json())
        .then(data => {
            const BookList = document.getElementById('book-list');
            if (!BookList) {
                console.error('Элемент с id=\'book-list\' не найден в HTML.');
                return;
            }

            books = data;  // сохраняем все книги
            renderBooks(books);
        })
        .catch(err => {
            const BookList = document.getElementById('book-list');
            if (BookList) {
                BookList.textContent = 'Ошибка загрузки книг с сервера.';
            }
            console.error('Ошибка загрузки книг:', err);
        });

    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const query = searchInput.value.trim().toLowerCase();
            const filtered = books.filter(
                book =>
                    book.title.toLowerCase().includes(query) || book.author.toLowerCase().includes(query));
            renderBooks(filtered);
        });
    }
});

// Функция для отрисовки книг
function renderBooks(bookArray) {
    const BookList = document.getElementById('book-list');
    BookList.innerHTML = '';  // Очищаем

    if (bookArray.length === 0) {
        BookList.innerHTML = '<p>Книги не найдены.</p>';
        return;
    }

    bookArray.forEach(book => {
        const div = document.createElement('div');
        div.className = 'book-card';

        div.innerHTML = `
            <img src="${book.cover}" alt="Обложка книги" class="book-cover">
            <h3>${book.title}</h3>
            <p><strong>Автор:</strong> ${book.author}</p>
            <p><strong>Жанр:</strong> ${book.tags || '—'}</p>
            <p><strong>Рейтинг:</strong> <span class="rating-value">${book.rating?.toFixed(1) || '—'}</span></p>
            <div class="rating-stars" data-id="${book.id}">
                ${[1, 2, 3, 4, 5].map(i => `<span class="star" data-value="${i}">★</span>`).join('')}
            </div>
            <a href="${book.pdf}" target="_blank">📖 Читать</a>
            &nbsp;|&nbsp;
            <a href="${book.pdf}" download>⬇️ Скачать</a>

        
            <div class="comment-section">
                <textarea placeholder="Оставьте комментарий..." class="comment-text" data-id="${book.id}"></textarea>
                <button class="comment-submit" data-id="${book.id}">💬 Отправить</button>
            </div>
        `;

        // Подгружаем комментарии
        fetch(`http://localhost:8080/comments?book_id=${book.id}`)
            .then(res => res.json())
            .then(comments => {
                const commentsContainer = document.createElement('div');
                commentsContainer.className = 'comment-list';

                if (comments.length > 0) {
                    commentsContainer.innerHTML = '<p><strong>Комментарии:</strong></p>' + comments.map(c =>
                        `<div class="comment"><span>${c.content}</span> <small>(${new Date(c.created_at).toLocaleString()})</small></div>`
                    ).join('');
                } else {
                    commentsContainer.innerHTML = '<p><em>Комментариев пока нет.</em></p>';
                }

                div.appendChild(commentsContainer);
            })
            .catch(err => {
                console.error("Ошибка загрузки комментариев:", err);
            });

        BookList.appendChild(div);
    });
}
document.addEventListener('click', e => {
    // обработка рейтинга
    if (e.target.classList.contains('star')) {
        const star = e.target;
        const value = star.dataset.value;
        const bookId = star.parentElement.dataset.id;

        fetch("http://localhost:8080/rate", {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ id: bookId, rating: parseInt(value) })
        })
            .then(res => res.json())
            .then(() => {
                alert(`Спасибо за оценку! Вы поставили ${value} ★`);
            })
            .catch(err => {
                alert("Ошибка при отправке оценки.");
                console.error(err);
            });
    }

    // обработка комментария
    if (e.target.classList.contains('comment-submit')) {
        const bookId = e.target.dataset.id;
        const textarea = document.querySelector(`.comment-text[data-id="${bookId}"]`);
        const comment = textarea.value.trim();

        if (comment === '') {
            alert("Комментарий не может быть пустым.");
            return;
        }

        fetch("http://localhost:8080/comment", {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ id: bookId, comment: comment })
        })
            .then(res => res.json())
            .then(() => {
                alert("Спасибо за отзыв!");
                textarea.value = '';
            })
            .catch(err => {
                alert("❌ Ошибка при отправке комментария.");
                console.error(err);
            });
    }
});
