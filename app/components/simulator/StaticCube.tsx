"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { RUBIK_CONFIG, COLORS, generateInitialState, CubieData, AnimatingLayer } from './constants';
import { RubikCube } from './RubikCube';
import { STEPS } from '../learn/constants';

const { SCENE, PHYSICS } = RUBIK_CONFIG;

// Pre-defined camera positions to avoid object recreation and infinite update loops
const CAM_POS = {
  F: new THREE.Vector3(3, 4, 6),
  B: new THREE.Vector3(-3, 4, -6),
  L: new THREE.Vector3(-6, 4, 3),
  R: new THREE.Vector3(6, 4, -3),
  U: new THREE.Vector3(4, 5, 4),
  D: new THREE.Vector3(4, -5, 4),
  DEFAULT: new THREE.Vector3(4, 4, 4),
  BOTTOM: new THREE.Vector3(4, -4, 4),
  FR: new THREE.Vector3(5, 3, 5), // Front-Right view for Step 3 Case 1
  FL: new THREE.Vector3(-5, 3, 5), // Front-Left view for Step 3 Case 2
};

interface StaticCubeProps {
  stepId: number;
  subStep: number;
  caseId?: number;
  isPaused?: boolean;
  setIsPaused?: (paused: boolean) => void;
  resetKey?: number;
}

// Internal component that contains the 3D scene logic
const StaticCubeContent = ({ stepId, subStep, caseId, isPaused = false, setIsPaused, resetKey = 0 }: StaticCubeProps) => {
  const [cubies, setCubies] = useState<CubieData[]>([]);
  const [activeMove, setActiveMove] = useState<AnimatingLayer | null>(null);
  const [targetCamPos, setTargetCamPos] = useState(CAM_POS.DEFAULT);
  const moveQueue = useRef<string[]>([]);
  const initialMoveQueue = useRef<string[]>([]);
  const controlsRef = useRef<OrbitControlsImpl>(null);

  // Helper to get camera position for a specific move face
  const getCameraPosForMove = useCallback((move: string) => {
    const face = move.charAt(0).toUpperCase();
    switch(face) {
      case 'F': return CAM_POS.F;
      case 'B': return CAM_POS.B;
      case 'L': return CAM_POS.L;
      case 'R': return CAM_POS.R;
      case 'U': return CAM_POS.U;
      case 'D': return CAM_POS.D;
      default: return CAM_POS.DEFAULT;
    }
  }, []);

  useFrame((state) => {
    if (controlsRef.current && !isPaused) {
      // Smoothly move camera to target position
      if (state.camera.position.distanceTo(targetCamPos) > 0.01) {
        state.camera.position.lerp(targetCamPos, 0.06);
        controlsRef.current.update();
      }
    }
  });

  const initCube = useCallback(() => {
    let initialState = generateInitialState(true);
    let defaultPos = CAM_POS.DEFAULT;

    switch(stepId) {
      case 1: { 
        if (subStep === 1) defaultPos = CAM_POS.F;
        else defaultPos = CAM_POS.DEFAULT; 
        break; 
      }
      case 2: { defaultPos = CAM_POS.F; break; }

      case 3: {
        if(caseId === 1) defaultPos = CAM_POS.FR;
        else defaultPos = CAM_POS.FL;
        break;
      }

      case 4: { defaultPos = CAM_POS.U; break; }
      case 5: { defaultPos = new THREE.Vector3(3, 5, 5); break; }
      case 6: { 
        if (subStep === 0) {
            if (caseId === 1) defaultPos = new THREE.Vector3(-5, 4, 5); // See Left + Front + Top
            else if (caseId === 2) defaultPos = new THREE.Vector3(3, 4, 6); // Frontal
            else defaultPos = new THREE.Vector3(5, 5, 5);
        } else {
            defaultPos = new THREE.Vector3(5, 5, 5);
        }
        break; 
      }
    }
    
    // Use functional update and distance check to avoid redundant state updates
    setTargetCamPos(prev => {
      if (prev.distanceTo(defaultPos) < 0.01) return prev;
      return defaultPos;
    });
    
    if (stepId === 1) {
      // Substep 1: Daisy Creation - Show the RESULT directly as requested
      initialState = initialState.map(cubie => {
        const { x, y, z } = cubie.pos;
        const stickers = [...cubie.stickers];
        
        // Show all centers for Step 1
        if (x === 0 && y === 1 && z === 0) stickers[2] = COLORS.top;
        if (x === 0 && y === -1 && z === 0) stickers[3] = COLORS.bottom;

        if (subStep === 0) {
          if (y === 1) {
            const isEdge = (Math.abs(x) === 1 && z === 0) || (x === 0 && Math.abs(z) === 1);
            if (isEdge) {
              stickers[2] = COLORS.bottom; // White edges on top
              // Align side colors correctly for the target state
              if (x === 1) stickers[0] = COLORS.left;
              if (x === -1) stickers[1] = COLORS.back;
              if (z === 1) stickers[4] = COLORS.front;
              if (z === -1) stickers[5] = COLORS.right;
            }
          }
        }

        // Substep 2: Cross - Daisy is ready but side colors are misaligned
        if (subStep === 1) {
          if (x === 1 && y === 0 && z === 0) stickers[0] = COLORS.left;
          if (x === -1 && y === 0 && z === 0) stickers[1] = COLORS.back;
          if (x === 0 && y === 0 && z === 1) stickers[4] = COLORS.front;
          if (x === 0 && y === 0 && z === -1) stickers[5] = COLORS.right;

          if (y === 1) {
            const isEdge = (Math.abs(x) === 1 && z === 0) || (x === 0 && Math.abs(z) === 1);
            if (isEdge) {
              stickers[2] = COLORS.bottom; // White on top face
              // Misalign side colors (Shifted by 1)
              if (x === 1) stickers[0] = COLORS.back;   // Right edge has Back color
              if (x === -1) stickers[1] = COLORS.front; // Left edge has Front color
              if (z === 1) stickers[4] = COLORS.right;  // Front edge has Right color
              if (z === -1) stickers[5] = COLORS.left;  // Back edge has Left color
            }
          }
        }
        return { ...cubie, stickers };
      });

      if (subStep === 0) {
        initialMoveQueue.current = [];
        moveQueue.current = [];
      } else if (subStep === 1) {
        initialMoveQueue.current = ["U'", "F2", "U'", "L2", "B2", "U'", "R2"];
        moveQueue.current = [...initialMoveQueue.current];
      }
    } else if (stepId === 2) {
        initialState = generateInitialState(false).map(c => {
            const { x, y, z } = c.pos;
            // Show all 6 centers
            const isCenter = (Math.abs(x) + Math.abs(y) + Math.abs(z)) === 1;
            // Show white cross edges (bottom layer edges)
            const isWhiteCrossEdge = y === -1 && (Math.abs(x) === 1 || Math.abs(z) === 1) && (x * z === 0);
            // Show the target corner (Front-Right-Down: x=1, y=-1, z=1)
            const isTargetCorner = x === 1 && y === -1 && z === 1;

            if (isCenter || isWhiteCrossEdge || isTargetCorner) {
                return c;
            }
            return { ...c, stickers: c.stickers.map(s => s === COLORS.inner ? s : COLORS.gray) };
        });
    } else if (stepId === 3) {
        initialState = generateInitialState(false).map(c => {
            const { x, y, z } = c.pos;
            const isBottomLayer = y === -1;
            const isCenter = (Math.abs(x) + Math.abs(y) + Math.abs(z)) === 1;
            const isMiddleEdge = y === 0 && Math.abs(x) === 1 && Math.abs(z) === 1;

            if (isBottomLayer || isCenter || isMiddleEdge) {
                return c;
            }
            return { ...c, stickers: c.stickers.map(s => s === COLORS.inner ? s : COLORS.gray) };
        });
    } else if (stepId >= 4) {
        initialState = generateInitialState(false).map(c => {
            const { x, y, z } = c.pos;
            
            // For Step 4: Show first two layers, gray out top corners
            if (stepId === 4) {
                const isTopCorner = y === 1 && Math.abs(x) === 1 && Math.abs(z) === 1;
                if (isTopCorner) {
                    return { ...c, stickers: c.stickers.map(s => s === COLORS.inner ? s : COLORS.gray) };
                }
                
                // Manual Case setup for Step 4
                if (caseId !== undefined) {
                    const isTopEdge = y === 1 && (Math.abs(x) === 1 || Math.abs(z) === 1) && (x * z === 0);
                    if (isTopEdge) {
                        let yellowOnTop = true;
                        if (caseId === 1) yellowOnTop = false; // Dot: none on top
                        else if (caseId === 2) yellowOnTop = (z === -1 && x === 0) || (x === -1 && z === 0); // L-shape (Back, Left)
                        else if (caseId === 3) yellowOnTop = (Math.abs(x) === 1 && z === 0); // Horizontal Line (Left, Right)
                        
                        if (!yellowOnTop) {
                            const s = [...c.stickers];
                            let sideIdx = -1;
                            if (x === 1) sideIdx = 0; else if (x === -1) sideIdx = 1;
                            else if (z === 1) sideIdx = 4; else if (z === -1) sideIdx = 5;
                            
                            if (sideIdx !== -1) {
                                const tmp = s[2]; s[2] = s[sideIdx]; s[sideIdx] = tmp;
                            }
                            return { ...c, stickers: s };
                        }
                    }
                }
            }

            // For Step 5: Show layers 1 and 2 fully, gray out non-yellow on layer 3
            if (stepId === 5) {
                const isTopLayer = y === 1;
                const currentStickers = [...c.stickers];

                // Manual Corner orientations for Step 5
                if (caseId !== undefined && isTopLayer && Math.abs(x) === 1 && Math.abs(z) === 1) {
                    const swap = (idx1: number, idx2: number) => { 
                      const tmp = currentStickers[idx1]; 
                      currentStickers[idx1] = currentStickers[idx2]; 
                      currentStickers[idx2] = tmp; 
                    };
                    
                    if (caseId === 1) { // Sune: FL top, FR front, BR right, BL back
                        if (x === 1 && z === 1) swap(2, 4); // FR front
                        else if (x === 1 && z === -1) swap(2, 0); // BR right
                        else if (x === -1 && z === -1) swap(2, 5); // BL back
                    } else if (caseId === 2) { // Anti-Sune: BR top, FR right, FL front, BL left
                        if (x === 1 && z === 1) swap(2, 0); // FR right
                        else if (x === 1 && z === -1) swap(2, 5); // FL front
                        else if (x === -1 && z === -1) swap(2, 1); // BL left
                    } else if (caseId === 3) { // H: FL front, FR front, BL back, BR back
                        if (x === 1) swap(2, 0); else if (x === -1) swap(2, 1);
                    } else if (caseId === 4) { // Pi: BL left, FL left, FR front, BR back
                        if (x === -1) swap(2, 1); else if (x === 1 && z === 1) swap(2, 4); else if (x === 1 && z === -1) swap(2, 5);
                    } else if (caseId === 5) { // U: BL top, BR top, FL front, FR front
                        if (z === 1) swap(2, 4);
                    } else if (caseId === 6) { // T: FR top, BR top, FL front, BL back
                        if (x === -1 && z === 1) swap(2, 4); else if (x === -1 && z === -1) swap(2, 5);
                    } else if (caseId === 7) { // L: FR top, BL top, FL left, BR back
                        if (x === -1 && z === 1) swap(2, 4); else if (x === 1 && z === -1) swap(2, 0);
                    }
                }

                if (isTopLayer) {
                    return { 
                        ...c, 
                        stickers: currentStickers.map(s => (s === COLORS.top || s === COLORS.inner) ? s : COLORS.gray) 
                    };
                }
                
                // Layers 1 & 2: Show fully
                return { ...c, stickers: currentStickers };
            }

            // For Step 6: Hoán vị
            if (stepId === 6) {
                const isTopLayer = y === 1;
                const currentStickers = [...c.stickers];

                if (isTopLayer) {
                    const s = [...currentStickers];
                    // s indices: 0:R, 1:L, 2:U, 3:D, 4:F, 5:B
                    // Colors: R:Orange, L:Red, U:Yellow, D:White, F:Green, B:Blue
                    
                    if (subStep === 0) { // Hoán vị góc
                        if (caseId === 1) {
                            // Case 1: Specific requested pattern (Headlights on Red face)
                            // Red face (Left, index 1): Red - Orange - Red
                            if (x === -1 && z === -1) s[1] = COLORS.left;   // BL
                            if (x === -1 && z === 0)  s[1] = COLORS.right;  // L-edge (Orange)
                            if (x === -1 && z === 1)  s[1] = COLORS.left;   // FL

                            // Green face (Front, index 4): Green - Blue - Orange
                            if (x === -1 && z === 1) s[4] = COLORS.front;  // FL
                            if (x === 0 && z === 1)  s[4] = COLORS.back;   // F-edge (Blue)
                            if (x === 1 && z === 1)  s[4] = COLORS.right;  // FR (Orange)

                            // Orange face (Right, index 0): Blue - Green - Green
                            if (x === 1 && z === 1)  s[0] = COLORS.back;   // FR (Blue)
                            if (x === 1 && z === 0)  s[0] = COLORS.front;  // R-edge (Green)
                            if (x === 1 && z === -1) s[0] = COLORS.front;  // BR (Green)

                            // Blue face (Back, index 5): Orange - Red - Blue
                            if (x === 1 && z === -1) s[5] = COLORS.right;  // BR (Orange)
                            if (x === 0 && z === -1) s[5] = COLORS.left;   // B-edge (Red)
                            if (x === -1 && z === -1) s[5] = COLORS.back;   // BL (Blue)
                        } else if (caseId === 2) {
                            // Case 2: New specific requested pattern
                            // Red face (Left, index 1): Red - Orange - Orange
                            if (x === -1 && z === -1) s[1] = COLORS.left;   // BL
                            if (x === -1 && z === 0)  s[1] = COLORS.right;  // L-edge (Orange)
                            if (x === -1 && z === 1)  s[1] = COLORS.right;  // FL (Orange)

                            // Green face (Front, index 4): Blue - Green - Green
                            if (x === -1 && z === 1) s[4] = COLORS.back;   // FL (Blue)
                            if (x === 0 && z === 1)  s[4] = COLORS.front;  // F-edge (Green)
                            if (x === 1 && z === 1)  s[4] = COLORS.front;  // FR (Green)

                            // Orange face (Right, index 0): Orange - Blue - Red
                            if (x === 1 && z === 1)  s[0] = COLORS.right;  // FR (Orange)
                            if (x === 1 && z === 0)  s[0] = COLORS.back;   // R-edge (Blue)
                            if (x === 1 && z === -1) s[0] = COLORS.left;   // BR (Red)

                            // Blue face (Back, index 5): Green - Red - Blue
                            if (x === 1 && z === -1) s[5] = COLORS.front;  // BR (Green)
                            if (x === 0 && z === -1) s[5] = COLORS.left;   // B-edge (Red)
                            if (x === -1 && z === -1) s[5] = COLORS.back;   // BL (Blue)
                        } else {
                            // Case 3: No patterns, all unique pieces
                            if (x === -1 && z === 1) { s[1] = COLORS.right; s[4] = COLORS.back; } 
                            if (x === 1 && z === 1) { s[0] = COLORS.left; s[4] = COLORS.front; }
                            if (x === -1 && z === -1) { s[1] = COLORS.left; s[5] = COLORS.front; }
                            if (x === 1 && z === -1) { s[0] = COLORS.right; s[5] = COLORS.back; }
                            if (x === -1 && z === 0) s[1] = COLORS.left;
                            if (x === 1 && z === 0) s[0] = COLORS.right;
                            if (x === 0 && z === 1) s[4] = COLORS.back;
                            if (x === 0 && z === -1) s[5] = COLORS.front;
                        }
                    } else {
                        // Keep current gray logic for subStep 1 (edges) or implement similarly if needed
                        let showIndices = [2]; 
                        if (caseId === 1 || caseId === 2) {
                            if (z === -1) showIndices.push(5);
                        }
                        return {
                            ...c,
                            stickers: currentStickers.map((s, i) => 
                                (showIndices.includes(i) || s === COLORS.inner) ? s : COLORS.gray
                            )
                        };
                    }
                    return { ...c, stickers: s };
                }

                // Layers 1 & 2: Show fully
                return { ...c, stickers: currentStickers };
            }

            return c;
        });
    }

    setCubies(initialState);
    setActiveMove(null);

    // Handle Cases for all steps with cases
    if (stepId >= 2 && caseId !== undefined) {
      const step = STEPS.find(s => s.id === stepId);
      const sub = step?.subSteps[subStep];
      const c = sub?.cases?.find(cs => cs.id === caseId);
      
      if (c) {
        let tempCubies = initialState;
        if (c.initMoves) {
            c.initMoves.forEach(move => {
              tempCubies = simulateMove(tempCubies, move);
            });
        }
        setCubies(tempCubies);
        initialMoveQueue.current = c.formula.split(' ');
        moveQueue.current = [...initialMoveQueue.current];
      }
    }
    
    if (controlsRef.current) {
      controlsRef.current.object.position.copy(defaultPos);
      controlsRef.current.update();
    }
  }, [stepId, subStep, caseId]);

  // Helper to simulate move without animation
  const simulateMove = (currentCubies: CubieData[], move: string): CubieData[] => {
    const isPrime = move.includes("'");
    const isDouble = move.includes("2");
    const m = move.replace("'", "").replace("2", "");
    
    let axis: 'x' | 'y' | 'z' = 'x';
    let layer: number | number[] = 0;
    let targetAngle = isPrime ? Math.PI / 2 : -Math.PI / 2;
    if (isDouble) targetAngle *= 2;

    if (["R", "L", "r", "l"].includes(m)) { 
      axis = 'x'; 
      if (m === "R") layer = 1; 
      else if (m === "L") layer = -1;
      else if (m === "r") layer = [0, 1];
      else if (m === "l") layer = [0, -1];
    }
    else if (["U", "D", "u", "d"].includes(m)) { 
      axis = 'y'; 
      if (m === "U") layer = 1; 
      else if (m === "D") layer = -1;
      else if (m === "u") layer = [0, 1];
      else if (m === "d") layer = [0, -1];
    }
    else if (["F", "B", "f", "b"].includes(m)) { 
      axis = 'z'; 
      if (m === "F") layer = 1; 
      else if (m === "B") layer = -1;
      else if (m === "f") layer = [0, 1];
      else if (m === "b") layer = [0, -1];
    }

    if (["L", "D", "B", "l", "d", "b"].includes(m)) targetAngle *= -1;

    return currentCubies.map(cubie => {
      const val = axis === 'x' ? cubie.pos.x : axis === 'y' ? cubie.pos.y : cubie.pos.z;
      const layers = Array.isArray(layer) ? layer : [layer];
      if (!layers.some(l => Math.abs(val - l) <= PHYSICS.LAYER_THRESHOLD)) return cubie;

      const rotationAxis = new THREE.Vector3(axis === 'x' ? 1 : 0, axis === 'y' ? 1 : 0, axis === 'z' ? 1 : 0);
      const newPos = cubie.pos.clone().applyAxisAngle(rotationAxis, targetAngle);
      newPos.x = Math.round(newPos.x);
      newPos.y = Math.round(newPos.y);
      newPos.z = Math.round(newPos.z);

      let s = [...cubie.stickers];
      let angle = targetAngle;
      while (angle < 0) angle += Math.PI * 2;
      const steps = Math.round(angle / (Math.PI / 2)) % 4;

      for (let i = 0; i < steps; i++) {
        const p = [...s];
        if (axis === 'x') {
          s[4] = p[2]; s[3] = p[4]; s[5] = p[3]; s[2] = p[5];
        } else if (axis === 'y') {
          s[0] = p[4]; s[5] = p[0]; s[1] = p[5]; s[4] = p[1];
        } else if (axis === 'z') {
          s[1] = p[2]; s[3] = p[1]; s[0] = p[3]; s[2] = p[0];
        }
      }
      return { ...cubie, pos: newPos, stickers: s };
    });
  };

  useEffect(() => {
    initCube();
  }, [initCube, resetKey]);

  const performMove = useCallback((move: string) => {
    const isPrime = move.includes("'");
    const isDouble = move.includes("2");
    const m = move.replace("'", "").replace("2", "");
    
    let axis: 'x' | 'y' | 'z' = 'x';
    let layer: number | number[] = 0;
    let target = isPrime ? Math.PI / 2 : -Math.PI / 2;
    if (isDouble) target *= 2;

    if (["R", "L", "r", "l"].includes(m)) { 
      axis = 'x'; 
      if (m === "R") layer = 1; 
      else if (m === "L") layer = -1;
      else if (m === "r") layer = [0, 1];
      else if (m === "l") layer = [0, -1];
    }
    else if (["U", "D", "u", "d"].includes(m)) { 
      axis = 'y'; 
      if (m === "U") layer = 1; 
      else if (m === "D") layer = -1;
      else if (m === "u") layer = [0, 1];
      else if (m === "d") layer = [0, -1];
    }
    else if (["F", "B", "f", "b"].includes(m)) { 
      axis = 'z'; 
      if (m === "F") layer = 1; 
      else if (m === "B") layer = -1;
      else if (m === "f") layer = [0, 1];
      else if (m === "b") layer = [0, -1];
    }

    if (["L", "D", "B", "l", "d", "b"].includes(m)) target *= -1;

    setActiveMove({ axis, layer, angle: 0, target });
  }, []);

  useEffect(() => {
    if (!activeMove && moveQueue.current.length > 0 && !isPaused) {
      const nextMove = moveQueue.current[0];
      
      // Auto-rotate camera ONLY for Step 1
      if (stepId === 1 && subStep === 1) {
        let lookAheadMove = nextMove;
        // If current move is U (alignment), look at the face that will be solved next (the 2nd move in queue)
        if (nextMove.startsWith('U') && moveQueue.current.length > 1) {
          lookAheadMove = moveQueue.current[1];
        }
        
        const camPos = getCameraPosForMove(lookAheadMove);
        if (targetCamPos.distanceTo(camPos) > 0.01) setTargetCamPos(camPos);
        
        const timer = setTimeout(() => {
          const actualMove = moveQueue.current.shift();
          if (actualMove) performMove(actualMove);
        }, 1000);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => {
          const actualMove = moveQueue.current.shift();
          if (actualMove) performMove(actualMove);
        }, (stepId === 2 || stepId === 5) ? 1000 : 300);
        return () => clearTimeout(timer);
      }
    } else if (!activeMove && moveQueue.current.length === 0 && !isPaused) {
      if (stepId === 1 && subStep === 0) { if (setIsPaused) setIsPaused(true); return; }
      if (stepId >= 3) { if (setIsPaused) setIsPaused(true); return; }

      const bottomPos = new THREE.Vector3(4, -4, 4);
      if (targetCamPos.distanceTo(bottomPos) > 0.1) setTargetCamPos(bottomPos);
      
      const timer = setTimeout(() => {
        if (setIsPaused) setIsPaused(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [activeMove, performMove, isPaused, stepId, subStep, getCameraPosForMove, setIsPaused, targetCamPos]);

  const finalizeMove = useCallback((axis: 'x' | 'y' | 'z', layer: number | number[], targetAngle: number) => {
    setCubies(prev => prev.map(cubie => {
      const val = axis === 'x' ? cubie.pos.x : axis === 'y' ? cubie.pos.y : cubie.pos.z;
      const layers = Array.isArray(layer) ? layer : [layer];
      if (!layers.some(l => Math.abs(val - l) <= PHYSICS.LAYER_THRESHOLD)) return cubie;

      const rotationAxis = new THREE.Vector3(axis === 'x' ? 1 : 0, axis === 'y' ? 1 : 0, axis === 'z' ? 1 : 0);
      const newPos = cubie.pos.clone().applyAxisAngle(rotationAxis, targetAngle);
      newPos.x = Math.round(newPos.x);
      newPos.y = Math.round(newPos.y);
      newPos.z = Math.round(newPos.z);

      let s = [...cubie.stickers];
      let angle = targetAngle;
      while (angle < 0) angle += Math.PI * 2;
      const steps = Math.round(angle / (Math.PI / 2)) % 4;

      for (let i = 0; i < steps; i++) {
        const p = [...s];
        if (axis === 'x') {
          s[4] = p[2]; s[3] = p[4]; s[5] = p[3]; s[2] = p[5];
        } else if (axis === 'y') {
          s[0] = p[4]; s[5] = p[0]; s[1] = p[5]; s[4] = p[1];
        } else if (axis === 'z') {
          s[1] = p[2]; s[3] = p[1]; s[0] = p[3]; s[2] = p[0];
        }
      }
      return { ...cubie, pos: newPos, stickers: s };
    }));
    setActiveMove(null);
  }, []);

  return (
    <>
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />
      <ambientLight intensity={SCENE.LIGHT_INTENSITY} />
      <RubikCube
        cubies={cubies} 
        activeMove={activeMove} 
        setActiveMove={setActiveMove}
        onAnimationEnd={finalizeMove} 
        onPointerDown={() => {}} 
        dragAngleRef={{ current: 0 } as any}
      />
      <OrbitControls ref={controlsRef} enableZoom={true} enablePan={false} />
      <ContactShadows position={[0, -2, 0]} opacity={0.4} scale={10} blur={2} far={4.5} resolution={128} frames={1} />
    </>
  );
};

export const StaticCube = (props: StaticCubeProps) => {
  return (
    <div className="w-full h-full relative">
      <View className="w-full h-full">
        <StaticCubeContent {...props} />
      </View>
    </div>
  );
};
