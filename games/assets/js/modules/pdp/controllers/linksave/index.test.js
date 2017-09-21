define(function (require) {
  'use strict';

  var args = {},
    listingPageController = require('modules/pdp/controllers/ListingPageController'),
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
        skuModel = {};

    beforeAll(function () {
      listingPage = new listingPageController();
    });

    afterAll(function () {
      listingPage = {};
    });

    beforeEach(function () {
      linkSaveController = listingPage.getModule('controller', 'promotions', 'linksave');
      promotionModel = listingPage.getModule('model', 'promotions');
      bucketGroupModel = listingPage.getModule('model', 'bucketGroup');
      skuModel = listingPage.getModule('model', 'sku');
    });

    afterEach(function () {
      linkSaveController = {};
      promotionModel = {};
      bucketGroupModel = {};
      skuModel = {};
    });

    describe('when no promoid is passed in and', function () {
      beforeEach(function () {
        spyOn(linkSaveController, '_getPromotion').and.callThrough();
        spyOn(linkSaveController, '_getMarketing').and.callThrough();
        spyOn(linkSaveController, '_isLastBucket');
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

          fn.loopObject(mocks.linkSavePromotion, function loopLinkSavePromotion(id) {
            promotionModel.setDataStores(mocks.linkSavePromotion[id].data);
          });

          fn.loopObject(mocks.bucketGroup, function loopBucketGroup(id) {
            bucketGroupModel.setDataStores(mocks.bucketGroup[id].data);
          });

          skuModel.setDataStores(mocks.skus[bucketSkuId].data);

          _args.atg.mParamData.mvc.bucketGroup = bucketGroupModel
          .getDataStores({ value: bucketGroupID });
          _args.atg.mParamData.mvc.promotion = promotionModel.getDataStores({ value: promoID });
          _args.atg.mParamData.mvc.viewModel[0].sku = skuModel
          .getDataStores({ value: bucketSkuId });

          spyOn(linkSaveController, '_filterItems').and.returnValue(deferred.resolve(_args.atg));

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
          expect(linkSaveController._isLastBucket).toHaveBeenCalled();
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
