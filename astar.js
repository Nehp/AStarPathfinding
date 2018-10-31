/**
 * An implementation of A* pathfinding with visualisation.
 * @author Stephen Wilks
 */

window.onload = function() {
	init();
};

var Node = function(x, y) {
	this.x = x;
	this.y = y;

	this.parent = null;
	this.cost = 0;
}

var Path = function() {
	this.index = 1;
	this.nodes = [];

	this.next = function() {
		this.index++;
	}

	this.add = function(node) {
		this.nodes.unshift(node);
	}

	this.getCurrent = function() {
		return this.nodes[this.index];
	}

	this.getEnd = function() {
		return this.nodes[this.nodes.length - 1];
	}

	this.isFinished = function() {
		return this.index >= this.nodes.length;
	}
}

var canvas, ctx;

var tileSize = 16;

var gridWidth = 40;
var gridHeight = 30;

var grid = new Array(gridWidth, gridHeight);

for (var y = 0; y < gridHeight; y++) {
	for (var x = 0; x < gridWidth; x++) {
		grid[x + y * gridWidth] = { 
			blocks : Math.random() > 0.95
		};
	}
}

var gridX = 0;
var gridY = 0;

var nodes = [];
var path;

function init() {
	canvas = document.getElementById("grid");
	ctx = canvas.getContext("2d");

	canvas.onmousedown = function(event) {
		event.preventDefault();
		var xTile = Math.floor((event.x - canvas.offsetLeft) / tileSize);
		var yTile = Math.floor((event.y - canvas.offsetTop) / tileSize);
		if (xTile != gridX || yTile != gridY) path = findPath(gridX, gridY, xTile, yTile);
	}

	requestAnimationFrame(animate);
}

var ticks = 0;

function animate() {
	ticks++;

	if (path != null) {
		/* quick way to get our square moving along the path */
		if (!path.isFinished() && ticks % 10 == 0) {
			var currentNode = path.getCurrent();
			gridX = currentNode.x;
			gridY = currentNode.y;
			path.next();
		}
	}

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	for (var y = 0; y < gridHeight; y++) {
		for (var x = 0; x < gridWidth; x++) {
			var tile = grid[x + y * gridWidth];
			ctx.fillStyle = tile.blocks ? "#696969" : "#000000";
			ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
		}
	}

	/* if we have a path, show the end goal! */
	if (path != null) {
		var endNode = path.getEnd();
		ctx.fillStyle = "#00ff00";
		ctx.fillRect(endNode.x * tileSize, endNode.y * tileSize, tileSize, tileSize);
	}

	/* show a square to represent the path follower */
	ctx.fillStyle = "#ff0000";
	ctx.fillRect(gridX * tileSize, gridY * tileSize, tileSize, tileSize);

	ctx.fillStyle = "#ffffff";
	requestAnimationFrame(animate);
}

function findPath(xStart, yStart, xEnd, yEnd) {
	for (var x = 0; x < gridWidth; x++) {
		nodes[x] = [];
		for (var y = 0; y < gridHeight; y++) {
			nodes[x][y] = new Node(x, y);
		}
	}

	var open = [];
	var closed = [];

	var start = nodes[xStart][yStart];
	var end = nodes[xEnd][yEnd];

	open.push(start);

	while (open.length > 0) {
		var current = getLowestCost(open);
		if (current == end) {
			var path = new Path();
			var node = end;
			while (node != start) {
				path.add(node);
				node = node.parent;
			}
			path.add(start);
			return path;
		}

		open.splice(open.indexOf(current), 1);
		closed.push(current);

		var neighbours = getNeighbours(current.x, current.y);
		for (var i = 0; i < neighbours.length; i++) {
			var neighbour = neighbours[i];
			if (open.indexOf(neighbour) == -1 && closed.indexOf(neighbour) == -1) {
				neighbour.parent = current;
				var hueristic = estimateDistance(current, neighbour);
				neighbour.cost = current.cost + hueristic;
				open.push(neighbour);
			}
		}
	}

	return null;
}

function getLowestCost(open) {
	var lowest = open[0];

	for (var i = 0; i < open.length; i++) {
		var node = open[i];

		if (node.cost < lowest.cost) {
			lowest = node;
		}
	}

	return lowest;
}

/* manhattan distance */
function estimateDistance(start, end) {
	var dx = start.x - end.x;
	var dy = start.y - end.y;
	return Math.abs(dx) + Math.abs(dy);
}

/* dont allow diagonal movement between obstacles */
function getNeighbours(x, y) {
	var neighbours = [];

	var up = false;
	var right = false;
	var down = false;
	var left = false;

	if (canPass(x, y - 1)) {
	    neighbours.push(nodes[x][y - 1]);
	    up = true;
	}

	if (canPass(x, y + 1)) {
	    neighbours.push(nodes[x][y + 1]);
	    down = true;
	}

	if (canPass(x - 1, y)) {
	    neighbours.push(nodes[x - 1][y]);
	    left = true;
	}

	if (canPass(x + 1, y)) {
	    neighbours.push(nodes[x + 1][y]);
	    right = true;
	}

	if ((left && up) && canPass(x - 1, y - 1)) {
	    neighbours.push(nodes[x - 1][y - 1]);
	}

	if ((right && down) && canPass(x + 1, y + 1)) {
	    neighbours.push(nodes[x + 1][y + 1]);
	}

	if ((down && left) && canPass(x - 1, y + 1)) {
	    neighbours.push(nodes[x - 1][y + 1]);
	}

	if ((up && right) && canPass(x + 1, y - 1)) {
	    neighbours.push(nodes[x + 1][y - 1]);
	}

	return neighbours;
}

function getTile(xTile, yTile) {
	return grid[xTile + yTile * gridWidth];
}

/* can we pass this tile? definetely not if it's out of bounds */
function canPass(xTile, yTile) {
	if (xTile < 0 || yTile < 0 || xTile >= gridWidth || yTile >= gridHeight) return false;
	return !grid[xTile + yTile * gridWidth].blocks;
}