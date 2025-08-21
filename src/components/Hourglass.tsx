import { useEffect, useState } from 'react';

interface HourglassProps {
  isRunning: boolean;
  progress: number; // 0-100
  onComplete?: () => void;
}

export const Hourglass = ({ isRunning, progress, onComplete }: HourglassProps) => {
  const [shouldFlip, setShouldFlip] = useState(false);
  const [particles, setParticles] = useState<{ id: number; delay: number }[]>([]);

  useEffect(() => {
    if (isRunning) {
      setShouldFlip(true);
      // Generate sand particles
      const newParticles = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        delay: Math.random() * 2
      }));
      setParticles(newParticles);
      
      setTimeout(() => setShouldFlip(false), 600);
    } else {
      setParticles([]);
    }
  }, [isRunning]);

  useEffect(() => {
    if (progress >= 100 && isRunning) {
      onComplete?.();
    }
  }, [progress, isRunning, onComplete]);

  const topSandHeight = Math.max(0, 100 - progress);
  const bottomSandHeight = Math.min(100, progress);

  return (
    <div className="relative flex flex-col items-center">
      {/* Hourglass Container */}
      <div 
        className={`relative w-48 h-80 ${shouldFlip ? 'hourglass-flip' : ''}`}
        style={{ perspective: '1000px' }}
      >
        {/* Glass Frame */}
        <div className="absolute inset-0 glass-effect rounded-3xl">
          {/* Top Chamber */}
          <div className="absolute top-4 left-4 right-4 h-32 rounded-t-2xl overflow-hidden bg-muted/20">
            {/* Top Sand */}
            <div 
              className="absolute bottom-0 left-0 right-0 sand-particle rounded-b-lg transition-all duration-1000 ease-out"
              style={{ 
                height: `${topSandHeight}%`,
                borderRadius: '0 0 50% 50%'
              }}
            />
          </div>

          {/* Neck (narrow middle) */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-8 bg-gradient-to-b from-transparent via-primary/20 to-transparent" />

          {/* Bottom Chamber */}
          <div className="absolute bottom-4 left-4 right-4 h-32 rounded-b-2xl overflow-hidden bg-muted/20">
            {/* Bottom Sand */}
            <div 
              className="absolute bottom-0 left-0 right-0 sand-particle rounded-t-lg transition-all duration-1000 ease-out"
              style={{ 
                height: `${bottomSandHeight}%`,
                borderRadius: '50% 50% 0 0'
              }}
            />
            
            {/* Sand particles falling */}
            {isRunning && particles.map((particle) => (
              <div
                key={particle.id}
                className="absolute w-1 h-1 sand-particle rounded-full animate-sand-fall"
                style={{
                  left: `${45 + Math.random() * 10}%`,
                  top: '10px',
                  animationDelay: `${particle.delay}s`
                }}
              />
            ))}
          </div>

          {/* Decorative elements */}
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-primary/30 rounded-full" />
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-primary/30 rounded-full" />
        </div>

        {/* Progress indicator */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center">
          <div className="text-sm font-medium text-muted-foreground">
            {Math.round(progress)}%
          </div>
        </div>
      </div>

      {/* Completion glow effect */}
      {progress >= 100 && (
        <div className="absolute inset-0 animate-timer-complete rounded-3xl pointer-events-none" />
      )}
    </div>
  );
};