import stroke from '../util/webgl/stroke';
import color from '../util/webgl/color';
import extrude from 'extrude-polyline';

export default function(context, item, shapeGeom, opacity) {
  var triangles = [];
  var colors = [];
  var z = shapeGeom.z || 0;

  var i, c;
  var opacity = item.opacity == null ? 1 : item.opacity;
  var fillOpacity = opacity * (item.fillOpacity==null ? 1 : item.fillOpacity);
  // TODO: don't special-case 'transparent'
  if (item.fill && fillOpacity > 0 && item.fill !== 'transparent') {
    triangles = shapeGeom.triangles.slice();
    c = color(context, item, item.fill);
    for (i = 0; i < triangles.length / 3; i++) {
      colors.push(c[0], c[1], c[2], fillOpacity);
    }
  }

  var strokeOpacity = opacity * (item.strokeOpacity==null ? 1 : item.strokeOpacity);
  var lw = (lw = item.strokeWidth) != null ? lw : 1,
      lc = (lc = item.strokeCap) != null ? lc : 'butt';
  if (lw > 0 && item.stroke && strokeOpacity > 0 && item.stroke !== 'transparent') {
    var strokeExtrude = extrude({
        thickness: lw,
        cap: lc,
        join: 'miter',
        miterLimit: 10,
        closed: !!closed
    });

    c = color(context, item, item.stroke);
    for (var li = 0; li < shapeGeom.lines.length; li++) {
      var polyline = shapeGeom.lines[li];
      var mesh = strokeExtrude.build(polyline);
      var mp = mesh.positions,
          mc = mesh.cells,
          mcl = mesh.cells.length,
          tx = context._tx + context._origin[0],
          ty = context._ty + context._origin[1];
      for (var ci = 0; ci < mcl; ci++) {
        var cell = mc[ci];
        var p1 = mp[cell[0]];
        var p2 = mp[cell[1]];
        var p3 = mp[cell[2]];
        triangles.push(p1[0] + tx, p1[1] + ty, z, p2[0] + tx, p2[1] + ty, z, p3[0] + tx, p3[1] + ty, z);
        for (i = 0; i < 3; i++) {
          colors.push(c[0], c[1], c[2], opacity);
        }
      }
    }
  }

  return {
    triangles: triangles,
    colors: colors
  };
}
