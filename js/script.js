// ---------- Message personnalisable ----------
// Modifie le texte ci-dessous pour personnaliser la surprise.
const MESSAGE = `Joyeuse fête 💖

Les tournesols tournent toujours vers leur soleil, Cubana 🌻☀️
Une peluche à câliner, et un petit tiramisu à la fraise en cadeau bien commencer la journée en douceur (je le crée vu que je n'arrive pas à en trouver) 🍓

En espérant que ça te fasse plaisir

Bisous
`;

// ---------- Coeurs flottants ----------
function spawnHearts() {
  const layer = document.getElementById('hearts');
  const emojis = ['💖', '💕', '💗', '🌸'];
  const count = window.innerWidth < 600 ? 10 : 18;
  for (let i = 0; i < count; i++) {
    const el = document.createElement('span');
    el.className = 'heart-particle';
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    el.style.left = Math.random() * 100 + 'vw';
    el.style.fontSize = 14 + Math.random() * 16 + 'px';
    el.style.setProperty('--drift', (Math.random() * 80 - 40) + 'px');
    el.style.animationDuration = 10 + Math.random() * 12 + 's';
    el.style.animationDelay = Math.random() * 14 + 's';
    layer.appendChild(el);
  }
}

// ---------- Champ de tournesols et fleurs ----------
function spawnField() {
  const field = document.getElementById('field');
  const kinds = ['🌻', '🌻', '🌸', '🌼', '🌷', '🌻'];
  const total = window.innerWidth < 600 ? 12 : 22;
  for (let i = 0; i < total; i++) {
    const el = document.createElement('span');
    el.className = 'stem-flower';
    el.textContent = kinds[Math.floor(Math.random() * kinds.length)];
    const size = 28 + Math.random() * 30;
    el.style.setProperty('--flower-size', size + 'px');
    el.style.setProperty('--sway-dur', (2.4 + Math.random() * 2) + 's');
    el.style.setProperty('--sway-delay', (Math.random() * 3) + 's');
    el.style.marginBottom = Math.random() * 10 + 'px';
    field.appendChild(el);
  }
}

// ---------- Confetti ----------
function burstConfetti(originX, originY, amount = 60) {
  const layer = document.getElementById('confettiLayer');
  const colors = ['#ff6f91', '#ffd23f', '#7dd3fc', '#a3e635', '#ff965f', '#c084fc'];
  for (let i = 0; i < amount; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.left = (originX != null ? originX : Math.random() * 100) + (originX != null ? 'px' : 'vw');
    if (originY != null) piece.style.top = originY + 'px';
    piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    piece.style.animationDuration = 2 + Math.random() * 2.5 + 's';
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    layer.appendChild(piece);
    setTimeout(() => piece.remove(), 4600);
  }
}

// ---------- Peluche à faire glisser ----------
function makePlushDraggable() {
  const plush = document.getElementById('plush');
  let dragging = false;
  let offsetX = 0, offsetY = 0;

  function start(clientX, clientY) {
    dragging = true;
    plush.classList.add('dragging');
    const rect = plush.getBoundingClientRect();
    offsetX = clientX - rect.left;
    offsetY = clientY - rect.top;
    plush.style.left = rect.left + 'px';
    plush.style.top = rect.top + 'px';
    plush.style.bottom = 'auto';
    plush.style.right = 'auto';
  }
  function move(clientX, clientY) {
    if (!dragging) return;
    const x = Math.min(Math.max(0, clientX - offsetX), window.innerWidth - plush.offsetWidth);
    const y = Math.min(Math.max(0, clientY - offsetY), window.innerHeight - plush.offsetHeight);
    plush.style.left = x + 'px';
    plush.style.top = y + 'px';
  }
  function end() {
    if (!dragging) return;
    dragging = false;
    plush.classList.remove('dragging');
  }

  plush.addEventListener('pointerdown', (e) => {
    plush.setPointerCapture(e.pointerId);
    start(e.clientX, e.clientY);
  });
  plush.addEventListener('pointermove', (e) => move(e.clientX, e.clientY));
  plush.addEventListener('pointerup', end);
  plush.addEventListener('pointercancel', end);

  plush.addEventListener('click', () => {
    const rect = plush.getBoundingClientRect();
    burstConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2, 24);
  });
}

// ---------- Spider-Man interactif ----------
function makeSpideyClickable() {
  const spidey = document.getElementById('spidey');
  spidey.addEventListener('click', (e) => {
    e.stopPropagation();
    const rect = spidey.getBoundingClientRect();
    burstConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2, 30);
    const thwip = document.createElement('div');
    thwip.textContent = 'Thwip!';
    thwip.style.position = 'fixed';
    thwip.style.left = rect.left + 'px';
    thwip.style.top = (rect.top - 20) + 'px';
    thwip.style.fontWeight = '800';
    thwip.style.fontSize = '20px';
    thwip.style.color = '#c40b0b';
    thwip.style.zIndex = 40;
    thwip.style.textShadow = '1px 1px 0 #fff';
    thwip.style.pointerEvents = 'none';
    thwip.style.transition = 'transform 0.8s ease, opacity 0.8s ease';
    document.body.appendChild(thwip);
    requestAnimationFrame(() => {
      thwip.style.transform = 'translateY(-30px)';
      thwip.style.opacity = '0';
    });
    setTimeout(() => thwip.remove(), 850);
  });
}

// ---------- Message surprise avec effet machine à écrire ----------
let typingTimer = null;

function typeMessage(text, el, speed = 28) {
  if (typingTimer) clearInterval(typingTimer);
  el.textContent = '';
  let i = 0;
  typingTimer = setInterval(() => {
    el.textContent += text[i];
    i++;
    if (i >= text.length) {
      clearInterval(typingTimer);
      typingTimer = null;
    }
  }, speed);
}

function setupSurprise() {
  const btn = document.getElementById('surpriseBtn');
  const overlay = document.getElementById('overlay');
  const closeBtn = document.getElementById('closeBtn');
  const messageEl = document.getElementById('messageText');

  btn.addEventListener('click', () => {
    if (overlay.classList.contains('show')) return;
    overlay.classList.add('show');
    typeMessage(MESSAGE, messageEl);
    burstConfetti(null, -10, 90);
    btn.blur();
  });

  closeBtn.addEventListener('click', () => overlay.classList.remove('show'));
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.classList.remove('show');
  });
}

// ---------- Petite pluie de confettis occasionnelle ----------
function ambientConfetti() {
  setInterval(() => {
    if (document.hidden) return;
    burstConfetti(null, -10, 6);
  }, 9000);
}

document.addEventListener('DOMContentLoaded', () => {
  spawnHearts();
  spawnField();
  makePlushDraggable();
  makeSpideyClickable();
  setupSurprise();
  ambientConfetti();
});
