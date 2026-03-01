/**
 * CHRONOS MAPS - SUPERSCRIPT V3.0 (FULL ENGINE)
 * Motor de Renderização de Alta Performance com Interpolação de Movimento
 */

const CONFIG = {
    mapStyle: 'https://demotiles.maplibre.org/style.json',
    center: [0, 20],
    zoom: 2.5,
    pitch: 50,
    speed: 300, 
    iconPath: 'assets/'
};

let db = [];
let activeMarkers = new Map(); // Uso de Map para rastrear ícones por ID
let isPlaying = false;
let playbackTimer = null;

const map = new maplibregl.Map({
    container: 'map',
    style: CONFIG.mapStyle,
    center: CONFIG.center,
    zoom: CONFIG.zoom,
    pitch: CONFIG.pitch,
    antialias: true
});

const UI = {
    slider: document.getElementById('timeline-slider'),
    yearDisplay: document.getElementById('current-year'),
    details: document.getElementById('event-details'),
    playBtn: document.getElementById('play-pause')
};

// MAPEAMENTO DE ÍCONES
function getIconPath(type) {
    const icons = {
        'navio': 'ship.svg',
        'aviao': 'plane.svg',
        'guerra': 'explosion.svg',
        'tanque': 'tank.svg',
        'submarino': 'submarine.svg',
        'fabrica': 'factory.svg',
        'casa': 'house.svg',
        'navio_guerra': 'warship.svg',
        'soldado': 'soldier.svg',
        'artilharia': 'artillery.svg',
        'forte': 'fort.svg'
    };
    return CONFIG.iconPath + (icons[type] || 'default.svg');
}

// FUNÇÃO DE MOVIMENTO SUAVE (INTERPOLAÇÃO)
function animarMovimento(marker, startCoords, endCoords, duration) {
    let startTime = null;

    function frame(time) {
        if (!startTime) startTime = time;
        const progress = Math.min((time - startTime) / duration, 1);
        
        // Cálculo da posição intermediária
        const lng = startCoords[0] + (endCoords[0] - startCoords[0]) * progress;
        const lat = startCoords[1] + (endCoords[1] - startCoords[1]) * progress;
        
        marker.setLngLat([lng, lat]);

        if (progress < 1) {
            requestAnimationFrame(frame);
        }
    }
    requestAnimationFrame(frame);
}

// MOTOR DE RENDERIZAÇÃO
async function bootSystem() {
    try {
        const response = await fetch('data/history.json');
        const data = await response.json();
        db = data.acontecimentos;
        renderTimeline(UI.slider.value);
    } catch (err) {
        console.error("FALHA CRÍTICA:", err);
    }
}

function renderTimeline(targetYear) {
    const targetYearInt = parseInt(targetYear);
    UI.yearDisplay.innerText = `Ano: ${targetYearInt}`;

    // Identificar eventos do ano atual
    const eventsToDisplay = db.filter(item => item.ano === targetYearInt);

    // IDs dos eventos que devem estar no mapa agora
    const currentEventIds = new Set(eventsToDisplay.map(e => e.id || e.titulo));

    // Remover marcadores que não pertencem mais a este ano
    activeMarkers.forEach((marker, id) => {
        if (!currentEventIds.has(id)) {
            marker.remove();
            activeMarkers.delete(id);
        }
    });

    // Adicionar ou Atualizar marcadores
    eventsToDisplay.forEach(event => {
        const eventId = event.id || event.titulo;

        if (activeMarkers.has(eventId)) {
            // Se o evento já existe e tem rota, movemos ele
            if (event.rota) {
                const marker = activeMarkers.get(eventId);
                const currentPos = marker.getLngLat().toArray();
                animarMovimento(marker, currentPos, event.coords, 500);
            }
        } else {
            // Criar novo marcador
            const el = document.createElement('div');
            el.className = 'marcador-animado';
            el.style.width = '50px';
            el.style.height = '50px';
            el.style.backgroundImage = `url(${getIconPath(event.tipo)})`;
            el.style.backgroundSize = 'contain';
            el.style.backgroundRepeat = 'no-repeat';
            el.style.cursor = 'pointer';

            const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`<b>${event.titulo}</b><br>${event.descricao}`);
            
            const marker = new maplibregl.Marker(el)
                .setLngLat(event.coords)
                .setPopup(popup)
                .addTo(map);

            activeMarkers.set(eventId, marker);
            
            // Atualiza painel
            UI.details.innerHTML = `<h2>${event.titulo}</h2><p>${event.descricao}</p>`;
        }
    });
}

// CONTROLES DE PLAYBACK
UI.playBtn.addEventListener('click', () => {
    isPlaying = !isPlaying;
    UI.playBtn.innerHTML = isPlaying ? '⏸' : '▶';
    if (isPlaying) {
        playbackTimer = setInterval(() => {
            let nextYear = parseInt(UI.slider.value) + 1;
            if (nextYear <= UI.slider.max) {
                UI.slider.value = nextYear;
                renderTimeline(nextYear);
            } else {
                clearInterval(playbackTimer);
            }
        }, CONFIG.speed);
    } else {
        clearInterval(playbackTimer);
    }
});

UI.slider.addEventListener('input', (e) => {
    if(isPlaying) {
        clearInterval(playbackTimer);
        isPlaying = false;
        UI.playBtn.innerHTML = '▶';
    }
    renderTimeline(e.target.value);
});

map.on('load', () => {
    map.setFog({'range': [0.5, 10], 'color': '#000000', 'horizon-blend': 0.05});
    bootSystem();
});