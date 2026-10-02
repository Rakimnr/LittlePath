import React, { useRef, useState, useEffect, useCallback } from 'react';
import PageHeader from '../components/PageHeader';
import PrimaryButton from '../components/PrimaryButton';
import Butterfly from '../components/Butterfly';
import './TraceTrail.css';

const ACTIVITIES = ['letter', 'path'];

// ── Guide-point definitions for letters ────────────────────────────────────
// Points are expressed as [cx, cy] fractions of canvas width/height.
// They mark the structural skeleton of each letter.
const LETTER_GUIDES = {
  A: [
    [0.50, 0.10], // apex
    [0.35, 0.35], // left upper-mid
    [0.26, 0.55], // left mid
    [0.20, 0.78], // left foot
    [0.38, 0.55], // crossbar left
    [0.50, 0.55], // crossbar centre
    [0.62, 0.55], // crossbar right
    [0.65, 0.35], // right upper-mid
    [0.74, 0.55], // right mid
    [0.80, 0.78], // right foot
  ],
  B: [
    [0.25, 0.12], // top-left
    [0.25, 0.35], // upper-left mid
    [0.25, 0.50], // waist
    [0.25, 0.65], // lower-left mid
    [0.25, 0.88], // bottom-left
    [0.48, 0.12], // top-right upper bowl
    [0.60, 0.22], // upper bowl right
    [0.60, 0.38], // upper bowl bottom
    [0.48, 0.50], // waist right
    [0.62, 0.60], // lower bowl right
    [0.62, 0.76], // lower bowl bottom
    [0.48, 0.88], // bottom-right
  ],
  C: [
    [0.72, 0.20], // top right
    [0.55, 0.10], // top mid
    [0.38, 0.15], // top left
    [0.25, 0.30], // left upper
    [0.20, 0.50], // left mid
    [0.25, 0.70], // left lower
    [0.38, 0.85], // bottom left
    [0.55, 0.90], // bottom mid
    [0.72, 0.80], // bottom right
  ],
  D: [
    [0.28, 0.12], // top-left
    [0.28, 0.35], // left upper-mid
    [0.28, 0.50], // left mid
    [0.28, 0.65], // left lower-mid
    [0.28, 0.88], // bottom-left
    [0.45, 0.12], // top-right
    [0.60, 0.22], // right upper bowl
    [0.68, 0.38], // right mid upper
    [0.70, 0.50], // right apex
    [0.68, 0.62], // right mid lower
    [0.60, 0.78], // right lower bowl
    [0.45, 0.88], // bottom-right
  ],
  E: [
    [0.70, 0.12], // top-right
    [0.28, 0.12], // top-left
    [0.28, 0.35], // left upper-mid
    [0.28, 0.50], // left mid
    [0.28, 0.65], // left lower-mid
    [0.28, 0.88], // bottom-left
    [0.62, 0.88], // bottom-right
    [0.55, 0.50], // mid bar right
    [0.28, 0.50], // mid bar left (already covered)
  ],
  F: [
    [0.70, 0.12], // top-right
    [0.28, 0.12], // top-left
    [0.28, 0.35], // left upper-mid
    [0.28, 0.50], // left mid
    [0.58, 0.50], // mid bar right
    [0.28, 0.65], // left lower-mid
    [0.28, 0.88], // bottom-left
  ],
};

// Generate fallback guides for any letter not in the map above
function getFallbackGuide(letter) {
  // Generic: 6 points for a diagonal Z-shape — won't perfectly match any letter
  // but is better than nothing. Unknown letters mostly get wrong strokes and fail.
  return [
    [0.30, 0.15], [0.50, 0.20], [0.70, 0.15],
    [0.50, 0.50],
    [0.30, 0.85], [0.50, 0.80], [0.70, 0.85],
  ];
}

function getGuidePoints(letter) {
  return LETTER_GUIDES[letter.toUpperCase()] || getFallbackGuide(letter);
}

// Tolerance radius as fraction of the smaller canvas dimension
const LETTER_TOLERANCE = 0.095;
const COVERAGE_THRESHOLD = 0.70; // 70% of guide points required
const MIN_STROKES_PX = 40;       // total stroke length must exceed this (sum of deltas)

// ── TraceTrail root ─────────────────────────────────────────────────────────
export default function TraceTrail({ data, onComplete, onHome }) {
  const [activityIndex, setActivityIndex] = useState(0);
  const activity = ACTIVITIES[activityIndex];

  const handleNextActivity = () => {
    if (activityIndex < ACTIVITIES.length - 1) {
      setActivityIndex((i) => i + 1);
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

// ── Letter Tracing ──────────────────────────────────────────────────────────
function LetterTracing({ letters, onDone }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedback, setFeedback] = useState(null); // null | 'pass' | 'fail'
  const canvasRef = useRef(null);

  // Drawing state kept in refs (no re-render needed during draw)
  const isDrawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const strokePoints = useRef([]);    // all sampled points [[x,y],…]
  const totalLength = useRef(0);      // cumulative stroke length in px

  const currentItem = letters[currentIndex];
  const isLast = currentIndex === letters.length - 1;

  // ── Reset all drawing state ────────────────────────────────────────────
  const resetDrawing = useCallback(() => {
    isDrawing.current = false;
    lastPos.current = { x: 0, y: 0 };
    strokePoints.current = [];
    totalLength.current = 0;
    setFeedback(null);
  }, []);

  // ── Draw the faint guide letter ─────────────────────────────────────────
  const drawGuideLetter = useCallback((canvas, letter) => {
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.font = `bold ${Math.min(width, height) * 0.62}px Fredoka, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // Ghost fill
    ctx.fillStyle = 'rgba(169, 154, 238, 0.14)';
    ctx.fillText(letter, width / 2, height / 2);
    // Dotted stroke
    ctx.strokeStyle = 'rgba(169, 154, 238, 0.30)';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 8]);
    ctx.strokeText(letter, width / 2, height / 2);
    ctx.setLineDash([]);
    ctx.restore();
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawGuideLetter(canvas, currentItem);
    resetDrawing();
  }, [currentItem, drawGuideLetter, resetDrawing]);

  // ── Resize + redraw guide ──────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    const resize = () => {
      const rect = parent.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      drawGuideLetter(canvas, currentItem);
      resetDrawing();
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [currentItem, drawGuideLetter, resetDrawing]);

  // ── Pointer position helper ────────────────────────────────────────────
  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return {
      x: (src.clientX - rect.left) * (canvas.width / rect.width),
      y: (src.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  // ── Pointer events ─────────────────────────────────────────────────────
  const startDraw = useCallback((e) => {
    e.preventDefault();
    isDrawing.current = true;
    const pos = getPos(e, canvasRef.current);
    lastPos.current = pos;
    strokePoints.current.push([pos.x, pos.y]);
    totalLength.current = 0;
  }, []);

  const draw = useCallback((e) => {
    if (!isDrawing.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);

    // Render stroke
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = '#596FE8';
    ctx.lineWidth = 9;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Accumulate
    const dx = pos.x - lastPos.current.x;
    const dy = pos.y - lastPos.current.y;
    totalLength.current += Math.hypot(dx, dy);
    strokePoints.current.push([pos.x, pos.y]);
    lastPos.current = pos;
  }, []);

  const endDraw = useCallback(() => {
    isDrawing.current = false;
  }, []);

  // ── Validation ────────────────────────────────────────────────────────
  const validateTracing = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return false;
    const { width, height } = canvas;
    const points = strokePoints.current;
    const totalLen = totalLength.current;

    // Must have drawn something substantial
    if (points.length < 5 || totalLen < MIN_STROKES_PX) return false;

    const guide = getGuidePoints(currentItem);
    const tol = Math.min(width, height) * LETTER_TOLERANCE;
    let covered = 0;

    for (const [gx, gy] of guide) {
      const ax = gx * width;
      const ay = gy * height;
      // Check if any stroke point is within tolerance of this guide point
      const hit = points.some(([px, py]) => Math.hypot(px - ax, py - ay) <= tol);
      if (hit) covered++;
    }

    const coverage = covered / guide.length;
    return coverage >= COVERAGE_THRESHOLD;
  }, [currentItem]);

  // ── Done button handler ────────────────────────────────────────────────
  const handleDone = () => {
    const passed = validateTracing();
    if (passed) {
      setFeedback('pass');
    } else {
      setFeedback('fail');
    }
  };

  // ── Advance after pass ─────────────────────────────────────────────────
  const handleAdvance = () => {
    if (!isLast) {
      setCurrentIndex((i) => i + 1);
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
          onPointerDown={startDraw}
          onPointerMove={draw}
          onPointerUp={endDraw}
          onPointerLeave={endDraw}
          onPointerCancel={endDraw}
          aria-label={`Drawing area for tracing letter ${currentItem}`}
          role="img"
        />
      </div>

      {/* Feedback message */}
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

        {/* If passed, show Advance. Otherwise show Validate ("Done") */}
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

// ── Butterfly Path Activity ─────────────────────────────────────────────────
//
// Pip starts at top-left (~12%, 22% of canvas). Flower is at (80%, 72%).
// START zone radius = 11% of min(w,h).  FLOWER zone radius = 10% of min(w,h).
//
const PIP_ZONE   = { rx: 0.12, ry: 0.22, r: 0.11 };
const FLOWER_ZONE = { rx: 0.80, ry: 0.72, r: 0.10 };
const MIN_PATH_LENGTH = 0.35; // minimum path length as fraction of diagonal

function ButterflyPath({ onDone }) {
  const canvasRef = useRef(null);

  // Drawing refs (no re-render during draw)
  const isDrawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const strokePoints = useRef([]);
  const totalLength = useRef(0);
  const startedInPip = useRef(false);

  // React state
  const [feedback, setFeedback] = useState(null); // null | 'pass' | 'fail'
  const [animating, setAnimating] = useState(false);
  const [pipPos, setPipPos] = useState(null); // {x, y} in px while animating

  const animFrameRef = useRef(null);

  // ── Draw the static scene (dotted path + flower) ────────────────────────
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
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🌸', width * FLOWER_ZONE.rx, height * FLOWER_ZONE.ry);

    // Start zone hint (subtle circle around Pip's start)
    ctx.beginPath();
    ctx.arc(
      width * PIP_ZONE.rx,
      height * PIP_ZONE.ry,
      Math.min(width, height) * PIP_ZONE.r,
      0, Math.PI * 2
    );
    ctx.strokeStyle = 'rgba(89, 111, 232, 0.20)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 6]);
    ctx.stroke();
    ctx.setLineDash([]);
  }, []);

  // ── Full reset ────────────────────────────────────────────────────────────
  const resetAll = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    isDrawing.current = false;
    lastPos.current = { x: 0, y: 0 };
    strokePoints.current = [];
    totalLength.current = 0;
    startedInPip.current = false;
    setFeedback(null);
    setAnimating(false);
    setPipPos(null);
    const canvas = canvasRef.current;
    if (canvas) drawScene(canvas);
  }, [drawScene]);

  // ── Canvas resize ─────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    const resize = () => {
      const rect = parent.getBoundingClientRect();
      canvas.width = rect.width;
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

  // ── Coordinate helper ─────────────────────────────────────────────────────
  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return {
      x: (src.clientX - rect.left) * (canvas.width / rect.width),
      y: (src.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  // ── Zone checks ────────────────────────────────────────────────────────────
  const inZone = (pos, zone, canvas) => {
    const { width, height } = canvas;
    const cx = width * zone.rx;
    const cy = height * zone.ry;
    const r = Math.min(width, height) * zone.r;
    return Math.hypot(pos.x - cx, pos.y - cy) <= r;
  };

  // ── Pointer down ─────────────────────────────────────────────────────────
  const startDraw = useCallback((e) => {
    e.preventDefault();
    if (feedback === 'pass' || animating) return;

    const canvas = canvasRef.current;
    const pos = getPos(e, canvas);

    if (!inZone(pos, PIP_ZONE, canvas)) {
      // Started outside Pip — don't begin a valid attempt
      startedInPip.current = false;
      isDrawing.current = false;
      return;
    }

    startedInPip.current = true;
    isDrawing.current = true;
    lastPos.current = pos;
    strokePoints.current = [[pos.x, pos.y]];
    totalLength.current = 0;
    setFeedback(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedback, animating]);

  // ── Pointer move ──────────────────────────────────────────────────────────
  const draw = useCallback((e) => {
    if (!isDrawing.current || !startedInPip.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);

    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = '#FFD463';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = 0.8;
    ctx.stroke();
    ctx.globalAlpha = 1;

    const dx = pos.x - lastPos.current.x;
    const dy = pos.y - lastPos.current.y;
    totalLength.current += Math.hypot(dx, dy);
    strokePoints.current.push([pos.x, pos.y]);
    lastPos.current = pos;
  }, []);

  // ── Pointer up / lift ─────────────────────────────────────────────────────
  const endDraw = useCallback((e) => {
    if (!isDrawing.current) return;
    isDrawing.current = false;

    if (!startedInPip.current) {
      setFeedback('fail');
      return;
    }

    const canvas = canvasRef.current;
    const { width, height } = canvas;
    const points = strokePoints.current;

    // Must have ended (last point) inside flower zone
    const lastPoint = points[points.length - 1];
    if (!lastPoint) { setFeedback('fail'); return; }

    const endedInFlower = inZone({ x: lastPoint[0], y: lastPoint[1] }, FLOWER_ZONE, canvas);

    // Must have minimum path length
    const diagonal = Math.hypot(width, height);
    const longEnough = totalLength.current >= diagonal * MIN_PATH_LENGTH;

    if (!endedInFlower || !longEnough) {
      setFeedback('fail');
      return;
    }

    // ✅ Success — animate Pip along the drawn path
    animatePip(points);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Animate Pip along stroke points ──────────────────────────────────────
  const animatePip = useCallback((points) => {
    if (points.length < 2) return;
    setAnimating(true);
    setFeedback(null);

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    // Convert canvas coords → CSS px relative to stage
    const scaleX = rect.width / canvas.width;
    const scaleY = rect.height / canvas.height;

    // Subsample to ~40 waypoints for smooth animation
    const numWaypoints = Math.min(points.length, 40);
    const step = (points.length - 1) / (numWaypoints - 1);
    const waypoints = Array.from({ length: numWaypoints }, (_, i) => {
      const idx = Math.round(i * step);
      const [px, py] = points[Math.min(idx, points.length - 1)];
      return { x: px * scaleX, y: py * scaleY };
    });

    const DURATION = 1400; // ms
    let startTime = null;
    let rafId;

    const tick = (now) => {
      if (!startTime) startTime = now;
      const t = Math.min((now - startTime) / DURATION, 1);
      const waypointIdx = Math.floor(t * (waypoints.length - 1));
      const wp = waypoints[Math.min(waypointIdx, waypoints.length - 1)];
      setPipPos({ x: wp.x, y: wp.y });

      if (t < 1) {
        rafId = requestAnimationFrame(tick);
        animFrameRef.current = rafId;
      } else {
        // Animation complete
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
        {/* Static Pip (hidden during animation) */}
        {!animating && !feedback && (
          <div className="tt-path-pip">
            <Butterfly size={80} animate="float" />
          </div>
        )}

        {/* Animated Pip travelling along the path */}
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
