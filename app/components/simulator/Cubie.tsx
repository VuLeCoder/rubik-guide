import * as THREE from 'three';
import { RoundedBox } from '@react-three/drei';
import { RUBIK_CONFIG, COLORS } from './constants';
import { memo } from 'react';

const {LAYOUT} = RUBIK_CONFIG;
const offset = LAYOUT.STICKER_OFFSET;

export const Cubie = memo(function Cubie({ 
  stickers, 
  position, 
  onPointerDown 
}: { 
  stickers: string[], 
  position: THREE.Vector3,
  onPointerDown: (e: any) => void
}) {
  const positions = [
    [offset, 0, 0], [-offset, 0, 0],
    [0, offset, 0], [0, -offset, 0],
    [0, 0, offset], [0, 0, -offset],
  ] as const;

  const rotations = [
    [0, Math.PI / 2, 0], [0, -Math.PI / 2, 0],
    [-Math.PI / 2, 0, 0], [Math.PI / 2, 0, 0],
    [0, 0, 0], [0, Math.PI, 0],
  ] as const;

  return (
    <group position={position}>
      <RoundedBox 
        args={[LAYOUT.CUBIE_SIZE, LAYOUT.CUBIE_SIZE, LAYOUT.CUBIE_SIZE]} 
        radius={LAYOUT.CUBIE_RADIUS} 
        smoothness={LAYOUT.CUBIE_SMOOTHNESS}
      >
        <meshStandardMaterial color="#111827" roughness={0.4} />
      </RoundedBox>

      {stickers.map((col, i) => {
        if (col === COLORS.inner) return null;
        return (
          <mesh 
            key={i} 
            position={positions[i]} 
            rotation={rotations[i]}
            onPointerDown={onPointerDown}
          >
            <planeGeometry args={[LAYOUT.STICKER_SIZE, LAYOUT.STICKER_SIZE]} />
            <meshStandardMaterial color={col} />
          </mesh>
        );
      })}
    </group>
  );
})
