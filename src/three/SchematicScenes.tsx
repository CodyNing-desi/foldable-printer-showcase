// F04 / F12 无 CAD 零件（淘汰于建模阶段）。本场景按仓库 documented 参数重建参数化原理示意：
// F04: simulation/config/candidates.json（lift100/shift70/slot12/roller8）+ independent_review_round1.md
// F12: simulation_v3/results/screening_v3.json（outer60/wall3/overlap52/clearance0.015）+ V3.2 晃动评估
// 明确标注"原理示意"，不冒充真实 CAD；干涉位置为审查记录口径的示意高亮，非伪造三维碰撞实验。
// 世界坐标 Z-up（与 CAD 轨道一致），相机 up=Z；自动取景保证整体可见，特写才裁切。
import { useMemo, useRef } from 'react'
import type { MutableRefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html, Line, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

const INK = '#3a3f47'
const BLUE = '#2456e6'
const RED = '#e8503a'
const STEEL = '#aeb6c0'
const AMBER = '#e0a63a'

function ease(t: number) { return 0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, Math.max(0, t))) }

const GL = { antialias: true, alpha: true, preserveDrawingBuffer: typeof location !== 'undefined' && location.search.includes('pdb') }
const DPR: [number, number] = [1, 1.5]
const CAM = { fov: 38, near: 1, far: 6000, up: [0, 0, 1] as [number, number, number], position: [500, -500, 350] as [number, number, number] }

function Lights() {
  return (
    <>
      <hemisphereLight args={['#ffffff', '#c9c4b8', 0.85]} />
      <directionalLight position={[260, -320, 380]} intensity={1.7} />
      <directionalLight position={[-220, 260, 160]} intensity={0.55} />
    </>
  )
}


// 一次性自动取景：token 变化时按目标包围盒拟合相机（非每帧）
function FitRig({ group, token, closeBox, fullBox, controls }: {
  group: MutableRefObject<THREE.Group | null>; token: string
  closeBox?: { center: [number, number, number]; size: [number, number, number] } | null
  fullBox?: { center: [number, number, number]; size: [number, number, number] }
  controls: MutableRefObject<any>
}) {
  const { camera, size } = useThree()
  const last = useRef('')
  const box = useMemo(() => new THREE.Box3(), [])
  useFrame(() => {
    if (token === last.current || !controls.current || !group.current) return
    last.current = token
    if (closeBox) {
      box.setFromCenterAndSize(new THREE.Vector3(...closeBox.center), new THREE.Vector3(...closeBox.size))
    } else if (fullBox) {
      // 运动包络盒：覆盖全部姿态， scrub/播放时镜头稳定
      box.setFromCenterAndSize(new THREE.Vector3(...fullBox.center), new THREE.Vector3(...fullBox.size))
    } else {
      box.setFromObject(group.current)
    }
    if (box.isEmpty()) return
    const center = box.getCenter(new THREE.Vector3())
    const sz = box.getSize(new THREE.Vector3())
    const vfov = THREE.MathUtils.degToRad((camera as THREE.PerspectiveCamera).fov)
    const hfov = 2 * Math.atan(Math.tan(vfov / 2) * (size.width / Math.max(1, size.height)))
    const dir = new THREE.Vector3(1, -1, 0.62).normalize()
    const right = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 0, 1))
    if (right.lengthSq() < 1e-6) right.set(1, 0, 0)
    right.normalize()
    const upv = new THREE.Vector3().crossVectors(right, dir).normalize()
    const halfH = 0.5 * (sz.x * Math.abs(right.x) + sz.y * Math.abs(right.y) + sz.z * Math.abs(right.z))
    const halfV = 0.5 * (sz.x * Math.abs(upv.x) + sz.y * Math.abs(upv.y) + sz.z * Math.abs(upv.z))
    const dist = Math.max(halfV / Math.tan(vfov / 2), halfH / Math.tan(hfov / 2)) * 1.25 + 15
    camera.position.copy(center).addScaledVector(dir, dist)
    camera.up.set(0, 0, 1)
    controls.current.target.copy(center)
    controls.current.update()
  })
  return null
}

function BaseBed() {
  return (
    <group>
      <mesh position={[0, 0, 10]}><boxGeometry args={[315, 347, 20]} /><meshStandardMaterial color={STEEL} roughness={0.45} metalness={0.1} /></mesh>
      <mesh position={[160, 0, 50]}><boxGeometry args={[180, 180, 20]} /><meshStandardMaterial color="#c2c8d0" roughness={0.45} /></mesh>
      <Html position={[160, -110, 62]} center distanceFactor={600} style={{ pointerEvents: 'none' }}><div className="scene-tag">热床</div></Html>
    </group>
  )
}

/* ---------------- F04 ---------------- */
export type F04Mode = 'before' | 'after' | 'why'
export type ViewMode = 'full' | 'close'

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
      m.opacity = hit ? 0.3 + 0.16 * Math.sin(clock.elapsedTime * 4) : 0
    }
  })

  const railGeo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(40, 0, 25), new THREE.Vector3(40, 0, 120), new THREE.Vector3(110, 0, 120)])
    return new THREE.TubeGeometry(curve, 40, 6, 10, false)
  }, [])
  const pathPts = useMemo<[number, number, number][]>(() => [[40, 0, 25], [40, 0, 120], [110, 0, 120], [180, 0, 60]], [])

  return (
    <group>
      <BaseBed />
      <Line points={pathPts} color={mode === 'before' ? BLUE : '#b9b4aa'} lineWidth={mode === 'before' ? 2.4 : 1.2} dashed dashSize={8} gapSize={6} />
      {mode !== 'before' && (
        <group>
          {[14, -14].map(y => (
            <mesh key={y} geometry={railGeo} position={[0, y, 0]}>
              <meshStandardMaterial color={mode === 'why' ? '#7d8590' : BLUE} roughness={0.4} metalness={0.15} />
            </mesh>
          ))}
          {[14, -14].map(y => (
            <group key={`r${y}`}>
              <mesh position={[40, y, 60]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[4, 4, 6, 20]} /><meshStandardMaterial color={RED} roughness={0.4} /></mesh>
              <mesh position={[40, y, 100]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[4, 4, 6, 20]} /><meshStandardMaterial color={RED} roughness={0.4} /></mesh>
            </group>
          ))}
          <Html position={[40, 46, 132]} center distanceFactor={600} style={{ pointerEvents: 'none' }}>
            <div className="scene-tag accent">槽轨实体 + 滚轮 Ø8（补全后）</div>
          </Html>
        </group>
      )}
      <group ref={col}>
        <mesh position={[0, 0, 172]}><boxGeometry args={[20, 20, 345]} /><meshStandardMaterial color={mode === 'before' ? BLUE : AMBER} roughness={0.45} metalness={0.1} /></mesh>
        <mesh position={[107, 0, 340]}><boxGeometry args={[215, 16, 12]} /><meshStandardMaterial color="#f0883e" roughness={0.45} /></mesh>
        <mesh position={[200, 0, 322]}><boxGeometry args={[26, 26, 30]} /><meshStandardMaterial color="#7d8590" /></mesh>
        <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[6, 6, 30, 20]} /><meshStandardMaterial color={INK} /></mesh>
      </group>
      <mesh ref={glow} position={[135, 0, 52]} visible={false}>
        <boxGeometry args={[90, 60, 34]} />
        <meshBasicMaterial color={RED} transparent opacity={0} depthWrite={false} />
      </mesh>
      {mode === 'why' && (
        <Html position={[135, -70, 96]} center distanceFactor={600} style={{ pointerEvents: 'none' }}>
          <div className="scene-tag danger">槽轨 ↔ 热床穿透 · 名义 45.338 mm²（2.5D 口径）</div>
        </Html>
      )}
    </group>
  )
}

export function F04Scene({ t, mode, view, active = true }: { t: number; mode: F04Mode; view: ViewMode; active?: boolean }) {
  const group = useRef<THREE.Group>(null)
  const controls = useRef<any>(null)
  const closeBox = view === 'close' ? { center: [135, 0, 60] as [number, number, number], size: [170, 150, 120] as [number, number, number] } : null
  return (
    <Canvas flat dpr={DPR} frameloop={active ? 'always' : 'demand'} camera={CAM} gl={GL} onCreated={({ camera }) => camera.up.set(0, 0, 1)} style={{ background: 'transparent' }}>
      <Lights />
      <group ref={group}><F04Mech t={t} mode={mode} /></group>
      <FitRig group={group} token={`${view}|${mode}`} closeBox={closeBox} fullBox={{ center: [80, 0, 130], size: [520, 380, 440] }} controls={controls} />
      <OrbitControls ref={controls} makeDefault enableDamping dampingFactor={0.08} minDistance={40} maxDistance={2500} />
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
  const walls: [number, number, number, number, number][] = [
    [size, wall, len, 0, -(size - wall) / 2],
    [size, wall, len, 0, (size - wall) / 2],
    [wall, size - 2 * wall, len, -(size - wall) / 2, 0],
    [wall, size - 2 * wall, len, (size - wall) / 2, 0],
  ]
  return (
    <group ref={ref} position={[0, 0, z]}>
      {walls.map((b, i) => (
        <mesh key={i} position={[b[3], b[4], len / 2]}>
          <boxGeometry args={[b[0], b[1], b[2]]} />
          <meshStandardMaterial color={color} roughness={0.42} metalness={0.12} />
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
        <Tube size={52} len={170} z={z2} color={wobbleOn ? AMBER : BLUE} wobble={wob} />
        <Tube size={44} len={170} z={z3} color={wobbleOn ? AMBER : '#7fa0f0'} wobble={wob * 1.4} />
        <mesh position={[0, 0, z3 + 170 + 6]}><boxGeometry args={[215, 16, 12]} /><meshStandardMaterial color="#f0883e" roughness={0.45} /></mesh>
        {wobbleOn && (
          <Html position={[46, 0, z2 + 60]} center distanceFactor={600} style={{ pointerEvents: 'none' }}>
            <div className="scene-tag danger">导向晃动 0.203–0.229 mm · 夸大 ×20 示意</div>
          </Html>
        )}
        <Html position={[-52, 0, 100]} center distanceFactor={600} style={{ pointerEvents: 'none' }}>
          <div className="scene-tag">三级嵌套 · 外径 60 / 壁厚 3 / 重叠 52</div>
        </Html>
      </group>
    </group>
  )
}

export function F12Scene({ extend, wobbleOn, view, active = true }: { extend: number; wobbleOn: boolean; view: ViewMode; active?: boolean }) {
  const group = useRef<THREE.Group>(null)
  const controls = useRef<any>(null)
  const z2 = 20 + extend * (170 - 52)
  const closeBox = view === 'close' ? { center: [-60, 0, z2 + 70] as [number, number, number], size: [150, 150, 170] as [number, number, number] } : null
  return (
    <Canvas flat dpr={DPR} frameloop={active ? 'always' : 'demand'} camera={CAM} gl={GL} onCreated={({ camera }) => camera.up.set(0, 0, 1)} style={{ background: 'transparent' }}>
      <Lights />
      <group ref={group}><F12Mech extend={extend} wobbleOn={wobbleOn} /></group>
      <FitRig group={group} token={`${view}`} closeBox={closeBox} fullBox={{ center: [30, 0, 220], size: [440, 380, 480] }} controls={controls} />
      <OrbitControls ref={controls} makeDefault enableDamping dampingFactor={0.08} minDistance={40} maxDistance={2500} />
    </Canvas>
  )
}
