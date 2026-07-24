/**
 * Juu Freitas Portfolio - Main Application
 * Specialized for Creative Direction & Design
 * 
 * Optimized for Mobile-First Premium Experience
 */

const CONFIG = {
    photos: [
        'IMG_1321.webp', 'IMG_1322.webp', 'IMG_1323.webp',
        'IMG_1324.webp',
        'IMG_8554.webp', 'IMG_8555.webp', 'IMG_8556.webp',
        'IMG_8557.webp', 'IMG_8558.webp', 'IMG_8559.webp',
        'IMG_8560.webp', 'IMG_8561.webp', 'IMG_8562.webp',
        'IMG_8563.webp', 'IMG_8564.webp', 'IMG_8565.webp',
        'IMG_8566.webp', 'IMG_8567.webp',
    ],
    designs: [
        'IMG_0414.webp', 'IMG_0416.webp', 'IMG_0417.webp',
        'IMG_1225.webp', 'IMG_1228.webp',
        'IMG_7061.webp', 'IMG_7186.webp', 'IMG_8348.webp',
        'IMG_8527.webp', 'IMG_8529.webp', 'IMG_8530.webp',
        'IMG_8533.webp', 'IMG_8535.webp', 'IMG_8536.webp',
        'IMG_8553.webp', 'IMG_9978.webp'
    ]
};

/**
 * GalleryModule: State-driven, Mobile-optimized, Accessible
 */
const GalleryModule = {
    STATES: { IDLE: 'idle', LOADING: 'loading', OPEN: 'open' },

    state: {
        current: 'idle',
        activeSrc: null,
        activeIndex: -1,
        collection: [],
        basePath: '',
    },

    elements: {
        grid: null,
        modal: null,
        modalImg: null,
        closeBtn: null,
        prevBtn: null,
        nextBtn: null,
        counter: null,
        mainContent: null
    },

    init() {
        this.elements.grid = document.getElementById('photo-grid') || document.getElementById('design-grid');
        this.elements.modal = document.getElementById('photo-modal');
        this.elements.mainContent = document.getElementById('content-wrap');

        if (!this.elements.grid || !this.elements.modal) return;

        this.elements.modalImg = this.elements.modal.querySelector('.modal__img');
        this.elements.closeBtn = this.elements.modal.querySelector('.modal__close');
        this.elements.prevBtn = this.elements.modal.querySelector('.modal__nav--prev');
        this.elements.nextBtn = this.elements.modal.querySelector('.modal__nav--next');
        this.elements.counter = this.elements.modal.querySelector('.modal__counter');

        const isDesign = this.elements.grid.id === 'design-grid';
        this.state.collection = isDesign ? CONFIG.designs : CONFIG.photos;
        this.state.basePath = isDesign ? 'assets/images/designs/' : 'assets/images/photos/';

        this.renderGrid();
        this.setupAccessibility();
        this.bindEvents();
    },

    setupAccessibility() {
        this.elements.modal.setAttribute('role', 'dialog');
        this.elements.modal.setAttribute('aria-modal', 'true');
        this.elements.modal.setAttribute('aria-hidden', 'true');
    },

    renderGrid() {
        if (!this.elements.grid || this.elements.grid.children.length > 0) return;

        const fragment = document.createDocumentFragment();
        this.state.collection.forEach((img, index) => {
            const item = document.createElement('div');
            item.className = 'gallery-grid__item';
            item.dataset.src = `${this.state.basePath}${img}`;
            item.dataset.index = index;
            item.setAttribute('role', 'button');
            item.setAttribute('aria-label', `Visualizar trabalho ${index + 1}`);
            item.style.setProperty('--index', index);

            item.innerHTML = `
                <div class="gallery-grid__ripple"></div>
                <img src="${this.state.basePath}${img}" alt="Portfolio Julia Freitas" loading="lazy" decoding="async">
            `;
            fragment.appendChild(item);
        });
        this.elements.grid.appendChild(fragment);
    },

    bindEvents() {
        this.elements.grid.onclick = (e) => {
            const item = e.target.closest('.gallery-grid__item');
            if (item) {
                const idx = parseInt(item.dataset.index);
                this.handleOpen(idx);
            }
        };

        this.elements.modal.onclick = (e) => {
            if (e.target === this.elements.modal || e.target.classList.contains('modal__content')) {
                this.handleClose();
            }
        };

        if (this.elements.closeBtn) {
            this.elements.closeBtn.onclick = (e) => {
                e.stopPropagation();
                this.handleClose();
            };
        }

        if (this.elements.prevBtn) {
            this.elements.prevBtn.onclick = (e) => {
                e.stopPropagation();
                this.navigate(-1);
            };
        }

        if (this.elements.nextBtn) {
            this.elements.nextBtn.onclick = (e) => {
                e.stopPropagation();
                this.navigate(1);
            };
        }

        // Touch swipe
        this.swipeStartX = 0;
        this.swipeStartY = 0;
        this.elements.modal.addEventListener('touchstart', (e) => {
            if (this.state.current !== this.STATES.OPEN) return;
            const t = e.touches[0];
            this.swipeStartX = t.clientX;
            this.swipeStartY = t.clientY;
        }, { passive: true });

        this.elements.modal.addEventListener('touchmove', (e) => {
            if (this.state.current !== this.STATES.OPEN || this.swipeStartX === 0) return;
            const t = e.touches[0];
            const dx = t.clientX - this.swipeStartX;
            const dy = t.clientY - this.swipeStartY;
            if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
                e.preventDefault();
                this.navigate(dx > 0 ? -1 : 1);
                this.swipeStartX = 0;
            }
        }, { passive: false });

        document.removeEventListener('keydown', this.globalKeyHandler);
        this.globalKeyHandler = this.globalKeyHandler.bind(this);
        document.addEventListener('keydown', this.globalKeyHandler);
    },

    globalKeyHandler(e) {
        if (this.state.current === this.STATES.IDLE) return;

        if (e.key === 'Escape') {
            this.handleClose();
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            this.navigate(-1);
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            this.navigate(1);
        }
    },

    navigate(dir) {
        if (this.state.current !== this.STATES.OPEN) return;

        const newIndex = this.state.activeIndex + dir;
        if (newIndex < 0 || newIndex >= this.state.collection.length) return;

        const src = `${this.state.basePath}${this.state.collection[newIndex]}`;
        this.handleNavigate(src, newIndex);
    },

    async handleNavigate(src, index) {
        this.state.current = this.STATES.LOADING;
        this.state.activeSrc = src;
        this.state.activeIndex = index;

        this.elements.modal.classList.add('is-loading');
        this.elements.modalImg.style.opacity = '0';

        try {
            await this.preloadImage(src);
            if (this.state.activeSrc !== src) return;

            this.elements.modalImg.src = src;
            this.elements.modalImg.style.opacity = '';
            this.elements.modal.classList.remove('is-loading');
            this.state.current = this.STATES.OPEN;
            this.updateCounter();
            this.preloadAdjacent(index);
        } catch (error) {
            console.error('Navigation preload failed:', error);
            this.state.current = this.STATES.OPEN;
        }
    },

    updateCounter() {
        if (this.elements.counter) {
            this.elements.counter.textContent = `${this.state.activeIndex + 1} / ${this.state.collection.length}`;
        }
    },

    async handleOpen(index) {
        if (this.state.current !== this.STATES.IDLE) return;

        const src = `${this.state.basePath}${this.state.collection[index]}`;
        const clickedItem = this.elements.grid.querySelector(`[data-index="${index}"]`);
        const clickedImg = clickedItem ? clickedItem.querySelector('img') : null;

        this.state.current = this.STATES.LOADING;
        this.state.activeSrc = src;
        this.state.activeIndex = index;

        this.elements.modal.classList.add('active', 'is-loading');
        this.elements.modal.setAttribute('aria-hidden', 'false');
        if (this.elements.mainContent) this.elements.mainContent.setAttribute('aria-hidden', 'true');
        document.body.classList.add('modal-open');

        try {
            await this.preloadImage(src);
            if (this.state.activeSrc !== src || this.state.current === this.STATES.IDLE) return;

            if (document.startViewTransition && clickedImg) {
                clickedImg.style.viewTransitionName = 'active-image';

                const transition = document.startViewTransition(() => {
                    this.elements.modalImg.style.viewTransitionName = 'active-image';
                    this.elements.modalImg.src = src;
                    this.elements.modal.classList.remove('is-loading');
                    this.elements.modal.classList.add('is-loaded');
                    this.state.current = this.STATES.OPEN;
                });

                await transition.finished;
                clickedImg.style.viewTransitionName = '';
            } else {
                this.elements.modalImg.src = src;
                this.elements.modal.classList.remove('is-loading');
                this.elements.modal.classList.add('is-loaded');
                this.state.current = this.STATES.OPEN;
            }

            this.updateCounter();
            this.preloadAdjacent(index);
            this.elements.closeBtn.focus();
        } catch (error) {
            console.error('Gallery preloader failed:', error);
            this.handleClose();
        }
    },

    preloadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = resolve;
            img.onerror = resolve;
            img.src = src;
        });
    },

    preloadAdjacent(fromIndex) {
        const indices = [fromIndex - 1, fromIndex + 1];
        indices.forEach(i => {
            if (i >= 0 && i < this.state.collection.length) {
                const img = new Image();
                img.src = `${this.state.basePath}${this.state.collection[i]}`;
            }
        });
    },

    async handleClose() {
        if (this.state.current === this.STATES.IDLE) return;

        const finishClose = () => {
            this.state.current = this.STATES.IDLE;
            this.state.activeSrc = null;
            this.state.activeIndex = -1;
            this.elements.modal.classList.remove('active', 'is-loaded', 'is-loading');
            this.elements.modal.setAttribute('aria-hidden', 'true');
            if (this.elements.mainContent) this.elements.mainContent.setAttribute('aria-hidden', 'false');
            document.body.classList.remove('modal-open');
            setTimeout(() => {
                if (this.state.current === this.STATES.IDLE) this.elements.modalImg.src = '';
            }, 600);
        };

        if (document.startViewTransition && this.state.activeSrc) {
            const originalItem = this.elements.grid.querySelector(`[data-index="${this.state.activeIndex}"]`);
            const originalImg = originalItem ? originalItem.querySelector('img') : null;

            if (originalImg) {
                this.elements.modalImg.style.viewTransitionName = 'active-image';

                const transition = document.startViewTransition(() => {
                    originalImg.style.viewTransitionName = 'active-image';
                    finishClose();
                });

                await transition.finished;
                originalImg.style.viewTransitionName = '';
                this.elements.modalImg.style.viewTransitionName = '';
            } else {
                finishClose();
            }
        } else {
            finishClose();
        }
    }
};

/**
 * Global App Orchestration
 */
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initScrollEffects();
    initMobileMenu();
    GalleryModule.init();
    initCursor();
    initContentObserver();
    
    setTimeout(() => document.body.classList.add('js-loaded'), 100);
});

function initScrollEffects() {
    const header = document.querySelector('.header');
    if (!header) return;

    const isGalleryPage = window.location.pathname.endsWith('photos.html') || window.location.pathname.endsWith('designs.html');
    if (isGalleryPage) header.classList.add('scrolled');

    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });
}

function initMobileMenu() {
    const toggle = document.querySelector('.nav-toggle');
    const overlay = document.querySelector('.mobile-overlay');
    const links = document.querySelectorAll('.mobile-nav a');

    if (!toggle || !overlay) return;

    const toggleAction = () => {
        const isOpen = toggle.classList.toggle('active');
        overlay.classList.toggle('active');
        document.body.style.overflow = isOpen ? 'hidden' : '';
    };

    toggle.onclick = toggleAction;
    links.forEach(l => l.onclick = () => {
        if (overlay.classList.contains('active')) toggleAction();
    });
}

function initContentObserver() {
    const contentWrap = document.getElementById('content-wrap');
    if (!contentWrap) return;

    const observer = new MutationObserver((mutations) => {
        for (const m of mutations) {
            if (m.type === 'childList') {
                GalleryModule.init();
                break;
            }
        }
    });
    observer.observe(contentWrap, { childList: true });
}

function initCursor() {
    const cursor = document.querySelector('.cursor');
    if (!cursor) return;

    if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;

    let posX = 0, posY = 0;
    let mouseX = 0, mouseY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        document.body.classList.add('cursor-visible');
    });

    document.addEventListener('mouseleave', () => {
        document.body.classList.remove('cursor-visible');
    });

    document.addEventListener('mouseenter', () => {
        document.body.classList.add('cursor-visible');
    });

    // Hover state for interactive elements
    document.addEventListener('mouseover', (e) => {
        const target = e.target.closest('a, button, .gallery-grid__item, .projects-split__block, .services__item, .hero__cta');
        document.body.classList.toggle('cursor-pointer', !!target);
    });

    function animate() {
        posX = mouseX;
        posY = mouseY;
        cursor.style.left = `${posX}px`;
        cursor.style.top = `${posY}px`;
        requestAnimationFrame(animate);
    }

    animate();
}

/**
 * SPA Engine (View Transitions)
 */
async function navigateToPage(url, triggerElement = null) {
    if (!document.startViewTransition) {
        window.location.href = url.href;
        return;
    }

    if (triggerElement && triggerElement.closest('.projects-split__block')) {
        document.documentElement.dataset.transition = 'expand';
    } else if (triggerElement && triggerElement.closest('.mobile-nav')) {
        document.documentElement.dataset.transition = 'menu';
    } else {
        document.documentElement.dataset.transition = 'fade';
    }

    if (triggerElement) triggerElement.style.opacity = '0.7';

    try {
        const response = await fetch(url.href);
        const html = await response.text();
        const parser = new DOMParser();
        const nextDoc = parser.parseFromString(html, 'text/html');
        const nextMain = nextDoc.querySelector('#content-wrap');
        
        const transition = document.startViewTransition(() => {
            document.documentElement.style.scrollBehavior = 'auto';
            document.querySelector('#content-wrap').innerHTML = nextMain.innerHTML;
            document.title = nextDoc.title;
            window.history.pushState({}, '', url.href);
            
            if (url.hash) {
                const id = url.hash.replace('#', '');
                const el = document.getElementById(id);
                if (el) window.scrollTo(0, el.offsetTop - 60);
            } else {
                window.scrollTo(0, 0);
            }

            updateActiveLinks();
            setTimeout(() => { document.documentElement.style.scrollBehavior = ''; }, 0);
        });

        await transition.finished;
        GalleryModule.init();
    } catch (err) {
        window.location.href = url.href;
    } finally {
        delete document.documentElement.dataset.transition;
    }
}

function initNavigation() {
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link || !link.href || link.target || link.download) return;
        
        const url = new URL(link.href);
        if (url.origin !== window.location.origin) return;

        const isSamePageHash = url.pathname === window.location.pathname && link.hash;
        if (isSamePageHash && !link.closest('.mobile-nav')) return;

        e.preventDefault();
        navigateToPage(url, link);
    });
}

function updateActiveLinks() {
    const path = window.location.pathname;
    document.querySelectorAll('.nav-menu a, .mobile-nav a').forEach(link => {
        const linkHref = link.getAttribute('href');
        const isActive = path.endsWith(linkHref) || (path === '/' && linkHref === 'index.html');
        link.classList.toggle('active', isActive);
    });
}
