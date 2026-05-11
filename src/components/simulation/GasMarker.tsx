import { SVGOverlay } from 'react-leaflet';
import L from 'leaflet';

export function GasMarker({ center, angle, scaleX }: { center: L.LatLng; angle: number; scaleX: number }) {
  // Chúng ta cần vẽ một đường dài 700m.
  // Đường kẻ chiếm 80% chiều rộng của viewBox (từ x=20 đến x=180 trong tổng 200).
  // Do đó, tổng độ rộng của box vuông sẽ là: 700 / 0.8 = 875m.
  const rawWidth = 875 / Math.abs(scaleX); 
  const rawHeight = rawWidth; // Hình vuông

  const bounds: L.LatLngBoundsExpression = [
    [center.lat - rawHeight / 2, center.lng - rawWidth / 2],
    [center.lat + rawHeight / 2, center.lng + rawWidth / 2]
  ];

  return (
    <SVGOverlay key={`${center.lat}-${center.lng}-${angle}`} bounds={bounds} attributes={{ viewBox: "0 0 200 200" }}>
      <g style={{ transform: `rotate(${angle}deg)`, transformOrigin: '100px 100px' }}>
        <line x1="20" y1="100" x2="180" y2="100" stroke="#0033cc" strokeWidth="4" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        
        <line x1="20" y1="80" x2="20" y2="120" stroke="#0033cc" strokeWidth="4" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        <line x1="180" y1="80" x2="180" y2="120" stroke="#0033cc" strokeWidth="4" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        
        <line x1="55" y1="85" x2="85" y2="115" stroke="#0033cc" strokeWidth="4" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        <line x1="85" y1="85" x2="55" y2="115" stroke="#0033cc" strokeWidth="4" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        
        <line x1="115" y1="85" x2="145" y2="115" stroke="#0033cc" strokeWidth="4" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        <line x1="145" y1="85" x2="115" y2="115" stroke="#0033cc" strokeWidth="4" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </g>
    </SVGOverlay>
  );
}
