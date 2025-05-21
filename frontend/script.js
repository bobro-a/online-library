let books = [];  // Сохраняем список книг для фильтрации
const currentUser = sessionStorage.getItem("user") || "Гость";

window.addEventListener('DOMContentLoaded', () => {
    const user = sessionStorage.getItem('user');
    const userInfo = document.getElementById('user-info');
    const userMessage = document.getElementById('user-message');

    if (userInfo && userMessage) {
        if (user) {
            userMessage.innerHTML = `<a href="user.html">${user}</a>`;

            const openLogin = document.getElementById('open-login');
            const openRegister = document.getElementById('open-register');
            if (openLogin) openLogin.classList.add('hidden');
            if (openRegister) openRegister.classList.add('hidden');
        } else {
            userMessage.textContent = 'Гость';
        }
        userInfo.classList.remove('hidden');
    }

    const BookList = document.getElementById('book-list');
    if (BookList) {
        fetch('http://localhost:8080/books')
            .then(res => res.json())
            .then(data => {
                books = data;
                renderBooks(books);
            })
            .catch(err => {
                BookList.textContent = 'Ошибка загрузки книг с сервера.';
                console.error('Ошибка загрузки книг:', err);
            });

        const searchField = document.getElementById('search-field');
        const searchInput = document.getElementById('search-input');

        if (searchInput && searchField) {
            searchInput.addEventListener('input', () => {
                const rawQuery = searchInput.value.trim();
                const query = rawQuery.replace(',', '.').toLowerCase();
                const field = searchField.value;

                const filtered = books.filter(book => {
                    const value = (book[field] ?? '').toString().toLowerCase();
                    return ['year', 'rating'].includes(field)
                        ? value.startsWith(query)
                        : value.includes(query);
                });

                renderBooks(filtered);
            });
        }
    }

    // ✅ Показываем приветствие, если пользователь уже вошёл
    const storedUser = sessionStorage.getItem('user');
    const welcome = document.getElementById('welcome-message');
    if (storedUser && welcome) {
        welcome.textContent = `👋 Добро пожаловать, ${storedUser}!`;
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('user');

            // Обновить иконку
            const userInfo = document.getElementById('user-info');
            const userMessage = document.getElementById('user-message');
            if (userInfo && userMessage) {
                userMessage.textContent = 'Гость';
                userInfo.classList.remove('hidden');
            }

            // Обновить приветствие
            const welcome = document.getElementById('welcome-message');
            if (welcome) {
                welcome.textContent = 'Вы не вошли в систему.';
            }

            // Показать кнопки входа/регистрации
            const openLogin = document.getElementById('open-login');
            const openRegister = document.getElementById('open-register');
            if (openLogin) openLogin.classList.remove('hidden');
            if (openRegister) openRegister.classList.remove('hidden');
        });
    }
});

async function fetchUserFavorites(username) {
    const res = await fetch(`http://localhost:8080/favorites?username=${encodeURIComponent(username)}`);
    if (!res.ok) return [];
    return await res.json();
}

function toggleFavoriteServer(bookId, username, action) {
    return fetch("http://localhost:8080/favorite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, book_id: bookId, action })
    });
}

async function renderBooks(bookArray) {
    const BookList = document.getElementById('book-list');
    BookList.innerHTML = '';

    if (bookArray.length === 0) {
        BookList.innerHTML = '<p>Книги не найдены.</p>';
        return;
    }

    const username = sessionStorage.getItem('user');
    let favorites = [];
    if (username && username !== 'Гость') {
        const favResponse = await fetchUserFavorites(username);
        favorites = favResponse.map(b => b.id);  // массив только ID
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
            ${currentUser === "Гость"
            ? `<a href="${book.pdf}" target="_blank">📖 Читать</a> &nbsp;|&nbsp; <span class="disabled">⬇️ Скачать</span>`
            : `<a href="${book.pdf}" target="_blank">📖 Читать</a> &nbsp;|&nbsp; <a href="${book.pdf}" download>⬇️ Скачать</a>`}
            ${currentUser === "Гость"
            ? `<button class="favorite-btn disabled" disabled title="Войдите, чтобы добавить в избранное">⭐ В избранное</button>`
            : `<button class="favorite-btn" data-id="${book.id}">⭐ В избранное</button>`}
            ${currentUser === "Гость"
            ? `<p><em>Комментарии доступны только авторизованным пользователям.</em></p>`
            : `
    <div class="comment-section">
      <textarea placeholder="Оставьте комментарий..." class="comment-text" data-id="${book.id}"></textarea>
      <button class="comment-submit" data-id="${book.id}">💬 Отправить</button>
    </div>
  `}

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

        // Обработка кнопки "В избранное"
        const favBtn = div.querySelector('.favorite-btn');
        if (favBtn && username && username !== "Гость") {
            const bookId = parseInt(favBtn.dataset.id);
            const updateBtnText = () => {
                favBtn.textContent = favorites.includes(bookId)
                    ? '⭐ Удалить из избранного'
                    : '⭐ В избранное';
            };
            updateBtnText();
            favBtn.addEventListener('click', () => {
                const isFav = favorites.includes(bookId);
                const action = isFav ? 'remove' : 'add';
                toggleFavoriteServer(bookId, username, action).then(() => {
                    if (isFav) {
                        favorites = favorites.filter(id => id !== bookId);
                    } else {
                        favorites.push(bookId);
                    }
                    updateBtnText();
                });
            });
        }
        BookList.appendChild(div);
    });
}

function getFavorites() {
    return JSON.parse(localStorage.getItem('favorites-list') || '[]');
}

function toggleFavorite(bookId) {
    let favorites = getFavorites();
    const index = favorites.indexOf(bookId);

    if (index >= 0) {
        favorites.splice(index, 1);
    } else {
        favorites.push(bookId);
    }

    localStorage.setItem('favorites-list', JSON.stringify(favorites));
}

// Обработка рейтинга и комментариев
document.addEventListener('click', e => {
    if (e.target.classList.contains('star')) {
        const star = e.target;
        const value = parseInt(star.dataset.value);
        const bookId = star.closest('.rating-stars').dataset.id;

        fetch("http://localhost:8080/rate", {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({book_id: bookId, rating: value})
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
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({book_id: bookId, username: "Гость", text: comment})
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

//Регистрация
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('register-modal');
    const openBtn = document.getElementById('open-register');
    const closeBtn = document.getElementById('close-register');
    const form = document.getElementById('register-form');

    openBtn.addEventListener('click', () => modal.classList.remove('hidden'));
    closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
    });

    form.addEventListener('submit', e => {
        e.preventDefault();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        fetch('http://localhost:8080/register', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username, password})
        })
            .then(res => {
                if (!res.ok) throw new Error('Ошибка регистрации');
                return res.text();
            })
            .then(() => {
                alert('✅ Регистрация прошла успешно!');
                modal.classList.add('hidden');
            })
            .catch(err => {
                alert('❌ Не удалось зарегистрироваться');
                console.error(err);
            });
    });
});

//Вход
document.addEventListener('DOMContentLoaded', () => {
    // Вход
    const loginModal = document.getElementById('login-modal');
    const openLogin = document.getElementById('open-login');
    const closeLogin = document.getElementById('close-login');
    const loginForm = document.getElementById('login-form');

    openLogin.addEventListener('click', () => loginModal.classList.remove('hidden'));
    closeLogin.addEventListener('click', () => loginModal.classList.add('hidden'));
    window.addEventListener('click', e => {
        if (e.target === loginModal) loginModal.classList.add('hidden');
    });

    loginForm.addEventListener('submit', e => {
        e.preventDefault();
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value.trim();

        fetch('http://localhost:8080/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username, password})
        })
            .then(res => {
                if (!res.ok) throw new Error('Неверные данные');
                return res.text();
            })
            .then(() => {
                sessionStorage.setItem('user', username);
                loginModal.classList.add('hidden');

                // ✅ Обновляем блок с иконкой
                const userMessage = document.getElementById('user-message');
                const userInfo = document.getElementById('user-info');
                if (userMessage && userInfo) {
                    userMessage.innerHTML = `<a href="user.html">${username}</a>`;
                    userInfo.classList.remove('hidden');
                }

                // ✅ (опционально) приветствие на главной
                const welcome = document.getElementById('welcome-message');
                if (welcome) {
                    welcome.textContent = `👋 Добро пожаловать, ${username}!`;
                }
            })
            .catch(err => {
                alert('❌ Ошибка входа: ' + err.message);
                console.error(err);
            });
    });
});
