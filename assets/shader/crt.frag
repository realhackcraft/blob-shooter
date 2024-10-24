precision mediump float;

// Uniforms
uniform vec3 iResolution; // viewport resolution (in pixels)
uniform float iTime; // shader playback time (in seconds)
uniform sampler2D iChannel0; // input channel 0

// Function to modify UV coordinates
vec2 curve(vec2 uv) {
    uv = (uv - 0.5) * 2.0;
    uv *= 1.1;
    uv.x *= 1.0 + pow((abs(uv.y) / 5.0), 2.0);
    uv.y *= 1.0 + pow((abs(uv.x) / 4.0), 2.0);
    uv = (uv / 2.0) + 0.5;
    uv = uv * 0.92 + 0.04;
    return uv;
}

// Main image function
void main() {
    vec2 uv = gl_FragCoord.xy / iResolution.xy; // Normalized coordinates

    // Flip uv vertically because webgl renders (0, 0) at bottom left
    uv.y = 1.0 - uv.y;
    uv = curve(uv); // Apply the curve transformation

    // Sample the texture
    vec3 col;

    // Create some dynamic animation based on time
    float x = sin(0.3 * iTime + uv.y * 21.0) * sin(0.7 * iTime + uv.y * 29.0) * sin(0.3 + 0.33 * iTime + uv.y * 31.0) * 0.0017;

    // Chromatic abberation
    col.r = texture2D(iChannel0, vec2(x + uv.x + 0.0005, uv.y + 0.0004)).x + 0.05;
    col.g = texture2D(iChannel0, vec2(x + uv.x, uv.y - 0.0005)).y + 0.05;
    col.b = texture2D(iChannel0, vec2(x + uv.x - 0.0005, uv.y)).z + 0.05;

    // Additional chromatic abberation dimmer but farther away
    col.r += 0.05 * texture2D(iChannel0, 0.75 * vec2(x + 0.025, -0.027) + vec2(uv.x + 0.001, uv.y + 0.001)).x;
    col.g += 0.02 * texture2D(iChannel0, 0.75 * vec2(x - 0.022, -0.02) + vec2(uv.x, uv.y - 0.002)).y;
    col.b += 0.05 * texture2D(iChannel0, 0.75 * vec2(x - 0.02, -0.018) + vec2(uv.x - 0.002, uv.y)).z;

    // Color adjustment
    col = clamp(col * 0.6 + 0.4 * col * col * 1.0, 0.0, 1.0);

    // Vignetting effect
    float vig = (0.0 + 1.0 * 16.0 * uv.x * uv.y * (1.0 - uv.x) * (1.0 - uv.y));
    col *= vec3(pow(vig, 0.3));

    // Apply some color correction
    col *= vec3(0.95, 1.05, 0.95);
    col *= 2.8;

    // Scanlines effect
    float scans = clamp(0.35 + 0.35 * sin(3.5 * iTime + uv.y * iResolution.y * 1.5), 0.0, 1.0);
    float s = pow(scans, 1.7);
    col *= vec3(0.4 + 0.7 * s);

    // Final adjustments
    col *= 1.0 + 0.01 * sin(110.0 * iTime);
    if (uv.x < 0.0 || uv.x > 1.0) col *= 0.0;
    if (uv.y < 0.0 || uv.y > 1.0) col *= 0.0;

    col *= 1.0 - 0.65 * vec3(clamp((mod(gl_FragCoord.x, 2.0) - 1.0) * 2.0, 0.0, 1.0));

    // Output final color
    gl_FragColor = vec4(col, 1.0);
}
