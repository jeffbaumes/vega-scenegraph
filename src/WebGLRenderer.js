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
import {perspective, rotateX, rotateY, rotateZ, multiply, translate as translateGL} from './util/webgl/matrix';

export default function WebGLRenderer(imageLoader) {
  Renderer.call(this, imageLoader);
  this._redraw = false;
  this._angleX = 0;
  this._angleY = 0;
  this._angleZ = 0;
  this._translateX = 0;
  this._translateY = 0;
  this._translateZ = 0;
  this._zFactor = 0;
  this._depthTest = false;
  this._randomZ = false;
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

prototype.rotate = function(x, y, z) {
  this._angleX = x;
  this._angleY = y;
  this._angleZ = z;
  return this;
};

prototype.translate = function(x, y, z) {
  this._translateX = x;
  this._translateY = y;
  this._translateZ = z;
  return this;
};

prototype.zFactor = function(z) {
  this._zFactor = z;
  return this;
};

prototype.depthTest = function(val) {
  this._depthTest = val;
  return this;
};

prototype.randomZ = function(val) {
  this._randomZ = val;
  return this;
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
      b, i;

  gl._tx = 0;
  gl._ty = 0;
  gl._triangleGeometry = [];
  gl._triangleColor = [];
  gl._images = [];
  gl._randomZ = this._randomZ;

  b = (!items || this._redraw)
    ? (this._redraw = false, null)
    : clipToBounds(gl, items);

  if (items) {
    for (i = 0; i < items.length; i++) {
      items[i]._dirty = true;
    }
  } else {
    gl._fullRedraw = true;
  }
  // console.log((items ? items.length : 'null') + ' dirty items.');

  this.draw(gl, scene, b);

  var imgInfo = loadImageAndCreateTextureInfo(gl, gl._textCanvas);
  imgInfo.x = 0;
  imgInfo.y = 0;
  imgInfo.w = gl.canvas.width / gl._ratio;
  imgInfo.h = gl.canvas.height / gl._ratio;
  gl._images.push(imgInfo);

  this._triangleBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this._triangleBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(gl._triangleGeometry), gl.STATIC_DRAW);

  this._triangleColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this._triangleColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(gl._triangleColor), gl.STATIC_DRAW);

  // console.log(gl._triangleGeometry.length/3 + ' triangles.');

  this.frame();

  if (items) {
    for (i = 0; i < items.length; i++) {
      items[i]._dirty = false;
    }
  }
  gl._fullRedraw = false;

  return this;
};

prototype.frame = function() {
  var gl = this.context();

  this.clear();

  gl.useProgram(gl._shaderProgram);

  gl.bindBuffer(gl.ARRAY_BUFFER, this._triangleBuffer);
  gl.vertexAttribPointer(gl._coordLocation, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(gl._coordLocation);

  gl.bindBuffer(gl.ARRAY_BUFFER, this._triangleColorBuffer);
  gl.vertexAttribPointer(gl._colorLocation, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(gl._colorLocation);

  var width = gl.canvas.width / gl._ratio;
  var height = gl.canvas.height / gl._ratio;

  var smooshMatrix = [
    2/width, 0, 0, 0,
    0, -2/width, 0, 0,
    0, 0, 1, 0,
    -1, height/width, 0, 1
  ];

  var matrix = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ];

  if (this._depthTest) {
    gl.enable(gl.DEPTH_TEST);
  } else {
    gl.disable(gl.DEPTH_TEST);
  }

  matrix = multiply(matrix, perspective(Math.PI/2, width/height, 0.1, 3000));
  matrix = multiply(matrix, translateGL(this._translateX, this._translateY, (this._translateZ - 1)*height/width));
  matrix = multiply(matrix, rotateZ(this._angleZ));
  matrix = multiply(matrix, rotateY(this._angleY));
  matrix = multiply(matrix, rotateX(this._angleX));
  matrix = multiply(matrix, translateGL(0, 0, 1));
  matrix = multiply(matrix, smooshMatrix);

  gl.uniform1f(gl._zFactorLocation, this._zFactor);
  gl.uniformMatrix4fv(gl._matrixLocation, false, matrix);
  gl.drawArrays(gl.TRIANGLES, 0, gl._triangleGeometry.length / 3);

  gl._images.forEach(function(texInfo) {
    drawImage(gl, texInfo, matrix);
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
