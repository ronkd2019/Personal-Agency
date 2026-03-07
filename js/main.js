/* ============================================
   ECLIPTIC FLARE — INTERACTIVE FEATURES
   All JavaScript for the portfolio website
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ================================================================
  // 0. SMOOTH SCROLL (LENIS)
  // ================================================================
  if (typeof Lenis !== 'undefined') {
    const lenis = new Lenis({
      duration: 0.8, // Decreased from 1.2 to 0.8 to remove floaty delay
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
      mouseMultiplier: 1.2, // Increased slightly to make wheel feel more responsive
      smoothTouch: false,
      touchMultiplier: 2,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  // ── Utility: Lerp ──
  const lerp = (start, end, factor) => start + (end - start) * factor;

  // ── Check for touch device ──
  const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

  // ================================================================
  // 1. CUSTOM MAGNETIC CURSOR
  // ================================================================
  if (!isTouchDevice) {
    const cursorDot = document.getElementById('cursorDot');
    const cursorOutline = document.getElementById('cursorOutline');
    let mouseX = 0, mouseY = 0;
    let outlineX = 0, outlineY = 0;
    let dotX = 0, dotY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    // Cursor animation loop
    function animateCursor() {
      // Dot follows with slight delay
      dotX = lerp(dotX, mouseX, 0.2);
      dotY = lerp(dotY, mouseY, 0.2);
      cursorDot.style.left = dotX + 'px';
      cursorDot.style.top = dotY + 'px';

      // Outline follows with more delay
      outlineX = lerp(outlineX, mouseX, 0.1);
      outlineY = lerp(outlineY, mouseY, 0.1);
      cursorOutline.style.left = outlineX + 'px';
      cursorOutline.style.top = outlineY + 'px';

      requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover effects on interactive elements
    const hoverTargets = document.querySelectorAll('a, button, .btn, .card-link, .social-link, .nav-link, .form-input, .hamburger');
    hoverTargets.forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursorDot.classList.add('hovering');
        cursorOutline.classList.add('hovering');
      });
      el.addEventListener('mouseleave', () => {
        cursorDot.classList.remove('hovering');
        cursorOutline.classList.remove('hovering');
      });
    });
  }

  // ================================================================
  // 2. MAGNETIC BUTTONS
  // ================================================================
  if (!isTouchDevice) {
    const magneticButtons = document.querySelectorAll('.magnetic-btn');

    magneticButtons.forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0, 0)';
        btn.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
      });

      btn.addEventListener('mouseenter', () => {
        btn.style.transition = 'transform 0.1s ease-out';
      });
    });
  }

  // ================================================================
  // 3. PARTICLE CONSTELLATION BACKGROUND
  // ================================================================
  const canvas = document.getElementById('particleCanvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let particleMouseX = 0, particleMouseY = 0;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  document.addEventListener('mousemove', (e) => {
    particleMouseX = e.clientX;
    particleMouseY = e.clientY;
  });

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.speedY = (Math.random() - 0.5) * 0.4;
      this.opacity = Math.random() * 0.5 + 0.2;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      // Wrap around edges
      if (this.x < 0) this.x = canvas.width;
      if (this.x > canvas.width) this.x = 0;
      if (this.y < 0) this.y = canvas.height;
      if (this.y > canvas.height) this.y = 0;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(79, 195, 247, ${this.opacity})`;
      ctx.fill();
    }
  }

  // Create particles
  const particleCount = Math.min(80, Math.floor((window.innerWidth * window.innerHeight) / 15000));
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function connectParticles() {
    const maxDistance = 150;
    const mouseMaxDistance = 200;

    for (let i = 0; i < particles.length; i++) {
      // Connect to mouse
      const dxMouse = particleMouseX - particles[i].x;
      const dyMouse = particleMouseY - particles[i].y;
      const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

      if (distMouse < mouseMaxDistance) {
        const opacity = 1 - distMouse / mouseMaxDistance;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particleMouseX, particleMouseY);
        ctx.strokeStyle = `rgba(79, 195, 247, ${opacity * 0.4})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Connect particles to each other
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDistance) {
          const opacity = 1 - dist / maxDistance;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(79, 195, 247, ${opacity * 0.15})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.update();
      p.draw();
    });

    connectParticles();
    requestAnimationFrame(animateParticles);
  }
  animateParticles();

  // ================================================================
  // 4. TEXT SCRAMBLE ANIMATION
  // ================================================================
  class TextScramble {
    constructor(el) {
      this.el = el;
      this.chars = '!<>-_\\/[]{}—=+*^?#________';
      this.frame = 0;
      this.queue = [];
      this.resolve = null;
    }

    setText(newText) {
      const oldText = this.el.innerText;
      const length = Math.max(oldText.length, newText.length);
      const promise = new Promise(resolve => this.resolve = resolve);
      this.queue = [];

      for (let i = 0; i < length; i++) {
        const from = oldText[i] || '';
        const to = newText[i] || '';
        const start = Math.floor(Math.random() * 40);
        const end = start + Math.floor(Math.random() * 40);
        this.queue.push({ from, to, start, end });
      }

      cancelAnimationFrame(this.frameRequest);
      this.frame = 0;
      this.update();
      return promise;
    }

    update() {
      let output = '';
      let complete = 0;

      for (let i = 0; i < this.queue.length; i++) {
        let { from, to, start, end, char } = this.queue[i];

        if (this.frame >= end) {
          complete++;
          output += to;
        } else if (this.frame >= start) {
          if (!char || Math.random() < 0.28) {
            char = this.chars[Math.floor(Math.random() * this.chars.length)];
            this.queue[i].char = char;
          }
          output += `<span class="text-accent" style="opacity:0.6">${char}</span>`;
        } else {
          output += from;
        }
      }

      this.el.innerHTML = output;

      if (complete === this.queue.length) {
        this.resolve();
      } else {
        this.frameRequest = requestAnimationFrame(() => this.update());
        this.frame++;
      }
    }
  }

  // Initialize text scramble on hero elements
  const heroName = document.getElementById('heroName');
  const heroTitle = document.getElementById('heroTitle');

  if (heroName) {
    const nameScramble = new TextScramble(heroName);
    const originalName = heroName.innerText;
    heroName.innerText = '';

    setTimeout(() => {
      nameScramble.setText(originalName);
    }, 800);
  }

  if (heroTitle) {
    const titleScramble = new TextScramble(heroTitle);
    const originalTitle = heroTitle.innerText;
    heroTitle.innerText = '';

    setTimeout(() => {
      titleScramble.setText(originalTitle);
    }, 1200);
  }

  // ================================================================
  // 5. CARD GLOW FOLLOW
  // ================================================================
  if (!isTouchDevice) {
    const tiltCards = document.querySelectorAll('.tilt-card');

    tiltCards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Update glow position
        const glow = card.querySelector('.card-glow');
        if (glow) {
          glow.style.setProperty('--mouse-x', x + 'px');
          glow.style.setProperty('--mouse-y', y + 'px');
        }
      });
    });
  }

  // ================================================================
  // 6. SCROLL-TRIGGERED REVEAL ANIMATIONS
  // ================================================================
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Optional: stop observing after reveal
        // revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // ================================================================
  // 7. NAVBAR — Scroll Effects & Active Section
  // ================================================================
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('.section');

  // Scrolled state
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Active section spy
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('data-section') === id) {
            link.classList.add('active');
          }
        });
      }
    });
  }, {
    threshold: 0.3,
    rootMargin: '-80px 0px -50% 0px'
  });

  sections.forEach(section => sectionObserver.observe(section));

  // Smooth scroll on nav link click
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');

      // Only smooth scroll for internal anchor links (starts with #)
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          const offset = navbar.offsetHeight;
          window.scrollTo({
            top: top,
            behavior: 'smooth'
          });

          // Close mobile menu if open
          const navLinksEl = document.getElementById('navLinks');
          const hamburger = document.getElementById('hamburger');
          if (navLinksEl.classList.contains('open')) {
            hamburger.classList.remove('active');
            navLinksEl.classList.remove('open');
            document.body.style.overflow = '';
          }
        }
      }
    });
  });

  // ================================================================
  // 8. HAMBURGER MENU
  // ================================================================
  const hamburger = document.getElementById('hamburger');
  const navLinksEl = document.getElementById('navLinks');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinksEl.classList.toggle('open');
  });

  // ================================================================
  // 9. ANIMATED STAT COUNTERS
  // ================================================================
  const statNumbers = document.querySelectorAll('.stat-number');

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.getAttribute('data-count'));
        animateCounter(entry.target, target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(el => counterObserver.observe(el));

  function animateCounter(el, target) {
    let current = 0;
    const increment = target / 60;
    const duration = 1500;
    const step = duration / 60;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        el.textContent = target;
        clearInterval(timer);
      } else {
        el.textContent = Math.floor(current);
      }
    }, step);
  }

  // ================================================================
  // 10. SCROLL INDICATOR FADE
  // ================================================================
  const scrollIndicator = document.getElementById('scrollIndicator');

  window.addEventListener('scroll', () => {
    if (scrollIndicator) {
      const opacity = Math.max(0, 1 - window.scrollY / 300);
      scrollIndicator.style.opacity = opacity;
    }
  });

  // ================================================================
  // 11. CONTACT FORM (via api/contact.js)
  // ================================================================
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const btn = contactForm.querySelector('.btn');
      const originalText = btn.innerHTML;

      const nameInput = document.getElementById('nameInput');
      const emailInput = document.getElementById('emailInput');
      const messageInput = document.getElementById('messageInput');

      btn.innerHTML = '<span>Sending...</span>';
      btn.style.opacity = '0.7';
      btn.disabled = true;

      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: nameInput.value,
            email: emailInput.value,
            message: messageInput.value
          })
        });

        const data = await response.json();

        if (response.ok) {
          btn.innerHTML = '<span>Message Sent! ✓</span>';
          btn.style.background = 'linear-gradient(135deg, #00c853, #69f0ae)';
          contactForm.reset();
        } else {
          throw new Error(data.message || 'Failed to send message.');
        }
      } catch (error) {
        console.error("Form error:", error);
        btn.innerHTML = '<span>Error Sending</span>';
        btn.style.background = '#ff5252';
        alert(error.message || "There was a problem sending your message. Please try again.");
      } finally {
        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.style.background = '';
          btn.style.opacity = '1';
          btn.disabled = false;
        }, 3000);
      }
    });
  }

  // ================================================================
  // 12. SMOOTH NAV LOGO CLICK
  // ================================================================
  const navLogo = document.querySelector('.nav-logo');
  if (navLogo) {
    navLogo.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ================================================================
  // 13. NATIVE VELOCITY MARQUEE SCROLL
  // ================================================================
  const marquees = document.querySelectorAll('.marquee');
  let scrollVelocity = 0;
  let lastScrollY = window.scrollY;
  let isScrolling = false;
  let scrollTimeout;

  // Track scroll velocity
  window.addEventListener('scroll', () => {
    isScrolling = true;
    const currentScrollY = window.scrollY;
    // Calculate raw velocity
    scrollVelocity = currentScrollY - lastScrollY;
    lastScrollY = currentScrollY;

    // Reset when scroll stops
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      isScrolling = false;
    }, 50); // 50ms without scroll event means stopped
  }, { passive: true });

  // Animation Loop for Marquees
  marquees.forEach((marquee) => {
    const content = marquee.querySelector('.marquee-content');
    if (!content) return;

    // The content is duplicated in HTML (2 .marquee-content children)
    const isReverse = marquee.classList.contains('marquee-reverse');

    // To move left (forward), we animate from 0% to -50% translation.
    // To move right (reverse), we animate from -50% to 0% translation to avoid empty space on the left side.
    let position = isReverse ? -50 : 0;

    // Base speed pixels per frame - ultra slow default ("barely creeping")
    const baseSpeed = 0.02;

    // Using a lerped/smoothed velocity value so it doesn't instantly snap back
    let smoothedVelocityMultiplier = 1;

    // Track hover state for pausing
    let isHovered = false;
    marquee.addEventListener('mouseenter', () => isHovered = true);
    marquee.addEventListener('mouseleave', () => isHovered = false);

    function animateMarquee() {
      if (!isHovered) {
        // 1. Calculate the current target multiplier based on scroll velocity
        let targetMultiplier = 1;

        if (isScrolling) {
          // Boost speed based on how fast the user is scrolling
          // Since base speed is now tiny, we need a larger multiplier to feel responsive
          const speedBoost = Math.abs(scrollVelocity) * 0.3;
          targetMultiplier = 1 + speedBoost;
          // Cap the max speed 
          targetMultiplier = Math.min(targetMultiplier, 40);
        }

        // 2. Smoothly interpolate current multiplier towards target multiplier
        smoothedVelocityMultiplier += (targetMultiplier - smoothedVelocityMultiplier) * 0.05;

        // 3. Apply Speed
        const currentSpeed = baseSpeed * smoothedVelocityMultiplier;

        // 4. Update Position & Loop
        if (isReverse) {
          // Moving right (reverse direction)
          position += currentSpeed;
          if (position >= 0) {
            // Reached the right edge, snap back to -50% to seamlessly loop
            position -= 50;
          }
        } else {
          // Moving left (forward direction)
          position -= currentSpeed;
          if (position <= -50) {
            // Reached the halfway point, snap back to 0% to seamlessly loop
            position += 50;
          }
        }

        // 5. Apply Transform (using translate3d for hardware acceleration)
        marquee.style.transform = `translate3d(${position}%, 0, 0)`;
      }

      requestAnimationFrame(animateMarquee);
    }

    // Start loop for this marquee
    animateMarquee();
  });

  // ================================================================
  // 14. SCROLL-TO-TYPE CODE
  // ================================================================
  const codeTypeArea = document.getElementById('codeTypeArea');
  const aboutSection = document.getElementById('about');

  if (codeTypeArea && aboutSection) {
    function wrapTextNodes(element) {
      const nodes = Array.from(element.childNodes);
      nodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent;
          if (text.trim().length > 0) {
            const fragment = document.createDocumentFragment();
            for (let i = 0; i < text.length; i++) {
              const span = document.createElement('span');
              span.textContent = text[i];
              span.className = 'type-char';
              span.style.opacity = '0.05';
              fragment.appendChild(span);
            }
            element.replaceChild(fragment, node);
          }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          wrapTextNodes(node);
        }
      });
    }

    wrapTextNodes(codeTypeArea);
    const typeChars = document.querySelectorAll('.type-char');

    window.addEventListener('scroll', () => {
      const rect = aboutSection.getBoundingClientRect();
      const scrollableHeight = rect.height - window.innerHeight;

      let progress = 0;
      if (rect.top <= 0) {
        progress = Math.abs(rect.top) / scrollableHeight;
      }

      progress = Math.max(0, Math.min(1, progress));

      const charsToShow = Math.floor(progress * typeChars.length);

      typeChars.forEach((char, index) => {
        if (index < charsToShow) {
          char.style.opacity = '1';
          char.style.textShadow = '0 0 10px rgba(79, 195, 247, 0.4)';
        } else {
          char.style.opacity = '0.05';
          char.style.textShadow = 'none';
        }
      });
    }, { passive: true });
  }

  // ================================================================
  // 15. GLOBE GL (Global Reach)
  // ================================================================
  const globeElem = document.getElementById('globeViz');
  const globalReachSection = document.getElementById('global-reach');

  if (globeElem && window.Globe && globalReachSection) {
    const colorHex = '#4fc3f7';   // Accent primary
    const colorHexMuted = 'rgba(79, 195, 247, 0.2)'; // Accent muted
    const bgDark = 'rgba(0,0,0,0)'; // Transparent for container gradient

    const warsaw = { lat: 52.2297, lng: 21.0122 };

    // Sample locations representing clients around the world
    const targetLocations = [
      { lat: 40.7128, lng: -74.0060, name: 'New York' },
      { lat: 34.0522, lng: -118.2437, name: 'Los Angeles' },
      { lat: 51.5074, lng: -0.1278, name: 'London' },
      { lat: -33.8688, lng: 151.2093, name: 'Sydney' },
      { lat: 35.6762, lng: 139.6503, name: 'Tokyo' },
      { lat: -23.5505, lng: -46.6333, name: 'Sao Paulo' },
      { lat: 25.2048, lng: 55.2708, name: 'Dubai' },
      { lat: 1.3521, lng: 103.8198, name: 'Singapore' }
    ];

    let currentArcs = [];

    const myGlobe = Globe()(globeElem)
      .backgroundColor(bgDark)
      .showGlobe(false)
      .showAtmosphere(true)
      .atmosphereColor(colorHex)
      .atmosphereAltitude(0.15)
      .arcStartLat(d => d.startLat)
      .arcStartLng(d => d.startLng)
      .arcEndLat(d => d.endLat)
      .arcEndLng(d => d.endLng)
      .arcColor(d => d.color)
      .arcDashLength(1) // Long dash length to look like a solid growing line
      .arcDashGap(10) // Huge gap so the dash never repeats
      .arcDashInitialGap(d => d.initialGap) // Dynamically set gap based on scroll
      .arcDashAnimateTime(0) // No auto-animation, controlled by scroll 
      .arcsTransitionDuration(0);

    // Fetch geojson and render as dot-map using hex polygons
    fetch('https://raw.githubusercontent.com/vasturiano/globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson')
      .then(res => res.json())
      .then(countries => {
        myGlobe
          .hexPolygonsData(countries.features)
          .hexPolygonResolution(3)
          .hexPolygonMargin(0.3)
          .hexPolygonColor(() => colorHexMuted);
      });

    // Auto-rotate the globe slowly
    myGlobe.controls().autoRotate = true;
    myGlobe.controls().autoRotateSpeed = 0.5;
    myGlobe.controls().enableZoom = false; // Disable zoom so page scroll isn't blocked

    // Position the camera to show Europe center stage initially
    myGlobe.pointOfView({ lat: 25, lng: 15, altitude: 2.2 });

    // Make responsive on window resize
    window.addEventListener('resize', () => {
      myGlobe.width(globeElem.clientWidth);
      myGlobe.height(globeElem.clientHeight);
    });

    // Scroll listener for arcs & globe entry
    window.addEventListener('scroll', () => {
      const rect = globalReachSection.getBoundingClientRect();
      const scrollableHeight = rect.height - window.innerHeight;

      let progress = 0;
      if (rect.top <= 0) {
        progress = Math.abs(rect.top) / scrollableHeight;
      }

      progress = Math.max(0, Math.min(1, progress));

      // 1. Globe Entry Animation (progress 0 to 0.15)
      const entryThreshold = 0.15;
      let entryProgress = progress / entryThreshold;
      entryProgress = Math.max(0, Math.min(1, entryProgress));

      // Easing function for smoother entry (ease-out cubic)
      const easeOut = 1 - Math.pow(1 - entryProgress, 3);

      // Slide up from 100vh below and fade in
      globeElem.style.transform = `translateY(${(1 - easeOut) * 100}vh)`;
      globeElem.style.opacity = easeOut;

      // 2. Arc Animation (progress 0.15 to 0.8)
      // We start drawing arcs AFTER entry is complete
      let arcMasterProgress = 0;
      if (progress > 0.15) {
        arcMasterProgress = (progress - 0.15) / 0.65;
      }
      arcMasterProgress = Math.max(0, Math.min(1, arcMasterProgress));

      // 3. Text Entry Animation (progress 0.8 to 1.0)
      // Text reveals after all arcs are mostly visible
      let textProgress = 0;
      if (progress > 0.8) {
        textProgress = (progress - 0.8) / 0.2;
      }
      textProgress = Math.max(0, Math.min(1, textProgress));
      const textEaseOut = 1 - Math.pow(1 - textProgress, 3);

      const textElem = document.getElementById('globalReachText');
      if (textElem) {
        textElem.style.opacity = textEaseOut;
        textElem.style.transform = `translateY(${(1 - textEaseOut) * 30}px)`;
      }

      const numLocs = targetLocations.length;
      const arcsToRender = [];
      const pointsToRender = [];

      // Give Warsaw a solid dot when globe begins to be visible
      if (entryProgress > 0) {
        pointsToRender.push({
          lat: warsaw.lat,
          lng: warsaw.lng,
          color: '#4fc3f7',
          radius: 0.8 * easeOut,
          altitude: 0.05
        });
      }

      targetLocations.forEach((loc, index) => {
        // Calculate specific progress for this arc (staggered in pairs to speed it up)
        const pairIndex = Math.floor(index / 2);
        const numPairs = Math.ceil(numLocs / 2);

        const arcStart = pairIndex / numPairs;

        // Draw duration allows slight overlap of drawing sequences
        const drawDuration = (1 / numPairs) * 1.5;
        const arcEnd = Math.min(arcStart + drawDuration, 1.0);

        let arcProgress = (arcMasterProgress - arcStart) / (arcEnd - arcStart);
        arcProgress = Math.max(0, Math.min(1, arcProgress));

        if (arcProgress > 0) {
          arcsToRender.push({
            startLat: warsaw.lat,
            startLng: warsaw.lng,
            endLat: loc.lat,
            endLng: loc.lng,
            color: ['#4fc3f7', '#80d8ff'],
            initialGap: 1 - arcProgress
          });
        }

        // Highlight dot if arc has reached the destination
        if (arcProgress >= 1 || arcMasterProgress >= arcEnd) {
          pointsToRender.push({
            lat: loc.lat,
            lng: loc.lng,
            color: '#ffffff', // bright white highlight
            radius: 0.6,
            altitude: 0.02
          });
        }
      });

      myGlobe.arcsData(arcsToRender);

      // Render the points for finished arcs
      myGlobe.pointsData(pointsToRender)
        .pointLat('lat')
        .pointLng('lng')
        .pointColor('color')
        .pointAltitude('altitude')
        .pointRadius('radius')
        .pointsMerge(false);

    }, { passive: true });
  }

});
