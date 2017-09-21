define(function (require, exports, module) {
  'use strict';


  var fn = require('modules/mvc/fn'),
    BaseController = require('modules/pdp/controllers/BaseController'),
    StoreStockCheckView = require('modules/pdp/views/StoreStockCheckView'),
    common = require('modules/common'),
    mustache = require('mustache'),
    analytics = require('modules/tesco.analytics'),
    overlayTemplate = require('text!templates/views/storeStockCheckOverlay.html'),
    storeStockAnalyticsProps = {
      productNotAvailableInStore: {
        eVar45: 'sc:pdp click not available in store:plp',
        prop4: 'plp'
      },
      productCheckStoreStock: {
        eVar45: 'sc:pdp click store stock available:plp',
        prop4: 'plp'
      },
      productCheckAvailability: {
        eVar45: 'sc:pdp click check store availability:plp',
        prop4: 'plp'
      },
      productOutOfStock: {
        eVar45: 'sc:pdp click out of stock:plp',
        prop4: 'plp'
      },
      checkStoreStock: {
        eVar45: 'sc:check store stock:plp',
        prop4: 'plp'
      },
      notStockedPDP: {
        eVar45: 'e45',
        prop19: 'sc:not stocked in store:pdp'
      },
      notStockedOverlay: {
        eVar45: 'e45',
        prop19: 'sc:not stocked in store:overlay'
      }
    };

  /**
   *
   * @param {Array<Objects>} models
   * @param {Object} options
   * @return {void}
   */
  function StoreStockCheckController(models, options) {
    this.sNamespace = 'stores';
    this.sTag = 'storeStockCheck';
    this.views = { classes: { StoreStockCheckView: StoreStockCheckView } };
    this.parent.constructor.call(this, models, options);
    this._viewData = {
      state: {
        overlayEventsBound: false,
        isInStockOnly: true,
        isGeolocationAvailable: null,
        isSessionDataAvailable: null
      },
      props: { hasOutOfStockStores: false },
      overlay: { oElms: { elPostcodeInput: null, elCheckBtn: null } },
      stores: {},
      deviceLocation: {}
    };
  }


  fn.inherit(StoreStockCheckController, BaseController);
  StoreStockCheckController.modelNames = ['stores', 'inventoryStore', 'sku'];


  /**
   *
   * @return {void}
   */
  StoreStockCheckController.prototype.initDependancies = function () {
    this._submitAnalyticsHandler('pageLoad');
  };


  /**
   *
   * @param {Object} params
   * @param {JQueryDeferred} params.deferred
   * @param {Object} params.mParamData
   * @return {void}
   */
  StoreStockCheckController.prototype._collateDataDependancies = function (params) {
    var _this = this,
      _params = params,
      masterDeferred = params.deferred,
      viewData = null,
      mvcData = _params.mParamData.mvc;

    if (!this._isPCAEndpointAvailable()) {
      masterDeferred.reject();
      return;
    }

    if (_this._isSessionDataAvailable()) {
      _this._getStoreStockData({ listingID: mvcData.sellers.id })
        .done(function handleGetStoreStockDataSuccess(data) {
          if (fn.isArray(data)) {
            viewData = _this._sanitiseViewData(data, mvcData.sellers.id);
            mvcData.stores = viewData;
            _this._cacheViewData(viewData);
          }
          masterDeferred.resolve(_params);
        })
        .fail(function handleGetStoreStockDataFailure() {
          masterDeferred.resolve(_params);
        });
    } else {
      masterDeferred.resolve(_params);
    }
  };


  /**
   *
   * @return {Boolean}
   */
  StoreStockCheckController.prototype._isPCAEndpointAvailable = function () {
    return !!fn.getValue(window, 'Data', 'storeStockCheck', 'pcaGeoLocationEndpoint')
      && !!fn.getValue(window, 'Data', 'storeStockCheck', 'pcaGeoLocationKey');
  };


  /**
   *
   * @return {Boolean}
   */
  StoreStockCheckController.prototype._isSessionDataAvailable = function () {
    return this._hasNearestStoreLookup() && this._hasCoordinates() && this._hasNearestStoreIDs();
  };


  /**
   *
   * @return {Boolean}
   */
  StoreStockCheckController.prototype._hasNearestStoreLookup = function () {
    return !!fn.getSessionData('nearestStoreLookup');
  };


  /**
   *
   * @return {Boolean}
   */
  StoreStockCheckController.prototype._hasCoordinates = function () {
    return !!fn.getSessionData('latitude') && !!fn.getSessionData('longitude');
  };


  /**
   *
   * @return {Boolean}
   */
  StoreStockCheckController.prototype._hasNearestStoreIDs = function () {
    return !!fn.getSessionData('nearestStoreIDs');
  };


  /**
   *
   * @param {Object} params
   * @param {string} params.listingID
   * @param {string} [params.location]
   * @param {boolean} [params.useDeviceLocation]
   * @return {JQueryPromise}
   */
  StoreStockCheckController.prototype._getStoreStockData = function (params) {
    var _this = this,
      deferred = $.Deferred(),
      newLookup = false,
      nearestStoreLookup = fn.getSessionData('nearestStoreLookup'),
      storeStockData = {},
      useDeviceLocation = false;

    if (!nearestStoreLookup || (params.location && params.location !== nearestStoreLookup)) {
      newLookup = true;
    }

    if (params.useDeviceLocation) {
      useDeviceLocation = true;
    }

    this._getCoordinates(params.location,
      { newLookup: newLookup, useDeviceLocation: useDeviceLocation })
      .done(function handleGetCoordinatesSuccess(coordinates) {
        _this._getNearestStoreIDs(coordinates, { newLookup: newLookup })
          .done(function handleGetNearestStoreIDsSuccess(storeIDs) {
            _this._getStoresData(storeIDs, params.listingID)
              .done(function handleGetStoresDataSuccess() {
                storeStockData = _this._mergeStoreInfoAndAvailabilityData(coordinates);

                if (newLookup && fn.isArray(storeStockData, { notEmpty: true })) {
                  _this._setSessionData(params.location, coordinates, storeIDs, storeStockData[0]);
                }

                deferred.resolve(storeStockData);
              })
              .fail(function handleGetStoresDataFailure() {
                deferred.reject();
              });
          })
          .fail(function handleGetNearestStoreIDsFailure() {
            deferred.reject();
          });
      })
      .fail(function handleGetCoordinatesFailure(errorMessage) {
        deferred.reject(errorMessage);
      });

    return deferred.promise();
  };


  /**
   * Get coordinates from cache data.
   *
   * @param {string} location
   * @param {Object} [opts]
   * @param {boolean} [opts.newLookup]
   * @param {boolean} [opts.useDeviceLocation]
   * @return {JQueryPromise}
   */
  StoreStockCheckController.prototype._getCoordinates = function (location, opts) {
    var _opts = opts || {},
      deferred = $.Deferred(),
      coordinates = {};

    if (_opts.useDeviceLocation) {
      coordinates.latitude = this._viewData.deviceLocation.latitude;
      coordinates.longitude = this._viewData.deviceLocation.longitude;
      deferred.resolve(coordinates);
      return deferred.promise();
    }

    if (!_opts.newLookup && this._hasCoordinates()) {
      coordinates.latitude = fn.getSessionData('latitude');
      coordinates.longitude = fn.getSessionData('longitude');
      deferred.resolve(coordinates);
      return deferred.promise();
    }

    this._fetchCoordinates(location)
      .done(function handleFetchCoordinatesSuccess(latitude, longitude) {
        coordinates.latitude = latitude;
        coordinates.longitude = longitude;
        deferred.resolve(coordinates);
      })
      .fail(function handleFetchCoordinatesFailure() {
        deferred.reject();
      });

    return deferred.promise();
  };


  /**
   * Make call to Postcode Anywhere API to return coordinates based on location name.
   *
   * @param {string} location
   * @returns {JQueryPromise}
   */
  StoreStockCheckController.prototype._fetchCoordinates = function (location) {
    var deferred = $.Deferred(),
      storeStockCheckData = null,
      endpoint = null,
      key = null;

    if (typeof location !== 'string' || location === '') {
      deferred.reject();
      return false;
    }

    if (!this._isPCAEndpointAvailable()) {
      deferred.reject();
      return false;
    }

    storeStockCheckData = fn.getValue(window, 'Data', 'storeStockCheck');
    endpoint = storeStockCheckData.pcaGeoLocationEndpoint;
    key = storeStockCheckData.pcaGeoLocationKey;

    $.getJSON(endpoint, { Key: key, Location: location })
      .done(function handleFetchCoordinatesSuccess(data) {
        if (data.Items.length === 1 && typeof data.Items[0].Error !== 'undefined') {
          deferred.reject(data.Items[0].Description);
        } else if (data.Items.length === 0) {
          deferred.reject();
        } else {
          deferred.resolve(data.Items[0].Latitude, data.Items[0].Longitude);
        }
      })
      .fail(function handleFetchCoordinatesFailure() {
        deferred.reject();
      });

    return deferred.promise();
  };


  /**
   *
   * @param {Object} coordinates
   * @param {number} coordinates.latitude
   * @param {number} coordinates.longitide
   * @param {Object} [opts]
   * @param {boolean} [opts.newLookup]
   * @return {JQueryPromise}
   */
  StoreStockCheckController.prototype._getNearestStoreIDs = function (coordinates, opts) {
    var _opts = opts || {},
      deferred = $.Deferred(),
      storeIDs = '';

    if (!_opts.newLookup && this._hasNearestStoreIDs()) {
      storeIDs = fn.getSessionData('nearestStoreIDs');
      deferred.resolve(storeIDs);
      return deferred.promise();
    }

    this.models.stores
      .promise({
        mSearchValue: [coordinates.latitude, coordinates.longitude],
        doneCallback: function (data, _deferred) { _deferred.resolve(data); }
      })
      .done(function handlePromiseSuccess(data) {
        storeIDs = data.stores.map(function (store) { return store.id; }).join(',');
        deferred.resolve(storeIDs);
      })
      .fail(function handlePromiseFailure() {
        deferred.reject();
      });

    return deferred.promise();
  };


  /**
   *
   * @param {Array<String>} storeIDs
   * @param {String} listingID
   * @return {void}
   */
  StoreStockCheckController.prototype._getStoresData = function (storeIDs, listingID) {
    var deferred = $.Deferred();

    $.when(this._fetchStoreInfo(storeIDs), this._fetchAvailability(storeIDs, listingID))
      .done(function handlePromiseSuccess() {
        deferred.resolve();
      })
      .fail(function handlePromiseFailure() {
        deferred.reject();
      });

    return deferred.promise();
  };


  /**
   *
   * @param {Array<String>} storeIDs
   * @return {JQueryPromise}
   */
  StoreStockCheckController.prototype._fetchStoreInfo = function (storeIDs) {
    var _this = this;

    _this.models.stores.unsetDataStores();

    return this.models.stores.promise({
      mSearchValue: storeIDs,
      sModelMethod: 'storeDetails',
      progressCallback: function (searchValue, resp) {
        if (resp.results) {
          _this.models.stores.setDataStores(resp.results);
        }
      },
      doneCallback: function (response, deferred) {
        deferred.resolve(response);
      }
    });
  };


  /**
   *
   * @param {Array<String>} storeIDs
   * @param {String} listingID
   * @return {JQueryPromise}
   */
  StoreStockCheckController.prototype._fetchAvailability = function (storeIDs, listingID) {
    this.models.inventoryStore.unsetDataStores();

    return this.models.inventoryStore.promise({
      mSearchValue: [storeIDs, listingID],
      doneCallback: function (response, deferred) {
        deferred.resolve(response);
      }
    });
  };


  /**
   * Merge store info with availability data.
   *
   * @param {Object} coordinates
   * @return {Array<Object>}
   */
  StoreStockCheckController.prototype._mergeStoreInfoAndAvailabilityData = function (coordinates) {
    var inventoryStoreModel = this.models.inventoryStore,
      storesModel = this.models.stores,
      storeDetails = storesModel.getDataStores(),
      availabilities = inventoryStoreModel.getDataStores(),
      mergedData = [],
      unavailabilityCount = 0;

    storeDetails.map(function (store) {
      var _store = store,
        distance = null,
        storeAvailability = null;

      distance = storesModel.calculateDistance(coordinates, {
        latitude: _store.latitude, longitude: _store.longitude
      });

      _store.distance = typeof distance === 'number' ? distance.toFixed(2) + ' miles' : null;

      fn.loopArray(availabilities, function loopAvailabilities(i) {
        if (_store.id === availabilities[i].id) {
          storeAvailability = fn.mergeObjects(_store, availabilities[i]);
          mergedData.push(storeAvailability);

          if (!storeAvailability.available) {
            unavailabilityCount += 1;
          }
        }
      });

      return _store;
    });

    this._viewData.props.hasOutOfStockStores = unavailabilityCount > 0;

    return unavailabilityCount === mergedData.length ? [] : mergedData;
  };


  /**
   * Save store stock check data to session storage.
   *
   * @param {string} location
   * @param {Object} coordinates
   * @param {number} coordinates.latitude
   * @param {number} coordinates.longitude
   * @param {Array<string>} storeIDs
   * @param {Object} sessionStoreData
   * @return {void}
   */
  StoreStockCheckController.prototype._setSessionData = function (
    location, coordinates, storeIDs, sessionStoreData
  ) {
    fn.setSessionData('nearestStoreLookup', location);
    fn.setSessionData('latitude', coordinates.latitude);
    fn.setSessionData('longitude', coordinates.longitude);
    fn.setSessionData('nearestStoreIDs', storeIDs);
    fn.setSessionData('sessionStoreData', {
      postCode: location,
      name: sessionStoreData.storeName,
      distance: sessionStoreData.distance
    });

    this._viewData.state.isSessionDataAvailable = true;
  };


  /**
   *
   * @param {Array<Object>} data
   * @param {string} id
   * @return {Object}
   */
  StoreStockCheckController.prototype._sanitiseViewData = function (data, id) {
    return {
      id: id,
      nearestStores: data,
      nearestStoreLookup: fn.getSessionData('nearestStoreLookup'),
      nearestStore: this._getNearestStore(data),
      sessionStoreData: fn.getSessionData('sessionStoreData')
    };
  };


  /**
   *
   * @param {Array<Object>} stores
   * @return {Object}
   */
  StoreStockCheckController.prototype._getNearestStore = function (stores) {
    var i = 0,
      arrLength = 0,
      store = null;

    for (i, arrLength = stores.length; i < arrLength; i += 1) {
      store = stores[i];

      if (store.available) {
        return {
          name: store.storeName,
          distance: store.distance,
          postCode: fn.getSessionData('nearestStoreLookup'),
          stockStatus: store.stockStatusMessage
        };
      }
    }

    return null;
  };


  /**
   *
   * @param {Object} params
   * @param {Object} params.oView
   * @return {void}
   */
  StoreStockCheckController.prototype._bindViewEvents = function (params) {
    var view = params.oView,
      $form = $(view.oElms.elForm),
      $wrapper = $(view.oElms.elWrapper);

    this._activeView = view;

    $form
    .on('submit', this._handleCheckStockSubmit.bind(this))
    .on('focus', 'input.postcode', this._removeInvalidClass.bind(this));

    $wrapper
    .on('click', 'a.change-store-link', this._changeStoreLinkHandler.bind(this))
    .on('click', 'a.current-location-link', this._currentPositionHandler.bind(this));
  };


  /**
   *
   * @param {JQueryEvent} e
   * @return {void}
   */
  StoreStockCheckController.prototype._handleCheckStockSubmit = function (e) {
    var _this = this,
      eventData = e.data || {},
      inPanel = !!fn.isObject(this._activePanel.storeStockCheck, { notEmpty: true }),
      panelContent = inPanel ? this._activePanel.storeStockCheck.oElms.elContentWrapper : null,
      regex = /^[a-zA-Z][a-zA-Z0-9,-.'\s]+$/,
      view = this._activeView,
      MESSAGE = 'Please enter a valid town or postcode',
      id = eventData.listingID || $(e.currentTarget).data('id') || null,
      viewData = null,
      useDeviceLocation = eventData.useDeviceLocation || false,
      overlay = _this._viewData.overlay,
      location = inPanel ? overlay.oElms.elPostcodeInput.value
        : view.oElms.elPostcodeInput.value || '';

    e.preventDefault();

    if (!location.match(regex)) {
      this._renderTooltip(MESSAGE);
      return;
    }

    if (inPanel) {
      $(panelContent).addClass('with-bkg-loader');
    } else {
      $(view.oElms.elCheckBtn).addClass('submitting');
    }

    this._getStoreStockData({
      listingID: id, location: location, useDeviceLocation: useDeviceLocation
    })
      .done(function handleGetStoreStockDataSuccess(data) {
        if (!fn.isArray(data, { notEmpty: true })) {
          _this._renderTooltip();
          return;
        }

        viewData = _this._sanitiseViewData(data, id);

        _this._cacheViewData(viewData);
        _this._refreshView(view, viewData);
        _this._renderOverlay({ updateActive: !!eventData.updateActive, vm: viewData });
      })
      .fail(function handleGetStoreStockDataFailure(errorMessage) {
        _this._renderTooltip(errorMessage);
      })
      .always(function handleGetStoreStockDataAlways() {
        if (inPanel) {
          $(panelContent).removeClass('with-bkg-loader');
        } else {
          $(view.oElms.elCheckBtn).removeClass('submitting');
        }
      });
  };


  /**
   *
   * @param {JQueryEvent} e
   * @return {void}
   */
  StoreStockCheckController.prototype._removeInvalidClass = function (e) {
    var $currentTarget = $(e.currentTarget);

    if ($currentTarget.hasClass('invalid')) {
      $currentTarget.removeClass('invalid');
    }
  };


  /**
   *
   * @param {JQueryEvent} e
   * @return {void}
   */
  StoreStockCheckController.prototype._changeStoreLinkHandler = function (e) {
    var viewData = this._getViewData($(e.currentTarget).data('id'));

    this._renderOverlay({ vm: viewData });
  };


  /**
   *
   * @param {String} message
   * @return {void}
   */
  StoreStockCheckController.prototype._renderTooltip = function (message) {
    var _message = '',
      sendErrorAnalytics = false,
      inOverlay = this._activePanel && this._activePanel.storeStockCheck,
      postcodeInput = inOverlay ? this._viewData.overlay.oElms.elPostcodeInput
        : this._activeView.oElms.elPostcodeInput;

    if (!message) {
      _message = 'Sorry, this product isn\'t stocked in stores in or near ' + postcodeInput.value;
      sendErrorAnalytics = true;
    } else {
      _message = message;
    }

    if (inOverlay) {
      this.oTooltipStyles = { allDesktops: ['tooltip-bottom'], allDevices: ['tooltip-bottom'] };
    } else {
      this.oTooltipStyles = { allDesktops: ['tooltip-left'], allDevices: ['tooltip-bottom'] };
    }

    this.createTooltip({ sTooltopMessage: _message, elTrigger: postcodeInput, sType: 'error' });

    $(postcodeInput).addClass('invalid');

    if (sendErrorAnalytics) {
      var analyticsPropsKey = inOverlay ? 'notStockedOverlay' : 'notStockedPDP';
      this._submitAnalyticsHandler('stockCheckError', analyticsPropsKey);
    }
  };


  /**
   *
   * @param {Object} view
   * @param {Object} data
   * @return {void}
   */
  StoreStockCheckController.prototype._refreshView = function (view, data) {
    if (fn.isObject(view)) {
      view.refresh(data);
    }
  };


  /**
   *
   * @param {Object} params optional
   * @param {Boolean} params.updateActive
   * @return {void}
   */
  StoreStockCheckController.prototype._renderOverlay = function (params) {
    var _this = this,
      _params = params || {},
      location = fn.getSessionData('nearestStoreLookup'),
      markup = '',
      overlayParams = {},
      vmData = params.vm || {},
      listingID = vmData.id;

    markup = mustache.render(overlayTemplate, this._prepareViewData(vmData));

    overlayParams = {
      sTag: 'storeStockCheck',
      sClassNames: 'store-stock-check-overlay',
      oStyles: {
        allDesktops: ['lightbox', 'fullScreen'],
        allDevices: ['slideIn-left', 'fullScreen']
      },
      sTitle: location ? 'Stores near <strong class="store-name-header">' + location + '</strong>'
        : 'Check store stock',
      sOverlayContent: markup,
      toDestroyOnClose: true,
      callback: function (overlaySelector) {
        _this._initOverlayDependencies({ selector: overlaySelector, vm: vmData });
        if (!params.noAnalytics) {
          _this._submitAnalyticsHandler('storeStockOverlayOpen', listingID);
        }
      }
    };

    if (_params.updateActive) {
      overlayParams.updateActive = true;
      overlayParams.elTrigger = null;
      overlayParams.forceUpdateActive = true;
    } else {
      this._viewData.state.overlayEventsBound = false;
    }

    this.renderOverlay(overlayParams);
  };


  /**
   *
   * @param {Object} viewData
   * @return {Object}
   */
  StoreStockCheckController.prototype._prepareViewData = function (viewData) {
    var _viewData = fn.copyObject(viewData, { deep: true }),
      stores = _viewData.nearestStores || [];

    _viewData.props = _viewData.props || {};
    _viewData.props.id = _viewData.id;
    _viewData.state = _viewData.state || {};
    _viewData.state.isInStockOnly = this._viewData.state.isInStockOnly;

    if (this._viewData.state.isGeolocationAvailable === null) {
      this._viewData.state.isGeolocationAvailable
      = !window.isKiosk() && fn.isGeolocationAvailable();
    }

    _viewData.state.isGeolocationAvailable = this._viewData.state.isGeolocationAvailable;

    if (!stores.length) {
      return _viewData;
    }

    if (this._viewData.state.isInStockOnly) {
      stores = this._filterInStockStores(stores);
    }

    fn.loopArray(stores, function loopStores(i) {
      stores[i].index = i;
      stores[i].position = i + 1;
      stores[i].stockStatusClass = stores[i].stockStatusMessage.toLowerCase().replace(/ /gi, '-');
      stores[i].bid = stores[i].id.substring(1);
    });

    stores[0].isSelected = true;
    _viewData.props.nearestStoreLookup = _viewData.nearestStoreLookup;
    _viewData.props.showInStockOnlyCheckbox = this._viewData.props.hasOutOfStockStores;
    _viewData.props.showMoreStoresButton = stores.length > 5;
    _viewData.props.nearestStores = stores;

    return _viewData;
  };


  /**
   * Returns array of stores that have stock availability.
   *
   * @param {Array<Object>} stores
   * @return {Array<Object>}
   */
  StoreStockCheckController.prototype._filterInStockStores = function (stores) {
    return stores.filter(function isAvailable(store) {
      return store.available;
    });
  };


  /**
   *
   * @param {Object} params
   * @param {string} params.selector
   * @param {Object} params.vm
   * @return {void}
   */
  StoreStockCheckController.prototype._initOverlayDependencies = function (params) {
    var $overlay = $(params.selector),
      $mapContainer = $overlay.find('#mapContainer'),
      $mapParentContainer = $overlay.find('#stockMapDetails'),
      storesLocation = this._collateMapPinLocations(params.vm),
      map = null,
      data = {},
      markup = null;

    map = common.getMap($mapParentContainer, $mapContainer, storesLocation);
    map.setView({ zoom: 5 });

    data = { overlaySelector: params.selector, storesLocation: storesLocation, map: map };

    this._initMapStores(data);
    this._cacheOverlayDomElms(params.selector);
    this._bindOverlayEvents(data);

    if (storesLocation.length) {
      markup = $overlay.find('li.is-selected div.store-details-wrapper')[0].innerHTML;
      $overlay.find('div.selected-store-details-wrapper').html(markup);
    }
  };


  /**
   *
   * @param {Object} vmData
   * @return {Array<Object>}
   */
  StoreStockCheckController.prototype._collateMapPinLocations = function (vmData) {
    var activeViewData = vmData || {},
      locations = [],
      stores = [];

    if (!activeViewData.nearestStores) {
      return locations;
    }

    stores = this._viewData.state.isInStockOnly
      ? this._filterInStockStores(activeViewData.nearestStores) : activeViewData.nearestStores;

    fn.loopArray(stores, function loopNearestStores(i) {
      locations.push(new Microsoft.Maps.Location(stores[i].latitude, stores[i].longitude));
    });

    return locations;
  };


  /**
   *
   * @param {Object} params
   * @param {String} params.overlaySelector
   * @param {Object} params.map
   * @param {Array<Object>} params.storesLocation
   * @return {void}
   */
  StoreStockCheckController.prototype._initMapStores = function (params) {
    var MAX_STORES_PER_PAGE = 5,
      $overlay = $(params.overlaySelector),
      $storeContainer = $overlay.find('div.stores-list-wrapper li'),
      storesLocation = params.storesLocation,
      numOfPins = storesLocation.length < MAX_STORES_PER_PAGE
        ? storesLocation.length : MAX_STORES_PER_PAGE;

    if ($storeContainer.length > MAX_STORES_PER_PAGE) {
      $overlay.find('li:gt(4)').hide();
    }

    fn.loopArray.call(this, storesLocation, function loopNumOfPins(i) {
      this._createPin({
        activePinIndex: 0,
        index: i,
        map: params.map,
        storesArray: $storeContainer,
        storesLocation: storesLocation
      });
    }, { stop: numOfPins });
  };


  /**
   *
   * @param {Object} params
   * @param {Number} params.activePinIndex
   * @param {Number} params.index
   * @param {Object} params.map
   * @param {Array<Object>} params.storesArray
   * @param {Array<Object>} params.storesLocation
   * @return {void}
   */
  StoreStockCheckController.prototype._createPin = function (params) {
    var _this = this,
      activePinIndex = params.activePinIndex,
      index = params.index,
      map = params.map,
      storesArray = params.storesArray,
      storesLocation = params.storesLocation,
      pushpinOptions = {},
      pin = {},
      pinClickParams = {};

    pushpinOptions = {
      icon: activePinIndex === index
        ? window.globalStaticAssetsPath + 'map-pin-selected.png'
        : window.globalStaticAssetsPath + 'map-pin.png',
      width: 27,
      height: 42,
      typeName: activePinIndex === index ? 'map-pin-selected' : 'map-pin',
      textOffset: new Microsoft.Maps.Point(0, 6),
      text: (index + 1).toString()
    };

    pin = new Microsoft.Maps.Pushpin(storesLocation[index], pushpinOptions);
    map.entities.push(pin);

    this._createInfoBox({
      activePinIndex: activePinIndex,
      map: map,
      storesArray: storesArray,
      storesLocation: storesLocation
    });

    Microsoft.Maps.Events.addHandler(pin, 'click', function (e) {
      pinClickParams = {
        pin: pin,
        ev: e.originalEvent,
        map: map,
        storesLocation: storesLocation,
        storesArray: storesArray
      };
      activePinIndex = parseInt(pin._text, 10) - 1;
      _this._mapPinClick(pinClickParams);
    });
  };


  /**
   *
   * @param {Object} params
   * @param {Number} params.activePinIndex
   * @param {Object} params.map
   * @param {Array<Object>} params.storesArray
   * @param {Array<Object>} params.storesLocation
   * @return {void}
   */
  StoreStockCheckController.prototype._createInfoBox = function (params) {
    var infoboxOptions = null,
      infoboxContent = '',
      entity = null,
      infobox = null,
      i = 0,
      activePinIndex = params.activePinIndex,
      map = params.map,
      storesArray = params.storesArray,
      storesLocation = params.storesLocation,
      arrLength = 0;

    infoboxContent = '<strong>' + storesArray.eq(activePinIndex).find('.store-name').html()
      + '</strong><br>(' + storesArray.eq(activePinIndex).find('.store-distance').html() + ')';

    infoboxOptions = {
      visible: true,
      offset: new Microsoft.Maps.Point(-10, 30),
      showCloseButton: true,
      height: 76,
      width: 194,
      description: infoboxContent
    };

    for (i, arrLength = map.entities.getLength(); i < arrLength; i += 1) {
      entity = map.entities.get(i);
      if (entity._typeName === 'Infobox' && entity._options.visible) {
        entity.setOptions({ visible: false });
      }
    }

    infobox = new Microsoft.Maps.Infobox(storesLocation[activePinIndex], infoboxOptions);
    map.entities.push(infobox);
    map.setView({
      center: infobox.getLocation(), centerOffset: new Microsoft.Maps.Point(-15, 35), zoom: 9
    });
  };


  /**
   *
   * @param {Object} params
   * @param {Object} params.pin
   * @param {Object} params.map
   * @param {Array<Object>} params.storesArray
   * @param {Array<Object>} params.storesLocation
   * @return {void}
   */
  StoreStockCheckController.prototype._mapPinClick = function (params) {
    var clickedIndex = parseInt(params.pin._text, 10) - 1,
      storeDetails = params.storesArray.eq(clickedIndex).find('div.store-details-wrapper').html(),
      storeTimings = $('div.selected-store-details-wrapper'),
      i = 0,
      entity = null,
      pinText = null,
      clickedStoreDetails = params.storesArray.eq(clickedIndex),
      storesHolder = $('div.stores-list-wrapper'),
      arrLength = 0;

    params.storesArray.removeClass('is-selected');
    clickedStoreDetails.addClass('is-selected');
    storeTimings.html(storeDetails);

    this._createInfoBox({
      activePinIndex: clickedIndex,
      map: params.map,
      storesArray: params.storesArray,
      storesLocation: params.storesLocation
    });

    if (parseInt(params.pin._text, 10) > 5) {
      storesHolder.scrollTop($('div.stores-list-wrapper')[0].scrollHeight);
    } else {
      storesHolder.scrollTop(0);
    }

    for (i, arrLength = params.map.entities.getLength(); i < arrLength; i += 1) {
      pinText = params.map.entities.get(i)._text;
      entity = params.map.entities.get(i);

      if (entity._typeName === 'map-pin' && params.pin._text === pinText) {
        entity.setOptions({
          icon: window.globalStaticAssetsPath + 'map-pin-selected.png', typeName: 'map-pin-selected'
        });
      }

      if (entity._typeName === 'map-pin-selected' && params.pin._text !== pinText) {
        entity.setOptions({
          icon: window.globalStaticAssetsPath + 'map-pin.png', typeName: 'map-pin'
        });
      }
    }
  };


  /**
   *
   * @param {string} selector
   * @return {void}
   */
  StoreStockCheckController.prototype._cacheOverlayDomElms = function (selector) {
    var $overlay = $(selector),
      elms = this._viewData.overlay.oElms;

    elms.elForm = $overlay.find('form.stock-check-form')[0];
    elms.elCheckBtn = $overlay.find('input.button')[0];
    elms.elPostcodeInput = $overlay.find('input.postcode')[0];
    elms.elInStockCheckbox = $overlay.find('input.in-stock-filter-checkbox')[0];
  };


  /**
   *
   * @param {Object} params
   * @param {String} params.overlaySelector
   * @return {void}
   */
  StoreStockCheckController.prototype._bindOverlayEvents = function (params) {
    var $overlay = $(params.overlaySelector);

    if (!this._viewData.state.overlayEventsBound) {
      $overlay
      .on('submit', 'form.stock-check-form', { overlaySelector: params.overlaySelector },
        this._handleOverlayStockCheckSubmit.bind(this))
      .on('focus', 'input.postcode', this._removeInvalidClass.bind(this))
      .on('click', 'span.view-store-info-toggle', this._storeInfoClick.bind(this))
      .on('change', 'input.in-stock-filter-checkbox',
        this._onInStockFilterCheckboxChange.bind(this))
      .on('click', 'a.current-location-link', { overlaySelector: params.overlaySelector },
        this._currentPositionHandler.bind(this));

      this._viewData.state.overlayEventsBound = true;
    }

    $overlay
    .find('a.store-detail-link')
    .on('click', params, this._storeLinkClick.bind(this));

    $overlay
    .find('a.check-more-stores-link')
    .on('click', params, this._displayMoreStoresHandler.bind(this));
  };


  /**
   *
   * @param {JQueryEvent} e
   * @return {void}
   */
  StoreStockCheckController.prototype._handleOverlayStockCheckSubmit = function (e) {
    var _event = e;

    e.preventDefault();

    _event.data = e.data || {};
    _event.data.updateActive = true;
    _event.data.listingID = $(e.currentTarget).data('id');

    if (document.activeElement && document.activeElement.type === 'text') {
      document.activeElement.blur();
    }

    this._handleCheckStockSubmit(_event);
  };


  /**
   *
   * @param {JQueryEvent} e
   * @return {void}
   */
  StoreStockCheckController.prototype._storeInfoClick = function (e) {
    var $viewStoreInfoLink = $(e.currentTarget),
      $ViewStoreInfoLinkText = $viewStoreInfoLink.find('span'),
      $storeDetailsWrapper = $viewStoreInfoLink
        .parent('a.store-detail-link')
        .next('div.store-details-wrapper');

    if ($viewStoreInfoLink.hasClass('open')) {
      $viewStoreInfoLink.removeClass('open');
      $ViewStoreInfoLinkText.text('Hide store info');
      $storeDetailsWrapper.removeClass('is-expanded');
    } else {
      $viewStoreInfoLink.addClass('open');
      $ViewStoreInfoLinkText.text('View store info');
      $storeDetailsWrapper.addClass('is-expanded');
    }
  };


  /**
   *
   * @param {JQueryEvent} e
   * @return {void}
   */
  StoreStockCheckController.prototype._onInStockFilterCheckboxChange = function (e) {
    var viewData = this._getViewData($(e.currentTarget).data('id'));

    this._viewData.state.isInStockOnly = e.currentTarget.checked;
    this._renderOverlay({ updateActive: true, vm: viewData, noAnalytics: true });
  };


  /**
   *
   * @param {JQueryEvent} e
   * @return {void}
   */
  StoreStockCheckController.prototype._storeLinkClick = function (e) {
    var currentElemIndex = parseInt(e.currentTarget.id, 10),
      $selectedStore = $('div.stores-list-wrapper ul li:nth-child(' + (currentElemIndex + 1) + ')'),
      storeDetails = $selectedStore.find('div.store-details-wrapper').html(),
      storeTimings = $('div.selected-store-details-wrapper'),
      storesArray = $('div.stores-list-wrapper ul li:visible'),
      i = 0,
      arrLength = 0;

    $('li.stores-list-item.is-selected').removeClass('is-selected');
    $(e.currentTarget).closest('li.stores-list-item').addClass('is-selected');
    storeTimings.html(storeDetails);

    this._createInfoBox({
      activePinIndex: currentElemIndex,
      map: e.data.map,
      storesArray: $('div.stores-list-wrapper li'),
      storesLocation: e.data.storesLocation
    });

    for (i, arrLength = storesArray.length; i < arrLength; i += 1) {
      this._createPin({
        activePinIndex: currentElemIndex,
        index: i,
        map: e.data.map,
        storesArray: storesArray,
        storesLocation: e.data.storesLocation
      });
    }
  };


  /**
   *
   * @param {JQueryEvent} e
   * @return {void}
   */
  StoreStockCheckController.prototype._displayMoreStoresHandler = function (e) {
    var $overlay = $(e.data.overlaySelector),
      $button = $(e.currentTarget),
      $listWrapper = $overlay.find('div.stores-list-wrapper'),
      $extraListItems = $listWrapper.find('li:gt(4)'),
      listLength = 0,
      i = 0,
      activePinIndex = $listWrapper.find('li.is-selected').index(),
      $wrapper = $overlay.find('div.col-stores-wrapper'),
      listingID = $button.data('id');

    e.preventDefault();

    $wrapper.addClass('with-bkg-loader').delay(300).queue(function () {
      $button.remove();
      $listWrapper.addClass('all-stores');
      $extraListItems.show(400, function () { $(this).removeAttr('style'); });
      $(this).removeClass('with-bkg-loader').dequeue();
      $listWrapper.animate({ scrollTop: $extraListItems.first().position().top }, 600);
    });

    for (i = 5, listLength = e.data.storesLocation.length; i < listLength; i += 1) {
      this._createPin({
        activePinIndex: activePinIndex,
        index: i,
        map: e.data.map,
        storesArray: $listWrapper.find('li'),
        storesLocation: e.data.storesLocation
      });
    }

    this._submitAnalyticsHandler('moreStoresButtonClick', listingID);
  };


  /**
   *
   * @param {string} type
   * @param {string} key
   * @return {void}
   */
  StoreStockCheckController.prototype._submitAnalyticsHandler = function (type, key) {
    var WebAnalytics = new analytics.WebMetrics(),
      props = null;

    switch (type) {
      case 'pageLoad':
        props = this._getPageLoadAnalytics();
        break;
      case 'storeStockOverlayOpen':
        props = this._getOverlayOpenAnalytics(key);
        break;
      case 'moreStoresButtonClick':
        this._setMoreStoresButtonAnalytics(key);
        break;
      case 'checkStoreStockLinkClick':
        this._setCheckStoreStockLinkAnalytics(key);
        break;
      case 'stockCheckError':
        props = storeStockAnalyticsProps[key] || null;
        break;
      default:
        props = null;
    }

    if (props !== null) {
      if (!window.pageLoadAnalyticsSuccess) {
        $(window).one('pageLoadAnalyticsSuccess',
        function storeStockCheckControllerAsyncAnalytics() {
          setTimeout(function () {
            WebAnalytics.submit([props]);
          }, 100);
        });
      } else {
        setTimeout(function () {
          WebAnalytics.submit([props]);
        }, 1000);
      }
    }
  };


  /**
   *
   * @return {Object}
   */
  StoreStockCheckController.prototype._getPageLoadAnalytics = function () {
    return {
      eVar17: 'store stock available',
      contextData: {
        content_module_impression: 1,
        content_module_name: 'Stock Checker'
      }
    };
  };


  /**
   *
   * @param {string} id
   * @return {?Object}
   */
  StoreStockCheckController.prototype._getOverlayOpenAnalytics = function (id) {
    var props = null,
      storesData = this._viewData.stores[id],
      stores = fn.isObject(storesData, { notEmpty: true }) ? storesData.nearestStores : [];

    if (stores.length) {
      props = {
        pageName: 'Check store',
        prop49: this._getStoreStockDataAnalytics({
          data: stores,
          stop: stores.length < 5 ? stores.length : 5
        }),
        prop50: stores.length
      };
    }

    return props;
  };


  /**
   *
   * @param {string} id
   * @return {void}
   */
  StoreStockCheckController.prototype._setMoreStoresButtonAnalytics = function (id) {
    var _s = fn.copyObject(window.s),
      storesData = this._viewData.stores[id],
      stores = fn.isObject(storesData, { notEmpty: true }) ? storesData.nearestStores : [];

    if (stores.length) {
      _s.linkTrackVars = 'events,prop49,prop50,eVar59';
      _s.linkTrackEvents = 'event19';
      _s.events = 'event19';
      _s.prop49 = this._getStoreStockDataAnalytics({ data: stores, start: 5, stop: stores.length });
      _s.prop50 = stores.length;
      _s.eVar59 = 'check more stores';

      try {
        _s.tl(true, 'o', 'check more stores');
      } catch (ex) {
        window.console.log('Adobe Custom Link Tracking failed with error ' + ex.message);
      }
    }
  };


  /**
   * Link tracking for Check store stock link on PLP
   *
   * @param {string} type
   * @return {void}
   */
  StoreStockCheckController.prototype._setCheckStoreStockLinkAnalytics = function (type) {
    var _s = fn.copyObject(window.s),
      props = storeStockAnalyticsProps[type];

    if (!props) {
      return;
    }

    _s.linkTrackVars = 'events,eVar45,prop4,prop19';
    _s.linkTrackEvents = 'event107,event45';
    _s.events = 'event107,event45';
    _s.eVar45 = props.eVar45;
    _s.prop4 = props.prop4;
    _s.prop19 = _s.eVar45;

    try {
      _s.tl(true, 'o', 'check store stock');
    } catch (ex) {
      window.console.log('Adobe Custom Link Tracking failed with error ' + ex.message);
    }
  };


  /**
   *
   * @param {Object} params
   * @param {Array<Object>} params.data
   * @param {number} [params.start=0]
   * @param {number} [params.stop=5]
   * @return {string}
   */
  StoreStockCheckController.prototype._getStoreStockDataAnalytics = function (params) {
    var _this = this,
      stores = params.data,
      startPos = params.start || 0,
      stopPos = params.stop || 5,
      store = {},
      stockLevel = null,
      position = 0,
      storeStockData = '',
      distance = '';

    fn.loopArray(stores, function loopStoresData(i) {
      store = stores[i];
      stockLevel = _this._getStockLevelAnalytics(store.stock_status);
      position = i + 1;
      distance = store.distance.substring(0, store.distance.indexOf(' '));
      storeStockData += store.storeId + '-' + stockLevel + '-' + distance + '-' + position;

      if (position < stopPos) {
        storeStockData += '|';
      }
    }, { start: startPos, stop: stopPos });

    return storeStockData;
  };


  /**
   *
   * @param {string} status
   * @return {?boolean}
   */
  StoreStockCheckController.prototype._getStockLevelAnalytics = function (status) {
    var stockLevel = null;

    switch (status) {
      case 'IN_STOCK':
        stockLevel = 1;
        break;
      case 'LOW_IN_STOCK':
        stockLevel = 2;
        break;
      case 'OUT_OF_STOCK':
        stockLevel = 0;
        break;
      default:
        stockLevel = null;
    }

    return stockLevel;
  };


  /**
   *
   * @return {void}
   */
  StoreStockCheckController.prototype._bindEvents = function () {
    if ($('#listing').length) {
      $(this.pageEventDelegator).on('click', 'a.thumbnail, .title-author-format a, a.stock-alert, div.colour-swatch a.moreLink', this._checkNonStoreStockLinkHandler.bind(this));
      if (this._isPCAEndpointAvailable()) {
        $(this.pageEventDelegator).on('click', 'a.check-store-stock-link', this._checkStoreStockLinkHandler.bind(this));
      }
    }
  };

    /**
   *
   * @param {JQueryEvent} e
   * @return {void}
   */
  StoreStockCheckController.prototype._checkNonStoreStockLinkHandler = function (e) {
    var target = $(e.target),
      productWrapper = target.parents('.product'),
      stockCheckActive = productWrapper.data('sc-active'),
      isAvailable = null,
      sellerCount = null,
      rangedInStore = null,
      hasVariants = null,
      isSeparated = null,
      stockCheckKey = null;

    if (!stockCheckActive) {
      return;
    }

    isAvailable = productWrapper.data('is-available');
    sellerCount = Number(productWrapper.data('seller-count'));
    rangedInStore = productWrapper.data('is-ranged-instore');
    hasVariants = productWrapper.data('has-variants');
    isSeparated = productWrapper.data('is-separated');

    if (rangedInStore && sellerCount === 1 && !hasVariants && !isSeparated) {
      stockCheckKey = 'productCheckStoreStock';
    } else if (!isAvailable && !rangedInStore) {
      stockCheckKey = 'productOutOfStock';
    } else if (rangedInStore && (sellerCount > 1 || hasVariants || isSeparated)) {
      stockCheckKey = 'productCheckAvailability';
    } else {
      stockCheckKey = 'productNotAvailableInStore';
    }
    this._submitAnalyticsHandler('checkStoreStockLinkClick', stockCheckKey);
  };

  /**
   *
   * @param {JQueryEvent} e
   * @return {void}
   */
  StoreStockCheckController.prototype._checkStoreStockLinkHandler = function (e) {
    var $link = $(e.currentTarget),
      id = $link.data('id'),
      nearestStoreLookup = '',
      _this = this,
      viewData = null,
      isSessionDataAvailable = this._viewData.state.isSessionDataAvailable;

    e.preventDefault();
    e.stopPropagation();

    this._submitAnalyticsHandler('checkStoreStockLinkClick', 'checkStoreStock');

    if (isSessionDataAvailable === null) {
      isSessionDataAvailable
      = this._viewData.state.isSessionDataAvailable
      = this._isSessionDataAvailable();
    }

    if (isSessionDataAvailable) {
      viewData = this._getViewData(id);
      nearestStoreLookup = fn.getSessionData('nearestStoreLookup');

      if (viewData && viewData.nearestStoreLookup === nearestStoreLookup) {
        _this._renderOverlay({ vm: viewData });
        return;
      }

      this._getStoreStockData({ location: nearestStoreLookup, listingID: id })
        .done(function handleGetStoreStockDataSuccess(data) {
          if (!fn.isArray(data, { notEmpty: true })) {
            _this._renderOverlay({ empty: true, vm: { id: id } });
            return;
          }

          viewData = _this._sanitiseViewData(data, id);

          _this._cacheViewData(viewData);
          _this._renderOverlay({ vm: viewData });
        })
        .fail(function handleGetStoreStockDataFailure(errorMessage) {
          _this._renderOverlay({ empty: true, vm: { id: id }, error: errorMessage });
        });
    } else {
      this._renderOverlay({ empty: true, vm: { id: id } });
    }
  };


  /**
   * Get stores view data from cache.
   *
   * @param {string} id
   * @returns {?object}
   */
  StoreStockCheckController.prototype._getViewData = function (id) {
    return fn.isObject(this._viewData.stores[id], { notEmpty: true })
      ? this._viewData.stores[id] : null;
  };


  /**
   * Save stores view data to cache.
   *
   * @param {object} data
   * @param {string} data.id
   * @returns {!object}
   */
  StoreStockCheckController.prototype._cacheViewData = function (data) {
    var stores = this._viewData.stores;

    if (!data || !data.id) return null;

    stores[data.id] = data;

    return stores[data.id];
  };


  /**
   *
   * @param {JQueryEvent} e
   * @returns {void}
   */
  StoreStockCheckController.prototype._currentPositionHandler = function (e) {
    var _this = this,
      _event = e,
      ERROR_MESSAGE = 'Sorry we currently can\'t access your location.',
      inPanel = !!fn.isObject(this._activePanel.storeStockCheck, { notEmpty: true }),
      view = this._activeView || null;

    if (inPanel) {
      view = this._viewData.overlay;
    }

    $(e.currentTarget).addClass('loading');
    view.oElms.elPostcodeInput.readonly = true;
    view.oElms.elCheckBtn.readonly = true;

    this._getDeviceCoordinates()
      .done(function handleGetDeviceCoordinatesSuccess(coordinates) {
        _this._getDeviceLocation(coordinates)
          .done(function handleGetDeviceLocationSuccess(location) {
            _this._setDeviceLocation({
              latitude: coordinates.latitude,
              longitude: coordinates.longitude,
              locality: location
            });

            _this._updatePostcodeInput(location);

            _event.data = _event.data || {};
            _event.data.useDeviceLocation = true;

            if (inPanel) {
              _this._handleOverlayStockCheckSubmit(_event);
            } else {
              _this._handleCheckStockSubmit(_event);
            }
          })
          .fail(function handleGetDeviceLocationFailure() {
            _this._renderTooltip(ERROR_MESSAGE);
          });
      })
      .fail(function handleGetDeviceCoordinatesFailure() {
        _this._renderTooltip(ERROR_MESSAGE);
      })
      .always(function () {
        view.oElms.elPostcodeInput.readonly = false;
        view.oElms.elCheckBtn.readonly = false;
        $(_event.currentTarget).removeClass('loading');
      });
  };


  /**
   * Get user's current position from device's given location.
   *
   * @returns {JQueryPromise}
   */
  StoreStockCheckController.prototype._getDeviceCoordinates = function () {
    var onSuccess = null,
      onError = null,
      deferred = $.Deferred();

    onSuccess = function (position) {
      deferred.resolve(position.coords);
    };

    onError = function (error) {
      deferred.reject(error);
    };

    fn.getCurrentPosition(onSuccess, onError,
      { enableHighAccuracy: true, timeout: 120000, maximumAge: 120000 });

    return deferred.promise();
  };


  /**
   * Get user's current location name from given coordinates.
   *
   * @param {object} coordinates
   * @param {number} coordinates.latitude
   * @param {number} coordinates.longitude
   * @returns {JQueryPromise}
   */
  StoreStockCheckController.prototype._getDeviceLocation = function (coordinates) {
    var deferred = $.Deferred(),
      latitude = fn.getValue(this._viewData, 'deviceLocation', 'latitude'),
      longitude = fn.getValue(this._viewData, 'deviceLocation', 'longitude'),
      locality = null;

    if (latitude === coordinates.latitude && longitude === coordinates.longitude) {
      locality = fn.getValue(this._viewData, 'deviceLocation', 'locality');
      deferred.resolve(locality);
      return deferred.promise();
    }

    this._fetchLocation(coordinates)
      .done(function handleFetchLocationSuccess(location) {
        locality = location;
        deferred.resolve(locality);
        return deferred.promise();
      })
      .fail(function handleFetchLocationFailure() {
        deferred.reject();
      });

    return deferred.promise();
  };


  /**
   * Make call to Bing Maps API to return location name from given coordinates.
   *
   * @param {Object} coordinates
   * @returns {JQueryPromise}
   */
  StoreStockCheckController.prototype._fetchLocation = function (coordinates) {
    var BING_URL = '//dev.virtualearth.net/REST/v1/Locations/',
      BING_KEY = 'ArjMBd3QUx1XCF2EMs4ZS1ULKnrka2i3yXuWRfq7Dq-hpSHE1cJmvMZpirc4W3dw',
      point = coordinates.latitude + ',' + coordinates.longitude,
      deferred = $.Deferred();

    $.getJSON(BING_URL + point + '?key=' + BING_KEY + '&jsonp=?', function (data) {
      var location = null;

      if (data.statusCode !== 200) {
        deferred.reject();
        return;
      }

      location = fn.getValue(data, 'resourceSets', 0, 'resources', 0, 'address', 'locality');

      if (!location) {
        deferred.reject();
        return;
      }

      deferred.resolve(location);
    });

    return deferred.promise();
  };


  /**
   * Cache user's current location.
   *
   * @param {Object} location
   * @param {number} location.latitude
   * @param {number} location.longitude
   * @param {string} location.locality
   * @returns {void}
   */
  StoreStockCheckController.prototype._setDeviceLocation = function (location) {
    if (!fn.isObject(location, { notEmpty: true })) return;

    this._viewData.deviceLocation.latitude = location.latitude;
    this._viewData.deviceLocation.longitude = location.longitude;
    this._viewData.deviceLocation.locality = location.locality;
  };


  /**
   * Populate store stock check form input with given location name.
   *
   * @param {string} location
   * @returns {void}
   */
  StoreStockCheckController.prototype._updatePostcodeInput = function (location) {
    var inPanel = !!fn.isObject(this._activePanel.storeStockCheck, { notEmpty: true }),
      view = null;

    if (typeof location !== 'string' || location === '') return;

    view = inPanel ? this._viewData.overlay : this._activeView;
    view.oElms.elPostcodeInput.value = location;
  };


  module.exports = StoreStockCheckController;
});
