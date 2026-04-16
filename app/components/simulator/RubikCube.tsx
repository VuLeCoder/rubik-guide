import React, { useRef } from 'react';
import { useFrame, RootState } from '@react-three/fiber';
import * as THREE from 'three';
import { Cubie } from './Cubie';
import { CubieData, AnimatingLayer } from './constants';

export function RubikCube({ cubies, activeMove, onAnimationEnd }: { 
  cubies: CubieData[], 
  activeMove: AnimatingLayer | null,
  onAnimationEnd: (axis: 'x' | 'y' | 'z', layer: number, target: number) => void 
}) {
  const rotationGroupRef = useRef<THREE.Group>(null);
  const rotationAngleRef = useRef(0);

  useFrame((_state: RootState, delta: number) => {
    if (activeMove && rotationGroupRef.current) {
      const step = (Math.PI / 2) * (delta / 0.4);
      
      if (Math.abs(rotationAngleRef.current) < Math.abs(activeMove.target)) {
        rotationAngleRef.current += (activeMove.target > 0 ? step : -step);
        
        if (Math.abs(rotationAngleRef.current) >= Math.abs(activeMove.target)) {
          onAnimationEnd(activeMove.axis, activeMove.layer, activeMove.target);
          setTimeout(() => {
            rotationAngleRef.current = 0;
            if (rotationGroupRef.current) rotationGroupRef.current.rotation.set(0, 0, 0);
          }, 0);
        } else {
          const axis = activeMove.axis;
          rotationGroupRef.current.rotation[axis] = rotationAngleRef.current;
        }
      }
    }
  });

  const isMoving = (c: CubieData) => {
    if (!activeMove) return false;
    const val = activeMove.axis === 'x' ? c.pos.x : activeMove.axis === 'y' ? c.pos.y : c.pos.z;
    return Math.abs(val - activeMove.layer) <= 0.1;
  };

  return (
    <group>
      {cubies.filter(c => !isMoving(c)).map(data => (
        <Cubie key={data.id} stickers={data.stickers} position={data.pos} />
      ))}
      <group ref={rotationGroupRef}>
        {cubies.filter(c => isMoving(c)).map(data => (
          <Cubie key={data.id} stickers={data.stickers} position={data.pos} />
        ))}
      </group>
    </group>
  );
}
