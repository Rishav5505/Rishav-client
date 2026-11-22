import { BugSmash, Memory, Reaction, TicTacToe, Typer } from './classic';
import { AimTrainer, DataStream, OrbitDodge, PacketCatcher, PingRally } from './arcade';
import { BugFinder, MiniSudoku, NeonToggle, SlidePuzzle, SpotShade } from './puzzle';
import { BinaryBlitz, ColorClash, EchoPattern, GuessNumber, MathSprint, TechQuiz, Unscramble, WordRescue } from './brain';
import { LineUp4, RPSAI } from './ai';

const mmss = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

export const categories = [
  { id: 'all', label: 'All games', icon: '✦' },
  { id: 'arcade', label: 'Arcade', icon: '🕹️' },
  { id: 'puzzle', label: 'Puzzle', icon: '🧩' },
  { id: 'brain', label: 'Brain', icon: '🧠' },
  { id: 'ai', label: 'vs AI', icon: '🤖' },
];

/**
 * Every game on the Games page. `best` is the localStorage key of the score
 * shown on its card and `fmt` formats it.
 */
export const games = [
  { id: 'stream', title: 'Data Stream', icon: '🐍', cat: 'arcade', tag: 'Classic · Keys/Swipe', badge: 'Hot', desc: 'Steer a growing stream of data around the grid. Grab packets, avoid your own tail.', C: DataStream, best: 'stream', fmt: (v) => `${v} packets` },
  { id: 'dodge', title: 'Orbit Dodge', icon: '🚀', cat: 'arcade', tag: 'Survival', badge: 'New', desc: 'Pilot your ship through an endless asteroid field. How far can you fly?', C: OrbitDodge, best: 'dodge', fmt: (v) => `${v} units` },
  { id: 'catcher', title: 'Packet Catcher', icon: '📦', cat: 'arcade', tag: '3 lives', desc: 'Catch falling data packets, dodge the virus invaders.', C: PacketCatcher, best: 'catcher', fmt: (v) => `${v} caught` },
  { id: 'bugs', title: 'Bug Smash', icon: '🐛', cat: 'arcade', tag: 'Reflex · 30s', desc: 'Squash bugs before they ship — but leave the coffee alone!', C: BugSmash, best: 'bugs', fmt: (v) => `${v} bugs` },
  { id: 'aim', title: 'Aim Trainer', icon: '🎯', cat: 'arcade', tag: 'Precision · 30s', desc: 'Hit the shrinking targets. Speed and accuracy both count.', C: AimTrainer, best: 'aim', fmt: (v) => `${v} hits` },
  { id: 'ping', title: 'Ping Rally', icon: '🏓', cat: 'ai', tag: 'First to 5', desc: 'A paddle duel against an AI opponent that gets faster every rally.', C: PingRally, best: 'ping', fmt: (v) => `${v} wins` },

  { id: 'memory', title: 'Tech Memory', icon: '🃏', cat: 'puzzle', tag: '8 pairs', desc: 'Flip and match my tech stack in as few moves as you can.', C: Memory, best: 'memory', lower: true, fmt: (v) => `${v} moves` },
  { id: 'slide', title: 'Slide Puzzle', icon: '🧩', cat: 'puzzle', tag: '3×3 · 4×4', desc: 'Slide the numbered tiles back into order. Classic brain-teaser.', C: SlidePuzzle, best: 'slide3', lower: true, fmt: (v) => `${v} moves` },
  { id: 'neon', title: 'Neon Toggle', icon: '💡', cat: 'puzzle', tag: 'Endless levels', badge: 'New', desc: 'Each tap flips a light and its neighbours. Switch the whole grid off.', C: NeonToggle, best: 'neon', fmt: (v) => `level ${v}` },
  { id: 'finder', title: 'Bug Finder', icon: '🔍', cat: 'puzzle', tag: 'Logic · 9×9', desc: 'Ten bugs hide in the codebase. Use the numbers to clear every safe line.', C: BugFinder, best: 'finder', lower: true, fmt: mmss },
  { id: 'sudoku', title: 'Mini Sudoku', icon: '🔢', cat: 'puzzle', tag: '4×4', desc: 'A bite-sized sudoku — every row, column and box gets 1 to 4.', C: MiniSudoku, best: 'sudoku', lower: true, fmt: mmss },
  { id: 'shade', title: 'Spot the Shade', icon: '👁️', cat: 'puzzle', tag: 'Eyes · 45s', desc: 'One tile is a slightly different colour. Find it — again and again.', C: SpotShade, best: 'shade', fmt: (v) => `level ${v}` },

  { id: 'typer', title: 'Code Typer', icon: '⌨️', cat: 'brain', tag: 'Typing · 30s', badge: 'Hot', desc: 'Type dev words against the clock. Measured in words per minute.', C: Typer, best: 'typer', fmt: (v) => `${v} WPM` },
  { id: 'reaction', title: 'Reaction Lab', icon: '⚡', cat: 'brain', tag: 'Reflex · 1 tap', desc: 'Wait for green, then tap. Your reaction time in milliseconds.', C: Reaction, best: 'reaction', lower: true, fmt: (v) => `${v} ms` },
  { id: 'echo', title: 'Echo Pattern', icon: '🎵', cat: 'brain', tag: 'Memory · Sound', desc: 'Watch and listen, then repeat the growing sequence of lights.', C: EchoPattern, best: 'echo', fmt: (v) => `${v} steps` },
  { id: 'math', title: 'Math Sprint', icon: '🧮', cat: 'brain', tag: 'Quick maths · 30s', desc: 'Solve as many sums as you can. They get harder as you go.', C: MathSprint, best: 'math', fmt: (v) => `${v} solved` },
  { id: 'clash', title: 'Color Clash', icon: '🎨', cat: 'brain', tag: 'Focus · 30s', desc: 'Does the word match its ink colour? Harder than it sounds.', C: ColorClash, best: 'clash', fmt: (v) => `${v} pts` },
  { id: 'quiz', title: 'Tech Quiz', icon: '❓', cat: 'brain', tag: '10 questions', desc: 'Web, dev and AI trivia. Prove you know your stack.', C: TechQuiz, best: 'quiz', fmt: (v) => `${v}/10` },
  { id: 'unscramble', title: 'Unscramble', icon: '🔤', cat: 'brain', tag: 'Words · 60s', desc: 'Re-arrange the jumbled letters into tech words.', C: Unscramble, best: 'unscramble', fmt: (v) => `${v} words` },
  { id: 'rescue', title: 'Word Rescue', icon: '🔋', cat: 'brain', tag: 'Guess letters', desc: 'Guess the hidden word before the robot’s battery runs out.', C: WordRescue, best: 'rescue', fmt: (v) => `${v} streak` },
  { id: 'binary', title: 'Binary Blitz', icon: '💾', cat: 'brain', tag: 'Bits · 60s', desc: 'Flip 8 bits to build each number. Think like a machine.', C: BinaryBlitz, best: 'binary', fmt: (v) => `${v} solved` },
  { id: 'guess', title: 'Guess My Number', icon: '🎲', cat: 'brain', tag: '1 – 100', desc: 'Higher or lower? Find the secret number in as few guesses as possible.', C: GuessNumber, best: 'guess', lower: true, fmt: (v) => `${v} guesses` },

  { id: 'ttt', title: 'Beat My AI', icon: '🤖', cat: 'ai', tag: 'Tic-tac-toe', desc: 'Play against a minimax AI. On Unbeatable, a draw is a victory.', C: TicTacToe, best: 'ttt-w', fmt: (v) => `${v} wins` },
  { id: 'line4', title: 'Line Up 4', icon: '🟣', cat: 'ai', tag: 'Strategy', badge: 'AI', desc: 'Drop discs and connect four before the look-ahead AI does.', C: LineUp4, best: 'c4-w', fmt: (v) => `${v} wins` },
  { id: 'rps', title: 'RPS vs AI', icon: '✊', cat: 'ai', tag: 'Learns you', badge: 'AI', desc: 'Rock-paper-scissors against a model that learns your habits.', C: RPSAI, best: 'rps', fmt: (v) => `+${v} lead` },
];

export const featuredId = 'dodge';
