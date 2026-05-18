<script setup lang="ts">
import type { Map, Marker } from 'leaflet';

const lat = defineModel<number>('lat', { required: true });
const lng = defineModel<number>('lng', { required: true });

const mapEl = useTemplateRef<HTMLElement>('mapEl');
let map: Map | null = null;
let marker: Marker | null = null;

function updateCoordinate(coord: 'lat' | 'lng', value: number) {
  console.log(`Updating on LocationMap ${coord} to`, value);
  if (coord === 'lat') lat.value = value;
  else lng.value = value;
}

onMounted(async () => {
  const L = await import('leaflet');
  await import('leaflet/dist/leaflet.css');

  // Fix default marker icon paths broken by bundlers
  delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)
    ._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });

  const isDefault = lat.value === 0 && lng.value === 0;
  map = L.map(mapEl.value!, { zoomControl: true }).setView(
    [lat.value, lng.value],
    isDefault ? 2 : 13,
  );

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }).addTo(map);

  marker = L.marker([lat.value, lng.value], { draggable: true }).addTo(map);

  marker.on('dragend', () => {
    const pos = marker!.getLatLng();
    updateCoordinate('lat', pos.lat);
    updateCoordinate('lng', pos.lng);
  });

  map.on('click', async e => {
    marker!.setLatLng(e.latlng);
    updateCoordinate('lat', e.latlng.lat);
    updateCoordinate('lng', e.latlng.lng);
  });
});

onUnmounted(() => {
  map?.remove();
  map = null;
  marker = null;
});

watch([lat, lng], ([newLat, newLng]) => {
  marker?.setLatLng([newLat, newLng]);
  map?.setView([newLat, newLng], map.getZoom());
});
</script>

<template>
  <div
    ref="mapEl"
    class="w-full h-64 rounded-lg overflow-hidden border border-surface-200 dark:border-surface-700"
  />
</template>
