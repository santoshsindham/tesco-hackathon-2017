define(function (require) {
  'use strict';


  var StoreModel = require('modules/pdp/models/StoreModel'),
    mocks = require('test-framework/mocks/mocks'),
    model = {};


  /***************************************************************************
   ** calculateDistance method ***********************************************
   ***************************************************************************/

  describe('the calculateDistance method', function () {
    var distance = null,
      fromPoint = { latitude: '51.8998', longitude: '-0.2026' },
      store = {},
      storeLocation = {};

    beforeAll(function () {
      model = new StoreModel();
    });

    afterAll(function () {
      model = {};
    });

    beforeEach(function () {
      model.setDataStores([
        mocks.stores['03362'].data, mocks.stores['03142'].data, mocks.stores['02425'].data
      ]);
      store = model.getDataStores({ value: '03362' });
      storeLocation = { latitude: store.latitude, longitude: store.longitude };
    });

    afterEach(function () {
      model.unsetDataStores();
      store = {};
      storeLocation = {};
      distance = null;
    });


    describe('when no data is passed in', function () {
      it('should return null', function () {
        distance = model.calculateDistance();

        expect(distance).toEqual(null);
      });
    });


    describe('when start or end data is not passed in', function () {
      it('should return null', function () {
        distance = model.calculateDistance(fromPoint);

        expect(distance).toEqual(null);
      });
    });


    describe('when longitude or latitude data is missing', function () {
      it('should return null', function () {
        distance = model.calculateDistance({ latitude: '51.8998' }, storeLocation);

        expect(distance).toEqual(null);
      });
    });


    describe('when good start and end location data is passed in', function () {
      it('should return a number', function () {
        distance = model.calculateDistance(fromPoint, storeLocation);

        expect(typeof distance).toEqual('number');
      });

      it('should return the distance in miles', function () {
        distance = model.calculateDistance(fromPoint, storeLocation);

        expect(distance).toEqual(9.510583509049395);
      });


      describe('and optional unit type is passed in', function () {
        it('should return the distance in kilometres', function () {
          distance = model.calculateDistance(fromPoint, storeLocation, 'K');

          expect(distance).toEqual(15.305800506787591);
        });

        it('should return the distance in nautical miles', function () {
          distance = model.calculateDistance(fromPoint, storeLocation, 'N');

          expect(distance).toEqual(8.258990719258493);
        });
      });
    });
  });


  /***************************************************************************
   ** createEndpoint method **************************************************
   ***************************************************************************/

  describe('the createEndpoint method', function () {
    var args = {},
      endpoints = [];

    beforeEach(function () {
      model = new StoreModel();
    });

    afterEach(function () {
      model = {};
      args = {};
      endpoints = [];
    });

    describe('when modelMethod is not passed in', function () {
      beforeEach(function () {
        args = {
          values: ['51.8998', '-0.2026']
        };
      });

      it('should return a URL endpoint', function () {
        endpoints = model.createEndpoint(args);

        expect(endpoints).not.toBeUndefined();
        expect(endpoints.length).toBe(1);
        expect(endpoints[0]).toEqual('storeSearch?lat=51.8998&lon=-0.2026&num=30&formats=Extra,Superstore');
      });
    });

    describe('when modelMethod is passed in', function () {
      beforeEach(function () {
        args = {
          values: ['02101'],
          modelMethod: 'storeDetails'
        };
      });

      it('should return a URL endpoint', function () {
        endpoints = model.createEndpoint(args);

        expect(endpoints).not.toBeUndefined();
        expect(endpoints.length).toBe(1);
        expect(endpoints[0]).toEqual('content/stores/store/02101');
      });
    });

    describe('when endpoint is not found in DataEndpointMap', function () {
      beforeEach(function () {
        args = {
          values: ['02101'],
          modelMethod: 'storeDetails'
        };
        model.sNamespace = 'FOO';
      });

      it('should return an empty array', function () {
        endpoints = model.createEndpoint(args);

        expect(endpoints).toEqual([]);
        expect(endpoints.length).toBe(0);
      });
    });
  });
});
