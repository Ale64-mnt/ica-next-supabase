// File: app/components/ui/ProgressBar.tsx - AGGIORNATO
interface ProgressBarProps {
  value: number;
  max: number;
  className?: string;
  color?: string; // Nuova prop per colore personalizzato
}

export function ProgressBar({ 
  value, 
  max, 
  className = '', 
  color = 'bg-blue-600' 
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  return (
    <div 
      className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${className}`}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={`Progresso: ${percentage}%`}
    >
      <div 
        className={`h-full ${color} transition-all duration-300`}
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
}