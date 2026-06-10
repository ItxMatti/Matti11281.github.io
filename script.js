/**
 * WORLD-CLASS PORTFOLIO ANIMATIONS
 * Powered by GSAP, ScrollTrigger, Lenis, SplitType & Interactive Physics
 */

// 1. REGISTER GSAP PLUGINS
gsap.registerPlugin(ScrollTrigger);

// 2. INITIALIZE LENIS SMOOTH SCROLL
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  direction: 'vertical',
  gestureDirection: 'vertical',
  smooth: true,
  mouseMultiplier: 1,
  smoothTouch: false,
  touchMultiplier: 2,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Integrate Lenis with GSAP ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0, 0);

// 3. TEXT SCRAMBLE / CYBER GLITCH EFFECT CLASS
class TextScrambler {
  constructor(el) {
    this.el = el;
    this.chars = '!<>-_\\/[]{}—=+*^?#________';
    this.update = this.update.bind(this);
  }
  
  setText(newText) {
    const oldText = this.el.textContent.trim();
    const length = Math.max(oldText.length, newText.length);
    const promise = new Promise((resolve) => this.resolve = resolve);
    this.queue = [];
    
    for (let i = 0; i < length; i++) {
      const from = oldText[i] || '';
      const to = newText[i] || '';
      const start = Math.floor(Math.random() * 20);
      const end = start + Math.floor(Math.random() * 20);
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
    
    for (let i = 0, n = this.queue.length; i < n; i++) {
      let { from, to, start, end, char } = this.queue[i];
      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.randomChar();
          this.queue[i].char = char;
        }
        output += `<span class="scramble-char" style="color:var(--accent-cyan);opacity:0.8">${char}</span>`;
      } else {
        output += from;
      }
    }
    
    this.el.innerHTML = output;
    
    if (complete === this.queue.length) {
      this.resolve();
    } else {
      this.frameRequest = requestAnimationFrame(this.update);
      this.frame++;
    }
  }
  
  randomChar() {
    return this.chars[Math.floor(Math.random() * this.chars.length)];
  }
}

// 4. PRELOADER & INTERACTIVE COMPONENTS LOAD
document.addEventListener("DOMContentLoaded", () => {

  // Split text into characters for advanced entry animation
  const splitTexts = document.querySelectorAll('.split-text');
  const splits = [];

  splitTexts.forEach(text => {
    // Make visible right before splitting to avoid FOUC
    text.style.visibility = 'visible';
    text.style.opacity = '1';
    const split = new SplitType(text, { types: 'words, chars' });
    splits.push(split);

    // Set initial state for characters (fade/skew transition in)
    gsap.set(split.chars, {
      y: 40,
      opacity: 0,
      rotateX: -90
    });
  });

  // INITIAL HERO ANIMATION TIMELINE
  const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

  tl.to('.navbar', {
    y: 0,
    opacity: 1,
    duration: 1,
    ease: "power3.out"
  })
    .to('.hero-badge', {
      y: 0,
      opacity: 1,
      duration: 0.8
    }, "-=0.5")
    .to(splits[0].chars, { // "Hi, I'm Matti Ur Rehman"
      y: 0,
      opacity: 1,
      rotateX: 0,
      stagger: 0.025,
      duration: 1
    }, "-=0.6")
    .to(splits[1].chars, { // "Full-Stack Developer"
      y: 0,
      opacity: 1,
      rotateX: 0,
      stagger: 0.015,
      duration: 0.8
    }, "-=0.8")
    .fromTo('.hero-sub',
      { y: 25, opacity: 0 },
      { y: 0, opacity: 1, duration: 1 },
      "-=0.6"
    )
    .fromTo('.hero-buttons a',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.1, duration: 0.8 },
      "-=0.8"
    )
    .fromTo('.hero-stats',
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 1, onComplete: triggerCounters },
      "-=0.5"
    )
    .fromTo('.hero-avatar-wrapper',
      { scale: 0.85, opacity: 0, rotation: -8 },
      { scale: 1, opacity: 1, rotation: 0, duration: 1.5, ease: "elastic.out(1, 0.6)" },
      "-=1.5"
    )
    .fromTo('.floating-badge',
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, stagger: 0.08, duration: 0.8, ease: "back.out(1.7)" },
      "-=1.2"
    );

  // 5. SCROLL TRIGGER ANIMS

  // Animate non-hero Section Titles on Scroll
  splits.slice(2).forEach(split => {
    gsap.to(split.chars, {
      scrollTrigger: {
        trigger: split.elements[0],
        start: "top 85%",
      },
      y: 0,
      opacity: 1,
      rotateX: 0,
      stagger: 0.018,
      duration: 0.8,
      ease: "power3.out"
    });
  });

  // Fade Up Elements (Cards, Tags, Timeline items)
  const fadeUpElements = gsap.utils.toArray('.gsap-fade-up');
  fadeUpElements.forEach(el => {
    gsap.set(el, { visibility: 'visible', opacity: 0, y: 40 });

    gsap.to(el, {
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        toggleActions: "play none none reverse"
      },
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: "power3.out"
    });
  });

  // Skill Tags Cascade Trigger
  const skillCategories = document.querySelectorAll('.skill-category');
  skillCategories.forEach(cat => {
    const tags = cat.querySelectorAll('.skill-tag');
    gsap.fromTo(tags,
      { y: 15, opacity: 0, scale: 0.9 },
      {
        scrollTrigger: {
          trigger: cat,
          start: "top 80%",
        },
        y: 0,
        opacity: 1,
        scale: 1,
        stagger: 0.04,
        duration: 0.55,
        ease: "back.out(1.4)"
      }
    );
  });

  // Parallax Orbs and Background Elements
  const parallaxElements = document.querySelectorAll('[data-speed]');
  parallaxElements.forEach(el => {
    const speed = parseFloat(el.getAttribute('data-speed'));
    gsap.to(el, {
      y: () => (1 - speed) * ScrollTrigger.maxScroll(window),
      ease: "none",
      scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: true
      }
    });
  });

  // Scroll Progress Bar
  gsap.to('#scroll-progress-bar', {
    width: "100%",
    ease: "none",
    scrollTrigger: {
      trigger: "body",
      start: "top top",
      end: "bottom bottom",
      scrub: 0.2
    }
  });

  // Navbar Background Blur on Scroll Trigger
  ScrollTrigger.create({
    trigger: "body",
    start: "40px top",
    toggleClass: { targets: ".navbar", className: "scrolled" }
  });

  // Scroll to Top Button Visibility Trigger
  ScrollTrigger.create({
    trigger: "#about",
    start: "top center",
    toggleClass: { targets: "#scroll-to-top", className: "visible" }
  });

  document.getElementById('scroll-to-top').addEventListener('click', () => {
    lenis.scrollTo(0, { duration: 1.5 });
  });

  // Nav Links smooth scroll with Lenis
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        lenis.scrollTo(target, { duration: 1.2, offset: -50 });

        // Close mobile menu if open
        const navLinks = document.getElementById('nav-links');
        const hamburger = document.getElementById('hamburger');
        if (navLinks && hamburger) {
          navLinks.classList.remove('open');
          hamburger.classList.remove('active');
        }
      }
    });
  });

  // 6. FLOATING LABEL FORM CONTROL (Premium State Management)
  const formGroups = document.querySelectorAll('.form-group');

  formGroups.forEach(group => {
    const input = group.querySelector('input, textarea');
    
    if (input) {
      input.addEventListener('focus', () => {
        group.classList.add('focused');
      });

      input.addEventListener('blur', () => {
        group.classList.remove('focused');
        if (input.value.trim() !== '') {
          group.classList.add('filled');
        } else {
          group.classList.remove('filled');
        }
      });

      input.addEventListener('input', () => {
        if (input.value.trim() !== '') {
          group.classList.add('filled');
        } else {
          group.classList.remove('filled');
        }
      });

      // Check initial state
      if (input.value.trim() !== '') {
        group.classList.add('filled');
      }
    }
  });

  // 7. MAGNETIC BUTTON EFFECT
  const magneticButtons = document.querySelectorAll('.magnetic-btn');

  magneticButtons.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      if (window.innerWidth < 768) return; // Disable on mobile

      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      gsap.to(btn, {
        x: x * 0.25,
        y: y * 0.25,
        duration: 0.3,
        ease: "power2.out",
        overwrite: 'auto'
      });
    });

    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: "elastic.out(1, 0.3)",
        overwrite: 'auto'
      });
    });
  });

  // 8. RIPPLE CLICK EFFECT (for buttons)
  const buttons = document.querySelectorAll('.btn, .contact-card, .skill-tag');

  buttons.forEach(btn => {
    btn.addEventListener('click', function (e) {
      if (this.closest('.contact-form')) return; // Skip form buttons

      const ripple = document.createElement('div');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      ripple.className = 'ripple';

      this.appendChild(ripple);

      setTimeout(() => ripple.remove(), 600);
    });
  });

  // 9. HOVER ELEVATION EFFECT
  const hoverElements = document.querySelectorAll('.glass-card, .about-card, .skill-category, .project-card');

  hoverElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      gsap.to(el, {
        y: -5,
        duration: 0.3,
        ease: "power2.out",
        overwrite: 'auto'
      });
    });

    el.addEventListener('mouseleave', () => {
      gsap.to(el, {
        y: 0,
        duration: 0.5,
        ease: "power3.out",
        overwrite: 'auto'
      });
    });
  });

  // 10. SCROLL ANIMATION FOR SECTION ELEMENTS
  const sectionOrbs = document.querySelectorAll('.section-orb');

  sectionOrbs.forEach(orb => {
    gsap.fromTo(orb,
      { opacity: 0, scale: 0.8 },
      {
        scrollTrigger: {
          trigger: orb.closest('.section'),
          start: "top 70%",
        },
        opacity: 0.2,
        scale: 1,
        duration: 1.2,
        ease: "power2.out"
      }
    );
  });

  // 11. FLOATING ANIMATION TRIGGER ON SCROLL
  const floatingElements = document.querySelectorAll('[data-speed]');

  floatingElements.forEach(el => {
    const originalY = gsap.getProperty(el, 'y');
    gsap.fromTo(el,
      { y: 30 },
      {
        y: 0,
        scrollTrigger: {
          trigger: el.closest('.section'),
          start: "top 60%",
        },
        duration: 1.5,
        ease: "power2.out"
      }
    );
  });

});

// 12. 3D CARD PERSPECTIVE TILT & Specular Glare
const cards = document.querySelectorAll('.glass-card');
cards.forEach(card => {
  // Inject holographic specular glare overlay
  if (!card.querySelector('.holo-glare')) {
    const glare = document.createElement('div');
    glare.className = 'holo-glare';
    card.appendChild(glare);
  }

  card.addEventListener('mousemove', (e) => {
    if (window.innerWidth < 768) return; // Disable on mobile

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Normalize coordinates (-0.5 to 0.5)
    const xc = ((x / rect.width) - 0.5);
    const yc = ((y / rect.height) - 0.5);

    // Dynamic HSL positioning custom properties
    card.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
    card.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);

    // Dynamic rotation transformations
    const rotateX = yc * -15; // Max X rotation
    const rotateY = xc * 15;  // Max Y rotation

    gsap.to(card, {
      rotateX: rotateX,
      rotateY: rotateY,
      transformPerspective: 1000,
      duration: 0.35,
      ease: "power2.out"
    });
  });

  card.addEventListener('mouseleave', () => {
    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.65,
      ease: "power3.out"
    });
  });
});

// 13. MOUSE TRACKING CURSOR
const cursor = document.getElementById('cursor');
const follower = document.getElementById('cursor-follower');

let cx = 0, cy = 0;
let fx = 0, fy = 0;

if (cursor && follower) {
  window.addEventListener('mousemove', e => {
    cx = e.clientX;
    cy = e.clientY;
    
    // Immediate cursor coordinates update
    gsap.to(cursor, { x: cx, y: cy, duration: 0 });
  });

  // Interpolated follower movement for premium weight feel
  gsap.ticker.add(() => {
    fx += (cx - fx) * 0.15;
    fy += (cy - fy) * 0.15;
    gsap.set(follower, { x: fx, y: fy });
  });

  // Bind hover updates
  const hoverElements = document.querySelectorAll('a, button, .glass-card, .skill-tag');
  hoverElements.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
}

// 14. COUNTER COUNTS ANIMATION
function triggerCounters() {
  const counters = document.querySelectorAll('.stat-num');
  counters.forEach(counter => {
    const target = parseInt(counter.getAttribute('data-target'));
    gsap.to(counter, {
      innerHTML: target,
      duration: 2.2,
      ease: "power3.out",
      snap: { innerHTML: 1 },
      onUpdate: function () {
        counter.innerHTML = Math.ceil(this.targets()[0].innerHTML);
      }
    });
  });
}

// 15. MOBILE MENU HAMBURGER SWITCH
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('open');
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.navbar')) {
      hamburger.classList.remove('active');
      navLinks.classList.remove('open');
    }
  });
}

// 16. CANVAS BACKGROUND PARTICLES & Trail Unified Particles
const canvas = document.getElementById('particles-canvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let particles = [];
  let trailParticles = [];
  let W, H;

  // Adapt particle density depending on mobile
  const particleCount = window.innerWidth < 768 ? 25 : 55;

  let mouse = { x: null, y: null, radius: 140 };

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;

    // Unified cursor trail generation
    if (Math.random() < 0.45) {
      trailParticles.push({
        x: e.clientX,
        y: e.clientY,
        r: Math.random() * 2.5 + 1.2,
        alpha: 0.8,
        dx: (Math.random() - 0.5) * 1.5,
        dy: (Math.random() - 0.5) * 1.5,
        color: Math.random() > 0.5 ? '139,92,246' : '6,182,212'
      });
    }
  });

  window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
  });

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function createParticle() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.6 + 0.4,
      dx: (Math.random() - 0.5) * 0.25,
      dy: (Math.random() - 0.5) * 0.25,
      alpha: Math.random() * 0.35 + 0.1,
      color: Math.random() > 0.5 ? '139,92,246' : '6,182,212'
    };
  }

  for (let i = 0; i < particleCount; i++) particles.push(createParticle());

  function drawParticles() {
    ctx.clearRect(0, 0, W, H);

    // Draw background particles
    particles.forEach(p => {
      // Mouse gravity interactive physics
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const distSq = dx * dx + dy * dy;
        const dist = Math.sqrt(distSq);

        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius; // scale 0 to 1
          // Attract particles slowly to mouse coordinates
          p.x += (dx / dist) * force * 0.65;
          p.y += (dy / dist) * force * 0.65;

          // Connect interactive web fibers to cursor
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(${p.color}, ${0.1 * force})`;
          ctx.lineWidth = 0.4;
          ctx.stroke();
        }
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
      ctx.fill();

      // Move particles
      p.x += p.dx;
      p.y += p.dy;

      // Bounce limits
      if (p.x < 0 || p.x > W) p.dx *= -1;
      if (p.y < 0 || p.y > H) p.dy *= -1;
    });

    // Draw connections between neighboring background particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distSq = dx * dx + dy * dy;

        if (distSq < 9000) { // 95px distance max
          const dist = Math.sqrt(distSq);
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(139,92,246,${0.065 * (1 - dist / 95)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    // Process and draw mouse trail particles
    for (let i = trailParticles.length - 1; i >= 0; i--) {
      const p = trailParticles[i];
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
      ctx.fill();

      p.x += p.dx;
      p.y += p.dy;
      p.alpha -= 0.022; // fade particle speed

      if (p.alpha <= 0) {
        trailParticles.splice(i, 1);
      }
    }

    requestAnimationFrame(drawParticles);
  }
  drawParticles();
}

// 17. CONTACT FORM SUBMISSION WITH PREMIUM SUCCESS FEEDBACK
const form = document.getElementById('contact-form');
const sendBtn = document.getElementById('send-btn');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formNotice = document.getElementById('form-notice');
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    if (!name || !email || !message) {
      showNotice('Please fill in all fields', 'error');
      return;
    }

    sendBtn.innerHTML = '<span>Sending...</span>';
    sendBtn.disabled = true;

    try {
      // The form will be submitted to Formspree automatically
      // We just need to show a nice success animation
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        gsap.to(sendBtn, {
          backgroundColor: '#10b981',
          duration: 0.3
        });
        sendBtn.innerHTML = '<span>✅ Message Sent!</span>';
        showNotice('Your message has been sent successfully! I\'ll get back to you soon.', 'success');
        form.reset();

        // Clear input focused classes
        document.querySelectorAll('.form-group').forEach(group => {
          group.classList.remove('focused', 'filled');
        });

        setTimeout(() => {
          gsap.to(sendBtn, {
            backgroundColor: '',
            clearProps: "backgroundColor",
            duration: 0.3
          });
          sendBtn.innerHTML = '<span>Send a Message</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';
          sendBtn.disabled = false;
        }, 3000);
      } else {
        showNotice('There was an error. Please try again.', 'error');
        sendBtn.innerHTML = '<span>Send a Message</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';
        sendBtn.disabled = false;
      }
    } catch (error) {
      console.error('Form submission error:', error);
      showNotice('There was an error sending your message. Please try again.', 'error');
      sendBtn.innerHTML = '<span>Send a Message</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';
      sendBtn.disabled = false;
    }
  });

  function showNotice(message, type) {
    const notice = document.getElementById('form-notice');
    if (notice) {
      notice.textContent = message;
      notice.style.display = 'block';
      notice.style.color = type === 'success' ? 'var(--accent-cyan)' : '#ff6b6b';
      
      // Auto hide after 5 seconds
      setTimeout(() => {
        notice.style.display = 'none';
      }, 5000);
    }
  }
}

// 18. VIEWPORT HEIGHT FIX FOR MOBILE (handles address bar)
function setViewportHeight() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}
setViewportHeight();
window.addEventListener('resize', setViewportHeight);

// 19. TOUCH OPTIMIZATION
if (window.matchMedia('(pointer: coarse)').matches) {
  // Add touch-specific optimizations
  document.body.classList.add('touch-device');
  
  // Increase touch target sizes
  const buttons = document.querySelectorAll('button, a');
  buttons.forEach(btn => {
    const rect = btn.getBoundingClientRect();
    if (rect.width < 44 || rect.height < 44) {
      btn.style.minWidth = '44px';
      btn.style.minHeight = '44px';
    }
  });
}