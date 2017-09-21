/*jslint plusplus: true */
/*globals window,document,console,define,require, $ */
define('modules/promotions-manager/PromotionsManager', [], function () {
    'use strict';

    var PromotionsManager,
        Product,
        Seller,
        Promotion;

    PromotionsManager = function PromotionsManager() {
        this.aProducts = [];
    };

    PromotionsManager.prototype.createProducts = function createProducts(sSkuID, aSellersAndPromotionsData) {
        if (!sSkuID || !aSellersAndPromotionsData) {
            throw new Error("PromotionsManager: Missing skuID or no seller and promotions data received");
        }
        var self = this,
            oTempProduct = new Product(sSkuID, aSellersAndPromotionsData);
        self.aProducts.push(oTempProduct);
    };

    PromotionsManager.prototype.getSellerPromotionsData = function getSellerPromotionsData(sSkuID, sSellerID) {
        var i,
            j,
            oProduct,
            oSeller,
            aPromotions;

        for (i in this.aProducts) {
            if (this.aProducts.hasOwnProperty(i)) {
                oProduct = this.aProducts[i];
                if (oProduct.sSkuID && oProduct.sSkuID === sSkuID) {
                    for (j in oProduct.aSellers) {
                        if (oProduct.aSellers.hasOwnProperty(j)) {
                            oSeller = oProduct.aSellers[j];
                            if (oSeller.sSellerID && oSeller.sSellerID === sSellerID) {
                                aPromotions = oSeller.aPromotions;
                                return aPromotions;
                            }
                        }
                    }
                }
            }
        }
    };

    PromotionsManager.prototype.skuIdInArray = function skuIdInArray(sSkuID) {
        var i,
            oProduct;

        for (i in this.aProducts) {
            if (this.aProducts.hasOwnProperty(i)) {
                oProduct = this.aProducts[i];
                if (oProduct.sSkuID && oProduct.sSkuID === sSkuID) {
                    return true;
                }
            }
        }
    };

/************************************************************************************************************************/

    Product = function Product(sSkuID, aSellersAndPromotionsData) {
        this.sSkuID = sSkuID;
        this.aSellers = [];
        this.createSellers(aSellersAndPromotionsData);
    };

    Product.prototype.createSellers = function createSellers(aRawSellersAndPromotionsData) {
        var oTempSeller,
            sSellerID,
            aPromotions,
            i;

        if (Array.isArray(aRawSellersAndPromotionsData)) {
            for (i = 0; i < aRawSellersAndPromotionsData.length; i++) {
                sSellerID = aRawSellersAndPromotionsData[i].sellerId;
                aPromotions = aRawSellersAndPromotionsData[i].promotions;
                oTempSeller = new Seller(sSellerID, aPromotions);
                this.aSellers.push(oTempSeller);
            }
        } else {
            throw new Error("PromotionsManager: aRawSellersAndPromotionsData is not Array");
        }
    };

/************************************************************************************************************************/

    Seller = function Seller(sSellerID, aPromotionsData) {
        this.sSellerID = sSellerID;
        this.aPromotions = [];
        this.createPromotions(aPromotionsData);
    };

    Seller.prototype.createPromotions = function createPromotions(aRawPromotionsData) {
        var i,
            oTempPromotion;

        for (i = 0; i < aRawPromotionsData.length; i++) {
            oTempPromotion = new Promotion(aRawPromotionsData[i]);
            this.aPromotions.push(oTempPromotion);
        }
    };

/************************************************************************************************************************/

    Promotion = function Promotion(oRawPromotionData) {
        var oPromotionData = oRawPromotionData || {};
        this.displayName = oPromotionData.displayName !== null ? oPromotionData.displayName : "";
        this.description = oPromotionData.description !== null ? oPromotionData.description : "";
        this.linkSaveURL = oPromotionData.linkSaveURL !== null ? oPromotionData.linkSaveURL : "";
        this.customerInstructions = oPromotionData.customerInstructions !== null ? oPromotionData.customerInstructions : "";
        this.type = oPromotionData.type || {};
        this.voucherCode = oPromotionData.voucherCode || {};
        this.enableToggle = (this.description !== "" || this.linkSaveURL !== "" || this.customerInstructions !== "") ? true : false;
    };

    return PromotionsManager;
});