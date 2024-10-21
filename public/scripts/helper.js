/**
 * The randomNumber function returns a random number between the specified
 * minimum and maximum values.
 *
 *
 * @param {number} min Set the lower limit of the random number generated
 * @param {number} max Set the upper limit of the random number generated
 *
 * @return {number} A random number between the min and max that are passed
 * into it
 *
 * @author Hackcraft_
 */
function randomNumber(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * @param {number} min
 * @param {number} max
 * @returns {number} A random integer between min (inclusive) and max
 * (inclusive).
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 * @author Hackcraft_
 */
function randomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function chooseRandom(list) {
  return list[randomInt(0, list.length - 1)];
}

/**
 * The distance function returns the distance between two points.
 *
 *
 * @param a An object with the properties x and y
 * @param b An object with the properties x and y
 *
 * @return The distance between the two points
 *
 * @author Hackcraft_
 */
function distance(a = { x, y }, b = { x, y }) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/**
 * The angleBetween function returns the angle between two points.
 *
 *
 * @param a An object with the properties x and y
 * @param b An object with the properties x and y
 *
 * @return The angle between two points relative to the x axis
 *
 * @author Hackcraft_
 */
function angleBetween(a = { x, y }, b = { x, y }) {
  return Math.atan2(a.y - b.y, a.x - b.x);
}

/**
 * Calculates if the provided position is entirely off the screen of the canvas
 * @param pos the position of the entity with the properties of x and y
 * @param {number} width The width of the entity (or the radius)
 * @param {number} height The height of the entity (or the radius)
 *
 * @returns {boolean} Is the point off the canvas?
 *
 * @author Hackcraft_
 */
function isOffScreen(pos = { x, y }, width, height) {
  return (
    pos.x + width < canvasEdges.left ||
    pos.x - width > canvasEdges.right ||
    pos.y + height < canvasEdges.top ||
    pos.y - height > canvasEdges.bottom
  );
}

/**
 * The randomEnemyColor function returns a random color for the enemy.
 *
 * @return {string} A random color
 *
 * @author Hackcraft_
 */
function randomEnemyColor() {
  return hsluvToHex(Math.random() * 360, 50, 50);
}

/**
 * The initLocalStorageIfNull function is used
 * to initialize a local storage item if it has not yet been initialized.
 *
 * @param name The name of the localStorage item
 * @param initVal Initialize the local storage value
 * if it is not yet initialized (null)
 *
 * @return The value of the local storage item if it exists,
 * otherwise it returns the parameter initVal
 *
 * @author Hackcraft_
 */
function initLocalStorageIfNull(name, initVal) {
  return localStorage.getItem(name) === null
    ? localStorage.setItem(name, initVal)
    : localStorage.getItem(name);
}
// Conversion constants
const m = [
  [3.240969941904521, -1.537383177570093, -0.498610760293],
  [-0.96924363628087, 1.87596750150772, 0.041555057407175],
  [0.055630079696993, -0.20397695888897, 1.056971514242878],
];

const epsilon = 0.0088564516;
const kappa = 903.2962962;

// Function to convert from HSLuv to LCH
function hsluvToLch(H, S, L) {
  if (L > 99.9999999 || L < 0.00000001) {
    return [L, 0, H]; // Edge case for very high or low lightness
  }

  const maxChroma = maxChromaForLH(L, H);
  const C = (maxChroma / 100) * S;
  return [L, C, H];
}

// Function to convert from LCH to LAB
function lchToLab([L, C, H]) {
  const hRad = (H / 360) * 2 * Math.PI;
  const a = Math.cos(hRad) * C;
  const b = Math.sin(hRad) * C;
  return [L, a, b];
}

// Function to convert from LAB to XYZ
function labToXyz([L, a, b]) {
  const y = (L + 16) / 116;
  const x = a / 500 + y;
  const z = y - b / 200;

  const x3 = Math.pow(x, 3);
  const z3 = Math.pow(z, 3);

  const X = 0.95047 * (x3 > epsilon ? x3 : (x - 16 / 116) / 7.787);
  const Y =
    1.0 * (L > kappa * epsilon ? Math.pow((L + 16) / 116, 3) : L / kappa);
  const Z = 1.08883 * (z3 > epsilon ? z3 : (z - 16 / 116) / 7.787);

  return [X, Y, Z];
}

// Function to convert from XYZ to linear RGB
function xyzToLinearRgb([X, Y, Z]) {
  const r = m[0][0] * X + m[0][1] * Y + m[0][2] * Z;
  const g = m[1][0] * X + m[1][1] * Y + m[1][2] * Z;
  const b = m[2][0] * X + m[2][1] * Y + m[2][2] * Z;
  return [r, g, b];
}

// Function to convert linear RGB to standard RGB
function linearRgbToRgb([r, g, b]) {
  return [
    r <= 0.0031308 ? 12.92 * r : 1.055 * Math.pow(r, 1 / 2.4) - 0.055,
    g <= 0.0031308 ? 12.92 * g : 1.055 * Math.pow(g, 1 / 2.4) - 0.055,
    b <= 0.0031308 ? 12.92 * b : 1.055 * Math.pow(b, 1 / 2.4) - 0.055,
  ];
}

// Helper function: clamp RGB values between 0 and 1
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

// Function to convert RGB to HEX
function rgbToHex([r, g, b]) {
  r = Math.round(clamp(r, 0, 1) * 255);
  g = Math.round(clamp(g, 0, 1) * 255);
  b = Math.round(clamp(b, 0, 1) * 255);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
}

// Function to get maximum chroma for given L and H
function maxChromaForLH(L, H) {
  const hRad = (H / 360) * 2 * Math.PI;
  const bounds = getBounds(L);
  let min = Infinity;

  for (const bound of bounds) {
    const length = lengthOfRayUntilIntersect(hRad, bound);
    if (length >= 0) {
      min = Math.min(min, length);
    }
  }

  return min;
}

// Function to get chroma bounds for a given L
function getBounds(L) {
  const sub1 = Math.pow(L + 16, 3) / 1560896;
  const sub2 = sub1 > epsilon ? sub1 : L / kappa;

  const bounds = [];
  for (let c = 0; c < 3; c++) {
    const m1 = m[c][0];
    const m2 = m[c][1];
    const m3 = m[c][2];
    for (let t = 0; t < 2; t++) {
      const top1 = (284517 * m1 - 94839 * m3) * sub2;
      const top2 =
        (838422 * m3 + 769860 * m2 + 731718 * m1) * L * sub2 - 769860 * t * L;
      const bottom = (632260 * m3 - 126452 * m2) * sub2 + 126452 * t;
      bounds.push({ slope: top1 / bottom, intercept: top2 / bottom });
    }
  }
  return bounds;
}

// Function to get intersection of chroma bound line
function lengthOfRayUntilIntersect(theta, line) {
  return line.intercept / (Math.sin(theta) - line.slope * Math.cos(theta));
}

// Main function: HSLuv to HEX
function hsluvToHex(H, S, L) {
  const lch = hsluvToLch(H, S, L);
  const lab = lchToLab(lch);
  const xyz = labToXyz(lab);
  const linearRgb = xyzToLinearRgb(xyz);
  const rgb = linearRgbToRgb(linearRgb);
  return rgbToHex(rgb);
}
