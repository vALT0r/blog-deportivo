// ============================================
// VARIABLES GLOBALES Y ESTADO
// ============================================

let allEvents = [];
let filteredEvents = [];
let currentSearchTerm = '';
let currentSportFilter = 'all';
let currentModalEvent = null;
let currentImageIndex = 0;

let touchStartX = 0;
let touchEndX = 0;

const DEFAULT_SPORT_THUMB = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%23151922'/%3E%3Cpath d='M280 180h40l20-30h80l20 30h40c11 0 20 9 20 20v140c0 11-9 20-20 20H280c-11 0-20-9-20-20V200c0-11 9-20 20-20zm80 150c33 0 60-27 60-60s-27-60-60-60-60 27-60 60 27 60 60 60z' fill='%2347C7FC' opacity='0.7'/%3E%3C/svg%3E";

// ============================================
// INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    loadEvents();
    initializeNavigation();
    initializeSearch();
    initializeFilters();
    initializeModal();
    setupScrollListeners();
});

// ============================================
// CARGAR EVENTOS DESDE JSON
// ============================================

async function loadEvents() {
    try {
        const response = await fetch('js/events-data.json');
        const data = await response.json();
        
        allEvents = data.sort((a, b) => new Date(b.date) - new Date(a.date));
        filteredEvents = [...allEvents];
        
        renderEventsGrid();
        hideLoadingScreen();
    } catch (error) {
        console.error('Error al cargar eventos:', error);
        hideLoadingScreen();
        showErrorMessage();
    }
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            loadingScreen.style.pointerEvents = 'none';
            loadingScreen.style.transition = 'opacity 0.4s ease';
        }, 200);
    }
}

function showErrorMessage() {
    const eventsGrid = document.getElementById('events-grid');
    if (eventsGrid) {
        eventsGrid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <i class="fas fa-exclamation-circle"></i>
                <h3>No se pudieron cargar los eventos</h3>
                <p>Verifica tu conexión o intenta más tarde.</p>
            </div>
        `;
    }
}

// ============================================
// RENDERIZAR GRID DE EVENTOS
// ============================================

function renderEventsGrid() {
    const grid = document.getElementById('events-grid');
    const emptyState = document.getElementById('empty-state');
    const resultsCounter = document.getElementById('results-counter');

    if (filteredEvents.length === 0) {
        grid.innerHTML = '';
        emptyState.style.display = 'block';
        resultsCounter.textContent = 'No hay eventos que coincidan con tu búsqueda';
        return;
    }

    emptyState.style.display = 'none';
    resultsCounter.textContent = `${filteredEvents.length} evento${filteredEvents.length !== 1 ? 's' : ''} disponible${filteredEvents.length !== 1 ? 's' : ''}`;

    grid.innerHTML = filteredEvents.map((event, index) => {
        const thumbUrl = event.thumbnail || (event.gallery_images?.[0]?.image) || DEFAULT_SPORT_THUMB;
        const photoCount = event.gallery_images?.length || 0;
        const categoryLabel = getCategoryLabel(event.sport_category || event.category);
        const eventTitle = escapeHtml(event.title || 'Sin título');
        const eventDate = formatDate(event.date);
        const eventLoc = escapeHtml(event.location || '');
        const eventAthlete = escapeHtml(event.athlete_team || event.athlete || '');
        const eventDesc = escapeHtml(event.summary || event.description || '');

        return `
            <article class="event-card" onclick="openEventModal('${event.id}')" style="animation-delay: ${index * 0.04}s">
                <img 
                    src="${thumbUrl}" 
                    alt="${eventTitle}"
                    class="event-bg-image"
                    loading="lazy"
                    onerror="this.onerror=null; this.src='${DEFAULT_SPORT_THUMB}'"
                >
                <div class="event-gradient-overlay"></div>
                
                <div class="event-card-top">
                    <span class="event-category-pill">${categoryLabel}</span>
                    <span class="event-photos-pill"><i class="fas fa-camera"></i> ${photoCount} fotos</span>
                </div>
                
                <div class="event-card-bottom">
                    <h3 class="event-card-title">${eventTitle}</h3>
                    
                    <div class="event-card-meta-row">
                        ${eventDate ? `<span class="event-card-meta-item"><i class="fas fa-calendar-alt"></i> ${eventDate}</span>` : ''}
                        ${eventLoc ? `<span class="event-card-meta-item"><i class="fas fa-map-marker-alt"></i> ${eventLoc}</span>` : ''}
                        ${eventAthlete ? `<span class="event-card-meta-item"><i class="fas fa-user"></i> ${eventAthlete}</span>` : ''}
                    </div>
                    
                    ${eventDesc ? `<p class="event-card-desc">${eventDesc}</p>` : ''}
                </div>
            </article>
        `;
    }).join('');
}

// ============================================
// BUSCADOR Y FILTROS
// ============================================

function initializeSearch() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                currentSearchTerm = e.target.value.toLowerCase().trim();
                applyFiltersAndSearch();
            }, 250);
        });
    }
}

function initializeFilters() {
    const filterSelect = document.getElementById('category-filter');
    if (filterSelect) {
        filterSelect.addEventListener('change', (e) => {
            currentSportFilter = e.target.value;
            applyFiltersAndSearch();
        });
    }
}

function applyFiltersAndSearch() {
    filteredEvents = allEvents.filter(event => {
        const evCat = (event.category || event.sport_category || '').toLowerCase();
        const categoryMatch = currentSportFilter === 'all' || 
            evCat === currentSportFilter.toLowerCase() ||
            (currentSportFilter === 'automovilismo' && (evCat === 'motorsport' || evCat === 'automovilismo'));

        let searchMatch = true;
        if (currentSearchTerm) {
            const searchFields = [
                event.title || '',
                event.description || '',
                event.athlete_team || '',
                event.location || '',
                (event.keywords || []).join(' ')
            ].join(' ').toLowerCase();

            searchMatch = searchFields.includes(currentSearchTerm);
        }

        return categoryMatch && searchMatch;
    });

    filteredEvents.sort((a, b) => new Date(b.date) - new Date(a.date));
    renderEventsGrid();
}

// ============================================
// CINEMA LIGHTBOX / MODAL TEATRO
// ============================================

function initializeModal() {
    const modal = document.getElementById('event-modal');
    const closeBtn = document.getElementById('modal-close');
    const prevBtn = document.getElementById('modal-prev');
    const nextBtn = document.getElementById('modal-next');
    const fullscreenBtn = document.getElementById('btn-toggle-fullscreen');

    if (closeBtn) closeBtn.addEventListener('click', closeEventModal);
    if (prevBtn) prevBtn.addEventListener('click', () => navigateGallery(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => navigateGallery(1));
    
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', toggleCinemaFullscreen);
    }

    document.addEventListener('keydown', (e) => {
        if (!modal || !modal.classList.contains('active')) return;
        if (e.key === 'Escape') closeEventModal();
        if (e.key === 'ArrowLeft') navigateGallery(-1);
        if (e.key === 'ArrowRight') navigateGallery(1);
        if (e.key === 'f' || e.key === 'F') toggleCinemaFullscreen();
    });

    const stage = document.querySelector('.lightbox-stage');
    if (stage) {
        stage.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].clientX;
        }, { passive: true });

        stage.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].clientX;
            handleSwipe();
        }, { passive: true });
    }
}

function toggleCinemaFullscreen() {
    const modal = document.getElementById('event-modal');
    if (!document.fullscreenElement) {
        modal.requestFullscreen?.().catch(err => console.log(err));
    } else {
        document.exitFullscreen?.().catch(err => console.log(err));
    }
}

window.openEventModal = function(eventId) {
    const event = allEvents.find(e => String(e.id) === String(eventId));
    if (!event) return;

    currentModalEvent = event;
    currentImageIndex = 0;

    const modal = document.getElementById('event-modal');
    document.getElementById('event-title').textContent = event.title;
    document.getElementById('event-category-badge').textContent = getCategoryLabel(event.sport_category);
    document.getElementById('event-date').textContent = formatDate(event.date);
    document.getElementById('event-location').textContent = event.location || 'Acebal / Rosario';

    const athleteWrap = document.getElementById('event-athlete-wrap');
    if (event.athlete_team) {
        document.getElementById('event-athlete').textContent = event.athlete_team;
        athleteWrap.style.display = 'inline-flex';
    } else {
        athleteWrap.style.display = 'none';
    }

    renderFilmstrip();
    displayModalImage();

    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
};

window.closeEventModal = function() {
    const modal = document.getElementById('event-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        if (document.fullscreenElement) {
            document.exitFullscreen?.().catch(err => console.log(err));
        }
    }
    currentModalEvent = null;
};

function renderFilmstrip() {
    const strip = document.getElementById('lightbox-filmstrip');
    if (!strip || !currentModalEvent) return;

    const photos = currentModalEvent.gallery_images || [];
    strip.innerHTML = photos.map((p, idx) => `
        <div class="filmstrip-item ${idx === currentImageIndex ? 'active' : ''}" onclick="jumpToImage(${idx})" id="filmstrip-item-${idx}" title="Foto ${idx + 1}">
            <img src="${p.image || p.fullImage}" alt="Thumb ${idx + 1}" onerror="this.src='${DEFAULT_SPORT_THUMB}'">
        </div>
    `).join('');
}

window.jumpToImage = function(idx) {
    if (!currentModalEvent || !currentModalEvent.gallery_images[idx]) return;
    currentImageIndex = idx;
    displayModalImage();
};

function displayModalImage() {
    if (!currentModalEvent || !currentModalEvent.gallery_images || currentModalEvent.gallery_images.length === 0) return;

    const image = currentModalEvent.gallery_images[currentImageIndex];
    const modalImage = document.getElementById('modal-image');
    const imageCounter = document.getElementById('image-counter');

    if (modalImage) {
        modalImage.style.opacity = '0.3';
        modalImage.src = image.fullImage || image.image || DEFAULT_SPORT_THUMB;
        modalImage.onload = () => { modalImage.style.opacity = '1'; };
        modalImage.alt = image.caption || currentModalEvent.title;
    }

    if (imageCounter) {
        imageCounter.textContent = `${currentImageIndex + 1} / ${currentModalEvent.gallery_images.length}`;
    }

    document.querySelectorAll('.filmstrip-item').forEach((item, idx) => {
        item.classList.toggle('active', idx === currentImageIndex);
    });

    const activeThumb = document.getElementById(`filmstrip-item-${currentImageIndex}`);
    activeThumb?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
}

function navigateGallery(direction) {
    if (!currentModalEvent || !currentModalEvent.gallery_images) return;
    const totalImages = currentModalEvent.gallery_images.length;
    currentImageIndex = (currentImageIndex + direction + totalImages) % totalImages;
    displayModalImage();
}

function handleSwipe() {
    const swipeThreshold = 50;
    const difference = touchStartX - touchEndX;

    if (Math.abs(difference) > swipeThreshold) {
        if (difference > 0) {
            navigateGallery(1);
        } else {
            navigateGallery(-1);
        }
    }
}

// ============================================
// NAVEGACIÓN Y SCROLL
// ============================================

function initializeNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger?.classList.remove('active');
            navMenu?.classList.remove('active');
        });
    });
}

function setupScrollListeners() {
    const navLinks = document.querySelectorAll('.nav-link');
    window.addEventListener('scroll', () => {
        let current = '';
        document.querySelectorAll('section').forEach(section => {
            const sectionTop = section.offsetTop;
            if (scrollY >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }, { passive: true });
}

// ============================================
// AUXILIARES
// ============================================

function formatDate(dateString) {
    if (!dateString) return '';
    const parts = dateString.split('-');
    if (parts.length === 3) {
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        return d.toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' });
    }
    return dateString;
}

function getCategoryLabel(category) {
    if (!category) return '📸 Varios';
    const cat = String(category).toLowerCase().trim();
    const labels = {
        'automovilismo': '🏎️ Automovilismo',
        'motorsport': '🏎️ Automovilismo',
        'futbol': '⚽ Fútbol',
        'atletismo': '🏃 Atletismo',
        'natacion': '🏊 Natación',
        'ciclismo': '🚴 Ciclismo',
        'tenis': '🎾 Tenis',
        'hockey': '🏑 Hockey',
        'maraton': '🏅 Maratón / Running',
        'social': '🎉 Social / Eventos',
        'naturaleza': '🌿 Naturaleza',
        'urbano': '🏙️ Urbano & Street',
        'viajes': '🚗 Viajes & Escapadas',
        'varios': '📸 Varios',
        'otro': '🏷️ Varios / Otro'
    };
    return labels[cat] || category || '📸 Varios';
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
