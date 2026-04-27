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
        
        const expandingElement = document.querySelector('[style*="view-transition-name"]');
        const transitionName = expandingElement ? expandingElement.style.viewTransitionName : null;

        const transition = document.startViewTransition(() => {
            if (transitionName) {
                nextMain.style.viewTransitionName = transitionName;
            }
            
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

        // IMPORTANTE: Só limpa o nome APÓS a animação terminar completamente
        await transition.finished;
        nextMain.style.viewTransitionName = '';
    } catch (err) {
        window.location.href = url.href;
    } finally {
        delete document.documentElement.dataset.transition;
    }
}

function initNavigation() {
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link || !link.href) return;
        
        const url = new URL(link.href);
        const isInternal = url.origin === window.location.origin;
        const isSamePageHash = url.pathname === window.location.pathname && link.hash;

        if (isInternal && !link.target) {
            const isMobileLink = link.closest('.mobile-nav');

            if (isMobileLink || !isSamePageHash) {
                e.preventDefault();
                
                if (link.classList.contains('hero__cta')) {
                    link.style.viewTransitionName = 'hero-expand';
                } else if (isMobileLink) {
                    document.documentElement.dataset.transition = 'menu';
                }
                
                navigateToPage(url);
            }
        }
    });
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
