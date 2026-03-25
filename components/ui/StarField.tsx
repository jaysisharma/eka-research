"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  radius: number;
  baseOpacity: number;
  speed: number;
  twinkleSpeed: number;
  twinklePhase: number;
  colorType: "white" | "blue" | "gold";
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  opacity: number;
  life: number;
  maxLife: number;
}

function randBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

function getStarColor(type: Star["colorType"], alpha: number) {
  switch (type) {
    case "gold": return `rgba(254,199,62,${alpha})`;
    case "blue": return `rgba(176,188,232,${alpha})`;
    default:     return `rgba(255,255,255,${alpha})`;
  }
}

function makeColorType(): Star["colorType"] {
  const r = Math.random();
  if (r < 0.04) return "gold";
  if (r < 0.22) return "blue";
  return "white";
}

export default function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Assign to typed consts so inner functions capture non-null refs
    const c: HTMLCanvasElement = canvas;
    const g: CanvasRenderingContext2D = ctx;

    let animId: number;
    let stars: Star[] = [];
    let shootingStars: ShootingStar[] = [];
    let tick = 0;
    let nextShootAt = randBetween(180, 400);

    function resize() {
      c.width = window.innerWidth;
      c.height = window.innerHeight;
      buildStars();
    }

    function buildStars() {
      const count = Math.max(120, Math.floor((c.width * c.height) / 7000));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * c.width,
        y: Math.random() * c.height,
        radius: randBetween(0.2, 1.8),
        baseOpacity: randBetween(0.25, 0.95),
        speed: randBetween(0.04, 0.18),
        twinkleSpeed: randBetween(0.4, 1.8),
        twinklePhase: Math.random() * Math.PI * 2,
        colorType: makeColorType(),
      }));
    }

    function spawnShootingStar() {
      const angle = randBetween(25, 50) * (Math.PI / 180);
      const speed = randBetween(9, 16);
      shootingStars.push({
        x: randBetween(0, c.width * 0.65),
        y: randBetween(0, c.height * 0.45),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        length: randBetween(90, 180),
        opacity: 0,
        life: 0,
        maxLife: Math.floor(randBetween(45, 75)),
      });
    }

    function draw() {
      tick++;
      g.clearRect(0, 0, c.width, c.height);

      /* Stars */
      for (const star of stars) {
        star.y += star.speed;
        if (star.y > c.height) {
          star.y = 0;
          star.x = Math.random() * c.width;
        }
        const twinkle = 0.5 + 0.5 * Math.sin(tick * 0.018 * star.twinkleSpeed + star.twinklePhase);
        const alpha = star.baseOpacity * (0.35 + 0.65 * twinkle);
        g.beginPath();
        g.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        g.fillStyle = getStarColor(star.colorType, alpha);
        g.fill();
      }

      /* Shooting stars */
      if (tick >= nextShootAt) {
        spawnShootingStar();
        nextShootAt = tick + randBetween(220, 450);
      }

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];
        s.life++;
        s.x += s.vx;
        s.y += s.vy;

        /* Fade in then out */
        const progress = s.life / s.maxLife;
        s.opacity = progress < 0.2
          ? progress / 0.2
          : 1 - (progress - 0.2) / 0.8;

        if (s.opacity > 0) {
          const angle = Math.atan2(s.vy, s.vx);
          const tailX = s.x - Math.cos(angle) * s.length;
          const tailY = s.y - Math.sin(angle) * s.length;

          const grad = g.createLinearGradient(tailX, tailY, s.x, s.y);
          grad.addColorStop(0, `rgba(255,255,255,0)`);
          grad.addColorStop(0.6, `rgba(255,255,255,${s.opacity * 0.4})`);
          grad.addColorStop(1, `rgba(255,255,255,${s.opacity})`);

          g.beginPath();
          g.moveTo(tailX, tailY);
          g.lineTo(s.x, s.y);
          g.strokeStyle = grad;
          g.lineWidth = 1.5;
          g.stroke();
        }

        if (s.life >= s.maxLife) shootingStars.splice(i, 1);
      }

      animId = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize, { passive: true });
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
}
