import fill from './fill';
import stroke from './stroke';
import {visit} from '../visit';

export function drawAll(path) {
  return function(context, scene, bounds) {
    visit(scene, function(item) {
      if (!bounds || bounds.intersects(item.bounds)) {
        drawPath(path, context, item, item);
      }
    });
  };
}

export function drawOne(path) {
  return function(context, scene, bounds) {
    if (scene.items.length && (!bounds || bounds.intersects(scene.bounds))) {
      drawPath(path, context, scene.items[0], scene.items);
    }
  };
}

function drawPath(path, context, item, items) {
  var opacity = item.opacity == null ? 1 : item.opacity;
  if (opacity === 0) return;

  if (path(context, items)) return;

  if (item.fill && fill(context, item, opacity)) {
    context.fill();
  }

  if (item.stroke && stroke(context, item, opacity)) {
    context.stroke();
  }
}

export function drawGeometry(geom, context, item) {
  var opacity = item.opacity == null ? 1 : item.opacity, i,
      tg = context._triangleGeometry,
      tc = context._triangleColor,
      tl = geom.triangles.length,
      t = geom.triangles,
      cl = geom.colors.length,
      c = geom.colors;

  if (opacity <= 0) return;

  for (i = 0; i < tl; i++) {
    tg.push(t[i]);
  }
  for (i = 0; i < cl; i++) {
    tc.push(c[i]);
  }
}
