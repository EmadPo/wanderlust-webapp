let db;

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const destinationId = urlParams.get('id');

  if (!destinationId) {
    console.error('Destination ID parameter is missing');
    return;
  }

  try {
    db = await openDB();

    const destinationData = await fetchDestinationData(destinationId);
    renderDestinationDetail(destinationData);
  } catch (error) {
    console.error('Error fetching and rendering destination detail:', error);
  }
});

async function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('myDatabase', 1);
    request.onerror = function (event) {
      console.error('Error opening IndexedDB:', event.target.error);
      reject(event.target.error);
    };

    request.onsuccess = function (event) {
      const database = event.target.result;
      resolve(database);
    };

    request.onupgradeneeded = function (event) {
      const database = event.target.result;

      if (!database.objectStoreNames.contains('likes')) {
        database.createObjectStore('likes', { keyPath: 'id' });
      }
    };
  });
}

async function fetchDestinationData(id) {
  try {
    const response = await fetch(
      `https://wanderlust-api-ten.vercel.app/api/contents/${id}`
    );
    const jsonResponse = await response.json();
    return jsonResponse.data || {};
  } catch (error) {
    console.error('Error fetching destination data:', error);
    throw error;
  }
}

function renderDestinationDetail(data) {
  const { id, title, image_url, description } = data;

  const detailContent = document.getElementById('detail-content');
  if (!detailContent) {
    console.error('Detail content container not found');
    return;
  }

  const detailHTML = `
    <div class="card col-8 mx-auto">
      <div style="position: relative;">
        <span style="position: absolute; top: 10px; right: 10px; z-index: 1;"></span>
        <img src="${image_url}" class="card-img-top" alt="${title}">
      </div>
      <div class="card-body">
        <h5 class="card-title">${title}</h5>
        <p class="card-text">${description}</p>
        <button id="likeButton" class="btn btn-outline-danger">
          <i class="fa fa-heart"></i> Like
        </button>
      </div>
    </div>
  `;

  detailContent.innerHTML = detailHTML;
  const likeButton = document.getElementById('likeButton');
  checkIfLiked(id); // Check if this item is already liked when rendering

  likeButton.addEventListener('click', () => {
    if (likeButton.classList.contains('liked')) {
      removeFromFavorites(id);
    } else {
      addToFavorites(data);
    }
  });
}

function addToFavorites(data) {
  const { id, title, image_url, description } = data;
  const timestamp = new Date().getTime();

  const transaction = db.transaction(['likes'], 'readwrite');
  const store = transaction.objectStore('likes');

  const likeData = {
    id: id,
    title: title,
    imageUrl: image_url,
    description: description,
    timestamp: timestamp,
  };

  const request = store.add(likeData);

  request.onsuccess = function (event) {
    console.log('Data added to IndexedDB successfully');
    updateLikeButton(true);
  };

  request.onerror = function (event) {
    console.error('Error adding data to IndexedDB:', event.target.error);
  };
}

function removeFromFavorites(id) {
  const transaction = db.transaction(['likes'], 'readwrite');
  const store = transaction.objectStore('likes');

  const request = store.delete(id);

  request.onsuccess = function (event) {
    console.log('Data removed from IndexedDB successfully');
    updateLikeButton(false);
  };

  request.onerror = function (event) {
    console.error('Error removing data from IndexedDB:', event.target.error);
  };
}

function checkIfLiked(id) {
  const transaction = db.transaction(['likes'], 'readonly');
  const store = transaction.objectStore('likes');

  const request = store.get(id);

  request.onsuccess = function (event) {
    const result = event.target.result;
    if (result) {
      updateLikeButton(true);
    } else {
      updateLikeButton(false);
    }
  };

  request.onerror = function (event) {
    console.error('Error checking liked status:', event.target.error);
    updateLikeButton(false);
  };
}

function updateLikeButton(isLiked) {
  const likeButton = document.getElementById('likeButton');
  if (isLiked) {
    likeButton.classList.add('liked');
    likeButton.innerHTML = '<i class="fa fa-heart"></i> Unlike';
  } else {
    likeButton.classList.remove('liked');
    likeButton.innerHTML = '<i class="fa fa-heart"></i> Like';
  }
}
