// ============================================
// VARIABLES GLOBALES Y ESTADO
// ============================================

let allEvents = [];
let filteredEvents = [];
let currentSearchTerm = '';
let currentSportFilter = 'all';
let currentModalEvent = null;
let currentImageIndex = 0;

// Modal y navegación
let touchStartX = 0;
let touchEndX = 0;

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
        
        // Ordenar por fecha (más recientes primero)
        allEvents = data.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Inicializar eventos filtrados
        filteredEvents = [...allEvents];
        
        // Renderizar
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
            loadingScreen.style.transition = 'opacity 0.5s ease';
        }, 300);
    }
}

function showErrorMessage() {
    const eventsGrid = document.getElementById('events-grid');
    if (eventsGrid) {
        eventsGrid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <i class="fas fa-exclamation-circle"></i>
                <h3>Error al cargar los eventos</h3>
                <p>Por favor, intenta recargar la página</p>
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
    resultsCounter.textContent = `${filteredEvents.length} evento${filteredEvents.length !== 1 ? 's' : ''} encontrado${filteredEvents.length !== 1 ? 's' : ''}`;

    grid.innerHTML = filteredEvents.map((event, index) => `
        <article class="event-card" data-event-id="${event.id}" style="animation-delay: ${index * 0.1}s">
            <div class="event-thumbnail">
                <img 
                    src="${event.thumbnail}" 
                    alt="${event.title}"
                    loading="lazy"
                >
                <div class="event-overlay">
                    <span class="event-category">${getCategoryLabel(event.sport_category)}</span>
                    <div class="event-date">
                        <i class="fas fa-calendar"></i>
                        ${formatDate(event.date)}
                    </div>
                    <h3 class="event-card-title">${event.title}</h3>
                </div>
            </div>
            <div class="event-card-content">
                <div class="event-card-location">
                    <i class="fas fa-map-marker-alt"></i>
                    ${event.location}
                </div>
                <p class="event-card-summary">${event.summary}</p>
                <div class="event-card-footer">
                    <div class="event-card-athlete">
                        <i class="fas fa-user"></i>
                        ${event.athlete_team}
                    </div>
                    <div class="event-gallery-count">
                        <i class="fas fa-images"></i>
                        ${event.gallery_images.length}
                    </div>
                </div>
            </div>
        </article>
    `).join('');

    // Agregar event listeners a las tarjetas
    document.querySelectorAll('.event-card').forEach(card => {
        card.addEventListener('click', () => {
            const eventId = parseInt(card.dataset.eventId);
            openEventModal(eventId);
        });
    });
}

// ============================================
// BÚSQUEDA Y FILTROS
// ============================================

function initializeSearch() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        // Debounce para evitar búsquedas excesivas
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                currentSearchTerm = e.target.value.toLowerCase();
                applyFiltersAndSearch();
            }, 300);
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
        // Filtro de categoría
        const categoryMatch = currentSportFilter === 'all' || event.sport_category === currentSportFilter;

        // Búsqueda de texto
        let searchMatch = true;
        if (currentSearchTerm) {
            const searchFields = [
                event.title.toLowerCase(),
                event.description.toLowerCase(),
                event.athlete_team.toLowerCase(),
                event.location.toLowerCase(),
                event.keywords.join(' ').toLowerCase()
            ].join(' ');

            searchMatch = searchFields.includes(currentSearchTerm);
        }

        return categoryMatch && searchMatch;
    });

    // Ordenar por fecha (más recientes primero)
    filteredEvents.sort((a, b) => new Date(b.date) - new Date(a.date));

    renderEventsGrid();
}

// ============================================
// MODAL DE EVENTO
// ============================================

function initializeModal() {
    const modal = document.getElementById('event-modal');
    const closeBtn = document.getElementById('modal-close');
    const prevBtn = document.getElementById('modal-prev');
    const nextBtn = document.getElementById('modal-next');

    if (closeBtn) {
        closeBtn.addEventListener('click', closeEventModal);
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => navigateGallery(-1));
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => navigateGallery(1));
    }

    // Cerrar modal al hacer click en el background
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.classList.contains('modal-background')) {
                closeEventModal();
            }
        });
    }

    // Soporte para teclado
    document.addEventListener('keydown', (e) => {
        if (!modal || !modal.classList.contains('active')) return;

        if (e.key === 'Escape') closeEventModal();
        if (e.key === 'ArrowLeft') navigateGallery(-1);
        if (e.key === 'ArrowRight') navigateGallery(1);
    });

    // Soporte para swipe
    const modalImageContainer = document.querySelector('.modal-image-container');
    if (modalImageContainer) {
        modalImageContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].clientX;
        }, false);

        modalImageContainer.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].clientX;
            handleSwipe();
        }, false);
    }
}

function openEventModal(eventId) {
    const event = allEvents.find(e => e.id === eventId);
    if (!event) return;

    currentModalEvent = event;
    currentImageIndex = 0;

    const modal = document.getElementById('event-modal');
    document.getElementById('event-title').textContent = event.title;
    document.getElementById('event-date').textContent = formatDate(event.date);
    document.getElementById('event-location').textContent = event.location;
    document.getElementById('event-athlete').textContent = event.athlete_team;
    document.getElementById('event-description').textContent = event.description;

    displayModalImage();

    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeEventModal() {
    const modal = document.getElementById('event-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
    currentModalEvent = null;
}

function displayModalImage() {
    if (!currentModalEvent) return;

    const image = currentModalEvent.gallery_images[currentImageIndex];
    const modalImage = document.getElementById('modal-image');
    const imageCounter = document.getElementById('image-counter');

    if (modalImage) {
        modalImage.src = image.fullImage;
        modalImage.alt = image.caption;
    }

    if (imageCounter) {
        imageCounter.textContent = `${currentImageIndex + 1} / ${currentModalEvent.gallery_images.length}`;
    }
}

function navigateGallery(direction) {
    if (!currentModalEvent) return;

    const totalImages = currentModalEvent.gallery_images.length;
    currentImageIndex = (currentImageIndex + direction + totalImages) % totalImages;

    displayModalImage();
}

function handleSwipe() {
    const swipeThreshold = 50;
    const difference = touchStartX - touchEndX;

    if (Math.abs(difference) > swipeThreshold) {
        if (difference > 0) {
            navigateGallery(1); // Swipe left -> siguiente imagen
        } else {
            navigateGallery(-1); // Swipe right -> imagen anterior
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
            const sectionHeight = section.clientHeight;
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
    });
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-AR', options);
}

function getCategoryLabel(category) {
    const labels = {
        'futbol': '⚽ Fútbol',
        'atletismo': '🏃 Atletismo',
        'natacion': '🏊 Natación',
        'ciclismo': '🚴 Ciclismo',
        'tenis': '🎾 Tenis',
        'hockey': '🏒 Hockey',
        'otro': '📷 Otro'
    };
    return labels[category] || category;
}

// ============================================
// PRELOAD DE IMÁGENES
// ============================================

function preloadImage(url) {
    const img = new Image();
    img.src = url;
}

// Precargar imágenes del primer evento
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (allEvents.length > 0) {
            allEvents[0].gallery_images.forEach(img => {
                preloadImage(img.fullImage);
            });
        }
    }, 1000);
});
