/*global window, document, $:false, jQuery, LBI, self, Modernizr */

//Define our root namespace if necessary
var TESCO = window.TESCO || {};

TESCO.grid = {

	grids: {

		// format is [number of columns, percentage width of each column, array of gutter locations]
		small:	[40, 2.5, [0, 39]],

		medium:	[75, 1.33333, [0, 37, 74] ], /* how to do position of gutters? */

		large:	[96, 1.04166, [0, 47, 48, 95]],

		larger: [120, 0.833333335, [0, 29, 30, 59, 60, 89, 90, 119]],

		xlarge: [150, 0.66667, [0, 29, 30, 59, 60, 89, 90, 119, 120, 149]],

		huge: [150, 0.66667, []]

	},

	size: 'large',

	foo: function () {
	},

	bar: function (evt) {
	},

	ele : undefined,

	init: function () {
		
		var size,
			self = this,
			windowWidth = window.innerWidth; // inspect code for grid proportions, number of columns, width of columns in percent
		// add icon to turn grid on/off
		// TODO

		if (windowWidth >= 1920) {
			size = TESCO.grid.grids.huge;
		} else if (windowWidth >= 1200) {
			size = TESCO.grid.grids.xlarge;
		} else if (windowWidth >= 1024) {
			size = TESCO.grid.grids.larger;
		} else if (windowWidth >= 768) {
			size = TESCO.grid.grids.large;
		} else if (windowWidth >= 600) {
			size = TESCO.grid.grids.medium;
		} else {
			size = TESCO.grid.grids.small;
		}
		
		

		if (!this.ele) {
			$('.page').append('<div class="grid-overlay" style="display: none"></div>');
			$('.grid-overlay').css({
				'width': $('.page').css('width'),
				'opacity': '0.4'
			});
			this.ele = $('#grid-overlay');
		} else {
			this.ele.empty();
		}
		// for each column in the page, draw a red column.
		for (var i = 0; i < size[0]; i++) {
			$('.grid-overlay').append('<div style="position: absolute; top: 0; left: ' + i * size[1] + '%; display: block; width: ' + size[1] + '%; height: 100%; background: ' + (i % 2 === 0 ? 'rgba(255, 0, 0, 0.5)' : 'rgba(255, 0, 0, 0.3)') + '"></div>');
		}

		for (i = 0; i < size[2].length; i++) {
			$('.grid-overlay').append('<div style="position: absolute; top: 0; left: ' + size[2][i] * size[1] + '%; display: block; width: ' + size[1] + '%; height: 100%; background: rgba(255, 200, 0, 0.7);"></div>');
		}
		
		$('#toggle-grid').remove();
		$('body').append('<a id="toggle-grid" style="display:block; position: fixed; z-index: 200; border-radius: 0 0 0 20px; right: 0; top: 0; background: #ff0; font-weight: bold; color: #333; padding: 7px 7px 10px 10px;" href="#">toggle grid</a></div>');

		$('#toggle-grid').click(function () {
			// toggle grid overlay on/off
			$('.grid-overlay').toggle();
		});
	}

};

$(document).ready(function () {
	//TESCO.grid.init();
});