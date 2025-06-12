document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const searchResultsDiv = document.getElementById('searchResults');
    const loadingMessage = document.getElementById('loadingMessage');
    const noResultsMessage = document.getElementById('noResultsMessage');

    loadingMessage.style.display = 'none';
    noResultsMessage.style.display = 'none';
    searchInput.focus();
    
    const visorBaseUrl = 'pdfjs/web/viewer.html';

    async function performSearch() {
        const query = searchInput.value.trim();
        if (!query) {
            searchResultsDiv.innerHTML = '';
            noResultsMessage.style.display = 'none';
            return;
        }

        searchResultsDiv.innerHTML = '';
        noResultsMessage.style.display = 'none';
        loadingMessage.textContent = 'Buscando...';
        loadingMessage.style.display = 'block';

        try {
            const response = await fetch(`/.netlify/functions/search?q=${encodeURIComponent(query)}`);
            
            if (!response.ok) {
                throw new Error(`Error del servidor: ${response.statusText}`);
            }

            const results = await response.json();
            loadingMessage.style.display = 'none';

            if (results.length > 0) {
                results.forEach(result => {
                    const resultItem = document.createElement('div');
                    resultItem.classList.add('result-item');

                    const newsTitle = document.createElement('h3');
                    newsTitle.textContent = `Documento: ${result.filename.replace('.pdf', '').replace(/_/g, ' ')}`;

                    const pageLink = document.createElement('a');
                    
                    const pathForViewer = `../../${result.url}`;
                    const encodedPdfUrl = encodeURIComponent(pathForViewer);

                    pageLink.href = `${visorBaseUrl}?file=${encodedPdfUrl}#page=${result.pageNumber}`;
                    pageLink.target = "_blank";
                    pageLink.rel = "noopener noreferrer";
                    pageLink.textContent = `Ver página ${result.pageNumber}`;

                    resultItem.appendChild(newsTitle);
                    resultItem.appendChild(pageLink);
                    searchResultsDiv.appendChild(resultItem);
                });
            } else {
                noResultsMessage.style.display = 'block';
            }

        } catch(error) {
            loadingMessage.style.display = 'none';
            searchResultsDiv.innerHTML = `<p style="color:red;">Error al realizar la búsqueda. Inténtalo de nuevo.</p>`;
            console.error(error);
        }
    }

    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            performSearch();
        }
    });
});