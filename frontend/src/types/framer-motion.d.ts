declare module 'framer-motion' {
  import { ComponentType, ReactNode, CSSProperties, Component } from 'react';

  export interface AnimatePresenceProps {
    children: ReactNode;
    mode?: 'sync' | 'wait' | 'popLayout';
  }

  export interface MotionProps {
    initial?: CSSProperties | object;
    animate?: CSSProperties | object;
    exit?: CSSProperties | object;
    transition?: object;
    layout?: boolean | string;
    layoutId?: string;
    style?: CSSProperties;
    className?: string;
    children?: ReactNode;
  }

  export interface LazyMotionProps {
    features: any;
    children: ReactNode;
    strict?: boolean;
  }

  export const AnimatePresence: ComponentType<AnimatePresenceProps>;
  export const LazyMotion: ComponentType<LazyMotionProps>;
  export const domAnimation: any;
  
  export const motion: {
    div: ComponentType<MotionProps & React.HTMLAttributes<HTMLDivElement>>;
    span: ComponentType<MotionProps & React.HTMLAttributes<HTMLSpanElement>>;
    button: ComponentType<MotionProps & React.HTMLAttributes<HTMLButtonElement>>;
  };
} 