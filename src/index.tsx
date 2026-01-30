import { createCliRenderer, TextAttributes } from "@opentui/core";
import { createRoot, useKeyboard, useRenderer, useTimeline } from "@opentui/react";
import { useState, useEffect, useRef } from "react";

// Valentine's color palette
type Screen = "proposal" | "yes" | "no" | "game" | "gameover";
type GameState = "countdown" | "playing" | "won" | "lost";
type PowerUpType = "rose" | "letter" | "magnet";

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

// Power-up types for the game
const POWER_UPS = {
  rose: { char: "🌹", color: COLORS.crimson, duration: 5000, description: "Slow Motion!" },
  letter: { char: "💌", color: COLORS.gold, duration: 8000, description: "2x Points!" },
  magnet: { char: "🧲", color: COLORS.purple, duration: 6000, description: "Heart Magnet!" },
};

// Love poems for the celebration
const LOVE_POEMS = [
  {
    title: "My Valentine",
    lines: [
      "Roses are red, violets are blue,",
      "Sugar is sweet, and so are you!",
      "You caught my heart with every beat,",
      "Together we make love complete! 💕",
    ],
  },
  {
    title: "Forever Yours",
    lines: [
      "In a world of hearts that fall like rain,",
      "You caught them all, again and again.",
      "My love for you will never end,",
      "You're more than love, you're my best friend! 💖",
    ],
  },
  {
    title: "Our Love Story",
    lines: [
      "Like stars that shine up in the sky,",
      "Our love will never say goodbye.",
      "With every heart you caught today,",
      "You stole mine in the sweetest way! 💝",
    ],
  },
];

// Calculate days until Valentine's Day
function getDaysUntilValentine(): number {
  const today = new Date();
  const valentine = new Date(today.getFullYear(), 1, 14); // Feb 14
  if (today > valentine) {
    valentine.setFullYear(valentine.getFullYear() + 1);
  }
  const diffTime = valentine.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

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
          borderStyle="roundedt"
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

// Welcome Screen for name input
function WelcomeScreen({ onSubmit }: { onSubmit: (name: string) => void }) {
  const [name, setName] = useState("");
  const [cursorVisible, setCursorVisible] = useState(true);
  const daysUntilValentine = getDaysUntilValentine();

  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible(v => !v);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useKeyboard((key) => {
    if ((key.name === "enter" || key.name === "return") && name.trim().length > 0) {
      onSubmit(name.trim());
    } else if (key.name === "backspace" || key.name === "delete") {
      setName(n => n.slice(0, -1));
    } else if (key.sequence && key.sequence.length === 1 && /[a-zA-Z\s]/.test(key.sequence)) {
      if (name.length < 20) {
        setName(n => n + key.sequence);
      }
    }
  });

  return (
    <box
      flexGrow={1}
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      backgroundColor={COLORS.rose}
      position="relative"
    >
      <FallingHearts />

      {/* Valentine countdown */}
      {daysUntilValentine > 0 && daysUntilValentine <= 30 && (
        <box position="absolute" top={2}>
          <text fg={COLORS.crimson}>
            <strong>💕 {daysUntilValentine} days until Valentine's Day! 💕</strong>
          </text>
        </box>
      )}

      <box
        border
        borderColor={COLORS.deepPink}
        borderStyle="double"
        padding={1}
        backgroundColor={COLORS.white}
      >
        <box
          border
          borderColor={COLORS.hotPink}
          borderStyle="rounded"
          padding={3}
          backgroundColor={COLORS.white}
          flexDirection="column"
          alignItems="center"
          gap={1}
        >
          <text fontSize="xl" fg={COLORS.crimson}>
            <strong>✨ Be My Valentine? ✨</strong>
          </text>
          
          <box marginTop={2}>
            <text fg={COLORS.purple}>
              What's your special someone's name?
            </text>
          </box>

          <box
            marginTop={1}
            border
            borderColor={COLORS.hotPink}
            borderStyle="rounded"
            padding={1}
            width={30}
            backgroundColor={COLORS.lightRose}
          >
            <text fg={COLORS.darkPurple}>
              {name}{cursorVisible ? "█" : " "}
            </text>
          </box>

          <box marginTop={2}>
            <text fg={COLORS.hotPink}>
              💖 💗 💓 💝 💕
            </text>
          </box>
        </box>
      </box>

      <box marginTop={3}>
        <text fg={COLORS.purple} attributes={TextAttributes.DIM}>
          Type a name and press Enter to continue
        </text>
      </box>
    </box>
  );
}

// Proposal Screen with heartbeat, color pulsing, and SHRINKING NO BUTTON!
function ProposalScreen({ onSelect }: { onSelect: (choice: "yes" | "no") => void }) {
  const [noAttempts, setNoAttempts] = useState(0);
  const [noButtonOffset, setNoButtonOffset] = useState({ x: 0, y: 0 });
  const [noButtonSize, setNoButtonSize] = useState(100); // percentage
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

  // Messages that get more desperate as you try to say no
  const noMessages = [
    "No... 🥺",
    "Are you sure? 😢",
    "Please reconsider! 💔",
    "I'll be sad... 😭",
    "Pretty please? 🥹",
    "One more chance? 💕",
    "...",
  ];

  const handleNoHover = () => {
    // Make the No button smaller and move it
    setNoAttempts(prev => prev + 1);
    setNoButtonSize(prev => Math.max(20, prev - 15));
    setNoButtonOffset({
      x: (Math.random() - 0.5) * 40,
      y: (Math.random() - 0.5) * 10,
    });
  };

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
            borderStyle="rounded"
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

            {/* Yes and No Selection */}
            <box marginTop={2} width={45}>
              <select
                options={[
                  { name: `${'💕'.repeat(1 + Math.min(noAttempts, 3))} YES! ${'💕'.repeat(1 + Math.min(noAttempts, 3))}`, description: "Of course I will!", value: "yes" },
                  ...(noButtonSize > 20 ? [{ name: noMessages[Math.min(noAttempts, noMessages.length - 1)], description: "Think again...", value: "no" }] : []),
                ]}
                onSelect={(index, option) => {
                  if (option.value === "yes") {
                    onSelect("yes");
                  } else if (option.value === "no") {
                    if (noAttempts >= 5) {
                      onSelect("no");
                    } else {
                      handleNoHover();
                    }
                  }
                }}
                onHighlight={(index, option) => {
                  if (option.value === "no" && noAttempts < 5) {
                    handleNoHover();
                  }
                }}
                height={noButtonSize > 20 ? 6 : 3}
                width={45}
                focused
                backgroundColor={COLORS.rose}
                selectedBackgroundColor={COLORS.deepPink}
                selectedTextColor={COLORS.white}
                highlightBackgroundColor={COLORS.hotPink}
                textColor={COLORS.darkPurple}
                showScrollIndicator={false}
              />
            </box>

            {/* Message when No button is gone */}
            {noButtonSize <= 20 && (
              <box marginTop={1}>
                <text fg={COLORS.purple} attributes={TextAttributes.DIM}>
                  (The No button ran away! 😏)
                </text>
              </box>
            )}
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
        borderStyle="rounded"
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

// Heart Collector Game with Power-ups!
function HeartCollectorGame({ onWin, onLose }: { onWin: (score: number) => void; onLose: (score: number) => void }) {
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
  const [powerUps, setPowerUps] = useState<Array<{
    id: number;
    x: number;
    y: number;
    type: PowerUpType;
  }>>([]);
  const [activePowerUp, setActivePowerUp] = useState<{ type: PowerUpType; endTime: number } | null>(null);
  const [powerUpMessage, setPowerUpMessage] = useState<string | null>(null);
  const [combo, setCombo] = useState(0);
  const [lastCatch, setLastCatch] = useState<number | null>(null);
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    char: string;
    color: string;
    life: number;
  }>>([]);
  
  const renderer = useRenderer();
  const scoreRef = useRef(score);
  scoreRef.current = score;

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
      setTimeout(() => onWin(scoreRef.current), 2000);
    } else if (gameState === "lost") {
      setTimeout(() => onLose(scoreRef.current), 2000);
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

  // Spawn power-ups occasionally
  useEffect(() => {
    if (gameState !== "playing") return;
    
    const powerUpInterval = setInterval(() => {
      if (Math.random() < 0.15) { // 15% chance every 3 seconds
        const types: PowerUpType[] = ["rose", "letter", "magnet"];
        const type = types[Math.floor(Math.random() * types.length)];
        
        setPowerUps(prev => [...prev, {
          id: Date.now(),
          x: Math.random() * 70 + 15,
          y: -2,
          type,
        }]);
      }
    }, 3000);
    
    return () => clearInterval(powerUpInterval);
  }, [gameState]);

  // Check active power-up expiration
  useEffect(() => {
    if (!activePowerUp) return;
    
    const checkInterval = setInterval(() => {
      if (Date.now() > activePowerUp.endTime) {
        setActivePowerUp(null);
        setPowerUpMessage(null);
      }
    }, 100);
    
    return () => clearInterval(checkInterval);
  }, [activePowerUp]);

  // Move power-ups
  useEffect(() => {
    if (gameState !== "playing") return;
    
    const moveInterval = setInterval(() => {
      setPowerUps(prev => {
        const newPowerUps: typeof powerUps = [];
        
        prev.forEach(powerUp => {
          const speed = activePowerUp?.type === "rose" ? 0.2 : 0.5;
          const newY = powerUp.y + speed;
          
          // Check collision with player
          if (newY >= 22 && newY <= 24 && Math.abs(powerUp.x - playerX) < 8) {
            // Activate power-up!
            const powerUpInfo = POWER_UPS[powerUp.type];
            setActivePowerUp({
              type: powerUp.type,
              endTime: Date.now() + powerUpInfo.duration,
            });
            setPowerUpMessage(powerUpInfo.description);
            
            // Add celebration particles
            const newParticles = Array.from({ length: 5 }, (_, i) => ({
              id: Date.now() + i,
              x: powerUp.x + (Math.random() - 0.5) * 10,
              y: powerUp.y - 2,
              char: "✨",
              color: powerUpInfo.color,
              life: 10,
            }));
            setParticles(prev => [...prev, ...newParticles]);
          } else if (newY < 26) {
            newPowerUps.push({ ...powerUp, y: newY });
          }
        });
        
        return newPowerUps;
      });
    }, 50);
    
    return () => clearInterval(moveInterval);
  }, [gameState, playerX, activePowerUp]);

  // Animate particles
  useEffect(() => {
    if (particles.length === 0) return;
    
    const particleInterval = setInterval(() => {
      setParticles(prev => prev
        .map(p => ({ ...p, y: p.y - 0.3, life: p.life - 1 }))
        .filter(p => p.life > 0)
      );
    }, 100);
    
    return () => clearInterval(particleInterval);
  }, [particles.length]);

  // Move hearts and check collisions with power-up effects
  useEffect(() => {
    if (gameState !== "playing") return;
    
    const moveInterval = setInterval(() => {
      setHearts(prev => {
        const newHearts: typeof hearts = [];
        let newScore = score;
        let newCombo = combo;
        let caughtSomething = false;
        
        prev.forEach(heart => {
          // Slow motion if rose power-up active
          const baseSpeed = timeLeft > 40 ? 0.4 : timeLeft > 20 ? 0.6 : 0.8;
          const speed = activePowerUp?.type === "rose" ? baseSpeed * 0.4 : baseSpeed;
          let newY = heart.y + speed;
          let newX = heart.x;
          
          // Magnet effect - attract hearts towards player
          if (activePowerUp?.type === "magnet" && HEART_TYPES[heart.type].points > 0) {
            const dx = playerX - heart.x;
            newX += dx * 0.08;
          }
          
          // Extended catch radius with magnet
          const catchRadius = activePowerUp?.type === "magnet" ? 10 : 6;
          
          // Check collision with player basket
          if (newY >= 22 && newY <= 24 && Math.abs(newX - playerX) < catchRadius) {
            let points = HEART_TYPES[heart.type].points;
            
            // Double points with letter power-up
            if (activePowerUp?.type === "letter" && points > 0) {
              points *= 2;
            }
            
            if (points > 0) {
              newCombo++;
              caughtSomething = true;
              const bonus = newCombo >= 3 ? Math.floor(newCombo / 3) * 5 : 0;
              newScore += points + bonus;
              
              // Add catch particles
              const newParticles = Array.from({ length: 3 }, (_, i) => ({
                id: Date.now() + i + Math.random() * 1000,
                x: newX + (Math.random() - 0.5) * 6,
                y: 21,
                char: points >= 20 ? "⭐" : "✨",
                color: HEART_TYPES[heart.type].color,
                life: 8,
              }));
              setParticles(prev => [...prev, ...newParticles]);
            } else {
              newCombo = 0;
              newScore += points;
            }
          } else if (newY < 26) {
            newHearts.push({ ...heart, y: newY, x: newX });
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
  }, [gameState, playerX, score, combo, timeLeft, activePowerUp]);

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
        <box marginTop={2}>
          <text fg={COLORS.gold}>
            <strong>✨ Power-ups:</strong>
          </text>
        </box>
        <box marginTop={1}>
          <text fg={COLORS.purple}>
            🌹 Slow-Mo  |  💌 2x Points  |  🧲 Magnet
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
            Love meter filled to 100%! 💕 You proved your love!
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
        {activePowerUp && (
          <text fg={POWER_UPS[activePowerUp.type].color}>
            <strong>{POWER_UPS[activePowerUp.type].char} {powerUpMessage}</strong>
          </text>
        )}
      </box>

      {/* Love Meter */}
      <box padding={1} flexDirection="column">
        <box flexDirection="row" justifyContent="space-between">
          <text fg={COLORS.purple}>Heart-O-Meter</text>
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

        {/* Falling power-ups */}
        {powerUps.map(powerUp => (
          <box
            key={powerUp.id}
            position="absolute"
            left={Math.round(powerUp.x)}
            top={Math.round(powerUp.y)}
          >
            <text fg={POWER_UPS[powerUp.type].color}>
              {POWER_UPS[powerUp.type].char}
            </text>
          </box>
        ))}

        {/* Particles */}
        {particles.map(particle => (
          <box
            key={particle.id}
            position="absolute"
            left={Math.round(particle.x)}
            top={Math.round(particle.y)}
          >
            <text fg={particle.color} attributes={particle.life < 5 ? TextAttributes.DIM : 0}>
              {particle.char}
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

// Ultimate celebration screen with Love Poem!
function CelebrationScreen({ score }: { score: number }) {
  const renderer = useRenderer();
  const [fireworks, setFireworks] = useState<Array<{id: number; x: number; y: number; frame: number}>>([]);
  const [showPoem, setShowPoem] = useState(false);
  const [poemLine, setPoemLine] = useState(0);
  const [currentPoemIndex, setCurrentPoemIndex] = useState(0);
  const [waitingForNextPoem, setWaitingForNextPoem] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const poem = LOVE_POEMS[currentPoemIndex];

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

    // Show poem after 2 seconds
    const poemTimer = setTimeout(() => setShowPoem(true), 2000);

    return () => {
      clearInterval(interval);
      clearTimeout(poemTimer);
    };
  }, []);

  // Animate poem lines - 2.5 seconds per line
  useEffect(() => {
    if (!showPoem || waitingForNextPoem) return;
    
    if (poemLine < poem.lines.length) {
      const lineTimer = setTimeout(() => {
        setPoemLine(l => l + 1);
      }, 2500); // 2.5 seconds per line
      
      return () => clearTimeout(lineTimer);
    } else {
      // All lines shown, wait for 1 minute then show next poem
      setWaitingForNextPoem(true);
      setCountdown(60);
    }
  }, [showPoem, poemLine, poem.lines.length, waitingForNextPoem]);

  // Countdown timer for next poem
  useEffect(() => {
    if (!waitingForNextPoem || countdown <= 0) return;
    
    const countdownTimer = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          // Move to next poem
          setWaitingForNextPoem(false);
          setPoemLine(0);
          setCurrentPoemIndex(prev => (prev + 1) % LOVE_POEMS.length);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    
    return () => clearInterval(countdownTimer);
  }, [waitingForNextPoem, countdown]);

  useKeyboard((key) => {
    if (key.name === "q") {
      renderer.destroy();
    }
    // Skip to next poem with 'n' key
    if ((key.name === "n" || key.name === "N") && waitingForNextPoem) {
      setWaitingForNextPoem(false);
      setPoemLine(0);
      setCurrentPoemIndex(prev => (prev + 1) % LOVE_POEMS.length);
      setCountdown(0);
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
          <strong>Your love is unstoppable! 100%! 💕</strong>
        </text>
        <box marginTop={1}>
          <text fg={COLORS.hotPink}>
            Final Score: {score} love points
          </text>
        </box>
        
        {/* Love Poem */}
        {showPoem && (
          <box marginTop={2} flexDirection="column" alignItems="center">
            <text fg={COLORS.gold}>
              <strong>✨ {poem.title} ✨</strong>
            </text>
            <box marginTop={1} flexDirection="column" alignItems="center">
              {poem.lines.slice(0, poemLine + 1).map((line, i) => (
                <box key={i}>
                  <text fg={i === poemLine && !waitingForNextPoem ? COLORS.deepPink : COLORS.purple}>
                    {line}
                  </text>
                </box>
              ))}
            </box>
            
            {/* Waiting for next poem message */}
            {waitingForNextPoem && (
              <box marginTop={2} flexDirection="column" alignItems="center">
                <text fg={COLORS.gold}>
                  ✨ 💕 Beautiful, right? 💕 ✨
                </text>
                <box marginTop={1}>
                  <text fg={COLORS.hotPink}>
                    Next poem in {countdown} seconds...
                  </text>
                </box>
                <box marginTop={1}>
                  <text fg={COLORS.purple} attributes={TextAttributes.DIM}>
                    (Press 'n' to skip)
                  </text>
                </box>
              </box>
            )}
          </box>
        )}

        {!showPoem && (
          <box marginTop={1}>
            <text fg={COLORS.purple}>
              You're absolutely amazing! Best Valentine ever! 🌟
            </text>
          </box>
        )}
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
  const renderer = useRenderer();

  useEffect(() => {
    const timer = setTimeout(() => setShowRetry(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  useKeyboard((key) => {
    if (showRetry && (key.name === "enter" || key.name === "return")) {
      onRetry();
    }
    if (key.name === "q") {
      renderer.destroy();
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

      <box marginTop={2}>
        <text fg="#8B7355">
          Don't give up! Love conquers all! 💕
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
    setFinalScore(0);
    setScreen("game");
  };

  return (
    <box flexGrow={1}>
      {screen === "proposal" && <ProposalScreen onSelect={handleSelect} />}
      {screen === "no" && <NoScreen onReturn={handleReturnFromNo} />}
      {screen === "game" && (
        <HeartCollectorGame 
          onWin={handleGameWin} 
          onLose={handleGameLose}
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