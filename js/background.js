// ── CANVAS BACKGROUND ANIMATION ──
// Renders animated soft blobs using simplex noise onto a fixed canvas.
// A copy of each frame is also drawn into .section-bg canvases inside
// .hero and .contact so that mix-blend-mode: overlay on the headings
// picks up the vivid colors from below.

(function () {
  const { PI, cos, sin, abs, random } = Math;
  const TAU = 2 * PI;
  const rand = (n) => n * random();
  const fadeInOut = (t, m) => {
    const hm = 0.5 * m;
    return abs((t + hm) % m - hm) / hm;
  };

  // ── CONFIG ──
  const CIRCLE_COUNT      = 150;
  const CIRCLE_PROP_COUNT = 8;
  const PROPS_LENGTH      = CIRCLE_COUNT * CIRCLE_PROP_COUNT;
  const BASE_SPEED        = 0.1;
  const RANGE_SPEED       = 1;
  const BASE_TTL          = 150;
  const RANGE_TTL         = 200;
  const BASE_RADIUS       = 100;
  const RANGE_RADIUS      = 200;
  const RANGE_HUE         = 60;
  const X_OFF             = 0.0015;
  const Y_OFF             = 0.0015;
  const Z_OFF             = 0.0015;
  const BG_COLOR          = 'hsla(0,0%,3%,1)';
  // Screened over section-bg to push midtones bright so overlay blend pops
  const SCREEN_OVERLAY    = 'rgba(120, 80, 255, 0.55)';

  let canvasA, canvasB, ctxA, ctxB;
  let circleProps, baseHue, simplex;

  // ── SETUP ──
  function setup() {
    canvasA = document.createElement('canvas');
    canvasB = document.getElementById('bg-canvas');
    ctxA    = canvasA.getContext('2d');
    ctxB    = canvasB.getContext('2d');
    resize();
    simplex = new SimplexNoise();
    initCircles();
    draw();
  }

  function resize() {
    const vw = window.visualViewport ? window.visualViewport.width : window.innerWidth;
    const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    
    canvasA.width  = canvasB.width  = vw;
    canvasA.height = canvasB.height = vh;

    document.querySelectorAll('.section-bg').forEach((sectionCanvas) => {
      const rect = sectionCanvas.getBoundingClientRect();
      sectionCanvas.width  = rect.width;
      sectionCanvas.height = rect.height;
    });
  }

  // ── CIRCLES ──
  function initCircles() {
    circleProps = new Float32Array(PROPS_LENGTH);
    baseHue = 220;
    for (let i = 0; i < PROPS_LENGTH; i += CIRCLE_PROP_COUNT) initCircle(i);
  }

  function initCircle(i) {
    const x      = rand(canvasA.width);
    const y      = rand(canvasA.height);
    const n      = simplex.noise3D(x * X_OFF, y * Y_OFF, baseHue * Z_OFF);
    const t      = rand(TAU);
    const speed  = BASE_SPEED + rand(RANGE_SPEED);
    const ttl    = BASE_TTL + rand(RANGE_TTL);
    const radius = BASE_RADIUS + rand(RANGE_RADIUS);
    circleProps.set(
      [x, y, speed * cos(t), speed * sin(t), 0, ttl, radius, baseHue + n * RANGE_HUE],
      i
    );
  }

  function updateCircle(i) {
    const x      = circleProps[i];
    const y      = circleProps[i + 1];
    const vx     = circleProps[i + 2];
    const vy     = circleProps[i + 3];
    const life   = circleProps[i + 4];
    const ttl    = circleProps[i + 5];
    const radius = circleProps[i + 6];
    const hue    = circleProps[i + 7];

    ctxA.save();
    // High saturation + lightness so colors show through text overlay blend
    ctxA.fillStyle = `hsla(${hue},75%,58%,${fadeInOut(life, ttl)})`;
    ctxA.beginPath();
    ctxA.arc(x, y, radius, 0, TAU);
    ctxA.fill();
    ctxA.restore();

    circleProps[i]     = x + vx;
    circleProps[i + 1] = y + vy;
    circleProps[i + 4] = life + 1;

    const oob = x < -radius || x > canvasA.width + radius
             || y < -radius || y > canvasA.height + radius;
    if (oob || life > ttl) initCircle(i);
  }

  // ── DRAW LOOP ──
  function draw() {
    baseHue++;
    if (baseHue > 280) baseHue = 180;

    ctxA.clearRect(0, 0, canvasA.width, canvasA.height);
    ctxB.fillStyle = BG_COLOR;
    ctxB.fillRect(0, 0, canvasB.width, canvasB.height);

    for (let i = 0; i < PROPS_LENGTH; i += CIRCLE_PROP_COUNT) updateCircle(i);

    ctxB.save();
    ctxB.filter = 'blur(50px)';
    ctxB.drawImage(canvasA, 0, 0);
    ctxB.restore();

    copyToSectionCanvases();
    requestAnimationFrame(draw);
  }

  // Copies the relevant slice of bg-canvas into each .section-bg canvas
  // so mix-blend-mode: overlay on sibling text elements works correctly.
  function copyToSectionCanvases() {
    document.querySelectorAll('.section-bg').forEach((sectionCanvas) => {
      const ctx = sectionCanvas.getContext('2d');
      const rect = sectionCanvas.getBoundingClientRect();

      if (Math.abs(sectionCanvas.width - rect.width) > 1 || 
          Math.abs(sectionCanvas.height - rect.height) > 1) {
        sectionCanvas.width  = rect.width;
        sectionCanvas.height = rect.height;
      }

      ctx.clearRect(0, 0, sectionCanvas.width, sectionCanvas.height);

      // rect.top is viewport-relative, which is exactly what we want
      // since #bg-canvas is also fixed to the viewport
      ctx.drawImage(
        canvasB,
        0, rect.top,           // source: slice of bg-canvas at viewport position
        rect.width, rect.height,
        0, 0,                  // destination: fill section-bg from top-left
        rect.width, rect.height
      );

      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = SCREEN_OVERLAY;
      ctx.fillRect(0, 0, rect.width, rect.height);
      ctx.globalCompositeOperation = 'source-over';
    });
  }

  // Debounce resize events to prevent excessive calls during scroll on mobile
  let resizeTimeout;
  function debouncedResize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      resize();
      // Force a redraw after resize
      copyToSectionCanvases();
    }, 100);
  }

  window.addEventListener('resize', debouncedResize);
  window.addEventListener('load', setup);

  // Also listen for orientation change on mobile
  window.addEventListener('orientationchange', () => {
    setTimeout(resize, 100);
  });

  // Fix for mobile address bar resize
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', () => {
    canvasA.width  = canvasB.width  = window.visualViewport.width;
    canvasA.height = canvasB.height = window.visualViewport.height;
  });
}
})();