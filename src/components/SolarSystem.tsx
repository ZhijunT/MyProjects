import React, { useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Planet from './Planet';
import { planets } from '../utils/planets';

const SolarSystem = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const handleMouseDown = (event) => {
      // Logic to start dragging
    };

    const handleMouseMove = (event) => {
      // Logic to rotate the view
    };

    const handleMouseUp = () => {
      // Logic to stop dragging
    };

    const canvas = canvasRef.current;
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <Canvas ref={canvasRef} style={{ height: '100vh', background: 'black' }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="yellow" />
      </mesh>
      {planets.map((planet) => (
        <Planet key={planet.name} {...planet} />
      ))}
      <OrbitControls />
    </Canvas>
  );
};

export default SolarSystem;