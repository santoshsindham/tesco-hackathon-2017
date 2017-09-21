/*globals define,require,window */
define([], function () {
    "use strict";


    var ProductVariantControllerPLP = function ProductVariantControllerPLP() {
    	var oAllVariantData = {},
    		oPRODUCT_TILE_SELECTORS = {
    			'seller': ""
    		}
    		oPRODUCT_TILE_LABELS = {
    			"addToBasket": "",
				"requestStockAlert": "",
				"preOrder": "",
				"selectOptions": "",
				"multipleSellers": ""
    		}
    		bindEvents,
    		appendData,
    		updatePrice,
    		updateProductTile,
    		renderCTA,
    		getVariantData,
            variantSwatchHandler;

    	bindEvents = function bindEvents() {
    		$('#listing').on('click', '.plpVariantSwatch', variantSwatchHandler)
    	};

        variantSwatchHandler = function variantSwatchHandler() {
            var sProductID = "",
                sSKUID = "",
                $elem = $(e.target),
                $productTile;

            if (!$elem.hasClass('selected')) {
                sProductID = getProductID($elem);
                sSKUID = getSKUID($elem);
                $productTile = getProductTile($elem);
                if (!(sProductID === "" || sSKUID === "")) {
                    updateProductTile($productTile, sProductID, sSKUID);
                }
            }
        };

        getProductID = function getProductID($elem) {
            if ($elem) {
                return $elem.parents('.swatches').data('productID');
            }
        };

        getSKUID = function getSKUID($elem) {
            if ($elem) {
                return $elem.data('skuID');
            }
        };

        getProductTile = function getProductTile($elem) {
            if ($elem) {
                return $elem.parents('.product-tile');
            }
        };


    	updateProductTile = function updateProductTile($productTile, sProductID, sSKU) {
    		var oAllVariantData = getVariantData(sProductID, sSKU);

    		getProductImage($productTile, sSKUID);
            updateProductURL($productTile);

    		renderPrice();
    		renderCTA();

	   	};

        renderProductImage = function renderProductImage($productTile, sImageMarkup) {
            var $tempImageDOM = $(sImageMarkup),
                $productTileImage = $productTile.find('.thumbnail img'),
                $returnedImage = $tempImageDOM.find('.static-product-image img').prop('src');
            $productTileImage.prop('src', $returnedImage.prop('src')).prop('alt', $returnedImage.prop('alt'));
        };

        getProductImage = function getProductImage(sSKUID) {
            $.get('/' + utils.getSiteContext() + '/blocks/catalog/productImage.jsp?mediaSkuId=' + sSKUID + '&mediaType=Offers&showPromo=true', function (sResponse) {
                renderProductImage(sResponse);
            });
        }

    	appendData = function appendData(oData) {

    	};


    	renderPrice = function renderPrice() {

    	}

    	getVariantLabels = function getVariantLabels() {

    	}

    	renderCTA = function renderCTA(oVariantData) {
            var $sellerContainer = $(oPRODUCTTILESELECTORS.seller);
            if (oVariantData.isSingleSeller === true) {
                $sellerContainer.html("Buy from " + oVariantData.sellerName);
            } else {
                $sellerContainer.html(oPRODUCT_TILE_LABELS.multipleSellers);
            }
            if (oVariantData.hasVariants === true) {
                if (!priceContainer.find('p.from-text').length) {
                    //priceContainer.append("<p class=\"from-text\">From</p>");
                }
            }
    	}

    	getVariantData = function getVariantData(sProductID, sSKU) {
    		if (oAllVariantData.length) {
    			return oAllVariantData[sProductID];
    		}
    	}

    	return  {
    		appendData: appendData
    	}


    };

    return ProductVariantControllerPLP;

})