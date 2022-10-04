function randomNumber (min, max) {
  return Math.random() * (max - min) + min
}

function distance (a = { x, y }, b = { x, y }) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

function angleBetween (a = { x, y }, b = { x, y }) {
  return Math.atan2(
    a.y - b.y,
    a.x - b.x,
  )
}
