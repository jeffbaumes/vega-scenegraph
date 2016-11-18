import boundStroke from '../bound/boundStroke';
import context from '../bound/boundContext';
import pathParse from '../path/parse';
import pathRender from '../path/render';
import {drawAll} from '../util/canvas/draw';
import {pickPath} from '../util/canvas/pick';
import translateItem from '../util/svg/translateItem';
import {visit} from '../util/visit';
import drawGeometry from '../util/webgl/drawGeometry';
import geometryForPath from '../path/geometryForPath';
import geometryForItem from '../path/geometryForItem';

function attr(emit, item) {
  emit('transform', translateItem(item));
  emit('d', item.path);
}

function path(context, item) {
  var path = item.path;
  if (path == null) return true;

  var cache = item.pathCache;
  if (!cache || cache.path !== path) {
    (item.pathCache = cache = pathParse(path)).path = path;
  }
  pathRender(context, cache, item.x, item.y);
}

function drawGL(context, scene, bounds) {
  visit(scene, function(item) {
    var path = item.path;
    if (path == null) return true;

    var x = item.x || 0,
        y = item.y || 0;

    context._tx += x;
    context._ty += y;

    if (context._fullRedraw || item._dirty || !item._geom) {
      if (item._geom) {
        context.deleteBuffer(item._geom.triangleBuffer);
        context.deleteBuffer(item._geom.colorBuffer);
      }
      var shapeGeom = geometryForPath(context, path);
      item._geom = geometryForItem(context, item, shapeGeom);
    }
    drawGeometry(item._geom, context, item);

    context._tx -= x;
    context._ty -= y;
  });
}

function bound(bounds, item) {
  return path(context(bounds), item)
    ? bounds.set(0, 0, 0, 0)
    : boundStroke(bounds, item);
}

export default {
  type:   'path',
  tag:    'path',
  nested: false,
  attr:   attr,
  bound:  bound,
  draw:   drawAll(path),
  drawGL: drawGL,
  pick:   pickPath(path)
};
