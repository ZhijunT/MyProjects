import React, { useRef, useEffect, useState } from "react";

const planets = [
  { name: "Mercury", color: "#b1b1b1", r: 70, size: 11, url: "https://note-summary.zhijuntian.com/", speed: 1.6, img: "/planets/mercury.png"},
  { name: "Venus", color: "#e6c97b", r: 100, size: 15, url: "https://customer-service.zhijuntian.com/", speed: 1.2, img: "/planets/venus.png" },
  { name: "Earth", color: "#3a6ea5", r: 130, size: 17, url: "https://trading.zhijuntian.com/", speed: 1, img: "/planets/earth.png" },
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
const SUN_SPEEDUP_STEP = 0.007;
const SUN_SPEEDUP_STEP_2 = SUN_SPEEDUP_STEP * 2;
const PULL_START = 13; // seconds after sun click to start pulling
const PULL_DURATION = 35; // seconds for the pull-in effect
const BG_VIDEOS = ["/videos/space.mp4", "/videos/space1.mp4", "/videos/space2.mp4"];

const MENU_WIDTH = 320; // <--- Change this value to set the menu width (px)

const Home: React.FC = () => {
  const [planetStates, setPlanetStates] = useState(
    planets.map((_, i) => ({
      angle: (i / planets.length) * 2 * Math.PI - Math.PI / 2,
      trail: [] as Trail[],
    }))
  );
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [sunActive, setSunActive] = useState(false);
  const [sunTimer, setSunTimer] = useState<number>(0);
  const [pulling, setPulling] = useState(false);
  const [showNames, setShowNames] = useState(true);
  const [showOrbits, setShowOrbits] = useState(true);
  const [bgVideoIndex, setBgVideoIndex] = useState(1); // default to space1.mp4
  const [bgVideo, setBgVideo] = useState(BG_VIDEOS[bgVideoIndex]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioRef2 = useRef<HTMLAudioElement>(null);
  const [sunPhase, setSunPhase] = useState<1 | 2>(1);
  const sunStartRef = useRef<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      if (speed === 0) {
        videoRef.current.playbackRate = 0;
      } else {
        const clamped = Math.max(0.0625, Math.min(speed, 16));
        videoRef.current.playbackRate = clamped;
      }
    }
  }, [speed]);

  useEffect(() => {
    if (!sunActive) {
      setSunTimer(0);
      setPulling(false);
      sunStartRef.current = null;
      return;
    }
    let raf: number;
    const tick = () => {
      if (sunStartRef.current === null) sunStartRef.current = performance.now();
      const elapsed = (performance.now() - sunStartRef.current) / 1000;
      setSunTimer(elapsed);
      if (elapsed >= PULL_START && !pulling) setPulling(true);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [sunActive, pulling]);

  useEffect(() => {
    let animationId: number;
    let lastTime = performance.now();

    const animate = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;
      setPlanetStates((prev) =>
        prev.map((state, i) => {
          const planet = planets[i];
          let r = planet.r;
          if (pulling && sunTimer >= PULL_START) {
            const pullElapsed = Math.min(sunTimer - PULL_START, PULL_DURATION);
            const pullProgress = Math.min(pullElapsed / PULL_DURATION, 1);
            r = planet.r * (1 - pullProgress * pullProgress);
          }
          const angle = state.angle + planet.speed * delta * 0.5 * speed;
          const x = 1000 + r * Math.cos(angle);
          const y = 1000 + r * Math.sin(angle);
          const newTrail = [...state.trail, { x, y }];
          if (newTrail.length > TRAIL_LENGTH) newTrail.shift();
          return { angle, trail: newTrail };
        })
      );
      animationId = requestAnimationFrame(animate);
    };
    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [speed, pulling, sunTimer]);

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

  useEffect(() => {
    if (!sunActive) return;
    const handleEnded = () => {
      setSunPhase(2);
      if (audioRef2.current) {
        audioRef2.current.currentTime = 0;
        audioRef2.current.volume = 0.3; // Lower the volume (0.0 - 1.0)
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

  const handleSlower = () => !sunActive && setSpeed((s) => Math.max(MIN_SPEED, +(s - SPEED_STEP).toFixed(2)));
  const handlePause = () => !sunActive && setSpeed(0);
  const handleFaster = () => !sunActive && setSpeed((s) => Math.min(MAX_SPEED, +(s + SPEED_STEP).toFixed(2)));

  useEffect(() => {
    setBgVideo(BG_VIDEOS[bgVideoIndex]);
  }, [bgVideoIndex]);


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
        src={bgVideo}
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
      {/* Customization Buttons (bottom right) */}
      <div
        style={{
          position: "fixed",
          bottom: 32,
          right: 32,
          zIndex: 20,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <button
          onClick={() => setShowNames((v) => !v)}
          style={{
            background: "rgba(255,255,255,0.05)",
            color: "#fff",
            border: "2px solid #fff",
            borderRadius: 8,
            padding: "10px 18px",
            fontSize: 16,
            fontFamily: "Orbitron, sans-serif",
            cursor: "pointer",
            boxShadow: "0 2px 8px #0004",
            transition: "background 0.2s, border-color 0.2s",
          }}
        >
          {showNames ? "Hide Names" : "Show Names"}
        </button>
        <button
          onClick={() => setShowOrbits((v) => !v)}
          style={{
            background: "rgba(255,255,255,0.05)",
            color: "#fff",
            border: "2px solid #fff",
            borderRadius: 8,
            padding: "10px 18px",
            fontSize: 16,
            fontFamily: "Orbitron, sans-serif",
            cursor: "pointer",
            boxShadow: "0 2px 8px #0004",
            transition: "background 0.2s, border-color 0.2s",
          }}
        >
          {showOrbits ? "Hide Orbits" : "Show Orbits"}
        </button>
        <button
          onClick={() => setBgVideoIndex((i) => (i + 1) % BG_VIDEOS.length)}
          style={{
            background: "rgba(255,255,255,0.05)",
            color: "#fff",
            border: "2px solid #fff",
            borderRadius: 8,
            padding: "10px 18px",
            fontSize: 16,
            fontFamily: "Orbitron, sans-serif",
            cursor: "pointer",
            boxShadow: "0 2px 8px #0004",
            transition: "background 0.2s, border-color 0.2s",
          }}
        >
          Change Background
        </button>
      </div>
      {/* Top-left menu toggle button */}
      <button
        onClick={() => setMenuOpen((v) => !v)}
        style={{
          position: "fixed",
          top: 32,
          left: menuOpen ? MENU_WIDTH + 32 : 32, // Slide with menu
          zIndex: 30,
          background: "rgba(255,255,255,0.05)",
          color: "#fff",
          border: "2px solid #fff",
          borderRadius: 8,
          padding: "10px 18px",
          fontSize: 16,
          fontFamily: "Orbitron, sans-serif",
          cursor: "pointer",
          boxShadow: "0 2px 8px #0004",
          transition: "left 0.35s cubic-bezier(.77,0,.18,1), background 0.2s, border-color 0.2s",
        }}
      >
        {menuOpen ? "Close Menu" : "Open Menu"}
      </button>

      {/* Sliding menu */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          width: MENU_WIDTH,
          maxWidth: "90vw",
          background: "rgba(20,20,30,0.95)",
          boxShadow: "2px 0 16px #0008",
          zIndex: 25,
          // Move menu fully out of view when closed
          transform: menuOpen ? "translateX(0)" : `translateX(-${MENU_WIDTH + 40}px)`,
          transition: "transform 0.35s cubic-bezier(.77,0,.18,1)",
          display: "flex",
          flexDirection: "column",
          gap: 18,
          padding: "48px 24px 24px 24px",
        }}
      >
        <h2
          style={{
            color: "#fff",
            fontFamily: "Orbitron, sans-serif",
            fontWeight: 700,
            fontSize: 24,
            margin: "0 0 18px 0",
            letterSpacing: 2,
            textShadow: "0 0 8px #000",
          }}
        >
          Planets
        </h2>
        {planets.map((planet) => (
          <a
            key={planet.name}
            href={planet.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "none", width: "100%" }}
          >
            <button
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.05)",
                color: "#fff",
                border: "2px solid #fff",
                borderRadius: 8,
                padding: "10px 18px",
                fontSize: 16,
                fontFamily: "Orbitron, sans-serif",
                cursor: "pointer",
                boxShadow: "0 2px 8px #0004",
                marginBottom: 8,
                textAlign: "left",
                transition: "background 0.2s, border-color 0.2s",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              {planet.img && (
                <img
                  src={planet.img}
                  alt={planet.name}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    objectFit: "cover",
                    background: "#222",
                  }}
                />
              )}
              <span>{planet.name}</span>
            </button>
          </a>
        ))}
      </div>
      {/* Main content */}
      <div style={{ position: "relative", zIndex: 2, width: "100vw", height: "100vh" }}>
        {/* Timer display (optional) */}
        {sunActive && (
          <div
            style={{
              position: "absolute",
              top: 32,
              left: 32,
              zIndex: 10,
              background: "rgba(20,20,30,0.85)",
              borderRadius: 12,
              padding: "8px 16px",
              color: "#fff",
              fontFamily: "Orbitron, sans-serif",
              fontSize: 18,
              letterSpacing: 1,
              boxShadow: "0 2px 12px #0008",
            }}
          >
            {Math.floor(sunTimer)}s
          </div>
        )}
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
          {/* Sun or Blackhole as a button */}
          <image
            href={sunPhase === 2 ? "/planets/blackhole1.png" : "/planets/sun.png"}
            x={1000 - 60}
            y={1000 - 60}
            width={120}
            height={120}
            style={{ cursor: "pointer", pointerEvents: "auto" }}
            onClick={handleSunClick}
          />
          {/* Orbits */}
          {showOrbits &&
            planets.map((p, i) => (
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
            let r = planet.r;
            if (pulling && sunTimer >= PULL_START) {
              const pullElapsed = Math.min(sunTimer - PULL_START, PULL_DURATION);
              const pullProgress = Math.min(pullElapsed / PULL_DURATION, 1);
              r = planet.r * (1 - pullProgress * pullProgress);
            }
            const x = 1000 + r * Math.cos(state.angle);
            const y = 1000 + r * Math.sin(state.angle);
            return (
              <a
                key={planet.name}
                href={planet.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none" }}
              >
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
                {showNames && (
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
                )}
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
            Welcome to my page
          </h1>
          <p style={{ fontSize: 18, margin: 0 }}>
            Check out my other projects by clicking on the planets
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;