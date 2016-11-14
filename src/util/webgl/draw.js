import fill from './fill';
import stroke from './stroke';
import pixelsToDisplay from './pixelsToDisplay';
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
  var opacity = item.opacity == null ? 1 : item.opacity;
  if (opacity <= 0) return;
  if (item.fill && fill(context, item, opacity, geom.triangles.cells.length)) {
    geom.triangles.cells.forEach(function (cell) {
      var p1 = pixelsToDisplay(context, geom.triangles.positions[cell[0]]);
      var p2 = pixelsToDisplay(context, geom.triangles.positions[cell[1]]);
      var p3 = pixelsToDisplay(context, geom.triangles.positions[cell[2]]);
      context._triangleGeometry.push(p1[0], p1[1], p2[0], p2[1], p3[0], p3[1]);
    });
  }

  if (item.stroke) {
    stroke(context, item, opacity, geom.lines, geom.closed);
  }
}
