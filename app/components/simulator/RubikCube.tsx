import { useRef, useMemo } from 'react';
import { useFrame, RootState } from '@react-three/fiber';
import * as THREE from 'three';
import { Cubie } from './Cubie';
import { CubieData, RubikCubeProps } from './constants';

export function RubikCube({ cubies, activeMove, setActiveMove, onAnimationEnd, onPointerDown, dragAngleRef }: RubikCubeProps) {
  const rotationGroupRef = useRef<THREE.Group>(null);
  const rotationAngleRef = useRef(0);

  const { movingCubies, staticCubies } = useMemo(() => {
    if (!activeMove) return { movingCubies: [], staticCubies: cubies };

    const moving: CubieData[] = [];
    const staticList: CubieData[] = [];

    cubies.forEach((c) => {
      const val = activeMove.axis === 'x' ? c.pos.x : activeMove.axis === 'y' ? c.pos.y : c.pos.z;
      if (Math.abs(val - activeMove.layer) <= 0.1) {
        moving.push(c);
      } else {
        staticList.push(c);
      }
    });
    return { movingCubies: moving, staticCubies: staticList };
  }, [cubies, activeMove]);

  useFrame((_state: RootState, delta: number) => {
    if (!activeMove || !rotationGroupRef.current) return;

    if (activeMove.isDragging) {
      const currentDragAngle = dragAngleRef.current;
      rotationAngleRef.current = currentDragAngle;
      rotationGroupRef.current.rotation[activeMove.axis] = currentDragAngle;
      return;
    }
    // const step = (Math.PI / 2) * (delta / 0.4); 
    // const diff = activeMove.target - rotationAngleRef.current;

    const duration = 0.35; 
    const totalRotation = Math.PI / 2;

    const step = (totalRotation / duration) * delta;

    const diff = activeMove.target - rotationAngleRef.current;


    if (Math.abs(diff) > 0.001) {
      const move = Math.sign(diff) * Math.min(step, Math.abs(diff));
      rotationAngleRef.current += move;
      rotationGroupRef.current.rotation[activeMove.axis] = rotationAngleRef.current;
    } else {
      const finalAxis = activeMove.axis;
      const finalLayer = activeMove.layer;
      const finalTarget = activeMove.target;

      rotationAngleRef.current = 0;
      rotationGroupRef.current.rotation.set(0, 0, 0);

      if (finalTarget !== 0) {
        onAnimationEnd(finalAxis, finalLayer, finalTarget);
      } else {
        setActiveMove(null);
      }
    }
  });

  return (
    <group>
      {staticCubies.map((data) => (
        <Cubie 
          key={data.id} 
          stickers={data.stickers} 
          position={data.pos} 
          onPointerDown={onPointerDown} 
        />
      ))}

      <group ref={rotationGroupRef}>
        {movingCubies.map((data) => (
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
