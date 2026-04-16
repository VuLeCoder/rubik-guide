import React from 'react';
import * as THREE from 'three';
import { RoundedBox } from '@react-three/drei';
import { COLORS } from './constants';

export function Cubie({ stickers, position }: { stickers: string[], position: THREE.Vector3 }) {
  const offset = 0.495;
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
      <RoundedBox args={[0.98, 0.98, 0.98]} radius={0.06} smoothness={4}>
        <meshStandardMaterial color="#111827" roughness={0.4} />
      </RoundedBox>

      {stickers.map((col, i) => {
        if (col === COLORS.inner) return null;
        return (
          <mesh key={i} position={positions[i]} rotation={rotations[i]}>
            <planeGeometry args={[0.8, 0.8]} />
            <meshStandardMaterial color={col} />
          </mesh>
        );
      })}
    </group>
  );
}
