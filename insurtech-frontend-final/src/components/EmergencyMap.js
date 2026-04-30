import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Leaflet 기본 마커 아이콘 경로 깨짐 방지 (CRA 번들에서 자주 발생)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const SEOUL_CITY_HALL = [37.5665, 126.978];

async function fetchHospitals(lat, lon, radiusMeters = 3000) {
  const query = `
    [out:json][timeout:15];
    (
      node["amenity"="hospital"](around:${radiusMeters},${lat},${lon});
      node["amenity"="clinic"](around:${radiusMeters},${lat},${lon});
    );
    out body 30;
  `;
  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'data=' + encodeURIComponent(query),
  });
  if (!res.ok) throw new Error('Overpass 요청 실패');
  const data = await res.json();
  return (data.elements || []).filter((e) => e.lat && e.lon);
}

export default function EmergencyMap({ onLocation }) {
  const [center, setCenter] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [status, setStatus] = useState('위치 권한을 확인 중입니다…');

  useEffect(() => {
    if (!navigator.geolocation) {
      setCenter(SEOUL_CITY_HALL);
      setStatus('위치 기능을 지원하지 않는 브라우저입니다. 기본 위치(서울시청)를 표시합니다.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = [pos.coords.latitude, pos.coords.longitude];
        setCenter(c);
        setStatus('주변 응급실/병원을 검색 중…');
        if (onLocation) onLocation({ latitude: c[0], longitude: c[1] });
      },
      () => {
        setCenter(SEOUL_CITY_HALL);
        setStatus('위치 권한이 거부되어 기본 위치(서울시청)를 표시합니다.');
        if (onLocation) onLocation({ latitude: null, longitude: null });
      },
      { timeout: 8000, maximumAge: 60000 }
    );
  }, [onLocation]);

  useEffect(() => {
    if (!center) return;
    let cancelled = false;
    fetchHospitals(center[0], center[1])
      .then((list) => {
        if (cancelled) return;
        setHospitals(list);
        setStatus(
          list.length > 0
            ? `반경 3km 이내 ${list.length}곳 표시 중`
            : '주변 등록된 의료시설을 찾지 못했습니다. 119에 즉시 연락하세요.'
        );
      })
      .catch(() => {
        if (!cancelled) setStatus('의료시설 검색에 실패했습니다. 119에 즉시 연락하세요.');
      });
    return () => {
      cancelled = true;
    };
  }, [center]);

  if (!center) {
    return <div className="emergency-map-status">{status}</div>;
  }

  return (
    <div className="emergency-map-wrap">
      <div className="emergency-map-status">{status}</div>
      <MapContainer center={center} zoom={15} style={{ height: 360, width: '100%', borderRadius: 12 }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <CircleMarker center={center} radius={8} pathOptions={{ color: '#2563eb', fillColor: '#2563eb', fillOpacity: 0.8 }}>
          <Popup>현재 위치</Popup>
        </CircleMarker>
        {hospitals.map((h) => (
          <Marker key={h.id} position={[h.lat, h.lon]}>
            <Popup>
              <strong>{h.tags?.name || '의료시설'}</strong>
              <br />
              {h.tags?.['addr:full'] || h.tags?.['addr:street'] || ''}
              <br />
              {h.tags?.phone && (
                <a href={`tel:${h.tags.phone.replace(/[^0-9+]/g, '')}`}>📞 {h.tags.phone}</a>
              )}
              <br />
              <a
                href={`https://www.openstreetmap.org/directions?from=${center[0]},${center[1]}&to=${h.lat},${h.lon}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                길찾기 →
              </a>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
