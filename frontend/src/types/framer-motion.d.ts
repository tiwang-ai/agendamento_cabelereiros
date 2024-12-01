import { HTMLMotionProps } from 'framer-motion'

declare module 'framer-motion' {
  import * as React from 'react';

  export interface MotionProps {
    initial?: any;
    animate?: any;
    exit?: any;
    transition?: any;
    variants?: any;
    layout?: boolean | string;
    layoutId?: string;
    style?: React.CSSProperties;
    className?: string;
    onAnimationStart?: () => void;
    onAnimationComplete?: () => void;
  }

  export interface AnimatePresenceProps {
    children?: React.ReactNode;
    custom?: any;
    initial?: boolean;
    mode?: "sync" | "wait" | "popLayout";
    onExitComplete?: () => void;
    presenceAffectsLayout?: boolean;
  }

  export interface LazyMotionProps {
    children?: React.ReactNode;
    features?: any;
    strict?: boolean;
  }

  export const motion: {
    [key in keyof JSX.IntrinsicElements]: React.ForwardRefExoticComponent<
      MotionProps & JSX.IntrinsicElements[key]
    >;
  };

  export const AnimatePresence: React.FC<AnimatePresenceProps>;
  export const LazyMotion: React.FC<LazyMotionProps>;
  export const domAnimation: any;
  export const m: typeof motion;
} 