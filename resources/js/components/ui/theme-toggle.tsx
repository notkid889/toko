import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, CloudSun } from 'lucide-react';
import { useAppearance } from '@/hooks/use-appearance';
import SparklesIcon from './spark-icon';
import { cn } from '@/lib/utils';

const ThemeToggle = () => {
  const { resolvedAppearance, toggleAppearance } = useAppearance();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const handleToggle = (event: React.MouseEvent<HTMLDivElement>) => {
    // 2. Check for View Transition support
    if (!document.startViewTransition) {
      toggleAppearance();
      return;
    }

    // 3. Set the coordinates for the CSS wave effect
    const x = event.clientX;
    const y = event.clientY;
    document.documentElement.style.setProperty('--x', `${x}px`);
    document.documentElement.style.setProperty('--y', `${y}px`);

    // 4. Wrap the state change in the transition
    document.startViewTransition(() => {
      toggleAppearance();
    });
  };
  if (!mounted) {
    return <div className="w-16 h-8 bg-neutral-200 rounded-full animate-pulse" />;
  }
  const isDark = resolvedAppearance === 'dark';
  return (
    <div 
      className="cursor-pointer"
      onClick={handleToggle}
    >
      {/* Track */}
      <div className={`
        relative w-16 h-8 rounded-full p-1 transition-colors duration-300 shadow-inner
        ${isDark ? 'bg-neutral-700 shadow-neutral-950' : 'bg-amber-300 shadow-yellow-700/30'}
      `}>
        
        {/* Thumb */}
        <motion.div 
          className="z-10 w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center overflow-hidden"
          animate={{ x: isDark ? 32 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          <motion.div
            key={isDark ? 'moon' : 'sun'}
            initial={{ y: 20, rotate: 45, opacity: 0 }}
            animate={{ y: 0, rotate: 0, opacity: 1 }}
            exit={{ y: -20, rotate: -45, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {isDark ? (
              <Moon size={14} className="text-slate-700 fill-slate-700" />
            ) : (
              <CloudSun size={14} className="text-amber-500 fill-amber-500" />
            )}
          </motion.div>
        </motion.div>

        {/* Background Icons (Optional for flavor) */}
        <div className={cn("absolute inset-0 flex items-center px-2 ",isDark?'justify-start' : 'justify-end')}>
          {isDark ? (
                <SparklesIcon className='text-white fill-white'/>  
            ) : (
              <Sun size={18} className='text-white fill-white' />
            )}
        </div>

      </div>
    </div>
  );
};

export default ThemeToggle;