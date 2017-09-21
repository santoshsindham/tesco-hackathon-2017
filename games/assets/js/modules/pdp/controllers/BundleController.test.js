define(function (require) {
  'use strict';


  var args = {},
    ProductPageController = require('modules/pdp/controllers/ProductPageController'),
    fn = require('modules/mvc/fn'),
    mocks = require('test-framework/mocks/mocks');


  args.atg = {
    deferred: {},
    elTarget: '.BundleView-placeholder-789763368',
    filterOptions: { category: { unique: true }, inventory: { available: true } },
    inherits: true,
    mParamData: {
      mvc: {
        destroyRootView: function () {},
        flags: {},
        info: { rootViewId: 'related-sku-view-367874139' },
        inherit: '154-6351',
        items: [],
        sku: mocks.skus['154-6351'].data
      }
    },
    oData: {},
    sName: 'render',
    sNamespace: 'sku',
    sOutput: 'outer',
    sTag: 'bundle',
    sViewName: 'BundleView'
  };

  args.rr = {
    deferred: {},
    elTarget: '.BundleView-placeholder-789763368',
    inherits: true,
    mParamData: {
      mvc: {
        destroyRootView: function () {},
        flags: { bundle: true, inBasketOverlay: true, richRelevance: true },
        info: { rootViewId: 'related-product-view-533472543' },
        inherit: '154-6351',
        items: [],
        products: mocks.products['154-6351'].data,
        sku: mocks.skus['154-6351'].data.id
      }
    },
    oData: {},
    sName: 'render',
    sNamespace: 'products',
    sOutput: 'outer',
    sTag: 'bundle',
    sViewName: 'BundleView'
  };


  /***************************************************************************
   ** _collateDataDependancies method ****************************************
   ***************************************************************************/

  describe('_collateDataDependancies method', function () {
    var bundleController = {},
      page = {},
      productModel = {},
      skuModel = {},
      testData = undefined;


    beforeAll(function () {
      page = new ProductPageController();
    });


    afterAll(function () {
      page = {};
    });


    beforeEach(function () {
      page.init(mocks.products['154-6351'].data, mocks.skus['154-6351'].data);
      bundleController = page.getModule('controller', 'inherit', 'bundle');
      window.oAppController = { oPageController: page };
      productModel = page.getModule('model', 'products');
      skuModel = page.getModule('model', 'sku');

      spyOn(args.atg.mParamData.mvc, 'destroyRootView');
      spyOn(window.oAppController.oPageController, 'getActiveProduct').and.callThrough();
      spyOn(window.oAppController.oPageController, 'getActiveSku').and.callThrough();
      spyOn(bundleController, '_compileSkuData').and.callThrough();
      spyOn(bundleController, '_compileProductData').and.callThrough();
      spyOn(bundleController, '_collateListingPrices').and.callThrough();
      spyOn(bundleController, '_collateInventoryData').and.callThrough();
      spyOn(bundleController, '_filterItems').and.callThrough();
      spyOn(bundleController, '_defaultFilter').and.callThrough();
      spyOn(bundleController, '_setStaticViewData').and.callThrough();
      spyOn(bundleController, '_setDynamicViewData').and.callThrough();
    });


    afterEach(function () {
      bundleController = {};
      productModel = {};
      skuModel = {};
    });


    describe('when no items are passed in', function () {
      beforeEach(function (done) {
        var deferred = $.Deferred();

        args.atg.deferred = deferred;
        bundleController._collateDataDependancies(args.atg);

        deferred
          .fail(function (respData) {
            testData = respData;
            done();
          });
      });


      afterEach(function () {
        testData = {};
        args.atg.deferred = {};
      });


      it('should reject the deferred object and call destroyRootView', function () {
        expect(testData).toBe(undefined);
        expect(args.atg.mParamData.mvc.destroyRootView.calls.count()).toBe(1);
        expect(bundleController._compileSkuData).not.toHaveBeenCalled();
        expect(bundleController._compileProductData).not.toHaveBeenCalled();
      });
    });


    describe('when items are passed in', function () {
      describe('when richRelevance flag is true', function () {
        var rrItems = [];


        beforeEach(function () {
          var priceResp = { status: 200, responseText: '' },
            prices = { skus: [mocks.price.skus['154-6351'].data] },
            priceURL = '',
            productIDs = [],
            skuIDs = [mocks.skus['154-6351'].data.id];

          jasmine.Ajax.install();

          fn.loopObject(mocks.products, function loopProducts(id) {
            productModel.setDataStores(mocks.products[id].data);
          });

          fn.loopArray(mocks.rr.cwvav.data.items, function (i) {
            productModel.setDataStores(mocks.rr.cwvav.data.items[i]);
            productIDs.push(mocks.rr.cwvav.data.items[i].id);
          });

          rrItems = productModel.getDataStores({ value: productIDs });

          mocks.stubAndReturn('skus', rrItems.map(function (item) {
            var skuID = productModel.getDefaultSku(item).id;

            skuIDs.push(skuID);
            return skuID;
          }));

          priceURL = '/direct/rest/price/sku/' + skuIDs.join() + '?format=standard';

          fn.loopArray(skuIDs, function loopSkuIDs(j) {
            prices.skus.push(mocks.price.skus[skuIDs[j]].data);
          });

          priceResp.responseText = JSON.stringify(prices);

          jasmine.Ajax
            .stubRequest(priceURL)
            .andReturn(priceResp);

          spyOn(skuModel, 'getDataStores').and.callThrough();
        });


        afterEach(function () {
          jasmine.Ajax.uninstall();
          rrItems = [];
        });


        describe('when no inventory filter options are passed in', function () {
          beforeEach(function (done) {
            var deferred = $.Deferred();

            args.rr.deferred = deferred;
            args.rr.mParamData.mvc.items = rrItems;
            bundleController._collateDataDependancies(args.rr);

            deferred
              .done(function (respData) {
                testData = respData;
                done();
              });
          });


          afterEach(function () {
            testData = {};
            args.rr.deferred = {};
          });


          it('should calls the correct functions in the correct order', function () {
            expect(args.atg.mParamData.mvc.destroyRootView).not.toHaveBeenCalled();
            expect(bundleController._compileSkuData.calls.count()).toBe(1);
            expect(skuModel.getDataStores.calls.count()).toBe(1);
            expect(bundleController._collateListingPrices.calls.count()).toBe(1);
            expect(bundleController._collateInventoryData.calls.count()).toBe(1);
            expect(bundleController._filterItems.calls.count()).toBe(1);
            expect(bundleController._defaultFilter.calls.count()).toBe(1);
            expect(bundleController._setStaticViewData.calls.count()).toBe(1);
            expect(bundleController._setDynamicViewData.calls.count()).toBe(1);
          });
        });
      });
    });
  });
});
