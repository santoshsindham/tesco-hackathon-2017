/*globals define,require,window */
define([], function () {
    "use strict";

    function ProductVariant(oData) {
        this.skuID = oData.skuID || "";
        this.productID = oData.productID || "";
        this.variantValue = oData.variantValue || "";

        this.isSingleSeller = oData.isSingleSeller || false;
        this.isSinglePrice = oData.isSinglePrice || true;
        this.listingID = oData.listingID || "";
        this.price = oData.price || 0;
        this.sellerName = oData.sellerName || "";
        this.productTitle = oData.productTitle || "";
        this.CTAButton = oData.CTAButton || "buy";
    }

    return ProductVariant;
});