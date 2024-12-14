import React, { createContext, useState, useCallback } from "react";

// Define the context and its types
interface TimerContextType {
  timer: number;
  isRunning: boolean;
  startTimer: () => void;
  stopTimer: () => void;
  setTimer: (time: number) => void;
}

export const TimerContext = createContext<TimerContextType | undefined>(undefined);

// TimerContextProvider component
export const TimerContextProvider: React.FC = ({ children }) => {
  const [timer, setTimerState] = useState(0); // Initial timer state
  const [isRunning, setIsRunning] = useState(false);

  const startTimer = useCallback(() => {
    setIsRunning(true);
  }, []);

  const stopTimer = useCallback(() => {
    setIsRunning(false);
  }, []);

  const setTimer = (time: number) => {
    setTimerState(time);
  };

  return (
    <TimerContext.Provider
      value={{
        timer,
        isRunning,
        startTimer,
        stopTimer,
        setTimer,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};
