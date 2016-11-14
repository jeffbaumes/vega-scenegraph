import color from './color';
import pixelsToDisplay from './pixelsToDisplay';
import extrude from 'extrude-polyline';

// TODO: Support line dash and line dash offset

export default function(context, item, opacity, polylines, closed) {

  // TODO: Don't have special case for 'transparent'
  opacity *= (item.strokeOpacity==null ? 1 : item.strokeOpacity);
  if (opacity <= 0 || item.stroke === 'transparent') return false;

  var lw = (lw = item.strokeWidth) != null ? lw : 1, lc;
  if (lw <= 0) return false;

  var strokeExtrude = extrude({
      thickness: lw,
      cap: (lc = item.strokeCap) != null ? lc : 'butt',
      join: 'miter',
      miterLimit: 10,
      closed: false
      // closed: closed
  });

  var c = color(context, item, item.stroke);

  polylines.forEach(function(polyline) {
    //builds a triangulated mesh from a polyline
    var mesh = strokeExtrude.build(polyline);

    mesh.cells.forEach(function (cell) {
      var p1 = pixelsToDisplay(context, mesh.positions[cell[0]]);
      var p2 = pixelsToDisplay(context, mesh.positions[cell[1]]);
      var p3 = pixelsToDisplay(context, mesh.positions[cell[2]]);
      context._triangleGeometry.push(p1[0], p1[1], p2[0], p2[1], p3[0], p3[1]);
      for (var i = 0; i < 3; i++) {
        context._triangleColor.push(c[0], c[1], c[2], opacity);
        // context._triangleColor.push(Math.random(), Math.random(), Math.random(), 0.25);
      }
    });
  });

  return true;
}
