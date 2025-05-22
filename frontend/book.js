const params = new URLSearchParams(window.location.search);
const bookId = params.get('id');
const currentUser = sessionStorage.getItem("user") || "Гость";

fetch(`http://localhost:8080/books`)
    .then(res => res.json())
    .then(books => {
        const book = books.find(b => b.id == bookId);
        if (!book) throw new Error("Книга не найдена");

        document.title = book.title;
        document.getElementById('book-title-info').textContent = book.title;
        document.getElementById('book-title').textContent = book.title;
        document.getElementById('book-author').textContent = book.author;
        document.getElementById('book-tags').textContent = book.tags;
        document.getElementById('book-year').textContent = book.year;
        document.getElementById('book-rating').textContent = book.rating?.toFixed(1) || '—';
        document.getElementById('book-rating-stars').dataset.id = book.id;
        document.getElementById('book-rating-stars').innerHTML =
            [1, 2, 3, 4, 5].map(i => `<span class="star" data-value="${i}">★</span>`).join('');
        if (currentUser === "Гость") {
            document.getElementById("book-rating-stars").style.display = "none";
            const favContainer = document.getElementById("favorite-container");
            if (favContainer) favContainer.style.display = "none";
        }

        document.getElementById('book-cover').src = book.cover;
        document.getElementById('read-link').href = book.pdf;
        document.getElementById('download-link').href = book.pdf;

        const favBtn = document.getElementById('favorite-btn');
        if (favBtn && currentUser && currentUser !== 'Гость') {
            // Проверка, в избранном ли книга
            fetch(`http://localhost:8080/favorites?username=${encodeURIComponent(currentUser)}`)
                .then(res => res.json())
                .then(favorites => {
                    const isFavorite = favorites.some(f => f.id == book.id);
                    favBtn.textContent = isFavorite ? '⭐ Удалить из избранного' : '⭐ Добавить в избранное';

                    favBtn.addEventListener('click', () => {
                        const action = isFavorite ? 'remove' : 'add';
                        fetch("http://localhost:8080/favorite", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ currentUser, book_id: book.id, action })
                        })
                            .then(() => {
                                isFavorite = !isFavorite;
                                favBtn.textContent = isFavorite ? '⭐ Удалить из избранного' : '⭐ Добавить в избранное';
                            })
                            .catch(err => {
                                alert('❌ Не удалось изменить избранное');
                                console.error(err);
                            });
                    });
                });
        }

        if (currentUser === "Гость") {
            const downloadLink = document.getElementById('download-link');
            downloadLink.classList.add('disabled');
            downloadLink.removeAttribute('href');
            downloadLink.removeAttribute('download');
            downloadLink.style.pointerEvents = 'none';
            downloadLink.style.opacity = '0.5';
            downloadLink.title = 'Войдите, чтобы скачать книгу';
        }
    });

fetch(`http://localhost:8080/comments?book_id=${bookId}`)
    .then(res => res.json())
    .then(comments => {
        const container = document.getElementById('comment-section');
        container.innerHTML = '<h2>Комментарии</h2>';

        if (comments.length === 0) {
            container.innerHTML += '<p><em>Комментариев пока нет.</em></p>';
        } else {
            container.innerHTML += comments.map(c =>
                `<div class="comment"><span>${c.content}</span> <small>(${new Date(c.created_at).toLocaleString()})</small></div>`
            ).join('');
        }

        if (currentUser === "Гость") {
            container.innerHTML += `<p><em>Оставлять комментарии могут только авторизованные пользователи.</em></p>`;
        } else {
            container.innerHTML += `
      <textarea id="new-comment" placeholder="Оставьте комментарий."></textarea>
      <button id="submit-comment">Отправить</button>
    `;

            document.getElementById('submit-comment').addEventListener('click', () => {
                const text = document.getElementById('new-comment').value.trim();
                if (text === '') return alert("Комментарий не может быть пустым");

                fetch("http://localhost:8080/comment", {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ book_id: bookId, username: currentUser, text })
                })
                    .then(res => {
                        if (!res.ok) throw new Error("Ошибка при отправке комментария");
                        return res.text();
                    })
                    .then(() => location.reload())
                    .catch(err => {
                        alert("❌ Комментарий не отправлен");
                        console.error(err);
                    });
            });
        }


        document.getElementById('submit-comment').addEventListener('click', () => {
            const text = document.getElementById('new-comment').value.trim();
            if (text === '') return alert("Комментарий не может быть пустым");

            fetch("http://localhost:8080/comment", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ book_id: bookId, username: "Гость", text })
            })
                .then(res => {
                    if (!res.ok) throw new Error("Ошибка при отправке комментария");
                    return res.text();
                })
                .then(() => location.reload())
                .catch(err => {
                    alert("❌ Комментарий не отправлен");
                    console.error(err);
                });

        });
    });

document.addEventListener('click', e => {
    if (e.target.classList.contains('star')) {
        if (currentUser === "Гость") {
            alert("Оценивать книги могут только авторизованные пользователи.");
            return;
        }

        const star = e.target;
        const value = parseInt(star.dataset.value);
        const bookId = star.closest('.rating-stars').dataset.id;

        fetch("http://localhost:8080/rate", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ book_id: bookId, rating: value })
        })
            .then(res => res.text())
            .then(() => {
                alert(`Спасибо! Вы поставили ${value} ★`);
                // Повторно загружаем книгу, чтобы получить обновлённый рейтинг
                return fetch(`http://localhost:8080/books`);
            })
            .then(res => res.json())
            .then(books => {
                const updatedBook = books.find(b => b.id == bookId);
                if (updatedBook) {
                    document.getElementById('book-rating').textContent = updatedBook.rating?.toFixed(1) || '—';
                }
            })

            .catch(err => {
                alert('❌ Не удалось отправить рейтинг');
                console.error(err);
            });
    }
});
