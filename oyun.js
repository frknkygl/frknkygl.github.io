(function () {
  var canvas = document.getElementById('tahta');
  var ctx = canvas.getContext('2d');
  var boyut = 20;
  var hucreSayisi = canvas.width / boyut;

  var skorEl = document.getElementById('skor');
  var rekorEl = document.getElementById('rekor');
  var mesajEl = document.getElementById('mesaj');
  var ortaKatman = document.getElementById('ortaKatman');
  var baslaBtn = document.getElementById('baslaBtn');
  var kontrollerEl = document.querySelector('.oyun-kontroller');

  var yilan, yon, sonrakiYon, yem, skor, oyunAktif, zamanlayici;
  var rekor = Number(localStorage.getItem('yilanRekor') || 0);
  rekorEl.textContent = rekor;

  function rastgeleHucre() {
    return Math.floor(Math.random() * hucreSayisi);
  }

  function yemYerlestir() {
    var uygun;
    do {
      uygun = { x: rastgeleHucre(), y: rastgeleHucre() };
    } while (yilan.some(function (p) { return p.x === uygun.x && p.y === uygun.y; }));
    yem = uygun;
  }

  function oyunuBaslat() {
    yilan = [{ x: 8, y: 10 }, { x: 7, y: 10 }, { x: 6, y: 10 }];
    yon = { x: 1, y: 0 };
    sonrakiYon = yon;
    skor = 0;
    skorEl.textContent = skor;
    yemYerlestir();
    oyunAktif = true;
    ortaKatman.style.display = 'none';
    kontrollerEl.style.display = 'flex';
    clearInterval(zamanlayici);
    zamanlayici = setInterval(dongu, 110);
  }

  function oyunBitir() {
    oyunAktif = false;
    clearInterval(zamanlayici);
    if (skor > rekor) {
      rekor = skor;
      rekorEl.textContent = rekor;
      localStorage.setItem('yilanRekor', rekor);
    }
    mesajEl.textContent = 'Oyun bitti! Skor: ' + skor;
    baslaBtn.textContent = 'TEKRAR OYNA';
    ortaKatman.style.display = 'flex';
  }

  function yonDegistir(dx, dy) {
    if (dx === -yon.x && dy === yon.y) return;
    if (dy === -yon.y && dx === yon.x) return;
    sonrakiYon = { x: dx, y: dy };
    if (!oyunAktif) oyunuBaslat();
  }

  function dongu() {
    yon = sonrakiYon;
    var bas = { x: yilan[0].x + yon.x, y: yilan[0].y + yon.y };

    if (bas.x < 0 || bas.y < 0 || bas.x >= hucreSayisi || bas.y >= hucreSayisi) {
      oyunBitir();
      return;
    }
    if (yilan.some(function (p) { return p.x === bas.x && p.y === bas.y; })) {
      oyunBitir();
      return;
    }

    yilan.unshift(bas);

    if (bas.x === yem.x && bas.y === yem.y) {
      skor += 10;
      skorEl.textContent = skor;
      yemYerlestir();
    } else {
      yilan.pop();
    }

    ciz();
  }

  function ciz() {
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(yem.x * boyut, yem.y * boyut, boyut - 1, boyut - 1);

    yilan.forEach(function (p, i) {
      ctx.fillStyle = i === 0 ? '#4cb84c' : '#3a9d3a';
      ctx.fillRect(p.x * boyut, p.y * boyut, boyut - 1, boyut - 1);
    });
  }

  document.addEventListener('keydown', function (e) {
    switch (e.key) {
      case 'ArrowUp': e.preventDefault(); yonDegistir(0, -1); break;
      case 'ArrowDown': e.preventDefault(); yonDegistir(0, 1); break;
      case 'ArrowLeft': e.preventDefault(); yonDegistir(-1, 0); break;
      case 'ArrowRight': e.preventDefault(); yonDegistir(1, 0); break;
    }
  });

  document.getElementById('yukari').addEventListener('click', function () { yonDegistir(0, -1); });
  document.getElementById('asagi').addEventListener('click', function () { yonDegistir(0, 1); });
  document.getElementById('sol').addEventListener('click', function () { yonDegistir(-1, 0); });
  document.getElementById('sag').addEventListener('click', function () { yonDegistir(1, 0); });

  baslaBtn.addEventListener('click', oyunuBaslat);

  (function ilkCizim() {
    yilan = [{ x: 8, y: 10 }, { x: 7, y: 10 }, { x: 6, y: 10 }];
    yem = { x: 14, y: 10 };
    ciz();
  })();
})();
