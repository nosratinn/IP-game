import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Billboard, Text } from "@react-three/drei";
import * as THREE from "three";
import { type Hotspot } from "./data";
import { useGame } from "./store";
import { playEnterRange } from "./audio";

const INTERACT_RADIUS = 2.2;

function Person({
  color,
  accent,
  badge,
}: {
  color: string;
  accent: string;
  badge?: "yellow_gown" | "loose_mask" | null;
}) {
  return (
    <group>
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[0.5, 1.1, 0.3]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 1.35, 0]} castShadow>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color="#f4d4b0" />
      </mesh>
      <mesh position={[-0.13, 0.0, 0]} castShadow>
        <boxGeometry args={[0.18, 0.9, 0.25]} />
        <meshStandardMaterial color={accent} />
      </mesh>
      <mesh position={[0.13, 0.0, 0]} castShadow>
        <boxGeometry args={[0.18, 0.9, 0.25]} />
        <meshStandardMaterial color={accent} />
      </mesh>
      {badge === "yellow_gown" && (
        <mesh position={[0, 0.55, 0.18]} castShadow>
          <boxGeometry args={[0.6, 1.2, 0.05]} />
          <meshStandardMaterial color="#facc15" />
        </mesh>
      )}
      {badge === "loose_mask" && (
        <>
          <mesh position={[0, 1.0, 0.2]}>
            <boxGeometry args={[0.3, 0.18, 0.04]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          <mesh position={[-0.3, 0.4, 0]} castShadow>
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshStandardMaterial color="#1d4ed8" />
          </mesh>
          <mesh position={[0.3, 0.4, 0]} castShadow>
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshStandardMaterial color="#1d4ed8" />
          </mesh>
        </>
      )}
    </group>
  );
}

function Sink({ isViolation }: { isViolation: boolean }) {
  return (
    <group>
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.8, 1, 0.5]} />
        <meshStandardMaterial color="#e5e7eb" />
      </mesh>
      <mesh position={[0, 1.05, 0]} castShadow>
        <boxGeometry args={[0.7, 0.1, 0.4]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>
      <mesh position={[0, 1.4, -0.15]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.5]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.6} />
      </mesh>
      <mesh position={[0.45, 1.3, 0]} castShadow>
        <boxGeometry args={[0.18, 0.4, 0.15]} />
        <meshStandardMaterial color={isViolation ? "#7f1d1d" : "#0ea5e9"} />
      </mesh>
      {isViolation && (
        <mesh position={[0.45, 1.55, 0.08]}>
          <planeGeometry args={[0.16, 0.08]} />
          <meshBasicMaterial color="#fbbf24" />
        </mesh>
      )}
    </group>
  );
}

function Cart({ isViolation }: { isViolation: boolean }) {
  return (
    <group>
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[0.8, 0.8, 0.5]} />
        <meshStandardMaterial color={isViolation ? "#6b7280" : "#cbd5e1"} />
      </mesh>
      <mesh position={[0, 0.85, 0]} castShadow>
        <boxGeometry args={[0.85, 0.1, 0.55]} />
        <meshStandardMaterial color={isViolation ? "#3f3f46" : "#1f2937"} />
      </mesh>
      <mesh position={[0, 1.0, 0.1]} castShadow>
        <boxGeometry args={[0.3, 0.2, 0.1]} />
        <meshStandardMaterial color={isViolation ? "#78350f" : "#1d4ed8"} />
      </mesh>
      {isViolation && (
        <>
          <mesh position={[-0.15, 0.92, 0.28]}>
            <circleGeometry args={[0.06, 16]} />
            <meshBasicMaterial color="#7f1d1d" />
          </mesh>
          <mesh position={[0.18, 0.92, 0.28]}>
            <circleGeometry args={[0.04, 16]} />
            <meshBasicMaterial color="#78350f" />
          </mesh>
        </>
      )}
    </group>
  );
}

function PpeBin({ isViolation }: { isViolation: boolean }) {
  return (
    <group>
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.8, 1, 0.6]} />
        <meshStandardMaterial color="#fbbf24" />
      </mesh>
      <mesh position={[0, 1.02, 0]} castShadow>
        <boxGeometry args={[0.85, 0.04, 0.65]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      {isViolation && (
        <>
          <mesh position={[0.2, 1.08, 0.2]} rotation={[0.3, 0.5, 0.2]}>
            <boxGeometry args={[0.18, 0.02, 0.12]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          <mesh position={[-0.18, 1.06, 0.15]} rotation={[-0.2, -0.3, 0.4]}>
            <boxGeometry args={[0.18, 0.02, 0.12]} />
            <meshStandardMaterial color="#bfdbfe" />
          </mesh>
          <mesh position={[0.0, 1.06, -0.2]} rotation={[0.1, 0.2, -0.3]}>
            <boxGeometry args={[0.18, 0.02, 0.12]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
        </>
      )}
    </group>
  );
}

function Bedrail({ isViolation }: { isViolation: boolean }) {
  return (
    <group>
      <mesh position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[1.2, 0.05, 0.05]} />
        <meshStandardMaterial
          color={isViolation ? "#78716c" : "#cbd5e1"}
          metalness={isViolation ? 0.1 : 0.5}
          roughness={isViolation ? 0.9 : 0.3}
        />
      </mesh>
      <mesh position={[-0.55, 0.4, 0]} castShadow>
        <boxGeometry args={[0.05, 0.5, 0.05]} />
        <meshStandardMaterial color={isViolation ? "#78716c" : "#cbd5e1"} />
      </mesh>
      <mesh position={[0.55, 0.4, 0]} castShadow>
        <boxGeometry args={[0.05, 0.5, 0.05]} />
        <meshStandardMaterial color={isViolation ? "#78716c" : "#cbd5e1"} />
      </mesh>
      {isViolation && (
        <>
          <mesh position={[-0.2, 0.6, 0.03]}>
            <planeGeometry args={[0.2, 0.04]} />
            <meshBasicMaterial color="#57534e" transparent opacity={0.7} />
          </mesh>
          <mesh position={[0.3, 0.6, 0.03]}>
            <planeGeometry args={[0.15, 0.04]} />
            <meshBasicMaterial color="#57534e" transparent opacity={0.6} />
          </mesh>
        </>
      )}
    </group>
  );
}

function CallButton() {
  return (
    <group>
      <mesh position={[0, 1.2, 0]} castShadow>
        <boxGeometry args={[0.4, 0.5, 0.08]} />
        <meshStandardMaterial color="#e5e7eb" />
      </mesh>
      <mesh position={[0, 1.25, 0.05]}>
        <cylinderGeometry args={[0.06, 0.06, 0.04]} />
        <meshStandardMaterial color="#dc2626" emissive="#7f1d1d" emissiveIntensity={0.6} />
      </mesh>
    </group>
  );
}

function Tray({ isViolation }: { isViolation: boolean }) {
  return (
    <group>
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.7, 1, 0.5]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>
      <mesh position={[0, 1.04, 0]} castShadow>
        <boxGeometry args={[0.6, 0.06, 0.4]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
      <mesh position={[0.18, 1.16, 0]} castShadow>
        <boxGeometry args={[0.1, 0.2, 0.06]} />
        <meshStandardMaterial color={isViolation ? "#3b82f6" : "#16a34a"} />
      </mesh>
      <mesh position={[0.18, 1.3, 0]} castShadow>
        <boxGeometry args={[0.05, 0.08, 0.05]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      {isViolation && (
        <mesh position={[-0.15, 1.09, 0]} rotation={[0, 0.3, 0]}>
          <boxGeometry args={[0.18, 0.03, 0.06]} />
          <meshStandardMaterial color="#7f1d1d" metalness={0.3} />
        </mesh>
      )}
    </group>
  );
}

function Patient() {
  return (
    <group>
      <mesh position={[0, 0.95, 0]} castShadow>
        <boxGeometry args={[0.9, 0.2, 1.8]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>
      <mesh position={[0, 1.1, -0.7]} castShadow>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial color="#f4d4b0" />
      </mesh>
    </group>
  );
}

function HotspotMesh({ h }: { h: Hotspot }) {
  const v = h.category !== "none";
  switch (h.kind) {
    case "nurse":
      return (
        <Person
          color="#0ea5e9"
          accent="#0369a1"
          badge={v && h.category === "ppe" ? "yellow_gown" : null}
        />
      );
    case "doctor":
      return (
        <Person
          color="#f8fafc"
          accent="#1e293b"
          badge={v && h.category === "ppe" ? "loose_mask" : null}
        />
      );
    case "patient":
      return <Patient />;
    case "sink":
      return <Sink isViolation={v} />;
    case "ppe_bin":
      return <PpeBin isViolation={v} />;
    case "cart":
      return <Cart isViolation={v} />;
    case "bedrail":
      return <Bedrail isViolation={v} />;
    case "callbutton":
      return <CallButton />;
    case "tray":
      return <Tray isViolation={v} />;
  }
}

function HotspotItem({ h }: { h: Hotspot }) {
  const ringRef = useRef<THREE.Mesh>(null);
  const wasInRange = useRef(false);
  const { camera } = useThree();
  const answered = useGame((s) => s.answered[h.id]);

  useFrame((state) => {
    if (!ringRef.current) return;
    const dx = camera.position.x - h.position[0];
    const dz = camera.position.z - h.position[2];
    const d = Math.hypot(dx, dz);
    const inRange = d < INTERACT_RADIUS && !answered;
    ringRef.current.visible = inRange;
    if (inRange) {
      const t = state.clock.elapsedTime;
      ringRef.current.scale.setScalar(1 + Math.sin(t * 4) * 0.08);
      if (!wasInRange.current && useGame.getState().phase === "playing") {
        playEnterRange();
      }
    }
    wasInRange.current = inRange;
  });

  const color = answered ? (answered.correct ? "#34d399" : "#f87171") : "#fbbf24";

  return (
    <group position={h.position}>
      <HotspotMesh h={h} />
      <Billboard position={[0, 2.0, 0]}>
        <mesh>
          <circleGeometry args={[0.18, 24]} />
          <meshBasicMaterial color={color} />
        </mesh>
        {answered ? (
          <Text
            position={[0, 0, 0.01]}
            fontSize={0.22}
            color="#0b1220"
            anchorX="center"
            anchorY="middle"
          >
            {answered.correct ? "✓" : "✗"}
          </Text>
        ) : (
          <Text
            position={[0, 0, 0.01]}
            fontSize={0.22}
            color="#0b1220"
            anchorX="center"
            anchorY="middle"
          >
            ?
          </Text>
        )}
      </Billboard>
      <mesh
        ref={ringRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, 0]}
        visible={false}
      >
        <ringGeometry args={[0.7, 0.85, 32]} />
        <meshBasicMaterial color="#36c4ff" transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

export function Hotspots() {
  const hotspots = useGame((s) => s.currentHotspots());
  return (
    <group>
      {hotspots.map((h) => (
        <HotspotItem key={h.id} h={h} />
      ))}
    </group>
  );
}
