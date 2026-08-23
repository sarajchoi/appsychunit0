import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, Shuffle, Trophy, Clock, Home } from 'lucide-react';

const FlashcardStudyApp = () => {
  const [cards, setCards] = useState([]);
  const [currentMode, setCurrentMode] = useState('unit-selector');
  const [currentUnit, setCurrentUnit] = useState(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [shuffledCards, setShuffledCards] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Matching game state
  const [matchingCards, setMatchingCards] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [matchingScore, setMatchingScore] = useState(0);
  const [matchingTime, setMatchingTime] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  
  // Quiz state
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Word Scramble state
  const [scrambleWords, setScrambleWords] = useState([]);
  const [currentScrambleIndex, setCurrentScrambleIndex] = useState(0);
  const [scrambleInput, setScrambleInput] = useState('');
  const [scrambleScore, setScrambleScore] = useState(0);
  const [scrambleCompleted, setScrambleCompleted] = useState(false);
  const [showScrambleResult, setShowScrambleResult] = useState(false);

  // Find the Term state  
  const [findTermsClues, setfindTermsClues] = useState([]);
  const [findTermsAnswers, setfindTermsAnswers] = useState({});

  // Available units - you'll add more as you create them
  const availableUnits = [
    { id: 'unit0', name: 'Unit 0', description: 'Scientific Methodology', fileName: 'UNIT0.csv' },
    // Add more units here as you create them:
    // { id: 'unit1', name: 'Unit 1', description: 'Research Methods', fileName: 'UNIT1.csv' },
    // { id: 'unit2', name: 'Unit 2', description: 'Biological Psychology', fileName: 'UNIT2.csv' },
  ];

  // Sample psychology terms - you can replace with your data
  const defaultTerms = [
    { id: 1, term: 'Psychology', definition: 'The scientific study of behavior and mental processes' },
    { id: 2, term: 'Behaviorism', definition: 'A psychological approach that emphasizes the study of observable behaviors' },
    { id: 3, term: 'Cognitive Psychology', definition: 'The study of mental processes including thinking, memory, and problem-solving' },
    { id: 4, term: 'Neuroscience', definition: 'The study of the nervous system and brain' },
    { id: 5, term: 'Classical Conditioning', definition: 'Learning through association, discovered by Ivan Pavlov' },
    { id: 6, term: 'Operant Conditioning', definition: 'Learning through reinforcement and punishment' },
    { id: 7, term: 'Gestalt Psychology', definition: 'A school emphasizing the whole of human experience' },
    { id: 8, term: 'Psychoanalysis', definition: 'Freud\'s theory focusing on unconscious motivations' },
    { id: 9, term: 'Humanistic Psychology', definition: 'An approach emphasizing human potential and self-actualization' },
    { id: 10, term: 'Biological Psychology', definition: 'The study of how biological processes relate to behavior' },
    { id: 11, term: 'Social Psychology', definition: 'The study of how social situations influence behavior' },
    { id: 12, term: 'Developmental Psychology', definition: 'The study of how people change throughout their lives' },
    { id: 13, term: 'Personality Psychology', definition: 'The study of individual differences in behavior patterns' },
    { id: 14, term: 'Abnormal Psychology', definition: 'The study of psychological disorders and unusual behaviors' },
    { id: 15, term: 'Research Methods', definition: 'Scientific techniques used to study psychological phenomena' }
  ];

  // Load terms for selected unit
  const loadUnit = async (unit) => {
    setLoading(true);
    setCurrentUnit(unit);
    
    try {
      // Try to load CSV from public folder
      const response = await fetch(`/${unit.fileName}`);
      if (response.ok) {
        const csvText = await response.text();
        
        // Simple CSV parsing without Papa Parse
        const lines = csvText.split('\n');
        const formattedCards = [];
        
        lines.forEach((line, index) => {
          const columns = line.split(',');
          if (columns.length >= 2) {
            const term = columns[0]?.trim().replace(/['"]/g, '') || '';
            const definition = columns[1]?.trim().replace(/['"]/g, '') || '';
            
            if (term && definition) {
              formattedCards.push({
                id: index,
                term: term,
                definition: definition
              });
            }
          }
        });
        
        if (formattedCards.length > 0) {
          setCards(formattedCards);
          setShuffledCards(formattedCards);
          setCurrentMode('home');
          setLoading(false);
          return;
        }
      }
    } catch (error) {
      console.log(`Could not load ${unit.fileName}, using default terms`);
    }
    
    // Fall back to default terms if CSV loading fails
    setCards(defaultTerms);
    setShuffledCards(defaultTerms);
    setCurrentMode('home');
    setLoading(false);
  };

  // Initialize app - no auto-loading, wait for unit selection
  useEffect(() => {
    // App starts on unit selector screen
  }, []);

  // Timer for matching game
  useEffect(() => {
    let interval;
    if (gameStarted && currentMode === 'matching' && matchedPairs.length < matchingCards.length / 2) {
      interval = setInterval(() => {
        setMatchingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, currentMode, matchedPairs, matchingCards]);

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleShuffle = () => {
    const shuffled = shuffleArray(cards);
    setShuffledCards(shuffled);
    setIsShuffled(true);
    setCurrentCardIndex(0);
    setShowAnswer(false);
  };

  const handleReset = () => {
    setShuffledCards(cards);
    setIsShuffled(false);
    setCurrentCardIndex(0);
    setShowAnswer(false);
  };

  const nextCard = () => {
    setCurrentCardIndex((prev) => (prev + 1) % shuffledCards.length);
    setShowAnswer(false);
  };

  const prevCard = () => {
    setCurrentCardIndex((prev) => (prev - 1 + shuffledCards.length) % shuffledCards.length);
    setShowAnswer(false);
  };

  const startMatchingGame = () => {
    const gameCards = shuffleArray(cards).slice(0, 8);
    const allCards = [];
    
    gameCards.forEach((card, index) => {
      allCards.push({
        id: `term-${index}`,
        content: card.term,
        type: 'term',
        pairId: index
      });
      allCards.push({
        id: `def-${index}`,
        content: card.definition,
        type: 'definition',
        pairId: index
      });
    });
    
    setMatchingCards(shuffleArray(allCards));
    setSelectedCards([]);
    setMatchedPairs([]);
    setMatchingScore(0);
    setMatchingTime(0);
    setGameStarted(true);
  };

  const handleCardClick = (card) => {
    // If card is already matched, do nothing
    if (matchedPairs.includes(card.pairId)) {
      return;
    }
    
    // If card is already selected, unselect it
    const alreadySelected = selectedCards.find(c => c.id === card.id);
    if (alreadySelected) {
      setSelectedCards(prev => prev.filter(c => c.id !== card.id));
      return;
    }
    
    // If we already have 2 cards selected, do nothing
    if (selectedCards.length === 2) {
      return;
    }

    const newSelected = [...selectedCards, card];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      if (newSelected[0].pairId === newSelected[1].pairId) {
        // Correct match - add points
        setTimeout(() => {
          setMatchedPairs(prev => [...prev, card.pairId]);
          setSelectedCards([]);
          setMatchingScore(prev => prev + 10);
        }, 1000);
      } else {
        // Wrong match - deduct 5 points
        setTimeout(() => {
          setSelectedCards([]);
          setMatchingScore(prev => Math.max(0, prev - 5)); // Don't go below 0
        }, 1000);
      }
    }
  };

  const startQuiz = () => {
    const questions = shuffleArray(cards).slice(0, 10).map((card, index) => {
      const wrongAnswers = shuffleArray(cards.filter(c => c.id !== card.id)).slice(0, 3);
      const allAnswers = shuffleArray([card.definition, ...wrongAnswers.map(c => c.definition)]);
      
      return {
        id: index,
        question: card.term,
        correctAnswer: card.definition,
        options: allAnswers
      };
    });
    
    setQuizQuestions(questions);
    setCurrentQuestionIndex(0);
    setQuizScore(0);
    setSelectedAnswer('');
    setShowQuizResult(false);
    setQuizCompleted(false);
  };

  const startWordScramble = () => {
    const words = shuffleArray(cards).slice(0, 10).map((card, index) => ({
      id: index,
      original: card.term,
      scrambled: card.term.split('').sort(() => Math.random() - 0.5).join(''),
      definition: card.definition
    }));
    
    setScrambleWords(words);
    setCurrentScrambleIndex(0);
    setScrambleInput('');
    setScrambleScore(0);
    setScrambleCompleted(false);
    setShowScrambleResult(false);
  };

  const handleScrambleSubmit = () => {
    const currentWord = scrambleWords[currentScrambleIndex];
    const isCorrect = scrambleInput.toLowerCase().trim() === currentWord.original.toLowerCase();
    
    setShowScrambleResult(true);
    if (isCorrect) {
      setScrambleScore(prev => prev + 1);
    }
    
if (currentScrambleIndex === scrambleWords.length - 1) {
  setTimeout(() => setScrambleCompleted(true), 2000);
}
};  

  const startFindTerms = () => {
    const clues = shuffleArray(cards).slice(0, 8).map((card, index) => ({
      id: index + 1,
      clue: card.definition,
      answer: card.term.toUpperCase().replace(/\s/g, ''),
      length: card.term.replace(/\s/g, '').length
    }));
    
    setfindTermsClues(clues);
    setfindTermsAnswers({});
  };

  const handleQuizAnswer = (answer) => {
    setSelectedAnswer(answer);
    setShowQuizResult(true);
    
    if (answer === quizQuestions[currentQuestionIndex].correctAnswer) {
      setQuizScore(prev => prev + 1);
    }
    
   if (currentQuestionIndex === quizQuestions.length - 1) {
  setTimeout(() => setQuizCompleted(true), 2000);
}
};  

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (currentMode === 'unit-selector') {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-indigo-50 to-purple-100 min-h-screen">
        <div className="text-center mb-8">
          <div className="bg-indigo-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🧠</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Psychology Review Hub</h1>
          <p className="text-lg text-gray-600">Choose a unit to start studying</p>
        </div>

        {loading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading unit...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableUnits.map((unit) => (
              <div 
                key={unit.id}
                onClick={() => loadUnit(unit)}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
              >
                <div className="text-center">
                  <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-indigo-600">{unit.name.split(' ')[1]}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{unit.name}</h3>
                  <p className="text-gray-600 text-sm">{unit.description}</p>
                  <div className="mt-4 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium">
                    Click to Start
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">More units will be added every two weeks!</p>
        </div>
      </div>
    );
  }

  if (currentMode === 'home') {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              {currentUnit ? currentUnit.name : 'Psychology'} Review Hub
            </h1>
            <p className="text-lg text-gray-600">Master your psychology terms with multiple study modes</p>
            <p className="text-sm text-gray-500 mt-1">{cards.length} terms loaded</p>
          </div>
          <button
            onClick={() => setCurrentMode('unit-selector')}
            className="flex items-center px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
          >
            📚 Choose Unit
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer" onClick={() => setCurrentMode('flashcards')}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Flashcards</h2>
              <div className="bg-blue-100 p-3 rounded-full">
                <RotateCcw className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <p className="text-gray-600">Study with traditional flashcards. Flip cards to see definitions and track your progress.</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer" onClick={() => { setCurrentMode('matching'); startMatchingGame(); }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Matching Game</h2>
              <div className="bg-green-100 p-3 rounded-full">
                <Trophy className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <p className="text-gray-600">Match terms with their definitions in this fun, timed memory game.</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer" onClick={() => { setCurrentMode('quiz'); startQuiz(); }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Multiple Choice Quiz</h2>
              <div className="bg-purple-100 p-3 rounded-full">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <p className="text-gray-600">Test your knowledge with multiple choice questions and get instant feedback.</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer" onClick={() => { setCurrentMode('word-scramble'); startWordScramble(); }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Word Scramble</h2>
              <div className="bg-orange-100 p-3 rounded-full">
                <span className="text-orange-600 text-xl">🔤</span>
              </div>
            </div>
            <p className="text-gray-600">Unscramble psychology terms using their definitions as hints.</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer" onClick={() => { setCurrentMode('find-terms'); startFindTerms(); }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Find the Term</h2>
              <div className="bg-red-100 p-3 rounded-full">
                <span className="text-red-600 text-xl">🧩</span>
              </div>
            </div>
            <p className="text-gray-600">Find the term using psychology definitions as clues.</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer" onClick={() => setCurrentMode('study-list')}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Study List</h2>
              <div className="bg-yellow-100 p-3 rounded-full">
                <span className="text-yellow-600 text-xl">📋</span>
              </div>
            </div>
            <p className="text-gray-600">View all terms and definitions in an organized list format for quick review.</p>
          </div>
        </div>
      </div>
    );
  }

  if (currentMode === 'flashcards') {
    const currentCard = shuffledCards[currentCardIndex];
    
    return (
      <div className="max-w-2xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentMode('home')}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <Home className="h-5 w-5 mr-2" />
            Home
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            {currentUnit ? `${currentUnit.name} - ` : ''}Flashcards
          </h1>
          <div className="flex space-x-2">
            <button
              onClick={handleShuffle}
              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              title="Shuffle cards"
            >
              <Shuffle className="h-5 w-5" />
            </button>
            <button
              onClick={handleReset}
              className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              title="Reset order"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="text-center mb-4">
          <span className="text-sm text-gray-600">
            Card {currentCardIndex + 1} of {shuffledCards.length}
            {isShuffled && <span className="ml-2 text-blue-600">(Shuffled)</span>}
          </span>
        </div>

        {currentCard && (
          <div className="bg-white rounded-xl shadow-lg mb-6">
            <div 
              className="p-8 min-h-64 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setShowAnswer(!showAnswer)}
            >
              <div className="text-center">
                <div className="text-lg text-gray-600 mb-4">
                  {showAnswer ? 'Definition' : 'Term'}
                </div>
                <div className="text-xl font-medium text-gray-800">
                  {showAnswer ? currentCard.definition : currentCard.term}
                </div>
                <div className="text-sm text-gray-500 mt-4">
                  Click to {showAnswer ? 'hide' : 'show'} {showAnswer ? 'term' : 'definition'}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center">
          <button
            onClick={prevCard}
            className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Previous
          </button>
          
          <button
            onClick={() => setShowAnswer(!showAnswer)}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            {showAnswer ? 'Show Term' : 'Show Definition'}
          </button>
          
          <button
            onClick={nextCard}
            className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Next
            <ChevronRight className="h-5 w-5 ml-1" />
          </button>
        </div>
      </div>
    );
  }

  if (currentMode === 'matching') {
    const isGameComplete = matchedPairs.length === matchingCards.length / 2;
    
    return (
      <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-green-50 to-emerald-100 min-h-screen">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentMode('home')}
            className="flex items-center text-green-600 hover:text-green-800"
          >
            <Home className="h-5 w-5 mr-2" />
            Home
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Matching Game</h1>
          <div className="text-right">
            <div className="text-sm text-gray-600">Time: {formatTime(matchingTime)}</div>
            <div className="text-sm text-gray-600">Score: {matchingScore}</div>
          </div>
        </div>

        {isGameComplete ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Congratulations!</h2>
            <p className="text-lg text-gray-600 mb-4">You completed the matching game!</p>
            <div className="text-xl font-semibold text-green-600 mb-6">
              Final Score: {matchingScore} points in {formatTime(matchingTime)}
            </div>
            <button
              onClick={startMatchingGame}
              className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 mr-4"
            >
              Play Again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {matchingCards.map((card) => {
              const isSelected = selectedCards.find(c => c.id === card.id);
              const isMatched = matchedPairs.includes(card.pairId);
              
              return (
                <div
                  key={card.id}
                  onClick={() => handleCardClick(card)}
                  className={`
                    p-4 rounded-lg cursor-pointer transition-all text-center min-h-24 flex items-center justify-center
                    ${isMatched ? 'bg-green-200 text-green-800' : 
                      isSelected ? 'bg-blue-200 text-blue-800' : 
                      'bg-white text-gray-800 hover:bg-gray-50'}
                    ${isMatched || (selectedCards.length === 2 && !isSelected) ? 'cursor-not-allowed' : ''}
                  `}
                >
                  <div className="text-sm font-medium">{card.content}</div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-gray-600">Match terms with their definitions</p>
          <p className="text-sm text-gray-500">Matched: {matchedPairs.length} / {matchingCards.length / 2}</p>
        </div>
      </div>
    );
  }

  if (currentMode === 'word-scramble') {
    if (scrambleCompleted) {
      return (
        <div className="max-w-2xl mx-auto p-6 bg-gradient-to-br from-orange-50 to-red-100 min-h-screen">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Word Scramble Complete!</h2>
            <div className="text-4xl font-bold text-orange-600 mb-4">
              {scrambleScore} / {scrambleWords.length}
            </div>
            <div className="text-lg text-gray-600 mb-6">
              {Math.round((scrambleScore / scrambleWords.length) * 100)}% Correct
            </div>
            <button
              onClick={startWordScramble}
              className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 mr-4"
            >
              Play Again
            </button>
            <button
              onClick={() => setCurrentMode('home')}
              className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600"
            >
              Back to Home
            </button>
          </div>
        </div>
      );
    }

    const currentWord = scrambleWords[currentScrambleIndex];
    
    return (
      <div className="max-w-2xl mx-auto p-6 bg-gradient-to-br from-orange-50 to-red-100 min-h-screen">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentMode('home')}
            className="flex items-center text-orange-600 hover:text-orange-800"
          >
            <Home className="h-5 w-5 mr-2" />
            Home
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Word Scramble</h1>
          <div className="text-sm text-gray-600">
            {currentScrambleIndex + 1} / {scrambleWords.length}
          </div>
        </div>

        {currentWord && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-center mb-6">
              <h3 className="text-lg text-gray-600 mb-4">Definition (Hint):</h3>
              <p className="text-xl text-gray-800 mb-6 italic">"{currentWord.definition}"</p>
              
              <h3 className="text-lg text-gray-600 mb-4">Unscramble this word:</h3>
              <div className="text-3xl font-mono font-bold text-orange-600 mb-6 tracking-widest">
                {currentWord.scrambled}
              </div>

              <input
                type="text"
                value={scrambleInput}
                onChange={(e) => setScrambleInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !showScrambleResult && handleScrambleSubmit()}
                className="w-full max-w-md px-4 py-3 text-xl text-center border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none mb-6"
                placeholder="Type your answer here..."
                disabled={showScrambleResult}
              />

              {!showScrambleResult && (
                <button
                  onClick={handleScrambleSubmit}
                  disabled={!scrambleInput.trim()}
                  className="bg-orange-500 text-white px-8 py-3 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Answer
                </button>
              )}

              {showScrambleResult && (
                <div className="mt-6">
                  {scrambleInput.toLowerCase().trim() === currentWord.original.toLowerCase() ? (
                    <div className="text-green-600 font-semibold text-xl">
                      ✓ Correct! The answer is "{currentWord.original}"
                    </div>
                  ) : (
                    <div className="text-red-600 font-semibold text-xl">
                      ✗ Incorrect. The answer is "{currentWord.original}"
                    </div>
                  )}
                  
                  {currentScrambleIndex < scrambleWords.length - 1 && (
                    <button
                      onClick={() => {
                        setCurrentScrambleIndex(prev => prev + 1);
                        setScrambleInput('');
                        setShowScrambleResult(false);
                      }}
                      className="mt-4 bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600"
                    >
                      Next Word
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="text-center text-sm text-gray-600">
              Score: {scrambleScore} / {currentScrambleIndex + (showScrambleResult ? 1 : 0)}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (currentMode === 'find-terms') {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-red-50 to-pink-100 min-h-screen">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentMode('home')}
            className="flex items-center text-red-600 hover:text-red-800"
          >
            <Home className="h-5 w-5 mr-2" />
            Home
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Find the Terms</h1>
          <div className="text-sm text-gray-600">
            {Object.keys(findTermsAnswers).length} / {findTermsClues.length} completed
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Find the Terms - Enter the psychology terms:</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {findTermsClues.map((clue) => (
              <div key={clue.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <span className="font-semibold text-red-600 text-lg">{clue.id}.</span>
                  <span className="text-sm text-gray-500">({clue.length} letters)</span>
                </div>
                
                <p className="text-gray-700 mb-3 italic">"{clue.clue}"</p>
                
                <input
                  type="text"
                  value={findTermsAnswers[clue.id] || ''}
                  onChange={(e) => setfindTermsAnswers(prev => ({
                    ...prev,
                    [clue.id]: e.target.value.toUpperCase()
                  }))}
                  className={`w-full px-3 py-2 border-2 rounded focus:outline-none font-mono tracking-widest
                    ${findTermsAnswers[clue.id]?.replace(/\s/g, '') === clue.answer 
                      ? 'border-green-500 bg-green-50 text-green-700' 
                      : 'border-gray-300 focus:border-red-500'}`}
                  placeholder={`${clue.length} letters...`}
                  maxLength={clue.length + 5}
                />
                
                {findTermsAnswers[clue.id]?.replace(/\s/g, '') === clue.answer && (
                  <div className="text-green-600 text-sm mt-2 font-semibold">✓ Correct!</div>
                )}
              </div>
            ))}
          </div>

          {Object.values(findTermsAnswers).filter((answer, index) => 
            answer?.replace(/\s/g, '') === findTermsClues[index]?.answer
          ).length === findTermsClues.length && findTermsClues.length > 0 && (
            <div className="mt-8 text-center">
              <div className="bg-green-100 border border-green-500 rounded-lg p-6">
                <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
                <h3 className="text-2xl font-bold text-green-800 mb-2">Find the Term Complete!</h3>
                <p className="text-green-700">You solved all the clues! Great job!</p>
                <button
                  onClick={startFindTerms}
                  className="mt-4 bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600"
                >
                  New Find the Term
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (currentMode === 'quiz') {
    if (quizCompleted) {
      return (
        <div className="max-w-2xl mx-auto p-6 bg-gradient-to-br from-purple-50 to-violet-100 min-h-screen">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Quiz Complete!</h2>
            <div className="text-4xl font-bold text-purple-600 mb-4">
              {quizScore} / {quizQuestions.length}
            </div>
            <div className="text-lg text-gray-600 mb-6">
              {Math.round((quizScore / quizQuestions.length) * 100)}% Correct
            </div>
            <button
              onClick={startQuiz}
              className="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 mr-4"
            >
              Take Another Quiz
            </button>
            <button
              onClick={() => setCurrentMode('home')}
              className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600"
            >
              Back to Home
            </button>
          </div>
        </div>
      );
    }

    const currentQuestion = quizQuestions[currentQuestionIndex];
    
    return (
      <div className="max-w-2xl mx-auto p-6 bg-gradient-to-br from-purple-50 to-violet-100 min-h-screen">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentMode('home')}
            className="flex items-center text-purple-600 hover:text-purple-800"
          >
            <Home className="h-5 w-5 mr-2" />
            Home
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Multiple Choice Quiz</h1>
          <div className="text-sm text-gray-600">
            {currentQuestionIndex + 1} / {quizQuestions.length}
          </div>
        </div>

        {currentQuestion && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                What is the definition of: "{currentQuestion.question}"?
              </h3>
            </div>

            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleQuizAnswer(option)}
                  disabled={showQuizResult}
                  className={`
                    w-full p-4 text-left rounded-lg border transition-all
                    ${showQuizResult && option === currentQuestion.correctAnswer ? 'bg-green-100 border-green-500 text-green-800' :
                      showQuizResult && option === selectedAnswer && option !== currentQuestion.correctAnswer ? 'bg-red-100 border-red-500 text-red-800' :
                      selectedAnswer === option ? 'bg-purple-100 border-purple-500' :
                      'bg-gray-50 border-gray-200 hover:bg-gray-100'}
                    ${showQuizResult ? 'cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  {option}
                </button>
              ))}
            </div>

            {showQuizResult && (
              <div className="mt-6 text-center">
                {selectedAnswer === currentQuestion.correctAnswer ? (
                  <div className="text-green-600 font-semibold">Correct! ✓</div>
                ) : (
                  <div className="text-red-600 font-semibold">
                    Incorrect. The correct answer is: "{currentQuestion.correctAnswer}"
                  </div>
                )}
                
                {currentQuestionIndex < quizQuestions.length - 1 && (
                  <button
                    onClick={() => {
                      setCurrentQuestionIndex(prev => prev + 1);
                      setSelectedAnswer('');
                      setShowQuizResult(false);
                    }}
                    className="mt-4 bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600"
                  >
                    Next Question
                  </button>
                )}
              </div>
            )}

            <div className="mt-6 text-center text-sm text-gray-600">
              Score: {quizScore} / {currentQuestionIndex + (showQuizResult ? 1 : 0)}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (currentMode === 'study-list') {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-yellow-50 to-orange-100 min-h-screen">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentMode('home')}
            className="flex items-center text-yellow-600 hover:text-yellow-800"
          >
            <Home className="h-5 w-5 mr-2" />
            Home
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Study List</h1>
          <div className="text-sm text-gray-600">{cards.length} terms</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="max-h-[800px] overflow-y-auto">
            {cards.map((card, index) => (
              <div key={card.id} className={`p-4 border-b border-gray-200 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                <div className="font-semibold text-gray-800 mb-2">{card.term}</div>
                <div className="text-gray-600 text-sm">{card.definition}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default FlashcardStudyApp;
