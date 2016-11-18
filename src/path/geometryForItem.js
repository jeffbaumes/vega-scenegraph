import color from '../util/webgl/color';
import extrude from 'extrude-polyline';

export default function(context, item, shapeGeom, opacity) {
  var triangles = [];
  var colors = [];
  var z = shapeGeom.z || 0,
      st = shapeGeom.triangles;

  var i, len, c, li, ci;
  var opacity = item.opacity == null ? 1 : item.opacity;
  var fillOpacity = opacity * (item.fillOpacity==null ? 1 : item.fillOpacity);
  var n = 0;
  var fill = false;
  if (item.fill && fillOpacity > 0 && item.fill !== 'transparent') {
    fill = true;
    n = st ? st.length / 9 : 0;
  }

  var strokeOpacity = opacity * (item.strokeOpacity==null ? 1 : item.strokeOpacity);
  var lw = (lw = item.strokeWidth) != null ? lw : 1,
      lc = (lc = item.strokeCap) != null ? lc : 'butt';
  var stroke = false;
  var strokeMeshes = [];
  if (lw > 0 && item.stroke && strokeOpacity > 0 && item.stroke !== 'transparent') {
    stroke = true;
    var strokeExtrude = extrude({
        thickness: lw,
        cap: lc,
        join: 'miter',
        miterLimit: 10,
        closed: !!shapeGeom.closed
    });
    for (li = 0; li < shapeGeom.lines.length; li++) {
      var mesh = strokeExtrude.build(shapeGeom.lines[li]);
      strokeMeshes.push(mesh);
      n += mesh.cells.length;
    }
  }

  var triangles = new Float32Array(n * 3 * 3);
  var colors = new Float32Array(n * 3 * 4);

  if (fill) {
    c = color(context, item, item.fill);
    for (i = 0, len = st.length; i < len; i++) {
      triangles[i] = st[i];
    }
    for (i = 0, len = st.length / 3; i < len; i++) {
      colors[i*4    ] = c[0];
      colors[i*4 + 1] = c[1];
      colors[i*4 + 2] = c[2];
      colors[i*4 + 3] = fillOpacity;
    }
  }

  var tx = context._tx + context._origin[0],
      ty = context._ty + context._origin[1];
  if (stroke) {
    c = color(context, item, item.stroke);
    i = fill ? st.length / 3 : 0;
    for (li = 0; li < strokeMeshes.length; li++) {
      var mesh = strokeMeshes[li],
          mp = mesh.positions,
          mc = mesh.cells,
          mcl = mesh.cells.length;
      for (ci = 0; ci < mcl; ci++) {
        var cell = mc[ci];
        var p1 = mp[cell[0]];
        var p2 = mp[cell[1]];
        var p3 = mp[cell[2]];
        triangles[i*3    ] = p1[0] + tx;
        triangles[i*3 + 1] = p1[1] + ty;
        triangles[i*3 + 2] = z;
        colors[i*4    ] = c[0];
        colors[i*4 + 1] = c[1];
        colors[i*4 + 2] = c[2];
        colors[i*4 + 3] = strokeOpacity;
        i++;

        triangles[i*3    ] = p2[0] + tx;
        triangles[i*3 + 1] = p2[1] + ty;
        triangles[i*3 + 2] = z;
        colors[i*4    ] = c[0];
        colors[i*4 + 1] = c[1];
        colors[i*4 + 2] = c[2];
        colors[i*4 + 3] = strokeOpacity;
        i++;

        triangles[i*3    ] = p3[0] + tx;
        triangles[i*3 + 1] = p3[1] + ty;
        triangles[i*3 + 2] = z;
        colors[i*4    ] = c[0];
        colors[i*4 + 1] = c[1];
        colors[i*4 + 2] = c[2];
        colors[i*4 + 3] = strokeOpacity;
        i++;
      }
    }
  }

  var triangleBuffer = context.createBuffer();
  context.bindBuffer(context.ARRAY_BUFFER, triangleBuffer);
  context.bufferData(context.ARRAY_BUFFER, triangles, context.STATIC_DRAW);

  var colorBuffer = context.createBuffer();
  context.bindBuffer(context.ARRAY_BUFFER, colorBuffer);
  context.bufferData(context.ARRAY_BUFFER, colors, context.STATIC_DRAW);

  return {
    triangleBuffer: triangleBuffer,
    colorBuffer: colorBuffer,
    numTriangles: n
  };
}
