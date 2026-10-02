// ================================================
// LittlePath – Nursery Data
// ================================================

export const nurseryData = {
  level: 'nursery',
  displayName: 'Little Explorer',
  emoji: '🌱',
  grade: 'Nursery',

  soundGarden: [
    {
      id: 'a',
      letter: 'A',
      word: 'Apple',
      emoji: '🍎',
      audio: '/audio/apple.mp3',
      color: '#FF8F7E',
    },
    {
      id: 'b',
      letter: 'B',
      word: 'Ball',
      emoji: '⚽',
      audio: '/audio/ball.mp3',
      color: '#596FE8',
    },
    {
      id: 'c',
      letter: 'C',
      word: 'Cat',
      emoji: '🐱',
      audio: '/audio/cat.mp3',
      color: '#62C894',
    },
    {
      id: 'd',
      letter: 'D',
      word: 'Dog',
      emoji: '🐶',
      audio: '/audio/dog.mp3',
      color: '#FFD463',
    },
    {
      id: 'e',
      letter: 'E',
      word: 'Elephant',
      emoji: '🐘',
      audio: '/audio/elephant.mp3',
      color: '#A99AEE',
    },
    {
      id: 'f',
      letter: 'F',
      word: 'Fish',
      emoji: '🐟',
      audio: '/audio/fish.mp3',
      color: '#62C894',
    },
  ],

  traceTrail: {
    letters: ['A', 'B', 'C'],
    pathActivity: {
      instruction: 'Help Pip find the flower!',
    },
  },

  matchMeadow: [
    {
      id: 'q1',
      question: 'Which picture starts with B?',
      choices: [
        { id: 'apple',     emoji: '🍎', word: 'Apple',     correct: false },
        { id: 'butterfly', emoji: '🦋', word: 'Butterfly', correct: true  },
        { id: 'cat',       emoji: '🐱', word: 'Cat',       correct: false },
      ],
    },
    {
      id: 'q2',
      question: 'Which picture starts with D?',
      choices: [
        { id: 'dog',    emoji: '🐶', word: 'Dog',   correct: true  },
        { id: 'fish',   emoji: '🐟', word: 'Fish',  correct: false },
        { id: 'apple',  emoji: '🍎', word: 'Apple', correct: false },
      ],
    },
    {
      id: 'q3',
      question: 'Which picture starts with F?',
      choices: [
        { id: 'elephant', emoji: '🐘', word: 'Elephant', correct: false },
        { id: 'cat',      emoji: '🐱', word: 'Cat',      correct: false },
        { id: 'fish',     emoji: '🐟', word: 'Fish',     correct: true  },
      ],
    },
  ],
};
