// F04 / F12 无 CAD 零件（淘汰于建模阶段）。本场景按仓库 documented 参数重建参数化原理示意：
// F04: simulation/config/candidates.json（lift100/shift70/slot12/roller8）+ independent_review_round1.md
// F12: simulation_v3/results/screening_v3.json（outer60/wall3/overlap52/clearance0.015）+ V3.2 晃动评估
// 明确标注"原理示意"，不冒充真实 CAD；干涉位置为审查记录口径的示意高亮，非伪造三维碰撞实验。
import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Html, Line, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

const INK = '#3a3f47'
const BLUE = '#2456e6'
const RED = '#e8503a'
const STEEL = '#c9ced6'

function ease(t: number) { return 0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, Math.max(0, t))) }

function BaseBed() {
  return (
    <group>
      <mesh position={[0, 0, 10]}><boxGeometry args={[315, 347, 20]} /><meshStandardMaterial color={STEEL} roughness={0.6} /></mesh>
      <mesh position={[160, 0, 50]}><boxGeometry args={[180, 180, 20]} /><meshStandardMaterial color="#aeb6c0" roughness={0.5} /></mesh>
      <Html position={[160, -100, 62]} center distanceFactor={600} style={{ pointerEvents: 'none' }}><div className="scene-tag">热床</div></Html>
    </group>
  )
}

/* ---------------- F04 ---------------- */
export type F04Mode = 'before' | 'after' | 'why'

function F04Mech({ t, mode }: { t: number; mode: F04Mode }) {
  const col = useRef<THREE.Group>(null)
  const glow = useRef<THREE.Mesh>(null)
  const lift = 100 * ease(t / 0.3)
  const shift = 70 * ease((t - 0.3) / 0.2)
  const root = 90 * ease((t - 0.5) / 0.5)

  useFrame(({ clock }) => {
    if (!col.current) return
    col.current.position.set(40 + shift, 0, 20 + lift)
    col.current.rotation.y = THREE.MathUtils.degToRad(root)
    if (glow.current) {
      const m = glow.current.material as THREE.MeshBasicMaterial
      const hit = mode === 'why' && root > 25
      glow.current.visible = hit
      m.opacity = hit ? 0.3 + 0.18 * Math.sin(clock.elapsedTime * 4) : 0
    }
  })

  const railCurve = useMemo(() => {
    const pts = [new THREE.Vector3(40, 0, 25), new THREE.Vector3(40, 0, 120), new THREE.Vector3(110, 0, 120)]
    return new THREE.CatmullRomCurve3(pts)
  }, [])
  const railGeo = useMemo(() => new THREE.TubeGeometry(railCurve, 40, 6, 10, false), [railCurve])
  const pathPts = useMemo<[number, number, number][]>(() => [[40, 0, 25], [40, 0, 120], [110, 0, 120], [180, 0, 60]], [])

  return (
    <group>
      <BaseBed />
      {/* 抽象路径（before 高亮） */}
      <Line points={pathPts} color={mode === 'before' ? BLUE : '#b9b4aa'} lineWidth={mode === 'before' ? 2.4 : 1.2} dashed dashSize={8} gapSize={6} />
      {/* 槽轨实体（after/why 出现） */}
      {mode !== 'before' && (
        <group>
          {[14, -14].map(y => (
            <mesh key={y} geometry={railGeo} position={[0, y, 0]}>
              <meshStandardMaterial color={mode === 'why' ? '#8f96a3' : BLUE} roughness={0.45} />
            </mesh>
          ))}
          {[14, -14].map(y => (
            <group key={`r${y}`}>
              <mesh position={[40, y, 60]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[4, 4, 6, 20]} /><meshStandardMaterial color={RED} roughness={0.4} /></mesh>
              <mesh position={[40, y, 100]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[4, 4, 6, 20]} /><meshStandardMaterial color={RED} roughness={0.4} /></mesh>
            </group>
          ))}
          <Html position={[40, 40, 130]} center distanceFactor={600} style={{ pointerEvents: 'none' }}>
            <div className="scene-tag accent">槽轨实体 + 滚轮 Ø8（补全后）</div>
          </Html>
        </group>
      )}
      {/* 立柱 + 臂 */}
      <group ref={col}>
        <mesh position={[0, 0, 172]}><boxGeometry args={[20, 20, 345]} /><meshStandardMaterial color={mode === 'before' ? BLUE : STEEL} roughness={0.5} /></mesh>
        <mesh position={[107, 0, 340]}><boxGeometry args={[215, 16, 12]} /><meshStandardMaterial color={STEEL} roughness={0.5} /></mesh>
        <mesh position={[200, 0, 322]}><boxGeometry args={[26, 26, 30]} /><meshStandardMaterial color="#8f96a3" /></mesh>
        <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[6, 6, 30, 20]} /><meshStandardMaterial color={INK} /></mesh>
      </group>
      {/* 干涉高亮：槽轨 ↔ 热床（审查口径位置示意） */}
      <mesh ref={glow} position={[135, 0, 52]} visible={false}>
        <boxGeometry args={[90, 60, 34]} />
        <meshBasicMaterial color={RED} transparent opacity={0} depthWrite={false} />
      </mesh>
      {mode === 'why' && (
        <Html position={[135, -60, 95]} center distanceFactor={600} style={{ pointerEvents: 'none' }}>
          <div className="scene-tag danger">槽轨 ↔ 热床穿透 · 名义 45.338 mm²（2.5D 口径）</div>
        </Html>
      )}
    </group>
  )
}

export function F04Scene({ t, mode }: { t: number; mode: F04Mode }) {
  const camPos: [number, number, number] = mode === 'why' ? [260, -200, 150] : [380, -420, 300]
  const camTarget: [number, number, number] = mode === 'why' ? [130, 0, 60] : [80, 0, 140]
  return (
    <Canvas dpr={[1, 1.75]} camera={{ position: camPos, fov: 38, near: 1, far: 4000 }} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.75} />
      <directionalLight position={[220, -260, 320]} intensity={1.5} />
      <directionalLight position={[-180, 200, 140]} intensity={0.5} />
      <F04Mech t={t} mode={mode} />
      <ContactShadows position={[60, 0, -2]} opacity={0.25} scale={700} blur={2.2} far={220} resolution={512} color="#3a3f47" />
      <OrbitControls makeDefault enableDamping target={camTarget} minDistance={80} maxDistance={1400} />
    </Canvas>
  )
}

/* ---------------- F12 ---------------- */
function Tube({ size, len, z, color, wobble }: { size: number; len: number; z: number; color: string; wobble: number }) {
  const ref = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.position.x = wobble * Math.sin(clock.elapsedTime * 2.2)
    ref.current.position.y = wobble * 0.6 * Math.sin(clock.elapsedTime * 1.7 + 1)
    ref.current.rotation.z = wobble * 0.004 * Math.sin(clock.elapsedTime * 2.2)
  })
  const wall = 3
  return (
    <group ref={ref} position={[0, 0, z]}>
      {[
        [size, wall, len, 0, -(size - wall) / 2, 0],
        [size, wall, len, 0, (size - wall) / 2, 0],
        [wall, size - 2 * wall, len, -(size - wall) / 2, 0, 0],
        [wall, size - 2 * wall, len, (size - wall) / 2, 0, 0],
      ].map((b, i) => (
        <mesh key={i} position={[b[3], b[4], len / 2]}>
          <boxGeometry args={[b[0], b[1], b[2]] as [number, number, number]} />
          <meshStandardMaterial color={color} roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

function F12Mech({ extend, wobbleOn }: { extend: number; wobbleOn: boolean }) {
  const stroke = 170 - 52
  const z2 = 20 + extend * stroke
  const z3 = 20 + 2 * extend * stroke
  const wob = wobbleOn ? 4.2 : 0 // 0.203–0.229 mm × ~20 夸大
  return (
    <group>
      <BaseBed />
      <group position={[-60, 0, 0]}>
        <Tube size={60} len={170} z={20} color={STEEL} wobble={0} />
        <Tube size={52} len={170} z={z2} color={wobbleOn ? '#e0a63a' : BLUE} wobble={wob} />
        <Tube size={44} len={170} z={z3} color={wobbleOn ? '#e0a63a' : '#7fa0f0'} wobble={wob * 1.4} />
        <mesh position={[0, 0, z3 + 170 + 6]}><boxGeometry args={[215, 16, 12]} /><meshStandardMaterial color={STEEL} /></mesh>
        {wobbleOn && (
          <Html position={[40, 0, z2 + 60]} center distanceFactor={600} style={{ pointerEvents: 'none' }}>
            <div className="scene-tag danger">导向晃动 0.203–0.229 mm · 夸大 ×20 示意</div>
          </Html>
        )}
        <Html position={[-45, 0, 100]} center distanceFactor={600} style={{ pointerEvents: 'none' }}>
          <div className="scene-tag">三级嵌套 · 外径 60 / 壁厚 3 / 重叠 52</div>
        </Html>
      </group>
    </group>
  )
}

export function F12Scene({ extend, wobbleOn }: { extend: number; wobbleOn: boolean }) {
  return (
    <Canvas dpr={[1, 1.75]} camera={{ position: [360, -400, 280], fov: 38, near: 1, far: 4000 }} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.75} />
      <directionalLight position={[220, -260, 320]} intensity={1.5} />
      <directionalLight position={[-180, 200, 140]} intensity={0.5} />
      <F12Mech extend={extend} wobbleOn={wobbleOn} />
      <ContactShadows position={[40, 0, -2]} opacity={0.25} scale={700} blur={2.2} far={220} resolution={512} color="#3a3f47" />
      <OrbitControls makeDefault enableDamping target={[40, 0, 150]} minDistance={80} maxDistance={1400} />
    </Canvas>
  )
}
