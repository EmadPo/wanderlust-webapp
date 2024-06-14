let db;

const openRequest = indexedDB.open('myDatabase', 1);

openRequest.onerror = function (event) {
  console.error('Error opening database:', event.target.errorCode);
};

openRequest.onsuccess = function (event) {
  db = event.target.result;
  console.log('Database opened successfully');
  displayFavorites(); // Panggil fungsi displayFavorites setelah db terbuka
};

openRequest.onupgradeneeded = function (event) {
  db = event.target.result;
  const objectStore = db.createObjectStore('likes', {
    keyPath: 'id',
    autoIncrement: true,
  });
  console.log('Object store created successfully:', objectStore.name);
};

document.addEventListener('DOMContentLoaded', () => {
  // displayFavorites(); // Jangan panggil di sini karena db mungkin belum terbuka
});

function displayFavorites() {
  const favoriteList = document.getElementById('favorite-list');

  if (!favoriteList) {
    console.error('Element with id "favorite-list" not found in the document.');
    return;
  }

  if (!db) {
    console.error('IndexedDB instance (db) is not defined.');
    return;
  }

  const transaction = db.transaction(['likes'], 'readonly');
  const store = transaction.objectStore('likes');

  store.getAll().onsuccess = function (event) {
    const favorites = event.target.result;

    if (favorites && favorites.length > 0) {
      favoriteList.innerHTML = ''; // Clear existing content

      favorites.forEach((favorite) => {
        const { id, title, imageUrl, description } = favorite;

        const favoriteHTML = `
          <div class="card mb-3">
            <div class="row g-0">
              <div class="col-md-4">
                <img src="${imageUrl}" class="img-fluid rounded-start" alt="${title}">
              </div>
              <div class="col-md-8">
                <div class="card-body">
                  <h5 class="card-title">${title}</h5>
                  <p class="card-text">${description}</p>
                  <a href="/detail.html?id=${id}" class="btn btn-primary">Detail</a>
                </div>
              </div>
            </div>
          </div>
        `;

        favoriteList.innerHTML += favoriteHTML;
      });
    } else {
      favoriteList.innerHTML = '<p>No favorites found.</p>';
    }
  };
}
