define(['domlib', 'modules/breakpoint', 'modules/tesco.data', 'modules/common', 'modules/load-more/common'], function($, breakpoint, data, common, loadMore){

	var _myInlineRequests = [];
	var _myRequests = {'selectVariant' : ['scene7', 'buyBoxes', 'specification', 'variants', 'title', 'miniDesc']};
	var _myModules = {'scene7' : ['#flyoutViewerContainer', 'Update product image', true, true, true],                
	                  'buyBoxes' : ['#buy-box-holder', '', true, false, true, true],
	                  'specification' : ['#product-specification', 'Update product specification', true, true, false],
	                  'description' : ['#product-description', '', true, true, false],
	                  'variants' : ['#variants', '', true, false, true, true],
	                  'title' : ['#product-title', 'Updating product title', true, true, true],
	                  'miniDesc' : ['#miniDesc', 'Updating mini description', true, true, true]
	                  };
			
	var _myActions = { 'selectVariant' : ['/stubs/select-variant.php'] };		          
	var _myDefaultActions = { 'selectVariant' : ['/stubs/select-variant.php']};

	data.Global.init({
		'inlineRequests': _myInlineRequests,
		'requests': _myRequests,
		'modules': _myModules,
		'actions': _myActions,
		'defaultActions': _myDefaultActions			
	});
	
	var addToCompare = {
		addToText: 'Add to compare',
		addedText: 'Product added',
		totalCompareCount: 0,
		$addToCompare: '.add-to-compare',
		$compareDialog: '#compare-dialog',
		originalDialogPosition: 0, //set on init
		kiosk: window.isKiosk(),

		toggleState: function (e) {
			e.preventDefault();	
			var self = addToCompare,
				$currentTarget = $(e.target).is('div.add-to-compare') ? $(e.target) : $(e.target).parents('.add-to-compare'),
				$customCheckbox = $currentTarget.find('div'),
				$text = $currentTarget.find('.text'),
				productLink = $('.products-wrapper').attr('data-compare-ds-url');
				
			if (!$customCheckbox.hasClass('checked')) {
				if (addToCompare.totalCompareCount < 4) {
					$customCheckbox.addClass('checked');
					$currentTarget.addClass('selected');
					self.updateText($text, self.addedText);
					self.updateCount(true);										
					productLink += '?method=add&product=' + encodeURI($customCheckbox.attr('data-compare'));					
					$.get(productLink, function(data) {	});					
				}
			} else {
				$customCheckbox.removeClass('checked');
				$currentTarget.removeClass('selected');
				self.updateText($text, self.addToText);
				self.updateCount(false);													
				productLink += '?method=remove&product=' + encodeURI($customCheckbox.attr('data-compare'));				
				$.get(productLink, function(data) { });				
			}
			self.showCompareDialog();			
		},

		updateText: function (element, text) {
			element.text(text);
		},

		updateCount: function (incrementFlag) {
			if (incrementFlag === true && addToCompare.totalCompareCount < 4) {
				addToCompare.totalCompareCount++;
			}
			if (incrementFlag === false && addToCompare.totalCompareCount !== 0) {
				addToCompare.totalCompareCount--;
			}
		},
		
		enableCompare: function () {
			this.$compareDialog.find('.compare-cta').removeClass('disabled');
		},

		disableCompare: function () {
			this.$compareDialog.find('.compare-cta').addClass('disabled');
		},

		enableClear: function () {
			$('#clear-all').removeClass('disabled');
		},

		disableClear: function () {
			$('#clear-all').addClass('disabled');				
		},
		
		showCompareDialog: function (init) { 
			var $notChecked = $('.add-to-compare').find('div').not('.checked'),
				totalCompareCount = 0,
				$text = this.$compareDialog.find('.no-of-items');
			
			if (init!==true) {
				totalCompareCount = addToCompare.totalCompareCount;				
			} else {
				totalCompareCount = parseInt($text.text());
				addToCompare.totalCompareCount = totalCompareCount;
			}
			
			$text.text(totalCompareCount);
			
			if (totalCompareCount === 4 || totalCompareCount >= 2) {
				(totalCompareCount===4)?$notChecked.addClass('disabled'):$notChecked.removeClass('disabled');
				this.$compareDialog.removeClass('hidden');
				if (!this.$compareDialog.hasClass('fixed')) {
					this.addFixedClass();
				}
				this.enableCompare();
				this.enableClear();				
			} else {
				$notChecked.removeClass('disabled');
				this.$compareDialog.addClass('hidden');
				this.disableCompare();
				this.disableClear();
			}
		},
		
		addFixedClass: function () {
			if (this.$compareDialog.offset().top < this.getYOffset()) {
				this.$compareDialog.addClass('fixed');
			} else {
				this.$compareDialog.removeClass('fixed');
			}
		},

		scroll: function (viewport) {
			var $compareDialog = addToCompare.$compareDialog;
			if ($compareDialog.length) {
				var originalDialogPosition = $('#main-content').offset().top;
				window.onscroll = function (evt) {
					if (!$compareDialog.hasClass('hidden')) {
						if (originalDialogPosition < addToCompare.getYOffset() && (viewport !== 'mobileIn' || viewport !== 'vTablet')) {
							$compareDialog.addClass('fixed');
						} else {
							$compareDialog.removeClass('fixed');
						}
					}
				};
			}
		},
		
		getYOffset: function () {
			return window.pageYOffset || document.documentElement.scrollTop;
		},

		onExitCompareMode: function (e) {
			this.exitCompareMode.call(this, e);
		},

		exitCompareMode: function (e) {
			var listingElement = $('#listing');
			listingElement.find('.compare .product').unbind();
			$('body').removeClass('listing-compare-mode');
			listingElement.find('.products').removeClass('compare');
			listingElement.off('click tap', '.compare .product');
			addToCompare.$compareDialog.addClass('hidden');
			// addToCompare.$compareDialog.find('.user-action-text').html('You can select up to 4 items to compare');
			// reset comparisons selected
		},
		
		uncheckAll: function (e) {
			if (e !== 'undefined') {
				e.preventDefault();
			}
			
			var productLink = $('.products-wrapper').attr('data-compare-ds-url'),	
				productsToClear = '';
			
			if (!this.kiosk) {
				$.each($('.add-to-compare.selected'), function (index, value) {
					productsToClear += $(this).find('div').data('compare') + ',';					
					$(this).removeClass('selected');
					$(this).find('.custom-checkbox').removeAttr('checked');
					$(this).find('div').removeClass('disabled checked');
					addToCompare.updateText($(this).find('.text'), addToCompare.addToText);
				});
				$('#compare-dialog').removeClass('fixed').addClass('hidden');
				$('.add-to-compare').find('div').removeClass('disabled'); // enable all the checkboxes
			} else {
				$('.products .selected').removeClass('selected');
				addToCompare.$compareDialog.find('.user-action-text').html('You can select up to 4 items to compare');
			}
			
			productLink += '?method=clear&product=' + productsToClear;			
			$.get(productLink, function(data) { });
			this.resetCompareCount();
		},
		
		resetCompareCount: function () {
			this.totalCompareCount = 0;
			//this.exitCompareMode();
		},		
		
		replaceKioskSpecific: function () {
			this.kiosk = true;
			this.$compareDialog.find('p')
				.text('Compare items')
				.after('<p class="user-action-text">You can select up to 4 items to compare</p>');
			this.$compareDialog.find('.compare-cta').text('Compare selected items');
		},

		selectProduct: function (e) {
			e.preventDefault();
			var $selectedProduct = $(e.currentTarget),
				html = "";
			if (!$selectedProduct.hasClass('selected')) {
				if (addToCompare.totalCompareCount === 4) {
					return;
				}
				$selectedProduct.addClass('selected');
				this.updateCount(true);
			} else {
				$selectedProduct.removeClass('selected');
				this.updateCount(false);
			}
			if (addToCompare.totalCompareCount >=2) {
				this.enableCompare();
			} else {
				this.disableCompare();
			}
			this.enableClear();
			switch (addToCompare.totalCompareCount) {
			case 0:
				html = "Select up to 4 items to compare.";
				this.disableClear();
				break;
			case 1:
				html = 'You have selected <span class="no-of-items">1</span> item to compare. Please select at least 1 more item to compare.';
				break;
			case 2:
				html = 'You have selected <span class="no-of-items">2</span> items to compare.';
				break;
			case 3:
				html = 'You have selected <span class="no-of-items">3</span> items to compare.';
				break;
			case 4:
				html = 'You have chosen the maximum (<span class="no-of-items">4</span>) items to compare.';
				break;
			}
			this.$compareDialog.find('.user-action-text').html(html);
		},

		compareProducts: function (e) {
			if ($(this).hasClass('disabled')) {
				return false;
			}
			var $product = loadMore.findFirstProductInViewport();
			$product = $product.find('a');
			$product.target = $product; 
			loadMore.productBookmarkEvent($product, true);
		},
		
		
		
		init: function () {
			/*
			 *  I understand this will cause a page refresh if the user loads the page on mobile and expands to large desktop, but
			 *  it is very poorly performing on SVP
			 */
			if(common.isPage('PLP') && !breakpoint.mobile){
				addToCompare.$addToCompare = $(addToCompare.$addToCompare);
				addToCompare.$compareDialog = $(addToCompare.$compareDialog);
				addToCompare.bindEvents();
				addToCompare.showCompareDialog(true);				
			}
		}		
	};

	return addToCompare;
});