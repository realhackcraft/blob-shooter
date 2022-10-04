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

function isOffscreen (pos = { x, y }, width, height) {
  return pos.x + width < 0 ||
    pos.x - width > canvas.width ||
    pos.y + height < 0 ||
    pos.y - height > canvas.height
}

function randomEnemyColor () {
  return `hsl(${Math.random() * 360}, 50%, 50%)`
}
