import React from 'react';

interface PlanetProps {
  name: string;
  size: number;
  color: string;
  videoLink: string;
}

const Planet: React.FC<PlanetProps> = ({ name, size, color, videoLink }) => {
  const handleClick = () => {
    window.open(videoLink, '_blank');
  };

  return (
    <mesh onClick={handleClick} scale={[size, size, size]}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color={color} />
      <textGeometry args={[name, { font: 'helvetiker', size: 0.5, height: 0.1 }]} />
    </mesh>
  );
};

export default Planet;