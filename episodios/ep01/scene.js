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
  // cabelo
  const cw = p.cowlick;
  head += `<path d="M655 740 C640 610 700 568 760 574 C772 548 840 538 872 566 C935 548 1002 610 986 740 C975 690 952 660 930 650 L914 676 L890 640 L860 666 L835 632 L806 662 L780 634 L752 668 L730 640 L702 676 C682 696 666 716 655 740 Z" fill="${C.hair}" stroke="${C.out}" stroke-width="8" stroke-linejoin="round"/>
   <path d="M690 612 L672 540 L728 578 L740 506 L786 566 L812 494 L840 560 L874 500 L892 566 L940 524 L934 590 L978 580 L952 628 Z" fill="${C.hair}" stroke="${C.out}" stroke-width="8" stroke-linejoin="round"/>
   <path d="M760 600 Q790 585 815 600 M850 590 Q880 576 905 595" stroke="#5a3a26" stroke-width="6" fill="none"/>
   <g transform="rotate(${f1(cw)} 842 520)"><path d="M842 522 Q830 452 892 440" stroke="${C.out}" stroke-width="26" fill="none" stroke-linecap="round"/>
   <path d="M842 522 Q830 452 892 440" stroke="${C.hair}" stroke-width="13" fill="none" stroke-linecap="round"/></g>`;
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

function screenContent(t) {
  // monitor: área 1086..1384 x 946..1144
  const x0 = 1086, y0 = 866, w = 298, h = 198;
  let s = `<g clip-path="url(#screenClip)">`;
  const live = t >= T('botao', 2) + .08;
  if (t < T('botao')) {
    // página do canal
    const zero = t >= T('canal', 4);
    const pulse = zero ? 1 + .08 * Math.sin(t * 14) : 1;
    s += `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="#141127"/>
    <rect x="${x0}" y="${y0}" width="${w}" height="56" fill="#6C3CE1"/>
    <circle cx="${x0 + 40}" cy="${y0 + 66}" r="28" fill="${C.skin}" stroke="#fff" stroke-width="4"/>
    <rect x="${x0 + 22}" y="${y0 + 58}" width="16" height="12" rx="3" fill="none" stroke="#111" stroke-width="3"/><rect x="${x0 + 42}" y="${y0 + 58}" width="16" height="12" rx="3" fill="none" stroke="#111" stroke-width="3"/>
    <text x="${x0 + 78}" y="${y0 + 80}" font-family="Nunito" font-weight="800" font-size="20" fill="#fff">DuduGamer_PRO</text>
    <text x="${x0 + 78}" y="${y0 + 100}" font-family="Nunito" font-weight="800" font-size="13" fill="#9a93c7">3 seguidores · 0 vídeos</text>
    <rect x="${x0 + 16}" y="${y0 + 114}" width="${w - 32}" height="72" rx="10" fill="#211c40"/>
    <text x="${x0 + 30}" y="${y0 + 158}" font-family="Anton" font-size="20" fill="#cfc9ff">ESPECTADORES</text>
    <text x="${x0 + w - 40}" y="${y0 + 176}" font-family="Anton" font-size="${f1(62 * pulse)}" fill="${zero ? '#FF4757' : '#fff'}" text-anchor="middle">0</text>`;
  } else if (!live) {
    const press = t >= T('botao', 2) - .05;
    const cu = EZ.inOut(prog(t, T('botao'), Math.max(.3, T('botao', 2) - T('botao') - .1)));
    const sc = press ? .9 : 1;
    s += `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="#0f0d1d"/>
     <text x="${x0 + w / 2}" y="${y0 + 46}" font-family="Nunito" font-weight="800" font-size="16" fill="#8b84b8" text-anchor="middle">PRONTO PARA TRANSMITIR?</text>
     <g transform="translate(${x0 + w / 2} ${y0 + 112}) scale(${sc})"><rect x="-110" y="-38" width="220" height="76" rx="38" fill="#E53935" stroke="#fff" stroke-width="4"/>
     <path d="M-78 -16 L-50 0 L-78 16 Z" fill="#fff"/><text x="12" y="13" font-family="Anton" font-size="34" fill="#fff" text-anchor="middle">INICIAR LIVE</text></g>`;
    const cx = lerp(x0 + 260, x0 + w / 2 + 40, cu), cy = lerp(y0 + 180, y0 + 122, cu);
    s += `<path d="M${f1(cx)} ${f1(cy)} l0 34 l9 -8 l7 15 l7 -3 l-7 -15 l12 0 Z" fill="#fff" stroke="#000" stroke-width="2.5"/>`;
  } else {
    // live: jogo + selo
    s += `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="#5EC8FF"/>
    <rect x="${x0}" y="${y0 + 150}" width="${w}" height="48" fill="#4CAF50"/><rect x="${x0}" y="${y0 + 150}" width="${w}" height="10" fill="#7BD65A"/>
    <rect x="${x0 + 150}" y="${y0 + 150}" width="46" height="48" fill="#141127"/>
    <circle cx="${x0 + 60}" cy="${y0 + 50}" r="16" fill="#fff" opacity=".9"/><circle cx="${x0 + 80}" cy="${y0 + 48}" r="20" fill="#fff" opacity=".9"/>
    ${[0, 1, 2].map(i => `<circle cx="${x0 + 210 + i * 26}" cy="${f1(y0 + 110 + Math.sin(t * 5 + i) * 5)}" r="8" fill="#FFD21F" stroke="#B8860B" stroke-width="2"/>`).join('')}
    <rect x="${x0 + 120}" y="${f1(y0 + 120 + ((t * 60) % 60))}" width="18" height="24" fill="#E53935" stroke="#000" stroke-width="2"/>
    <rect x="${x0 + 10}" y="${y0 + 10}" width="92" height="26" rx="6" fill="#E53935"/>
    <circle cx="${x0 + 24}" cy="${y0 + 23}" r="6" fill="#fff" opacity="${(.5 + .5 * Math.sin(t * 8)).toFixed(2)}"/>
    <text x="${x0 + 64}" y="${y0 + 30}" font-family="Anton" font-size="17" fill="#fff" text-anchor="middle">AO VIVO</text>`;
    const v = viewers(t);
    const flip = btw(t, T('entra', 1) - .1, T('entra', 2) + .4);
    const big = flip ? 1 + .3 * EZ.elastic(prog(t, T('entra', 1), .6)) : 1;
    s += `<rect x="${x0 + w - 100}" y="${y0 + 10}" width="90" height="26" rx="6" fill="rgba(0,0,0,.6)"/>
    <text x="${x0 + w - 55}" y="${y0 + 31}" font-family="Anton" font-size="19" fill="#fff" text-anchor="middle">👁 ${v}</text>`;
    if (flip) s += `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="rgba(20,10,40,.75)"/>
      <text x="${x0 + w / 2}" y="${y0 + 60}" font-family="Anton" font-size="22" fill="#cfc9ff" text-anchor="middle">ESPECTADORES</text>
      <text x="${x0 + w / 2}" y="${y0 + 160}" font-family="Anton" font-size="${f1(100 * big)}" fill="#3DDC84" text-anchor="middle" stroke="#000" stroke-width="4" paint-order="stroke">${v}</text>`;
  }
  s += `</g>`;
  return s;
}
const viewers = t => t >= T('entra', 1) ? 1 : 0;

function pizzaBox(t) {
  const face = t >= T('setup', 7) - .05 && t < T('ring1');
  const fu = EZ.back(prog(t, T('setup', 7) - .05, .3));
  let s = `<path d="M1118 1188 L1140 1060 L1348 1060 L1372 1188 Z" fill="#D9B27A" stroke="${C.out}" stroke-width="8" stroke-linejoin="round"/>
   <path d="M1150 1082 L1338 1082" stroke="#C0392B" stroke-width="8"/>
   <text x="1244" y="1140" font-family="Luckiest" font-size="30" fill="#C0392B" text-anchor="middle" opacity=".8">PIZZA</text>
   <path d="M1100 1188 L1390 1188 L1400 1236 L1090 1236 Z" fill="#E8C690" stroke="${C.out}" stroke-width="8" stroke-linejoin="round"/>
   <path d="M1245 1210 L1352 1206 A110 26 0 0 1 1148 1222 A110 26 0 0 1 1245 1186 Z" fill="#F7C948" stroke="#C97A2F" stroke-width="10" stroke-linejoin="round"/>
   <ellipse cx="1190" cy="1210" rx="16" ry="6" fill="#C0392B"/><ellipse cx="1290" cy="1218" rx="14" ry="5" fill="#C0392B"/><ellipse cx="1240" cy="1224" rx="12" ry="5" fill="#C0392B"/>
   <ellipse cx="1215" cy="1198" rx="10" ry="4" fill="#6B8E23"/>`;
  if (face) {
    s += `<g transform="translate(1240 1206) scale(${fu.toFixed(3)}) translate(-1240 -1206)">
     <ellipse cx="1215" cy="1200" rx="17" ry="15" fill="#fff" stroke="${C.out}" stroke-width="4"/><ellipse cx="1265" cy="1200" rx="17" ry="15" fill="#fff" stroke="${C.out}" stroke-width="4"/>
     <circle cx="${f1(1218 - 4)}" cy="1203" r="6" fill="${C.out}"/><circle cx="${f1(1262 - 4)}" cy="1203" r="6" fill="${C.out}"/>
     <path d="M1196 1180 L1230 1190 M1284 1180 L1250 1190" stroke="${C.out}" stroke-width="6" stroke-linecap="round"/>
     <path d="M1226 1226 Q1240 1216 1254 1226" stroke="${C.out}" stroke-width="5" fill="none" stroke-linecap="round"/></g>`;
    if (t >= T('setup', 8) - .05 && t < T('botao')) {
      const bu = EZ.back(prog(t, T('setup', 8) - .05, .25));
      s += `<g transform="translate(1310 1110) scale(${bu.toFixed(3)})"><path d="M-70 -40 Q-70 -70 -40 -70 L60 -70 Q90 -70 90 -40 L90 -10 Q90 20 60 20 L0 20 L-30 44 L-24 20 L-40 20 Q-70 20 -70 -10 Z" fill="#fff" stroke="${C.out}" stroke-width="6"/>
       <text x="10" y="-12" font-family="Luckiest" font-size="38" fill="${C.out}" text-anchor="middle">HMPF.</text></g>`;
    }
  }
  return s;
}

function ringLight(t) {
  const on = btw(t, T('ring1', 2) - .05, T('ring2', 2));
  const flick = btw(t, T('ring2', 1) - .1, T('ring2', 2)) ? (Math.sin(t * 61) * Math.sin(t * 23) > 0 ? 1 : 0) : 1;
  const broken = t >= T('ring2', 2);
  const lit = on && flick;
  let s = `<path d="M330 960 L330 1720 M330 1720 L250 1840 M330 1720 L410 1840 M330 1720 L330 1840" stroke="${C.out}" stroke-width="18" stroke-linecap="round"/>
   <path d="M330 960 L330 1720" stroke="#555" stroke-width="8"/>`;
  if (lit) s += `<circle cx="330" cy="820" r="230" fill="url(#ringGlow)"/>`;
  s += `<circle cx="330" cy="820" r="135" fill="none" stroke="${C.out}" stroke-width="40"/>
   <circle cx="330" cy="820" r="135" fill="none" stroke="${lit ? '#FFFFFF' : broken ? '#3b3b44' : '#D9D9E3'}" stroke-width="26"/>
   ${lit ? `<circle cx="330" cy="820" r="135" fill="none" stroke="#fffbe6" stroke-width="12" filter="url(#glowF)"/>` : ''}
   <rect x="312" y="790" width="36" height="62" rx="6" fill="#222" stroke="${C.out}" stroke-width="5"/>`;
  if (broken) s += `<path d="M230 740 L262 770 L250 800 M410 880 L380 860 L395 830 M300 950 L320 925" stroke="#111" stroke-width="6" fill="none"/>` + stink(330, 700, t, 3, '#9a9aa6', 60);
  return s;
}

function worldScene(t, cam) {
  const z = cam[2];
  let s = '';
  // parede
  s += `<rect x="-600" y="-600" width="2900" height="2000" fill="url(#wallG)"/>
   <rect x="-600" y="-600" width="2900" height="2000" fill="url(#stripeP)" opacity=".5"/>
   <path d="M-600 150 L2300 150" stroke="url(#ledG)" stroke-width="14" filter="url(#glowF)"/>
   <path d="M-600 150 L2300 150" stroke="url(#ledG)" stroke-width="7"/>
   <ellipse cx="820" cy="170" rx="1100" ry="160" fill="#B04DFF" opacity=".10"/>`;
  // janela
  s += `<rect x="120" y="330" width="350" height="450" fill="url(#skyG)" stroke="${C.out}" stroke-width="14"/>
   <circle cx="390" cy="420" r="60" fill="#FFF4C2" opacity=".15"/><circle cx="390" cy="420" r="38" fill="#FFF4C2"/>
   ${[[170, 380], [250, 450], [200, 560], [430, 600], [300, 370], [160, 690]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${f1(3 + 2 * Math.abs(Math.sin(t * 2 + i)))}" fill="#fff"/>`).join('')}
   <path d="M120 600 L180 560 L220 600 L290 540 L350 610 L410 570 L470 620 L470 780 L120 780 Z" fill="#141029"/>
   <path d="M295 330 L295 780 M120 555 L470 555" stroke="${C.out}" stroke-width="12"/>
   <path d="M90 300 L90 820 Q150 700 140 300 Z" fill="#6D3B8C" stroke="${C.out}" stroke-width="8"/>
   <path d="M500 300 Q470 520 520 800 L420 820 Q470 600 440 300 Z" fill="#6D3B8C" stroke="${C.out}" stroke-width="8"/>
   <path d="M60 300 L540 300" stroke="${C.out}" stroke-width="14"/>`;
  // pôsteres
  s += `<g transform="rotate(5 1240 430)"><rect x="1130" y="290" width="220" height="280" fill="#232542" stroke="${C.out}" stroke-width="9"/>
    <text x="1240" y="380" font-family="Luckiest" font-size="54" fill="${C.yellow}" text-anchor="middle">GAME</text>
    <text x="1240" y="440" font-family="Luckiest" font-size="54" fill="#FF4757" text-anchor="middle">ON</text>
    <rect x="1185" y="470" width="110" height="60" rx="26" fill="#fff"/><circle cx="1215" cy="500" r="9" fill="#232542"/><circle cx="1268" cy="492" r="7" fill="#FF4757"/><circle cx="1280" cy="508" r="7" fill="#39C2FF"/>
    <path d="M1350 290 L1310 290 L1350 330 Z" fill="#1C1838"/></g>
   <g transform="rotate(-6 640 330)"><rect x="565" y="240" width="150" height="190" fill="#E84A5F" stroke="${C.out}" stroke-width="8"/>
    <text x="640" y="320" font-family="Anton" font-size="48" fill="#fff" text-anchor="middle">PRO</text><text x="640" y="380" font-family="Anton" font-size="30" fill="#fff" text-anchor="middle" opacity=".8">PLAYER</text></g>
   <rect x="1170" y="660" width="360" height="22" fill="#5B3A25" stroke="${C.out}" stroke-width="7"/>
   ${[0, 1, 2].map(i => `<rect x="${1190 + i * 40}" y="600" width="32" height="60" rx="5" fill="${['#3DDC84', '#FF4757', '#39C2FF'][i]}" stroke="${C.out}" stroke-width="5"/>`).join('')}
   <rect x="1210" y="545" width="32" height="56" rx="5" fill="#3DDC84" stroke="${C.out}" stroke-width="5"/>
   <path d="M1360 600 L1440 600 L1430 640 Q1400 660 1370 640 Z" fill="#E1B12C" stroke="${C.out}" stroke-width="6"/><rect x="1385" y="640" width="30" height="20" fill="#E1B12C" stroke="${C.out}" stroke-width="5"/>
   <text x="1400" y="625" font-family="Anton" font-size="12" fill="#6d5300" text-anchor="middle">PARTICIPAÇÃO</text>`;
  // raios (amanhã vai bombar)
  if (btw(t, T('bombar') - .05, T('voce'))) {
    const u = prog(t, T('bombar') - .05, .2);
    let r = ''; for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2 + t * .6, a2 = a + Math.PI / 18;
      r += `<path d="M820 770 L${f1(820 + Math.cos(a) * 1600)} ${f1(770 + Math.sin(a) * 1600)} L${f1(820 + Math.cos(a2) * 1600)} ${f1(770 + Math.sin(a2) * 1600)} Z" fill="${i % 2 ? '#FFC93C' : '#FF8A3D'}"/>`;
    }
    s += `<g opacity="${f1(u * .9)}">${r}</g>`;
  }
  // chão
  s += `<rect x="-600" y="1380" width="2900" height="1100" fill="#3A2A24"/>
   ${[1440, 1530, 1640, 1770, 1920].map(y => `<path d="M-600 ${y} L2300 ${y}" stroke="#2C1F1A" stroke-width="6"/>`).join('')}
   <rect x="-600" y="1380" width="2900" height="20" fill="#2C1F1A"/>`;
  // cama
  s += `<rect x="-420" y="1150" width="560" height="300" rx="30" fill="#5865A8" stroke="${C.out}" stroke-width="9"/>
   <path d="M-420 1160 Q-200 1080 60 1170 Q160 1210 140 1300 L-420 1300 Z" fill="#8A5FBF" stroke="${C.out}" stroke-width="9"/>
   <ellipse cx="40" cy="1190" rx="40" ry="18" fill="#fff" stroke="${C.out}" stroke-width="6" transform="rotate(-20 40 1190)"/>`;
  s += ringLight(t);
  // cadeira gamer torta
  const chairT = -8 + (btw(t, T('setup', 1), T('setup', 3)) ? -6 * EZ.elastic(prog(t, T('setup', 2), .8)) : 0);
  s += `<g transform="rotate(${f1(chairT)} 820 1300)">
   <path d="M590 1260 L578 690 Q588 588 700 578 L940 578 Q1052 588 1062 690 L1072 1260 Z" fill="#1F1F27" stroke="${C.out}" stroke-width="11" stroke-linejoin="round"/>
   <path d="M600 700 L612 1240 M1040 700 L1050 1240" stroke="${C.red}" stroke-width="30"/>
   <rect x="720" y="600" width="200" height="70" rx="30" fill="${C.red}" stroke="${C.out}" stroke-width="7"/>
   <g transform="rotate(32 615 820)"><rect x="560" y="805" width="120" height="34" fill="#C7C7C7" stroke="${C.out}" stroke-width="5"/></g>
   <g transform="rotate(-28 615 830)"><rect x="560" y="815" width="120" height="34" fill="#BDBDBD" stroke="${C.out}" stroke-width="5"/></g></g>`;
  // embaixo da mesa: PC, cabos
  s += `<ellipse cx="840" cy="1830" rx="560" ry="40" fill="#000" opacity=".35"/>
   <rect x="1110" y="1420" width="160" height="380" rx="12" fill="#17171f" stroke="${C.out}" stroke-width="9"/>
   <circle cx="1190" cy="1520" r="44" fill="none" stroke="hsl(${(t * 120) % 360} 90% 60%)" stroke-width="10"/>
   <circle cx="1190" cy="1640" r="44" fill="none" stroke="hsl(${(t * 120 + 120) % 360} 90% 60%)" stroke-width="10"/>`;
  const cab = ['#111', '#222', '#C62828', '#333', '#1565C0', '#111'];
  for (let i = 0; i < 9; i++) {
    const y = 1480 + i * 30;
    s += `<path d="M${450 + i * 20} ${1290 + i * 5} C ${700 + Math.sin(i) * 200} ${y - 150}, ${600 + i * 40} ${y + 160}, ${880 + Math.cos(i * 1.7) * 90} ${y} S ${1050} ${1600 + i * 12}, 1110 ${1500 + i * 18}" stroke="${cab[i % cab.length]}" stroke-width="10" fill="none"/>`;
  }
  s += `<ellipse cx="900" cy="1580" rx="60" ry="40" fill="none" stroke="#111" stroke-width="9"/><ellipse cx="910" cy="1585" rx="40" ry="55" fill="none" stroke="#C62828" stroke-width="8"/>
   <rect x="760" y="1700" width="170" height="40" rx="8" fill="#ddd" stroke="${C.out}" stroke-width="6"/>
   ${[0, 1, 2, 3].map(i => `<rect x="${775 + i * 38}" y="1680" width="22" height="30" fill="#333" stroke="${C.out}" stroke-width="3"/>`).join('')}`;
  return s;
}

function worldFront(t, dud) {
  let s = '';
  // monitor
  s += `<rect x="1070" y="850" width="330" height="230" rx="16" fill="#111" stroke="${C.out}" stroke-width="10"/>
   ${screenContent(t)}
   <rect x="1215" y="1078" width="40" height="122" fill="#222" stroke="${C.out}" stroke-width="6"/>
   <ellipse cx="1235" cy="1205" rx="80" ry="12" fill="#222" stroke="${C.out}" stroke-width="6"/>
   <g transform="rotate(-8 1110 825)"><rect x="1080" y="800" width="60" height="60" fill="#FFE066" stroke="${C.out}" stroke-width="4"/>
   <text x="1110" y="837" font-family="Nunito" font-weight="800" font-size="12" fill="#333" text-anchor="middle">SUCESSO</text></g>
   <g transform="rotate(10 1370 825)"><rect x="1345" y="800" width="54" height="54" fill="#7CF0FF" stroke="${C.out}" stroke-width="4"/>
   <text x="1372" y="832" font-family="Nunito" font-weight="800" font-size="11" fill="#333" text-anchor="middle">1M SUBS</text></g>`;
  // mesa
  s += `<path d="M350 1212 L1320 1212 L1352 1262 L318 1262 Z" fill="#7A5236" stroke="${C.out}" stroke-width="9" stroke-linejoin="round"/>
   <rect x="318" y="1262" width="1034" height="30" fill="#5B3A25" stroke="${C.out}" stroke-width="8"/>
   <rect x="340" y="1292" width="34" height="540" fill="#4A2F1E" stroke="${C.out}" stroke-width="8"/>
   <rect x="1296" y="1292" width="34" height="540" fill="#4A2F1E" stroke="${C.out}" stroke-width="8"/>
   <path d="M400 1236 L760 1236" stroke="#000" stroke-width="3" opacity=".2"/>`;
  // teclado, mouse, latas, microfone
  s += `<path d="M652 1222 L990 1222 L1002 1252 L640 1252 Z" fill="#22222B" stroke="${C.out}" stroke-width="7"/>
   <path d="M660 1246 L984 1246" stroke="hsl(${(t * 140) % 360} 90% 60%)" stroke-width="4"/>
   ${[0, 1, 2].map(r => `<path d="M${668 - r * 3} ${1230 + r * 7} L${976 + r * 3} ${1230 + r * 7}" stroke="#3b3b48" stroke-width="5" stroke-dasharray="14 5"/>`).join('')}
   <ellipse cx="1045" cy="1240" rx="26" ry="14" fill="#2a2a33" stroke="${C.out}" stroke-width="6"/>
   <rect x="415" y="1135" width="42" height="82" rx="6" fill="#3DDC84" stroke="${C.out}" stroke-width="6"/><rect x="415" y="1160" width="42" height="20" fill="#111" opacity=".6"/>
   <rect x="465" y="1150" width="42" height="68" rx="6" fill="#FF4757" stroke="${C.out}" stroke-width="6"/>
   <g transform="rotate(80 470 1230)"><rect x="440" y="1210" width="34" height="62" rx="6" fill="#39C2FF" stroke="${C.out}" stroke-width="6"/></g>
   <path d="M575 1215 L575 1150" stroke="#555" stroke-width="12"/><ellipse cx="575" cy="1215" rx="44" ry="10" fill="#333" stroke="${C.out}" stroke-width="6"/>
   <rect x="545" y="1030" width="62" height="128" rx="31" fill="#9AA0A6" stroke="${C.out}" stroke-width="8"/>
   ${[1055, 1075, 1095, 1115].map(y => `<path d="M553 ${y} L599 ${y}" stroke="#6b7076" stroke-width="4"/>`).join('')}
   <g transform="rotate(-22 576 1090)"><rect x="534" y="1078" width="84" height="22" fill="#D7D7D7" stroke="${C.out}" stroke-width="4"/></g>
   <g transform="rotate(14 640 1050)"><rect x="608" y="1032" width="96" height="36" rx="5" fill="#FFE066" stroke="${C.out}" stroke-width="4"/>
   <text x="656" y="1057" font-family="Nunito" font-weight="800" font-size="18" fill="#C0392B" text-anchor="middle">R$ 19,90</text></g>`;
  s += pizzaBox(t);
  s += stink(1240, 1185, t, 3, '#9BE15D', 50, 70) + flies(1240, 1140, t, 3, 90);
  // braços por cima da mesa
  s += dud.arms;
  // bola de feno (silêncio)
  if (btw(t, T('silencio', 0) + .25, T('chat'))) {
    const u = prog(t, T('silencio', 0) + .25, T('chat') - T('silencio', 0) - .25);
    const x = lerp(250, 1450, u), y = 1150 - Math.abs(Math.sin(u * 14)) * 50;
    let tw = ''; for (let i = 0; i < 10; i++) tw += `<ellipse rx="${50 - i * 2}" ry="${18 + i * 3}" transform="rotate(${i * 36})" fill="none" stroke="#B08850" stroke-width="5"/>`;
    s += `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${f1(u * 900)})">${tw}</g>`;
  }
  // primeiro plano: roupas, caixas, lixeira
  s += `<path d="M120 1860 Q160 1740 260 1760 Q330 1700 420 1770 Q470 1820 450 1880 Z" fill="#8E44AD" stroke="${C.out}" stroke-width="8"/>
   <path d="M200 1880 Q240 1800 330 1820 Q380 1840 360 1890 Z" fill="#16A085" stroke="${C.out}" stroke-width="8"/>
   <path d="M480 1850 q30 -40 70 -20 q20 30 -10 45 Z" fill="#fff" stroke="${C.out}" stroke-width="6"/>
   ${[0, 1, 2].map(i => `<g transform="rotate(${[-4, 3, -2][i]} 1420 ${1820 - i * 46})"><rect x="1300" y="${1800 - i * 46}" width="250" height="46" fill="#D9B27A" stroke="${C.out}" stroke-width="7"/><path d="M1300 ${1818 - i * 46} L1550 ${1818 - i * 46}" stroke="#C0392B" stroke-width="6"/></g>`).join('')}
   <path d="M1460 1620 L1580 1620 L1565 1800 L1475 1800 Z" fill="#2E7D32" stroke="${C.out}" stroke-width="8"/>
   <circle cx="1490" cy="1605" r="26" fill="#ddd" stroke="${C.out}" stroke-width="5"/><circle cx="1545" cy="1600" r="22" fill="#f0f0f0" stroke="${C.out}" stroke-width="5"/>
   ${stink(1520, 1570, t, 2, '#9BE15D', 40)}
   <circle cx="560" cy="1830" r="20" fill="#eee" stroke="${C.out}" stroke-width="5"/><circle cx="1000" cy="1860" r="16" fill="#eee" stroke="${C.out}" stroke-width="5"/>`;
  // poeira
  s += DUST.map(([x, y, ph, r]) => `<circle cx="${f1(x + Math.sin(t * .5 + ph) * 30)}" cy="${f1(y + Math.cos(t * .4 + ph) * 25)}" r="${r}" fill="#fff" opacity="${f1(.12 + .1 * Math.sin(t + ph))}"/>`).join('');
  // brilho do monitor
  s += `<ellipse cx="1150" cy="920" rx="520" ry="560" fill="url(#monGlow)"/>`;
  return s;
}

// -------------------------------------------------------------------- pose do Dudu por momento
function blinkLid(t, base) {
  const bt = [1.1, 4.3, 7.6, 10.4, 13.2, 19.0, 22.0, 26.4, 29.2, 36.2, 41.6, 43.9, 47.8, 50.6, 53.4, 56.0];
  for (const b of bt) if (btw(t, b, b + .12)) return 1;
  return base;
}
function dudPose(t) {
  const q = { bounce: 0, dy: Math.sin(t * 2.2) * 3, tilt: Math.sin(t * .9) * 1.5 };
  const env = id => { const s = SG[id]; const i = Math.floor((t - s.s) * FPS); return s.env && i >= 0 && i < s.env.length ? s.env[i] : 0; };
  if (t < T('hook2')) {
    Object.assign(q, { armR: [-12, -158], holdR: 'pizza', tx: 840, ty: 880, mouthO: t < T('hook1', 1) ? .25 + .2 * Math.sin(t * 16) : .08 + .08 * Math.sin(t * 10), smile: .3, lookX: 0 });
  } else if (t < T('canal')) {
    Object.assign(q, { armR: [22, -100], holdR: 'pizza', tx: 1000, ty: 1020, lookX: .7, lookY: -.8, smile: .9, lid: .15, brow: .5, mouthO: .12 });
  } else if (t < T('setup')) {
    Object.assign(q, { lookX: .8, lookY: .1, smile: .3 });
  } else if (t < T('botao')) {
    Object.assign(q, { lookX: t >= T('setup', 5) ? .9 : 0, lookY: t >= T('setup', 5) ? .5 : 0, smile: .1 });
    if (btw(t, T('setup', 1), T('setup', 3))) q.tilt += -6 * EZ.elastic(prog(t, T('setup', 2), .8));
  } else if (t < T('fala')) {
    Object.assign(q, { lookX: .9, lookY: .2, armR: [24, -38], smile: .5, brow: .3 });
    if (btw(t, T('botao', 2) - .05, T('botao', 2) + .15)) q.armR = [28, -30];
  } else if (t < T('silencio')) {
    const w = Math.sin(t * 9);
    Object.assign(q, { armL: [150 + 10 * w, 172 + 14 * w], armR: [150 - 10 * w, 172 - 14 * w], mouthO: env('fala') * .9, smile: .9, lid: .02, brow: .6, sparkle: 1 });
    q.dy += -Math.abs(Math.sin(t * 8)) * 14;
  } else if (t < T('chat')) {
    Object.assign(q, { armL: [150, 172], armR: [150, 172], smile: .7, lid: .05, brow: .2, pupil: 9, sweat: prog(t, T('silencio', 0) + .4, 1.4) });
    q.dy = 0; q.tilt = 0;
  } else if (t < T('cabelo')) {
    const yawn = btw(t, T('olheira', 2) - .05, T('olheira', 2) + .9) ? Math.sin(prog(t, T('olheira', 2) - .05, .95) * Math.PI) : 0;
    Object.assign(q, { lid: .5 + .3 * yawn, dark: .7 + .3 * Math.abs(Math.sin(t * 4)), mouthO: yawn * .95, smile: -.1, brow: .25 });
  } else if (t < T('fone')) {
    const tc = t - T('cabelo', 2);
    Object.assign(q, { lid: .4, cowlick: tc > 0 ? Math.sin(tc * 16) * 28 * Math.exp(-tc * 2.2) : 0, lookY: -.9, smile: .1 });
  } else if (t < T('ring1')) {
    const tc = t - T('fone', 1);
    Object.assign(q, { hpTilt: 18 + (tc > 0 ? 14 * EZ.elastic(clamp(tc / .7)) : 0), smile: .25, lookX: -.2 });
  } else if (t < T('ring2', 2)) {
    const on = t >= T('ring1', 2);
    Object.assign(q, { armL: [96, 104], holdL: 'point', smile: .9, brow: .4, lid: on ? .75 : .2, lookX: -.8, mouthO: on ? 0 : .1 });
  } else if (t < T('entra')) {
    const sh = prog(t, T('ring2', 2), .2);
    Object.assign(q, { armL: [140, 165], armR: [140, 165], mouthO: .7 * sh + .1, smile: -.2, brow: 1, lid: 0, pupil: 8, soot: sh, sweat: -1 });
  } else if (t < T('mae')) {
    const j = t >= T('entra', 2) - .1;
    Object.assign(q, { soot: 1, lookX: j ? 0 : .9, smile: j ? 1 : .4, mouthO: j ? .55 : .15, lid: 0, brow: .6, sparkle: j ? 1 : 0 });
    if (j) { const w = Math.sin(t * 10); q.armL = [160 + 8 * w, 176]; q.armR = [160 - 8 * w, 176]; q.dy += -Math.abs(Math.sin(t * 9)) * 40; }
  } else if (t < T('quarenta')) {
    const u = EZ.out(prog(t, T('mae2', 0), .6));
    Object.assign(q, { soot: 1, armL: [lerp(150, 6, u), lerp(170, 4, u)], armR: [lerp(150, 6, u), lerp(170, 4, u)], smile: lerp(.6, -.9, u), lid: lerp(0, .55, u), brow: lerp(.5, .9, u), dy: lerp(0, 22, u), tilt: 4 * u, lookY: .5 * u });
  } else if (t < T('bombar')) {
    Object.assign(q, { soot: 1, armL: [6, 4], armR: [6, 4], smile: -.35, lid: .62, dark: 1, dy: 22, tilt: 3, lookX: .6, lookY: .3 });
  } else {
    Object.assign(q, { soot: 1, armL: [60, 150], armR: [-18, -172], holdR: 'thumb', smile: 1, mouthO: Math.max(env('bombar') * .8, t > E('bombar') ? .35 : 0), lid: 0, brow: .7, sparkle: 1 });
    q.dy += -Math.abs(Math.sin(t * 7)) * 8;
  }
  q.lid = blinkLid(t, q.lid == null ? .35 : q.lid);
  return q;
}

// -------------------------------------------------------------------- câmera
const WIDE = [820, 1070, .92], MED = [820, 930, 1.3], MON = [1235, 965, 3.0];
let KF = null;
function buildKF() {
  KF = [
    { t: 0, c: [820, 790, 2.6], d: 0 },
    { t: 0.001, c: [820, 820, 1.9], d: .45, e: 'back' },
    { t: T('hook1', 1) - .06, c: WIDE, d: .35, e: 'inOut' },
    { t: T('hook2'), c: [930, 690, 1.12], d: .7, e: 'inOut' },
    { t: T('canal', 1) - .1, c: MON, d: .26, e: 'back' },
    { t: T('canal', 3) - .1, c: [590, 1110, 3.1], d: .26, e: 'back' },
    { t: T('canal', 4) - .1, c: [1235, 975, 3.7], d: .26, e: 'back' },
    { t: T('setup', 0) - .1, c: WIDE, d: .3, e: 'inOut' },
    { t: T('setup', 1) - .1, c: [650, 930, 1.85], d: .28, e: 'back' },
    { t: T('setup', 3) - .1, c: [860, 1560, 1.65], d: .28, e: 'back' },
    { t: T('setup', 5) - .1, c: [1235, 1170, 2.5], d: .28, e: 'back' },
    { t: T('setup', 7) - .05, c: [1250, 1175, 3.5], d: .22, e: 'back' },
    { t: T('botao', 0) - .1, c: MON, d: .3, e: 'back' },
    { t: T('fala', 0) - .12, c: MED, d: .28, e: 'back' },
    { t: T('silencio', 0), c: [820, 930, 1.5], d: 1.8, e: 'inOut' },
    { t: T('olheira', 0), c: [820, 790, 3.3], d: 0 },
    { t: T('cabelo', 0) - .1, c: [835, 610, 2.8], d: .26, e: 'back' },
    { t: T('fone', 0) - .1, c: [950, 770, 2.7], d: .26, e: 'back' },
    { t: T('ring1', 0) - .1, c: [580, 860, 1.4], d: .35, e: 'inOut' },
    { t: T('entra', 0) - .1, c: MON, d: .28, e: 'back' },
    { t: T('entra', 2) - .1, c: [820, 900, 1.25], d: .28, e: 'back' },
    { t: T('mae2', 0), c: [820, 820, 1.9], d: 0 },
    { t: T('mae2', 0) + .01, c: [820, 800, 2.15], d: 1.3, e: 'inOut' },
    { t: T('quarenta', 0), c: WIDE, d: 0 },
    { t: T('quarenta', 0) + .01, c: [820, 950, 1.35], d: T('bombar') - T('quarenta') - .1, e: 'inOut' },
    { t: T('bombar', 0) - .08, c: [820, 800, 2.1], d: .22, e: 'back' },
  ];
}
function camAt(t) {
  if (!KF) buildKF();
  let from = KF[0].c, k = KF[0];
  for (let i = 1; i < KF.length && KF[i].t <= t; i++) {
    const u = k.d ? EZ[k.e || 'inOut'](clamp((KF[i].t - k.t) / k.d)) : 1;
    from = from.map((v, j) => lerp(v, k.c[j], u));
    k = KF[i];
  }
  const u = k.d ? EZ[k.e || 'inOut'](clamp((t - k.t) / k.d)) : 1;
  const c = from.map((v, j) => lerp(v, k.c[j], u));
  // respiração de câmera
  c[0] += Math.sin(t * .7) * 5 / c[2]; c[1] += Math.cos(t * .9) * 4 / c[2];
  // tremores
  const shake = (t0, amp, dur) => { const e = t - t0; return e > 0 && e < dur ? amp * (1 - e / dur) : 0; };
  const a = shake(0, 34, .55) + shake(T('ring2', 2), 30, .6) + shake(T('entra', 2), 10, .5) + shake(T('bombar', 0), 14, .5);
  c[0] += Math.sin(t * 83) * a / c[2]; c[1] += Math.cos(t * 71) * a / c[2];
  return c;
}

// -------------------------------------------------------------------- cenas de interface
function streamUI(t, mode) {
  const isMae = mode === 'mae';
  let s = `<rect width="1080" height="1920" fill="#0D0B1E"/>
   <circle cx="540" cy="700" r="900" fill="url(#purpleR)"/>
   <rect width="1080" height="1920" fill="url(#dotP)" opacity=".35"/>
   <g transform="rotate(-1.2 540 960)">
   <rect x="64" y="300" width="952" height="1040" rx="40" fill="#000" opacity=".45" transform="translate(10 16)"/>
   <rect x="64" y="300" width="952" height="1040" rx="40" fill="#17142B" stroke="#4A3B8F" stroke-width="5"/>
   <rect x="104" y="332" width="200" height="56" rx="28" fill="#E53935"/>
   <circle cx="134" cy="360" r="11" fill="#fff" opacity="${(.5 + .5 * Math.sin(t * 8)).toFixed(2)}"/>
   <text x="218" y="378" font-family="Anton" font-size="36" fill="#fff" text-anchor="middle">AO VIVO</text>
   <text x="330" y="376" font-family="Nunito" font-weight="800" font-size="34" fill="#fff">DuduGamer_PRO</text>
   <text x="976" y="378" font-family="Anton" font-size="40" fill="#fff" text-anchor="end">👁 ${isMae ? 1 : 0}</text>`;
  // área do jogo
  s += `<clipPath id="gameC"><rect x="104" y="410" width="872" height="360" rx="18"/></clipPath><g clip-path="url(#gameC)">
   <rect x="104" y="410" width="872" height="360" fill="#5EC8FF"/>
   <circle cx="260" cy="500" r="40" fill="#fff" opacity=".9"/><circle cx="310" cy="490" r="52" fill="#fff" opacity=".9"/><circle cx="700" cy="520" r="36" fill="#fff" opacity=".9"/>
   <rect x="104" y="690" width="872" height="80" fill="#4CAF50"/><rect x="104" y="690" width="872" height="16" fill="#7BD65A"/>
   <rect x="470" y="690" width="130" height="80" fill="#0D0B1E"/>
   <rect x="520" y="${f1(650 + ((t * 300) % 160))}" width="40" height="52" fill="#E53935" stroke="#000" stroke-width="4"/>
   <rect x="104" y="410" width="872" height="360" fill="#000" opacity=".35"/>
   <text x="420" y="600" font-family="Luckiest" font-size="96" fill="#FF4757" stroke="#000" stroke-width="8" paint-order="stroke" text-anchor="middle" opacity="${Math.sin(t * 6) > -.3 ? 1 : .2}">GAME OVER</text></g>`;
  // webcam do Dudu
  const wq = isMae
    ? { lookY: .4, lookX: .3, smile: t < T('mae', 2) ? .8 : .3, brow: .5, lid: .05, soot: 1, sparkle: t < T('mae', 1) ? 1 : 0 }
    : { lookY: .6, lookX: -.2, smile: t > T('chat', 2) ? -.4 : .2, brow: t > T('chat', 2) ? -.6 : 0, mouthO: t > T('chat', 4) ? .25 : 0, lid: .3 };
  wq.lid = blinkLid(t + 1.7, wq.lid);
  const dp = duduParts(t, Object.assign({ legs: false }, wq));
  s += `<clipPath id="camC"><rect x="766" y="548" width="196" height="208" rx="18"/></clipPath>
   <rect x="760" y="542" width="208" height="220" rx="22" fill="#6C3CE1"/>
   <g clip-path="url(#camC)"><rect x="766" y="548" width="196" height="208" fill="#2A2350"/>
   <g transform="translate(864 700) scale(.48) translate(-820 -860)">${dp.back}${dp.arms}</g></g>`;
  // chat
  s += `<rect x="104" y="790" width="872" height="520" rx="24" fill="#100E22" stroke="#2D2654" stroke-width="4"/>
   <text x="140" y="845" font-family="Anton" font-size="38" fill="#8f86c9" letter-spacing="2">CHAT DA LIVE</text>
   <path d="M120 866 L960 866" stroke="#2D2654" stroke-width="4"/>`;
  const msg = (y, t0, av, name, ncol, lines, link) => {
    const u = EZ.back(prog(t, t0, .3)); if (u <= 0) return '';
    let m = `<g transform="translate(140 ${y}) scale(${u.toFixed(3)})" opacity="${clamp(u).toFixed(2)}">
     <rect x="-14" y="-14" width="828" height="${64 + lines.length * 46 + (link ? 44 : 0)}" rx="22" fill="#1E1A3A"/>${av}
     <text x="96" y="30" font-family="Nunito" font-weight="800" font-size="32" fill="${ncol}">${name}</text>`;
    lines.forEach((l, i) => m += `<text x="96" y="${80 + i * 46}" font-family="Nunito" font-weight="800" font-size="34" fill="#fff">${l}</text>`);
    if (link) m += `<text x="96" y="${80 + lines.length * 46}" font-family="Nunito" font-weight="800" font-size="32" fill="#39C2FF" text-decoration="underline">${link}</text>`;
    return m + `</g>`;
  };
  const bot = `<rect x="6" y="2" width="62" height="54" rx="12" fill="#9AA5B1" stroke="#000" stroke-width="4"/><circle cx="25" cy="27" r="8" fill="#39C2FF"/><circle cx="50" cy="27" r="8" fill="#39C2FF"/><path d="M37 2 L37 -14" stroke="#000" stroke-width="4"/><circle cx="37" cy="-16" r="6" fill="#FF4757"/><rect x="20" y="42" width="34" height="6" fill="#333"/>`;
  const mom = `<circle cx="37" cy="30" r="32" fill="#FF7AB6" stroke="#000" stroke-width="4"/><path d="M37 46 C10 28 20 10 37 22 C54 10 64 28 37 46 Z" fill="#fff"/>`;
  const botT = isMae ? -9 : T('chat', 2);
  if (!isMae && t < T('chat', 1)) s += `<text x="540" y="1060" font-family="Nunito" font-weight="800" font-size="34" fill="#4c4580" text-anchor="middle">Ninguém comentou ainda...</text>`;
  if (!isMae && btw(t, T('chat', 1), T('chat', 2))) s += `<text x="140" y="935" font-family="Nunito" font-weight="800" font-size="30" fill="#8f86c9">alguém está digitando</text>` +
    [0, 1, 2].map(i => `<circle cx="${470 + i * 26}" cy="${f1(927 - Math.abs(Math.sin(t * 8 + i)) * 10)}" r="8" fill="#8f86c9"/>`).join('');
  s += msg(910, botT, bot, 'cripto_bot_9000', '#3DDC84', ['GANHE 1000% COM A DUDUCOIN!!!', 'CLIQUE AGORA, ÚLTIMAS VAGAS'], 'bit.ly/fica-rico-ja');
  if (!isMae && t >= T('chat', 4)) {
    s += hlCircle(560, 1000, 470, 135, t, T('chat', 4), 1);
    const cu = EZ.back(prog(t, T('chat', 4), .3));
    s += `<g transform="translate(905 880) scale(${(cu * Math.cos(t * 6)).toFixed(3)} ${cu.toFixed(3)})"><circle r="52" fill="#FFC107" stroke="#000" stroke-width="7"/><circle r="38" fill="none" stroke="#B8860B" stroke-width="5"/><text y="22" font-family="Anton" font-size="62" fill="#8a6300" text-anchor="middle">$</text></g>`;
  }
  if (isMae) s += msg(1125, T('mae', 0) - .05, mom, 'mamae_coruja', '#FF7AB6', ['Filho, você já comeu?', 'Tem lasanha na geladeira'], null);
  s += `</g>`;
  return s;
}

function choiceScene(t) {
  const t0 = T('voce');
  const u = EZ.out(prog(t, t0, .35));
  let s = `<g transform="translate(${f1(-(1 - u) * 560)} 0)"><rect x="0" y="0" width="540" height="1920" fill="url(#redG)"/><rect x="0" y="0" width="540" height="1920" fill="url(#diagP)" opacity=".25"/></g>
   <g transform="translate(${f1((1 - u) * 560)} 0)"><rect x="540" y="0" width="540" height="1920" fill="url(#greenG)"/><rect x="540" y="0" width="540" height="1920" fill="url(#diagP)" opacity=".25"/></g>
   <rect x="535" y="0" width="10" height="1920" fill="${C.yellow}" opacity="${u.toFixed(2)}"/>`;
  const bu = EZ.back(prog(t, t0 + .2, .35));
  s += `<g transform="translate(540 300) scale(${bu.toFixed(3)})"><rect x="-370" y="-58" width="740" height="104" rx="52" fill="#000" stroke="${C.yellow}" stroke-width="7"/>
   <text y="22" font-family="Anton" font-size="64" fill="${C.yellow}" text-anchor="middle" letter-spacing="2">COMENTE UMA PALAVRA</text></g>`;
  const title = (x, word, sub, col, tk) => {
    const a = EZ.back(prog(t, t0 + .35, .3)), pop = 1 + .25 * Math.max(0, 1 - Math.abs(t - tk - .12) / .25);
    return `<g transform="translate(${x} 520) scale(${(a * pop).toFixed(3)})"><text font-family="Anton" font-size="140" fill="${col}" stroke="#000" stroke-width="16" paint-order="stroke" text-anchor="middle">${word}</text>
      <text y="68" font-family="Anton" font-size="44" fill="#fff" stroke="#000" stroke-width="9" paint-order="stroke" text-anchor="middle">${sub}</text></g>`;
  };
  s += title(270, 'SETUP', 'ARRUMAR O SETUP', C.yellow, T('opcoes', 1)) + title(810, 'CABELO', 'CORTAR O CABELO', C.blue, T('opcoes', 3));
  // dois Dudus
  [[270, 0], [810, 1]].forEach(([x, i]) => {
    const q = { legs: false, lookX: i ? -.4 : .4, smile: .35, lid: blinkLid(t + i * 1.3, .3), brow: .3, dy: Math.sin(t * 2.4 + i) * 6 };
    const dp = duduParts(t, q);
    s += `<g transform="translate(${x} ${f1(1060 + (1 - u) * 600)}) scale(.62) translate(-820 -900)">${dp.back}${dp.arms}</g>`;
  });
  // ícones: vassoura e tesoura
  const ic = EZ.back(prog(t, t0 + .5, .3));
  s += `<g transform="translate(96 ${f1(930 + Math.sin(t * 3) * 14)}) rotate(-20) scale(${ic.toFixed(3)})"><path d="M0 -150 L0 40" stroke="#8B5A2B" stroke-width="16" stroke-linecap="round"/>
   <path d="M-46 40 L46 40 L60 140 L-60 140 Z" fill="#F4D03F" stroke="#000" stroke-width="7"/>${[-36, -12, 12, 36].map(x => `<path d="M${x} 60 L${x * 1.3} 136" stroke="#C9A227" stroke-width="5"/>`).join('')}</g>
   <g transform="translate(990 ${f1(930 + Math.cos(t * 3) * 14)}) rotate(${f1(20 + Math.sin(t * 8) * 8)}) scale(${ic.toFixed(3)})">
   <path d="M-10 -10 L-60 -130" stroke="#000" stroke-width="22" stroke-linecap="round"/><path d="M-10 -10 L-60 -130" stroke="#D0D7DE" stroke-width="12" stroke-linecap="round"/>
   <path d="M10 -10 L60 -130" stroke="#000" stroke-width="22" stroke-linecap="round"/><path d="M10 -10 L60 -130" stroke="#D0D7DE" stroke-width="12" stroke-linecap="round"/>
   <circle cx="-26" cy="34" r="34" fill="none" stroke="#000" stroke-width="18"/><circle cx="-26" cy="34" r="34" fill="none" stroke="${C.red}" stroke-width="10"/>
   <circle cx="26" cy="34" r="34" fill="none" stroke="#000" stroke-width="18"/><circle cx="26" cy="34" r="34" fill="none" stroke="${C.red}" stroke-width="10"/></g>`;
  // OU
  const ou = EZ.back(prog(t, t0 + .45, .3));
  s += `<g transform="translate(540 1040) scale(${ou.toFixed(3)}) rotate(${f1(Math.sin(t * 2) * 6)})"><circle r="70" fill="#000" stroke="${C.yellow}" stroke-width="9"/>
   <text y="26" font-family="Anton" font-size="74" fill="${C.yellow}" text-anchor="middle">OU</text></g>`;
  // balões de comentário
  if (t >= T('comenta', 1) - .05) {
    [[270, 0], [810, .12]].forEach(([x, d]) => {
      const b = EZ.back(prog(t, T('comenta', 1) - .05 + d, .3));
      s += `<g transform="translate(${x + 120} 700) scale(${b.toFixed(3)})"><path d="M-80 -50 Q-80 -80 -50 -80 L50 -80 Q80 -80 80 -50 L80 0 Q80 30 50 30 L-10 30 L-40 60 L-36 30 L-50 30 Q-80 30 -80 0 Z" fill="#fff" stroke="#000" stroke-width="7"/>
      ${[-30, 0, 30].map((dx, i) => `<circle cx="${dx}" cy="${f1(-25 - Math.abs(Math.sin(t * 7 + i)) * 8)}" r="11" fill="${x < 540 ? C.red : '#2E7D32'}"/>`).join('')}</g>`;
    });
  }
  // seta para os comentários
  if (t >= T('comenta', 2) - .05) {
    const a = EZ.back(prog(t, T('comenta', 2) - .05, .3));
    s += `<g transform="translate(540 ${f1(1700 + Math.abs(Math.sin(t * 7)) * 22)}) scale(${a.toFixed(3)}) rotate(180)"><path d="M0 0 L-60 -70 L-26 -70 L-26 -140 L26 -140 L26 -70 L60 -70 Z" fill="${C.yellow}" stroke="#000" stroke-width="9" stroke-linejoin="round"/></g>`;
  }
  // EP. 2
  if (t >= T('ep2', 3) - .05) {
    const a = EZ.back(prog(t, T('ep2', 3) - .05, .35));
    s += `<g transform="translate(830 1690) rotate(-6) scale(${a.toFixed(3)})"><rect x="-170" y="-62" width="340" height="124" rx="16" fill="#000" transform="translate(10 10)"/>
     <rect x="-170" y="-62" width="340" height="124" rx="16" fill="${C.yellow}" stroke="#000" stroke-width="8"/>
     <text y="30" font-family="Anton" font-size="84" fill="#000" text-anchor="middle">EP. 2 →</text></g>`;
  }
  return s;
}

// -------------------------------------------------------------------- HUD e legenda
function hud(t) {
  const live = t >= T('botao', 2) + .08, v = viewers(t);
  const vp = btw(t, T('entra', 1), T('entra', 1) + .5) ? 1 + .4 * (1 - EZ.out(prog(t, T('entra', 1), .5))) : 1;
  const fame = t >= T('entra', 1) ? 1 : 0;
  let s = `<g opacity=".96">
   <rect x="32" y="48" width="300" height="118" rx="20" fill="#0B0A16" opacity=".85" stroke="#ffffff22" stroke-width="3"/>
   <text x="182" y="88" font-family="Anton" font-size="27" fill="#9a93c7" text-anchor="middle" letter-spacing="2">STATUS</text>
   ${live ? `<circle cx="92" cy="130" r="12" fill="#FF3B3B" opacity="${(.55 + .45 * Math.sin(t * 7)).toFixed(2)}"/><text x="192" y="146" font-family="Anton" font-size="50" fill="#FF3B3B" text-anchor="middle">AO VIVO</text>`
      : `<text x="182" y="146" font-family="Anton" font-size="50" fill="#777" text-anchor="middle">OFFLINE</text>`}
   <rect x="350" y="48" width="300" height="118" rx="20" fill="#0B0A16" opacity=".85" stroke="#ffffff22" stroke-width="3"/>
   <text x="500" y="88" font-family="Anton" font-size="27" fill="#9a93c7" text-anchor="middle" letter-spacing="2">ESPECTADORES</text>
   <text x="500" y="150" font-family="Anton" font-size="${f1(56 * vp)}" fill="${v ? '#3DDC84' : '#FF4757'}" text-anchor="middle">${v}</text>
   <rect x="668" y="48" width="380" height="118" rx="20" fill="#0B0A16" opacity=".85" stroke="#ffffff22" stroke-width="3"/>
   <text x="858" y="88" font-family="Anton" font-size="27" fill="#9a93c7" text-anchor="middle" letter-spacing="2">FAMA</text>
   <rect x="700" y="112" width="230" height="26" rx="13" fill="#262338"/>
   <rect x="700" y="112" width="${f1(4 + fame * 4)}" height="26" rx="13" fill="#3DDC84"/>
   <text x="1000" y="140" font-family="Anton" font-size="40" fill="#3DDC84" text-anchor="middle">${fame}%</text></g>`;
  // faixa de missão
  if (t < T('canal')) {
    const a = EZ.back(prog(t, .25, .35)), o = 1 - prog(t, T('canal') - .25, .25);
    s += `<g transform="translate(540 250) scale(${a.toFixed(3)}) rotate(-2)" opacity="${o.toFixed(2)}">
     <path d="M-400 -46 L400 -46 L370 0 L400 46 L-400 46 L-370 0 Z" fill="#E53935" stroke="#000" stroke-width="8" stroke-linejoin="round"/>
     <text y="20" font-family="Anton" font-size="54" fill="#fff" text-anchor="middle" letter-spacing="2">MISSÃO: VIRAR STREAMER</text></g>`;
  }
  return s;
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

function worldLayer(t) {
  const cam = camAt(t);
  const dud = duduParts(t, dudPose(t));
  // velocidade da câmera -> desfoque de movimento
  const c2 = camAt(t - 1 / FPS);
  const vx = (cam[0] - c2[0]) * cam[2], vy = (cam[1] - c2[1]) * cam[2], vz = Math.abs(cam[2] - c2[2]) / cam[2] * 110;
  const bx = Math.min(14, Math.abs(vx) * .16 + vz * .5), by = Math.min(14, Math.abs(vy) * .16 + vz * .5);
  let s = '';
  if (bx > 1 || by > 1) s += `<filter id="mbF" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="${f1(bx / cam[2])} ${f1(by / cam[2])}"/></filter>`;
  s += `<g transform="translate(540 960) scale(${cam[2].toFixed(4)}) translate(${f1(-cam[0])} ${f1(-cam[1])})" ${bx > 1 || by > 1 ? 'filter="url(#mbF)"' : ''}>`;
  s += worldScene(t, cam) + dud.legs + dud.back;
  // balão do sonho
  if (btw(t, T('hook2') - .05, E('hook2') + .4)) s += dreamBubble(t);
  s += worldFront(t, dud);
  // destaques
  const z = cam[2];
  if (btw(t, T('setup', 1), T('setup', 3))) s += hlCircle(640, 800, 220, 300, t, T('setup', 2) - .1, z) + arrow(420, 700, -125, t, T('setup', 2) - .05, z, 1.4);
  if (btw(t, T('setup', 3), T('setup', 5))) s += hlCircle(880, 1580, 300, 200, t, T('setup', 4) - .1, z);
  if (btw(t, T('setup', 5), T('setup', 7))) s += hlCircle(1245, 1200, 140, 60, t, T('setup', 5), z);
  if (btw(t, T('canal', 3), T('canal', 4))) s += hlCircle(590, 1080, 110, 150, t, T('canal', 3) + .1, z) + arrow(700, 1010, -110, t, T('canal', 3) + .15, z, 1.2);
  if (btw(t, T('olheira'), T('cabelo'))) s += hlCircle(820, 815, 200, 75, t, T('olheira', 0) + .15, z);
  if (btw(t, T('cabelo'), T('fone'))) s += hlCircle(830, 560, 210, 110, t, T('cabelo', 0) + .1, z) + arrow(1010, 500, 120, t, T('cabelo', 1), z, 1.2) + flies(830, 470, t, 1, 110);
  if (btw(t, T('fone'), T('ring1'))) s += hlCircle(1000, 800, 80, 110, t, T('fone', 1) - .05, z) + arrow(1120, 650, 135, t, T('fone', 1), z, 1.1) + qmarks(820, 520, t, T('fone', 3) - .1, z);
  if (btw(t, T('silencio'), T('chat'))) s += qmarks(820, 520, t, T('silencio', 1), z);
  // nuvem de chuva (mãe)
  if (btw(t, T('mae2', 0) + .1, T('bombar'))) s += rainCloud(t);
  if (btw(t, T('quarenta'), T('bombar'))) s += flies(820, 640, t, 1, 200);
  s += `</g>`;
  // iluminação: ring light ligado / escuridão
  if (btw(t, T('ring1', 2) - .05, T('ring2', 2))) {
    const fl = btw(t, T('ring2', 1) - .1, T('ring2', 2)) ? (Math.sin(t * 61) * Math.sin(t * 23) > 0 ? 1 : 0) : 1;
    s += `<rect width="1080" height="1920" fill="#fffbe8" opacity="${(.22 * fl).toFixed(2)}"/>`;
  }
  if (btw(t, T('ring2', 2), T('entra'))) {
    const d = clamp((t - T('ring2', 2) - .12) / .15) * (1 - prog(t, T('entra') - .15, .15));
    s += `<rect width="1080" height="1920" fill="#05040A" opacity="${(d * .9).toFixed(2)}"/>`;
    if (d > .2) {
      // só os olhos no escuro
      s += `<g transform="translate(540 960) scale(${cam[2].toFixed(4)}) translate(${f1(-cam[0])} ${f1(-cam[1])})" opacity="${d.toFixed(2)}">
       ${[[752, 765], [888, 765]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="44" ry="${blinkLid(t + .6, 0) > .5 ? 4 : 48}" fill="#fff"/><circle cx="${x}" cy="${y + 4}" r="9" fill="#000"/>`).join('')}</g>`;
    }
  }
  if (btw(t, T('mae2'), T('bombar'))) s += `<rect width="1080" height="1920" fill="#1A2A6C" opacity="${(.32 * prog(t, T('mae2', 0) + .2, .6)).toFixed(2)}" style="mix-blend-mode:multiply"/>`;
  // faíscas da explosão
  if (btw(t, T('ring2', 2), T('ring2', 2) + .8)) {
    const e = t - T('ring2', 2);
    seed = 99; let sp = '';
    for (let i = 0; i < 26; i++) {
      const a = rnd() * 6.28, v = 300 + rnd() * 700;
      const x = 330 + Math.cos(a) * v * e, y = 820 + Math.sin(a) * v * e + 900 * e * e;
      sp += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(8 * (1 - e / .8) + 2)}" fill="${i % 2 ? '#FFD21F' : '#fff'}"/>`;
    }
    s += `<g transform="translate(540 960) scale(${cam[2].toFixed(4)}) translate(${f1(-cam[0])} ${f1(-cam[1])})">${sp}</g>`;
  }
  return s;
}

function dreamBubble(t) {
  const t0 = T('hook2') - .05, t1 = E('hook2') + .15;
  const a = EZ.back(prog(t, t0, .4));
  const popU = prog(t, t1, .2);
  const sc = a * (1 + popU * .3), op = 1 - popU;
  if (op <= 0) return burst(1120, 420, t - t1);
  const cloud = `M900 420 C880 330 960 270 1030 300 C1060 230 1180 230 1210 300 C1290 270 1370 340 1340 420 C1400 470 1360 560 1280 550 C1250 610 1130 620 1100 560 C1010 600 920 560 930 500 C870 490 870 440 900 420 Z`;
  let s = `<g opacity="${op.toFixed(2)}">
   <circle cx="${f1(980)}" cy="600" r="${f1(16 * a)}" fill="#fff" stroke="${C.out}" stroke-width="6"/>
   <circle cx="${f1(940)}" cy="650" r="${f1(10 * a)}" fill="#fff" stroke="${C.out}" stroke-width="5"/>
   <g transform="translate(1120 430) scale(${sc.toFixed(3)}) translate(-1120 -430)">
   <clipPath id="dreamC"><path d="${cloud}"/></clipPath>
   <path d="${cloud}" fill="#2B0F4C"/>
   <g clip-path="url(#dreamC)"><rect x="860" y="220" width="560" height="420" fill="url(#purpleR)"/>`;
  for (let i = 0; i < 4; i++) {
    const ang = Math.sin(t * 1.5 + i) * 18;
    s += `<g transform="rotate(${f1(ang)} ${960 + i * 110} 240)"><path d="M${960 + i * 110} 240 L${910 + i * 110} 640 L${1010 + i * 110} 640 Z" fill="#FFF7C2" opacity=".25"/></g>`;
  }
  const dp = duduParts(t, { legs: false, shades: true, smile: 1, mouthO: .45, armL: [150, 170], armR: [150, 170], lid: 0, brow: .5, dy: -Math.abs(Math.sin(t * 8)) * 20 });
  s += `<g transform="translate(1120 560) scale(.3) translate(-820 -900)">${dp.back}${dp.arms}</g>`;
  const n = Math.floor(1000000 * EZ.out(prog(t, T('hook2', 1), 1.2)));
  s += `<text x="1120" y="350" font-family="Anton" font-size="62" fill="${C.yellow}" stroke="#000" stroke-width="8" paint-order="stroke" text-anchor="middle">${n.toLocaleString('pt-BR')}</text>
   <text x="1120" y="385" font-family="Anton" font-size="24" fill="#fff" text-anchor="middle" letter-spacing="3">ESPECTADORES</text>`;
  seed = 3;
  for (let i = 0; i < 24; i++) {
    const x = 880 + rnd() * 460, y = 220 + ((rnd() * 420 + t * (80 + rnd() * 80)) % 420);
    s += `<rect x="${f1(x)}" y="${f1(y)}" width="12" height="7" fill="${['#FFD21F', '#FF4FD8', '#3EC5FF', '#3DDC84'][i % 4]}" transform="rotate(${f1(t * 200 + i * 40)} ${f1(x)} ${f1(y)})"/>`;
  }
  s += `</g><path d="${cloud}" fill="none" stroke="${C.out}" stroke-width="10"/><path d="${cloud}" fill="none" stroke="#fff" stroke-width="4" opacity=".6"/></g></g>`;
  return s;
}
function burst(x, y, e) {
  if (e > .5) return '';
  seed = 41; let s = '';
  for (let i = 0; i < 14; i++) {
    const a = i / 14 * 6.28, v = 300 + rnd() * 250;
    s += `<circle cx="${f1(x + Math.cos(a) * v * e)}" cy="${f1(y + Math.sin(a) * v * e)}" r="${f1(16 * (1 - e * 2))}" fill="#fff" stroke="${C.out}" stroke-width="4"/>`;
  }
  return s;
}
function rainCloud(t) {
  const a = EZ.back(prog(t, T('mae2', 0) + .1, .35));
  let drops = '';
  for (let i = 0; i < 9; i++) {
    const x = 700 + i * 30, y = 520 + ((t * 600 + i * 47) % 260);
    drops += `<path d="M${x} ${f1(y)} l-6 26" stroke="#7FD3FF" stroke-width="6" stroke-linecap="round" opacity=".85"/>`;
  }
  return `<g transform="translate(820 430) scale(${a.toFixed(3)}) translate(-820 -430)">${drops}
   <path d="M680 470 C650 420 700 370 750 390 C770 340 870 330 890 390 C950 370 990 430 960 470 Z" fill="#7C8798" stroke="${C.out}" stroke-width="8"/></g>`;
}

// confete (entra)
function confetti(t) {
  const t0 = T('entra', 2); const e = t - t0; if (e < 0 || e > 1.6) return '';
  seed = 77; let s = '';
  for (let i = 0; i < 60; i++) {
    const side = i % 2 ? 1 : -1, x0 = side > 0 ? 1080 : 0, a = (side > 0 ? 200 : -20) + rnd() * 40 - 20, v = 900 + rnd() * 700;
    const r = a * Math.PI / 180;
    const x = x0 + Math.cos(r) * v * e * (side > 0 ? 1 : 1), y = 1500 - Math.abs(Math.sin(r)) * 0 - (900 + rnd() * 500) * e + 1400 * e * e;
    s += `<rect x="${f1(x)}" y="${f1(y)}" width="22" height="12" fill="${['#FFD21F', '#FF4FD8', '#3EC5FF', '#3DDC84', '#FF4757'][i % 5]}" transform="rotate(${f1(e * 700 + i * 30)} ${f1(x)} ${f1(y)})"/>`;
  }
  return s;
}

const MODES = () => [
  [0, 'world'], [T('chat'), 'chat'], [T('olheira'), 'world'], [T('mae'), 'mae'], [T('mae2'), 'world'], [T('voce'), 'choice'],
];
function sceneFor(mode, t) {
  if (mode === 'world') return worldLayer(t);
  if (mode === 'chat' || mode === 'mae') return streamUI(t, mode);
  return choiceScene(t);
}

window.render = function (t) {
  const frame = Math.round(t * FPS);
  const M = MODES();
  let idx = 0; for (let i = 0; i < M.length; i++) if (t >= M[i][0]) idx = i;
  let body = '';
  // transição em chicote entre cenas
  const b = M[idx][0], nb = idx + 1 < M.length ? M[idx + 1][0] : 1e9;
  const tr = (p, outMode, inMode, tt) => {
    const u = EZ.inOut(p), blur = 38 * Math.sin(Math.PI * p);
    return `<filter id="whipF" x="-20%" y="-5%" width="140%" height="110%"><feGaussianBlur stdDeviation="${f1(blur)} 0"/></filter>
      <g filter="url(#whipF)"><g transform="translate(${f1(-u * 1080)} 0)">${sceneFor(outMode, tt)}</g>
      <g transform="translate(${f1((1 - u) * 1080)} 0)">${sceneFor(inMode, tt)}</g></g>`;
  };
  if (idx > 0 && t < b + .16) body = tr((t - (b - .14)) / .3, M[idx - 1][1], M[idx][1], t);
  else if (t > nb - .14) body = tr((t - (nb - .14)) / .3, M[idx][1], M[idx + 1][1], t);
  else body = sceneFor(M[idx][1], t);
  // flashes
  let flash = 0;
  const fl = (t0, d) => { const e = t - t0; return e >= 0 && e < d ? 1 - e / d : 0; };
  flash = Math.max(fl(T('ring2', 2), .35), fl(T('bombar', 0), .2) * .6, fl(T('voce'), .2) * .5);
  // impacto na tela da escolha
  let out = DEFS.replace('SEED', String(frame % 9)) + body;
  if (M[idx][1] === 'world' && t >= T('entra', 2)) out += confetti(t);
  out += `<rect width="1080" height="1920" fill="url(#vig)"/>`;
  if (flash > 0) out += `<rect width="1080" height="1920" fill="#fff" opacity="${flash.toFixed(2)}"/>`;
  out += `<rect width="1080" height="1920" filter="url(#grainF)" opacity=".07" style="mix-blend-mode:overlay"/>`;
  out += hud(t) + caption(t);
  document.getElementById('main').innerHTML = out;
};
window.TOTAL = TOTAL;
