define([
  'modules/recommenders/common',
  'modules/pdp/models/ProductModel',
  'modules/mvc/fn',
  'test-framework/mocks/mocks',
  'json!test-framework/mocks/rich-relevance/placements/CWVAV/objects.json'
], function (recommenders, ProductModel, fn, mocks, itemFormatObjects) {
  'use strict';


  /***************************************************************************
   ** triggerRichRelevanceAndRegisterCallback method *************************
   ***************************************************************************/

  describe('triggerRichRelevanceAndRegisterCallback method', function () {
    var blockConfig = { mParamData: { flags: { inBasketOverlay: true } } },
      testData = undefined;


    beforeEach(function () {
      window.oAppController = { oPageController: {} };
      window.RR = {};
      window.r3 = function () {};
      spyOn(window, 'r3');
    });


    afterEach(function () {
      delete window.oAppController;
      delete window.RR;
      delete window.r3;
    });


    describe('when RR is undefined', function () {
      beforeEach(function () {
        delete window.RR;

        testData = recommenders.triggerRichRelevanceAndRegisterCallback(
          '123-4567', true, blockConfig
        );
      });


      afterEach(function () {
        window.RR = {};
      });


      it('should return null and not add the placements callback to RR', function () {
        expect(testData).toBe(null);
      });
    });


    describe('when the page controller is not present on the window', function () {
      beforeEach(function () {
        delete window.oAppController;

        testData = recommenders.triggerRichRelevanceAndRegisterCallback(
          '123-4567', true, blockConfig
        );
      });


      afterEach(function () {
        window.oAppController = { oPageController: {} };
      });


      it('should return null and not add the placements callback to RR', function () {
        expect(testData).toBe(null);
      });
    });


    describe('when a valid productID is passed in', function () {
      beforeEach(function () {
        testData = recommenders.triggerRichRelevanceAndRegisterCallback(
          '123-4567', true, blockConfig
        );
      });


      it('should return null and add the placements callback to RR', function () {
        expect(typeof window.RR.placementsCallback).toBe('function');
      });
    });


    describe('when triggerR3Call is true', function () {
      beforeEach(function () {
        testData = recommenders.triggerRichRelevanceAndRegisterCallback(
          '123-4567', true, blockConfig
        );
      });


      it('should call the r3 function', function () {
        expect(window.r3).toHaveBeenCalled();
        expect(window.r3.calls.count()).toBe(1);
      });
    });


    describe('when triggerR3Call is false', function () {
      beforeEach(function () {
        testData = recommenders.triggerRichRelevanceAndRegisterCallback(
          '123-4567', false, blockConfig
        );
      });


      it('should not call the r3 function', function () {
        expect(window.r3).not.toHaveBeenCalled();
      });
    });
  });


  /***************************************************************************
   ** placementsCallback method **********************************************
   ***************************************************************************/

  describe('placementsCallback method', function () {
    var blockConfig = { mParamData: { flags: { inBasketOverlay: true } } },
      itemData = [],
      mvcPage = {},
      productModel = {};


    beforeEach(function () {
      window.oAppController = {
        oPageController: {
          getModule: function () {},
          render: function () {}
        }
      };
      window.r3 = function () {};
      window.RR = { data: { JSON: { placements: [] } } };

      productModel = new ProductModel({});

      fn.loopObject(mocks.products, function loopProducts(id) {
        itemData.push(mocks.products[id].data);
        productModel.setDataStores(mocks.products[id].data);
      });

      mvcPage = window.oAppController.oPageController;

      spyOn(mvcPage, 'getModule').and.returnValue(productModel);
      spyOn(mvcPage, 'render');
      spyOn(recommenders, 'extendConfig').and.callThrough();
      spyOn(recommenders, 'processItems').and.callThrough();
      spyOn(recommenders, 'carousel').and.callThrough();
      spyOn(recommenders, 'bundle').and.callThrough();
      spyOn(recommenders, 'createViewConfig').and.callThrough();
      spyOn(window, 'r3');

      recommenders.triggerRichRelevanceAndRegisterCallback('123-4567', false, blockConfig);
    });


    afterEach(function () {
      delete window.oAppController;
      delete window.RR;
    });


    describe('when there are no placements returned by RR', function () {
      beforeEach(function (done) {
        RR.placementsCallback().fail(function () {
          done();
        });
      });


      it('should not call either extendConfig or processItems', function () {
        expect(recommenders.extendConfig).not.toHaveBeenCalled();
        expect(recommenders.processItems).not.toHaveBeenCalled();
      });
    });


    describe('when there is a placement returned by RR', function () {
      beforeEach(function () {
        window.RR.data.JSON.placements.push(fn.copyObject(mocks.rr.cwvav.data, { deep: true }));
      });


      afterEach(function () {
        window.RR.data.JSON.placements = [];
      });


      describe('when the view is carousel', function () {
        beforeEach(function (done) {
          RR.placementsCallback().done(function () {
            done();
          });
        });


        it('should call the correct functions with the correct arguments', function () {
          expect(recommenders.extendConfig).toHaveBeenCalled();
          expect(recommenders.processItems).toHaveBeenCalled();
          expect(recommenders.createViewConfig).toHaveBeenCalled();
          expect(recommenders.carousel).toHaveBeenCalled();
        });
      });


      describe('when the view is bundle', function () {
        beforeEach(function (done) {
          window.RR.data.JSON.placements[0].config.view = 'bundle';
          RR.placementsCallback().done(function () {
            done();
          });
        });


        it('should call the correct functions with the correct arguments', function () {
          expect(recommenders.extendConfig).toHaveBeenCalled();
          expect(recommenders.processItems).toHaveBeenCalled();
          expect(recommenders.createViewConfig).toHaveBeenCalled();
          expect(recommenders.bundle).toHaveBeenCalled();
        });
      });
    });
  });


  /***************************************************************************
   ** extendConfig method ****************************************************
   ***************************************************************************/

  describe('extendConfig method', function () {
    var defaultConfig = { productId: '498-2626', view: 'bundle' },
      placementConfig = { view: 'carousel' },
      testData = undefined;


    describe('when no placement config is passed in', function () {
      beforeEach(function () {
        testData = recommenders.extendConfig(defaultConfig, undefined);
      });


      it('should return the default config', function () {
        expect(testData.productId).toBe(defaultConfig.productId);
        expect(testData.view).toBe(defaultConfig.view);
      });
    });


    describe('when a placement config is passed in', function () {
      beforeEach(function () {
        testData = recommenders.extendConfig(defaultConfig, placementConfig);
      });


      it('should return a merged config with the default properties overwritten', function () {
        expect(testData.productId).toBe(defaultConfig.productId);
        expect(testData.view).toBe(placementConfig.view);
      });
    });
  });


  /***************************************************************************
   ** processItems method ****************************************************
   ***************************************************************************/

  describe('processItems method', function () {
    var mvcPage = {},
      productModel = {},
      testData = undefined,
      RR_CWVAV_OBJS = fn.copyObject(mocks.rr.cwvav.data, { deep: true }),
      RR_PP_IDS = fn.copyObject(mocks.rr.pp.data, { deep: true });


    beforeEach(function () {
      jasmine.Ajax.install();

      window.oAppController = {
        oPageController: {
          getModule: function () {}
        }
      };

      mvcPage = window.oAppController.oPageController;
      productModel = new ProductModel({});

      spyOn(mvcPage, 'getModule').and.returnValue(productModel);
      spyOn(productModel, 'setDataStores').and.callThrough();
      spyOn(productModel, 'getDataStores').and.callThrough();
      spyOn(productModel, 'fetch').and.callThrough();
      spyOn(recommenders, 'processObjects').and.callThrough();
      spyOn(recommenders, 'processIDs').and.callThrough();
    });


    afterEach(function () {
      jasmine.Ajax.uninstall();
      delete window.oAppController;
    });


    describe('when no items are passed in', function () {
      beforeEach(function (done) {
        recommenders.processItems([], itemFormatObjects.itemFormat, 'carousel')
          .fail(function (respData) {
            testData = respData;
            done();
          });
      });


      it('should reject the deferred object and return', function () {
        expect(testData).toBe(undefined);
        expect(recommenders.processObjects).not.toHaveBeenCalled();
        expect(recommenders.processIDs).not.toHaveBeenCalled();
      });
    });


    describe('when itemFormat is not "objects" or "ids"', function () {
      beforeEach(function (done) {
        recommenders.processItems(RR_CWVAV_OBJS.items, 'alfa', 'carousel')
          .fail(function (respData) {
            testData = respData;
            done();
          });
      });


      it('should reject the deferred object and return', function () {
        expect(testData).toBe(undefined);
        expect(recommenders.processObjects).not.toHaveBeenCalled();
        expect(recommenders.processIDs).not.toHaveBeenCalled();
      });
    });


    describe('when itemFormat is "objects"', function () {
      describe('when viewName is not "bundle"', function () {
        beforeEach(function (done) {
          recommenders.processItems(RR_CWVAV_OBJS.items, 'objects', 'carousel')
            .done(function (respData) {
              testData = respData;
              done();
            });
        });


        afterEach(function () {
          productModel.unsetDataStores();
        });


        it('should add the returned data stores and resolve the deferred object '
            + 'with the returned stores', function () {
          expect(recommenders.processObjects.calls.count()).toBe(1);
          expect(productModel.setDataStores.calls.count()).toBe(1);
          expect(productModel.getDataStores.calls.count()).toBe(1);
          expect(productModel.fetch).not.toHaveBeenCalled();

          expect(productModel.getDataStores().length).toBe(RR_CWVAV_OBJS.items.length);
          expect(testData.length).toBe(RR_CWVAV_OBJS.items.length);
          expect(fn.checkData(testData, ['rrLink'])).toBe(true);
        });
      });


      describe('when viewName is "bundle"', function () {
        describe('when all data objects need to be fetched from the server', function () {
          describe('when the fetch is successful', function () {
            var matches = 0;


            beforeEach(function (done) {
              jasmine.Ajax
                .stubRequest(mocks.products['572-0859'].url)
                .andReturn(mocks.products['572-0859'].resp.success);
              jasmine.Ajax
                .stubRequest(mocks.products['199-1072'].url)
                .andReturn(mocks.products['199-1072'].resp.success);
              jasmine.Ajax
                .stubRequest(mocks.products['661-8688'].url)
                .andReturn(mocks.products['661-8688'].resp.success);
              jasmine.Ajax
                .stubRequest(mocks.products['742-8388'].url)
                .andReturn(mocks.products['742-8388'].resp.success);
              jasmine.Ajax
                .stubRequest(mocks.products['397-7360'].url)
                .andReturn(mocks.products['397-7360'].resp.success);
              jasmine.Ajax
                .stubRequest(mocks.products['530-3001'].url)
                .andReturn(mocks.products['530-3001'].resp.success);
              jasmine.Ajax
                .stubRequest(mocks.products['724-1190'].url)
                .andReturn(mocks.products['724-1190'].resp.success);
              jasmine.Ajax
                .stubRequest(mocks.products['129-8921'].url)
                .andReturn(mocks.products['129-8921'].resp.success);
              jasmine.Ajax
                .stubRequest(mocks.products['311-6596'].url)
                .andReturn(mocks.products['311-6596'].resp.success);
              jasmine.Ajax
                .stubRequest(mocks.products['385-2384'].url)
                .andReturn(mocks.products['385-2384'].resp.success);
              jasmine.Ajax
                .stubRequest(mocks.products['101-6583'].url)
                .andReturn(mocks.products['101-6583'].resp.success);
              jasmine.Ajax
                .stubRequest(mocks.products['767-7465'].url)
                .andReturn(mocks.products['767-7465'].resp.success);

              recommenders.processItems(RR_CWVAV_OBJS.items, 'objects', 'bundle')
                .done(function (respData) {
                  testData = respData;

                  fn.loopArray(RR_CWVAV_OBJS.items, function loopItems(i) {
                    fn.loopArray(testData, function loopTestData(j) {
                      if (RR_CWVAV_OBJS.items[i].id === testData[j].id) {
                        matches += 1;
                      }
                    });
                  });

                  done();
                });
            });


            afterEach(function () {
              productModel.unsetDataStores();
            });


            it('should resolve the deferred object with all requested data objects', function () {
              expect(recommenders.processObjects.calls.count()).toBe(1);
              expect(productModel.setDataStores.calls.count()).toBe(1);
              expect(productModel.getDataStores.calls.count()).toBe(1);
              expect(productModel.fetch.calls.count()).toBe(1);

              expect(productModel.getDataStores().length).toBe(RR_CWVAV_OBJS.items.length);
              expect(testData.length).toBe(RR_CWVAV_OBJS.items.length);
              expect(matches).toBe(RR_CWVAV_OBJS.items.length);
              expect(fn.checkData(testData, ['rrLink'])).toBe(true);
            });
          });


          describe('when the fetch fails', function () {
            beforeEach(function (done) {
              jasmine.Ajax
                .stubRequest(mocks.products['572-0859'].url)
                .andReturn(mocks.products['572-0859'].resp.success);
              jasmine.Ajax
                .stubRequest(mocks.products['199-1072'].url)
                .andReturn(mocks.products['199-1072'].resp.success);
              jasmine.Ajax
                .stubRequest(mocks.products['661-8688'].url)
                .andReturn(mocks.products['661-8688'].resp.success);
              jasmine.Ajax
                .stubRequest(mocks.products['742-8388'].url)
                .andReturn(mocks.products['742-8388'].resp.success);
              jasmine.Ajax
                .stubRequest(mocks.products['397-7360'].url)
                .andReturn(mocks.products['397-7360'].resp.success);
              jasmine.Ajax
                .stubRequest(mocks.products['530-3001'].url)
                .andReturn(mocks.products['530-3001'].resp.notFound);
              jasmine.Ajax
                .stubRequest(mocks.products['724-1190'].url)
                .andReturn(mocks.products['724-1190'].resp.success);
              jasmine.Ajax
                .stubRequest(mocks.products['129-8921'].url)
                .andReturn(mocks.products['129-8921'].resp.success);
              jasmine.Ajax
                .stubRequest(mocks.products['311-6596'].url)
                .andReturn(mocks.products['311-6596'].resp.internalError);
              jasmine.Ajax
                .stubRequest(mocks.products['385-2384'].url)
                .andReturn(mocks.products['385-2384'].resp.success);
              jasmine.Ajax
                .stubRequest(mocks.products['101-6583'].url)
                .andReturn(mocks.products['101-6583'].resp.success);
              jasmine.Ajax
                .stubRequest(mocks.products['767-7465'].url)
                .andReturn(mocks.products['767-7465'].resp.success);

              recommenders.processItems(RR_CWVAV_OBJS.items, 'objects', 'bundle')
                .fail(function (respData) {
                  testData = respData;
                  done();
                });
            });


            afterEach(function () {
              productModel.unsetDataStores();
            });


            it('should reject the deferred object', function () {
              expect(recommenders.processObjects.calls.count()).toBe(1);
              expect(productModel.setDataStores.calls.count()).toBe(1);
              expect(productModel.getDataStores.calls.count()).toBe(1);
              expect(productModel.fetch.calls.count()).toBe(1);

              expect(testData).toBe(undefined);
            });
          });
        });


        describe('when some data objects need to be fetched from the server', function () {
          describe('when the fetch is successful', function () {
            var matches = 0;


            beforeEach(function (done) {
              jasmine.Ajax
                .stubRequest(mocks.products['572-0859'].url)
                .andReturn(mocks.products['572-0859'].resp.success);
              jasmine.Ajax
                .stubRequest(mocks.products['199-1072'].url)
                .andReturn(mocks.products['199-1072'].resp.success);
              jasmine.Ajax
                .stubRequest(mocks.products['661-8688'].url)
                .andReturn(mocks.products['661-8688'].resp.success);
              jasmine.Ajax
                .stubRequest(mocks.products['742-8388'].url)
                .andReturn(mocks.products['742-8388'].resp.success);
              jasmine.Ajax
                .stubRequest(mocks.products['397-7360'].url)
                .andReturn(mocks.products['397-7360'].resp.success);
              jasmine.Ajax
                .stubRequest(mocks.products['530-3001'].url)
                .andReturn(mocks.products['530-3001'].resp.success);

              productModel.setDataStores([
                mocks.products['724-1190'].data,
                mocks.products['129-8921'].data,
                mocks.products['311-6596'].data,
                mocks.products['385-2384'].data,
                mocks.products['101-6583'].data,
                mocks.products['767-7465'].data
              ]);

              productModel.setDataStores.calls.reset();

              recommenders.processItems(RR_CWVAV_OBJS.items, 'objects', 'bundle')
                .done(function (respData) {
                  testData = respData;

                  fn.loopArray(RR_CWVAV_OBJS.items, function loopItems(i) {
                    fn.loopArray(testData, function loopTestData(j) {
                      if (RR_CWVAV_OBJS.items[i].id === testData[j].id) {
                        matches += 1;
                      }
                    });
                  });

                  done();
                });
            });


            afterEach(function () {
              productModel.unsetDataStores();
            });


            it('should resolve the deferred object with all requested data objects', function () {
              expect(recommenders.processObjects.calls.count()).toBe(1);
              expect(productModel.setDataStores.calls.count()).toBe(1);
              expect(productModel.getDataStores.calls.count()).toBe(1);
              expect(productModel.fetch.calls.count()).toBe(1);

              expect(productModel.getDataStores().length).toBe(RR_CWVAV_OBJS.items.length);
              expect(testData.length).toBe(RR_CWVAV_OBJS.items.length);
              expect(matches).toBe(RR_CWVAV_OBJS.items.length);
              expect(fn.checkData(testData, ['rrLink'])).toBe(true);
            });
          });


          describe('when the fetch is successful', function () {
            beforeEach(function (done) {
              jasmine.Ajax
                .stubRequest(mocks.products['572-0859'].url)
                .andReturn(mocks.products['572-0859'].resp.success);
              jasmine.Ajax
                .stubRequest(mocks.products['199-1072'].url)
                .andReturn(mocks.products['199-1072'].resp.success);
              jasmine.Ajax
                .stubRequest(mocks.products['661-8688'].url)
                .andReturn(mocks.products['661-8688'].resp.notFound);
              jasmine.Ajax
                .stubRequest(mocks.products['742-8388'].url)
                .andReturn(mocks.products['742-8388'].resp.success);
              jasmine.Ajax
                .stubRequest(mocks.products['397-7360'].url)
                .andReturn(mocks.products['397-7360'].resp.internalError);
              jasmine.Ajax
                .stubRequest(mocks.products['530-3001'].url)
                .andReturn(mocks.products['530-3001'].resp.success);

              productModel.setDataStores([
                mocks.products['724-1190'].data,
                mocks.products['129-8921'].data,
                mocks.products['311-6596'].data,
                mocks.products['385-2384'].data,
                mocks.products['101-6583'].data,
                mocks.products['767-7465'].data
              ]);

              productModel.setDataStores.calls.reset();

              recommenders.processItems(RR_CWVAV_OBJS.items, 'objects', 'bundle')
                .fail(function (respData) {
                  testData = respData;
                  done();
                });
            });


            afterEach(function () {
              productModel.unsetDataStores();
            });


            it('should reject the deferred object', function () {
              expect(recommenders.processObjects.calls.count()).toBe(1);
              expect(productModel.setDataStores.calls.count()).toBe(1);
              expect(productModel.getDataStores.calls.count()).toBe(1);
              expect(productModel.fetch.calls.count()).toBe(1);

              expect(testData).toBe(undefined);
            });
          });
        });
      });
    });


    describe('when itemFormat is "ids"', function () {
      describe('when processIDs fails', function () {
        describe('when all data objects need to be fetched from the server', function () {
          beforeEach(function (done) {
            jasmine.Ajax
              .stubRequest(mocks.products['581-8614'].url)
              .andReturn(mocks.products['581-8614'].resp.notFound);
            jasmine.Ajax
              .stubRequest(mocks.products['179-7462'].url)
              .andReturn(mocks.products['179-7462'].resp.success);
            jasmine.Ajax
              .stubRequest(mocks.products['627-6262'].url)
              .andReturn(mocks.products['627-6262'].resp.success);
            jasmine.Ajax
              .stubRequest(mocks.products['745-8366'].url)
              .andReturn(mocks.products['745-8366'].resp.success);
            jasmine.Ajax
              .stubRequest(mocks.products['216-7890'].url)
              .andReturn(mocks.products['216-7890'].resp.success);
            jasmine.Ajax
              .stubRequest(mocks.products['182-7550'].url)
              .andReturn(mocks.products['182-7550'].resp.internalError);
            jasmine.Ajax
              .stubRequest(mocks.products['404-3212'].url)
              .andReturn(mocks.products['404-3212'].resp.success);
            jasmine.Ajax
              .stubRequest(mocks.products['130-0023'].url)
              .andReturn(mocks.products['130-0023'].resp.success);
            jasmine.Ajax
              .stubRequest(mocks.products['556-3837'].url)
              .andReturn(mocks.products['556-3837'].resp.success);
            jasmine.Ajax
              .stubRequest(mocks.products['621-1670'].url)
              .andReturn(mocks.products['621-1670'].resp.success);
            jasmine.Ajax
              .stubRequest(mocks.products['284-4665'].url)
              .andReturn(mocks.products['284-4665'].resp.success);
            jasmine.Ajax
              .stubRequest(mocks.products['152-7712'].url)
              .andReturn(mocks.products['152-7712'].resp.success);

            recommenders.processItems(RR_PP_IDS.items, 'ids', 'carousel')
              .fail(function (respData) {
                testData = respData;
                done();
              });
          });


          afterEach(function () {
            productModel.unsetDataStores();
          });


          it('should reject the deferred object', function () {
            expect(recommenders.processIDs.calls.count()).toBe(1);
            expect(productModel.getDataStores.calls.count()).toBe(1);
            expect(productModel.fetch.calls.count()).toBe(1);

            expect(testData).toBe(undefined);
          });
        });
      });


      describe('when processIDs is successful', function () {
        describe('when all data objects exist in the ProductModel', function () {
          var matches = 0;


          beforeEach(function (done) {
            fn.loopObject(mocks.products, function loopProducts(id) {
              productModel.setDataStores(mocks.products[id].data);
            });

            productModel.setDataStores.calls.reset();

            recommenders.processItems(RR_PP_IDS.items, 'ids', 'carousel')
              .done(function (respData) {
                testData = respData;

                fn.loopArray(RR_PP_IDS.items, function loopItems(i) {
                  fn.loopArray(testData, function loopTestData(j) {
                    if (RR_PP_IDS.items[i].id === testData[j].id) {
                      matches += 1;
                    }
                  });
                });

                done();
              });
          });


          afterEach(function () {
            productModel.unsetDataStores();
          });


          it('should resolve the deferred object with all requested data objects', function () {
            expect(testData.length).toBe(RR_PP_IDS.items.length);
            expect(matches).toBe(RR_PP_IDS.items.length);

            expect(recommenders.processIDs.calls.count()).toBe(1);
            expect(productModel.getDataStores.calls.count()).toBe(1);
            expect(productModel.fetch).not.toHaveBeenCalled();
          });
        });


        describe('when all data objects need to be fetched from the server', function () {
          var matches = 0;


          beforeEach(function (done) {
            jasmine.Ajax
              .stubRequest(mocks.products['581-8614'].url)
              .andReturn(mocks.products['581-8614'].resp.success);
            jasmine.Ajax
              .stubRequest(mocks.products['179-7462'].url)
              .andReturn(mocks.products['179-7462'].resp.success);
            jasmine.Ajax
              .stubRequest(mocks.products['627-6262'].url)
              .andReturn(mocks.products['627-6262'].resp.success);
            jasmine.Ajax
              .stubRequest(mocks.products['745-8366'].url)
              .andReturn(mocks.products['745-8366'].resp.success);
            jasmine.Ajax
              .stubRequest(mocks.products['216-7890'].url)
              .andReturn(mocks.products['216-7890'].resp.success);
            jasmine.Ajax
              .stubRequest(mocks.products['182-7550'].url)
              .andReturn(mocks.products['182-7550'].resp.success);
            jasmine.Ajax
              .stubRequest(mocks.products['404-3212'].url)
              .andReturn(mocks.products['404-3212'].resp.success);
            jasmine.Ajax
              .stubRequest(mocks.products['130-0023'].url)
              .andReturn(mocks.products['130-0023'].resp.success);
            jasmine.Ajax
              .stubRequest(mocks.products['556-3837'].url)
              .andReturn(mocks.products['556-3837'].resp.success);
            jasmine.Ajax
              .stubRequest(mocks.products['621-1670'].url)
              .andReturn(mocks.products['621-1670'].resp.success);
            jasmine.Ajax
              .stubRequest(mocks.products['284-4665'].url)
              .andReturn(mocks.products['284-4665'].resp.success);
            jasmine.Ajax
              .stubRequest(mocks.products['152-7712'].url)
              .andReturn(mocks.products['152-7712'].resp.success);

            recommenders.processItems(RR_PP_IDS.items, 'ids', 'carousel')
              .done(function (respData) {
                testData = respData;

                fn.loopArray(RR_PP_IDS.items, function loopItems(i) {
                  fn.loopArray(testData, function loopTestData(j) {
                    if (RR_PP_IDS.items[i].id === testData[j].id) {
                      matches += 1;
                    }
                  });
                });

                done();
              });
          });


          afterEach(function () {
            productModel.unsetDataStores();
          });


          it('should resolve the deferred object with all requested data objects', function () {
            expect(recommenders.processIDs.calls.count()).toBe(1);
            expect(productModel.getDataStores.calls.count()).toBe(1);
            expect(productModel.fetch.calls.count()).toBe(1);

            expect(testData.length).toBe(RR_PP_IDS.items.length);
            expect(matches).toBe(RR_PP_IDS.items.length);
          });
        });
      });
    });
  });


  /***************************************************************************
   ** createViewConfig method ************************************************
   ***************************************************************************/

  describe('createViewConfig method', function () {
    var RR_PP_IDS = fn.copyObject(mocks.rr.pp.data, { deep: true }),
      blockConfig = { mParamData: { flags: { inBasketOverlay: true } } },
      productData = [],
      testData = {};


    describe('creating a view config', function () {
      beforeEach(function () {
        RR_PP_IDS.config = { productId: '498-2626', view: 'carousel' };

        fn.loopArray(RR_PP_IDS.items, function loopItems(i) {
          fn.loopObject(mocks.products, function loopProducts(id) {
            if (RR_PP_IDS.items[i].id === mocks.products[id].data.id) {
              productData.push(mocks.products[id].data);
            }
          });
        });

        testData = recommenders.createViewConfig(productData, RR_PP_IDS, blockConfig);
      });


      it('should return a view config object based on the arguments passed in', function () {
        expect(testData.sNamespace).toBe('products');
        expect(testData.sTag).toBe('links');
        expect(testData.sViewName).toBe('RelatedProductView');
        expect(testData.elTarget).toBe('#add_to_cart_page_placement1');
        expect(testData.mParamData.id).toBe('498-2626');
        expect(testData.mParamData.items.length).toBe(12);
        expect(testData.mParamData.flags).toEqual({ inBasketOverlay: true, richRelevance: true });
        expect(testData.mParamData.placement).toBe('add_to_cart_page');
        expect(testData.mParamData.carousel).toEqual({});
      });
    });
  });


  /***************************************************************************
   ** setRichRelevanceLegacyPlacementProps method *****************************
   ***************************************************************************/

  describe('setRichRelevanceLegacyPlacementProps method', function () {
    var setRRLegacyProps = null,
      placementData = {};

    beforeEach(function () {
      setRRLegacyProps = null;
    });

    describe('when setRichRelevanceLegacyPlacementProps is invoked with no parameters', function () {
      setRRLegacyProps = recommenders.setRichRelevanceLegacyPlacementProps();

      it('it should return a null object', function () {
        expect(setRRLegacyProps).toBeNull();
      });
    });

    describe('when setRichRelevanceLegacyPlacementProps is invoked with incorrect parameters', function () {
      placementData.foo = 'bar';
      setRRLegacyProps = recommenders.setRichRelevanceLegacyPlacementProps(placementData);

      it('it should return a null object', function () {
        expect(setRRLegacyProps).toBeNull();
      });
    });
  });


  /***************************************************************************
   ** setRichRelevanceMVCPlacementProps method *****************************
   ***************************************************************************/

  describe('setRichRelevanceMVCPlacementProps method', function () {
    var setRRMVCProps = null,
      placementData = {},
      setRRMVCPropsWithData = null;

    beforeEach(function () {
      placementData = {};
      setRRMVCProps = null;
    });

    describe('when setRichRelevanceMVCPlacementProps is invoked with correct parameters', function () {
      placementData.placement = {};
      placementData.placement.placementPosition = 1;
      placementData.placement.strategy = 'strategy';
      placementData.productId = '123-456';
      placementData.productPosition = 1;
      setRRMVCPropsWithData = recommenders.setRichRelevanceMVCPlacementProps(placementData);

      it('it should return a object with specific properties populated', function () {
        expect(setRRMVCPropsWithData.placementPosition).toEqual(1);
        expect(setRRMVCPropsWithData.placementStrategyID).toEqual('strategy');
        expect(setRRMVCPropsWithData.productID).toEqual('123-456');
        expect(setRRMVCPropsWithData.productPosition).toEqual(1);
      });
    });

    describe('when setRichRelevanceMVCPlacementProps is invoked with no parameters', function () {
      setRRMVCProps = recommenders.setRichRelevanceMVCPlacementProps();

      it('it should return a null object', function () {
        expect(setRRMVCProps).toBeNull();
      });
    });

    describe('when setRichRelevanceMVCPlacementProps is invoked with incorrect parameters', function () {
      placementData.foo = 'bar';
      setRRMVCProps = recommenders.setRichRelevanceMVCPlacementProps(placementData);

      it('it should return a null object', function () {
        expect(setRRMVCProps).toBeNull();
      });
    });
  });


  /***************************************************************************
   ** getRichRelevancePlacementPosition method *****************************
   ***************************************************************************/

  describe('getRichRelevancePlacementPosition method', function () {
    var getPlacementPosition = null;

    describe('when getRichRelevancePlacementPosition is invoked with no parameters', function () {
      getPlacementPosition = recommenders.getRichRelevancePlacementPosition();

      it('it should return a null object', function () {
        expect(getPlacementPosition).toBeNull();
      });
    });

    describe('when getRichRelevancePlacementPosition is invoked with incorrect parameters', function () {
      getPlacementPosition = recommenders.getRichRelevancePlacementPosition('foobar');

      it('it should return a null object', function () {
        expect(getPlacementPosition).toBeNull();
      });
    });
  });


  /***************************************************************************
   ** setRichRelevanceList3ClickData method *****************************
   ***************************************************************************/

  describe('setRichRelevanceList3ClickData method', function () {
    var setRichRelevanceList3Prop = null,
      placementData = {};

    describe('when setRichRelevanceList3ClickData is invoked with no parameters', function () {
      setRichRelevanceList3Prop = recommenders.setRichRelevanceList3ClickData();
      it('it should return a null object', function () {
        expect(setRichRelevanceList3Prop).toBeNull();
      });
    });

    describe('when setRichRelevanceList3ClickData is invoked with incorrect parameters', function () {
      it('it should return a null object', function () {
        placementData.incorrectProp1 = 'foo';
        placementData.incorrectProp2 = 'bar';
        setRichRelevanceList3Prop = recommenders.setRichRelevanceList3ClickData(placementData);
        expect(setRichRelevanceList3Prop).toBeNull();
      });
    });

    describe('when setRichRelevanceList3ClickData is invoked with correct parameters', function () {
      it('it should return a string', function () {
        placementData.placementStrategyID = 'strategy';
        placementData.placementPosition = 1;
        placementData.productPosition = 1;
        placementData.productID = '123-456';
        setRichRelevanceList3Prop = recommenders.setRichRelevanceList3ClickData(placementData);
        expect(typeof setRichRelevanceList3Prop).toBe('string');
      });
    });
  });


  /***************************************************************************
   ** richRelevanceOriginAnalyticsHandler method *****************************
   ***************************************************************************/

  describe('richRelevanceOriginAnalyticsHandler method', function () {
    var originRichRelevance = null,
      list3Prop = 'rrProductClickData_list3';

    beforeEach(function () {
      fn.clearLocalStorageData(list3Prop);
      fn.setLocalStorageData(list3Prop, 'r:::strategyid:1:1:123-456:0::c');
    });

    describe('when rich relevance analytics data is locally stored (list3 prop)', function () {
      it('should return a string of rich relevance analytics data', function () {
        originRichRelevance = fn.getLocalStorageData(list3Prop);
        expect(typeof originRichRelevance).toBe('string');
      });
    });

    describe('when there is no stored rich relevance analyics data', function () {
      it('should return null', function () {
        fn.clearLocalStorageData(list3Prop);
        originRichRelevance = fn.getLocalStorageData(list3Prop);
        expect(typeof originRichRelevance).toBe('object');
      });
    });
  });


  /***************************************************************************
   ** clearRichRelevanceStoredData method *****************************
   ***************************************************************************/

  describe('clearRichRelevanceStoredData method', function () {
    var originRichRelevance = null,
      list3Prop = 'rrProductClickData_list3';

    beforeEach(function () {
      originRichRelevance = null;
      fn.setLocalStorageData(list3Prop, 'r:::strategyid:1:1:123-456:0::c');
    });

    describe('when rich relevance analytics data is locally stored (list3 prop)', function () {
      describe('and clearRichRelevanceStoredData method is invoked', function () {
        fn.clearLocalStorageData(list3Prop);
        originRichRelevance = fn.getLocalStorageData(list3Prop);

        it('should return a null object when checking for "' + list3Prop + '"', function () {
          expect(typeof originRichRelevance).toBe('object');
        });
      });

      describe('and I call the method with no parameters', function () {
        fn.clearLocalStorageData();

        it('should return a string for the "' + list3Prop + '" prop', function () {
          originRichRelevance = fn.getLocalStorageData(list3Prop);
          expect(typeof originRichRelevance).toBe('string');
        });
      });

      describe('and I pass a boolean into the method', function () {
        fn.clearLocalStorageData(false);

        it('should return a string for the "' + list3Prop + '" prop', function () {
          originRichRelevance = fn.getLocalStorageData(list3Prop);
          expect(typeof originRichRelevance).toBe('string');
        });
      });
    });
  });


  /***************************************************************************
   ** setRichRelevanceStoredData method *****************************
   ***************************************************************************/

  describe('setRichRelevanceStoredData method', function () {
    var list3 = null,
      placementStrategyID = null,
      placementPosition = null,
      placementData = {};

    describe('when setRichRelevanceStoredData is invoked', function () {
      placementData.list3Prop = 'list3prop';
      placementData.placementStrategyID = 'strategy';
      placementData.placementPosition = 1;

      describe('with the correct data', function () {
        recommenders.setRichRelevanceStoredData(placementData);
        list3 = fn.getLocalStorageData('rrProductClickData_list3');
        placementStrategyID = fn.getLocalStorageData('rrProductClickData_strategyID');
        placementPosition = fn.getLocalStorageData('rrProductClickData_placementPosition');

        it('should return a string when checking for "rrProductClickData_strategyID"', function () {
          expect(list3).toEqual('list3prop');
          expect(placementStrategyID).toEqual('strategy');
          expect(placementPosition).toEqual(1);
        });
      });

      describe('with no data', function () {
        placementData = null;
        recommenders.setRichRelevanceStoredData(placementData);
        fn.clearLocalStorageData('rrProductClickData_strategyID');

        it('should return a string when checking for "rrProductClickData_strategyID"', function () {
          expect(fn.getLocalStorageData('rrProductClickData_strategyID')).toBeNull();
        });
      });

      describe('with incorrect data', function () {
        placementData = {};
        placementData.incorrectProp = 'bad value';

        recommenders.setRichRelevanceStoredData(placementData);
        fn.clearLocalStorageData('rrProductClickData_strategyID');

        it('should return a string when checking for "rrProductClickData_strategyID"', function () {
          expect(fn.getLocalStorageData('rrProductClickData_strategyID')).toBeNull();
        });
      });

      afterEach(function () {
        fn.clearLocalStorageData('rrProductClickData_list3');
        fn.clearLocalStorageData('rrProductClickData_strategyID');
        fn.clearLocalStorageData('rrProductClickData_placementPosition');
      });
    });
  });


  /***************************************************************************
   ** setRichRelevancePlacementData method *****************************
   ***************************************************************************/

  describe('setRichRelevancePlacementData method', function () {
    var rrData = null,
      placement = {
        items: '123-456,123-456,123-456,123-456',
        strategy: 'greatStrategy',
        displayOrder: 1
      };

    window.RR = {};
    window.RR.data = {};
    window.RR.data.JSON = {};
    window.RR.data.JSON.placements = [];
    window.RR.data.JSON.placements.push(placement);

    describe('when setRichRelevancePlacementData is invoked', function () {
      describe('and the window.RR method is present it', function () {
        rrData = recommenders.setRichRelevancePlacementData();

        it('should return the correct values', function () {
          expect(rrData[0].placementPosition).toEqual(1);
          expect(rrData[0].items).toEqual('123-456,123-456,123-456,123-456');
          expect(rrData[0].strategyID).toEqual('greatStrategy');
        });
      });
    });
  });


  /***************************************************************************
   ** setRichRelevanceLegacyPlacementProps method *****************************
   ***************************************************************************/

  describe('setRichRelevanceLegacyPlacementProps method', function () {
    var placementProps = null,
      _placementStrategyID = null,
      carouselSelector = '#rr_placement_0';

    describe('when setRichRelevanceLegacyPlacementProps is invoked', function () {
      describe('with no event parameter it', function () {
        placementProps = recommenders.setRichRelevanceLegacyPlacementProps();

        it('should return null', function () {
          expect(placementProps).toBeNull();
        });
      });

      describe('with the event listener bound', function () {
        window.s = {};
        window.s.tl = function tl(param1, param2, param3) {
          if (param3) {
            _placementStrategyID = param3;
          }
        };
        jasmine.getFixtures().fixturesPath = 'base/test-framework/fixtures/';
        loadFixtures('rich-relevance-legacy-carousel.html');
        recommenders.setRichRelevanceAnalyticsProductClickEvents($(carouselSelector));
        $(carouselSelector)
          .find('a')
          .eq(1)
          .trigger('click');

        it('the _tl() method should return a specific strategyID', function () {
          expect(_placementStrategyID).toEqual('PopularProducts - product click');
        });
      });

      afterEach(function () {
        $(carouselSelector).remove();
      });
    });
  });
});
