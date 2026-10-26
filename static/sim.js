/* NuclearStegNet — client-side port of the Flask backend (app.py + mission.py).
 *
 * Every /api/* endpoint of the Flask app is re-implemented here in plain JavaScript so the
 * site can run as a static page (GitHub Pages). Image processing (SRM filter bank, TLU,
 * SE attention, Wiener/median filters, SSIM, ...) mirrors the numpy/scipy code; the
 * encryption layer uses WebCrypto AES-256-GCM.
 *
 * HONESTY NOTE (same as the Flask version): the detector uses real fixed SRM high-pass
 * filters, TLU truncation and an SE-style channel attention, but ALL weights are fixed /
 * hand-set (untrained). Dashboard benchmark metrics (balanced accuracy / TPR / FPR / ROC)
 * are SIMULATED REFERENCE VALUES, not results measured by this code. Mission metrics are
 * measured on simulated frames only.
 */
(function (root) {
'use strict';

/* ------------------------------------------------------------------ constants */
const ALLOWED_EXT = ['png', 'jpg', 'jpeg', 'bmp', 'tif', 'tiff'];
const ALGORITHMS = ['J-UNIWARD', 'S-UNIWARD', 'WOW'];
const PAYLOADS = ['0.1', '0.2', '0.4'];
const DOMAINS = ['matched', 'cross'];
const MAX_SIDE = 512;
const MAX_BYTES = 25 * 1024 * 1024;
const TLU_T = 3.0;
const now = () => (root.performance && performance.now) ? performance.now() : Date.now();

/* fixed (untrained) SE weights: exported verbatim from numpy default_rng(1337) as in app.py */
const SE_W1 = [[0.02296093369824951,0.2843618615627791,-0.08264755109153141,-0.8336006645597988,1.5120712112915329,-0.6038345701954068,1.1140896542743992,-1.5014266307014343,0.08900166227758634,-0.05167402633505538,1.2729709234548994,0.3090107541026819,-0.31971813537168964,0.7426859368647375,0.12321689076961886,1.0877853228700143,-0.13040192090024708,0.05635405781175942,-0.08027796388938074,-0.680798528281247,0.5086707357440979,0.40626663575675775,0.5236133916544873,-0.20200059870043102,0.6107191046314836,0.6637029755726077],[-0.023162635717518365,-0.49038133368573406,-0.0949112585430846,-0.8994148540978181,-0.8798209363395569,0.4392066602983639,-1.0322248855872183,-1.1133721473025124,0.2595374928578211,0.04346680648569502,-1.1662519128017406,0.502891055478328,-0.00720912658708287,0.7001307138451317,-0.17639737604193137,0.21094223523415997,-0.9515354672897892,-0.2843061538285578,0.6670739365357071,-0.5599725299642582,0.5019300456838276,0.28594653620670507,-0.5325977580438246,1.1347636443794193,0.3682586042955522,0.422132992701776],[0.5045267088224973,-1.206579343059542,0.081001959715515,0.5058158222706444,-0.023444705780834216,0.5573623648840925,0.07035930907887973,0.23276650122683187,0.27456699121530637,0.1412637716752711,-0.32542220279537953,0.7398557476759433,0.12589604249850692,0.03636830649550957,0.03597099124531728,-0.3142950232507177,-0.8415197739992382,-0.9669155291991943,-0.11718760139554531,-0.5833183764554777,0.28298667122804133,0.30259386949683087,0.6350762144736057,-0.05704987020452833,-0.032383279555643005,0.2703059328072118],[-1.5927152089490764,-0.9902069754578877,0.22290354046575525,0.18147668504857067,-1.5966247800314106,0.02071879603294208,-0.2564997659964254,-0.2252983974146872,0.19549231014006582,-0.0405194572008054,0.4568967153615522,-0.33190186992616894,-0.43390658578578617,-0.09776662063828799,0.0955105620299236,-0.5253464061225094,-0.6009333878233278,-0.05108572813279453,0.15333198905489742,0.22973010582698777,-0.15393122001985707,0.11024248929361569,0.8623068598529107,-0.06164261882903125,0.3251213966015137,-0.11984871246583197],[-0.12313046903710621,-0.20102030079263303,0.0994213076516941,-0.0030506416320248467,0.09030198875599867,0.07251017001685998,-0.20357822976921344,-0.28096284135082933,-0.5467894045829943,-0.5097789909478144,0.7023632930517344,0.5000505982377969,-0.9124277554506897,0.5010028936269341,0.1450188980259444,-0.21435802004317875,-0.6602485930645,1.250819286120685,-0.7947320359193838,-0.4796496692640877,-0.05671347147534042,-1.1278627176209906,-0.7326264633755609,0.6366401929556702,-0.14755740682773094,1.089936371201718],[0.2629579376253863,-0.4023744376179433,0.6010303805619805,0.19655728818263765,0.22796776918712058,-0.3968793855405595,-0.45195834020621795,0.222952656375556,-0.08802970048032585,0.41625433141414886,-0.586600515769525,-0.31283923391487545,-0.7006762442084574,-0.3143995032551699,-0.5349497545908731,-0.535960859701624,0.3667805664083395,0.18705545125305004,0.1855710107667615,1.0771792698827087,0.4451135671199096,0.3662045000354484,-0.2817835070900456,-0.9962238549022264,0.36006247287211707,-0.17579268430946535],[-1.0313986548167726,-0.6319986071088214,0.6663816954855623,-0.6336852857950058,-0.11643451582741171,0.04718240307477718,-0.7831040766522488,0.27445514991896564,-0.24052722393145168,0.3274989840768171,1.0194912740226996,0.9096412672155273,0.11758773303585807,0.4901930270689005,-0.08817953712341792,-0.7534338847882619,-0.317895923998191,0.12801745125265732,1.4485211404819303,1.2042932113715277,-1.0929465715546096,0.25606081058208063,-0.21926419756826807,0.5189476893041653,-0.6356316763351729,0.537327921838194]];
const SE_W2 = [[0.09094268651114361,-0.21413755981094781,-0.147556189439907,0.14208754969965437,-0.5773953533012912,0.7185293033099996,0.3786739973325232],[0.45307397860746584,0.561924607062314,-0.09840025049559152,0.03018837777584992,1.0867011019554087,-1.0260426546502788,-0.26271120735404196],[1.392522320182905,0.12055131027034445,0.1872212608856727,-0.9119199890209261,0.12447745357202583,-0.3774087254771612,-0.6231375303553276],[-1.010450728505376,-0.9060904586556091,0.8919055863265831,0.7175922567136669,0.7346796790267432,-0.39825694834748054,-0.25762791318606426],[-0.001437365058947985,0.5878683447929253,-0.2834501129305375,0.8250936115676875,0.38846721739056117,0.595074839909596,0.4352758248241054],[0.4939639681134711,-0.18069388075169418,0.1728143185097676,-0.5776787046798885,0.21580496482764902,0.2234512394476036,0.6219966768699317],[-0.02701425051962642,0.8277797438744121,0.10059996651439261,-0.32884615673536116,0.7589682826979048,0.5543527580752037,-1.0605264951761697],[-0.250630259400855,0.08954938314421586,-0.28316719922627964,-0.7831101252243089,0.005066283206711572,0.6671943586955744,0.520052799106029],[-0.9863913428856739,0.7354452813442427,0.40858278167523393,-0.4101288505296518,0.3387442583146175,-0.2770937703022314,0.007694325013291168],[0.359155949369363,0.6565381116135743,-0.09652010253315965,-0.17601936481457817,-0.06487118646503022,0.15628240330248855,0.6879410385819246],[-0.22612602640841362,-0.08713318941188161,0.5229299109766914,-0.21113282889026544,-0.3489182349185853,0.6801199829281648,-0.15884921240526215],[0.42381780414487497,-0.5849765778837633,0.956334031111216,0.5146241489608766,-0.028431411630285817,-0.42664222632374293,0.5667800776858453],[-0.17333753094903703,0.23862446495798884,0.012549700754958227,-0.18744093190822186,0.38746084047478124,-0.3936256306834331,0.31402568474830944],[1.1220791194248465,-1.396493399259839,-0.5447456160888388,-0.5779942987797634,-0.09352163470499007,0.07988137696769902,-0.10953657200186975],[-0.39285516094644934,0.1707754726322657,0.2411685508421547,-1.329805109615162,0.2853569110056539,0.7782259502324399,-0.34593830136558884],[0.42497258635616664,0.25950661132282743,-0.06823792790264761,-0.7229220776549895,-0.5076546562066686,-0.9293237142315068,-0.12693106504561572],[0.7150142348885796,0.6047344170466522,-0.103016452611506,-0.06004996885619425,-0.41866969968888385,-0.33578562124047906,0.8209277940847575],[-0.40856399187676623,-0.3093619380966928,0.5605460118749992,-0.09481046950170738,-0.3127840570147677,0.6101473274003144,-0.4400195964276175],[-0.502083239278387,-0.24964345563049284,-0.5040273161416515,0.2196830857248199,0.5226035405885994,-0.3558176484212631,0.40598095636998316],[1.100613705701465,0.10341624337534051,1.8909235883389497,-1.182224189855255,-0.7614861016017687,-0.3191024988420407,0.06834122830069883],[-0.3843221894049391,0.1397738667623087,-1.0558942530599562,0.4183178352570101,0.2465211187061419,0.5310998317625991,-0.35236051701455556],[-0.0437128507363653,0.2761445274586559,-0.13549340985045627,-0.7058312989421006,-6.268090088956651e-05,-0.15193774350985126,-0.04857743968443179],[-0.011706682388405257,-0.9702458688151825,-0.24449952226252405,-0.4493786767332495,-0.4242858833580562,0.7544512707451477,0.5292916298667188],[0.5461909224307228,0.007018336245434649,0.3831223229851023,-0.6844115520455863,0.891446712633215,-0.6985773459504954,-0.30338542117112455],[0.5636015265972839,0.9376940494301725,0.24190235538804464,0.7638526436839591,0.16960721194098047,-0.21448642753252567,-0.20844898500001655],[0.8551507413556835,0.34289585103615206,0.3147502935766127,-0.16231975881869234,-0.3915125458145316,-0.5773935499302311,0.2064641912573438]];

/* ------------------------------------------------------------------ RNG */
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
class RNG {
  constructor(seed) {
    if (seed === undefined || seed === null) seed = (Math.random() * 4294967296) >>> 0;
    const r1 = mulberry32(seed >>> 0), r2 = mulberry32((seed ^ 0x9E3779B9) >>> 0);
    this.random = () => (Math.floor(r1() * 67108864) * 134217728 + Math.floor(r2() * 134217728)) / 9007199254740992;
    this._spare = null;
  }
  uniform(a, b) { return a + (b - a) * this.random(); }
  integers(a, b) { return a + Math.floor(this.random() * (b - a)); } // [a, b)
  normal(mu, sd) {
    let z;
    if (this._spare !== null) { z = this._spare; this._spare = null; }
    else {
      let u = 0, v = 0; while (u === 0) u = this.random(); v = this.random();
      const r = Math.sqrt(-2 * Math.log(u)); z = r * Math.cos(2 * Math.PI * v); this._spare = r * Math.sin(2 * Math.PI * v);
    }
    return mu + sd * z;
  }
  sign() { return this.random() < 0.5 ? -1 : 1; }
}
const GLOBAL_RNG = new RNG();
const gauss = (mu, sd) => GLOBAL_RNG.normal(mu, sd);

/* ------------------------------------------------------------------ array helpers
 * images are {w, h, d: Float64Array(w*h)} in row-major order (d[i*w + j] = row i, col j) */
const mk = (w, h, d) => ({ w, h, d: d || new Float64Array(w * h) });
const clone = x => mk(x.w, x.h, Float64Array.from(x.d));
function mean(a) { let s = 0; for (let i = 0; i < a.length; i++) s += a[i]; return s / a.length; }
function std(a, m) { m = m === undefined ? mean(a) : m; let s = 0; for (let i = 0; i < a.length; i++) { const d = a[i] - m; s += d * d; } return Math.sqrt(s / a.length); }
function percentile(a, q) { // numpy default (linear)
  const s = Float64Array.from(a).sort(); const n = s.length; if (!n) return NaN;
  const pos = (n - 1) * q / 100, lo = Math.floor(pos), hi = Math.min(n - 1, lo + 1);
  return s[lo] + (s[hi] - s[lo]) * (pos - lo);
}
const median = a => percentile(a, 50);
function reflect(i, n) { // scipy 'symm' / ndimage 'reflect':  d c b a | a b c d | d c b a
  if (n === 1) return 0;
  while (i < 0 || i >= n) { if (i < 0) i = -i - 1; if (i >= n) i = 2 * n - i - 1; }
  return i;
}

/* ------------------------------------------------------------------ SRM bank */
const Z5 = () => Array.from({ length: 5 }, () => new Array(5).fill(0));
function pad5(k) { const out = Z5(), o = (5 - k.length) >> 1; for (let i = 0; i < k.length; i++) for (let j = 0; j < k[0].length; j++) out[o + i][o + j] = k[i][j]; return out; }
const scale = (k, s) => k.map(r => r.map(v => v * s));
function rot90(m, k) { let r = m; for (let t = 0; t < (k % 4); t++) { const n = r.length, c = r[0].length, o = []; for (let i = 0; i < c; i++) { o.push([]); for (let j = 0; j < n; j++) o[i].push(r[j][c - 1 - i]); } r = o; } return r; }
const KV = scale([[-1, 2, -2, 2, -1], [2, -6, 8, -6, 2], [-2, 8, -12, 8, -2], [2, -6, 8, -6, 2], [-1, 2, -2, 2, -1]], 1 / 12);
const SQ3 = scale([[-1, 2, -1], [2, -4, 2], [-1, 2, -1]], 1 / 4);
const EDGE3 = scale([[-1, 2, -1], [2, -4, 2], [0, 0, 0]], 1 / 4);
const EDGE5 = scale([[-1, 2, -2, 2, -1], [2, -6, 8, -6, 2], [-2, 8, -12, 8, -2], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]], 1 / 12);
const sgn = v => (v >= 0 ? '+' : '') + v;
function buildBank() {
  const bank = [];
  for (const [dy, dx] of [[0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1]]) {
    const k = [[0, 0, 0], [0, -1, 0], [0, 0, 0]]; k[1 + dy][1 + dx] = 1; bank.push(['1st-' + sgn(dy) + sgn(dx), pad5(k)]);
  }
  for (const [name, [dy, dx]] of [['H', [0, 1]], ['V', [1, 0]], ['D', [1, 1]], ['A', [1, -1]]]) {
    const k = [[0, 0, 0], [0, -2, 0], [0, 0, 0]]; k[1 + dy][1 + dx] = 1; k[1 - dy][1 - dx] = 1; bank.push(['2nd-' + name, pad5(scale(k, 0.5))]);
  }
  for (const [name, [dy, dx]] of [['H', [0, 1]], ['V', [1, 0]], ['D', [1, 1]], ['A', [1, -1]]]) {
    const k = Z5(), c = 2; for (const [m, w] of [[-2, -1], [-1, 3], [0, -3], [1, 1]]) k[c + m * dy][c + m * dx] += w; bank.push(['3rd-' + name, scale(k, 1 / 3)]);
  }
  bank.push(['SQ3x3', pad5(SQ3)]); bank.push(['KV5x5', KV]);
  for (let r = 0; r < 4; r++) { bank.push(['EDGE3-r' + r, pad5(rot90(EDGE3, r))]); bank.push(['EDGE5-r' + r, rot90(EDGE5, r)]); }
  return bank;
}
/* convolve2d(mode='same') == correlation with offsets (c - a, c - b); keep only non-zero taps */
function taps(k) { const kh = k.length, kw = k[0].length, ch = kh >> 1, cw = kw >> 1, t = []; for (let a = 0; a < kh; a++) for (let b = 0; b < kw; b++) if (k[a][b] !== 0) t.push([ch - a, cw - b, k[a][b]]); return t; }
const SRM_BANK = buildBank().map(([n, k]) => ({ name: n, k, taps: taps(k) }));
const N_F = SRM_BANK.length; // 26
const KV_TAPS = taps(KV), SQ3_TAPS = taps(SQ3);

function padSym(x, p) {
  const W = x.w + 2 * p, H = x.h + 2 * p, o = new Float64Array(W * H);
  for (let i = 0; i < H; i++) { const si = reflect(i - p, x.h) * x.w, r = i * W; for (let j = 0; j < W; j++) o[r + j] = x.d[si + reflect(j - p, x.w)]; }
  return { W, H, d: o, p };
}
function applyTaps(P, tp, w, h) {
  const o = new Float64Array(w * h), W = P.W, p = P.p, d = P.d;
  for (const [dy, dx, wt] of tp) { const off = dy * W + dx; for (let i = 0; i < h; i++) { const s = (i + p) * W + p + off, r = i * w; for (let j = 0; j < w; j++) o[r + j] += wt * d[s + j]; } }
  return o;
}
const conv2symm = (x, tp) => applyTaps(padSym(x, 2), tp, x.w, x.h);

/* ndimage-style separable filters (mode='reflect') */
function corr1d(src, w, h, k, left, axis) {
  const o = new Float64Array(w * h), n = k.length;
  if (axis === 1) { for (let i = 0; i < h; i++) { const r = i * w; for (let j = 0; j < w; j++) { let s = 0; for (let t = 0; t < n; t++) s += k[t] * src[r + reflect(j - left + t, w)]; o[r + j] = s; } } }
  else { for (let i = 0; i < h; i++) for (let t = 0; t < n; t++) { const si = reflect(i - left + t, h) * w, r = i * w, kt = k[t]; for (let j = 0; j < w; j++) o[r + j] += kt * src[si + j]; } }
  return o;
}
function uniformFilter(a, w, h, size) { const k = new Array(size).fill(1 / size), left = size >> 1; return corr1d(corr1d(a, w, h, k, left, 0), w, h, k, left, 1); }
function gaussKernel(sigma) { const r = Math.floor(4 * sigma + 0.5), k = []; let s = 0; for (let i = -r; i <= r; i++) { const v = Math.exp(-0.5 * i * i / (sigma * sigma)); k.push(v); s += v; } return { k: k.map(v => v / s), r }; }
function gaussianFilter(a, w, h, sigma) { const { k, r } = gaussKernel(sigma); return corr1d(corr1d(a, w, h, k, r, 0), w, h, k, r, 1); }
function sobel(a, w, h, axis) { // ndimage.sobel: derivative [-1,0,1] along axis, smoothing [1,2,1] across
  const D = [-1, 0, 1], S = [1, 2, 1];
  return axis === 1 ? corr1d(corr1d(a, w, h, D, 1, 1), w, h, S, 1, 0) : corr1d(corr1d(a, w, h, D, 1, 0), w, h, S, 1, 1);
}
function medianFilter3(a, w, h) {
  const o = new Float64Array(w * h), v = new Float64Array(9);
  for (let i = 0; i < h; i++) for (let j = 0; j < w; j++) {
    let n = 0; for (let di = -1; di <= 1; di++) { const r = reflect(i + di, h) * w; for (let dj = -1; dj <= 1; dj++) v[n++] = a[r + reflect(j + dj, w)]; }
    v.sort(); o[i * w + j] = v[4];
  }
  return o;
}
function binaryDilationCross(m, w, h) {
  const o = new Uint8Array(w * h);
  for (let i = 0; i < h; i++) for (let j = 0; j < w; j++) { const k = i * w + j; o[k] = m[k] || (j > 0 && m[k - 1]) || (j < w - 1 && m[k + 1]) || (i > 0 && m[k - w]) || (i < h - 1 && m[k + w]) ? 1 : 0; }
  return o;
}
function wiener3(x) { // scipy.signal.wiener(x, 3): zero-padded local stats
  const w = x.w, h = x.h, d = x.d, lm = new Float64Array(w * h), lv = new Float64Array(w * h);
  for (let i = 0; i < h; i++) for (let j = 0; j < w; j++) {
    let s = 0, s2 = 0;
    for (let di = -1; di <= 1; di++) { const ii = i + di; if (ii < 0 || ii >= h) continue; for (let dj = -1; dj <= 1; dj++) { const jj = j + dj; if (jj < 0 || jj >= w) continue; const v = d[ii * w + jj]; s += v; s2 += v * v; } }
    const m = s / 9; lm[i * w + j] = m; lv[i * w + j] = s2 / 9 - m * m;
  }
  const noise = mean(lv), o = new Float64Array(w * h);
  for (let k = 0; k < o.length; k++) {
    let r = (d[k] - lm[k]) * (1 - noise / lv[k]) + lm[k];
    if (lv[k] < noise) r = lm[k];
    o[k] = Number.isFinite(r) ? r : d[k];
  }
  return o;
}

/* ------------------------------------------------------------------ detector core (app.py) */
function srmResiduals(x) { // TLU-clipped residuals for all 26 filters (+ raw)
  const P = padSym(x, 2), res = [], raw = [];
  for (const f of SRM_BANK) { const r = applyTaps(P, f.taps, x.w, x.h); raw.push(r); const c = new Float64Array(r.length); for (let i = 0; i < r.length; i++) c[i] = r[i] > TLU_T ? TLU_T : r[i] < -TLU_T ? -TLU_T : r[i]; res.push(c); }
  return { res, raw };
}
function seAttention(res) {
  const z = res.map(r => { let s = 0; for (let i = 0; i < r.length; i++) s += Math.abs(r[i]); return s / r.length; });
  const zm = mean(z), zs = std(z, zm), zn = z.map(v => (v - zm) / (zs + 1e-8));
  const hdn = SE_W1.map(row => Math.max(0, row.reduce((s, v, i) => s + v * zn[i], 0)));
  const s = SE_W2.map(row => 1 / (1 + Math.exp(-(row.reduce((a, v, i) => a + v * hdn[i], 0) + 0.5))));
  return { w: s, z };
}
function residualStats(res, w) {
  let n = 0, sa = 0, sat = 0, zero = 0, sum = 0, sum2 = 0, we = 0;
  for (let f = 0; f < res.length; f++) { const r = res[f], wf = w[f]; for (let i = 0; i < r.length; i++) { const v = r[i], a = Math.abs(v); sa += a; if (a >= TLU_T - 1e-9) sat++; if (a < 0.25) zero++; sum += v; sum2 += v * v; we += Math.abs(v * wf); n++; } }
  const mu = sum / n, sd = Math.sqrt(Math.max(0, sum2 / n - mu * mu));
  let k4 = 0; for (const r of res) for (let i = 0; i < r.length; i++) { const t = (r[i] - mu) / (sd + 1e-8); k4 += t * t * t * t; }
  return { mean_abs: sa / n, sat_ratio: sat / n, zero_ratio: zero / n, kurtosis: k4 / n, weighted_energy: we / n };
}
function weightedMap(res, w) { const n = res[0].length, m = new Float64Array(n); for (let f = 0; f < res.length; f++) { const r = res[f], wf = w[f]; for (let i = 0; i < n; i++) m[i] += Math.abs(r[i] * wf); } return m; }
function score(f, domain) {
  let z = -2.2 + 1.6 * f.weighted_energy + 1.2 * f.mean_abs - 1.5 * f.zero_ratio + 0.9 * f.sat_ratio - 0.05 * (f.kurtosis - 3);
  if (domain === 'cross') z *= 0.8;
  return 1 / (1 + Math.exp(-z));
}
function textureMap(x) { const r = conv2symm(x, KV_TAPS); for (let i = 0; i < r.length; i++) r[i] = Math.abs(r[i]); return uniformFilter(r, x.w, x.h, 7); }
function simulateEmbedding(x, payload, algorithm, rng) {
  let tex = textureMap(x);
  if (algorithm === 'WOW') tex = tex.map(v => Math.pow(v, 1.3));
  else if (algorithm === 'J-UNIWARD') tex = uniformFilter(tex, x.w, x.h, 8);
  const tm = mean(tex), o = new Float64Array(x.d.length); let ch = 0;
  for (let i = 0; i < o.length; i++) {
    const p = Math.min(0.5, Math.max(0, tex[i] / (tm + 1e-8) * (payload / 2)));
    const m = rng.random() < p, s = rng.sign();
    if (m) ch++; o[i] = Math.min(255, Math.max(0, x.d[i] + (m ? s : 0)));
  }
  return { stego: mk(x.w, x.h, o), change_rate: ch / o.length };
}
function psnr(a, b) { let s = 0; for (let i = 0; i < a.d.length; i++) { const d = a.d[i] - b.d[i]; s += d * d; } const mse = s / a.d.length; return mse === 0 ? Infinity : 10 * Math.log10(255 * 255 / mse); }
function ssim(a, b) { // Gaussian-window SSIM (the fallback used by app.py when scikit-image is absent)
  const C1 = (0.01 * 255) ** 2, C2 = (0.03 * 255) ** 2, w = a.w, h = a.h, n = a.d.length, A = a.d, B = b.d;
  const g = v => gaussianFilter(v, w, h, 1.5);
  const aa = new Float64Array(n), bb = new Float64Array(n), ab = new Float64Array(n);
  for (let i = 0; i < n; i++) { aa[i] = A[i] * A[i]; bb[i] = B[i] * B[i]; ab[i] = A[i] * B[i]; }
  const ma = g(A), mb = g(B), ga = g(aa), gb = g(bb), gab = g(ab); let s = 0;
  for (let i = 0; i < n; i++) { const va = ga[i] - ma[i] ** 2, vb = gb[i] - mb[i] ** 2, cab = gab[i] - ma[i] * mb[i]; s += ((2 * ma[i] * mb[i] + C1) * (2 * cab + C2)) / ((ma[i] ** 2 + mb[i] ** 2 + C1) * (va + vb + C2)); }
  return s / n;
}
/* normal distribution helpers (scipy.stats.norm.cdf / ppf) */
function erf(x) { // W. J. Cody-style rational approximation via erfc (|err| < 1.2e-7)
  const z = Math.abs(x), t = 1 / (1 + 0.5 * z);
  const r = t * Math.exp(-z * z - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))));
  return x >= 0 ? 1 - r : r - 1;
}
const normCdf = x => 0.5 * (1 + erf(x / Math.SQRT2));
function normPpf(p) { // Acklam's algorithm + one Halley refinement step
  const a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
  const b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01];
  const c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
  const d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00];
  const pl = 0.02425; let q, r, x;
  if (p < pl) { q = Math.sqrt(-2 * Math.log(p)); x = (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
  else if (p <= 1 - pl) { q = p - 0.5; r = q * q; x = (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1); }
  else { q = Math.sqrt(-2 * Math.log(1 - p)); x = -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
  const e = normCdf(x) - p, u = e * Math.sqrt(2 * Math.PI) * Math.exp(x * x / 2);
  return x - u / (1 + x * u / 2);
}
const clip = (v, a, b) => Math.min(b, Math.max(a, v));
const r4 = v => Math.round(v * 1e4) / 1e4, rN = (v, n) => { const f = 10 ** n; return Math.round(v * f) / f; };
function rocPoints(tpr, fpr, n) {
  n = n || 41; const d = normPpf(clip(tpr, 1e-4, 1 - 1e-4)) - normPpf(clip(fpr, 1e-4, 1 - 1e-4)), pts = [];
  for (let i = 0; i < n; i++) { const x = i / (n - 1); let y = normCdf(d + normPpf(clip(x, 1e-6, 1 - 1e-6))); if (i === 0) y = 0; if (i === n - 1) y = 1; pts.push({ fpr: r4(x), tpr: r4(y) }); }
  return { roc: pts, auc: normCdf(d / Math.SQRT2) };
}
/* simulated reference benchmark table (identical formula to app.py) */
const _BASE = { 'J-UNIWARD': 0.60, 'S-UNIWARD': 0.70, 'WOW': 0.74 }, _PAY = { '0.1': 0.0, '0.2': 0.08, '0.4': 0.17 };
const REFERENCE_TABLE = {};
for (const a of ALGORITHMS) for (const p of PAYLOADS) for (const d of DOMAINS) {
  const ba = r4(Math.min(0.95, Math.max(0.51, _BASE[a] + _PAY[p] - (d === 'cross' ? 0.09 : 0))));
  const fpr = r4((1 - ba) * (d === 'matched' ? 0.85 : 1.15)), tpr = r4(Math.min(0.99, 2 * ba - 1 + fpr));
  REFERENCE_TABLE[a + '|' + p + '|' + d] = { balanced_accuracy: ba, tpr, fpr };
}

/* ------------------------------------------------------------------ rendering */
const STOPS = [[0, 0, 4], [87, 16, 110], [188, 55, 84], [249, 142, 9], [252, 255, 164]];
function colormapRGB(v) { // v: Float64Array in [0,1] -> Uint8Array RGB (inferno-like, as app.py)
  const o = new Uint8Array(v.length * 3), L = STOPS.length - 1;
  for (let k = 0; k < v.length; k++) { const p = clip(v[k], 0, 1) * L; const i = Math.min(Math.floor(p), L - 1), f = p - i; for (let c = 0; c < 3; c++) o[k * 3 + c] = Math.floor(STOPS[i][c] * (1 - f) + STOPS[i + 1][c] * f); }
  return o;
}
function grayRGB(x) { const o = new Uint8Array(x.d.length * 3); for (let k = 0; k < x.d.length; k++) { const v = clip(Math.floor(x.d[k]), 0, 255); o[k * 3] = o[k * 3 + 1] = o[k * 3 + 2] = v; } return o; }
function pngDataURL(rgb, w, h) {
  if (typeof document === 'undefined') return 'data:image/png;base64,'; // headless/unit-test mode
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const ctx = cv.getContext('2d'), im = ctx.createImageData(w, h);
  for (let k = 0; k < w * h; k++) { im.data[k * 4] = rgb[k * 3]; im.data[k * 4 + 1] = rgb[k * 3 + 1]; im.data[k * 4 + 2] = rgb[k * 3 + 2]; im.data[k * 4 + 3] = 255; }
  ctx.putImageData(im, 0, 0); return cv.toDataURL('image/png');
}
function normMap(m) { const p = percentile(m, 99.5) + 1e-8; return m.map(v => v / p); }

/* ------------------------------------------------------------------ image decoding (PIL convert('L') + thumbnail(512, BILINEAR)) */
function pilResizeAxis(src, w, h, nOut, axis, b0, b1) { // PIL ImagingResample bilinear (antialiased triangle filter)
  const inSize = axis === 1 ? w : h, sc = (b1 - b0) / nOut, ss = Math.max(1, sc), support = 1 * ss;
  const ow = axis === 1 ? nOut : w, oh = axis === 1 ? h : nOut, o = new Float64Array(ow * oh);
  for (let xx = 0; xx < nOut; xx++) {
    const center = b0 + (xx + 0.5) * sc; let xmin = Math.max(0, Math.trunc(center - support + 0.5)); const xmax = Math.min(inSize, Math.trunc(center + support + 0.5));
    const ws = []; let tot = 0;
    for (let x = xmin; x < xmax; x++) { const t = Math.abs((x - center + 0.5) / ss); const wv = t < 1 ? 1 - t : 0; ws.push(wv); tot += wv; }
    if (tot) for (let i = 0; i < ws.length; i++) ws[i] /= tot;
    if (axis === 1) { for (let y = 0; y < h; y++) { let s = 0; for (let i = 0; i < ws.length; i++) s += ws[i] * src[y * w + xmin + i]; o[y * ow + xx] = clip(Math.round(s), 0, 255); } }
    else { for (let x = 0; x < w; x++) { let s = 0; for (let i = 0; i < ws.length; i++) s += ws[i] * src[(xmin + i) * w + x]; o[xx * ow + x] = clip(Math.round(s), 0, 255); } }
  }
  return o;
}
function pilReduce(src, w, h, fx, fy) {
  const ow = Math.ceil(w / fx), oh = Math.ceil(h / fy), o = new Float64Array(ow * oh);
  for (let y = 0; y < oh; y++) for (let x = 0; x < ow; x++) { let s = 0, n = 0; for (let yy = y * fy; yy < Math.min(h, (y + 1) * fy); yy++) for (let xx = x * fx; xx < Math.min(w, (x + 1) * fx); xx++) { s += src[yy * w + xx]; n++; } o[y * ow + x] = Math.round(s / n); }
  return { d: o, w: ow, h: oh };
}
function toGray(rgba, w, h) {
  let d = new Float64Array(w * h);
  for (let k = 0; k < w * h; k++) d[k] = (rgba[k * 4] * 19595 + rgba[k * 4 + 1] * 38470 + rgba[k * 4 + 2] * 7471 + 0x8000) >> 16;
  if (Math.max(w, h) > MAX_SIDE) { // PIL Image.thumbnail: keep aspect, reducing_gap=2.0, then bilinear resample
    let nw = MAX_SIDE, nh = MAX_SIDE; const asp = w / h;
    if (asp >= 1) nh = Math.max(1, Math.round(MAX_SIDE / asp)); else nw = Math.max(1, Math.round(MAX_SIDE * asp));
    let bx = w, by = h; const fx = Math.max(1, Math.floor(w / nw / 2)), fy = Math.max(1, Math.floor(h / nh / 2));
    if (fx > 1 || fy > 1) { const r = pilReduce(d, w, h, fx, fy); d = r.d; bx = w / fx; by = h / fy; w = r.w; h = r.h; }
    if (nw !== w || bx !== w) { d = pilResizeAxis(d, w, h, nw, 1, 0, bx); w = nw; }
    if (nh !== h || by !== h) { d = pilResizeAxis(d, w, h, nh, 0, 0, by); h = nh; }
  }
  return mk(w, h, d);
}
async function decodeImage(blob) {
  let bmp;
  try { bmp = await createImageBitmap(blob, { premultiplyAlpha: 'none', colorSpaceConversion: 'none' }); }
  catch (e) { throw new Error('cannot identify image file (this browser cannot decode it; use PNG/JPEG/BMP)'); }
  const cv = document.createElement('canvas'); cv.width = bmp.width; cv.height = bmp.height;
  const ctx = cv.getContext('2d'); ctx.drawImage(bmp, 0, 0);
  const id = ctx.getImageData(0, 0, bmp.width, bmp.height); if (bmp.close) bmp.close();
  return toGray(id.data, id.width, id.height);
}

/* ------------------------------------------------------------------ event log / shared state */
const STATE = { last: null, events: [], seq: 0 };
function logEvent(layer, severity, message, extra) {
  STATE.seq += 1; STATE.events.push(Object.assign({ id: STATE.seq, ts: new Date().toISOString(), layer, severity, message }, extra || {}));
  if (STATE.events.length > 200) STATE.events.shift();
}

/* ------------------------------------------------------------------ L1: AES-256-GCM via WebCrypto */
const subtle = root.crypto && root.crypto.subtle;
const hex = u8 => Array.from(u8, b => b.toString(16).padStart(2, '0')).join('');
const enc = s => new TextEncoder().encode(s);
async function aesKey() { return subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']); }
function nonce() { return root.crypto.getRandomValues(new Uint8Array(12)); }
async function aesGcmCheck() {
  if (!subtle) return { ok: false, message: 'WebCrypto unavailable (needs HTTPS or localhost) - AES-GCM check skipped' };
  const key = await aesKey(), iv = nonce();
  const pkt = enc(`TLM|robot=RX-07|ts=${(Date.now() / 1000).toFixed(3)}|rad=${(0.1 + Math.random() * 2.9).toFixed(2)}uSv/h|arm=${(-90 + Math.random() * 180).toFixed(1)},${(Math.random() * 180).toFixed(1)}`);
  const aad = enc('nuclearstegnet-v1');
  const t = now();
  const ct = new Uint8Array(await subtle.encrypt({ name: 'AES-GCM', iv, additionalData: aad }, key, pkt));
  const pt = new Uint8Array(await subtle.decrypt({ name: 'AES-GCM', iv, additionalData: aad }, key, ct));
  const ok = pt.length === pkt.length && pt.every((v, i) => v === pkt[i]);
  const tam = ct.slice(); tam[0] ^= 1; let tamper_rejected;
  try { await subtle.decrypt({ name: 'AES-GCM', iv, additionalData: aad }, key, tam); tamper_rejected = false; } catch (e) { tamper_rejected = true; }
  return { ok: ok && tamper_rejected, tag: hex(ct.slice(-16)), bytes: pkt.length, tamper_rejected, latency_us: rN((now() - t) * 1e3, 1) };
}

/* ------------------------------------------------------------------ /api/analyze */
const fail = (status, error) => { const e = new Error(error); e.status = status; return e; };
async function analyze(form) {
  const t0 = now(), tm = {};
  const f = form.image;
  if (!f || !f.name) throw fail(400, "No image uploaded (field 'image')");
  const ext = f.name.includes('.') ? f.name.split('.').pop().toLowerCase() : '';
  if (!ALLOWED_EXT.includes(ext)) throw fail(400, 'Unsupported file type; use png/jpg/bmp/tiff');
  if (f.size > MAX_BYTES) throw fail(413, 'File too large (max 25 MB)');
  const algorithm = form.algorithm || 'S-UNIWARD', payload = form.payload || '0.4', domain = form.domain || 'matched', sensor = form.sensor || 'optical';
  if (!ALGORITHMS.includes(algorithm) || !PAYLOADS.includes(payload) || !DOMAINS.includes(domain)) throw fail(400, 'Invalid algorithm/payload/domain');
  const raw = new Uint8Array(await f.arrayBuffer());
  let x; try { x = await decodeImage(f); } catch (e) { throw fail(400, 'Cannot decode image: ' + e.message); }
  tm.preprocess_ms = now() - t0;
  let t = now(); const { res } = srmResiduals(x); tm.srm_tlu_ms = now() - t;
  t = now(); const { w, z } = seAttention(res); tm.se_attention_ms = now() - t;
  t = now(); const feats = residualStats(res, w); const p = score(feats, domain); tm.scoring_ms = now() - t;
  t = now();
  let seed = raw.length >>> 0; for (let i = 0; i < 8; i++) seed = (Math.imul(seed ^ (raw[i] || 0), 2654435761) >>> 0); // first 8 bytes ^ length
  const { stego, change_rate } = simulateEmbedding(x, parseFloat(payload), algorithm, new RNG(seed));
  const q_psnr = psnr(x, stego), q_ssim = ssim(x, stego); tm.embedding_sim_ms = now() - t;
  t = now();
  const wm = weightedMap(res, w), residual_map = pngDataURL(colormapRGB(normMap(wm)), x.w, x.h);
  const ref = REFERENCE_TABLE[algorithm + '|' + payload + '|' + domain];
  const { roc, auc } = rocPoints(ref.tpr, ref.fpr); tm.render_ms = now() - t;
  tm.total_ms = now() - t0;
  const verdict = p >= 0.5 ? 'Stego' : 'Cover';
  const round = o => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, rN(v, 5)]));
  const out = {
    verdict, p_stego: r4(p), confidence: r4(verdict === 'Stego' ? p : 1 - p),
    config: { algorithm, payload_bpp: parseFloat(payload), domain, sensor, image_shape: [x.h, x.w] },
    metrics: Object.assign({}, ref, { auc: r4(auc), source: 'SIMULATED reference benchmark (not measured)' }),
    quality: { psnr_db: rN(q_psnr, 3), ssim: rN(q_ssim, 5), change_rate: rN(change_rate, 5) },
    roc, residual_map,
    se_attention: SRM_BANK.map((b, i) => ({ filter: b.name, weight: r4(w[i]), gap: r4(z[i]) })),
    features: round(feats),
    timings_ms: Object.fromEntries(Object.entries(tm).map(([k, v]) => [k, rN(v, 2)])),
    disclaimer: 'Fixed untrained weights; metrics are simulated reference values.',
  };
  STATE.last = { verdict, p_stego: out.p_stego, algorithm, payload, domain, ts: Date.now() / 1000 };
  logEvent('L3', verdict === 'Stego' && p > 0.8 ? 'CRITICAL' : (verdict === 'Stego' ? 'WARN' : 'INFO'),
    `Steganalysis verdict=${verdict} P(stego)=${p.toFixed(3)} [${algorithm} @ ${payload} bpp, ${domain}]`,
    { key: 'ev.l3verdict', params: { v: verdict, p: p.toFixed(3), alg: algorithm, pay: payload, dom: domain } });
  return out;
}

/* ------------------------------------------------------------------ /api/telemetry */
const pick = a => a[Math.floor(Math.random() * a.length)];
async function telemetry(after) {
  after = after || 0;
  const a = await aesGcmCheck();
  logEvent('L1', a.ok ? 'INFO' : 'CRITICAL',
    a.tag ? `AES-256-GCM packet ${a.bytes}B tag=${a.tag.slice(0, 12)}.. verified; tamper rejected=${a.tamper_rejected ? 'True' : 'False'} (${a.latency_us.toFixed(1)}us)` : a.message,
    { key: a.tag ? 'ev.l1' : 'ev.l1nocrypto', params: { b: a.bytes, tag: (a.tag || '').slice(0, 12), tr: a.tamper_rejected === undefined ? null : (a.tamper_rejected ? 'True' : 'False'), us: a.latency_us } });
  const lat = gauss(18, 4), temp = gauss(58, 5), an = Math.min(1, Math.abs(gauss(0.2, 0.15)));
  const sev = an > 0.7 || temp > 75 ? 'CRITICAL' : an > 0.45 || lat > 28 ? 'WARN' : 'INFO';
  logEvent('L2', sev, `Jetson Xavier edge AD: latency=${lat.toFixed(1)}ms gpu=${temp.toFixed(1)}C anomaly=${an.toFixed(3)}`,
    { key: 'ev.l2', params: { lat: lat.toFixed(1), temp: temp.toFixed(1), an: an.toFixed(3) }, latency_ms: rN(lat, 2), gpu_temp_c: rN(temp, 1), anomaly_score: rN(an, 3) });
  const last = STATE.last ? Object.assign({}, STATE.last) : null;
  if (Math.random() < 0.35) logEvent('L3', 'INFO', 'Server steganalysis idle; last verdict=' + (last ? last.verdict : 'n/a'), { key: 'ev.l3idle', params: { v: last ? last.verdict : 'n/a' } });
  const r = Math.random();
  if (r < 0.12) {
    const [k, msg] = pick([['ev.l4a', 'Operator RX-07 command cadence deviates 2.3 sigma from profile'], ['ev.l4b', 'Unusual image upload volume from telemetry node N3'], ['ev.l4c', 'Off-shift teleoperation session detected']]);
    logEvent('L4', 'WARN', msg, { key: k, params: {} });
  } else if (r < 0.15) logEvent('L4', 'CRITICAL', 'Behavioral profile: exfiltration-like pattern (large high-entropy frames)', { key: 'ev.l4crit', params: {} });
  else if (r < 0.5) { const n = 40 + Math.floor(Math.random() * 21); logEvent('L4', 'INFO', `Behavioral baseline nominal (${n} sessions profiled)`, { key: 'ev.l4ok', params: { n } }); }
  const evs = STATE.events.filter(e => e.id > after).slice(-50);
  return {
    events: evs,
    layers: {
      L1: Object.assign({ name: 'AES-256-GCM Link', status: a.ok ? 'SECURE' : 'DEGRADED' }, a),
      L2: { name: 'Edge Anomaly (Jetson Xavier)', status: { INFO: 'NOMINAL', WARN: 'ELEVATED', CRITICAL: 'ALERT' }[sev], latency_ms: rN(lat, 2), gpu_temp_c: rN(temp, 1), anomaly_score: rN(an, 3) },
      L3: { name: 'Server Steganalysis', status: last && last.verdict === 'Stego' ? 'STEGO DETECTED' : last ? 'CLEAR' : 'IDLE', last },
      L4: { name: 'Behavioral Profiling', status: r < 0.15 ? 'ALERT' : 'MONITORING' },
    },
  };
}

/* ================================================================== mission.py */
const FRAME = 128;
const ROBOT_TYPES = { ground: ['optical', 'thermal'], aerial: ['optical', 'thermal'], marine: ['sonar'] };
const PROFILES = []; for (const [r, ss] of Object.entries(ROBOT_TYPES)) for (const s of ss) PROFILES.push([r, s]);
const ZONES = { water_intake: 0.3, rooftops: 0.5, reactor_hall: 0.9, pump_room: 0.6, control: 0.2, corridor: 0.3, storage: 0.4, waste_vault: 0.8 };
const CAL = {};
const BEHAV = { times: [], bytes: [] };
const N = FRAME * FRAME;
const XS = new Float64Array(N), YS = new Float64Array(N); for (let i = 0; i < FRAME; i++) for (let j = 0; j < FRAME; j++) { XS[i * FRAME + j] = j; YS[i * FRAME + j] = i; }
function fillRect(img, x0, y0, w, h, fn) { for (let y = y0; y < Math.min(FRAME, y0 + h); y++) for (let x = x0; x < Math.min(FRAME, x0 + w); x++) img[y * FRAME + x] = fn(img[y * FRAME + x], x, y); }
function finish(img, rng) { for (let k = 0; k < N; k++) img[k] = clip(Math.round(img[k] + rng.normal(0, 1.2)), 0, 255); return mk(FRAME, FRAME, img); }

function genFrame(rng, sensor, heat) { // procedural ground/indoor scene
  sensor = sensor || 'optical'; heat = heat === undefined ? 0.5 : heat;
  const a = rng.uniform(-0.4, 0.4), b = rng.uniform(-0.4, 0.4), p = rng.uniform(6, 14), ph = rng.uniform(0, 6);
  let img = new Float64Array(N); for (let k = 0; k < N; k++) img[k] = 90 + 40 * (a * XS[k] + b * YS[k]) / FRAME + 20 * Math.sin(XS[k] / p + ph);
  for (let n = rng.integers(3, 7), i = 0; i < n; i++) { const x0 = rng.integers(0, FRAME - 20), y0 = rng.integers(0, FRAME - 20), w = rng.integers(8, 40), h = rng.integers(8, 40), v = rng.uniform(40, 200); fillRect(img, x0, y0, w, h, (_, x) => v + 6 * Math.sin(x / 2.5)); }
  for (let n = rng.integers(1, 4), i = 0; i < n; i++) { const cx = rng.uniform(0, FRAME), cy = rng.uniform(0, FRAME), r = rng.uniform(6, 25), A = 60 + 80 * heat; for (let k = 0; k < N; k++) img[k] += A * Math.exp(-((XS[k] - cx) ** 2 + (YS[k] - cy) ** 2) / (2 * r * r)); }
  if (sensor === 'thermal') img = gaussianFilter(img, FRAME, FRAME, 1.5);
  return finish(img, rng);
}
function genAerial(rng, sensor, heat) { // top-down roofs, roads, shadows
  sensor = sensor || 'optical'; heat = heat === undefined ? 0.5 : heat;
  const p1 = rng.uniform(15, 30), p2 = rng.uniform(15, 30);
  let img = new Float64Array(N); for (let k = 0; k < N; k++) img[k] = 70 + 10 * Math.sin(XS[k] / p1) * Math.cos(YS[k] / p2);
  for (let n = rng.integers(1, 3), i = 0; i < n; i++) { if (rng.random() < 0.5) { const r = rng.integers(0, FRAME - 12); fillRect(img, 0, r, FRAME, 12, () => 45); } else { const c = rng.integers(0, FRAME - 12); fillRect(img, c, 0, 12, FRAME, () => 45); } }
  for (let n = rng.integers(2, 5), i = 0; i < n; i++) {
    const x0 = rng.integers(0, FRAME - 30), y0 = rng.integers(0, FRAME - 30), w = rng.integers(16, 50), h = rng.integers(16, 50), v = rng.uniform(110, 210);
    fillRect(img, x0 + 4, y0 + 4, w, h, o => o * 0.55);
    fillRect(img, x0, y0, w, h, (_, x) => v + 5 * Math.sign(Math.sin(x / 1.7)));
    for (let m = rng.integers(0, 4), j = 0; j < m; j++) { const cx = x0 + rng.integers(0, w), cy = y0 + rng.integers(0, h); fillRect(img, cx, cy, 4, 4, () => v - 50); }
  }
  const cx = rng.uniform(0, FRAME), cy = rng.uniform(0, FRAME);
  if (sensor === 'thermal') { for (let k = 0; k < N; k++) img[k] += 90 * heat * Math.exp(-((XS[k] - cx) ** 2 + (YS[k] - cy) ** 2) / (2 * 15 * 15)); img = gaussianFilter(img, FRAME, FRAME, 1.5); }
  return finish(img, rng);
}
function genMarine(rng) { // side-scan-sonar-like (despeckled)
  const amp = rng.uniform(10, 30), per = rng.uniform(8, 20), off = rng.uniform(0, 20);
  let img = new Float64Array(N); const bed = new Float64Array(N);
  for (let k = 0; k < N; k++) { bed[k] = 30 + amp * Math.sin(YS[k] / per) + off; const x = XS[k]; img[k] = x > bed[k] ? 60 + 50 * Math.exp(-(x - bed[k]) / 90) : 12; if (x > bed[k]) img[k] += 6 * Math.sin(x / 6 + YS[k] / 11); }
  for (let n = rng.integers(1, 4), i = 0; i < n; i++) {
    const cx = rng.uniform(50, 110), cy = rng.uniform(10, 118), r = rng.uniform(3, 8);
    for (let k = 0; k < N; k++) if ((XS[k] - cx) ** 2 + (YS[k] - cy) ** 2 < r * r) img[k] = 200;
    for (let k = 0; k < N; k++) if (Math.abs(YS[k] - cy) < r && XS[k] > cx + r && XS[k] < cx + r + 25) img[k] *= 0.3;
  }
  img = gaussianFilter(img, FRAME, FRAME, 0.8);
  return finish(img, rng);
}
const GENERATORS = { ground: genFrame, aerial: genAerial, marine: genMarine };

function embedTestSample(x, rate, rng) { // labelled positive: random +/-1 in textured regions
  const tex = textureMap(x), tm = mean(tex), o = new Float64Array(x.d.length); let ch = 0;
  for (let i = 0; i < o.length; i++) {
    const p = clip(tex[i] / (tm + 1e-8) * rate, 0, 0.6), m = rng.random() < p; let s = rng.sign();
    if (x.d[i] <= 0) s = 1; if (x.d[i] >= 255) s = -1;
    if (m) ch++; o[i] = clip(x.d[i] + (m ? s : 0), 0, 255);
  }
  return { img: mk(x.w, x.h, o), change: ch / o.length };
}
const HF_IDX = [8, 9, 16, 18, 20, 22, 24]; // 2nd-H/V, SQ3x3, EDGE3 x4
const CLIP = 1.5;
function featVec(x) { // fast path: only the 7 high-order filters
  const P = padSym(x, 2);
  return HF_IDX.map(i => { const r = applyTaps(P, SRM_BANK[i].taps, x.w, x.h); let s = 0; for (let k = 0; k < r.length; k++) s += Math.min(Math.abs(r[k]), CLIP); return s / r.length; });
}
function features(x) { // full: f + TLU residuals + SE weights
  const { res, raw } = srmResiduals(x), { w } = seAttention(res);
  const f = HF_IDX.map(i => { const r = raw[i]; let s = 0; for (let k = 0; k < r.length; k++) s += Math.min(Math.abs(r[k]), CLIP); return s / r.length; });
  return { f, res, w };
}
const _key = (r, s) => r + '/' + s;
function rawScore(f, key) { const b = CAL[key]; let s = 0; for (let i = 0; i < f.length; i++) s += (f[i] - b.mu[i]) / b.sd[i]; return s / f.length; }
function prob(s, key) { const b = CAL[key]; return 1 / (1 + Math.exp(-(s - b.thr) / b.scale)); }
const meanB = a => a.length ? a.reduce((s, v) => s + (v ? 1 : 0), 0) / a.length : NaN;
const r3 = v => rN(v, 3);

function calibrate(nTrain, nTest, rate, seed) {
  nTrain = nTrain || 40; nTest = nTest || 25; rate = rate || 0.15; seed = seed || 2026;
  const rng = new RNG(seed), perKey = {}, perType = {}; for (const r in ROBOT_TYPES) perType[r] = { c: [], p: [] };
  for (const [r, s] of PROFILES) {
    const k = _key(r, s), gen = GENERATORS[r];
    const F = []; for (let i = 0; i < nTrain; i++) F.push(featVec(gen(rng, s, rng.random())));
    const nf = F[0].length, mu = [], sd = [];
    for (let j = 0; j < nf; j++) { const col = F.map(v => v[j]), med = median(col); mu.push(med); sd.push(1.4826 * median(col.map(v => Math.abs(v - med))) + 1e-6); }
    CAL[k] = { mu, sd };
    const tr = F.map(f => rawScore(f, k));
    CAL[k].thr = percentile(tr, 95);
    const mt = median(tr); CAL[k].scale = 1.4826 * median(tr.map(v => Math.abs(v - mt))) / 2 + 1e-6;
    const c = [], p = [];
    for (let i = 0; i < nTest; i++) {
      const fr = gen(rng, s, rng.random());
      c.push(rawScore(featVec(fr), k) >= CAL[k].thr);
      p.push(rawScore(featVec(embedTestSample(fr, rate, rng).img), k) >= CAL[k].thr);
    }
    perKey[k] = { tpr: r3(meanB(p)), fpr: r3(meanB(c)) };
    perType[r].c.push(...c); perType[r].p.push(...p);
  }
  const allc = [].concat(...Object.values(perType).map(v => v.c)), allp = [].concat(...Object.values(perType).map(v => v.p));
  CAL.metrics = {
    tpr: r3(meanB(allp)), fpr: r3(meanB(allc)),
    per_type: Object.fromEntries(Object.entries(perType).map(([r, v]) => [r, { tpr: r3(meanB(v.p)), fpr: r3(meanB(v.c)), n_pos: v.p.length, n_clean: v.c.length }])),
    per_profile: perKey, n_baseline_clean_per_profile: nTrain, test_rate: rate,
    source: 'measured on simulated frames (not real-world performance)',
  };
}

function edgeAnomaly(x) {
  const gx = sobel(x.d, x.w, x.h, 1), gy = sobel(x.d, x.w, x.h, 0), n = x.d.length, g = new Float64Array(n);
  for (let i = 0; i < n; i++) g[i] = Math.hypot(gx[i], gy[i]);
  const hf = conv2symm(x, SQ3_TAPS), p40 = percentile(g, 40);
  let s = 0, c = 0, e = 0; for (let i = 0; i < n; i++) { if (g[i] < p40) { s += Math.abs(hf[i]); c++; } if (g[i] > 60) e++; }
  const sc = c ? clip(s / c / 1.5, 0, 1) : NaN;
  return { ok: sc < 0.7, score: r3(sc), edge_density: r3(e / n) };
}
function behaviour(nbytes) {
  const t = Date.now() / 1000;
  BEHAV.times.push(t); BEHAV.bytes.push(nbytes); if (BEHAV.times.length > 50) BEHAV.times.shift(); if (BEHAV.bytes.length > 50) BEHAV.bytes.shift();
  const recent = BEHAV.times.filter(v => t - v < 10), b = BEHAV.bytes;
  const rate = recent.length / 10, mu = mean(b), sd = std(b, mu) + 1;
  const z = b.length > 5 ? (nbytes - mu) / sd : 0;
  return { ok: rate <= 2.0 && Math.abs(z) < 3, frames_per_s: rN(rate, 2), size_z: rN(z, 2), bytes: nbytes };
}
function colorize(x, sensor) {
  if (sensor === 'sonar') { const o = new Uint8Array(x.d.length * 3); for (let k = 0; k < x.d.length; k++) { const v = x.d[k] / 255; o[k * 3] = Math.floor(v ** 0.8 * 255); o[k * 3 + 1] = Math.floor(v ** 1.1 * 190); o[k * 3 + 2] = Math.floor(v ** 2 * 60); } return o; }
  return sensor === 'thermal' ? colormapRGB(x.d.map(v => v / 255)) : grayRGB(x);
}

/* sanitizer ("detect and clear"): Wiener smoothing restricted to textured regions + re-quantisation */
const ALPHAS = [0.8, 1.0], LSB_MIN = 0.45;
const FRAMES = new Map();
function textureMask(x) { const tex = textureMap(x), p = percentile(tex, 30), m = new Uint8Array(tex.length); for (let i = 0; i < m.length; i++) m[i] = tex[i] >= p ? 1 : 0; return binaryDilationCross(m, x.w, x.h); }
function lsbDisruption(x, y, mask) { mask = mask || textureMask(x); let n = 0, d = 0; for (let i = 0; i < mask.length; i++) if (mask[i]) { n++; if ((x.d[i] & 1) !== (y.d[i] & 1)) d++; } return n ? d / n : NaN; }
function sanitize(x, flagged, fallback) {
  if (fallback === undefined) fallback = true;
  const w = wiener3(x), mask = textureMask(x); let y = x, ber = 0;
  for (const a of ALPHAS) {
    const o = new Float64Array(x.d.length); for (let i = 0; i < o.length; i++) o[i] = clip(Math.round(x.d[i] + a * (w[i] - x.d[i]) * mask[i]), 0, 255);
    y = mk(x.w, x.h, o); ber = lsbDisruption(x, y, mask);
    if (!flagged(y) && ber >= LSB_MIN) return { y, a, ok: true, ber };
  }
  if (!fallback) return { y, a: ALPHAS[ALPHAS.length - 1], ok: !flagged(y) && ber >= LSB_MIN, ber };
  y = mk(x.w, x.h, medianFilter3(w, x.w, x.h).map(v => clip(Math.round(v), 0, 255)));
  ber = lsbDisruption(x, y, mask);
  return { y, a: 1.5, ok: !flagged(y) && ber >= LSB_MIN, ber };
}
const missionFlagged = key => img => rawScore(featVec(img), key) >= CAL[key].thr;
const avg = a => a.length ? mean(a) : null;

function measureClear(n, rate, seed) {
  n = n || 20; rate = rate || 0.15; seed = seed || 77;
  const rng = new RNG(seed), per = {};
  for (const r in ROBOT_TYPES) per[r] = { det: 0, ok: 0, psnr: [], ssim: [], alt: [], ber: [], pc: [], fp_psnr: [], fp_ssim: [], alphas: [] };
  for (const [r, s] of PROFILES) {
    const k = _key(r, s), gen = GENERATORS[r], fl = missionFlagged(k);
    for (let i = 0; i < n; i++) {
      const cover = gen(rng, s, rng.random()), st = embedTestSample(cover, rate, rng).img;
      if (fl(st)) {
        const { y, a, ok, ber } = sanitize(st, fl), P = per[r];
        P.det++; P.ok += ok ? 1 : 0; P.alphas.push(a); P.ber.push(ber); P.pc.push(psnr(cover, y)); P.psnr.push(psnr(st, y)); P.ssim.push(ssim(st, y));
        let nc = 0, na = 0; for (let q = 0; q < st.d.length; q++) if (st.d[q] !== cover.d[q]) { nc++; if (y.d[q] !== st.d[q]) na++; }
        P.alt.push(nc ? na / nc : 0);
      }
      const yc = sanitize(cover, () => false).y;
      per[r].fp_psnr.push(psnr(cover, yc)); per[r].fp_ssim.push(ssim(cover, yc));
    }
  }
  const out = {};
  for (const [r, P] of Object.entries(per)) {
    const m = (a, d) => a.length ? rN(mean(a), d) : null;
    out[r] = { clear_success: r3(P.ok / Math.max(1, P.det)), n_detected: P.det, psnr_db: m(P.psnr, 2), ssim: m(P.ssim, 4), payload_pixels_altered: m(P.alt, 3),
      lsb_ber_textured: m(P.ber, 3), psnr_vs_cover_db: m(P.pc, 2), clean_frame_psnr_db: m(P.fp_psnr, 2), clean_frame_ssim: m(P.fp_ssim, 4) };
  }
  const totD = Object.values(out).reduce((s, v) => s + v.n_detected, 0);
  CAL.clear = { per_type: out, test_rate: rate, overall_clear_success: r3(Object.values(out).reduce((s, v) => s + v.clear_success * v.n_detected, 0) / Math.max(1, totD)),
    source: 'measured on simulated frames (not real-world performance)' };
}

let _calPromise = null;
function ensureCalibrated() { // equivalent of register_mission() start-up calibration (deterministic seeds)
  if (!_calPromise) {
    const pre = (typeof globalThis !== 'undefined' && globalThis.NSN_CAL_PRECOMPUTED) || null;
    if (pre) { Object.assign(CAL, JSON.parse(JSON.stringify(pre))); _calPromise = Promise.resolve(CAL); } // same deterministic run, done at build time (like Flask start-up)
    else _calPromise = new Promise(res => setTimeout(() => { const t = now(); calibrate(); measureClear(); CAL.elapsed_ms = rN(now() - t, 1); res(CAL); }, 0));
  }
  return _calPromise;
}

async function runLayers(x, key, sensor, robot, zone, stage) {
  stage = stage || 'scan'; const tm = {}, t0 = now();
  const raw = Uint8Array.from(x.d, v => clip(Math.trunc(v), 0, 255));
  let t = now(); const L1 = await aesGcmCheck();
  let rt = raw;
  if (subtle) {
    const key2 = await aesKey(), iv = nonce(), aad = enc('frame');
    const ct = new Uint8Array(await subtle.encrypt({ name: 'AES-GCM', iv, additionalData: aad }, key2, raw));
    rt = new Uint8Array(await subtle.decrypt({ name: 'AES-GCM', iv, additionalData: aad }, key2, ct));
    L1.frame_roundtrip_ok = rt.length === raw.length && rt.every((v, i) => v === raw[i]); L1.frame_tag = hex(ct.slice(-16)).slice(0, 16); L1.ct_len = ct.length;
  } else { L1.frame_roundtrip_ok = false; L1.frame_tag = 'n/a'; L1.ct_len = raw.length + 16; }
  L1.ok = L1.ok && L1.frame_roundtrip_ok; const ctLen = L1.ct_len; delete L1.ct_len; tm.L1_aes_ms = now() - t;
  x = mk(x.w, x.h, Float64Array.from(rt));
  t = now(); const L2 = edgeAnomaly(x); tm.L2_edge_ms = now() - t;
  t = now(); const { f, res, w } = features(x); const s = rawScore(f, key), p = prob(s, key);
  const L3 = { ok: s < CAL[key].thr, score: r3(s), threshold: r3(CAL[key].thr), p: r4(p) }; tm.L3_srm_ms = now() - t;
  t = now(); const L4 = behaviour(ctLen); tm.L4_behaviour_ms = now() - t;
  const m = normMap(weightedMap(res, w));
  const detected = !L3.ok, verdict = detected ? 'TEST SAMPLE DETECTED' : 'CLEAN';
  tm.layers_ms = now() - t0;
  logEvent('L3', detected ? 'CRITICAL' : 'INFO', `Mission frame ${robot} @${zone} (${sensor}) [${stage}]: ${verdict} score=${s.toFixed(2)}`,
    { key: stage === 'scan' ? 'ev.mframe' : 'ev.mrescan', params: { robot, zone, sensor, v: verdict, s: s.toFixed(2) } });
  return { x, out: { frame: pngDataURL(colorize(x, sensor), x.w, x.h), residual_map: pngDataURL(colormapRGB(m), x.w, x.h), verdict, detected,
    confidence: r4(detected ? p : 1 - p), p: r4(p), layers: { L1, L2, L3, L4 } }, tm };
}
async function clearFrame(fid) {
  const rec = FRAMES.get(fid); if (!rec) return null;
  const t0 = now(), x = rec.x, key = rec.key;
  const { y, a, ok, ber } = sanitize(x, missionFlagged(key)); const tS = now() - t0;
  const { out: after, tm } = await runLayers(y, key, rec.sensor, rec.robot, rec.zone, 'after-clear');
  const ch = rec.changed, ps = psnr(x, y);
  logEvent('L3', !after.detected ? 'INFO' : 'CRITICAL', `Sanitizer: frame ${fid} cleared=${!after.detected ? 'True' : 'False'} strength=${a.toFixed(2)} PSNR=${ps.toFixed(1)}dB`,
    { key: 'ev.sanitize', params: { id: fid, ok: !after.detected ? 'True' : 'False', a: a.toFixed(2), psnr: ps.toFixed(1) } });
  rec.cleared = true;
  let alt = null; if (ch) { let nc = 0, na = 0; for (let i = 0; i < ch.length; i++) if (ch[i]) { nc++; if (y.d[i] !== x.d[i]) na++; } alt = nc ? r3(na / nc) : null; }
  return { frame_id: fid, cleared: !!(ok && !after.detected), strength: a, lsb_ber: r3(ber), psnr_db: rN(ps, 2), ssim: r4(ssim(x, y)), payload_pixels_altered: alt,
    after, latency_ms: Object.assign({ sanitize_ms: rN(tS, 2) }, Object.fromEntries(Object.entries(tm).map(([k, v]) => [k, rN(v, 2)]))) };
}
const uid = () => hex(root.crypto.getRandomValues(new Uint8Array(6)));
async function robotFrame(d) {
  await ensureCalibrated();
  const t0 = now(), tm = {}; d = d || {};
  const px = Number(d.x || 0), py = Number(d.y || 0), payload = Number(d.payload === undefined ? 0.15 : d.payload);
  if (!Number.isFinite(px) || !Number.isFinite(py) || !Number.isFinite(payload)) throw fail(400, 'x, y, payload must be numbers');
  const robot = d.robot_type || 'ground'; if (!ROBOT_TYPES[robot]) throw fail(400, 'robot_type must be ground|aerial|marine');
  let sensor = d.sensor || ROBOT_TYPES[robot][0]; if (robot === 'marine') sensor = 'sonar';
  const zone = String(d.zone || 'corridor').slice(0, 40), test = !!d.test_sample, autoClear = !!d.auto_clear;
  if (!ROBOT_TYPES[robot].includes(sensor) || !(payload > 0 && payload <= 0.5)) throw fail(400, 'sensor must be optical|thermal (marine: sonar), payload in (0,0.5]');
  const key = _key(robot, sensor), rng = new RNG();
  let x = GENERATORS[robot](rng, sensor, ZONES[zone] !== undefined ? ZONES[zone] : 0.3), change = 0, changed = null;
  if (test) { const cover = x, e = embedTestSample(x, payload, rng); x = e.img; change = e.change; changed = x.d.map((v, i) => v !== cover.d[i] ? 1 : 0); }
  tm.generate_ms = now() - t0;
  const L = await runLayers(x, key, sensor, robot, zone); x = L.x; Object.assign(tm, L.tm);
  const fid = uid();
  FRAMES.set(fid, { x, key, sensor, robot, zone, changed }); while (FRAMES.size > 200) FRAMES.delete(FRAMES.keys().next().value);
  const clear = autoClear && L.out.detected ? await clearFrame(fid) : null;
  tm.total_ms = now() - t0;
  return Object.assign({}, L.out, { frame_id: fid, clear, label: { test_sample: test, change_rate: r4(change) },
    position: { x: px, y: py, zone, sensor, robot_type: robot }, latency_ms: Object.fromEntries(Object.entries(tm).map(([k, v]) => [k, rN(v, 2)])) });
}
async function decodeUploadField(v) {
  if (v && typeof v === 'object' && typeof v.arrayBuffer === 'function') return decodeImage(v);
  if (typeof v === 'string' && v) { const b64 = v.slice(0, 100).includes(',') ? v.split(',', 2)[1] : v; const bin = atob(b64), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return decodeImage(new Blob([u])); }
  throw new Error('no image');
}
function analyzeDetector(domain) { return img => { const { res } = srmResiduals(img), { w } = seAttention(res); return { p: score(residualStats(res, w), domain), res, w }; }; }
async function apiSanitize(d) {
  d = d || {};
  if (d.frame_id) {
    await ensureCalibrated();
    const rec = FRAMES.get(d.frame_id); if (!rec) throw fail(404, 'unknown or expired frame_id');
    const { out: before } = await runLayers(rec.x, rec.key, rec.sensor, rec.robot, rec.zone, 'before-clear');
    const r = await clearFrame(d.frame_id);
    return Object.assign({ mode: 'mission', detector: 'calibrated SRM (' + rec.key + ')', before }, r);
  }
  let x; try { x = await decodeUploadField(d.image); } catch (e) { throw fail(400, 'Cannot decode image: ' + e.message); }
  const t0 = now(), profile = d.profile, domain = d.domain || 'matched';
  if (!DOMAINS.includes(domain)) throw fail(400, 'domain must be matched|cross');
  const resmap = img => { const { res } = srmResiduals(img), { w } = seAttention(res); return pngDataURL(colormapRGB(normMap(weightedMap(res, w))), img.w, img.h); };
  let sc, fl, thr, name, verdict;
  if (profile) {
    await ensureCalibrated();
    if (!CAL[profile] || !profile.includes('/')) throw fail(400, 'profile must be one of ' + JSON.stringify(PROFILES.map(p => _key(...p))));
    fl = missionFlagged(profile); sc = img => rawScore(featVec(img), profile); thr = CAL[profile].thr; name = `calibrated SRM (${profile})`;
    verdict = v => v >= thr ? 'Stego' : 'Cover';
  } else {
    const pd = analyzeDetector(domain); sc = img => pd(img).p; fl = img => sc(img) >= 0.5; thr = 0.5;
    name = `uncalibrated SRM+SE head (fixed weights, domain=${domain})`; verdict = v => v >= 0.5 ? 'Stego' : 'Cover';
  }
  const s0 = sc(x); let y, a, ok, ber;
  if (s0 < thr) { y = x; a = 0; ok = true; ber = 0; } else ({ y, a, ok, ber } = sanitize(x, fl, false));
  const s1 = sc(y), ps = psnr(x, y);
  logEvent('L3', s1 < thr ? 'INFO' : 'WARN', `Sanitizer (upload): ${verdict(s0)} -> ${verdict(s1)}, strength=${a.toFixed(2)}, PSNR=${Number.isFinite(ps) ? ps.toFixed(1) : 'inf'}dB`,
    { key: 'ev.sanitizeUp', params: { v0: verdict(s0), v1: verdict(s1), a: a.toFixed(2), psnr: Number.isFinite(ps) ? ps.toFixed(1) : 'inf' } });
  return { mode: 'upload', detector: name, threshold: r4(thr),
    before: { score: r4(s0), verdict: verdict(s0), residual_map: resmap(x) }, after: { score: r4(s1), verdict: verdict(s1), residual_map: resmap(y) },
    cleared: !!(s1 < thr && (a === 0 || ber >= LSB_MIN)), changed: a > 0, strength: a, lsb_ber: r3(ber),
    psnr_db: a > 0 ? rN(ps, 2) : null, ssim: r4(ssim(x, y)), original: pngDataURL(grayRGB(x), x.w, x.h), cleaned: pngDataURL(grayRGB(y), y.w, y.h),
    latency_ms: rN(now() - t0, 2) };
}
async function calibration() { await ensureCalibrated(); return Object.assign({}, CAL.metrics, { clear: CAL.clear }); }

/* ------------------------------------------------------------------ fetch() replacement
 * The pages call NSN.fetch('/api/...') exactly where the Flask build called fetch('/api/...');
 * this routes to the functions above and returns a Response-like object {ok, status, json()}. */
function formToObj(body) {
  if (!body) return {};
  if (typeof FormData !== 'undefined' && body instanceof FormData) { const o = {}; for (const [k, v] of body.entries()) o[k] = v; return o; }
  if (typeof body === 'string') { try { return JSON.parse(body); } catch (e) { return {}; } }
  return body;
}
const yieldUI = () => new Promise(r => { // like a network round-trip: never resolve before the page finished parsing (i18n apply runs on DOMContentLoaded)
  if (typeof document !== 'undefined' && document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(r, 0), { once: true });
  else setTimeout(r, 0);
});
async function apiFetch(url, opts) {
  opts = opts || {}; const u = new URL(url, 'http://local/'), body = formToObj(opts.body), method = (opts.method || 'GET').toUpperCase();
  let data, status = 200;
  try {
    await yieldUI();
    switch (u.pathname) {
      case '/api/analyze': if (method !== 'POST') throw fail(405, 'Method Not Allowed'); data = await analyze(body); break;
      case '/api/telemetry': data = await telemetry(parseInt(u.searchParams.get('after') || '0', 10) || 0); break;
      case '/api/sanitize': if (method !== 'POST') throw fail(405, 'Method Not Allowed'); data = await apiSanitize(body); break;
      case '/api/robot/frame': if (method !== 'POST') throw fail(405, 'Method Not Allowed'); data = await robotFrame(body); break;
      case '/api/robot/calibration': data = await calibration(); break;
      default: throw fail(404, 'Not Found');
    }
  } catch (e) { status = e.status || 500; data = { error: e.message || String(e) }; if (!e.status && root.console) console.error(e); }
  return { ok: status >= 200 && status < 300, status, json: async () => data };
}

const API = { fetch: apiFetch, analyze, telemetry, sanitize: apiSanitize, robotFrame, calibration, ensureCalibrated,
  _internal: { RNG, SRM_BANK, REFERENCE_TABLE, CAL, srmResiduals, seAttention, residualStats, score, textureMap, simulateEmbedding, psnr, ssim, rocPoints,
    normCdf, normPpf, gaussianFilter, uniformFilter, medianFilter3, wiener3, sobel, conv2symm, toGray, mk, GENERATORS, embedTestSample, featVec, features,
    calibrate, measureClear, sanitizeImg: sanitize, edgeAnomaly, textureMask, missionFlagged, rawScore, percentile } };
root.NSN = API;
if (typeof module !== 'undefined' && module.exports) module.exports = API;
})(typeof window !== 'undefined' ? window : globalThis);
