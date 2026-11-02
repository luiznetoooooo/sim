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

// ==================================================================== EP. 2 – "Operação Setup"
// (as funções comuns – Dudu, moscas, cheiro, destaques, legenda, DEFS – vêm do EP. 1 neste mesmo arquivo)

// -------------------------------------------------------------------- estado da história
const viewers = t => t < T('tres') ? 1 : t < T('clipe', 3) ? 3 : 48;
const fame = t => t < T('clipe', 3) ? 1 : 5;
const isLive = t => t >= T('bora', 1) + .05;
function budget(t) {
  if (t < T('orcamento', 1)) return null;
  if (t < T('ring', 2) + .4) return 37.5;
  return lerp(37.5, .5, EZ.out(prog(t, T('ring', 2) + .4, .7)));
}
const brl = v => 'R$ ' + v.toFixed(2).replace('.', ',');
function blinkLid(t, base) { const a = (t + .7) % 3.4, b = (t * 1.13) % 5.3; return (a < .11 || b < .1) ? 1 : base; }

// queda da cadeira
function fallAng(t) {
  const t0 = T('cedeu', 2) - .1; if (t < t0) return 0;
  const e = t - t0;
  if (e < .45) return -62 * Math.pow(e / .45, 2);
  return -62 + 5 * Math.sin((e - .45) * 18) * Math.exp(-(e - .45) * 6);
}
const fallTr = t => { const a = fallAng(t); return a ? `rotate(${f1(a)} 700 1300)` : ''; };
const HEAD_FALLEN = [279, 941];

// -------------------------------------------------------------------- monitor
function screenContent(t) {
  const x0 = 1086, y0 = 866, w = 298, h = 198;
  let s = `<g clip-path="url(#screenClip)">`;
  if (!isLive(t)) {
    const inBora = t >= T('bora');
    const cu = inBora ? EZ.inOut(prog(t, T('bora'), Math.max(.3, T('bora', 1) - T('bora') - .05))) : 0;
    const sc = btw(t, T('bora', 1) - .05, T('bora', 1) + .1) ? .9 : 1;
    s += `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="#0f0d1d"/>
     <text x="${x0 + w / 2}" y="${y0 + 46}" font-family="Nunito" font-weight="800" font-size="16" fill="#8b84b8" text-anchor="middle">PRONTO PARA TRANSMITIR?</text>
     <g transform="translate(${x0 + w / 2} ${y0 + 112}) scale(${sc})"><rect x="-110" y="-38" width="220" height="76" rx="38" fill="#E53935" stroke="#fff" stroke-width="4"/>
     <path d="M-78 -16 L-50 0 L-78 16 Z" fill="#fff"/><text x="12" y="13" font-family="Anton" font-size="34" fill="#fff" text-anchor="middle">INICIAR LIVE</text></g>`;
    if (inBora) {
      const cx = lerp(x0 + 260, x0 + w / 2 + 40, cu), cy = lerp(y0 + 180, y0 + 122, cu);
      s += `<path d="M${f1(cx)} ${f1(cy)} l0 34 l9 -8 l7 15 l7 -3 l-7 -15 l12 0 Z" fill="#fff" stroke="#000" stroke-width="2.5"/>`;
    }
  } else {
    s += `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="#5EC8FF"/>
    <rect x="${x0}" y="${y0 + 150}" width="${w}" height="48" fill="#4CAF50"/><rect x="${x0}" y="${y0 + 150}" width="${w}" height="10" fill="#7BD65A"/>
    <circle cx="${x0 + 60}" cy="${y0 + 50}" r="16" fill="#fff" opacity=".9"/><circle cx="${x0 + 80}" cy="${y0 + 48}" r="20" fill="#fff" opacity=".9"/>
    ${[0, 1, 2].map(i => `<circle cx="${x0 + 210 + i * 26}" cy="${f1(y0 + 110 + Math.sin(t * 5 + i) * 5)}" r="8" fill="#FFD21F" stroke="#B8860B" stroke-width="2"/>`).join('')}
    <rect x="${x0 + 120}" y="${f1(y0 + 126)}" width="18" height="24" fill="#E53935" stroke="#000" stroke-width="2"/>
    <rect x="${x0 + 10}" y="${y0 + 10}" width="92" height="26" rx="6" fill="#E53935"/>
    <circle cx="${x0 + 24}" cy="${y0 + 23}" r="6" fill="#fff" opacity="${(.5 + .5 * Math.sin(t * 8)).toFixed(2)}"/>
    <text x="${x0 + 64}" y="${y0 + 30}" font-family="Anton" font-size="17" fill="#fff" text-anchor="middle">AO VIVO</text>
    <rect x="${x0 + w - 100}" y="${y0 + 10}" width="90" height="26" rx="6" fill="rgba(0,0,0,.6)"/>
    <text x="${x0 + w - 55}" y="${y0 + 31}" font-family="Anton" font-size="19" fill="#fff" text-anchor="middle">👁 ${viewers(t)}</text>`;
  }
  return s + `</g>`;
}

// -------------------------------------------------------------------- objetos do EP. 2
function hatFly(x, y, t, ph) {
  return fly(x, y, t, ph) + `<g transform="translate(${f1(x)} ${f1(y - 8)})"><rect x="-7" y="-14" width="14" height="12" fill="#111"/><rect x="-11" y="-3" width="22" height="4" fill="#111"/></g>`;
}
function pizzaBox(t) {
  const flyT = T('naocons', 0) + .05;
  if (t >= flyT + .55) return '';
  let s = '';
  const tug = btw(t, T('resistir'), flyT) ? Math.sin(t * 38) * 6 : 0;
  if (t < flyT) {
    s += `<g transform="translate(${f1(tug)} 0)">
     <path d="M1118 1188 L1140 1060 L1348 1060 L1372 1188 Z" fill="#D9B27A" stroke="${C.out}" stroke-width="8" stroke-linejoin="round"/>
     <path d="M1150 1082 L1338 1082" stroke="#C0392B" stroke-width="8"/>
     <text x="1244" y="1140" font-family="Luckiest" font-size="30" fill="#C0392B" text-anchor="middle" opacity=".8">PIZZA</text>
     <path d="M1100 1188 L1390 1188 L1400 1236 L1090 1236 Z" fill="#E8C690" stroke="${C.out}" stroke-width="8" stroke-linejoin="round"/></g>`;
  }
  // a pizza (com cara)
  let px = 1240, py = 1206, rot = 0;
  if (t >= flyT) { const u = prog(t, flyT, .55); px = lerp(1240, 1520, u); py = lerp(1206, 1600, u) - Math.sin(u * Math.PI) * 380; rot = u * 540; }
  const angry = t >= T('resistir');
  s += `<g transform="translate(${f1(px + tug)} ${f1(py)}) rotate(${f1(rot)})">
   <path d="M5 4 L112 0 A110 26 0 0 1 -92 16 A110 26 0 0 1 5 -20 Z" fill="#F7C948" stroke="#C97A2F" stroke-width="10" stroke-linejoin="round"/>
   <ellipse cx="-50" cy="4" rx="16" ry="6" fill="#C0392B"/><ellipse cx="50" cy="12" rx="14" ry="5" fill="#C0392B"/>
   <ellipse cx="-25" cy="-6" rx="17" ry="15" fill="#fff" stroke="${C.out}" stroke-width="4"/><ellipse cx="25" cy="-6" rx="17" ry="15" fill="#fff" stroke="${C.out}" stroke-width="4"/>
   <circle cx="-22" cy="-3" r="6" fill="${C.out}"/><circle cx="22" cy="-3" r="6" fill="${C.out}"/>
   <path d="M-44 ${angry ? -30 : -24} L-10 -16 M44 ${angry ? -30 : -24} L10 -16" stroke="${C.out}" stroke-width="6" stroke-linecap="round"/>
   <path d="M-14 22 Q0 ${angry ? 10 : 14} 14 22" stroke="${C.out}" stroke-width="5" fill="none" stroke-linecap="round"/></g>`;
  if (btw(t, T('resistir', 0), flyT)) {
    const bu = EZ.back(prog(t, T('resistir', 0), .25));
    s += `<g transform="translate(1320 1080) scale(${bu.toFixed(3)})"><path d="M-70 -40 Q-70 -70 -40 -70 L60 -70 Q90 -70 90 -40 L90 -10 Q90 20 60 20 L0 20 L-30 44 L-24 20 L-40 20 Q-70 20 -70 -10 Z" fill="#fff" stroke="${C.out}" stroke-width="6"/>
     <text x="10" y="-12" font-family="Luckiest" font-size="38" fill="#C0392B" text-anchor="middle">HMPF!</text></g>`;
  }
  return s;
}
function ringLight(t) {
  const fixed = t >= T('ring', 1) - .05;
  const flick = btw(t, T('ring', 1) - .05, T('ring', 1) + .5) ? (Math.sin(t * 61) * Math.sin(t * 23) > 0 ? 1 : 0) : 1;
  const lit = fixed && flick;
  let s = `<path d="M330 960 L330 1720 M330 1720 L250 1840 M330 1720 L410 1840 M330 1720 L330 1840" stroke="${C.out}" stroke-width="18" stroke-linecap="round"/>
   <path d="M330 960 L330 1720" stroke="#555" stroke-width="8"/>`;
  if (lit) s += `<circle cx="330" cy="820" r="230" fill="url(#ringGlow)" opacity=".75"/>`;
  s += `<circle cx="330" cy="820" r="135" fill="none" stroke="${C.out}" stroke-width="40"/>
   <circle cx="330" cy="820" r="135" fill="none" stroke="${lit ? '#FFFFFF' : '#3b3b44'}" stroke-width="26"/>
   ${lit ? `<circle cx="330" cy="820" r="135" fill="none" stroke="#fffbe6" stroke-width="12" filter="url(#glowF)"/>` : ''}
   <path d="M230 740 L262 770 L250 800 M410 880 L380 860 L395 830 M300 950 L320 925" stroke="#111" stroke-width="6" fill="none"/>
   <rect x="312" y="790" width="36" height="62" rx="6" fill="#222" stroke="${C.out}" stroke-width="5"/>`;
  [200, 330, 80].forEach((a, k) => {
    const u = EZ.back(prog(t, T('ring', 2) + k * .15, .2)); if (u <= 0) return;
    const r = a * Math.PI / 180, x = 330 + Math.cos(r) * 135, y = 820 + Math.sin(r) * 135;
    s += `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${a + 90}) scale(${u.toFixed(3)})"><rect x="-46" y="-15" width="92" height="30" fill="#1b1b1f" stroke="#000" stroke-width="4"/><path d="M-40 -6 L40 -6" stroke="#444" stroke-width="3"/></g>`;
  });
  if (!fixed) s += stink(330, 700, t, 3, '#9a9aa6', 60);
  return s;
}
function money(t) {
  if (!btw(t, T('orcamento', 1) - .1, T('faxina'))) return '';
  const items = [['bill', '20', 690], ['bill', '10', 800], ['coin', '5', 910], ['coin', '2', 960], ['coin', '.50', 1000]];
  return items.map(([k, v, x], i) => {
    const t0 = T('orcamento', 1) + i * .22, u = prog(t, t0, .45); if (u <= 0) return '';
    const y = lerp(760, 1196, EZ.out(u)) - Math.abs(Math.sin(u * Math.PI * 2)) * 30 * (1 - u);
    if (k === 'bill') return `<g transform="translate(${x} ${f1(y)}) rotate(${f1((1 - u) * 40 * (i ? 1 : -1))})"><rect x="-58" y="-26" width="116" height="52" rx="6" fill="#6FCF97" stroke="${C.out}" stroke-width="5"/><circle r="15" fill="#B9F3CF"/><text y="10" font-family="Anton" font-size="26" fill="#1E6B3A" text-anchor="middle">${v}</text></g>`;
    return `<g transform="translate(${x} ${f1(y)})"><ellipse rx="22" ry="22" fill="#FFC93C" stroke="${C.out}" stroke-width="5"/><text y="7" font-family="Anton" font-size="17" fill="#8a6300" text-anchor="middle">${v}</text></g>`;
  }).join('');
}

// -------------------------------------------------------------------- cenário
function worldScene(t, cam) {
  let s = `<rect x="-600" y="-600" width="2900" height="2000" fill="url(#wallG)"/>
   <rect x="-600" y="-600" width="2900" height="2000" fill="url(#stripeP)" opacity=".5"/>
   <path d="M-600 150 L2300 150" stroke="url(#ledG)" stroke-width="14" filter="url(#glowF)"/>
   <path d="M-600 150 L2300 150" stroke="url(#ledG)" stroke-width="7"/>
   <ellipse cx="820" cy="170" rx="1100" ry="160" fill="#B04DFF" opacity=".10"/>
   <rect x="120" y="330" width="350" height="450" fill="url(#skyG)" stroke="${C.out}" stroke-width="14"/>
   <circle cx="390" cy="420" r="60" fill="#FFF4C2" opacity=".15"/><circle cx="390" cy="420" r="38" fill="#FFF4C2"/>
   ${[[170, 380], [250, 450], [200, 560], [430, 600], [300, 370], [160, 690]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${f1(3 + 2 * Math.abs(Math.sin(t * 2 + i)))}" fill="#fff"/>`).join('')}
   <path d="M120 600 L180 560 L220 600 L290 540 L350 610 L410 570 L470 620 L470 780 L120 780 Z" fill="#141029"/>
   <path d="M295 330 L295 780 M120 555 L470 555" stroke="${C.out}" stroke-width="12"/>
   <path d="M90 300 L90 820 Q150 700 140 300 Z" fill="#6D3B8C" stroke="${C.out}" stroke-width="8"/>
   <path d="M500 300 Q470 520 520 800 L420 820 Q470 600 440 300 Z" fill="#6D3B8C" stroke="${C.out}" stroke-width="8"/>
   <path d="M60 300 L540 300" stroke="${C.out}" stroke-width="14"/>
   <g transform="rotate(5 1240 430)"><rect x="1130" y="290" width="220" height="280" fill="#232542" stroke="${C.out}" stroke-width="9"/>
    <text x="1240" y="380" font-family="Luckiest" font-size="54" fill="${C.yellow}" text-anchor="middle">GAME</text>
    <text x="1240" y="440" font-family="Luckiest" font-size="54" fill="#FF4757" text-anchor="middle">ON</text>
    <rect x="1185" y="470" width="110" height="60" rx="26" fill="#fff"/><circle cx="1215" cy="500" r="9" fill="#232542"/><circle cx="1268" cy="492" r="7" fill="#FF4757"/><circle cx="1280" cy="508" r="7" fill="#39C2FF"/></g>
   <g transform="rotate(-6 640 330)"><rect x="565" y="240" width="150" height="190" fill="#E84A5F" stroke="${C.out}" stroke-width="8"/>
    <text x="640" y="320" font-family="Anton" font-size="48" fill="#fff" text-anchor="middle">PRO</text><text x="640" y="380" font-family="Anton" font-size="30" fill="#fff" text-anchor="middle" opacity=".8">PLAYER</text></g>
   <rect x="1170" y="660" width="360" height="22" fill="#5B3A25" stroke="${C.out}" stroke-width="7"/>
   ${[0, 1, 2].map(i => `<rect x="${1190 + i * 40}" y="600" width="32" height="60" rx="5" fill="${['#3DDC84', '#FF4757', '#39C2FF'][i]}" stroke="${C.out}" stroke-width="5"/>`).join('')}
   <path d="M1360 600 L1440 600 L1430 640 Q1400 660 1370 640 Z" fill="#E1B12C" stroke="${C.out}" stroke-width="6"/><rect x="1385" y="640" width="30" height="20" fill="#E1B12C" stroke="${C.out}" stroke-width="5"/>
   <text x="1400" y="625" font-family="Anton" font-size="12" fill="#6d5300" text-anchor="middle">PARTICIPAÇÃO</text>
   <rect x="-600" y="1380" width="2900" height="1100" fill="#3A2A24"/>
   ${[1440, 1530, 1640, 1770, 1920].map(y => `<path d="M-600 ${y} L2300 ${y}" stroke="#2C1F1A" stroke-width="6"/>`).join('')}
   <rect x="-600" y="1380" width="2900" height="20" fill="#2C1F1A"/>
   <rect x="-420" y="1150" width="560" height="300" rx="30" fill="#5865A8" stroke="${C.out}" stroke-width="9"/>
   <path d="M-420 1160 Q-200 1080 60 1170 Q160 1210 140 1300 L-420 1300 Z" fill="#8A5FBF" stroke="${C.out}" stroke-width="9"/>`;
  s += ringLight(t);
  // cadeira (cai junto com o Dudu)
  const chairT = t < T('calco', 1) ? -8 : -3;
  s += `<g transform="${fallTr(t)}"><g transform="rotate(${chairT} 820 1300)">
   <path d="M590 1260 L578 690 Q588 588 700 578 L940 578 Q1052 588 1062 690 L1072 1260 Z" fill="#1F1F27" stroke="${C.out}" stroke-width="11" stroke-linejoin="round"/>
   <path d="M600 700 L612 1240 M1040 700 L1050 1240" stroke="${C.red}" stroke-width="30"/>
   <rect x="720" y="600" width="200" height="70" rx="30" fill="${C.red}" stroke="${C.out}" stroke-width="7"/>
   <g transform="rotate(32 615 820)"><rect x="560" y="805" width="120" height="34" fill="#C7C7C7" stroke="${C.out}" stroke-width="5"/></g>
   <g transform="rotate(-28 615 830)"><rect x="560" y="815" width="120" height="34" fill="#BDBDBD" stroke="${C.out}" stroke-width="5"/></g></g></g>`;
  // embaixo da mesa: PC
  s += `<ellipse cx="840" cy="1830" rx="560" ry="40" fill="#000" opacity=".35"/>
   <rect x="1110" y="1420" width="160" height="380" rx="12" fill="#17171f" stroke="${C.out}" stroke-width="9"/>
   <circle cx="1190" cy="1520" r="44" fill="none" stroke="hsl(${(t * 120) % 360} 90% 60%)" stroke-width="10"/>
   <circle cx="1190" cy="1640" r="44" fill="none" stroke="hsl(${(t * 120 + 120) % 360} 90% 60%)" stroke-width="10"/>`;
  // cabos: embolados -> organizados
  const cu = EZ.inOut(prog(t, T('cabos', 1), T('cabos', 3) - T('cabos', 1)));
  const cab = ['#111', '#222', '#C62828', '#333', '#1565C0', '#111'];
  for (let i = 0; i < 9; i++) {
    const y = 1480 + i * 30;
    const P = [[700 + Math.sin(i) * 200, y - 150], [600 + i * 40, y + 160], [880 + Math.cos(i * 1.7) * 90, y], [1050, 1600 + i * 12]];
    const Q = [[450 + i * 20, 1560], [700, 1700 + i * 6], [900, 1700 + i * 6], [1060, 1600 + i * 12]];
    const L = P.map((p, k) => [lerp(p[0], Q[k][0], cu), lerp(p[1], Q[k][1], cu)]);
    s += `<path d="M${450 + i * 20} ${1290 + i * 5} C ${f1(L[0][0])} ${f1(L[0][1])}, ${f1(L[1][0])} ${f1(L[1][1])}, ${f1(L[2][0])} ${f1(L[2][1])} S ${f1(L[3][0])} ${f1(L[3][1])}, 1110 ${1500 + i * 18}" stroke="${cab[i % cab.length]}" stroke-width="10" fill="none"/>`;
  }
  if (cu < .9) s += `<g opacity="${(1 - cu / .9).toFixed(2)}"><ellipse cx="900" cy="1580" rx="60" ry="40" fill="none" stroke="#111" stroke-width="9"/><ellipse cx="910" cy="1585" rx="40" ry="55" fill="none" stroke="#C62828" stroke-width="8"/></g>`;
  if (cu > .95) s += [560, 800, 1000].map(x => `<rect x="${x - 6}" y="1680" width="12" height="44" rx="4" fill="#fff" stroke="${C.out}" stroke-width="3"/>`).join('');
  if (t >= T('cabos', 4)) {  // o cabo que sobrou
    const w = Math.sin(t * 7) * 30;
    s += `<path d="M990 1292 C 1000 1380, ${f1(960 + w)} 1440, ${f1(990 - w)} 1520" stroke="#E67E22" stroke-width="12" fill="none" stroke-linecap="round"/>
     <rect x="${f1(975 - w)}" y="1518" width="30" height="40" rx="6" fill="#ddd" stroke="${C.out}" stroke-width="5"/>`;
  }
  s += `<rect x="760" y="1700" width="170" height="40" rx="8" fill="#ddd" stroke="${C.out}" stroke-width="6"/>
   ${[0, 1, 2, 3].map(i => `<rect x="${775 + i * 38}" y="1680" width="22" height="30" fill="#333" stroke="${C.out}" stroke-width="3"/>`).join('')}`;
  // base da cadeira + calço de caixa de pizza
  const slip = prog(t, T('cedeu', 1), .35);
  s += `<g transform="rotate(${t < T('calco', 1) ? -4 : 0} 820 1770)"><rect x="806" y="1430" width="28" height="330" fill="#2a2a33" stroke="${C.out}" stroke-width="6"/>
   <path d="M820 1770 L660 1800 M820 1770 L980 1800 M820 1770 L820 1812" stroke="${C.out}" stroke-width="16" stroke-linecap="round"/>
   <circle cx="980" cy="1810" r="17" fill="#222" stroke="${C.out}" stroke-width="5"/><circle cx="820" cy="1820" r="17" fill="#222" stroke="${C.out}" stroke-width="5"/></g>`;
  if (t >= T('calco', 1)) {
    const u = EZ.back(prog(t, T('calco', 1), .3));
    s += `<g transform="translate(${f1(-slip * 160)} 0) rotate(${f1(-slip * 25)} 650 1830)">` + [0, 1, 2].map(k =>
      `<g transform="translate(650 ${1842 - k * 15}) scale(${u.toFixed(3)})"><rect x="-62" y="-7" width="124" height="15" fill="#D9B27A" stroke="${C.out}" stroke-width="4"/><path d="M-62 0 L62 0" stroke="#C0392B" stroke-width="3"/></g>`).join('') + `</g>`;
  }
  return s;
}

function worldFront(t, dud) {
  let s = `<rect x="1070" y="850" width="330" height="230" rx="16" fill="#111" stroke="${C.out}" stroke-width="10"/>
   ${screenContent(t)}
   <rect x="1215" y="1078" width="40" height="122" fill="#222" stroke="${C.out}" stroke-width="6"/>
   <ellipse cx="1235" cy="1205" rx="80" ry="12" fill="#222" stroke="${C.out}" stroke-width="6"/>
   <g transform="rotate(-8 1110 825)"><rect x="1080" y="800" width="60" height="60" fill="#FFE066" stroke="${C.out}" stroke-width="4"/>
   <text x="1110" y="837" font-family="Nunito" font-weight="800" font-size="12" fill="#333" text-anchor="middle">SUCESSO</text></g>
   <g transform="rotate(10 1370 825)"><rect x="1345" y="800" width="54" height="54" fill="#7CF0FF" stroke="${C.out}" stroke-width="4"/>
   <text x="1372" y="832" font-family="Nunito" font-weight="800" font-size="11" fill="#333" text-anchor="middle">1M SUBS</text></g>
   <path d="M350 1212 L1320 1212 L1352 1262 L318 1262 Z" fill="#7A5236" stroke="${C.out}" stroke-width="9" stroke-linejoin="round"/>
   <rect x="318" y="1262" width="1034" height="30" fill="#5B3A25" stroke="${C.out}" stroke-width="8"/>
   <rect x="340" y="1292" width="34" height="540" fill="#4A2F1E" stroke="${C.out}" stroke-width="8"/>
   <rect x="1296" y="1292" width="34" height="540" fill="#4A2F1E" stroke="${C.out}" stroke-width="8"/>
   <path d="M652 1222 L990 1222 L1002 1252 L640 1252 Z" fill="#22222B" stroke="${C.out}" stroke-width="7"/>
   <path d="M660 1246 L984 1246" stroke="hsl(${(t * 140) % 360} 90% 60%)" stroke-width="4"/>
   ${[0, 1, 2].map(r => `<path d="M${668 - r * 3} ${1230 + r * 7} L${976 + r * 3} ${1230 + r * 7}" stroke="#3b3b48" stroke-width="5" stroke-dasharray="14 5"/>`).join('')}
   <ellipse cx="1045" cy="1240" rx="26" ry="14" fill="#2a2a33" stroke="${C.out}" stroke-width="6"/>`;
  if (t < T('sacos', 1)) s += `<rect x="415" y="1135" width="42" height="82" rx="6" fill="#3DDC84" stroke="${C.out}" stroke-width="6"/>
   <rect x="465" y="1150" width="42" height="68" rx="6" fill="#FF4757" stroke="${C.out}" stroke-width="6"/>`;
  // microfone (+ meia)
  s += `<path d="M575 1215 L575 1150" stroke="#555" stroke-width="12"/><ellipse cx="575" cy="1215" rx="44" ry="10" fill="#333" stroke="${C.out}" stroke-width="6"/>
   <rect x="545" y="1030" width="62" height="128" rx="31" fill="#9AA0A6" stroke="${C.out}" stroke-width="8"/>
   <g transform="rotate(14 640 1050)"><rect x="608" y="1032" width="96" height="36" rx="5" fill="#FFE066" stroke="${C.out}" stroke-width="4"/>
   <text x="656" y="1057" font-family="Nunito" font-weight="800" font-size="18" fill="#C0392B" text-anchor="middle">R$ 19,90</text></g>`;
  if (t >= T('meia', 1)) {
    const u = EZ.back(prog(t, T('meia', 1), .3));
    s += `<g transform="translate(576 1090) scale(${u.toFixed(3)}) translate(-576 -1090)"><path d="M536 1150 L536 1040 Q536 996 576 996 Q616 996 616 1040 L616 1150 Z" fill="#fff" stroke="${C.out}" stroke-width="7"/>
     <path d="M538 1050 L614 1050 M538 1085 L614 1085 M538 1120 L614 1120" stroke="#E53935" stroke-width="12"/><path d="M536 1150 L616 1150" stroke="${C.out}" stroke-width="8"/></g>`;
    if (btw(t, T('meia', 2) - .3, T('ring'))) {  // mosca quica na meia
      const e = t - (T('meia', 2) - .3), x = e < .3 ? lerp(760, 630, e / .3) : 630 + (e - .3) * 400, y = 1060 - (e > .3 ? Math.sin((e - .3) * 9) * 60 : 0);
      s += fly(x, y, t, 1);
    }
  }
  s += money(t) + pizzaBox(t);
  if (t < T('naocons', 0) + .05) s += stink(1240, 1185, t, 3, '#9BE15D', 50, 70) + flies(1240, 1140, t, 3, 90);
  else {  // moscas de luto seguem a pizza
    const u = prog(t, T('naocons', 0) + .05, .8);
    for (let i = 0; i < 3; i++) {
      const x = lerp(1240, 1520, u) + Math.cos(t * 3 + i * 2) * 50, y = lerp(1140, 1560, u) + Math.sin(t * 4 + i) * 20 - i * 30;
      s += hatFly(x, y, t, i);
    }
  }
  // braços (caem junto)
  s += `<g transform="${fallTr(t)}">${dud.arms}</g>`;
  // bagunça no chão (some na faxina)
  const pile = 1 - prog(t, T('sacos', 1), .5), paper = 1 - prog(t, T('sacos', 3), .4);
  if (pile > 0) s += `<g opacity="${pile.toFixed(2)}"><path d="M120 1860 Q160 1740 260 1760 Q330 1700 420 1770 Q470 1820 450 1880 Z" fill="#8E44AD" stroke="${C.out}" stroke-width="8"/>
   <path d="M200 1880 Q240 1800 330 1820 Q380 1840 360 1890 Z" fill="#16A085" stroke="${C.out}" stroke-width="8"/></g>`;
  if (paper > 0) s += `<g opacity="${paper.toFixed(2)}"><circle cx="560" cy="1830" r="20" fill="#eee" stroke="${C.out}" stroke-width="5"/><circle cx="1000" cy="1860" r="16" fill="#eee" stroke="${C.out}" stroke-width="5"/></g>`;
  if (t < T('calco', 1)) s += [0, 1, 2].map(i => `<g transform="rotate(${[-4, 3, -2][i]} 1420 ${1820 - i * 46})"><rect x="1300" y="${1800 - i * 46}" width="250" height="46" fill="#D9B27A" stroke="${C.out}" stroke-width="7"/><path d="M1300 ${1818 - i * 46} L1550 ${1818 - i * 46}" stroke="#C0392B" stroke-width="6"/></g>`).join('');
  // lixeira com tampa
  const lidA = btw(t, T('naocons', 0), T('naocons', 0) + .9) ? -70 + 70 * EZ.elastic(prog(t, T('naocons', 0) + .6, .3)) : 0;
  s += `<path d="M1460 1620 L1580 1620 L1565 1800 L1475 1800 Z" fill="#2E7D32" stroke="${C.out}" stroke-width="8"/>
   <g transform="rotate(${f1(lidA)} 1458 1618)"><rect x="1450" y="1604" width="138" height="20" rx="8" fill="#1E5E22" stroke="${C.out}" stroke-width="6"/><rect x="1505" y="1592" width="28" height="12" rx="4" fill="#1E5E22" stroke="${C.out}" stroke-width="4"/></g>`;
  if (t < T('sacos', 1)) s += `<circle cx="1490" cy="1590" r="26" fill="#ddd" stroke="${C.out}" stroke-width="5"/>`;
  // sacos de lixo
  [[1170, 1790], [1265, 1800], [1365, 1785]].forEach(([x, y], k) => {
    const u = EZ.back(prog(t, T('sacos', 0) + k * .18, .3)); if (u <= 0) return;
    s += `<g transform="translate(${x} ${y}) scale(${u.toFixed(3)})"><path d="M-52 40 Q-62 -20 -20 -46 L-8 -62 L8 -62 L20 -46 Q62 -20 52 40 Z" fill="#26262e" stroke="${C.out}" stroke-width="6"/>
     <path d="M-10 -62 L-22 -78 M10 -62 L22 -78" stroke="#26262e" stroke-width="8" stroke-linecap="round"/><path d="M-30 -10 Q-20 -30 -5 -20" stroke="#555" stroke-width="4" fill="none"/></g>`;
  });
  // meias voando
  [[0, 2], [1, 3]].forEach(([k, ch]) => {
    const u = prog(t, T('sacos', ch), .5); if (u <= 0 || u >= 1) return;
    const x = lerp(820, 1265, u), y = lerp(1100, 1760, u) - Math.sin(u * Math.PI) * 300;
    s += `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${f1(u * 720)})"><path d="M-14 -40 L14 -40 L14 10 Q14 30 34 30 L34 44 L-6 44 Q-14 44 -14 30 Z" fill="${k ? '#39C2FF' : '#FF7AB6'}" stroke="${C.out}" stroke-width="5"/></g>`;
  });
  // objeto não identificado
  if (btw(t, T('sacos', 4) - .05, T('resistir'))) {
    const u = EZ.back(prog(t, T('sacos', 4) - .05, .3)), out = 1 - prog(t, E('sacos') + .1, .3), pul = 1 + .08 * Math.sin(t * 9);
    const sc = u * out * pul;
    if (sc > .01) {
      let fur = ''; for (let i = 0; i < 18; i++) { const a = i / 18 * 6.28; fur += `<path d="M${f1(Math.cos(a) * 52)} ${f1(Math.sin(a) * 42)} l${f1(Math.cos(a) * 18)} ${f1(Math.sin(a) * 14)}" stroke="#4E7A1F" stroke-width="6" stroke-linecap="round"/>`; }
      const bl = (t % 1.7) < .1;
      s += `<g transform="translate(560 1770) scale(${sc.toFixed(3)})">${fur}<ellipse rx="56" ry="46" fill="#7CB342" stroke="${C.out}" stroke-width="6"/>
       <ellipse cx="-18" cy="-8" rx="11" ry="${bl ? 2 : 13}" fill="#fff" stroke="${C.out}" stroke-width="4"/><ellipse cx="18" cy="-8" rx="11" ry="${bl ? 2 : 13}" fill="#fff" stroke="${C.out}" stroke-width="4"/>
       ${bl ? '' : `<circle cx="-16" cy="-6" r="5" fill="${C.out}"/><circle cx="20" cy="-6" r="5" fill="${C.out}"/>`}</g>`;
    }
  }
  // brilhos do quarto limpo
  if (btw(t, T('quarto'), T('tres'))) {
    s += [[500, 1330], [1010, 1150], [250, 900], [1300, 700], [700, 1620], [1450, 1300], [820, 420], [140, 1250]].map(([x, y], i) => {
      const k = Math.max(0, Math.sin(t * 5 + i * 1.7)) * EZ.back(prog(t, T('quarto') + i * .08, .3));
      return `<path transform="translate(${x} ${y}) scale(${k.toFixed(3)})" d="M0 -40 L10 -10 L40 0 L10 10 L0 40 L-10 10 L-40 0 L-10 -10 Z" fill="#FFF7C2"/>`;
    }).join('');
  }
  // nuvens de poeira (faxina)
  if (btw(t, T('faxina', 1), T('resistir'))) {
    for (let i = 0; i < 4; i++) {
      const ph = ((t * 1.6 + i / 4) % 1), x = 500 + ((i * 337) % 700), y = 1700 - (i % 2) * 450;
      s += `<circle cx="${x}" cy="${f1(y - ph * 40)}" r="${f1(30 + ph * 70)}" fill="#cfc6bd" opacity="${f1((1 - ph) * .55)}"/>`;
    }
  }
  s += DUST.map(([x, y, ph, r]) => `<circle cx="${f1(x + Math.sin(t * .5 + ph) * 30)}" cy="${f1(y + Math.cos(t * .4 + ph) * 25)}" r="${r}" fill="#fff" opacity="${f1(.12 + .1 * Math.sin(t + ph))}"/>`).join('');
  s += `<ellipse cx="1150" cy="920" rx="520" ry="560" fill="url(#monGlow)"/>`;
  // estrelinhas de tontura + chinelo voando
  const tl = T('cedeu', 2) + .35;
  if (t >= tl && t < T('opcoes')) {
    const [hx, hy] = HEAD_FALLEN;
    for (let i = 0; i < 3; i++) {
      const a = t * 4 + i * 2.09, x = hx + Math.cos(a) * 110, y = hy - 150 + Math.sin(a) * 30;
      s += `<path transform="translate(${f1(x)} ${f1(y)}) scale(.9)" d="M0 -26 L7 -8 L26 -8 L11 4 L17 24 L0 12 L-17 24 L-11 4 L-26 -8 L-7 -8 Z" fill="${C.yellow}" stroke="#000" stroke-width="4"/>`;
    }
  }
  if (t >= T('cedeu', 2) - .1) {
    const u = prog(t, T('cedeu', 2) - .1, .8);
    const x = lerp(1120, 900, u), y = lerp(1560, 1196, u) - Math.sin(u * Math.PI) * 500;
    s += `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${f1(u * 720)})"><ellipse rx="74" ry="22" fill="#2E86DE" stroke="${C.out}" stroke-width="7"/><path d="M-34 -6 Q0 -40 34 -6" stroke="#F4D03F" stroke-width="10" fill="none" stroke-linecap="round"/></g>`;
  }
  return s;
}

// -------------------------------------------------------------------- vassoura no braço
function broomAt(hx, hy) {
  return `<path d="M${f1(hx)} ${f1(hy)} L${f1(hx - 70)} ${f1(hy + 430)}" stroke="${C.out}" stroke-width="22" stroke-linecap="round"/>
   <path d="M${f1(hx)} ${f1(hy)} L${f1(hx - 70)} ${f1(hy + 430)}" stroke="#A0522D" stroke-width="12" stroke-linecap="round"/>
   <path d="M${f1(hx - 120)} ${f1(hy + 520)} L${f1(hx - 20)} ${f1(hy + 520)} L${f1(hx - 50)} ${f1(hy + 420)} L${f1(hx - 90)} ${f1(hy + 420)} Z" fill="#F4D03F" stroke="${C.out}" stroke-width="7"/>`;
}

// -------------------------------------------------------------------- poses
function dudPose(t) {
  const q = { dy: Math.sin(t * 2.2) * 3, tilt: Math.sin(t * .9) * 1.5, soot: 1, lid: .35 };
  const env = id => { const s = SG[id]; const i = Math.floor((t - s.s) * FPS); return s.env && i >= 0 && i < s.env.length ? s.env[i] : 0; };
  if (t < T('muita')) {
    Object.assign(q, { lookY: t >= T('orcamento', 1) ? .8 : 0, lookX: t >= T('orcamento', 1) ? -.2 : 0, smile: .4, lid: .1, brow: .5, pupil: 14 });
  } else if (t < T('faxina')) {
    Object.assign(q, { armR: [-18, -172], holdR: 'thumb', smile: 1, mouthO: env('muita') * .85, lid: 0, brow: .6, sparkle: 1 });
  } else if (t < T('resistir')) {
    const sw = Math.sin(t * 13);
    Object.assign(q, { armR: [28 + sw * 8, -8], holdR: 'broom', armL: [40, -40], smile: .2, brow: -.4, lid: .1, mouthO: .15, sweat: (t * .8) % 1 });
    q.dx = sw * 110;
  } else if (t < T('naocons')) {
    Object.assign(q, { armR: [30 + Math.sin(t * 20) * 4, 40], smile: -.5, mouthO: .2, brow: -.9, lid: .2, tilt: -5, lookX: .9, lookY: .5 });
  } else if (t < T('cabos')) {
    const u = prog(t, T('naocons'), .3);
    Object.assign(q, { armR: [lerp(30, 140, u), lerp(40, 160, u)], smile: .7, lookX: .9, lookY: .6, lid: .1 });
  } else if (t < T('calco')) {
    Object.assign(q, { lid: .65, dark: 1, smile: -.2, lookY: .7 });
  } else if (t < T('ring')) {
    Object.assign(q, { smile: .4, lookX: -.4, lookY: .5 });
  } else if (t < T('quarto')) {
    const pray = t >= T('ring', 3) - .1;
    Object.assign(q, pray ? { armL: [8, -108], armR: [8, -108], lid: 1, smile: .3, brow: .5 } : { smile: .5, lookX: -.8, brow: .3 });
  } else if (t < T('bora')) {
    Object.assign(q, { smile: 1, lid: 0, brow: .4, sparkle: 1 });
  } else if (t < T('tres')) {
    const w = Math.sin(t * 9);
    Object.assign(q, { armL: [150 + 10 * w, 172 + 14 * w], armR: [150 - 10 * w, 172 - 14 * w], mouthO: env('bora') * .9, smile: .9, lid: .02, brow: .6, sparkle: 1 });
    q.dy += -Math.abs(Math.sin(t * 8)) * 14;
  } else if (t < T('cedeu', 2) - .1) {
    Object.assign(q, { smile: .55, lid: .05, brow: .7, pupil: 9, sweat: prog(t, T('cedeu'), 1.2), lookY: t >= T('cedeu', 1) ? .8 : 0, mouthO: t >= T('cedeu', 1) ? .3 : 0 });
  } else if (t < T('cedeu', 2) + .35) {
    const w = Math.sin(t * 30);
    Object.assign(q, { armL: [150 + w * 15, 170], armR: [150 - w * 15, 170], mouthO: .85, brow: 1, lid: 0, pupil: 8, smile: -.3 });
  } else if (t < T('viral')) {
    Object.assign(q, { armL: [100, 130], armR: [100, 130], lid: .45, pupil: 8, mouthO: .2, smile: -.2, lookX: Math.sin(t * 5) * .6 });
  } else {
    Object.assign(q, { armL: [100, 130], armR: [100, 130], sparkle: 1, smile: 1, lid: 0, brow: .6, mouthO: Math.max(env('viral') * .85, t > E('viral') ? .2 : 0) });
  }
  q.lid = blinkLid(t, q.lid);
  return q;
}

// -------------------------------------------------------------------- câmera
const WIDE = [820, 1070, .92], MED = [820, 930, 1.3];
let KF = null;
function buildKF() {
  KF = [
    { t: 0, c: [820, 1000, 1.45], d: 0 },
    { t: T('orcamento', 0), c: [820, 1010, 1.5], d: 0 },
    { t: T('orcamento', 1) - .05, c: [840, 1110, 1.4], d: .3, e: 'back' },
    { t: T('muita', 0) - .1, c: [820, 860, 1.8], d: .26, e: 'back' },
    { t: T('faxina', 0) - .1, c: WIDE, d: .3, e: 'inOut' },
    { t: T('sacos', 4) - .1, c: [600, 1690, 2.0], d: .28, e: 'back' },
    { t: T('resistir', 0) - .1, c: [1150, 1120, 1.7], d: .28, e: 'back' },
    { t: T('naocons', 0) - .08, c: [1300, 1480, 1.25], d: .26, e: 'back' },
    { t: T('cabos', 0) - .1, c: [860, 1560, 1.65], d: .28, e: 'back' },
    { t: T('calco', 0) - .1, c: [720, 1700, 2.1], d: .28, e: 'back' },
    { t: T('meia', 0) - .1, c: [590, 1100, 3.0], d: .28, e: 'back' },
    { t: T('ring', 0) - .1, c: [560, 860, 1.4], d: .35, e: 'inOut' },
    { t: T('quarto', 0) - .1, c: WIDE, d: .45, e: 'inOut' },
    { t: T('bora', 0) - .1, c: MED, d: .28, e: 'back' },
    { t: T('cedeu', 0), c: [740, 1150, 1.05], d: 0 },
    { t: T('cedeu', 2) - .1, c: [700, 1150, .95], d: .3, e: 'out' },
    { t: T('viral', 0) - .1, c: [330, 930, 1.9], d: .26, e: 'back' },
    { t: T('errado', 0) - .1, c: [640, 1150, 1.1], d: .22, e: 'back' },
  ];
}
function camAt(t, noShake) {
  if (!KF) buildKF();
  let from = KF[0].c, k = KF[0];
  for (let i = 1; i < KF.length && KF[i].t <= t; i++) {
    const u = k.d ? EZ[k.e || 'inOut'](clamp((KF[i].t - k.t) / k.d)) : 1;
    from = from.map((v, j) => lerp(v, k.c[j], u));
    k = KF[i];
  }
  const u = k.d ? EZ[k.e || 'inOut'](clamp((t - k.t) / k.d)) : 1;
  const c = from.map((v, j) => lerp(v, k.c[j], u));
  c[0] += Math.sin(t * .7) * 5 / c[2]; c[1] += Math.cos(t * .9) * 4 / c[2];
  const shake = (t0, amp, dur) => { const e = t - t0; return e > 0 && e < dur ? amp * (1 - e / dur) : 0; };
  if (noShake) return c;
  let a = shake(T('cedeu', 2) + .3, 34, .6);
  if (btw(t, T('faxina', 1), T('resistir'))) a += 4;
  c[0] += Math.sin(t * 83) * a / c[2]; c[1] += Math.cos(t * 71) * a / c[2];
  return c;
}

// -------------------------------------------------------------------- mundo composto
function worldLayer(t) {
  const cam = camAt(t);
  const pose = dudPose(t);
  const dud = duduParts(t, pose);
  if (pose.holdR === 'broom') {  // vassoura na mão direita
    const d1 = dir(1, pose.armR[0]), d2 = dir(1, pose.armR[1]);
    const hx = 1035 + d1[0] * 175 + d2[0] * 182 + (pose.dx || 0), hy = 968 + d1[1] * 175 + d2[1] * 182 + (pose.dy || 0);
    dud.arms += broomAt(hx, hy);
  }
  const c1 = camAt(t, true), c2 = camAt(t - 1 / FPS, true);
  const vx = (c1[0] - c2[0]) * c1[2], vy = (c1[1] - c2[1]) * c1[2], vz = Math.abs(c1[2] - c2[2]) / c1[2] * 110;
  const bx = Math.min(14, Math.abs(vx) * .16 + vz * .5), by = Math.min(14, Math.abs(vy) * .16 + vz * .5);
  const tr = `translate(540 960) scale(${cam[2].toFixed(4)}) translate(${f1(-cam[0])} ${f1(-cam[1])})`;
  let s = '';
  if (bx > 1 || by > 1) s += `<filter id="mbF" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="${f1(bx / cam[2])} ${f1(by / cam[2])}"/></filter>`;
  s += `<g transform="${tr}" ${bx > 1 || by > 1 ? 'filter="url(#mbF)"' : ''}>`;
  s += worldScene(t, cam) + `<g transform="${fallTr(t)}">${dud.legs}${dud.back}</g>` + worldFront(t, dud);
  const z = cam[2];
  if (btw(t, T('sacos', 4), T('resistir'))) s += hlCircle(560, 1770, 120, 100, t, T('sacos', 4), z) + qmarks(560, 1630, t, T('sacos', 5), z);
  if (btw(t, T('cabos', 4), T('calco'))) s += hlCircle(990, 1440, 90, 150, t, T('cabos', 4) + .1, z) + qmarks(990, 1300, t, T('cabos', 5), z);
  if (btw(t, T('calco', 1), T('meia'))) s += hlCircle(650, 1830, 130, 55, t, T('calco', 1) + .15, z) + arrow(650, 1770, 0, t, T('calco', 2), z, 1.1);
  if (btw(t, T('meia', 1), T('ring'))) s += hlCircle(576, 1075, 85, 100, t, T('meia', 1) + .2, z);
  if (btw(t, T('ring', 2), T('quarto'))) s += hlCircle(330, 820, 175, 175, t, T('ring', 2), z);
  s += `</g>`;
  if (t >= T('ring', 1) && flickOn(t) && t < T('cedeu', 2)) s += `<rect width="1080" height="1920" fill="#fffbe8" opacity=".06"/>`;
  // linhas de velocidade (montagem da faxina)
  if (btw(t, T('faxina', 1), T('resistir') - .15)) {
    seed = 5; let l = '';
    for (let i = 0; i < 14; i++) { const y = rnd() * 1920, sp = 2500 + rnd() * 2000, len = 200 + rnd() * 300, x = ((t * sp + rnd() * 3000) % 2600) - 800;
      l += `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(len)}" height="6" rx="3" fill="#fff" opacity=".22"/>`; }
    s += l;
  }
  return s;
}
const flickOn = t => !btw(t, T('ring', 1) - .05, T('ring', 1) + .5) || Math.sin(t * 61) * Math.sin(t * 23) > 0;

// -------------------------------------------------------------------- tela da live (chat)
function streamUI(t) {
  let s = `<rect width="1080" height="1920" fill="#0D0B1E"/><circle cx="540" cy="700" r="900" fill="url(#purpleR)"/>
   <rect width="1080" height="1920" fill="url(#dotP)" opacity=".35"/>
   <g transform="rotate(-1.2 540 960)">
   <rect x="64" y="300" width="952" height="1040" rx="40" fill="#000" opacity=".45" transform="translate(10 16)"/>
   <rect x="64" y="300" width="952" height="1040" rx="40" fill="#17142B" stroke="#4A3B8F" stroke-width="5"/>
   <rect x="104" y="332" width="200" height="56" rx="28" fill="#E53935"/>
   <circle cx="134" cy="360" r="11" fill="#fff" opacity="${(.5 + .5 * Math.sin(t * 8)).toFixed(2)}"/>
   <text x="218" y="378" font-family="Anton" font-size="36" fill="#fff" text-anchor="middle">AO VIVO</text>
   <text x="330" y="376" font-family="Nunito" font-weight="800" font-size="34" fill="#fff">DuduGamer_PRO</text>
   <text x="976" y="378" font-family="Anton" font-size="${f1(40 * (btw(t, T('tres'), T('tres') + .4) ? 1.3 : 1))}" fill="#fff" text-anchor="end">👁 ${viewers(t)}</text>
   <clipPath id="gameC"><rect x="104" y="410" width="872" height="360" rx="18"/></clipPath><g clip-path="url(#gameC)">
   <rect x="104" y="410" width="872" height="360" fill="#5EC8FF"/>
   <circle cx="260" cy="500" r="40" fill="#fff" opacity=".9"/><circle cx="310" cy="490" r="52" fill="#fff" opacity=".9"/><circle cx="700" cy="520" r="36" fill="#fff" opacity=".9"/>
   <rect x="104" y="690" width="872" height="80" fill="#4CAF50"/><rect x="104" y="690" width="872" height="16" fill="#7BD65A"/>
   ${[0, 1, 2, 3].map(i => `<circle cx="${300 + i * 90}" cy="${f1(600 + Math.sin(t * 5 + i) * 12)}" r="18" fill="#FFD21F" stroke="#B8860B" stroke-width="4"/>`).join('')}
   <rect x="${f1(180 + (t * 120) % 500)}" y="636" width="40" height="54" fill="#E53935" stroke="#000" stroke-width="4"/></g>`;
  const frozen = t >= T('estranho', 4) - .05;
  const wq = frozen ? { lookY: .4, smile: .5, brow: .7, lid: .05, pupil: 9, sweat: prog(t, T('estranho', 4), 1.2), soot: 1 }
    : { lookY: .4, smile: .9, brow: .5, lid: .05, sparkle: 1, soot: 1 };
  if (!frozen) wq.lid = blinkLid(t + 1.7, wq.lid);
  const dp = duduParts(t, Object.assign({ legs: false }, wq));
  s += `<clipPath id="camC"><rect x="766" y="548" width="196" height="208" rx="18"/></clipPath>
   <rect x="760" y="542" width="208" height="220" rx="22" fill="#6C3CE1"/>
   <g clip-path="url(#camC)"><rect x="766" y="548" width="196" height="208" fill="#2A2350"/>
   <g transform="translate(864 700) scale(.48) translate(-820 -860)">${dp.back}${dp.arms}</g></g>
   <rect x="104" y="790" width="872" height="520" rx="24" fill="#100E22" stroke="#2D2654" stroke-width="4"/>
   <text x="140" y="845" font-family="Anton" font-size="38" fill="#8f86c9" letter-spacing="2">CHAT DA LIVE</text>
   <path d="M120 866 L960 866" stroke="#2D2654" stroke-width="4"/>`;
  const msg = (y, t0, av, name, ncol, line) => {
    const u = EZ.back(prog(t, t0, .3)); if (u <= 0) return '';
    return `<g transform="translate(140 ${y}) scale(${u.toFixed(3)})" opacity="${clamp(u).toFixed(2)}">
     <rect x="-14" y="-14" width="828" height="110" rx="22" fill="#1E1A3A"/>${av}
     <text x="96" y="30" font-family="Nunito" font-weight="800" font-size="30" fill="${ncol}">${name}</text>
     <text x="96" y="76" font-family="Nunito" font-weight="800" font-size="32" fill="#fff">${line}</text></g>`;
  };
  const bot = `<rect x="6" y="2" width="62" height="54" rx="12" fill="#9AA5B1" stroke="#000" stroke-width="4"/><circle cx="25" cy="27" r="8" fill="#39C2FF"/><circle cx="50" cy="27" r="8" fill="#39C2FF"/><rect x="20" y="42" width="34" height="6" fill="#333"/>`;
  const mom = `<circle cx="37" cy="30" r="32" fill="#FF7AB6" stroke="#000" stroke-width="4"/><path d="M37 46 C10 28 20 10 37 22 C54 10 64 28 37 46 Z" fill="#fff"/>`;
  const stranger = `<circle cx="37" cy="30" r="32" fill="#555" stroke="#000" stroke-width="4"/><text x="37" y="46" font-family="Anton" font-size="40" fill="#ddd" text-anchor="middle">?</text>`;
  s += msg(895, T('tres', 2), mom, 'mamae_coruja', '#FF7AB6', 'lindo filho ❤️');
  s += msg(1015, T('tres', 3), bot, 'cripto_bot_9000', '#3DDC84', 'GANHE 1000% COM A DUDUCOIN!!!');
  if (t >= T('tres', 5)) s += `<text x="540" y="${f1(1150)}" font-family="Nunito" font-weight="800" font-size="28" fill="#8f86c9" text-anchor="middle" opacity="${prog(t, T('tres', 5), .3).toFixed(2)}">xX_Desconhecido_Xx entrou na live</text>`;
  s += msg(1185, T('estranho', 2), stranger, 'xX_Desconhecido_Xx', '#FFB020', 'o setup ficou bom. pena o streamer.');
  if (t >= T('estranho', 4)) s += hlCircle(560, 1238, 480, 80, t, T('estranho', 4), 1);
  return s + `</g>`;
}

// -------------------------------------------------------------------- celular (o clipe viraliza)
function phoneScene(t) {
  const tc = T('cedeu', 2) - .7 + ((t - T('clipe')) % 1.9);
  let s = `<rect width="1080" height="1920" fill="#120C24"/><circle cx="540" cy="820" r="950" fill="url(#purpleR)"/><rect width="1080" height="1920" fill="url(#dotP)" opacity=".3"/>`;
  // corações subindo
  seed = 21;
  for (let i = 0; i < 16; i++) {
    const ph = (t * .6 + rnd()) % 1, x = 870 + rnd() * 160 + Math.sin(t * 3 + i) * 20, y = 1300 - ph * 1000;
    s += `<path transform="translate(${f1(x)} ${f1(y)}) scale(${f1(.8 + rnd() * .8)})" d="M0 14 C-26 -4 -16 -24 0 -12 C16 -24 26 -4 0 14 Z" fill="${i % 3 ? '#FF4757' : '#FF7AB6'}" opacity="${f1(1 - ph)}"/>`;
  }
  s += `<g transform="rotate(-3 540 820)"><rect x="240" y="292" width="600" height="1050" rx="64" fill="#000" opacity=".5" transform="translate(12 18)"/>
   <rect x="240" y="292" width="600" height="1050" rx="64" fill="#0b0b10" stroke="#3a3a48" stroke-width="8"/>
   <clipPath id="phC"><rect x="262" y="314" width="556" height="1006" rx="46"/></clipPath>
   <g clip-path="url(#phC)"><rect x="262" y="314" width="556" height="1006" fill="#000"/>
   <g transform="translate(262 330) scale(${(556 / 1080).toFixed(4)})">${worldLayer(tc)}</g>
   <rect x="262" y="314" width="556" height="1006" fill="url(#phoneShade)"/>
   <text x="540" y="372" font-family="Nunito" font-weight="800" font-size="24" fill="#fff" text-anchor="middle" opacity=".9">Seguindo   |   Para você</text>
   ${[['❤️', '12,4 mil', 900], ['💬', '2.093', 1010], ['↗️', '981', 1120]].map(([ic, n, y]) => `<text x="772" y="${y}" font-size="46" text-anchor="middle">${ic}</text><text x="772" y="${y + 36}" font-family="Nunito" font-weight="800" font-size="20" fill="#fff" text-anchor="middle">${n}</text>`).join('')}
   <text x="290" y="1240" font-family="Nunito" font-weight="800" font-size="26" fill="#fff">@DuduGamer_PRO</text>
   <text x="290" y="1280" font-family="Nunito" font-weight="800" font-size="22" fill="#fff" opacity=".9">o calço de pizza cedeu 💀 #fail</text></g>
   <rect x="470" y="326" width="140" height="22" rx="11" fill="#0b0b10"/></g>`;
  // contador de views
  const u = EZ.out(prog(t, T('clipe', 1), T('clipe', 4) - T('clipe', 1)));
  const v = Math.round(lerp(3, 12483, u) + Math.max(0, t - T('clipe', 4)) * 37);
  const pop = 1 + .06 * Math.sin(t * 30) * (u < 1 ? 1 : 0);
  s += `<g transform="translate(540 236) scale(${pop.toFixed(3)})"><rect x="-250" y="-52" width="500" height="96" rx="48" fill="#000" stroke="${C.yellow}" stroke-width="6"/>
   <text y="22" font-family="Anton" font-size="62" fill="${C.yellow}" text-anchor="middle">👁 ${v.toLocaleString('pt-BR')} VIEWS</text></g>`;
  // comentários
  [['KKKKKKKKKKK', 2, 520], ['de novo kkkkk 😂', 3, 700], ['o calço de pizza 💀', 4, 880]].forEach(([txt, k, y], i) => {
    const a = EZ.back(prog(t, T('clipe', k) + .1, .3)); if (a <= 0) return;
    s += `<g transform="translate(${i % 2 ? 120 : 90} ${y}) scale(${a.toFixed(3)}) rotate(${i % 2 ? 4 : -4})"><rect x="0" y="-44" width="${txt.length * 21 + 40}" height="70" rx="35" fill="#fff" stroke="#000" stroke-width="5"/>
     <text x="20" y="4" font-family="Nunito" font-weight="800" font-size="32" fill="#111">${txt}</text></g>`;
  });
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

// -------------------------------------------------------------------- telas de votação (recap e final)
function icon(kind) {
  if (kind === 'broom') return `<path d="M0 -150 L0 40" stroke="#8B5A2B" stroke-width="16" stroke-linecap="round"/><path d="M-46 40 L46 40 L60 140 L-60 140 Z" fill="#F4D03F" stroke="#000" stroke-width="7"/>`;
  if (kind === 'scissors') return `<path d="M-10 -10 L-60 -130 M10 -10 L60 -130" stroke="#000" stroke-width="22" stroke-linecap="round"/><path d="M-10 -10 L-60 -130 M10 -10 L60 -130" stroke="#D0D7DE" stroke-width="12" stroke-linecap="round"/>
    <circle cx="-26" cy="34" r="34" fill="none" stroke="#000" stroke-width="18"/><circle cx="-26" cy="34" r="34" fill="none" stroke="${C.red}" stroke-width="10"/><circle cx="26" cy="34" r="34" fill="none" stroke="#000" stroke-width="18"/><circle cx="26" cy="34" r="34" fill="none" stroke="${C.red}" stroke-width="10"/>`;
  // microfone de stand-up
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
    s += `<g transform="translate(${x} 520) scale(${(a * pop).toFixed(3)})"><text font-family="Anton" font-size="${op.word.length > 6 ? 118 : 140}" fill="${op.col}" stroke="#000" stroke-width="16" paint-order="stroke" text-anchor="middle">${op.word}</text>
      <text y="68" font-family="Anton" font-size="44" fill="#fff" stroke="#000" stroke-width="9" paint-order="stroke" text-anchor="middle">${op.sub}</text></g>`;
    const q = { legs: false, lookX: i ? -.4 : .4, smile: .35, lid: blinkLid(t + i * 1.3, .3), brow: .3, dy: Math.sin(t * 2.4 + i) * 6, soot: 1 };
    const dp = duduParts(t, q);
    s += `<g transform="translate(${x} ${f1(1060 + (1 - u) * 600)}) scale(.62) translate(-820 -900)">${dp.back}${dp.arms}</g>`;
    const ic = EZ.back(prog(t, t0 + .5, .3));
    s += `<g transform="translate(${i ? 990 : 96} ${f1(930 + Math.sin(t * 3 + i) * 14)}) rotate(${i ? 20 : -20}) scale(${ic.toFixed(3)})">${icon(op.icon)}</g>`;
  });
  const ou = EZ.back(prog(t, t0 + .45, .3));
  s += `<g transform="translate(540 1040) scale(${ou.toFixed(3)}) rotate(${f1(Math.sin(t * 2) * 6)})"><circle r="70" fill="#000" stroke="${C.yellow}" stroke-width="9"/>
   <text y="26" font-family="Anton" font-size="74" fill="${C.yellow}" text-anchor="middle">OU</text></g>`;
  if (o.loserDim != null && t >= o.loserDim) {  // recap: escurece a opção perdedora e carimba a vencedora
    const d = prog(t, o.loserDim, .3);
    s += `<rect x="540" y="0" width="540" height="1920" fill="#000" opacity="${(d * .6).toFixed(2)}"/>`;
    const st = prog(t, o.loserDim, .18), sc = lerp(2.4, 1, EZ.out(st));
    s += `<g transform="translate(270 800) rotate(-14) scale(${sc.toFixed(3)})" opacity="${clamp(st * 2).toFixed(2)}">
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
const recapScene = t => choiceBoard(t, {
  slideT: -1, banner: 'RESULTADO DA VOTAÇÃO', loserDim: T('votaram', 1),
  left: { word: 'SETUP', sub: 'ARRUMAR O SETUP', col: C.yellow, icon: 'broom', popT: T('votaram', 1) },
  right: { word: 'CABELO', sub: 'CORTAR O CABELO', col: C.blue, icon: 'scissors', popT: -9 },
});
const finalScene = t => choiceBoard(t, {
  slideT: T('opcoes'), banner: 'COMENTE UMA PALAVRA', bubT: T('comenta', 1), arrowT: T('comenta', 2), tagT: T('ep3', 3), tag: 'EP. 3 →',
  left: { word: 'CABELO', sub: 'CORTAR O CABELO', col: C.yellow, icon: 'scissors', popT: T('opcoes', 2) },
  right: { word: 'PIADAS', sub: 'SER ENGRAÇADO', col: C.blue, icon: 'mic', popT: T('opcoes', 4) },
});

// -------------------------------------------------------------------- HUD (4 caixas)
function hud(t) {
  const box = (x, label, val) => `<rect x="${x}" y="48" width="250" height="118" rx="20" fill="#0B0A16" opacity=".85" stroke="#ffffff22" stroke-width="3"/>
   <text x="${x + 125}" y="86" font-family="Anton" font-size="24" fill="#9a93c7" text-anchor="middle" letter-spacing="2">${label}</text>${val}`;
  const lv = isLive(t), v = viewers(t), b = budget(t), fm = fame(t);
  const vp = (k) => btw(t, k, k + .5) ? 1 + .4 * (1 - EZ.out(prog(t, k, .5))) : 1;
  let s = `<g opacity=".96">`;
  s += box(16, 'STATUS', lv ? `<circle cx="52" cy="128" r="11" fill="#FF3B3B" opacity="${(.55 + .45 * Math.sin(t * 7)).toFixed(2)}"/><text x="150" y="144" font-family="Anton" font-size="44" fill="#FF3B3B" text-anchor="middle">AO VIVO</text>`
    : `<text x="141" y="144" font-family="Anton" font-size="44" fill="#777" text-anchor="middle">OFFLINE</text>`);
  s += box(278, 'ESPECTADORES', `<text x="403" y="148" font-family="Anton" font-size="${f1(54 * vp(T('tres')) * vp(T('clipe', 3)))}" fill="#3DDC84" text-anchor="middle">${v}</text>`);
  s += box(540, 'FAMA', `<rect x="562" y="114" width="140" height="22" rx="11" fill="#262338"/><rect x="562" y="114" width="${f1(140 * fm / 100 + 6)}" height="22" rx="11" fill="#3DDC84"/>
     <text x="748" y="140" font-family="Anton" font-size="${f1(38 * vp(T('clipe', 3)))}" fill="#3DDC84" text-anchor="middle">${fm}%</text>`);
  const low = b != null && b < 1;
  s += box(802, 'ORÇAMENTO', b == null ? `<text x="927" y="144" font-family="Anton" font-size="40" fill="#555" text-anchor="middle">—</text>`
    : `<text x="927" y="144" font-family="Anton" font-size="${f1(40 * vp(T('orcamento', 1)))}" fill="${low ? '#FF4757' : C.yellow}" text-anchor="middle">${brl(b)}</text>`);
  s += `</g>`;
  if (btw(t, T('orcamento'), T('faxina'))) {
    const a = EZ.back(prog(t, T('orcamento') + .1, .35)), o = 1 - prog(t, T('faxina') - .25, .25);
    s += `<g transform="translate(540 250) scale(${a.toFixed(3)}) rotate(-2)" opacity="${o.toFixed(2)}">
     <path d="M-400 -46 L400 -46 L370 0 L400 46 L-400 46 L-370 0 Z" fill="#E53935" stroke="#000" stroke-width="8" stroke-linejoin="round"/>
     <text y="20" font-family="Anton" font-size="54" fill="#fff" text-anchor="middle" letter-spacing="2">EP. 2 · OPERAÇÃO SETUP</text></g>`;
  }
  return s;
}

// -------------------------------------------------------------------- composição final
const MODES = () => [[0, 'recap'], [T('orcamento'), 'world'], [T('tres'), 'ui'], [T('cedeu'), 'world'], [T('clipe'), 'phone'], [T('viral'), 'world'], [T('opcoes'), 'choice']];
function sceneFor(mode, t) {
  if (mode === 'world') return worldLayer(t);
  if (mode === 'ui') return streamUI(t);
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
  // tremor de abertura e do carimbo (telas de votação)
  const sh = (t0, amp, d) => { const e = t - t0; return e > 0 && e < d ? amp * (1 - e / d) : 0; };
  const a = sh(0, 26, .5) + sh(T('votaram', 1), 18, .4) + sh(T('opcoes'), 12, .4);
  if (a > 0) body = `<g transform="translate(${f1(Math.sin(t * 83) * a)} ${f1(Math.cos(t * 71) * a)})">${body}</g>`;
  const fl = (t0, d) => { const e = t - t0; return e >= 0 && e < d ? 1 - e / d : 0; };
  const flash = Math.max(fl(T('votaram', 1), .25) * .5, fl(T('cedeu', 2) + .3, .2) * .5, fl(T('opcoes'), .2) * .5);
  let out = DEFS.replace('SEED', String(frame % 9)).replace('</defs>', `<linearGradient id="phoneShade" x1="0" y1="0" x2="0" y2="1"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".65"/></linearGradient></defs>`) + body;
  out += confettiAt(t, T('clipe', 3));
  out += `<rect width="1080" height="1920" fill="url(#vig)"/>`;
  if (flash > 0) out += `<rect width="1080" height="1920" fill="#fff" opacity="${flash.toFixed(2)}"/>`;
  out += `<rect width="1080" height="1920" filter="url(#grainF)" opacity=".07" style="mix-blend-mode:overlay"/>`;
  out += hud(t) + caption(t);
  document.getElementById('main').innerHTML = out;
};
window.TOTAL = TOTAL;
