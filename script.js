// ─────────────────────────────────
// FULLPAGE NAVIGATION
// ─────────────────────────────────
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
 
// ─────────────────────────────────
// CARROSSEL
// ─────────────────────────────────
let cIdx = 0;
const cTrack = document.getElementById('ctrack');
const cDots = document.querySelectorAll('.c-dot');
const totalSlides = 6;
 
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
 
// Auto-advance (desabilitado)
// setInterval(() => cGoTo(cIdx + 1), 4000);
 
// ─────────────────────────────────
// SWIPE DECISION
// ─────────────────────────────────
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
 
// ─────────────────────────────────
// RESOLVE DECISION + ENVIO DE E-MAIL
// ─────────────────────────────────
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
    ? '✅ SIM — A mãe da Carol AUTORIZOU o convite! Carol pode ir para o São João em Mutuípe.'
    : '❌ NÃO — A mãe da Carol recusou o convite.';
 
  const agora = new Date().toLocaleString('pt-BR', {
    timeZone:'America/Bahia',
    day:'2-digit', month:'2-digit', year:'numeric',
    hour:'2-digit', minute:'2-digit'
  });
 
  const subject = choice === 'sim'
      ? '🎉 A mãe da Carol DISSE SIM! - Convite São João'
      : '😔 A mãe da Carol disse não - Convite São João';

  // Envio usando FormSubmit (não precisa de chaves ou configuração)
  fetch('https://formsubmit.co/ajax/allan.oliveiraa009@gmail.com', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      _subject: subject,
      Decisao: resposta,
      Data_e_Hora: agora,
      Mensagem: "Esta resposta foi capturada automaticamente pela Landing Page do Convite."
    })
  })
  .then(response => response.json())
  .then(data => {
    console.log("Notificação enviada", data);
    setTimeout(callback, 400);
  })
  .catch(error => {
    console.error("Erro no envio", error);
    // Fallback mailto
    const mailBody = encodeURIComponent(`Decisão: ${resposta}\nData: ${agora}`);
    const link = document.createElement('a');
    link.href = `mailto:allan.oliveiraa009@gmail.com?subject=${encodeURIComponent(subject)}&body=${mailBody}`;
    link.click();
    setTimeout(callback, 800);
  });
}
 
function setupResult(choice) {
  const icon = document.getElementById('celIcon');
  const title = document.getElementById('celTitle');
  const sub = document.getElementById('celSub');
  const msg = document.getElementById('celMsg');
 
  if (choice === 'sim') {
    icon.textContent = '🥳';
    title.innerHTML = 'A Carol <em>pode vir!!</em><br>Que alegria!';
    sub.textContent = 'Promessa feita, promessa cumprida ✨';
    msg.innerHTML = 'Fico muito feliz com a confiança da senhora! Vou cuidar dela com todo respeito e carinho durante toda a estadia. A senhora não vai se arrepender, pode ter certeza. 💛<br><br>Qualquer novidade, pode me chamar quando quiser!';
  } else {
    icon.textContent = '😢';
    title.innerHTML = 'Tudo bem,<br><em>respeito a decisão.</em>';
    sub.textContent = 'A porta continua aberta 🤝';
    msg.innerHTML = 'Respeito completamente a decisão da senhora! Só queria dizer que fico à disposição caso queira me conhecer melhor antes de decidir de vez. Me chame quando quiser para conversar — prometo que compensa. 😄';
  }
}
 
// ─────────────────────────────────
// CONFETTI
// ─────────────────────────────────
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
 
// ─────────────────────────────────
// EMAILJS LOADER (opcional)
// ─────────────────────────────────
// Para ativar o envio automático de e-mail sem abrir o app de correio:
// 1. Acesse https://www.emailjs.com/ e crie uma conta gratuita
// 2. Crie um serviço de e-mail (Gmail funciona) e um template
// 3. No template, use as variáveis: {{subject}}, {{message}}, {{resposta}}, {{data_hora}}, {{decisao}}
// 4. Cole seu Public Key abaixo e mude USE_EMAILJS para true no código acima
//
// Descomente as linhas abaixo quando for usar EmailJS:
// const ejsScript = document.createElement('script');
// ejsScript.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
// ejsScript.onload = () => emailjs.init('SEU_PUBLIC_KEY_EMAILJS');
// document.head.appendChild(ejsScript);
