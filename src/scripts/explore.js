document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded and parsed');
  renderExploreList();
});

async function fetchExploreData() {
  try {
    const response = await fetch(
      'https://wanderlust-api-ten.vercel.app/api/contents'
    );
    const jsonResponse = await response.json();
    return jsonResponse.data || [];
  } catch (error) {
    console.error('Error fetching data:', error);
    alert('Terjadi kesalahan saat mengambil data. Silakan coba lagi nanti.');
    return [];
  }
}

async function renderExploreList() {
  try {
    const exploreListContainer = document.getElementById('explore-list');
    if (!exploreListContainer) {
      console.error('Explore list container not found');
      return;
    }

    exploreListContainer.innerHTML = '';

    const exploreData = await fetchExploreData();

    exploreData.forEach((item) => {
      const { id, title, image_url, description } = item;
      const exploreItem = document.createElement('div');
      exploreItem.classList.add('col-12', 'col-md-4', 'mb-4');
      exploreItem.innerHTML = `
        <div class="card">
          <img src="${image_url}" class="card-img-top" alt="${title}">
          <div class="card-body">
            <h5 class="card-title">${title}</h5>
            <p class="card-text">${description}</p>
            <button class="btn btn-primary detail-btn" data-id="${id}">Detail</button>
          </div>
        </div>
      `;
      exploreListContainer.appendChild(exploreItem);
    });

    const detailButtons = document.querySelectorAll('.detail-btn');
    detailButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const destinationId = button.getAttribute('data-id');
        window.location.href = `/detail.html?id=${destinationId}`;
      });
    });
  } catch (error) {
    console.error('Error rendering explore list:', error);
  }
}
