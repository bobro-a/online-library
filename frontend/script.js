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

            books = data;
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
            const filtered = books.filter(book =>
                book.title.toLowerCase().includes(query) ||
                book.author.toLowerCase().includes(query)
            );
            renderBooks(filtered);
        });
    }
});

function renderBooks(bookArray) {
    const BookList = document.getElementById('book-list');
    BookList.innerHTML = '';

    if (bookArray.length === 0) {
        BookList.innerHTML = '<p>Книги не найдены.</p>';
        return;
    }

    bookArray.forEach(book => {
        const div = document.createElement('div');
        div.className = 'book-card';

        const ratingValue = (typeof book.rating === "number") ? book.rating.toFixed(1) : '—';

        div.innerHTML = `
          <div class="card-content">
            <img src="${book.cover}" alt="Обложка книги" class="book-cover">
            <h3><a href="book.html?id=${book.id}" class="book-title-link">${book.title}</a></h3>
            <p><strong>Автор:</strong> ${book.author}</p>
            <p><strong>Жанр:</strong> ${book.tags || '—'}</p>
            <p><strong>Год:</strong> ${book.year || '-'}</p>
            <p><strong>Рейтинг:</strong> <span class="rating-value">${ratingValue}</span></p>
            <div class="rating-stars" data-id="${book.id}">
              ${[1, 2, 3, 4, 5].map(i => `<span class="star" data-value="${i}">★</span>`).join('')}
            </div>
          </div>
          <div class="card-footer">
            <a href="${book.pdf}" target="_blank">📖 Читать</a>
            &nbsp;|&nbsp;
            <a href="${book.pdf}" download>⬇️ Скачать</a>
            <div class="comment-section">
              <textarea placeholder="Оставьте комментарий..." class="comment-text" data-id="${book.id}"></textarea>
              <button class="comment-submit" data-id="${book.id}">💬 Отправить</button>
            </div>
          </div>
        `;

        // Загрузка комментариев
        fetch(`http://localhost:8080/comments?book_id=${book.id}`)
            .then(res => res.json())
            .then(comments => {
                const commentsContainer = document.createElement('div');
                commentsContainer.className = 'comment-list';

                if (comments.length > 0) {
                    commentsContainer.innerHTML = '<p><strong>Комментарии:</strong></p>' +
                        comments.map(c =>
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

// Обработка рейтинга и комментариев
document.addEventListener('click', e => {
    if (e.target.classList.contains('star')) {
        const star = e.target;
        const value = parseInt(star.dataset.value);
        const bookId = star.closest('.rating-stars').dataset.id;

        fetch("http://localhost:8080/rate", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ book_id: bookId, rating: value })
        })
            .then(res => {
                if (!res.ok) throw new Error('Ошибка сервера');
                return res.text();
            })
            .then(() => {
                alert(`Спасибо! Вы поставили ${value} ★`);
                return fetch('http://localhost:8080/books');
            })
            .then(res => res.json())
            .then(data => {
                books = data;
                renderBooks(books);
            })

            .catch(err => {
                alert('❌ Не удалось отправить рейтинг');
                console.error(err);
            });
    }

    if (e.target.classList.contains('comment-submit')) {
        const button = e.target;
        const bookId = button.dataset.id;
        const textarea = document.querySelector(`.comment-text[data-id="${bookId}"]`);
        const comment = textarea.value.trim();

        if (comment === '') {
            alert("Комментарий не может быть пустым.");
            return;
        }

        button.disabled = true;

        fetch("http://localhost:8080/comment", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: bookId, comment })
        })
            .then(res => res.json())
            .then(() => {
                alert("Спасибо за отзыв!");
                textarea.value = '';
            })
            .catch(err => {
                alert("❌ Ошибка при отправке комментария.");
                console.error(err);
            })
            .finally(() => {
                button.disabled = false;
            });
    }
});
