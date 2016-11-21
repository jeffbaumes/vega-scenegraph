import color from '../util/webgl/color';
import extrude from 'extrude-polyline';

export default function(context, item, shapeGeom, opacity) {
  var lw = (lw = item.strokeWidth) != null ? lw : 1,
      lc = (lc = item.strokeCap) != null ? lc : 'butt';
  var strokeMeshes = [];
  var i, len, c, li, ci, mesh, triangles, colors, cell, p1, p2, p3, mp, mc, mcl,
      triangleBuffer, colorBuffer, n = 0, fill = false, stroke = false, v;
  var opacity = item.opacity == null ? 1 : item.opacity;
  var fillOpacity = opacity * (item.fillOpacity==null ? 1 : item.fillOpacity);
  var triangles = [];
  var colors = [];
  var strokeOpacity = opacity * (item.strokeOpacity==null ? 1 : item.strokeOpacity),
      strokeExtrude,
      z = shapeGeom.z || 0,
      st = shapeGeom.triangles,
      val,
      key = shapeGeom.key + ';' + lw + ';' + lc + ';' + closed + ';' + item.fill + ';' + item.fillOpacity + ';' + item.stroke + ';' + item.strokeOpacity;

  if (context._itemCache[key]) {
    return context._itemCache[key];
  }

  if (item.fill === 'transparent') {
    fillOpacity = 0;
  }
  if (item.fill && fillOpacity > 0) {
    fill = true;
    n = st ? st.length / 9 : 0;
  }

  if (item.stroke === 'transparent') {
    strokeOpacity = 0;
  }
  if (lw > 0 && item.stroke && strokeOpacity > 0) {
    stroke = true;
    strokeExtrude = extrude({
        thickness: lw,
        cap: lc,
        join: 'miter',
        miterLimit: 10,
        closed: !!shapeGeom.closed
    });
    for (li = 0; li < shapeGeom.lines.length; li++) {
      mesh = strokeExtrude.build(shapeGeom.lines[li]);
      strokeMeshes.push(mesh);
      n += mesh.cells.length;
    }
  }

  triangles = new Float32Array(n * 3 * 3);
  colors = new Float32Array(n * 3 * 4);

  if (fill) {
    c = color(context, item, item.fill);
    for (i = 0, len = st.length; i < len; i += 3) {
      triangles[i    ] = st[i    ];
      triangles[i + 1] = st[i + 1];
      triangles[i + 2] = st[i + 2];
    }
    for (i = 0, len = st.length / 3; i < len; i++) {
      colors[i*4    ] = c[0];
      colors[i*4 + 1] = c[1];
      colors[i*4 + 2] = c[2];
      colors[i*4 + 3] = fillOpacity;
    }
  }

  if (stroke) {
    c = color(context, item, item.stroke);
    i = fill ? st.length / 3 : 0;
    for (li = 0; li < strokeMeshes.length; li++) {
      mesh = strokeMeshes[li],
      mp = mesh.positions,
      mc = mesh.cells,
      mcl = mesh.cells.length;
      for (ci = 0; ci < mcl; ci++) {
        cell = mc[ci];
        p1 = mp[cell[0]];
        p2 = mp[cell[1]];
        p3 = mp[cell[2]];
        triangles[i*3    ] = p1[0];
        triangles[i*3 + 1] = p1[1];
        triangles[i*3 + 2] = z;
        colors[i*4    ] = c[0];
        colors[i*4 + 1] = c[1];
        colors[i*4 + 2] = c[2];
        colors[i*4 + 3] = strokeOpacity;
        i++;

        triangles[i*3    ] = p2[0];
        triangles[i*3 + 1] = p2[1];
        triangles[i*3 + 2] = z;
        colors[i*4    ] = c[0];
        colors[i*4 + 1] = c[1];
        colors[i*4 + 2] = c[2];
        colors[i*4 + 3] = strokeOpacity;
        i++;

        triangles[i*3    ] = p3[0];
        triangles[i*3 + 1] = p3[1];
        triangles[i*3 + 2] = z;
        colors[i*4    ] = c[0];
        colors[i*4 + 1] = c[1];
        colors[i*4 + 2] = c[2];
        colors[i*4 + 3] = strokeOpacity;
        i++;
      }
    }
  }

  triangleBuffer = context.createBuffer();
  context.bindBuffer(context.ARRAY_BUFFER, triangleBuffer);
  context.bufferData(context.ARRAY_BUFFER, triangles, context.STATIC_DRAW);

  colorBuffer = context.createBuffer();
  context.bindBuffer(context.ARRAY_BUFFER, colorBuffer);
  context.bufferData(context.ARRAY_BUFFER, colors, context.STATIC_DRAW);

  val = {
    triangleBuffer: triangleBuffer,
    colorBuffer: colorBuffer,
    numTriangles: n
  };
  if (context._itemCacheSize > 10000) {
    for (v in context._itemCache) {
      if (context._itemCache.hasOwnProperty(v)) {
        context.deleteBuffer(context._itemCache[v].triangleBuffer);
        context.deleteBuffer(context._itemCache[v].colorBuffer);
        context._itemCache[v].deleted = true;
      }
    }
    context._lastColorBuffer = null;
    context._lastTriangleBuffer = null;
    context._itemCache = {};
    context._itemCacheSize = 0;
    console.log('Item geometry cache cleared.');
  }
  context._itemCache[key] = val;
  context._itemCacheSize++;
  return val;
}
