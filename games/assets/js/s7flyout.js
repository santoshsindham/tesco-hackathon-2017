/**
Implements flash viewer "fly-out" functionality.
*/
var s7flyOut = {};

//PUBLIC API

//mandatory configuration fields, must be set on a calling page

//flash viewer object id
s7flyOut.viewerId = null;
//flash object width in fully expanded state, in pixels
s7flyOut.expandedSize = -1;
//flash object width in fully shrinked (initial) state, in pixels
s7flyOut.shrinkedSize = -1;

//optinal configuration fields

//fly-out animation time, in ms
s7flyOut.totalAnimationTime = 1000;

/**
Gradually expands viewer up to the maximum size. May send 'onAnimationStart' event if the system was idle.
Will send 'onAnimationEnd' when the viewer is completely expanded.
*/
s7flyOut.expandViewer = function() {
	this.targetSize = this.expandedSize;
	this.animate();
};

/**
Gradually shrinks viewer up to the minimum size. May send 'onAnimationStart' event if the system was idle.
Will send 'onAnimationEnd' when the viewer is completely shrinked.
*/
s7flyOut.shrinkViewer = function() {
	this.targetSize = this.shrinkedSize;
	this.animate();
};

/**
Returns true if the viewer is in expanded state, false otherwise.
*/
s7flyOut.isExpanded = function() {
	return (this.getCurrentSize() == this.expandedSize);
};

/**
Returns true if the viewer is in shrinked state, false otherwise.
*/
s7flyOut.isShrinked = function() {
	return (this.getCurrentSize() == this.shrinkedSize);
};

//Event callbacks. Can be reloaded on the client's page.

s7flyOut.onAnimationStart = function() {};
s7flyOut.onAnimationEnd = function() {};

//PRIVATE API

s7flyOut.working = false;
s7flyOut.targetSize = -1;
s7flyOut.startSize = -1;
s7flyOut.startTime = -1;
s7flyOut.animationTime = -1;

s7flyOut.animate = function() {
	this.startTime = (new Date()).getTime();
	this.startSize = this.getCurrentSize();
	var pathToGo = this.targetSize - this.startSize;
	this.animationTime = Math.abs(pathToGo) / (this.expandedSize - this.shrinkedSize) * this.totalAnimationTime;
	if (!this.working) {
		this.working = true;
		this.onAnimationStart();
		setTimeout('s7flyOut.animationTick(' + (new Date()).getTime() + ')', 50);
	}
};

s7flyOut.animationTick = function(inLastTime) {
	var dt = (new Date()).getTime() - this.startTime;
	if (dt >= this.animationTime) {
		this.setSize(this.targetSize);
		this.working = false;
		this.onAnimationEnd();
	} else {
		var size = this.startSize + (this.targetSize - this.startSize) * dt / this.animationTime;
		this.setSize(Math.round(size));
		setTimeout('s7flyOut.animationTick(' + (new Date()).getTime() + ')', 10);
	}
};

s7flyOut.getCurrentSize = function() {
	if (document.embeds && document.embeds[this.viewerId]) {
		return parseInt(document.embeds[this.viewerId].width, 10);
	} else {
		return parseInt(document.getElementById(this.viewerId).offsetWidth, 10);
	}
};

s7flyOut.setSize = function(inSize) {
	if (document.embeds && document.embeds[this.viewerId]) {
		document.embeds[this.viewerId].width = inSize;
	} else {
		document.getElementById(this.viewerId).style.width = inSize + 'px';
	}
};
