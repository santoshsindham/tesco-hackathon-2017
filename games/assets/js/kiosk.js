/* eslint-disable */
/*globals define */
/*jslint regexp: true */
define([
    'domlib',
    'modules/breakpoint',
    'modules/common',
    'modules/domlib-utils/common',
    'modules/page-title/common',
    'modules/integrated-registration/common',
    'modules/footer/common',
    'modules/breadcrumb/common',
    'modules/carousel/desktop',
    'modules/tile-carousel/kiosk',
    'modules/colour-swatch/common',
    'modules/product-variants/ProductVariantController',
    'modules/load-more/common',
    'modules/navigation/common',
    'modules/buy-from/kiosk',
    'modules/product-sort-by/common',
    'modules/recently-viewed/common',
    'modules/sort-by/common',
    'modules/add-to-compare/desktop',
    'modules/product-filters/common',
    'modules/home-page-stamps/common',
    'modules/expand-collapse/kiosk',
    'modules/basket/common',
    'modules/basket/kiosk',
    'modules/product-description/kiosk',
    'modules/delivery-options/desktop',
    'modules/save-for-later/common',
    'modules/media-matrix/common',
    'modules/carousel-position-indicator/common',
    'modules/pdp-s7viewer/common',
    'modules/sign-out/common',
    'modules/visual-nav/common',
    'modules/product-tile/common',
    'modules/compare-page/common',
    'modules/scroll-to/desktop',
    'modules/compare-page/common',
    'modules/seller-directory/common',
    'modules/deferred-block/common',
    'modules/chip-and-pin/common',
    'modules/event-messaging/common',
    'modules/pdp-configurator/common',
    'modules/warranty/resaleWidget',
    'modules/jargon-buster/common',
    'modules/personalise-product/common',
    'modules/catalog-navigation/init',
    'modules/fixed-header/init',
    'modules/pdp/media-viewer/common',
    'modules/ues/common'
], function ($, breakpoint, common) {
    'use strict';

	var invokePictureFillHQKiosk = function() {
		var $ps,$picImg,$picSrc;
		if (isKiosk()) {
			$ps = $(".product-carousel").not("#listing").find("a.thumbnail div");
			// Loop the picture divs
			$ps.each(function() {
				if ($(this).data("picture") !== null) {
					if ($(this).find("img")) {
						$picImg = $(this).find("img").eq(0);
						$picSrc = $(this).find("div").eq(0).data("src");
						//Update img tag src to higher quality image
						if ($picSrc !== null) {
							$picImg.prop("src", $picSrc);
						}
					}
				}
			});
		}
		$(window).off('pictureFill.complete.invoke', invokePictureFillHQKiosk);
	};
	$(window).on('pictureFill.complete.invoke', invokePictureFillHQKiosk);

    $(function () {
        common.androidDetect();
        // Wrapped in document ready as we are seeing multiple race-conditions with regards to DOM calls and what is being returned.
        $(document).ready(function () {
            breakpoint.init();
            breakpoint.check();
            common.app();
            setTimeout(function () {
                breakpoint.update(breakpoint.check(true));
            }, 4);
        });

    });

});
