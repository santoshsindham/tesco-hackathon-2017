define('modules/pdp/models/StoreModel', [
  'modules/mvc/fn',
  'modules/pdp/data-stores/Store',
  'modules/pdp/models/BaseModel'
], function (fn, StoreDS, BaseModel) {
  'use strict';

  /**
   *
   * @param {Object} config
   * @return {void}
   */
  function StoreModel(config) {
    this.DataStoreClass = StoreDS;
    this.sNamespace = 'stores';
    this.sParentNamespace = '';
    this.parent.constructor.call(this, config);
  }


  fn.inherit(StoreModel, BaseModel);


  /**
   *
   * @param {Object} start
   * @param {Object} end
   * @param {string} [unit]
   * @return {string}
   */
  StoreModel.prototype.calculateDistance = function (start, end, unit) {
    var radlat1 = null,
      radlat2 = null,
      theta = null,
      radtheta = null,
      distance = null;

    if (!fn.isObject(start, { notEmpty: true }) || !fn.isObject(end, { notEmpty: true })) {
      return null;
    }

    if (!fn.checkData(start, ['latitude', 'longitude'])
      || !fn.checkData(end, ['latitude', 'longitude'])) {
      return null;
    }

    radlat1 = Math.PI * (start.latitude / 180);
    radlat2 = Math.PI * (end.latitude / 180);
    theta = start.longitude - end.longitude;
    radtheta = Math.PI * (theta / 180);
    distance = (Math.sin(radlat1) * Math.sin(radlat2))
        + (Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta));

    distance = Math.acos(distance);
    distance *= (180 / Math.PI) * 60 * 1.1515;

    if (unit === 'K') {
      distance *= 1.609344;
    }

    if (unit === 'N') {
      distance *= 0.8684;
    }

    return distance;
  };


  /**
   *
   * @param {Object} args
   * @param {Array<string>} args.values
   * @return {Array<string>}
   */
  StoreModel.prototype.createEndpoint = function (args) {
    var values = args.values,
      aEndpoints = [],
      endpoint = null,
      sLatitute = null,
      sLongitute = null,
      sURL = '';

    endpoint = this.oDataEndpointMap.getEndpoint(this.sNamespace);

    if (endpoint) {
      sURL = endpoint.action.fetch.href;

      if (args.modelMethod) {
        sURL = endpoint.action[args.modelMethod].href;
        sURL += values[0];
      } else {
        sLatitute = values[0];
        sLongitute = values[1];
        sURL = sURL.replace(/({LON})/, sLongitute).replace(/({LAT})/, sLatitute);
      }
      aEndpoints.push(sURL);
    }

    return aEndpoints;
  };

  return StoreModel;
});
