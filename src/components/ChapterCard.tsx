/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent, Typography, Button } from "@mui/material";

interface ChapterCardProps {
  chapter: { chapter: string };
  onStart: (chapter: any) => void;
}

export default function ChapterCard({ chapter, onStart }: ChapterCardProps) {
  return (
    <Card sx={{
      my: 2,
      p: 2,
      background: "linear-gradient(135deg, #4B0082, #000033)",
      color: "#FFD700",
      maxWidth: 400,
      margin: "auto"
    }}>
      <CardContent>
        <Typography variant="h5" sx={{ textAlign: 'center' }}>{chapter.chapter}</Typography>
        <Button
          variant="contained"
          color="warning"
          sx={{ mt: 2, width: '100%' }}
          onClick={() => onStart(chapter)}
        >
          התחלת פרק
        </Button>
      </CardContent>
    </Card>
  );
}
