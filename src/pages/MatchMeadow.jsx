import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import ActivityCard from '../components/ActivityCard';
import Butterfly from '../components/Butterfly';
import PrimaryButton from '../components/PrimaryButton';
import './MatchMeadow.css';

/**
 * MatchMeadow – receives `data` prop (array from learningData.matchMeadow).
 * Each item: { id, question, choices: [{ id, emoji, word, correct }] }
 */
export default function MatchMeadow({ data, onComplete, onHome }) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(null);

  const question = data[questionIndex];
  const isLast = questionIndex === data.length - 1;

  const handleChoice = (choice) => {
    if (answered) return;
    setSelected(choice.id);
    setAnswered(true);
    setCorrect(choice.correct);
  };

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setQuestionIndex((i) => i + 1);
      setSelected(null);
      setAnswered(false);
      setCorrect(null);
    }
  };

  return (
    <div className="mm-page page">
      <PageHeader
        onHome={onHome}
        title="Match Meadow"
        rightSlot={<span style={{ fontSize: '1.4rem' }} aria-hidden="true">🌻</span>}
      />

      {/* Decorative bg */}
      <div className="mm-bg" aria-hidden="true">
        <div className="mm-bg__flower mm-bg__flower--1 anim-sway">🌼</div>
        <div className="mm-bg__flower mm-bg__flower--2 anim-sway" style={{ animationDelay: '-1.2s' }}>🌸</div>
        <div className="mm-bg__flower mm-bg__flower--3 anim-sway" style={{ animationDelay: '-0.6s' }}>🌺</div>
      </div>

      <main className="mm-main container">
        {/* Progress */}
        <div className="mm-progress" aria-label="Question progress">
          {data.map((q, i) => (
            <div
              key={q.id}
              className={`mm-progress-dot ${i < questionIndex ? 'mm-progress-dot--done' : ''} ${i === questionIndex ? 'mm-progress-dot--current' : ''}`}
            />
          ))}
        </div>

        {/* Question card */}
        <div className="mm-question-card anim-fade-scale" key={question.id}>
          <p className="mm-question-text">{question.question}</p>

          {/* Choices */}
          <div
            className="mm-choices"
            role="group"
            aria-label="Answer choices"
          >
            {question.choices.map((choice) => {
              let cardCorrect = null;
              if (answered && selected === choice.id) {
                cardCorrect = choice.correct;
              }

              return (
                <ActivityCard
                  key={choice.id}
                  className="mm-choice"
                  onClick={answered ? undefined : () => handleChoice(choice)}
                  correct={cardCorrect}
                  selected={!answered && selected === choice.id}
                >
                  <div className="mm-choice-inner">
                    <span className="mm-choice-emoji" role="img" aria-label={choice.word}>
                      {choice.emoji}
                    </span>
                    <span className="mm-choice-word">{choice.word}</span>
                  </div>
                </ActivityCard>
              );
            })}
          </div>

          {/* Feedback */}
          {answered && (
            <div
              className={`mm-feedback ${correct ? 'mm-feedback--correct' : 'mm-feedback--wrong'} anim-fade-up`}
              role="alert"
            >
              <Butterfly size={40} animate={correct ? 'bounce' : 'none'} />
              <span className="mm-feedback__text">
                {correct ? 'Great job! ⭐' : 'Almost! Try again 🦋'}
              </span>
            </div>
          )}
        </div>

        {/* Action button */}
        {answered && (
          <PrimaryButton
            variant={correct ? 'green' : 'coral'}
            size="lg"
            onClick={
              correct
                ? handleNext
                : () => { setSelected(null); setAnswered(false); setCorrect(null); }
            }
            className="mm-next-btn anim-fade-up"
            icon={correct ? (isLast ? '🎉' : '→') : '↺'}
          >
            {correct ? (isLast ? 'Finish!' : 'Next') : 'Try again'}
          </PrimaryButton>
        )}
      </main>
    </div>
  );
}
