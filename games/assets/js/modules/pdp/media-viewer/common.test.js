define([
  'domlib',
  'modules/mvc/fn',
  'modules/pdp/media-viewer/common',
  'modules/pdp/models/SkuModel',
  'test-framework/mocks/mocks'
], function ($, fn, mediaViewer, SkuModel, mocks) {
  'use strict';

  /***************************************************************************
   ** updatePing method ******************************************************
   ***************************************************************************/

  describe('updatePing method', function () {
    var dummyContent = 'Content to be removed...',
      pingData = {},
      pingElm = {},
      pingTmpl = '',
      pageController = {},
      skuModel = {},
      testData = '',
      SKU_24A_5X7U = {},
      SKU_227_5139 = {};

    pingData = {
      mediaType: 'PromotionPings',
      src: '//www.tesco.com/directuiassets/Merchandising/NonSeasonal/en_GB/banners/offer_banners/pings/Ping_2For7_$[preset]$.png'
    };


    beforeEach(function () {
      jasmine.getFixtures().fixturesPath = 'base/test-framework/fixtures/';
      loadFixtures('product-ping.html');
      appendSetFixtures('<div class="media-viewer--pings">' + dummyContent + '</div>');
      pingElm = $('.media-viewer--pings');
      pingTmpl = '#product-ping-template';

      SKU_24A_5X7U = fn.copyObject(mocks.skus['24A-5X7U'].data, { deep: true });
      SKU_227_5139 = fn.copyObject(mocks.skus['227-5139'].data, { deep: true });
      skuModel = new SkuModel();
      skuModel.setDataStores(SKU_24A_5X7U, SKU_227_5139);

      window.oAppController = {
        oPageController: {
          getModule: function () {},
          getActiveSku: function () {}
        }
      };

      pageController = window.oAppController.oPageController;

      spyOn(pageController, 'getModule').and.returnValue(skuModel);
      spyOn(skuModel, 'getListings').and.callThrough();
      spyOn(pingElm, 'html').and.callThrough();
      spyOn(window, 'picturefill');
    });


    afterEach(function () {
      skuModel = {};
    });


    describe('when a sku has no pings', function () {
      beforeEach(function () {
        spyOn(pageController, 'getActiveSku').and.returnValue(SKU_227_5139);

        testData = mediaViewer.updatePing(
          skuModel.getPings('227-5139', 'mediaType', 'PromotionPings'),
          pingTmpl,
          pingElm
        );
      });


      afterEach(function () {
        pingElm[0].innerHTML = dummyContent;
      });


      it('should return out of the function and clear the dom element', function () {
        expect(pingElm[0].innerHTML).toBe('');
        expect(testData).toBe(null);
      });
    });


    describe('when a sku has more than one listing', function () {
      beforeEach(function () {
        skuModel.setPing(SKU_227_5139, pingData);
        spyOn(pageController, 'getActiveSku').and.returnValue(SKU_227_5139);

        testData = mediaViewer.updatePing(
          skuModel.getPings('227-5139', 'mediaType', 'PromotionPings'),
          pingTmpl,
          pingElm
        );
      });


      afterEach(function () {
        skuModel.unsetPings('227-5139', 'mediaType', 'PromotionPings');
        pingElm[0].innerHTML = dummyContent;
      });


      it('should return out of the function and clear the dom element', function () {
        expect(pingElm[0].innerHTML).toBe('');
        expect(testData).toBe(null);
      });
    });


    describe('when a sku has pings and one listing', function () {
      var elements = {};

      beforeEach(function () {
        spyOn(pageController, 'getActiveSku').and.returnValue(SKU_24A_5X7U);

        testData = mediaViewer.updatePing(
          skuModel.getPings('24A-5X7U', 'mediaType', 'PromotionPings'),
          pingTmpl,
          pingElm
        );

        elements.$srcLarge = $(
          '[data-src="//www.tesco.com/directuiassets/Merchandising/NonSeasonal/en_GB/banners/offer_banners/pings/Ping_2For7_lg.png"]'
        );
        elements.$srcSmall = $(
          '[data-src="//www.tesco.com/directuiassets/Merchandising/NonSeasonal/en_GB/banners/offer_banners/pings/Ping_2For7_sm.png"]'
        );
      });


      afterEach(function () {
        elements = {};
      });


      it('should populate the template and render it in the dom', function () {
        expect(pingElm.html).toHaveBeenCalled();
        expect(pingElm.html.calls.count()).toBe(1);

        expect(window.picturefill).toHaveBeenCalled();
        expect(window.picturefill.calls.count()).toBe(1);

        expect(typeof testData).toBe('string');

        expect($('#product-ping-1234').length).toBe(1);

        expect(elements.$srcLarge.length).toBe(1);
        expect(elements.$srcLarge.data('media')).toBe('(min-width: 1200px)');

        expect(elements.$srcSmall.length).toBe(1);
        expect(elements.$srcSmall.data('media')).toBe('(max-width: 1199px)');
      });
    });
  });
});
