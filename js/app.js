// js/app.js
/* Main application controller */
(() => {
  const { recipientName, senderName, birthdayDate, password, passwordHint, mainTitle, birthdayMessage, finalMessage, musicUrl, photos } = birthdayConfig;

  const screens = Array.from(document.querySelectorAll('.screen'));
  let currentIndex = 0;
  let isAnimating = false;

  const progressBar = document.getElementById('progressBar');
  const updateProgress = () => {
    const percent = ((currentIndex) / (screens.length - 1)) * 100;
    progressBar.style.width = `${percent}%`;
  };

  const showScreen = (index) => {
    if (isAnimating || index < 0 || index >= screens.length) return;
    isAnimating = true;
    const prev = screens[currentIndex];
    const next = screens[index];
    // Instant swap – hide previous, show next immediately
    prev.classList.add('hidden');
    next.classList.remove('hidden');
    currentIndex = index;
    updateProgress();
    isAnimating = false;
  };

  // ---------- Entrance ----------
  const passwordInput = document.getElementById('passwordInput');
  const unlockBtn = document.getElementById('unlockBtn');
  const errorMsg = document.getElementById('errorMsg');
  const hintText = document.getElementById('hintText');
  const togglePwd = document.getElementById('togglePwd');

  hintText.textContent = `Gợi ý: ${passwordHint}`;

  const tryUnlock = () => {
    if (passwordInput.value === password) {
      errorMsg.textContent = '';
      // Populate cover screen values
      document.getElementById('coverName').textContent = recipientName;
      document.getElementById('coverDate').textContent = birthdayDate;
      document.getElementById('coverTitle').textContent = mainTitle;
      // Transition to cover
      showScreen(1);
    } else {
      errorMsg.textContent = "Oops! Đó không phải mật khẩu đúng. Vui lòng thử lại!";
    }
  };

  unlockBtn.addEventListener('click', tryUnlock);
  passwordInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') tryUnlock(); });
  togglePwd.addEventListener('click', () => {
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;
    togglePwd.textContent = type === 'password' ? '👁️' : '🙈';
  });

  // ---------- Cover ----------
  const enterStoryBtn = document.getElementById('enterStoryBtn');
  enterStoryBtn.addEventListener('click', () => showScreen(2));

  // Cover portrait click-to-zoom
  const coverPortrait = document.getElementById('coverPortrait');
  if (coverPortrait) {
    coverPortrait.addEventListener('click', () => {
      const zoom = document.createElement('div');
      zoom.className = 'cover-zoom';
      zoom.innerHTML = `<img src="${coverPortrait.src}" alt="Ảnh phóng to" />`;
      zoom.addEventListener('click', () => zoom.remove());
      document.body.appendChild(zoom);
    });
  }

  // ---------- Archive ----------
  const backFromArchive = document.getElementById('backFromArchive');
  const toLetterBtn = document.getElementById('toLetterBtn');
  backFromArchive.addEventListener('click', () => showScreen(1));
  toLetterBtn.addEventListener('click', () => showScreen(3));

  // Render gallery (delegated to gallery.js) – after screen shown, gallery.js will init.

  // ---------- Letter ----------
  const letterContent = document.getElementById('letterContent');
  const replayLetterBtn = document.getElementById('replayLetterBtn');
  const toFinaleBtn = document.getElementById('toFinaleBtn');

  const typeWriter = (text, element, speed = 30) => {
    element.innerHTML = '';
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        element.innerHTML += text.charAt(i);
        i++;
      } else {
        clearInterval(timer);
        isAnimating = false; // allow navigation after typing finishes
      }
    }, speed);
  };

  const startLetter = () => {
    if (isAnimating) return;
    isAnimating = true;
    typeWriter(birthdayMessage, letterContent);
  };

  // Start typing when letter screen becomes active
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(m => {
      if (m.attributeName === 'class') {
        if (!screens[3].classList.contains('hidden')) {
          startLetter();
        }
      }
    });
  });
  observer.observe(screens[3], { attributes: true });

  replayLetterBtn.addEventListener('click', () => {
    if (isAnimating) return;
    startLetter();
  });
  toFinaleBtn.addEventListener('click', () => showScreen(4));

  // ---------- Finale ----------
  const giftBox = document.getElementById('giftBox');
  const finalMessageContainer = document.getElementById('finalMessage');
  const finalText = document.getElementById('finalText');
  const signature = document.getElementById('signature');
  const restartBtn = document.getElementById('restartBtn');

  giftBox.addEventListener('click', () => {
    if (giftBox.classList.contains('open')) return;
    giftBox.classList.add('open');
    finalText.textContent = finalMessage;
    signature.textContent = `— ${senderName}`;
    finalMessageContainer.classList.remove('hidden');
    launchConfetti();
  });

  restartBtn.addEventListener('click', () => {
    // Reset state and go back to entrance
    giftBox.classList.remove('open');
    finalMessageContainer.classList.add('hidden');
    showScreen(0);
  });

  // Simple confetti – reuse function from previous project (lightweight)
  function launchConfetti() {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.pointerEvents = 'none';
    canvas.style.top = 0;
    canvas.style.left = 0;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    const particles = [];
    const colors = ["#F4B6CC", "#FFF7FA", "#FFD1DC"];
    const max = 120;
    for (let i = 0; i < max; i++) {
      const size = Math.random() * 6 + 4;
      particles.push({
        x: Math.random() * canvas.width,
        y: -size,
        vy: Math.random() * 3 + 2,
        vx: Math.random() * 2 - 1,
        size,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vr: Math.random() * 4 - 2,
      });
    }
    function render() {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      particles.forEach(p => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation * Math.PI/180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
        ctx.restore();
        p.y += p.vy;
        p.x += p.vx;
        p.rotation += p.vr;
      });
      for (let i = particles.length-1; i>=0; i--) {
        if (particles[i].y - particles[i].size > canvas.height) particles.splice(i,1);
      }
      if (particles.length) requestAnimationFrame(render);
      else setTimeout(()=>canvas.remove(),2000);
    }
    render();
  }

  // Initialize gallery (gallery.js will expose initGallery)
  if (typeof initGallery === 'function') {
    initGallery(photos);
  }

  // Initialize audio (audio.js will expose initAudio)
  if (typeof initAudio === 'function') {
    initAudio(musicUrl);
  }

  // Initial progress bar
  updateProgress();
})();
