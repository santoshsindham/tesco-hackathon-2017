/* eslint-disable */
/* global define: true */
define(['domlib', 'modules/breakpoint', 'modules/common', 'modules/tesco.data', 'modules/tesco.utils', 'modules/product-tile/common', 'modules/page-title/common', 'modules/tesco.analytics', 'modules/product-description/common', 'require', 'modules/tile-carousel/common', 'modules/media-matrix/common', 'modules/pdp-s7viewer/common', 'modules/expand-collapse/common', 'modules/event-messaging/common', 'modules/jargon-buster/common', 'modules/html-parser/HtmlParser'], function ($, breakpoint, common, data, utils, productTile, pageTitle, analytics, pdp, require, carousel, mediaMatrix, s7viewer, expandCollapse, eventMessaging, jargonBuster, HtmlParser) {

    var colourSwatch = {
        maxToShowPerLine: 4,
        maxColours: 20,
        $swatches: null,
        myDataNS: window.Data,
        swatchHeight: 20,

        countColours: function () {
            var self = colourSwatch,
                $this,
                noOfColours = 0;

            $.each(colourSwatch.$swatches, function (index, value) {
                $this = $(this);
                noOfColours = $this.find('> li').length;
                if (noOfColours > self.maxToShowPerLine && noOfColours <= self.maxColours) {
                    $this.parent().find(' > .moreLink').css('display', 'block');
                    $this.parent().find('.swatches').addClass('more');
                } else if (noOfColours > self.maxColours) {
                    $this.parent().find('.mobile').css('display', 'block');
                }
            });
        },

        getSwatchDefaultHeight: function () {
            return colourSwatch.$swatches.parent().height();
        },

        unbindToggle: function () {
            colourSwatch.$swatches.find('li a').off('click');
        },

        bindToggle: function () {
            colourSwatch.$swatches.find('li a').on('click', function (e) {
                e.preventDefault();
                colourSwatch.setTileInfo(e);
                return false;
            });
        },

        hideColours: function ($container) {
            $container.closest('.product').removeClass('swatch-open');
            $container.parents('li').removeClass("colour-swatch-open");
            $container.closest('.product').find('.swatch-overlay').remove();
        },

        showColours: function ($container) {
            $container.closest('.product').addClass('swatch-open').append('<div class="swatch-overlay"></div>');
            $container.parents('li').addClass("colour-swatch-open");
            if (!$('.colour-swatch.open').length) {
                $(document).on('click.swatch', function () {
                    $(document).off('click.swatch');
                });
            }
        },

        swapIcon: function ($parent, icon) {
            $parent.find('.drop-down').text(icon);
        },

        fetchImage: function (e) {
            e.preventDefault();
            var skuid = $(e.currentTarget).data('skuid');
            var request = $.ajax({
                url: '',
                data: {
                    'skuid': skuid
                },
                success: function () {
                    colourSwatch.replaceImage.call(e.currentTarget, skuid);
                    if ($(e.target).closest('li').index() > 4) {
                        $(e.target).closest('li').prependTo($(e.target).closest('.swatches'));
                    }
                },
                error: function () {
                    //console.log('failed image request!');
                }
            });
            return false;
        },

        replaceImage: function (id) {
            $(this).parents('.product').find('.thumbnail img:not(.bcve_ping)').replaceWith(id);

        },

        init: function () {
            var self = colourSwatch;
            var selectedVariantElement;
            var _callDone = false;
            self.$swatches = $('.swatches');
            if (self.$swatches.length > 0) {
                colourSwatch.countColours();
                self.unbindToggle();
                self.bindToggle();
            }
        },

        setupPage: function ($productTiles) {
            if ($productTiles) {
                var varLists = $productTiles.find('ul.drop-down');
            } else {
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
            $productTiles.find('div.product-variants li.selected a').each(function (i, e) {
                TESCO.PLP.moveRowToTop($(e), false);
            });

        },

        getDataId: function (dataId) {
            return dataId.replace('pt-', '').replace('_', ':');
        },

        setTileInfo: function (e) {
         var tile, pdpUrl, savingPrice, variantSavingPrice, savingElem, formerPriceElem,
         fromLabel, variantWasWasPrice, variantWasPrice, wasPrice, wasWasPrice, productName, productNameElem,
         prodImage, prodImageAnchor, prodPingImageElem, prodPingImage,
         pingImage, productDetailBtn, pricePounds, pricePence, pageView,
         thisTile, siblings, swatch, skuId, skuData, newPrice, priceArr,
         colourName, priceContainer, buttonContainer, sellerContainer,
         selectOptionButton, currentlyUnavailableContainer, imgContainerElem, buyBoxElem,
               elem = $(e.target).closest('a'),
               self = colourSwatch,
               $buyButton,
               secondaryVariantValue = '',
               fullProductName = '',
               bPersonalisableProduct = false,
               imgPortraitView,
               imgPortraitViewXL,
               mediaType;

            self.myDataNS = window.Data || {};

            tile = $(elem).parents(".product");
            prodImageAnchor = tile.find("a.thumbnail");
            prodImage = prodImageAnchor.find("img");
            productNameElem = tile.find(".title-author-format h3 a");
            prodPingImageElem = tile.find(".product-ping img");
            imgContainerElem = tile.find(".image-container");
            price = tile.find(".price");

            buyBoxElem = tile.find(".buy-box-container");
            formerPriceElem = tile.find(".former-prices-container");

            buttonContainer = tile.find(".button-container");

            sellerContainer = tile.find(".buy-block");
            currentlyUnavailableContainer = ".unavailable";

            dataId = tile.parent().prop('id');
            dataId = self.getDataId(dataId);

            pdpUrl = $(elem).prop("href");

            var myData = self.myDataNS.PLP.Data[dataId];

            siblings = $(elem).parents("ul.swatches").children("li");
            swatch = $(elem).parent("li");
            colourName = swatch.data("skuid");
            skuData = myData.colourInformation[colourName];

            if (skuData.pingInfoMap) {
              prodPingImage = skuData.pingInfoMap.smallPingURL;
            }

            if (skuData.hasVariants === true) {
              fromLabel = 'from';
            } else {
              fromLabel = '';
            }

            savingPrice = skuData.saving;
            variantSavingPrice =  skuData.minSaving;
            variantWasWasPrice = skuData.minWasWasPrice;
            variantWasPrice = skuData.minWasPrice;
            wasWasPrice = skuData.wasWasPrice;
            wasPrice = skuData.wasPrice;
            skuId = skuData.skuid;
            productName = myData.productName;
            isbcve = prodImageAnchor.data('bcve');

            /*
             * JSON object modified to hold sku-name for given swatch i.e. added skuname key in skuData JSON,
             * title will now show sku-name and not product name with colour and variant value (fullname commented below)
             * url will have sku-name for respective swatch attached rather than product name of tile
             */
            pdpUrl = self.generateProductURL(myData, skuData, e);
            imgPortraitView = $(elem).parents('#listing.grid-33321.imagePreset-portrait');
            imgPortraitViewXL = $(elem).parents('#listing.grid-33321.imagePreset-portraitxl');

            if (imgPortraitViewXL.length) {
                mediaType = 'Portrait-XL';
            } else if (imgPortraitView.length) {
                mediaType = 'Portrait-L';
            } else {
                mediaType = 'Offers';
            }

            // Ajax call to get product image from JSP
            $.get('/' + utils.getSiteContext() + '/blocks/catalog/productImage.jsp?mediaSkuId=' + skuId + '&mediaType=' + mediaType + '&showPromo=true&isBlinkBoxRequired=Y', function (resp) {
                colourSwatch.replaceImage.call(elem, resp);

                var $elemUrl = $(elem).attr('href'),
                    prodImg = $(elem).closest('.image-container').find('.thumbnail');

                prodImg.attr('href', $elemUrl);
                productTile.Height.setHeadingHeights(elem.parents('.product-tile .details-container .title-author-format'));
                productTile.Ellipsis.init($('.title-author-format').find('h3'));

                $('.moreLink').attr('href', $elemUrl);

                if ($(elem).closest('li').index() > colourSwatch.maxToShowPerLine) {
                    $(elem).closest('li').prependTo($(elem).closest('.swatches'));
                }
            });

            //Move swatch row to be visible
            //self.moveRowToTop(elem, true);

            $(siblings).removeClass("selected");
            swatch.addClass("selected");
            prodImageAnchor.prop("href", pdpUrl);
            var myBuyButtonData = skuData['buyButtonInfo'];

            bPersonalisableProduct = $.trim(tile.find('.secondary-button').text()) === "Personalise me"
                ? true
                : false;

            if (bPersonalisableProduct) {
                if (skuData['buyButtonInfo'].P_Current_Button !== "emwbis") {
                    skuData['buyButtonInfo'].P_Current_Button = "personalise";
                }
            }

            if (skuData.hasVariants === false) {
                secondaryVariantValue = skuData.secondaryVariantValue;
            }

            fullProductName = self.getFullProductAndVariantName(productName, colourName, secondaryVariantValue);

            if (skuData.variantProdTitle && skuData.variantProdTitle != null) {
                fullProductName = skuData.variantProdTitle;
            } else {
                //TODO: undo
                //return false;
            }

            //update product name
            self.updateProductName(productNameElem, fullProductName, pdpUrl);

            //update product price
            self.updateProductPrice(skuData.price, price, myData);

            self.updateProductPingImage(prodPingImage, prodPingImageElem, imgContainerElem, myData);

            // Update Buy button state
            if (!window.isKiosk()) {
                self.updateBuyButton(buttonContainer, skuData, fullProductName, pdpUrl);
                self.updateFormerPrice(wasPrice, wasWasPrice, variantWasPrice, variantWasWasPrice, fromLabel, buyBoxElem, myData, e);
                self.updateProductSavingPrice(savingPrice, variantSavingPrice, fromLabel, formerPriceElem, myData);
            }

            // Stop all propergation
            return false;
        },
        decideBuyFrom: function (skuData, sellerContainer, priceContainer) {
            if (skuData.isSingleSeller === true) {
                if (skuData.isSinglePrice === false) {
                    //priceContainer.append("<p class=\"from-text\">From</p>");
                }
                sellerContainer.html("Buy from " + skuData.sellerName);
            } else {
                sellerContainer.html(this.myDataNS.PLP.BuyButton.Label.multipleSellers);
                //priceContainer.append("<p class=\"from-text\">From</p>");
            }

            // If product hasVariants, always display from price.
            if (skuData.hasVariants === true) {
                if (!priceContainer.find('p.from-text').length) {
                    //priceContainer.append("<p class=\"from-text\">From</p>");
                }
            }

        },


        // updateFormerPrice function will update the was and wasWas prices in th buy-box container
        updateFormerPrice: function (
          wasPrice,
          wasWasPrice,
          variantWasPrice,
          variantWasWasPrice,
          fromLabel,
          $buyBoxElem,
          myData, e) {
          var messageString = '&nbsp; &pound;',
            priceWas = '',
            priceWasWas = '',
            formerPriceElem = $buyBoxElem.find('ol.former-prices'),
            self = colourSwatch;

          if (wasPrice > 0 || wasWasPrice > 0 || variantWasPrice > 0 || variantWasWasPrice > 0) {
            if (formerPriceElem.length > 0) {
              formerPriceElem.css('display', 'block');
            } else {
              $buyBoxElem.find('.former-prices-container').prepend("<ol class='former-prices'><li></li></ol>").css('display', 'block');
            }
          } else {
            if (formerPriceElem.length > 0) {
              formerPriceElem.remove();
            }
            if ($buyBoxElem.find('.saving').length > 0) {
              $buyBoxElem.find('.saving').remove();
            }
          }

          if (variantWasPrice > 0 || variantWasWasPrice > 0) {
            priceWas = variantWasPrice;
            priceWasWas = variantWasWasPrice;
          } else {
            priceWas = wasPrice;
            priceWasWas = wasWasPrice;
          }
          priceWas = priceWas.toFixed(2);
          priceWasWas = priceWasWas.toFixed(2);

          if (priceWas > 0) {
            $buyBoxElem.find('li').html('Was ' + fromLabel + messageString + priceWas);
            if (priceWasWas > 0) {
              $buyBoxElem.find('li').html('Was ' + fromLabel + messageString + priceWasWas + '&nbsp;|' + messageString + priceWas);
            }
          } else if (priceWasWas > 0) {
            $buyBoxElem.find('li').html('Was ' + fromLabel + messageString + priceWasWas);
          }
        },

        // This finds the product tiles in the row where any of the swatches was clicked.
        getRowTiles: function (e) {
          var rowElems = [],
            currentPrdTile = $(e.target).parents('div.product').parent('li');

          rowElems.push(currentPrdTile[0]);
          if (currentPrdTile.hasClass('row-start')) {
            while (currentPrdTile.next()[0] !== undefined && !currentPrdTile.next().hasClass('row-start')) {
              rowElems.push(currentPrdTile.next()[0]);
              currentPrdTile = currentPrdTile.next();
            }
          } else {
            if (currentPrdTile.next()[0] !== undefined && currentPrdTile.next().hasClass('feature-tile')) {
              rowElems.push(currentPrdTile.next()[0]);
            } else if (currentPrdTile.prev()[0] !== undefined && currentPrdTile.prev().hasClass('feature-tile')) {
              rowElems.push(currentPrdTile.prev()[0]);
            }
            while (currentPrdTile.next()[0] !== undefined && !currentPrdTile.next().hasClass('row-start')) {
              rowElems.push(currentPrdTile.next()[0]);
              currentPrdTile = currentPrdTile.next();
            }
            currentPrdTile = $(e.target).parents('li.product-tile');
            while (currentPrdTile.prev()[0] !== undefined && !currentPrdTile.prev().hasClass('row-start')) {
              rowElems.push(currentPrdTile.prev()[0]);
              currentPrdTile = currentPrdTile.prev();
            }
            if (currentPrdTile.prev()[0] !== undefined && !currentPrdTile.prev().hasClass('feature-tile')) {
              rowElems.push(currentPrdTile.prev()[0]);
            }
          }
          return $(rowElems);
        },

        updateProductPrice: function (myPrice, $priceElem, myData) {
            myPrice = myPrice.toFixed(2);
            var fromElement = $priceElem.find('.from');
            if (myData.showFromprice === true) {
                $priceElem.html('&nbsp' + '&pound;' + myPrice).prepend(fromElement);
            } else {
                $priceElem.html('&pound;' + myPrice);
            }
        },

        //updateProductPing will update the ping image corresponding to each swatch element on click. The data will be fed from JSON response coming in myData
        updateProductPingImage: function(pingImage, $prodPingImageElem, $imgContainerElem, myData) {
            if (pingImage !== undefined) {
                $prodPingImageElem.length > 0 ? $prodPingImageElem.css('display','block').prop('src', pingImage)
                : $imgContainerElem.append("<div class='product-ping' data-pfinit='true'><img src=" + pingImage + " alt='PriceMarkdownPings' /></div>");
                 } else {
            $imgContainerElem.find('.product-ping').remove();
            }
        },

        //updateProductSavingPrice will update the saving element to update the new struck off price of the swatch element

        updateProductSavingPrice: function (savingPrice, variantSavingPrice, fromLabel, $formerPriceElem, myData) {
          var savePrice = '',
            $savingPriceElem = $formerPriceElem.find('.saving');

          if (variantSavingPrice > 0) {
            savePrice = variantSavingPrice;
          } else {
            savePrice = savingPrice;
          }
          savePrice = savePrice.toFixed(2);
          if (savePrice > 0) {
            $savingPriceElem.length
              ? $savingPriceElem.html('Save ' + fromLabel + '&nbsp; &pound;' + savePrice)
              : $formerPriceElem.find('.former-prices').after("<p class='saving'>" +
                'Save ' + fromLabel + '&nbsp; &pound;' + savePrice + "</p>");
          } else {
            $savingPriceElem.remove();
          }
        },

        showCurrentlyUnavailable: function (myBuyButtonData, currentlyUnavailableContainer, $tile, skuData) {
            if (myBuyButtonData['P_Current_Button'] === 'emwbis') {
                $tile.find(currentlyUnavailableContainer).html(this.myDataNS.PLP.BuyButton.Label.currentlyUnavailable);
            } else {
                $tile.find(currentlyUnavailableContainer).html("");
            }
        },
        generateProductURL: function (myData, skuData, e) {
            var productId;

            if ($(e.currentTarget).closest('.product').data('isff') == true) {
                productId = skuData.productId;
            } else {
                productId = myData.productId;
            }

            var pdpUrl = '/' + utils.getSiteContext() + '/' + skuData.variantProdTitle + '/' + productId + '.prd';
            pdpUrl = utils.formatURL(pdpUrl);

            if (!$(e.currentTarget).closest('.product').data('isff')) {
                pdpUrl += '?skuId=' + skuData.skuid;
            }
            if ($(e.currentTarget).closest('.product').data('isff') && $(e.currentTarget).closest('.product').data('isues')) {
                var uesUrl = $(e.currentTarget).prop('href');
                uesId = uesUrl.split('.prd')[1];
                pdpUrl += uesId;
            }

            return pdpUrl;
        },
        updateProductCompare: function ($productTile, skuID, productID, productURL) {
            var dynSessConf = $productTile.find('input[name="_dynSessConf"]').val();
            productURL = encodeURIComponent(productURL);
            var newProductCompareURL = '/' + utils.getSiteContext() + '/search-results/results.page?_DARGS=/blocks/catalog/productlisting/variantsGridItem.jsp_A&_DAV=' + skuID + '|' + productID + '|' + encodeURIComponent(utils.formatURL(productURL)) + '&_dynSessConf=' + dynSessConf + '&product=' + skuID + '|' + productID + '|' + encodeURIComponent(utils.formatURL(productURL)) + '&queryString=' + escape(window.location.search.replace("?", ""));
            $productTile.find('.add-to-compare .text').attr('href', newProductCompareURL);
        },
        updateProductName: function ($productNameElem, fullProductName, pdpUrl) {
            $productNameElem.html(fullProductName);
            $productNameElem.prop("href", pdpUrl);
            $productNameElem.prop('title', fullProductName);
        },
        updateProductDetailsButton: function ($productDetailBtn, fullProductName, pdpUrl) {
            $productDetailBtn.prop('title', fullProductName)
            $productDetailBtn.prop('href', pdpUrl);
        },
        updateBuyButton: function ($buttonContainer, skuData, fullProductName, pdpUrl) {
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
                case "buy":
                    this.setBuyButton($buttonContainer, myBuyButtonData, fullProductName, pdpUrl);
                    break;
                case "emwbis":
                    this.setRequestStockAlert($buttonContainer, myBuyButtonData, fullProductName, pdpUrl);
                    break;
                case "preOrder":
                    this.setBuyButton($buttonContainer, myBuyButtonData, fullProductName, pdpUrl);
                    this.setPreOrder($buttonContainer, myBuyButtonData, fullProductName, pdpUrl);
                    break;
                case "personalise":
                    this.setButtonPersonalised($buttonContainer, myBuyButtonData, fullProductName, pdpUrl);
                    break;
                default:
                    this.setSelectOptions($buttonContainer, myBuyButtonData, fullProductName, pdpUrl);
                    break;
            }
        },
        removeAllButtons: function ($buttonContainer) {
            //Remove all button combination from the button container
            $buttonContainer.find('input.add-to-basket, a.stock-alert, a.btn-select-options').remove();
        },
        removeATGFields: function ($buttonContainer) {
            //Remove ATG specific fields for adding to basket
            $buttonContainer.find('input[name="/atg/commerce/order/purchase/CartModifierFormHandler.addItemToOrder"], input[name="_D:/atg/commerce/order/purchase/CartModifierFormHandler.addItemToOrder"]').remove();
        },
        setBuyButton: function ($buttonContainer, myBuyButtonData, fullProductName, pdpUrl) {
            var $buyButton;
            var scriptName = 'variantsGridItem.jsp';
            this.removeATGFields($buttonContainer);

            //Update hidden form value
            $buttonContainer.find('input[name="/atg/commerce/order/purchase/CartModifierFormHandler.catalogRefIds"]').val(myBuyButtonData['P_Least_Cost_Listing_Id']);

            var $addToBasketButton = $('<input type="submit" class="add-to-basket primary-button" value="' + this.myDataNS.PLP.BuyButton.Label.addToBasket + '" name="/atg/commerce/order/purchase/CartModifierFormHandler.addItemToOrder" title="Add ' + fullProductName + ' to Basket">');
            var $ATGfields = $('<input type="hidden" name="/atg/commerce/order/purchase/CartModifierFormHandler.addItemToOrder" value="submit" /><input type="hidden" name="_D:/atg/commerce/order/purchase/CartModifierFormHandler.addItemToOrder" value=" " /><input type="hidden" name="_D:/atg/commerce/order/purchase/CartModifierFormHandler.addItemToOrder" value=" " />');

            $buttonContainer.find('div:last').before($ATGfields).prev().before($addToBasketButton);
        },

        setRequestStockAlert: function ($buttonContainer, myBuyButtonData, fullProductName, pdpUrl) {
            var $stockAlertButton = $('<a class="stock-alert secondary-button" href="' + pdpUrl + '" title="request stock alert for ' + fullProductName + '"> ' + this.myDataNS.PLP.BuyButton.Label.requestStockAlert + '</a>');
            $buttonContainer.find('form').append($stockAlertButton);
        },

        setPreOrder: function ($buttonContainer, myBuyButtonData, fullProductName, pdpUrl) {
            var $preOrderButton = $buttonContainer.find('.btn-add-to-basket');
            $preOrderButton.val(this.myDataNS.PLP.BuyButton.Label.preOrder);
        },
        setSelectOptions: function ($buttonContainer, myBuyButtonData, fullProductName, pdpUrl) {
            var $selectOptionsButton = $('<a class="stock-alert secondary-button" href="' + pdpUrl + '" title="' + fullProductName + '"> ' + this.myDataNS.PLP.BuyButton.Label.selectOptions + ' </a>');
            $buttonContainer.find('form').append($selectOptionsButton);
        },
        setButtonPersonalised: function ($buttonContainer, myBuyButtonData, fullProductName, pdpUrl) {
            var $selectOptionsButton = $('<a class="stock-alert secondary-button" href="' + pdpUrl + '" title="' + fullProductName + '"> Personalise me </a>');
            $buttonContainer.find('form').append($selectOptionsButton);
        },
        getFullProductAndVariantName: function (productName, colourName, secondaryVariantValue) {
            var newName = '';
            newName = productName + ' - ' + colourName;
            if (secondaryVariantValue !== '') {
                newName += ', ' + secondaryVariantValue;
            }
            return newName;
        },
        moveRowToTop: function ($elem, bToggleDropDown) {
            var $mySwatch = $elem.parent();
            // Drop down is present for this product tile
            if ($mySwatch.parents('.colour-swatch')) {
                var $variantSwatches = $elem.parent().parent().children();
                var myIndex = $variantSwatches.index($mySwatch);
                var myRow = Math.floor((myIndex + 1) / this.maxToShowPerLine); // divider is the amount of swatches per row
                if (myRow !== 0) {
                    if (this.isDropDownExpanded($mySwatch.parents('.colour-swatch'))) {
                        if (bToggleDropDown) {
                            $mySwatch.parents('.colour-swatch').find('.drop-down').trigger('click');
                        }
                    }

                    $mySwatch.parents('.colour-swatch').css('top', -(myRow * this.swatchHeight));
                } else {
                    this.closeDropDown($mySwatch.parents('div.drop-down-container'));
                }
            }
        },
        getProductTileRow: function ($gridItems, $productTile) {
            return Math.ceil(($gridItems.index($productTile) + 1) / 4);
        },
        realignProductTileRow: function ($tile, $productNameElem, skuData) {
            var variantName = " - " + skuData.colourName;
            if (skuData.hasVariants === false) {
                if (skuData.secondaryVariantValue !== '') {
                    variantName += ", " + skuData.secondaryVariantValue;
                }
            }

            utils.formatVariantStyleAndName($productNameElem, variantName);
            productTile.Height.adjust($('#listing'));
        },
        closeDropDown: function ($dropDown) {
            $dropDown.removeClass("open");
        },
        resetDropDown: function ($dropDown) {
            $dropDown.find('.swatches').css('top', '0px');
        },
        isDropDownExpanded: function ($dropDown) {
            return $dropDown.hasClass('open')
                ? true
                : false;
        }
    };

    common.init.push(function () {
        colourSwatch.init();
    });

    return colourSwatch;
});
