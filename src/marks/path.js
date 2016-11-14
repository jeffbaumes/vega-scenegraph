import boundStroke from '../bound/boundStroke';
import context from '../bound/boundContext';
import pathParse from '../path/parse';
import pathRender from '../path/render';
import geometryForPath from '../path/geometryForPath';
import {drawAll} from '../util/canvas/draw';
import {pickPath} from '../util/canvas/pick';
import translateItem from '../util/svg/translateItem';
import {visit} from '../util/visit';
import {drawGeometry} from '../util/webgl/draw';

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
    var opacity = item.opacity == null ? 1 : item.opacity;
    if (opacity === 0) return;

    var path = item.path;
    if (path == null) return true;

    var geom = geometryForPath(path);

    var x = item.x || 0,
        y = item.y || 0;

    context._tx += x;
    context._ty += y;

    drawGeometry(geom, context, item);

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
