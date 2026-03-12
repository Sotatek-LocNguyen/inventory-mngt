'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: number | null;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  valueColor?: string;
  index?: number;
}

function AnimatedCounter({ value, className }: { value: number | null; className?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    if (value === null) return;
    const duration = 800;
    const start = performance.now();
    const from = ref.current ?? 0;

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (value! - from) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
    ref.current = value;
  }, [value]);

  if (value === null) return <span className={className}>—</span>;
  return <span className={className}>{display.toLocaleString()}</span>;
}

export function StatsCard({
  title,
  value,
  description,
  icon,
  iconBg,
  iconColor,
  valueColor = 'text-foreground',
  index = 0,
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1, ease: 'easeOut' }}
    >
      <Card className="hover:shadow-md transition-shadow duration-200 cursor-default">
        <CardContent className="pt-1">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {title}
            </span>
            <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', iconBg)}>
              <span className={cn('w-[18px] h-[18px]', iconColor)}>{icon}</span>
            </div>
          </div>
          <AnimatedCounter value={value} className={cn('text-2xl font-bold', valueColor)} />
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
