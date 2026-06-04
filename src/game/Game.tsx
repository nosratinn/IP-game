import { Canvas } from "@react-three/fiber";
import { KeyboardControls, Sky } from "@react-three/drei";
import { Suspense } from "react";
import { Player, Controls } from "./Player";
import { Hospital } from "./Hospital";
import { Hotspots } from "./Hotspots";
import { HUD } from "./HUD";
import { MenuScreen, SummaryScreen } from "./Menu";
import { useGame } from "./store";
import { useEffect } from "react";
import { startAmbience, stopAmbience } from "./audio";

const keyMap = [
  { name: Controls.forward, keys: ["ArrowUp", "KeyW"] },
  { name: Controls.back, keys: ["ArrowDown", "KeyS"] },
  { name: Controls.left, keys: ["ArrowLeft", "KeyA"] },
  { name: Controls.right, keys: ["ArrowRight", "KeyD"] },
  { name: Controls.interact, keys: ["KeyE"] },
];

export function Game() {
  const phase = useGame((s) => s.phase);
  const currentLevelId = useGame((s) => s.currentLevelId);
  useEffect(() => {
    if (phase === "playing") {
      startAmbience();
    } else {
      stopAmbience();
    }
    return () => {
      if (phase === "playing") stopAmbience();
    };
  }, [phase]);
  return (
    <div style={{ position: "fixed", inset: 0, background: "#0b1220" }}>
      <KeyboardControls map={keyMap}>
        <Canvas
          shadows
          camera={{ fov: 70, near: 0.1, far: 100, position: [0, 1.6, -5] }}
          gl={{ antialias: true }}
        >
          <Suspense fallback={null}>
            <color attach="background" args={["#aac6e8"]} />
            <Sky sunPosition={[10, 20, 5]} turbidity={6} rayleigh={1} />
            <ambientLight intensity={0.7} />
            <directionalLight
              position={[10, 15, 5]}
              intensity={1.0}
              castShadow
              shadow-mapSize={[1024, 1024]}
            />
            {currentLevelId && (
              <>
                <Hospital levelId={currentLevelId} />
                <Hotspots />
                {phase === "playing" && <Player levelId={currentLevelId} />}
              </>
            )}
          </Suspense>
        </Canvas>
      </KeyboardControls>
      <HUD />
      {phase === "menu" && <MenuScreen />}
      {phase === "summary" && <SummaryScreen />}
    </div>
  );
}
