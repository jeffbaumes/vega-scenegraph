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
  var opacity = item.opacity == null ? 1 : item.opacity,
      tg = context._triangleGeometry;

  if (opacity <= 0) return;
  if (item.fill && fill(context, item, opacity, geom.triangles.length / 9)) {
    var tl = geom.triangles.length,
        t = geom.triangles;
    for (var i = 0; i < tl; i++) {
      tg.push(t[i]);
    }
  }

  if (item.stroke) {
    stroke(context, item, opacity, geom.lines, geom.closed, geom.z);
  }
}
