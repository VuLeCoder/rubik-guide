import * as THREE from 'three';

export const RUBIK_CONFIG = {
  LAYOUT: {
    CUBIE_SIZE: 0.98,
    CUBIE_RADIUS: 0.06,
    CUBIE_SMOOTHNESS: 4,
    STICKER_OFFSET: 0.495,
    STICKER_SIZE: 0.8
  },
  PHYSICS: {
    ANIMATION_SPEED: 8,
    DRAG_SENSITIVITY: 2.2,
    SNAP_THRESHOLD: Math.PI / 6,
    LAYER_THRESHOLD: 0.1,
    EPSILON: 0.001,
    DRAG_DISTANCE_MIN: 0.001,
  },
  SCENE: {
    CAMERA_POS: [5, 5, 5] as [number, number, number],
    CAMERA_FOV: 55,
    LIGHT_INTENSITY: 0.5,
    SHADOW: {
      POSITION: [0, -2.2, 0] as [number, number, number],
      OPACITY: 0.1,
      SCALE: 10,
      BLUR: 3,
    }
  }
};

export const COLORS = {
  top: '#FFFFFF',
  bottom: '#FFD700',
  front: '#22C55E',
  back: '#3B82F6',
  right: '#F97316',
  left: '#EF4444',
  inner: '#1E293B',
  gray: '#475569' // Màu xám cho mode Learn
};

export interface CubieData {
  id: number;
  pos: THREE.Vector3;
  stickers: string[];
}

export interface AnimatingLayer {
  axis: 'x' | 'y' | 'z';
  layer: number;
  angle: number;
  target: number;
  isDragging?: boolean;
}

export const generateInitialState = (grayedOut: boolean = false): CubieData[] => {
  const baseColor = grayedOut ? COLORS.gray : COLORS.inner;
  return Array.from({ length: 27 }).map((_, i) => {
    const x = (i % 3) - 1;
    const y = Math.floor((i / 3) % 3) - 1;
    const z = Math.floor(i / 9) - 1;
    
    return {
      id: i,
      pos: new THREE.Vector3(x, y, z),
      stickers: [
        x === 1 ? (grayedOut ? COLORS.gray : COLORS.right) : COLORS.inner,
        x === -1 ? (grayedOut ? COLORS.gray : COLORS.left) : COLORS.inner,
        y === 1 ? (grayedOut ? COLORS.gray : COLORS.top) : COLORS.inner,
        y === -1 ? (grayedOut ? COLORS.gray : COLORS.bottom) : COLORS.inner,
        z === 1 ? (grayedOut ? COLORS.gray : COLORS.front) : COLORS.inner,
        z === -1 ? (grayedOut ? COLORS.gray : COLORS.back) : COLORS.inner,
      ]
    };
  });
};

export interface RubikCubeProps {
  cubies: CubieData[];
  activeMove: AnimatingLayer | null;
  setActiveMove: React.Dispatch<React.SetStateAction<AnimatingLayer | null>>;
  onAnimationEnd: (axis: 'x' | 'y' | 'z', layer: number, target: number) => void;
  onPointerDown: (e: any) => void;
  dragAngleRef: React.MutableRefObject<number>; 
}
