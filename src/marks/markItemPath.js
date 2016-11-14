import boundStroke from '../bound/boundStroke';
import context from '../bound/boundContext';
import {drawAll} from '../util/canvas/draw';
import {pickPath} from '../util/canvas/pick';
import translateItem from '../util/svg/translateItem';
import {visit} from '../util/visit';
import fillGL from '../util/webgl/fill';
import strokeGL from '../util/webgl/stroke';
import pixelsToDisplay from '../util/webgl/pixelsToDisplay';

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
      console.log(item);
      if (bounds && !bounds.intersects(item.bounds)) return; // bounds check
      var opacity = item.opacity == null ? 1 : item.opacity;
      var geom = shape(context, item);

      var x = item.x || 0,
          y = item.y || 0;

      context._tx += x;
      context._ty += y;

      if (item.fill && fillGL(context, item, opacity, geom.triangles.cells.length)) {
        geom.triangles.cells.forEach(function (cell) {
          var p1 = pixelsToDisplay(context, geom.triangles.positions[cell[0]]);
          var p2 = pixelsToDisplay(context, geom.triangles.positions[cell[1]]);
          var p3 = pixelsToDisplay(context, geom.triangles.positions[cell[2]]);
          context._triangleGeometry.push(p1[0], p1[1], p2[0], p2[1], p3[0], p3[1]);
        });
      }

      if (item.stroke) {
        console.log(geom.lines);
        strokeGL(context, item, opacity, geom.lines, geom.closed);
      }

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
