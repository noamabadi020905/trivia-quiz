/* eslint-disable @typescript-eslint/no-explicit-any */
import ChapterCard from "../components/ChapterCard";
import questionsData from "../data/questions.json";

interface HomeProps {
  onStartChapter: (chapter: any) => void;
  onPlayAll: () => void;
}

export default function Home({ onStartChapter, onPlayAll }: HomeProps) {
  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ color: "#FFD700", textAlign: 'center' }}>חידון פרקים</h1>
      {questionsData.map(chapter => (
        <ChapterCard key={chapter.chapter} chapter={chapter} onStart={onStartChapter} />
      ))}
      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <button
          style={{
            backgroundColor: '#FFA500',
            color: '#000',
            padding: '10px 20px',
            borderRadius: 8,
            border: 'none',
            cursor: 'pointer'
          }}
          onClick={onPlayAll}
        >
          לשחק את כל הפרקים
        </button>
      </div>
    </div>
  );
}
