import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  RotateCcw, 
  Brain, 
  Play, 
  Star,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Construction,
  Truck,
  Wind,
  Moon,
  Sun,
  Flame,
  Droplets,
  Zap,
  Gamepad2,
  Coffee,
  Activity,
  Award,
  BookOpen,
  ArrowRight,
  X,
  Circle
} from 'lucide-react';
import { cn } from '../lib/utils';

// Types and Icons
interface Card {
  id: number;
  content: React.ReactNode;
  contentId: string | number;
  isFlipped: boolean;
  isMatched: boolean;
}

const SYMBOLS = [
  { id: 'c', val: <Construction size={42} strokeWidth={2.5} /> },
  { id: 't', val: <Truck size={42} strokeWidth={2.5} /> },
  { id: 'w', val: <Wind size={42} strokeWidth={2.5} /> },
  { id: 'm', val: <Moon size={42} strokeWidth={2.5} /> },
  { id: 's', val: <Sun size={42} strokeWidth={2.5} /> },
  { id: 'f', val: <Flame size={42} strokeWidth={2.5} /> },
  { id: 'd', val: <Droplets size={42} strokeWidth={2.5} /> },
  { id: 'z', val: <Zap size={42} strokeWidth={2.5} /> },
  { id: '1', val: '1' },
  { id: '2', val: '2' },
  { id: '3', val: '3' },
  { id: '4', val: '4' },
  { id: '5', val: '5' },
  { id: '6', val: '6' },
  { id: '7', val: '7' },
  { id: '8', val: '8' },
];

const WINNING_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6]             // Diagonals
];

// Synth sounds using Web Audio API
const playSuccessSound = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
    osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.3);
  } catch (e) {}
};

const playFailureSound = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, audioCtx.currentTime); // A3
    osc.frequency.setValueAtTime(147, audioCtx.currentTime + 0.13); // D3
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.4);
  } catch (e) {}
};

const playClickSound = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(330, audioCtx.currentTime); // E4
    gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.08);
  } catch (e) {}
};

export default function MemoryGame() {
  const [activeSubTab, setActiveSubTab] = useState<'memory' | 'tictactoe'>('memory');

  // Memory Game States
  const [level, setLevel] = useState(1);
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('memory_high_score');
    return saved ? parseInt(saved) : 0;
  });

  // Tic-Tac-Toe States
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState<boolean>(true); // Human is X
  const [difficulty, setDifficulty] = useState<'easy' | 'hard'>('hard');
  const [xoWinner, setXoWinner] = useState<string | 'draw' | null>(null);
  const [xoScore, setXoScore] = useState(() => {
    const saved = localStorage.getItem('xo_score');
    return saved ? JSON.parse(saved) : { wins: 0, losses: 0, draws: 0 };
  });
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);

  // Initialize Memory Game Card Deck
  const initGame = useCallback(() => {
    const pairsCount = Math.min(2 + level, SYMBOLS.length);
    const selected = [...SYMBOLS].sort(() => 0.5 - Math.random()).slice(0, pairsCount);
    
    const gameCards: Card[] = [];
    selected.forEach((symbol, index) => {
      gameCards.push({
        id: index * 2,
        content: symbol.val,
        contentId: symbol.id,
        isFlipped: false,
        isMatched: false,
      });
      gameCards.push({
        id: index * 2 + 1,
        content: symbol.val,
        contentId: symbol.id,
        isFlipped: false,
        isMatched: false,
      });
    });

    setCards(gameCards.sort(() => 0.5 - Math.random()));
    setFlippedCards([]);
    setMoves(0);
    setIsWon(false);
  }, [level]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const handleCardClick = (id: number) => {
    if (flippedCards.length === 2 || cards.find(c => c.id === id)?.isFlipped || cards.find(c => c.id === id)?.isMatched) {
      return;
    }

    playClickSound();

    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);
    
    setCards(prev => prev.map(c => c.id === id ? { ...c, isFlipped: true } : c));

    if (newFlipped.length === 2) {
      setMoves(prev => prev + 1);
      const [firstId, secondId] = newFlipped;
      const firstCard = cards.find(c => c.id === firstId);
      const secondCard = cards.find(c => c.id === secondId);

      if (firstCard?.contentId === secondCard?.contentId) {
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === firstId || c.id === secondId ? { ...c, isMatched: true, isFlipped: true } : c
          ));
          setFlippedCards([]);
          playSuccessSound();
        }, 300);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === firstId || c.id === secondId ? { ...c, isFlipped: false } : c
          ));
          setFlippedCards([]);
        }, 800);
      }
    }
  };

  useEffect(() => {
    if (cards.length > 0 && cards.every(c => c.isMatched)) {
      setTimeout(() => setIsWon(true), 500);
      if (level > highScore) {
        setHighScore(level);
        localStorage.setItem('memory_high_score', level.toString());
      }
    }
  }, [cards, level, highScore]);

  const nextLevel = () => {
    setLevel(prev => prev + 1);
  };

  const resetProgress = () => {
    setLevel(1);
    initGame();
  };

  const checkWinner = (tempBoard: (string | null)[]) => {
    for (const combo of WINNING_COMBOS) {
      const [a, b, c] = combo;
      if (tempBoard[a] && tempBoard[a] === tempBoard[b] && tempBoard[a] === tempBoard[c]) {
        return { winner: tempBoard[a], combo };
      }
    }
    if (tempBoard.every(cell => cell !== null)) {
      return { winner: 'draw', combo: null };
    }
    return null;
  };

  const handleCellClick = (index: number) => {
    if (board[index] || xoWinner || isAiThinking || !isXNext) return;

    playClickSound();
    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);
    setIsXNext(false);

    const winResult = checkWinner(newBoard);
    if (winResult) {
      if (winResult.winner === 'X') {
        setXoWinner('X');
        setWinningLine(winResult.combo);
        const updatedScore = { ...xoScore, wins: xoScore.wins + 1 };
        setXoScore(updatedScore);
        localStorage.setItem('xo_score', JSON.stringify(updatedScore));
        playSuccessSound();
      } else if (winResult.winner === 'draw') {
        setXoWinner('draw');
        const updatedScore = { ...xoScore, draws: xoScore.draws + 1 };
        setXoScore(updatedScore);
        localStorage.setItem('xo_score', JSON.stringify(updatedScore));
        playClickSound();
      }
    } else {
      // Trigger AI turn
      setIsAiThinking(true);
    }
  };

  // Automated smart computer adaptive AI move
  useEffect(() => {
    if (!isXNext && !xoWinner && isAiThinking) {
      const timer = setTimeout(() => {
        const availableMoves = board.map((val, idx) => val === null ? idx : null).filter((v): v is number => v !== null);
        if (availableMoves.length === 0) {
          setIsAiThinking(false);
          return;
        }

        let chosenMove: number | null = null;

        // Smart decision mode:
        if (difficulty === 'hard') {
          // 1. Can AI win immediately?
          for (const combo of WINNING_COMBOS) {
            const [a, b, c] = combo;
            const values = [board[a], board[b], board[c]];
            const oCount = values.filter(v => v === 'O').length;
            const nullCount = values.filter(v => v === null).length;
            if (oCount === 2 && nullCount === 1) {
              const emptyIdx = combo.find(idx => board[idx] === null);
              if (emptyIdx !== undefined) {
                chosenMove = emptyIdx;
                break;
              }
            }
          }

          // 2. Can AI block Human from winning?
          if (chosenMove === null) {
            for (const combo of WINNING_COMBOS) {
              const [a, b, c] = combo;
              const values = [board[a], board[b], board[c]];
              const xCount = values.filter(v => v === 'X').length;
              const nullCount = values.filter(v => v === null).length;
              if (xCount === 2 && nullCount === 1) {
                const emptyIdx = combo.find(idx => board[idx] === null);
                if (emptyIdx !== undefined) {
                  chosenMove = emptyIdx;
                  break;
                }
              }
            }
          }

          // 3. Take the center (4) if empty
          if (chosenMove === null && board[4] === null) {
            chosenMove = 4;
          }

          // 4. Take empty corners
          if (chosenMove === null) {
            const corners = [0, 2, 6, 8].filter(idx => board[idx] === null);
            if (corners.length > 0) {
              chosenMove = corners[Math.floor(Math.random() * corners.length)];
            }
          }
        } else {
          // Easy mode has 40% checking chance
          const shouldBeSmart = Math.random() < 0.4;
          if (shouldBeSmart) {
            // Pick block or win
            for (const combo of WINNING_COMBOS) {
              const [a, b, c] = combo;
              const values = [board[a], board[b], board[c]];
              const xCount = values.filter(v => v === 'X').length;
              const nullCount = values.filter(v => v === null).length;
              if (xCount === 2 && nullCount === 1) {
                const emptyIdx = combo.find(idx => board[idx] === null);
                if (emptyIdx !== undefined) {
                  chosenMove = emptyIdx;
                  break;
                }
              }
            }
          }
        }

        // 5. Default back to random if no decision made
        if (chosenMove === null && availableMoves.length > 0) {
          chosenMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
        }

        if (chosenMove !== null) {
          const newBoard = [...board];
          newBoard[chosenMove] = 'O';
          setBoard(newBoard);
          setIsXNext(true);
          setIsAiThinking(false);

          const winResult = checkWinner(newBoard);
          if (winResult) {
            if (winResult.winner === 'O') {
              setXoWinner('O');
              setWinningLine(winResult.combo);
              const updatedScore = { ...xoScore, losses: xoScore.losses + 1 };
              setXoScore(updatedScore);
              localStorage.setItem('xo_score', JSON.stringify(updatedScore));
              playFailureSound();
            } else if (winResult.winner === 'draw') {
              setXoWinner('draw');
              const updatedScore = { ...xoScore, draws: xoScore.draws + 1 };
              setXoScore(updatedScore);
              localStorage.setItem('xo_score', JSON.stringify(updatedScore));
              playClickSound();
            }
          }
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [board, isXNext, xoWinner, isAiThinking, difficulty, xoScore]);

  const resetXoGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setXoWinner(null);
    setWinningLine(null);
    setIsAiThinking(false);
  };

  const resetXoScores = () => {
    const fresh = { wins: 0, losses: 0, draws: 0 };
    setXoScore(fresh);
    localStorage.setItem('xo_score', JSON.stringify(fresh));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 text-right" dir="rtl">
      
      {/* Tab Switcher inside the employee break module */}
      <div className="flex bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 max-w-xl mx-auto">
        <button 
          onClick={() => { playClickSound(); setActiveSubTab('memory'); }}
          className={cn(
            "flex-1 py-3 text-center rounded-xl font-bold text-xs md:text-sm transition-all duration-200 flex items-center justify-center gap-1.5",
            activeSubTab === 'memory' 
              ? 'bg-municipality-blue text-white shadow-md' 
              : 'text-gray-500 hover:text-municipality-blue hover:bg-slate-50'
          )}
        >
          <Gamepad2 size={16} />
          تحدي الذاكرة البصرية 🧩
        </button>
        <button 
          onClick={() => { playClickSound(); setActiveSubTab('tictactoe'); }}
          className={cn(
            "flex-1 py-3 text-center rounded-xl font-bold text-xs md:text-sm transition-all duration-200 flex items-center justify-center gap-1.5",
            activeSubTab === 'tictactoe' 
              ? 'bg-municipality-blue text-white shadow-md' 
              : 'text-gray-500 hover:text-municipality-blue hover:bg-slate-50'
          )}
        >
          <Award size={16} />
          تحدي إكس أو الذكي ❌⭕
        </button>
      </div>

      {/* HEADER BANNER FOR EMPLOYEE BREAK */}
      <div className="bg-gradient-to-r from-teal-800 to-municipality-blue text-white rounded-3xl p-6 shadow-lg border border-teal-700/30 relative overflow-hidden text-center">
        <div className="absolute top-[-40px] right-[-30px] w-28 h-28 bg-white/5 rounded-full pointer-events-none" />
        <div className="absolute bottom-[-45px] left-[-35px] w-32 h-32 bg-white/5 rounded-full pointer-events-none" />
        
        <h2 className="text-2xl font-black mb-1.5 flex items-center justify-center gap-2">
          <Coffee className="animate-pulse text-amber-300" />
          استراحة الموظف الميدانية ☕
        </h2>
        <p className="text-teal-50/85 text-xs font-medium max-w-lg mx-auto leading-relaxed">
          أهلاً ومرحباً بك زميلنا المفتش في مركز 139 ببلدية الكويت. خصصنا لك هذا الفضاء للتسلية الذهنية واسترجاع الثقافة المنظمة للعمل وتحديث نشاطك قبل مواصلة الجولات الرقابية!
        </p>
      </div>

      {/* RENDER ACTIVE TAB */}
      
      {/* 1. VISUAL MEMORY GAME TAB */}
      {activeSubTab === 'memory' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center">
              <p className="text-[10px] font-black text-gray-400 mb-0.5">المستوى الحالي</p>
              <p className="text-xl font-black text-municipality-blue leading-none">{level}</p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center">
              <p className="text-[10px] font-black text-gray-400 mb-0.5">عدد النقرات الحركية</p>
              <p className="text-xl font-black text-gray-700 leading-none">{moves}</p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center">
              <p className="text-[10px] font-black text-gray-400 mb-0.5">أعلى مستوى محرز</p>
              <p className="text-xl font-black text-municipality-gold leading-none">{highScore}</p>
            </div>
          </div>

          <div className="bg-slate-50 p-5 rounded-[2rem] border border-gray-200 shadow-inner flex items-center justify-center min-h-[420px]">
            <div className={cn(
              "grid gap-3 w-full max-w-xl mx-auto",
              level <= 1 ? "grid-cols-2" : level <= 4 ? "grid-cols-3 sm:grid-cols-4" : "grid-cols-4 sm:grid-cols-6"
            )}>
              <AnimatePresence mode="popLayout">
                {cards.map((card) => (
                  <motion.div
                    key={card.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileTap={{ scale: 0.95 }}
                    className="aspect-square relative cursor-pointer group"
                    onClick={() => handleCardClick(card.id)}
                  >
                    <div className={cn(
                      "absolute inset-0 preserve-3d transition-all duration-500 rounded-2xl border shadow-sm flex items-center justify-center",
                      card.isFlipped ? "rotate-y-180 bg-white border-municipality-blue" : "bg-gradient-to-br from-white to-slate-50 border-gray-200 hover:border-gray-300"
                    )}>
                      {/* Front (Content) */}
                      <div className={cn(
                        "absolute inset-0 flex items-center justify-center backface-hidden rotate-y-180 rounded-2xl",
                        card.isMatched ? "bg-green-50 text-green-600" : "bg-white text-slate-800"
                      )}>
                        <div className="font-black text-3xl sm:text-4xl">{card.content}</div>
                      </div>
                      
                      {/* Back (Pattern) */}
                      <div className="absolute inset-0 flex items-center justify-center backface-hidden bg-slate-900 border-slate-800 overflow-hidden rounded-2xl">
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 0.5px, transparent 0)', backgroundSize: '8px 8px' }}></div>
                        <Gamepad2 size={24} className="text-white opacity-25" />
                      </div>
                    </div>
                    
                    {/* Match Sparkle icon */}
                    {card.isMatched && (
                       <motion.div 
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute -top-1 -right-1 text-green-500 z-10 bg-white rounded-full p-0.5 shadow-sm"
                       >
                         <CheckCircle2 size={16} fill="currentColor" className="text-white" />
                       </motion.div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-slate-100 rounded-xl text-slate-400 shadow-inner">
                <Brain size={20} />
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-gray-700">درب ذاكرتك البصرية</p>
                <p className="text-[9px] text-gray-400 font-mono">Memory Focus Challenge</p>
              </div>
            </div>
            <button 
              onClick={() => { playClickSound(); resetProgress(); }}
              className="p-2.5 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-100"
              title="تصفير مستوى الذاكرة والبدء من جديد"
            >
              <RotateCcw size={18} />
            </button>
          </div>

          {/* Win Modal */}
          <AnimatePresence>
            {isWon && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
              >
                <motion.div 
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  className="bg-white rounded-[2rem] p-8 max-w-sm w-full text-center shadow-2xl space-y-5"
                >
                  <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-500 border border-amber-100">
                    <Trophy size={36} className="animate-bounce" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 mb-1">ممتاز! تم حل اللغز بنجاح</h3>
                    <p className="text-gray-500 text-xs">لقد قمت بحل كافة التباديل وإنجاز المستوى {level} في غضون {moves} حركة.</p>
                  </div>
                  <div className="grid grid-cols-1 gap-2 pt-2">
                    <button 
                      onClick={() => { playClickSound(); nextLevel(); }}
                      className="w-full bg-municipality-blue text-white py-3.5 rounded-xl font-bold hover:bg-slate-950 transition-colors flex items-center justify-center gap-2 text-sm shadow-md"
                    >
                      <Play size={16} /> الانتقال للمستوى التالي ➔
                    </button>
                    <button 
                      onClick={() => { playClickSound(); initGame(); }}
                      className="w-full bg-slate-100 text-gray-600 py-2.5 rounded-xl font-bold hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5 text-xs"
                    >
                      <RotateCcw size={14} /> إعادة المستوى الحالي
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* 2. TICTACTOE GAME TAB (REPLACING QUIZ/RECHARGE) */}
      {activeSubTab === 'tictactoe' && (
        <div className="max-w-2xl mx-auto space-y-6">
          
          {/* Tic-Tac-Toe Header Stats */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
              <p className="text-[10px] font-black text-green-500 mb-0.5">انتصاراتك 🏆</p>
              <p className="text-xl font-black text-green-600 leading-none">{xoScore.wins}</p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
              <p className="text-[10px] font-black text-red-500 mb-0.5">الخسائر ❌</p>
              <p className="text-xl font-black text-red-600 leading-none">{xoScore.losses}</p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
              <p className="text-[10px] font-black text-amber-500 mb-0.5">التعادلات 🤝</p>
              <p className="text-xl font-black text-amber-600 leading-none">{xoScore.draws}</p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center cursor-pointer hover:bg-red-50 transition-colors" onClick={() => { playClickSound(); resetXoScores(); }}>
              <p className="text-[10px] font-black text-red-400 mb-0.5">تصفير السجل 🗑️</p>
              <p className="text-xs font-bold text-red-500">مسح النتائج</p>
            </div>
          </div>

          {/* Difficulty Toggler */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-right">
            <div className="text-right">
              <h4 className="text-xs font-black text-slate-700">مستوى ذكاء اللاعب التلقائي 🤖</h4>
              <p className="text-[11px] text-gray-400">تحكم بمدى صعوبة وذكاء كمبيوتر بلدية الكويت في الرد</p>
            </div>
            <div className="flex bg-slate-100 rounded-xl p-1 gap-1 shrink-0">
              <button
                onClick={() => { playClickSound(); setDifficulty('easy'); }}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200",
                  difficulty === 'easy'
                    ? "bg-white text-municipality-blue shadow-sm"
                    : "text-gray-500 hover:text-gray-700 hover:bg-white/40"
                )}
              >
                متدرب مبتدئ 👶
              </button>
              <button
                onClick={() => { playClickSound(); setDifficulty('hard'); }}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200",
                  difficulty === 'hard'
                    ? "bg-municipality-blue text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700 hover:bg-white/40"
                )}
              >
                رئيس المفتشين (خبير) 🔥
              </button>
            </div>
          </div>

          {/* Game Board Box */}
          <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-md border border-gray-100 space-y-6">
            
            {/* Turn or Status Indicator */}
            <div className="text-center py-2 border-b border-gray-50">
              <AnimatePresence mode="wait">
                {xoWinner ? (
                  <motion.div
                    key="winner"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="flex flex-col items-center justify-center gap-1"
                  >
                    {xoWinner === 'X' ? (
                      <span className="text-green-600 font-black text-base md:text-lg flex items-center gap-1.5">
                        🎉 ممتاز جداً! لقد تفوقت بجدارة وهزمت اللاعب الميداني التلقائي!
                      </span>
                    ) : xoWinner === 'O' ? (
                      <span className="text-rose-600 font-black text-base md:text-lg flex items-center gap-1.5">
                        🤖 خسارة مقبولة! الخصم التلقائي نجح بالانتصار. تفضل بالمحاولة مجدداً!
                      </span>
                    ) : (
                      <span className="text-amber-600 font-black text-base md:text-lg flex items-center gap-1.5">
                        🤝 انتهت بالتعادل! العقل البشري والآلي تصادما بقوة وحركة متكافئة
                      </span>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="active"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-sm font-bold flex items-center justify-center gap-2"
                  >
                    {isAiThinking ? (
                      <span className="text-amber-500 animate-pulse flex items-center gap-1.5">
                        <span className="inline-block w-2 bg-amber-500 rounded-full animate-ping"></span>
                        اللاعب التلقائي يحلل اللوحة ويخطط لحركته القادمة... 🤖💭
                      </span>
                    ) : (
                      <span className="text-municipality-blue flex items-center gap-1.5">
                        دورك الآن! انقر على أي خانة فارغة للعب بـ ❌
                      </span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 3x3 Grid */}
            <div className="grid grid-cols-3 gap-3 md:gap-4 max-w-xs mx-auto aspect-square">
              {board.map((cell, idx) => {
                const isWinnerCell = winningLine?.includes(idx);
                return (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: cell || xoWinner || isAiThinking ? 1 : 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={!!cell || !!xoWinner || isAiThinking || !isXNext}
                    onClick={() => handleCellClick(idx)}
                    className={cn(
                      "aspect-square rounded-2xl border flex items-center justify-center relative transition-all duration-200 shadow-sm",
                      isWinnerCell 
                        ? "bg-green-50 border-green-500 ring-4 ring-green-100/50" 
                        : "bg-slate-50/50 hover:bg-slate-50 border-gray-150 hover:border-gray-300"
                    )}
                  >
                    <AnimatePresence mode="wait">
                      {cell === 'X' && (
                        <motion.div
                          initial={{ scale: 0.3, opacity: 0, rotate: -45 }}
                          animate={{ scale: 1, opacity: 1, rotate: 0 }}
                          exit={{ scale: 0.3, opacity: 0 }}
                          className="text-rose-500 flex items-center justify-center"
                        >
                          <X size={38} className="stroke-[3.5]" />
                        </motion.div>
                      )}
                      {cell === 'O' && (
                        <motion.div
                          initial={{ scale: 0.3, opacity: 0, rotate: 45 }}
                          animate={{ scale: 1, opacity: 1, rotate: 0 }}
                          exit={{ scale: 0.3, opacity: 0 }}
                          className="text-amber-500 flex items-center justify-center"
                        >
                          <Circle size={34} className="stroke-[3.5]" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                );
              })}
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => { playClickSound(); resetXoGame(); }}
                className="bg-municipality-blue text-white px-8 py-3 rounded-2xl font-bold text-xs md:text-sm hover:bg-slate-950 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <RotateCcw size={15} />
                بدء جولة جديدة 🔄
              </button>
            </div>

          </div>

          {/* Hint Box */}
          <div className="bg-sky-50 p-4 rounded-2xl border border-sky-100 text-xs text-sky-800 leading-relaxed space-y-1 text-right">
            <h5 className="font-bold flex items-center gap-1 text-sky-950">
              💡 تلميحة المفتش الذكي للانتصار على الخوارزمية:
            </h5>
            <p className="text-[11px]">
              عند اللعب ضد كمبيوتر مبرمج، يفضل حجز مربع المنتصف أولاً أو البدء بإحدى زوايا اللوحة الأربعة. يبرز هذا التحدي مهاراتك الهجومية والدفاعية ويدغدغ روح العبقرية والتخطيط الذكي لديك!
            </p>
          </div>

        </div>
      )}

      {/* FOOTER STYLE */}
      <style>{`
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
}
