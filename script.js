document.addEventListener('DOMContentLoaded', () => {
    // 1. Reveal Animation on Scroll
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(section => {
        revealObserver.observe(section);
    });

    // 2. Mobile Menu Logic
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const closeMenuBtn = document.querySelector('.close-menu-btn');
    const mobileMenuOverlay = document.getElementById('mobileMenu');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-links a');
    let lastFocusedElement;

    const openMobileMenu = () => {
        lastFocusedElement = document.activeElement;
        mobileMenuOverlay.classList.add('active');
        mobileMenuOverlay.setAttribute('aria-hidden', 'false');
        mobileMenuBtn.setAttribute('aria-expanded', 'true');
        document.body.classList.add('no-scroll');
        
        // Set focus to the close button for accessibility
        setTimeout(() => closeMenuBtn.focus(), 100);
    };

    const closeMobileMenu = () => {
        mobileMenuOverlay.classList.remove('active');
        mobileMenuOverlay.setAttribute('aria-hidden', 'true');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('no-scroll');
        
        if (lastFocusedElement) {
            lastFocusedElement.focus();
        }
    };

    if (mobileMenuBtn && closeMenuBtn && mobileMenuOverlay) {
        mobileMenuBtn.addEventListener('click', openMobileMenu);
        closeMenuBtn.addEventListener('click', closeMobileMenu);
        
        // Close when clicking outside content (on the overlay background)
        mobileMenuOverlay.addEventListener('click', (e) => {
            if (e.target === mobileMenuOverlay) {
                closeMobileMenu();
            }
        });
        
        // Close when a link is clicked
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });

        // Trap focus
        mobileMenuOverlay.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeMobileMenu();
                return;
            }
            if (e.key === 'Tab') {
                const focusable = mobileMenuOverlay.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                
                if (e.shiftKey) {
                    if (document.activeElement === first) {
                        last.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === last) {
                        first.focus();
                        e.preventDefault();
                    }
                }
            }
        });
    }

    // 3. Language Dropdown Logic
    const langTrigger = document.querySelector('.lang-trigger');
    const langDropdown = document.querySelector('.lang-dropdown');
    const langOptions = document.querySelectorAll('.lang-option');
    let currentLang = 'EN';

    const toggleLangDropdown = (forceClose = false) => {
        const isExpanded = langTrigger.getAttribute('aria-expanded') === 'true';
        if (isExpanded || forceClose) {
            langTrigger.setAttribute('aria-expanded', 'false');
            langDropdown.classList.remove('active');
        } else {
            langTrigger.setAttribute('aria-expanded', 'true');
            langDropdown.classList.add('active');
            langOptions[0].focus(); // Focus first option
        }
    };

    const onLanguageChange = (lang) => {
        // Update document lang attribute for SEO/Accessibility
        document.documentElement.lang = lang.toLowerCase();
        
        // Persist selection
        localStorage.setItem('naturea_lang', lang);
        
        // Lookup dictionary
        const dict = translations[lang] || translations['EN'];
        
        // Safely access nested object properties
        const getNestedValue = (obj, path) => {
            return path.split('.').reduce((acc, part) => acc && acc[part], obj);
        };
        
        // Replace all marked elements
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translatedText = getNestedValue(dict, key);
            if (translatedText) {
                el.textContent = translatedText;
            }
        });
    };

    if (langTrigger && langDropdown) {
        // Init from localStorage
        const savedLang = localStorage.getItem('naturea_lang') || 'EN';
        if (savedLang !== 'EN') {
            const initialOption = document.querySelector(`.lang-option[data-lang="${savedLang}"]`);
            if (initialOption) {
                const flag = initialOption.getAttribute('data-flag');
                langTrigger.querySelector('.lang-text').textContent = savedLang;
                langTrigger.querySelector('.fi').className = `fi fi-${flag} flag-circle`;
                
                langOptions.forEach(opt => {
                    opt.classList.remove('selected');
                    opt.setAttribute('aria-selected', 'false');
                });
                initialOption.classList.add('selected');
                initialOption.setAttribute('aria-selected', 'true');
                
                currentLang = savedLang;
                onLanguageChange(savedLang);
            }
        }

        langTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleLangDropdown();
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!langDropdown.contains(e.target) && !langTrigger.contains(e.target)) {
                toggleLangDropdown(true);
            }
        });

        // Keyboard navigation and selection
        langDropdown.addEventListener('keydown', (e) => {
            const activeElement = document.activeElement;
            const currentIndex = Array.from(langOptions).indexOf(activeElement);
            
            if (e.key === 'Escape') {
                toggleLangDropdown(true);
                langTrigger.focus();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                const next = langOptions[currentIndex + 1] || langOptions[0];
                next.focus();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                const prev = langOptions[currentIndex - 1] || langOptions[langOptions.length - 1];
                prev.focus();
            }
        });

        // Option selection
        langOptions.forEach(option => {
            option.addEventListener('click', () => {
                const lang = option.getAttribute('data-lang');
                const flag = option.getAttribute('data-flag');
                
                if (lang === currentLang) {
                    toggleLangDropdown(true);
                    return;
                }
                
                // Update trigger button
                langTrigger.querySelector('.lang-text').textContent = lang;
                langTrigger.querySelector('.fi').className = `fi fi-${flag} flag-circle`;
                
                // Update selected styling
                langOptions.forEach(opt => {
                    opt.classList.remove('selected');
                    opt.setAttribute('aria-selected', 'false');
                });
                option.classList.add('selected');
                option.setAttribute('aria-selected', 'true');
                
                currentLang = lang;
                toggleLangDropdown(true);
                langTrigger.focus();
                
                // Fire translation update
                onLanguageChange(lang);
            });
        });
    }

    // 4. Native Scroll Snap Carousel Logic
    const track = document.getElementById('carouselTrack');
    if (track) {
        const slides = Array.from(track.querySelectorAll('.carousel-slide'));
        const nextBtn = document.querySelector('.next-btn');
        const prevBtn = document.querySelector('.prev-btn');
        const dotsContainer = document.getElementById('carouselDots');
        
        let autoPlayInterval;
        
        // Generate Dots
        slides.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.classList.add('dot');
            if (index === 0) dot.classList.add('active');
            dot.dataset.index = index;
            dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
            dotsContainer.appendChild(dot);
        });
        
        const dots = Array.from(dotsContainer.children);
        
        // Intersection Observer to highlight active dot based on scroll position
        const slideObserver = new IntersectionObserver((entries) => {
            // Find the most visible slide
            let maxRatio = 0;
            let activeIndex = -1;
            
            entries.forEach(entry => {
                if (entry.intersectionRatio > maxRatio) {
                    maxRatio = entry.intersectionRatio;
                    activeIndex = slides.indexOf(entry.target);
                }
            });
            
            if (activeIndex !== -1 && maxRatio > 0.4) {
                dots.forEach(dot => dot.classList.remove('active'));
                dots[activeIndex].classList.add('active');
            }
        }, { 
            root: track,
            threshold: [0.4, 0.5, 0.6, 0.9, 1.0] // trigger multiple times to find max
        });
        
        slides.forEach(slide => slideObserver.observe(slide));
        
        // Scroll Helpers
        const scrollNext = () => {
            const scrollAmount = track.clientWidth > 768 ? track.clientWidth / 2 : track.clientWidth;
            
            // If near the end, loop back
            if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 10) {
                track.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        };

        const scrollPrev = () => {
            const scrollAmount = track.clientWidth > 768 ? track.clientWidth / 2 : track.clientWidth;
            track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        };

        if (nextBtn) nextBtn.addEventListener('click', () => { scrollNext(); resetAutoPlay(); });
        if (prevBtn) prevBtn.addEventListener('click', () => { scrollPrev(); resetAutoPlay(); });
        
        // Click on dots to scroll to specific slide
        dots.forEach(dot => {
            dot.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                const slide = slides[index];
                if (slide) {
                    // Calculate precise offset so it centers nicely
                    const offsetLeft = slide.offsetLeft - track.offsetLeft;
                    track.scrollTo({ left: offsetLeft, behavior: 'smooth' });
                }
                resetAutoPlay();
            });
        });
        
        // Autoplay
        const startAutoPlay = () => {
            autoPlayInterval = setInterval(scrollNext, 6000);
        };
        
        const pauseAutoPlay = () => {
            clearInterval(autoPlayInterval);
        };
        
        const resetAutoPlay = () => {
            pauseAutoPlay();
            startAutoPlay();
        };
        
        // Pause on hover or touch
        const carouselContainer = document.querySelector('.carousel-container');
        if (carouselContainer) {
            carouselContainer.addEventListener('mouseenter', pauseAutoPlay);
            carouselContainer.addEventListener('mouseleave', startAutoPlay);
            carouselContainer.addEventListener('touchstart', pauseAutoPlay, { passive: true });
            carouselContainer.addEventListener('touchend', startAutoPlay, { passive: true });
        }
        
        startAutoPlay();
    }
});
