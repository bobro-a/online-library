

const username = sessionStorage.getItem("user") || "Гость";

const greeting = document.getElementById("user-greeting");
greeting.textContent = `Привет, ${username}!`;
fetch(`http://localhost:8080/favorites?username=${encodeURIComponent(username)}`)
    .then(res => res.ok ? res.json() : Promise.reject("Ошибка получения избранного"))
    .then(books => {
        const container = document.getElementById("favorites-list");
        container.innerHTML = "";

        if (books.length === 0) {
            container.innerHTML = "<p>Нет избранных книг.</p>";
            return;
        }

        books.forEach(book => {
            const div = document.createElement("div");
            div.className = "book-card";
            div.innerHTML = `
        <img src="${book.cover}" class="book-cover" alt="Обложка">
        <h3><a href="book.html?id=${book.id}">${book.title}</a></h3>
        <p><strong>Автор:</strong> ${book.author}</p>
        <p><strong>Жанр:</strong> ${book.tags}</p>
        <p><strong>Год:</strong> ${book.year}</p>
        <p><strong>Рейтинг:</strong> ${book.rating?.toFixed(1) || '—'}</p>
      `;
            container.appendChild(div);
        });
    })
    .catch(err => {
        const container = document.getElementById("favorites-list");
        container.innerHTML = "<p>❌ Не удалось загрузить избранное.</p>";
        console.error(err);
    });