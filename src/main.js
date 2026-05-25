/* web4u — client runtime.
   The page content (rows, sections, copy) is pre-rendered at build time
   from content.json, so the archive reads fine with JS disabled. This file
   adds only the interactive layer: stylesheet import, the tag filter, the
   scroll-reveal, the live clock, back-to-top, and the WebGL shader plate. */

import './styles/main.css';

/* ---- read the index data the build injected (for filter counts) ---- */
const DATA = (() => {
  const el = document.getElementById('index-data');
  try { return el ? JSON.parse(el.textContent) : { links: [] }; }
  catch (e) { return { links: [] }; }
})();

/* ---- tag filter (operates across all sections) ---- */
(function () {
  const fb = document.getElementById('filterbar');
  if (!fb) return;
  const tags = ['all', ...Array.from(new Set(DATA.links.map((l) => l.tag)))];
  let active = 'all';

  tags.forEach((t) => {
    const cnt = t === 'all' ? DATA.links.length : DATA.links.filter((l) => l.tag === t).length;
    const b = document.createElement('button');
    b.setAttribute('aria-pressed', String(t === 'all'));
    b.innerHTML = t + "<span class='c'>" + String(cnt).padStart(2, '0') + '</span>';
    b.onclick = () => { active = t; apply(); };
    fb.appendChild(b);
  });

  function apply() {
    document.querySelectorAll('.row').forEach((r) => {
      r.style.display = active === 'all' || r.dataset.tag === active ? '' : 'none';
    });
    [...fb.children].forEach((b, i) => b.setAttribute('aria-pressed', String(tags[i] === active)));
    document.querySelectorAll('.sect').forEach((s) => {
      const vis = [...s.querySelectorAll('.row')].some((r) => r.style.display !== 'none');
      s.style.display = vis ? '' : 'none';
    });
    observe();
  }
})();

/* ---- scroll-reveal for rows ---- */
let io;
function observe() {
  if (io) io.disconnect();
  io = new IntersectionObserver(
    (es) => {
      es.forEach((e, k) => {
        if (e.isIntersecting) {
          e.target.style.transitionDelay = (k % 8 * 40) + 'ms';
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.1 }
  );
  document.querySelectorAll('.row').forEach((r) => {
    if (r.style.display !== 'none' && !r.classList.contains('in')) io.observe(r);
  });
}
observe();

/* ---- back to top ---- */
const top = document.getElementById('toTop');
if (top) top.onclick = (e) => { e.preventDefault(); scrollTo({ top: 0, behavior: 'smooth' }); };

/* ---- live clock in the run-head ---- */
(function () {
  const el = document.getElementById('liveclock');
  if (!el) return;
  function tick() {
    const d = new Date();
    el.textContent =
      'accessed ' +
      d.toLocaleString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
      }).toLowerCase();
  }
  tick();
  setInterval(tick, 30000);
})();

/* ---- WebGL shader plate (slate field, single electric-off-white  accent) ---- */
(function () {
  const cv = document.getElementById('gl');
  if (!cv) return;
  const gl = cv.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
  const stateEl = document.getElementById('plateState');
  const STATE_LIVE = cv.dataset.live || 'off-white  field · live';
  const STATE_PAUSED = cv.dataset.paused || 'off-white  field · paused';
  if (!gl) { cv.parentElement.style.background = 'linear-gradient(120% 90% at 30% 20%, #1b2128, #0e1115)'; return; }

  const vs = 'attribute vec2 p; void main(){ gl_Position=vec4(p,0.,1.); }';
  const fs = `
  precision highp float;
  uniform vec2 u_res; uniform float u_t; uniform vec2 u_m;
  float hash(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
  float noise(vec2 p){ vec2 i=floor(p), f=fract(p);
    float a=hash(i), b=hash(i+vec2(1,0)), c=hash(i+vec2(0,1)), d=hash(i+vec2(1,1));
    vec2 u=f*f*(3.-2.*f); return mix(mix(a,b,u.x),mix(c,d,u.x),u.y); }
  float fbm(vec2 p){ float v=0.,a=.5; for(int i=0;i<6;i++){ v+=a*noise(p); p*=2.02; a*=.5; } return v; }
  float bayer(vec2 c){ int x=int(mod(c.x,4.)), y=int(mod(c.y,4.)); int idx=x+y*4;
    float m[16];
    m[0]=0.;m[1]=8.;m[2]=2.;m[3]=10.; m[4]=12.;m[5]=4.;m[6]=14.;m[7]=6.;
    m[8]=3.;m[9]=11.;m[10]=1.;m[11]=9.; m[12]=15.;m[13]=7.;m[14]=13.;m[15]=5.;
    float v=0.; for(int k=0;k<16;k++){ if(k==idx) v=m[k]; } return (v+.5)/16.; }
  void main(){
    vec2 uv=gl_FragCoord.xy/u_res;
    vec2 p=(gl_FragCoord.xy-.5*u_res)/u_res.y;
    float t=u_t*0.045;
    vec2 q=vec2(fbm(p*1.5+vec2(0.,t)), fbm(p*1.5+vec2(4.4,-t*0.8)));
    float f=fbm(p*1.7 + q*1.5 + vec2(t*0.35,0.));
    vec2 src=vec2(sin(t*0.6)*0.35-0.15, cos(t*0.45)*0.22+0.12) + (u_m-0.5)*0.28;
    float d=length(p-src);
    float glow=smoothstep(1.05,0.0,d);
    float field=clamp(f*0.85 + glow*0.55, 0., 1.);
    vec3 c0=vec3(0.055,0.070,0.085);
    vec3 c1=vec3(0.13,0.17,0.20);
    vec3 c2=vec3(0.36,0.42,0.47);
    vec3 c3=vec3(0.933,0.925,0.894);    // off-white accent
    vec3 col=mix(c0,c1,smoothstep(0.12,0.45,field));
    col=mix(col,c2,smoothstep(0.45,0.78,field));
    col=mix(col,c3,smoothstep(0.88,0.99,field)*0.9);
    float lum=field;
    float thr=bayer(gl_FragCoord.xy/2.0);
    float dq=step(thr,lum);
    vec3 dcol=mix(c0, mix(c2,c3,smoothstep(.85,1.,lum)), dq);
    col=mix(col, dcol, smoothstep(0.25,0.85,uv.y)*0.45);
    col*=0.95+0.05*sin(gl_FragCoord.y*1.4);
    col+=(hash(gl_FragCoord.xy+u_t)-0.5)*0.015;
    col*=1.0-0.45*length(uv-0.5);
    gl_FragColor=vec4(col,1.0);
  }`;

  function sh(type, src) {
    const o = gl.createShader(type);
    gl.shaderSource(o, src);
    gl.compileShader(o);
    if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) console.warn(gl.getShaderInfoLog(o));
    return o;
  }
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const uRes = gl.getUniformLocation(prog, 'u_res');
  const uT = gl.getUniformLocation(prog, 'u_t');
  const uM = gl.getUniformLocation(prog, 'u_m');

  let m = [0.5, 0.5], tm = [0.5, 0.5];
  addEventListener('pointermove', (e) => {
    const r = cv.getBoundingClientRect();
    tm = [(e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height];
  }, { passive: true });

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    cv.width = Math.max(1, Math.floor(cv.clientWidth * dpr));
    cv.height = Math.max(1, Math.floor(cv.clientHeight * dpr));
    gl.viewport(0, 0, cv.width, cv.height);
  }
  addEventListener('resize', resize);
  resize();

  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  let start = performance.now(), raf;
  function frame(now) {
    const t = (now - start) / 1000;
    m[0] += (tm[0] - m[0]) * 0.05;
    m[1] += (tm[1] - m[1]) * 0.05;
    gl.uniform2f(uRes, cv.width, cv.height);
    gl.uniform1f(uT, reduce ? 8.0 : t);
    gl.uniform2f(uM, m[0], m[1]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (!reduce) raf = requestAnimationFrame(frame);
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
      if (stateEl) stateEl.textContent = STATE_PAUSED;
    } else if (!reduce) {
      start = performance.now() - 8000;
      raf = requestAnimationFrame(frame);
      if (stateEl) stateEl.textContent = STATE_LIVE;
    }
  });
  raf = requestAnimationFrame(frame);
})();
