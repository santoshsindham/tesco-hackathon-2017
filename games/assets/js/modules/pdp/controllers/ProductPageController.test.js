define(function (require) {
  'use strict';


  var ProductPageController = require('modules/pdp/controllers/ProductPageController'),
    config = {},
    fn = require('modules/mvc/fn'),
    mocks = require('test-framework/mocks/mocks');


  config = {
    baseURL: 'http://www.tesco.com/direct/',
    isKiosk: false
  };


  /***************************************************************************
   ** init method ************************************************************
   ***************************************************************************/

  describe('init method', function () {
    var page = {},
      testData = {};


    beforeEach(function () {
      page = new ProductPageController(config);
      spyOn(page, '_collateCatalogData').and.callThrough();
      spyOn(page, '_collateInventoryData').and.callThrough();
      spyOn(page, 'bindEventHandlers').and.callThrough();
      spyOn(page, '_initDependancies').and.callThrough();
      spyOn(page, '_initMediaViewer');
      spyOn(page, '_renderKiosk');
    });


    describe('when product and sku are valid data stores', function () {
      describe('when extra data is not passed in', function () {
        describe('when isPageLoad is true', function () {
          describe('when hasAkamaiCaching is true', function () {
            var inventoryProductModel = {},
              productModel = {},
              skuModel = {};


            beforeEach(function (done) {
              var deferred = $.Deferred();

              $(window).on('dataReady', function (e) {
                testData = e.oData;
              });

              inventoryProductModel = page.getModule('model', 'inventoryProduct');
              spyOn(inventoryProductModel, 'setDataStores').and.callThrough();
              productModel = page.getModule('model', 'products');
              skuModel = page.getModule('model', 'sku');
              page.init(
                mocks.products['154-6351'].data, mocks.skus['154-6351'].data, null, deferred
              );

              deferred
                .done(function () {
                  done();
                });
            });


            afterEach(function () {
              productModel.unsetDataStores();
              skuModel.unsetDataStores();
              page.setActiveProduct();
              page.setActiveSku();
              page.setSelectedSku();
              page.unbindEventHandlers(['scroll', 'touchmove', 'checkInViewport']);
              $(window).off('scene7.init');
            });


            it('should call the correct methods', function () {
              expect(page._collateCatalogData.calls.count()).toBe(1);
              expect(page._collateInventoryData.calls.count()).toBe(1);
              expect(inventoryProductModel.setDataStores.calls.count()).toBe(0);
              expect(page.bindEventHandlers.calls.count()).toBe(1);
              expect(page._initDependancies.calls.count()).toBe(1);
              expect(page._initMediaViewer.calls.count()).toBe(1);
            });


            it('should set the data stores in the product and sku models', function () {
              expect(productModel.getDataStores({ value: '154-6351' }).id).toBe('154-6351');
              expect(skuModel.getDataStores({ value: '154-6351' }).id).toBe('154-6351');
            });


            it('should set activeProduct, activeSku and selectedSku '
                + 'to the data stores', function () {
              expect(page.getActiveProduct().id).toBe('154-6351');
              expect(page.getActiveSku().id).toBe('154-6351');
              expect(page.getSelectedSku().id).toBe('154-6351');
            });


            it('should return the product and sku data and flags in the event', function () {
              expect(testData.product.id).toBe('154-6351');
              expect(testData.sku.id).toBe('154-6351');
              expect(testData.flags.isSkuChange).toBe(false);
              expect(testData.flags.isVariantChange).toBe(false);
            });
          });
        });
      });


      describe('when extra data is passed in', function () {
        describe('when isPageLoad is true', function () {
          describe('when hasAkamaiCaching is true', function () {
            var inventoryProductModel = {},
              productModel = {},
              skuModel = {};


            beforeEach(function (done) {
              var deferred = $.Deferred(),
                extraData = { sku: { personalisation: { alfa: 'bravo' } } };

              $(window).on('dataReady', function (e) {
                testData = e.oData;
              });

              inventoryProductModel = page.getModule('model', 'inventoryProduct');
              spyOn(inventoryProductModel, 'setDataStores').and.callThrough();
              productModel = page.getModule('model', 'products');
              skuModel = page.getModule('model', 'sku');
              page.init(
                mocks.products['154-6351'].data, mocks.skus['154-6351'].data, extraData, deferred
              );

              deferred
                .done(function () {
                  done();
                });
            });


            afterEach(function () {
              productModel.unsetDataStores();
              skuModel.unsetDataStores();
              page.setActiveProduct();
              page.setActiveSku();
              page.setSelectedSku();
              page.unbindEventHandlers(['scroll', 'touchmove', 'checkInViewport']);
              $(window).off('scene7.init');
            });


            it('should call the correct methods', function () {
              expect(page._collateCatalogData.calls.count()).toBe(1);
              expect(page._collateInventoryData.calls.count()).toBe(1);
              expect(inventoryProductModel.setDataStores.calls.count()).toBe(0);
              expect(page.bindEventHandlers.calls.count()).toBe(1);
              expect(page._initDependancies.calls.count()).toBe(1);
              expect(page._initMediaViewer.calls.count()).toBe(1);
            });


            it('should add the extra data to the sku data store', function () {
              expect(
                skuModel.getDataStores({ value: '154-6351' }).personalisation
              ).toEqual({ alfa: 'bravo' });
              expect(page.getActiveSku().personalisation).toEqual({ alfa: 'bravo' });
              expect(page.getSelectedSku().personalisation).toEqual({ alfa: 'bravo' });
              expect(testData.sku.personalisation).toEqual({ alfa: 'bravo' });
            });
          });
        });
      });


      describe('when product is F&F', function () {
        describe('when isPageLoad is true', function () {
          describe('when skuInURL is false', function () {
            var inventoryProductModel = {},
              productModel = {},
              skuModel = {};


            beforeEach(function (done) {
              var deferred = $.Deferred();

              $(window).on('dataReady', function (e) {
                testData = e.oData;
              });

              inventoryProductModel = page.getModule('model', 'inventoryProduct');
              spyOn(inventoryProductModel, 'setDataStores').and.callThrough();
              productModel = page.getModule('model', 'products');
              skuModel = page.getModule('model', 'sku');
              page.init(
                mocks.products['313-0760'].data, mocks.skus['154-6351'].data, null, deferred
              );

              deferred
                .done(function () {
                  done();
                });
            });


            afterEach(function () {
              productModel.unsetDataStores();
              skuModel.unsetDataStores();
              page.setActiveProduct();
              page.setActiveSku();
              page.setSelectedSku();
              page.unbindEventHandlers(['scroll', 'touchmove', 'checkInViewport']);
              $(window).off('scene7.init');
            });


            it('should call the correct methods', function () {
              expect(page._collateCatalogData.calls.count()).toBe(1);
              expect(page._collateInventoryData.calls.count()).toBe(1);
              expect(inventoryProductModel.setDataStores.calls.count()).toBe(0);
              expect(page.bindEventHandlers.calls.count()).toBe(1);
              expect(page._initDependancies.calls.count()).toBe(1);
              expect(page._initMediaViewer.calls.count()).toBe(1);
            });


            it('should set selectedSku to an empty object', function () {
              expect(page.getActiveSku().id).toBe('154-6351');
              expect(page.getSelectedSku()).toEqual({});
            });
          });


          describe('when skuInURL is true', function () {
            var inventoryProductModel = {},
              productModel = {},
              skuModel = {};


            beforeEach(function (done) {
              var deferred = $.Deferred();

              spyOn(page, '_isSkuInURL').and.returnValue(true);

              $(window).on('dataReady', function (e) {
                testData = e.oData;
              });

              inventoryProductModel = page.getModule('model', 'inventoryProduct');
              spyOn(inventoryProductModel, 'setDataStores').and.callThrough();
              productModel = page.getModule('model', 'products');
              skuModel = page.getModule('model', 'sku');
              page.init(
                mocks.products['313-0760'].data, mocks.skus['154-6351'].data, null, deferred
              );

              deferred
                .done(function () {
                  done();
                });
            });


            afterEach(function () {
              productModel.unsetDataStores();
              skuModel.unsetDataStores();
              page.setActiveProduct();
              page.setActiveSku();
              page.setSelectedSku();
              page.unbindEventHandlers(['scroll', 'touchmove', 'checkInViewport']);
              $(window).off('scene7.init');
            });


            it('should call the correct methods', function () {
              expect(page._collateCatalogData.calls.count()).toBe(1);
              expect(page._collateInventoryData.calls.count()).toBe(1);
              expect(inventoryProductModel.setDataStores.calls.count()).toBe(0);
              expect(page.bindEventHandlers.calls.count()).toBe(1);
              expect(page._initDependancies.calls.count()).toBe(1);
              expect(page._initMediaViewer.calls.count()).toBe(1);
            });


            it('should set selectedSku to the data store', function () {
              expect(page.getSelectedSku().id).toBe('154-6351');
              expect(page.getActiveSku().id).toBe('154-6351');
            });
          });
        });


        describe('when isSkuChange is true', function () {
          var inventoryProductModel = {},
            inventorySkuModel = {},
            productModel = {},
            skuModel = {};


          beforeEach(function (done) {
            var deferred = $.Deferred(),
              extraData = { flags: { isSkuChange: true, isVariantChange: true } };

            jasmine.Ajax.install();
            mocks.stubAndReturn('products', ['154-6351'], 'inventory');

            $(window).on('dataReady', function (e) {
              testData = e.oData;
            });

            inventoryProductModel = page.getModule('model', 'inventoryProduct');
            spyOn(inventoryProductModel, 'setDataStores').and.callThrough();
            inventorySkuModel = page.getModule('model', 'inventorySKU');
            spyOn(inventorySkuModel, 'setDataStores').and.callThrough();

            productModel = page.getModule('model', 'products');
            skuModel = page.getModule('model', 'sku');

            page.init(
              mocks.products['154-6351'].data, mocks.skus['154-6351'].data, extraData, deferred
            );

            deferred
              .done(function () {
                done();
              });
          });


          afterEach(function () {
            jasmine.Ajax.uninstall();
            inventoryProductModel.unsetDataStores();
            inventorySkuModel.unsetDataStores();
            productModel.unsetDataStores();
            skuModel.unsetDataStores();
            page.setActiveProduct();
            page.setActiveSku();
            page.setSelectedSku();
            page.unbindEventHandlers(['scroll', 'touchmove', 'checkInViewport']);
            $(window).off('scene7.init');
          });


          it('should call the correct methods', function () {
            expect(page._collateCatalogData.calls.count()).toBe(1);
            expect(page._collateInventoryData.calls.count()).toBe(1);
            expect(inventoryProductModel.setDataStores.calls.count()).toBe(1);
            expect(inventorySkuModel.setDataStores.calls.count()).toBe(
              mocks.inventory.products['154-6351'].data.skus.length
            );
            expect(page.bindEventHandlers.calls.count()).toBe(0);
            expect(page._initDependancies.calls.count()).toBe(1);
            expect(page._initMediaViewer.calls.count()).toBe(1);
          });


          it('should set the data stores in the inventory product and sku models', function () {
            expect(inventoryProductModel.getDataStores({ value: '154-6351' }).id).toBe('154-6351');
            expect(inventorySkuModel.getDataStores().length).toBe(
              mocks.inventory.products['154-6351'].data.skus.length
            );
          });


          it('should set selectedSku to the data store', function () {
            expect(page.getSelectedSku().id).toBe('154-6351');
            expect(page.getActiveSku().id).toBe('154-6351');
          });
        });
      });


      describe('when application is kiosk', function () {
        var extraData = { flags: { hasAkamaiCaching: false } },
          inventoryProductModel = {},
          inventorySkuModel = {},
          productModel = {},
          skuModel = {};


        beforeEach(function (done) {
          var deferred = $.Deferred();

          jasmine.Ajax.install();
          mocks.stubAndReturn('products', ['154-6351'], 'inventory');

          $(window).on('dataReady', function (e) {
            testData = e.oData;
          });

          inventoryProductModel = page.getModule('model', 'inventoryProduct');
          spyOn(inventoryProductModel, 'setDataStores').and.callThrough();
          inventorySkuModel = page.getModule('model', 'inventorySKU');
          spyOn(inventorySkuModel, 'setDataStores').and.callThrough();

          productModel = page.getModule('model', 'products');
          skuModel = page.getModule('model', 'sku');
          page.isKiosk = true;
          page.init(
            mocks.products['154-6351'].data, mocks.skus['154-6351'].data, extraData, deferred
          );

          deferred
            .done(function () {
              var scene7Init = $.Event('scene7');

              scene7Init.namespace = 'init';
              scene7Init.oData = {};
              $(window).trigger(scene7Init);
              done();
            });
        });


        afterEach(function () {
          jasmine.Ajax.uninstall();
          inventoryProductModel.unsetDataStores();
          inventorySkuModel.unsetDataStores();
          productModel.unsetDataStores();
          skuModel.unsetDataStores();
          page.setActiveProduct();
          page.setActiveSku();
          page.setSelectedSku();
          page.isKiosk = false;
          page.unbindEventHandlers(['scroll', 'touchmove', 'checkInViewport']);
          $(window).off('scene7.init');
        });


        it('should call the correct methods', function () {
          expect(page._collateCatalogData.calls.count()).toBe(1);
          expect(page._collateInventoryData.calls.count()).toBe(1);
          expect(inventoryProductModel.setDataStores.calls.count()).toBe(1);
          expect(inventorySkuModel.setDataStores.calls.count()).toBe(
            mocks.inventory.products['154-6351'].data.skus.length
          );
          expect(page.bindEventHandlers.calls.count()).toBe(1);
          expect(page._initDependancies.calls.count()).toBe(1);
          expect(page._initMediaViewer.calls.count()).toBe(1);
          expect(page._renderKiosk.calls.count()).toBe(1);
        });


        it('should set the data stores in the models', function () {
          expect(productModel.getDataStores({ value: '154-6351' }).id).toBe('154-6351');
          expect(skuModel.getDataStores({ value: '154-6351' }).id).toBe('154-6351');

          expect(inventoryProductModel.getDataStores({ value: '154-6351' }).id).toBe('154-6351');
          expect(inventorySkuModel.getDataStores().length).toBe(
            mocks.inventory.products['154-6351'].data.skus.length
          );
        });


        it('should set activeProduct, activeSku and selectedSku to the data stores', function () {
          expect(page.getActiveProduct().id).toBe('154-6351');
          expect(page.getActiveSku().id).toBe('154-6351');
          expect(page.getSelectedSku().id).toBe('154-6351');
        });


        it('should return the product and sku data and flags in the event', function () {
          expect(testData.product.id).toBe('154-6351');
          expect(testData.sku.id).toBe('154-6351');
        });
      });
    });


    describe('when product and sku are IDs', function () {
      beforeEach(function () {
        jasmine.Ajax.install();
      });


      afterEach(function () {
        jasmine.Ajax.uninstall();
      });


      describe('when the product ID is not valid', function () {
        beforeEach(function (done) {
          var deferred = $.Deferred();

          page.init('', '154-6351', null, deferred);

          deferred
            .fail(function () {
              done();
            });
        });


        it('should call the correct methods', function () {
          expect(page._collateCatalogData.calls.count()).toBe(1);
          expect(page._collateInventoryData.calls.count()).toBe(0);
          expect(page.bindEventHandlers.calls.count()).toBe(0);
          expect(page._initDependancies.calls.count()).toBe(0);
        });


        it('should not set activeProduct, activeSku or selectedSku', function () {
          expect(page.getActiveProduct()).toEqual({});
          expect(page.getActiveSku()).toEqual({});
          expect(page.getSelectedSku()).toEqual({});
        });
      });


      describe('when the product is valid', function () {
        describe('when the product data store returned is not valid', function () {
          beforeEach(function (done) {
            var deferred = $.Deferred();

            jasmine.Ajax
              .stubRequest(mocks.products['154-6351'].url)
              .andReturn(mocks.products['154-6351'].resp.internalError);

            page.init('154-6351', '154-6351', null, deferred);

            deferred
              .fail(function () {
                done();
              });
          });


          it('should call the correct methods', function () {
            expect(page._collateCatalogData.calls.count()).toBe(1);
            expect(page._collateInventoryData.calls.count()).toBe(0);
            expect(page.bindEventHandlers.calls.count()).toBe(0);
            expect(page._initDependancies.calls.count()).toBe(0);
          });


          it('should not set activeProduct, activeSku or selectedSku', function () {
            expect(page.getActiveProduct()).toEqual({});
            expect(page.getActiveSku()).toEqual({});
            expect(page.getSelectedSku()).toEqual({});
          });
        });


        describe('when the product data store is valid', function () {
          describe('when the sku ID is not passed in', function () {
            var productModel = {},
              skuModel = {};


            beforeEach(function (done) {
              var deferred = $.Deferred();

              jasmine.Ajax
                .stubRequest(mocks.products['154-6351'].url)
                .andReturn(mocks.products['154-6351'].resp.success);

              jasmine.Ajax
                .stubRequest(mocks.skus['154-6351'].url)
                .andReturn(mocks.skus['154-6351'].resp.success);

              $(window).on('dataReady', function (e) {
                testData = e.oData;
              });

              productModel = page.getModule('model', 'products');
              skuModel = page.getModule('model', 'sku');
              page.init('154-6351', { invalid: true }, null, deferred);

              deferred
                .done(function () {
                  done();
                });
            });


            afterEach(function () {
              productModel.unsetDataStores();
              skuModel.unsetDataStores();
              page.setActiveProduct();
              page.setActiveSku();
              page.setSelectedSku();
              page.unbindEventHandlers(['scroll', 'touchmove', 'checkInViewport']);
              $(window).off('scene7.init');
            });


            it('should call the correct methods', function () {
              expect(page._collateCatalogData.calls.count()).toBe(1);
              expect(page._collateInventoryData.calls.count()).toBe(1);
              expect(page.bindEventHandlers.calls.count()).toBe(1);
              expect(page._initDependancies.calls.count()).toBe(1);
              expect(page._initMediaViewer.calls.count()).toBe(1);
            });


            it('should set the data stores in the product and sku models', function () {
              expect(productModel.getDataStores({ value: '154-6351' }).id).toBe('154-6351');
              expect(skuModel.getDataStores({ value: '154-6351' }).id).toBe('154-6351');
            });


            it('should set activeProduct, activeSku and selectedSku', function () {
              expect(page.getActiveProduct().id).toBe('154-6351');
              expect(page.getActiveSku().id).toBe('154-6351');
              expect(page.getSelectedSku().id).toBe('154-6351');
            });


            it('should return the product and sku data and flags in the event', function () {
              expect(testData.product.id).toBe('154-6351');
              expect(testData.sku.id).toBe('154-6351');
            });
          });


          describe('when the sku ID is passed in', function () {
            describe('when the sku data store returned is not valid', function () {
              beforeEach(function (done) {
                var deferred = $.Deferred();

                jasmine.Ajax
                  .stubRequest(mocks.products['154-6351'].url)
                  .andReturn(mocks.products['154-6351'].resp.internalError);

                jasmine.Ajax
                  .stubRequest(mocks.skus['154-6351'].url)
                  .andReturn(mocks.skus['154-6351'].resp.internalError);

                page.init('154-6351', '154-6351', null, deferred);

                deferred
                  .fail(function () {
                    done();
                  });
              });


              it('should call the correct methods', function () {
                expect(page._collateCatalogData.calls.count()).toBe(1);
                expect(page._collateInventoryData.calls.count()).toBe(0);
                expect(page.bindEventHandlers.calls.count()).toBe(0);
                expect(page._initDependancies.calls.count()).toBe(0);
              });


              it('should not set activeProduct, activeSku or selectedSku', function () {
                expect(page.getActiveProduct()).toEqual({});
                expect(page.getActiveSku()).toEqual({});
                expect(page.getSelectedSku()).toEqual({});
              });
            });


            describe('when the sku data store returned is valid', function () {
              describe('when extra data is passed in', function () {
                var productModel = {},
                  skuModel = {};


                beforeEach(function (done) {
                  var deferred = $.Deferred(),
                    extraData = { sku: { personalisation: { alfa: 'bravo' } } };

                  jasmine.Ajax
                    .stubRequest(mocks.products['154-6351'].url)
                    .andReturn(mocks.products['154-6351'].resp.success);

                  jasmine.Ajax
                    .stubRequest(mocks.skus['154-6351'].url)
                    .andReturn(mocks.skus['154-6351'].resp.success);

                  $(window).on('dataReady', function (e) {
                    testData = e.oData;
                  });

                  productModel = page.getModule('model', 'products');
                  skuModel = page.getModule('model', 'sku');
                  page.init('154-6351', '154-6351', extraData, deferred);

                  deferred
                    .done(function () {
                      done();
                    });
                });


                afterEach(function () {
                  productModel.unsetDataStores();
                  skuModel.unsetDataStores();
                  page.setActiveProduct();
                  page.setActiveSku();
                  page.setSelectedSku();
                  page.unbindEventHandlers(['scroll', 'touchmove', 'checkInViewport']);
                  $(window).off('scene7.init');
                });


                it('should add the extra data to the sku data store', function () {
                  expect(
                    skuModel.getDataStores({ value: '154-6351' }).personalisation
                  ).toEqual({ alfa: 'bravo' });
                  expect(page.getActiveSku().personalisation).toEqual({ alfa: 'bravo' });
                  expect(page.getSelectedSku().personalisation).toEqual({ alfa: 'bravo' });
                  expect(testData.sku.personalisation).toEqual({ alfa: 'bravo' });
                });
              });
            });
          });
        });
      });
    });
  });


  /***************************************************************************
   ** _scrollHandler method **************************************************
   ***************************************************************************/

  describe('_scrollHandler method', function () {
    var bundleController = {},
      element = {},
      page = {},
      viewArgs = { oView: { oElms: { elWrapper: {} }, sViewId: '', sViewName: 'BundleView' } };


    beforeEach(function () {
      page = new ProductPageController(config);
      page.init(mocks.products['154-6351'].data, mocks.skus['154-6351'].data);
      spyOn(page, '_scrollHandler').and.callThrough();
      spyOn(page, '_executeScrollHandlerCallback').and.callThrough();

      window.oAppController.oPageController = page;
      window.inVisibleViewport = function () { return true; };

      appendSetFixtures('<div id="bundle-view-wrapper-1234"></div>');
      element = $('#bundle-view-wrapper-1234')[0];
      viewArgs.oView.oElms.elWrapper = element;
      viewArgs.oView.sViewId = 'bundle-view-wrapper-1234';

      bundleController = page.getModule('controller', 'inherit', 'bundle');
    });


    afterEach(function () {
      page.unbindEventHandlers(['scroll', 'touchmove', 'checkInViewport']);
      $(window).off('scene7.init');
    });


    describe('when triggered from checkInViewport', function () {
      describe('when inVisibleViewport is not a function', function () {
        beforeEach(function (done) {
          var deferred = $.Deferred();

          window.inVisibleViewport = null;
          bundleController._bindViewEvents(viewArgs, deferred);
          deferred
            .fail(function () {
              done();
            });
        });


        afterEach(function () {
          window.inVisibleViewport = function () { return true; };
          page.unsetScrollActions();
        });


        it('should reject the deferred object and '
            + 'not call _executeScrollHandlerCallback', function () {
          expect(page._scrollHandler.calls.count()).toBe(1);
          expect(page._executeScrollHandlerCallback.calls.count()).toBe(0);
          expect(bundleController.getActionInViewport().length).toBe(1);
        });
      });


      describe('when target is passed in and does not '
          + 'match the scrollActions element', function () {
        beforeEach(function (done) {
          var deferred = $.Deferred();

          bundleController.setActionInViewport(
            { element: element, callbackArgs: { view: viewArgs.oView } }
          );

          page._scrollHandler(
            page.getScrollActions()[0], 'outfit-view-1234', deferred
          );

          deferred
            .fail(function () {
              done();
            });
        });


        afterEach(function () {
          page.unsetScrollActions();
        });


        it('should reject the deferred object and '
            + 'not call _executeScrollHandlerCallback', function () {
          expect(page._scrollHandler.calls.count()).toBe(1);
          expect(page._executeScrollHandlerCallback.calls.count()).toBe(0);
          expect(bundleController.getActionInViewport().length).toBe(1);
        });
      });


      describe('when inVisibleViewport returns false', function () {
        beforeEach(function (done) {
          var deferred = $.Deferred();

          window.inVisibleViewport = function () { return false; };
          bundleController._bindViewEvents(viewArgs, deferred);
          deferred
            .fail(function () {
              done();
            });
        });


        afterEach(function () {
          window.inVisibleViewport = function () { return true; };
          page.unsetScrollActions();
        });


        it('should reject the deferred object and '
            + 'not call _executeScrollHandlerCallback', function () {
          expect(page._scrollHandler.calls.count()).toBe(1);
          expect(page._executeScrollHandlerCallback.calls.count()).toBe(0);
          expect(bundleController.getActionInViewport().length).toBe(1);
        });
      });


      describe('when inVisibleViewport returns true', function () {
        beforeEach(function (done) {
          var deferred = $.Deferred();

          bundleController._bindViewEvents(viewArgs, deferred);
          deferred
            .done(function () {
              done();
            });
        });


        afterEach(function () {
          page.unsetScrollActions();
        });


        it('should resolve the deferred object and execute the callback', function () {
          expect(page._scrollHandler.calls.count()).toBe(1);
          expect(page._executeScrollHandlerCallback.calls.count()).toBe(1);
          expect(bundleController.getActionInViewport().length).toBe(0);
        });
      });
    });


    describe('when triggered from scroll', function () {
      describe('when inVisibleViewport returns true', function () {
        beforeEach(function (done) {
          var deferred = $.Deferred(),
            scroll = { name: 'scroll', data: { _deferred: deferred } };

          bundleController.setActionInViewport(
            { element: element, callbackArgs: { view: viewArgs.oView } }
          );

          fn.createEvent(scroll).fire();

          deferred
            .done(function () {
              done();
            });
        });


        afterEach(function () {
          page.unsetScrollActions();
        });


        it('should resolve the deferred object and execute the callback', function () {
          expect(page._scrollHandler.calls.count()).toBe(1);
          expect(page._executeScrollHandlerCallback.calls.count()).toBe(1);
          expect(bundleController.getActionInViewport().length).toBe(0);
        });
      });
    });


    describe('when triggered from touchmove', function () {
      describe('when inVisibleViewport returns true', function () {
        beforeEach(function (done) {
          var deferred = $.Deferred(),
            scroll = { name: 'touchmove', data: { _deferred: deferred } };

          bundleController.setActionInViewport(
            { element: element, callbackArgs: { view: viewArgs.oView } }
          );

          fn.createEvent(scroll).fire();

          deferred
            .done(function () {
              done();
            });
        });


        afterEach(function () {
          page.unsetScrollActions();
        });


        it('should resolve the deferred object and execute the callback', function () {
          expect(page._scrollHandler.calls.count()).toBe(1);
          expect(page._executeScrollHandlerCallback.calls.count()).toBe(1);
          expect(bundleController.getActionInViewport().length).toBe(0);
        });
      });
    });
  });


  /***************************************************************************
   ** asyncBlockInventoryCallback method *************************************
   ***************************************************************************/

  describe('asyncBlockInventoryCallback method', function () {
    var inventoryProductModel = {},
      inventorySkuModel = {},
      page = {};


    beforeAll(function () {
      page = new ProductPageController(config);
      page.init(mocks.products['670-4017'].data, mocks.skus['201-2207'].data);
      inventoryProductModel = page.getModule('model', 'inventoryProduct');
      inventorySkuModel = page.getModule('model', 'inventorySKU');
      spyOn(inventoryProductModel, 'setDataStores').and.callThrough();
      spyOn(inventorySkuModel, 'setDataStores').and.callThrough();
    });


    afterAll(function () {
      inventoryProductModel = {};
      inventorySkuModel = {};
      page = {};
    });


    describe('when resp is not a string', function () {
      var callback = {};


      beforeEach(function () {
        spyOn(page, '_parseInventory');
        callback = page.asyncBlockInventoryCallback();
        callback.success();
      });


      it('should not call _parseInventory method', function () {
        expect(page._parseInventory.calls.count()).toBe(0);
      });
    });


    describe('when the response has no product inventory', function () {
      var callback = {};


      beforeEach(function () {
        spyOn(page, '_parseInventory').and.returnValue({ products: [] });
        callback = page.asyncBlockInventoryCallback();
        callback.success(
          mocks.asyncCustomerBlocks['670-4017']['201-2207'].resp.success.responseText
        );
      });


      it('should not call either model setDataStores method', function () {
        expect(page._parseInventory.calls.count()).toBe(1);
        expect(inventoryProductModel.setDataStores.calls.count()).toBe(0);
        expect(inventorySkuModel.setDataStores.calls.count()).toBe(0);
      });
    });


    describe('when the response has product inventory', function () {
      describe('when the response has no sku inventory', function () {
        var callback = {};


        beforeEach(function () {
          spyOn(page, '_parseInventory').and.returnValue({
            products: [{
              id: '670-4017',
              available: true,
              availability: 'InStock',
              subscribable: false
            }]
          });
          callback = page.asyncBlockInventoryCallback();
          callback.success(
            mocks.asyncCustomerBlocks['670-4017']['201-2207'].resp.success.responseText
          );
        });


        afterEach(function () {
          inventoryProductModel.unsetDataStores();
          inventoryProductModel.setDataStores.calls.reset();
        });


        it('should set the product inventory, but not the sku inventory', function () {
          expect(page._parseInventory.calls.count()).toBe(1);
          expect(inventoryProductModel.setDataStores.calls.count()).toBe(1);
          expect(inventorySkuModel.setDataStores.calls.count()).toBe(0);
          expect(inventoryProductModel.getDataStores({ value: '670-4017' }).id).toBe('670-4017');
        });
      });


      describe('when the response has sku inventory', function () {
        var callback = {};


        beforeEach(function () {
          spyOn(page, '_parseInventory').and.callThrough();
          callback = page.asyncBlockInventoryCallback();
          callback.success(
            mocks.asyncCustomerBlocks['670-4017']['201-2207'].resp.success.responseText
          );
        });


        afterEach(function () {
          inventoryProductModel.unsetDataStores();
          inventorySkuModel.unsetDataStores();
        });


        it('should set the product and sku inventory', function () {
          expect(page._parseInventory.calls.count()).toBe(1);
          expect(inventoryProductModel.setDataStores.calls.count()).toBe(1);
          expect(inventorySkuModel.setDataStores.calls.count()).toBe(
            mocks.inventory.products['670-4017'].data.skus.length
          );
          expect(inventoryProductModel.getDataStores({ value: '670-4017' }).id).toBe('670-4017');
          expect(inventorySkuModel.getDataStores().length).toBe(
            mocks.inventory.products['670-4017'].data.skus.length
          );
        });
      });
    });
  });


  /***************************************************************************
   ** getActiveProduct method ************************************************
   ***************************************************************************/

  describe('getActiveProduct method', function () {
    var page = {};


    describe('when the active product is set', function () {
      beforeEach(function () {
        page = new ProductPageController(config);
        page.setActiveProduct(mocks.products['101-6583'].data);
      });


      afterEach(function () {
        page = {};
      });


      it('should return the active product', function () {
        expect(page.getActiveProduct()).toBe(mocks.products['101-6583'].data);
      });
    });


    describe('when the active product is not set', function () {
      beforeEach(function () {
        page = new ProductPageController(config);
      });


      afterEach(function () {
        page = {};
      });


      it('should return an empty object', function () {
        expect(page.getActiveProduct()).toEqual({});
      });
    });
  });


  /***************************************************************************
   ** setActiveProduct method ************************************************
   ***************************************************************************/

  describe('setActiveProduct method', function () {
    var page = {},
      testData = undefined;


    describe('when the product does not have truthy ID or links properties', function () {
      beforeEach(function () {
        page = new ProductPageController(config);
        page.setActiveProduct(mocks.rr.cwvav.data.items[0]);
        testData = page.getActiveProduct();
      });


      afterEach(function () {
        page = {};
        testData = undefined;
      });


      it('should not set the active product', function () {
        expect(testData).toEqual({});
      });
    });


    describe('when the product has truthy ID and links properties', function () {
      beforeEach(function () {
        page = new ProductPageController(config);
        page.setActiveProduct(mocks.products['101-6583'].data);
        testData = page.getActiveProduct();
      });


      afterEach(function () {
        page = {};
        testData = undefined;
      });


      it('should set the active product', function () {
        expect(testData).toBe(mocks.products['101-6583'].data);
      });
    });
  });


  /***************************************************************************
   ** getActiveSku method **************************************************
   ***************************************************************************/

  describe('getActiveSku method', function () {
    var page = {};


    describe('when the active sku is set', function () {
      beforeEach(function () {
        page = new ProductPageController(config);
        page.setActiveSku(mocks.skus['227-5139'].data);
      });


      afterEach(function () {
        page = {};
      });


      it('should return the active sku', function () {
        expect(page.getActiveSku()).toBe(mocks.skus['227-5139'].data);
      });
    });


    describe('when the active sku is not set', function () {
      beforeEach(function () {
        page = new ProductPageController(config);
      });


      afterEach(function () {
        page = {};
      });


      it('should return an empty object', function () {
        expect(page.getActiveSku()).toEqual({});
      });
    });
  });


  /***************************************************************************
   ** setActiveSku method **************************************************
   ***************************************************************************/

  describe('setActiveSku method', function () {
    var page = {},
      testData = undefined;


    describe('when the sku does not have truthy ID or links properties', function () {
      beforeEach(function () {
        page = new ProductPageController(config);
        page.setActiveSku(mocks.rr.cwvav.data.items[0]);
        testData = page.getActiveSku();
      });


      afterEach(function () {
        page = {};
        testData = undefined;
      });


      it('should not set the active sku', function () {
        expect(testData).toEqual({});
      });
    });


    describe('when the sku has truthy ID and links properties', function () {
      beforeEach(function () {
        page = new ProductPageController(config);
        page.setActiveSku(mocks.skus['227-5139'].data);
        testData = page.getActiveSku();
      });


      afterEach(function () {
        page = {};
        testData = undefined;
      });


      it('should set the active sku', function () {
        expect(testData).toBe(mocks.skus['227-5139'].data);
      });
    });
  });


  /***************************************************************************
   ** getSelectedSku method **************************************************
   ***************************************************************************/

  describe('getSelectedSku method', function () {
    var page = {};


    describe('when the selected sku is set', function () {
      beforeEach(function () {
        page = new ProductPageController(config);
        page.setSelectedSku(mocks.skus['227-5139'].data);
      });


      afterEach(function () {
        page = {};
      });


      it('should return the selected sku', function () {
        expect(page.getSelectedSku()).toBe(mocks.skus['227-5139'].data);
      });
    });


    describe('when the selected sku is not set', function () {
      beforeEach(function () {
        page = new ProductPageController(config);
      });


      afterEach(function () {
        page = {};
      });


      it('should return an empty object', function () {
        expect(page.getSelectedSku()).toEqual({});
      });
    });
  });


  /***************************************************************************
   ** setSelectedSku method **************************************************
   ***************************************************************************/

  describe('setSelectedSku method', function () {
    var page = {},
      testData = undefined;


    describe('when the sku does not have truthy ID or links properties', function () {
      beforeEach(function () {
        page = new ProductPageController(config);
        page.setSelectedSku(mocks.rr.cwvav.data.items[0]);
        testData = page.getSelectedSku();
      });


      afterEach(function () {
        page = {};
        testData = undefined;
      });


      it('should not set the selected sku', function () {
        expect(testData).toEqual({});
      });
    });


    describe('when the sku has truthy ID and links properties', function () {
      beforeEach(function () {
        page = new ProductPageController(config);
        page.setSelectedSku(mocks.skus['227-5139'].data);
        testData = page.getSelectedSku();
      });


      afterEach(function () {
        page = {};
        testData = undefined;
      });


      it('should set the selected sku', function () {
        expect(testData).toBe(mocks.skus['227-5139'].data);
      });
    });
  });
});
