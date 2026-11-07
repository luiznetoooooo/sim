// Episódio 1 – "Zero espectadores" – animação 2D procedural (SVG), 1080x1920
'use strict';
const TL = window.TL, FPS = TL.fps, TOTAL = TL.total;
const SG = {}; TL.segs.forEach(s => SG[s.id] = s);
const T = (id, k) => k == null ? SG[id].s : SG[id].chunks[Math.min(k, SG[id].chunks.length - 1)].t0;
const E = id => SG[id].s + SG[id].d;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, u) => a + (b - a) * u;
const prog = (t, a, d) => clamp((t - a) / d);
const btw = (t, a, b) => t >= a && t < b;
const EZ = {
  lin: u => u,
  inOut: u => u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2,
  out: u => 1 - Math.pow(1 - u, 3),
  back: u => { const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2); },
  elastic: u => u <= 0 ? 0 : u >= 1 ? 1 : Math.pow(2, -10 * u) * Math.sin((u * 10 - .75) * (2 * Math.PI / 3)) + 1,
};
const f1 = n => (+n).toFixed(1);
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

// -------------------------------------------------------------------- cores
const C = {
  out: '#15101C', skin: '#F4B48A', skinSh: '#D88E66', blush: '#EE8C76',
  shirt: '#E6A93A', shirtSh: '#B47A1E', hair: '#3A2416', shorts: '#3F6FB2',
  hp: '#1E1E26', red: '#E53935', yellow: '#FFD21F', blue: '#39C2FF',
};

// pontos de barba fixos
const STUBBLE = []; for (let i = 0; i < 70; i++) {
  const a = Math.PI * (0.12 + 0.76 * rnd()), r = 150 + 22 * rnd();
  const x = 820 + Math.cos(a) * r * 0.95, y = 770 + Math.sin(a) * r;
  if (y > 850) STUBBLE.push([x, y]);
}
const DUST = []; for (let i = 0; i < 26; i++) DUST.push([rnd() * 1500 - 100, rnd() * 1300 + 100, rnd() * 6.28, 2 + rnd() * 3]);

// -------------------------------------------------------------------- DUDU
function dir(side, a) { const r = a * Math.PI / 180; return [side * Math.sin(r), Math.cos(r)]; }

function arm(sx, sy, side, a1, a2, hold, p) {
  const L1 = 175, L2 = 160;
  const d1 = dir(side, a1), d2 = dir(side, a2);
  const ex = sx + d1[0] * L1, ey = sy + d1[1] * L1;
  const wx = ex + d2[0] * L2, wy = ey + d2[1] * L2;
  const hx = wx + d2[0] * 22, hy = wy + d2[1] * 22;
  const sl = [sx + d1[0] * L1 * .5, sy + d1[1] * L1 * .5];
  let s = `<path d="M${f1(sx)} ${f1(sy)} L${f1(ex)} ${f1(ey)} L${f1(wx)} ${f1(wy)}" stroke="${C.out}" stroke-width="78" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M${f1(sx)} ${f1(sy)} L${f1(ex)} ${f1(ey)} L${f1(wx)} ${f1(wy)}" stroke="${C.skin}" stroke-width="62" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M${f1(sx)} ${f1(sy)} L${f1(sl[0])} ${f1(sl[1])}" stroke="${C.out}" stroke-width="108" stroke-linecap="round"/>
  <path d="M${f1(sx)} ${f1(sy)} L${f1(sl[0])} ${f1(sl[1])}" stroke="${C.shirt}" stroke-width="92" stroke-linecap="round"/>`;
  if (hold === 'pizza') {
    const tx = p.tx, ty = p.ty, ang = Math.atan2(ty - hy, tx - hx), nx = -Math.sin(ang), ny = Math.cos(ang);
    const bx = hx + Math.cos(ang) * 10, by = hy + Math.sin(ang) * 10;
    s += `<path d="M${f1(bx + nx * 60)} ${f1(by + ny * 60)} L${f1(tx)} ${f1(ty)} L${f1(bx - nx * 60)} ${f1(by - ny * 60)} Z" fill="#F7C948" stroke="${C.out}" stroke-width="7" stroke-linejoin="round"/>
    <path d="M${f1(bx + nx * 64)} ${f1(by + ny * 64)} L${f1(bx - nx * 64)} ${f1(by - ny * 64)}" stroke="#C97A2F" stroke-width="26" stroke-linecap="round"/>
    <circle cx="${f1(lerp(bx, tx, .45) + nx * 14)}" cy="${f1(lerp(by, ty, .45) + ny * 14)}" r="13" fill="#C0392B"/>
    <circle cx="${f1(lerp(bx, tx, .7) - nx * 6)}" cy="${f1(lerp(by, ty, .7) - ny * 6)}" r="9" fill="#C0392B"/>`;
  }
  s += `<circle cx="${f1(hx)}" cy="${f1(hy)}" r="40" fill="${C.skin}" stroke="${C.out}" stroke-width="8"/>`;
  if (hold === 'thumb') s += `<rect x="${f1(hx - 13)}" y="${f1(hy - 78)}" width="26" height="56" rx="13" fill="${C.skin}" stroke="${C.out}" stroke-width="7"/>`;
  else if (hold === 'point') {
    const fx = hx + d2[0] * 52, fy = hy + d2[1] * 52;
    s += `<path d="M${f1(hx)} ${f1(hy)} L${f1(fx)} ${f1(fy)}" stroke="${C.out}" stroke-width="30" stroke-linecap="round"/><path d="M${f1(hx)} ${f1(hy)} L${f1(fx)} ${f1(fy)}" stroke="${C.skin}" stroke-width="16" stroke-linecap="round"/>`;
  } else s += `<ellipse cx="${f1(hx - side * 26)}" cy="${f1(hy - 8)}" rx="13" ry="19" fill="${C.skin}" stroke="${C.out}" stroke-width="6"/>`;
  return s;
}

function duduParts(t, q) {
  const p = Object.assign({
    dx: 0, dy: 0, tilt: 0, lookX: 0, lookY: 0, lid: .35, brow: 0, mouthO: 0, smile: .1,
    armL: [12, -62], armR: [12, -62], holdL: null, holdR: null, hpTilt: 18, cowlick: 0, sweat: -1,
    shades: false, sparkle: 0, dark: .6, legs: true, pupil: 18, soot: 0, breath: 1, tx: 820, ty: 880,
  }, q);
  const tr = `translate(${f1(p.dx)} ${f1(p.dy)})`;
  // pernas (aparecem embaixo da mesa)
  let legs = '';
  if (p.legs) {
    legs += `<g transform="${tr}">
    <path d="M665 1405 L737 1405 L742 1795 L680 1795 Z" fill="${C.skin}" stroke="${C.out}" stroke-width="8"/>
    <path d="M903 1405 L975 1405 L960 1795 L898 1795 Z" fill="${C.skin}" stroke="${C.out}" stroke-width="8"/>
    ${[1460, 1520, 1580, 1640].map(y => `<path d="M690 ${y} l10 -12 M712 ${y + 18} l9 -12 M920 ${y} l-10 -12 M942 ${y + 18} l-9 -12" stroke="#7a4a32" stroke-width="3"/>`).join('')}
    <path d="M630 1240 L1010 1240 L1018 1425 L835 1435 L820 1390 L805 1435 L622 1425 Z" fill="${C.shorts}" stroke="${C.out}" stroke-width="8" stroke-linejoin="round"/>
    <path d="M700 1300 L700 1420 M940 1300 L940 1420" stroke="#2c5590" stroke-width="5"/>
    <ellipse cx="708" cy="1818" rx="74" ry="22" fill="#2E86DE" stroke="${C.out}" stroke-width="7"/>
    <ellipse cx="930" cy="1818" rx="74" ry="22" fill="#2E86DE" stroke="${C.out}" stroke-width="7"/>
    <ellipse cx="712" cy="1800" rx="46" ry="18" fill="${C.skin}" stroke="${C.out}" stroke-width="6"/>
    <ellipse cx="926" cy="1800" rx="46" ry="18" fill="${C.skin}" stroke="${C.out}" stroke-width="6"/>
    <path d="M676 1808 Q708 1772 742 1808 M892 1808 Q926 1772 960 1808" stroke="#F4D03F" stroke-width="10" fill="none" stroke-linecap="round"/></g>`;
  }
  const br = 1 + 0.012 * Math.sin(t * 2.4) * p.breath;
  const torso = `M590 935 C540 960 518 1050 522 1150 C526 1262 600 1305 820 1305 C1040 1305 1114 1262 1118 1150 C1122 1050 1100 960 1050 935 Q820 905 590 935 Z`;
  let body = `<g transform="${tr} translate(0 ${f1(1300 * (1 - br))}) scale(1 ${br.toFixed(4)})">
   <path d="${torso}" fill="${C.shirt}" stroke="${C.out}" stroke-width="9"/>
   <g clip-path="url(#torsoClip)"><ellipse cx="1110" cy="1120" rx="180" ry="280" fill="${C.shirtSh}" opacity=".75"/>
     <ellipse cx="820" cy="1300" rx="300" ry="40" fill="${C.shirtSh}" opacity=".6"/></g>
   <circle cx="820" cy="1075" r="72" fill="none" stroke="#fff" stroke-width="10" opacity=".28"/>
   <text x="820" y="1102" font-family="Luckiest" font-size="72" fill="#fff" opacity=".3" text-anchor="middle">GG</text>
   <ellipse cx="690" cy="1090" rx="28" ry="19" fill="#B3362B" opacity=".85"/><ellipse cx="702" cy="1112" rx="9" ry="7" fill="#B3362B" opacity=".85"/>
   <ellipse cx="945" cy="1010" rx="18" ry="24" fill="#8C6A2A" opacity=".6"/>
   <ellipse cx="880" cy="1190" rx="32" ry="15" fill="#B3362B" opacity=".75"/>
   <ellipse cx="610" cy="990" rx="30" ry="40" fill="#C99230" opacity=".7"/><ellipse cx="1030" cy="990" rx="30" ry="40" fill="#A8741C" opacity=".7"/>
   <path d="M735 932 Q820 992 905 932" fill="${C.skin}" stroke="${C.out}" stroke-width="8"/>
  </g>`;
  // cabeça
  const eyes = [[752, 765], [888, 765]];
  const lid = clamp(p.lid);
  let head = `<g transform="${tr} rotate(${f1(p.tilt)} 820 920)">
   <circle cx="652" cy="792" r="34" fill="${C.skin}" stroke="${C.out}" stroke-width="8"/>
   <circle cx="988" cy="792" r="34" fill="${C.skin}" stroke="${C.out}" stroke-width="8"/>
   <ellipse cx="820" cy="762" rx="168" ry="178" fill="${C.skin}" stroke="${C.out}" stroke-width="9"/>
   <g clip-path="url(#faceClip)"><ellipse cx="975" cy="800" rx="120" ry="210" fill="${C.skinSh}" opacity=".5"/></g>
   <path d="M735 906 Q820 948 905 906" stroke="${C.out}" stroke-width="5" fill="none" opacity=".45"/>
   ${STUBBLE.map(([x, y]) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="2.6" fill="#5a3b2e" opacity=".4"/>`).join('')}
   <ellipse cx="712" cy="850" rx="34" ry="18" fill="${C.blush}" opacity=".35"/><ellipse cx="928" cy="850" rx="34" ry="18" fill="${C.blush}" opacity=".35"/>
   <circle cx="705" cy="712" r="7" fill="#D8504A"/><circle cx="703" cy="709" r="2" fill="#fff" opacity=".7"/>
   <circle cx="938" cy="700" r="6" fill="#D8504A"/><circle cx="872" cy="884" r="5" fill="#D8504A"/><circle cx="758" cy="866" r="5" fill="#D8504A"/>`;
  // olheiras
  eyes.forEach(([x, y]) => {
    head += `<path d="M${x - 44} ${y + 44} Q${x} ${y + 76} ${x + 44} ${y + 44}" stroke="#7B4A86" stroke-width="11" fill="none" opacity="${p.dark.toFixed(2)}" stroke-linecap="round"/>
             <path d="M${x - 34} ${y + 62} Q${x} ${y + 84} ${x + 34} ${y + 62}" stroke="#7B4A86" stroke-width="6" fill="none" opacity="${(p.dark * .6).toFixed(2)}" stroke-linecap="round"/>`;
  });
  // olhos
  eyes.forEach(([x, y], i) => {
    const px = x + p.lookX * 16, py = y + 6 + p.lookY * 14;
    head += `<ellipse cx="${x}" cy="${y}" rx="44" ry="48" fill="#fff" stroke="${C.out}" stroke-width="6"/>
    <g clip-path="url(#eyeClip${i})">`;
    if (p.sparkle > .5) {
      head += `<circle cx="${f1(px)}" cy="${f1(py)}" r="24" fill="${C.out}"/><path d="M${f1(px)} ${f1(py - 18)} L${f1(px + 6)} ${f1(py - 5)} L${f1(px + 18)} ${f1(py)} L${f1(px + 6)} ${f1(py + 5)} L${f1(px)} ${f1(py + 18)} L${f1(px - 6)} ${f1(py + 5)} L${f1(px - 18)} ${f1(py)} L${f1(px - 6)} ${f1(py - 5)} Z" fill="#fff"/>`;
    } else {
      head += `<circle cx="${f1(px)}" cy="${f1(py)}" r="${p.pupil}" fill="${C.out}"/><circle cx="${f1(px - 6)}" cy="${f1(py - 7)}" r="${(p.pupil * .32).toFixed(1)}" fill="#fff"/>`;
    }
    const ly = y - 48 + lid * 96;
    head += `<rect x="${x - 50}" y="${y - 60}" width="100" height="${f1(Math.max(0, ly - (y - 60)))}" fill="${C.skin}"/>
      ${lid > .02 ? `<path d="M${x - 46} ${f1(ly)} Q${x} ${f1(ly + 7)} ${x + 46} ${f1(ly)}" stroke="${C.out}" stroke-width="7" fill="none"/>` : ''}</g>`;
  });
  // óculos
  head += `<g transform="rotate(-2.5 820 765)">`;
  eyes.forEach(([x, y]) => {
    head += `<rect x="${x - 64}" y="${y - 56}" width="128" height="112" rx="30" fill="${p.shades ? '#111' : 'rgba(190,225,255,.10)'}" stroke="${C.out}" stroke-width="12"/>
    <path d="M${x - 34} ${y - 30} L${x - 8} ${y - 46} M${x - 40} ${y - 6} L${x + 10} ${y - 38}" stroke="#fff" stroke-width="7" opacity="${p.shades ? .8 : .45}" stroke-linecap="round"/>`;
  });
  head += `<path d="M816 752 Q820 744 824 752" stroke="${C.out}" stroke-width="10" fill="none"/>
   <path d="M688 752 L656 772 M952 752 L984 772" stroke="${C.out}" stroke-width="9"/></g>`;
  // sobrancelhas
  const inY = 688 - p.brow * 18, outY = 694 - Math.abs(p.brow) * 4;
  head += `<path d="M700 ${f1(outY)} Q748 ${f1(outY - 18)} 798 ${f1(inY)}" stroke="${C.hair}" stroke-width="16" fill="none" stroke-linecap="round"/>
   <path d="M842 ${f1(inY)} Q892 ${f1(outY - 18)} 940 ${f1(outY)}" stroke="${C.hair}" stroke-width="16" fill="none" stroke-linecap="round"/>`;
  // nariz
  head += `<ellipse cx="820" cy="832" rx="34" ry="27" fill="${C.skinSh}" stroke="${C.out}" stroke-width="7"/><ellipse cx="808" cy="822" rx="10" ry="6" fill="#fff" opacity=".45"/>`;
  // boca
  const mo = clamp(p.mouthO), s = p.smile, cy = 888 - s * 12, w = 52 + 10 * Math.max(0, s) + 6 * mo;
  if (mo < .06) {
    head += `<path d="M${820 - w} ${f1(cy)} Q820 ${f1(cy + 18 * s + 4)} ${820 + w} ${f1(cy)}" stroke="${C.out}" stroke-width="8" fill="none" stroke-linecap="round"/>`;
  } else {
    const top = cy - 4 - 6 * mo + (s < 0 ? -10 * s : 0), bot = cy + 12 + 78 * mo + 14 * s;
    const m = `M${f1(820 - w)} ${f1(cy)} Q820 ${f1(top)} ${f1(820 + w)} ${f1(cy)} Q820 ${f1(bot)} ${f1(820 - w)} ${f1(cy)} Z`;
    head += `<clipPath id="mouthC"><path d="${m}"/></clipPath><path d="${m}" fill="#5A1414"/>
      <g clip-path="url(#mouthC)"><rect x="${f1(820 - w)}" y="${f1(top - 10)}" width="${f1(2 * w)}" height="${f1(22)}" fill="#F2E6B8"/>
      <ellipse cx="820" cy="${f1(bot - 6)}" rx="${f1(w * .55)}" ry="${f1(10 + 14 * mo)}" fill="#E0607A"/></g>
      <path d="${m}" fill="none" stroke="${C.out}" stroke-width="8" stroke-linejoin="round"/>`;
  }
  // fuligem
  if (p.soot > 0) head += [[700, 760, 40], [930, 720, 34], [820, 640, 46], [880, 860, 26], [760, 690, 22]].map(([x, y, r]) =>
    `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * .7}" fill="#2a2a2a" opacity="${(.45 * p.soot).toFixed(2)}"/>`).join('');
  // cabelo (estilos no EP. 3)
  head += hairSVG(p);
  // fone
  const ht = p.hpTilt;
  head += `<path d="M648 770 C630 500 1010 500 992 770" stroke="${C.out}" stroke-width="36" fill="none"/>
   <path d="M648 770 C630 500 1010 500 992 770" stroke="${C.hp}" stroke-width="24" fill="none"/>
   <path d="M672 640 C700 545 940 545 968 640" stroke="${C.red}" stroke-width="7" fill="none"/>
   <rect x="606" y="718" width="74" height="134" rx="30" fill="${C.hp}" stroke="${C.out}" stroke-width="9"/>
   <rect x="620" y="736" width="46" height="98" rx="20" fill="${C.red}"/>
   <g transform="translate(0 ${f1(ht * 1.3)}) rotate(${f1(ht)} 996 790)"><rect x="960" y="724" width="74" height="134" rx="30" fill="${C.hp}" stroke="${C.out}" stroke-width="9"/>
   <rect x="974" y="742" width="46" height="98" rx="20" fill="${C.red}"/></g>
   <path d="M640 848 Q646 942 730 932" stroke="${C.out}" stroke-width="14" fill="none" stroke-linecap="round"/>
   <path d="M640 848 Q646 942 730 932" stroke="#3a3a46" stroke-width="7" fill="none" stroke-linecap="round"/>
   <circle cx="742" cy="930" r="18" fill="#26262e" stroke="${C.out}" stroke-width="6"/>`;
  if (p.sweat >= 0) {
    const sy = 640 + p.sweat * 120;
    head += `<path d="M978 ${f1(sy)} Q960 ${f1(sy + 34)} 978 ${f1(sy + 44)} Q996 ${f1(sy + 34)} 978 ${f1(sy)} Z" fill="#8FDBFF" stroke="${C.out}" stroke-width="5"/>`;
  }
  if (p.headExtra) head += p.headExtra;
  head += `</g>`;
  const arms = `<g transform="${tr}">${arm(605, 968, -1, p.armL[0], p.armL[1], p.holdL, p)}${arm(1035, 968, 1, p.armR[0], p.armR[1], p.holdR, p)}</g>`;
  return { legs, back: body + head, arms, p };
}

// -------------------------------------------------------------------- partes do cenário
function fly(x, y, t, ph) {
  const w = Math.sin(t * 90 + ph) > 0 ? 1 : .4;
  return `<g transform="translate(${f1(x)} ${f1(y)})"><ellipse cx="-7" cy="-8" rx="${f1(9 * w)}" ry="6" fill="#dff3ff" opacity=".8" stroke="${C.out}" stroke-width="2"/>
   <ellipse cx="7" cy="-8" rx="${f1(9 * w)}" ry="6" fill="#dff3ff" opacity=".8" stroke="${C.out}" stroke-width="2"/>
   <ellipse cx="0" cy="0" rx="9" ry="7" fill="#1b1b1b"/><circle cx="5" cy="-2" r="2.5" fill="#c33"/></g>`;
}
function flies(cx, cy, t, n = 3, r = 80) {
  let s = ''; for (let i = 0; i < n; i++) {
    const ph = i * 2.1, w = 2.2 + i * .4;
    s += fly(cx + Math.cos(t * w + ph) * r * (1 + .2 * i), cy + Math.sin(t * w * 1.7 + ph) * r * .5 - 20, t, ph);
  } return s;
}
function stink(x, y, t, n = 3, col = '#9BE15D', spread = 50, rise = 170) {
  let s = ''; for (let i = 0; i < n; i++) {
    const u = ((t * .45 + i / n) % 1), yy = y - u * rise, xx = x + (i - (n - 1) / 2) * spread;
    let d = `M${f1(xx)} ${f1(yy)}`;
    for (let k = 1; k <= 6; k++) d += ` L${f1(xx + Math.sin(k * 1.3 + t * 5 + i) * 13)} ${f1(yy - k * 14)}`;
    s += `<path d="${d}" stroke="${col}" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="${f1(Math.sin(u * Math.PI) * .85)}"/>`;
  } return s;
}
function hlCircle(cx, cy, rx, ry, t, t0, z) {
  const u = EZ.back(prog(t, t0, .25)); if (u <= 0) return '';
  return `<g transform="translate(${cx} ${cy}) scale(${u.toFixed(3)})">
  <ellipse rx="${rx}" ry="${ry}" fill="none" stroke="#000" stroke-width="${f1(16 / z)}" opacity=".6"/>
  <ellipse rx="${rx}" ry="${ry}" fill="none" stroke="${C.yellow}" stroke-width="${f1(10 / z)}" stroke-dasharray="${f1(28 / z)} ${f1(16 / z)}" stroke-dashoffset="${f1(-t * 90 / z)}"/></g>`;
}
function arrow(x, y, ang, t, t0, z, size = 1) {
  const u = EZ.back(prog(t, t0, .25)); if (u <= 0) return '';
  const k = size / z * u, bob = Math.sin(t * 9) * 10 / z;
  return `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${ang}) translate(0 ${f1(bob)}) scale(${k.toFixed(3)})">
   <path d="M0 0 L-55 -70 L-24 -70 L-24 -150 L24 -150 L24 -70 L55 -70 Z" fill="${C.yellow}" stroke="#000" stroke-width="10" stroke-linejoin="round"/></g>`;
}
function qmarks(x, y, t, t0, z) {
  const u = EZ.back(prog(t, t0, .3)); if (u <= 0) return '';
  return [[-60, 0, .8], [0, -40, 1.1], [60, -5, .9]].map(([dx, dy, sc], i) =>
    `<text x="${f1(x + dx)}" y="${f1(y + dy + Math.sin(t * 6 + i) * 8)}" font-family="Luckiest" font-size="${f1(70 * sc * u / Math.sqrt(z))}" fill="${C.yellow}" stroke="#000" stroke-width="${f1(6 / Math.sqrt(z))}" paint-order="stroke" text-anchor="middle">?</text>`).join('');
}


function caption(t) {
  const segs = TL.segs;
  for (let i = 0; i < segs.length; i++) {
    const sg = segs[i], nextS = i + 1 < segs.length ? segs[i + 1].s : TOTAL + 5;
    for (let k = 0; k < sg.chunks.length; k++) {
      const c = sg.chunks[k];
      const end = k + 1 < sg.chunks.length ? sg.chunks[k + 1].t0 : Math.min(sg.s + sg.d + .4, nextS - .02);
      if (t >= c.t0 && t < end) {
        const txt = c.words.map(w => w.w).join(' ');
        const len = txt.length;
        const size = Math.min(132, 1880 / Math.max(len, 1));
        const u = prog(t, c.t0, .16), sc = .7 + .3 * EZ.back(u);
        const rot = ((i * 7 + k * 3) % 5 - 2) * .8;
        const sp = c.words.map(w => `<tspan fill="${w.c === 'y' ? C.yellow : w.c === 'b' ? C.blue : '#fff'}">${w.w.toUpperCase()}</tspan>`).join(' ');
        const y = 1450;
        return `<g transform="translate(540 ${y}) rotate(${rot}) scale(${sc.toFixed(3)})">
         <text y="12" font-family="Anton" font-size="${f1(size)}" fill="#000" opacity=".55" text-anchor="middle" stroke="#000" stroke-width="22" stroke-linejoin="round">${txt.toUpperCase()}</text>
         <text font-family="Anton" font-size="${f1(size)}" text-anchor="middle" stroke="#000" stroke-width="20" stroke-linejoin="round" paint-order="stroke" letter-spacing="1">${sp}</text></g>`;
      }
    }
  }
  return '';
}

// -------------------------------------------------------------------- composição
const DEFS = `<defs>
 <linearGradient id="wallG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2E2557"/><stop offset="1" stop-color="#1B1736"/></linearGradient>
 <linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1B2A57"/><stop offset="1" stop-color="#4B3080"/></linearGradient>
 <linearGradient id="ledG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FF4FD8"/><stop offset=".5" stop-color="#9B5CFF"/><stop offset="1" stop-color="#3EC5FF"/></linearGradient>
 <pattern id="stripeP" width="60" height="60" patternUnits="userSpaceOnUse"><rect width="30" height="60" fill="#ffffff" opacity=".03"/></pattern>
 <pattern id="dotP" width="40" height="40" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="2.5" fill="#6C3CE1"/></pattern>
 <pattern id="diagP" width="80" height="80" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="40" height="80" fill="#fff" opacity=".18"/></pattern>
 <radialGradient id="ringGlow"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".55" stop-color="#fff6d8" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
 <radialGradient id="monGlow"><stop offset="0" stop-color="#5EC8FF" stop-opacity=".22"/><stop offset="1" stop-color="#5EC8FF" stop-opacity="0"/></radialGradient>
 <radialGradient id="purpleR"><stop offset="0" stop-color="#4A2C9E" stop-opacity=".7"/><stop offset="1" stop-color="#0D0B1E" stop-opacity="0"/></radialGradient>
 <radialGradient id="vig" cx=".5" cy=".5" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".6"/></radialGradient>
 <linearGradient id="redG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D32F2F"/><stop offset="1" stop-color="#7F0000"/></linearGradient>
 <linearGradient id="greenG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2E9D44"/><stop offset="1" stop-color="#0F4D1E"/></linearGradient>
 <clipPath id="torsoClip"><path d="M590 935 C540 960 518 1050 522 1150 C526 1262 600 1305 820 1305 C1040 1305 1114 1262 1118 1150 C1122 1050 1100 960 1050 935 Q820 905 590 935 Z"/></clipPath>
 <clipPath id="faceClip"><ellipse cx="820" cy="762" rx="168" ry="178"/></clipPath>
 <clipPath id="eyeClip0"><ellipse cx="752" cy="765" rx="44" ry="48"/></clipPath>
 <clipPath id="eyeClip1"><ellipse cx="888" cy="765" rx="44" ry="48"/></clipPath>
 <clipPath id="screenClip"><rect x="1086" y="866" width="298" height="198" rx="6"/></clipPath>
 <filter id="glowF" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10"/></filter>
 <filter id="grainF"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="1" seed="SEED"/><feColorMatrix type="saturate" values="0"/></filter>
</defs>`;


function burst(x, y, e) {
  if (e > .5) return '';
  seed = 41; let s = '';
  for (let i = 0; i < 14; i++) {
    const a = i / 14 * 6.28, v = 300 + rnd() * 250;
    s += `<circle cx="${f1(x + Math.cos(a) * v * e)}" cy="${f1(y + Math.sin(a) * v * e)}" r="${f1(16 * (1 - e * 2))}" fill="#fff" stroke="${C.out}" stroke-width="4"/>`;
  }
  return s;
}


// ---- reaproveitado do EP. 3

const brl = v => 'R$ ' + v.toFixed(2).replace('.', ',');

const env = (id, t) => { const s = SG[id]; const i = Math.floor((t - s.s) * FPS); return s.env && i >= 0 && i < s.env.length ? s.env[i] : 0; };

function blinkLid(t, base) { const a = (t + .7) % 3.4, b = (t * 1.13) % 5.3; return (a < .11 || b < .1) ? 1 : base; }

// estado do cabelo ao longo do episódio
function hairState(t) {
  const h = { hair: 'messy', cutL: 0, cutR: 0, cowScale: 1 };
  if (t >= T('topete', 1) + .15) h.cowScale = 0;
  if (t >= T('voltou', 1) - .05) h.cowScale = EZ.elastic(prog(t, T('voltou', 1) - .05, .6));
  if (t >= T('lados', 1) + .1) { h.hair = 'uneven'; h.cutL = .7; }
  if (t >= T('lados', 4) + .1) h.cutR = .8;
  if (t >= T('igualar', 2) + .2) h.cutL = 1;
  if (t >= T('cogumelo')) { h.hair = 'bowl'; }
  if (t >= T('consertou', 3)) { h.hair = 'buzz'; h.cowScale = 0; }
  if (t >= T('topete2', 2) - .05) h.cowScale = EZ.elastic(prog(t, T('topete2', 2) - .05, .7));
  return h;
}

function hairSVG(p) {
  const H = C.hair, O = C.out, hs = p.hairSt || { hair: 'messy', cowScale: 1 };
  let s = '';
  const cow = (y0, k) => k <= 0.01 ? '' : `<g transform="translate(842 ${y0}) scale(${k.toFixed(3)}) rotate(${f1(p.cowlick || 0)}) translate(-842 -522)"><path d="M842 522 Q830 452 892 440" stroke="${O}" stroke-width="26" fill="none" stroke-linecap="round"/>
   <path d="M842 522 Q830 452 892 440" stroke="${H}" stroke-width="13" fill="none" stroke-linecap="round"/></g>`;
  if (hs.hair === 'messy') {
    s += `<path d="M655 740 C640 610 700 568 760 574 C772 548 840 538 872 566 C935 548 1002 610 986 740 C975 690 952 660 930 650 L914 676 L890 640 L860 666 L835 632 L806 662 L780 634 L752 668 L730 640 L702 676 C682 696 666 716 655 740 Z" fill="${H}" stroke="${O}" stroke-width="8" stroke-linejoin="round"/>
     <path d="M690 612 L672 540 L728 578 L740 506 L786 566 L812 494 L840 560 L874 500 L892 566 L940 524 L934 590 L978 580 L952 628 Z" fill="${H}" stroke="${O}" stroke-width="8" stroke-linejoin="round"/>
     <path d="M760 600 Q790 585 815 600 M850 590 Q880 576 905 595" stroke="#5a3a26" stroke-width="6" fill="none"/>` + cow(522, hs.cowScale);
  } else if (hs.hair === 'uneven') {
    const xl = 655 + 120 * hs.cutL, xr = 986 - 120 * hs.cutR;
    let zz = ''; const n = 8;
    for (let i = 0; i <= n; i++) { const x = xr - (xr - xl) * i / n; zz += ` L${f1(x)} ${i % 2 ? 690 : 650}`; }
    // pele raspada aparecendo nas laterais cortadas
    const stub = (x0, x1) => { let d = ''; seed = Math.round(x0); for (let i = 0; i < 26; i++) d += `<circle cx="${f1(x0 + rnd() * (x1 - x0))}" cy="${f1(600 + rnd() * 120)}" r="2.6" fill="#5a3b2e" opacity=".55"/>`; return d; };
    if (hs.cutL > 0) s += stub(660, xl) + `<ellipse cx="${f1((660 + xl) / 2)}" cy="610" rx="${f1((xl - 660) / 3 + 4)}" ry="14" fill="#fff" opacity=".35"/>`;
    if (hs.cutR > 0) s += stub(xr, 980) + `<ellipse cx="${f1((xr + 980) / 2)}" cy="610" rx="${f1((980 - xr) / 3 + 4)}" ry="14" fill="#fff" opacity=".35"/>`;
    s += `<path d="M${f1(xl)} 700 L${f1(xl)} 640 C${f1(xl)} 590 ${f1(xl + 40)} 556 820 548 C${f1(xr - 40)} 556 ${f1(xr)} 590 ${f1(xr)} 640 L${f1(xr)} 700${zz} Z" fill="${H}" stroke="${O}" stroke-width="8" stroke-linejoin="round"/>
     <path d="M${f1(xl)} 640 l-14 12 l14 12 M${f1(xr)} 640 l14 12 l-14 12" stroke="${O}" stroke-width="6" fill="none"/>
     <path d="M770 568 L784 520 L806 560 L824 506 L846 560 L866 514 L878 566 Z" fill="${H}" stroke="${O}" stroke-width="8" stroke-linejoin="round"/>` + cow(522, hs.cowScale);
  } else if (hs.hair === 'bowl') {
    s += `<path d="M628 790 C612 520 1028 520 1012 790 L990 790 Q986 702 958 682 L682 682 Q654 702 650 790 Z" fill="${H}" stroke="${O}" stroke-width="9" stroke-linejoin="round"/>
     <path d="M690 600 Q760 560 840 566" stroke="#6b4a33" stroke-width="12" fill="none" stroke-linecap="round" opacity=".8"/>
     <path d="M682 682 L958 682" stroke="${O}" stroke-width="9"/>` + cow(522, hs.cowScale);
  } else {  // corte novo (degradê)
    s += `<path d="M660 726 C648 604 718 556 820 552 C922 556 992 604 980 726 C968 664 944 634 904 624 Q820 606 736 624 C696 634 672 664 660 726 Z" fill="#4a3020" stroke="${O}" stroke-width="8" stroke-linejoin="round"/>
     <path d="M664 720 C660 680 668 660 690 646 M976 720 C980 680 972 660 950 646" stroke="#7a5a44" stroke-width="10" fill="none" opacity=".8"/>
     <path d="M720 600 Q800 570 880 586" stroke="#6b4a33" stroke-width="8" fill="none" opacity=".7" stroke-linecap="round"/>` + cow(560, hs.cowScale * .8);
  }
  return s;
}

function momParts(t, q) {
  const p = Object.assign({ x: 430, mouthO: 0, smile: .3, brow: 0, lid: .1, arm: null, hold: null }, q);
  const hx = p.x, hy = 650;
  let s = `<g>`;
  // corpo + avental
  s += `<path d="M${hx - 150} 1300 C${hx - 160} 960 ${hx - 120} 830 ${hx} 820 C${hx + 120} 830 ${hx + 160} 960 ${hx + 150} 1300 Z" fill="#E85D9A" stroke="${C.out}" stroke-width="9"/>
   <path d="M${hx - 95} 1300 L${hx - 85} 930 Q${hx} 900 ${hx + 85} 930 L${hx + 95} 1300 Z" fill="#fff" stroke="${C.out}" stroke-width="7"/>
   <path d="M${hx} 1010 C${hx - 40} 980 ${hx - 28} 950 ${hx} 972 C${hx + 28} 950 ${hx + 40} 980 ${hx} 1010 Z" fill="#FF4757"/>
   <text x="${hx}" y="1080" font-family="Luckiest" font-size="44" fill="#E85D9A" text-anchor="middle">MÃE</text>
   <rect x="${hx - 34}" y="770" width="68" height="70" fill="#D9946B" stroke="${C.out}" stroke-width="6"/>`;
  // cabelo cacheado (atrás)
  seed = 13; let curls = '';
  for (let i = 0; i < 16; i++) { const a = Math.PI * (1.05 + .9 * i / 15), r = 118; curls += `<circle cx="${f1(hx + Math.cos(a) * r)}" cy="${f1(hy + Math.sin(a) * r * .95 + 10)}" r="${f1(40 + rnd() * 10)}" fill="#2b1a12" stroke="${C.out}" stroke-width="6"/>`; }
  s += curls + `<circle cx="${hx}" cy="${hy - 150}" r="60" fill="#2b1a12" stroke="${C.out}" stroke-width="7"/>
   <path d="M${hx - 40} ${hy - 105} Q${hx} ${hy - 95} ${hx + 40} ${hy - 105}" stroke="#FF4757" stroke-width="14" fill="none" stroke-linecap="round"/>`;
  // rosto
  s += `<ellipse cx="${hx}" cy="${hy}" rx="112" ry="122" fill="#E8A87C" stroke="${C.out}" stroke-width="9"/>
   <path d="M${hx - 110} ${hy - 30} Q${hx - 60} ${hy - 120} ${hx} ${hy - 100} Q${hx + 60} ${hy - 120} ${hx + 110} ${hy - 30} Q${hx + 90} ${hy - 90} ${hx} ${hy - 80} Q${hx - 90} ${hy - 90} ${hx - 110} ${hy - 30} Z" fill="#2b1a12"/>
   <circle cx="${hx - 112}" cy="${hy + 30}" r="10" fill="#F4C430" stroke="${C.out}" stroke-width="4"/><circle cx="${hx + 112}" cy="${hy + 30}" r="10" fill="#F4C430" stroke="${C.out}" stroke-width="4"/>
   <ellipse cx="${hx - 62}" cy="${hy + 40}" rx="24" ry="13" fill="#EE7F6A" opacity=".45"/><ellipse cx="${hx + 62}" cy="${hy + 40}" rx="24" ry="13" fill="#EE7F6A" opacity=".45"/>`;
  [[hx - 42, hy - 6], [hx + 42, hy - 6]].forEach(([ex, ey], i) => {
    const lid = clamp(p.lid);
    s += `<ellipse cx="${ex}" cy="${ey}" rx="22" ry="${f1(24 * (1 - lid) + 2)}" fill="#fff" stroke="${C.out}" stroke-width="5"/>
     ${lid < .8 ? `<circle cx="${ex}" cy="${ey + 3}" r="10" fill="${C.out}"/><circle cx="${ex - 3}" cy="${ey - 1}" r="3" fill="#fff"/>` : ''}
     <path d="M${ex - 22} ${ey - 20} l-8 -8 M${ex + 22} ${ey - 20} l8 -8" stroke="${C.out}" stroke-width="4"/>`;
    const iy = ey - 40 - p.brow * 10, oy = ey - 44 + Math.abs(p.brow) * 2;
    s += i ? `<path d="M${ex - 26} ${f1(iy)} Q${ex} ${f1(oy - 8)} ${ex + 26} ${f1(oy)}" stroke="#2b1a12" stroke-width="9" fill="none" stroke-linecap="round"/>`
      : `<path d="M${ex - 26} ${f1(oy)} Q${ex} ${f1(oy - 8)} ${ex + 26} ${f1(iy)}" stroke="#2b1a12" stroke-width="9" fill="none" stroke-linecap="round"/>`;
  });
  s += `<path d="M${hx - 8} ${hy + 20} Q${hx + 6} ${hy + 44} ${hx - 10} ${hy + 50}" stroke="${C.out}" stroke-width="6" fill="none" stroke-linecap="round"/>`;
  const mo = clamp(p.mouthO), my = hy + 78;
  if (mo < .06) s += `<path d="M${hx - 36} ${my} Q${hx} ${f1(my + 22 * p.smile)} ${hx + 36} ${my}" stroke="#B03050" stroke-width="9" fill="none" stroke-linecap="round"/>`;
  else s += `<ellipse cx="${hx}" cy="${f1(my + 8 * mo)}" rx="${f1(30 + 6 * mo)}" ry="${f1(6 + 26 * mo)}" fill="#5A1414" stroke="#B03050" stroke-width="7"/>`;
  // braço com objeto
  if (p.arm) {
    const [ax, ay] = p.arm, sx = hx + 110, sy = 880;
    const d = `M${sx} ${sy} Q${f1(sx + 40)} ${f1(Math.max(sy, ay) + 80)} ${f1(ax)} ${f1(ay)}`;
    s += `<path d="${d}" stroke="${C.out}" stroke-width="64" fill="none" stroke-linecap="round"/><path d="${d}" stroke="#E8A87C" stroke-width="50" fill="none" stroke-linecap="round"/>
     <path d="M${sx} ${sy} L${f1(sx + 30)} ${f1(sy + 70)}" stroke="${C.out}" stroke-width="84" stroke-linecap="round"/><path d="M${sx} ${sy} L${f1(sx + 30)} ${f1(sy + 70)}" stroke="#E85D9A" stroke-width="70" stroke-linecap="round"/>`;
    if (p.hold === 'clipper') s += clipperAt(ax - 20, ay, -20 + Math.sin(t * 30) * 3);
    if (p.hold === 'towel') s += `<g transform="translate(${f1(ax)} ${f1(ay)}) rotate(${f1(Math.sin(t * 14) * 15)})"><rect x="-70" y="-50" width="140" height="100" rx="16" fill="#7FD3FF" stroke="${C.out}" stroke-width="7"/><path d="M-70 -20 L70 -20 M-70 20 L70 20" stroke="#fff" stroke-width="8"/></g>`;
    s += `<circle cx="${f1(ax)}" cy="${f1(ay)}" r="32" fill="#E8A87C" stroke="${C.out}" stroke-width="7"/>`;
  }
  return s + `</g>`;
}

function ringLight(t) {
  return `<path d="M330 960 L330 1720 M330 1720 L250 1840 M330 1720 L410 1840 M330 1720 L330 1840" stroke="${C.out}" stroke-width="18" stroke-linecap="round"/>
   <path d="M330 960 L330 1720" stroke="#555" stroke-width="8"/>
   <circle cx="330" cy="820" r="230" fill="url(#ringGlow)" opacity=".75"/>
   <circle cx="330" cy="820" r="135" fill="none" stroke="${C.out}" stroke-width="40"/>
   <circle cx="330" cy="820" r="135" fill="none" stroke="#FFFFFF" stroke-width="26"/>
   <circle cx="330" cy="820" r="135" fill="none" stroke="#fffbe6" stroke-width="12" filter="url(#glowF)"/>
   <rect x="312" y="790" width="36" height="62" rx="6" fill="#222" stroke="${C.out}" stroke-width="5"/>` +
    [200, 330, 80].map(a => { const r = a * Math.PI / 180, x = 330 + Math.cos(r) * 135, y = 820 + Math.sin(r) * 135;
      return `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${a + 90})"><rect x="-46" y="-15" width="92" height="30" fill="#1b1b1f" stroke="#000" stroke-width="4"/></g>`; }).join('');
}

function worldScene(t, cam) {
  let s = `<rect x="-600" y="-600" width="2900" height="2000" fill="url(#wallG)"/>
   <rect x="-600" y="-600" width="2900" height="2000" fill="url(#stripeP)" opacity=".5"/>
   <path d="M-600 150 L2300 150" stroke="url(#ledG)" stroke-width="14" filter="url(#glowF)"/>
   <path d="M-600 150 L2300 150" stroke="url(#ledG)" stroke-width="7"/>
   <ellipse cx="820" cy="170" rx="1100" ry="160" fill="#B04DFF" opacity=".10"/>
   <rect x="120" y="330" width="350" height="450" fill="url(#skyG)" stroke="${C.out}" stroke-width="14"/>
   <circle cx="390" cy="420" r="60" fill="#FFF4C2" opacity=".15"/><circle cx="390" cy="420" r="38" fill="#FFF4C2"/>
   <path d="M120 600 L180 560 L220 600 L290 540 L350 610 L410 570 L470 620 L470 780 L120 780 Z" fill="#141029"/>
   <path d="M295 330 L295 780 M120 555 L470 555" stroke="${C.out}" stroke-width="12"/>
   <path d="M90 300 L90 820 Q150 700 140 300 Z" fill="#6D3B8C" stroke="${C.out}" stroke-width="8"/>
   <path d="M500 300 Q470 520 520 800 L420 820 Q470 600 440 300 Z" fill="#6D3B8C" stroke="${C.out}" stroke-width="8"/>
   <path d="M60 300 L540 300" stroke="${C.out}" stroke-width="14"/>
   <g transform="rotate(5 1240 430)"><rect x="1130" y="290" width="220" height="280" fill="#232542" stroke="${C.out}" stroke-width="9"/>
    <text x="1240" y="380" font-family="Luckiest" font-size="54" fill="${C.yellow}" text-anchor="middle">GAME</text>
    <text x="1240" y="440" font-family="Luckiest" font-size="54" fill="#FF4757" text-anchor="middle">ON</text></g>
   <g transform="rotate(-6 640 330)"><rect x="565" y="240" width="150" height="190" fill="#E84A5F" stroke="${C.out}" stroke-width="8"/>
    <text x="640" y="320" font-family="Anton" font-size="48" fill="#fff" text-anchor="middle">PRO</text><text x="640" y="380" font-family="Anton" font-size="30" fill="#fff" text-anchor="middle" opacity=".8">PLAYER</text></g>
   <rect x="1170" y="660" width="360" height="22" fill="#5B3A25" stroke="${C.out}" stroke-width="7"/>
   <path d="M1360 600 L1440 600 L1430 640 Q1400 660 1370 640 Z" fill="#E1B12C" stroke="${C.out}" stroke-width="6"/><rect x="1385" y="640" width="30" height="20" fill="#E1B12C" stroke="${C.out}" stroke-width="5"/>
   <text x="1400" y="625" font-family="Anton" font-size="12" fill="#6d5300" text-anchor="middle">PARTICIPAÇÃO</text>`;
  // raios da revelação
  if (raysOn(t)) {
    const u = prog(t, T('descobriu', 0) - .05, .3);
    let r = ''; for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2 + t * .6, a2 = a + Math.PI / 18;
      r += `<path d="M820 770 L${f1(820 + Math.cos(a) * 1600)} ${f1(770 + Math.sin(a) * 1600)} L${f1(820 + Math.cos(a2) * 1600)} ${f1(770 + Math.sin(a2) * 1600)} Z" fill="${i % 2 ? '#FFC93C' : '#FF8A3D'}"/>`;
    }
    s += `<g opacity="${f1(u * .85)}">${r}</g>`;
  }
  s += `<rect x="-600" y="1380" width="2900" height="1100" fill="#3A2A24"/>
   ${[1440, 1530, 1640, 1770, 1920].map(y => `<path d="M-600 ${y} L2300 ${y}" stroke="#2C1F1A" stroke-width="6"/>`).join('')}
   <rect x="-600" y="1380" width="2900" height="20" fill="#2C1F1A"/>
   <rect x="-420" y="1150" width="560" height="300" rx="30" fill="#5865A8" stroke="${C.out}" stroke-width="9"/>
   <path d="M-420 1160 Q-200 1080 60 1170 Q160 1210 140 1300 L-420 1300 Z" fill="#8A5FBF" stroke="${C.out}" stroke-width="9"/>`;
  s += ringLight(t);
  s += `<g transform="rotate(-3 820 1300)">
   <path d="M590 1260 L578 690 Q588 588 700 578 L940 578 Q1052 588 1062 690 L1072 1260 Z" fill="#1F1F27" stroke="${C.out}" stroke-width="11" stroke-linejoin="round"/>
   <path d="M600 700 L612 1240 M1040 700 L1050 1240" stroke="${C.red}" stroke-width="30"/>
   <rect x="720" y="600" width="200" height="70" rx="30" fill="${C.red}" stroke="${C.out}" stroke-width="7"/></g>
   <ellipse cx="840" cy="1830" rx="560" ry="40" fill="#000" opacity=".35"/>
   <rect x="1110" y="1420" width="160" height="380" rx="12" fill="#17171f" stroke="${C.out}" stroke-width="9"/>
   <circle cx="1190" cy="1520" r="44" fill="none" stroke="hsl(${(t * 120) % 360} 90% 60%)" stroke-width="10"/>
   <circle cx="1190" cy="1640" r="44" fill="none" stroke="hsl(${(t * 120 + 120) % 360} 90% 60%)" stroke-width="10"/>`;
  const cab = ['#111', '#222', '#C62828', '#333', '#1565C0', '#111'];
  for (let i = 0; i < 9; i++) s += `<path d="M${450 + i * 20} ${1290 + i * 5} C ${450 + i * 20} 1560, 700 ${1700 + i * 6}, 900 ${1700 + i * 6} S 1060 ${1600 + i * 12}, 1110 ${1500 + i * 18}" stroke="${cab[i % cab.length]}" stroke-width="10" fill="none"/>`;
  s += [560, 800, 1000].map(x => `<rect x="${x - 6}" y="1680" width="12" height="44" rx="4" fill="#fff" stroke="${C.out}" stroke-width="3"/>`).join('');
  const w = Math.sin(t * 7) * 30;
  s += `<path d="M990 1292 C 1000 1380, ${f1(960 + w)} 1440, ${f1(990 - w)} 1520" stroke="#E67E22" stroke-width="12" fill="none" stroke-linecap="round"/>
   <rect x="${f1(975 - w)}" y="1518" width="30" height="40" rx="6" fill="#ddd" stroke="${C.out}" stroke-width="5"/>
   <rect x="760" y="1700" width="170" height="40" rx="8" fill="#ddd" stroke="${C.out}" stroke-width="6"/>
   <rect x="806" y="1430" width="28" height="330" fill="#2a2a33" stroke="${C.out}" stroke-width="6"/>
   <path d="M820 1770 L660 1800 M820 1770 L980 1800 M820 1770 L820 1812" stroke="${C.out}" stroke-width="16" stroke-linecap="round"/>
   <circle cx="980" cy="1810" r="17" fill="#222" stroke="${C.out}" stroke-width="5"/><circle cx="820" cy="1820" r="17" fill="#222" stroke="${C.out}" stroke-width="5"/>
   ${[['#3F6FB2', 0], ['#E84A5F', 1], ['#3DDC84', 2]].map(([c, k]) => `<rect x="${592 + k * 4}" y="${1820 - k * 16}" width="118" height="16" rx="3" fill="${c}" stroke="${C.out}" stroke-width="4"/>`).join('')}`;
  return s;
}

function worldFront(t, dud, mom) {
  let s = `<rect x="1070" y="850" width="330" height="230" rx="16" fill="#111" stroke="${C.out}" stroke-width="10"/>
   ${screenContent(t)}
   <rect x="1215" y="1078" width="40" height="122" fill="#222" stroke="${C.out}" stroke-width="6"/>
   <ellipse cx="1235" cy="1205" rx="80" ry="12" fill="#222" stroke="${C.out}" stroke-width="6"/>
   <g transform="rotate(-8 1110 825)"><rect x="1080" y="800" width="60" height="60" fill="#FFE066" stroke="${C.out}" stroke-width="4"/>
   <text x="1110" y="837" font-family="Nunito" font-weight="800" font-size="12" fill="#333" text-anchor="middle">SUCESSO</text></g>
   <path d="M350 1212 L1320 1212 L1352 1262 L318 1262 Z" fill="#7A5236" stroke="${C.out}" stroke-width="9" stroke-linejoin="round"/>
   <rect x="318" y="1262" width="1034" height="30" fill="#5B3A25" stroke="${C.out}" stroke-width="8"/>
   <rect x="340" y="1292" width="34" height="540" fill="#4A2F1E" stroke="${C.out}" stroke-width="8"/>
   <rect x="1296" y="1292" width="34" height="540" fill="#4A2F1E" stroke="${C.out}" stroke-width="8"/>
   <path d="M652 1222 L990 1222 L1002 1252 L640 1252 Z" fill="#22222B" stroke="${C.out}" stroke-width="7"/>
   <path d="M660 1246 L984 1246" stroke="hsl(${(t * 140) % 360} 90% 60%)" stroke-width="4"/>
   <ellipse cx="1045" cy="1240" rx="26" ry="14" fill="#2a2a33" stroke="${C.out}" stroke-width="6"/>
   <path d="M575 1215 L575 1150" stroke="#555" stroke-width="12"/><ellipse cx="575" cy="1215" rx="44" ry="10" fill="#333" stroke="${C.out}" stroke-width="6"/>
   <path d="M536 1150 L536 1040 Q536 996 576 996 Q616 996 616 1040 L616 1150 Z" fill="#fff" stroke="${C.out}" stroke-width="7"/>
   <path d="M538 1050 L614 1050 M538 1085 L614 1085 M538 1120 L614 1120" stroke="#E53935" stroke-width="12"/>
   <path d="M1460 1620 L1580 1620 L1565 1800 L1475 1800 Z" fill="#2E7D32" stroke="${C.out}" stroke-width="8"/>
   <rect x="1450" y="1604" width="138" height="20" rx="8" fill="#1E5E22" stroke="${C.out}" stroke-width="6"/>`;
  s += dud.arms + (mom ? '' : '');
  s += DUST.map(([x, y, ph, r]) => `<circle cx="${f1(x + Math.sin(t * .5 + ph) * 30)}" cy="${f1(y + Math.cos(t * .4 + ph) * 25)}" r="${r}" fill="#fff" opacity="${f1(.12 + .1 * Math.sin(t + ph))}"/>`).join('');
  s += `<ellipse cx="1150" cy="920" rx="520" ry="560" fill="url(#monGlow)"/>`;
  // brilhos da revelação
  if (sparkOn(t)) {
    s += [[560, 600], [1080, 640], [700, 1000], [960, 980], [820, 460], [460, 860], [1180, 820]].map(([x, y], i) => {
      const k = Math.max(0, Math.sin(t * 5 + i * 1.7)) * EZ.back(prog(t, T('descobriu', 0) + i * .06, .3));
      return `<path transform="translate(${x} ${y}) scale(${k.toFixed(3)})" d="M0 -40 L10 -10 L40 0 L10 10 L0 40 L-10 10 L-40 0 L-10 -10 Z" fill="#FFF7C2"/>`;
    }).join('');
  }
  return s;
}

function icon(kind) {
  if (kind === 'scissors') return `<path d="M-10 -10 L-60 -130 M10 -10 L60 -130" stroke="#000" stroke-width="22" stroke-linecap="round"/><path d="M-10 -10 L-60 -130 M10 -10 L60 -130" stroke="#D0D7DE" stroke-width="12" stroke-linecap="round"/>
    <circle cx="-26" cy="34" r="34" fill="none" stroke="#000" stroke-width="18"/><circle cx="-26" cy="34" r="34" fill="none" stroke="${C.red}" stroke-width="10"/><circle cx="26" cy="34" r="34" fill="none" stroke="#000" stroke-width="18"/><circle cx="26" cy="34" r="34" fill="none" stroke="${C.red}" stroke-width="10"/>`;
  if (kind === 'collab') return [-36, 36].map((x, i) => `<g transform="translate(${x} ${i ? 20 : -20}) rotate(${i ? 12 : -12})"><rect x="-56" y="-32" width="112" height="64" rx="30" fill="${i ? '#39C2FF' : '#FF4757'}" stroke="#000" stroke-width="7"/><circle cx="-26" cy="0" r="9" fill="#000"/><circle cx="26" cy="-6" r="7" fill="#fff"/><circle cx="36" cy="8" r="7" fill="#fff"/></g>`).join('');
  return `<path d="M0 30 L0 160" stroke="#000" stroke-width="16"/><path d="M0 30 L0 160" stroke="#888" stroke-width="8"/><path d="M-50 160 L50 160" stroke="#000" stroke-width="14" stroke-linecap="round"/>
    <rect x="-30" y="-110" width="60" height="140" rx="30" fill="#333" stroke="#000" stroke-width="7"/>${[-80, -55, -30].map(y => `<path d="M-24 ${y} L24 ${y}" stroke="#666" stroke-width="5"/>`).join('')}`;
}

function choiceBoard(t, o) {
  const u = o.slideT < 0 ? 1 : EZ.out(prog(t, o.slideT, .35));
  let s = `<g transform="translate(${f1(-(1 - u) * 560)} 0)"><rect x="0" y="0" width="540" height="1920" fill="url(#redG)"/><rect x="0" y="0" width="540" height="1920" fill="url(#diagP)" opacity=".25"/></g>
   <g transform="translate(${f1((1 - u) * 560)} 0)"><rect x="540" y="0" width="540" height="1920" fill="url(#greenG)"/><rect x="540" y="0" width="540" height="1920" fill="url(#diagP)" opacity=".25"/></g>
   <rect x="535" y="0" width="10" height="1920" fill="${C.yellow}" opacity="${u.toFixed(2)}"/>`;
  const t0 = o.slideT < 0 ? -9 : o.slideT;
  const bu = EZ.back(prog(t, t0 + .2, .35));
  s += `<g transform="translate(540 300) scale(${bu.toFixed(3)})"><rect x="-370" y="-58" width="740" height="104" rx="52" fill="#000" stroke="${C.yellow}" stroke-width="7"/>
   <text y="22" font-family="Anton" font-size="62" fill="${C.yellow}" text-anchor="middle" letter-spacing="2">${o.banner}</text></g>`;
  [[270, o.left], [810, o.right]].forEach(([x, op], i) => {
    const a = EZ.back(prog(t, t0 + .35, .3)), pop = 1 + .25 * Math.max(0, 1 - Math.abs(t - op.popT - .12) / .25);
    s += `<g transform="translate(${x} 520) scale(${(a * pop).toFixed(3)})"><text font-family="Anton" font-size="${op.word.length > 8 ? 100 : op.word.length > 6 ? 118 : 140}" fill="${op.col}" stroke="#000" stroke-width="16" paint-order="stroke" text-anchor="middle">${op.word}</text>
      <text y="68" font-family="Anton" font-size="44" fill="#fff" stroke="#000" stroke-width="9" paint-order="stroke" text-anchor="middle">${op.sub}</text></g>`;
    const q = { legs: false, lookX: i ? -.4 : .4, smile: .35, lid: blinkLid(t + i * 1.3, .3), brow: .3, dy: Math.sin(t * 2.4 + i) * 6, soot: o.soot, hairSt: o.hairSt, headExtra: o.headExtra };
    const dp = duduParts(t, q);
    s += `<g transform="translate(${x} ${f1(1060 + (1 - u) * 600)}) scale(.62) translate(-820 -900)">${dp.back}${dp.arms}</g>`;
    const ic = EZ.back(prog(t, t0 + .5, .3));
    s += `<g transform="translate(${i ? 990 : 96} ${f1(930 + Math.sin(t * 3 + i) * 14)}) rotate(${i ? 20 : -20}) scale(${ic.toFixed(3)})">${iconEP4(op.icon)}</g>`;
  });
  const ou = EZ.back(prog(t, t0 + .45, .3));
  s += `<g transform="translate(540 1040) scale(${ou.toFixed(3)}) rotate(${f1(Math.sin(t * 2) * 6)})"><circle r="70" fill="#000" stroke="${C.yellow}" stroke-width="9"/>
   <text y="26" font-family="Anton" font-size="74" fill="${C.yellow}" text-anchor="middle">OU</text></g>`;
  if (o.loserDim != null && t >= o.loserDim) {
    const d = prog(t, o.loserDim, .3);
    s += `<rect x="${o.winRight ? 0 : 540}" y="0" width="540" height="1920" fill="#000" opacity="${(d * .6).toFixed(2)}"/>`;
    const st = prog(t, o.loserDim, .18), sc = lerp(2.4, 1, EZ.out(st));
    s += `<g transform="translate(${o.winRight ? 810 : 270} 800) rotate(-14) scale(${sc.toFixed(3)})" opacity="${clamp(st * 2).toFixed(2)}">
     <rect x="-220" y="-74" width="440" height="148" rx="18" fill="none" stroke="#3DDC84" stroke-width="14"/><rect x="-206" y="-60" width="412" height="120" rx="12" fill="#0F4D1E" opacity=".85"/>
     <text y="34" font-family="Anton" font-size="100" fill="#3DDC84" text-anchor="middle">VENCEU!</text></g>`;
  }
  if (o.bubT != null && t >= o.bubT - .05) {
    [[270, 0], [810, .12]].forEach(([x, d]) => {
      const b = EZ.back(prog(t, o.bubT - .05 + d, .3));
      s += `<g transform="translate(${x + 120} 700) scale(${b.toFixed(3)})"><path d="M-80 -50 Q-80 -80 -50 -80 L50 -80 Q80 -80 80 -50 L80 0 Q80 30 50 30 L-10 30 L-40 60 L-36 30 L-50 30 Q-80 30 -80 0 Z" fill="#fff" stroke="#000" stroke-width="7"/>
      ${[-30, 0, 30].map((dx, i) => `<circle cx="${dx}" cy="${f1(-25 - Math.abs(Math.sin(t * 7 + i)) * 8)}" r="11" fill="${x < 540 ? C.red : '#2E7D32'}"/>`).join('')}</g>`;
    });
  }
  if (o.arrowT != null && t >= o.arrowT - .05) {
    const a = EZ.back(prog(t, o.arrowT - .05, .3));
    s += `<g transform="translate(540 ${f1(1700 + Math.abs(Math.sin(t * 7)) * 22)}) scale(${a.toFixed(3)}) rotate(180)"><path d="M0 0 L-60 -70 L-26 -70 L-26 -140 L26 -140 L26 -70 L60 -70 Z" fill="${C.yellow}" stroke="#000" stroke-width="9" stroke-linejoin="round"/></g>`;
  }
  if (o.tagT != null && t >= o.tagT - .05) {
    const a = EZ.back(prog(t, o.tagT - .05, .35));
    s += `<g transform="translate(830 1690) rotate(-6) scale(${a.toFixed(3)})"><rect x="-170" y="-62" width="340" height="124" rx="16" fill="#000" transform="translate(10 10)"/>
     <rect x="-170" y="-62" width="340" height="124" rx="16" fill="${C.yellow}" stroke="#000" stroke-width="8"/>
     <text y="30" font-family="Anton" font-size="84" fill="#000" text-anchor="middle">${o.tag}</text></g>`;
  }
  return s;
}

function confettiAt(t, t0) {
  const e = t - t0; if (e < 0 || e > 1.6) return '';
  seed = 77; let s = '';
  for (let i = 0; i < 60; i++) {
    const side = i % 2 ? 1 : -1, x0 = side > 0 ? 1080 : 0, a = (side > 0 ? 200 : -20) + rnd() * 40 - 20, v = 900 + rnd() * 700;
    const r = a * Math.PI / 180, x = x0 + Math.cos(r) * v * e, y = 1500 - (900 + rnd() * 500) * e + 1400 * e * e;
    s += `<rect x="${f1(x)}" y="${f1(y)}" width="22" height="12" fill="${['#FFD21F', '#FF4FD8', '#3EC5FF', '#3DDC84', '#FF4757'][i % 5]}" transform="rotate(${f1(e * 700 + i * 30)} ${f1(x)} ${f1(y)})"/>`;
  }
  return s;
}


// ---- reaproveitado do EP. 5
function capSVG() {
  return `<path d="M650 646 C646 512 994 512 990 646 Z" fill="#E53935" stroke="${C.out}" stroke-width="9" stroke-linejoin="round"/>
   <path d="M700 560 Q820 520 940 560" stroke="#ff8a80" stroke-width="10" fill="none" opacity=".7" stroke-linecap="round"/>
   <path d="M636 642 Q820 700 1004 642 L1004 662 Q820 724 636 662 Z" fill="#B71C1C" stroke="${C.out}" stroke-width="8" stroke-linejoin="round"/>
   <circle cx="820" cy="590" r="36" fill="#fff" stroke="${C.out}" stroke-width="6"/>
   <path d="M820 566 L842 606 L798 606 Z" fill="#F7C948" stroke="#C97A2F" stroke-width="4"/><circle cx="815" cy="595" r="4" fill="#C0392B"/>
   <path d="M842 532 Q830 462 892 450" stroke="${C.out}" stroke-width="26" fill="none" stroke-linecap="round"/>
   <path d="M842 532 Q830 462 892 450" stroke="#4a3020" stroke-width="13" fill="none" stroke-linecap="round"/>`;
}
function brunaoParts(t, q) {
  const p = Object.assign({ mouthO: 0, smile: .5, brow: 0, bill: false }, q);
  const hx = 790, hy = 760;
  let s = `<path d="M${hx - 70} 1500 L${hx - 80} 1820 L${hx - 10} 1820 L${hx} 1560 L${hx + 10} 1820 L${hx + 80} 1820 L${hx + 70} 1500 Z" fill="#2F4F8F" stroke="${C.out}" stroke-width="8"/>
   <ellipse cx="${hx - 50}" cy="1830" rx="56" ry="22" fill="#fff" stroke="${C.out}" stroke-width="6"/><ellipse cx="${hx + 50}" cy="1830" rx="56" ry="22" fill="#fff" stroke="${C.out}" stroke-width="6"/>
   <path d="M${hx - 170} 1520 C${hx - 190} 1100 ${hx - 140} 960 ${hx} 950 C${hx + 140} 960 ${hx + 190} 1100 ${hx + 170} 1520 Z" fill="#17171f" stroke="${C.out}" stroke-width="9"/>
   <text x="${hx}" y="1200" font-family="Luckiest" font-size="130" fill="#F4C430" text-anchor="middle" stroke="#000" stroke-width="6" paint-order="stroke">B</text>
   <path d="M${hx - 60} 960 Q${hx} 1010 ${hx + 60} 960" stroke="#333" stroke-width="10" fill="none"/>`;
  // braços
  const armR = p.bill ? `M${hx + 150} 1000 Q${hx + 200} 1060 ${hx + 130} 930` : `M${hx + 150} 1000 Q${hx + 200} 1150 ${hx + 160} 1260`;
  s += `<path d="M${hx - 150} 1000 Q${hx - 200} 1150 ${hx - 160} 1260" stroke="${C.out}" stroke-width="72" fill="none" stroke-linecap="round"/><path d="M${hx - 150} 1000 Q${hx - 200} 1150 ${hx - 160} 1260" stroke="#17171f" stroke-width="58" fill="none" stroke-linecap="round"/>
   <path d="${armR}" stroke="${C.out}" stroke-width="72" fill="none" stroke-linecap="round"/><path d="${armR}" stroke="#17171f" stroke-width="58" fill="none" stroke-linecap="round"/>`;
  if (p.bill) s += `<g transform="translate(${hx + 110} 880) rotate(-12)"><rect x="-80" y="-40" width="160" height="80" rx="8" fill="#E0A458" stroke="${C.out}" stroke-width="6"/><circle r="20" fill="#F4D7A1"/><text y="14" font-family="Anton" font-size="38" fill="#7a4a12" text-anchor="middle">50</text></g>
    <circle cx="${hx + 130}" cy="930" r="32" fill="#C68642" stroke="${C.out}" stroke-width="7"/>`;
  else s += `<circle cx="${hx + 160}" cy="1270" r="32" fill="#C68642" stroke="${C.out}" stroke-width="7"/>`;
  s += `<circle cx="${hx - 160}" cy="1270" r="32" fill="#C68642" stroke="${C.out}" stroke-width="7"/>`;
  // cabeça
  s += `<rect x="${hx - 36}" y="${hy + 110}" width="72" height="80" fill="#B5743A" stroke="${C.out}" stroke-width="6"/>
   <ellipse cx="${hx}" cy="${hy}" rx="122" ry="138" fill="#C68642" stroke="${C.out}" stroke-width="9"/>
   <path d="M${hx - 120} ${hy - 20} C${hx - 130} ${hy - 150} ${hx + 130} ${hy - 150} ${hx + 120} ${hy - 20} C${hx + 100} ${hy - 90} ${hx - 100} ${hy - 90} ${hx - 120} ${hy - 20} Z" fill="#1b1b1b"/>
   <path d="M${hx - 112} ${hy + 30} C${hx - 110} ${hy + 150} ${hx + 110} ${hy + 150} ${hx + 112} ${hy + 30} C${hx + 80} ${hy + 110} ${hx - 80} ${hy + 110} ${hx - 112} ${hy + 30} Z" fill="#1b1b1b"/>
   <rect x="${hx - 104}" y="${hy - 34}" width="92" height="56" rx="18" fill="#111" stroke="#F4C430" stroke-width="6"/><rect x="${hx + 12}" y="${hy - 34}" width="92" height="56" rx="18" fill="#111" stroke="#F4C430" stroke-width="6"/>
   <path d="M${hx - 12} ${hy - 10} L${hx + 12} ${hy - 10}" stroke="#F4C430" stroke-width="6"/><path d="M${hx - 90} ${hy - 22} l30 0" stroke="#fff" stroke-width="5" opacity=".6"/>
   <path d="M${hx - 96} ${hy - 50 - p.brow * 10} l60 -6 M${hx + 96} ${hy - 50 - p.brow * 10} l-60 -6" stroke="#1b1b1b" stroke-width="12" stroke-linecap="round"/>`;
  const mo = clamp(p.mouthO);
  s += mo < .06 ? `<path d="M${hx - 40} ${hy + 64} Q${hx} ${f1(hy + 64 + 26 * p.smile)} ${hx + 40} ${hy + 64}" stroke="#fff" stroke-width="9" fill="none" stroke-linecap="round"/>`
    : `<ellipse cx="${hx}" cy="${f1(hy + 70)}" rx="42" ry="${f1(10 + 26 * mo)}" fill="#5A1414" stroke="#fff" stroke-width="6"/>`;
  // headset dourado
  s += `<path d="M${hx - 128} ${hy + 10} C${hx - 140} ${hy - 200} ${hx + 140} ${hy - 200} ${hx + 128} ${hy + 10}" stroke="${C.out}" stroke-width="30" fill="none"/>
   <path d="M${hx - 128} ${hy + 10} C${hx - 140} ${hy - 200} ${hx + 140} ${hy - 200} ${hx + 128} ${hy + 10}" stroke="#F4C430" stroke-width="18" fill="none"/>
   <rect x="${hx - 160}" y="${hy - 36}" width="58" height="100" rx="24" fill="#F4C430" stroke="${C.out}" stroke-width="8"/><rect x="${hx + 102}" y="${hy - 36}" width="58" height="100" rx="24" fill="#F4C430" stroke="${C.out}" stroke-width="8"/>`;
  return s;
}
function bubble(x, y, w, h, lines, t, t0, tail) {
  const a = EZ.back(prog(t, t0, .3)); if (a <= 0) return '';
  return `<g transform="translate(${x} ${y}) scale(${a.toFixed(3)})"><path d="M${-w / 2} ${-h / 2} h${w} v${h} h${-w / 2 + 40} l${tail} 70 l-10 -70 h${-w / 2 + 30 - tail + 10} Z" fill="#fff" stroke="#000" stroke-width="8" stroke-linejoin="round"/>
   ${lines.map((l, i) => `<text y="${f1(-h / 2 + 70 + i * 68)}" font-family="Luckiest" font-size="54" fill="#111" text-anchor="middle">${l}</text>`).join('')}</g>`;
}

// ==================================================================== EP. 6 – "Operação Collab"
// (reaproveita: Dudu, hairSVG, momParts, quarto, choiceBoard, icon, confettiAt, capSVG, brunaoParts, bubble)

// -------------------------------------------------------------------- estado da história
const fmt = n => Math.round(n).toLocaleString('pt-BR');
function viewers(t) {
  if (t < T('dezmil', 1)) return 812;
  if (t < T('explodiu', 2)) return lerp(812, 10000, EZ.out(prog(t, T('dezmil', 1), .7)));
  return lerp(10000, 12500, EZ.out(prog(t, T('explodiu', 2), 1.2)));
}
const fame = t => t < T('seguidores', 1) ? 25 : 40;
const budget = t => 7.5;
const isLive = t => t >= T('dezmil');
const HAIR = { hair: 'buzz', cowScale: 1 };
const raysOn = t => false;
const sparkOn = t => false;
function followers(t) { return t < T('seguidores', 1) ? 812 : lerp(812, 3812, EZ.out(prog(t, T('seguidores', 1), 1.2))); }

// -------------------------------------------------------------------- quarto (a mãe não acredita)
function screenContent(t) {
  const x0 = 1086, y0 = 866, w = 298, h = 198;
  return `<g clip-path="url(#screenClip)"><rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="#17171f"/>
    <text x="${x0 + w / 2}" y="${y0 + 90}" font-family="Anton" font-size="30" fill="#F4C430" text-anchor="middle">BRUNÃO</text>
    <text x="${x0 + w / 2}" y="${y0 + 130}" font-family="Nunito" font-weight="800" font-size="18" fill="#fff" text-anchor="middle">convite: live amanhã 🎮</text></g>`;
}
function momPose(t) {
  const t0 = T('mae') - .15, t1 = T('estudio') - .2;
  if (t < t0 || t > t1 + .5) return null;
  const x = lerp(-300, 430, EZ.back(prog(t, t0, .4))) - lerp(0, 800, EZ.inOut(prog(t, t1, .45)));
  return { x, lid: 0, smile: -.3, brow: 1, mouthO: Math.max(env('mae', t) * .9, .35) };
}
function roomLayer(t) {
  const cam = [660, 930, 1.12];
  const q = { dy: Math.sin(t * 2.2) * 3, tilt: Math.sin(t * .9) * 1.5, soot: 0, hairSt: HAIR, headExtra: capSVG(), smile: .9, sparkle: 1, lid: 0, brow: .5, lookX: -.7 };
  const dud = duduParts(t, q), mp = momPose(t);
  let s = `<g transform="translate(540 960) scale(${cam[2]}) translate(${-cam[0]} ${-cam[1]})">`;
  s += worldScene(t, cam) + dud.legs + dud.back + (mp ? momParts(t, mp) : '') + worldFront(t, dud, mp) + `</g>`;
  return s;
}

// -------------------------------------------------------------------- estúdio do Brunão
const FALL_T0 = () => T('caiu', 1) + .15;
function fallAngleAt(tf) {
  const e = tf - FALL_T0(); if (e <= 0) return 0;
  if (e < .4) return -65 * Math.pow(e / .4, 2);
  return -65 + 5 * Math.sin((e - .4) * 18) * Math.exp(-(e - .4) * 6);
}
function studioTime(t) {  // replay em câmera lenta
  if (btw(t, T('denovo', 0), T('denovo', 2))) return FALL_T0() - .35 + (t - T('denovo', 0)) * .45;
  return t;
}
function studioFall(t) { return t >= T('seguidores') ? 0 : fallAngleAt(studioTime(t)); }
let SKF = null;
function studioCam(t) {
  if (!SKF) SKF = [
    { t: 0, c: [540, 960, 1.0], d: 0 },
    { t: T('estudio', 1), c: [540, 900, 1.08], d: 2.5, e: 'inOut' },
    { t: T('luxo', 0) - .1, c: [540, 520, 1.9], d: .28, e: 'back' },
    { t: T('luxo', 1) - .1, c: [600, 840, 2.3], d: .28, e: 'back' },
    { t: T('luxo', 3) - .1, c: [960, 1000, 1.7], d: .28, e: 'back' },
    { t: T('dezmil', 0) - .1, c: [540, 960, 1.0], d: .3, e: 'inOut' },
    { t: T('travou', 0) - .1, c: [470, 800, 2.3], d: .26, e: 'back' },
    { t: T('brunao'), c: [650, 900, 1.35], d: 0 },
    { t: T('historia', 0) - .1, c: [520, 880, 1.6], d: .26, e: 'back' },
    { t: T('caiu', 0) - .1, c: [480, 980, 1.15], d: .3, e: 'out' },
    { t: T('denovo', 2) - .1, c: [330, 1120, 1.5], d: .3, e: 'back' },
    { t: T('tobem', 0) - .1, c: [220, 1060, 1.8], d: .26, e: 'back' },
    { t: T('seguidores'), c: [540, 960, 1.0], d: 0 },
  ];
  let from = SKF[0].c, k = SKF[0];
  for (let i = 1; i < SKF.length && SKF[i].t <= t; i++) {
    const u = k.d ? EZ[k.e || 'inOut'](clamp((SKF[i].t - k.t) / k.d)) : 1;
    from = from.map((v, j) => lerp(v, k.c[j], u)); k = SKF[i];
  }
  const u = k.d ? EZ[k.e || 'inOut'](clamp((t - k.t) / k.d)) : 1;
  const c = from.map((v, j) => lerp(v, k.c[j], u));
  const e = t - (FALL_T0() + .4), a = e > 0 && e < .5 && t < T('denovo') ? 30 * (1 - e / .5) : 0;
  c[0] += Math.sin(t * 83) * a / c[2]; c[1] += Math.cos(t * 71) * a / c[2];
  return c;
}
function dudStudio(t) {
  const tf = studioTime(t);
  const q = { dy: Math.sin(t * 2.2) * 3, tilt: Math.sin(t * .9) * 1.5, soot: 0, hairSt: HAIR, lid: blinkLid(t, .2), legs: false };
  if (t < T('dezmil')) Object.assign(q, { sparkle: 1, smile: .8, mouthO: .3, lookX: btw(t, T('luxo', 3), T('dezmil')) ? .9 : (btw(t, T('luxo', 0), T('luxo', 1)) ? 0 : .3), lookY: btw(t, T('luxo', 0), T('luxo', 1)) ? -1 : 0 });
  else if (t < T('travou')) Object.assign(q, { smile: .6, lid: t >= T('dezmil', 1) ? 0 : .2, brow: t >= T('dezmil', 1) ? .9 : .3, pupil: t >= T('dezmil', 1) ? 10 : 18 });
  else if (t < T('brunao', 2)) Object.assign(q, { lid: 0, pupil: 7, mouthO: .15, smile: 0, dy: 0, tilt: 0, brow: .9 });
  else if (t < T('historia')) Object.assign(q, { smile: .5, brow: .4 });
  else if (t < T('caiu')) { const w = Math.sin(t * 5); Object.assign(q, { armR: [120 + 15 * w, 150], mouthO: env('historia', t) * .85, smile: .8, brow: .5, lid: 0 }); }
  else if (t < T('tobem') && tf < FALL_T0()) Object.assign(q, { armL: [150, 172], armR: [150, 172], smile: 1, sparkle: 1, tilt: -6, lid: .2 });
  else if (t < T('tobem')) { const w = Math.sin(t * 30); Object.assign(q, { armL: [150 + w * 15, 170], armR: [150 - w * 15, 170], mouthO: .85, brow: 1, lid: 0, pupil: 8, smile: -.3 }); }
  else if (t < T('seguidores')) Object.assign(q, { armR: [-18, -172], holdR: 'thumb', mouthO: env('tobem', t) * .85, smile: .6, lid: .3, pupil: 10, brow: .5 });
  else { const w = Math.sin(t * 9); Object.assign(q, { armL: [150 + 10 * w, 172], armR: [150 - 10 * w, 172], smile: 1, mouthO: .4, sparkle: 1, lid: 0 }); q.dy += -Math.abs(Math.sin(t * 8)) * 12; }
  return q;
}
function brunaoStudio(t) {
  const laugh = (btw(t, FALL_T0() + .3, T('explodiu')) || btw(t, T('historia', 4), T('caiu'))) ? .5 + .3 * Math.abs(Math.sin(t * 16)) : 0;
  const talk = (btw(t, T('dezmil', 0), T('travou')) || btw(t, T('brunao', 1), T('historia'))) ? .3 + .25 * Math.abs(Math.sin(t * 18)) : 0;
  return { smile: .8, brow: btw(t, T('travou'), T('brunao', 1)) ? 1 : .2, mouthO: Math.max(laugh, talk) };
}
function hexPanels(t) {
  let s = '';
  for (let r = 0; r < 7; r++) for (let c = 0; c < 9; c++) {
    const x = 60 + c * 120 + (r % 2) * 60, y = 120 + r * 104, h = (t * 40 + c * 25 + r * 40) % 360;
    s += `<path transform="translate(${x} ${y})" d="M0 -58 L50 -29 L50 29 L0 58 L-50 29 L-50 -29 Z" fill="hsl(${f1(h)} 80% 55%)" opacity=".28" stroke="#05030c" stroke-width="6"/>`;
  }
  return s;
}
function studioScene(t) {
  const cam = studioCam(t), A = studioFall(t), tf = studioTime(t);
  let s = `<g transform="translate(540 960) scale(${cam[2].toFixed(4)}) translate(${f1(-cam[0])} ${f1(-cam[1])})">
   <rect x="-500" y="-500" width="2100" height="2900" fill="#120d22"/>${hexPanels(t)}
   <text x="540" y="290" font-family="Luckiest" font-size="130" fill="#3EC5FF" text-anchor="middle" opacity=".7" transform="translate(6 6)">BRUNÃO</text>
   <text x="540" y="290" font-family="Luckiest" font-size="130" fill="#FF4FD8" text-anchor="middle" filter="url(#glowF)" opacity=".9">BRUNÃO</text>
   <text x="540" y="290" font-family="Luckiest" font-size="130" fill="#FFD6F5" text-anchor="middle">BRUNÃO</text>`;
  // três monitores
  [[110, 420, '#1E88E5'], [400, 405, '#E53935'], [690, 420, '#43A047']].forEach(([x, y, c], i) => {
    s += `<rect x="${x}" y="${y}" width="280" height="${i === 1 ? 185 : 170}" rx="12" fill="#0a0a0f" stroke="#000" stroke-width="8"/>
     <rect x="${x + 12}" y="${y + 12}" width="256" height="${i === 1 ? 161 : 146}" fill="${c}"/>
     <circle cx="${x + 140}" cy="${y + 85}" r="${f1(14 + 6 * Math.sin(t * 4 + i))}" fill="none" stroke="#fff" stroke-width="5"/><path d="M${x + 120} ${y + 85} h40 M${x + 140} ${y + 65} v40" stroke="#fff" stroke-width="4"/>
     <rect x="${x + 30 + ((t * 120 + i * 60) % 180)}" y="${y + 120}" width="30" height="20" fill="#000" opacity=".5"/>`;
  });
  // geladeira de energético
  s += `<rect x="870" y="700" width="190" height="600" rx="16" fill="#d9dbe3" stroke="#000" stroke-width="8"/><rect x="886" y="716" width="158" height="568" rx="10" fill="#0d1a12"/>
   <rect x="886" y="716" width="158" height="568" rx="10" fill="#3DDC84" opacity=".12"/>`;
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) s += `<rect x="${896 + c * 37}" y="${740 + r * 135}" width="28" height="90" rx="6" fill="${(r + c) % 2 ? '#3DDC84' : '#39C2FF'}" stroke="#000" stroke-width="4"/>`;
  // microfone de 2 mil
  s += `<path d="M780 360 L700 620 L590 800" stroke="#000" stroke-width="18" fill="none"/><path d="M780 360 L700 620 L590 800" stroke="#F4C430" stroke-width="9" fill="none"/>
   <g transform="translate(575 835) rotate(30)"><rect x="-34" y="-70" width="68" height="140" rx="34" fill="#222" stroke="#000" stroke-width="7"/><rect x="-26" y="-60" width="52" height="70" rx="26" fill="#F4C430" stroke="#000" stroke-width="5"/>
   ${[-46, -32, -18].map(y => `<path d="M-22 ${y} L22 ${y}" stroke="#a37c00" stroke-width="4"/>`).join('')}</g>`;
  // Brunão (sentado ao lado)
  s += `<g transform="translate(830 1000) scale(.75) translate(-790 -1000)">${brunaoParts(t, brunaoStudio(t))}</g>`;
  // trono + Dudu (caem juntos)
  const dp = duduParts(t, dudStudio(t));
  const head = [470 + 442 * Math.sin(A * Math.PI / 180), 1250 - 442 * Math.cos(A * Math.PI / 180)];
  s += `<g transform="rotate(${f1(A)} 470 1250)">
   <path d="M290 1260 L280 650 Q290 520 470 508 Q650 520 660 650 L650 1260 Z" fill="#141418" stroke="#000" stroke-width="11" stroke-linejoin="round"/>
   <path d="M312 1240 L304 660 Q312 548 470 538 Q628 548 636 660 L628 1240" stroke="#F4C430" stroke-width="12" fill="none"/>
   <path d="M410 520 L430 470 L450 505 L470 455 L490 505 L510 470 L530 520 Z" fill="#F4C430" stroke="#000" stroke-width="6"/>
   <g transform="translate(470 1000) scale(.8) translate(-820 -1000)">${dp.back}${dp.arms}</g>`;
  if (t >= T('denovo', 2) && t < T('seguidores')) {
    const a = EZ.back(prog(t, T('denovo', 2), .3));
    s += `<g transform="translate(600 700) scale(${a.toFixed(3)}) rotate(12)"><path d="M0 -60 L0 0" stroke="#000" stroke-width="4"/><rect x="-110" y="0" width="220" height="90" rx="14" fill="#fff" stroke="#000" stroke-width="7"/>
     <text y="62" font-family="Anton" font-size="56" fill="#C0392B" text-anchor="middle">R$ 5.000</text></g>`;
  }
  s += `</g>`;
  // ícone "carregando" em cima do Dudu travado
  if (btw(t, T('travou', 1) - .1, T('brunao', 2))) {
    const a = EZ.back(prog(t, T('travou', 1) - .1, .25));
    s += `<g transform="translate(470 560) scale(${a.toFixed(3)})"><circle r="56" fill="#000" opacity=".6"/><circle r="40" fill="none" stroke="#555" stroke-width="12"/>
     <path d="M0 -40 A40 40 0 0 1 40 0" stroke="#fff" stroke-width="12" fill="none" stroke-linecap="round" transform="rotate(${f1(t * 400)})"/>
     <text y="100" font-family="Anton" font-size="34" fill="#fff" text-anchor="middle" stroke="#000" stroke-width="6" paint-order="stroke">CARREGANDO...</text></g>`;
  }
  // estrelinhas de tontura
  if (t >= T('denovo', 2) && t < T('seguidores')) for (let i = 0; i < 3; i++) {
    const a = t * 4 + i * 2.09, x = head[0] + Math.cos(a) * 100, y = head[1] - 130 + Math.sin(a) * 28;
    s += `<path transform="translate(${f1(x)} ${f1(y)}) scale(.9)" d="M0 -26 L7 -8 L26 -8 L11 4 L17 24 L0 12 L-17 24 L-11 4 L-26 -8 L-7 -8 Z" fill="${C.yellow}" stroke="#000" stroke-width="4"/>`;
  }
  // mesa
  s += `<rect x="-500" y="1250" width="2100" height="1100" fill="#0e0b18"/><rect x="-500" y="1250" width="2100" height="14" fill="hsl(${(t * 140) % 360} 90% 60%)"/>
   <rect x="-500" y="1264" width="2100" height="40" fill="hsl(${(t * 140) % 360} 90% 60%)" opacity=".18"/>
   <path d="M330 1300 L610 1300 L622 1330 L318 1330 Z" fill="#1d1d26" stroke="#000" stroke-width="6"/><path d="M700 1300 L960 1300 L972 1330 L688 1330 Z" fill="#1d1d26" stroke="#000" stroke-width="6"/>
   <rect x="140" y="1180" width="44" height="90" rx="6" fill="#3DDC84" stroke="#000" stroke-width="6"/><rect x="1000" y="1190" width="44" height="80" rx="6" fill="#39C2FF" stroke="#000" stroke-width="6"/>`;
  s += `</g>`;
  // balões do Brunão
  if (btw(t, T('dezmil', 0), T('travou'))) s += bubble(700, 430, 700, 220, ['SALVE, GALERA!', 'HOJE TEM CONVIDADO!'], t, T('dezmil', 0), -40);
  if (btw(t, T('brunao', 2), T('historia'))) s += bubble(640, 430, 820, 220, ['CONTA A HISTÓRIA', 'DA CADEIRA!'], t, T('brunao', 2), -40);
  if (btw(t, FALL_T0() + .5, T('tobem'))) s += bubble(760, 420, 520, 150, ['KKKKKKKKK'], t, FALL_T0() + .5, -50);
  // replay
  if (btw(t, T('denovo', 0), T('denovo', 2))) {
    s += `<rect width="1080" height="1920" fill="#3a2a10" opacity=".18"/><rect width="1080" height="200" fill="#000"/><rect y="1720" width="1080" height="200" fill="#000"/>
     <text x="60" y="300" font-family="Anton" font-size="80" fill="#FF3B3B" stroke="#000" stroke-width="8" paint-order="stroke">⏪ REPLAY</text>
     <circle cx="950" cy="275" r="20" fill="#FF3B3B" opacity="${(.5 + .5 * Math.sin(t * 8)).toFixed(2)}"/>`;
  }
  // seguidores
  if (t >= T('seguidores', 0)) {
    const a = EZ.back(prog(t, T('seguidores', 0) + .1, .35));
    s += `<g transform="translate(540 560) scale(${a.toFixed(3)})"><rect x="-340" y="-150" width="680" height="300" rx="36" fill="#000" opacity=".8" stroke="${C.yellow}" stroke-width="8"/>
     <text y="-70" font-family="Anton" font-size="56" fill="#fff" text-anchor="middle" letter-spacing="4">SEGUIDORES</text>
     <text y="50" font-family="Anton" font-size="130" fill="${C.yellow}" text-anchor="middle">${fmt(followers(t))}</text>
     ${t >= T('seguidores', 1) ? `<text y="120" font-family="Anton" font-size="48" fill="#3DDC84" text-anchor="middle">+3.000 NUMA NOITE</text>` : ''}</g>`;
  }
  return s;
}

// -------------------------------------------------------------------- chat com o hater
function chatUI(t, mode) {
  const late = mode === 'late';
  let s = `<rect width="1080" height="1920" fill="#0D0B1E"/><circle cx="540" cy="700" r="900" fill="url(#purpleR)"/>
   <rect width="1080" height="1920" fill="url(#dotP)" opacity=".35"/>
   <g transform="rotate(-1.2 540 960)">
   <rect x="64" y="300" width="952" height="1040" rx="40" fill="#000" opacity=".45" transform="translate(10 16)"/>
   <rect x="64" y="300" width="952" height="1040" rx="40" fill="#17142B" stroke="#F4C430" stroke-width="5"/>
   <rect x="104" y="332" width="200" height="56" rx="28" fill="#E53935"/>
   <circle cx="134" cy="360" r="11" fill="#fff" opacity="${(.5 + .5 * Math.sin(t * 8)).toFixed(2)}"/>
   <text x="218" y="378" font-family="Anton" font-size="36" fill="#fff" text-anchor="middle">AO VIVO</text>
   <text x="330" y="376" font-family="Nunito" font-weight="800" font-size="34" fill="#F4C430">Brunão_Oficial</text>
   <text x="976" y="378" font-family="Anton" font-size="40" fill="#fff" text-anchor="end">👁 ${fmt(viewers(t))}</text>`;
  const wq = late ? { soot: 0, smile: -.5, brow: .9, lid: .3, hairSt: HAIR, lookY: .4 } : { soot: 0, smile: 0, brow: .9, lid: 0, pupil: 7, mouthO: .15, hairSt: HAIR };
  const dp = duduParts(t, Object.assign({ legs: false }, wq));
  s += `<clipPath id="camC2"><rect x="104" y="410" width="872" height="360" rx="18"/></clipPath>
   <g clip-path="url(#camC2)"><rect x="104" y="410" width="872" height="360" fill="#120d22"/>${'' }
   <g transform="translate(400 760) scale(.6) translate(-820 -860)">${dp.back}${dp.arms}</g>
   <g transform="translate(740 760) scale(.46) translate(-790 -860)">${brunaoParts(t, { smile: late ? .8 : .3, brow: late ? .2 : 1, mouthO: 0 })}</g></g>
   <rect x="104" y="790" width="872" height="520" rx="24" fill="#100E22" stroke="#2D2654" stroke-width="4"/>
   <text x="140" y="845" font-family="Anton" font-size="38" fill="#8f86c9" letter-spacing="2">CHAT DA LIVE</text>
   <path d="M120 866 L960 866" stroke="#2D2654" stroke-width="4"/>`;
  const av = (c, ch) => `<circle cx="37" cy="30" r="32" fill="${c}" stroke="#000" stroke-width="4"/><text x="37" y="44" font-family="Anton" font-size="34" fill="#fff" text-anchor="middle">${ch}</text>`;
  const msg = (y, t0, avatar, name, ncol, line) => {
    const u = EZ.back(prog(t, t0, .25)); if (u <= 0) return '';
    return `<g transform="translate(140 ${y}) scale(${u.toFixed(3)})" opacity="${clamp(u).toFixed(2)}">
     <rect x="-14" y="-14" width="828" height="110" rx="22" fill="#1E1A3A"/>${avatar}
     <text x="96" y="30" font-family="Nunito" font-weight="800" font-size="30" fill="${ncol}">${name}</text>
     <text x="96" y="76" font-family="Nunito" font-weight="800" font-size="32" fill="#fff">${line}</text></g>`;
  };
  const hater = av('#8B0000', 'T');
  if (!late) {
    s += msg(895, -9, av('#39C2FF', 'G'), 'gamer_lindo22', '#39C2FF', 'KKKK ele travou');
    s += msg(1015, T('hater', 1), av('#FF7AB6', 'A'), 'ana.clips', '#FF7AB6', 'alguém reinicia ele 😭');
    s += msg(1135, T('hater', 2), hater, 'toxico_br', '#FF3B3B', 'quem é esse entregador? 🙄');
    if (t >= T('hater', 3)) s += hlCircle(560, 1190, 480, 75, t, T('hater', 3), 1);
  } else {
    s += msg(895, -9, av('#FF7AB6', '♥'), 'mamae_coruja', '#FF7AB6', 'meu filho é estrela ⭐');
    s += msg(1015, -9, av('#555', '?'), 'xX_Desconhecido_Xx', '#FFB020', 'essa foi boa. de novo.');
    s += msg(1135, T('hater2', 2), hater, 'toxico_br', '#FF3B3B', 'ele cai de propósito. é tudo fake 🙄');
    if (t >= T('hater2', 3)) s += hlCircle(560, 1190, 480, 75, t, T('hater2', 3), 1);
  }
  return s + `</g>`;
}

// -------------------------------------------------------------------- celular (1 milhão de views)
function phoneScene(t) {
  const tc = FALL_T0() - .7 + ((t - T('explodiu')) % 1.9);
  let s = `<rect width="1080" height="1920" fill="#120C24"/><circle cx="540" cy="820" r="950" fill="url(#purpleR)"/><rect width="1080" height="1920" fill="url(#dotP)" opacity=".3"/>`;
  seed = 21;
  for (let i = 0; i < 16; i++) { const ph = (t * .6 + rnd()) % 1, x = 870 + rnd() * 160 + Math.sin(t * 3 + i) * 20, y = 1300 - ph * 1000;
    s += `<path transform="translate(${f1(x)} ${f1(y)}) scale(${f1(.8 + rnd() * .8)})" d="M0 14 C-26 -4 -16 -24 0 -12 C16 -24 26 -4 0 14 Z" fill="${i % 3 ? '#FF4757' : '#FF7AB6'}" opacity="${f1(1 - ph)}"/>`; }
  s += `<g transform="rotate(-3 540 820)"><rect x="240" y="292" width="600" height="1050" rx="64" fill="#000" opacity=".5" transform="translate(12 18)"/>
   <rect x="240" y="292" width="600" height="1050" rx="64" fill="#0b0b10" stroke="#3a3a48" stroke-width="8"/>
   <clipPath id="phC"><rect x="262" y="314" width="556" height="1006" rx="46"/></clipPath>
   <g clip-path="url(#phC)"><rect x="262" y="314" width="556" height="1006" fill="#000"/>
   <g transform="translate(262 330) scale(${(556 / 1080).toFixed(4)})">${studioScene(tc)}</g>
   <rect x="262" y="314" width="556" height="1006" fill="url(#phoneShade)"/>
   ${[['❤️', '98 mil', 900], ['💬', '4.120', 1010], ['↗️', '12 mil', 1120]].map(([ic, n, y]) => `<text x="772" y="${y}" font-size="46" text-anchor="middle">${ic}</text><text x="772" y="${y + 36}" font-family="Nunito" font-weight="800" font-size="20" fill="#fff" text-anchor="middle">${n}</text>`).join('')}
   <text x="290" y="1240" font-family="Nunito" font-weight="800" font-size="26" fill="#fff">@Brunão_Oficial</text>
   <text x="290" y="1280" font-family="Nunito" font-weight="800" font-size="22" fill="#fff" opacity=".9">o tombo 2: cadeira de 5 mil 💀</text></g>
   <rect x="470" y="326" width="140" height="22" rx="11" fill="#0b0b10"/></g>`;
  const u = EZ.out(prog(t, T('explodiu', 1), T('explodiu', 3) - T('explodiu', 1) + .2));
  const v = Math.round(lerp(3, 1000000, u)), pop = 1 + .06 * Math.sin(t * 30) * (u < 1 ? 1 : 0);
  s += `<g transform="translate(540 236) scale(${pop.toFixed(3)})"><rect x="-300" y="-52" width="600" height="96" rx="48" fill="#000" stroke="${C.yellow}" stroke-width="6"/>
   <text y="22" font-family="Anton" font-size="62" fill="${C.yellow}" text-anchor="middle">👁 ${u >= 1 ? '1.000.000+' : v.toLocaleString('pt-BR')} VIEWS</text></g>`;
  [['KKKKKKK DE NOVO', 1, 520], ['a cadeira de 5 mil 💀', 2, 700], ['esse cara é lenda', 3, 880]].forEach(([txt, k, y], i) => {
    const a = EZ.back(prog(t, T('explodiu', k) + .1, .3)); if (a <= 0) return;
    s += `<g transform="translate(${i % 2 ? 120 : 90} ${y}) scale(${a.toFixed(3)}) rotate(${i % 2 ? 4 : -4})"><rect x="0" y="-44" width="${txt.length * 21 + 40}" height="70" rx="35" fill="#fff" stroke="#000" stroke-width="5"/>
     <text x="20" y="4" font-family="Nunito" font-weight="800" font-size="32" fill="#111">${txt}</text></g>`;
  });
  return s;
}

// -------------------------------------------------------------------- votação
function iconEP4(kind) {
  if (kind === 'gorjeta') return `<g transform="rotate(-10)"><rect x="-90" y="-48" width="180" height="96" rx="10" fill="#E0A458" stroke="#000" stroke-width="7"/><circle r="26" fill="#F4D7A1" stroke="#000" stroke-width="4"/><text y="14" font-family="Anton" font-size="40" fill="#7a4a12" text-anchor="middle">50</text></g>`;
  if (kind === 'responder') return `<path d="M-90 -70 Q-90 -100 -60 -100 L60 -100 Q90 -100 90 -70 L90 10 Q90 40 60 40 L-10 40 L-50 80 L-44 40 L-60 40 Q-90 40 -90 10 Z" fill="#E53935" stroke="#000" stroke-width="8"/>
    <text y="10" font-family="Anton" font-size="96" fill="#fff" text-anchor="middle">!?</text>`;
  if (kind === 'ignorar') return `<path d="M-80 20 C-90 -110 90 -110 80 20" stroke="#000" stroke-width="26" fill="none"/><path d="M-80 20 C-90 -110 90 -110 80 20" stroke="#39C2FF" stroke-width="14" fill="none"/>
    <rect x="-104" y="0" width="50" height="86" rx="20" fill="#39C2FF" stroke="#000" stroke-width="7"/><rect x="54" y="0" width="50" height="86" rx="20" fill="#39C2FF" stroke="#000" stroke-width="7"/>
    <text x="0" y="-60" font-family="Luckiest" font-size="40" fill="#fff" stroke="#000" stroke-width="6" paint-order="stroke" text-anchor="middle">zzz</text>`;
  return icon(kind);
}
const recapScene = t => choiceBoard(t, {
  slideT: -1, banner: 'RESULTADO DA VOTAÇÃO', loserDim: T('votaram', 1), soot: 0, hairSt: HAIR, headExtra: capSVG(),
  left: { word: 'COLLAB', sub: 'LIVE COM O BRUNÃO', col: C.yellow, icon: 'collab', popT: T('votaram', 1) },
  right: { word: 'GORJETA', sub: 'PEGAR OS R$ 50', col: C.blue, icon: 'gorjeta', popT: -9 },
});
const finalScene = t => choiceBoard(t, {
  slideT: T('opcoes'), banner: 'COMENTE UMA PALAVRA', bubT: T('comenta', 1), arrowT: T('comenta', 2), tagT: T('ep7', 3), tag: 'EP. 7 →', soot: 0, hairSt: HAIR,
  left: { word: 'RESPONDER', sub: 'RESPONDER O HATER', col: C.yellow, icon: 'responder', popT: T('opcoes', 1) },
  right: { word: 'IGNORAR', sub: 'IGNORAR O HATER', col: C.blue, icon: 'ignorar', popT: T('opcoes', 3) },
});

// -------------------------------------------------------------------- HUD
function hud(t) {
  const box = (x, label, val) => `<rect x="${x}" y="48" width="250" height="118" rx="20" fill="#0B0A16" opacity=".85" stroke="#ffffff22" stroke-width="3"/>
   <text x="${x + 125}" y="86" font-family="Anton" font-size="24" fill="#9a93c7" text-anchor="middle" letter-spacing="2">${label}</text>${val}`;
  const v = viewers(t), fm = fame(t), b = budget(t), lv = isLive(t);
  const vp = k => btw(t, k, k + .5) ? 1 + .4 * (1 - EZ.out(prog(t, k, .5))) : 1;
  const vs = fmt(v);
  let s = `<g opacity=".96">`;
  s += box(16, 'STATUS', lv ? `<circle cx="52" cy="128" r="11" fill="#FF3B3B" opacity="${(.55 + .45 * Math.sin(t * 7)).toFixed(2)}"/><text x="150" y="144" font-family="Anton" font-size="44" fill="#FF3B3B" text-anchor="middle">AO VIVO</text>`
    : `<text x="141" y="144" font-family="Anton" font-size="44" fill="#777" text-anchor="middle">OFFLINE</text>`);
  s += box(278, 'ESPECTADORES', `<text x="403" y="148" font-family="Anton" font-size="${f1((vs.length > 5 ? 46 : 54) * vp(T('dezmil', 1)))}" fill="#3DDC84" text-anchor="middle">${vs}</text>`);
  s += box(540, 'FAMA', `<rect x="562" y="114" width="140" height="22" rx="11" fill="#262338"/><rect x="562" y="114" width="${f1(140 * fm / 100 + 6)}" height="22" rx="11" fill="#3DDC84"/>
     <text x="748" y="140" font-family="Anton" font-size="${f1(38 * vp(T('seguidores', 1)))}" fill="#3DDC84" text-anchor="middle">${fm}%</text>`);
  s += box(802, 'ORÇAMENTO', `<text x="927" y="144" font-family="Anton" font-size="40" fill="${C.yellow}" text-anchor="middle">${brl(b)}</text>`);
  s += `</g>`;
  if (btw(t, T('estudio'), T('luxo'))) {
    const a = EZ.back(prog(t, T('estudio') + .1, .35)), o = 1 - prog(t, T('luxo') - .25, .25);
    s += `<g transform="translate(540 250) scale(${a.toFixed(3)}) rotate(-2)" opacity="${o.toFixed(2)}">
     <path d="M-400 -46 L400 -46 L370 0 L400 46 L-400 46 L-370 0 Z" fill="#E53935" stroke="#000" stroke-width="8" stroke-linejoin="round"/>
     <text y="20" font-family="Anton" font-size="54" fill="#fff" text-anchor="middle" letter-spacing="2">EP. 6 · OPERAÇÃO COLLAB</text></g>`;
  }
  return s;
}

// -------------------------------------------------------------------- composição final
const MODES = () => [[0, 'recap'], [T('mae'), 'room'], [T('estudio'), 'studio'], [T('hater'), 'chat'], [T('brunao'), 'studio'], [T('explodiu'), 'phone'], [T('seguidores'), 'studio'], [T('hater2'), 'chat2'], [T('opcoes'), 'choice']];
function sceneFor(mode, t) {
  if (mode === 'room') return roomLayer(t);
  if (mode === 'studio') return studioScene(t);
  if (mode === 'chat') return chatUI(t, 'early');
  if (mode === 'chat2') return chatUI(t, 'late');
  if (mode === 'phone') return phoneScene(t);
  if (mode === 'recap') return recapScene(t);
  return finalScene(t);
}
window.render = function (t) {
  const frame = Math.round(t * FPS);
  const M = MODES();
  let idx = 0; for (let i = 0; i < M.length; i++) if (t >= M[i][0]) idx = i;
  const b = M[idx][0], nb = idx + 1 < M.length ? M[idx + 1][0] : 1e9;
  const tr = (p, outMode, inMode) => {
    const u = EZ.inOut(p), blur = 38 * Math.sin(Math.PI * p);
    return `<filter id="whipF" x="-20%" y="-5%" width="140%" height="110%"><feGaussianBlur stdDeviation="${f1(blur)} 0"/></filter>
      <g filter="url(#whipF)"><g transform="translate(${f1(-u * 1080)} 0)">${sceneFor(outMode, t)}</g>
      <g transform="translate(${f1((1 - u) * 1080)} 0)">${sceneFor(inMode, t)}</g></g>`;
  };
  let body;
  if (idx > 0 && t < b + .16) body = tr((t - (b - .14)) / .3, M[idx - 1][1], M[idx][1]);
  else if (t > nb - .14) body = tr((t - (nb - .14)) / .3, M[idx][1], M[idx + 1][1]);
  else body = sceneFor(M[idx][1], t);
  const sh = (t0, amp, d) => { const e = t - t0; return e > 0 && e < d ? amp * (1 - e / d) : 0; };
  const a = sh(0, 26, .5) + sh(T('votaram', 1), 18, .4) + sh(T('opcoes'), 12, .4);
  if (a > 0) body = `<g transform="translate(${f1(Math.sin(t * 83) * a)} ${f1(Math.cos(t * 71) * a)})">${body}</g>`;
  const fl = (t0, d) => { const e = t - t0; return e >= 0 && e < d ? 1 - e / d : 0; };
  const flash = Math.max(fl(T('votaram', 1), .25) * .5, fl(FALL_T0() + .4, .2) * .5, fl(T('opcoes'), .2) * .5);
  let out = DEFS.replace('SEED', String(frame % 9)).replace('</defs>', `<linearGradient id="phoneShade" x1="0" y1="0" x2="0" y2="1"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".65"/></linearGradient></defs>`) + body;
  out += confettiAt(t, T('dezmil', 1)) + confettiAt(t, T('seguidores', 1));
  out += `<rect width="1080" height="1920" fill="url(#vig)"/>`;
  if (flash > 0) out += `<rect width="1080" height="1920" fill="#fff" opacity="${flash.toFixed(2)}"/>`;
  out += `<rect width="1080" height="1920" filter="url(#grainF)" opacity=".07" style="mix-blend-mode:overlay"/>`;
  out += hud(t) + caption(t);
  document.getElementById('main').innerHTML = out;
};
window.TOTAL = TOTAL;
