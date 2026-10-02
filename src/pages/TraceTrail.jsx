import React, { useRef, useState, useEffect, useCallback } from 'react';
import PageHeader from '../components/PageHeader';
import PrimaryButton from '../components/PrimaryButton';
import Butterfly from '../components/Butterfly';
import './TraceTrail.css';

const ACTIVITIES = ['letter', 'path'];

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED LETTER GUIDE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════
//
// All coordinates are normalised [0, 1] fractions of canvas width / height.
//
// Each letter entry has:
//   segments – Named polylines whose concatenation forms the letter strokes.
//              These EXACT same paths drive both:
//                • the visible dashed guide drawn on the canvas, AND
//                • the validation geometry (checkpoint coverage + on-path check).
//              There is no separate "validation checkpoint" list — one source of
//              truth means the child always traces exactly what is validated.
//
//   anchors  – A small set of spatially-unique key positions.
//              ALL anchors must be reached by the drawn stroke to accept it.
//              They are chosen to maximally discriminate this letter from the
//              other letters likely to appear on the same canvas (e.g. A's
//              bottom-right foot is far outside B's stroke area).
//
// ═══════════════════════════════════════════════════════════════════════════════
const LETTER_DEFS = {

  A: {
    segments: [
      // Left diagonal: apex → bottom-left foot
      {
        id: 'left',
        points: [[0.50,0.11],[0.43,0.29],[0.36,0.48],[0.28,0.68],[0.19,0.87]],
      },
      // Right diagonal: apex → bottom-right foot
      {
        id: 'right',
        points: [[0.50,0.11],[0.57,0.29],[0.64,0.48],[0.72,0.68],[0.81,0.87]],
      },
      // Horizontal crossbar
      {
        id: 'bar',
        points: [[0.30,0.55],[0.42,0.55],[0.50,0.55],[0.58,0.55],[0.70,0.55]],
      },
    ],
    // Critical discriminating anchors for A:
    //  • Apex (top-centre)          – neither B nor a circle goes here at (0.50, 0.11)
    //  • Left foot (bottom-left)    – B's vertical barely reaches here
    //  • Right foot (bottom-right)  – B never reaches x≈0.81 at y≈0.87
    //  • Crossbar centre            – a circle never crosses (0.50, 0.55)
    anchors: [
      [0.50, 0.11],
      [0.19, 0.87],
      [0.81, 0.87],
      [0.50, 0.55],
    ],
  },

  B: {
    segments: [
      // Left vertical spine
      {
        id: 'vert',
        points: [[0.27,0.12],[0.27,0.30],[0.27,0.50],[0.27,0.70],[0.27,0.88]],
      },
      // Upper bowl (closes at waist)
      {
        id: 'upper',
        points: [[0.27,0.12],[0.47,0.12],[0.62,0.21],[0.65,0.33],[0.55,0.43],[0.27,0.50]],
      },
      // Lower bowl (closes at bottom)
      {
        id: 'lower',
        points: [[0.27,0.50],[0.51,0.51],[0.67,0.63],[0.68,0.75],[0.54,0.84],[0.27,0.88]],
      },
    ],
    anchors: [
      [0.27, 0.12],
      [0.27, 0.88],
      [0.27, 0.50],
      [0.63, 0.27],
      [0.65, 0.68],
    ],
  },

  C: {
    segments: [
      // Open arc from top-right, around the left, to bottom-right
      {
        id: 'arc',
        points: [
          [0.72,0.24],[0.62,0.13],[0.50,0.11],[0.36,0.15],
          [0.23,0.28],[0.19,0.50],[0.23,0.72],[0.36,0.85],
          [0.50,0.89],[0.62,0.87],[0.72,0.76],
        ],
      },
    ],
    anchors: [
      [0.50, 0.11],
      [0.19, 0.50],
      [0.50, 0.89],
      [0.72, 0.24],
      [0.72, 0.76],
    ],
  },

  D: {
    segments: [
      // Left vertical spine
      {
        id: 'vert',
        points: [[0.27,0.12],[0.27,0.30],[0.27,0.50],[0.27,0.70],[0.27,0.88]],
      },
      // Right curve
      {
        id: 'curve',
        points: [
          [0.27,0.12],[0.47,0.12],[0.63,0.22],[0.70,0.36],
          [0.72,0.50],[0.70,0.64],[0.63,0.78],[0.47,0.88],[0.27,0.88],
        ],
      },
    ],
    anchors: [
      [0.27, 0.12],
      [0.27, 0.88],
      [0.72, 0.50],
      [0.27, 0.50],
    ],
  },

  E: {
    segments: [
      // Left vertical spine
      {
        id: 'vert',
        points: [[0.27,0.12],[0.27,0.35],[0.27,0.50],[0.27,0.65],[0.27,0.88]],
      },
      // Top bar
      { id: 'top',    points: [[0.27,0.12],[0.45,0.12],[0.63,0.12],[0.72,0.12]] },
      // Middle bar
      { id: 'mid',    points: [[0.27,0.50],[0.40,0.50],[0.58,0.50]] },
      // Bottom bar
      { id: 'bottom', points: [[0.27,0.88],[0.45,0.88],[0.63,0.88],[0.72,0.88]] },
    ],
    anchors: [
      [0.27, 0.12],
      [0.27, 0.88],
      [0.65, 0.12],
      [0.65, 0.88],
      [0.50, 0.50],
    ],
  },

  F: {
    segments: [
      // Left vertical spine
      {
        id: 'vert',
        points: [[0.27,0.12],[0.27,0.35],[0.27,0.50],[0.27,0.65],[0.27,0.88]],
      },
      // Top bar
      { id: 'top', points: [[0.27,0.12],[0.45,0.12],[0.63,0.12],[0.72,0.12]] },
      // Middle bar
      { id: 'mid', points: [[0.27,0.50],[0.40,0.50],[0.58,0.50]] },
    ],
    anchors: [
      [0.27, 0.12],
      [0.27, 0.88],
      [0.65, 0.12],
      [0.50, 0.50],
    ],
  },
};

// ── Validation thresholds ─────────────────────────────────────────────────────
// All kept generous — users are nursery / Grade-1 / Grade-2 children.
const COVERAGE_TOL  = 0.12;  // checkpoint hit radius: 12 % of min(w,h)
const ANCHOR_TOL    = 0.12;  // anchor hit radius:     12 % of min(w,h)
const ON_PATH_TOL   = 0.15;  // on-path corridor:      15 % of min(w,h) (half-width)
const SEG_MIN_COV   = 0.40;  // each segment needs ≥ 40 % of its points hit
const ON_PATH_RATIO = 0.58;  // ≥ 58 % of sampled drawn points must be inside corridor
const MIN_STROKE_PX = 60;    // minimum cumulative drawn length in CSS pixels

// ── Debug flag ────────────────────────────────────────────────────────────────
// Set to true during development to visualise the guide geometry on canvas.
// MUST remain false in the production UI.
const TRACE_DEBUG = false;

// ── Distance helpers ──────────────────────────────────────────────────────────

/** Shortest distance (in px) from point P to line segment A→B. */
function distToSeg(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - ax, py - ay);
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lenSq));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

/**
 * Shortest distance from point P to the nearest SEGMENT of a polyline.
 * Using segment distance (not point-to-point) gives a proper continuous
 * corridor along the guide path, so a child tracing between guide points
 * is correctly counted as "on path".
 */
function distToPolyline(px, py, pts) {
  if (pts.length === 1) return Math.hypot(px - pts[0][0], py - pts[0][1]);
  let best = Infinity;
  for (let i = 0; i < pts.length - 1; i++) {
    const d = distToSeg(px, py, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]);
    if (d < best) best = d;
  }
  return best;
}

// ── Guide rendering ───────────────────────────────────────────────────────────

/**
 * Render the visual dashed guide for `letter` onto `canvas`.
 * Uses LETTER_DEFS as the single source of truth — the same geometry
 * that validateLetter() will check against.
 */
function renderGuide(canvas, letter) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const def = LETTER_DEFS[letter.toUpperCase()];
  if (!def) return;

  const minDim = Math.min(W, H);

  // Draw each segment: wide ghost corridor + dashed centre line
  for (const seg of def.segments) {
    const pts = seg.points.map(([nx, ny]) => [nx * W, ny * H]);

    // ① Wide semi-transparent corridor — gives the child a generous target band
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.strokeStyle = 'rgba(169, 154, 238, 0.13)';
    ctx.lineWidth   = minDim * 0.22;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
    ctx.setLineDash([]);
    ctx.stroke();
    ctx.restore();

    // ② Dashed centre line — shows the exact guide path to follow
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.strokeStyle = 'rgba(169, 154, 238, 0.58)';
    ctx.lineWidth   = 3.5;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
    ctx.setLineDash([10, 10]);
    ctx.stroke();
    ctx.restore();
  }

  // ── Debug overlay (TRACE_DEBUG = false in production) ──────────────────────
  if (TRACE_DEBUG) {
    // Green tint: on-path corridor at ON_PATH_TOL half-width
    for (const seg of def.segments) {
      const pts = seg.points.map(([nx, ny]) => [nx * W, ny * H]);
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.strokeStyle = 'rgba(60, 200, 80, 0.18)';
      ctx.lineWidth   = minDim * ON_PATH_TOL * 2;
      ctx.lineCap     = 'round';
      ctx.lineJoin    = 'round';
      ctx.setLineDash([]);
      ctx.stroke();
      ctx.restore();

      // Blue dots: segment guide points
      for (const [nx, ny] of seg.points) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(nx * W, ny * H, 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(60, 100, 255, 0.70)';
        ctx.fill();
        ctx.restore();
      }
    }

    // Red dots + tolerance circles: anchor points
    for (const [nx, ny] of def.anchors) {
      const ax = nx * W;
      const ay = ny * H;
      ctx.save();
      ctx.beginPath();
      ctx.arc(ax, ay, 7, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(220, 40, 40, 0.85)';
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.arc(ax, ay, minDim * ANCHOR_TOL, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(220, 40, 40, 0.25)';
      ctx.lineWidth   = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }
  }
}

// ── Letter validation ─────────────────────────────────────────────────────────

/**
 * Returns true when `points` constitutes a reasonable tracing of `letter`.
 *
 * FOUR sequential gates — all must pass:
 *
 *  1. MINIMUM STROKE  – rejects taps and tiny scribbles.
 *
 *  2. PER-SEGMENT COVERAGE  – every structural stroke of the letter must be
 *     visited (≥ SEG_MIN_COV of each segment's guide points hit within
 *     COVERAGE_TOL).  A drawing that skips one whole stroke fails here.
 *
 *  3. CRITICAL ANCHOR CHECK  – ALL of the letter's spatially-unique anchor
 *     positions must be hit within ANCHOR_TOL.  Anchors are chosen so that
 *     common wrong letters cannot reach them all.  In particular, A's
 *     bottom-right foot (x≈0.81, y≈0.87) is unreachable by B, C, or circles.
 *
 *  4. ON-PATH ACCURACY  – uses SEGMENT DISTANCE (not point-to-point), giving
 *     a proper continuous corridor along each guide stroke.  At least
 *     ON_PATH_RATIO of the sub-sampled drawn points must lie within ON_PATH_TOL
 *     of the nearest guide segment.  This rejects random canvas-wide scribbles
 *     that accidentally clip enough guide points to pass gates 2–3.
 *
 * Tolerances are set generously throughout so natural child imperfection passes.
 */
function validateLetter(canvas, points, totalLength, letter) {
  const { width: W, height: H } = canvas;
  const minDim = Math.min(W, H);

  // Gate 1 — minimum meaningful stroke
  if (points.length < 5 || totalLength < MIN_STROKE_PX) return false;

  const def = LETTER_DEFS[letter.toUpperCase()];
  if (!def) return true; // unknown letter — be lenient

  const coverTol  = minDim * COVERAGE_TOL;
  const anchorTol = minDim * ANCHOR_TOL;
  const pathTol   = minDim * ON_PATH_TOL;

  // Precompute guide geometry in absolute canvas pixels
  const absSeg = def.segments.map(seg => ({
    id:  seg.id,
    abs: seg.points.map(([nx, ny]) => [nx * W, ny * H]),
  }));
  const absAnchors = def.anchors.map(([nx, ny]) => [nx * W, ny * H]);

  // Gate 2 — per-segment coverage
  for (const seg of absSeg) {
    let hit = 0;
    for (const [gx, gy] of seg.abs) {
      if (points.some(([px, py]) => Math.hypot(px - gx, py - gy) <= coverTol)) hit++;
    }
    if (hit / seg.abs.length < SEG_MIN_COV) return false;
  }

  // Gate 3 — critical anchor check (ALL anchors must be hit)
  for (const [ax, ay] of absAnchors) {
    if (!points.some(([px, py]) => Math.hypot(px - ax, py - ay) <= anchorTol)) return false;
  }

  // Gate 4 — on-path accuracy via segment distance
  // Sub-sample up to 150 points evenly so long straight strokes don't dominate
  const MAX_SAMPLE = 150;
  const stride  = points.length <= MAX_SAMPLE ? 1 : Math.floor(points.length / MAX_SAMPLE);
  const sample  = points.filter((_, i) => i % stride === 0);

  let onPath = 0;
  for (const [px, py] of sample) {
    let nearest = Infinity;
    for (const seg of absSeg) {
      const d = distToPolyline(px, py, seg.abs);
      if (d < nearest) nearest = d;
    }
    if (nearest <= pathTol) onPath++;
  }

  return onPath / sample.length >= ON_PATH_RATIO;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TraceTrail root
// ═══════════════════════════════════════════════════════════════════════════════
export default function TraceTrail({ data, onComplete, onHome }) {
  const [activityIndex, setActivityIndex] = useState(0);
  const activity = ACTIVITIES[activityIndex];

  const handleNextActivity = () => {
    if (activityIndex < ACTIVITIES.length - 1) {
      setActivityIndex(i => i + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="tt-page page">
      <PageHeader
        onHome={onHome}
        title="Trace Trail"
        rightSlot={
          <span className="tt-progress">
            {activityIndex + 1} / {ACTIVITIES.length}
          </span>
        }
      />

      <main className="tt-main container">
        {activity === 'letter' && (
          <LetterTracing letters={data.letters} onDone={handleNextActivity} />
        )}
        {activity === 'path' && (
          <ButterflyPath onDone={handleNextActivity} isLast />
        )}
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LetterTracing
// ═══════════════════════════════════════════════════════════════════════════════
function LetterTracing({ letters, onDone }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedback, setFeedback]         = useState(null); // null | 'pass' | 'fail'
  const canvasRef = useRef(null);

  // Drawing state kept in refs — no re-render during active draw
  const isDrawing = useRef(false);
  const lastPos   = useRef({ x: 0, y: 0 });
  const strokePts = useRef([]);   // [[x, y], …] in canvas pixels
  const totalLen  = useRef(0);    // cumulative stroke length in px

  const currentItem = letters[currentIndex];
  const isLast      = currentIndex === letters.length - 1;

  // ── Full reset of all drawing state ─────────────────────────────────────────
  const resetDrawing = useCallback(() => {
    isDrawing.current = false;
    lastPos.current   = { x: 0, y: 0 };
    strokePts.current = [];
    totalLen.current  = 0;
    setFeedback(null);
  }, []);

  // ── Clear button: redraw guide and reset stroke data ────────────────────────
  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    renderGuide(canvas, currentItem);
    resetDrawing();
  }, [currentItem, resetDrawing]);

  // ── Canvas resize: re-render guide and reset on every dimension change ───────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;

    const resize = () => {
      const rect    = parent.getBoundingClientRect();
      canvas.width  = rect.width;
      canvas.height = rect.height;
      renderGuide(canvas, currentItem);
      resetDrawing();
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [currentItem, resetDrawing]);

  // ── Pointer position helper ──────────────────────────────────────────────────
  // Uses Pointer Events API (works for mouse, touch, stylus).
  // Converts clientX/Y → canvas-pixel coordinates consistently with the
  // canvas.width / canvas.height set in the resize handler above.
  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect   = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width  / rect.width),
      y: (e.clientY - rect.top)  * (canvas.height / rect.height),
    };
  };

  // ── Pointer events ───────────────────────────────────────────────────────────
  const onPointerDown = useCallback((e) => {
    e.preventDefault();
    isDrawing.current = true;
    const pos         = getPos(e);
    lastPos.current   = pos;
    strokePts.current.push([pos.x, pos.y]);
    totalLen.current = 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPointerMove = useCallback((e) => {
    if (!isDrawing.current) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    const pos    = getPos(e);

    // Draw the child's stroke in blue
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = '#596FE8';
    ctx.lineWidth   = 9;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
    ctx.stroke();

    // Accumulate points and length
    totalLen.current += Math.hypot(pos.x - lastPos.current.x, pos.y - lastPos.current.y);
    strokePts.current.push([pos.x, pos.y]);
    lastPos.current = pos;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPointerUp = useCallback(() => {
    isDrawing.current = false;
  }, []);

  // ── Validate on Done button press ─────────────────────────────────────────
  const handleDone = () => {
    const canvas = canvasRef.current;
    const passed = validateLetter(canvas, strokePts.current, totalLen.current, currentItem);
    setFeedback(passed ? 'pass' : 'fail');
  };

  // ── Advance to next letter (or finish) after a pass ───────────────────────
  const handleAdvance = () => {
    if (!isLast) {
      setCurrentIndex(i => i + 1);
    } else {
      onDone();
    }
  };

  return (
    <div className="tt-letter-activity anim-fade-up">
      <h2 className="tt-activity-title">Trace the letter!</h2>

      <div className="tt-letter-display" aria-hidden="true">
        {currentItem}
      </div>

      <div className="tt-canvas-wrapper">
        <canvas
          ref={canvasRef}
          className="tt-canvas"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          onPointerCancel={onPointerUp}
          aria-label={`Drawing area for tracing letter ${currentItem}`}
          role="img"
        />
      </div>

      {/* Feedback — never harsh red; warm pass / gentle nudge fail */}
      {feedback === 'pass' && (
        <div className="tt-feedback tt-feedback--pass anim-star">
          Great tracing! ⭐
        </div>
      )}
      {feedback === 'fail' && (
        <div className="tt-feedback tt-feedback--fail">
          Almost! Follow the dotted line ✏️
        </div>
      )}

      <div className="tt-controls">
        <PrimaryButton variant="ghost" size="sm" onClick={clearCanvas} icon="🗑️">
          Clear
        </PrimaryButton>

        {/* After a pass: show the advance button. Before pass: show validate. */}
        {feedback === 'pass' ? (
          <PrimaryButton
            variant={isLast ? 'green' : 'primary'}
            onClick={handleAdvance}
            icon={isLast ? '✓' : '→'}
          >
            {isLast ? 'Done!' : 'Next'}
          </PrimaryButton>
        ) : (
          <PrimaryButton
            variant={isLast ? 'green' : 'primary'}
            onClick={handleDone}
            icon={isLast ? '✓' : '✔'}
          >
            {isLast ? 'Done!' : 'Done'}
          </PrimaryButton>
        )}
      </div>

      <div className="tt-letter-list" role="list">
        {letters.map((letter, i) => (
          <span
            key={letter}
            role="listitem"
            className={`tt-letter-thumb ${i === currentIndex ? 'tt-letter-thumb--active' : ''} ${i < currentIndex ? 'tt-letter-thumb--done' : ''}`}
          >
            {i < currentIndex ? '✅' : letter}
          </span>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ButterflyPath  (unchanged from previous implementation)
// ═══════════════════════════════════════════════════════════════════════════════
//
// Pip starts at top-left (~12 %, 22 % of canvas). Flower is at (80 %, 72 %).
// START zone radius = 11 % of min(w,h).  FLOWER zone radius = 10 % of min(w,h).
//
const PIP_ZONE    = { rx: 0.12, ry: 0.22, r: 0.11 };
const FLOWER_ZONE = { rx: 0.80, ry: 0.72, r: 0.10 };
const MIN_PATH_LENGTH = 0.35; // minimum path length as fraction of diagonal

function ButterflyPath({ onDone }) {
  const canvasRef = useRef(null);

  // Drawing refs (no re-render during draw)
  const isDrawing    = useRef(false);
  const lastPos      = useRef({ x: 0, y: 0 });
  const strokePoints = useRef([]);
  const totalLength  = useRef(0);
  const startedInPip = useRef(false);

  // React state
  const [feedback,  setFeedback]  = useState(null); // null | 'pass' | 'fail'
  const [animating, setAnimating] = useState(false);
  const [pipPos,    setPipPos]    = useState(null);  // {x, y} CSS px while animating

  const animFrameRef = useRef(null);

  // ── Draw the static scene (dotted path + flower) ──────────────────────────
  const drawScene = useCallback((canvas) => {
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    // Dotted guide path
    ctx.beginPath();
    ctx.setLineDash([14, 12]);
    ctx.strokeStyle = 'rgba(98, 200, 148, 0.55)';
    ctx.lineWidth = 7;
    ctx.moveTo(width * PIP_ZONE.rx, height * PIP_ZONE.ry);
    ctx.bezierCurveTo(
      width * 0.28, height * 0.62,
      width * 0.55, height * 0.18,
      width * FLOWER_ZONE.rx, height * FLOWER_ZONE.ry
    );
    ctx.stroke();
    ctx.setLineDash([]);

    // Flower emoji
    ctx.font = `${Math.min(width, height) * 0.13}px serif`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🌸', width * FLOWER_ZONE.rx, height * FLOWER_ZONE.ry);

    // Start zone hint (subtle dashed circle around Pip's start)
    ctx.beginPath();
    ctx.arc(
      width  * PIP_ZONE.rx,
      height * PIP_ZONE.ry,
      Math.min(width, height) * PIP_ZONE.r,
      0, Math.PI * 2
    );
    ctx.strokeStyle = 'rgba(89, 111, 232, 0.20)';
    ctx.lineWidth   = 2;
    ctx.setLineDash([4, 6]);
    ctx.stroke();
    ctx.setLineDash([]);
  }, []);

  // ── Full reset ─────────────────────────────────────────────────────────────
  const resetAll = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    isDrawing.current    = false;
    lastPos.current      = { x: 0, y: 0 };
    strokePoints.current = [];
    totalLength.current  = 0;
    startedInPip.current = false;
    setFeedback(null);
    setAnimating(false);
    setPipPos(null);
    const canvas = canvasRef.current;
    if (canvas) drawScene(canvas);
  }, [drawScene]);

  // ── Canvas resize ──────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    const resize = () => {
      const rect    = parent.getBoundingClientRect();
      canvas.width  = rect.width;
      canvas.height = rect.height;
      drawScene(canvas);
      resetAll();
    };
    resize();
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [drawScene, resetAll]);

  // ── Coordinate helper ──────────────────────────────────────────────────────
  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const src  = e.touches ? e.touches[0] : e;
    return {
      x: (src.clientX - rect.left) * (canvas.width  / rect.width),
      y: (src.clientY - rect.top)  * (canvas.height / rect.height),
    };
  };

  // ── Zone check ─────────────────────────────────────────────────────────────
  const inZone = (pos, zone, canvas) => {
    const { width, height } = canvas;
    const cx = width  * zone.rx;
    const cy = height * zone.ry;
    const r  = Math.min(width, height) * zone.r;
    return Math.hypot(pos.x - cx, pos.y - cy) <= r;
  };

  // ── Pointer down ───────────────────────────────────────────────────────────
  const startDraw = useCallback((e) => {
    e.preventDefault();
    if (feedback === 'pass' || animating) return;

    const canvas = canvasRef.current;
    const pos    = getPos(e, canvas);

    if (!inZone(pos, PIP_ZONE, canvas)) {
      // Started outside Pip — this attempt cannot succeed
      startedInPip.current = false;
      isDrawing.current    = false;
      return;
    }

    startedInPip.current    = true;
    isDrawing.current       = true;
    lastPos.current         = pos;
    strokePoints.current    = [[pos.x, pos.y]];
    totalLength.current     = 0;
    setFeedback(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedback, animating]);

  // ── Pointer move ───────────────────────────────────────────────────────────
  const draw = useCallback((e) => {
    if (!isDrawing.current || !startedInPip.current) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    const pos    = getPos(e, canvas);

    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = '#FFD463';
    ctx.lineWidth   = 7;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
    ctx.globalAlpha = 0.8;
    ctx.stroke();
    ctx.globalAlpha = 1;

    totalLength.current += Math.hypot(pos.x - lastPos.current.x, pos.y - lastPos.current.y);
    strokePoints.current.push([pos.x, pos.y]);
    lastPos.current = pos;
  }, []);

  // ── Pointer up / lift ──────────────────────────────────────────────────────
  const endDraw = useCallback(() => {
    if (!isDrawing.current) return;
    isDrawing.current = false;

    if (!startedInPip.current) { setFeedback('fail'); return; }

    const canvas = canvasRef.current;
    const { width, height } = canvas;
    const points = strokePoints.current;

    const lastPoint = points[points.length - 1];
    if (!lastPoint) { setFeedback('fail'); return; }

    const endedInFlower = inZone({ x: lastPoint[0], y: lastPoint[1] }, FLOWER_ZONE, canvas);
    const diagonal      = Math.hypot(width, height);
    const longEnough    = totalLength.current >= diagonal * MIN_PATH_LENGTH;

    if (!endedInFlower || !longEnough) { setFeedback('fail'); return; }

    // ✅ Success — animate Pip along the drawn path
    animatePip(points);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Animate Pip along stroke points ───────────────────────────────────────
  const animatePip = useCallback((points) => {
    if (points.length < 2) return;
    setAnimating(true);
    setFeedback(null);

    const canvas = canvasRef.current;
    const rect   = canvas.getBoundingClientRect();

    // Convert canvas coords → CSS px relative to stage
    const scaleX = rect.width  / canvas.width;
    const scaleY = rect.height / canvas.height;

    // Subsample to ~40 waypoints for smooth animation
    const numWaypoints = Math.min(points.length, 40);
    const step = (points.length - 1) / (numWaypoints - 1);
    const waypoints = Array.from({ length: numWaypoints }, (_, i) => {
      const idx    = Math.round(i * step);
      const [px, py] = points[Math.min(idx, points.length - 1)];
      return { x: px * scaleX, y: py * scaleY };
    });

    const DURATION = 1400; // ms
    let startTime  = null;
    let rafId;

    const tick = (now) => {
      if (!startTime) startTime = now;
      const t          = Math.min((now - startTime) / DURATION, 1);
      const wpIdx      = Math.floor(t * (waypoints.length - 1));
      const wp         = waypoints[Math.min(wpIdx, waypoints.length - 1)];
      setPipPos({ x: wp.x, y: wp.y });

      if (t < 1) {
        rafId = requestAnimationFrame(tick);
        animFrameRef.current = rafId;
      } else {
        setAnimating(false);
        setFeedback('pass');
      }
    };

    animFrameRef.current = requestAnimationFrame(tick);
  }, []);

  return (
    <div className="tt-path-activity anim-fade-up">
      <h2 className="tt-activity-title">Help Pip find the flower! 🦋</h2>
      <p className="tt-path-hint">Draw a path from Pip to the flower 🌸</p>

      <div className="tt-path-stage">
        {/* Static Pip at start position (hidden while animating) */}
        {!animating && !feedback && (
          <div className="tt-path-pip">
            <Butterfly size={80} animate="float" />
          </div>
        )}

        {/* Animated Pip travelling along the drawn path */}
        {(animating || feedback === 'pass') && pipPos && (
          <div
            className="tt-path-pip-anim"
            style={{ left: pipPos.x - 40, top: pipPos.y - 40 }}
          >
            <Butterfly size={80} animate={animating ? 'float' : 'bounce'} />
          </div>
        )}

        <canvas
          ref={canvasRef}
          className="tt-canvas"
          onPointerDown={startDraw}
          onPointerMove={draw}
          onPointerUp={endDraw}
          onPointerLeave={endDraw}
          onPointerCancel={endDraw}
          aria-label="Draw a path for Pip to reach the flower"
          role="img"
        />

        {feedback === 'pass' && (
          <div className="tt-reached-msg anim-star">
            🌟 You found the flower! 🌸
          </div>
        )}
        {feedback === 'fail' && (
          <div className="tt-reached-msg tt-reached-msg--fail">
            Keep going! Start from Pip and reach the flower 🦋
          </div>
        )}
      </div>

      <div className="tt-controls">
        {feedback !== 'pass' && (
          <PrimaryButton variant="ghost" size="sm" onClick={resetAll} icon="🗑️">
            Try Again
          </PrimaryButton>
        )}
        {feedback === 'pass' && (
          <PrimaryButton variant="green" onClick={onDone} icon="✓">
            Great job!
          </PrimaryButton>
        )}
      </div>
    </div>
  );
}
