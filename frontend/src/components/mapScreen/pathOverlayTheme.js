import { PATH_OVERLAY_INNER_HTML } from './pathOverlayHtml.js'

/** High-contrast green / neutral strokes for light map backgrounds. */
export function getPathOverlayInnerHtml(light) {
  if (!light) {
    return PATH_OVERLAY_INNER_HTML
  }
  return PATH_OVERLAY_INNER_HTML
    .replace(/stroke="rgba\(245,197,24,0\.5\)"/g, 'stroke="#15803D"')
    .replace(/stroke="rgba\(245,197,24,0\.25\)"/g, 'stroke="#D1FAE5"')
    .replace(/stroke="rgba\(245,197,24,0\.55\)"/g, 'stroke="#166534"')
    .replace(/stroke="rgba\(200,144,10,0\.3\)"/g, 'stroke="#DCFCE7"')
    .replace(/stroke="rgba\(200,144,10,0\.5\)"/g, 'stroke="#15803D"')
    .replace(/stroke="rgba\(0,200,150,0\.3\)"/g, 'stroke="#BBF7D0"')
    .replace(/stroke="rgba\(0,200,150,0\.6\)"/g, 'stroke="#16A34A"')
    .replace(/stroke="rgba\(100,120,180,0\.2\)"/g, 'stroke="#E5E7EB"')
    .replace(/stroke="rgba\(80,100,160,0\.2\)"/g, 'stroke="#E5E7EB"')
    .replace(/stroke="rgba\(80,100,160,0\.25\)"/g, 'stroke="#9CA3AF"')
    .replace(/stroke="rgba\(80,100,160,0\.18\)"/g, 'stroke="#D1D5DB"')
    .replace(/stroke="rgba\(60,90,140,0\.2\)"/g, 'stroke="#E5E7EB"')
    .replace(/stroke="rgba\(60,90,140,0\.25\)"/g, 'stroke="#9CA3AF"')
    .replace(/stroke="rgba\(60,90,140,0\.18\)"/g, 'stroke="#D1D5DB"')
    .replace(/stroke="rgba\(60,60,30,0\.25\)"/g, 'stroke="#E5E7EB"')
    .replace(/stroke="rgba\(60,60,30,0\.3\)"/g, 'stroke="#9CA3AF"')
    .replace(/stroke="rgba\(60,60,30,0\.2\)"/g, 'stroke="#E5E7EB"')
    .replace(/stroke="rgba\(0,80,40,0\.2\)"/g, 'stroke="#E5E7EB"')
    .replace(/stroke="rgba\(0,80,40,0\.25\)"/g, 'stroke="#9CA3AF"')
    .replace(/stroke="rgba\(0,80,40,0\.18\)"/g, 'stroke="#D1D5DB"')
    .replace(/stroke="rgba\(120,20,20,0\.2\)"/g, 'stroke="#E5E7EB"')
    .replace(/stroke="rgba\(120,20,20,0\.25\)"/g, 'stroke="#9CA3AF"')
    .replace(/stroke="rgba\(120,20,20,0\.15\)"/g, 'stroke="#D1D5DB"')
    .replace(/stroke="rgba\(100,120,180,0\.15\)"/g, 'stroke="#D1D5DB"')
}
