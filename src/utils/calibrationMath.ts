import L from "leaflet";
import type { CalibrationPoint } from "../context/SimulationContext";

export const convertRawToReal = (
  rx: number,
  ry: number,
  isCalibrated: boolean,
  p1: CalibrationPoint,
  scale: { x: number; y: number }
): { x: number; y: number } => {
  if (!isCalibrated) return { x: rx, y: ry };
  const realX = parseFloat(p1.realX) + (rx - p1.rawX!) * scale.x;
  const realY = parseFloat(p1.realY) + (ry - p1.rawY!) * scale.y;
  return { x: realX, y: realY };
};

export const convertRealToRaw = (
  realX: number,
  realY: number,
  isCalibrated: boolean,
  p1: CalibrationPoint,
  scale: { x: number; y: number }
): L.LatLng | null => {
  if (!isCalibrated) return null;
  const rawX = p1.rawX! + (realX - parseFloat(p1.realX)) / scale.x;
  const rawY = p1.rawY! + (realY - parseFloat(p1.realY)) / scale.y;
  return L.latLng(rawY, rawX);
};
