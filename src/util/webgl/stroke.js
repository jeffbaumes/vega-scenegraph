import color from './color';
import extrude from 'extrude-polyline';

// TODO: Support line dash and line dash offset

export default function(context, item, opacity, polylines, closed, z) {

  // TODO: Don't have special case for 'transparent'
  opacity *= (item.strokeOpacity==null ? 1 : item.strokeOpacity);
  if (opacity <= 0 || item.stroke === 'transparent') return false;

  var lw = (lw = item.strokeWidth) != null ? lw : 1,
      lc = (lc = item.strokeCap) != null ? lc : 'butt';
  if (lw <= 0) return false;

  var strokeExtrude = extrude({
      thickness: lw,
      cap: lc,
      join: 'miter',
      miterLimit: 10,
      closed: closed
  });

  var c = color(context, item, item.stroke);

  for (var li = 0; li < polylines.length; li++) {
    var polyline = polylines[li];
    var mesh = strokeExtrude.build(polyline);
    var mp = mesh.positions,
        mc = mesh.cells,
        mcl = mesh.cells.length,
        tg = context._triangleGeometry,
        tc = context._triangleColor,
        tx = context._tx + context._origin[0],
        ty = context._ty + context._origin[1];
    for (var ci = 0; ci < mcl; ci++) {
      var cell = mc[ci];
      var p1 = mp[cell[0]];
      var p2 = mp[cell[1]];
      var p3 = mp[cell[2]];
      tg.push(p1[0] + tx, p1[1] + ty, z, p2[0] + tx, p2[1] + ty, z, p3[0] + tx, p3[1] + ty, z);
      for (var i = 0; i < 3; i++) {
        tc.push(c[0], c[1], c[2], opacity);
      }
    }
  }

  return true;
}
