// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// FULLPAGE NAVIGATION
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
let current = 0;
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');
 
function goTo(n) {
  if (n === current) return;
  slides[current].classList.remove('active');
  slides[current].classList.add('exit-up');
  setTimeout(() => slides[current].classList.remove('exit-up'), 700);
  current = n;
  slides[current].classList.add('active');
  dots.forEach((d, i) => d.classList.toggle('active', i === current));
}
 
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// CARROSSEL
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
let cIdx = 0;
const cTrack = document.getElementById('ctrack');
const cDots = document.querySelectorAll('.c-dot');
const totalSlides = 5;
 
function cGoTo(n) {
  cIdx = (n + totalSlides) % totalSlides;
  cTrack.style.transform = `translateX(-${cIdx * 100}%)`;
  cDots.forEach((d, i) => d.classList.toggle('on', i === cIdx));
}
 
document.getElementById('cprev').onclick = () => cGoTo(cIdx - 1);
document.getElementById('cnext').onclick = () => cGoTo(cIdx + 1);
cDots.forEach((d, i) => { d.onclick = () => cGoTo(i); });
 
// Touch swipe no carrossel
let cTouchStart = 0;
const carouselEl = document.querySelector('.carousel');
carouselEl.addEventListener('touchstart', e => { cTouchStart = e.touches[0].clientX; }, {passive:true});
carouselEl.addEventListener('touchend', e => {
  const diff = cTouchStart - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 40) cGoTo(diff > 0 ? cIdx + 1 : cIdx - 1);
});
 
// Auto-advance
setInterval(() => cGoTo(cIdx + 1), 4000);
 
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// SWIPE DECISION
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const card = document.getElementById('decisionCard');
const arena = document.getElementById('swipeArena');
let dragging = false, startX = 0, posX = 0;
const THRESH = 90;
 
function px(e) { return e.touches ? e.touches[0].clientX : e.clientX; }
 
function onDragStart(e) {
  dragging = true;
  startX = px(e);
  card.style.transition = 'none';
}
 
function onDragMove(e) {
  if (!dragging) return;
  posX = px(e) - startX;
  const r = posX * 0.1;
  card.style.transform = `translateX(${posX}px) rotate(${r}deg)`;
  card.classList.toggle('going-yes', posX > 40);
  card.classList.toggle('going-no', posX < -40);
  arena.classList.toggle('tilt-yes', posX > 40);
  arena.classList.toggle('tilt-no', posX < -40);
}
 
function onDragEnd() {
  if (!dragging) return;
  dragging = false;
  card.classList.remove('going-yes','going-no');
  arena.classList.remove('tilt-yes','tilt-no');
 
  if (posX > THRESH) {
    flyCard('right', () => resolveDecision('sim'));
  } else if (posX < -THRESH) {
    document.getElementById('popup-no').classList.add('show');
    resetCard();
  } else {
    resetCard();
  }
}
 
function resetCard() {
  card.style.transition = 'transform 0.45s cubic-bezier(0.34,1.56,0.64,1)';
  card.style.transform = 'translateX(0) rotate(0deg)';
}
 
function flyCard(dir, cb) {
  card.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
  card.style.transform = `translateX(${dir === 'right' ? 300 : -300}px) rotate(${dir === 'right' ? 20 : -20}deg)`;
  card.style.opacity = '0';
  setTimeout(cb, 450);
}
 
card.addEventListener('mousedown', onDragStart);
document.addEventListener('mousemove', onDragMove);
document.addEventListener('mouseup', onDragEnd);
card.addEventListener('touchstart', onDragStart, {passive:true});
document.addEventListener('touchmove', onDragMove, {passive:true});
document.addEventListener('touchend', onDragEnd);
 
// Fechar popup clicando fora
document.getElementById('popup-no').addEventListener('click', function(e) {
  if (e.target === this) this.classList.remove('show');
});
 
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// RESOLVE DECISION + ENVIO DE E-MAIL
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function resolveDecision(choice) {
  document.getElementById('popup-no').classList.remove('show');
 
  const loading = document.getElementById('email-loading');
  loading.classList.add('show');
 
  sendEmail(choice, function() {
    loading.classList.remove('show');
    setupResult(choice);
    goTo(4);
    if (choice === 'sim') launchConfetti();
  });
}
 
function sendEmail(choice, callback) {
  const resposta = choice === 'sim'
    ? 'âœ… SIM â€” A mÃ£e da Carol AUTORIZOU o convite! Carol pode ir para o SÃ£o JoÃ£o em MutuÃ­pe.'
    : 'âŒ NÃƒO â€” A mÃ£e da Carol recusou o convite.';
 
  const agora = new Date().toLocaleString('pt-BR', {
    timeZone:'America/Bahia',
    day:'2-digit', month:'2-digit', year:'numeric',
    hour:'2-digit', minute:'2-digit'
  });
 
  const body = encodeURIComponent(
    `Resposta do Convite â€” MÃ£e da Carol\n\n` +
    `Data/Hora: ${agora}\n\n` +
    `DecisÃ£o: ${resposta}\n\n` +
    `---\nEsta mensagem foi enviada automaticamente pela pÃ¡gina do convite.`
  );
 
  const subject = encodeURIComponent(
    choice === 'sim'
      ? 'ðŸŽ‰ A mÃ£e da Carol DISSE SIM! - Convite SÃ£o JoÃ£o'
      : 'ðŸ˜” A mÃ£e da Carol disse nÃ£o - Convite SÃ£o JoÃ£o'
  );
 
  // EmailJS â€” se nÃ£o tiver configurado, usa mailto como fallback
  // Para configurar EmailJS: https://www.emailjs.com/
  // 1. Crie uma conta gratuita no EmailJS
  // 2. Crie um template e pegue seu public key, service ID e template ID
  // 3. Substitua os valores abaixo
 
  const EMAILJS_PUBLIC_KEY = 'SEU_PUBLIC_KEY_EMAILJS';   // <-- substitua
  const EMAILJS_SERVICE_ID = 'SEU_SERVICE_ID';            // <-- substitua
  const EMAILJS_TEMPLATE_ID = 'SEU_TEMPLATE_ID';          // <-- substitua
  const USE_EMAILJS = false; // <-- mude para true quando configurar o EmailJS
 
  if (USE_EMAILJS) {
    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      to_email: 'allan.oliveiraa009@gmail.com',
      subject: choice === 'sim' ? 'ðŸŽ‰ A mÃ£e da Carol DISSE SIM!' : 'ðŸ˜” A mÃ£e da Carol disse nÃ£o',
      message: decodeURIComponent(body),
      resposta: resposta,
      data_hora: agora,
      decisao: choice === 'sim' ? 'AUTORIZOU âœ…' : 'RECUSOU âŒ'
    }).then(() => { setTimeout(callback, 400); })
      .catch(() => {
        window.open(`mailto:allan.oliveiraa009@gmail.com?subject=${subject}&body=${body}`);
        setTimeout(callback, 800);
      });
  } else {
    // Fallback: abre o app de e-mail do dispositivo
    const link = document.createElement('a');
    link.href = `mailto:allan.oliveiraa009@gmail.com?subject=${subject}&body=${body}`;
    link.click();
    setTimeout(callback, 1200);
  }
}
 
function setupResult(choice) {
  const icon = document.getElementById('celIcon');
  const title = document.getElementById('celTitle');
  const sub = document.getElementById('celSub');
  const msg = document.getElementById('celMsg');
 
  if (choice === 'sim') {
    icon.textContent = 'ðŸ¥³';
    title.innerHTML = 'A Carol <em>pode vir!!</em><br>Que alegria!';
    sub.textContent = 'Promessa feita, promessa cumprida âœ¨';
    msg.innerHTML = 'Fico muito feliz com a confianÃ§a da senhora! Vou cuidar dela com todo respeito e carinho durante toda a estadia. A senhora nÃ£o vai se arrepender, pode ter certeza. ðŸ’›<br><br>Qualquer novidade, pode me chamar quando quiser!';
  } else {
    icon.textContent = 'ðŸ˜¢';
    title.innerHTML = 'Tudo bem,<br><em>respeito a decisÃ£o.</em>';
    sub.textContent = 'A porta continua aberta ðŸ¤';
    msg.innerHTML = 'Respeito completamente a decisÃ£o da senhora! SÃ³ queria dizer que fico Ã  disposiÃ§Ã£o caso queira me conhecer melhor antes de decidir de vez. Me chame quando quiser para conversar â€” prometo que compensa. ðŸ˜„';
  }
}
 
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// CONFETTI
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function launchConfetti() {
  const container = document.getElementById('confettiContainer');
  container.innerHTML = '';
  const colors = ['#D4580A','#E8B84B','#1E6B3C','#FFFFFF','#F5E8DC','#4BC97A'];
  for (let i = 0; i < 80; i++) {
    const p = document.createElement('div');
    p.className = 'confetti-piece';
    const color = colors[Math.floor(Math.random() * colors.length)];
    const left = Math.random() * 100;
    const delay = Math.random() * 3;
    const dur = 3 + Math.random() * 3;
    const size = 6 + Math.random() * 8;
    const rot = Math.random() * 360;
    p.style.cssText = `
      left:${left}%;
      background:${color};
      width:${size}px;height:${size}px;
      animation-duration:${dur}s;
      animation-delay:${delay}s;
      transform:rotate(${rot}deg);
      border-radius:${Math.random() > 0.5 ? '50%' : '2px'};
    `;
    container.appendChild(p);
  }
}
 
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// EMAILJS LOADER (opcional)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Para ativar o envio automÃ¡tico de e-mail sem abrir o app de correio:
// 1. Acesse https://www.emailjs.com/ e crie uma conta gratuita
// 2. Crie um serviÃ§o de e-mail (Gmail funciona) e um template
// 3. No template, use as variÃ¡veis: {{subject}}, {{message}}, {{resposta}}, {{data_hora}}, {{decisao}}
// 4. Cole seu Public Key abaixo e mude USE_EMAILJS para true no cÃ³digo acima
//
// Descomente as linhas abaixo quando for usar EmailJS:
// const ejsScript = document.createElement('script');
// ejsScript.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
// ejsScript.onload = () => emailjs.init('SEU_PUBLIC_KEY_EMAILJS');
// document.head.appendChild(ejsScript);
