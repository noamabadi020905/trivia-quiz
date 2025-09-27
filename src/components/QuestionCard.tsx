import { Card, CardContent, Typography, Button, Stack } from "@mui/material";
import { motion } from "framer-motion";
import { useState } from "react";

interface Question {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

interface QuestionCardProps {
  questionData: Question;
  onAnswer: (correct: boolean, questionData: Question) => void;
}

export default function QuestionCard({ questionData, onAnswer }: QuestionCardProps) {
  const [wrongAnswers, setWrongAnswers] = useState<string[]>([]);

  const handleClick = (opt: string) => {
    if (opt === questionData.answer) {
      onAnswer(true, questionData);
    } else {
      setWrongAnswers([...wrongAnswers, opt]);
      onAnswer(false, questionData);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card sx={{
        mt: 3,
        p: 2,
        background: "#1a0033",
        color: "#FFD700",
        width: '100%',
        maxWidth: 500,
        margin: 'auto'
      }}>
        <CardContent>
          <Typography variant="h6">{questionData.question}</Typography>
          <Stack spacing={1} sx={{ mt: 2 }}>
            {questionData.options.map(opt => (
              <Button
                key={opt}
                variant="contained"
                sx={{
                  backgroundColor: wrongAnswers.includes(opt) ? '#FF0000' : '#FFA500',
                  color: '#000'
                }}
                onClick={() => handleClick(opt)}
              >
                {opt}
              </Button>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </motion.div>
  );
}
