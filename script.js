/* script.js */
/* Configuration – designers only need to edit this block */
const CONFIG = {
    recipientName: "My Special One",
    senderName: "Little Web Studio",
    birthday: "June 12, 2024",
    password: "1410",
    wishMessage: "Happy Birthday! Chúc cậu có một ngày thật đặc biệt, luôn vui vẻ, bình an và gặp thật nhiều điều tuyệt vời. Mong rằng tuổi mới sẽ mang đến cho cậu những kỷ niệm đáng nhớ.",
    // Provide paths relative to the project root
    albumImages: [
        { src: "images/photo1.jpg", caption: "Memory 1" },
        { src: "images/photo2.jpg", caption: "Memory 2" },
        { src: "images/photo3.jpg", caption: "Memory 3" },
        // Add up to 6 images
    ],
    musicSrc: "music/background.mp3",
};

/* ------- Helper Functions ------- */
function $(selector) { return document.querySelector(selector); }
function $$(selector) { return document.querySelectorAll(selector); }

/* ------- Password Gate Logic ------- */
function initGate() {
    const passwordInput = $('#passwordInput');
    const unlockBtn = $('#unlockBtn');
    const errorMsg = $('#gateError');
    const gate = $('#gate');
    const main = $('#mainContent');
    const togglePwd = $('#togglePassword');

    // Toggle password visibility
    togglePwd.addEventListener('click', () => {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        togglePwd.textContent = type === 'password' ? '👁️' : '🙈';
    });

    function unlock() {
        if (passwordInput.value === CONFIG.password) {
            errorMsg.textContent = '';
            gate.classList.add('hidden');
            main.classList.remove('hidden');
            // Populate hero texts
            $('#heroGreeting').textContent = `Happy Birthday, ${CONFIG.recipientName}!`;
            $('#heroRecipient').textContent = CONFIG.recipientName;
            $('#heroDate').textContent = CONFIG.birthday;
            // Set up album
            renderAlbum();
            // Set up music
            initMusic();
        } else {
            errorMsg.textContent = "Mật khẩu sai rồi, thử lại nhé!";
        }
    }

    unlockBtn.addEventListener('click', unlock);
    passwordInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') unlock();
    });
}

/* ------- Envelope Logic ------- */
function initEnvelope() {
    const envelope = $('#envelopeWrapper');
    const envelopeDiv = $('#envelopeClosed');
    const letter = $('#letterContent');
    const letterText = $('#letterText');
    const readAgainBtn = $('#readAgainBtn');

    envelopeDiv.addEventListener('click', () => {
        if (!envelopeDiv.classList.contains('open')) {
            envelopeDiv.classList.add('open');
            letterText.textContent = CONFIG.wishMessage;
            letter.classList.remove('hidden');
            // Small delay for fade-in
            setTimeout(() => letter.classList.add('visible'), 300);
        }
    });

    readAgainBtn.addEventListener('click', () => {
        // Reset to closed state
        envelopeDiv.classList.remove('open');
        letter.classList.remove('visible');
        setTimeout(() => letter.classList.add('hidden'), 300);
    });
}

/* ------- Album / Lightbox Logic ------- */
function renderAlbum() {
    const grid = $('#polaroidGrid');
    CONFIG.albumImages.forEach((img, idx) => {
        const div = document.createElement('div');
        div.className = 'polaroid';
        div.innerHTML = `
            <img src="${img.src}" alt="${img.caption}" data-index="${idx}" />
            <caption>${img.caption}</caption>
        `;
        grid.appendChild(div);
    });
    initLightbox();
}

function initLightbox() {
    // Create lightbox element once
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = '<img src="" alt="" />';
    document.body.appendChild(lightbox);
    const imgEl = lightbox.querySelector('img');

    $$(".polaroid img").forEach(img => {
        img.addEventListener('click', (e) => {
            imgEl.src = e.target.src;
            lightbox.classList.add('visible');
        });
    });
    lightbox.addEventListener('click', () => lightbox.classList.remove('visible'));
}

/* ------- Gift Box Logic (confetti) ------- */
function initGiftBox() {
    const box = $('#giftBox');
    const message = $('#giftMessage');
    const finalWish = $('#finalWish');

    box.addEventListener('click', () => {
        if (!box.classList.contains('open')) {
            box.classList.add('open');
            finalWish.textContent = CONFIG.wishMessage;
            message.classList.remove('hidden');
            launchConfetti();
        }
    });
}

function launchConfetti() {
    // Simple canvas confetti – lightweight implementation
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
    const colors = ['#F4B6CC', '#FFF7FA', '#FFD1DC'];
    const maxParticles = 150;

    function createParticle() {
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
    for (let i = 0; i < maxParticles; i++) createParticle();

    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation * Math.PI / 180);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            ctx.restore();
            p.y += p.vy;
            p.x += p.vx;
            p.rotation += p.vr;
        });
        // Remove particles that fell off screen
        for (let i = particles.length - 1; i >= 0; i--) {
            if (particles[i].y - particles[i].size > canvas.height) particles.splice(i, 1);
        }
        if (particles.length > 0) requestAnimationFrame(render);
        else setTimeout(() => canvas.remove(), 2000);
    }
    render();
}

/* ------- Music Control ------- */
function initMusic() {
    const btn = $('#musicToggle');
    const audio = $('#bgMusic');
    audio.src = CONFIG.musicSrc;
    let playing = false;
    btn.addEventListener('click', () => {
        if (playing) {
            audio.pause();
            btn.classList.remove('playing');
            btn.setAttribute('aria-label', 'Play music');
        } else {
            audio.play().catch(() => {});
            btn.classList.add('playing');
            btn.setAttribute('aria-label', 'Pause music');
        }
        playing = !playing;
    });
}

/* ------- Initialization ------- */
document.addEventListener('DOMContentLoaded', () => {
    initGate();
    initEnvelope();
    initGiftBox();
    // Album and music are set up after successful unlock inside initGate()
});
