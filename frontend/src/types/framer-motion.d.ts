import { ComponentType, ReactNode, CSSProperties } from 'react';

declare module 'framer-motion' {
  export interface MotionProps {
    initial?: any;
    animate?: any;
    exit?: any;
    transition?: any;
    variants?: any;
    layout?: boolean | string;
    layoutId?: string;
    style?: CSSProperties;
    className?: string;
    onAnimationStart?: () => void;
    onAnimationComplete?: () => void;
  }

  export interface AnimatePresenceProps {
    children?: ReactNode;
    custom?: any;
    initial?: boolean;
    mode?: "sync" | "wait" | "popLayout";
    onExitComplete?: () => void;
    presenceAffectsLayout?: boolean;
  }

  export const motion: {
    [K in keyof JSX.IntrinsicElements]: ComponentType<MotionProps & JSX.IntrinsicElements[K]>;
  };

  export const AnimatePresence: ComponentType<AnimatePresenceProps>;
} 