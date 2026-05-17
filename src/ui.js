// Grab the name from the browser link (e.g., ?name=Sarah)
const urlParams = new URLSearchParams(window.location.search);
let receiverName = urlParams.get('name');

if (receiverName) {
    receiverName = receiverName.trim();
}
const MAX_CLICKS = 5;

export function initCakeUi() {
  const button = document.getElementById('clickMeButton');
  const prompt = document.getElementById('wishPrompt');
  const reveal = document.getElementById('birthdayReveal');

  if (!button || !prompt || !reveal) {
    console.warn('[cake] Action-I overlay controls were not found');
    return;
  }

  let clickCount = 0;
  let lastPosition = getButtonRect(button);

  button.addEventListener('click', () => {
    clickCount += 1;

    if (clickCount >= MAX_CLICKS) {
      button.classList.add('is-hidden');
      prompt.classList.add('is-hidden');
      if (receiverName) {
        reveal.innerText = "HAPPY BIRTHDAY, " + receiverName.toUpperCase() + "!!";
      } else {
        reveal.innerText = "HAPPY BIRTHDAY!!";
      }
      reveal.hidden = false;
      launchConfetti();
      triggerHeartBoom();
      return;
    }

    lastPosition = teleportButton(button, lastPosition);
  });

  console.info('[cake] Five-click birthday chase ready');
}

function teleportButton(button, previousRect) {
  const width = button.offsetWidth || 178;
  const height = button.offsetHeight || 58;
  const margin = 48;
  const cakeSafeZone = getCakeSafeZone();
  let next = null;

  for (let attempt = 0; attempt < 40; attempt += 1) {
    const candidate = {
      left: randomBetween(margin, window.innerWidth - width - margin),
      top: randomBetween(margin, window.innerHeight - height - margin),
      width,
      height,
    };

    if (distance(candidate, previousRect) > 220 && !overlaps(candidate, cakeSafeZone)) {
      next = candidate;
      break;
    }
  }

  next ||= {
    left: window.innerWidth - width - margin,
    top: margin + Math.random() * 120,
    width,
    height,
  };

  button.classList.add('is-jumping');

  window.setTimeout(() => {
    button.style.left = `${next.left}px`;
    button.style.top = `${next.top}px`;
    button.classList.remove('is-jumping');
  }, 70);

  return next;
}

function getCakeSafeZone() {
  const container = document.getElementById('canvas-container');
  if (!container) {
    return null;
  }

  const rect = container.getBoundingClientRect();
  return {
    left: rect.left - 24,
    top: rect.top - 24,
    width: rect.width + 48,
    height: rect.height + 48,
  };
}

function getButtonRect(button) {
  const rect = button.getBoundingClientRect();
  return {
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
  };
}

function triggerHeartBoom() {
  // Placeholder for the next step: wire the actual heart explosion particles here.
  console.info('[cake] triggerHeartBoom placeholder fired');
}

function launchConfetti() {
  const colors = ['#ff4f7b', '#ffd166', '#7bdff2', '#b2f7b8', '#f7a8ff', '#ffffff'];
  const layer = document.createElement('div');
  layer.className = 'confetti-layer';
  document.body.appendChild(layer);

  for (let i = 0; i < 90; i += 1) {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.background = colors[i % colors.length];
    piece.style.animationDelay = `${Math.random() * 0.45}s`;
    piece.style.animationDuration = `${2.2 + Math.random() * 1.4}s`;
    piece.style.setProperty('--drift', `${(Math.random() - 0.5) * 220}px`);
    piece.style.setProperty('--spin', `${Math.random() * 720 + 360}deg`);
    layer.appendChild(piece);
  }

  window.setTimeout(() => {
    layer.remove();
  }, 4200);
}

function overlaps(a, b) {
  if (!b) {
    return false;
  }
  return (
    a.left < b.left + b.width &&
    a.left + a.width > b.left &&
    a.top < b.top + b.height &&
    a.top + a.height > b.top
  );
}

function distance(a, b) {
  const ax = a.left + a.width / 2;
  const ay = a.top + a.height / 2;
  const bx = b.left + b.width / 2;
  const by = b.top + b.height / 2;
  return Math.hypot(ax - bx, ay - by);
}

function randomBetween(min, max) {
  return min + Math.random() * Math.max(0, max - min);
}
