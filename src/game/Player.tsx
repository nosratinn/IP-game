import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PointerLockControls, useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";
import { LEVELS, type LevelId } from "./data";

type PLCImpl = { lock: () => void; unlock: () => void };
import { useGame } from "./store";

export const Controls = {
  forward: "forward",
  back: "back",
  left: "left",
  right: "right",
  interact: "interact",
} as const;

export type ControlKey = (typeof Controls)[keyof typeof Controls];

const SPEED = 4.5;
const PLAYER_HEIGHT = 1.6;
const INTERACT_RADIUS = 2.2;

function makeCollider(levelId: LevelId) {
  const layout = LEVELS[levelId].layout;
  const walls = layout.walls;
  const bounds = layout.bounds;
  return (x: number, z: number) => {
    const r = 0.35;
    for (const [x1, z1, x2, z2] of walls) {
      if (x + r > x1 && x - r < x2 && z + r > z1 && z - r < z2) return true;
    }
    if (
      x < bounds.minX + r ||
      x > bounds.maxX - r ||
      z < bounds.minZ + r ||
      z > bounds.maxZ - r
    )
      return true;
    return false;
  };
}

export function Player({ levelId }: { levelId: LevelId }) {
  const { camera, gl } = useThree();
  const controlsRef = useRef<PLCImpl | null>(null);
  const setControlsRef = (instance: unknown) => {
    controlsRef.current = (instance as PLCImpl) ?? null;
  };
  const [, getKeys] = useKeyboardControls<ControlKey>();
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  const inspectingId = useGame((s) => s.inspectingId);
  const setInspecting = useGame((s) => s.setInspecting);
  const phase = useGame((s) => s.phase);
  const answered = useGame((s) => s.answered);
  const feedback = useGame((s) => s.feedback);

  const collide = useRef(makeCollider(levelId));
  useEffect(() => {
    collide.current = makeCollider(levelId);
  }, [levelId]);

  // Position camera at the level's start whenever level changes
  useEffect(() => {
    const start = LEVELS[levelId].layout.startPosition;
    camera.position.set(start[0], PLAYER_HEIGHT, start[2]);
    camera.lookAt(start[0], PLAYER_HEIGHT, start[2] + 5);
  }, [camera, levelId]);

  useEffect(() => {
    const ctrl = controlsRef.current;
    if (!ctrl) return;
    if (phase === "playing" && !inspectingId && !feedback) {
      const onClick = () => {
        if (
          phase === "playing" &&
          !useGame.getState().inspectingId &&
          !useGame.getState().feedback
        ) {
          try {
            ctrl.lock();
          } catch {
            // ignore
          }
        }
      };
      gl.domElement.addEventListener("click", onClick);
      return () => gl.domElement.removeEventListener("click", onClick);
    }
    try {
      ctrl.unlock();
    } catch {
      // ignore
    }
    return undefined;
  }, [phase, inspectingId, feedback, gl.domElement]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "KeyE") return;
      if (phase !== "playing") return;
      if (useGame.getState().inspectingId || useGame.getState().feedback) return;
      const pos = camera.position;
      const hotspots = useGame.getState().sampledHotspots;
      let nearest: { id: string; d: number } | null = null;
      for (const h of hotspots) {
        if (useGame.getState().answered[h.id]) continue;
        const dx = h.position[0] - pos.x;
        const dz = h.position[2] - pos.z;
        const d = Math.hypot(dx, dz);
        if (d < INTERACT_RADIUS && (!nearest || d < nearest.d)) {
          nearest = { id: h.id, d };
        }
      }
      if (nearest) setInspecting(nearest.id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [camera, phase, levelId, setInspecting]);

  useFrame((_, delta) => {
    if (phase !== "playing" || inspectingId || feedback) return;
    const k = getKeys();
    direction.current.set(0, 0, 0);
    if (k.forward) direction.current.z += 1;
    if (k.back) direction.current.z -= 1;
    if (k.left) direction.current.x += 1;
    if (k.right) direction.current.x -= 1;

    if (direction.current.lengthSq() > 0) {
      direction.current.normalize();
      const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
      forward.y = 0;
      forward.normalize();
      const right = new THREE.Vector3(-1, 0, 0).applyQuaternion(camera.quaternion);
      right.y = 0;
      right.normalize();

      velocity.current.set(0, 0, 0);
      velocity.current.addScaledVector(forward, direction.current.z * SPEED * delta);
      velocity.current.addScaledVector(right, direction.current.x * SPEED * delta);

      const nextX = camera.position.x + velocity.current.x;
      const nextZ = camera.position.z + velocity.current.z;
      if (!collide.current(nextX, camera.position.z)) {
        camera.position.x = nextX;
      }
      if (!collide.current(camera.position.x, nextZ)) {
        camera.position.z = nextZ;
      }
    }
    camera.position.y = PLAYER_HEIGHT;
    void answered;
  });

  return <PointerLockControls ref={setControlsRef} />;
}
