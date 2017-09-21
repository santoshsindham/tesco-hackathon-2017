$(function() {
    "use strict";
});

/***
 * Base module to control PLP variants
 */

TESCO.PLP = {
	swatchHeight: 22,	
	init: function(){
		/* methods to setup page and trap events */
		TESCO.PLP.setupPage();
		TESCO.PLP.trapPLPEvents();
	},
	
	setupPage: function($productTiles) {
		if ($productTiles) {
			var varLists = $productTiles.find('ul.drop-down');
		}
		else {
			$productTiles = $('#product-tile-container li.product, #product-tile-container li.product-bb');
			var varLists = $("#product-tile-container ul.drop-down");			
		}		
		if (varLists.length > 0) {
			TESCO.PLP.setDropDown(varLists);
		}
		
		//Required as race conditions are happening with the setGridView call and markup additions above
		var gridItems = $productTiles
		var oProps = [];
        oProps.push(["div.product-variants", 30, 5, false, true]);
        TESCO.Common.formatGridElements(gridItems, 4, oProps); 
        
        // Set selected swatch as the top row 
        $productTiles.find('div.product-variants li.selected a').each(function(i, e) {
        	TESCO.PLP.moveRowToTop($(e), false);
        });
        
	},	
	setDropDown: function(elems){
		var dropDown = '<div class="drop-down-container collapsed"><\/div>',
			dropDownArrow = '<div class="drop-down-arrow"><\/div>';
		elems.wrap(dropDown);
		elems.after(dropDownArrow);
		
		/***
		 * Needed as parent container has a height of 0 due to absolute positioning, 
		 * adding this class add a fixed height of 22px (swatchHeight) so setGridView works correctly.
		 */		
		elems.parent().parent().addClass('hasDropDown');
	},	
	setTileInfo: function (elem){
		var tile, pdpUrl, productName, productNameElem, prodImage, prodImageAnchor, productDetailBtn, 
			pricePounds, pricePence, pageView, thisTile, siblings, swatch, skuId, skuData, newPrice, priceArr, colourName,
			priceContainer, buttonContainer, sellerContainer, selectOptionButton, currentlyUnavailableContainer;
		
		var $buyButton;
		var secondaryVariantValue = '';
		var fullProductName = '';
		//alert('setTitleInfo');
		if($(elem).parents("li.product-grid-bb").length > 0){
			tile = $(elem).parents("li.product-grid-bb");
			prodImage = tile.find("a.prod-img img");
			prodImageAnchor = tile.find("a.prod-img");
			productNameElem = tile.find("div.product-details .product-name h3 a");
			productDetailBtn = tile.find("a.product-details-btn");
			pricePounds = tile.find("div.product-details div.price-spacing p.current-price span.pounds");
			pricePence = tile.find("div.product-details div.price-spacing p.current-price span.pence");
			buttonContainer = tile.find("div.product-details").find("div.button-container");
			sellerContainer = tile.find("div.product-details").find("p.sold-by");
			priceContainer = tile.find("div.product-details").find("div.old-price-container");
			currentlyUnavailableContainer = "div.product-availability-offers";
		}
		else if($(elem).parents("li.product-bb").length > 0){
			tile = $(elem).parents("li.product-bb");
			prodImage = tile.find("a.prod-img img");
			prodImageAnchor = tile.find("a.prod-img");
			productNameElem = tile.find("div.product-details .product-name h3 a");
			productDetailBtn = tile.find("a.product-details-btn");
			pricePounds = tile.find("div.product-price div.price-spacing p.current-price span.pounds");
			pricePence = tile.find("div.product-price div.price-spacing p.current-price span.pence");
			buttonContainer = tile.find("div.product-foot div.button-container");
			sellerContainer = tile.find(".product-purchase-intro");
			priceContainer = tile.find(".product-purchase-intro .from");
			currentlyUnavailableContainer = "div.special-offers-container"; 
		}
				
		thisTile = tile.data('tileid');
		pdpUrl = $(elem).attr("href");
		
		var myData = TESCO.PLP.Data[thisTile];
		
		siblings = $(elem).parents("ul.swatches").children("li");
		swatch = $(elem).parent("li");
		colourName = swatch.data("skuid");
		skuData = myData.colourInformation[colourName];
		skuId = skuData.skuid;
		productName = myData.productName;
				
		/* 
		 * JSON object modified to hold sku-name for given swatch i.e. added skuname key in skuData JSON, 
		 * title will now show sku-name and not product name with colour and variant value (fullname commented below)
		 * url will have sku-name for respective swatch attached rather than product name of tile
		 */
		pdpUrl = this.generateProductURL(myData, skuData);
		
		// Ajax call to get product image from JSP
		$.get('/' + TESCO.Utils.getSiteContext() + '/blocks/catalog/productImage.jsp?mediaSkuId=' + skuId + '&mediaType=Offers&showPromo=true&isBlinkBoxRequired=Y', function(resp) {
			prodImageAnchor.html(resp);
		});			
				
		$(siblings).removeClass("selected");		
		swatch.addClass("selected");		
		prodImageAnchor.attr("href", pdpUrl);		
		var myBuyButtonData = skuData['buyButtonInfo'];
		
		if (skuData.hasVariants === false) {
			secondaryVariantValue = skuData.secondaryVariantValue;
		}
		
		// fullProductName = this.getFullProductAndVariantName(productName, colourName, secondaryVariantValue);
		
		if(skuData.variantProdTitle && skuData.variantProdTitle!=null)
		 fullProductName = skuData.variantProdTitle;
		else
		 return false;
		
		//alert(fullProductName);
		//update product name
		this.updateProductName(productNameElem, fullProductName, pdpUrl);				
		
		// update "product details button"
		this.updateProductDetailsButton(productDetailBtn, fullProductName, pdpUrl);
		
		//update product price
		this.updateProductPrice(skuData.price, pricePounds, pricePence);
		
		// Update Buy button state		
		this.updateBuyButton(buttonContainer.find('div.buyButtonContainer'), skuData, fullProductName, pdpUrl);
		
		// Update Product comparison link
		this.updateProductCompare(tile, skuId, myData.productId, $(elem).attr("href"));
		
		priceContainer.html("");
		
		if(skuData.isSingleSeller === true) {
			if(skuData.isSinglePrice === false){
				priceContainer.append("<p class=\"from-text\">From</p>");
			}			
			sellerContainer.html("Buy from <strong>" + skuData.sellerName + "</strong>");
		}
		else {
			sellerContainer.html(TESCO.Data.PLP.BuyButton.Label.multipleSellers);
			priceContainer.append("<p class=\"from-text\">From</p>");
		}
		
		// If product hasVariants, always display from price.
		if (skuData.hasVariants === true) {
			if (!priceContainer.find('p.from-text').length) {
				priceContainer.append("<p class=\"from-text\">From</p>");
			}
		}
		
		// Add/Remove currently unavailable message
		this.showCurrentlyUnavailable(myBuyButtonData, currentlyUnavailableContainer, tile, skuData);
		
		// Get product image from JSP
		(function(tile, productNameElem, skuData) {
			setTimeout(function() {
				TESCO.PLP.realignProductTileRow(tile, productNameElem, skuData);
			}, 25);
		})(tile, productNameElem, skuData);	
	},
	showCurrentlyUnavailable: function(myBuyButtonData, currentlyUnavailableContainer, $tile, skuData) {
		$tile.find('div.product-availability-offers-stock').remove();		
		if (myBuyButtonData['P_Current_Button'] === 'emwbis') {			
			var $newElem = $('<div class="product-availability-offers-stock"><p class="out-stock">Currently unavailable</p></div>');
			$tile.find(currentlyUnavailableContainer).append($newElem);
		}	
	},
	generateProductURL: function(myData, skuData) {
		 // var pdpUrl = '/' + TESCO.Utils.getSiteContext() + '/' + myData.productName + '/' + myData.productId + '.prd?pageLevel=';		
		var pdpUrl = '/' + TESCO.Utils.getSiteContext() + '/' + skuData.variantProdTitle + '/' + myData.productId + '.prd?pageLevel=';
		pdpUrl = TESCO.Utils.formatURL(pdpUrl);
		if (myData.listingType === 'Aggregated') {			
			if (skuData.hasVariants === false) {
				pdpUrl += '&skuId=' + skuData.skuid;
			}
			else {
				pdpUrl += '&showRvSkuImage=true&rvSku=' + skuData.skuid;				
			}
		}
		else {			
			if (skuData.hasVariants === false) {
				pdpUrl += '&skuId=' + skuData.skuid;
			}
			else {
				pdpUrl += '&rvSku=' + skuData.skuid + '&selectedVariantValue=' + skuData.colourName;
			}
		}
				
		return pdpUrl;
	},
	updateProductCompare: function($productTile, skuID, productID, productURL) {
		//var newProductCompareURL = '';
		//var currentHREF = $productTile.find('div.add-to-list a.checklink').attr('href');		
		var dynSessConf = $productTile.find('input[name="_dynSessConf"]').val();
		productURL = encodeURIComponent(productURL);
		var newProductCompareURL = '/' + TESCO.Utils.getSiteContext() + '/search-results/results.page?_DARGS=/blocks/catalog/productlisting/variantsGridItem.jsp_A&_DAV=' + skuID + '|' + productID + '|' + encodeURIComponent(TESCO.Utils.formatURL(productURL)) + '&_dynSessConf=' + dynSessConf + '&product=' + skuID + '|' + productID + '|' + encodeURIComponent(TESCO.Utils.formatURL(productURL)) + '&queryString=' + escape(window.location.search.replace("?", ""));	
		$productTile.find('div.add-to-list a.checklink').attr('href', newProductCompareURL);
		
		var oProductCompare = TESCO.Common.compare[TESCO.Common.compare.length-1];
		oProductCompare.addProduct($productTile);
	},
	updateProductPrice: function(skuPrice, $pricePounds, $pricePence) {		
		var priceArr;		
		skuPrice = skuPrice.toFixed(2);		
		priceArr = skuPrice.split(".");		
		$pricePounds.html(priceArr[0]);
		$pricePence.html(priceArr[1]);
	},
	updateProductName: function($productNameElem, fullProductName, pdpUrl) {		
		$productNameElem.html(fullProductName);
		$productNameElem.attr("href",pdpUrl);
		$productNameElem.attr('title', fullProductName);
	},
	updateProductDetailsButton: function($productDetailBtn, fullProductName, pdpUrl) {		
		$productDetailBtn.attr('title', fullProductName)
		$productDetailBtn.attr('href', pdpUrl);
	},	
	updateBuyButton: function($buttonContainer, skuData, fullProductName, pdpUrl) {			
		var myBuyButtonData = skuData['buyButtonInfo'];		
		var switchCase = myBuyButtonData['P_Current_Button'];
		this.removeAllButtons($buttonContainer);
		
		// Sku cannot be identified
		if (switchCase === 'buy' || switchCase === 'preOrder') {
			if (skuData.hasVariants) {
				switchCase = 'default';		
			}
		}
		
		switch (switchCase) {
			case "buy": this.setBuyButton($buttonContainer, myBuyButtonData, fullProductName, pdpUrl);
						break;
			case "emwbis": this.setRequestStockAlert($buttonContainer, myBuyButtonData, fullProductName, pdpUrl);
							break;
			case "preOrder": this.setBuyButton($buttonContainer, myBuyButtonData, fullProductName, pdpUrl);
							this.setPreOrder($buttonContainer, myBuyButtonData, fullProductName, pdpUrl);
							break;
			default: this.setSelectOptions($buttonContainer, myBuyButtonData, fullProductName, pdpUrl);
					break;
		}
	},
	removeAllButtons: function($buttonContainer) {
		// Remove all button combination from the button container
		$buttonContainer.find('input.btn-add-to-basket, a.btn-request-stock-alert, a.btn-select-options').remove();
	},
	removeATGFields: function($buttonContainer) {
		// Remove ATG specific fields for adding to basket
		$buttonContainer.find('input[name="/atg/commerce/order/purchase/CartModifierFormHandler.addItemToOrder"], input[name="_D:/atg/commerce/order/purchase/CartModifierFormHandler.addItemToOrder"]').remove();		
	},
	setBuyButton: function($buttonContainer, myBuyButtonData, fullProductName, pdpUrl) {
		var $buyButton;
		var scriptName = 'variantsGridItem.jsp';
		this.removeATGFields($buttonContainer);

		//Update hidden form value
		$buttonContainer.find('input[name="/atg/commerce/order/purchase/CartModifierFormHandler.catalogRefIds"]').val(myBuyButtonData['P_Least_Cost_Listing_Id']);
		//$buttonContainer.find('input[name="/atg/commerce/order/purchase/CartModifierFormHandler.addItemToOrderErrorURL"]').val(myBuyButtonData['P_Least_Cost_Listing_Id']);
		if (this.isListView()) {
			scriptName = 'variantsListItem.jsp';
		}
		//Update form action
		//var DARGSVal = '/blocks/catalog/productlisting/' + scriptName + '.addToBasket_PLP_O' + myBuyButtonData['P_Least_Cost_Listing_Id'];
		//var updatedParameter = '/direct/search-results/results.page?_DARGS=' + DARGSVal;
		//$buttonContainer.find('form').attr('action', updatedParameter);
		//$buttonContainer.find('input[name="_DARGS"]').val(DARGSVal);
		
		var $addToBasketButton = $('<input type="submit" class="button basket-large btn-add-to-basket" value="' + TESCO.Data.PLP.BuyButton.Label.addToBasket + '" name="/atg/commerce/order/purchase/CartModifierFormHandler.addItemToOrder" title="Add ' + fullProductName + ' to Basket">');
		var $ATGfields = $('<input type="hidden" name="/atg/commerce/order/purchase/CartModifierFormHandler.addItemToOrder" value="submit" /><input type="hidden" name="_D:/atg/commerce/order/purchase/CartModifierFormHandler.addItemToOrder" value=" " /><input type="hidden" name="_D:/atg/commerce/order/purchase/CartModifierFormHandler.addItemToOrder" value=" " />');
		
		$buttonContainer.find('form').find('div:last').before($ATGfields).prev().before($addToBasketButton);
	},

	setRequestStockAlert: function($buttonContainer, myBuyButtonData, fullProductName, pdpUrl) {
		var $stockAlertButton = $('<a class="button basket-large btn-request-stock-alert" href="' + pdpUrl + '" title="request stock alert for ' + fullProductName + '"> ' + TESCO.Data.PLP.BuyButton.Label.requestStockAlert + '</a>');
		$buttonContainer.append($stockAlertButton);
	},

	setPreOrder: function($buttonContainer, myBuyButtonData, fullProductName, pdpUrl) {
		//var $preOrderButton = $('<a class="button basket-large btn-select-options" href="' + pdpUrl + '" title="' + fullProductName + '"> ' + TESCO.Data.PLP.BuyButton.Label.preOrder + ' </a>');
		var $preOrderButton = $buttonContainer.find('input.btn-add-to-basket');
		$preOrderButton.val(TESCO.Data.PLP.BuyButton.Label.preOrder);
		//$buttonContainer.append($preOrderButton);
	},
	setSelectOptions: function($buttonContainer, myBuyButtonData, fullProductName, pdpUrl) {
		var $selectOptionsButton = $('<a class="button basket-large btn-select-options" href="' + pdpUrl + '" title="' + fullProductName + '"> ' + TESCO.Data.PLP.BuyButton.Label.selectOptions + ' </a>');		
		$buttonContainer.append($selectOptionsButton);		
	},
	getFullProductAndVariantName: function(productName, colourName, secondaryVariantValue) {
		var newName = '';
		newName = productName + ' - ' + colourName;
		if (secondaryVariantValue !== '') {
			newName += ', ' + secondaryVariantValue;
		}
		return newName;
	},
	trapPLPEvents: function() {		
		/* Expand and collapse colour swatches drop down */
		$('div.primary-content').delegate('div.drop-down-container .drop-down-arrow', 'click', function(e){
			TESCO.PLP.toggleDropDown($(this), true);
			return false;
		});
		
		/* Handle click on colour swatches */
		$('div.primary-content').delegate(".product-variants ul.swatches li a", "click", function(e){			
			e.preventDefault();
			TESCO.PLP.moveRowToTop($(this), true);
			TESCO.PLP.setTileInfo(this);	
			return false;
		});
		
		/* Handle a click event to close all open swatch drop downs */
		$(document).click(function(e) {
			$('#product-tile-container li').find('div.expanded').find('div.drop-down-arrow').trigger('click');			
		});		
	},
	toggleDropDown: function($elem, bReset) {
		var $dropDown = $elem.parent();		
		if($dropDown.hasClass("collapsed")){
			$dropDown.removeClass("collapsed").addClass("expanded");
			this.resetDropDown($dropDown);
		}
		else {
			$dropDown.removeClass("expanded").addClass("collapsed");
			this.moveRowToTop($dropDown.find('li.selected a'), false);
		}
	},
	closeDropDown: function($dropDown) {		
		$dropDown.removeClass("expanded").addClass("collapsed");
	},
	resetDropDown: function($dropDown) {
		$dropDown.find('ul.drop-down').css('top', '0px');
	},
	isDropDownExpanded: function($dropDown) {
		return $dropDown.hasClass('expanded') ? true : false;
	},
	moveRowToTop: function($elem, bToggleDropDown) {		
		var $mySwatch = $elem.parent();
		
		// Drop down is present for this product tile
		if ($mySwatch.parents('div.drop-down-container')) {				
			var $variantSwatches = $elem.parent().parent().children();		
			var myIndex = $variantSwatches.index($mySwatch); 
			var myRow = Math.floor(myIndex / 6); // divider is the amount of swatches per row			
			if (myRow !== 0) {
				if (this.isDropDownExpanded($mySwatch.parents('div.drop-down-container'))) {
					if (bToggleDropDown) {
						TESCO.PLP.toggleDropDown($mySwatch.parents('div.drop-down-container').find('div.drop-down-arrow'), false);
					}
				}			
				
				$mySwatch.parent().css('top', -(myRow * this.swatchHeight));
			}
			else {
				this.closeDropDown($mySwatch.parents('div.drop-down-container'));
			}
		}
	},
	getProductTileRow: function($gridItems, $productTile) {
		return Math.ceil(($gridItems.index($productTile) + 1) / 4);
	},	
	realignProductTileRow: function($tile, $productNameElem, skuData) {
		var oProps = TESCO.Common.getGridViewProperties();
		var variantName = " - " + skuData.colourName;
		if (skuData.hasVariants === false) {
			if (skuData.secondaryVariantValue !== '') {
				variantName += ", " + skuData.secondaryVariantValue;
			}
		}		
		
		TESCO.Utils.formatVariantStyleAndName($productNameElem, variantName);		
		var gridItems = $('#product-tile-container li.product');
		var productTileRow = this.getProductTileRow(gridItems, $tile);
		TESCO.Common.performRowCalculations(gridItems, 4, oProps, productTileRow);
	},
	isListView: function() {
		return window.location.href.indexOf("View=list") >= 0 ? true : false;		
	}
};

TESCO.PLP.Data = {};

/***
 * Base module to control variants on PDP
 */

TESCO.extend( 'Variants', {
    
    init: function() {
		this.hideUpdateButton();
    	this.initFramework();
        this.bindVariants();
        this.bindBVReviewLink();
        this.handleURLChange();
        //this.formatProductTitle();
        //this.bindHashChange();
    },
    initFramework: function() {    	
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

		TESCO.Data.Global.init({
			'inlineRequests': _myInlineRequests,
			'requests': _myRequests,
			'modules': _myModules,
			'actions': _myActions,
			'defaultActions': _myDefaultActions			
		});
    	
    },   
    generateURL: function() {
    	var myURL = "#";    	
    	$('div.vContainer').each(function(i, e) {
    		//Set var of select box value
    		var myVal = encodeURIComponent($(this).find('select').val());
    		if (myVal === "undefined") {
    			//We have colour swatches instead
    			myVal = encodeURIComponent($(this).find('li > a.activeEffect').attr('value'));
    		}
    		if (myVal !== undefined) {
    			myURL += "&" + $(this).attr('id') + "=" + myVal;
    		}
    	});
    		
    	TESCO.Utils.updateHashedURL(myURL);
    },
    handleURLChange: function() {
    	var myURL = window.location.href;    	
    	var myHashURL = TESCO.Utils.getHashURL(myURL);    	
    	myHashURL = myHashURL.replace('#', '');    	
    	if (myHashURL !== '') {
    		var myHashParams = TESCO.Utils.getURLParams(myHashURL);    		
    		var $triggerElem;
    		$.each(myHashParams, function(k, v) {    			
    			var $eC = $('#' + k).find('select');
    			v = decodeURIComponent(v);
    			if ($eC.length) {
    				//We have found a select    				
    				$eC.val(v);    				
    			}   
    			else {
    				// we have colour swatch or button style
    				$eC = $('#' + k).find('li > a').removeClass('activeEffect').filter('[value="' + v + '"]').addClass("activeEffect");
    			}
    			$triggerElem = $eC;
    		});  
    		if ($triggerElem) {
    			TESCO.Variants.selectVariant($triggerElem);
    		}
    	}
    },
    bindVariants: function() {                
        $('body').delegate("#variants ul li a", "click", function(e) {
            e.preventDefault();
            TESCO.Variants.selectVariant($(this));
            return false;
        });
        
        $('body').delegate("#variants select", "change", function(e) {
            e.preventDefault();
			// Added clause to stop firing ajax request if the user selects default option, i.e. "please select colour"
			//if ($(this).val() !== '') {
           		TESCO.Variants.selectVariant($(this));
            //}
            return false;
        });
                
        
        $('body').delegate("#variants ul li a", "mouseover", function() {            
            if(!$(this).hasClass('activeEffect') ) {
                $(this).addClass('hoverEffect');
            }
        });
        
        $('body').delegate("#variants ul li a", "mouseout", function() {
            $(this).removeClass('hoverEffect');
        });          
                
    },
    bindBVReviewLink: function() {
    	$('body').delegate('#BVRRRatingSummaryLinkWriteID a, #BVRRRatingSummaryLinkWriteFirstPrefix a, #BVRRRatingSummaryLinkWriteFirstID a', 'click', function(e) {    		
    		TESCO.Variants.generateURL();
    		return true;
    	});
    },
    hideUpdateButton: function() {
    	$("input.btn-variant-update").hide();
    },
    selectVariant: function(oElem) {
        var _request = 'selectVariant';
        var _oForm = TESCO.Utils.getFormByElement(oElem);
        var _url = TESCO.Utils.getAction(_request, _oForm);
        var DL = new TESCO.DataLayer();        
                
        /*** 
         * Method sets the selected element and updates its corresponding hidden input with its value/title/name to be serialized 
         */
        this.setHiddenInputs(_oForm, oElem);        
        var _myData = _oForm.serialize();        
        /*
         * Form serialize only hidden fields. And ATG expect all fields in form to be submitted.
         * If Javascript is enabled and we are on variant product which has drop down, then 
         * submit button won't be submitted. Because we hide 'Update' button by setting 
         * "display=none" by detecting element using ".hasJS input.btn-variant-update" selector.
         * In such case, below logic will add submit field to form data. (JQ34)
         */
        var $eC = $("input.btn-variant-update");
        if($eC.is(':hidden') && $eC.attr('type') != "hidden") {
        	_myData += '&' + $eC.attr('name') + '=' + $eC.val();
        }

        //_myData += this.getVariantsParameters(_oForm, oElem);      
        DL.get(_url, _myData, oElem, TESCO.Variants.Data, _request, null, null, function() {
        	TESCO.Variants.hideUpdateButton();
        	document.title=$('#product-title h1').text();
        	//TESCO.Variants.formatProductTitle();
        	if (TESCO.Wishlist) {
        		TESCO.Wishlist.bindWishlistTooltip();	
        	}
        	TESCO.Common.regiserForAlertsTooltip();
        	//alert('inside AJAX');
        	$('.jt-tooltip.tooltip-position-below').css('display','none');
        	TESCO.Variants.variantsTooltip();
        });
    },
    formatProductTitle: function() {
    	var myProductTitleHeight = 58;    	
    	if ($('#product-title h1').height() > myProductTitleHeight) {
    		$('#product-title h1').ellipsis(myProductTitleHeight);
    		var productInfo = $('#product-title h1').text();
        	var variantInfo = $('#variantLabel').text();        	
        	var newProductText = productInfo.substring(0, productInfo.length - (variantInfo.length));    	
        	$('#product-title h1').text(newProductText + "..." + variantInfo);
    	}
    },
    setHiddenInputs: function(oForm, oElem) {
		$('input[name="' + oElem.attr('name') + '"]').val(this.getVariantValue(oElem)); 
		$('input[name="lastSelected"]').val(oElem.attr('name'));
		/*if (oElem.hasClass('unavailable') || oElem.find(':selected').text().indexOf(' - unavailable') > 0) {
			$('input[name="unavailableVariant"]').val(oElem.attr('name'));
		}*/
		this.setAdditionalVariantHiddenInputs(oForm, oElem);
	},
    setAdditionalVariantHiddenInputs: function(oForm, oElem) { 
		oForm.find('a.activeEffect').not(oElem).each(function(i, e) {        	
			var $self = $(e);
			if ($self.attr('name') !== oElem.attr('name')) {
				$('input[name="' + $self.attr('name') + '"]').val(TESCO.Variants.getVariantValue($self));
			}
        });                
    },
    getVariantValue: function(oElem) {
        if ($(oElem).is("select")) {
            return $(oElem).val(); 
        }   
        else {
            // More than likely going to be a link
            return $(oElem).attr('value') ? $(oElem).attr('value') : $(oElem).attr('name');
        }           
    },
    variantsTooltip: function(){
        $(".multi-line-swatches ul li a").each(function(i, e){
        	if($(this).hasClass('disabled')) {
                var me = $(e);
                $(e).tooltip({                
                	initiate: 'hover',
                	bindInternalEvents: false,
                	autohide: true,                    
                    tooltip: $(e).find('.image span'),
                    beforeShow: function(settings) {
                        if(settings.trigger.hasClass('disabled')){
                            settings.trigger.attr("title", '');
                            return settings.trigger.hasClass('disabled');
                        }
                        else{
                        	settings.tooltip.hide();
                        }
                    }
                });
        	}
       });
		$(".v-size ul li a").each(function(i, e){
	          var me = $(e);
	          $(e).tooltip({
	        	  initiate: 'hover',
	        	  bindInternalEvents: false,
	              autohide: true,                   
	              tooltip: $(e).find('span'),
	              beforeShow: function(settings) {
                	  if(settings.trigger.hasClass('unavailable')){
                          settings.trigger.attr("title", '');
                          return settings.trigger.hasClass('unavailable');
                      }
                      else if(settings.trigger.hasClass('input-disabled')){
                          settings.trigger.attr("title", '');
                          return settings.trigger.hasClass('input-disabled');
                      }
                      else{
                    	  settings.tooltip.hide();
                      }
	              }
	          });
			/*
			 if($(this).hasClass('unavailable') ) {
	          var me = $(e);
	          me.tooltip({                
	              autohide: true,
	              bindInternalEvents: false, 
                  //refreshToolTip: true,
                  ajaxContent: function() { return TESCO.Variants.selectVariant(e); }, 
	              tooltip: me.find('span'),
	              beforeShow: function(settings) {
	                  if(settings.trigger.hasClass('unavailable')){
	                      settings.trigger.attr("title", '');
	                      return settings.trigger.hasClass('unavailable');
	                  }
	                  else{
	                      return false;
	                  }
	              }
	          });
		  	}
		  	*/
	   });
    }
});

/***
 * Data handler must be present on all AJAX requests being sent. Callback on Ajax get method  
 */
TESCO.Variants.Data = {
     /*** 
    *   From the oElem (DOM element which triggered data), we can determine which module has been triggered and which, if applicable, delivery group.
    **/
    handler: function(oJSON, oElem) {
        // Based on JSON response, we need to look up each element in object, relate it to the module and then lookup the module for the DOM element                
        $.each(oJSON, function(k, v) {
            // Bazaar Voice
            if( k === 'bazaarVoiceProductId') {
            	// Added inner clause to stop issue in local where BV does not init
            	if (window.BAZAAR) {            
	                var bazaarVoiceProductElem = $('#productId');
	                if(bazaarVoiceProductElem){
	                    bazaarVoiceProductElem.val($.trim(v));
	                    window.BAZAAR.init();
	                }
            	}
            	return;
            }
            
            if (k === 'analytics') {
                if (TESCO.Analytics) {
	            	var _oWebAnalytics = new TESCO.Analytics.WebMetrics();
	                _oWebAnalytics.submit(v);
                }
                return;
            }
            
        	// Get the module DOM element
            // Get Module information, dom element, message and if it is a global element
            var _myModuleInfo = TESCO.Utils.getModuleInformation(k);
            var _myModuleSelector = _myModuleInfo[0];
            
            /***
             * If module being updated is scene7, then we need to bypass cleanMarkup as it contains script tags to initiate 
             * the viewer
             */            
            if (k === 'scene7') {
                var _markup = v;
            }
            else {
                var _markup = TESCO.Variants.Data.cleanMarkup(v);   
            }
            // Update DOM with markup returned
            
            try {
                // Do not allow no html to be inserted
                if (_markup != '') {
                    if (_myModuleInfo[4] === true) {
                        $(_myModuleSelector).replaceWith(_markup);
                    }
                    else {
                        $(_myModuleSelector).get(0).innerHTML = _markup;
                    }
                }
            }
            catch(e) {
                
            }
        });
    },
    cleanMarkup: function(sHTML) {              
        if (sHTML != null) {
            return sHTML.replace(/<(script|style|title)[^<]+<\/(script|style|title)>/gm, '').replace(/<(link|meta)[^>]+>/g,'');
        }
        else {
            return '';
        }
    }    
}

$().ready(function() {
    // Module check is required before every init as the module may not be required.
    
    var PLPPage = $("#product-tile-container");
    	
	if ($('#main-prod-details').length) {
	     TESCO.Variants.init();
	     TESCO.Variants.variantsTooltip();
	     if ($.browser.msie) {
	        $('select')._ie_select();
	     }
	};
	
	if(PLPPage.length){
		TESCO.PLP.init();
	};
	
});

// IE select box fix plugin
(function($) {

      $.fn._ie_select=function() { 
      
        return $(this).each(function() { 
        
          var a = $(this),
              p = a.parent();
        
          p.css('position','relative');
        
          var o = a.position(),
              h = a.outerHeight(),
              l = o.left,
              t = o.top;
        
          var c = a.clone(true);
        
          $.data(c,'element',a);
        
          c.css({
            zIndex   : 100,
            height   : h,
            top      : t,
            left     : l,
            position : 'absolute',
            width    : 'auto',
            opacity  : 0
          }).attr({
            id    : this.id + '-clone',
            name  : this.name + '-clone'
          }).change(function() {
            $.data(c,'element')
              .val($(this).val())
              .trigger('change')
          });
            
          a.before(c).click(function() { 
            c.trigger('click');
          });
        
        }); // END RETURN
      
      }; // END PLUGIN

      

})(jQuery);

