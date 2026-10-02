import React, { useRef, useState, useEffect, useCallback } from 'react';
import PageHeader from '../components/PageHeader';
import PrimaryButton from '../components/PrimaryButton';
import Butterfly from '../components/Butterfly';
import './TraceTrail.css';

const ACTIVITIES = ['letter', 'path'];

/**
 * TraceTrail – receives `data` prop from learningData.traceTrail.
 * Shape: { letters: ['A','B','C'], pathActivity: { instruction } }
 */
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

// ── Letter Tracing ─────────────────────────────────
function LetterTracing({ letters, onDone }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const currentItem = letters[currentIndex];
  const isLast = currentIndex === letters.length - 1;

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGuideLetter(canvas, currentItem);
  }, [currentItem]);

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
    ctx.strokeStyle = 'rgba(169, 154, 238, 0.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 8]);
    ctx.strokeText(letter, width / 2, height / 2);
    ctx.setLineDash([]);
    ctx.restore();
  }, []);

  // Resize + redraw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    const resize = () => {
      const rect = parent.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      drawGuideLetter(canvas, currentItem);
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [currentItem, drawGuideLetter]);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    if (e.touches) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDraw = (e) => {
    isDrawing.current = true;
    lastPos.current = getPos(e, canvasRef.current);
    e.preventDefault();
  };

  const draw = (e) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = '#596FE8';
    ctx.lineWidth = 9;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    lastPos.current = pos;
    e.preventDefault();
  };

  const endDraw = () => { isDrawing.current = false; };

  const handleNext = () => {
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
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
          aria-label={`Drawing area for tracing letter ${currentItem}`}
          role="img"
        />
      </div>

      <div className="tt-controls">
        <PrimaryButton variant="ghost" size="sm" onClick={clearCanvas} icon="🗑️">
          Clear
        </PrimaryButton>
        <PrimaryButton
          variant={isLast ? 'green' : 'primary'}
          onClick={handleNext}
          icon={isLast ? '✓' : '→'}
        >
          {isLast ? 'Done!' : 'Next'}
        </PrimaryButton>
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

// ── Butterfly Path Activity ──────────────────────────
function ButterflyPath({ onDone }) {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const [reached, setReached] = useState(false);

  const FLOWER = { rx: 0.8, ry: 0.72, r: 0.09 };

  const drawScene = useCallback((canvas) => {
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    // Dotted path
    ctx.beginPath();
    ctx.setLineDash([14, 12]);
    ctx.strokeStyle = 'rgba(98, 200, 148, 0.55)';
    ctx.lineWidth = 7;
    ctx.moveTo(width * 0.12, height * 0.22);
    ctx.bezierCurveTo(
      width * 0.28, height * 0.62,
      width * 0.55, height * 0.18,
      width * FLOWER.rx, height * FLOWER.ry
    );
    ctx.stroke();
    ctx.setLineDash([]);

    // Flower at end
    ctx.font = `${Math.min(width, height) * 0.13}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🌸', width * FLOWER.rx, height * FLOWER.ry);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    const resize = () => {
      const rect = parent.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      drawScene(canvas);
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [drawScene]);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    if (e.touches) return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const checkReached = (canvas, pos) => {
    const { width, height } = canvas;
    const dist = Math.hypot(pos.x - width * FLOWER.rx, pos.y - height * FLOWER.ry);
    if (dist < Math.min(width, height) * FLOWER.r) setReached(true);
  };

  const startDraw = (e) => { isDrawing.current = true; lastPos.current = getPos(e, canvasRef.current); e.preventDefault(); };

  const draw = (e) => {
    if (!isDrawing.current) return;
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
    checkReached(canvas, pos);
    lastPos.current = pos;
    e.preventDefault();
  };

  const endDraw = () => { isDrawing.current = false; };

  return (
    <div className="tt-path-activity anim-fade-up">
      <h2 className="tt-activity-title">Help Pip find the flower! 🦋</h2>
      <p className="tt-path-hint">Draw a path from Pip to the flower 🌸</p>

      <div className="tt-path-stage">
        <div className="tt-path-pip">
          <Butterfly size={80} animate="float" />
        </div>
        <canvas
          ref={canvasRef}
          className="tt-canvas"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
          aria-label="Draw a path for Pip to reach the flower"
          role="img"
        />
        {reached && (
          <div className="tt-reached-msg anim-star">
            🌟 Pip found the flower!
          </div>
        )}
      </div>

      <div className="tt-controls">
        <PrimaryButton variant="green" onClick={onDone} icon="✓">
          {reached ? 'Great job!' : 'Done!'}
        </PrimaryButton>
      </div>
    </div>
  );
}
