export default function(geom, gl, item) {
  var opacity = item.opacity == null ? 1 : item.opacity;
  if (opacity <= 0) return;
  if (geom.numTriangles === 0) return;

  gl.bindBuffer(gl.ARRAY_BUFFER, geom.triangleBuffer);
  gl.vertexAttribPointer(gl._coordLocation, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(gl._coordLocation);

  gl.bindBuffer(gl.ARRAY_BUFFER, geom.colorBuffer);
  gl.vertexAttribPointer(gl._colorLocation, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(gl._colorLocation);

  gl.drawArrays(gl.TRIANGLES, 0, geom.numTriangles * 3);
}
