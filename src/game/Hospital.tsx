import { useMemo } from "react";
import * as THREE from "three";
import { LEVELS, type LevelId } from "./data";

const WALL_COLOR = "#e9eef5";

function Wall({
  position,
  size,
  color = WALL_COLOR,
}: {
  position: [number, number, number];
  size: [number, number, number];
  color?: string;
}) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function Sign({
  position,
  text,
  color,
}: {
  position: [number, number, number];
  text: string;
  color: string;
}) {
  const texture = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 128;
    const ctx = c.getContext("2d");
    if (ctx) {
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 512, 128);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 64px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, 256, 64);
    }
    const t = new THREE.CanvasTexture(c);
    t.anisotropy = 4;
    return t;
  }, [text, color]);
  return (
    <mesh position={position}>
      <planeGeometry args={[3, 0.75]} />
      <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
    </mesh>
  );
}

function Bed({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[1.2, 0.6, 2.2]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
      <mesh position={[0, 0.7, 0]} castShadow>
        <boxGeometry args={[1.1, 0.2, 2.1]} />
        <meshStandardMaterial color="#f1f5f9" />
      </mesh>
      <mesh position={[0, 0.85, -0.7]} castShadow>
        <boxGeometry args={[0.8, 0.15, 0.5]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>
      <mesh position={[0, 1.1, -1.05]} castShadow>
        <boxGeometry args={[1.3, 1.2, 0.1]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
    </group>
  );
}

function MedSurgLayout() {
  return (
    <group>
      {/* Outer perimeter walls */}
      <Wall position={[-13.5, 1.5, 5]} size={[0.3, 3, 25]} />
      <Wall position={[14.5, 1.5, 5]} size={[0.3, 3, 25]} />
      <Wall position={[0.5, 1.5, -7.5]} size={[28, 3, 0.3]} />
      <Wall position={[0.5, 1.5, 17.5]} size={[28, 3, 0.3]} />

      {/* Lobby/hallway divider with door gap */}
      <Wall position={[-7, 1.5, 0]} size={[12, 3, 0.3]} />
      <Wall position={[7.5, 1.5, 0]} size={[13, 3, 0.3]} />

      {/* Patient Room 1 */}
      <Wall position={[-5.9, 1.5, 2.25]} size={[0.3, 3, 4.5]} />
      <Wall position={[-5.9, 1.5, 7.75]} size={[0.3, 3, 2.5]} />
      <Wall position={[-9.5, 1.5, 9]} size={[7.5, 3, 0.3]} />

      {/* Patient Room 2 */}
      <Wall position={[5.9, 1.5, 2.25]} size={[0.3, 3, 4.5]} />
      <Wall position={[5.9, 1.5, 7.75]} size={[0.3, 3, 1.5]} />
      <Wall position={[9.5, 1.5, 9]} size={[7.5, 3, 0.3]} />

      {/* Supply closet */}
      <Wall position={[5.9, 1.5, 13]} size={[0.3, 3, 1.5]} />
      <Wall position={[10.5, 1.5, 14]} size={[9.5, 3, 0.3]} />

      {/* Nurse station counter */}
      <mesh position={[0.5, 0.5, 14]} castShadow receiveShadow>
        <boxGeometry args={[6, 1, 1.5]} />
        <meshStandardMaterial color="#9aa9bd" />
      </mesh>
      <mesh position={[0.5, 1.05, 14]} castShadow>
        <boxGeometry args={[6, 0.1, 1.5]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>

      {/* Reception desk */}
      <mesh position={[4, 0.5, -3]} castShadow receiveShadow>
        <boxGeometry args={[3, 1, 1.2]} />
        <meshStandardMaterial color="#9aa9bd" />
      </mesh>

      {/* Lobby seating */}
      {[-6, -7.5, -9].map((x) => (
        <mesh key={x} position={[x, 0.4, -5.5]} castShadow>
          <boxGeometry args={[1.2, 0.8, 1.2]} />
          <meshStandardMaterial color="#3b82f6" />
        </mesh>
      ))}

      <Bed position={[-9, 0, 6]} />
      <Bed position={[9, 0, 6]} />

      <Sign position={[0, 2.6, -7.3]} text="LOBBY" color="#2563eb" />
      <Sign position={[-9, 2.6, 1.05]} text="ROOM 1" color="#2563eb" />
      <Sign position={[9, 2.6, 1.05]} text="ROOM 2" color="#2563eb" />
      <Sign position={[0.5, 2.6, 13.2]} text="NURSE STATION" color="#2563eb" />
      <Sign position={[10, 2.6, 9.55]} text="SUPPLY" color="#16a34a" />

      {/* Red cross */}
      <group position={[0, 2.7, -3]}>
        <mesh>
          <boxGeometry args={[0.8, 0.2, 0.05]} />
          <meshStandardMaterial color="#dc2626" />
        </mesh>
        <mesh>
          <boxGeometry args={[0.2, 0.8, 0.05]} />
          <meshStandardMaterial color="#dc2626" />
        </mesh>
      </group>
    </group>
  );
}

function IcuLayout() {
  const accent = "#0ea5e9";
  return (
    <group>
      {/* Outer perimeter */}
      <Wall position={[-13.5, 1.5, 5]} size={[0.3, 3, 25]} />
      <Wall position={[14.5, 1.5, 5]} size={[0.3, 3, 25]} />
      <Wall position={[0.5, 1.5, -7.5]} size={[28, 3, 0.3]} />
      <Wall position={[0.5, 1.5, 17.5]} size={[28, 3, 0.3]} />

      {/* Entry corridor divider with door gap */}
      <Wall position={[-7, 1.5, 0]} size={[12, 3, 0.3]} />
      <Wall position={[7.5, 1.5, 0]} size={[13, 3, 0.3]} />

      {/* Bay partitions: short stub walls separating bays from central station */}
      <Wall position={[-5.7, 1.5, 3]} size={[0.3, 3, 4]} />
      <Wall position={[5.7, 1.5, 3]} size={[0.3, 3, 4]} />
      <Wall position={[-5.7, 1.5, 9]} size={[0.3, 3, 4]} />
      <Wall position={[5.7, 1.5, 9]} size={[0.3, 3, 4]} />

      {/* Mid divider between top-row bays and bottom-row bays (with central opening) */}
      <Wall position={[-8, 1.5, 6.1]} size={[10, 3, 0.3]} />
      <Wall position={[8.5, 1.5, 6.1]} size={[11, 3, 0.3]} />

      {/* Clean supply room far wall with door gap at x=9..11 */}
      <Wall position={[-2, 1.5, 11.6]} size={[22, 3, 0.3]} />
      <Wall position={[12.5, 1.5, 11.6]} size={[3, 3, 0.3]} />

      {/* Central monitoring station (low desk + monitors) */}
      <mesh position={[0, 0.55, 8.5]} castShadow receiveShadow>
        <boxGeometry args={[5, 1.1, 2]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
      <mesh position={[0, 1.6, 8.5]} castShadow>
        <boxGeometry args={[4.5, 0.9, 0.1]} />
        <meshStandardMaterial color="#0f172a" emissive="#0c4a6e" emissiveIntensity={0.4} />
      </mesh>

      {/* ICU beds in each bay */}
      <Bed position={[-9, 0, 3]} />
      <Bed position={[9, 0, 3]} />
      <Bed position={[-9, 0, 9]} />
      <Bed position={[9, 0, 9]} />

      {/* Vent towers next to each bed */}
      {[[-7, 3], [7, 3], [-7, 9], [7, 9]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.9, z]} castShadow>
          <boxGeometry args={[0.4, 1.8, 0.4]} />
          <meshStandardMaterial color={accent} />
        </mesh>
      ))}

      <Sign position={[0, 2.6, -7.3]} text="ICU ENTRY" color={accent} />
      <Sign position={[-9, 2.6, 1.05]} text="BAY 1" color={accent} />
      <Sign position={[9, 2.6, 1.05]} text="BAY 2" color={accent} />
      <Sign position={[-9, 2.6, 6.25]} text="BAY 3" color={accent} />
      <Sign position={[9, 2.6, 6.25]} text="BAY 4" color={accent} />
      <Sign position={[0, 2.6, 7.45]} text="MONITORING" color={accent} />
      <Sign position={[11, 2.6, 11.75]} text="CLEAN SUPPLY" color="#16a34a" />
    </group>
  );
}

function OrLayout() {
  const accent = "#16a34a";
  return (
    <group>
      {/* Outer perimeter */}
      <Wall position={[-13.5, 1.5, 5]} size={[0.3, 3, 25]} />
      <Wall position={[14.5, 1.5, 5]} size={[0.3, 3, 25]} />
      <Wall position={[0.5, 1.5, -7.5]} size={[28, 3, 0.3]} />
      <Wall position={[0.5, 1.5, 17.5]} size={[28, 3, 0.3]} />

      {/* OR 1 walls */}
      <Wall position={[-5.7, 1.5, 3.5]} size={[0.3, 3, 3]} />
      <Wall position={[-5.7, 1.5, 8.5]} size={[0.3, 3, 3]} />
      <Wall position={[-9.3, 1.5, 1.9]} size={[7.4, 3, 0.3]} />
      <Wall position={[-9.3, 1.5, 10.1]} size={[7.4, 3, 0.3]} />

      {/* OR 2 walls */}
      <Wall position={[5.7, 1.5, 3.5]} size={[0.3, 3, 3]} />
      <Wall position={[5.7, 1.5, 8.5]} size={[0.3, 3, 3]} />
      <Wall position={[9.3, 1.5, 1.9]} size={[7.4, 3, 0.3]} />
      <Wall position={[9.3, 1.5, 10.1]} size={[7.4, 3, 0.3]} />

      {/* Sterile / soiled storage divider with door gaps */}
      <Wall position={[-6, 1.5, 11.8]} size={[14, 3, 0.3]} />
      <Wall position={[5.5, 1.5, 11.8]} size={[5, 3, 0.3]} />
      <Wall position={[12.5, 1.5, 11.8]} size={[3, 3, 0.3]} />
      <Wall position={[9.9, 1.5, 14.5]} size={[0.3, 3, 5]} />

      {/* OR table (steel) in each OR */}
      {[-9, 9].map((x) => (
        <group key={x} position={[x, 0, 6]}>
          <mesh position={[0, 0.85, 0]} castShadow>
            <boxGeometry args={[0.8, 0.15, 2.0]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.5} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.45, 0]} castShadow>
            <boxGeometry args={[0.3, 0.7, 0.3]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.6} />
          </mesh>
          {/* Surgical light boom */}
          <mesh position={[0, 2.4, 0]} castShadow>
            <sphereGeometry args={[0.4, 16, 16]} />
            <meshStandardMaterial color="#f8fafc" emissive="#fde68a" emissiveIntensity={0.5} />
          </mesh>
        </group>
      ))}

      {/* Scrub sinks along left of corridor */}
      <mesh position={[-11, 0.6, -3]} castShadow>
        <boxGeometry args={[1.2, 1.2, 0.5]} />
        <meshStandardMaterial color="#e5e7eb" />
      </mesh>

      <Sign position={[0, 2.6, -7.3]} text="OR SUITE" color={accent} />
      <Sign position={[-9, 2.6, 0.85]} text="OR 1" color={accent} />
      <Sign position={[9, 2.6, 0.85]} text="OR 2" color={accent} />
      <Sign position={[-9, 2.6, 11.4]} text="STERILE STORAGE" color={accent} />
      <Sign position={[12, 2.6, 11.4]} text="SOILED UTILITY" color="#dc2626" />
      <Sign position={[-11, 2.6, -3.6]} text="SCRUB" color={accent} />
    </group>
  );
}

function EdLayout() {
  const accent = "#dc2626";
  return (
    <group>
      {/* Outer perimeter */}
      <Wall position={[-13.5, 1.5, 5]} size={[0.3, 3, 25]} />
      <Wall position={[14.5, 1.5, 5]} size={[0.3, 3, 25]} />
      <Wall position={[0.5, 1.5, -7.5]} size={[28, 3, 0.3]} />
      <Wall position={[0.5, 1.5, 17.5]} size={[28, 3, 0.3]} />

      {/* Triage / waiting partition with door gap */}
      <Wall position={[-7.5, 1.5, -1.7]} size={[11, 3, 0.3]} />
      <Wall position={[8, 1.5, -1.7]} size={[12, 3, 0.3]} />

      {/* Trauma bay walls (left) */}
      <Wall position={[-5.7, 1.5, 3.5]} size={[0.3, 3, 3]} />
      <Wall position={[-5.7, 1.5, 7.5]} size={[0.3, 3, 1]} />
      <Wall position={[-9.3, 1.5, 8.1]} size={[7.4, 3, 0.3]} />

      {/* ED Rooms (right) */}
      <Wall position={[5.9, 1.5, 3.5]} size={[0.3, 3, 3]} />
      <Wall position={[5.9, 1.5, 7.5]} size={[0.3, 3, 1]} />
      <Wall position={[9.5, 1.5, 8.1]} size={[7.4, 3, 0.3]} />

      {/* Decon room (far left) */}
      <Wall position={[-9.4, 1.5, 11.2]} size={[0.3, 3, 3.5]} />
      <Wall position={[-11.3, 1.5, 13.1]} size={[3.9, 3, 0.3]} />

      {/* Supply alcove (far right) */}
      <Wall position={[9.6, 1.5, 11.2]} size={[0.3, 3, 3.5]} />
      <Wall position={[11.8, 1.5, 13.1]} size={[4.4, 3, 0.3]} />

      {/* Triage desk */}
      <mesh position={[-4, 0.5, -3.3]} castShadow receiveShadow>
        <boxGeometry args={[3, 1, 1.2]} />
        <meshStandardMaterial color="#9aa9bd" />
      </mesh>

      {/* Waiting chairs */}
      {[3, 4.5, 6].map((x) => (
        <mesh key={x} position={[x, 0.4, -5.5]} castShadow>
          <boxGeometry args={[1.0, 0.8, 1.0]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
      ))}

      {/* Trauma bay stretcher */}
      <Bed position={[-9, 0, 5]} />
      {/* ED Room stretchers */}
      <Bed position={[9, 0, 5]} />

      {/* ED tracking board (large screen on wall near nurse station area) */}
      <mesh position={[0, 1.7, 16]} castShadow>
        <boxGeometry args={[4, 1.2, 0.1]} />
        <meshStandardMaterial color="#0f172a" emissive="#1e293b" emissiveIntensity={0.5} />
      </mesh>

      <Sign position={[0, 2.6, -7.3]} text="EMERGENCY DEPT" color={accent} />
      <Sign position={[-4, 2.6, -2.0]} text="TRIAGE" color={accent} />
      <Sign position={[5, 2.6, -2.0]} text="WAITING" color="#2563eb" />
      <Sign position={[-9, 2.6, 2.4]} text="TRAUMA 1" color={accent} />
      <Sign position={[9, 2.6, 2.4]} text="ED ROOM" color={accent} />
      <Sign position={[-11, 2.6, 11]} text="DECON" color="#16a34a" />
      <Sign position={[11.5, 2.6, 11]} text="SUPPLY" color="#16a34a" />

      {/* Red cross */}
      <group position={[0, 2.7, -3]}>
        <mesh>
          <boxGeometry args={[0.8, 0.2, 0.05]} />
          <meshStandardMaterial color="#dc2626" />
        </mesh>
        <mesh>
          <boxGeometry args={[0.2, 0.8, 0.05]} />
          <meshStandardMaterial color="#dc2626" />
        </mesh>
      </group>
    </group>
  );
}

export function Hospital({ levelId }: { levelId: LevelId }) {
  const level = LEVELS[levelId];
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.5, 0, 5]} receiveShadow>
        <planeGeometry args={[28, 25]} />
        <meshStandardMaterial color={level.layout.floorColor} />
      </mesh>
      {levelId === "medsurg" && <MedSurgLayout />}
      {levelId === "icu" && <IcuLayout />}
      {levelId === "or" && <OrLayout />}
      {levelId === "ed" && <EdLayout />}
    </group>
  );
}
