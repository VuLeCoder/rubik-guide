import { useRef } from 'react';
import { useFrame, RootState } from '@react-three/fiber';
import * as THREE from 'three';
import { Cubie } from './Cubie';
import { CubieData } from './constants';
import { RubikCubeProps } from './constants';

export function RubikCube({ cubies, activeMove, setActiveMove, onAnimationEnd, onPointerDown }: RubikCubeProps) {
  const rotationGroupRef = useRef<THREE.Group>(null);
  const rotationAngleRef = useRef(0);

  useFrame((_state: RootState, delta: number) => {
    if (activeMove && rotationGroupRef.current) {
      if (activeMove.isDragging) {
        rotationAngleRef.current = activeMove.angle;
        rotationGroupRef.current.rotation[activeMove.axis] = activeMove.angle;
        return; 
      }

      const step = (Math.PI / 2) * (delta / 0.4);
      const diff = activeMove.target - rotationAngleRef.current;

      if (Math.abs(diff) > 0.01) {
        rotationAngleRef.current += Math.sign(diff) * Math.min(step, Math.abs(diff));
        rotationGroupRef.current.rotation[activeMove.axis] = rotationAngleRef.current;
      } else {
        if (activeMove.target !== 0) {
          onAnimationEnd(activeMove.axis, activeMove.layer, activeMove.target);
        } else {
          setActiveMove(null);
        }
        
        rotationAngleRef.current = 0;
        rotationGroupRef.current.rotation.set(0, 0, 0);
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
      {/* Các khối tĩnh (không xoay) */}
      {cubies.filter(c => !isMoving(c)).map(data => (
        <Cubie 
          key={data.id} 
          stickers={data.stickers} 
          position={data.pos} 
          onPointerDown={onPointerDown} 
        />
      ))}

      {/* Nhóm các khối đang xoay */}
      <group ref={rotationGroupRef}>
        {cubies.filter(c => isMoving(c)).map(data => (
          <Cubie 
            key={data.id} 
            stickers={data.stickers} 
            position={data.pos} 
            onPointerDown={onPointerDown} 
          />
        ))}
      </group>
    </group>
  );
}
