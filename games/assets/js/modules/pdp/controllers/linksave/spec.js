define(function (require) {
  'use strict';

  var args = {},
    ListingPageController = require('modules/pdp/controllers/ListingPageController'),
    fn = require('modules/mvc/fn'),
    mocks = require('test-framework/mocks/mocks');

  args.atg = {
    deferred: {},
    lTarget: '#linksave-carousel-placeholder',
    mParamData: {
      mvc: {
        filters: { inventory: { available: true } },
        flags: {},
        info: {
          sku: { id: '' },
          promotion: { id: '' },
          product: { id: '' }
        },
        viewModel: [{
          sku: { }
        }
        ]
      }
    },
    sNamespace: 'promotions',
    sOutput: 'inner',
    sTag: 'linksave',
    sViewName: 'LinksaveCarouselView'
  };

    /***************************************************************************
     ** _collateDataDependancies method ****************************************
     ***************************************************************************/

  describe('_collateDataDependancies method', function () {
    var linkSaveController = {},
      listingPage = {},
      testData = undefined,
      promotionModel = {},
      bucketGroupModel = {},
      skuModel = {},
      inventorySkuModel = {};

    beforeAll(function () {
      listingPage = new ListingPageController();
    });

    afterAll(function () {
      listingPage = {};
    });

    beforeEach(function () {
      linkSaveController = listingPage.getModule('controller', 'promotions', 'linksave');
      promotionModel = listingPage.getModule('model', 'promotions');
      bucketGroupModel = listingPage.getModule('model', 'bucketGroup');
      skuModel = listingPage.getModule('model', 'sku');
      inventorySkuModel = listingPage.getModule('model', 'inventorySKU');
    });

    afterEach(function () {
      linkSaveController = {};
      promotionModel = {};
      bucketGroupModel = {};
      skuModel = {};
      inventorySkuModel = {};
    });

    describe('when no promoid is passed in and', function () {
      beforeEach(function () {
        spyOn(linkSaveController, '_getPromotion').and.callThrough();
        spyOn(linkSaveController, '_getMarketing').and.callThrough();
        spyOn(linkSaveController, '_filterItems').and.callThrough();
        spyOn(linkSaveController, '_isLastBucket').and.callThrough();
        spyOn(linkSaveController, '_collateViewData').and.callThrough();
        spyOn(linkSaveController, '_getNextBucketType').and.callThrough();
      });

      describe('product has no linksave promotion', function () {
        var _args = $.extend(true, {}, args);

        beforeEach(function (done) {
          var deferred = $.Deferred(),
            marketingSkuID = '500-1097';

          _args.atg.mParamData.mvc.info.sku.id = marketingSkuID;
          _args.atg.deferred = deferred;

          jasmine.Ajax.install();

          mocks.stubAndReturn('marketingSku', [marketingSkuID]);

          linkSaveController._collateDataDependancies(_args.atg);

          deferred
            .fail(function (respData) {
              testData = respData;
              done();
            });
        });

        afterEach(function () {
          testData = {};
          _args.atg.deferred = {};
          jasmine.Ajax.uninstall();
        });

        it('should reject the deferred object', function () {
          expect(linkSaveController._getPromotion).toHaveBeenCalled();
          expect(linkSaveController._getMarketing).toHaveBeenCalled();
          expect(linkSaveController._isLastBucket).not.toHaveBeenCalled();
          expect(testData).toBe(undefined);
        });
      });

      describe('product has linksave promotion', function () {
        var _args = $.extend(true, {}, args);

        beforeEach(function (done) {
          var deferred = $.Deferred(),
            INV_119_3321 = mocks.inventory.skus['119-3321'].data,
            bucketGroupID = 'bktgrp4810002',
            bucketSkuId = '119-3321',
            marketingSkuID = '210-7442',
            promoID = 'promo48670056';

          jasmine.Ajax.install();

          _args.atg.mParamData.mvc.info.sku.id = marketingSkuID;
          _args.atg.deferred = deferred;

          mocks.stubAndReturn('marketingSku', [marketingSkuID]);
          mocks.stubAndReturn('linkSavePromotion', [promoID]);
          mocks.stubAndReturn('bucketGroup', [bucketGroupID]);
          mocks.stubAndReturn('skus', [bucketSkuId]);
          mocks.stubAndReturn('skus', [bucketSkuId], 'inventory');

          inventorySkuModel.setDataStores(INV_119_3321.skus);

          fn.loopObject(mocks.linkSavePromotion, function loopLinkSavePromotion(id) {
            promotionModel.setDataStores(mocks.linkSavePromotion[id].data);
          });

          fn.loopObject(mocks.bucketGroup, function loopBucketGroup(id) {
            bucketGroupModel.setDataStores(mocks.bucketGroup[id].data);
          });

          skuModel.setDataStores(mocks.skus[bucketSkuId].data);

          linkSaveController._collateDataDependancies(_args.atg);

          deferred
            .done(function (respData) {
              testData = respData;
              done();
            });
        });

        it('should not reject the deferred object', function () {
          expect(testData).not.toBe(undefined);
          expect(linkSaveController._getPromotion).toHaveBeenCalled();
          expect(linkSaveController._getMarketing).toHaveBeenCalled();
          expect(linkSaveController._getNextBucketType).toHaveBeenCalledWith('bucketX');
          expect(linkSaveController._isLastBucket).toHaveBeenCalledWith('bucketY');
          expect(linkSaveController._filterItems).toHaveBeenCalled();
          expect(linkSaveController._collateViewData).toHaveBeenCalled();
        });

        afterEach(function () {
          testData = {};
          _args.atg.deferred = {};
          jasmine.Ajax.uninstall();
        });
      });
    });
  });
});
