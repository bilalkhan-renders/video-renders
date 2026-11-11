// doc-film.js: "What Was The World Like 5,000 Years Ago?" — the full 326 s documentary
// in 11 painted scenes, registered at the exact starts from doc-timing.json.
// Everything is painted with the kit's brushes (no flat vector fills, no in-scene text).
// Structural elements (posts, walls, masts, towers) are always SOLID painted shapes.
// Every painter is a pure function of t; scenes paint the whole frame.
(() => {
  const SKIN = '#B57A45', SKIN_DK = '#8A5A33', SKIN_LT = '#D09A63';
  const SAND = '#D9B06C', SAND_DK = '#B98A4A', WOOD = '#7A5A38', WOOD_DK = '#54381F';
  const WATER = '#4E7FA8', WATER_DK = '#33567A', FIELD = '#7FA653';
  const TIMBER = '#6E4B2C', TIMBER_F = '#7D5836';

  const frac = x => x - Math.floor(x);

  // ---------------- shared painters ----------------

  function sky(top, mid, bot) {
    boilSeed('sky base');
    paint(rectPts(-600, -400, W + 1200, H + 700), { wash: mid, ink: null });
    boilSeed('sky top');
    paint(ellPts(W / 2, -300, W * .9, 470, 24, 8), { fill: top, fillOp: 120, bleed: .35, tex: .5, ink: null });
    boilSeed('sky bot');
    paint(ellPts(W / 2, H + 280, W * .95, 480, 24, 8), { fill: bot, fillOp: 115, bleed: .35, tex: .5, ink: null });
  }

  function stars(t, n, op, seed = 0) {
    if (op <= 4) return;
    for (let i = 0; i < n; i++) {
      boilSeed('star' + seed + ' ' + i);
      const x = hash(i * 3 + 1 + seed * 40) * (W + 160) - 80, y = hash(i + 60 + seed * 7) * H * .5;
      const tw = .5 + .5 * Math.sin(t * (1.6 + hash(i + 9) * 2) + i * 1.7);
      paint(starPts(x, y, (2.5 + 4 * hash(i + 31)) * (0.6 + 0.4 * tw), .35, 4),
        { wash: PAL.cream, washOp: Math.round(op * (0.35 + 0.65 * tw)), ink: null });
    }
  }

  function sunDisc(x, y, r, glowCol = '#FFC766', a = .55) {
    glow(x, y, r * 2.7, glowCol, a);
    boilSeed('sun ' + x);
    paint(ellPts(x, y, r, r, 26, 1.5), { wash: '#FFE9A8', fill: PAL.ochre, fillOp: 30, ink: PAL.ink, sw: .7 });
  }

  function hillBand(yBase, col, amp, seed) {
    const top = [];
    for (let i = 0; i <= 12; i++)
      top.push([i / 12 * (W + 400) - 200, yBase - Math.abs(Math.sin(i * 1.25 + seed * 2.3)) * amp - hash(i * 3 + seed) * amp * .45]);
    boilSeed('hill' + seed);
    paint(through(top, 4).concat([[W + 200, H + 300], [-200, H + 300]]),
      { wash: col, fill: col, fillOp: 55, bleed: .07, tex: .5, ink: null });
  }

  function shimmer(y0, y1, t, col, n, seed) {
    for (let i = 0; i < n; i++) {
      boilSeed('shim' + seed + ' ' + i);
      const x = hash(i * 7 + seed * 13) * (W + 200) - 100 + Math.sin(t * .7 + i * 1.3) * 14;
      const y = y0 + hash(i * 3 + seed * 5) * (y1 - y0);
      const len = 26 + hash(i + seed * 7) * 62;
      inkLine([[x, y], [x + len * .5, y + 1.5], [x + len, y]], 1.6, col, 'inkfine', .4);
    }
  }

  function riverBand(y0, y1, col, seed) {
    boilSeed('river' + seed);
    paint(rectPts(-300, y0, W + 600, y1 - y0, 3), { wash: col, fill: WATER_DK, fillOp: 60, bleed: .06, tex: .5, ink: null });
    boilSeed('river patch' + seed);
    paint(ellPts(W * .3, (y0 + y1) / 2, W * .34, (y1 - y0) * .34, 22, 4), { fill: mixCol(col, PAL.sky, .4), fillOp: 42, bleed: .3, tex: .5, ink: null });
    paint(ellPts(W * .74, (y0 + y1) / 2, W * .3, (y1 - y0) * .32, 22, 4), { fill: mixCol(col, PAL.cream, .25), fillOp: 30, bleed: .3, tex: .5, ink: null });
  }

  function palm(x, gy, s, t, seed) {
    const lean = (hash(seed * 3 + 1) - .5) * s * .18, sway = Math.sin(t * .9 + seed) * s * .012;
    const topX = x + lean + sway, topY = gy - s;
    boilSeed('palm trunk' + seed);
    paint(ribbon([[x, gy], [x + lean * .4, gy - s * .55], [topX, topY]], s * .08, s * .05),
      { wash: WOOD, fill: WOOD_DK, fillOp: 70, bleed: .05, ink: PAL.ink, sw: .9 });
    for (let i = 0; i < 7; i++) {
      boilSeed('palm frond' + seed + ' ' + i);
      const a = -Math.PI * (0.06 + i * 0.145) + Math.sin(t * 1.1 + seed + i) * .03;
      const L = s * (.34 + hash(seed + i * 7) * .13);
      inkLine([[topX, topY], [topX + Math.cos(a) * L * .55, topY + Math.sin(a) * L * .4 - s * .05],
               [topX + Math.cos(a) * L, topY + Math.sin(a) * L * .55 + s * .17]],
        Math.max(1.6, s * .017), i % 2 ? '#5E8F4C' : PAL.sap, 'ink', .5);
    }
    boilSeed('palm dates' + seed);
    paint(ellPts(topX + 7, topY + s * .07, s * .045, s * .06, 10), { wash: PAL.ochre, ink: null });
    paint(ellPts(topX - 9, topY + s * .08, s * .04, s * .052, 10), { wash: PAL.clay, ink: null });
  }

  function mudHouse(x, gy, w, h, o = {}) {
    const wall = o.wall || '#C79A5E', wallDk = o.wallDk || '#A87C44', tag = o.tag || (x + '|' + gy + '|' + w);
    boilSeed('house' + tag);
    paint(rectPts(x, gy - h, w, h, 2), { wash: wall, fill: wallDk, fillOp: 55, bleed: .05, tex: .5, ink: PAL.ink, sw: 1.1 });
    if (o.thatch) {
      boilSeed('thatch' + tag);
      paint([[x - w * .07, gy - h - h * .04], [x + w * .5, gy - h - h * .46], [x + w * 1.07, gy - h - h * .04]],
        { wash: '#C9A86A', fill: '#A8884C', fillOp: 65, bleed: .05, tex: .6, ink: PAL.ink, sw: 1 });
      for (let i = 0; i < 4; i++) {
        boilSeed('thatch ln' + tag + i);
        inkLine([[x + w * (.14 + i * .2), gy - h - h * .1], [x + w * (.24 + i * .18), gy - h - h * .3]], 1.2, '#8A6D35', 'inkfine', .3);
      }
    } else {
      boilSeed('roof' + tag);
      paint(rectPts(x - w * .04, gy - h - h * .09, w * 1.08, h * .1, 2),
        { wash: '#8A6238', fill: WOOD_DK, fillOp: 55, ink: PAL.ink, sw: .9 });
    }
    boilSeed('door' + tag);
    paint(rectPts(x + w * .38, gy - h * .52, w * .2, h * .52, 1), { wash: '#4A3421', ink: PAL.ink, sw: .7 });
    if (w > 95) { boilSeed('win' + tag); paint(rectPts(x + w * .1, gy - h * .78, w * .16, h * .2, 1), { wash: '#3A2C1E', ink: null }); }
  }

  // One consistent figure style for the whole film.
  // o: robe, robeDk, skin, hair, head ('bare'|'cap'|'turban'|'cone'|'nemes'), sit, walk (0..1), phase,
  //    handF/handB absolute [x,y], basket, tag
  function figure(x, gy, s, o = {}) {
    const robe = o.robe || '#A8573C', robeDk = o.robeDk || mixCol(robe, PAL.ink, .3);
    const skin = o.skin || SKIN, hair = o.hair || '#2A2018';
    const sit = !!o.sit, ph = o.phase || 0, tag = o.tag || (x + '|' + gy + '|' + s);
    const hipY = sit ? gy - s * .14 : gy - s * .44;
    const shoY = sit ? gy - s * .50 : gy - s * .76;
    const headCY = sit ? gy - s * .63 : gy - s * .885;
    const headR = s * .105;
    const bob = sit ? 0 : Math.sin((o.t || 0) * 1.8 + ph) * s * .006;
    if (!sit) {
      for (const sd of [-1, 1]) {
        const swg = Math.sin(ph + (sd > 0 ? 0 : Math.PI)) * (o.walk || 0);
        const fx = x + sd * s * .07 + swg * s * .13, fy = gy - Math.max(0, swg) * s * .05;
        boilSeed('figleg' + tag + sd);
        inkLine([[x + sd * s * .07, hipY + s * .04], [x + sd * s * .08 + swg * s * .06, (hipY + gy) / 2 + s * .04], [fx, fy]],
          Math.max(1.6, Math.min(6.5, s * .05)), '#5A4632', 'ink', .35);
        boilSeed('figfoot' + tag + sd);
        paint(ellPts(fx + s * .02, gy - 1, s * .05, s * .018, 8), { wash: '#3A2C1E', ink: null });
      }
    } else {
      boilSeed('figsit' + tag);
      paint(ellPts(x - s * .15, gy - s * .03, s * .15, s * .05, 12), { wash: robeDk, ink: null });
      paint(ellPts(x + s * .15, gy - s * .03, s * .15, s * .05, 12), { wash: robeDk, ink: null });
    }
    boilSeed('figbody' + tag);
    paint([[x - s * .155, shoY + bob], [x + s * .155, shoY + bob], [x + s * .21, hipY + s * .1], [x - s * .21, hipY + s * .1]],
      { wash: robe, fill: robeDk, fillOp: 55, bleed: .05, tex: .45, ink: PAL.ink, sw: Math.max(.7, s * .006) });
    const hF = o.handF || [x + s * .27, hipY + s * .06], hB = o.handB || [x - s * .27, hipY + s * .06];
    for (const [sd, hp] of [[1, hF], [-1, hB]]) {
      const sx = x + sd * s * .14, sy = shoY + s * .03 + bob;
      boilSeed('figarm' + tag + sd);
      inkLine([[sx, sy], [(sx + hp[0]) / 2 + sd * s * .05, (sy + hp[1]) / 2 + s * .04], hp],
        Math.max(1.6, Math.min(7, s * .048)), robe, 'ink', .4);
      boilSeed('fighand' + tag + sd);
      paint(ellPts(hp[0], hp[1], s * .032, s * .032, 9), { wash: skin, ink: null });
    }
    boilSeed('fighead' + tag);
    paint(ellPts(x, headCY + bob, headR, headR * 1.06, 20, 1),
      { wash: skin, fill: mixCol(skin, PAL.cream, .35), fillOp: 40, ink: PAL.ink, sw: Math.max(.6, s * .005) });
    const hw = o.head || 'bare';
    if (hw === 'cap') {
      boilSeed('figcap' + tag);
      paint(ellPts(x, headCY - headR * .6 + bob, headR * 1.04, headR * .55, 16, 1), { wash: PAL.cream, ink: PAL.ink, sw: .7 });
    } else if (hw === 'turban') {
      boilSeed('figturb' + tag);
      paint(ellPts(x, headCY - headR * .55 + bob, headR * 1.12, headR * .6, 16, 1), { wash: '#EDE3CC', ink: PAL.ink, sw: .7 });
      paint(ellPts(x, headCY - headR * .98 + bob, headR * .58, headR * .38, 12), { wash: '#E4D6B8', ink: null });
    } else if (hw === 'cone') {
      boilSeed('figcone' + tag);
      paint([[x - headR * 1.5, headCY - headR * .45 + bob], [x, headCY - headR * 1.75 + bob], [x + headR * 1.5, headCY - headR * .45 + bob]],
        { wash: '#D9B96A', fill: '#C9A84C', fillOp: 60, ink: PAL.ink, sw: .7 });
    } else if (hw === 'nemes') {
      boilSeed('fignemes' + tag);
      paint([[x - headR * 1.15, headCY - headR * .8 + bob], [x + headR * 1.15, headCY - headR * .8 + bob],
             [x + headR * 1.3, headCY + headR * 1.1 + bob], [x + headR * .8, headCY + headR * .5 + bob],
             [x - headR * .8, headCY + headR * .5 + bob], [x - headR * 1.3, headCY + headR * 1.1 + bob]],
        { wash: PAL.indigo, fill: PAL.ochre, fillOp: 45, ink: PAL.ink, sw: .7 });
    } else {
      boilSeed('fighair' + tag);
      paint(ellPts(x, headCY - headR * .52 + bob, headR * 1.0, headR * .58, 16, 1), { wash: hair, ink: null });
    }
    if (headR >= 15) {
      boilSeed('figface' + tag);
      for (const sd of [-1, 1])
        paint(ellPts(x + sd * headR * .36, headCY + headR * .08 + bob, Math.max(1.3, headR * .09), Math.max(1.6, headR * .13), 8), { wash: PAL.ink, ink: null });
      inkLine([[x - headR * .22, headCY + headR * .52 + bob], [x, headCY + headR * .6 + bob], [x + headR * .22, headCY + headR * .52 + bob]],
        Math.max(1, headR * .07), PAL.ink, 'inkfine', .5);
    }
    if (o.basket) {
      boilSeed('figbasket' + tag);
      paint(ellPts(x, headCY - headR * 1.8 + bob, s * .14, s * .055, 14, 1), { wash: '#A87C44', fill: '#8A6238', fillOp: 60, ink: PAL.ink, sw: .7 });
      paint(ellPts(x, headCY - headR * 2.0 + bob, s * .1, s * .04, 12), { wash: PAL.ochre, ink: null });
    }
    return { shoY: shoY + bob, hipY, headCY: headCY + bob, headR };
  }

  function felucca(x, y, s, t, o = {}) {
    const bob = Math.sin(t * 1.3 + x * .01) * s * .012, tilt = Math.sin(t * .9 + x * .02) * .02;
    push(); translate(x, y + bob); rotate(tilt);
    boilSeed('boat hull' + Math.round(x / 40));
    paint(through([[-s * .5, -s * .06], [-s * .3, s * .05], [0, s * .09], [s * .3, s * .05], [s * .52, -s * .1], [s * .34, -s * .075], [-s * .34, -s * .085]], 4),
      { wash: WOOD, fill: WOOD_DK, fillOp: 65, bleed: .05, ink: PAL.ink, sw: 1 });
    boilSeed('boat mast' + Math.round(x / 40));
    paint(rectPts(-s * .012, -s * .78, s * .024, s * .72, 1), { wash: WOOD, fill: WOOD_DK, fillOp: 60, ink: PAL.ink, sw: .8 });
    if (o.sail !== false) {
      boilSeed('boat sail' + Math.round(x / 40));
      paint(through([[-s * .01, -s * .76], [s * .3, -s * .1], [-s * .02, -s * .1]], 5),
        { wash: PAL.cream, fill: '#E8DCC2', fillOp: 55, ink: PAL.ink, sw: 1 });
      inkLine([[-s * .01, -s * .76], [s * .3, -s * .1]], 1.4, WOOD_DK, 'inkfine', .3);
    }
    pop();
  }

  function birds(t, n, yBase, seed, speed = 26) {
    for (let i = 0; i < n; i++) {
      boilSeed('bird' + seed + ' ' + i);
      const x = ((hash(i * 17 + seed * 3) * (W + 500) + t * speed * (0.7 + hash(i + seed) * .6)) % (W + 420)) - 210;
      const y = yBase + hash(i * 5 + seed * 3) * 130 + Math.sin(t * 1.7 + i * 2.1) * 7;
      const f = Math.sin(t * 7 + i * 1.9) * 7, s = 11 + hash(i + seed) * 8;
      inkLine([[x - s, y - f * .4], [x - s * .3, y + f * .3], [x, y]], 1.7, PAL.ink, 'inkfine', .5);
      inkLine([[x, y], [x + s * .3, y + f * .3], [x + s, y - f * .4]], 1.7, PAL.ink, 'inkfine', .5);
    }
  }

  function smokeCol(x, y, t, seed, col = '#B9B2A6') {
    for (let k = 0; k < 5; k++) {
      const age = frac(t * .12 + k / 5 + seed * .37);
      boilSeed('smoke' + seed + ' ' + k);
      paint(ellPts(x + Math.sin(age * 5 + seed) * 22 + age * 34, y - age * 190, 15 + age * 52, 11 + age * 34, 14, 2),
        { wash: col, washOp: Math.round(95 * (1 - age)), ink: null });
    }
  }

  function fireAt(x, y, s, t, seed) {
    glow(x, y - s * .2, s * 2.6, '#FF9A3C', .5 + .12 * Math.sin(t * 11 + seed));
    boilSeed('logs' + seed);
    inkLine([[x - s * .5, y], [x + s * .45, y - s * .12]], Math.max(2, s * .1), '#4A3421', 'ink', .3);
    inkLine([[x + s * .5, y], [x - s * .45, y - s * .12]], Math.max(2, s * .1), WOOD_DK, 'ink', .3);
    const fl = 1 + .16 * Math.sin(t * 13 + seed * 2) + .1 * Math.sin(t * 29 + seed);
    for (const [dx, sc, col] of [[0, 1, PAL.clay], [-.18, .7, PAL.ochre], [.16, .62, '#FFC766'], [0, .38, PAL.cream]]) {
      boilSeed('flame' + seed + col);
      const hgt = s * 1.05 * sc * fl, wid = s * .3 * sc;
      paint(through([[x + dx * s - wid, y - s * .08], [x + dx * s - wid * .4, y - hgt * .6],
                     [x + dx * s + Math.sin(t * 9 + seed) * s * .05, y - hgt], [x + dx * s + wid * .4, y - hgt * .6],
                     [x + dx * s + wid, y - s * .08]], 4),
        { wash: col, washOp: 235, fill: col, fillOp: 60, ink: null });
    }
  }

  function wheel(cx, cy, r, ang, seed) {
    boilSeed('wheel' + seed);
    paint(ellPts(cx, cy, r, r, 26, 1), { wash: '#8A6238', fill: WOOD_DK, fillOp: 60, bleed: .05, ink: PAL.ink, sw: 1.1 });
    for (let i = 0; i < 6; i++) {
      const a = ang + i * Math.PI / 3;
      boilSeed('spoke' + seed + ' ' + i);
      inkLine([[cx, cy], [cx + Math.cos(a) * r * .85, cy + Math.sin(a) * r * .85]], Math.max(1.4, r * .07), WOOD_DK, 'ink', .3);
    }
    boilSeed('hub' + seed);
    paint(ellPts(cx, cy, r * .16, r * .16, 12), { wash: WOOD_DK, ink: null });
  }

  function ox(x, gy, s, col, t, seed, o = {}) {
    const flip = o.flip || 1;
    push(); translate(x, 0); scale(flip, 1); translate(-x, 0);
    // Deepened tones throughout: the old painter washed the body in the raw pale
    // `col` and drew the legs as thin ink strokes, so the animal read as a
    // floating blob. Everything structural is now a solid painted shape.
    const bodyWash = mixCol(col, '#8A6A42', .3);
    const bodyFill = mixCol(col, PAL.ink, .34);
    const dk = mixCol(col, PAL.ink, .52);
    const dkr = mixCol(col, PAL.ink, .68);
    const leg = (lx, ph, tone, fillOp) => {
      const sw = Math.sin(t * 1.4 + ph) * s * .013;
      boilSeed('ox leg' + seed + ' ' + lx);
      paint(ribbon([[x + s * lx, gy - s * .27], [x + s * lx + sw * .4, gy - s * .14], [x + s * lx + sw, gy - s * .025]], s * .058, s * .042),
        { wash: tone, fill: tone, fillOp, bleed: .04, ink: null });
      boilSeed('ox hoof' + seed + ' ' + lx);
      paint(ellPts(x + s * lx + sw, gy - s * .014, s * .034, s * .013, 9), { wash: '#2E2620', ink: null });
    };
    // ground shadow first: it is what stops the animal floating
    boilSeed('ox shadow' + seed);
    paint(ellPts(x + s * .02, gy - s * .012, s * .42, s * .05, 20, 1), { wash: '#4A3826', washOp: 78, ink: null });
    // far legs and the tail, behind the body
    leg(-.19, 2, dk, 66); leg(.17, 0, dk, 66);
    boilSeed('ox tail' + seed);
    paint(ribbon([[x - s * .3, gy - s * .45], [x - s * .355, gy - s * .3], [x - s * .345 + Math.sin(t * 2.2 + seed) * s * .02, gy - s * .15]], s * .028, s * .012),
      { wash: dk, fill: dk, fillOp: 70, ink: null });
    boilSeed('ox tuft' + seed);
    paint(ellPts(x - s * .345 + Math.sin(t * 2.2 + seed) * s * .02, gy - s * .12, s * .02, s * .042, 9), { wash: dkr, ink: null });
    // the body: a barrel with shoulder, chest and a belly line, not an ellipse
    boilSeed('ox body' + seed);
    paint(through([[x - s * .315, gy - s * .4], [x - s * .27, gy - s * .485], [x - s * .1, gy - s * .525], [x + s * .1, gy - s * .525],
                   [x + s * .24, gy - s * .47], [x + s * .315, gy - s * .39], [x + s * .3, gy - s * .27], [x + s * .21, gy - s * .195],
                   [x - s * .05, gy - s * .172], [x - s * .24, gy - s * .2], [x - s * .315, gy - s * .28], [x - s * .315, gy - s * .4]], 4),
      { wash: bodyWash, fill: bodyFill, fillOp: 68, bleed: .05, ink: PAL.ink, sw: 1 });
    boilSeed('ox belly' + seed);
    paint(ellPts(x - s * .01, gy - s * .225, s * .23, s * .07, 16), { wash: dk, washOp: 64, ink: null });
    if (o.hump !== false) {
      boilSeed('ox hump' + seed);
      paint(ellPts(x + s * .1, gy - s * .545, s * .1, s * .062, 12), { wash: bodyWash, fill: bodyFill, fillOp: 60, ink: null });
    }
    // neck: a solid tapered wedge running from the shoulder down to the head
    boilSeed('ox neck' + seed);
    paint(ribbon([[x + s * .21, gy - s * .45], [x + s * .3, gy - s * .4], [x + s * .375, gy - s * .355]], s * .135, s * .105),
      { wash: bodyWash, fill: mixCol(col, PAL.ink, .4), fillOp: 70, bleed: .04, ink: null });
    // near legs, in front of the body
    leg(.235, 1, dkr, 76); leg(-.125, 3, dkr, 76);
    // ---- the head, clearly separated at the end of the neck
    const hx = x + s * .43, hy = gy - s * .335;
    if (o.ears) {
      // the donkey: two long upright ears
      boilSeed('ox ears' + seed);
      paint(ellPts(hx - s * .032, hy - s * .155, s * .021, s * .088, 10, .5, -.22), { wash: dk, fill: dk, fillOp: 70, ink: PAL.ink, sw: .7 });
      paint(ellPts(hx + s * .042, hy - s * .148, s * .021, s * .085, 10, .5, .3), { wash: dk, fill: dk, fillOp: 70, ink: PAL.ink, sw: .7 });
    } else {
      // horns: pale tapered crescents rising from the crown, bases behind the head
      boilSeed('ox horns' + seed);
      paint(ribbon([[hx - s * .008, hy - s * .075], [hx - s * .055, hy - s * .135], [hx - s * .115, hy - s * .15]], s * .027, s * .005),
        { wash: '#EFE3C2', fill: '#EFE3C2', fillOp: 85, ink: null });
      paint(ribbon([[hx + s * .038, hy - s * .08], [hx + s * .085, hy - s * .13], [hx + s * .14, hy - s * .128]], s * .027, s * .005),
        { wash: '#EFE3C2', fill: '#EFE3C2', fillOp: 85, ink: null });
      // smaller side ears tucked under the horns
      boilSeed('ox ears' + seed);
      paint(ellPts(hx - s * .062, hy - s * .045, s * .048, s * .017, 10, .5, -.55), { wash: dk, fill: dk, fillOp: 70, ink: null });
      paint(ellPts(hx + s * .075, hy - s * .05, s * .046, s * .016, 10, .5, .5), { wash: dk, fill: dk, fillOp: 70, ink: null });
    }
    boilSeed('ox head' + seed);
    paint(through([[hx - s * .058, hy - s * .078], [hx + s * .005, hy - s * .102], [hx + s * .055, hy - s * .06], [hx + s * .088, hy + s * .012],
                   [hx + s * .068, hy + s * .07], [hx + s * .012, hy + s * .098], [hx - s * .038, hy + s * .062], [hx - s * .062, hy - s * .005],
                   [hx - s * .058, hy - s * .078]], 4),
      { wash: bodyWash, fill: bodyFill, fillOp: 70, bleed: .04, ink: PAL.ink, sw: .9 });
    boilSeed('ox muzzle' + seed);
    paint(ellPts(hx + s * .066, hy + s * .042, s * .03, s * .04, 10), { wash: dkr, washOp: 120, ink: null });
    paint(ellPts(hx + s * .08, hy + s * .032, s * .006, s * .008, 7), { wash: PAL.ink, ink: null });
    boilSeed('ox eye' + seed);
    paint(ellPts(hx + s * .014, hy - s * .026, s * .0125, s * .0155, 9), { wash: PAL.ink, ink: null });
    paint(ellPts(hx + s * .019, hy - s * .033, s * .004, s * .005, 6), { wash: PAL.cream, washOp: 200, ink: null });
    pop();
  }

  function ringLine(cx, cy, rx, ry, sw, col, seed) {
    boilSeed('ring' + seed);
    const pts = ellPts(cx, cy, rx, ry, 52, 0);
    pts.push(pts[0].slice());
    inkLine(pts, sw, col, 'ink', .35);
  }

  // A jade bi disc: a ring of overlapping painted blobs (a thick ink ring balloons at this scale).
  function jadeDisc(cx, cy, r, seed) {
    for (let i = 0; i < 16; i++) {
      const a = i / 16 * Math.PI * 2;
      boilSeed('jade' + seed + ' ' + i);
      paint(ellPts(cx + Math.cos(a) * r, cy + Math.sin(a) * r, r * .31, r * .31, 10, 1),
        { wash: '#2E7D5B', fill: '#256B4C', fillOp: 55, ink: null });
    }
    boilSeed('jade hi' + seed);
    for (let i = 0; i < 4; i++) {
      const a = -2.4 + i * .38;
      paint(ellPts(cx + Math.cos(a) * r, cy + Math.sin(a) * r, r * .12, r * .12, 8), { wash: '#7FC79B', washOp: 170, ink: null });
    }
  }

  function wheatPatch(x, y, w, h, n, seed) {
    for (let i = 0; i < n; i++) {
      boilSeed('wheat' + seed + ' ' + i);
      const sx = x + hash(i * 3 + seed) * w, sy = y + hash(i * 7 + seed * 2) * h * .5;
      const hh = h * (.5 + hash(i + seed) * .4);
      inkLine([[sx, sy + hh * .4], [sx + Math.sin(i) * 3, sy - hh * .4]], 1.8, '#D9A83C', 'inkfine', .4);
      paint(ellPts(sx + Math.sin(i) * 3, sy - hh * .45, 3.4, 7, 7), { wash: PAL.ochre, ink: null });
    }
  }

  function camDrift(lt, dur, dx, dz, cy = 540) {
    camBegin(960 + dx * ease(seg(lt, 0, dur)), cy, 1 + dz * ease(seg(lt, 0, dur)));
  }

  // ---------------- 1. HOOK: night brightening to dawn, lone farmer ----------------
  function scHook(t, lt, dur) {
    const dp = ease(seg(lt, 0, dur * .62));           // dawn progress
    camDrift(lt, dur, 26, .05);
    sky(mixCol(PAL.night, '#4A3A6B', dp), mixCol(PAL.indigo, '#B0625A', dp), mixCol('#2F3C7A', '#E8956B', dp));
    stars(t, 30, 210 * (1 - dp), 1);
    const sunY = lerp(905, 648, dp);
    glow(1330, sunY, 300 * (.3 + .7 * dp), '#FF9A5C', .18 + .45 * dp);
    if (dp > .12) sunDisc(1330, sunY, 54, '#FFC766', .3 + .35 * dp);
    hillBand(680, mixCol('#232347', '#5A3A44', dp), 62, 3);
    hillBand(782, mixCol('#171733', '#3A2A33', dp), 84, 7);
    // tiny village silhouettes on the far bank
    for (let i = 0; i < 3; i++)
      mudHouse(180 + i * 150, 806, 96, 58, { wall: mixCol('#232347', '#4A3040', dp), wallDk: mixCol('#171733', '#3A2530', dp), tag: 'hookvil' + i });
    // the wide river
    riverBand(812, 1030, mixCol('#2A3A66', '#C77B52', dp * .85), 1);
    shimmer(838, 1000, t, mixCol('#8EC3E6', '#FFD9A0', dp), 16, 1);
    // lone farmer silhouette with a hoe, working slowly on the bank (dedicated
    // silhouette painter: one dark tone, robe to the ground, hoe clear of the body)
    const fx = 1150, fgy = 808, fs = 238;
    const cyc = frac(lt / 5.4), raise = Math.pow(Math.max(0, Math.sin(cyc * Math.PI)), 1.4);
    const sil = mixCol('#12122A', '#2A2138', dp);
    boilSeed('hook farmer robe');
    paint([[fx - fs * .2, fgy], [fx - fs * .13, fgy - fs * .62], [fx - fs * .05, fgy - fs * .78],
           [fx + fs * .07, fgy - fs * .78], [fx + fs * .15, fgy - fs * .62], [fx + fs * .22, fgy]],
      { wash: sil, fill: sil, fillOp: 70, ink: null });
    boilSeed('hook farmer head');
    paint(ellPts(fx + fs * .01, fgy - fs * .86, fs * .085, fs * .095, 16, 1), { wash: sil, ink: null });
    const hy = fgy - fs * .52 - raise * fs * .12, hx = fx + fs * .24;
    boilSeed('hook farmer arms');
    inkLine([[fx + fs * .1, fgy - fs * .68], [hx, hy]], 5.5, sil, 'ink', .35);
    boilSeed('hook hoe');
    inkLine([[hx, hy], [fx + fs * .44, fgy - fs * .02 + raise * fs * .08]], 4.2, '#4A3421', 'ink', .25);
    inkLine([[fx + fs * .44, fgy - fs * .02 + raise * fs * .08], [fx + fs * .53, fgy - fs * .06 + raise * fs * .08]], 3.4, '#4A3421', 'ink', .25);
    camEnd();
    if (t < 0.8) { boilSeed('hook fade'); paint(rectPts(-60, -60, W + 120, H + 120), { wash: PAL.paper, washOp: Math.round(255 * (1 - t / 0.8)), ink: null }); }
  }

  // ---------------- 2. RIVERS: aerial view of three green valleys in golden desert ----------------
  function valley(path, bankW, riverW, t, seed, withPalms) {
    const curve = through(path, 7);
    boilSeed('valley bank' + seed);
    paint(ribbon(curve, bankW), { wash: FIELD, fill: PAL.sap, fillOp: 70, bleed: .09, tex: .55, ink: null });
    boilSeed('valley river' + seed);
    paint(ribbon(curve, riverW), { wash: WATER, fill: WATER_DK, fillOp: 55, bleed: .06, tex: .5, ink: null });
    // fields, villages, palms sampled along the curve
    for (let i = 4; i < curve.length - 4; i += 5) {
      const p = curve[i], q = curve[i + 2];
      const dx = q[0] - p[0], dy = q[1] - p[1], d = Math.hypot(dx, dy) || 1;
      const nx = -dy / d, ny = dx / d, side = hash(i + seed * 9) > .5 ? 1 : -1;
      const off = bankW * .5 + 26 + hash(i * 3 + seed) * 60;
      const px = p[0] + nx * off * side, py = p[1] + ny * off * side;
      const kind = hash(i * 7 + seed);
      if (kind < .42) {
        boilSeed('field' + seed + ' ' + i);
        paint(rectPts(px - 30, py - 19, 60, 38, 2), { wash: ['#8FAE57', '#C9A86A', '#6E9F58', '#B98A4A'][Math.floor(hash(i + seed * 3) * 4)], fillOp: 0, ink: null });
      } else if (kind < .68) {
        mudHouse(px - 20, py + 15, 40, 30, { tag: 'rv' + seed + 'a' + i });
        mudHouse(px + 16, py + 10, 32, 24, { tag: 'rv' + seed + 'b' + i });
      } else if (withPalms) {
        palm(px, py + 16, 58, t, seed * 100 + i);
      }
    }
    // glints on the water
    for (let i = 6; i < curve.length - 4; i += 9) {
      boilSeed('vglint' + seed + ' ' + i);
      const p = curve[i], q = curve[i + 2];
      inkLine([p, [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2], q], 1.6, '#BFD9EA', 'inkfine', .3);
    }
  }

  function scRivers(t, lt, dur) {
    camDrift(lt, dur, 0, .045, 500 + 40 * ease(seg(lt, 0, dur)));
    boilSeed('desert');
    paint(rectPts(-600, -400, W + 1200, H + 800), { wash: SAND, ink: null });
    boilSeed('desert patch');
    paint(ellPts(W * .25, H * .3, W * .4, H * .3, 24, 8), { fill: SAND_DK, fillOp: 55, bleed: .35, tex: .6, ink: null });
    paint(ellPts(W * .8, H * .75, W * .42, H * .32, 24, 8), { fill: '#E8C887', fillOp: 60, bleed: .35, tex: .6, ink: null });
    paint(ellPts(W / 2, -160, W * .8, 240, 24, 8), { fill: PAL.cream, fillOp: 70, bleed: .4, tex: .5, ink: null }); // distance haze
    valley([[300, 60], [385, 300], [300, 490], [425, 670], [360, 870], [435, 1090]], 175, 66, t, 1, true);          // Nile
    valley([[880, 50], [940, 320], [880, 550], [950, 770], [900, 1100]], 120, 40, t, 2, false);                    // twin river A
    valley([[1065, 50], [1010, 330], [1085, 565], [1015, 800], [1080, 1100]], 120, 40, t, 3, false);               // twin river B
    valley([[1565, 55], [1480, 320], [1605, 550], [1500, 790], [1585, 1100]], 215, 108, t, 4, true);                // Indus
    camEnd();
  }

  // ---------------- 3. EGYPT: felucca on the Nile, scribe with hieroglyphs ----------------
  function scEgypt(t, lt, dur) {
    camDrift(lt, dur, -20, .04);
    sky('#8EC3E6', '#C9DFE8', '#F2E3C2');
    sunDisc(420, 168, 58);
    // distant desert cliffs, left
    boilSeed('cliff back');
    paint([[-60, 600], [-60, 300], [240, 268], [430, 330], [520, 470], [520, 600]], { wash: '#E3C184', fill: SAND, fillOp: 60, bleed: .06, tex: .55, ink: PAL.ink, sw: .9 });
    boilSeed('cliff front');
    paint([[-60, 610], [-60, 400], [180, 372], [330, 430], [400, 545], [400, 610]], { wash: SAND, fill: SAND_DK, fillOp: 55, bleed: .06, tex: .55, ink: PAL.ink, sw: .9 });
    inkLine([[20, 452], [330, 452]], 1.6, SAND_DK, 'inkfine', .3);
    inkLine([[40, 516], [300, 516]], 1.6, SAND_DK, 'inkfine', .3);
    // far bank: green strip + palms
    boilSeed('far bank');
    paint(rectPts(-200, 522, W + 400, 44, 2), { wash: FIELD, fill: PAL.sap, fillOp: 60, ink: null });
    for (let i = 0; i < 5; i++) palm(640 + i * 290 + (i % 2) * 60, 560, 128 + (i % 3) * 22, t, 20 + i);
    // the Nile
    riverBand(566, 884, WATER, 3);
    shimmer(592, 856, t, '#CFE4F2', 22, 3);
    felucca(560 + lt * 9, 706, 345, t);
    felucca(1470 - lt * 4, 800, 175, t, { sail: false });
    // near bank foreground
    boilSeed('near bank');
    paint(rectPts(-300, 884, W + 600, 240, 3), { wash: SAND, fill: SAND_DK, fillOp: 45, bleed: .06, tex: .55, ink: null });
    wheatPatch(70, 950, 560, 120, 30, 5);
    for (let i = 0; i < 3; i++) palm(760 + i * 90, 1005, 120, t, 30 + i);
    // scribe, cross-legged on a mat, painting glyphs on papyrus
    boilSeed('scribe mat');
    paint(rectPts(1318, 1018, 330, 20, 2), { wash: PAL.clay, fill: PAL.clayDk, fillOp: 55, ink: PAL.ink, sw: .8 });
    figure(1470, 1022, 300, { robe: '#EDE3CC', robeDk: '#C9B489', skin: SKIN_DK, head: 'nemes', sit: true, tag: 'egscribe', t,
      handF: [1528, 940], handB: [1392, 972] });
    // papyrus sheet across his lap (drawn over the robe, low enough to leave him visible)
    boilSeed('papyrus');
    push(); translate(1478, 956); rotate(-.06);
    paint(rrPts(-78, -46, 156, 94, 8, 1), { wash: '#F2E3BC', fill: '#E4CF9E', fillOp: 60, ink: PAL.ink, sw: .9 });
    // pictorial glyph marks: waves, an eye, a bird, a sun disc, reeds — pictures, not letters
    boilSeed('glyph waves');
    inkLine([[-64, -22], [-46, -29], [-28, -22], [-10, -29], [6, -22]], 2, PAL.teal, 'inkfine', .5);
    inkLine([[-64, -6], [-46, -13], [-28, -6], [-10, -13], [6, -6]], 2, PAL.teal, 'inkfine', .5);
    boilSeed('glyph eye');
    paint(ellPts(42, -20, 18, 9, 14), { wash: PAL.cream, ink: PAL.ink, sw: 1 });
    paint(ellPts(42, -20, 6, 6, 10), { wash: PAL.ink, ink: null });
    boilSeed('glyph bird');
    paint(through([[18, 20], [30, 8], [44, 10], [54, 18], [40, 24], [26, 27]], 3), { wash: PAL.indigo, ink: PAL.ink, sw: .7 });
    inkLine([[50, 12], [60, 15]], 1.6, PAL.ink, 'inkfine', .3);
    boilSeed('glyph sun');
    ringLine(-40, 26, 11, 11, 3.4, PAL.ochre, 51);
    boilSeed('glyph reeds');
    inkLine([[-8, 36], [-4, 16]], 2, PAL.sap, 'inkfine', .3);
    inkLine([[4, 36], [8, 16]], 2, PAL.sap, 'inkfine', .3);
    inkLine([[16, 36], [18, 18]], 2, PAL.sap, 'inkfine', .3);
    pop();
    // his reed brush, from hand to papyrus
    boilSeed('reed brush');
    inkLine([[1528, 940], [1508, 954]], 2.4, WOOD_DK, 'inkfine', .3);
    birds(t, 3, 120, 6, 20);
    camEnd();
  }

  // ---------------- 4. URUK: the first great city ----------------
  function scUruk(t, lt, dur) {
    camDrift(lt, dur, 14, .07);
    sky('#A8CCE0', '#E8DCC0', '#F2DFAE');
    // twin river glinting behind the city
    riverBand(428, 492, '#5B8DB8', 4);
    shimmer(438, 484, t, '#D8ECF8', 10, 4);
    // palm gardens behind the wall
    for (let i = 0; i < 4; i++) palm(240 + i * 480, 486, 138, t, 40 + i);
    // city wall with crenellations and a gate
    boilSeed('uruk wall');
    paint(rectPts(-200, 478, W + 400, 84, 2), { wash: '#B98A4A', fill: '#9A6F38', fillOp: 60, bleed: .05, tex: .5, ink: PAL.ink, sw: 1 });
    for (let i = 0; i < 26; i++) {
      boilSeed('cren' + i);
      paint(rectPts(-160 + i * 84, 458, 40, 22, 1), { wash: '#B98A4A', fill: '#9A6F38', fillOp: 55, ink: null });
    }
    boilSeed('uruk gate');
    paint(rrPts(896, 486, 128, 76, 10, 1), { wash: '#4A3421', ink: PAL.ink, sw: 1 });
    // city ground the houses and tower stand on
    boilSeed('uruk ground');
    paint(rectPts(-300, 556, W + 600, 344, 3), { wash: '#D3AC72', fill: SAND_DK, fillOp: 35, bleed: .06, tex: .55, ink: null });
    // the temple tower, centre — solid stepped terraces
    const tiers = [[560, 96], [416, 86], [288, 78]];
    let zy = 806;
    tiers.forEach(([tw, th], i) => {
      boilSeed('zig tier' + i);
      paint(rectPts(1150 - tw / 2, zy - th, tw, th, 2), { wash: i % 2 ? '#C79A5E' : '#BE8A56', fill: '#A87C44', fillOp: 55, bleed: .05, tex: .5, ink: PAL.ink, sw: 1.1 });
      zy -= th;
    });
    boilSeed('zig shrine');
    paint(rectPts(1150 - 62, zy - 84, 124, 84, 2), { wash: '#D9B06C', fill: '#C79A5E', fillOp: 55, ink: PAL.ink, sw: 1.1 });
    paint(rectPts(1150 - 16, zy - 52, 32, 52, 1), { wash: '#4A3421', ink: null });
    boilSeed('zig ramp');
    paint([[1120, 806], [1180, 806], [1165, 710], [1135, 710]], { wash: '#D9B06C', fill: '#C79A5E', fillOp: 50, ink: PAL.ink, sw: .8 });
    smokeCol(1150, zy - 110, t, 4);
    // mudbrick houses, left and right of the tower
    const housesL = [[90, 812, 168, 118], [290, 800, 138, 96], [452, 818, 180, 128], [150, 906, 150, 100], [330, 918, 176, 112]];
    const housesR = [[1300, 812, 150, 104], [1480, 800, 172, 122], [1690, 818, 160, 100], [1350, 914, 168, 108], [1560, 922, 180, 118]];
    housesL.forEach(([hx, hy, hw, hh], i) => mudHouse(hx, hy, hw, hh, { tag: 'urukL' + i }));
    housesR.forEach(([hx, hy, hw, hh], i) => mudHouse(hx, hy, hw, hh, { tag: 'urukR' + i }));
    boilSeed('roof garden');
    paint(ellPts(540, 690, 70, 16, 14), { wash: PAL.sap, ink: null });
    paint(ellPts(1565, 678, 76, 17, 14), { wash: PAL.sap, ink: null });
    // street foreground
    boilSeed('uruk street');
    paint(rectPts(-300, 892, W + 600, 230, 3), { wash: '#C8A06A', fill: SAND_DK, fillOp: 45, bleed: .06, tex: .55, ink: null });
    // market stalls
    for (const [sx, seed] of [[250, 61], [760, 62], [1620, 63]]) {
      boilSeed('stall posts' + seed);
      paint(rectPts(sx, 918, 12, 96, 1), { wash: WOOD, fill: WOOD_DK, fillOp: 60, ink: PAL.ink, sw: .8 });
      paint(rectPts(sx + 168, 918, 12, 96, 1), { wash: WOOD, fill: WOOD_DK, fillOp: 60, ink: PAL.ink, sw: .8 });
      boilSeed('stall awning' + seed);
      paint([[sx - 16, 922], [sx + 196, 922], [sx + 168, 884], [sx + 12, 884]], { wash: PAL.clay, fill: PAL.clayDk, fillOp: 55, ink: PAL.ink, sw: .9 });
      paint([[sx + 48, 920], [sx + 92, 920], [sx + 84, 886], [sx + 56, 886]], { wash: PAL.cream, ink: null });
      boilSeed('stall goods' + seed);
      for (let i = 0; i < 6; i++) paint(ellPts(sx + 26 + i * 27, 1004, 11, 9, 9), { wash: i % 2 ? PAL.ochre : PAL.rose, ink: null });
      paint(rectPts(sx + 8, 1010, 176, 14, 1), { wash: WOOD, fill: WOOD_DK, fillOp: 60, ink: PAL.ink, sw: .7 });
    }
    // people in the street — small walkers drifting slowly
    const folk = [
      { b: 120, sp: 15, s: 118, robe: '#A8573C', head: 'turban' }, { b: 760, sp: -11, s: 104, robe: '#7A6A8A', head: 'bare' },
      { b: 980, sp: 13, s: 122, robe: '#4A7A8A', head: 'cap' }, { b: 1380, sp: -16, s: 100, robe: '#B98A4A', head: 'bare' },
      { b: 300, sp: 9, s: 92, robe: '#8A9A6A', head: 'cap' }
    ];
    folk.forEach((f, i) => {
      const fx = 200 + ((f.b + lt * f.sp) % 1560 + 1560) % 1560;
      figure(fx, 1018 - (i % 2) * 26, f.s, { robe: f.robe, head: f.head, t, walk: .8, phase: lt * 5.2 + i * 1.7, tag: 'urukfolk' + i });
    });
    // a donkey led through the street, in the open between the stalls
    ox(1052, 1006, 205, '#9A8A76', t, 7, { hump: false, ears: true });
    figure(1214, 1002, 118, { robe: '#C7B299', head: 'turban', t, tag: 'uruklead' });
    boilSeed('donkey rope');
    inkLine([[1152, 940], [1128, 934]], 1.8, WOOD_DK, 'inkfine', .4);
    camEnd();
  }

  // ---------------- 5. WRITING: a scribe pressing wedges into clay ----------------
  function scWriting(t, lt, dur) {
    camDrift(lt, dur, 18, .07);
    // shaded room
    boilSeed('room wall');
    paint(rectPts(-600, -400, W + 1200, H + 700), { wash: '#7A5636', ink: null });
    paint(ellPts(W * .5, H * .4, W * .7, H * .5, 24, 8), { fill: '#8A6844', fillOp: 90, bleed: .3, tex: .5, ink: null });
    boilSeed('room floor');
    paint(rectPts(-300, 788, W + 600, 340, 3), { wash: '#5F4429', fill: '#4A3421', fillOp: 60, ink: null });
    // woven wall mat
    boilSeed('wall mat');
    paint(rectPts(140, 170, 400, 300, 2), { wash: PAL.clay, fill: PAL.clayDk, fillOp: 55, ink: PAL.ink, sw: 1 });
    for (let i = 0; i < 4; i++) paint(rectPts(140, 196 + i * 68, 400, 26, 1), { wash: i % 2 ? PAL.ochre : '#EDE3CC', ink: null });
    // high window + shaft of light
    boilSeed('window');
    paint(rectPts(1552, 128, 140, 186, 2), { wash: '#FFE9A8', fill: '#FFD98A', fillOp: 70, ink: PAL.ink, sw: 1.1 });
    inkLine([[1622, 128], [1622, 314]], 3, WOOD_DK, 'inkfine', .3);
    inkLine([[1552, 221], [1692, 221]], 3, WOOD_DK, 'inkfine', .3);
    glow(1622, 221, 240, '#FFD98A', .45);
    boilSeed('light shaft');
    paint([[1552, 314], [1692, 314], [1340, 830], [1060, 830]], { wash: PAL.cream, washOp: 38, ink: null });
    // storage jars and grain baskets behind
    for (const [jx, js, seed] of [[1470, 1, 71], [1648, .78, 72]]) {
      boilSeed('jar' + seed);
      paint(ellPts(jx, 742, 74 * js, 98 * js, 20, 1.5), { wash: '#B0763F', fill: '#8A5A2C', fillOp: 60, bleed: .05, ink: PAL.ink, sw: 1 });
      paint(rectPts(jx - 24 * js, 742 - 128 * js, 48 * js, 34 * js, 1), { wash: '#B0763F', fill: '#8A5A2C', fillOp: 55, ink: PAL.ink, sw: .9 });
    }
    boilSeed('grain basket');
    paint([[128, 852], [268, 852], [244, 762], [152, 762]], { wash: '#A87C44', fill: '#8A6238', fillOp: 60, ink: PAL.ink, sw: 1 });
    wheatPatch(150, 742, 100, 60, 10, 7);
    boilSeed('tablet stack');
    for (let i = 0; i < 3; i++) paint(rectPts(320, 838 - i * 17, 92, 15, 1), { wash: '#C9A06A', fill: '#A87C44', fillOp: 55, ink: PAL.ink, sw: .7 });
    // low table with the wet clay tablet
    boilSeed('table');
    paint(rectPts(706, 664, 660, 34, 2), { wash: WOOD, fill: WOOD_DK, fillOp: 65, ink: PAL.ink, sw: 1 });
    paint(rectPts(734, 698, 26, 92, 1), { wash: WOOD_DK, ink: null });
    paint(rectPts(1312, 698, 26, 92, 1), { wash: WOOD_DK, ink: null });
    boilSeed('tablet');
    paint([[860, 604], [1268, 604], [1298, 664], [830, 664]], { wash: '#C9A06A', fill: '#A87C44', fillOp: 60, bleed: .04, ink: PAL.ink, sw: 1.1 });
    paint([[888, 614], [1240, 614], [1260, 654], [868, 654]], { wash: '#D9B57E', ink: null });
    // wedge marks appear one by one as he works (deterministic from lt)
    const totalW = 32, done = Math.floor(seg(lt, 1.5, dur - 2) * totalW);
    for (let i = 0; i < done; i++) {
      const cx = 910 + (i % 8) * 40, cy = 619 + Math.floor(i / 8) * 11;
      boilSeed('wedge' + i);
      paint([[cx, cy], [cx + 11, cy + 2], [cx + 2, cy + 8]], { wash: '#6E4B2C', ink: null });
    }
    // the scribe — big, seated, his hand moving to the next wedge
    const ci = Math.min(done, totalW - 1);
    const wx = 914 + (ci % 8) * 40, wy = 605 + Math.floor(ci / 8) * 11;
    const cyc = frac(lt / 1.15), dip = Math.sin(Math.min(1, cyc * 1.6) * Math.PI) * 12;
    figure(585, 952, 470, { robe: '#E4D6B8', robeDk: '#C4AC7E', skin: SKIN_DK, sit: true, tag: 'wrscribe', t,
      handF: [wx + 14, wy - 42 + dip], handB: [468, 806] });
    boilSeed('reed stylus');
    inkLine([[wx + 14, wy - 42 + dip], [wx + 2, wy + 2 + dip * .4]], 3.2, WOOD_DK, 'inkfine', .3);
    // dust motes drifting in the light shaft
    for (let i = 0; i < 10; i++) {
      boilSeed('mote' + i);
      const mx = 1130 + hash(i * 7) * 420 + Math.sin(t * .4 + i * 2) * 16;
      const my = 340 + frac(hash(i * 3) + t * .014) * 420;
      paint(ellPts(mx, my, 2.6, 2.6, 7), { wash: PAL.cream, washOp: 150, ink: null });
    }
    camEnd();
  }

  // ---------------- 6. WHEEL & BRONZE: potter, cart, and the forge ----------------
  function scWheel(t, lt, dur) {
    camDrift(lt, dur, -14, .05);
    sky('#B7D3DE', '#EFE3C0', '#F5E3B0');
    birds(t, 3, 120, 33, 16);
    boilSeed('wb wall');
    paint(rectPts(-300, 556, W + 600, 84, 2), { wash: '#B98A4A', fill: '#9A6F38', fillOp: 55, ink: PAL.ink, sw: .9 });
    mudHouse(120, 560, 210, 130, { tag: 'wbh1' });
    mudHouse(1560, 560, 230, 142, { tag: 'wbh2' });
    palm(1860, 640, 170, t, 80);
    boilSeed('wb yard');
    paint(rectPts(-300, 640, W + 600, 500, 3), { wash: '#C8A06A', fill: SAND_DK, fillOp: 45, bleed: .06, tex: .55, ink: null });
    // — the potter at his wheel (left): figure first, then wheel and pot in front of his lap
    boilSeed('potter stand');
    paint(rectPts(388, 856, 22, 76, 1), { wash: WOOD_DK, ink: null });
    figure(400, 936, 308, { robe: '#C7B299', robeDk: '#A08B6C', skin: SKIN_DK, sit: true, tag: 'wbpotter', t,
      handF: [446, 852], handB: [354, 852] });
    const potA = t * 2.6;
    boilSeed('potter wheel');
    paint(ellPts(400, 934, 106, 24, 22, 1), { wash: '#8A6238', fill: WOOD_DK, fillOp: 60, ink: PAL.ink, sw: 1 });
    for (let i = 0; i < 3; i++) {
      boilSeed('pot mark' + i);
      paint(ellPts(400 + Math.cos(potA + i * 2.1) * 78, 934 + Math.sin(potA + i * 2.1) * 15, 6, 3.4, 8), { wash: WOOD_DK, ink: null });
    }
    boilSeed('the pot');
    paint(through([[366, 922], [356, 872], [372, 838], [392, 824], [408, 824], [428, 838], [444, 872], [434, 922]], 4),
      { wash: '#B0763F', fill: '#8A5A2C', fillOp: 60, bleed: .05, ink: PAL.ink, sw: 1 });
    // — ox cart (centre), wheels just beginning to turn
    ox(838, 916, 300, '#D8CBB2', t, 8, { flip: -1 });
    boilSeed('cart shafts');
    inkLine([[930, 850], [1032, 820]], 5, WOOD, 'ink', .3);
    inkLine([[934, 878], [1036, 848]], 5, WOOD, 'ink', .3);
    boilSeed('cart bed');
    paint(rectPts(1026, 756, 316, 58, 2), { wash: WOOD, fill: WOOD_DK, fillOp: 65, bleed: .05, ink: PAL.ink, sw: 1 });
    paint(ellPts(1108, 742, 62, 30, 14), { wash: '#C9A86A', fill: '#A8884C', fillOp: 60, ink: null });
    paint(ellPts(1226, 736, 70, 34, 14), { wash: '#B98A4A', fill: '#96703F', fillOp: 60, ink: null });
    figure(1306, 756, 128, { robe: '#4A7A8A', head: 'cap', sit: true, tag: 'wbcart', t });
    wheel(1108, 912, 92, t * .25, 1);
    wheel(1276, 912, 92, t * .25, 2);
    // — the forge (right): smith pouring glowing bronze
    boilSeed('furnace');
    paint(through([[1552, 912], [1548, 806], [1584, 736], [1642, 712], [1700, 736], [1736, 806], [1732, 912]], 4),
      { wash: '#8A7A68', fill: '#6E5F4C', fillOp: 60, bleed: .05, tex: .55, ink: PAL.ink, sw: 1.1 });
    boilSeed('furnace mouth');
    paint(ellPts(1642, 848, 46, 56, 16), { wash: '#2A2018', ink: PAL.ink, sw: .9 });
    glow(1642, 852, 120, '#FF8A3C', .75 + .15 * Math.sin(t * 12));
    boilSeed('furnace chimney');
    paint(rectPts(1620, 640, 44, 84, 2), { wash: '#8A7A68', fill: '#6E5F4C', fillOp: 60, ink: PAL.ink, sw: .9 });
    smokeCol(1642, 620, t, 5);
    // the pour: crucible, stream of metal, mould
    glow(1688, 918, 95, '#FF8A3C', .7 + .18 * Math.sin(t * 15));
    boilSeed('bronze stream');
    paint(ribbon([[1656, 806], [1672, 862], [1682, 914]], 8, 3.5), { wash: '#FF9A3C', washOp: 240, ink: null });
    boilSeed('mould');
    paint(rectPts(1650, 916, 76, 28, 1), { wash: '#4A3A2A', fill: '#33261A', fillOp: 60, ink: PAL.ink, sw: .9 });
    inkLine([[1654, 918], [1722, 918]], 3, '#FFC766', 'inkfine', .3);
    for (let i = 0; i < 8; i++) {
      const age = frac(t * .8 + hash(i * 3 + 2));
      boilSeed('spark' + i);
      paint(starPts(1688 + (hash(i * 7) - .5) * 76 * (age + .2), 916 - age * 128, 5.5 * (1 - age) + 1, .4, 4),
        { wash: '#FFC766', washOp: Math.round(210 * (1 - age)), ink: null });
    }
    // smith leaning over the pour, crucible in both hands
    figure(1520, 946, 296, { robe: '#8A5A3A', robeDk: '#6E452A', skin: SKIN_DK, tag: 'wbsmith', t,
      handF: [1632, 788], handB: [1604, 800] });
    boilSeed('crucible');
    push(); translate(1644, 796); rotate(.5);
    paint(through([[-24, -8], [-16, 16], [0, 24], [16, 16], [24, -8], [10, -2], [-10, -2]], 3),
      { wash: '#5A4632', fill: '#3A2C1E', fillOp: 65, ink: PAL.ink, sw: .9 });
    pop();
    // helper with a basket of ore
    figure(1330, 962, 218, { robe: '#7A6A8A', head: 'cap', tag: 'wbhelp', t, basket: true });
    camEnd();
  }

  // ---------------- 7. INDUS: farming town, bullock cart, the seal merchant ----------------
  function scIndus(t, lt, dur) {
    camDrift(lt, dur, 20, .045);
    sky('#BCD6DE', '#F2E7C4', '#F7EBC8');
    sunDisc(252, 152, 48, '#FFC766', .4);
    boilSeed('indus far bank');
    paint(rectPts(-200, 282, W + 400, 26, 2), { wash: FIELD, fill: PAL.sap, fillOp: 55, ink: null });
    riverBand(308, 474, '#5B8DB8', 7);
    shimmer(336, 448, t, '#D8ECF8', 18, 7);
    felucca(500 + lt * 3, 398, 155, t, { sail: false });
    felucca(1360 - lt * 2, 436, 125, t, { sail: false });
    // ground the town stands on
    boilSeed('indus town ground');
    paint(rectPts(-300, 596, W + 600, 210, 3), { wash: '#DCC08A', fill: SAND_DK, fillOp: 30, bleed: .06, tex: .55, ink: null });
    // farming town of mudbrick houses
    const town = [[170, 648, 150, 102], [348, 632, 128, 88], [500, 654, 168, 112], [694, 638, 138, 94], [180, 736, 132, 90], [336, 748, 158, 100], [522, 730, 142, 92]];
    town.forEach(([hx, hy, hw, hh], i) => mudHouse(hx, hy, hw, hh, { tag: 'indus' + i }));
    palm(880, 700, 150, t, 90);
    palm(120, 720, 128, t, 91);
    // fields foreground: wheat left, cotton right, dirt path between
    boilSeed('indus dirt');
    paint(rectPts(-300, 792, W + 600, 330, 3), { wash: '#C8A06A', fill: SAND_DK, fillOp: 40, bleed: .06, tex: .55, ink: null });
    boilSeed('wheat field bg');
    paint(rectPts(56, 824, 700, 226, 2), { wash: '#D9A83C', fill: '#B98A2E', fillOp: 45, ink: null });
    wheatPatch(80, 880, 640, 130, 46, 11);
    boilSeed('cotton field bg');
    paint(rectPts(1160, 824, 712, 226, 2), { wash: PAL.sap, fill: '#587C40', fillOp: 50, ink: null });
    for (let i = 0; i < 42; i++) {
      boilSeed('cotton' + i);
      const cx = 1190 + hash(i * 3 + 4) * 640, cy = 870 + hash(i * 7 + 2) * 150;
      inkLine([[cx, cy + 12], [cx, cy - 4]], 1.6, '#4A6B35', 'inkfine', .3);
      paint(ellPts(cx, cy - 8, 5.4, 4.6, 8), { wash: PAL.cream, ink: null });
    }
    // bullock cart crossing the middle
    ox(806, 962, 238, '#EDE6D4', t, 11, { flip: -1 });
    ox(968, 962, 238, '#E4D9C2', t, 12, { flip: -1 });
    boilSeed('indus yoke');
    inkLine([[896, 838], [1056, 838]], 6, WOOD, 'ink', .3);
    inkLine([[1000, 842], [1172, 818]], 5, WOOD, 'ink', .3);
    boilSeed('indus cart bed');
    paint(rectPts(1160, 800, 268, 52, 2), { wash: WOOD, fill: WOOD_DK, fillOp: 65, ink: PAL.ink, sw: 1 });
    paint(ellPts(1246, 786, 58, 28, 14), { wash: '#EDE6D4', fill: '#D8CBB2', fillOp: 60, ink: null });
    paint(ellPts(1352, 782, 62, 30, 14), { wash: '#C9A86A', fill: '#A8884C', fillOp: 60, ink: null });
    figure(1216, 800, 118, { robe: '#3A9C98', head: 'turban', sit: true, tag: 'indusdrv', t });
    wheel(1218, 940, 76, t * .3, 5);
    wheel(1366, 940, 76, t * .3, 6);
    // merchant stamping seals, right foreground
    boilSeed('merchant table');
    paint(rectPts(1560, 924, 220, 20, 1), { wash: WOOD, fill: WOOD_DK, fillOp: 65, ink: PAL.ink, sw: .8 });
    paint(rectPts(1580, 944, 18, 62, 1), { wash: WOOD_DK, ink: null });
    paint(rectPts(1742, 944, 18, 62, 1), { wash: WOOD_DK, ink: null });
    for (let i = 0; i < 3; i++) {
      boilSeed('clay token' + i);
      paint(rectPts(1606 + i * 52, 902, 34, 22, 2), { wash: '#C9A06A', fill: '#A87C44', fillOp: 60, ink: PAL.ink, sw: .7 });
    }
    // the great seal stone beside the tokens: carved square, abstract beast marks
    boilSeed('the seal');
    paint(rectPts(1692, 846, 52, 52, 2), { wash: '#8A7A5A', fill: '#6E5F43', fillOp: 65, ink: PAL.ink, sw: 1 });
    inkLine([[1704, 884], [1704, 862], [1726, 862]], 2, '#3A3226', 'inkfine', .4);
    inkLine([[1732, 884], [1732, 866]], 2, '#3A3226', 'inkfine', .4);
    paint(ellPts(1718, 856, 4, 4, 8), { wash: '#3A3226', ink: null });
    const press = Math.pow(Math.max(0, Math.sin(frac(lt / 2.6) * Math.PI)), 2);
    figure(1568, 1012, 228, { robe: '#C46A4A', robeDk: '#9E5236', skin: SKIN_DK, head: 'cap', sit: true, tag: 'indusmerch', t,
      handF: [1624, 886 + press * 14], handB: [1476, 946] });
    birds(t, 4, 110, 12, 22);
    camEnd();
  }

  // ---------------- 8. STONEHENGE: ditch, bank and timber posts — no stones yet ----------------
  function scStone(t, lt, dur) {
    camDrift(lt, dur, -16, .05, 520);
    sky('#9FB2C8', '#E8D9B0', '#F7DFA6');
    // chalk plain
    boilSeed('plain');
    paint(rectPts(-600, 548, W + 1200, 620, 3), { wash: '#86A860', ink: null });
    paint(ellPts(W * .3, 800, W * .4, 190, 24, 6), { fill: '#9DB06B', fillOp: 70, bleed: .3, tex: .55, ink: null });
    paint(ellPts(W * .76, 700, W * .36, 160, 24, 6), { fill: '#79994F', fillOp: 60, bleed: .3, tex: .55, ink: null });
    for (let i = 0; i < 26; i++) {
      boilSeed('chalk' + i);
      paint(ellPts(hash(i * 7 + 8) * W, 620 + hash(i * 3 + 5) * 400, 4 + hash(i) * 6, 2.4, 7), { wash: PAL.cream, washOp: 130, ink: null });
    }
    sunDisc(300, 466, 50, '#FFC766', .6);
    // bank and ditch rings (ellipses — a circle lying on the plain)
    const CX = 980, CY = 700;
    ringLine(CX, CY, 356, 106, 13, '#9DB06B', 21);
    ringLine(CX, CY, 310, 92, 15, mixCol('#86A860', '#4A5A33', .38), 22);
    boilSeed('circle floor');
    paint(ellPts(CX, CY, 272, 78, 36, 2), { wash: '#93B26A', fill: '#86A860', fillOp: 60, ink: null });
    // tall timber posts in a ring — SOLID painted shapes, back ones first
    const posts = [];
    for (let i = 0; i < 10; i++) {
      const a = i / 10 * Math.PI * 2 + .3;
      posts.push({ px: CX + Math.cos(a) * 242, py: CY + Math.sin(a) * 70, sn: Math.sin(a), i });
    }
    posts.sort((p, q) => p.py - q.py);
    for (const p of posts) {
      const hgt = 216 - (p.sn + 1) * 20 + hash(p.i * 3) * 22;
      boilSeed('post' + p.i);
      paint([[p.px - 15, p.py], [p.px - 10, p.py - hgt], [p.px + 10, p.py - hgt], [p.px + 15, p.py]],
        { wash: TIMBER, fill: TIMBER_F, fillOp: 65, bleed: .04, tex: .5, ink: PAL.ink, sw: 1.1 });
      boilSeed('post grain' + p.i);
      inkLine([[p.px - 3, p.py - 14], [p.px - 2, p.py - hgt + 16]], 1.3, WOOD_DK, 'inkfine', .3);
    }
    // front arc of the ditch redrawn over the post bases, so they stand IN the circle
    boilSeed('ditch front');
    const front = [];
    for (let i = 0; i <= 26; i++) { const a = i / 26 * Math.PI; front.push([CX + Math.cos(a) * 310, CY + Math.sin(a) * 92]); }
    inkLine(front, 13, mixCol('#86A860', '#4A5A33', .38), 'ink', .35);
    // farmers: one digging, one with a stone axe, one carrying
    const dig = Math.pow(Math.max(0, Math.sin(frac(lt / 3.8) * Math.PI)), 1.3);
    const dg = figure(560, 838, 138, { robe: '#8A6A4A', skin: SKIN_LT, tag: 'stdig', t,
      handF: [560 + 52, 838 - 62 - dig * 26], handB: [560 + 38, 838 - 54 - dig * 20] });
    boilSeed('dig tool');
    inkLine([[612, 776 - dig * 26], [648, 838 - dig * 44]], 3.6, WOOD_DK, 'ink', .3);
    figure(1368, 800, 142, { robe: '#6E7A4A', skin: SKIN_LT, tag: 'staxe', t, handF: [1436, 736], handB: [1312, 762] });
    boilSeed('stone axe');
    inkLine([[1436, 736], [1452, 684]], 3.4, WOOD_DK, 'ink', .3);
    paint([[1440, 690], [1466, 678], [1470, 696], [1448, 704]], { wash: '#9A958A', fill: '#7A756A', fillOp: 60, ink: PAL.ink, sw: .7 });
    figure(1092, 884, 128, { robe: '#A8573C', skin: SKIN_LT, tag: 'stcarry', t, basket: true, handF: [1130, 770], handB: [1052, 800] });
    // sheep grazing, right
    for (let i = 0; i < 4; i++) {
      const sx = 1500 + i * 92 + (i % 2) * 30, sy = 906 + (i % 3) * 34, gr = Math.sin(t * .8 + i * 1.9) > .2;
      boilSeed('sheep' + i);
      paint(ellPts(sx, sy - 26, 37, 24, 14, 1.5), { wash: '#EFE8D8', fill: '#D8CFB8', fillOp: 55, ink: PAL.ink, sw: .8 });
      paint(ellPts(sx - 8, sy - 44, 20, 12, 10), { wash: '#F4EEDF', ink: null });
      paint(ellPts(sx + 12, sy - 42, 18, 11, 10), { wash: '#F4EEDF', ink: null });
      paint(ellPts(sx + 34, sy - 22 + (gr ? 10 : 0), 11, 9, 10), { wash: '#6E5F4C', ink: PAL.ink, sw: .6 });
      inkLine([[sx - 18, sy - 6], [sx - 18, sy + 12]], 2.4, '#6E5F4C', 'ink', .3);
      inkLine([[sx + 16, sy - 6], [sx + 16, sy + 12]], 2.4, '#6E5F4C', 'ink', .3);
    }
    // dawn mist drifting low
    for (let i = 0; i < 5; i++) {
      boilSeed('mist' + i);
      const mx = ((hash(i * 11 + 3) * (W + 700) + t * 7 * (1 + i * .2)) % (W + 700)) - 350;
      paint(ellPts(mx, 612 + i * 42, 300 + hash(i * 5) * 220, 24 + hash(i) * 16, 18, 3), { wash: PAL.cream, washOp: 44, ink: null });
    }
    birds(t, 2, 180, 15, 14);
    camEnd();
  }

  // ---------------- 9. CHINA: rice paddies, a buffalo, and jade ----------------
  function scChina(t, lt, dur) {
    camDrift(lt, dur, 16, .05);
    sky('#B9D2D9', '#E9EEDC', '#F2EBCB');
    hillBand(430, '#8AA88A', 54, 11);
    hillBand(492, '#77996F', 40, 12);
    // village with thatched roofs behind the paddies
    mudHouse(240, 512, 168, 104, { thatch: true, tag: 'chh1' });
    mudHouse(470, 500, 148, 94, { thatch: true, tag: 'chh2' });
    mudHouse(1290, 506, 176, 100, { thatch: true, tag: 'chh3' });
    mudHouse(1520, 514, 150, 92, { thatch: true, tag: 'chh4' });
    // stepped rice paddies
    for (let i = 0; i < 5; i++) {
      const y = 528 + i * 104, xoff = i * 60 - 60;
      boilSeed('paddy' + i);
      paint(rectPts(xoff, y, W - xoff + 160, 76, 2), { wash: '#A8C8D8', fill: '#8FB8CC', fillOp: 60, bleed: .05, tex: .45, ink: null });
      shimmer(y + 10, y + 62, t, '#EAF4F8', 6, 30 + i);
      boilSeed('bund' + i);
      paint(rectPts(xoff, y + 76, W - xoff + 160, 15, 1), { wash: '#6E9F58', fill: '#587C40', fillOp: 55, ink: PAL.ink, sw: .6 });
      for (let j = 0; j < 7; j++) {
        boilSeed('rice' + i + ' ' + j);
        const rx = xoff + 120 + hash(j * 7 + i * 13) * (W - 300), ry = y + 30 + hash(j * 3 + i) * 34;
        inkLine([[rx, ry + 12], [rx - 4, ry - 6]], 1.5, '#5E8F4C', 'inkfine', .4);
        inkLine([[rx, ry + 12], [rx + 4, ry - 7]], 1.5, '#6E9F58', 'inkfine', .4);
      }
    }
    // farmer and water buffalo standing in a paddy
    boilSeed('buffalo');
    paint(ellPts(714, 742, 106, 58, 22, 1.5), { wash: '#5A5148', fill: '#463F37', fillOp: 55, bleed: .05, ink: PAL.ink, sw: 1.1 });
    paint(ellPts(590, 766, 36, 27, 14, 1), { wash: '#5A5148', fill: '#463F37', fillOp: 50, ink: PAL.ink, sw: .9 });
    boilSeed('buffalo horns');
    inkLine([[574, 748], [548, 724], [540, 700]], 4.6, '#E8DCC2', 'ink', .5);
    inkLine([[600, 742], [592, 712], [600, 692]], 4.6, '#E8DCC2', 'ink', .5);
    for (const lx of [640, 690, 756, 796]) {
      boilSeed('buffalo leg' + lx);
      inkLine([[lx, 792], [lx, 844]], 6.5, '#33291F', 'ink', .3);
    }
    boilSeed('buffalo muzzle');
    paint(ellPts(562, 780, 17, 12, 10), { wash: '#6E6156', ink: PAL.ink, sw: .6 });
    boilSeed('buffalo tail');
    inkLine([[818, 716], [838, 776 + Math.sin(t * 2.4) * 7]], 3, '#463F37', 'ink', .4);
    figure(884, 838, 172, { robe: '#8A9A6A', robeDk: '#6B7A4E', skin: SKIN_DK, head: 'cone', tag: 'chfarmer', t, handF: [820, 762], handB: [928, 780] });
    boilSeed('farmer stick');
    inkLine([[820, 762], [788, 836]], 3, WOOD_DK, 'ink', .3);
    // craftsman holding a jade disc up to the light
    boilSeed('jade bench');
    paint(rectPts(1396, 902, 336, 24, 1), { wash: WOOD, fill: WOOD_DK, fillOp: 65, ink: PAL.ink, sw: .8 });
    paint(rectPts(1420, 926, 20, 84, 1), { wash: WOOD_DK, ink: null });
    paint(rectPts(1688, 926, 20, 84, 1), { wash: WOOD_DK, ink: null });
    boilSeed('jade flat');
    paint(ellPts(1470, 894, 34, 10, 16), { wash: '#2E7D5B', fill: '#256B4C', fillOp: 60, ink: PAL.ink, sw: .8 });
    paint(rectPts(1584, 872, 17, 30, 3), { wash: '#3FA06B', fill: '#2E7D5B', fillOp: 60, ink: PAL.ink, sw: .8 });
    figure(1564, 1014, 302, { robe: '#7A6A8A', robeDk: '#5D4F6E', skin: SKIN_DK, tag: 'chcraft', t,
      handF: [1506, 706], handB: [1652, 872] });
    glow(1506, 646, 130, '#7FC79B', .32);
    jadeDisc(1506, 646, 46, 41);
    // mist on the far water
    for (let i = 0; i < 3; i++) {
      boilSeed('ch mist' + i);
      paint(ellPts(300 + i * 620 + Math.sin(t * .3 + i) * 22, 520 + i * 30, 300, 20, 16, 3), { wash: PAL.cream, washOp: 38, ink: null });
    }
    camEnd();
  }

  // ---------------- 10. CARAL: stepped pyramids in a desert valley ----------------
  function steppedPyramid(cx, baseY, w, tiersN, th, seed) {
    let y = baseY, tw = w;
    for (let i = 0; i < tiersN; i++) {
      boilSeed('pyr' + seed + ' ' + i);
      paint(rectPts(cx - tw / 2, y - th, tw, th, 2), { wash: i % 2 ? '#B08A5A' : '#A87C48', fill: '#96703F', fillOp: 60, bleed: .05, tex: .6, ink: PAL.ink, sw: 1 });
      for (let j = 0; j < 5; j++) {
        boilSeed('pyr stone' + seed + ' ' + i + ' ' + j);
        inkLine([[cx - tw / 2 + 22 + hash(j * 7 + i + seed) * (tw - 60), y - th + 10 + hash(j * 3 + i) * (th - 18)],
                 [cx - tw / 2 + 44 + hash(j * 7 + i + seed) * (tw - 60), y - th + 10 + hash(j * 3 + i) * (th - 18)]], 1.4, '#8A6238', 'inkfine', .3);
      }
      y -= th; tw *= .78;
    }
    boilSeed('pyr ramp' + seed);
    paint([[cx - 46, baseY], [cx + 46, baseY], [cx + 14, y + th], [cx - 14, y + th]], { wash: '#D9B06C', fill: '#C79A5E', fillOp: 55, ink: PAL.ink, sw: .8 });
    return y;
  }

  function scCaral(t, lt, dur) {
    camDrift(lt, dur, -18, .05);
    sky('#A9CBDE', '#EFE6C2', '#F7E3AC');
    sunDisc(1652, 152, 56, '#FFC766', .6);
    boilSeed('pacific haze');
    paint(ellPts(120, 430, 420, 130, 22, 6), { wash: '#EAF0EE', washOp: 66, ink: null });
    hillBand(560, '#C49A5A', 92, 21);
    hillBand(648, '#B08247', 70, 22);
    // green ribbon of valley floor with its river
    boilSeed('caral floor');
    paint(rectPts(-300, 648, W + 600, 480, 3), { wash: '#CFA960', fill: SAND_DK, fillOp: 40, bleed: .06, tex: .55, ink: null });
    const riverPath = through([[-60, 792], [400, 748], [900, 788], [1400, 742], [1980, 792]], 6);
    boilSeed('caral bank');
    paint(ribbon(riverPath, 118), { wash: FIELD, fill: PAL.sap, fillOp: 65, bleed: .08, tex: .55, ink: null });
    boilSeed('caral river');
    paint(ribbon(riverPath, 44), { wash: '#5B8DB8', fill: WATER_DK, fillOp: 50, ink: null });
    // the pyramids
    steppedPyramid(606, 806, 436, 4, 56, 1);
    steppedPyramid(1340, 762, 322, 3, 48, 2);
    // builders carrying baskets up the great ramp
    for (let k = 0; k < 3; k++) {
      const prog = frac(lt * .02 + k / 3);
      const px = 606 + (prog - .5) * 14, py = lerp(800, 606, prog);
      figure(px, py, 62, { robe: [PAL.clay, PAL.ochre, PAL.rose][k], skin: SKIN_DK, tag: 'caralbuild' + k, t, basket: true, walk: .7, phase: lt * 6 + k * 2 });
    }
    // sunken circular plaza, foreground
    ringLine(980, 992, 336, 54, 20, '#B08247', 31);
    ringLine(980, 992, 252, 40, 14, '#C49A5A', 32);
    boilSeed('plaza floor');
    paint(ellPts(980, 992, 218, 32, 30, 2), { wash: '#D9B06C', fill: SAND, fillOp: 50, ink: null });
    // cotton in the foreground corners
    for (const [fx0, seed] of [[90, 51], [1560, 52]]) {
      for (let i = 0; i < 14; i++) {
        boilSeed('caral cotton' + seed + ' ' + i);
        const cx = fx0 + hash(i * 3 + seed) * 260, cy = 956 + hash(i * 7 + seed) * 92;
        inkLine([[cx, cy + 10], [cx, cy - 4]], 1.6, '#4A6B35', 'inkfine', .3);
        paint(ellPts(cx, cy - 7, 5, 4.2, 8), { wash: PAL.cream, ink: null });
      }
    }
    // a carrier crossing the valley floor; a family group near the plaza
    figure(220 + lt * 13, 934, 118, { robe: '#4A7A8A', skin: SKIN_DK, tag: 'caralcarry', t, basket: true, walk: .9, phase: lt * 6.4 });
    figure(1206, 918, 112, { robe: PAL.clay, skin: SKIN_DK, tag: 'caralfam1', t });
    figure(1272, 924, 96, { robe: '#8A9A6A', skin: SKIN_DK, tag: 'caralfam2', t });
    figure(1240, 930, 66, { robe: PAL.ochre, skin: SKIN_DK, tag: 'caralfam3', t });
    camEnd();
  }

  // ---------------- 11. CLOSING: dusk by the river, a family at a fire ----------------
  function scClosing(t, lt, dur) {
    const p = seg(lt, 0, dur);
    camDrift(lt, dur, 12, .06);
    sky(mixCol('#6B4A7A', PAL.night, p), mixCol('#C96A4A', '#3A3468', p), mixCol('#F0A35E', '#7A4A5E', p));
    stars(t, 36, seg(p, .45, .95) * 220, 9);
    glow(430, lerp(570, 810, p), 260, '#FF9A5C', .5 * (1 - p * .65));
    hillBand(742, mixCol('#4A3049', '#1E1B38', p), 56, 31);
    // a tree silhouette, left
    boilSeed('closing tree');
    paint(ribbon([[238, 856], [250, 730], [262, 640]], 26, 15), { wash: '#241E33', ink: null });
    paint(ellPts(268, 596, 128, 74, 20, 3), { wash: '#2B2440', fill: '#241E33', fillOp: 60, ink: null });
    paint(ellPts(190, 636, 84, 52, 16, 3), { wash: '#2B2440', ink: null });
    // the river, flowing on
    riverBand(838, 1050, mixCol('#7A6A8A', '#2A3A66', p), 11);
    shimmer(862, 1022, t, mixCol('#FFD9A0', '#BFD9EA', p), 18, 11);
    if (p > .6) glow(1300, 916, 130, '#FFE9A8', (p - .6) * 1.1);
    // mudbrick house with a lit window, right
    mudHouse(1420, 806, 320, 208, { wall: mixCol('#C79A5E', '#5A4638', p), wallDk: mixCol('#A87C44', '#463628', p), tag: 'closehouse' });
    boilSeed('lit window');
    paint(rectPts(1562, 676, 46, 42, 1), { wash: '#FFC766', washOp: 240, ink: null });
    glow(1585, 697, 90, '#FFC766', .5);
    // near bank in front of the river — the family sits on this, not in the water
    boilSeed('closing bank');
    paint(rectPts(-300, 928, W + 600, 190, 3), { wash: mixCol('#6B5138', '#2E2434', p), fill: mixCol('#54381F', '#1E1B38', p), fillOp: 50, bleed: .06, tex: .55, ink: null });
    // the family around a small fire
    figure(818, 992, 208, { robe: PAL.clay, robeDk: PAL.clayDk, skin: SKIN_DK, sit: true, tag: 'closeA', t, handF: [902, 936], handB: [760, 950] });
    figure(1096, 992, 196, { robe: '#3A6B6E', robeDk: '#2A4E50', skin: SKIN_DK, sit: true, tag: 'closeB', t, handF: [1012, 936], handB: [1152, 950] });
    figure(958, 1010, 118, { robe: PAL.ochre, robeDk: '#C78F2A', skin: SKIN_DK, sit: true, tag: 'closeC', t, handF: [1006, 972], handB: [912, 972] });
    // bread on a cloth between them
    boilSeed('bread cloth');
    paint(ellPts(958, 1022, 92, 13, 16), { wash: '#D8CFB8', ink: null });
    for (let i = 0; i < 3; i++) paint(ellPts(916 + i * 42, 1016, 13, 8, 10), { wash: '#D9A83C', fill: PAL.ochre, fillOp: 55, ink: null });
    fireAt(958, 968, 54, t, 8);
    smokeCol(958, 896, t, 8, '#8A8296');
    camEnd();
    // slow iris close on the river at the very end
    if (lt > dur - 5) iris(1000, 916, lerp(2800, 250, ease(seg(lt, dur - 5, dur))));
  }

  // ---------------- the film ----------------
  shots([
    [0, scHook],
    [28.64, scRivers],
    [57.89, scEgypt],
    [91.53, scUruk],
    [121.12, scWriting],
    [146.51, scWheel],
    [171.78, scIndus],
    [202.49, scStone],
    [231.51, scChina],
    [256.27, scCaral],
    [291.08, scClosing]
  ]);
})();
