import boundStroke from '../bound/boundStroke';
import context from '../bound/boundContext';
import {drawAll} from '../util/canvas/draw';
import {pickPath} from '../util/canvas/pick';
import translateItem from '../util/svg/translateItem';
import {visit} from '../util/visit';
import drawGeometry from '../util/webgl/drawGeometry';
import geometryForItem from '../path/geometryForItem';
import geometryForShape from '../path/geometryForShape';

export default function(type, shape) {

  function attr(emit, item) {
    emit('transform', translateItem(item));
    emit('d', shape(null, item));
  }

  function bound(bounds, item) {
    shape(context(bounds), item);
    return boundStroke(bounds, item)
      .translate(item.x || 0, item.y || 0);
  }

  function draw(context, item) {
    var x = item.x || 0,
        y = item.y || 0;
    context.translate(x, y);
    context.beginPath();
    shape(context, item);
    context.translate(-x, -y);
  }

  function drawGL(context, scene, bounds) {
    visit(scene, function(item) {
      if (bounds && !bounds.intersects(item.bounds)) return; // bounds check

      var x = item.x || 0,
          y = item.y || 0,
          i, shapeGeom;

      context._tx += x;
      context._ty += y;

      if (context._fullRedraw || item._dirty || !item._geom || item._geom.deleted) {
        shapeGeom = shape(context, item);
        item._geom = geometryForItem(context, item, shapeGeom);
      }
      drawGeometry(item._geom, context, item);

      context._tx -= x;
      context._ty -= y;
    });
  }

  return {
    type:   type,
    tag:    'path',
    nested: false,
    attr:   attr,
    bound:  bound,
    draw:   drawAll(draw),
    drawGL: drawGL,
    pick:   pickPath(draw)
  };

}
