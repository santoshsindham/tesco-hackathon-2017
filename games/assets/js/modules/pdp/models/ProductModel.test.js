define([
  'modules/pdp/models/ProductModel',
  'modules/mvc/fn',
  'test-framework/mocks/mocks',
  'json!test-framework/mocks/tesco/content/catalog/product/313-0760.json',
  'json!test-framework/mocks/tesco/content/catalog/product/420-1034.json'
], function (ProductModel, fn, mocks, dressProduct, jacketProduct) {
  'use strict';

  var productModel = {};


  /***************************************************************************
   ** getDefaultSku method ***************************************************
   ***************************************************************************/

  describe('getDefaultSku', function () {
    var defaultSkuLink = {},
      PRD_313_0760 = {},
      PRD_134_0387 = {};


    beforeEach(function () {
      defaultSkuLink = {
        id: '226-1706',
        type: 'sku',
        rel: 'defaultSku',
        href: '/direct/rest/content/catalog/sku/226-1706',
        options: {
          primary: 'Green',
          secondary: 'Adult 14 1/2',
          swatch: '//dvgmofeweb001uk.dev.global.tesco.org/directuiassets/ProductAssets/226/226-1706/Swatches/302-0239_SW_1000004SW01_pdp.jpg'
        }
      };

      PRD_313_0760 = fn.copyObject(mocks.products['313-0760'].data, { deep: true });
      PRD_134_0387 = fn.copyObject(mocks.products['134-0387'].data, { deep: true });

      productModel = new ProductModel();
      productModel.setDataStores([PRD_313_0760, PRD_134_0387]);
      productModel.unsetLinks('313-0760', 'rel', 'defaultSku');
    });


    afterEach(function () {
      productModel = {};
    });


    describe('when no defaultSku link is found', function () {
      it('should return an empty object', function () {
        expect(productModel.getDefaultSku('313-0760')).toEqual({});
      });
    });


    describe('when a defaultSku link is found', function () {
      it('should return the defaultSku link object', function () {
        expect(productModel.getDefaultSku('134-0387')).toEqual(defaultSkuLink);
      });
    });
  });


  /***************************************************************************
   ** getLinks method ********************************************************
   ***************************************************************************/

  describe('getLinks method', function () {
    var model = new ProductModel();

    model._aDataStores.push(dressProduct);
    model._aDataStores.push(jacketProduct);


    describe('a links request', function () {
      var linksFromId = model.getLinks({ key: 'rel', value: 'childSku', data: '313-0760' }),
        linksFromIds = model.getLinks(
          { key: 'rel', value: 'childSku', data: ['313-0760', '420-1034'] }
        ),
        linksFromObj = model.getLinks({ key: 'rel', value: 'childSku', data: dressProduct }),
        linksFromObjs = model.getLinks(
          { key: 'rel', value: 'childSku', data: [dressProduct, jacketProduct] }
        );


      it('should return an array with the correct number of values', function () {
        // linksFromId
        expect(Array.isArray(linksFromId)).toEqual(true);
        expect(linksFromId.length).toEqual(9);
        // linksFromObj
        expect(Array.isArray(linksFromObj)).toEqual(true);
        expect(linksFromObj.length).toEqual(9);
        // linksFromIds
        expect(Array.isArray(linksFromIds)).toEqual(true);
        expect(linksFromIds.length).toEqual(14);
        // linksFromObjs
        expect(Array.isArray(linksFromObjs)).toEqual(true);
        expect(linksFromObjs.length).toEqual(14);
      });


      it('should return objects with a prop/value that matches the key/value args', function () {
        // linksFromId
        expect($.isPlainObject(linksFromId[0])).toEqual(true);
        expect(linksFromId[0].rel).toEqual('childSku');
        // linksFromObj
        expect($.isPlainObject(linksFromObj[0])).toEqual(true);
        expect(linksFromObj[0].rel).toEqual('childSku');
        // linksFromIds
        expect($.isPlainObject(linksFromIds[0])).toEqual(true);
        expect(linksFromIds[0].rel).toEqual('childSku');
        // linksFromObjs
        expect($.isPlainObject(linksFromObjs[0])).toEqual(true);
        expect(linksFromObjs[0].rel).toEqual('childSku');
      });
    });


    describe('a link request where no match is found', function () {
      var linksFromId = model.getLinks({ key: 'rel', value: 'listing', data: '313-0760' }),
        linksFromIds = model.getLinks(
          { key: 'rel', value: 'listing', data: ['313-0760', '420-1034'] }
        ),
        linksFromObj = model.getLinks({ key: 'rel', value: 'listing', data: dressProduct }),
        linksFromObjs = model.getLinks(
          { key: 'rel', value: 'listing', data: [dressProduct, jacketProduct] }
        );


      it('should return an empty array if no matches are found', function () {
        // linksFromId
        expect(linksFromId.length).toEqual(0);
        // linksFromObj
        expect(linksFromObj.length).toEqual(0);
        // linksFromIds
        expect(linksFromIds.length).toEqual(0);
        // linksFromObjs
        expect(linksFromObjs.length).toEqual(0);
      });
    });


    describe('a link request when no key is given', function () {
      var linksFromId = model.getLinks({ value: 'self', data: '313-0760' }),
        linksFromIds = model.getLinks({ value: 'self', data: ['313-0760', '420-1034'] }),
        linksFromObj = model.getLinks({ value: 'self', data: dressProduct }),
        linksFromObjs = model.getLinks({ value: 'self', data: [dressProduct, jacketProduct] });


      it('should return objects where the rel prop value matches the value arg', function () {
        // linksFromId
        expect(linksFromId[0].rel).toEqual('self');
        // linksFromObj
        expect(linksFromObj[0].rel).toEqual('self');
        // linksFromIds
        expect(linksFromIds[0].rel).toEqual('self');
        // linksFromObjs
        expect(linksFromObjs[0].rel).toEqual('self');
      });
    });


    describe('a link request where a child key/value is given', function () {
      var linksFromId = model.getLinks(
          { key: 'options', childKey: 'primary', childValue: 'Grey marl', data: '313-0760' }
        ),
        linksFromIds = model.getLinks({
          key: 'options',
          childKey: 'primary',
          childValue: 'Grey marl',
          data: ['313-0760', '420-1034']
        }),
        linksFromObj = model.getLinks(
          { key: 'options', childKey: 'primary', childValue: 'Grey marl', data: dressProduct }
        ),
        linksFromObjs = model.getLinks({
          key: 'options',
          childKey: 'primary',
          childValue: 'Grey marl',
          data: [dressProduct, jacketProduct]
        });


      it('should return objects where the prop value is an object and it has a prop/value that '
          + 'matches the childKey/childValue args', function () {
        // linksFromId
        expect($.isPlainObject(linksFromId[0].options)).toEqual(true);
        expect(linksFromId[0].options.primary).toEqual('Grey marl');
        // linksFromObj
        expect($.isPlainObject(linksFromObj[0].options)).toEqual(true);
        expect(linksFromObj[0].options.primary).toEqual('Grey marl');
        // linksFromIds
        expect($.isPlainObject(linksFromIds[0].options)).toEqual(true);
        expect(linksFromIds[0].options.primary).toEqual('Grey marl');
        // linksFromObjs
        expect($.isPlainObject(linksFromObjs[0].options)).toEqual(true);
        expect(linksFromObjs[0].options.primary).toEqual('Grey marl');
      });
    });


    describe('a links request using the legcy method', function () {
      var links = model.getLinks('self', '313-0760');


      it('should returned an array', function () {
        expect(Array.isArray(links)).toEqual(true);
      });


      it('should return objects with a rel prop value that matches the value arg', function () {
        expect($.isPlainObject(links[0])).toEqual(true);
        expect(links[0].rel).toEqual('self');
      });
    });
  });


  /***************************************************************************
   ** setLinks method ********************************************************
   ***************************************************************************/

  describe('setLinks method', function () {
    var links = {},
      PRD_313_0760 = {};


    beforeEach(function () {
      links = {
        defaultSku: {
          id: '226-1706',
          type: 'sku',
          rel: 'defaultSku',
          href: '/direct/rest/content/catalog/sku/226-1706',
          options: {
            primary: 'Green',
            secondary: 'Adult 14 1/2',
            swatch: '//dvgmofeweb001uk.dev.global.tesco.org/directuiassets/ProductAssets/226/226-1706/Swatches/302-0239_SW_1000004SW01_pdp.jpg'
          }
        },
        colourAssociation: {
          id: '482-8572',
          type: 'product',
          rel: 'colourAssociation',
          href: '/direct/rest/content/catalog/product/482-8572',
          options: {
            primary: 'Denim',
            swatch: '//dvgmofeweb001uk.dev.global.tesco.org/directuiassets/ProductAssets/135/135-9485/Swatches/302-0239_SW_1000004SW01_pdp.jpg'
          }
        }
      };

      PRD_313_0760 = fn.copyObject(mocks.products['313-0760'].data, { deep: true });
      PRD_313_0760.links = [];
      productModel = new ProductModel();
      spyOn(productModel, 'setDataStores').and.callThrough();
    });


    afterEach(function () {
      productModel = {};
    });


    describe('when the data argument is invalid', function () {
      it('should return and not add the objects to the links array', function () {
        expect(productModel.setLinks('123-4567', links.defaultSku));
        expect(productModel.setDataStores).not.toHaveBeenCalled();
      });
    });


    describe('when the links argument is invalid', function () {
      beforeEach(function () {
        productModel.setDataStores(PRD_313_0760);
        productModel.setDataStores.calls.reset();
      });


      afterEach(function () {
        productModel.unsetDataStores({ value: PRD_313_0760.id });
      });


      it('should return and not add the objects to the links array', function () {
        expect(productModel.getDataStores({ value: PRD_313_0760.id }).links.length).toBe(0);
        expect(productModel.setLinks(PRD_313_0760.id, [links.defaultSku, '...']));
        expect(productModel.setDataStores).not.toHaveBeenCalled();
        expect(productModel.getDataStores({ value: PRD_313_0760.id }).links.length).toBe(0);
      });
    });


    describe('when one link object is passed in', function () {
      beforeEach(function () {
        productModel.setDataStores(PRD_313_0760);
        productModel.setDataStores.calls.reset();
      });


      afterEach(function () {
        productModel.unsetDataStores({ value: PRD_313_0760.id });
      });


      it('should add the object to the links array', function () {
        expect(productModel.getDataStores({ value: PRD_313_0760.id }).links.length).toBe(0);
        expect(productModel.setLinks(PRD_313_0760.id, links.defaultSku));
        expect(productModel.setDataStores).toHaveBeenCalled();
        expect(productModel.setDataStores.calls.count()).toBe(1);
        expect(productModel.getDataStores({ value: PRD_313_0760.id }).links.length).toBe(1);
      });
    });


    describe('when two link objects are passed in', function () {
      beforeEach(function () {
        productModel.setDataStores(PRD_313_0760);
        productModel.setDataStores.calls.reset();
      });


      afterEach(function () {
        productModel.unsetDataStores({ value: PRD_313_0760.id });
      });


      it('should add the objects to the links array', function () {
        expect(productModel.getDataStores({ value: PRD_313_0760.id }).links.length).toBe(0);
        expect(productModel.setLinks(PRD_313_0760.id, [links.defaultSku, links.colourAssociation]));
        expect(productModel.setDataStores).toHaveBeenCalled();
        expect(productModel.setDataStores.calls.count()).toBe(1);
        expect(productModel.getDataStores({ value: PRD_313_0760.id }).links.length).toBe(2);
      });
    });
  });


  /***************************************************************************
   ** unsetLinks method ******************************************************
   ***************************************************************************/

  describe('unsetLinks method', function () {
    var links = [],
      PRD_313_0760 = {},
      PRD_434_0420 = {};


    beforeEach(function () {
      PRD_313_0760 = fn.copyObject(mocks.products['313-0760'].data, { deep: true });
      PRD_434_0420 = fn.copyObject(mocks.products['434-0420'].data, { deep: true });
      PRD_434_0420.links = [];
      links = fn.copyArray(PRD_313_0760.links, { deep: true });

      productModel = new ProductModel();
      productModel.setDataStores([PRD_313_0760, PRD_434_0420]);
      spyOn(productModel, 'setDataStores').and.callThrough();
    });


    afterEach(function () {
      productModel = {};
    });


    describe('when no data object is found', function () {
      it('should return out of the function', function () {
        expect(productModel.unsetLinks('123-4567'));
        expect(productModel.setDataStores).not.toHaveBeenCalled();
      });
    });


    describe('when data object has no links', function () {
      it('should return out of the function', function () {
        expect(productModel.unsetLinks('434-0420'));
        expect(productModel.setDataStores).not.toHaveBeenCalled();
      });
    });


    describe('when no key/value pair is passed in', function () {
      beforeEach(function () {
        productModel.setDataStores.calls.reset();
      });


      afterEach(function () {
        productModel.setLinks(PRD_313_0760.id, links);
      });


      it('should remove all objects in the links array', function () {
        expect(productModel.getDataStores({ value: PRD_313_0760.id }).links.length).toBe(
          PRD_313_0760.links.length
        );
        expect(productModel.unsetLinks(PRD_313_0760.id));
        expect(productModel.setDataStores).toHaveBeenCalled();
        expect(productModel.setDataStores.calls.count()).toBe(1);
        expect(productModel.getDataStores({ value: PRD_313_0760.id }).links.length).toBe(0);
      });
    });


    describe('when no matching key/value pair is passed in', function () {
      beforeEach(function () {
        productModel.setDataStores.calls.reset();
      });


      afterEach(function () {
        productModel.setLinks(PRD_313_0760.id, links);
      });


      it('should not remove any objects from the links array', function () {
        expect(productModel.getDataStores({ value: PRD_313_0760.id }).links.length).toBe(
          PRD_313_0760.links.length
        );
        expect(productModel.unsetLinks(PRD_313_0760.id, 'rel', 'noMatch'));
        expect(productModel.setDataStores).toHaveBeenCalled();
        expect(productModel.setDataStores.calls.count()).toBe(1);
        expect(productModel.getDataStores({ value: PRD_313_0760.id }).links.length).toBe(
          PRD_313_0760.links.length
        );
      });
    });


    describe('when a matching key/value pair is passed in', function () {
      beforeEach(function () {
        productModel.setDataStores.calls.reset();
      });


      afterEach(function () {
        productModel.setLinks(PRD_313_0760.id, links);
      });


      it('should remove the matching objects from the links array', function () {
        expect(productModel.getDataStores({ value: PRD_313_0760.id }).links.length).toBe(
          PRD_313_0760.links.length
        );
        expect(productModel.unsetLinks(PRD_313_0760.id, 'rel', 'childSku'));
        expect(productModel.setDataStores).toHaveBeenCalled();
        expect(productModel.setDataStores.calls.count()).toBe(1);
        expect(productModel.getDataStores({ value: PRD_313_0760.id }).links.length).toBe(8);
      });
    });
  });


  /***************************************************************************
   ** _checkDataStores method ************************************************
   ***************************************************************************/

  describe('_checkDataStores method', function () {
    var comparisonData = undefined,
      mixedObjects = [],
      productObjects = [],
      rrObjects = [],
      testData = undefined;


    beforeEach(function () {
      rrObjects = mocks.rr.cwvav.data.items;

      fn.loopObject(mocks.products, function loopProducts(id) {
        productObjects.push(mocks.products[id].data);
      });

      mixedObjects = mixedObjects.concat(rrObjects.slice(0, 3));
      mixedObjects = mixedObjects.concat(productObjects.slice(0, 2));
      productModel = new ProductModel({});
    });


    afterEach(function () {
      mixedObjects = [];
      productModel = {};
      productObjects = [];
      rrObjects = [];
    });


    describe('when no data is passed in', function () {
      it('should return an empty array', function () {
        expect(productModel._checkDataStores(null)).toEqual([]);
      });
    });


    describe('when all data objects have links', function () {
      it('should return an empty array', function () {
        expect(productModel._checkDataStores(productObjects)).toEqual([]);
      });
    });


    describe('when one data object is passed in that does not have links', function () {
      it('should return an array with the ID of the object without links', function () {
        expect(productModel._checkDataStores(rrObjects[0])).toEqual([rrObjects[0].id]);
      });
    });


    describe('when multiple data objects are passed in that do not have links', function () {
      beforeEach(function () {
        comparisonData = rrObjects.slice(0, 3).map(function (obj) { return obj.id; });
        testData = productModel._checkDataStores(mixedObjects);
      });


      it('should return an array with the IDs of the objects without links', function () {
        expect(testData).toEqual(comparisonData);
      });
    });
  });


  /***************************************************************************
   ** getDataStores method ***************************************************
   ***************************************************************************/

  describe('getDataStores method', function () {
    var testData = undefined,
      addedIDs = [],
      matches = 0;


    beforeEach(function () {
      productModel = new ProductModel({});
      addedIDs = [];

      fn.loopObject(mocks.products, function loopProducts(id) {
        addedIDs.push(mocks.products[id].data.id);
        productModel.setDataStores(mocks.products[id].data);
      });
    });


    afterEach(function () {
      productModel = {};
      addedIDs = [];
    });


    describe('when no args are passed in', function () {
      beforeEach(function () {
        testData = productModel.getDataStores();

        fn.loopArray(testData, function loopTestData(i) {
          fn.loopArray(addedIDs, function loopAddedIDs(j) {
            if (testData[i].id === addedIDs[j]) {
              matches += 1;
            }
          });
        });
      });


      afterEach(function () {
        productModel.unsetDataStores();
        testData = undefined;
        matches = 0;
      });


      it('should return all the data stores in the model', function () {
        expect(matches).toBe(addedIDs.length);
      });
    });


    describe('when one value is passed in', function () {
      describe('when there is a matching data store', function () {
        beforeEach(function () {
          testData = productModel.getDataStores({ value: '742-8388' });
        });


        it('should return the matching data store', function () {
          expect(testData.id).toBe('742-8388');
        });
      });


      describe('when there is no matching data store', function () {
        beforeEach(function () {
          testData = productModel.getDataStores({ value: '123-4567' });
        });


        it('should return an empty object', function () {
          expect(testData).toEqual({});
        });
      });
    });


    describe('when multiple values are passed in', function () {
      describe('when there are matching data stores', function () {
        var value = ['724-1190', '661-8688', '627-6262'];


        beforeEach(function () {
          testData = productModel.getDataStores({ value: value });

          fn.loopArray(testData, function loopTestData(i) {
            fn.loopArray(value, function loopValue(j) {
              if (testData[i].id === value[j]) {
                matches += 1;
              }
            });
          });
        });


        afterEach(function () {
          matches = 0;
        });


        it('should return the matching data stores', function () {
          expect(matches).toBe(3);
        });
      });


      describe('when there are some matching data stores', function () {
        var value = ['724-1190', '661-8688', '627-6262', '123-4567', '456-7890'];


        beforeEach(function () {
          testData = productModel.getDataStores({ value: value });
        });


        it('should return the matching data stores', function () {
          expect(testData.length).toBe(3);
        });
      });


      describe('when there are no matching data stores', function () {
        var value = ['123-4567', '456-7890'];


        beforeEach(function () {
          testData = productModel.getDataStores({ value: value });
        });


        it('should return an empty array', function () {
          expect(testData).toEqual([]);
        });
      });
    });


    describe('when fetch is passed in as true', function () {
      beforeEach(function () {
        jasmine.Ajax.install();
        productModel.unsetDataStores();
        spyOn(productModel, 'fetch').and.callThrough();
      });


      afterEach(function () {
        jasmine.Ajax.uninstall();
      });


      describe('when one value is passed in', function () {
        describe('when there is a matching data store', function () {
          beforeEach(function (done) {
            productModel.setDataStores(mocks.products['284-4665'].data);
            productModel.getDataStores({ value: '284-4665', fetch: true })
              .done(function (respData) {
                testData = respData;
                done();
              });
          });


          afterEach(function () {
            productModel.unsetDataStores();
          });


          it('should resolve the deferred object and return data store', function () {
            expect(productModel.fetch).not.toHaveBeenCalled();
            expect(testData.id).toBe('284-4665');
            expect(productModel.getDataStores().length).toBe(1);
            expect(productModel.getDataStores({ value: '284-4665' }).id).toBe('284-4665');
          });
        });


        describe('when there is no matching data store', function () {
          beforeEach(function (done) {
            jasmine.Ajax
              .stubRequest(mocks.products['199-1072'].url)
              .andReturn(mocks.products['199-1072'].resp.success);

            productModel.getDataStores({ value: '199-1072', fetch: true })
              .done(function (respData) {
                testData = respData;
                done();
              });
          });


          afterEach(function () {
            productModel.unsetDataStores();
          });


          it('should fetch the missing data store and resolve the deferred object '
              + 'with the requested data store', function () {
            expect(productModel.fetch).toHaveBeenCalled();
            expect(productModel.fetch.calls.count()).toBe(1);
            expect(testData.id).toBe('199-1072');
            expect(productModel.getDataStores().length).toBe(1);
            expect(productModel.getDataStores({ value: '199-1072' }).id).toBe('199-1072');
          });


          describe('when the fetch does not return a data store', function () {
            beforeEach(function (done) {
              jasmine.Ajax
                .stubRequest(mocks.products['199-1072'].url)
                .andReturn(mocks.products['199-1072'].resp.notFound);

              productModel.fetch.calls.reset();
              productModel.unsetDataStores();
              productModel.getDataStores({ value: '199-1072', fetch: true })
                .done(function (respData) {
                  testData = respData;
                  done();
                });
            });


            afterEach(function () {
              productModel.unsetDataStores();
            });


            it('should resolve the deferred object and return an empty object', function () {
              expect(productModel.fetch).toHaveBeenCalled();
              expect(productModel.fetch.calls.count()).toBe(1);
              expect(testData).toEqual({});
              expect(productModel.getDataStores().length).toBe(0);
            });
          });
        });


        describe('when the matching data store has incomplete data', function () {
          var value = mocks.rr.cwvav.data.items[0].id;


          beforeEach(function (done) {
            jasmine.Ajax
              .stubRequest(mocks.products['572-0859'].url)
              .andReturn(mocks.products['572-0859'].resp.success);

            productModel.setDataStores(mocks.rr.cwvav.data.items[0]);
            productModel.getDataStores({ value: value, fetch: true })
              .done(function (respData) {
                testData = respData;
                done();
              });
          });


          afterEach(function () {
            productModel.unsetDataStores();
          });


          it('should fetch the data store and resolve the deferred object '
              + 'with the requested data store', function () {
            expect(productModel.fetch).toHaveBeenCalled();
            expect(productModel.fetch.calls.count()).toBe(1);
            expect(testData.id).toBe(value);
            expect(productModel.getDataStores().length).toBe(1);
            expect(productModel.getDataStores({ value: value }).id).toBe(value);
            expect(fn.isArray(productModel.getDataStores(
              { value: value }).links, { notEmpty: true }
            )).toBe(true);
          });
        });
      });


      describe('when multiple values are passed in', function () {
        describe('when all the values match data stores', function () {
          var value = ['101-6583', '129-8921', '130-0023'];


          beforeEach(function (done) {
            fn.loopObject(mocks.products, function loopProducts(id) {
              productModel.setDataStores(mocks.products[id].data);
            });

            productModel.getDataStores({ value: value, fetch: true })
              .done(function (respData) {
                testData = respData;

                fn.loopArray(testData, function loopTestData(i) {
                  fn.loopArray(value, function loopValue(j) {
                    if (testData[i].id === value[j]) {
                      matches += 1;
                    }
                  });
                });

                done();
              });
          });


          afterEach(function () {
            matches = 0;
            productModel.unsetDataStores();
          });


          it('should resolve the deferred object with all the requested data stores', function () {
            expect(productModel.fetch).not.toHaveBeenCalled();
            expect(matches).toBe(value.length);
          });
        });


        describe('when some data stores are in the model and some need to be fetched', function () {
          var value = ['101-6583', '129-8921', '130-0023', '556-3837', '572-0859'];


          beforeEach(function (done) {
            productModel
              .setDataStores(mocks.products['101-6583'].data)
              .setDataStores(mocks.products['129-8921'].data)
              .setDataStores(mocks.products['130-0023'].data);

            jasmine.Ajax
              .stubRequest(mocks.products['556-3837'].url)
              .andReturn(mocks.products['556-3837'].resp.success);
            jasmine.Ajax
              .stubRequest(mocks.products['572-0859'].url)
              .andReturn(mocks.products['572-0859'].resp.success);

            productModel.getDataStores({ value: value, fetch: true })
              .done(function (respData) {
                testData = respData;

                fn.loopArray(testData, function loopTestData(i) {
                  fn.loopArray(value, function loopValue(j) {
                    if (testData[i].id === value[j]) {
                      matches += 1;
                    }
                  });
                });

                done();
              });
          });


          afterEach(function () {
            matches = 0;
            productModel.unsetDataStores();
          });


          it('should fetch the missing data stores and resolve the deferred object '
              + 'with all the requested data stores', function () {
            expect(productModel.fetch).toHaveBeenCalled();
            expect(productModel.fetch.calls.count()).toBe(1);
            expect(matches).toBe(value.length);
            expect(productModel.getDataStores().length).toBe(value.length);
          });
        });


        describe('when all data stores need to be fetched', function () {
          var value = ['101-6583', '129-8921', '130-0023', '556-3837', '572-0859'];


          beforeEach(function (done) {
            jasmine.Ajax
              .stubRequest(mocks.products['101-6583'].url)
              .andReturn(mocks.products['101-6583'].resp.success);
            jasmine.Ajax
              .stubRequest(mocks.products['129-8921'].url)
              .andReturn(mocks.products['129-8921'].resp.success);
            jasmine.Ajax
              .stubRequest(mocks.products['130-0023'].url)
              .andReturn(mocks.products['130-0023'].resp.success);
            jasmine.Ajax
              .stubRequest(mocks.products['556-3837'].url)
              .andReturn(mocks.products['556-3837'].resp.success);
            jasmine.Ajax
              .stubRequest(mocks.products['572-0859'].url)
              .andReturn(mocks.products['572-0859'].resp.success);

            productModel.getDataStores({ value: value, fetch: true })
              .done(function (respData) {
                testData = respData;

                fn.loopArray(testData, function loopTestData(i) {
                  fn.loopArray(value, function loopValue(j) {
                    if (testData[i].id === value[j]) {
                      matches += 1;
                    }
                  });
                });

                done();
              });
          });


          afterEach(function () {
            matches = 0;
            productModel.unsetDataStores();
          });


          it('should fetch all the data stores and resolve the deferred object '
              + 'with all the requested data stores', function () {
            expect(productModel.fetch).toHaveBeenCalled();
            expect(productModel.fetch.calls.count()).toBe(1);
            expect(matches).toBe(value.length);
            expect(productModel.getDataStores().length).toBe(value.length);
          });
        });


        describe('when some of the data stores have incomplete data structures', function () {
          var value = ['101-6583', '199-1072', '556-3837', '572-0859'],
            withLinks = 0;


          beforeEach(function (done) {
            productModel
              .setDataStores(mocks.rr.cwvav.data[0])
              .setDataStores(mocks.rr.cwvav.data[1]);

            jasmine.Ajax
              .stubRequest(mocks.products['101-6583'].url)
              .andReturn(mocks.products['101-6583'].resp.success);
            jasmine.Ajax
              .stubRequest(mocks.products['199-1072'].url)
              .andReturn(mocks.products['199-1072'].resp.success);
            jasmine.Ajax
              .stubRequest(mocks.products['556-3837'].url)
              .andReturn(mocks.products['556-3837'].resp.success);
            jasmine.Ajax
              .stubRequest(mocks.products['572-0859'].url)
              .andReturn(mocks.products['572-0859'].resp.success);

            productModel.getDataStores({ value: value, fetch: true })
              .done(function (respData) {
                testData = respData;

                fn.loopArray(testData, function loopTestData(i) {
                  fn.loopArray(value, function loopValue(j) {
                    if (testData[i].id === value[j]) {
                      matches += 1;

                      if (fn.isArray(testData[i].links)) {
                        withLinks += 1;
                      }
                    }
                  });
                });

                done();
              });
          });


          afterEach(function () {
            matches = 0;
            productModel.unsetDataStores();
          });


          it('should fetch all the data stores and resolve the deferred object '
              + 'with all the requested data stores', function () {
            expect(productModel.fetch).toHaveBeenCalled();
            expect(productModel.fetch.calls.count()).toBe(1);
            expect(matches).toBe(value.length);
            expect(withLinks).toBe(value.length);
            expect(productModel.getDataStores().length).toBe(value.length);
          });
        });


        describe('when some of the requests fail', function () {
          var value = ['101-6583', '199-1072', '556-3837', '572-0859'];


          beforeEach(function (done) {
            jasmine.Ajax
              .stubRequest(mocks.products['101-6583'].url)
              .andReturn(mocks.products['101-6583'].resp.notFound);
            jasmine.Ajax
              .stubRequest(mocks.products['199-1072'].url)
              .andReturn(mocks.products['199-1072'].resp.success);
            jasmine.Ajax
              .stubRequest(mocks.products['556-3837'].url)
              .andReturn(mocks.products['556-3837'].resp.internalError);
            jasmine.Ajax
              .stubRequest(mocks.products['572-0859'].url)
              .andReturn(mocks.products['572-0859'].resp.success);

            productModel.getDataStores({ value: value, fetch: true })
              .done(function (respData) {
                testData = respData;
                done();
              });
          });


          afterEach(function () {
            productModel.unsetDataStores();
          });


          it('should resolve the deferred objects with an empty array', function () {
            expect(testData).toEqual([]);
            expect(productModel.getDataStores().length).toBe(0);
          });
        });
      });
    });


    describe('when observe is passed in as true', function () {
      // TODO
    });
  });
});
