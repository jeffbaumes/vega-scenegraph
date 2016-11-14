import boundStroke from '../bound/boundStroke';
import {rectangle} from '../path/shapes';
import {drawAll} from '../util/canvas/draw';
import {pickPath} from '../util/canvas/pick';
import {visit} from '../util/visit';
import {drawGeometry} from '../util/webgl/draw';

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
  drawGeometry(geom, context, item);
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
