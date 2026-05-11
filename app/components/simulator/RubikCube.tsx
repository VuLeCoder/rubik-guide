import { useRef, useMemo, useEffect, memo } from 'react';
import { useFrame, RootState } from '@react-three/fiber';
import * as THREE from 'three';
import { Cubie } from './Cubie';
import { RUBIK_CONFIG, CubieData, RubikCubeProps } from './constants';

const {PHYSICS} = RUBIK_CONFIG;

export const RubikCube = memo(function RubikCube({ cubies, activeMove, setActiveMove, onAnimationEnd, onPointerDown, dragAngleRef }: RubikCubeProps) {
  const rotationGroupRef = useRef<THREE.Group>(null);
  const rotationAngleRef = useRef(0);
  const hasFinishedRef = useRef(false);

  useEffect(() => {
    if (activeMove) {
      hasFinishedRef.current = false;
    }
  }, [activeMove]);

  const { movingCubies, staticCubies } = useMemo(() => {
    if (!activeMove) return { movingCubies: [], staticCubies: cubies };

    const moving: CubieData[] = [];
    const staticList: CubieData[] = [];

    cubies.forEach((c) => {
      const val = activeMove.axis === 'x' ? c.pos.x : activeMove.axis === 'y' ? c.pos.y : c.pos.z;
      if (Math.abs(val - activeMove.layer) <= PHYSICS.LAYER_THRESHOLD) {
        moving.push(c);
      } else {
        staticList.push(c);
      }
    });
    return { movingCubies: moving, staticCubies: staticList };
  }, [cubies, activeMove]);

  useFrame((_state: RootState, delta: number) => {
    if (!activeMove || !rotationGroupRef.current) {
      if (rotationGroupRef.current && rotationAngleRef.current !== 0) {
        rotationAngleRef.current = 0;
        rotationGroupRef.current.rotation.set(0, 0, 0);
      }
      return;
    }

    if (activeMove.isDragging) {
      rotationGroupRef.current.rotation[activeMove.axis] = dragAngleRef.current;
      rotationAngleRef.current = dragAngleRef.current;
      return;
    }

    const diff = activeMove.target - rotationAngleRef.current;

    if (Math.abs(diff) > PHYSICS.EPSILON) { 
      const easingFactor = 1 - Math.exp(-PHYSICS.ANIMATION_SPEED * delta);
      const move = diff * easingFactor;
      rotationAngleRef.current += move;
      rotationGroupRef.current.rotation[activeMove.axis] = rotationAngleRef.current;
    } else {
      const { axis, layer, target } = activeMove;
      
      rotationAngleRef.current = target;
      rotationGroupRef.current.rotation[activeMove.axis] = target;

      if (!hasFinishedRef.current) {
        hasFinishedRef.current = true;
        
        if (target !== 0) {
          onAnimationEnd(axis, layer, target);
        } else {
          setActiveMove(null);
        }
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
})
