document.addEventListener('DOMContentLoaded', () => {

    /* ========================================================
       1. THEME TOGGLE
       ======================================================== */
    const themeBtn = document.querySelector('.theme-toggle');
    const html = document.documentElement;

    themeBtn.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    /* ========================================================
       2. NAVBAR SCROLL & ACTIVE STATE
       ======================================================== */
    const navbar = document.getElementById('navbar');
    const navWrapper = document.getElementById('nav-wrapper');
    let scrollTimeout;

    // Throttle scroll events
    window.addEventListener('scroll', () => {
        if (!scrollTimeout) {
            scrollTimeout = requestAnimationFrame(() => {
                if (window.scrollY > 50) {
                    navbar.classList.add('scrolled');
                    if (navWrapper) navWrapper.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                    if (navWrapper) navWrapper.classList.remove('scrolled');
                }
                scrollTimeout = null;
            });
        }
    }, { passive: true });

    /* ========================================================
       3. MOBILE MENU (REWRITTEN)
       ======================================================== */
    const hamburger = document.querySelector('.hamburger-menu');
    const mobileMenu = document.querySelector('.mobile-dropdown');
    const themeToggle = document.querySelector('.theme-toggle');
    const mobileLinks = document.querySelectorAll('.mobile-link, .mobile-dropdown .btn-book');
    let isMenuOpen = false;

    function openMenu() {
        if (isMenuOpen) return;
        isMenuOpen = true;
        hamburger.classList.add('active');

        // JS Blur & Slide Animation to ensure 300ms + Blur
        mobileMenu.style.transition = 'none';
        mobileMenu.style.filter = 'blur(12px)';
        mobileMenu.style.opacity = '0';
        mobileMenu.style.transform = 'translateY(-20px) scale(0.95)';
        mobileMenu.style.pointerEvents = 'none';
        mobileMenu.classList.add('active');

        // Force reflow
        void mobileMenu.offsetWidth;

        mobileMenu.style.transition = 'all 300ms cubic-bezier(0.25, 1, 0.5, 1)';
        mobileMenu.style.filter = 'blur(0px)';
        mobileMenu.style.opacity = '1';
        mobileMenu.style.transform = 'translateY(0) scale(1)';
        mobileMenu.style.pointerEvents = 'all';

        // Prevent body scroll
        document.body.style.overflow = 'hidden';

        // Accessibility
        hamburger.setAttribute('aria-expanded', 'true');

        // Focus first link after animation
        setTimeout(() => {
            if (mobileLinks.length > 0) mobileLinks[0].focus();
        }, 300);
    }

    function closeMenu() {
        if (!isMenuOpen) return;
        isMenuOpen = false;
        hamburger.classList.remove('active');

        // Reverse JS Animation
        mobileMenu.style.transition = 'all 300ms cubic-bezier(0.25, 1, 0.5, 1)';
        mobileMenu.style.filter = 'blur(12px)';
        mobileMenu.style.opacity = '0';
        mobileMenu.style.transform = 'translateY(-20px) scale(0.95)';
        mobileMenu.style.pointerEvents = 'none';

        // Restore body scroll
        document.body.style.overflow = '';
        hamburger.setAttribute('aria-expanded', 'false');

        setTimeout(() => {
            mobileMenu.classList.remove('active');
            mobileMenu.style.filter = '';
            mobileMenu.style.opacity = '';
            mobileMenu.style.transform = '';
            mobileMenu.style.transition = '';
            mobileMenu.style.pointerEvents = '';
        }, 300);
    }

    function toggleMenu(e) {
        if (e) e.stopPropagation();
        if (isMenuOpen) closeMenu();
        else openMenu();
    }

    hamburger.addEventListener('click', toggleMenu);

    // Click outside to close
    document.addEventListener('click', (e) => {
        if (isMenuOpen && !mobileMenu.contains(e.target) && !hamburger.contains(e.target) && !themeToggle.contains(e.target)) {
            closeMenu();
        }
    });

    // ESC to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isMenuOpen) closeMenu();
    });

    // Debounce resize to close menu if resizing to desktop
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (window.innerWidth > 992 && isMenuOpen) {
                closeMenu();
            }
            // Update capsule on resize
            const active = document.querySelector('.nav-links-container .nav-link.active');
            if (active) updateCapsule(active);
        }, 150);
    }, { passive: true });

    /* ========================================================
       3.5 ACTIVE CAPSULE & SMOOTH SCROLLING
       ======================================================== */
    const navLinks = document.querySelectorAll('.nav-links-container .nav-link');
    const activeCapsule = document.getElementById('active-capsule');

    function updateCapsule(link) {
        if (!link || !activeCapsule) return;
        const rect = link.getBoundingClientRect();
        const containerRect = link.parentElement.getBoundingClientRect();

        activeCapsule.style.width = `${rect.width}px`;
        activeCapsule.style.left = `${rect.left - containerRect.left}px`;
        activeCapsule.style.opacity = '1';
    }

    window.addEventListener('load', () => {
        const initialActive = document.querySelector('.nav-links-container .nav-link.active');
        if (initialActive) updateCapsule(initialActive);
    });

    // Smooth Scroll Logic
    const allScrollLinks = document.querySelectorAll('.nav-link, .mobile-link, .btn-book');

    allScrollLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            if (targetId && targetId.startsWith('#')) {
                e.preventDefault();
                const targetSection = document.querySelector(targetId);

                if (targetSection) {
                    // Offset for floating navbar
                    const offset = window.innerWidth > 992 ? 96 : 92;
                    const sectionTop = targetSection.getBoundingClientRect().top + window.pageYOffset;

                    window.scrollTo({
                        top: sectionTop - offset,
                        behavior: 'smooth'
                    });

                    // Update Mobile Active State Manually
                    if (link.classList.contains('mobile-link')) {
                        document.querySelectorAll('.mobile-dropdown .mobile-link').forEach(l => l.classList.remove('active'));
                        link.classList.add('active');
                    }

                    // Close menu if mobile
                    closeMenu();
                }
            }
        });
    });

    navLinks.forEach(link => {
        link.addEventListener('mouseenter', () => updateCapsule(link));
        link.addEventListener('mouseleave', () => {
            const active = document.querySelector('.nav-links-container .nav-link.active');
            if (active) updateCapsule(active);
            else activeCapsule.style.opacity = '0';
        });
    });

    // Intersection Observer for Active States
    // Select both standard sections and header (Hero)
    const sections = document.querySelectorAll('section[id], header[id]');

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.target.id) {
                const id = entry.target.id;

                // Desktop update
                const activeDesktopLink = document.querySelector(`.nav-links-container .nav-link[href="#${id}"]`);
                if (activeDesktopLink) {
                    navLinks.forEach(l => l.classList.remove('active'));
                    activeDesktopLink.classList.add('active');
                    updateCapsule(activeDesktopLink);
                }

                // Mobile update
                const activeMobileLink = document.querySelector(`.mobile-dropdown .mobile-link[href="#${id}"]`);
                if (activeMobileLink) {
                    document.querySelectorAll('.mobile-dropdown .mobile-link').forEach(l => l.classList.remove('active'));
                    activeMobileLink.classList.add('active');
                }
            }
        });
    }, { rootMargin: '-100px 0px -60% 0px' });

    sections.forEach(sec => sectionObserver.observe(sec));

    /* ========================================================
       4. SCROLL REVEAL ANIMATION
       ======================================================== */
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    });

    revealElements.forEach(el => revealObserver.observe(el));

    /* ========================================================
       5. COUNTER ANIMATION
       ======================================================== */
    const counters = document.querySelectorAll('.counter');
    let hasAnimated = false;

    const counterObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
            hasAnimated = true;
            counters.forEach(counter => {
                const target = +counter.getAttribute('data-target');
                const duration = 2000; // 2 seconds
                const increment = target / (duration / 16); // 60fps

                let current = 0;
                const updateCounter = () => {
                    current += increment;
                    if (current < target) {
                        counter.innerText = Math.ceil(current);
                        requestAnimationFrame(updateCounter);
                    } else {
                        counter.innerText = target;
                    }
                };
                updateCounter();
            });
        }
    }, { threshold: 0.5 });

    if (counters.length > 0) {
        counterObserver.observe(document.querySelector('.hero-bottom-stats'));
    }

    /* ========================================================
       6. MAGNETIC BUTTON HOVER
       ======================================================== */
    const magneticBtns = document.querySelectorAll('.magnetic');

    magneticBtns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            // Move button slightly towards cursor
            btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
        });

        btn.addEventListener('mouseleave', () => {
            // Reset position with transition
            btn.style.transform = `translate(0px, 0px)`;
            btn.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
        });

        btn.addEventListener('mouseenter', () => {
            // Remove transition for instant following
            btn.style.transition = 'none';
        });
    });

    /* ========================================================
       7. MOUSE PARALLAX EFFECT
       ======================================================== */
    const parallaxEls = document.querySelectorAll('.parallax-el');

    document.addEventListener('mousemove', (e) => {
        const x = (window.innerWidth - e.pageX * 2) / 100;
        const y = (window.innerHeight - e.pageY * 2) / 100;

        parallaxEls.forEach(el => {
            const speed = el.getAttribute('data-speed');
            el.style.transform = `translateX(${x * speed}px) translateY(${y * speed}px)`;
        });
    });

    /* ========================================================
       8. SUBTLE PARTICLES
       ======================================================== */
    const particlesContainer = document.getElementById('particles');

    if (particlesContainer) {
        // Create 20 random particles
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');

            // Random properties
            const size = Math.random() * 5 + 2; // 2px to 7px
            const left = Math.random() * 100; // 0% to 100%
            const duration = Math.random() * 20 + 10; // 10s to 30s
            const delay = Math.random() * 20; // 0s to 20s

            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${left}%`;
            particle.style.animationDuration = `${duration}s`;
            particle.style.animationDelay = `-${delay}s`; // start midway

            particlesContainer.appendChild(particle);
        }
    }


    /* ========================================================
       9. CONTACT FORM VALIDATION & SUBMISSION
       ======================================================== */
    const contactForm = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn ? submitBtn.querySelector('.btn-text') : null;
    const spinner = submitBtn ? submitBtn.querySelector('.loading-spinner') : null;

    // Toasts
    const successToast = document.getElementById('successToast');
    const errorToast = document.getElementById('errorToast');
    let toastTimeout;

    const showToast = (toastEl) => {
        if (!toastEl) return;
        toastEl.classList.remove('hidden');
        // Force reflow
        void toastEl.offsetWidth;
        toastEl.classList.add('show');

        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            hideToast(toastEl);
        }, 5000);
    };

    const hideToast = (toastEl) => {
        if (!toastEl) return;
        toastEl.classList.remove('show');
        setTimeout(() => {
            toastEl.classList.add('hidden');
        }, 400); // Wait for transition
    };

    // Close buttons for toasts
    document.querySelectorAll('.toast-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            hideToast(e.target.closest('.glass-toast'));
        });
    });

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            let isValid = true;
            const fields = {
                name: { el: document.getElementById('fullName'), error: document.getElementById('nameError') },
                phone: { el: document.getElementById('phoneNumber'), error: document.getElementById('phoneError'), regex: /^\d{10,}$/ },
                email: { el: document.getElementById('emailAddress'), error: document.getElementById('emailError'), regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, optional: true },
                service: { el: document.getElementById('serviceRequired'), error: document.getElementById('serviceError') },
                message: { el: document.getElementById('message'), error: document.getElementById('messageError') }
            };

            // Reset previous errors
            Object.values(fields).forEach(f => {
                if (f.el) f.el.closest('.form-group').classList.remove('has-error');
            });

            // Validation
            for (const key in fields) {
                const f = fields[key];
                if (!f.el) continue;

                const val = f.el.value.trim();
                let fieldValid = true;

                if (val === '') {
                    if (!f.optional) {
                        fieldValid = false;
                    }
                } else if (f.regex && !f.regex.test(val)) {
                    fieldValid = false;
                }

                if (!fieldValid) {
                    f.el.closest('.form-group').classList.add('has-error');
                    isValid = false;
                }
            }

            if (!isValid) return;

            // Prepare for Submission
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());

            // UI Loading State
            submitBtn.disabled = true;
            if (btnText) btnText.style.opacity = '0.5';
            if (spinner) spinner.classList.remove('hidden');

            try {
                // Simulate a brief loading state for better UX
                await new Promise(resolve => setTimeout(resolve, 600));

                const msg = `🏥 New Consultation Request

👤 Name:
${data.name}

📞 Phone:
${data.phone}
` + (data.email ? `
📧 Email:
${data.email}
` : "") + `
🩺 Service:
${data.service}
` + (data.date ? `
📅 Preferred Date:
${data.date}
` : "") + `
📝 Message:
${data.message}`;

                const waMessage = encodeURIComponent(msg);
                const waUrl = `https://wa.me/919310622475?text=${waMessage}`;

                window.open(waUrl, '_blank');

                showToast(successToast);
                contactForm.reset();
            } catch (err) {
                console.error(err);
                showToast(errorToast);
            } finally {
                // Restore UI State
                submitBtn.disabled = false;
                if (btnText) btnText.style.opacity = '1';
                if (spinner) spinner.classList.add('hidden');
            }
        });

        // Remove error state on input
        contactForm.querySelectorAll('input, select, textarea').forEach(el => {
            el.addEventListener('input', () => {
                el.closest('.form-group').classList.remove('has-error');
            });
            el.addEventListener('change', () => {
                el.closest('.form-group').classList.remove('has-error');
            });
        });
    }

    // Scroll to Top
    const scrollToTopBtn = document.getElementById('scrollToTop');
    if (scrollToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 400) {
                scrollToTopBtn.classList.add('visible');
            } else {
                scrollToTopBtn.classList.remove('visible');
            }
        });

        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

});  