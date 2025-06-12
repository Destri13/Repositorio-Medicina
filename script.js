document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const searchResultsDiv = document.getElementById('searchResults');
    const loadingMessage = document.getElementById('loadingMessage');
    const noResultsMessage = document.getElementById('noResultsMessage');

    let searchIndex = {}; // Índice JSON cargado

    // =================================================================
    // ESTA LÍNEA ES LA CLAVE: Ahora apunta al visor en tu proyecto
    const visorBaseUrl = 'pdfjs/web/viewer.html';
    // =================================================================

    // Cargar índice JSON
    async function loadSearchIndex() {
        loadingMessage.style.display = 'block';
        noResultsMessage.style.display = 'none';
        searchResultsDiv.innerHTML = '';

        try {
            const response = await fetch('search_index.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            searchIndex = await response.json();
            loadingMessage.style.display = 'none';
            searchInput.focus();
            console.log("Índice cargado correctamente");
        } catch (error) {
            loadingMessage.textContent = 'Error al cargar índice. Recarga la página.';
            loadingMessage.style.color = 'red';
            console.error('Error al cargar índice:', error);
        }
    }

    // Buscar y mostrar resultados
    function performSearch() {
        const query = searchInput.value.trim().toLowerCase();
        if (!query) {
            searchResultsDiv.innerHTML = '';
            noResultsMessage.style.display = 'none';
            return;
        }

        loadingMessage.style.display = 'none';
        searchResultsDiv.innerHTML = '';
        noResultsMessage.style.display = 'none';

        let results = [];
        const searchTerms = query.split(/\s+/).filter(term => term.length > 0);

        for (const filename in searchIndex) {
            const fileData = searchIndex[filename];
            for (const pageNum in fileData.pages) {
                const pageText = fileData.pages[pageNum].toLowerCase();
                if (searchTerms.every(term => pageText.includes(term))) {
                    results.push({
                        filename: filename,
                        url: fileData.url,
                        pageNumber: pageNum.replace('page_', '')
                    });
                }
            }
        }
        
        results.sort((a, b) => {
            if (a.filename !== b.filename) {
                return a.filename.localeCompare(b.filename);
            }
            return parseInt(a.pageNumber) - parseInt(b.pageNumber);
        });

        if (results.length > 0) {
            results.forEach(result => {
                const resultItem = document.createElement('div');
                resultItem.classList.add('result-item');

                const newsTitle = document.createElement('h3');
                newsTitle.textContent = `Noticia: ${result.filename.replace('.pdf', '').replace(/_/g, ' ')}`;

                const pageLink = document.createElement('a');
                
                // Corregimos la ruta eliminando la parte extra "Repositorio_Medicina/"
                const correctedPath = result.url.replace('Repositorio_Medicina/', '');
                
                // Codificamos la ruta relativa para pasarla al visor local.
                const encodedPdfUrl = encodeURIComponent(correctedPath);

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
    }

    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            performSearch();
        }
    });

    loadSearchIndex();
});
