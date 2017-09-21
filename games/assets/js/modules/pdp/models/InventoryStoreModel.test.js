define(function (require) {
  'use strict';


  var InventoryStoreModel = require('modules/pdp/models/InventoryStoreModel'),
    mocks = require('test-framework/mocks/mocks'),
    fn = require('modules/mvc/fn'),
    model = {};


  /***************************************************************************
   ** createEndpoint method **************************************************
   ***************************************************************************/

  describe('the createEndpoint method', function () {
    var args = {},
      endpoints = [];

    beforeEach(function () {
      model = new InventoryStoreModel();
    });

    afterEach(function () {
      model = {};
      args = {};
      endpoints = [];
    });

    describe('when values are passed in', function () {
      beforeEach(function () {
        args = {
          values: ['02101,02425,02467', 'T0000a64e6']
        };
      });

      it('should return a URL endpoint', function () {
        endpoints = model.createEndpoint(args);

        expect(endpoints).not.toBeUndefined();
        expect(endpoints.length).toBe(1);
        expect(endpoints[0]).toEqual('availability?listingIds=T0000a64e6&locationIds=02101,02425,02467');
      });
    });

    describe('when endpoint is not found in DataEndpointMap', function () {
      beforeEach(function () {
        args = {
          values: ['02101,02425,02467', 'T0000a64e6']
        };
        model.sNamespace = 'FOO';
      });

      it('should return an empty array', function () {
        endpoints = model.createEndpoint(args);

        expect(endpoints).toEqual([]);
        expect(endpoints.length).toBe(0);
      });
    });

    describe('when values are not passed in', function () {
      beforeEach(function () {
        args = {
          values: []
        };
      });

      it('should return an empty array', function () {
        endpoints = model.createEndpoint(args);

        expect(endpoints).toEqual([]);
        expect(endpoints.length).toBe(0);
      });
    });
  });


  /***************************************************************************
   ** dataHandler method *****************************************************
   ***************************************************************************/

  describe('the dataHandler method', function () {
    beforeEach(function () {
      model = new InventoryStoreModel();
      spyOn(model, 'add').and.callThrough();
    });

    afterEach(function () {
      model = {};
    });

    describe('when availability data is passed in', function () {
      it('should add availability data to the model', function () {
        model.dataHandler(mocks.availabilities['03362'].data);

        expect(model.add).toHaveBeenCalled();
        expect(model.add).toHaveBeenCalledWith([{
          productReference: {
            id: 'T0000a64e6',
            type: 'listing'
          },
          location: {
            id: '03362',
            error: 'Not found'
          },
          stock_status: 'IN_STOCK',
          available: true,
          id: '03362',
          stockStatusMessage: 'In stock'
        }]);
      });

      it('should add id to the data going in to the model', function () {
        var dataStore = {};

        model.dataHandler(mocks.availabilities['03362'].data);
        dataStore = model.getDataStoreByID('03362');

        expect(dataStore.id).toEqual('03362');
      });

      it('should add stockStatusMessage to the data going in to the model', function () {
        var dataStore = {};

        model.dataHandler(mocks.availabilities['03362'].data);
        dataStore = model.getDataStoreByID('03362');

        expect(dataStore.stockStatusMessage).toEqual('In stock');
      });

      describe('but contains an error resp', function () {
        var _data = fn.copy(mocks.availabilities['03362'].data, { deep: true });

        _data.availabilities[0].error = 'Internal server error';

        it('should not add data to the model', function () {
          var dataStore = {};

          model.dataHandler(_data);
          dataStore = model.getDataStoreByID('03362');

          expect(model.add).toHaveBeenCalledWith([]);
          expect(dataStore.hasOwnProperty('id')).toBe(false);
        });
      });
    });

    describe('when no availabily data is passed in', function () {
      it('should not call the add method', function () {
        model.dataHandler({ availabilities: [] });

        expect(model.add).not.toHaveBeenCalled();
      });
    });
  });
});
