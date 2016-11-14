import boundStroke from '../bound/boundStroke';
import context from '../bound/boundContext';
import {drawOne} from '../util/canvas/draw';
import {hitPath} from '../util/canvas/pick';
import fillGL from '../util/webgl/fill';
import strokeGL from '../util/webgl/stroke';
import pixelsToDisplay from '../util/webgl/pixelsToDisplay';

export default function(type, shape) {

  function attr(emit, item) {
    var items = item.mark.items;
    if (items.length) emit('d', shape(null, items));
  }

  function bound(bounds, mark) {
    var items = mark.items;
    return items.length === 0 ? bounds
      : (shape(context(bounds), items), boundStroke(bounds, items[0]));
  }

  function draw(context, items) {
    context.beginPath();
    shape(context, items);
  }

  var hit = hitPath(draw);

  function pick(context, scene, x, y, gx, gy) {
    var items = scene.items,
        b = scene.bounds;

    if (!items || !items.length || b && !b.contains(gx, gy)) {
      return null;
    }

    if (context.pixelRatio > 1) {
      x *= context.pixelRatio;
      y *= context.pixelRatio;
    }
    return hit(context, items, x, y) ? items[0] : null;
  }

  function drawGL(context, scene, bounds) {
    if (scene.items.length && (!bounds || bounds.intersects(scene.bounds))) {
      var item = scene.items[0],
          opacity = item.opacity == null ? 1 : item.opacity;

      var geom = shape(context, scene.items);

      if (item.fill && fillGL(context, item, opacity, geom.triangles.cells.length)) {
        geom.triangles.cells.forEach(function (cell) {
          var p1 = pixelsToDisplay(context, geom.triangles.positions[cell[0]]);
          var p2 = pixelsToDisplay(context, geom.triangles.positions[cell[1]]);
          var p3 = pixelsToDisplay(context, geom.triangles.positions[cell[2]]);
          context._triangleGeometry.push(p1[0], p1[1], p2[0], p2[1], p3[0], p3[1]);
        });
      }

      if (item.stroke) {
        strokeGL(context, item, opacity, geom.lines, geom.closed);
      }
    }
  }

  return {
    type:   type,
    tag:    'path',
    nested: true,
    attr:   attr,
    bound:  bound,
    draw:   drawOne(draw),
    drawGL: drawGL,
    pick:   pick
  };

}
