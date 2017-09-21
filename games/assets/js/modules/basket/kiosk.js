/*global define:true */
define(['domlib', 'modules/common', './common', 'modules/inline-scrollbar/common', 'modules/chip-and-pin/kmf-io'], function ($, common, basket, inlineScrollbar, kmfIO) {
	
	var self, kioskInit, kioskVerticalScroll, updateDomReferences, manipulateDom, updateRemoveButtonContent, updateContinueToCheckoutButtonText, updateItemHeading, updateTotalSavingsHeader, updateAvailableOptionsAddToBasketText, makeQuantityUpdatesReadOnly, showManipulatedDomElements, initScroller, scroller, $basketItem, $basketPrimary, $basketSummary, $basketSummaryInner, $continueToCheckoutButton, $subtotal, $availableOptions, $availableOptionsAddToBasket;
	
	/*
	kioskVerticalScroll = function kioskVerticalScroll() {
		var init, self, updateDom, $kioskScrollerInnner, $kioskVerticalPageWrapper;
		
		bindEvents = function bindEvents() {
			$kioskVerticalPageWrapper = $('.kiosk-vertical-scrollbar-wrapper', self.module);
			if ($kioskVerticalPageWrapper.length) {
				
			}
		};
		
		updateDom = function updateDom() {
			$basketPrimary.wrapInner('<div class="kiosk-vertical-scroller-wrapper"><div class="kiosk-vertical-scroller-inner"></div></div>');
			$kioskScrollerInner = $('.kiosk-vertical-scroller-inner', $basketPrimary);
			$kioskScrollerInner.after('<div class="kiosk-vertical-scrollbar-wrapper"><a href="#" class="button-up">[ UP ]</a><a href="#" class="button-down">[ DOWN ]</a></div>');
			bindEvents();
		};
		
		init = function init() {
			self = this;
			updateDom();
		}();
	};
	*/
	initScroller = function initScroller() {
		//scroller = new kioskVerticalScroll();
		inlineScrollbar.init($('.basket-item-container'), null);
	};
	
	kioskInit = function kioskInit() {
		self = this;
		updateDomReferences();
		manipulateDom();
		updateRemoveButtonContent();
		updateContinueToCheckoutButtonText();
		updateItemHeading();
		updateTotalSavingsHeader();
		updateAvailableOptionsAddToBasketText();
		makeQuantityUpdatesReadOnly();
		showManipulatedDomElements();
		initScroller();
		kmfIO.enableBasketButton();
	};
	
	updateDomReferences = function updateDomReferences() {
        $basketItem = $('.basket-item', self.module);
		$basketPrimary = $('#basket-primary', self.module);
		$basketSummary = $('#basket-summary-mini', self.module);
		$basketSummaryInner = $('.basket-summary-inner', self.module);
		$subtotal = $('.subtotal', self.module);
		$removeButton = $('.remove.tertiary-button', self.module);
		$basketItemHeading = $('.basket-item .description h3.section-heading', self.module);
		$totalWrapper = $('.basket-summary-inner .total-wrapper', self.module);
		//$continueToCheckoutButton = $('#basket-checkout', self.module);
		$continueToCheckoutButton = $('.basket-summary-inner #continueCheckout', self.module);
		$availableOptions = $('.available-product-options', self.module);
		$availableOptionsAddToBasket = $('.available-product-options input[type="submit"]', self.module);
    };
    
    updateContinueToCheckoutButtonText = function updateContinueToCheckoutButtonText() {
    	$continueToCheckoutButton.val('Checkout Now');
    };
    
    updateRemoveButtonContent = function updateRemoveButtonContent() {
    	$removeButton.text('X');
    };
    
    updateAvailableOptionsAddToBasketText = function updateAvailableOptionsAddToBasketText() {
    	$availableOptionsAddToBasket.val('Add').attr('class', 'primary-button');
	};
    
    updateItemHeading = function updateItemHeader() {
    	var $firstHeading, currentHeading, newHeading;
    	if (!$basketItemHeading.length) {
    		return;
    	}
    	$firstHeading = $basketItemHeading.first();
		currentHeading = $firstHeading.text();
		newHeading = currentHeading.slice(0, -1);
		$firstHeading.text(newHeading);
    };
    
    updateTotalSavingsHeader = function updateTotalSavingsHeader() {
    	var $elm, html, newHtml;
    	$elm = $('.savings-wrapper li.total');
    	if($elm.length > 0){
	    	html = $elm.html().toString();
	    	newHtml = html.replace('Total savings', 'Savings');
	    	$elm.html(newHtml);
    	}
    };
    
    makeQuantityUpdatesReadOnly = function makeQuantityUpdatesReadOnly() {
    	$basketItem.find('.quantity input[type="text"]').attr('readonly', 'readonly');
    };
    
    showManipulatedDomElements = function showManipulatedDomElements() {
		$availableOptions.show();		
    };
    
	manipulateDom = function manipulateDom() {
		$basketSummary.insertBefore($basketSummaryInner);
		$continueToCheckoutButton.insertAfter($totalWrapper);
		$('.remove-product').each(function (){ 
			$(this).show().parent().find('.quantity .remove.tertiary-button').first().show().appendTo($(this));
		});
		$('.basket-item .description h2 a').each( function(){
		    var itemTitle=$(this);
		    var itemTitle_height=$('.basket-item .description h2').height();
		    while ($(itemTitle).outerHeight() > itemTitle_height) {
		        $(itemTitle).text(function (index, text) {
		            return text.replace(/\W*\s(\S)*$/, '...');
		        });
		    }
		});
		
		$('.basket-item .available-product-options').each( function(){
		    var checkboxLabel=$(this).find('form > label');
		    checkboxLabel.find('.checkbox').insertBefore(checkboxLabel.find('.value'));
		});
		
		$('.basket-summary-inner ul.clubcard-points').insertAfter('.basket-summary-inner .total-wrapper');
	};

	common.init.push(function() {
		kioskInit();
	});
});