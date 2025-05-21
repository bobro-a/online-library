

const username = sessionStorage.getItem("user") || "Гость";

const greeting = document.getElementById("user-greeting");
greeting.textContent = `Привет, ${username}!`;
fetch(`http://localhost:8080/favorites?username=${encodeURIComponent(username)}`)
    .then(res => res.ok ? res.json() : Promise.reject("Ошибка получения избранного"))
    .then(books => {
        const container = document.getElementById("book-list");
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
        const container = document.getElementById("book-list");
        container.innerHTML = "<p>❌ Не удалось загрузить избранное.</p>";
        console.error(err);
    });

// const logoutBtn = document.getElementById('logout-btn');
// if (logoutBtn) {
//     logoutBtn.addEventListener('click', () => {
//         sessionStorage.removeItem('user');
//         window.location.href = "index.html";
//     });
// }

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