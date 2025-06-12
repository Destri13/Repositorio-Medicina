const fetch = require('node-fetch');

let cachedIndex = null;

async function loadAndCacheIndex() {
  if (cachedIndex) {
    return;
  }

  const indexUrl = `${process.env.URL}/search_index.json`;  
  console.log(`Índice no está en caché. Descargando desde: ${indexUrl}`);
  
  try {
    const response = await fetch(indexUrl);
    if (!response.ok) {
      throw new Error(`Fallo al descargar el índice: ${response.statusText}`);
    }
    cachedIndex = await response.json();
    console.log('Índice descargado y guardado en caché correctamente.');
  } catch (error) {
    console.error('Error crítico al cargar el índice:', error);
    cachedIndex = null;
  }
}

exports.handler = async (event) => {
  await loadAndCacheIndex();

  if (!cachedIndex) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'No se pudo cargar el índice de búsqueda en el servidor.' }),
    };
  }
  
  const query = event.queryStringParameters.q?.trim().toLowerCase();

  if (!query) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Falta el término de búsqueda' }),
    };
  }

  const searchTerms = query.split(/\s+/).filter(term => term.length > 0);
  let results = [];

  for (const filename in cachedIndex) {
    const fileData = cachedIndex[filename];
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

  return {
    statusCode: 200,
    body: JSON.stringify(results),
  };
};