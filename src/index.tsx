import { createCliRenderer, TextAttributes } from "@opentui/core";
import { createRoot, useKeyboard, useRenderer, useTimeline } from "@opentui/react";
import { useState, useEffect } from "react";

// Valentine's color palette
type Screen = "proposal" | "yes" | "no" | "game" | "gameover";
type GameState = "countdown" | "playing" | "won" | "lost";

const COLORS = {
  hotPink: "#FF69B4",
  deepPink: "#FF1493",
  crimson: "#DC143C",
  loveRed: "#E91E63",
  purple: "#9C27B0",
  lavender: "#E6E6FA",
  rose: "#FFE4E1",
  lightRose: "#FFF0F5",
  gold: "#FFD700",
  white: "#FFFFFF",
  darkPurple: "#4A0E4E",
  black: "#000000",
  rainbow: ["#FF0000", "#FF7F00", "#FFFF00", "#00FF00", "#0000FF", "#4B0082", "#9400D3"],
};

// Heart types for the game
const HEART_TYPES = {
  pink: { char: "💕", points: 5, color: COLORS.hotPink },
  sparkle: { char: "💖", points: 10, color: COLORS.gold },
  gift: { char: "💝", points: 25, color: COLORS.deepPink },
  broken: { char: "💔", points: -10, color: "#666666" },
};

// Interpolate between two colors
function interpolateColor(color1: string, color2: string, factor: number): string {
  const hex2rgb = (hex: string) => ({
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  });
  
  const c1 = hex2rgb(color1);
  const c2 = hex2rgb(color2);
  
  const r = Math.round(c1.r + (c2.r - c1.r) * factor);
  const g = Math.round(c1.g + (c2.g - c1.g) * factor);
  const b = Math.round(c1.b + (c2.b - c1.b) * factor);
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Falling hearts background animation
function FallingHearts() {
  const [hearts, setHearts] = useState<Array<{
    id: number;
    x: number;
    y: number;
    char: string;
    color: string;
    speed: number;
    twinkle: boolean;
  }>>([]);

  useEffect(() => {
    const heartChars = ["💕", "💖", "💗", "💓", "💝", "♥"];
    const heartColors = [COLORS.hotPink, COLORS.deepPink, COLORS.crimson, COLORS.loveRed, COLORS.purple];
    
    const initialHearts = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 90 + 2,
      y: Math.random() * 30 - 30,
      char: heartChars[Math.floor(Math.random() * heartChars.length)],
      color: heartColors[Math.floor(Math.random() * heartColors.length)],
      speed: Math.random() * 0.4 + 0.2,
      twinkle: Math.random() > 0.5,
    }));
    
    setHearts(initialHearts);

    const interval = setInterval(() => {
      setHearts(prev => prev.map(heart => {
        const newY = heart.y + heart.speed;
        const newTwinkle = Math.random() > 0.7 ? !heart.twinkle : heart.twinkle;
        
        if (newY > 30) {
          return {
            ...heart,
            y: -2,
            x: Math.random() * 90 + 2,
            char: heartChars[Math.floor(Math.random() * heartChars.length)],
            color: heartColors[Math.floor(Math.random() * heartColors.length)],
            speed: Math.random() * 0.4 + 0.2,
          };
        }
        
        return {
          ...heart,
          y: newY,
          twinkle: newTwinkle,
        };
      }));
    }, 80);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {hearts.map(heart => (
        <box
          key={heart.id}
          position="absolute"
          left={Math.round(heart.x)}
          top={Math.round(heart.y)}
        >
          <text 
            fg={heart.twinkle ? heart.color : COLORS.white}
            attributes={heart.twinkle ? 0 : 2}
          >
            {heart.char}
          </text>
        </box>
      ))}
    </>
  );
}

// Valentine Card Frame Component
function ValentineFrame({ children }: { children: React.ReactNode }) {
  return (
    <box position="relative">
      {/* Outer decorative border */}
      <box
        border
        borderColor={COLORS.deepPink}
        borderStyle="double"
        padding={1}
        backgroundColor={COLORS.white}
      >
        {/* Inner content area */}
        <box
          border
          borderColor={COLORS.hotPink}
          borderStyle="round"
          padding={3}
          backgroundColor={COLORS.white}
          flexDirection="column"
          alignItems="center"
          gap={1}
        >
          {children}
        </box>
      </box>
      
      {/* Corner hearts */}
      <box position="absolute" left={0} top={0}>
        <text fg={COLORS.crimson}>💕</text>
      </box>
      <box position="absolute" right={0} top={0}>
        <text fg={COLORS.hotPink}>💖</text>
      </box>
      <box position="absolute" left={0} bottom={0}>
        <text fg={COLORS.deepPink}>💝</text>
      </box>
      <box position="absolute" right={0} bottom={0}>
        <text fg={COLORS.loveRed}>💗</text>
      </box>
      
      {/* Side decorations */}
      <box position="absolute" left={-1} top="50%">
        <text fg={COLORS.gold}>✨</text>
      </box>
      <box position="absolute" right={-1} top="50%">
        <text fg={COLORS.gold}>✨</text>
      </box>
    </box>
  );
}

// Proposal Screen with heartbeat and color pulsing
function ProposalScreen({ onSelect }: { onSelect: (choice: "yes" | "no") => void }) {
  const [bgColor, setBgColor] = useState(COLORS.rose);
  const [scale, setScale] = useState(1);
  const [borderGlow, setBorderGlow] = useState(0);
  
  const heartbeatTimeline = useTimeline({
    loop: true,
    duration: 1200,
  });
  
  const colorTimeline = useTimeline({
    loop: true,
    duration: 8000,
  });

  useEffect(() => {
    // Heartbeat animation
    heartbeatTimeline.add(
      { scale: 1 },
      {
        scale: 1.02,
        duration: 150,
        ease: "easeOutQuad",
        onUpdate: (anim) => setScale(anim.targets[0].scale),
      },
      0
    );
    heartbeatTimeline.add(
      { scale: 1.02 },
      {
        scale: 1,
        duration: 150,
        ease: "easeInQuad",
        onUpdate: (anim) => setScale(anim.targets[0].scale),
      },
      150
    );
    heartbeatTimeline.add(
      { scale: 1 },
      {
        scale: 1.015,
        duration: 120,
        ease: "easeOutQuad",
        onUpdate: (anim) => setScale(anim.targets[0].scale),
      },
      400
    );
    heartbeatTimeline.add(
      { scale: 1.015 },
      {
        scale: 1,
        duration: 120,
        ease: "easeInQuad",
        onUpdate: (anim) => setScale(anim.targets[0].scale),
      },
      520
    );
    
    // Color transition animation
    colorTimeline.add(
      { progress: 0 },
      {
        progress: 1,
        duration: 8000,
        ease: "linear",
        onUpdate: (anim) => {
          const progress = anim.targets[0].progress;
          let color;
          if (progress < 0.33) {
            color = interpolateColor(COLORS.rose, COLORS.lightRose, progress * 3);
          } else if (progress < 0.66) {
            color = interpolateColor(COLORS.lightRose, "#FFB6C1", (progress - 0.33) * 3);
          } else {
            color = interpolateColor("#FFB6C1", COLORS.rose, (progress - 0.66) * 3);
          }
          setBgColor(color);
        },
      },
      0
    );
    
    // Border glow animation
    const glowInterval = setInterval(() => {
      setBorderGlow(g => (g + 1) % 2);
    }, 1000);
    
    return () => clearInterval(glowInterval);
  }, []);

  const borderColors = [COLORS.deepPink, COLORS.hotPink];

  return (
    <box
      flexGrow={1}
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      backgroundColor={bgColor}
      position="relative"
    >
      <FallingHearts />

      {/* Floating corner decorations */}
      <box position="absolute" left={3} top={2}>
        <text fg={COLORS.hotPink}>💕</text>
      </box>
      <box position="absolute" right={3} top={2}>
        <text fg={COLORS.deepPink}>💖</text>
      </box>
      <box position="absolute" left={5} bottom={3}>
        <text fg={COLORS.crimson}>💝</text>
      </box>
      <box position="absolute" right={5} bottom={3}>
        <text fg={COLORS.loveRed}>💗</text>
      </box>

      {/* Main proposal card with heartbeat effect */}
      <box 
        position="relative" 
        style={{ 
          transform: `scale(${scale})`,
        }}
      >
        <box
          border
          borderColor={borderColors[borderGlow]}
          borderStyle="double"
          padding={1}
          backgroundColor={COLORS.white}
        >
          <box
            border
            borderColor={COLORS.hotPink}
            borderStyle="round"
            padding={3}
            backgroundColor={COLORS.white}
            flexDirection="column"
            alignItems="center"
            gap={1}
          >
            <text fontSize="xl" fg={COLORS.crimson}>
              <strong>Will you be my Valentine?</strong>
            </text>
            
            <box marginTop={1} marginBottom={1}>
              <text fg={COLORS.hotPink}>
                💕 💖 💝 💗 💓
              </text>
            </box>

            {/* Selection */}
            <box marginTop={2} width={40}>
              <select
                options={[
                  { name: "Yes! 💕", description: "Of course I will!", value: "yes" },
                  { name: "No... 🥺", description: "I'm sorry...", value: "no" },
                ]}
                onSelect={(index, option) => {
                  onSelect(option.value as "yes" | "no");
                }}
                height={6}
                width={40}
                focused
                backgroundColor={COLORS.rose}
                selectedBackgroundColor={COLORS.deepPink}
                selectedTextColor={COLORS.white}
                highlightBackgroundColor={COLORS.hotPink}
                textColor={COLORS.darkPurple}
                showScrollIndicator={false}
              />
            </box>
          </box>
        </box>
        
        {/* Corner hearts on frame */}
        <box position="absolute" left={-1} top={-1}>
          <text fg={COLORS.crimson}>💕</text>
        </box>
        <box position="absolute" right={-1} top={-1}>
          <text fg={COLORS.hotPink}>💖</text>
        </box>
        <box position="absolute" left={-1} bottom={-1}>
          <text fg={COLORS.deepPink}>💝</text>
        </box>
        <box position="absolute" right={-1} bottom={-1}>
          <text fg={COLORS.loveRed}>💗</text>
        </box>
      </box>

      <box marginTop={3}>
        <text fg={COLORS.purple} attributes={TextAttributes.DIM}>
          Use ↑↓ to choose, Enter to select
        </text>
      </box>
    </box>
  );
}

// Enhanced No Screen with rain and dramatic effects
function NoScreen({ onReturn }: { onReturn: () => void }) {
  const [raindrops, setRaindrops] = useState<Array<{id: number; x: number; y: number; char: string}>>([]);
  const [tearFrame, setTearFrame] = useState(0);
  
  useEffect(() => {
    // Create rain
    const drops = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 30,
      char: ["│", "┃", "╽", "┆"][Math.floor(Math.random() * 4)],
    }));
    setRaindrops(drops);
    
    // Rain animation
    const rainInterval = setInterval(() => {
      setRaindrops(prev => prev.map(drop => {
        const newY = drop.y + 0.8;
        return {
          ...drop,
          y: newY > 30 ? -2 : newY,
          x: drop.x + (Math.random() - 0.5) * 0.5, // Slight sway
        };
      }));
    }, 100);
    
    // Tear animation
    const tearInterval = setInterval(() => {
      setTearFrame(f => (f + 1) % 3);
    }, 500);
    
    // Return timer
    const timer = setTimeout(() => {
      onReturn();
    }, 3500);
    
    return () => {
      clearInterval(rainInterval);
      clearInterval(tearInterval);
      clearTimeout(timer);
    };
  }, [onReturn]);
  
  const tearFrames = ["💧", "💧", " "];

  return (
    <box
      flexGrow={1}
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      backgroundColor="#1a1a2e"
      position="relative"
    >
      {/* Rain effect */}
      {raindrops.map(drop => (
        <box
          key={drop.id}
          position="absolute"
          left={Math.round(drop.x)}
          top={Math.round(drop.y)}
        >
          <text fg="#4a4a6a" attributes={TextAttributes.DIM}>
            {drop.char}
          </text>
        </box>
      ))}

      <box
        border
        borderColor="#5C4033"
        borderStyle="round"
        padding={3}
        backgroundColor="#2d2d44"
        flexDirection="column"
        alignItems="center"
        gap={1}
      >
        <text fontSize="xl" fg="#8B4513">
          <strong>Are you sure? 🥺</strong>
        </text>
        
        <box marginTop={1}>
          <text fg="#A0522D">
            💔 💔 💔
          </text>
        </box>

        {/* Animated sad face with tears */}
        <box marginTop={1} flexDirection="column" alignItems="center">
          <text fg="#CD853F">
            ╭──────────╮
          </text>
          <box flexDirection="row">
            <text fg="#CD853F">│ </text>
            <text fg="#87CEEB">{tearFrame === 1 ? "💧" : "  "}</text>
            <text fg="#CD853F">  ◠‸◠   </text>
            <text fg="#87CEEB">{tearFrame === 0 ? "💧" : "  "}</text>
            <text fg="#CD853F"> │</text>
          </box>
          <text fg="#CD853F">
            │    つ    │
            <br />
            ╰──────────╯
          </text>
        </box>

        <box marginTop={1}>
          <text fg="#8B7355" attributes={TextAttributes.DIM}>
            Please... think about it...
          </text>
        </box>
      </box>

      <box marginTop={2}>
        <text fg="#5C5C7a" attributes={TextAttributes.DIM}>
          Returning to proposal...
        </text>
      </box>
    </box>
  );
}

// Heart Collector Game
function HeartCollectorGame({ onWin, onLose }: { onWin: () => void; onLose: () => void }) {
  const [gameState, setGameState] = useState<GameState>("countdown");
  const [countdown, setCountdown] = useState(3);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [playerX, setPlayerX] = useState(40);
  const [hearts, setHearts] = useState<Array<{
    id: number;
    x: number;
    y: number;
    type: keyof typeof HEART_TYPES;
  }>>([]);
  const [combo, setCombo] = useState(0);
  const [lastCatch, setLastCatch] = useState<number | null>(null);
  
  const renderer = useRenderer();

  // Countdown phase
  useEffect(() => {
    if (gameState === "countdown" && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(c => c - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (gameState === "countdown" && countdown === 0) {
      setGameState("playing");
    }
  }, [gameState, countdown]);

  // Game timer
  useEffect(() => {
    if (gameState === "playing" && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (gameState === "playing" && timeLeft === 0) {
      if (score >= 100) {
        setGameState("won");
      } else {
        setGameState("lost");
      }
    }
  }, [gameState, timeLeft, score]);

  // Win/Lose transitions
  useEffect(() => {
    if (gameState === "won") {
      setTimeout(onWin, 2000);
    } else if (gameState === "lost") {
      setTimeout(onLose, 2000);
    }
  }, [gameState, onWin, onLose]);

  // Keyboard controls
  useKeyboard((key) => {
    if (gameState === "playing") {
      if (key.name === "left" && playerX > 5) {
        setPlayerX(x => x - 5);
      } else if (key.name === "right" && playerX < 92) {
        setPlayerX(x => x + 5);
      }
    }
    if (key.name === "q") {
      renderer.destroy();
    }
  });

  // Spawn hearts
  useEffect(() => {
    if (gameState !== "playing") return;
    
    const spawnInterval = setInterval(() => {
      const rand = Math.random();
      let type: keyof typeof HEART_TYPES;
      
      // Spawn logic based on time and rarity
      if (timeLeft > 40) {
        // Easy phase
        type = rand < 0.85 ? "pink" : rand < 0.95 ? "sparkle" : rand < 0.98 ? "gift" : "broken";
      } else if (timeLeft > 20) {
        // Medium phase
        type = rand < 0.7 ? "pink" : rand < 0.85 ? "sparkle" : rand < 0.92 ? "gift" : "broken";
      } else {
        // Hard phase
        type = rand < 0.5 ? "pink" : rand < 0.7 ? "sparkle" : rand < 0.85 ? "gift" : "broken";
      }
      
      setHearts(prev => [...prev, {
        id: Date.now(),
        x: Math.random() * 80 + 10,
        y: -2,
        type,
      }]);
    }, timeLeft > 40 ? 800 : timeLeft > 20 ? 600 : 400);
    
    return () => clearInterval(spawnInterval);
  }, [gameState, timeLeft]);

  // Move hearts and check collisions
  useEffect(() => {
    if (gameState !== "playing") return;
    
    const moveInterval = setInterval(() => {
      setHearts(prev => {
        const newHearts: typeof hearts = [];
        let newScore = score;
        let newCombo = combo;
        let caughtSomething = false;
        
        prev.forEach(heart => {
          const newY = heart.y + (timeLeft > 40 ? 0.4 : timeLeft > 20 ? 0.6 : 0.8);
          
          // Check collision with player basket
          if (newY >= 22 && newY <= 24 && Math.abs(heart.x - playerX) < 6) {
            const points = HEART_TYPES[heart.type].points;
            if (points > 0) {
              newCombo++;
              caughtSomething = true;
              const bonus = newCombo >= 3 ? Math.floor(newCombo / 3) * 5 : 0;
              newScore += points + bonus;
            } else {
              newCombo = 0;
              newScore += points;
            }
          } else if (newY < 26) {
            newHearts.push({ ...heart, y: newY });
          }
        });
        
         if (caughtSomething) {
          setCombo(newCombo);
          setLastCatch(Date.now());
        }
        if (newScore !== score) {
          const finalScore = Math.max(0, newScore);
          setScore(finalScore);
          // Check for immediate win when reaching 100
          if (finalScore >= 100) {
            setTimeout(() => setGameState("won"), 100);
          }
        }
        
        return newHearts;
      });
    }, 50);
    
    return () => clearInterval(moveInterval);
  }, [gameState, playerX, score, combo, timeLeft]);

  // Reset combo display
  useEffect(() => {
    if (lastCatch && Date.now() - lastCatch > 2000) {
      setCombo(0);
    }
  }, [lastCatch]);

  const loveMeterPercent = Math.min(100, (score / 100) * 100);
  const meterColor = loveMeterPercent < 30 ? COLORS.hotPink : 
                     loveMeterPercent < 70 ? COLORS.deepPink : COLORS.crimson;

  if (gameState === "countdown") {
    return (
      <box
        flexGrow={1}
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        backgroundColor={COLORS.rose}
      >
        <text fontSize="2xl" fg={COLORS.deepPink}>
          <strong>Get Ready!</strong>
        </text>
        <box marginTop={2}>
          <text fontSize="3xl" fg={COLORS.crimson}>
            <strong>{countdown}</strong>
          </text>
        </box>
        <box marginTop={2}>
          <text fg={COLORS.purple}>
            Catch hearts with ← → arrow keys!
          </text>
        </box>
        <box marginTop={1}>
          <text fg={COLORS.hotPink}>
            💕=5 💖=10 💝=25 💔=-10
          </text>
        </box>
      </box>
    );
  }

  if (gameState === "won") {
    return (
      <box
        flexGrow={1}
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        backgroundColor={COLORS.lavender}
      >
        <text fontSize="2xl" fg={COLORS.deepPink}>
          <strong>🎉 YOU WON! 🎉</strong>
        </text>
        <box marginTop={2}>
          <text fg={COLORS.crimson}>
            Love meter filled to 100%! 💕
          </text>
        </box>
        <box marginTop={2}>
          <text fg={COLORS.gold}>✨ 🎆 🌟 🎇 ✨</text>
        </box>
        <box marginTop={2}>
          <text fg={COLORS.purple}>
            Celebrating your victory...
          </text>
        </box>
      </box>
    );
  }

  if (gameState === "lost") {
    return (
      <box
        flexGrow={1}
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        backgroundColor="#2C1810"
      >
        <text fontSize="xl" fg="#CD853F">
          <strong>Time's up! ⏰</strong>
        </text>
        <box marginTop={2}>
          <text fg="#A0522D">
            You collected {score} love points
          </text>
        </box>
        <box marginTop={1}>
          <text fg="#8B7355">
            Need 100 to win... 🥺
          </text>
        </box>
        <box marginTop={2}>
          <text fg="#5C4033">
            Want to try again?
          </text>
        </box>
      </box>
    );
  }

  // Playing state
  return (
    <box
      flexGrow={1}
      flexDirection="column"
      backgroundColor={COLORS.rose}
      position="relative"
    >
      {/* Header with stats */}
      <box
        flexDirection="row"
        justifyContent="space-between"
        padding={1}
        backgroundColor={COLORS.white}
        borderBottom
        borderColor={COLORS.deepPink}
      >
        <box flexDirection="row" gap={2}>
          <text fg={COLORS.crimson}>
            <strong>Time: {timeLeft}s</strong>
          </text>
          <text fg={COLORS.hotPink}>
            Score: {score}
          </text>
        </box>
        {combo >= 3 && (
          <text fg={COLORS.gold}>
            <strong>🔥 Combo x{combo}!</strong>
          </text>
        )}
      </box>

      {/* Love Meter */}
      <box padding={1} flexDirection="column">
        <box flexDirection="row" justifyContent="space-between">
          <text fg={COLORS.purple}>Love Meter</text>
          <text fg={meterColor}><strong>{Math.round(loveMeterPercent)}%</strong></text>
        </box>
        <box
          width={80}
          height={1}
          backgroundColor="#ddd"
          marginTop={1}
        >
          <box
            width={`${loveMeterPercent}%`}
            height={1}
            backgroundColor={meterColor}
          />
        </box>
      </box>

      {/* Game area */}
      <box flexGrow={1} position="relative" marginTop={1}>
        {/* Falling hearts */}
        {hearts.map(heart => (
          <box
            key={heart.id}
            position="absolute"
            left={Math.round(heart.x)}
            top={Math.round(heart.y)}
          >
            <text fg={HEART_TYPES[heart.type].color}>
              {HEART_TYPES[heart.type].char}
            </text>
          </box>
        ))}

        {/* Player basket */}
        <box
          position="absolute"
          left={playerX - 3}
          top={22}
        >
          <text fg={COLORS.deepPink}>
            <strong>[💕💕]</strong>
          </text>
        </box>

        {/* Floor */}
        <box position="absolute" left={0} top={24} width={100}>
          <text fg={COLORS.hotPink}>
            {"═".repeat(80)}
          </text>
        </box>

        {/* Instructions */}
        <box position="absolute" left={0} top={25} width={100}>
          <text fg={COLORS.purple} attributes={TextAttributes.DIM}>
            Use ← → arrow keys to move basket | Press q to quit
          </text>
        </box>
      </box>
    </box>
  );
}

// Ultimate celebration screen
function CelebrationScreen({ score }: { score: number }) {
  const renderer = useRenderer();
  const [fireworks, setFireworks] = useState<Array<{id: number; x: number; y: number; frame: number}>>([]);

  useEffect(() => {
    // Create fireworks
    const fw = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: 10 + i * 10,
      y: 5 + Math.random() * 10,
      frame: Math.floor(Math.random() * 3),
    }));
    setFireworks(fw);

    // Animate fireworks
    const interval = setInterval(() => {
      setFireworks(prev => prev.map(f => ({
        ...f,
        frame: (f.frame + 1) % 4,
      })));
    }, 300);

    return () => clearInterval(interval);
  }, []);

  useKeyboard((key) => {
    if (key.name === "q") {
      renderer.destroy();
    }
  });

  const fireworkFrames = ["✦", "✧", "✦", "✨"];

  return (
    <box
      flexGrow={1}
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      backgroundColor={COLORS.lavender}
      position="relative"
    >
      {/* Fireworks */}
      {fireworks.map(fw => (
        <box
          key={fw.id}
          position="absolute"
          left={fw.x}
          top={fw.y}
        >
          <text fg={COLORS.gold}>
            {fireworkFrames[fw.frame]}
          </text>
        </box>
      ))}

      <box marginBottom={2}>
        <text fontSize="2xl" fg={COLORS.deepPink}>
          <strong>🎉 YAYYY! I'M SO HAPPY! 🎉</strong>
        </text>
      </box>

      <box
        border
        borderColor={COLORS.gold}
        borderStyle="double"
        padding={3}
        backgroundColor={COLORS.white}
        flexDirection="column"
        alignItems="center"
        gap={1}
      >
        <text fg={COLORS.crimson}>
          <strong>You filled the Love Meter to 100%! 💕</strong>
        </text>
        <box marginTop={1}>
          <text fg={COLORS.hotPink}>
            Final Score: {score} love points
          </text>
        </box>
        <box marginTop={1}>
          <text fg={COLORS.purple}>
            You're absolutely amazing! Best Valentine ever! 🌟
          </text>
        </box>
        <box marginTop={1}>
          <text fg={COLORS.deepPink}>
            ❤️ 💕 💖 💝 💗 💓 ❤️
          </text>
        </box>
      </box>

      <box marginTop={3}>
        <text fg={COLORS.gold}>
          ✨ 💕 💖 💝 💗 💓 ✨
        </text>
      </box>

      <box marginTop={3}>
        <text fg={COLORS.purple} attributes={TextAttributes.DIM}>
          Press <strong>q</strong> to exit with love 💕
        </text>
      </box>

      {/* Corner decorations */}
      <box position="absolute" left={2} top={2}>
        <text fg={COLORS.gold}>✨</text>
      </box>
      <box position="absolute" right={2} top={2}>
        <text fg={COLORS.gold}>✨</text>
      </box>
      <box position="absolute" left={2} bottom={2}>
        <text fg={COLORS.hotPink}>💕</text>
      </box>
      <box position="absolute" right={2} bottom={2}>
        <text fg={COLORS.hotPink}>💕</text>
      </box>
    </box>
  );
}

// Game Over / Retry screen
function GameOverScreen({ score, onRetry }: { score: number; onRetry: () => void }) {
  const [showRetry, setShowRetry] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowRetry(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  useKeyboard((key) => {
    if (showRetry && key.name === "enter") {
      onRetry();
    }
  });

  return (
    <box
      flexGrow={1}
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      backgroundColor="#2C1810"
    >
      <text fontSize="xl" fg="#CD853F">
        <strong>Time's Up! ⏰</strong>
      </text>

      <box marginTop={2}>
        <text fg="#A0522D">
          You collected {score} love points
        </text>
      </box>

      <box marginTop={1}>
        <text fg="#8B7355">
          Need 100 points to win... 🥺
        </text>
      </box>

      <box marginTop={2}>
        <text fg="#A0522D">
          💔 💔 💔
        </text>
      </box>

      {showRetry && (
        <box marginTop={3}>
          <text fg="#CD853F">
            <strong>Press Enter to try again</strong>
          </text>
        </box>
      )}

      <box marginTop={2}>
        <text fg="#5C4033" attributes={TextAttributes.DIM}>
          Or press q to quit
        </text>
      </box>
    </box>
  );
}

// Main App
function App() {
  const [screen, setScreen] = useState<Screen>("proposal");
  const [finalScore, setFinalScore] = useState(0);
  const renderer = useRenderer();

  useKeyboard((key) => {
    if (key.name === "q" && screen === "proposal") {
      renderer.destroy();
    }
  });

  const handleSelect = (choice: "yes" | "no") => {
    if (choice === "yes") {
      setScreen("game");
    } else {
      setScreen("no");
    }
  };

  const handleReturnFromNo = () => {
    setScreen("proposal");
  };

  const handleGameWin = (score: number) => {
    setFinalScore(score);
    setScreen("gameover");
  };

  const handleGameLose = (score: number) => {
    setFinalScore(score);
    setScreen("gameover");
  };

  const handleRetry = () => {
    setScreen("game");
  };

  return (
    <box flexGrow={1}>
      {screen === "proposal" && <ProposalScreen onSelect={handleSelect} />}
      {screen === "no" && <NoScreen onReturn={handleReturnFromNo} />}
      {screen === "game" && (
        <HeartCollectorGame 
          onWin={() => handleGameWin(100)} 
          onLose={() => handleGameLose(finalScore)} 
        />
      )}
      {screen === "gameover" && finalScore >= 100 && <CelebrationScreen score={finalScore} />}
      {screen === "gameover" && finalScore < 100 && (
        <GameOverScreen score={finalScore} onRetry={handleRetry} />
      )}
    </box>
  );
}

const renderer = await createCliRenderer();
createRoot(renderer).render(<App />);