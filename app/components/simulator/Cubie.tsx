import * as THREE from 'three';
import { RoundedBox } from '@react-three/drei';
import { RUBIK_CONFIG, COLORS } from './constants';
import { memo } from 'react';

const { LAYOUT } = RUBIK_CONFIG;
const offset = LAYOUT.STICKER_OFFSET;

// Shared resources across all cubies
const cubieMaterial = new THREE.MeshStandardMaterial({ color: "#111827", roughness: 0.4 });
const stickerGeometry = new THREE.PlaneGeometry(LAYOUT.STICKER_SIZE, LAYOUT.STICKER_SIZE);

// Pre-create materials for each color
const colorMaterials = Object.entries(COLORS).reduce((acc, [key, color]) => {
  acc[color] = new THREE.MeshStandardMaterial({ color });
  return acc;
}, {} as Record<string, THREE.MeshStandardMaterial>);

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

export const Cubie = memo(function Cubie({ 
  stickers, 
  position, 
  onPointerDown 
}: { 
  stickers: string[], 
  position: THREE.Vector3,
  onPointerDown: (e: any) => void
}) {
  return (
    <group position={position}>
      <RoundedBox 
        args={[LAYOUT.CUBIE_SIZE, LAYOUT.CUBIE_SIZE, LAYOUT.CUBIE_SIZE]} 
        radius={LAYOUT.CUBIE_RADIUS} 
        smoothness={LAYOUT.CUBIE_SMOOTHNESS}
        material={cubieMaterial}
      />

      {stickers.map((col, i) => {
        if (col === COLORS.inner) return null;
        const material = colorMaterials[col];
        if (!material) return null;
        
        return (
          <mesh 
            key={i} 
            position={positions[i]} 
            rotation={rotations[i]}
            onPointerDown={onPointerDown}
            geometry={stickerGeometry}
            material={material}
          />
        );
      })}
    </group>
  );
})
