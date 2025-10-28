import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Pause, RotateCcw, MapPin, Clock, Gauge } from 'lucide-react';
import type { RoutePoint } from '@/utils/mapUtils';

interface ControlPanelProps {
  currentPosition: RoutePoint;
  isPlaying: boolean;
  speed: string;
  currentIndex: number;
  totalPoints: number;
  onTogglePlay: () => void;
  onReset: () => void;
}

export function ControlPanel({
  currentPosition,
  isPlaying,
  speed,
  currentIndex,
  totalPoints,
  onTogglePlay,
  onReset,
}: ControlPanelProps) {
  const progress = totalPoints > 0 ? ((currentIndex + 1) / totalPoints) * 100 : 0;

  return (
    <Card className="absolute top-6 right-6 z-[1000] p-6 w-full max-w-sm backdrop-blur-md bg-card/95 border-glass-border shadow-[var(--shadow-glass)]">
      <div className="space-y-5">
        {/* Header */}
        <div>
          <h2 className="text-xl font-bold text-foreground mb-1">Vehicle Tracker</h2>
          <p className="text-sm text-muted-foreground">Real-time simulation</p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
            <MapPin className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-1">Coordinates</p>
              <p className="text-sm font-mono text-foreground truncate">
                {currentPosition.lat?.toFixed(6)}, {currentPosition.lng?.toFixed(6)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
            <Clock className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">Timestamp</p>
              <p className="text-sm font-medium text-foreground">
                {currentPosition.timestamp
                  ? new Date(currentPosition.timestamp).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })
                  : 'N/A'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
            <Gauge className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">Speed</p>
              <p className="text-sm font-medium text-foreground">{speed} km/h</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={onTogglePlay}
            className="flex-1 gap-2"
            size="lg"
            variant={isPlaying ? 'destructive' : 'default'}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Play
              </>
            )}
          </Button>
          <Button onClick={onReset} size="lg" variant="outline" className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center justify-center gap-2 pt-2 border-t">
          <div
            className={`w-2 h-2 rounded-full ${
              isPlaying ? 'bg-accent animate-pulse' : 'bg-muted-foreground'
            }`}
          />
          <span className="text-xs text-muted-foreground">
            {isPlaying ? 'Simulation Running' : 'Simulation Paused'}
          </span>
        </div>
      </div>
    </Card>
  );
}
