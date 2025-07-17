let isSerie = document.getElementById("serie");
let isMovie = document.getElementById("movie");
let userInput = document.getElementById("movie-link");
let episodeContainer = document.getElementById("episodeContainer"); // Nuevo elemento
let types = document.querySelectorAll("input[type=radio][name=type]");
let numeroTemporadaInput = document.getElementById("numeroTemporada");
let inputsContainer = document.getElementById("inputs-container");
let api_key = "e416234abcb5d260538a8f7ce6ba12e4";
let language = "es-MX";

types.forEach((type) => {
    type.addEventListener("change", () => {
        if (type.value == "movie") {
            document.getElementById("season-selector").style.display = "none";
            userInput.placeholder = "Buscar película";

            // Ocultar el contenedor de episodios
            if (episodeContainer) {
                episodeContainer.style.display = 'none';
            }
        } else if (type.value == "serie") {
            document.getElementById("season-selector").style.display = "block";
            userInput.placeholder = "Buscar serie";

            // Mostrar el contenedor de episodios si estaba oculto previamente
            if (episodeContainer && episodeContainer.style.display === 'none') {
                episodeContainer.style.display = 'block';
            }
        }

        const searchTerm = searchInput.value;
        const searchType = isSerie.checked ? "tv" : "movie";
        if (searchTerm.trim() !== "") {
            searchMoviesOrSeries(searchTerm, searchType);
        }
    });
});

const searchInput = document.getElementById("movie-search");

searchInput.addEventListener("input", () => {
    const searchTerm = searchInput.value;
    const searchType = isSerie.checked ? "tv" : "movie";
    if (searchTerm.trim() !== "") {
        searchMoviesOrSeries(searchTerm, searchType);
    }
});

//movie
function updateInputVisibility() {
    userInput.style.display = isMovie.checked ? "block" : "none";
}

updateInputVisibility();
types.forEach((type) => {
    type.addEventListener("change", () => {
        updateInputVisibility();
        if (type.value === "movie") {
            // Si es una película, muestra el input
            userInput.style.display = "block";
        } else if (type.value === "serie") {
            // Si es una serie, oculta el input
            userInput.style.display = "none";
        }
    });
});

numeroTemporadaInput.addEventListener("input", () => {
    const serieId = document.getElementById("numero").value;
    generateInputsForAllSeasons(serieId);
});

async function searchMoviesOrSeries(searchTerm, searchType) {
    try {
        let url;
        if (searchType === "tv") {
            url = `https://api.themoviedb.org/3/search/tv?api_key=${api_key}&query=${searchTerm}&language=es-MX`;
        } else if (searchType === "movie") {
            url = `https://api.themoviedb.org/3/search/movie?api_key=${api_key}&query=${searchTerm}&language=es-MX`;
        } else {
            console.error("Tipo de búsqueda no válido");
            return;
        }

        const response = await fetch(url);

        if (response.status === 200) {
            const searchData = await response.json();
            displaySearchResults(searchData.results);
        } else {
            console.log("Error en la búsqueda");
        }
    } catch (error) {
        console.error(error);
    }
}

function toggleResults() {
    const searchResultsContainer = document.getElementById('search-results-container');
    const toggleResultsButton = document.getElementById('toggle-results');

    if (searchResultsContainer.style.display === 'none') {
        searchResultsContainer.style.display = 'flex';
        toggleResultsButton.innerText = 'Ocultar Resultados';
    } else {
        searchResultsContainer.style.display = 'none';
        toggleResultsButton.innerText = 'Mostrar Resultados';
    }
}

function displaySearchResults(results) {
    const resultsContainer = document.getElementById('search-results');
    const noResultsMessage = document.getElementById('no-results-message');
    const searchResultsContainer = document.getElementById('search-results-container');

    resultsContainer.innerHTML = ''; // Limpiar resultados anteriores

    if (results.length > 0) {
        results.forEach((result) => {
            const resultItem = document.createElement('div');
            resultItem.classList.add('search-result-item');

            // Verificar si la imagen está disponible
            const imageUrl = result.poster_path
                ? `https://image.tmdb.org/t/p/w300/${result.poster_path}`
                : 'https://www.puroverso.uy/images/virtuemart/product/9789974719019.jpg';

            resultItem.innerHTML = `
                 <img src="${imageUrl}" alt="${result.title || result.name}" />
                 <div class="result-info">
                     <p class="result-title"><strong>Título:</strong> <span>${result.title || result.name}</span></p>
                     <p class="result-year"><strong>Año:</strong> <span>${result.first_air_date ? result.first_air_date.slice(0, 4) : (result.release_date ? result.release_date.slice(0, 4) : 'N/A')}</span></p>
                     <p class="result-id"><strong>ID:</strong> <span>${result.id}</span></p>
                 </div>
             `;

            resultItem.addEventListener('click', () => {
                // Al hacer clic en un resultado, actualizar el campo ID y generar la información
                document.getElementById('numero').value = result.id;
                generateInputsForAllSeasons(result.id);
                document.getElementById("titulo-entrada").value = result.title || result.name;
                // Ocultar resultados después de hacer clic en un resultado
                searchResultsContainer.style.display = 'none';
                document.getElementById('toggle-results').innerText = 'Mostrar Resultados';
            });

            resultsContainer.appendChild(resultItem);
        });

        updateToggleResultsButton();

        // Mostrar resultados y ocultar mensaje de no hay resultados
        searchResultsContainer.style.display = 'block';
        noResultsMessage.style.display = 'none';
    } else {
        // Ocultar resultados y mostrar mensaje de no hay resultados
        searchResultsContainer.style.display = 'none';
        noResultsMessage.style.display = 'block';
    }
}

// Nueva función para actualizar el texto del botón cuando cambia la visibilidad del contenedor
function updateToggleResultsButton() {
    const searchResultsContainer = document.getElementById('search-results-container');
    const toggleResultsButton = document.getElementById('toggle-results');

    if (searchResultsContainer.style.display === 'none') {
        toggleResultsButton.innerText = 'Mostrar Resultados';
    } else {
        toggleResultsButton.innerText = 'Ocultar Resultados';
    }
}

function convertMinutes(minutess) {
    let hours = Math.floor(minutess / 60),
        minutes = Math.floor(minutess % 60),
        total = "";

    if (minutess < 60) {
        total = `${minutes}m`;
        return total;
    } else if (minutess > 60) {
        total = `${hours}h ${minutes}m`;
        return total;
    } else if ((minutess === 60)) {
        total = `${hours}h`;
        return total;
    }
}

function formatLink(originalLink) {
    // Verificar si el enlace original ya está en el formato esperado
    if (originalLink.includes("streamwish.to/e/")) {
        return originalLink; // Devolver el enlace original si ya está en el formato esperado
    }

    // Extraer el código del enlace original
    const match = originalLink.match(/[^\/]+$/);
    if (match) {
        const code = match[0];
        // Construir el enlace en el formato esperado
        return `https://streamwish.to/e/${code}`;
    } else {
        // Devolver el enlace original si no se puede extraer el código
        return originalLink;
    }
}

// Inicializar el array bidimensional para almacenar los enlaces de cada temporada
let episodeContent = [];

async function generateInputsForAllSeasons(serieId) {
    try {
        // Reset episodeContent array at the start
        episodeContent = [];

        // Limpiar el contenedor de inputs antes de agregar nuevos
        let inputsContainer = document.getElementById("inputs-container");
        inputsContainer.innerHTML = "";

        // Obtener el número total de temporadas de la serie
        let seriesResponse = await fetch(
            `https://api.themoviedb.org/3/tv/${serieId}?api_key=e416234abcb5d260538a8f7ce6ba12e4&language=es-MX`
        );

        if (seriesResponse.status === 200) {
            let serieData = await seriesResponse.json();

            // Iterar sobre cada temporada
            for (let seasonNumber = 1; seasonNumber <= serieData.number_of_seasons; seasonNumber++) {
                // Obtener datos de la temporada actual
                let seasonDataResponse = await fetch(
                    `https://api.themoviedb.org/3/tv/${serieId}/season/${seasonNumber}?api_key=e416234abcb5d260538a8f7ce6ba12e4&language=es-MX`
                );

                if (seasonDataResponse.status === 200) {
                    let seasonData = await seasonDataResponse.json();
                    let episodeCount = seasonData.episodes.length;

                    // Crear un contenedor para los inputs de la temporada actual
                    let seasonContainer = document.createElement("div");
                    seasonContainer.classList.add("season-container");
                    seasonContainer.id = `season-${seasonNumber}`;

                    // Crear un título para la temporada
                    let seasonTitle = document.createElement("h2");
                    seasonTitle.textContent = `Temporada ${seasonNumber}`;
                    seasonContainer.appendChild(seasonTitle);

                    // Crear un array para almacenar los enlaces de la temporada actual
                    let seasonLinks = new Array(episodeCount).fill('');

                    // Generar inputs para cada episodio de la temporada actual
                    for (let i = 0; i < episodeCount; i++) {
                        let inputId = `episode-${seasonNumber}-${i + 1}`;

                        // Crear el input
                        let input = document.createElement("input");
                        input.type = "text";
                        input.id = inputId;
                        input.placeholder = `Episodio ${i + 1}`;

                        // Agregar un event listener para escuchar cambios en el input
                        input.addEventListener("input", (event) => {
                            seasonLinks[i] = event.target.value;
                            episodeContent[seasonNumber - 1] = seasonLinks;
                        });

                        seasonContainer.appendChild(input);
                    }

                    // Agregar el contenedor de la temporada al contenedor principal
                    inputsContainer.appendChild(seasonContainer);
                    // Agregar el array de enlaces de la temporada al array bidimensional
                    episodeContent.push(seasonLinks);
                }
            }
            return episodeContent;
        }
    } catch (error) {
        console.error("Error inesperado:", error);
    }
}

// Array global para almacenar los géneros
let generosGlobal = [];

async function generar() {
    let serieKey = document.getElementById("numero").value;

    const cargarPeliculas = async () => {
        if (isSerie.checked) {
            try {
                const serieId = document.getElementById("numero").value;
                const serieResponse = await fetch(`https://api.themoviedb.org/3/tv/${serieId}?api_key=${api_key}&language=${language}`);
                const serieData = await serieResponse.json();

                // Handle missing series synopsis
                let synopsis = serieData.overview;
                if (!synopsis || synopsis.trim() === '') {
                    // Try English version
                    const enResponse = await fetch(`https://api.themoviedb.org/3/tv/${serieId}?api_key=${api_key}&language=en-US`);
                    const enData = await enResponse.json();
                    synopsis = enData.overview || 'Sinopsis no disponible';
                }
                serieData.overview = synopsis;

                // Get all episode links before generating HTML
                const allEpisodeLinks = [];
                const inputs = document.querySelectorAll('#inputs-container input[type="text"]');
                inputs.forEach(input => {
                    if (input.value) {
                        allEpisodeLinks.push(input.value);
                    }
                });

                // Continue with existing code but use allEpisodeLinks instead of episodeContent
                let episodesHTML = '';
                let currentEpisodeIndex = 0;

                for (let seasonNumber = 1; seasonNumber <= serieData.number_of_seasons; seasonNumber++) {
                    const seasonResponse = await fetch(`https://api.themoviedb.org/3/tv/${serieId}/season/${seasonNumber}?api_key=${api_key}&language=${language}`);
                    const seasonData = await seasonResponse.json();

                    const episodes = [];
                    for (const [index, episode] of seasonData.episodes.entries()) {
                        const episodeUrl = allEpisodeLinks[currentEpisodeIndex] || '';
                        currentEpisodeIndex++;

                        // Obtener la sinopsis del episodio
                        let synopsis = episode.overview;

                        // Si la sinopsis no está disponible en es-MX, intentar obtenerla en es
                        if (!synopsis) {
                            const esResponse = await fetch(`https://api.themoviedb.org/3/tv/${serieId}/season/${seasonNumber}/episode/${episode.episode_number}/translations?api_key=${api_key}`);
                            const esData = await esResponse.json();
                            const esOverview = esData.translations.find(trans => trans.iso_3166_1 === 'ES');
                            synopsis = esOverview ? esOverview.data.overview : 'No disponible en este idioma';
                        }

                        // Construir el HTML para cada episodio
                        const imageUrl = `https://image.tmdb.org/t/p/w300/${episode.still_path}`;
                        const runtime = episode.runtime ? `${episode.runtime}m` : 'N/A';
                        const episodeHTML = `
                            <li>
                                <a href="https://embed-cinemax-app.blogspot.com/p/embed.html?videoUrl=${episodeUrl}" class="https://embed-cinemax-app.blogspot.com/p/embed.html?videoUrl=${episodeUrl}" data-url="https://embed-cinemax-app.blogspot.com/p/embed.html?videoUrl=${episodeUrl}">
                                    <div class="episode__img">
                                        <img src="${imageUrl}" onerror="this.style='display:none';">
                                        <div class="episode__no-image"><i class="fa-regular fa-circle-play"></i></div>
                                    </div>
                                    <div class="episode__info">
                                        <h4 class="episode__info__title">${episode.episode_number}. ${episode.name}</h4>
                                        <div class="episode__info__duration">${runtime}</div>
                                        <p class="sinopsis-info"></p>
                                    </div>
                                </a>
                            </li>`;
                        episodes.push(episodeHTML);
                    }

                    // Determinar la clase para el contenedor de episodios
                    const seasonClass = seasonNumber === 1 ? 'animation' : 'hide';

                    // Agregar los episodios de la temporada actual al HTML final
                    episodesHTML += `
                        <ul class="caps-grid ${seasonClass}" id="season-${seasonNumber}">
                            ${episodes.join('')}
                        </ul>`;
                }

                let seasonsOption = "";

                serieData.seasons.forEach(season => {
                    if (season.name != "Especiales") {
                        seasonsOption += `<option value="${season.season_number}">Temporada ${season.season_number}</option>
                    `;
                    }
                });

                let genSeasonsCount;

                if (serieData.number_of_seasons == 1) {
                    genSeasonsCount = " Temporada";
                } else if (serieData.number_of_seasons > 1) {
                    genSeasonsCount = " Temporadas";
                }

                // Construir el HTML final
                let htmlFinal = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${datos.title}</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />

  <style>
    body {
      margin: 0 !important;
      padding: 0 !important;
      background-color: #000 !important;
      font-family: Arial, sans-serif !important;
    }

    .post-header {
      display: flex !important;
      flex-wrap: wrap !important;
      background: #111 !important;
      padding: 20px !important;
      border-radius: 10px !important;
      color: #fff !important;
      gap: 20px !important;
    }

    .image-and-btn {
      display: flex !important;
      gap: 15px !important;
      align-items: flex-start !important;
      width: 100% !important;
    }

    .poster-img {
      width: 175px !important;
      height: auto !important;
      border-radius: 10px !important;
      object-fit: cover !important;
    }

    .post-header__info {
      display: flex !important;
      flex-direction: column !important;
      justify-content: flex-start !important;
      gap: 6px !important;
      min-width: 150px !important;
      color: #ccc !important;
      font-size: 14px !important;
    }

    .post-header__info h1 {
      font-size: 20px !important;
      margin: 0 !important;
      color: #fff !important;
    }

    .post-header__info ul {
      display: flex !important;
      flex-direction: column !important;
      padding: 0 !important;
      margin: 0 !important;
      list-style: none !important;
      gap: 8px !important;
      font-size: 14px !important;
      color: #ccc !important;
    }

    .tmdb-rate {
      display: flex !important;
      align-items: center !important;
      gap: 5px !important;
    }

    .tmdb-rate i {
      color: #000 !important;
      margin-right: 5px !important;
    }

    .info-item {
      display: flex !important;
      align-items: center !important;
      gap: 5px !important;
    }

    .info-item i {
      color: #ccc !important;
      font-size: 14px !important;
    }

    .resume {
      width: 100% !important;
      font-size: 14px !important;
      margin-top: 15px !important;
      color: #ccc !important;
    }

    .fav-js {
      display: none !important;
    }

    .bs-favs,
    .delete-btn {
      display: none !important;
    }
  </style>
</head>
<body>

  <div class="post-header">
    <div class="image-and-btn">
      <img 
        src="https://media.themoviedb.org/t/p/w440_and_h660_face${datos.poster_path}" 
        class="poster-img" 
        alt="Poster de ${datos.title}" 
      />

      <div class="post-header__info">
        <button class="bs-favs" card-id="84958" id="add-btn"></button>
        <button class="delete-btn none-btn" card-id="84958" id="remove-btn"></button>

        <ul>
          <li class="tmdb-rate">
            <i class="fa-solid fa-star"></i> ${serieData.vote_average.toFixed(1)}
          </li>
          <li class="info-item">
            <i class="fa-regular fa-calendar"></i>
            <span>${serieData.first_air_date.slice(0, 4)}</span>
          </li>
          <li class="info-item">
            <i class="fa-solid fa-layer-group"></i>
            <span>${serieData.number_of_seasons + genSeasonsCount}</span>
          </li>
          <li class="info-item">
            <i class="fas fa-bolt fa-beat" style="color: #FFFF00;"></i>
            <span>TurboPlayer</span>
          </li>
        </ul>
      </div>
    </div>

    <p class="resume">
      ${serieData.overview}
    </p>
  </div>`;

                // Agregar el HTML final al elemento con el ID "html-final"
                document.getElementById('html-final').innerText = htmlFinal;

                // Limpiar el contenido del array episodeContent
                episodeContent.length = 0;
            } catch (error) {
                console.error('Error al generar los episodios:', error);
            }
        } else if (isMovie.checked) {
            try {
                const respuesta = await fetch(
                    `https://api.themoviedb.org/3/movie/${serieKey}?api_key=${api_key}&language=${language}&append_to_response=credits`
                );

                if (respuesta.status === 200) {
                    const datos = await respuesta.json();
                    const castMembers = datos.credits.cast.slice(0, 6); // Get first 6 cast members

                    // Get English synopsis if Spanish is not available
                    let synopsis = datos.overview;
                    if (!synopsis || synopsis.trim() === '') {
                        const enResponse = await fetch(
                            `https://api.themoviedb.org/3/movie/${serieKey}?api_key=${api_key}&language=en-US`
                        );
                        const enData = await enResponse.json();
                        synopsis = enData.overview || 'Sinopsis no disponible';
                    }

                    // Generate cast HTML
                    const castHTML = castMembers.map(member => {
                        const imageUrl = member.profile_path ? 
                            `https://image.tmdb.org/t/p/w185${member.profile_path}` :
                            'https://via.placeholder.com/185x185';
                        
                        return `
                            <div class="cast-member">
                                <img src="${imageUrl}"
                                     class="cast-img"
                                     alt="${member.name}"
                                     onerror="this.src='https://via.placeholder.com/185x185'">
                                <div class="cast-name">${member.name}</div>
                                <div class="cast-character">${member.character}</div>
                            </div>`;
                    }).join('');

                    // Obtén los valores de los enlaces
                    const userInputA = document.getElementById('userInputA').value;
                    const userInputB = document.getElementById('userInputB')?.value;
                    const userInputC = document.getElementById('userInputC')?.value;
                    const userInputD = document.getElementById('userInputD')?.value;

                    // Generate modal content based on available links
                    const modalOptions = [
                        userInputA ? `<a href="https://embed-cinemax-app.blogspot.com/p/embed.html?videoUrl=${userInputA}&secure_uri=true" class="modal-option" id="option1">
                            <i class="fas fa-bolt fa-beat"></i> TurboByte HD
                        </a>` : '',
                        userInputB ? `<a href="https://embed-cinemax-app.blogspot.com/p/embed.html?videoUrl=${userInputB}&secure_uri=true" class="modal-option" id="option2">
                            <i class="fas fa-bolt fa-beat"></i> TurboWolf HD
                        </a>` : '',
                        userInputC ? `<a href="https://embed-cinemax-app.blogspot.com/p/embed.html?videoUrl=${userInputC}&secure_uri=true" class="modal-option" id="option3">
                            <i class="fas fa-bolt fa-beat"></i> TurboWish HD
                        </a>` : '',
                        userInputD ? `<a href="https://embed-cinemax-app.blogspot.com/p/embed.html?videoUrl=${userInputD}&secure_uri=true" class="modal-option" id="option4">
                            <i class="fas fa-bolt fa-beat"></i> TurboLions HD
                        </a>` : ''
                    ].filter(Boolean).join('');

                    const movieStyles = `
                        /* Main Content Styles */
                        .hidden { display: none; }

                        .post-header {
                            display: flex;
                            align-items: flex-start;
                            padding: 10px;
                        }

                        .poster-container {
                            flex-shrink: 0;
                            margin-right: 15px;
                        }

                        .poster-img {
                            width: 150px;
                            height: auto;
                            border-radius: 5px;
                        }

                        .post-details {
                            flex: 1;
                        }

                        .post-details h1 {
                            font-size: 1.2em;
                            margin-top: 0;
                            font-weight: bold;
                        }

                        .post-details ul {
                            list-style: none;
                            padding: 0;
                            margin: 0;
                        }

                        .post-details ul li {
                            margin-bottom: 5px;
                            display: flex;
                            align-items: center;
                            gap: 5px;
                            font-weight: bold;
                        }

                        .sinopsis-container {
                            margin-top: 15px;
                            padding: 15px;
                            background-color: #1a1a1a;
                            border-radius: 10px;
                        }

                        .sinopsis-title {
                            font-size: 1.2em;
                            font-weight: bold;
                            color: white;
                            margin-bottom: 10px;
                        }

                        .resume {
                            padding: 10px;
                            border-radius: 10px;
                            font-weight: bold;
                            background-color: black;
                            color: white;
                            position: relative;
                            overflow: hidden;
                        }

                        .resume.collapsed {
                            max-height: 60px;
                        }

                        .resume.expanded {
                            max-height: none;
                        }

                        .toggle-sinopsis {
                            background-color: #2196F3;
                            color: white;
                            border: none;
                            padding: 5px 10px;
                            border-radius: 5px;
                            margin-top: 10px;
                            cursor: pointer;
                            font-weight: bold;
                            display: flex;
                            align-items: center;
                            gap: 5px;
                        }

                        .hacker {
                            margin-top: 5px;
                            padding: 25px;
                            border: none;
                            background-color: #2196F3;
                            color: #fff;
                            border-radius: 5px;
                            cursor: pointer;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            gap: 8px;
                            text-decoration: none;
                            font-size: 1em;
                            text-align: center;
                            font-weight: bold;
                        }

                        /* Cast Styles */
                        .cast-container {
                            margin-top: 20px;
                            padding: 15px;
                            background-color: #1a1a1a;
                            border-radius: 10px;
                        }

                        .cast-title {
                            font-size: 1.2em;
                            font-weight: bold;
                            margin-bottom: 10px;
                            color: white;
                        }

                        .cast-grid {
                            display: grid;
                            grid-template-columns: repeat(3, 1fr);
                            gap: 10px;
                        }

                        .cast-member {
                            text-align: center;
                        }

                        .cast-img {
                            width: 80px;
                            height: 80px;
                            border-radius: 50%;
                            object-fit: cover;
                            border: 2px solid #2196F3;
                        }

                        .cast-name {
                            margin-top: 5px;
                            font-size: 0.8em;
                            font-weight: bold;
                            color: white;
                        }

                        .cast-character {
                            font-size: 0.7em;
                            color: #aaa;
                        }

                        /* Modal Styles */
                        .modal {
                            display: none;
                            position: fixed;
                            top: 0;
                            left: 0;
                            width: 100%;
                            height: 100%;
                            background-color: rgba(0,0,0,0.8);
                            z-index: 1000;
                            justify-content: center;
                            align-items: center;
                        }

                        .modal-content {
                            background-color: #222;
                            padding: 20px;
                            border-radius: 10px;
                            width: 80%;
                            max-width: 400px;
                            position: relative;
                        }

                        .modal-title {
                            color: white;
                            text-align: center;
                            margin-bottom: 20px;
                            font-size: 1.2em;
                        }

                        .modal-option {
                            background-color: #2196F3;
                            color: white;
                            border: none;
                            padding: 15px;
                            margin-bottom: 10px;
                            border-radius: 5px;
                            cursor: pointer;
                            font-weight: bold;
                            width: 100%;
                            text-align: center;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            gap: 10px;
                            text-decoration: none;
                        }

                        .modal-option:last-child {
                            margin-bottom: 0;
                        }

                        .modal-option i {
                            font-size: 1.2em;
                        }

                        .close-icon {
                            position: absolute;
                            top: 10px;
                            right: 10px;
                            color: white;
                            font-size: 1.2em;
                            cursor: pointer;
                        }
                    `;

                    let justHtml = `
                        <!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${datos.title}</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<style>

/* Main Content Styles */
.hidden { display: none; }

.post-header {
  display: flex;
  align-items: flex-start;
  padding: 10px;
}

.poster-container {
  flex-shrink: 0;
  margin-right: 15px;
}

.poster-img {
  width: 170px;
  height: auto;
  border-radius: 5px;
}

.post-details ul li {
  list-style: none;
  padding: 0;
  margin: 0;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: bold;
}

.sinopsis-container {
  margin-top: 15px;
  padding: 15px;
  background-color: #1a1a1a;
  border-radius: 10px;
}

.sinopsis-title {
  font-size: 1.2em;
  font-weight: bold;
  color: white;
  margin-bottom: 10px;
}

.resume {
  padding: 10px;
  border-radius: 10px;
  font-weight: bold;
  background-color: #1a1a1a;
  color: white;
  position: relative;
  overflow: hidden;
}

.resume.collapsed {
  max-height: 60px;
}

.resume.expanded {
  max-height: none;
}

.toggle-sinopsis {
  background-color: #2196F3;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  margin-top: 10px;
  cursor: pointer;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 5px;
}

.hacker {
  margin-top: 5px;
  padding: 25px;
  border: none;
  background-color: #2196F3;
  color: #fff;
  border-radius: 5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-decoration: none;
  font-size: 1em;
  text-align: center;
  font-weight: bold;
}

/* Cast Styles */
.cast-container {
  margin-top: 20px;
  padding: 15px;
  background-color: #1a1a1a;
  border-radius: 10px;
}

.cast-title {
  font-size: 1.2em;
  font-weight: bold;
  margin-bottom: 10px;
  color: white;
}

.cast-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.cast-member {
  text-align: center;
}

.cast-img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #2196F3;
}

.cast-name {
  margin-top: 5px;
  font-size: 0.8em;
  font-weight: bold;
  color: white;
}

.cast-character {
  font-size: 0.7em;
  color: #aaa;
}

/* Modal Styles */
.modal {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.8);
  z-index: 1000;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: #222;
  padding: 20px;
  border-radius: 10px;
  width: 80%;
  max-width: 400px;
  position: relative;
}

.modal-title {
  color: white;
  text-align: center;
  margin-bottom: 20px;
  font-size: 1em;
}

.modal-option {
  background-color: #2196F3;
  color: white;
  border: none;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  width: 100%;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  text-decoration: none;
}

.modal-option:last-child {
  margin-bottom: 0;
}

.modal-option i {
  font-size: 1.2em;
}

.close-icon {
  position: absolute;
  top: 10px;
  right: 10px;
  color: white;
  font-size: 1.2em;
  cursor: pointer;
}

</style>
</head>
<body>
<div id="loader">
  <div class="spinner"></div>
</div>

<div id="content">
  <div class="post-header">
    <div class="poster-container">
      <img src="https://media.themoviedb.org/t/p/w440_and_h660_face/${datos.poster_path}" class="poster-img" alt="${datos.title}" />
    </div>
    <div class="post-details">
    
      <ul><li><i class=""></i></li>
<li><i class="fa-solid fa-calendar-days"></i> ${datos.release_date.slice(0,4)}</li><br>
<li><i class="fa-solid fa-clock"></i> ${convertMinutes(datos.runtime)}</li><br>
<li><i class="fas fa-star-half-alt" style="color: #FFD700;"></i> ${datos.vote_average.toFixed(1)}/10</li><br>
<li><i class="fas fa-globe-americas" style="color: #4CAF50;"></i> Latino</li><br>
<li><i class="fas fa-bolt fa-beat" style="color: #FFFF00;"></i> TurboPlayer</li>
</ul>
</div>
</div>

<a href="#" id="play-button" class="hacker">
<i class="fa-solid fa-play fa-beat"></i><b>Reproducir</b>
</a>
<a href="#" id="transmit-button" class="hacker">
<i class="fa-brands fa-chromecast fa-beat"></i><b>Transmitir</b>
</a>

<div class="sinopsis-container">
<div class="sinopsis-title">Sinopsis</div>
<div class="resume collapsed">
     ${synopsis}
</div>
<button class="toggle-sinopsis">
<i class="fas fa-chevron-down"></i> Ver más
</button>
</div>

<div class="cast-container">
            <div class="cast-title">Reparto Principal</div>
            <div class="cast-grid">
                ${castHTML}
            </div>
        </div>

        <!-- Modal para opciones de reproducción y transmisión -->
        <div id="playback-modal" class="modal">
            <div class="modal-content">
                <i class="fas fa-times close-icon" id="close-modal"></i>
                <div class="modal-title" id="modal-title">Seleccionar opción de reproducción</div>
                ${modalOptions}
            </div>
        </div>
    </div>

<script>
document.addEventListener('DOMContentLoaded', function() {
const loader = document.getElementById('loader');
const content = document.getElementById('content');

setTimeout(() => {
loader.style.display = 'none';
content.style.display = 'block';
}, 0);

const toggleBtn = document.querySelector('.toggle-sinopsis');
const sinopsis = document.querySelector('.resume');
const playButton = document.getElementById('play-button');
const transmitButton = document.getElementById('transmit-button');
const modal = document.getElementById('playback-modal');
const closeModal = document.getElementById('close-modal');

toggleBtn.addEventListener('click', function() {
if (sinopsis.classList.contains('collapsed')) {
sinopsis.classList.remove('collapsed');
sinopsis.classList.add('expanded');
toggleBtn.innerHTML = '<i class="fas fa-chevron-up"></i> Ver menos';
} else {
sinopsis.classList.remove('expanded');
sinopsis.classList.add('collapsed');
toggleBtn.innerHTML = '<i class="fas fa-chevron-down"></i> Ver más';
}
});

const modalOptions = document.querySelectorAll('.modal-option');
const modalTitle = document.getElementById('modal-title');

playButton.addEventListener('click', function(e) {
e.preventDefault();
modalTitle.textContent = 'Seleccionar opción de reproducción';
modalOptions.forEach(option => {
option.href = option.href.replace('wvc-x-callback://open?url=', '');
});
modal.style.display = 'flex';
});

transmitButton.addEventListener('click', function(e) {
e.preventDefault();
modalTitle.textContent = 'Seleccionar opción de transmisión';
modalOptions.forEach(option => {
if (!option.href.includes('wvc-x-callback')) {
option.href = 'wvc-x-callback://open?url=' + option.href;
}
});
modal.style.display = 'flex';
});

closeModal.addEventListener('click', () => modal.style.display = 'none');
window.onclick = e => { if (e.target === modal) modal.style.display = 'none'; };
});
</script>
</body>
</html>`;

                    document.getElementById('html-final').innerText = justHtml;

                } else if (respuesta.status === 401) {
                    console.log("Wrong key");
                } else if (respuesta.status === 404) {
                    console.log("No existe");
                }
            } catch (error) {
                console.log(error);
            }
        }
    };

    await cargarPeliculas();
}

document.getElementById('copiar').addEventListener('click', function () {
    // Seleccionar el texto dentro del elemento html-final
    const htmlFinalText = document.getElementById('html-final').innerText;

    // Crear un elemento textarea temporal para copiar el texto
    const tempTextArea = document.createElement('textarea');
    tempTextArea.value = htmlFinalText;

    // Agregar el elemento textarea al cuerpo del documento
    document.body.appendChild(tempTextArea);

    // Seleccionar y copiar el texto dentro del textarea temporal
    tempTextArea.select();
    document.execCommand('copy');

    // Remover el textarea temporal
    document.body.removeChild(tempTextArea);

    // Notificar al usuario que el texto ha sido copiado
    alert('El HTML ha sido copiado al portapapeles.');
});

//aqui

// Función para iniciar sesión y obtener el token de acceso
function iniciarSesion() {
    window.location.href = 'https://accounts.google.com/o/oauth2/auth?' +
        'client_id=392804236703-llkr2saq5eao69qj10kd3or2dav3eg70.apps.googleusercontent.com' +
        '&redirect_uri=https://firego.a0001.net' +
        '&response_type=token' +
        '&scope=https://www.googleapis.com/auth/blogger' +
        '&approval_prompt=force';
}

// Función para obtener el token de acceso de la URL
function obtenerTokenDeURL() {
    var tokenRegex = /access_token=([^&]+)/;
    var match = window.location.hash.match(tokenRegex);
    if (match && match[1]) {
        var token = match[1];
        var tiempoExpiracion = Date.now() + 3500000; // Calcular el tiempo de expiración del token (3500 segundos en milisegundos)
        // Guardar el token de acceso y el tiempo de expiración en el almacenamiento local
        localStorage.setItem('accessToken', token);
        localStorage.setItem('tiempoExpiracion', tiempoExpiracion);
        // Insertar el token de acceso en el input
        document.getElementById('accessTokenInput').value = token;
        // Iniciar el contador de tiempo restante solo si no se ha iniciado previamente
        if (!localStorage.getItem('contadorIniciado')) {
            iniciarContador();
            localStorage.setItem('contadorIniciado', 'true');
        }
    }
}

// Función para iniciar el contador de tiempo restante
function iniciarContador() {
    // Obtener el tiempo de expiración del token del almacenamiento local
    var tiempoExpiracion = localStorage.getItem('tiempoExpiracion');
    // Calcular el tiempo restante en milisegundos
    var tiempoRestante = tiempoExpiracion - Date.now();

    // Actualizar el contador en el DOM
    mostrarTiempoRestante(tiempoRestante);

    // Actualizar el contador cada segundo
    var contadorInterval = setInterval(function () {
        // Calcular el nuevo tiempo restante
        tiempoRestante = tiempoExpiracion - Date.now();
        // Verificar si el tiempo restante ha alcanzado cero
        if (tiempoRestante <= 0) {
            // Limpiar el intervalo y eliminar el token de acceso y el tiempo de expiración del almacenamiento local
            clearInterval(contadorInterval);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('tiempoExpiracion');
            localStorage.removeItem('contadorIniciado');
            // Actualizar el contador en el DOM
            mostrarTiempoRestante(0);
        } else {
            // Actualizar el contador en el DOM
            mostrarTiempoRestante(tiempoRestante);
        }
    }, 1000);
}

function mostrarTiempoRestante(tiempoRestante) {
    var segundosRestantes = Math.ceil(tiempoRestante / 1000);
    var contadorElemento = document.getElementById('contador');
    contadorElemento.textContent = 'Tiempo restante: ' + segundosRestantes + ' segundos';
    console.log('Mostrando tiempo restante:', segundosRestantes);
}

// Llamar a la función para obtener el token de acceso de la URL cuando se cargue la página
obtenerTokenDeURL();

// Función para enviar el HTML a Blogger
function enviarHTML() {
    const tituloEntrada = document.getElementById('titulo-entrada').value;
    var token = localStorage.getItem('accessToken');
    if (token) {
        var html = document.getElementById('html-final').innerText;

        // Obtener los géneros del array global y formatearlos como etiquetas
        const etiquetas = generosGlobal.join(', ');

        // Lógica para enviar el HTML a Blogger utilizando el token de acceso
        fetch('https://www.googleapis.com/blogger/v3/blogs/7419122148924124873/posts/', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'kind': 'blogger#post',
                'blog': {
                    'id': '7419122148924124873'
                },
                'title': tituloEntrada,
                'content': html
            })
        })
            .then(response => {
                if (response.ok) {
                    alert('HTML enviado a Blogger exitosamente.');
                    // Limpiar el array de géneros después de enviar el HTML
                    generosGlobal = [];
                } else {
                    alert('Error al enviar HTML a Blogger: ' + response.statusText);
                }
            })
            .catch(error => alert('Error de red: ' + error));
    } else {
        alert('No se ha encontrado un token de acceso.');
    }
}
