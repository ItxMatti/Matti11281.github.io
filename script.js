/**
 * WORLD-CLASS PORTFOLIO ANIMATIONS
 * Powered by GSAP, ScrollTrigger, Lenis, and SplitType
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

// 3. PRELOADER & TEXT SPLITTING
document.addEventListener("DOMContentLoaded", () => {

  // Split text into characters for advanced animation
  const splitTexts = document.querySelectorAll('.split-text');
  const splits = [];

  splitTexts.forEach(text => {
    // Make visible right before splitting to avoid FOUC
    text.style.visibility = 'visible';
    const split = new SplitType(text, { types: 'words, chars' });
    splits.push(split);

    // Set initial state for characters
    gsap.set(split.chars, {
      y: 50,
      opacity: 0,
      rotateX: -90
    });
  });

  // INITIAL HERO ANIMATION (Timeline)
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
      stagger: 0.02,
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
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1 },
      "-=0.6"
    )
    .fromTo('.hero-buttons a',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.1, duration: 0.8 },
      "-=0.8"
    )
    .fromTo('.hero-stats',
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 1, onComplete: triggerCounters },
      "-=0.5"
    )
    .fromTo('.hero-avatar-wrapper',
      { scale: 0.8, opacity: 0, rotation: -10 },
      { scale: 1, opacity: 1, rotation: 0, duration: 1.5, ease: "elastic.out(1, 0.5)" },
      "-=1.5"
    )
    .fromTo('.floating-badge',
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, stagger: 0.1, duration: 0.8, ease: "back.out(1.7)" },
      "-=1"
    );

  // 4. SCROLL ANIMATIONS

  // Animate Section Titles on Scroll
  splits.slice(2).forEach(split => {
    gsap.to(split.chars, {
      scrollTrigger: {
        trigger: split.elements[0],
        start: "top 85%",
      },
      y: 0,
      opacity: 1,
      rotateX: 0,
      stagger: 0.02,
      duration: 0.8,
      ease: "power3.out"
    });
  });

  // Fade Up Elements (Cards, Tags, Timeline items)
  const fadeUpElements = gsap.utils.toArray('.gsap-fade-up');
  fadeUpElements.forEach(el => {
    gsap.set(el, { visibility: 'visible', y: 50, opacity: 0 });

    gsap.to(el, {
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        toggleActions: "play none none reverse" // Allows replaying when scrolling back up
      },
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: "power3.out"
    });
  });

  // Skill Tags Cascade
  const skillCategories = document.querySelectorAll('.skill-category');
  skillCategories.forEach(cat => {
    const tags = cat.querySelectorAll('.skill-tag');
    gsap.fromTo(tags,
      { y: 20, opacity: 0, scale: 0.9 },
      {
        scrollTrigger: {
          trigger: cat,
          start: "top 80%",
        },
        y: 0,
        opacity: 1,
        scale: 1,
        stagger: 0.05,
        duration: 0.6,
        ease: "back.out(1.5)"
      }
    );
  });

  // Parallax Orbs and Background Elements
  const parallaxElements = document.querySelectorAll('[data-speed]');
  parallaxElements.forEach(el => {
    const speed = parseFloat(el.getAttribute('data-speed'));
    // Calculate movement based on speed. speed 1 = normal, > 1 = faster, < 1 = slower
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
      scrub: 0.3
    }
  });

  // Navbar Background Blur on Scroll
  ScrollTrigger.create({
    trigger: "body",
    start: "50px top",
    toggleClass: { targets: ".navbar", className: "scrolled" }
  });

  // Scroll to Top Button Visibility
  ScrollTrigger.create({
    trigger: "#about", // Show when about section is reached
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
        document.getElementById('nav-links').classList.remove('open');
        document.getElementById('hamburger').classList.remove('active');
      }
    });
  });

  // Active Nav Link Update
  const sections = document.querySelectorAll('section[id]');
  sections.forEach(sec => {
    ScrollTrigger.create({
      trigger: sec,
      start: "top 50%",
      end: "bottom 50%",
      onToggle: self => {
        if (self.isActive) {
          document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
          const link = document.querySelector(`.nav-link[href="#${sec.id}"]`);
          if (link) link.classList.add('active');
        }
      }
    });
  });
});

// 5. MAGNETIC BUTTONS EFFECT
const magneticElements = document.querySelectorAll('.magnetic-btn');

magneticElements.forEach(el => {
  el.addEventListener('mousemove', (e) => {
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.3;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.3;

    gsap.to(el, {
      x: x,
      y: y,
      duration: 0.4,
      ease: "power2.out"
    });
  });

  el.addEventListener('mouseleave', () => {
    gsap.to(el, {
      x: 0,
      y: 0,
      duration: 0.7,
      ease: "elastic.out(1, 0.3)"
    });
  });
});

// 6. CUSTOM CURSOR
const cursor = document.getElementById('cursor');
const follower = document.getElementById('cursor-follower');

if (cursor && follower) {
  let cx = 0, cy = 0;
  let fx = 0, fy = 0;

  window.addEventListener('mousemove', e => {
    cx = e.clientX;
    cy = e.clientY;

    // Immediate cursor update
    gsap.to(cursor, { x: cx, y: cy, duration: 0 });
  });

  // Smooth follower update
  gsap.ticker.add(() => {
    fx += (cx - fx) * 0.15;
    fy += (cy - fy) * 0.15;
    gsap.set(follower, { x: fx, y: fy });
  });

  // Hover states
  const hoverElements = document.querySelectorAll('a, button, .glass-card, .skill-tag');
  hoverElements.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
}

// 7. COUNTER ANIMATION
function triggerCounters() {
  const counters = document.querySelectorAll('.stat-num');
  counters.forEach(counter => {
    const target = parseInt(counter.getAttribute('data-target'));
    gsap.to(counter, {
      innerHTML: target,
      duration: 2,
      ease: "power2.out",
      snap: { innerHTML: 1 },
      onUpdate: function () {
        counter.innerHTML = Math.ceil(this.targets()[0].innerHTML);
      }
    });
  });
}
// 8. HAMBURGER MENU
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navLinks.classList.toggle('open');
});

// 9. OPTIMIZED PARTICLES CANVAS
const canvas = document.getElementById('particles-canvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let particles = [];
  let W, H;

  // Reduce particle count on mobile for performance
  const particleCount = window.innerWidth < 768 ? 30 : 60;

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
      r: Math.random() * 1.5 + 0.3,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.4 + 0.1,
      color: Math.random() > 0.5 ? '139,92,246' : '6,182,212'
    };
  }

  for (let i = 0; i < particleCount; i++) particles.push(createParticle());

  function drawParticles() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
      ctx.fill();

      p.x += p.dx;
      p.y += p.dy;

      if (p.x < 0 || p.x > W) p.dx *= -1;
      if (p.y < 0 || p.y > H) p.dy *= -1;
    });

    // Draw connections only if less than distance
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distSq = dx * dx + dy * dy; // Use squared distance for performance

        if (distSq < 10000) { // 100^2
          const dist = Math.sqrt(distSq);
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(139,92,246,${0.05 * (1 - dist / 100)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(drawParticles);
  }
  drawParticles();
}

// 10. CONTACT FORM SUBMISSION
const form = document.getElementById('contact-form');
const sendBtn = document.getElementById('send-btn');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    if (!name || !email || !message) return;

    sendBtn.innerHTML = '<span>Sending...</span>';
    sendBtn.disabled = true;

    // Simulate API call
    setTimeout(() => {
      gsap.to(sendBtn, {
        backgroundColor: '#10b981', // Success green
        duration: 0.3
      });
      sendBtn.innerHTML = '<span>✅ Message Sent!</span>';
      form.reset();

      setTimeout(() => {
        gsap.to(sendBtn, {
          backgroundColor: '', // Reset to default
          clearProps: "backgroundColor",
          duration: 0.3
        });
        sendBtn.innerHTML = '<span>Send a Message</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';
        sendBtn.disabled = false;
      }, 3000);
    }, 1500);
  });
}
