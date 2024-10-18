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
		pos.x + width < 0 ||
		pos.x - width > canvas.width ||
		pos.y + height < 0 ||
		pos.y - height > canvas.height
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
	return `hsl(${Math.random() * 360}, 50%, 50%)`;
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

/**
 * If the fancyCursor variable is true, then load the magicMouse library.
 * NOTE: do not use until variables.js is loaded!
 * @author Hackcraft_
 */
function loadCursor() {
	if (fancyCursor) {
		let options = {
			cursorOuter: "circle-basic",
			hoverEffect: "circle-move",
			hoverItemMove: false,
			defaultCursor: false,
			outerWidth: 20,
			outerHeight: 20,
		};
		magicMouse(options);
		startGameBtn.classList.add("magic-hover");
		startGameBtn.classList.add("magic-hover__square");
	} else {
		document.documentElement.style.cursor =
			"url('./assets/img/cursor.png'), auto";
		document.querySelector(".reset").style.cursor =
			"url('./assets/img/cursor.png'), auto";
		startGameBtn.style.cursor = "url('./assets/img/cursor.png'), auto";
	}
}
