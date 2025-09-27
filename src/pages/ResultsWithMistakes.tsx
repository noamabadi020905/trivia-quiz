interface ResultsProps {
  score: number;
  total: number;
  wrongQuestions: { question: string; answer: string }[];
  onRestart: () => void;
}

export default function ResultsWithMistakes({ score, total, wrongQuestions, onRestart }: ResultsProps) {
  return (
    <div style={{ padding: 20, color: "#FFD700", textAlign: 'center' }}>
      <h2>סיום החידון!</h2>
      <p>ניקוד: {score} / {total}</p>

      {wrongQuestions.length > 0 && (
        <>
          <h3>שאלות שבהן טעינו:</h3>
          <ul style={{ textAlign: 'right', listStyle: 'none', padding: 0 }}>
            {wrongQuestions.map((q, i) => (
              <li key={i} style={{ marginBottom: 10 }}>
                <strong>{q.question}</strong><br/>
                תשובה נכונה: {q.answer}
              </li>
            ))}
          </ul>
        </>
      )}

      <button
        style={{
          backgroundColor: '#FFA500',
          color: '#000',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer'
        }}
        onClick={onRestart}
      >
        חזרה לדף הבית
      </button>
    </div>
  );
}
