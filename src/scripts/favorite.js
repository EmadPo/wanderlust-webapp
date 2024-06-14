let db;

const openRequest = indexedDB.open('myDatabase', 1);

openRequest.onerror = function (event) {
  console.error('Error opening database:', event.target.errorCode);
};

openRequest.onsuccess = function (event) {
  db = event.target.result;
  console.log('Database opened successfully');
  displayFavorites();
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
  // displayFavorites();
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
      favoriteList.innerHTML = '';

      favorites.forEach((favorite) => {
        const { id, title, imageUrl, description } = favorite;

        const favoriteItem = document.createElement('div');
        favoriteItem.classList.add('col-12', 'col-md-4', 'mb-4');
        favoriteItem.innerHTML = `
          <div class="card ">
            <img src="${imageUrl}" class="card-img-top" alt="${title}">
            <div class="card-body">
              <h5 class="card-title">${title}</h5>
              <p class="card-text">${description}</p>
              <a href="/detail.html?id=${id}" class="btn btn-primary">Detail</a>
            </div>
          </div>
        `;

        favoriteList.appendChild(favoriteItem);
      });
    } else {
      favoriteList.innerHTML = '<p>No favorites found.</p>';
    }
  };
}
