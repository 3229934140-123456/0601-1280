import { useEffect, useRef, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';

interface Props {
  title: string;
  value: number | string;
  unit?: string;
  icon: React.ReactNode;
  color: string;
  trend?: number;
  delay?: number;
}

const AnimatedNumber = ({ value, suffix = '' }: { value: number; suffix?: string }) => {
  const [display, setDisplay] = useState(0);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    const start = 0;
    const end = typeof value === 'number' ? value : 0;
    const duration = 1500;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setDisplay(start + (end - start) * easeOut);
      if (progress < 1) {
        ref.current = requestAnimationFrame(animate);
      }
    };

    ref.current = requestAnimationFrame(animate);
    return () => {
      if (ref.current) cancelAnimationFrame(ref.current);
    };
  }, [value]);

  return (
    <span>
      {typeof value === 'number' ? display.toFixed(value % 1 === 0 ? 0 : 1) : value}
      {suffix}
    </span>
  );
};

const StatCard = ({ title, value, unit, icon, color, trend, delay = 0 }: Props) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`card-glow p-5 relative overflow-hidden transition-all duration-700 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20"
        style={{ backgroundColor: color }}
      />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-dark-300 text-sm">{title}</span>
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${color}20`, color }}
          >
            {icon}
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold font-mono text-white">
            <AnimatedNumber value={typeof value === 'number' ? value : 0} />
          </span>
          {unit && <span className="text-dark-400 text-sm">{unit}</span>}
        </div>
        {trend !== undefined && (
          <div className={`mt-2 text-xs ${trend >= 0 ? 'text-primary-400' : 'text-danger-400'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% 较昨日
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
