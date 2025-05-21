const params = new URLSearchParams(window.location.search);
const bookId = params.get('id');

fetch(`http://localhost:8080/books`)
    .then(res => res.json())
    .then(books => {
        const book = books.find(b => b.id == bookId);
        if (!book) throw new Error("Книга не найдена");

        document.title = book.title;
        document.getElementById('book-title-info').textContent = book.title;
        document.getElementById('book-author').textContent = book.author;
        document.getElementById('book-tags').textContent = book.tags;
        document.getElementById('book-year').textContent = book.year;
        document.getElementById('book-rating').textContent = book.rating?.toFixed(1) || '—';
        document.getElementById('book-rating-stars').dataset.id = book.id;
        document.getElementById('book-rating-stars').innerHTML =
            [1, 2, 3, 4, 5].map(i => `<span class="star" data-value="${i}">★</span>`).join('');
        document.getElementById('book-cover').src = book.cover;
        document.getElementById('read-link').href = book.pdf;
        document.getElementById('download-link').href = book.pdf;
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

        container.innerHTML += `
      <textarea id="new-comment" placeholder="Оставьте комментарий..."></textarea>
      <button id="submit-comment">💬 Отправить</button>
    `;

        document.getElementById('submit-comment').addEventListener('click', () => {
            const text = document.getElementById('new-comment').value.trim();
            if (text === '') return alert("Комментарий не может быть пустым");

            fetch("http://localhost:8080/comment", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({  book_id: bookId, username: "Гость", text: comment })
            }).then(() => location.reload());
        });
    });

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
            .then(res => res.json())
            .then(() => {
                alert(`Спасибо! Вы поставили ${value} ★`);
                document.getElementById('book-rating').textContent = value.toFixed(1);
            })
            .catch(err => {
                alert('❌ Не удалось отправить рейтинг');
                console.error(err);
            });
    }
});
