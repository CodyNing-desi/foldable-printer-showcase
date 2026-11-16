import { Component, Suspense, memo, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode, MutableRefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html, Line, OrbitControls, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { assetUrl } from '../state'
import { CAM_DIRS, EXPLODE, JOINT_LABELS, PART_COLORS, PHASE_JOINTS, TRACE_POINTS, explodeWindow, partLabel } from '../data/viewer'
import type { CamPreset } from '../data/viewer'
import { MOTIONS, phaseIndex } from '../data/motion'

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
  frameToken: number
}

// 模块级常量：避免每渲染新建对象导致 r3f 反复 configure
const GL_PROPS = { antialias: true, alpha: true, powerPreference: 'high-performance' as const, preserveDrawingBuffer: typeof location !== 'undefined' && location.search.includes('pdb') }
const DPR: [number, number] = [1, 1.5]
const CAMERA_PROPS = { fov: 38, near: 1, far: 6000, up: [0, 0, 1] as [number, number, number], position: [400, -400, 300] as [number, number, number] }

const COL_SEL = new THREE.Color('#e8503a')
const COL_MOVE = new THREE.Color('#2456e6')
const COL_DIM = new THREE.Color('#e6e4de')

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

function SceneContent({ cand, ctrl, meta, onSelect, controls, active, dragging }: {
  cand: string; ctrl: ViewerCtrl; meta: { tracks: Tracks; joints: Joint[]; manifest: Manifest }
  onSelect: (pid: string | null) => void; controls: MutableRefObject<any>; active: boolean; dragging: MutableRefObject<boolean>
}) {
  const gltf = useGLTF(assetUrl(`models/${cand}/assembly.glb`))
  // useGLTF 缓存共享同一 Object3D；primitive 挂载会抢占父节点 → 每实例必须克隆
  const scene = useMemo(() => gltf.scene.clone(true), [gltf.scene])
  const { camera, invalidate, size } = useThree()
  const ctrlRef = useRef(ctrl); ctrlRef.current = ctrl
  const activeRef = useRef(active); activeRef.current = active
  const spec = MOTIONS.find(m => m.id === cand)!
  const explodeSpec = EXPLODE[cand] ?? {}
  const maxOrder = Math.max(0, ...Object.values(explodeSpec).map(e => e.order))
  const snapNext = useRef(true)
  const lastFrameKey = useRef('')

  const nodes = useMemo(() => {
    const map: Record<string, THREE.Mesh> = {}
    scene.traverse(o => { if ((o as THREE.Mesh).isMesh && meta.manifest.instances.includes(o.name)) map[o.name] = o as THREE.Mesh })
    return map
  }, [scene, meta])

  const materials = useMemo(() => {
    const m: Record<string, THREE.MeshStandardMaterial> = {}
    for (const pid of Object.keys(nodes)) {
      const base = new THREE.Color(PART_COLORS[pid.split('_')[0]] ?? '#aeb6c0')
      m[pid] = new THREE.MeshStandardMaterial({ color: base, roughness: 0.42, metalness: 0.12, transparent: true, opacity: 1 })
    }
    return m
  }, [nodes])
  const edges = useMemo(() => {
    const e: Record<string, THREE.LineSegments> = {}
    for (const [pid, mesh] of Object.entries(nodes)) {
      const line = new THREE.LineSegments(
        new THREE.EdgesGeometry(mesh.geometry, 28),
        new THREE.LineBasicMaterial({ color: '#3a3f47', transparent: true, opacity: 0.45 }),
      )
      line.raycast = () => {}
      mesh.add(line)
      e[pid] = line
    }
    return e
  }, [nodes])
  useEffect(() => () => {
    Object.values(materials).forEach(m => m.dispose())
    Object.values(edges).forEach(l => { l.geometry.dispose(); (l.material as THREE.Material).dispose(); l.parent?.remove(l) })
  }, [materials, edges])

  // 取景请求：装载/方案/预设/隔离/爆炸模式/显式 token 变化时触发一次（非每帧）
  const frameKey = `${cand}|${ctrl.preset}|${ctrl.isolate}|${ctrl.explode > 0 ? 1 : 0}|${ctrl.frameToken}|${ctrl.preset === 'detail' ? phaseIndex(spec, ctrl.t) : ''}`
  if (frameKey !== lastFrameKey.current) { lastFrameKey.current = frameKey; snapNext.current = true }

  const phaseJoints = PHASE_JOINTS[cand] ?? []
  const markerRefs = useRef<(THREE.Mesh | null)[]>([])
  const activeJoints = useMemo(() => {
    const names = phaseJoints[phaseIndex(spec, ctrl.t)] ?? []
    return meta.joints.filter(j => names.includes(j.name)).slice(0, 3)
  }, [meta, spec, ctrl.t, phaseJoints])

  const traceLines = useMemo(() => {
    if (!ctrl.traces) return []
    return (TRACE_POINTS[cand] ?? []).map(tp => {
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
  const box = useMemo(() => new THREE.Box3(), [])
  const box2 = useMemo(() => new THREE.Box3(), [])

  useFrame(() => {
    const c = ctrlRef.current
    const pIdx = phaseIndex(spec, c.t)
    const moving = new Set((phaseJoints[pIdx] ?? []).flatMap(n => meta.joints.filter(j => j.name === n).flatMap(j => [j.a, j.b])))
    for (const [pid, obj] of Object.entries(nodes)) {
      const tr = meta.tracks.tracks[pid]
      if (tr) sample(tr, meta.tracks.n, c.t, tmpP, tmpQ)
      else { tmpP.set(0, 0, 0); tmpQ.identity() }
      const ex = explodeSpec[pid]
      let cur = 0
      if (ex && c.explode > 0) {
        cur = explodeWindow(ex.order, maxOrder, c.explode)
        tmpP.x += ex.vec[0] * cur; tmpP.y += ex.vec[1] * cur; tmpP.z += ex.vec[2] * cur
      }
      obj.position.copy(tmpP)
      obj.quaternion.copy(tmpQ)
      const mat = materials[pid]
      const edge = edges[pid]
      const isSel = c.selected === pid
      const hidden = c.isolate !== null && c.isolate !== pid
      obj.visible = !hidden
      if (hidden) continue
      const base = PART_COLORS[pid.split('_')[0]] ?? '#aeb6c0'
      if (edge) {
        const em = edge.material as THREE.LineBasicMaterial
        edge.visible = !hidden && !(c.xray && !isSel && !moving.has(pid))
        em.color.set(isSel ? '#e8503a' : moving.has(pid) ? '#2456e6' : '#3a3f47')
        em.opacity = isSel || moving.has(pid) ? 0.85 : 0.45
      }
      if (c.xray && !isSel && !moving.has(pid)) {
        mat.opacity = 0.13; mat.color.copy(COL_DIM); mat.depthWrite = false; mat.emissive.setRGB(0, 0, 0)
      } else {
        mat.opacity = 1; mat.depthWrite = true
        mat.color.set(isSel ? '#e8503a' : base)
        mat.emissive.copy(isSel ? COL_SEL : moving.has(pid) ? COL_MOVE : new THREE.Color(0, 0, 0))
        mat.emissiveIntensity = isSel ? 0.22 : moving.has(pid) ? 0.16 : 0
      }
    }
    activeJoints.forEach((j, i) => {
      const mk = markerRefs.current[i]
      const na = nodes[j.a]
      if (!mk || !na) return
      na.updateWorldMatrix(true, false)
      tmpV.set(j.pa[0], j.pa[1], j.pa[2]).applyMatrix4(na.matrixWorld)
      mk.position.copy(tmpV)
      mk.visible = c.explode < 0.05
    })

    // 平滑跟随取景：目标盒 = 当前爆炸进度下整条轨道的并集（姿态不变），相机阻尼趋近 → 完整且不抖动
    {
      box.makeEmpty()
      const targets = c.isolate ? [c.isolate] : Object.keys(nodes)
      const TS = 12
      const m4 = new THREE.Matrix4()
      const ONE = new THREE.Vector3(1, 1, 1)
      if (c.preset === 'detail' && activeJoints.length > 0 && !c.isolate) {
        const j = activeJoints[0]
        const na = nodes[j.a]
        if (na) {
          na.updateWorldMatrix(true, false)
          tmpV.set(j.pa[0], j.pa[1], j.pa[2]).applyMatrix4(na.matrixWorld)
          box.setFromCenterAndSize(tmpV, new THREE.Vector3(120, 120, 120))
        }
      } else if (c.isolate) {
        const obj = nodes[c.isolate]
        if (obj) { obj.updateWorldMatrix(true, true); box.setFromObject(obj) }
      } else {
        for (const pid of targets) {
          const obj = nodes[pid]
          const tr = meta.tracks.tracks[pid]
          if (!obj || !obj.visible) continue
          const geom = obj.geometry as THREE.BufferGeometry
          if (!geom.boundingBox) geom.computeBoundingBox()
          const ex = explodeSpec[pid]
          const w = ex && c.explode > 0 ? explodeWindow(ex.order, maxOrder, c.explode) : 0
          for (let i = 0; i < TS; i++) {
            if (tr) sample(tr, meta.tracks.n, i / (TS - 1), tmpP, tmpQ)
            else { tmpP.set(0, 0, 0); tmpQ.identity() }
            if (ex && w > 0) { tmpP.x += ex.vec[0] * w; tmpP.y += ex.vec[1] * w; tmpP.z += ex.vec[2] * w }
            m4.compose(tmpP, tmpQ, ONE)
            box2.copy(geom.boundingBox!).applyMatrix4(m4)
            box.union(box2)
          }
        }
      }
      if (!box.isEmpty() && !dragging.current) {
        const center = box.getCenter(new THREE.Vector3())
        const sz = box.getSize(new THREE.Vector3())
        const vfov = THREE.MathUtils.degToRad((camera as THREE.PerspectiveCamera).fov)
        const aspect = size.width / Math.max(1, size.height)
        const hfov = 2 * Math.atan(Math.tan(vfov / 2) * aspect)
        const dir = new THREE.Vector3(...(CAM_DIRS[c.preset] ?? CAM_DIRS.iso)).normalize()
        const right = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 0, 1))
        if (right.lengthSq() < 1e-6) right.set(1, 0, 0)
        right.normalize()
        const upv = new THREE.Vector3().crossVectors(right, dir).normalize()
        const halfH = 0.5 * (sz.x * Math.abs(right.x) + sz.y * Math.abs(right.y) + sz.z * Math.abs(right.z))
        const halfV = 0.5 * (sz.x * Math.abs(upv.x) + sz.y * Math.abs(upv.y) + sz.z * Math.abs(upv.z))
        const dist = Math.max(halfV / Math.tan(vfov / 2), halfH / Math.tan(hfov / 2)) * 1.25 + 15
        const desired = center.clone().addScaledVector(dir, dist)
        const k = snapNext.current ? 1 : 0.12
        camera.position.lerp(desired, k)
        controls.current.target.lerp(center, k)
        controls.current.update()
        snapNext.current = false
      }
      invalidate()
    }
  })

  // 离屏时 prop 变化仍补一帧
  useEffect(() => { if (!active) invalidate() }, [ctrl, active, invalidate])

  return (
    <group>
      <primitive object={scene} onPointerDown={(e: { stopPropagation: () => void; object: THREE.Object3D }) => {
        e.stopPropagation()
        let o: THREE.Object3D | null = e.object
        while (o && !meta.manifest.instances.includes(o.name)) o = o.parent
        onSelect(o ? o.name : null)
      }}>
      </primitive>
      {activeJoints.map((j, i) => (
        <mesh key={j.name} ref={el => { markerRefs.current[i] = el }}>
          <sphereGeometry args={[3.4, 16, 16]} />
          <meshBasicMaterial color="#e8503a" />
          {ctrl.labels && (
            <Html center distanceFactor={420} style={{ pointerEvents: 'none' }}>
              <div className="joint-tag">{JOINT_LABELS[j.name] ?? j.name}</div>
            </Html>
          )}
        </mesh>
      ))}
      {traceLines.map(tl => (
        <Line key={tl.label} points={tl.points} color="#2456e6" lineWidth={1.8} dashed dashSize={5} gapSize={4} transparent opacity={0.8} />
      ))}
    </group>
  )
}

class ViewerBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch() { this.props.onError() }
  render() { return this.state.failed ? null : this.props.children }
}

let webglProbe: boolean | null = null
export function webglAvailable(): boolean {
  if (webglProbe !== null) return webglProbe
  try {
    const c = document.createElement('canvas')
    const gl = c.getContext('webgl2') || c.getContext('webgl')
    webglProbe = !!gl
    if (gl) (gl as WebGLRenderingContext).getExtension('WEBGL_lose_context')?.loseContext()
  } catch {
    webglProbe = false
  }
  return webglProbe
}

export const MechanismViewer = memo(function MechanismViewer({ cand, ctrl, onSelect, onFallback, className, active = true }: {
  cand: string; ctrl: ViewerCtrl; onSelect: (pid: string | null) => void; onFallback: () => void; className?: string; active?: boolean
}) {
  const [meta, setMeta] = useState<{ tracks: Tracks; joints: Joint[]; manifest: Manifest } | null>(null)
  const [err, setErr] = useState(false)
  const controls = useRef<any>(null)
  const dragging = useRef(false)

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
          flat
          dpr={DPR}
          frameloop={active ? 'always' : 'demand'}
          camera={CAMERA_PROPS}
          gl={GL_PROPS}
          onPointerMissed={() => onSelect(null)}
          onCreated={({ camera: cam }) => { cam.up.set(0, 0, 1) }}
          style={{ background: 'transparent' }}
        >
          <hemisphereLight args={['#ffffff', '#c9c4b8', 0.85]} />
          <directionalLight position={[260, -320, 380]} intensity={1.7} />
          <directionalLight position={[-220, 260, 160]} intensity={0.55} />
          <directionalLight position={[0, 320, -120]} intensity={0.3} />
          <Suspense fallback={null}>
            <SceneContent cand={cand} ctrl={ctrl} meta={meta} onSelect={onSelect} controls={controls} active={active} dragging={dragging} />
          </Suspense>
          <OrbitControls ref={controls} makeDefault enableDamping dampingFactor={0.08} minDistance={30} maxDistance={2500} onStart={() => { dragging.current = true }} onEnd={() => { dragging.current = false }} />
        </Canvas>
      </ViewerBoundary>
    </div>
  )
})

export { partLabel }
