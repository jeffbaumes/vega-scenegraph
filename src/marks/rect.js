import boundStroke from '../bound/boundStroke';
import {rectangle, rectangleGL} from '../path/shapes';
import {drawAll} from '../util/canvas/draw';
import {pickPath} from '../util/canvas/pick';
import {visit} from '../util/visit';
import drawGeometry from '../util/webgl/drawGeometry';
import geometryForItem from '../path/geometryForItem';

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

function drawGL(context, scene, bounds) {
  visit(scene, function(item) {
    if (bounds && !bounds.intersects(item.bounds)) return; // bounds check

    var x = item.x || 0,
        y = item.y || 0;

    context._tx += x;
    context._ty += y;

    if (context._fullRedraw || item._dirty || !item._geom || item._geom.deleted) {
      var shapeGeom = rectangleGL(context, item);
      item._geom = geometryForItem(context, item, shapeGeom);
    }
    drawGeometry(item._geom, context, item);

    context._tx -= x;
    context._ty -= y;
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
