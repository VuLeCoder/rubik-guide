"use client";
import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { RUBIK_CONFIG, COLORS, generateInitialState, CubieData, AnimatingLayer } from './constants';
import { RubikCube } from './RubikCube';

const { PHYSICS } = RUBIK_CONFIG;

interface StaticCubeProps {
  stepId: number;
  subStep: number;
}

export const StaticCube = ({ stepId, subStep }: StaticCubeProps) => {
  const [cubies, setCubies] = useState<CubieData[]>([]);
  const [activeMove, setActiveMove] = useState<AnimatingLayer | null>(null);
  const moveQueue = useRef<string[]>([]);

  // Initialize cubies based on step
  useEffect(() => {
    let initialState = generateInitialState(true);
    
    // Step 1: Daisy and White Cross
    if (stepId === 1) {
      initialState = initialState.map(cubie => {
        const { x, y, z } = cubie.pos;
        const stickers = [...cubie.stickers];
        
        // Centers: Yellow on Top (y=1), White on Bottom (y=-1)
        if (x === 0 && y === 1 && z === 0) stickers[2] = COLORS.bottom;
        if (x === 0 && y === -1 && z === 0) stickers[3] = COLORS.top;

        // Show side centers only in Part 2
        if (subStep === 1 && y === 0) {
          if (x === 1 && z === 0) stickers[0] = COLORS.right;
          if (x === -1 && z === 0) stickers[1] = COLORS.left;
          if (z === 1 && x === 0) stickers[4] = COLORS.front;
          if (z === -1 && x === 0) stickers[5] = COLORS.back;
        }

        // White Edges on Top Layer (y = 1)
        if (y === 1) {
          const isEdge = (Math.abs(x) === 1 && z === 0) || (x === 0 && Math.abs(z) === 1);
          if (isEdge) {
            stickers[2] = COLORS.top; // Always white on top for Daisy
            
            if (subStep === 0) {
              // Part 1: Correct side colors
              if (x === 1) stickers[0] = COLORS.right;
              if (x === -1) stickers[1] = COLORS.left;
              if (z === 1) stickers[4] = COLORS.front;
              if (z === -1) stickers[5] = COLORS.back;
            } else {
              // Part 2: Scrambled side colors to show step-by-step alignment
              if (x === 1) stickers[0] = COLORS.front;  // Right piece gets Green
              if (x === -1) stickers[1] = COLORS.right;  // Left piece gets Orange
              if (z === 1) stickers[4] = COLORS.back;    // Front piece gets Blue
              if (z === -1) stickers[5] = COLORS.left;   // Back piece gets Red
            }
          }
        }

        return { ...cubie, stickers };
      });

      if (subStep === 1) {
        // Step 1 Part 2 Animation Sequence:
        // 1. U (CW) aligns Right(Green) piece with Front(Green) center.
        // 2. F2 flips it to bottom.
        // 3. U (CW) aligns Left(Orange) piece (which moved to Back, then to Right) with Right(Orange) center.
        // 4. R2 flips it to bottom.
        moveQueue.current = ["U", "F2", "U", "R2"];
      } else {
        moveQueue.current = [];
      }
    } else if (stepId === 6) {
        initialState = generateInitialState(false);
    } else {
        initialState = generateInitialState(false).map(c => {
            if (c.pos.y > (stepId === 2 ? 0 : -1)) return c;
            return { ...c, stickers: c.stickers.map(s => s === COLORS.inner ? s : COLORS.gray) };
        });
    }

    setCubies(initialState);
    setActiveMove(null);
  }, [stepId, subStep]);

  const performMove = useCallback((move: string) => {
    const isPrime = move.includes("'");
    const isDouble = move.includes("2");
    const m = move.replace("'", "").replace("2", "");
    
    let axis: 'x' | 'y' | 'z' = 'x';
    let layer = 0;
    let target = isPrime ? Math.PI / 2 : -Math.PI / 2;
    if (isDouble) target = Math.PI;

    if (["R", "L"].includes(m)) { axis = 'x'; layer = m === "R" ? 1 : -1; }
    else if (["U", "D"].includes(m)) { axis = 'y'; layer = m === "U" ? 1 : -1; }
    else if (["F", "B"].includes(m)) { axis = 'z'; layer = m === "F" ? 1 : -1; }

    // Correction for layer direction
    if (m === "L" || m === "D" || m === "B") target *= -1;

    setActiveMove({ axis, layer, angle: 0, target });
  }, []);

  useEffect(() => {
    if (!activeMove && moveQueue.current.length > 0) {
      const timer = setTimeout(() => {
        const next = moveQueue.current.shift();
        if (next) performMove(next);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [activeMove, performMove]);

  const finalizeMove = useCallback((axis: 'x' | 'y' | 'z', layer: number, targetAngle: number) => {
    setCubies(prev => prev.map(cubie => {
      const val = axis === 'x' ? cubie.pos.x : axis === 'y' ? cubie.pos.y : cubie.pos.z;
      if (Math.abs(val - layer) > PHYSICS.LAYER_THRESHOLD) return cubie;

      const rotationAxis = new THREE.Vector3(axis === 'x' ? 1 : 0, axis === 'y' ? 1 : 0, axis === 'z' ? 1 : 0);
      const newPos = cubie.pos.clone().applyAxisAngle(rotationAxis, targetAngle);
      newPos.x = Math.round(newPos.x);
      newPos.y = Math.round(newPos.y);
      newPos.z = Math.round(newPos.z);

      let s = [...cubie.stickers];
      
      // Calculate how many 90-degree clockwise rotations to apply
      // Three.js rotation: targetAngle < 0 is clockwise for R, U, F
      let angle = targetAngle;
      while (angle < 0) angle += Math.PI * 2;
      while (angle >= Math.PI * 2) angle -= Math.PI * 2;
      
      // Convert angle to number of 90-degree steps (0, 1, 2, 3)
      const steps = Math.round(angle / (Math.PI / 2)) % 4;

      for (let i = 0; i < steps; i++) {
        const prevS = [...s];
        if (axis === 'x') {
          // X-axis CCW: Top(2)->Back(5), Back(5)->Bottom(3), Bottom(3)->Front(4), Front(4)->Top(2)
          s[2] = prevS[4]; s[5] = prevS[2]; s[3] = prevS[5]; s[4] = prevS[3];
        } else if (axis === 'y') {
          // Y-axis CCW: Front(4)->Right(0), Right(0)->Back(5), Back(5)->Left(1), Left(1)->Front(4)
          s[0] = prevS[4]; s[5] = prevS[0]; s[1] = prevS[5]; s[4] = prevS[1];
        } else if (axis === 'z') {
          // Z-axis CCW: Top(2)->Left(1), Left(1)->Bottom(3), Bottom(3)->Right(0), Right(0)->Top(2)
          s[1] = prevS[2]; s[3] = prevS[1]; s[0] = prevS[3]; s[2] = prevS[0];
        }
      }

      return { ...cubie, pos: newPos, stickers: s };
    }));
    setActiveMove(null);
  }, []);

  return (
    <div className="w-full h-full min-h-[350px] relative">
      <Canvas camera={{ position: [4, 4, 4], fov: 55 }}>
        <Environment preset="city" />
        <ambientLight intensity={0.5} />
        <RubikCube
          cubies={cubies} 
          activeMove={activeMove} 
          setActiveMove={setActiveMove}
          onAnimationEnd={finalizeMove} 
          onPointerDown={() => {}} 
          dragAngleRef={{ current: 0 } as any}
        />
        <OrbitControls enableZoom={true} enablePan={false} />
        <ContactShadows position={[0, -2, 0]} opacity={0.4} scale={10} blur={2} far={4.5} />
      </Canvas>
    </div>
  );
};
