define(function (require) {
  'use strict';

  var ProductPage = require('modules/pdp/controllers/ProductPageController'),
    mocks = require('test-framework/mocks/mocks');

  /***************************************************************************
   ** _collateDataDependancies method ****************************************
   ***************************************************************************/

  describe('_collateDataDependancies method', function () {
    var ctlr = null,
      page = null;

    beforeAll(function () {
      page = new ProductPage();
      ctlr = page.getModule('controller', 'links', 'tabs');
      ctlr._hasPromos = function (mvcData) {
        var deferred = $.Deferred();

        mvcData.flags.tabs.hasPromos = true;
        deferred.resolve();
        return deferred.promise();
      };
      jasmine.Ajax.install();
    });

    afterAll(function () {
      jasmine.Ajax.uninstall();
    });

    describe('an F&F product', function () {
      var args = { deferred: null, mParamData: { mvc: { flags: {} } } },
        output = null;

      beforeEach(function (done) {
        jasmine.Ajax
          .stubRequest('/direct/rest/content/relationships/accessories/103-6643')
          .andReturn({ status: 200, responseText: JSON.stringify({ links: [] }) });

        jasmine.Ajax
          .stubRequest('/direct/rest/content/relationships/range/103-6643')
          .andReturn({ status: 200, responseText: JSON.stringify({ links: [] }) });

        args.deferred = $.Deferred();
        args.mParamData.mvc.products = mocks.products['395-9520'].data;
        args.mParamData.mvc.sku = mocks.skus['103-6643'].data;
        ctlr._collateDataDependancies(args);

        args.deferred.done(function (resp) {
          output = resp;
          done();
        });
      });

      it('should set the correct tab flags based on the product/sku information', function () {
        var flags = output.mParamData.mvc.flags.tabs;

        expect(flags.hasAccessories).toBe(false);
        expect(flags.hasBiography).toBe(false);
        expect(flags.hasBundle).toBe(false);
        expect(flags.hasCompleteTheLook).toBe(true);
        expect(flags.hasDetails).toBe(true);
        expect(flags.hasOutfitBuilder).toBe(false);
        expect(flags.hasPromos).toBe(true);
        expect(flags.hasReviews).toBe(false);
        expect(flags.hasShopTheRange).toBe(false);
        expect(flags.hasSpecs).toBe(false);
        expect(flags.hasSynopsis).toBe(false);
      });
    });

    describe('a GM product', function () {
      var args = { deferred: null, mParamData: { mvc: { flags: {} } } },
        output = null;

      beforeEach(function (done) {
        mocks.stubAndReturn('accessories', ['345-3729']);

        jasmine.Ajax
          .stubRequest('/direct/rest/content/relationships/range/345-3729')
          .andReturn({ status: 200, responseText: JSON.stringify({ links: [] }) });

        jasmine.Ajax
          .stubRequest('/direct/rest/inventory/sku/361-2760,515-7104?format=standard')
          .andReturn({
            status: 200,
            responseText: JSON.stringify({
              skus: [mocks.inventory.skus['361-2760'].data, mocks.inventory.skus['515-7104'].data]
            })
          });

        args.deferred = $.Deferred();
        args.mParamData.mvc.products = mocks.products['345-3729'].data;
        args.mParamData.mvc.sku = mocks.skus['345-3729'].data;
        ctlr._collateDataDependancies(args);

        args.deferred.done(function (resp) {
          output = resp;
          done();
        });
      });

      it('should set the correct tab flags based on the product/sku information', function () {
        var flags = output.mParamData.mvc.flags.tabs;

        expect(flags.hasAccessories).toBe(true);
        expect(flags.hasBiography).toBe(false);
        expect(flags.hasBundle).toBe(true);
        expect(flags.hasCompleteTheLook).toBe(false);
        expect(flags.hasDetails).toBe(true);
        expect(flags.hasOutfitBuilder).toBe(false);
        expect(flags.hasPromos).toBe(true);
        expect(flags.hasReviews).toBe(true);
        expect(flags.hasShopTheRange).toBe(false);
        expect(flags.hasSpecs).toBe(true);
        expect(flags.hasSynopsis).toBe(false);
      });
    });
  });
});
