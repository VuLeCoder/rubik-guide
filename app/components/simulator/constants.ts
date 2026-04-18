import * as THREE from 'three';

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

export interface DragMoveInfo {
  axis: 'x' | 'y' | 'z';
  layer: number;
  target: number;
}

export const COLORS = {
  top: '#FFFFFF',
  bottom: '#FFD700',
  front: '#22C55E',
  back: '#3B82F6',
  right: '#F97316',
  left: '#EF4444',
  inner: '#1E293B'
};

export const generateInitialState = (): CubieData[] => {
  return Array.from({ length: 27 }).map((_, i) => {
    const x = (i % 3) - 1;
    const y = Math.floor((i / 3) % 3) - 1;
    const z = Math.floor(i / 9) - 1;
    return {
      id: i,
      pos: new THREE.Vector3(x, y, z),
      stickers: [
        x === 1 ? COLORS.right : COLORS.inner,
        x === -1 ? COLORS.left : COLORS.inner,
        y === 1 ? COLORS.top : COLORS.inner,
        y === -1 ? COLORS.bottom : COLORS.inner,
        z === 1 ? COLORS.front : COLORS.inner,
        z === -1 ? COLORS.back : COLORS.inner,
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
}
