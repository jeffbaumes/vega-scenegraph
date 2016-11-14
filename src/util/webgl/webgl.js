export var WebGL;

export default function(w, h) {
  var canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;

  var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

  gl._textCanvas = document.createElement('canvas');
  gl._textCanvas.width = w;
  gl._textCanvas.height = h;
  gl._textContext = gl._textCanvas.getContext('2d');

  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.disable(gl.CULL_FACE);

  // Thanks to https://limnu.com/webgl-blending-youre-probably-wrong/
  gl.disable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  var vertCode =
    'attribute vec2 coordinates;' +
    'attribute vec4 color;' +
    'uniform mat4 matrix;' +
    'varying vec4 vColor;' +
    'void main(void) {' +
       ' gl_Position = matrix * vec4(coordinates, 0.0, 1.0);' +
       ' vColor = color;' +
    '}';
  var vertShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertShader, vertCode);
  gl.compileShader(vertShader);
  if (!gl.getShaderParameter(vertShader, gl.COMPILE_STATUS)) {
    console.log(gl.getShaderInfoLog(vertShader));
  }

  var fragCode =
    'precision mediump float;' +
    'varying vec4 vColor;' +
    'void main(void) {' +
      ' gl_FragColor = vColor;' +
    '}';
  var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragShader, fragCode);
  gl.compileShader(fragShader);
  if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)) {
    console.log(gl.getShaderInfoLog(fragShader));
  }

  var shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertShader);
  gl.attachShader(shaderProgram, fragShader);
  gl.linkProgram(shaderProgram);
  gl.useProgram(shaderProgram);
  gl._shaderProgram = shaderProgram;
  gl._coordLocation = gl.getAttribLocation(gl._shaderProgram, 'coordinates');
  gl._colorLocation = gl.getAttribLocation(gl._shaderProgram, 'color');
  gl._matrixLocation = gl.getUniformLocation(gl._shaderProgram, 'matrix');

// -------------------------------------------------------------------------
// BEGIN: Adapted from https://github.com/greggman/webgl-fundamentals
//
// BSD license follows:
//
// # Copyright 2012, Gregg Tavares.
// # All rights reserved.
// #
// # Redistribution and use in source and binary forms, with or without
// # modification, are permitted provided that the following conditions are
// # met:
// #
// #     * Redistributions of source code must retain the above copyright
// # notice, this list of conditions and the following disclaimer.
// #     * Redistributions in binary form must reproduce the above
// # copyright notice, this list of conditions and the following disclaimer
// # in the documentation and/or other materials provided with the
// # distribution.
// #     * Neither the name of Gregg Tavares. nor the names of his
// # contributors may be used to endorse or promote products derived from
// # this software without specific prior written permission.
// #
// # THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// # "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// # LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
// # A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
// # OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// # SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
// # LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// # DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
// # THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// # (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// # OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

  var vertCode =
    'attribute vec2 a_position;' +
    'attribute vec2 a_texcoord;' +
    'uniform mat4 u_matrix;' +
    'varying vec2 v_texcoord;' +
    'void main() {' +
    '  gl_Position = u_matrix * vec4(a_position, 0.0, 1.0);' +
    '  v_texcoord = a_texcoord;' +
    '}';
  var vertShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertShader, vertCode);
  gl.compileShader(vertShader);
  if (!gl.getShaderParameter(vertShader, gl.COMPILE_STATUS)) {
    console.log(gl.getShaderInfoLog(vertShader));
  }

  var fragCode =
    'precision mediump float;' +
    'varying vec2 v_texcoord;' +
    'uniform sampler2D u_texture;' +
    'void main() {' +
    '  gl_FragColor = texture2D(u_texture, v_texcoord);' +
    '}';
  var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragShader, fragCode);
  gl.compileShader(fragShader);
  if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)) {
    console.log(gl.getShaderInfoLog(fragShader));
  }

  var shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertShader);
  gl.attachShader(shaderProgram, fragShader);
  gl.linkProgram(shaderProgram);

  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  var positions = [
    0, 0,
    0, 1,
    1, 0,
    1, 0,
    0, 1,
    1, 1,
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  var texcoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
  var texcoords = [
    0, 0,
    0, 1,
    1, 0,
    1, 0,
    0, 1,
    1, 1,
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW);

  gl._imageShaderProgram = shaderProgram;
  gl._imagePositionLocation = gl.getAttribLocation(gl._imageShaderProgram, 'a_position');
  gl._imageTexcoordLocation = gl.getAttribLocation(gl._imageShaderProgram, 'a_texcoord');
  gl._imageMatrixLocation = gl.getUniformLocation(gl._imageShaderProgram, 'u_matrix');
  gl._imageTextureLocation = gl.getUniformLocation(gl._imageShaderProgram, 'u_texture');
  gl._imagePositionBuffer = positionBuffer;
  gl._imageTexcoordBuffer = texcoordBuffer;

// END: Adapted from https://github.com/greggman/webgl-fundamentals
// -------------------------------------------------------------------------

  return canvas;
}
