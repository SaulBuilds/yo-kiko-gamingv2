import { motion, AnimatePresence } from 'framer-motion';

interface ScoreAnimationProps {
  points: number;
  isTetris: boolean;
  position: { x: number; y: number };
  onComplete: () => void;
}

export function ScoreAnimation({ points, isTetris, position, onComplete }: ScoreAnimationProps) {
  return (
    <AnimatePresence onExitComplete={onComplete}>
      <motion.div
        initial={{ opacity: 0, scale: 0.5, y: position.y, x: position.x }}
        animate={{
          opacity: [0, 1, 1, 0],
          scale: [0.5, 1.2, 1.2, 0.8],
          y: position.y - 50
        }}
        exit={{ opacity: 0, scale: 0 }}
        transition={{ duration: 1.5, times: [0, 0.2, 0.8, 1] }}
        className="absolute z-10 pointer-events-none"
      >
        <div className={`pixel-font text-2xl font-bold ${isTetris ? 'text-primary animate-pulse' : 'text-white'}`}>
          +{points}
        </div>
        {isTetris && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1.2 }}
            exit={{ opacity: 0, scale: 0 }}
            className="absolute inset-0 -z-10"
          >
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg" />
            <div className="text-lg text-center mt-8 text-primary">TETRIS!</div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
