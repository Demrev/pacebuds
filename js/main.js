/* ============================================================
   PaceBuds — main.js
   All interactive functionality for the campaign landing page
   ============================================================ */

gsap.registerPlugin(ScrollTrigger);

/* ─────────────────────────────────────────
   HERO ENTRANCE ANIMATION
───────────────────────────────────────── */
gsap.set('.hero-visual', { x: 60 });

const heroTl = gsap.timeline({ delay: 0.2 });
heroTl
  .to('.hero-visual',   { opacity: 1, x: 0, duration: 1.1, ease: 'power3.out' }, 0)
  .to('.hero-tag',      { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, 0.3)
  .to('.hero-headline', { opacity: 1, y: 0, duration: 1,   ease: 'power3.out' }, 0.5)
  .to('.hero-sub',      { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, 0.75)
  .to('.hero-actions',  { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 0.9);

/* ─────────────────────────────────────────
   SCROLL REVEAL
───────────────────────────────────────── */
gsap.utils.toArray('.reveal').forEach(el => {
  gsap.to(el, {
    opacity: 1, y: 0, duration: 0.95, ease: 'power3.out',
    scrollTrigger: { trigger: el, start: 'top 88%', once: true }
  });
});

/* ─────────────────────────────────────────
   NAV — Scrolled State
───────────────────────────────────────── */
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 50);
});

/* ─────────────────────────────────────────
   HAMBURGER MENU
───────────────────────────────────────── */
const ham = document.getElementById('hamburger');
const mob = document.getElementById('mobileMenu');

ham.addEventListener('click', () => {
  ham.classList.toggle('active');
  mob.classList.toggle('open');
  document.body.style.overflow = mob.classList.contains('open') ? 'hidden' : '';
});

function closeMobile() {
  ham.classList.remove('active');
  mob.classList.remove('open');
  document.body.style.overflow = '';
}

/* ─────────────────────────────────────────
   PROMO VIDEO — Thumbnail + Play
───────────────────────────────────────── */
(function () {
  const realVideo   = document.getElementById('realVideo');
  const placeholder = document.getElementById('videoPlaceholder');
  const canvas      = document.getElementById('videoThumb');
  const durBadge    = document.getElementById('videoDuration');
  const ctx         = canvas.getContext('2d');
  let thumbDrawn    = false;

  /* Format seconds → M:SS or H:MM:SS */
  function fmtDur(s) {
    const h   = Math.floor(s / 3600);
    const m   = Math.floor((s % 3600) / 60);
    const sec = Math.floor(s % 60);
    if (h > 0) return h + ':' + String(m).padStart(2,'0') + ':' + String(sec).padStart(2,'0');
    return m + ':' + String(sec).padStart(2,'0');
  }

  /* Draw first frame onto canvas */
  function drawThumb() {
    if (thumbDrawn) return;
    try {
      canvas.width  = realVideo.videoWidth  || 1280;
      canvas.height = realVideo.videoHeight || 720;
      ctx.drawImage(realVideo, 0, 0, canvas.width, canvas.height);
      const px = ctx.getImageData(0, 0, 1, 1).data;
      if (px[0] === 0 && px[1] === 0 && px[2] === 0 && px[3] === 0) return; // blank frame
      thumbDrawn = true;
    } catch (e) {
      // Cross-origin or decode error — fallback bg stays visible
    }
  }

  /* Once metadata is ready, seek to 0.1s to get a real frame */
  realVideo.addEventListener('loadedmetadata', () => {
    realVideo.currentTime = 0.1;
    if (realVideo.duration && isFinite(realVideo.duration)) {
      durBadge.textContent = fmtDur(realVideo.duration);
      durBadge.classList.add('visible');
    }
  });

  /* Draw the frame after seek */
  realVideo.addEventListener('seeked', () => {
    drawThumb();
    if (!thumbDrawn) return;
    realVideo.currentTime = 0; // reset so playback starts from beginning
  });

  /* Fallback: try on canplay too */
  realVideo.addEventListener('canplay', drawThumb);

  /* Click → hide placeholder, play video from start */
  window.loadVideo = function () {
    placeholder.style.display = 'none';
    realVideo.style.display   = 'block';
    realVideo.currentTime     = 0;
    realVideo.play().catch(() => {});
  };
})();

/* ─────────────────────────────────────────
   PODCAST AUDIO PLAYER
───────────────────────────────────────── */
const audio     = document.getElementById('native-audio');
const progress  = document.getElementById('progressBar');
const curTime   = document.getElementById('currentTime');
const durTime   = document.getElementById('duration');
const volSlider = document.getElementById('volumeSlider');
const playIcon  = document.getElementById('playIcon');
let isPlaying   = false;

/* Format seconds → M:SS */
function fmt(s) {
  return Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
}

/* Toggle play / pause */
function togglePlay() {
  if (isPlaying) {
    audio.pause();
    playIcon.innerHTML = '<path d="M8 5v14l11-7z"/>';
  } else {
    audio.play().catch(() => showToast('Add your audio file to hear the podcast!'));
    playIcon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
  }
  isPlaying = !isPlaying;
}

/* Update progress bar and time display */
audio.addEventListener('timeupdate', () => {
  if (!audio.duration) return;
  progress.value = (audio.currentTime / audio.duration) * 100;
  curTime.textContent = fmt(audio.currentTime);
});

/* Show total duration once loaded */
audio.addEventListener('loadedmetadata', () => {
  durTime.textContent = fmt(audio.duration);
});

/* Reset to start when track ends */
audio.addEventListener('ended', () => {
  isPlaying = false;
  playIcon.innerHTML = '<path d="M8 5v14l11-7z"/>';
  progress.value = 0;
  curTime.textContent = '0:00';
});

/* Scrubbing */
progress.addEventListener('input', () => {
  if (audio.duration) audio.currentTime = (progress.value / 100) * audio.duration;
});

/* Volume */
volSlider.addEventListener('input', () => {
  audio.volume = volSlider.value / 100;
});

/* Skip forward / back 15 seconds */
function skipAudio(s) {
  audio.currentTime = Math.max(0, Math.min(audio.duration || 0, audio.currentTime + s));
}

/* ─────────────────────────────────────────
   CONTACT FORM
───────────────────────────────────────── */
function handleSubmit(e) {
  e.preventDefault();
  showToast("✓ You're on the list! We'll be in touch soon.");
  e.target.reset();
}

/* ─────────────────────────────────────────
   TOAST NOTIFICATION
───────────────────────────────────────── */
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 4000);
}