define(['domlib', 'modules/breakpoint'], function ($, breakpoint) {
  'use strict';

  var sponsored = {

    getPlatform: function () {
      breakpoint.init();
      breakpoint.check();
      return (breakpoint.mobile || breakpoint.vTablet || breakpoint.hTablet) ? 'mobile' : 'web';
    },
    submitHLRequest: function submitHLRequest(hookLogicAttr) {
      var abBucket = window.HLMVT ? window.HLMVT.abBucket ? window.HLMVT.abBucket : 'C' : 'C';

      if (window.HLLibrary !== undefined) {
        window.HLLibrary.newRequest()
         .setTaxonomy(hookLogicAttr.categoryId)
         .setModule('Listing')
         .setProperty('hlPageType', 'B')
         .setProperty('platform', this.getPlatform())
         .setProperty('pCount', hookLogicAttr.count)
         .setProperty('organicSKUs', hookLogicAttr.finalSkuList)
         .setProperty('cUserId', hookLogicAttr.customerId)
         .setProperty('pgSize', '20')
         .setProperty('pgN', '1')
         .setProperty('abtest', 'launch')
         .setProperty('abbucket', abBucket)
         .submit('hl_1');
      }
    },
    submitHLNewRequest: function submitHLNewRequest(hookLogicAttr) {
      var abBucket = window.HLMVT ? window.HLMVT.abBucket ? window.HLMVT.abBucket : 'C' : 'C';

      if (window.HLLibrary !== undefined) {
        window.HLLibrary.newRequest()
          .setTaxonomy(hookLogicAttr.categoryId)
          .setModule('PDP')
          .setProperty('cUserId', hookLogicAttr.customerId)
          .setProperty('hlPageType', 'P')
          .setProperty('platform', this.getPlatform())
          .setProperty('sku', hookLogicAttr.listingId)
          .setProperty('broadmatchtype', '2')
          .setProperty('required_filters', 'productid')
          .setProperty('abtest', 'launch')
          .setProperty('abbucket', abBucket)
          .submit('hl_1');
      }
    },
    submitHLUpdateRequest: function submitHLUpdateRequest(hookLogicAttr) {
      if (window.HLLibrary !== undefined) {
        window.HLLibrary.newUpdate()
         .setProperty('cUserId', hookLogicAttr.customerId)
         .setProperty('hlPageType', 'P')
         .setProperty('platform', this.getPlatform())
         .setProperty('parentsku', hookLogicAttr.productId)
         .setProperty('pgid', hookLogicAttr.skuId)
         .setProperty('productid', hookLogicAttr.listingId)
         .setProperty('regularPrice', hookLogicAttr.regularPrice)
         .setProperty('quantity', hookLogicAttr.quantity)
         .setProperty('price', hookLogicAttr.price)
         .submit();
      }
    },
    submitHLOrderRequest: function submitHLOrderRequest(hookLogicAttr) {
      if (window.HLLibrary !== undefined) {
        window.HLLibrary.newOrder()
         .setProperty('cUserId', hookLogicAttr.customerId)
         .setProperty('hlPageType', 'C')
         .setProperty('platform', this.getPlatform())
         .setProperty('parentsku', hookLogicAttr.productList)
         .setProperty('pgid', hookLogicAttr.pgidList)
         .setProperty('sku', hookLogicAttr.skuList)
         .setProperty('price', hookLogicAttr.priceList)
         .setProperty('quantity', hookLogicAttr.quantityList)
         .setProperty('orderId', hookLogicAttr.orderId)
         .submit();
      }
    },
    asyncBlockCallbacks: function asyncBlockCallbacks(hookLogicAttr) {
      var oCallbacks = {},
        _this = this;

      oCallbacks.success = function (oResp) {
        var resp = JSON.parse(oResp),
          _hookLogicAttr = hookLogicAttr;

        if (resp.Analytics) {
          _hookLogicAttr.customerId = resp.Analytics.eVar24 ? resp.Analytics.eVar24 : '';
          _this.sCustomerId = _hookLogicAttr.customerId;
        }

        _this.submitHLRequest(_hookLogicAttr);
      };
      return oCallbacks;
    }
  };

  return sponsored;
});
