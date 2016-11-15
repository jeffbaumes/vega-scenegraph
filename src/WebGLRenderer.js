import Renderer from './Renderer';
import Bounds from './Bounds';
import marks from './marks/index';

import inherits from './util/inherits';
import {clear} from './util/dom';
import WebGL from './util/webgl/webgl';
import resize from './util/webgl/resize';
import color from './util/webgl/color';
import {drawImage} from './util/webgl/image';
import {loadImageAndCreateTextureInfo} from './util/webgl/image';

export default function WebGLRenderer(imageLoader) {
  Renderer.call(this, imageLoader);
  this._redraw = false;
}

var prototype = inherits(WebGLRenderer, Renderer),
    base = Renderer.prototype,
    tempBounds = new Bounds();

prototype.initialize = function(el, width, height, origin) {
  this._canvas = WebGL(1, 1); // instantiate a small canvas
  if (el) {
    clear(el, 0).appendChild(this._canvas);
    this._canvas.setAttribute('class', 'marks');
  }
  // this method will invoke resize to size the canvas appropriately
  return base.initialize.call(this, el, width, height, origin);
};

prototype.resize = function(width, height, origin) {
  base.resize.call(this, width, height, origin);
  resize(this._canvas, this._width, this._height, this._origin);
  return this._redraw = true, this;
};

prototype.canvas = function() {
  return this._canvas;
};

prototype.context = function() {
  return this._canvas ? (
    this._canvas.getContext('webgl') ||
    this._canvas.getContext('experimental-webgl'))
    : null;
};

function clipToBounds(g, items) {
  // TODO: do something here?
}

function translate(bounds, group) {
  if (group == null) return bounds;
  var b = tempBounds.clear().union(bounds);
  for (; group != null; group = group.mark.group) {
    b.translate(group.x || 0, group.y || 0);
  }
  return b;
}

prototype._render = function(scene, items) {
  var gl = this.context(),
      o = this._origin,
      w = this._width,
      h = this._height,
      b;

  // TODO: Should we save the gl state?
  gl._tx = 0;
  gl._ty = 0;
  gl._triangleGeometry = [];
  gl._triangleColor = [];
  gl._images = [];

  b = (!items || this._redraw)
    ? (this._redraw = false, null)
    : clipToBounds(gl, items);

  this.clear();

  this.draw(gl, scene, b);

  gl.useProgram(gl._shaderProgram);

  var triangleBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(gl._triangleGeometry), gl.STATIC_DRAW);
  gl.vertexAttribPointer(gl._coordLocation, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(gl._coordLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  var triangleColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(gl._triangleColor), gl.STATIC_DRAW);
  gl.vertexAttribPointer(gl._colorLocation, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(gl._colorLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  var width = gl.canvas.width / gl._ratio;
  var height = gl.canvas.height / gl._ratio;

  var matrix = [
    2/width, 0, 0, 0,
    0, -2/height, 0, 0,
    0, 0, 1, 0,
    -1, 1, 0, 1
  ];
  gl.uniformMatrix4fv(gl._matrixLocation, false, matrix);

  gl.drawArrays(gl.TRIANGLES, 0, gl._triangleGeometry.length / 2);

  var imgInfo = loadImageAndCreateTextureInfo(gl, gl._textCanvas);
  imgInfo.x = 0;
  imgInfo.y = 0;
  imgInfo.w = gl.canvas.width / gl._ratio;
  imgInfo.h = gl.canvas.height / gl._ratio;
  gl._images.push(imgInfo);

  gl._images.forEach(function(texInfo) {
    drawImage(gl, texInfo);
  });

  return this;
};

prototype.draw = function(ctx, scene, bounds) {
  var mark = marks[scene.marktype];
  if (mark.drawGL) {
    mark.drawGL.call(this, ctx, scene, bounds);
  }
};

prototype.clear = function(x, y, w, h) {
  var gl = this.context(), c;
  if (this._bgcolor != null) {
    c = color(gl, null, this._bgcolor);
    gl.clearColor(c[0], c[1], c[2], 1.0);
  } else {
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
  }
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl._textContext.save();
  gl._textContext.setTransform(1, 0, 0, 1, 0, 0);
  gl._textContext.clearRect(0, 0, gl._textCanvas.width, gl._textCanvas.height);
  gl._textContext.restore();
};
