define([
  'domlib',
  'modules/breakpoint',
  'modules/mvc/fn',
  'modules/common',
  'modules/google-analytics/pdpTracking',
  'json!test-framework/mocks/tesco/content/catalog/product/551-7553.json',
  'json!test-framework/mocks/tesco/addToBasketResponse/success/551-7553.json',
  'json!test-framework/mocks/tesco/content/catalog/sku/402-9121.json',
  'modules/pdp/models/ProductModel',
  'modules/pdp/models/SkuModel',
  'json!test-framework/mocks/tesco/omniture/pdp/402-9121.json',
  'test-framework/mocks/mocks',
  'modules/pdp/controllers/ProductPageController'
], function (
  $,
  breakPoint,
  fn,
  common,
  pdpTracking,
  productData,
  basketData,
  skuData,
  ProductModel,
  SkuModel,
  s,
  mocks,
  ProductPageController
) {
  'use strict';

  describe('Test PDP Tracking', function () {
    var testData = undefined,
      page = {};

    beforeAll(function () {
      page = new ProductPageController();
    });

    beforeEach(function () {
      window.s = s;
      window.oAppController = { oPageController: page };
    });

    /***************************************************************************
     ** setAnaylyics method                            *************************
     ***************************************************************************/

    describe('trigger setAnaylyics method with product data', function () {
      beforeEach(function () {
        testData = undefined;
        testData = pdpTracking.setAnalytics(
          productData, 'pageLoad'
        );
      });

      it('should return product object and run GA', function () {
        expect(testData.id).toBe('551-7553');
      });
    });


    describe('trigger setAnaylyics method with basket data', function () {
      beforeEach(function () {
        testData = undefined;
        testData = pdpTracking.setAnalytics(
          basketData.success.data.itemsAdded.items, 'addToBasket'
        );
      });

      it('should return basket object and run GA', function () {
        expect(testData[0].skuId).toBe('402-9121');
      });
    });


    describe('when window.s is undefined', function () {
      beforeEach(function () {
        delete window.s;

        testData = undefined;
        testData = pdpTracking.setAnalytics(
          productData, 'pageLoad'
        );
      });

      it('should return object and continue to run GA', function () {
        expect(fn.isObject(testData)).toBe(true);
      });
    });



    /***************************************************************************
     ** collateProductData method                      *************************
     ***************************************************************************/


    describe('trigger collateProductData method: Page Load', function () {
      beforeEach(function () {
        testData = undefined;
        testData = pdpTracking.collateProductData(
          skuData,
          productData
        );
      });

      it('should return GA data WITHOUT quantity and listingId then run GA', function () {
        expect(testData.id).toBe('402-9121');
        expect(testData.name).toBe('Mela Plaque Detail Strappy Jumpsuit 10 Black');
        expect(testData.price).toBe('24.50');
        expect(testData.brand).toBe('Mela');
        expect(testData.dimension9).toBe('Womens');
        expect(testData.dimension24).toBe('true');
        expect(testData.variant).toBe('Black');
        expect(testData.category).toBe(null);
        expect(testData.quantity).toBe(undefined);
        expect(testData.dimension17).toBe(undefined);
      });
    });


    describe('trigger collateProductData method: Add to Basket', function () {
      beforeEach(function () {
        testData = undefined;
        testData = pdpTracking.collateProductData(
          skuData,
          productData,
          // setAddToBasketAnalytics loops this array, using first for test
          basketData.success.data.itemsAdded.items[0]
        );
      });

      it('should return GA data WITH quantity and listingId then run GA', function () {
        expect(testData.id).toBe('402-9121');
        expect(testData.name).toBe('Mela Plaque Detail Strappy Jumpsuit 10 Black');
        expect(testData.price).toBe('24.50');
        expect(testData.brand).toBe('Mela');
        expect(testData.dimension9).toBe('Womens');
        expect(testData.dimension24).toBe('true');
        expect(testData.variant).toBe('Black');
        expect(testData.category).toBe(null);
        expect(testData.quantity).toBe(1);
        expect(testData.dimension17).toBe('T000218e7d');
      });
    });
  });
});
