// Kemet AR — in-browser progressive color reveal for A-Frame / MindAR.
// The texture remains anchored to its image target; only visible color changes.
export const REVEAL_MODES = Object.freeze({instant: 0, fade: 1, wipe: 2});
export const easeInOut = value => {
  const t = Math.max(0, Math.min(1, Number(value) || 0));
  return t * t * (3 - 2 * t);
};
export const modeCode = mode => REVEAL_MODES[mode] ?? REVEAL_MODES.instant;

export function registerRevealShader(AFRAME) {
  if (AFRAME.shaders['kemet-reveal']) return;
  AFRAME.registerShader('kemet-reveal', {
    schema: {
      src: {type: 'map', is: 'uniform'},
      opacity: {type: 'number', is: 'uniform', default: 0.85},
      progress: {type: 'number', is: 'uniform', default: 1},
      revealMode: {type: 'number', is: 'uniform', default: 0}
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D src;
      uniform float opacity;
      uniform float progress;
      uniform float revealMode;
      varying vec2 vUv;
      void main() {
        vec4 pixel = texture2D(src, vUv);
        float visibility = 1.0;
        if (revealMode > 0.5 && revealMode < 1.5) {
          visibility = progress; // Soft overall fade.
        } else if (revealMode >= 1.5) {
          // Right-to-left reveal with a soft feathered leading edge.
          visibility = smoothstep(1.0 - progress - 0.025,
                                  1.0 - progress + 0.025, vUv.x);
          if (progress <= 0.0001) visibility = 0.0;
          if (progress >= 0.9999) visibility = 1.0;
        }
        pixel.a *= opacity * visibility;
        if (pixel.a < 0.003) discard;
        gl_FragColor = pixel;
      }
    `
  });
}

// One small animation loop per visible image target. No replacement of camera tracking.
export function createRevealController({getMode, getDuration, requestFrame = requestAnimationFrame, cancelFrame = cancelAnimationFrame}) {
  const targets = new Map();
  let disposed = false;
  const update = (target, prop, val) => target.plane.setAttribute('material', prop, val);
  const cancel = target => {
    if (target.raf != null) cancelFrame(target.raf);
    target.raf = null;
  };
  const setProgress = (target, value) => {
    target.progress = value;
    update(target, 'progress', value);
  };
  function reset(target) {
    cancel(target);
    const mode = getMode();
    update(target, 'revealMode', modeCode(mode));
    setProgress(target, mode === 'instant' ? 1 : 0);
  }
  function play(target) {
    if (disposed || !target?.found) return;
    reset(target);
    if (getMode() === 'instant') return;
    const duration = Math.max(500, Math.min(10000, Number(getDuration()) || 3000));
    let startTime;
    const frame = now => {
      target.raf = null;
      if (disposed || !target.found) return;
      if (startTime == null) startTime = now;
      const linear = Math.min(1, (now - startTime) / duration);
      setProgress(target, easeInOut(linear));
      if (linear < 1) target.raf = requestFrame(frame);
    };
    target.raf = requestFrame(frame);
  }
  return {
    register(index, plane) {
      if (disposed) return;
      const t = {plane, found: false, progress: 0, raf: null};
      targets.set(index, t);
      reset(t);
    },
    setPlane(index, plane) {
      const t=targets.get(index);
      if(!t||disposed||!plane)return;
      cancel(t);t.plane=plane;
      if(t.found)play(t);else reset(t);
    },
    found(index) {
      const t = targets.get(index);
      if (!t || disposed || t.found) return;
      t.found = true;
      play(t);
    },
    lost(index) {
      const t = targets.get(index);
      if (!t) return;
      t.found = false;
      reset(t); // Replay when MindAR recognizes the target again.
    },
    replay() {
      let any = false;
      for (const target of targets.values()) {
        if (target.found) {any = true; play(target);}
      }
      return any;
    },
    setMode() {
      for (const target of targets.values()) {
        if (target.found) play(target);
        else reset(target);
      }
    },
    setOpacity(value) {
      const opacity = Math.max(0, Math.min(1, Number(value) || 0));
      for (const target of targets.values()) update(target, 'opacity', opacity);
    },
    dispose() {
      disposed = true;
      for (const target of targets.values()) cancel(target);
      targets.clear();
    }
  };
}
