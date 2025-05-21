export function getFavorites() {
    return JSON.parse(localStorage.getItem('favorites-list') || '[]');
}

export function toggleFavorite(bookId) {
    let favorites = getFavorites();
    const index = favorites.indexOf(bookId);
    if (index >= 0) {
        favorites.splice(index, 1);
    } else {
        favorites.push(bookId);
    }
    localStorage.setItem('favorites-list', JSON.stringify(favorites));
}

export function setupFavoriteButton(button, bookId) {
    const updateText = () => {
        button.textContent = getFavorites().includes(bookId)
            ? '⭐ Удалить из избранного'
            : '⭐ Добавить в избранное';
    };
    updateText();

    button.addEventListener('click', () => {
        toggleFavorite(bookId);
        updateText();
    });
}