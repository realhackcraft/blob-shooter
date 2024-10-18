attribute vec2 a_position;
varying vec2 v_uv;

void main() {
  v_uv = a_position * 0.5 + 0.5; // Normalize to [0, 1]
  gl_Position = vec4(a_position, 0.0, 1.0);
  gl_PointSize = 1.0;
}
