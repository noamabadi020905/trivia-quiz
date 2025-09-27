/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import Home from "./pages/Home";
import ChapterGame from "./pages/ChapterGame";
import AllChaptersGame from "./pages/ChapterGame";
import ResultsWithMistakes from "./pages/ResultsWithMistakes";
import questionsData from "./data/questions.json";

export default function App() {
  const [mode, setMode] = useState<'home'|'chapter'|'all'|'results'>('home');
  const [currentChapter, setCurrentChapter] = useState<any>(null);
  const [score, setScore] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [wrongQuestions, setWrongQuestions] = useState<any[]>([]);

  const startChapter = (chapter: any) => { setCurrentChapter(chapter); setMode('chapter'); };
  const startAll = () => setMode('all');
  const finishGame = (s: number, t: number, wrongQs: any[]) => { setScore(s); setTotal(t); setWrongQuestions(wrongQs); setMode('results'); };
  const restart = () => { setMode('home'); setCurrentChapter(null); setScore(0); setTotal(0); setWrongQuestions([]); };

  if (mode === 'home') return <Home onStartChapter={startChapter} onPlayAll={startAll} />;
  if (mode === 'chapter') return <ChapterGame chapter={currentChapter} onFinish={finishGame} />;
  if (mode === 'all') return <AllChaptersGame questions={questionsData.flatMap(ch => ch.questions)} onFinish={finishGame} />;
  if (mode === 'results') return <ResultsWithMistakes score={score} total={total} wrongQuestions={wrongQuestions} onRestart={restart} />;

  return null;
}
