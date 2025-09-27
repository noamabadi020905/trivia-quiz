import { useState } from "react";
import QuestionCard from "../components/QuestionCard";
import Timer from "../components/Timer";

interface Question {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

interface GameProps {
  chapter?: { chapter: string; questions: Question[] };
  questions?: Question[];
  onFinish: (score: number, total: number, wrongQuestions: Question[]) => void;
}

export default function ChapterGame({ chapter, questions: questionsProp, onFinish }: GameProps) {
  const questions = chapter ? chapter.questions : questionsProp!;
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [wrongQuestions, setWrongQuestions] = useState<Question[]>([]);

  const handleAnswer = (correct: boolean, questionData: Question) => {
    if (correct) {
      setScore(score + 1);
      setIndex(index + 1);
    } else {
      if (!wrongQuestions.includes(questionData)) {
        setWrongQuestions([...wrongQuestions, questionData]);
      }
    }

    if (index + 1 >= questions.length && correct) {
      onFinish(score + 1, questions.length, wrongQuestions);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <Timer duration={30} onTimeout={() => handleAnswer(false, questions[index])} />
      <QuestionCard questionData={questions[index]} onAnswer={handleAnswer} />
    </div>
  );
}
