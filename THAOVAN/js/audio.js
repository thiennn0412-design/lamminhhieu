// js/audio.js
// Simple background music player with play/pause, volume and graceful fallback.

function initAudio(src) {
  const player = document.getElementById('audioPlayer');
  const playBtn = document.getElementById('playPauseBtn');
  const volumeSlider = document.getElementById('volumeSlider');
  const status = document.getElementById('audioStatus');

  const audio = new Audio();
  audio.loop = true;
  audio.src = src;

  // Handle loading errors gracefully
  audio.addEventListener('error', () => {
    status.textContent = 'Không có nhạc';
    playBtn.disabled = true;
    volumeSlider.disabled = true;
  });

  let isPlaying = false;
  playBtn.addEventListener('click', () => {
    if (isPlaying) {
      audio.pause();
      status.textContent = 'Tắt';
    } else {
      // Require user interaction first – this function is called after a click in the app flow.
      audio.play().catch(() => {
        // If autoplay blocked, just set status.
        status.textContent = 'Không khả thi';
      });
      status.textContent = 'Phát';
    }
    isPlaying = !isPlaying;
    playBtn.textContent = isPlaying ? '❚❚' : '►';
  });

  // Volume control (0‑1)
  volumeSlider.value = 0.5;
  audio.volume = 0.5;
  volumeSlider.addEventListener('input', () => {
    audio.volume = volumeSlider.value;
  });

  // Expose for debugging if needed
  window.backgroundAudio = audio;
}

if (typeof window !== 'undefined') {
  window.initAudio = initAudio;
}
