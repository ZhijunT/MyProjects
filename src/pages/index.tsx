import React, { useRef, useEffect, useState } from "react";

const planets = [
  { name: "Mercury", color: "#b1b1b1", r: 70, size: 11, url: "https://youtube.com", speed: 1.6, img: "/planets/mercury.png"},
  { name: "Venus", color: "#e6c97b", r: 100, size: 15, url: "https://youtube.com", speed: 1.2, img: "/planets/venus.png" },
  { name: "Earth", color: "#3a6ea5", r: 130, size: 17, url: "https://youtube.com", speed: 1, img: "/planets/earth.png" },
  { name: "Mars", color: "#c1440e", r: 170, size: 14, url: "https://youtube.com", speed: 0.8, img: "/planets/mars.png" },
  { name: "Jupiter", color: "#e2b07a", r: 220, size: 40, url: "https://youtube.com", speed: 0.5, img: "/planets/jupiter.png" },
  { name: "Saturn", color: "#e7d3a1", r: 280, size: 40, url: "https://youtube.com", speed: 0.4, img: "/planets/saturn.png" },
  { name: "Uranus", color: "#b5e3e3", r: 330, size: 23, url: "https://youtube.com", speed: 0.3, img: "/planets/uranus.png" },
  { name: "Neptune", color: "#4062bb", r: 400, size: 27, url: "https://youtube.com", speed: 0.25, img: "/planets/neptune.png" },
];

type Trail = { x: number; y: number };

const TRAIL_LENGTH = 60;
const MIN_SPEED = 0;
const MAX_SPEED = 5;
const SPEED_STEP = 0.25;
const INITIAL_SPEED = 1;
const SUN_SPEEDUP_STEP = 0.005;
const SUN_SPEEDUP_STEP_2 = SUN_SPEEDUP_STEP * 2;

const Home: React.FC = () => {
  const [planetStates, setPlanetStates] = useState(
    planets.map((_, i) => ({
      angle: (i / planets.length) * 2 * Math.PI - Math.PI / 2,
      trail: [] as Trail[],
    }))
  );
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [sunActive, setSunActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioRef2 = useRef<HTMLAudioElement>(null);
  const [sunPhase, setSunPhase] = useState<1 | 2>(1);

  // Sync video playback rate with speed
  useEffect(() => {
    if (videoRef.current) {
      // Clamp playbackRate between 0.0625 and 16
      const clamped = Math.max(0.0625, Math.min(speed, 16));
      videoRef.current.playbackRate = clamped;
    }
  }, [speed]);

  // Animation loop for planets
  useEffect(() => {
    let animationId: number;
    let lastTime = performance.now();

    const animate = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;
      setPlanetStates((prev) =>
        prev.map((state, i) => {
          const planet = planets[i];
          const angle = state.angle + planet.speed * delta * 0.5 * speed;
          const x = 1000 + planet.r * Math.cos(angle);
          const y = 1000 + planet.r * Math.sin(angle);
          const newTrail = [...state.trail, { x, y }];
          if (newTrail.length > TRAIL_LENGTH) newTrail.shift();
          return { angle, trail: newTrail };
        })
      );
      animationId = requestAnimationFrame(animate);
    };
    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [speed]);

  // Sun speedup effect
  useEffect(() => {
    if (!sunActive) return;
    let raf: number;
    const speedup = () => {
      setSpeed((prev) => prev + (sunPhase === 1 ? SUN_SPEEDUP_STEP : SUN_SPEEDUP_STEP_2));
      raf = requestAnimationFrame(speedup);
    };
    raf = requestAnimationFrame(speedup);
    return () => cancelAnimationFrame(raf);
  }, [sunActive, sunPhase]);

  // Listen for sound1 ending, then play sound2 and double speedup
  useEffect(() => {
    if (!sunActive) return;
    const handleEnded = () => {
      setSunPhase(2);
      if (audioRef2.current) {
        audioRef2.current.currentTime = 0;
        audioRef2.current.play();
      }
    };
    const audio = audioRef.current;
    if (audio) {
      audio.addEventListener("ended", handleEnded);
    }
    return () => {
      if (audio) audio.removeEventListener("ended", handleEnded);
    };
  }, [sunActive]);

  // Sun click handler
  const handleSunClick = () => {
    if (!sunActive) {
      setSunActive(true);
      setSunPhase(1);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    }
  };

  // Button handlers (disable while sunActive)
  const handleSlower = () => !sunActive && setSpeed((s) => Math.max(MIN_SPEED, +(s - SPEED_STEP).toFixed(2)));
  const handlePause = () => !sunActive && setSpeed(0);
  const handleFaster = () => !sunActive && setSpeed((s) => Math.min(MAX_SPEED, +(s + SPEED_STEP).toFixed(2)));

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        position: "fixed",
        inset: 0,
        zIndex: 0,
      }}
    >
      {/* Video Background */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        src="/videos/space1.mp4"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          objectFit: "cover",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
      {/* Audio for sun event */}
      <audio ref={audioRef} src="/videos/sound1.mp3" />
      <audio ref={audioRef2} src="/videos/sound2.mp3" />
      {/* Overlay to darken video for readability */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "radial-gradient(ellipse at center, rgba(10,10,20,0.35) 100%, rgba(20,20,30,0.35) 100%)",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />
      {/* Main content */}
      <div style={{ position: "relative", zIndex: 2, width: "100vw", height: "100vh" }}>
        {/* Speed Controls */}
        <div
          style={{
            position: "absolute",
            top: 32,
            right: 32,
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "rgba(20,20,30,0.85)",
            borderRadius: 12,
            padding: "10px 18px",
            boxShadow: "0 2px 12px #0008",
            fontFamily: "Orbitron, sans-serif",
          }}
        >
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 18, marginRight: 10 }}>
            {speed.toFixed(2).replace(/\.00$/, "")}x
          </span>
          <button
            onClick={handleSlower}
            disabled={speed <= MIN_SPEED || sunActive}
            style={{
              background: "#222",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "6px 12px",
              fontSize: 16,
              cursor: speed > MIN_SPEED && !sunActive ? "pointer" : "not-allowed",
              opacity: speed > MIN_SPEED && !sunActive ? 1 : 0.5,
            }}
          >
            Slower
          </button>
          <button
            onClick={handlePause}
            disabled={sunActive}
            style={{
              background: "#444",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "6px 12px",
              fontSize: 16,
              cursor: !sunActive ? "pointer" : "not-allowed",
              opacity: !sunActive ? 1 : 0.5,
            }}
          >
            Pause
          </button>
          <button
            onClick={handleFaster}
            disabled={speed >= MAX_SPEED || sunActive}
            style={{
              background: "#222",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "6px 12px",
              fontSize: 16,
              cursor: speed < MAX_SPEED && !sunActive ? "pointer" : "not-allowed",
              opacity: speed < MAX_SPEED && !sunActive ? 1 : 0.5,
            }}
          >
            Faster
          </button>
        </div>
        <svg
          width="2000"
          height="2000"
          style={{
            position: "absolute",
            left: `calc(50% - 1000px)`,
            top: `calc(50% - 1000px)`,
          }}
        >
          {/* Sun as a button */}
          <image
            href="/planets/sun.png"
            x={1000 - 60}
            y={1000 - 60}
            width={120}
            height={120}
            style={{ cursor: "pointer", pointerEvents: "auto" }}
            onClick={handleSunClick}
          />
          {/* Orbits */}
          {planets.map((p, i) => (
            <circle
              key={p.name + "-orbit"}
              cx={1000}
              cy={1000}
              r={p.r}
              fill="none"
              stroke="#444"
              strokeDasharray="4 4"
            />
          ))}
          {/* Contrails */}
          {planetStates.map((state, i) => (
            <polyline
              key={planets[i].name + "-trail"}
              points={state.trail.map((t) => `${t.x},${t.y}`).join(" ")}
              fill="none"
              stroke={planets[i].color}
              strokeWidth={2}
              opacity={0.5}
            />
          ))}
          {/* Planets */}
          {planetStates.map((state, i) => {
            const planet = planets[i];
            const x = 1000 + planet.r * Math.cos(state.angle);
            const y = 1000 + planet.r * Math.sin(state.angle);
            return (
              <a
                key={planet.name}
                href={planet.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none" }}
              >
                {/* Only show circle if no image */}
                {!planet.img && (
                  <circle
                    cx={x}
                    cy={y}
                    r={planet.size}
                    fill={planet.color}
                    stroke="#222"
                    strokeWidth={2}
                    style={{ cursor: "pointer" }}
                  />
                )}
                {/* Show image if present */}
                {planet.img && (
                  <image
                    href={planet.img}
                    x={x - planet.size}
                    y={y - planet.size}
                    width={planet.size * 2}
                    height={planet.size * 2}
                    style={{ cursor: "pointer" }}
                  />
                )}
                <text
                  x={x}
                  y={y - planet.size - 8}
                  fill="#fff"
                  fontSize="14"
                  textAnchor="middle"
                  style={{
                    textShadow: "0 0 4px #000, 0 0 8px #000",
                    pointerEvents: "none",
                    fontFamily: "sans-serif",
                  }}
                >
                  {planet.name}
                </text>
              </a>
            );
          })}
        </svg>
        <div
          style={{
            position: "absolute",
            top: 32,
            left: 0,
            width: "100%",
            textAlign: "center",
            color: "#fff",
            fontFamily: "Orbitron, sans-serif",
            letterSpacing: 2,
            textShadow: "0 0 8px #000",
            userSelect: "none",
          }}
        >
          <h1 style={{ fontWeight: 700, fontSize: 36, margin: 0 }}>
            Klee and Piemon
          </h1>
          <p style={{ fontSize: 18, margin: 0 }}>
            Watch the planets orbit and leave trails. Click a planet to learn more!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;