import boundStroke from '../bound/boundStroke';
import {rectangle} from '../path/shapes';
import {drawAll} from '../util/canvas/draw';
import {pickPath} from '../util/canvas/pick';
import {visit} from '../util/visit';
import fillGL from '../util/webgl/fill';
import strokeGL from '../util/webgl/stroke';
import pixelsToDisplay from '../util/webgl/pixelsToDisplay';

function attr(emit, item) {
  emit('d', rectangle(null, item));
}

function bound(bounds, item) {
  var x, y;
  return boundStroke(bounds.set(
    x = item.x || 0,
    y = item.y || 0,
    (x + item.width) || 0,
    (y + item.height) || 0
  ), item);
}

function draw(context, item) {
  context.beginPath();
  rectangle(context, item);
}

function pathGL(context, item, opacity) {
  var geom = rectangle(context, item);

  if (item.fill && fillGL(context, item, opacity, geom.triangles.cells.length)) {
    geom.triangles.cells.forEach(function (cell) {
      var p1 = pixelsToDisplay(context, geom.triangles.positions[cell[0]]);
      var p2 = pixelsToDisplay(context, geom.triangles.positions[cell[1]]);
      var p3 = pixelsToDisplay(context, geom.triangles.positions[cell[2]]);
      context._triangleGeometry.push(p1[0], p1[1], p2[0], p2[1], p3[0], p3[1]);
    });
  }

  if (item.stroke) {
    strokeGL(context, item, opacity, geom.lines, true);
  }

  return true;
}

function drawGL(context, scene, bounds) {
  visit(scene, function(item) {
    if (bounds && !bounds.intersects(item.bounds)) return; // bounds check
    var opacity = item.opacity == null ? 1 : item.opacity;
    pathGL(context, item, opacity);
  });
}

export default {
  type:   'rect',
  tag:    'path',
  nested: false,
  attr:   attr,
  bound:  bound,
  draw:   drawAll(draw),
  drawGL: drawGL,
  pick:   pickPath(draw)
};
