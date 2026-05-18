export type CoordFormat = 'DD' | 'DMS';

export function ddToDms(dd: number, isLat: boolean): string {
  const abs = Math.abs(dd);
  const deg = Math.floor(abs);
  const minFull = (abs - deg) * 60;
  const min = Math.floor(minFull);
  const sec = (minFull - min) * 60;

  const dir = isLat ? (dd >= 0 ? 'N' : 'S') : dd >= 0 ? 'E' : 'W';

  return `${deg}°${min}'${sec.toFixed(2)}"${dir}`;
}

/** Parses a coordinate string in DD or DMS to decimal degrees.
 *  Returns NaN on invalid input. */
export function parseToDd(input: string): number {
  const trimmed = input.trim();
  if (trimmed === '' || trimmed === '-') return NaN;

  const asNum = Number(trimmed);
  if (!isNaN(asNum)) return asNum;

  // Accepts: 23°30'45.12"S  |  23 30 45.12 S  |  -23 30 45
  const dmsRe =
    /^(-?\d+(?:[°ºd\s]+))(\d+(?:['\s]+))?(\d+(?:[.,]\d+)?(?:["\s]+)?)?([NSEWnsew]?)$/;
  const match = trimmed.match(dmsRe);
  if (!match) return NaN;

  const deg = parseFloat(match[1] || '');
  const min = match[2] ? parseFloat(match[2]) : 0;
  const sec = match[3] ? parseFloat(match[3].replace(',', '.')) : 0;
  const dir = match[4]?.toUpperCase();

  let result = Math.abs(deg) + min / 60 + sec / 3600;
  if (deg < 0 || dir === 'S' || dir === 'W') result = -result;

  return result;
}

export function formatCoord(
  dd: number,
  format: CoordFormat,
  isLat: boolean,
): string {
  if (format === 'DMS') return ddToDms(dd, isLat);
  return dd.toFixed(6);
}
