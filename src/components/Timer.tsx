import { Typography } from "@mui/material";
import { useEffect, useState } from "react";

interface TimerProps {
  duration: number;
  onTimeout: () => void;
}

export default function Timer({ duration, onTimeout }: TimerProps) {
  const [time, setTime] = useState(duration);

  useEffect(() => {
    if (time <= 0) return onTimeout();
    const interval = setInterval(() => setTime(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [time, onTimeout]);

  return <Typography sx={{ textAlign: 'center', mt: 2 }}>נשאר זמן: {time} שניות</Typography>;
}
