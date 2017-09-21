/* eslint-disable */
/*global define: true */
define(['domlib','modules/breakpoint', './common', 'modules/common'], function($, breakpoint, addToCompare, common){

	addToCompare.bindEvents = function(){

		$('#clear-all').on('tap click', function (e) {
			addToCompare.uncheckAll.call(addToCompare, e);
		});
		$('#exit-compare-mode').on('tap click', this.onExitCompareMode.bind(this));

		$('.compare-cta').on('tap click', this.compareProducts);
		if (!breakpoint.kiosk) {
			//$('#listing').off('tap click');
			$('#listing').on('tap click', '.add-to-compare', this.toggleState);
			this.scroll(breakpoint.currentViewport);
		} else {
			this.replaceKioskSpecific();
			$('#compare-mode').on('tap click',this.enterCompareMode);
		}
	};

	addToCompare.enterCompareMode = function (e) {
		e.preventDefault();
		$('#listing').find('.products').addClass('compare');
		$('body').addClass('listing-compare-mode');

		$('#listing').on('tap click', '.compare .product', function (e) {
			e.preventDefault();
			e.stopPropagation();
			addToCompare.selectProduct.call(addToCompare, e);
		});

		addToCompare.$compareDialog.removeClass('hidden');
	};

	common.init.push(addToCompare.init);

});