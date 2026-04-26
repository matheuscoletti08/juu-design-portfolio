document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initScrollEffects();
    initMobileMenu();
});

function initScrollEffects() {
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        const isScrolled = window.scrollY > 50;
        header.classList.toggle('scrolled', isScrolled);
    });
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

async function navigateToPage(url) {
    if (!document.startViewTransition) {
        window.location.href = url.href;
        return;
    }

    try {
        const response = await fetch(url.href);
        const html = await response.text();
        const parser = new DOMParser();
        const nextDoc = parser.parseFromString(html, 'text/html');
        const nextMain = nextDoc.querySelector('#content-wrap');
        
        document.startViewTransition(() => {
            document.querySelector('#content-wrap').innerHTML = nextMain.innerHTML;
            document.title = nextDoc.title;
            window.history.pushState({}, '', url.href);
            window.scrollTo({ top: 0, behavior: 'instant' });
            updateActiveLinks();
        });
    } catch (err) {
        window.location.href = url.href;
    }
}

function initNavigation() {
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link || !link.href) return;
        
        const url = new URL(link.href);
        if (url.origin === window.location.origin && !link.hash && !link.target) {
            e.preventDefault();
            navigateToPage(url);
        }
    });

    window.onpopstate = () => location.reload();
}

function updateActiveLinks() {
    const path = window.location.pathname;
    document.querySelectorAll('.nav-menu a, .mobile-nav a').forEach(link => {
        const isHome = path === '/' || path.includes('index.html');
        const linkHref = link.getAttribute('href');
        
        if (path.includes(linkHref) || (isHome && linkHref === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}
