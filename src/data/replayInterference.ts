// 由 scripts/audit_penetration.py 的 L4 层审计自动生成：历史版本回放在 R1-V6 几何上的实体干涉区间。
// config_fail=该版本配置本就干涉且仿真未通过（干涉是其被淘汰/修改的原因）；
// geometry_mismatch=回放使用 R1-V6 局部放大几何（塔顶盖/铰点/床面按冻结版设计），与该版本仿真包络或抬升行程不同所致。
// 两者均非网页映射错误，亦非 R1-V6 原始 CAD 缺陷（L0/L2 层 0 穿透）。
export interface ReplayInterference { cand: string; version: string; pair: string; t0: number; t1: number; vol: number; attribution: 'config_fail' | 'geometry_mismatch' }
export const REPLAY_INTERFERENCE: ReplayInterference[] = [
 {
  "cand": "F09_L82",
  "version": "v1",
  "pair": "ARM/BASE",
  "t0": 0.921,
  "t1": 1.0,
  "vol": 8736.0,
  "attribution": "config_fail"
 },
 {
  "cand": "F09_L82",
  "version": "v1",
  "pair": "ARM/BED",
  "t0": 0.942,
  "t1": 1.0,
  "vol": 35.7,
  "attribution": "config_fail"
 },
 {
  "cand": "F09_L82",
  "version": "v1",
  "pair": "SYNC/TWR_0",
  "t0": 0.312,
  "t1": 0.333,
  "vol": 163.4,
  "attribution": "geometry_mismatch"
 },
 {
  "cand": "F09_L82",
  "version": "v1",
  "pair": "SYNC/TWR_1",
  "t0": 0.312,
  "t1": 0.333,
  "vol": 163.4,
  "attribution": "geometry_mismatch"
 },
 {
  "cand": "F09_L82",
  "version": "v2",
  "pair": "ARM/BASE",
  "t0": 0.921,
  "t1": 1.0,
  "vol": 8736.0,
  "attribution": "geometry_mismatch"
 },
 {
  "cand": "F09_L82",
  "version": "v2",
  "pair": "ARM/BED",
  "t0": 0.942,
  "t1": 1.0,
  "vol": 35.7,
  "attribution": "geometry_mismatch"
 },
 {
  "cand": "F09_L82",
  "version": "v2",
  "pair": "SYNC/TWR_0",
  "t0": 0.312,
  "t1": 0.333,
  "vol": 163.4,
  "attribution": "geometry_mismatch"
 },
 {
  "cand": "F09_L82",
  "version": "v2",
  "pair": "SYNC/TWR_1",
  "t0": 0.312,
  "t1": 0.333,
  "vol": 163.4,
  "attribution": "geometry_mismatch"
 },
 {
  "cand": "F09_L82",
  "version": "v3",
  "pair": "ARM/BASE",
  "t0": 0.879,
  "t1": 1.0,
  "vol": 8130.0,
  "attribution": "geometry_mismatch"
 },
 {
  "cand": "F09_L82",
  "version": "v3",
  "pair": "SYNC/TWR_0",
  "t0": 0.333,
  "t1": 0.375,
  "vol": 164.7,
  "attribution": "geometry_mismatch"
 },
 {
  "cand": "F09_L82",
  "version": "v3",
  "pair": "SYNC/TWR_1",
  "t0": 0.333,
  "t1": 0.375,
  "vol": 164.7,
  "attribution": "geometry_mismatch"
 },
 {
  "cand": "F09_L82",
  "version": "v32",
  "pair": "SYNC/TWR_0",
  "t0": 0.377,
  "t1": 1.0,
  "vol": 65.3,
  "attribution": "geometry_mismatch"
 },
 {
  "cand": "F09_L82",
  "version": "v32",
  "pair": "SYNC/TWR_1",
  "t0": 0.377,
  "t1": 1.0,
  "vol": 65.3,
  "attribution": "geometry_mismatch"
 },
 {
  "cand": "F07",
  "version": "v1",
  "pair": "ARM/BASE",
  "t0": 0.892,
  "t1": 1.0,
  "vol": 8365.5,
  "attribution": "geometry_mismatch"
 }
]

export function interferenceAt(cand: string, version: string, t: number): ReplayInterference[] {
  return REPLAY_INTERFERENCE.filter(r => r.cand === cand && r.version === version && t >= r.t0 - 0.01 && t <= r.t1 + 0.01)
}
