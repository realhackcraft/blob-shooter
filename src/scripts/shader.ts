let gl: WebGLRenderingContext;
let program: WebGLProgram;
let positionBuffer;
let texture: WebGLTexture;

export function loadShader(enableRetinaResolution: boolean) {
  window.addEventListener("load", setupWebGL, false);

  function setupWebGL(evt: Event) {
    window.removeEventListener(evt.type, setupWebGL, false);
    const glcanvas: HTMLCanvasElement = document.getElementById(
      "glcanvas",
    ) as HTMLCanvasElement;
    gl = glcanvas.getContext("webgl") as WebGLRenderingContext;

    const scale = enableRetinaResolution ? window.devicePixelRatio : 1;
    const canvasWidth = window.innerWidth;
    const canvasHeight = window.innerHeight;

    glcanvas.width = canvasWidth * scale;
    glcanvas.height = canvasHeight * scale;
    glcanvas.style.width = canvasWidth + "px";
    glcanvas.style.height = canvasHeight + "px";

    gl.viewport(0, 0, glcanvas.width, glcanvas.height);

    // Initialize shaders
    initShaders();
    initBuffers();

    // Create texture
    const canvas: HTMLCanvasElement = document.getElementById(
      "canvas",
    ) as HTMLCanvasElement; // Your 2D canvas element
    texture = createTexture(canvas);
  }

  function initShaders() {
    Promise.all([
      fetch("assets/shader/crt.vert"),
      fetch("assets/shader/crt.frag"),
    ])
      .then((responses) =>
        Promise.all(responses.map((response) => response.text())),
      )
      .then((data) => {
        const [vertexShaderSource, fragmentShaderSource] = data;

        const vertexShader: WebGLShader = gl.createShader(
          gl.VERTEX_SHADER,
        ) as WebGLShader;
        gl.shaderSource(vertexShader, vertexShaderSource);
        gl.compileShader(vertexShader);

        const fragmentShader: WebGLShader = gl.createShader(
          gl.FRAGMENT_SHADER,
        ) as WebGLShader;
        gl.shaderSource(fragmentShader, fragmentShaderSource);
        gl.compileShader(fragmentShader);

        program = gl.createProgram() as WebGLProgram;
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        gl.useProgram(program);
      });
  }

  function initBuffers() {
    positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = new Float32Array([-1, 1, 1, 1, -1, -1, 1, -1]);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
  }

  function createTexture(canvas: HTMLCanvasElement) {
    const texture = gl.createTexture() as WebGLTexture;
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

  // Optionally, you can call updateTexture() after drawing to the 2D canvas
}

export function render(iTime: number) {
  updateTexture();
  // Clear the WebGL canvas
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Bind the texture
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set uniforms
  const resolutionLocation = gl.getUniformLocation(program, "iResolution");
  const timeLocation = gl.getUniformLocation(program, "iTime");

  gl.uniform3f(resolutionLocation, gl.canvas.width, gl.canvas.height, 0);
  gl.uniform1f(timeLocation, iTime);

  // Set up the position attribute once (not in every frame)
  const positionLocation = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  // Draw the geometry
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

// Call this function whenever you update the 2D canvas
function updateTexture() {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement; // Your 2D canvas element
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
}
