export var devicePixelRatio = typeof window !== 'undefined'
  ? window.devicePixelRatio || 1 : 1;

export default function(canvas, width, height, origin) {
  var scale = typeof HTMLElement !== 'undefined'
    && canvas instanceof HTMLElement
    && canvas.parentNode != null;

  var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl'),
      ratio = scale ? devicePixelRatio : 1;

  canvas.width = width * ratio;
  canvas.height = height * ratio;

  if (ratio !== 1) {
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
  }

  gl.lineWidth(ratio);

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  gl._origin = origin;
  gl._ratio = ratio;

  return canvas;
}
