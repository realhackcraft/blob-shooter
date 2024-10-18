window.addEventListener("load", setupWebGL, false);
let gl, program;
let positionBuffer;
let texture;

function setupWebGL(evt) {
  window.removeEventListener(evt.type, setupWebGL, false);
  const glcanvas = document.getElementById("glcanvas");
  gl = glcanvas.getContext("webgl");

  // Resize canvas to display size
  glcanvas.width = window.innerWidth;
  glcanvas.height = window.innerHeight;

  // Initialize shaders
  initShaders();
  initBuffers();

  // Create texture
  const canvas = document.getElementById("canvas"); // Your 2D canvas element
  texture = createTexture(canvas);
}

function initShaders() {
  const vertexShaderSource =
    document.querySelector("#vertex-shader").textContent;
  const fragmentShaderSource =
    document.querySelector("#fragment-shader").textContent;

  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexShaderSource);
  gl.compileShader(vertexShader);

  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fragmentShaderSource);
  gl.compileShader(fragmentShader);

  program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.useProgram(program);
}

function initBuffers() {
  positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  // Flip Y coordinates: -1, 1 instead of 1, -1
  const positions = new Float32Array([-1, 1, 1, 1, -1, -1, 1, -1]);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
}

function createTexture(canvas) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Setup the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  // Upload the canvas data to the texture
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);

  return texture;
}

function render(iTime) {
  // Clear the WebGL canvas
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Bind the texture
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set uniforms
  const resolutionLocation = gl.getUniformLocation(program, "iResolution");
  const timeLocation = gl.getUniformLocation(program, "iTime");

  gl.uniform3f(resolutionLocation, gl.canvas.width, gl.canvas.height, 0);
  gl.uniform1f(timeLocation, iTime);

  // Bind the position buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  const positionLocation = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  // Draw the geometry
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

// Call this function whenever you update the 2D canvas
function updateTexture() {
  const canvas = document.getElementById("canvas"); // Your 2D canvas element
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
}

// Optionally, you can call updateTexture() after drawing to the 2D canvas
