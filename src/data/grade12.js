// ================================================
// LittlePath – Grade 1–2 Data
// ================================================

export const grade12Data = {
  level: 'grade12',
  displayName: 'Bright Explorer',
  emoji: '⭐',
  grade: 'Grade 1–2',

  soundGarden: [
    {
      id: 'cat',
      word: 'Cat',
      letters: ['C', 'A', 'T'],
      emoji: '🐱',
      audio: '/audio/cat.mp3',
      color: '#62C894',
    },
    {
      id: 'sun',
      word: 'Sun',
      letters: ['S', 'U', 'N'],
      emoji: '☀️',
      audio: '/audio/sun.mp3',
      color: '#FFD463',
    },
    {
      id: 'fish',
      word: 'Fish',
      letters: ['F', 'I', 'S', 'H'],
      emoji: '🐟',
      audio: '/audio/fish.mp3',
      color: '#596FE8',
    },
    {
      id: 'tree',
      word: 'Tree',
      letters: ['T', 'R', 'E', 'E'],
      emoji: '🌳',
      audio: '/audio/tree.mp3',
      color: '#62C894',
    },
    {
      id: 'book',
      word: 'Book',
      letters: ['B', 'O', 'O', 'K'],
      emoji: '📚',
      audio: '/audio/book.mp3',
      color: '#A99AEE',
    },
    {
      id: 'moon',
      word: 'Moon',
      letters: ['M', 'O', 'O', 'N'],
      emoji: '🌙',
      audio: '/audio/moon.mp3',
      color: '#596FE8',
    },
  ],

  traceTrail: {
    words: ['CAT', 'SUN', 'FUN'],
    pathActivity: {
      instruction: 'Help Pip find the flower!',
    },
  },

  matchMeadow: [
    {
      id: 'q1',
      emoji: '🐱',
      emojiLabel: 'A cat',
      question: 'Which word matches this picture?',
      choices: [
        { id: 'cat',  word: 'CAT',  correct: true  },
        { id: 'sun',  word: 'SUN',  correct: false },
        { id: 'tree', word: 'TREE', correct: false },
      ],
    },
    {
      id: 'q2',
      emoji: '☀️',
      emojiLabel: 'The sun',
      question: 'Which word matches this picture?',
      choices: [
        { id: 'moon', word: 'MOON', correct: false },
        { id: 'sun',  word: 'SUN',  correct: true  },
        { id: 'fish', word: 'FISH', correct: false },
      ],
    },
    {
      id: 'q3',
      emoji: '📚',
      emojiLabel: 'A book',
      question: 'Which word matches this picture?',
      choices: [
        { id: 'fish', word: 'FISH', correct: false },
        { id: 'book', word: 'BOOK', correct: true  },
        { id: 'moon', word: 'MOON', correct: false },
      ],
    },
  ],
};
