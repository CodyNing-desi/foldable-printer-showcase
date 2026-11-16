import { Component, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Html, Line, OrbitControls, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { assetUrl } from '../state'
import { CAM_PRESETS, EXPLODE, JOINT_LABELS, PHASE_JOINTS, TRACE_POINTS, explodeWindow, partLabel } from '../data/viewer'
import type { CamPreset } from '../data/viewer'
import { phaseIndex } from '../data/motion'
import { MOTIONS } from '../data/motion'

interface Tracks { n: number; tracks: Record<string, { p: number[]; q: number[] }> }
interface Joint { name: string; kind: string; a: string; b: string; pa: number[]; pb: number[]; axis: number[]; pin?: number; hole?: number }
interface Manifest { instances: string[]; assembly_bbox_t0: number[] }

const cache: Record<string, Promise<{ tracks: Tracks; joints: Joint[]; manifest: Manifest }>> = {}
function loadMeta(cand: string) {
  if (!cache[cand]) {
    cache[cand] = Promise.all([
      fetch(assetUrl(`models/${cand}/tracks.json`)).then(r => r.json()),
      fetch(assetUrl(`models/${cand}/joints.json`)).then(r => r.json()),
      fetch(assetUrl(`models/${cand}/manifest.json`)).then(r => r.json()),
    ]).then(([tracks, joints, manifest]) => ({ tracks, joints, manifest }))
  }
  return cache[cand]
}

export interface ViewerCtrl {
  t: number
  explode: number
  xray: boolean
  isolate: string | null
  selected: string | null
  traces: boolean
  labels: boolean
  preset: CamPreset
  presetToken: number
}

const PAPER = '#f7f5f1'
const COL_BASE = new THREE.Color('#c9ced6')
const COL_MOVE = new THREE.Color('#2456e6')
const COL_SEL = new THREE.Color('#e8503a')
const COL_DIM = new THREE.Color('#e3e1db')

function sample(tr: { p: number[]; q: number[] }, n: number, t: number, outP: THREE.Vector3, outQ: THREE.Quaternion) {
  const f = Math.min(1, Math.max(0, t)) * (n - 1)
  const i = Math.min(n - 2, Math.floor(f))
  const u = f - i
  outP.set(
    tr.p[i * 3] + (tr.p[(i + 1) * 3] - tr.p[i * 3]) * u,
    tr.p[i * 3 + 1] + (tr.p[(i + 1) * 3 + 1] - tr.p[i * 3 + 1]) * u,
    tr.p[i * 3 + 2] + (tr.p[(i + 1) * 3 + 2] - tr.p[i * 3 + 2]) * u,
  )
  const qa = new THREE.Quaternion(tr.q[i * 4], tr.q[i * 4 + 1], tr.q[i * 4 + 2], tr.q[i * 4 + 3])
  const qb = new THREE.Quaternion(tr.q[(i + 1) * 4], tr.q[(i + 1) * 4 + 1], tr.q[(i + 1) * 4 + 2], tr.q[(i + 1) * 4 + 3])
  outQ.copy(qa).slerp(qb, u)
}

function Assembly({ cand, ctrl, meta, onSelect }: { cand: string; ctrl: ViewerCtrl; meta: { tracks: Tracks; joints: Joint[]; manifest: Manifest }; onSelect: (pid: string | null) => void }) {
  const { scene } = useGLTF(assetUrl(`models/${cand}/assembly.glb`))
  const group = useRef<THREE.Group>(null)
  const ctrlRef = useRef(ctrl)
  ctrlRef.current = ctrl
  const spec = MOTIONS.find(m => m.id === cand)!
  const explodeSpec = EXPLODE[cand] ?? {}
  const maxOrder = Math.max(0, ...Object.values(explodeSpec).map(e => e.order))

  const nodes = useMemo(() => {
    const map: Record<string, THREE.Object3D> = {}
    scene.traverse(o => { if ((o as THREE.Mesh).isMesh && meta.manifest.instances.includes(o.name)) map[o.name] = o })
    return map
  }, [scene, meta])

  const materials = useMemo(() => {
    const m: Record<string, THREE.MeshStandardMaterial> = {}
    for (const [pid, obj] of Object.entries(nodes)) {
      const mesh = obj as THREE.Mesh
      const mat = new THREE.MeshStandardMaterial({ color: COL_BASE.clone(), roughness: 0.55, metalness: 0.08, transparent: true, opacity: 1 })
      mesh.material = mat
      mesh.castShadow = false
      m[pid] = mat
    }
    return m
  }, [nodes])

  useEffect(() => () => { Object.values(materials).forEach(m => m.dispose()) }, [materials])

  // 关节标记
  const phaseJoints = PHASE_JOINTS[cand] ?? []
  const markerRefs = useRef<(THREE.Mesh | null)[]>([])
  const activeJoints = useMemo(() => {
    const names = phaseJoints[phaseIndex(spec, ctrl.t)] ?? []
    return meta.joints.filter(j => names.includes(j.name)).slice(0, 3)
  }, [meta, spec, ctrl.t, phaseJoints])

  // 轨迹线
  const traceLines = useMemo(() => {
    if (!ctrl.traces) return []
    const pts = TRACE_POINTS[cand] ?? []
    return pts.map(tp => {
      const tr = meta.tracks.tracks[tp.pid]
      if (!tr) return null
      const arr: [number, number, number][] = []
      const v = new THREE.Vector3(); const q = new THREE.Quaternion(); const local = new THREE.Vector3(...tp.local)
      for (let i = 0; i < meta.tracks.n; i += 2) {
        sample(tr, meta.tracks.n, i / (meta.tracks.n - 1), v, q)
        const w = local.clone().applyQuaternion(q).add(v)
        arr.push([w.x, w.y, w.z])
      }
      return { label: tp.label, points: arr }
    }).filter(Boolean) as { label: string; points: [number, number, number][] }[]
  }, [ctrl.traces, cand, meta])

  const tmpP = useMemo(() => new THREE.Vector3(), [])
  const tmpQ = useMemo(() => new THREE.Quaternion(), [])
  const tmpV = useMemo(() => new THREE.Vector3(), [])

  useFrame(() => {
    const c = ctrlRef.current
    const pIdx = phaseIndex(spec, c.t)
    const moving = new Set((PHASE_JOINTS[cand]?.[pIdx] ?? []).flatMap(n => meta.joints.filter(j => j.name === n).flatMap(j => [j.a, j.b])))
    for (const [pid, obj] of Object.entries(nodes)) {
      const tr = meta.tracks.tracks[pid]
      if (tr) {
        sample(tr, meta.tracks.n, c.t, tmpP, tmpQ)
      } else {
        tmpP.set(0, 0, 0); tmpQ.identity()
      }
      const ex = explodeSpec[pid]
      if (ex && c.explode > 0) {
        const w = explodeWindow(ex.order, maxOrder, c.explode)
        tmpP.x += ex.vec[0] * w; tmpP.y += ex.vec[1] * w; tmpP.z += ex.vec[2] * w
      }
      obj.position.copy(tmpP)
      obj.quaternion.copy(tmpQ)
      const mat = materials[pid]
      const isSel = c.selected === pid
      const hidden = c.isolate !== null && c.isolate !== pid
      obj.visible = !hidden
      if (hidden) continue
      if (c.xray && !isSel && !moving.has(pid)) {
        mat.opacity = 0.14; mat.color.copy(COL_DIM); mat.depthWrite = false
      } else {
        mat.opacity = 1; mat.depthWrite = true
        mat.color.copy(isSel ? COL_SEL : moving.has(pid) ? COL_MOVE : COL_BASE)
      }
    }
    // 关节标记世界位置
    activeJoints.forEach((j, i) => {
      const mk = markerRefs.current[i]
      const na = nodes[j.a]
      if (!mk || !na) return
      na.updateWorldMatrix(true, false)
      tmpV.set(j.pa[0], j.pa[1], j.pa[2]).applyMatrix4(na.matrixWorld)
      mk.position.copy(tmpV)
      mk.visible = c.explode < 0.05
    })
  })

  return (
    <group ref={group}>
      <primitive object={scene} onPointerDown={(e: { stopPropagation: () => void; object: THREE.Object3D }) => {
        e.stopPropagation()
        let o: THREE.Object3D | null = e.object
        while (o && !meta.manifest.instances.includes(o.name)) o = o.parent
        onSelect(o ? o.name : null)
      }} />
      {activeJoints.map((j, i) => (
        <mesh key={j.name} ref={el => { markerRefs.current[i] = el }}>
          <sphereGeometry args={[3.2, 16, 16]} />
          <meshBasicMaterial color="#e8503a" />
          {ctrl.labels && (
            <Html center distanceFactor={420} style={{ pointerEvents: 'none' }}>
              <div className="joint-tag">{JOINT_LABELS[j.name] ?? j.name}</div>
            </Html>
          )}
        </mesh>
      ))}
      {traceLines.map(tl => (
        <Line key={tl.label} points={tl.points} color="#2456e6" lineWidth={1.6} dashed dashSize={4} gapSize={3} transparent opacity={0.75} />
      ))}
    </group>
  )
}

function CameraRig({ cand, ctrl }: { cand: string; ctrl: ViewerCtrl }) {
  const controls = useRef<any>(null)
  const { camera } = useThree()
  useEffect(() => {
    const p = CAM_PRESETS[cand]?.[ctrl.preset] ?? CAM_PRESETS[cand]?.iso
    if (!p || !controls.current) return
    camera.position.set(...p.pos)
    controls.current.target.set(...p.target)
    controls.current.update()
  }, [ctrl.preset, ctrl.presetToken, cand, camera])
  return <OrbitControls ref={controls} makeDefault enableDamping dampingFactor={0.08} minDistance={60} maxDistance={1200} />
}

class ViewerBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch() { this.props.onError() }
  render() { return this.state.failed ? null : this.props.children }
}

export function webglAvailable(): boolean {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

export function MechanismViewer({ cand, ctrl, onSelect, onFallback, className }: {
  cand: string; ctrl: ViewerCtrl; onSelect: (pid: string | null) => void; onFallback: () => void; className?: string
}) {
  const [meta, setMeta] = useState<{ tracks: Tracks; joints: Joint[]; manifest: Manifest } | null>(null)
  const [err, setErr] = useState(false)

  useEffect(() => {
    let alive = true
    loadMeta(cand).then(m => { if (alive) setMeta(m) }).catch(() => { if (alive) setErr(true) })
    return () => { alive = false }
  }, [cand])

  useEffect(() => { if (err) onFallback() }, [err, onFallback])

  if (err || !meta) return <div className={`viewer-loading ${className ?? ''}`}>{err ? '' : '加载真实 CAD 装配…'}</div>

  return (
    <div className={className}>
      <ViewerBoundary onError={onFallback}>
        <Canvas
          dpr={[1, 1.75]}
          camera={{ position: CAM_PRESETS[cand].iso.pos, fov: 38, near: 1, far: 4000 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          onPointerMissed={() => onSelect(null)}
          style={{ background: 'transparent' }}
        >
          <ambientLight intensity={0.75} />
          <directionalLight position={[220, -260, 320]} intensity={1.5} />
          <directionalLight position={[-180, 200, 140]} intensity={0.5} />
          <Suspense fallback={null}>
            <Assembly cand={cand} ctrl={ctrl} meta={meta} onSelect={onSelect} />
          </Suspense>
          <ContactShadows position={[70, 0, -12]} opacity={0.28} scale={600} blur={2.2} far={200} resolution={512} color="#3a3f47" />
          <CameraRig cand={cand} ctrl={ctrl} />
        </Canvas>
      </ViewerBoundary>
    </div>
  )
}

export { partLabel }
