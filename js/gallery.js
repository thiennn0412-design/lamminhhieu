// js/gallery.js
// Gallery with premium lightbox — Image Quality Upgrade
// Features: lazy loading, shimmer placeholders, proper dimensions, smooth transitions

function initGallery(photos) {
  const grid = document.getElementById('galleryGrid');
  if (!grid) return;

  // Clear existing content
  grid.innerHTML = '';

  photos.forEach((p, idx) => {
    const item = document.createElement('div');
    item.className = 'gallery-item';

    // Create image with lazy loading and proper attributes
    const img = document.createElement('img');
    img.dataset.src = p.src;  // Lazy load source
    img.dataset.index = idx;
    img.alt = p.caption;
    img.className = 'img-placeholder';  // Shimmer effect while loading
    img.setAttribute('width', '400');
    img.setAttribute('height', '533');  // 3:4 ratio
    img.setAttribute('loading', 'lazy');
    img.setAttribute('decoding', 'async');

    // Caption
    const caption = document.createElement('div');
    caption.className = 'gallery-caption';
    caption.textContent = p.caption;

    item.appendChild(img);
    item.appendChild(caption);
    grid.appendChild(item);
  });

  // Initialize lazy loading
  initLazyLoading();

  // Lightbox elements
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxCounter = document.getElementById('lightboxCounter');
  const closeBtn = document.getElementById('lightboxClose');
  const prevBtn = document.getElementById('prevImg');
  const nextBtn = document.getElementById('nextImg');
  const overlay = lightbox.querySelector('.lightbox-overlay');

  let currentIdx = 0;

  function updateLightbox() {
    const photo = photos[currentIdx];
    // Fade transition
    lightboxImg.style.opacity = '0';
    setTimeout(() => {
      lightboxImg.src = photo.src;
      lightboxImg.alt = photo.caption;
      lightboxCaption.textContent = photo.caption;
      lightboxCounter.textContent = `${currentIdx + 1} / ${photos.length}`;
    }, 150);
  }

  // When lightbox image loads, fade it in
  lightboxImg.addEventListener('load', () => {
    lightboxImg.style.opacity = '1';
  });

  function openLightbox(idx) {
    currentIdx = idx;
    const photo = photos[currentIdx];
    lightboxImg.src = photo.src;
    lightboxImg.alt = photo.caption;
    lightboxCaption.textContent = photo.caption;
    lightboxCounter.textContent = `${currentIdx + 1} / ${photos.length}`;
    lightboxImg.style.opacity = '1';
    lightbox.classList.remove('hidden');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.add('hidden');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function showPrev() {
    currentIdx = (currentIdx - 1 + photos.length) % photos.length;
    updateLightbox();
  }

  function showNext() {
    currentIdx = (currentIdx + 1) % photos.length;
    updateLightbox();
  }

  // Image click handlers — delegated for lazy loaded images
  grid.addEventListener('click', (e) => {
    const img = e.target.closest('.gallery-item img');
    if (img && img.dataset.index !== undefined) {
      openLightbox(Number(img.dataset.index));
    }
  });

  closeBtn.addEventListener('click', closeLightbox);
  overlay.addEventListener('click', closeLightbox);
  prevBtn.addEventListener('click', showPrev);
  nextBtn.addEventListener('click', showNext);

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (lightbox.classList.contains('hidden')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showPrev();
    if (e.key === 'ArrowRight') showNext();
  });

  // Touch swipe support (mobile)
  let startX = null;
  lightboxImg.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
  });
  lightboxImg.addEventListener('touchend', (e) => {
    if (startX === null) return;
    const diff = e.changedTouches[0].clientX - startX;
    if (Math.abs(diff) > 40) {
      diff > 0 ? showPrev() : showNext();
    }
    startX = null;
  });
}

/**
 * Lazy Loading with IntersectionObserver
 * Images show a shimmer placeholder until they enter the viewport,
 * then load with a smooth fade-in animation.
 */
function initLazyLoading() {
  const images = document.querySelectorAll('.gallery-item img[data-src]');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          loadImage(img);
          obs.unobserve(img);
        }
      });
    }, {
      rootMargin: '100px 0px', // Start loading 100px before visible
      threshold: 0.01
    });

    images.forEach(img => observer.observe(img));
  } else {
    // Fallback for old browsers — load all immediately
    images.forEach(loadImage);
  }
}

/**
 * Load a single image from data-src and apply reveal animation
 */
function loadImage(img) {
  const src = img.dataset.src;
  if (!src) return;

  // Create a temporary image to preload
  const tempImg = new Image();
  tempImg.onload = () => {
    img.src = src;
    img.classList.remove('img-placeholder');
    img.classList.add('img-loaded');
    // Clean up data attribute
    delete img.dataset.src;
  };
  tempImg.onerror = () => {
    // If image fails to load, still remove placeholder
    img.classList.remove('img-placeholder');
    console.warn(`Failed to load image: ${src}`);
  };
  tempImg.src = src;
}

// Expose globally
if (typeof window !== 'undefined') {
  window.initGallery = initGallery;
}
