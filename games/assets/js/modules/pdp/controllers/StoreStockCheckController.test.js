define([
  'modules/pdp/controllers/StoreStockCheckController',
  'modules/pdp/models/StoreModel',
  'modules/pdp/models/InventoryStoreModel',
  'modules/pdp/models/SkuModel',
  'test-framework/mocks/mocks',
  'modules/mvc/fn'
], function (StoreStockCheckController, StoreModel, InventoryStoreModel, SkuModel, mocks, fn) {
  'use strict';

  var storeModel = new StoreModel(),
    inventoryStoreModel = new InventoryStoreModel(),
    skuModel = new SkuModel(),
    ctlr = {},
    mockData = {
      listingID: 'T0000a64e6',
      nearestStoreLookup: 'Stevenage',
      sessionStoreData: {
        postCode: 'Stevenage',
        name: 'WARE SUPERSTORE',
        distance: '9.51 miles'
      },
      latitude: '51.8998',
      longitude: '-0.2026',
      nearestStoreIDs: '03362,03142,02425,03050,02547,02101,02639,02634,03356,02467,03032,02087'
        + ',02469,02825,02296,02544,03309,03130,03145,03099,05327,02628,03030,03238,02131,02661'
        + ',02574,03422,02020,02832',
      mergedData: [
        {
          id: '03362',
          latitude: 51.811539,
          longitude: -0.03157,
          available: true,
          stock_status: 'IN_STOCK',
          stockStatusMessage: 'In stock',
          storeName: 'WARE SUPERSTORE',
          distance: '9.51 miles'
        },
        {
          id: '03142',
          latitude: 51.7520084634915,
          longitude: -0.3125,
          available: true,
          stock_status: 'IN_STOCK',
          stockStatusMessage: 'In stock'
        },
        {
          id: '02425',
          latitude: 51.88954,
          longitude: -0.484917,
          available: true,
          stock_status: 'IN_STOCK',
          stockStatusMessage: 'In stock'
        },
        {
          id: '03050',
          latitude: 51.693925,
          longitude: -0.181386,
          available: true,
          stock_status: 'IN_STOCK',
          stockStatusMessage: 'In stock'
        },
        {
          id: '02547',
          latitude: 52.002726,
          longitude: -0.498333,
          available: true,
          stock_status: 'IN_STOCK',
          stockStatusMessage: 'In stock'
        },
        {
          id: '02101',
          latitude: 51.87506,
          longitude: 0.13547,
          available: true,
          stock_status: 'IN_STOCK',
          stockStatusMessage: 'In stock'
        }
      ],
      viewData: {
        stores: {
          T0000a64e6: {
            id: 'T0000a64e6',
            nearestStores: [
              {
                id: '03362',
                latitude: 51.811539,
                longitude: -0.03157,
                available: true,
                stock_status: 'IN_STOCK',
                stockStatusMessage: 'In stock',
                storeName: 'WARE SUPERSTORE',
                distance: '9.51 miles'
              },
              {
                id: '03142',
                latitude: 51.7520084634915,
                longitude: -0.3125,
                available: true,
                stock_status: 'IN_STOCK',
                stockStatusMessage: 'In stock'
              },
              {
                id: '02425',
                latitude: 51.88954,
                longitude: -0.484917,
                available: true,
                stock_status: 'IN_STOCK',
                stockStatusMessage: 'In stock'
              },
              {
                id: '03050',
                latitude: 51.693925,
                longitude: -0.181386,
                available: true,
                stock_status: 'IN_STOCK',
                stockStatusMessage: 'In stock'
              },
              {
                id: '02547',
                latitude: 52.002726,
                longitude: -0.498333,
                available: true,
                stock_status: 'IN_STOCK',
                stockStatusMessage: 'In stock'
              },
              {
                id: '02101',
                latitude: 51.87506,
                longitude: 0.13547,
                available: true,
                stock_status: 'IN_STOCK',
                stockStatusMessage: 'In stock'
              }
            ],
            nearestStoreLookup: 'Stevenage',
            nearestStore: {
              name: 'WARE SUPERSTORE',
              distance: '9.51 miles',
              postCode: 'Stevenage',
              stockStatus: 'In stock'
            },
            sessionStoreData: {
              postCode: 'Stevenage',
              name: 'WARE SUPERSTORE',
              distance: '9.51 miles'
            }
          }
        }
      },
      deviceLocation: {
        latitude: 51.5097502,
        longitude: -0.017595,
        locality: 'E14'
      }
    };


  /***************************************************************************
   ** _isPCAEndpointAvailable method *****************************************
   ***************************************************************************/

  describe('the _isPCAEndpointAvailable method', function () {
    var isPCAEndpointAvailable = null,
      endpoint = '//services.postcodeanywhere.co.uk/Geocoding/UK/Geocode/v2.10/json3.ws?callback=?',
      key = 'BD79-CC89-XD96-TY93';

    beforeAll(function () {
      ctlr = new StoreStockCheckController([storeModel, inventoryStoreModel, skuModel]);
      window.Data = {};
    });

    afterAll(function () {
      ctlr = {};
      delete window.Data;
    });

    beforeEach(function () {
      isPCAEndpointAvailable = null;
    });

    afterEach(function () {
      window.Data = {};
    });

    it('should return true if pcaGeoLocationEndpoint and pcaGeoLocationKey exist on Window',
      function () {
        window.Data.storeStockCheck = { pcaGeoLocationEndpoint: endpoint, pcaGeoLocationKey: key };
        isPCAEndpointAvailable = ctlr._isPCAEndpointAvailable();

        expect(isPCAEndpointAvailable).toBe(true);
      }
    );

    it('should return false if storeStockCheck object is undefined', function () {
      isPCAEndpointAvailable = ctlr._isPCAEndpointAvailable();

      expect(window.Data.storeStockCheck).toBeUndefined();
      expect(isPCAEndpointAvailable).toBe(false);
    });

    it('should return false if either pcaGeoLocationEndpoint or pcaGeoLocationKey is undefined',
      function () {
        window.Data.storeStockCheck = { pcaGeoLocationKey: key };
        isPCAEndpointAvailable = ctlr._isPCAEndpointAvailable();

        expect(window.Data.storeStockCheck.pcaGeoLocationEndpoint).toBeUndefined();
        expect(isPCAEndpointAvailable).toBe(false);
      }
    );
  });


  /***********************************************************************************
   ** _isSessionDataAvailable method *************************************************
   ***********************************************************************************/

  describe('the _isSessionDataAvailable method', function () {
    var isSessionDataAvailable = null;

    beforeAll(function () {
      ctlr = new StoreStockCheckController([storeModel, inventoryStoreModel, skuModel]);
    });

    afterAll(function () {
      ctlr = {};
    });

    beforeEach(function () {
      spyOn(ctlr, '_hasNearestStoreLookup').and.callThrough();
      spyOn(ctlr, '_hasCoordinates').and.callThrough();
      spyOn(ctlr, '_hasNearestStoreIDs').and.callThrough();
    });

    afterEach(function () {
      isSessionDataAvailable = null;
    });

    describe('when cache data exists', function () {
      beforeAll(function () {
        fn.setSessionData('nearestStoreLookup', mockData.nearestStoreLookup);
        fn.setSessionData('latitude', mockData.latitude);
        fn.setSessionData('longitude', mockData.longitude);
        fn.setSessionData('nearestStoreIDs', mockData.nearestStoreIDs);
      });

      afterAll(function () {
        fn.clearSessionData('nearestStoreLookup');
        fn.clearSessionData('latitude');
        fn.clearSessionData('longitude');
        fn.clearSessionData('nearestStoreIDs');
      });

      it('should call all its dependencies', function () {
        isSessionDataAvailable = ctlr._isSessionDataAvailable();

        expect(ctlr._hasNearestStoreLookup).toHaveBeenCalled();
        expect(ctlr._hasCoordinates).toHaveBeenCalled();
        expect(ctlr._hasNearestStoreIDs).toHaveBeenCalled();
      });

      it('should return true', function () {
        isSessionDataAvailable = ctlr._isSessionDataAvailable();

        expect(isSessionDataAvailable).toBe(true);
      });
    });

    describe('when no cache data is found', function () {
      it('should return false if any conditional dependencies fail', function () {
        isSessionDataAvailable = ctlr._isSessionDataAvailable();

        expect(isSessionDataAvailable).toBe(false);
      });
    });
  });


  /***************************************************************************
   ** _mergeStoreInfoAndAvailabilityData method ******************************
   ***************************************************************************/

  describe('the _mergeStoreInfoAndAvailabilityData method', function () {
    var mockAvailabilityResponses = [],
      coordinates = { latitude: mockData.latitude, longitude: mockData.longitude },
      mergedData = null;

    beforeEach(function () {
      ctlr = new StoreStockCheckController([storeModel, inventoryStoreModel, skuModel]);
    });

    afterEach(function () {
      ctlr = {};
      storeModel.unsetDataStores();
      inventoryStoreModel.unsetDataStores();
      mergedData = null;
    });

    describe('when all stores have stock', function () {
      beforeEach(function () {
        storeModel.setDataStores([
          mocks.stores['03362'].data, mocks.stores['03142'].data, mocks.stores['02425'].data
        ]);
        mockAvailabilityResponses = [
          mocks.availabilities['03362'].data,
          mocks.availabilities['03142'].data,
          mocks.availabilities['02425'].data
        ];
        fn.loopArray(mockAvailabilityResponses, function loopRespAndAddToModel(i) {
          inventoryStoreModel.dataHandler(mockAvailabilityResponses[i]);
        });
      });

      it('should update hasOutOfStockStores prop on ctlr', function () {
        mergedData = ctlr._mergeStoreInfoAndAvailabilityData(coordinates);

        expect(ctlr._viewData.props.hasOutOfStockStores).toBe(false);
      });

      it('should return array containing converged data', function () {
        mergedData = ctlr._mergeStoreInfoAndAvailabilityData(coordinates);

        expect(mergedData).toBeDefined();
        expect(mergedData.length).toEqual(3);
        expect(mergedData[0].id).toEqual('03362');
        expect(mergedData[0].latitude).toEqual(51.811539);
        expect(mergedData[0].available).toBe(true);
      });
    });

    describe('when has out of stock stores', function () {
      beforeEach(function () {
        storeModel.setDataStores([
          mocks.stores['03362'].data, mocks.stores['03142'].data, mocks.stores['02467'].data
        ]);
        mockAvailabilityResponses = [
          mocks.availabilities['03362'].data,
          mocks.availabilities['03142'].data,
          mocks.availabilities['02467'].data
        ];
        fn.loopArray(mockAvailabilityResponses, function loopRespAndAddToModel(i) {
          inventoryStoreModel.dataHandler(mockAvailabilityResponses[i]);
        });
      });

      it('should update hasOutOfStockStores prop on ctlr', function () {
        mergedData = ctlr._mergeStoreInfoAndAvailabilityData(coordinates);

        expect(ctlr._viewData.props.hasOutOfStockStores).toBe(true);
      });

      it('should return array containing converged data', function () {
        mergedData = ctlr._mergeStoreInfoAndAvailabilityData(coordinates);

        expect(mergedData).toBeDefined();
        expect(mergedData.length).toEqual(3);
        expect(mergedData[2].id).toEqual('02467');
        expect(mergedData[2].latitude).toEqual(51.651062);
        expect(mergedData[2].available).toBe(false);
      });
    });

    describe('when all stores are out of stock', function () {
      beforeEach(function () {
        storeModel.setDataStores(mocks.stores['02467'].data);
        inventoryStoreModel.dataHandler(mocks.availabilities['02467'].data);
      });

      it('should update hasOutOfStockStores prop on ctlr', function () {
        mergedData = ctlr._mergeStoreInfoAndAvailabilityData(coordinates);

        expect(ctlr._viewData.props.hasOutOfStockStores).toBe(true);
      });

      it('should return an empty array', function () {
        mergedData = ctlr._mergeStoreInfoAndAvailabilityData(coordinates);

        expect(mergedData).toBeDefined();
        expect(mergedData).toEqual([]);
        expect(mergedData.length).toEqual(0);
      });
    });
  });


  /***************************************************************************
   ** _checkStoreStockLinkHandler method *************************************
   ***************************************************************************/

  describe('the _checkStoreStockLinkHandler method', function () {
    var el = $('<a class="check-store-stock-link" data-id="' + mockData.listingID + '">'
      + '<span class="icon" data-icon="p"></span><span class="link">Check store stock</span></a>'),
      ev = {
        type: 'click',
        currentTarget: el,
        preventDefault: function () {},
        stopPropagation: function () {}
      },
      deferred = null,
      viewData = mockData.viewData.stores[mockData.listingID];

    beforeEach(function () {
      ctlr = new StoreStockCheckController([storeModel, inventoryStoreModel, skuModel]);
      spyOn(ev, 'preventDefault');
      spyOn(ev, 'stopPropagation');
      spyOn(ctlr, '_renderOverlay');
    });

    afterEach(function () {
      ctlr = {};
    });

    it('should call preventDefault and stopPropagation methods', function () {
      ctlr._checkStoreStockLinkHandler(ev);

      expect(ev.preventDefault).toHaveBeenCalled();
      expect(ev.stopPropagation).toHaveBeenCalled();
    });

    describe('when no cache data is found', function () {
      beforeEach(function () {
        spyOn(ctlr, '_isSessionDataAvailable').and.returnValue(false);
      });

      it('should call _renderOverlay method with props for empty overlay', function () {
        ctlr._checkStoreStockLinkHandler(ev);

        expect(ctlr._isSessionDataAvailable).toHaveBeenCalled();
        expect(ctlr._isSessionDataAvailable.calls.count()).toEqual(1);
        expect(ctlr._renderOverlay).toHaveBeenCalledWith({
          empty: true, vm: { id: mockData.listingID }
        });
        expect(ctlr._renderOverlay.calls.count()).toEqual(1);
      });
    });

    describe('when cache data exists', function () {
      beforeEach(function () {
        spyOn(ctlr, '_isSessionDataAvailable').and.returnValue(true);
        spyOn(fn, 'getSessionData').and.callFake(function (param) {
          return mockData[param];
        });
      });

      describe('and nearestStoreLookup has not changed', function () {
        beforeEach(function () {
          spyOn(ctlr, '_getViewData').and.callFake(function () {
            return viewData;
          });
          spyOn(ctlr, '_getStoreStockData');
        });

        it('should call _renderOverlay with existing view data', function () {
          ctlr._checkStoreStockLinkHandler(ev);

          expect(ctlr._renderOverlay).toHaveBeenCalledWith({ vm: viewData });
          expect(ctlr._renderOverlay.calls.count()).toEqual(1);
        });

        it('should not call _getStoreStockCheckData', function () {
          ctlr._checkStoreStockLinkHandler(ev);

          expect(ctlr._getStoreStockData).not.toHaveBeenCalled();
        });
      });

      describe('and nearestStoreLookup does not match existing view data', function () {
        beforeEach(function () {
          deferred = $.Deferred();
          spyOn(ctlr, '_getViewData').and.returnValue(null);
          spyOn(ctlr, '_getStoreStockData').and.callFake(function () {
            return deferred.promise();
          });
          spyOn(ctlr, '_cacheViewData').and.returnValue(viewData);
        });

        afterEach(function () {
          deferred = null;
        });

        it('should call _getStoreStockData method', function () {
          ctlr._checkStoreStockLinkHandler(ev);

          expect(ctlr._getViewData).toHaveBeenCalledWith(mockData.listingID);
          expect(fn.getSessionData).toHaveBeenCalledWith('nearestStoreLookup');
          expect(ctlr._getStoreStockData).toHaveBeenCalledWith({
            location: mockData.nearestStoreLookup, listingID: mockData.listingID
          });
        });

        describe('and no storesData returned', function () {
          beforeEach(function () {
            deferred.resolve([]);
          });

          it('should call _renderOverlay method with props for empty overlay', function () {
            ctlr._checkStoreStockLinkHandler(ev);

            expect(ctlr._renderOverlay).toHaveBeenCalledWith({
              empty: true, vm: { id: mockData.listingID }
            });
            expect(ctlr._renderOverlay.calls.count()).toEqual(1);
          });

          it('should not call _cacheViewData method', function () {
            ctlr._checkStoreStockLinkHandler(ev);

            expect(ctlr._cacheViewData).not.toHaveBeenCalled();
          });
        });

        describe('and storesData is returned', function () {
          beforeEach(function () {
            deferred.resolve(mockData.mergedData);
          });

          it('should call _cacheViewData method', function () {
            ctlr._checkStoreStockLinkHandler(ev);

            expect(ctlr._cacheViewData).toHaveBeenCalled();
          });

          it('should call _renderOverlay method and pass through view data', function () {
            ctlr._checkStoreStockLinkHandler(ev);

            expect(ctlr._renderOverlay).toHaveBeenCalledWith({ vm: viewData });
            expect(ctlr._renderOverlay.calls.count()).toEqual(1);
          });
        });

        describe('and _getStoreStockData fails', function () {
          var errorMessage = 'Error message';

          beforeEach(function () {
            deferred.reject(errorMessage);
          });

          it('should call _renderOverlay method with props for error message', function () {
            ctlr._checkStoreStockLinkHandler(ev);

            expect(ctlr._renderOverlay).toHaveBeenCalledWith({
              empty: true, vm: { id: mockData.listingID }, error: errorMessage
            });
            expect(ctlr._renderOverlay.calls.count()).toEqual(1);
          });

          it('should not call _cacheViewData method', function () {
            ctlr._checkStoreStockLinkHandler(ev);

            expect(ctlr._cacheViewData).not.toHaveBeenCalled();
          });
        });
      });
    });
  });


  /***************************************************************************
   ** _cacheViewData method **************************************************
   ***************************************************************************/

  describe('the _cacheViewData method', function () {
    var addedData = null,
      id = mockData.listingID,
      viewData = mockData.viewData.stores[id];

    beforeEach(function () {
      ctlr = new StoreStockCheckController([storeModel, inventoryStoreModel, skuModel]);
    });

    afterEach(function () {
      ctlr = {};
      addedData = null;
    });

    describe('when data is not passed in', function () {
      it('should return null', function () {
        addedData = ctlr._cacheViewData();

        expect(addedData).toBeNull();
      });
    });

    it('should add the view data to the ctlr', function () {
      ctlr._cacheViewData(viewData);

      expect(ctlr._viewData.stores[id]).toBeDefined();
      expect(ctlr._viewData.stores[id].id).toEqual(viewData.id);
      expect(ctlr._viewData.stores[id].nearestStore).toEqual(viewData.nearestStore);
    });

    it('should return the added view data', function () {
      addedData = ctlr._cacheViewData(viewData);

      expect(addedData).toBeDefined();
    });
  });


  /***************************************************************************
   ** _getViewData method ****************************************************
   ***************************************************************************/

  describe('the _getStoresViewData method', function () {
    var id = mockData.listingID,
      viewData = null;

    beforeAll(function () {
      ctlr = new StoreStockCheckController([storeModel, inventoryStoreModel, skuModel]);
      ctlr._viewData.stores[id] = mockData.viewData.stores[id];
    });

    afterAll(function () {
      ctlr = {};
    });

    afterEach(function () {
      viewData = null;
    });

    it('should return null if id passed in does not match key in view data', function () {
      viewData = ctlr._getViewData('T0000a64c0');

      expect(viewData).toBeNull();
    });

    it('should return data if id passed in matches key in view data', function () {
      viewData = ctlr._getViewData(id);

      expect(viewData).toBeDefined();
    });
  });


  /***************************************************************************
   ** _getNearestStore method ************************************************
   ***************************************************************************/

  describe('the _getNearestStore method', function () {
    var store = null;

    beforeAll(function () {
      ctlr = new StoreStockCheckController([storeModel, inventoryStoreModel, skuModel]);
    });

    afterAll(function () {
      ctlr = {};
    });

    beforeEach(function () {
      spyOn(fn, 'getSessionData').and.returnValue(mockData.nearestStoreLookup);
    });

    afterEach(function () {
      store = null;
    });

    it('should return nearest store data', function () {
      store = ctlr._getNearestStore(mockData.mergedData);

      expect(store).toBeDefined();
      expect(store.name).toEqual('WARE SUPERSTORE');
      expect(store.distance).toEqual('9.51 miles');
      expect(store.postCode).toEqual('Stevenage');
      expect(store.stockStatus).toEqual('In stock');
    });

    describe('when no store has available stock', function () {
      it('should return null', function () {
        store = ctlr._getNearestStore([]);

        expect(store).toBeNull();
      });
    });
  });


  /***************************************************************************
   ** _setDeviceLocation method **********************************************
   ***************************************************************************/

  describe('the _setDeviceLocation method', function () {
    beforeEach(function () {
      ctlr = new StoreStockCheckController([storeModel, inventoryStoreModel, skuModel]);
    });

    afterEach(function () {
      ctlr = {};
    });

    it('it should update viewData', function () {
      ctlr._setDeviceLocation(mockData.deviceLocation);

      expect(ctlr._viewData.deviceLocation.latitude).toEqual(51.5097502);
      expect(ctlr._viewData.deviceLocation.longitude).toEqual(-0.017595);
      expect(ctlr._viewData.deviceLocation.locality).toEqual('E14');
    });

    describe('when location is not passed in', function () {
      it('return undefined', function () {
        var returnValue = ctlr._setDeviceLocation({});

        expect(returnValue).toBeUndefined();
      });

      it('it should not update viewData', function () {
        ctlr._setDeviceLocation({});

        expect(ctlr._viewData.deviceLocation.latitude).toBeUndefined();
        expect(ctlr._viewData.deviceLocation.longitude).toBeUndefined();
        expect(ctlr._viewData.deviceLocation.locality).toBeUndefined();
      });
    });
  });

  describe('Stock Checker Analytics tracking for "Non check store stock" cases', function () {
    beforeEach(function () {
      ctlr = new StoreStockCheckController([storeModel, inventoryStoreModel, skuModel]);
      spyOn(ctlr, '_submitAnalyticsHandler');
    });

    afterEach(function () {
      ctlr = {};
    });

    describe('when product is not available and not ranged in store', function () {
      var el = $('<div class="product " '
        + 'data-is-available="false" data-is-ranged-instore="false" '
        + 'data-seller-count="1" data-has-variants="true" data-is-separated="false" '
        + 'data-sc-active="true" data-isff="false">'
        + '<a>Product Tile</a>'
        + '</div>'),
        event = {
          target: el.find('a')
        };

      it('_submitAnalyticsHandler should have been called with "outOfStock"', function () {
        ctlr._checkNonStoreStockLinkHandler(event);
        expect(ctlr._submitAnalyticsHandler).toHaveBeenCalledWith('checkStoreStockLinkClick', 'productOutOfStock');
      });
    });

    describe('when product is ranged in store, and has either multiple sellers, variants, or is separated', function () {
      var el = $('<div class="product " '
        + 'data-is-available="true" data-is-ranged-instore="true"'
        + 'data-seller-count="1" data-has-variants="false" data-is-separated="true"'
        + 'data-sc-active="true" data-isff="false">'
        + '<a>Product Tile</a>'
        + '</div>'),
        event = {
          target: el.find('a')
        };


      it('_submitAnalyticsHandler should have been called with "checkAvailability"', function () {
        ctlr._checkNonStoreStockLinkHandler(event);
        expect(ctlr._submitAnalyticsHandler).toHaveBeenCalledWith('checkStoreStockLinkClick', 'productCheckAvailability');
      });
    });

    describe('when product is ranged in store has 1 seller, no variants and is not separated', function () {
      var el = $('<div class="product " '
        + 'data-is-available="true" data-is-ranged-instore="true" '
        + 'data-seller-count="1" data-has-variants="false" data-is-separated="false" '
        + 'data-sc-active="true" data-isff="false">'
        + '<a>Product Tile</a>'
        + '</div>'),
        event = {
          target: el.find('a')
        };


      it('_submitAnalyticsHandler should not be called ', function () {
        ctlr._checkNonStoreStockLinkHandler(event);
        expect(ctlr._submitAnalyticsHandler).toHaveBeenCalledWith('checkStoreStockLinkClick', 'productCheckStoreStock');
      });
    });

    describe('when product has any other state', function () {
      var el = $('<div class="product " '
        + 'data-is-available="true" data-is-ranged-instore="false" '
        + 'data-seller-count="1" data-has-variants="false" data-is-separated="true" '
        + 'data-sc-active="true" data-isff="false">'
        + '<a>Product Tile</a>'
        + '</div>'),
        event = {
          target: el.find('a')
        };


      it('_submitAnalyticsHandler should have been called with "notAvailableInStore"', function () {
        ctlr._checkNonStoreStockLinkHandler(event);
        expect(ctlr._submitAnalyticsHandler).toHaveBeenCalledWith('checkStoreStockLinkClick', 'productNotAvailableInStore');
      });
    });

    describe('when stockchecker is not active', function () {
      var el = $('<div class="product z" '
        + 'data-is-available="true" data-is-ranged-instore="true" '
        + 'data-seller-count="1" data-has-variants="false" data-is-separated="true" '
        + 'data-sc-active="false" data-isff="false">'
        + '<a>Product Tile</a>'
        + '</div>'),
        event = {
          target: el.find('a')
        };

      it('_submitAnalyticsHandler should not be called', function () {
        ctlr._checkNonStoreStockLinkHandler(event);
        expect(ctlr._submitAnalyticsHandler).not.toHaveBeenCalled();
      });
    });
  });
});
