export var WebGL;

export default function(w, h) {
  var canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;

  var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

  // Set clear color to white, fully opaque
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.disable(gl.CULL_FACE);

  // Thanks to https://limnu.com/webgl-blending-youre-probably-wrong/
  gl.disable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  /*=================== Shaders ====================*/

  // Vertex shader source code
  var vertCode =
    'attribute vec2 coordinates;' +
    'attribute vec4 color;' +
    'varying vec4 vColor;' +
    'void main(void) {' +
       ' gl_Position = vec4(coordinates, 0.0, 1.0);' +
       ' vColor = color;' +
    '}';

  // Create a vertex shader object
  var vertShader = gl.createShader(gl.VERTEX_SHADER);

  // Attach vertex shader source code
  gl.shaderSource(vertShader, vertCode);

  // Compile the vertex shader
  gl.compileShader(vertShader);

  if (!gl.getShaderParameter(vertShader, gl.COMPILE_STATUS)) {
    console.log(gl.getShaderInfoLog(vertShader));
  }

  // Fragment shader source code
  var fragCode =
    'precision mediump float;' +
    'varying vec4 vColor;' +
    'void main(void) {' +
      ' gl_FragColor = vColor;' +
    '}';

  // Create fragment shader object
  var fragShader = gl.createShader(gl.FRAGMENT_SHADER);

  // Attach fragment shader source code
  gl.shaderSource(fragShader, fragCode);

  // Compile the fragmentt shader
  gl.compileShader(fragShader);

  if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)) {
    console.log(gl.getShaderInfoLog(fragShader));
  }

  // Create a shader program object to store
  // the combined shader program
  var shaderProgram = gl.createProgram();

  // Attach a vertex shader
  gl.attachShader(shaderProgram, vertShader);

  // Attach a fragment shader
  gl.attachShader(shaderProgram, fragShader);

  // Link both the programs
  gl.linkProgram(shaderProgram);

  // Use the combined shader program object
  gl.useProgram(shaderProgram);

  gl._shaderProgram = shaderProgram;

  return canvas;
}
