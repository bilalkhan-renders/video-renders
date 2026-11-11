// watchman.js: "The Bell That Rang Itself" — a 10-second style test with an ORIGINAL
// character (a night watchman), built with the kit's engine and the guide's rules:
// painted everything, boiling ink, no text, faces act through eased keys, one read
// at a time, transitions in (fade from paper) and out (iris).
(() => {
  const GROUND = 890;
  const COAT = '#33566B', COAT_DK = '#24404F', SKIN = '#F2C49B', CAP = PAL.ochre;

  const clamp01 = v => Math.max(0, Math.min(1, v));
  const sstep = v => { v = clamp01(v); return v * v * (3 - 2 * v); };
  const lerp = (a, b, k) => a + (b - a) * k;

  // ---- face keys: brow (0 calm, 1 raised, -1 furrow), eye (0..1.2 open), mouth (0 shut..1 open), look (-1..1)
  const KEYS = [
    [0.0, { brow: 0.0, eye: 0.85, mouth: 0.12, look: 0.2 }],
    [2.4, { brow: 0.0, eye: 0.85, mouth: 0.12, look: -0.4 }],
    [3.1, { brow: 0.15, eye: 0.85, mouth: 0.05, look: 0.85 }],
    [3.55, { brow: 0.3, eye: 0.42, mouth: 0.0, look: 1.0 }],   // anticipation squint
    [4.35, { brow: 1.0, eye: 1.18, mouth: 0.55, look: 1.0 }],  // the take
    [5.0, { brow: 1.0, eye: 1.18, mouth: 1.0, look: 1.0 }],
    [7.4, { brow: 0.9, eye: 1.05, mouth: 0.85, look: 1.0 }],
    [8.0, { brow: 0.55, eye: 0.9, mouth: 0.1, look: 0.9 }],    // the gulp
    [10.0, { brow: 0.45, eye: 0.95, mouth: 0.22, look: 0.9 }]  // shaky bravery
  ];
  function faceAt(t) {
    let a = KEYS[0], b = KEYS[KEYS.length - 1];
    for (let i = 0; i < KEYS.length - 1; i++) if (t >= KEYS[i][0] && t <= KEYS[i + 1][0]) { a = KEYS[i]; b = KEYS[i + 1]; break; }
    if (t >= KEYS[KEYS.length - 1][0]) { a = b = KEYS[KEYS.length - 1]; }
    const k = a === b ? 0 : sstep((t - a[0]) / (b[0] - a[0]));
    const f = {};
    for (const p of ['brow', 'eye', 'mouth', 'look']) f[p] = lerp(a[1][p], b[1][p], k);
    // blink — never during the frozen stare (4.0–7.6)
    if (t < 4.0 || t > 7.6) { const bt = t % 2.9; if (bt < 0.1) f.eye *= 1 - 0.92 * Math.sin(bt / 0.1 * Math.PI); }
    return f;
  }

  // ---- the watchman: x = centre, gy = ground y. All painted, no plain p5 shapes.
  function watchman(x, gy, t, f, o = {}) {
    const walk = o.walk ?? 0;                       // 0..1 leg swing amount
    const bob = walk > 0 ? Math.abs(Math.sin(t * 7.2)) * 7 : Math.sin(t * 1.7) * 2.5;
    const tremble = (t > 5.6 && t < 7.6) ? Math.sin(t * 41) * 1.6 : 0;
    const y = gy - bob, X = x + tremble;
    const hipY = y - 118, shoY = y - 252, headY = y - 322;

    boilSeed('wm legs');
    for (const s of [-1, 1]) {
      const sw = walk > 0 ? Math.sin(t * 7.2 + (s > 0 ? Math.PI : 0)) * 20 * walk : s * 7;
      inkLine([[X + s * 17, hipY], [X + s * 17 + sw * 0.4, y - 58], [X + s * 17 + sw, y - 4]], 5.5, COAT_DK, 'ink', 0.4);
      paint(ellPts(X + s * 17 + sw + 6, y - 2, 17, 6, 10, 1), { wash: PAL.ink, ink: null });   // shoe
    }
    boilSeed('wm coat');
    paint([[X - 56, shoY], [X + 56, shoY], [X + 68, hipY + 16], [X - 68, hipY + 16]],
      { wash: COAT, fill: COAT_DK, fillOp: 70, bleed: .06, tex: .5, ink: PAL.ink, sw: 1.4 });
    inkLine([[X, shoY + 8], [X, hipY + 10]], 1.6, COAT_DK, 'inkfine', .3);                      // coat seam
    for (const by of [shoY + 52, shoY + 92]) paint(ellPts(X, by, 5, 5, 8), { wash: PAL.ochre, ink: null }); // buttons

    // lantern arm (his left, screen right): hangs down, raises after 7.6
    const raise = sstep((t - 7.6) / 1.1);
    const handX = X + 74 + raise * 58, handY = shoY + 96 - raise * 88 + Math.sin(t * 2.2) * 3;
    boilSeed('wm arm');
    inkLine([[X + 48, shoY + 14], [X + 66, shoY + 55], [handX, handY]], 6, COAT, 'ink', .45);
    paint(ellPts(handX, handY, 9, 9, 10, 1), { wash: SKIN, ink: PAL.ink, sw: .8 });             // hand

    // head
    boilSeed('wm head');
    paint(ellPts(X, headY, 56, 50, 26, 1.5), { wash: SKIN, fill: PAL.clayLt, fillOp: 46, bleed: .05, tex: .45, ink: PAL.ink, sw: 1.4 });
    paint(ellPts(X + 57, headY + 4, 9, 13, 10, 1), { wash: SKIN, ink: PAL.ink, sw: .9 });        // ear
    // cap: dome + brim
    boilSeed('wm cap');
    paint(ellPts(X, headY - 34, 58, 26, 22, 1.5), { wash: CAP, fill: PAL.clay, fillOp: 40, ink: PAL.ink, sw: 1.2 });
    inkLine([[X - 64, headY - 26], [X + 66, headY - 26]], 3.4, mixCol(CAP, PAL.ink, .35), 'ink', .3);

    // face — positions ride on the keys; pupils follow `look`
    const ex = 21, ey = headY + 2, lx = f.look * 5;
    boilSeed('wm face');
    for (const s of [-1, 1]) {
      const cx = X + s * ex + lx;
      paint(ellPts(cx, ey, 8.5, Math.max(1.2, 9.5 * f.eye), 12, .8), { wash: PAL.cream, ink: PAL.ink, sw: .8 });
      if (f.eye > 0.25) paint(ellPts(cx + f.look * 2.5, ey + 1, 3.6, Math.max(1, 4.2 * f.eye), 8), { wash: PAL.ink, ink: null });
      const browY = ey - 21 - f.brow * 8, tilt = f.brow < 0 ? 5 : -2 * f.brow;
      inkLine([[cx - 12, browY + (s < 0 ? tilt : -tilt) * 0.4], [cx, browY - 2], [cx + 12, browY + (s > 0 ? tilt : -tilt) * 0.4]], 2.6, PAL.ink, 'inkfine', .5);
    }
    // mouth: shut = soft line / wobble; open = dark oval
    const my = headY + 27;
    if (f.mouth < 0.3) {
      const wob = (t > 7.9) ? Math.sin(t * 13) * 1.6 : 0;
      inkLine([[X - 11 + lx, my], [X - 4 + lx, my + 2 + wob], [X + 4 + lx, my + (f.mouth > 0.15 ? -3 : 1) - wob], [X + 11 + lx, my + 1]], 2.4, PAL.ink, 'inkfine', .6);
    } else {
      paint(ellPts(X + lx, my + 4, 6 + 7 * f.mouth, 4 + 11 * f.mouth, 12, .8), { wash: '#5B2E35', ink: PAL.ink, sw: .9 });
    }
    // sweat drop (his, painted): pops at 4.9, slides, fades; a second at 6.4
    for (const [t0, sx] of [[4.9, 1], [6.4, 0.6]]) {
      const age = t - t0;
      if (age > 0 && age < 0.95) {
        const dy = age * 34, a = age < 0.75 ? 235 : 235 * (1 - (age - 0.75) / 0.2);
        boilSeed('wm sweat' + t0);
        paint([[X + 52 * sx, headY - 12 + dy], [X + 59 * sx, headY + 2 + dy], [X + 52 * sx, headY + 8 + dy], [X + 45 * sx, headY + 2 + dy]],
          { wash: PAL.sky, washOp: a, ink: PAL.ink, sw: .6 });
      }
    }
    return { handX, handY };
  }

  function lantern(x, y, t, big) {
    const fl = 1 + 0.07 * Math.sin(t * 37) + 0.05 * Math.sin(t * 23 + 1) + (t > 5.6 && t < 7.6 ? 0.06 * Math.sin(t * 53) : 0);
    glow(x, y + 16, (86 + big * 95) * fl, '#FFC766', 0.55 + big * 0.3);
    boilSeed('lantern');
    inkLine([[x - 8, y - 12], [x, y - 20], [x + 8, y - 12]], 2, PAL.ink, 'inkfine', .4);
    paint(rectPts(x - 11, y - 12, 22, 30, 2), { wash: '#3A3F4A', ink: PAL.ink, sw: 1.1 });
    paint(rectPts(x - 6.5, y - 7, 13, 19, 1), { wash: '#FFD98A', washOp: 235, ink: null });
  }

  function bellPost(t) {
    const px = 1560, topY = 330;
    boilSeed('post');
    inkLine([[px, GROUND], [px, topY]], 12, '#7A6248', 'ink', .3);
    inkLine([[px, topY], [px - 150, topY + 8]], 9, '#7A6248', 'ink', .3);
    paint(ellPts(px - 40, GROUND + 6, 210, 15, 18, 2), { wash: PAL.indigo, ink: null });
    // the bell — swings BY ITSELF from 3.2s
    const sw = t < 3.2 ? 0 : 0.5 * Math.sin((t - 3.2) * 6.4) * Math.min(1, (t - 3.2) / 0.9) * (t > 7.6 ? 0.55 : 1);
    const hx = px - 138, hy = topY + 12;
    if (Math.abs(sw) > 0.06) glow(hx, hy + 44, 62 * Math.abs(Math.sin((t - 3.2) * 6.4)), '#FFE9A8', 0.35);
    push(); translate(hx, hy); rotate(sw);
    boilSeed('bell');
    inkLine([[0, 0], [0, 14]], 2.5, PAL.ink, 'inkfine', .3);
    paint([[-7, 14], [7, 14], [12, 34], [19, 52], [-19, 52], [-12, 34]], { wash: PAL.ochre, fill: PAL.clay, fillOp: 45, ink: PAL.ink, sw: 1.2 });
    paint(ellPts(0, 58, 6, 6, 8), { wash: PAL.clayDk, ink: PAL.ink, sw: .7 });
    pop();
  }

  function yard(t) {
    boilSeed('sky');
    paint(rectPts(-500, -400, W + 1000, H + 700), { wash: PAL.night, ink: null });
    paint(ellPts(W * .72, H * .3, W * .5, H * .34, 24, 10), { fill: PAL.indigo, fillOp: 95, bleed: .3, tex: .5, ink: null });
    for (let i = 0; i < 34; i++) {
      boilSeed('star' + i);
      const x = hash(i * 3 + 1) * (W + 160) - 80, y = hash(i + 60) * H * .52;
      const tw = .5 + .5 * Math.sin(t * (1.6 + hash(i + 9) * 2) + i * 1.7);
      paint(starPts(x, y, (2.5 + 4 * hash(i + 31)) * (0.6 + 0.4 * tw), .35, 4), { wash: PAL.cream, washOp: 110 + 110 * tw, ink: null });
    }
    boilSeed('moon');
    glow(300, 168, 150, '#FFE9A8', .5);
    paint(ellPts(300, 168, 66, 66, 24, 1.5), { wash: PAL.cream, fill: PAL.ochre, fillOp: 36, ink: PAL.ink, sw: .8 });
    // far wall silhouette + gate
    boilSeed('wall');
    paint(rectPts(-80, 560, W + 160, 190, 4), { wash: '#232347', fill: PAL.night, fillOp: 120, ink: null });
    inkLine([[-80, 560], [W + 80, 560]], 2, '#171733', 'inkfine', .2);
    // ground
    boilSeed('ground');
    paint(ellPts(W / 2, H * 1.24, W * .78, H * .42, 34, 3), { wash: '#2C2A55', fill: PAL.indigo, fillOp: 80, bleed: .08, tex: .55, ink: PAL.ink, sw: 1 });
    for (let i = 0; i < 26; i++) {
      const x = hash(i + 400) * W, swy = Math.sin(t * 1.3 + i) * 3;
      boilSeed('tuft' + i);
      inkLine([[x, GROUND + 26], [x + swy, GROUND + 2]], .8, mixCol(PAL.indigo, PAL.cream, .3), 'inkfine', .4);
    }
  }

  function scene(t, lt, dur) {
    camBegin(960 + 16 * Math.sin(t * .45), 545, 1 + .011 * t);
    yard(t);
    bellPost(t);
    // walk in 0.2–2.2 (ease-out), then stand at x=660
    const wk = sstep((t - 0.2) / 2.0);
    const x = -170 + (660 + 170) * (1 - Math.pow(1 - wk, 3));
    const walking = (t > 0.2 && t < 2.25) ? 1 - Math.abs(wk - .5) * .6 : 0;
    const f = faceAt(t);
    const h = watchman(x, GROUND, t, f, { walk: walking });
    lantern(h.handX + 2, h.handY + 4, t, sstep((t - 7.6) / 1.1));
    // fade in from paper
    if (t < 0.7) { boilSeed('fade'); paint(rectPts(-500, -400, W + 1000, H + 800), { wash: PAL.paper, washOp: 255 * (1 - t / 0.7), ink: null }); }
    // iris out
    if (t > 9.15) { const k = sstep((t - 9.15) / 0.85); iris(700, 520, lerp(2800, 215, k * k)); }
  }

  shots([[0, scene]]);
})();
