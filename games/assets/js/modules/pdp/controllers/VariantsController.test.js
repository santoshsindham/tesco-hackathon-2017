define(function (require) {
  'use strict';


  var ProductPageController = require('modules/pdp/controllers/ProductPageController'),
    fn = require('modules/mvc/fn'),
    mocks = require('test-framework/mocks/mocks');


  /***************************************************************************
   ** VariantsController class ***********************************************
   ***************************************************************************/

  describe('VariantsController class', function () {
    var inventoryProductModel = {},
      inventorySkuModel = {},
      page = {},
      productModel = {},
      variantsCtlr = {};


    beforeAll(function () {
      var INV_148_7656 = mocks.inventory.products['148-7656'].data,
        INV_313_0760 = mocks.inventory.products['313-0760'].data,
        INV_657_7177 = mocks.inventory.products['657-7177'].data,
        INV_204_7271 = mocks.inventory.products['204-7271'].data,
        INV_154_1779 = mocks.inventory.products['154-1779'].data,
        skuInventory = INV_148_7656.skus.concat(
          INV_313_0760.skus, INV_657_7177.skus, INV_204_7271.skus, INV_154_1779.skus
        );

      page = new ProductPageController();
      spyOn(page, '_setHistory');
      window.oAppController.oPageController = page;

      inventoryProductModel = page.getModule('model', 'inventoryProduct');
      inventorySkuModel = page.getModule('model', 'inventorySKU');
      productModel = page.getModule('model', 'products');
      variantsCtlr = page.getModule('controller', 'products', 'variants');

      inventoryProductModel.setDataStores(
        [INV_148_7656, INV_313_0760, INV_657_7177, INV_204_7271, INV_154_1779]
      );
      inventorySkuModel.setDataStores(skuInventory);
    });


    afterAll(function () {
      delete window.oAppController.oPageController;
    });


    /***************************************************************************
     ** _getSelectedSkuID method ***********************************************
     ***************************************************************************/

    describe('_getSelectedSkuID method', function () {
      describe('when there are no childSkus', function () {
        it('should return an empty string', function () {
          expect(variantsCtlr._getSelectedSkuID('123-4567', 'alfa')).toBe('');
        });
      });


      describe('when no childSku primary option matches the variant value', function () {
        it('should return an empty string', function () {
          expect(variantsCtlr._getSelectedSkuID('148-7656', 'alfa')).toBe('');
        });
      });


      describe('when there is a childSku primary option match', function () {
        beforeEach(function () {
          productModel.setDataStores(mocks.products['148-7656'].data);
        });


        afterEach(function () {
          productModel.unsetDataStores('148-7656');
        });


        it('should return the ID of the first available sku', function () {
          expect(variantsCtlr._getSelectedSkuID('148-7656', 'Beige')).toBe('469-2140');
        });
      });
    });


    /***************************************************************************
     ** _buildCacheKey method **************************************************
     ***************************************************************************/

    describe('_buildCacheKey method', function () {
      describe('when inRecommender is false', function () {
        describe('when there is no selectedSku ID', function () {
          it('should return a key based on "buybox" and the product ID', function () {
            expect(variantsCtlr._buildCacheKey(
              mocks.products['148-7656'].data, {}, false
            )).toBe('148-7656_buybox');
          });
        });

        describe('when there is a selectedSku ID', function () {
          it('should return a key based on "buybox" and the product and sku IDs', function () {
            expect(variantsCtlr._buildCacheKey(
              mocks.products['148-7656'].data, mocks.skus['167-1286'].data, false
            )).toBe('148-7656_167-1286_buybox');
          });
        });
      });


      describe('when inRecommender is true', function () {
        it('should return a key based on "outfit" and the product ID', function () {
          expect(variantsCtlr._buildCacheKey(
            mocks.products['148-7656'].data, {}, true
          )).toBe('148-7656_outfit');
        });
      });
    });


    /***************************************************************************
     ** _compilePrimaryChildSkus method ****************************************
     ***************************************************************************/

    describe('_compilePrimaryChildSkus method', function () {
      var childSkus = [],
        product = mocks.products['148-7656'].data,
        selectedSku = {},
        sku = mocks.skus['167-1286'].data,
        testData = undefined;


      beforeAll(function (done) {
        var deferred = $.Deferred();

        spyOn(page, '_isSkuInURL').and.returnValue(true);
        page.init(product, sku, null, deferred);
        deferred.done(function () {
          done();
        });
      });


      beforeEach(function () {
        selectedSku = page.getSelectedSku();
        childSkus = productModel.getLinks({ data: product, value: 'childSku' });
        testData = variantsCtlr._compilePrimaryChildSkus(
          product, selectedSku, childSkus, false
        );
      });


      it('should return a list of childSkus with unique primary variant options', function () {
        expect(testData.length).toBe(2);
        expect(testData[0].options.primary).toBe('Brown');
        expect(testData[1].options.primary).toBe('Beige');
      });
    });


    /***************************************************************************
     ** _hasMixedPrimaryOption method ******************************************
     ***************************************************************************/

    describe('_hasMixedPrimaryOption method', function () {
      var childSkus = [],
        primaryChildSkus = [],
        selectedSku = {},
        testData = undefined;


      describe('when isProductVariant is false', function () {
        var product = mocks.products['148-7656'].data,
          sku = mocks.skus['167-1286'].data;


        beforeAll(function (done) {
          var deferred = $.Deferred();

          spyOn(page, '_isSkuInURL').and.returnValue(true);
          page.init(product, sku, null, deferred);
          deferred.done(function () {
            done();
          });
        });


        beforeEach(function () {
          selectedSku = page.getSelectedSku();
          childSkus = productModel.getLinks({ data: product, value: 'childSku' });
          primaryChildSkus = variantsCtlr._compilePrimaryChildSkus(
            product, selectedSku, childSkus, false
          );
          variantsCtlr._compilePrimaryOption(
            primaryChildSkus, product, selectedSku, false, false
          );
          testData = variantsCtlr._hasMixedPrimaryOption(primaryChildSkus, product);
        });


        it('should return false', function () {
          expect(testData).toBe(false);
        });
      });


      describe('when isProductVariant is true and product has colour associations', function () {
        describe('when there are no primaryChildSkus', function () {
          var product = mocks.products['313-0760'].data,
            sku = mocks.skus['252-1076'].data;


          beforeAll(function (done) {
            var deferred = $.Deferred();

            spyOn(page, '_isSkuInURL').and.returnValue(false);
            page.init(product, sku, null, deferred);
            deferred.done(function () {
              done();
            });
          });


          beforeEach(function () {
            selectedSku = page.getSelectedSku();
            childSkus = productModel.getLinks({ data: product, value: 'childSku' });
            primaryChildSkus = variantsCtlr._compilePrimaryChildSkus(
              product, selectedSku, childSkus, false
            );
            variantsCtlr._compilePrimaryOption(
              primaryChildSkus, product, selectedSku, true, false
            );
            testData = variantsCtlr._hasMixedPrimaryOption(primaryChildSkus, product);
          });


          it('should return false', function () {
            expect(testData).toBe(false);
          });
        });


        describe('when there are primaryChildSkus', function () {
          var product = mocks.products['204-7271'].data,
            sku = mocks.skus['360-9922'].data;


          beforeAll(function (done) {
            var deferred = $.Deferred();

            spyOn(page, '_isSkuInURL').and.returnValue(true);
            page.init(product, sku, null, deferred);
            deferred.done(function () {
              done();
            });
          });


          beforeEach(function () {
            selectedSku = page.getSelectedSku();
            childSkus = productModel.getLinks({ data: product, value: 'childSku' });
            primaryChildSkus = variantsCtlr._compilePrimaryChildSkus(
              product, selectedSku, childSkus, false
            );
            testData = variantsCtlr._hasMixedPrimaryOption(primaryChildSkus, product);
          });


          it('should return true', function () {
            expect(testData).toBe(true);
          });
        });
      });
    });


    /***************************************************************************
     ** _isProductVariantSelected method ***************************************
     ***************************************************************************/

    describe('_isProductVariantSelected method', function () {
      describe('when there is no selectedSku', function () {
        it('should return true', function () {
          expect(variantsCtlr._isProductVariantSelected(
            mocks.products['313-0760'].data, {}
          )).toBe(true);
        });
      });


      describe('when there is a selectedSku', function () {
        describe('when product and sku primary option values match', function () {
          it('should return true', function () {
            expect(variantsCtlr._isProductVariantSelected(
              mocks.products['313-0760'].data, mocks.skus['252-1076'].data
            )).toBe(true);
          });
        });


        describe('when product and sku primary option values do not match', function () {
          it('should return false', function () {
            expect(variantsCtlr._isProductVariantSelected(
              mocks.products['204-7271'].data, mocks.skus['279-2020'].data
            )).toBe(false);
          });
        });
      });
    });


    /***************************************************************************
     ** _compilePrimaryOption method *******************************************
     ***************************************************************************/

    describe('_compilePrimaryOption method', function () {
      var childSkus = [],
        primaryChildSkus = [],
        selectedSku = {},
        testData = undefined;


      describe('when isProductVariant is false', function () {
        var product = mocks.products['148-7656'].data,
          sku = mocks.skus['167-1286'].data;


        beforeAll(function (done) {
          var deferred = $.Deferred();

          spyOn(page, '_isSkuInURL').and.returnValue(true);
          page.init(product, sku, null, deferred);
          deferred.done(function () {
            done();
          });
        });


        beforeEach(function () {
          selectedSku = page.getSelectedSku();
          childSkus = productModel.getLinks({ data: product, value: 'childSku' });
          primaryChildSkus = variantsCtlr._compilePrimaryChildSkus(
            product, selectedSku, childSkus, false
          );
          testData = variantsCtlr._compilePrimaryOption(
            primaryChildSkus, product, selectedSku, false, false
          );
        });


        it('should return an object with the correct properties and values', function () {
          expect(testData.hasSwatches).toBe(false);
          expect(testData.internalName).toBe('colour');
          expect(testData.links).toBe(primaryChildSkus);
          expect(testData.name).toBe('Colour');
          expect(testData.selectedID).toBe('167-1286');
          expect(testData.selectedValue).toBe('Brown');
          expect(testData.type).toBe('primary');
        });
      });


      describe('when isProductVariant is true and product has colour associations', function () {
        describe('when there are no primaryChildSkus', function () {
          var product = mocks.products['313-0760'].data,
            sku = mocks.skus['252-1076'].data;


          beforeAll(function (done) {
            var deferred = $.Deferred();

            spyOn(page, '_isSkuInURL').and.returnValue(false);
            page.init(product, sku, null, deferred);
            deferred.done(function () {
              done();
            });
          });


          beforeEach(function () {
            selectedSku = page.getSelectedSku();
            childSkus = productModel.getLinks({ data: product, value: 'childSku' });
            primaryChildSkus = variantsCtlr._compilePrimaryChildSkus(
              product, selectedSku, childSkus, false
            );
            testData = variantsCtlr._compilePrimaryOption(
              primaryChildSkus, product, selectedSku, true, false
            );
          });


          it('should return an object with the correct properties and values', function () {
            expect(testData.hasSwatches).toBe(false);
            expect(testData.internalName).toBe('colour');
            expect(testData.links.length).toBe(2);
            expect(testData.name).toBe('Colour');
            expect(testData.selectedID).toBe('313-0760');
            expect(testData.selectedValue).toBe('Grey marl');
            expect(testData.type).toBe('primary');
          });


          it('should return links of product self link and all colour associations', function () {
            var links = testData.links;

            expect(links[0].rel).toBe('self');
            expect(links[1].rel).toBe('colourAssociation');
          });
        });


        describe('when there are primaryChildSkus', function () {
          var product = mocks.products['204-7271'].data,
            sku = mocks.skus['360-9922'].data;


          beforeAll(function (done) {
            var deferred = $.Deferred();

            spyOn(page, '_isSkuInURL').and.returnValue(true);
            page.init(product, sku, null, deferred);
            deferred.done(function () {
              done();
            });
          });


          beforeEach(function () {
            selectedSku = page.getSelectedSku();
            childSkus = productModel.getLinks({ data: product, value: 'childSku' });
            primaryChildSkus = variantsCtlr._compilePrimaryChildSkus(
              product, selectedSku, childSkus, false
            );
            testData = variantsCtlr._compilePrimaryOption(
              primaryChildSkus, product, selectedSku, true, false
            );
          });


          it('should return an object with the correct properties and values', function () {
            expect(testData.hasSwatches).toBe(false);
            expect(testData.internalName).toBe('colour');
            expect(testData.links.length).toBe(3);
            expect(testData.name).toBe('Colour');
            expect(testData.selectedID).toBe('204-7271');
            expect(testData.selectedValue).toBe('Grey');
            expect(testData.type).toBe('primary');
          });


          it('should return links of product self link, colour associations '
              + 'and unique primary sku links', function () {
            var links = testData.links;

            expect(links[0].type).toBe('product');
            expect(links[0].options.primary).toBe('Grey');
            expect(links[1].type).toBe('product');
            expect(links[1].options.primary).toBe('Electric blue');
            expect(links[2].type).toBe('sku');
            expect(links[2].options.primary).toBe('Flint');
          });
        });
      });
    });


    /***************************************************************************
     ** _compileSecondaryOption method *****************************************
     ***************************************************************************/

    describe('_compileSecondaryOption method', function () {
      var childSkus = [],
        primaryChildSkus = [],
        primaryOption = {},
        selectedSku = {},
        testData = undefined;


      describe('when there is a selectedSku', function () {
        var product = mocks.products['148-7656'].data,
          sku = mocks.skus['167-1286'].data;


        beforeAll(function (done) {
          var deferred = $.Deferred();

          spyOn(page, '_isSkuInURL').and.returnValue(true);
          page.init(product, sku, null, deferred);
          deferred.done(function () {
            done();
          });
        });


        beforeEach(function () {
          selectedSku = page.getSelectedSku();
          childSkus = productModel.getLinks({ data: product, value: 'childSku' });
          primaryChildSkus = variantsCtlr._compilePrimaryChildSkus(
            product, selectedSku, childSkus, false
          );
          primaryOption = variantsCtlr._compilePrimaryOption(
            primaryChildSkus, product, selectedSku, false, false
          );
          testData = variantsCtlr._compileSecondaryOption(
            primaryOption, childSkus, product, selectedSku
          );
        });


        it('should return an object with the correct properties and values', function () {
          expect(testData.hasSwatches).toBe(false);
          expect(testData.internalName).toBe('p_size');
          expect(testData.links.length).toBe(6);
          expect(testData.name).toBe('Size');
          expect(testData.selectedID).toBe('167-1286');
          expect(testData.selectedValue).toBe('S');
          expect(testData.type).toBe('secondary');
        });
      });


      describe('when there is no selectedSku', function () {
        var product = mocks.products['313-0760'].data,
          sku = mocks.skus['252-1076'].data;


        beforeAll(function (done) {
          var deferred = $.Deferred();

          spyOn(page, '_isSkuInURL').and.returnValue(false);
          page.init(product, sku, null, deferred);
          deferred.done(function () {
            done();
          });
        });


        beforeEach(function () {
          selectedSku = page.getSelectedSku();
          childSkus = productModel.getLinks({ data: product, value: 'childSku' });
          primaryChildSkus = variantsCtlr._compilePrimaryChildSkus(
            product, selectedSku, childSkus, false
          );
          primaryOption = variantsCtlr._compilePrimaryOption(
            primaryChildSkus, product, selectedSku, true, false
          );
          testData = variantsCtlr._compileSecondaryOption(
            primaryOption, childSkus, product, selectedSku
          );
        });


        it('should return an object with the correct properties and values', function () {
          expect(testData.hasSwatches).toBe(false);
          expect(testData.internalName).toBe('p_size');
          expect(testData.links.length).toBe(9);
          expect(testData.name).toBe('Size');
          expect(testData.selectedID).toBe('');
          expect(testData.selectedValue).toBe('');
          expect(testData.type).toBe('secondary');
        });
      });
    });


    /***************************************************************************
     ** handleInventorySuccess method ******************************************
     ***************************************************************************/

    describe('handleInventorySuccess method', function () {
      var mixedOptions = {},
        productOptions = {},
        skuOptions = {};


      beforeAll(function () {
        mixedOptions = (function () {
          var childSkus = [],
            primaryChildSkus = [],
            primaryOption = {},
            product = mocks.products['204-7271'].data,
            secondaryOption = {};

          childSkus = productModel.getLinks({ data: product, value: 'childSku' });
          primaryChildSkus = variantsCtlr._compilePrimaryChildSkus(
            product, {}, childSkus, false
          );
          primaryOption = variantsCtlr._compilePrimaryOption(
            primaryChildSkus, product, {}, true, false
          );
          secondaryOption = variantsCtlr._compileSecondaryOption(
            primaryOption, childSkus, product, {}
          );

          return { primary: primaryOption, secondary: secondaryOption };
        }());

        productOptions = (function () {
          var childSkus = [],
            primaryChildSkus = [],
            primaryOption = {},
            product = mocks.products['313-0760'].data,
            secondaryOption = {};

          childSkus = productModel.getLinks({ data: product, value: 'childSku' });
          primaryChildSkus = variantsCtlr._compilePrimaryChildSkus(
            product, {}, childSkus, false
          );
          primaryOption = variantsCtlr._compilePrimaryOption(
            primaryChildSkus, product, {}, true, false
          );
          secondaryOption = variantsCtlr._compileSecondaryOption(
            primaryOption, childSkus, product, {}
          );

          return { primary: primaryOption, secondary: secondaryOption };
        }());

        skuOptions = (function () {
          var childSkus = [],
            primaryChildSkus = [],
            primaryOption = {},
            product = mocks.products['148-7656'].data,
            secondaryOption = {},
            sku = mocks.skus['167-1286'].data;

          childSkus = productModel.getLinks({ data: product, value: 'childSku' });
          primaryChildSkus = variantsCtlr._compilePrimaryChildSkus(
            product, sku, childSkus, false
          );
          primaryOption = variantsCtlr._compilePrimaryOption(
            primaryChildSkus, product, sku, false, false
          );
          secondaryOption = variantsCtlr._compileSecondaryOption(
            primaryOption, childSkus, product, sku
          );

          return { primary: primaryOption, secondary: secondaryOption };
        }());
      });


      /***************************************************************************
       ** _compileInventory method ***********************************************
       ***************************************************************************/

      describe('_compileInventory method', function () {
        describe('when the options are for sku variant', function () {
          var count = 0;


          beforeEach(function () {
            var options = [skuOptions.primary, skuOptions.secondary];

            variantsCtlr._compileInventory(options);

            fn.loopArray(options, function (i) {
              var option = options[i];

              fn.loopArray(option.links, function (j) {
                var link = option.links[j];

                if (link.inventoryMerged) {
                  count += 1;
                }
              });
            });
          });


          it('should merge inventory data into each of the option links', function () {
            expect(count).toBe(
              skuOptions.primary.links.length + skuOptions.secondary.links.length
            );
          });
        });


        describe('when the options are for product variant', function () {
          var count = 0;


          beforeEach(function () {
            var options = [productOptions.primary, productOptions.secondary];

            variantsCtlr._compileInventory(options);

            fn.loopArray(options, function (i) {
              var option = options[i];

              fn.loopArray(option.links, function (j) {
                var link = option.links[j];

                if (link.inventoryMerged) {
                  count += 1;
                }
              });
            });
          });


          it('should merge inventory data into each of the option links', function () {
            expect(count).toBe(
              productOptions.primary.links.length + productOptions.secondary.links.length
            );
          });
        });


        describe('when the options are for mixed variant', function () {
          var count = 0;


          beforeEach(function () {
            var options = [mixedOptions.primary, mixedOptions.secondary];

            variantsCtlr._compileInventory(options);

            fn.loopArray(options, function (i) {
              var option = options[i];

              fn.loopArray(option.links, function (j) {
                var link = option.links[j];

                if (link.inventoryMerged) {
                  count += 1;
                }
              });
            });
          });


          it('should merge inventory data into each of the option links', function () {
            expect(count).toBe(
              mixedOptions.primary.links.length + mixedOptions.secondary.links.length
            );
          });
        });
      });


      /***************************************************************************
       ** _rollUpInventory method ************************************************
       ***************************************************************************/

      describe('_rollUpInventory method', function () {
        describe('when the options are for sku variant', function () {
          beforeEach(function () {
            var childSkus = productModel.getLinks(
              { data: mocks.products['148-7656'].data, value: 'childSku' }
            );

            variantsCtlr._compileInventory([skuOptions.primary, skuOptions.secondary]);
            variantsCtlr._rollUpInventory(skuOptions.primary, childSkus);
          });


          it('should roll up secondary link inventory to the primary link', function () {
            var links = skuOptions.primary.links;

            expect(links[0].available).toBe(true);
            expect(links[0].subscribable).toBe(true);
            expect(links[0].availability).toBe('InStock');
            expect(links[0].inventoryMerged).toBe(true);
            expect(links[0].outOfStock).toBe(false);

            expect(links[1].available).toBe(true);
            expect(links[1].subscribable).toBe(true);
            expect(links[1].availability).toBe('InStock');
            expect(links[1].inventoryMerged).toBe(true);
            expect(links[1].outOfStock).toBe(false);
          });
        });


        describe('when the options are for mixed variant', function () {
          beforeEach(function () {
            var childSkus = productModel.getLinks(
              { data: mocks.products['204-7271'].data, value: 'childSku' }
            );

            variantsCtlr._compileInventory([mixedOptions.primary, mixedOptions.secondary]);
            variantsCtlr._rollUpInventory(mixedOptions.primary, childSkus);
          });


          it('should roll up secondary link inventory to the primary link', function () {
            var links = mixedOptions.primary.links;

            expect(links[0].available).toBe(true);
            expect(links[0].subscribable).toBe(false);
            expect(links[0].availability).toBe('InStock');
            expect(links[0].inventoryMerged).toBe(true);
            expect(links[0].outOfStock).toBe(undefined);

            expect(links[1].available).toBe(true);
            expect(links[1].subscribable).toBe(false);
            expect(links[1].availability).toBe('InStock');
            expect(links[1].inventoryMerged).toBe(true);
            expect(links[1].outOfStock).toBe(undefined);

            expect(links[2].available).toBe(true);
            expect(links[2].subscribable).toBe(true);
            expect(links[2].availability).toBe('InStock');
            expect(links[2].inventoryMerged).toBe(true);
            expect(links[2].outOfStock).toBe(false);
          });
        });
      });


      /***************************************************************************
       ** _setSelectedStates method **********************************************
       ***************************************************************************/

      describe('_setSelectedStates method', function () {
        describe('when the options are for sku variant', function () {
          var selected = {};


          beforeEach(function () {
            var childSkus = productModel.getLinks(
                { data: mocks.products['148-7656'].data, value: 'childSku' }
              ),
              options = [skuOptions.primary, skuOptions.secondary];

            variantsCtlr._compileInventory(options);
            variantsCtlr._rollUpInventory(skuOptions.primary, childSkus);
            variantsCtlr._setSelectedStates(options);

            fn.loopArray(options, function (i) {
              var option = options[i];

              fn.loopArray(option.links, function (j) {
                var link = option.links[j];

                if (link.id === option.selectedID) {
                  selected[option.type] = link;
                }
              });
            });
          });


          it('should set the selected states based on the selectedID', function () {
            expect(selected.primary.selected).toBe(true);
            expect(selected.secondary.selected).toBe(true);
          });
        });


        describe('when the options are for product variant', function () {
          describe('when there is no selectedSku', function () {
            var selected = {};


            beforeEach(function () {
              var options = [productOptions.primary, productOptions.secondary];

              variantsCtlr._compileInventory(options);
              variantsCtlr._setSelectedStates(options);

              fn.loopArray(options, function (i) {
                var option = options[i];

                fn.loopArray(option.links, function (j) {
                  var link = option.links[j];

                  if (link.id === option.selectedID) {
                    selected[option.type] = link;
                  }
                });
              });
            });


            it('should set the selected states based on the selectedID', function () {
              expect(selected.primary.selected).toBe(true);
              expect(selected.secondary).toBe(undefined);
            });
          });
        });


        describe('when the options are for mixed variant', function () {
          var selected = {};


          beforeEach(function () {
            var options = [mixedOptions.primary, mixedOptions.secondary];

            variantsCtlr._compileInventory(options);
            variantsCtlr._setSelectedStates(options);

            fn.loopArray(options, function (i) {
              var option = options[i];

              fn.loopArray(option.links, function (j) {
                var link = option.links[j];

                if (link.id === option.selectedID) {
                  selected[option.type] = link;
                }
              });
            });
          });


          it('should set the selected states based on the selectedID', function () {
            expect(selected.primary.selected).toBe(true);
            expect(selected.secondary).toBe(undefined);
          });
        });
      });


      /***************************************************************************
       ** _filterOptions method **************************************************
       ***************************************************************************/

      describe('_filterOptions method', function () {
        describe('when the options are for product variant', function () {
          beforeEach(function () {
            var options = [productOptions.primary, productOptions.secondary],
              product = mocks.products['313-0760'].data;

            variantsCtlr._compileInventory(options);
            variantsCtlr._setSelectedStates(options);
            variantsCtlr._filterOptions(options, productModel.isFF(product));
          });


          it('should filter out unavailable links', function () {
            expect(productOptions.primary.links.length).toBe(1);
            expect(productOptions.secondary.links.length).toBe(9);
          });
        });


        describe('when the options are for mixed variant', function () {
          beforeEach(function () {
            var options = [mixedOptions.primary, mixedOptions.secondary],
              product = mocks.products['204-7271'].data;

            variantsCtlr._compileInventory(options);
            variantsCtlr._setSelectedStates(options);
            variantsCtlr._filterOptions(options, productModel.isFF(product));
          });


          it('should filter out unavailable links', function () {
            expect(mixedOptions.primary.links.length).toBe(3);
            expect(mixedOptions.secondary.links.length).toBe(1);
          });
        });
      });


      /***************************************************************************
       ** _hasSwatches method ****************************************************
       ***************************************************************************/

      describe('_hasSwatches method', function () {
        beforeEach(function () {
          var options = [productOptions.primary, productOptions.secondary],
            product = mocks.products['313-0760'].data;

          variantsCtlr._compileInventory(options);
          variantsCtlr._setSelectedStates(options);
          variantsCtlr._filterOptions(options, productModel.isFF(product));
          variantsCtlr._hasSwatches(options);
        });


        it('should set hasSwatches prop based on links with swatches', function () {
          expect(productOptions.primary.hasSwatches).toBe(true);
          expect(productOptions.secondary.hasSwatches).toBe(false);
        });
      });


      /***************************************************************************
       ** _setDisplayStates method ***********************************************
       ***************************************************************************/

      describe('_setDisplayStates method', function () {
        describe('when the options are for sku variant', function () {
          beforeEach(function () {
            var options = [skuOptions.primary, skuOptions.secondary],
              product = mocks.products['148-7656'].data;

            variantsCtlr._compileInventory(options);
            variantsCtlr._setSelectedStates(options);
            variantsCtlr._filterOptions(options, productModel.isFF(product));
            variantsCtlr._hasSwatches(options);
            variantsCtlr._setDisplayStates(options, productModel.isFF(product));
          });


          it('should set display states based on link properties', function () {
            expect(skuOptions.primary.inDropdown).toBe(true);
            expect(skuOptions.primary.toDisplayOption).toBe(true);
            expect(skuOptions.secondary.inDropdown).toBe(true);
            expect(skuOptions.secondary.toDisplayOption).toBe(true);
          });
        });


        describe('when the options are for product variant', function () {
          beforeEach(function () {
            var options = [productOptions.primary, productOptions.secondary],
              product = mocks.products['313-0760'].data;

            variantsCtlr._compileInventory(options);
            variantsCtlr._setSelectedStates(options);
            variantsCtlr._filterOptions(options, productModel.isFF(product));
            variantsCtlr._hasSwatches(options);
            variantsCtlr._setDisplayStates(options, productModel.isFF(product));
          });


          it('should set display states based on link properties', function () {
            expect(productOptions.primary.inDropdown).toBe(false);
            expect(productOptions.primary.toDisplayOption).toBe(true);
            expect(productOptions.secondary.inDropdown).toBe(true);
            expect(productOptions.secondary.toDisplayOption).toBe(true);
          });
        });
      });
    });


    /***************************************************************************
     ** _collateDataDependancies method ****************************************
     ***************************************************************************/

    describe('_collateDataDependancies method', function () {
      var args = {},
        testData = null;


      describe('when product does not have variants', function () {
        beforeAll(function (done) {
          var deferred = $.Deferred();

          spyOn(page, '_isSkuInURL').and.returnValue(true);
          page.init(mocks.products['101-6583'].data, mocks.skus['101-6583'].data, null, deferred);
          deferred.done(function () {
            done();
          });
        });


        beforeEach(function (done) {
          args = {
            deferred: $.Deferred(),
            mParamData: { mvc: {
              flags: { isRecommenderVariant: false },
              products: mocks.products['101-6583'].data,
              sellers: { id: 'T000238037' }
            } }
          };

          variantsCtlr._collateDataDependancies(args);
          args.deferred.fail(function (resp) {
            testData = resp;
            done();
          });
        });


        it('should return null', function () {
          expect(testData).toBe(undefined);
        });
      });


      describe('when product is in a recommender', function () {
        beforeAll(function (done) {
          var deferred = $.Deferred();

          spyOn(page, '_isSkuInURL').and.returnValue(false);
          page.init(mocks.products['313-0760'].data, mocks.skus['252-1076'].data, null, deferred);
          deferred.done(function () {
            done();
          });
        });


        beforeEach(function (done) {
          args = {
            deferred: $.Deferred(),
            mParamData: { mvc: {
              flags: { isRecommenderVariant: true },
              products: mocks.products['313-0760'].data,
              sellers: { id: 'T000238037' }
            } }
          };

          variantsCtlr._collateDataDependancies(args);
          args.deferred.done(function (resp) {
            testData = resp.mParamData.mvc.vm;
            done();
          });
        });


        it('should return the collated primary and secondary options', function () {
          var primaryOption = testData.primary,
            secondaryOption = testData.secondary;

          expect(primaryOption.hasSwatches).toBe(false);
          expect(primaryOption.inDropdown).toBe(true);
          expect(primaryOption.internalName).toBe('colour');
          expect(primaryOption.links.length).toBe(2);
          expect(primaryOption.name).toBe('Colour');
          expect(primaryOption.productVariantSelected).toBe(true);
          expect(primaryOption.selectedID).toBe('313-0760');
          expect(primaryOption.selectedValue).toBe('Grey marl');
          expect(primaryOption.toDisplayOption).toBe(true);
          expect(primaryOption.type).toBe('primary');

          expect(secondaryOption.hasSwatches).toBe(false);
          expect(secondaryOption.inDropdown).toBe(true);
          expect(secondaryOption.internalName).toBe('p_size');
          expect(secondaryOption.links.length).toBe(9);
          expect(secondaryOption.name).toBe('Size');
          expect(secondaryOption.selectedID).toBe('');
          expect(secondaryOption.selectedValue).toBe('');
          expect(secondaryOption.toDisplayOption).toBe(true);
          expect(secondaryOption.type).toBe('secondary');
        });
      });


      describe('when product has variants', function () {
        describe('when isProductVariant is true and product has colour associations', function () {
          describe('when there are no primaryChildSkus', function () {
            beforeAll(function (done) {
              var deferred = $.Deferred();

              spyOn(page, '_isSkuInURL').and.returnValue(false);
              page.init(
                mocks.products['313-0760'].data, mocks.skus['252-1076'].data, null, deferred
              );
              deferred.done(function () {
                done();
              });
            });


            beforeEach(function (done) {
              mocks.stubAndReturn('products', ['313-0760', '657-7177'], 'inventory');
              spyOn(variantsCtlr, '_disableItemActions');

              args = {
                deferred: $.Deferred(),
                mParamData: { mvc: {
                  flags: { isRecommenderVariant: false },
                  products: mocks.products['313-0760'].data,
                  sellers: { id: 'T000238037' }
                } }
              };

              variantsCtlr._collateDataDependancies(args);
              args.deferred.done(function (resp) {
                testData = resp.mParamData.mvc.vm;
                done();
              });
            });


            it('should return the collated primary and secondary options', function () {
              var primaryOption = testData.primary,
                secondaryOption = testData.secondary;

              expect(primaryOption.displayCount).toBe(1);
              expect(primaryOption.hasInventory).toBe(true);
              expect(primaryOption.hasSwatches).toBe(true);
              expect(primaryOption.inDropdown).toBe(false);
              expect(primaryOption.internalName).toBe('colour');
              expect(primaryOption.links.length).toBe(1);
              expect(primaryOption.name).toBe('Colour');
              expect(primaryOption.productVariantSelected).toBe(true);
              expect(primaryOption.selectedID).toBe('313-0760');
              expect(primaryOption.selectedValue).toBe('Grey marl');
              expect(primaryOption.toDisplayOption).toBe(true);
              expect(primaryOption.type).toBe('primary');

              expect(secondaryOption.displayCount).toBe(9);
              expect(secondaryOption.hasInventory).toBe(true);
              expect(secondaryOption.hasSwatches).toBe(false);
              expect(secondaryOption.inDropdown).toBe(true);
              expect(secondaryOption.internalName).toBe('p_size');
              expect(secondaryOption.links.length).toBe(9);
              expect(secondaryOption.name).toBe('Size');
              expect(secondaryOption.selectedID).toBe('');
              expect(secondaryOption.selectedValue).toBe('');
              expect(secondaryOption.toDisplayOption).toBe(true);
              expect(secondaryOption.type).toBe('secondary');
            });


            it('should call the _disableItemActions method', function () {
              expect(variantsCtlr._disableItemActions.calls.count()).toBe(1);
            });
          });
        });
      });
    });
  });
});
