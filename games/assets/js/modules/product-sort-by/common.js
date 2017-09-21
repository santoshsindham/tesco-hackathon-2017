/*global define: true */
define(['domlib', 'modules/common'], function($, common){


	/** @namespace */
	var productSortBy = {
		productTitle: ".add-to-basket-overlay .product-title",
		module: "#product-sort-by",
		overlayBG: ".overlay-screen",
		overlay: ".sort-by-overlay",
		trigger: ".trigger",
		
		
		getCategoryListHTML: function ($link) {
			$.ajax({
				url: $link.data('url'),
				complete: function (data) {
					$("body").append("<div class='overlay-screen'></div>");
					$link.parents(productSortBy.module).append(data.responseText);
					productSortBy.toggleOverlay();
					productSortBy.centerOverlay();
					productSortBy.bindOverlayEvents();
				}
			});
		},


		centerOverlay: function () {
			//centers overlay vertically - half height negative margin top. Horizontal centering already handled as fixed width
			var overlayHeight = $(productSortBy.overlay).height();
			$(productSortBy.overlay).css("margin-top", "-" + overlayHeight / 2 + "px");
		},


		overlayExists: function () {
			return $(productSortBy.overlayBG).length > 0;
		},


		toggleOverlay: function () {
			var cssTransitionsSupported = common.isModern(),
			overlays = $(productSortBy.overlayBG).add(productSortBy.overlay);
			if (cssTransitionsSupported) {
				overlays.toggleClass("show-overlay");
			}
			else {
				productSortBy.toggleOverlayFallback(overlays);
			}
		},


		toggleOverlayFallback : function (overlays) {
			var opacityValue = !overlays.hasClass("show-overlay");
			overlays.each(function () {
				$(this).animate({opacity : opacityValue}, 150);
			});
			overlays.toggleClass("show-overlay");
		},

		
		bindOverlayEvents: function () {
			$(".overlay-screen, .sort-by-overlay .close").on("click", function () {
				productSortBy.toggleOverlay();
				return false;
			});
		},


		bindTrigger: function () {
			$(productSortBy.trigger).on("click", function () {
				var overlayExists = productSortBy.overlayExists();
				if (overlayExists) {
					productSortBy.toggleOverlay();
				}
				else {
					productSortBy.getCategoryListHTML($(this));
				}
				return false;
			});
		},


		init: function () {
			var module = $(productSortBy.module);
			if (module.length) {
				module.each(function () {
					productSortBy.bindTrigger($(this));
				});
			}
		}
	};

	common.init.push(productSortBy.init);

	return productSortBy;
});