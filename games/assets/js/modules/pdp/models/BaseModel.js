define('modules/pdp/models/BaseModel', [
  'domlib',
  'modules/mvc/fn',
  'modules/pdp/BaseClass',
  'modules/pdp/StoreModelMap',
  'modules/pdp/DataEndpointMap',
  'modules/pdp/api/RESTAPIRequest',
  'modules/pdp/HyperMediaModelMap'
], function (
  $,
  fn,
  BaseClass,
  StoreModelMap,
  DataEndpointMap,
  RESTAPIRequest,
  HyperMediaModelMap
) {
  'use strict';

  /**
   *
   * @param {Object} config
   * @return {void}
   */
  function BaseModel(config) {
    this.type = 'model';
    this._aDataStores = [];
    this.observers = [];
    this.oStoreModelMap = new StoreModelMap();
    this.oDataEndpointMap = new DataEndpointMap();
    this.oHyperMediaModelMap = new HyperMediaModelMap();
    this.baseURL = fn.isObject(config) ? config.baseURL : '';
    this._bindEvents();
  }

  fn.inherit(BaseModel, BaseClass);

  BaseModel.prototype._bindEvents = function () {
    $(window).on(
      'dataRequest.' + this.sNamespace,
      this._onDataRequest.bind(this)
    );
  };

  BaseModel.prototype._onDataRequest = function (oEvent) {
    var _this = this,
      oData = oEvent.oData,
      oPromise = _this.promise({
        sSearchKey: oData.oGetParams.sSearchKey,
        mSearchValue: oData.oGetParams.mSearchValue,
        sPropKey: oData.oGetParams.sPropKey
      });

    oPromise.done(function (mDataStores) {
      _this.setEvent({
        sName: 'dataResponse',
        sNamespace: oEvent.sRespNamespace,
        mRespData: mDataStores
      }, true, true);
    });
  };

  BaseModel.prototype.promise = function (oParams) {
    var _oParams = oParams,
      oDeferred = new $.Deferred();

    _oParams.oDeferred = oDeferred;

    this.get(_oParams);

    return oDeferred.promise();
  };


  BaseModel.prototype.get = function (args) {
    var _args = args,
      wasArray = true,
      deferred = _args.oDeferred,
      fetch = !_args.noFetch,
      missingData = [],
      output = null,
      propKey = _args.sPropKey,
      searchKey = _args.sSearchKey || 'id',
      searchValue = _args.mSearchValue;

    if (!searchValue) {
      return null;
    }

    if (_args.originalValue !== undefined) {
      searchValue = _args.originalValue;
      delete _args.originalValue;
    }

    if (fn.isArray(searchValue)) {
      output = this._getMultiple({
        sSearchKey: searchKey,
        mSearchValue: searchValue,
        sPropKey: propKey
      });
    } else {
      output = this._getSingle({
        sSearchKey: searchKey,
        mSearchValue: searchValue,
        sPropKey: propKey
      });
    }

    if (!fn.isArray(output)) {
      wasArray = false;
      output = [output];
      searchValue = [searchValue];
    }

    if (!_args.fetched && fetch) {
      fn.loopArray.call(this, output, function loopOutput(i) {
        if (output[i] === undefined || output[i] === null
            || this._checkDataStores(output[i]).length) {
          missingData.push(searchValue[i]);
        }
      });

      if (missingData.length > 0 && missingData.length !== searchValue.length) {
        _args.originalValue = wasArray ? searchValue : searchValue[0];
        _args.mSearchValue = wasArray ? missingData : missingData[0];
      }

      if (missingData.length) {
        _args.fetched = true;
        this.fetch(_args);
        return null;
      }
    } else {
      fn.loopArray.call(this, output, function loopOutput(i) {
        if (output[i] === undefined || output[i] === null) {
          output.splice(i, 1);
        }
      }, { backward: true });
    }

    if (deferred) {
      deferred.resolve(fn.copy(wasArray ? output : output[0], { deep: true }));
      return null;
    }

    return fn.copy(wasArray ? output : output[0], { deep: true });
  };


  /**
   * Hook method designed to be superceded by derived classes that need to do
   * a custom check on data to decide whether to return the output or
   * initiate a fetch of the data from the server.
   *
   * @return {Array}
   */
  BaseModel.prototype._checkDataStores = function () {
    return [];
  };


  BaseModel.prototype._getMultiple = function (oParams) {
    var sSearchKey = oParams.sSearchKey,
      mSearchValue = oParams.mSearchValue,
      sPropKey = oParams.sPropKey,
      aOutput = [];

    this.forLoop(mSearchValue, function (i) {
      aOutput.push(this._getSingle({
        sSearchKey: sSearchKey,
        mSearchValue: mSearchValue[i],
        sPropKey: sPropKey
      }));
    });

    return aOutput;
  };

  BaseModel.prototype._getSingle = function (oParams) {
    var sSearchKey = oParams.sSearchKey,
      mSearchValue = oParams.mSearchValue,
      sPropKey = oParams.sPropKey,
      mOutput = null;

    return this.forLoop(this._aDataStores, function (i) {
      if (this.isArray(this._aDataStores[i][sSearchKey], true)) {
        mOutput = this.forLoop(this._aDataStores[i][sSearchKey], function (j) {
          if (this._aDataStores[i][sSearchKey][j] === mSearchValue) {
            return this._aDataStores[i];
          }

          return undefined;
        });
      } else if (this._aDataStores[i][sSearchKey] === mSearchValue) {
        mOutput = this._aDataStores[i];
      }

      if (mOutput && !sPropKey) {
        return mOutput;
      }

      if (mOutput && sPropKey) {
        return mOutput[sPropKey];
      }

      return undefined;
    });
  };

  BaseModel.prototype._onDataResponse = function (oEvent) {
    var oPromise = this.promise({
      sSearchKey: 'id',
      mSearchValue: oEvent.oData.mRespData
    });

    oPromise.done(function (mDataStores) {
      oEvent.data.oDeferred.resolve(mDataStores);
    });
  };

  /**
   *
   * @param {Object} args
   * @return {void}
   */
  BaseModel.prototype.send = function (args) {
    var ERROR_MESSAGE = 'Oops! Something went wrong. Please try again.',
      data = null,
      promise = this.promise({
        sSearchKey: args.oPromise.sSearchKey,
        mSearchValue: args.oPromise.mSearchValue
      });

    promise.done(function (oDataStore) {
      $.ajax({
        url: oDataStore.action,
        method: oDataStore.method,
        data: oDataStore.oData
      }).done(function (res) {
        data = typeof res === 'string' ? JSON.parse(res) : res;
        args.fnDoneCallback(data, args.oPromise);
      }).fail(function (oJqXHR) {
        args.fnFailCallback(ERROR_MESSAGE, oJqXHR, args.oPromise);
      });
    });
  };

  BaseModel.prototype.update = function (oParams) {
    var i = 0,
      aDataStores = this._aDataStores,
      iCount = aDataStores.length,
      sSearchKey = oParams.sSearchKey || 'id',
      mSearchValue = oParams.mSearchValue,
      sUpdateKey = oParams.sUpdateKey,
      mUpdateValue = oParams.mUpdateValue,
      sUpdatePropKey = oParams.sUpdatePropKey,
      mUpdatePropValue = oParams.mUpdatePropValue,
      mOutput = null,
      sRgxdPropKey = null,
      oDataStore = null,
      sObjRefProp = null;

    if (this.isObject(mUpdateValue) || this.isArray(mUpdateValue, true)) {
      mUpdateValue = this.deepCopy(mUpdateValue);
    }

    if (this.isObject(mUpdatePropValue) || this.isArray(mUpdatePropValue, true)) {
      mUpdatePropValue = this.deepCopy(mUpdatePropValue);
    }

    for (i = 0; i < iCount; i += 1) {
      if (aDataStores[i][sSearchKey] === mSearchValue) {
        if (mUpdateValue) {
          aDataStores[i][sUpdateKey] = mUpdateValue;
          mOutput = aDataStores[i][sUpdateKey];
          oDataStore = aDataStores[i];
          sObjRefProp = sUpdateKey;
        } else {
          sRgxdPropKey = this._updateRegexHook({
            oData: aDataStores[i][sUpdateKey],
            sProp: sUpdatePropKey
          });
          aDataStores[i][sUpdateKey][sRgxdPropKey] = mUpdatePropValue;
          mOutput = aDataStores[i][sUpdateKey][sRgxdPropKey];
          oDataStore = aDataStores[i][sUpdateKey];
          sObjRefProp = sRgxdPropKey;
        }

        if (this.isArray(mOutput, true)) {
          this._setMultipleObjRefs(oDataStore, sObjRefProp);
        } else if (this.isObject(mUpdatePropValue)) {
          this._setSingleObjRef(oDataStore, sObjRefProp);
        }

        this.notify({ action: 'update', data: mOutput });

        return this.deepCopy(oDataStore);
      }
    }

    return null;
  };

  BaseModel.prototype._updateRegexHook = function (oParam) {
    return oParam.sProp;
  };

  BaseModel.prototype.add = function (mData) {
    var mOutput = undefined;

    if (mData) {
      if (this.isArray(mData, true)) {
        mOutput = this._addMultiple(this.deepCopy(mData));
      } else {
        mOutput = this._addSingle(this.deepCopy(mData));
      }

      this.setEvent({
        sName: 'dataAdded',
        sNamespace: this.sNamespace,
        mAddedData: mOutput
      }, true, true);

      this.notify({ action: 'add', data: mOutput });

      return this.deepCopy(mOutput);
    }

    return null;
  };

  BaseModel.prototype._addMultiple = function (aData) {
    var i = 0,
      iCount = aData.length,
      aOutput = [];

    for (i = 0; i < iCount; i += 1) {
      aOutput.push(this._addSingle(aData[i]));
    }

    return aOutput;
  };

  BaseModel.prototype._addSingle = function (oData) {
    var oDataStore = null,
      oDuplicate = null;

    if (this.sanityCheckData(oData).objects) {
      oDataStore = new this.DataStoreClass(oData);

      this._setObjRefs(oDataStore);

      oDuplicate = this._findDuplicate(oDataStore);

      if (!oDuplicate) {
        this._aDataStores.push(oDataStore);
      } else {
        this.mergeObjects(oDuplicate, oDataStore, { extend: true });
      }

      return oDuplicate || oDataStore;
    }

    return null;
  };

  BaseModel.prototype._findDuplicate = function (oDataStore) {
    var i = 0,
      iCount = this._aDataStores.length;

    for (i = 0; i < iCount; i += 1) {
      if (this._aDataStores[i].id === oDataStore.id) {
        return this._aDataStores[i];
      }
    }

    return undefined;
  };

  BaseModel.prototype._isInstanceOf = function (oData) {
    if (oData instanceof this.DataStoreClass) {
      return true;
    }

    return false;
  };

  BaseModel.prototype._setObjRefs = function (oData) {
    fn.loopObject.call(this, oData, function loopData(prop) {
      if (oData[prop] && this.oStoreModelMap.isStoreMapped(prop)) {
        if (Array.isArray(oData[prop]) && oData[prop].length) {
          this._setMultipleObjRefs(oData, prop);
        } else {
          this._setSingleObjRef(oData, prop);
        }
      }
    });
  };

  BaseModel.prototype._setMultipleObjRefs = function (oData, sProp) {
    var i = 0,
      iCount = oData[sProp].length;

    for (i = 0; i < iCount; i += 1) {
      this._setSingleObjRef(oData, sProp, i);
    }
  };

  BaseModel.prototype._setSingleObjRef = function (data, prop, i) {
    var _data = data;

    /**
     * Sets object references
     * @param {String} propName The property name.
     * @param {Mixed} value The data value to set the object referneces on.
     * @return {void}
     */
    function setRefs(propName, value) {
      var flags = this.sanityCheckData(value);

      if (flags.objects) {
        return value.id;
      }

      if (flags.ids) {
        if (propName === 'formHandler') {
          return $($.parseHTML(value)).attr('name');
        }
      }

      return value;
    }

    if (i !== undefined) {
      _data[prop][i] = setRefs.call(this, prop, _data[prop][i]);

      if (this.isArray(_data[prop][i], true) || this.isObject(_data[prop][i], true)) {
        this._setObjRefs(_data[prop][i]);
      }
    } else {
      _data[prop] = setRefs.call(this, prop, _data[prop]);

      if (this.isArray(_data[prop], true) || this.isObject(_data[prop], true)) {
        this._setObjRefs(_data[prop]);
      }
    }
  };

  /**
   * Removes an object from a model's data store.
   * @param {Object} oParams The search params, including mSearchValue, which will accept an id,
   *   an object to remove, an array of ids or an array of objects to remove.
   * @return {Object|Array|Boolean} The object or array of objects removed.
   */
  BaseModel.prototype.remove = function (oParams) {
    var mOutput = null;

    if (this.isArray(oParams.mSearchValue, true)) {
      mOutput = this._removeMultiple(oParams);
    } else {
      mOutput = this._removeSingle(oParams);
    }

    if (mOutput) {
      this.setEvent({
        sName: 'dataRemoved',
        sNamespace: this.sNamespace,
        mRemovedData: mOutput
      }, true, true);

      this.notify({ action: 'remove', data: mOutput });

      return mOutput;
    }

    return false;
  };

  /**
   * Iterates through an array and calls the removeSingle method on each index value.
   * @param {Object} oParams Search params, including array of values to be iterated over.
   * @return {Array} Array of objects removed from the model.
   */
  BaseModel.prototype._removeMultiple = function (oParams) {
    var aOutput = [];

    this.forLoop(oParams.mSearchValue, function (i) {
      aOutput.push(this._removeSingle({
        mSearchValue: oParams.mSearchValue[i]
      }));
    });

    return aOutput;
  };

  /**
   * Gets the object to remove and removes it from the data store, then returns the object.
   * @param {Object} oParams Search params, including a reference to the object to remove.
   * @return {Object|Boolean} Neither the removed object or false if remove failed.
   */
  BaseModel.prototype._removeSingle = function (oParams) {
    var oDataStore = {},
      index = null;

    // get the object from the model's data store
    oDataStore = this.get({
      sSearchKey: oParams.sSearchKey,
      mSearchValue: oParams.mSearchValue,
      sPropKey: oParams.sPropKey,
      oDeferred: oParams.oDeferred
    });

    // if a data object was returned, get the index and remove from data store.
    if (oDataStore) {
      index = this.forLoop(this._aDataStores, function (i) {
        if (this._aDataStores[i].id === oParams.mSearchValue) {
          return i;
        }

        return undefined;
      });

      this._aDataStores.splice(index, 1);
      return oDataStore;
    }

    return false;
  };

  /**
   * Sets up an observer on an object/group of objects or on an objects property or group of
   * objects' properties.
   * @param {Object} oParams The configuration to set up the observer.
   * @return {void}
   */
  BaseModel.prototype.observe = function (oParams) {
    var _oParams = oParams || {};

    if (oParams && !oParams.hasOwnProperty('model')) {
      _oParams.hash = fn.hashValue(this.get({
        sSearchKey: _oParams.searchKey || 'id',
        mSearchValue: _oParams.searchValue || this.getDataStoreIds(),
        sPropKey: _oParams.propKey || null,
        noFetch: true
      }));
    }

    _oParams.action = oParams.action || 'all';
    this.observers.push(_oParams);
  };

  /**
   * Checks if observed data has changed and if it has it notifies observers by executing the
   * callback the observer provided.
   * @param {Object} oParams The data changed in the model and the model action.
   * @return {void}
   */
  BaseModel.prototype.notify = function (oParams) {
    var i = 0,
      _params = {},
      result = undefined,
      hash = undefined;

    if (this.isArray(this.observers, true)) {
      i = this.observers.length - 1;

      for (; i >= 0; i -= 1) {
        _params = {};
        result = undefined;
        hash = undefined;

        if (this.observers[i].model) {
          this.observers[i].callback(this);

          if (this.observers[i].once) {
            this.observers.splice(i, 1);
          } else {
            this.observers[i].hash = hash;
          }
        } else {
          result = this.get({
            sSearchKey: this.observers[i].searchKey,
            mSearchValue: this.observers[i].searchValue,
            sPropKey: this.observers[i].propKey,
            noFetch: true
          });
          hash = fn.hashValue(result);

          if (this.observers[i].hash !== hash) {
            if (this.observers[i].action === 'all' || this.observers[i].action === oParams.action) {
              _params.action = oParams.action;
              _params.data = {};
              _params.data[oParams.action] = oParams.data;
              _params.data.observe = this.get({
                sSearchKey: this.observers[i].searchKey,
                mSearchValue: this.observers[i].searchValue,
                noFetch: true
              });
              this.observers[i].callback(_params);

              if (this.observers[i].once) {
                this.observers.splice(i, 1);
              } else {
                this.observers[i].hash = hash;
              }
            }
          }
        }
      }
    }
  };

  /**
   * Gets the ids of every data store in the model.
   * @return {Array} List of data store ids
   */
  BaseModel.prototype.getDataStoreIds = function () {
    var ids = [];

    this.forLoop(this._aDataStores, function (i) {
      ids.push(this._aDataStores[i].id);
    });

    return ids;
  };

  BaseModel.prototype.fetch = function (args) {
    var _this = this,
      _args = args || {},
      isDeferred = this.isObject(_args.oDeferred, true),
      i = 0,
      values = this.isArray(_args.mSearchValue) ? _args.mSearchValue : [_args.mSearchValue],
      APIRequest = new RESTAPIRequest(),
      promises = null;

    if (this.isObject(_args.fetch, true)) {
      $.extend(_args, _args.fetch);
      delete _args.fetch;
    }

    if (typeof _args.doneCallback !== 'function') {
      _args.doneCallback = function () {
        _this.get(_args);
      };
    }

    _args.endpoints = this.createEndpointsArray({
      values: values,
      increment: _args.increment,
      modelMethod: _args.sModelMethod,
      hrefData: _args.hrefData,
      createEndpointCallback: _args.createEndpointCallback
    });

    if (_args.endpoints.length) {
      promises = APIRequest.fetchData(
        _args.endpoints,
        this._fetchSuccessCallback,
        this._fetchErrorCallback,
        _args
      );

      for (; i < promises.length; i += 1) {
        promises[i].progress(function (resp) {
          _this.dataHandler(resp, _args);

          if (_args.progressCallback) {
            _args.progressCallback(_args.mSearchValue, resp);
          }
        });
      }

      $.when
        .apply($, promises)
        .done(function (resp) {
          _args.doneCallback.call(this, resp, _args.oDeferred);
        })
        .fail(function handleFetchPromiseFailure(failureArgs) {
          if (!_this.isObject(failureArgs) || !_this.isObject(failureArgs.errorResp)) {
            if (isDeferred) {
              _args.oDeferred.reject();
            }
          }

          if (failureArgs.errorResp.status === 500) {
            _this.forLoop(_args.endpoints, function loopEndpoints(j) {
              if (failureArgs.params.sEndpoint === _args.endpoints[j]) {
                if (Array.isArray(_args.mSearchValue)) {
                  _args.mSearchValue.splice(j, 1);
                }
                return true;
              }
              return undefined;
            });

            _args.doneCallback.call(this, failureArgs.params);
            return;
          }

          if (failureArgs.errorResp.status === 400) {
            _args.increment = !_args.increment ? 10 : Math.ceil(_args.increment / 2);

            if (_args.increment >= 5) {
              _this.get(_args);
              return;
            }
          }

          if (isDeferred) {
            _args.oDeferred.reject();
          }
        });
    } else if (isDeferred) {
      _args.oDeferred.resolve();
    }
  };

  BaseModel.prototype.createEndpointsArray = function (args) {
    var _args = args || {},
      increment = _args.increment || 20,
      endpoints = [],
      count = 0,
      i = 0,
      values = [],
      begin = 0,
      end = increment;

    if (!this.isArray(_args.values)) {
      return endpoints;
    }

    count = Math.ceil(_args.values.length / increment);

    for (; i < count; i += 1) {
      values.push(_args.values.slice(begin, end));
      begin += increment;
      end += increment;
    }

    if (!values.length) {
      return endpoints;
    }

    this.forLoop(values, function loopValues(j) {
      if (values[j]) {
        endpoints = endpoints.concat(this.createEndpoint({
          values: values[j],
          modelMethod: args.modelMethod,
          hrefData: args.hrefData,
          createEndpointCallback: args.createEndpointCallback
        }));
      }
    });

    return endpoints;
  };

  BaseModel.prototype.createEndpoint = function (args) {
    var i = 0,
      values = args.values,
      count = values.length,
      endpoints = [],
      endpoint = null,
      url = '',
      placeholderRegex = /{[^{}]*}/g,
      bracketRegex = /[{}]/g,
      placeholderContent = '',
      validUrl = true;

    /**
     * Finds instances of placeholders in url and replaces them with relevant data.
     * @param {String} placeholder The placeholder content, including brackets.
     * @return {String} The data add in place of the placeholder.
     */
    function placeholderReplace(placeholder) {
      placeholderContent = placeholder.replace(bracketRegex, '');

      if (!args.hrefData.hasOwnProperty(placeholderContent)) {
        validUrl = false;
        return '';
      }

      return args.hrefData[placeholderContent];
    }

    for (i = 0; i < count; i += 1) {
      if (typeof values[i] === 'object' && values[i].hasOwnProperty('href')) {
        endpoints.push(values[i].href);
      } else {
        endpoint = this.oDataEndpointMap.getEndpoint(this.sNamespace);

        if (endpoint) {
          if (args.modelMethod) {
            url = endpoint.action[args.modelMethod].href;
          } else {
            url = endpoint.action.fetch.href;
          }

          if (url.match(placeholderRegex)) {
            if (!this.isObject(args.hrefData, true)) {
              validUrl = false;
            } else {
              url = url.replace(placeholderRegex, placeholderReplace);
            }
          }

          if (validUrl) {
            url += values[i];

            if (typeof args.createEndpointCallback === 'function') {
              url = args.createEndpointCallback(url);
            }

            endpoints.push(url);
          }
        }
      }
    }

    return endpoints;
  };


  /**
   *
   * @param {Object} args
   * @param {String} legacyArg The id to look up the objects with.
   * @return {Array<Object>}
   */
  BaseModel.prototype.getLinks = function (args, legacyArg) {
    var key = '',
      value = undefined,
      childKey = '',
      childValue = undefined,
      objData = {},
      filteredlinks = [];

    /**
     * First clause added to make method backwards compatable
     * after refactor. - Dylan Aubrey (so24) on 22/06/2016
     */
    if (typeof args === 'string') {
      key = 'rel';
      value = args;
      objData = this.resolveDataArg(legacyArg);
    } else if (this.isObject(args, true)) {
      key = args.key || 'rel';
      value = args.value || undefined;
      childKey = args.childKey || '';
      childValue = args.childValue || undefined;
      objData = this.resolveDataArg(args.data);
    }

    if (!objData
        || (typeof key !== 'string' || key.length === 0)
        || typeof childKey !== 'string') {
      return filteredlinks;
    }

    objData = !this.isArray(objData) ? [objData] : objData;

    this.forLoop(objData, function loopDataStores(i) {
      if (this.isObject(objData[i], true) && this.isArray(objData[i].links, true)) {
        this.forLoop(objData[i].links, function loopLinks(j) {
          if (value !== undefined) {
            if (objData[i].links[j][key] === value) {
              filteredlinks.push(objData[i].links[j]);
            }
          } else if (childKey.length > 0
              && this.isObject(objData[i].links[j][key], true)
              && objData[i].links[j][key][childKey] === childValue) {
            filteredlinks.push(objData[i].links[j]);
          }
        });
      }
    });

    return filteredlinks;
  };

  BaseModel.prototype.getLinkIds = function (links) {
    var ids = [];

    this.forLoop(links, function loopLinks(i) {
      if (typeof links[i].id === 'string') {
        ids.push(links[i].id);
      }
    });

    return ids;
  };


  /**
   *
   * @param {Object|string} data
   * @return {Object}
   */
  BaseModel.prototype.getSelfLink = function (data) {
    var selfLink = this.getLinks({ value: 'self', data: data });

    if (!fn.isArray(selfLink, { notEmpty: true })) {
      return {};
    }

    return selfLink[0];
  };


  BaseModel.prototype.dataHandler = function (oResponse) {
    var _oResponse = oResponse,
      sResponseModelType = null,
      oEventDataAdd = new $.Event('addData'),
      oAPIRequest = new RESTAPIRequest(),
      oSelfEntity = oAPIRequest.getSelfEntityFromResponse(_oResponse);

    if (oSelfEntity) {
      _oResponse.id = oSelfEntity.id;
      _oResponse.type = oSelfEntity.type;
      sResponseModelType = this.oHyperMediaModelMap.getModelFromHyperMediaType(_oResponse.type);

      if (sResponseModelType !== this.sNamespace) {
        oEventDataAdd.oData = {
          sNamespace: sResponseModelType,
          mAddData: _oResponse
        };
        $(window).trigger(oEventDataAdd);
      } else {
        this.add(_oResponse);
      }

      this.triggerDataFetched(_oResponse);
    } else {
      this.nonCompliantDataHandler(_oResponse);
    }
  };

  BaseModel.prototype.triggerDataFetched = function (oResponse) {
    var eDataFetched = null;

    eDataFetched = $.Event('dataFetched');
    eDataFetched.oData = {
      mfetchedData: oResponse
    };
    $(window).trigger(eDataFetched);
  };

  BaseModel.prototype.nonCompliantDataHandler = function (oResponse) {
    this.setEvent({
      sName: 'dataFetched',
      mfetchedData: oResponse
    }, false, true);
  };


  /**
   *
   * @param {Object|String|Array<Object>|Array<String>} data
   * @return {Object|String|Array<Object>}
   */
  BaseModel.prototype.resolveDataArg = function (data) {
    var isArray = fn.isArray(data),
      _data = isArray ? data : [data],
      dataObj = null,
      output = [];

    fn.loopArray.call(this, _data, function loopData(i) {
      dataObj = null;

      if (typeof _data[i] === 'string') {
        dataObj = this.getDataStoreByID(_data[i]);
      } else if (fn.checkData(_data[i])) {
        dataObj = _data[i];
      }

      if (dataObj) {
        output.push(dataObj);
      }
    });

    return isArray ? output : output[0];
  };


  /**
   *
   * @param {String} id
   * @return {Object}
   */
  BaseModel.prototype.getDataStoreByID = function (id) {
    if (typeof id !== 'string') {
      return null;
    }

    return this.getDataStores({ value: id }) || {};
  };


  /**
   * This is wrapper function for .get() and will eventually
   * superseed .get()... so this should be used going forward.
   * - Dylan Aubrey (so24) 6/12/16
   *
   * @param {Object} [args]
   * @param {string} [args.key]
   * @param {any} [args.value]
   * @param {boolean} [args.fetch]
   * @return {Object|Array<Object>|JQueryPromise}
   */
  BaseModel.prototype.getDataStores = function (args) {
    var deferred = null,
      isArray = false,
      itemData = undefined,
      masterDeferred = null,
      paramObj = null;

    if (!args) {
      return this._aDataStores;
    }

    if (args.fetch || args.forceFetch) {
      deferred = $.Deferred();
      masterDeferred = $.Deferred();
    }

    isArray = fn.isArray(args.value);

    paramObj = {
      sSearchKey: args.key || 'id',
      mSearchValue: args.value,
      noFetch: !args.fetch,
      oDeferred: deferred
    };

    if (args.forceFetch) {
      this.fetch(paramObj);
    } else {
      itemData = this.get(paramObj);
    }

    if (args.fetch || args.forceFetch) {
      deferred
        .done(function handleDeferredSuccess(respData) {
          masterDeferred.resolve(respData);
        })
        .fail(function handleDeferredFailure() {
          masterDeferred.resolve(isArray ? [] : {});
        });

      return masterDeferred.promise();
    }

    if (!fn.checkData(itemData)) {
      if (!args.observe) {
        return isArray ? [] : {};
      }

      masterDeferred = $.Deferred();

      this.observe({
        action: 'add',
        callback: function observeCallback(resp) {
          masterDeferred.resolve(resp.data.observe);
        },
        once: true,
        searchValue: args.value
      });

      return masterDeferred.promise();
    }

    return itemData;
  };


  /**
   * This is wrapper function for .add() and will eventually
   * superseed .add()... so this should be used going forward.
   * - Dylan Aubrey (so24) 6/12/16
   *
   * @param {Object|Array<Object>} data
   * @return {this}
   */
  BaseModel.prototype.setDataStores = function (data) {
    this.add(data);
    return this;
  };


  /**
   * This is wrapper function for .remove() and will eventually
   * superseed .remove()... so this should be used going forward.
   * - Dylan Aubrey (so24) 6/12/16
   *
   * @param {Object} args optional
   * @param {String} args.key
   * @param {any} args.value
   * @return {this}
   */
  BaseModel.prototype.unsetDataStores = function (args) {
    if (!args) {
      this._aDataStores = [];
    } else {
      this.remove({ sSearchKey: args.key, mSearchValue: args.value });
    }
    return this;
  };


  /**
   *
   * @param {Object|String} data
   * @param {Object|Array<Object>} links
   * @return {this}
   */
  BaseModel.prototype.setLinks = function (data, links) {
    var _links = fn.isArray(links) ? links : [links],
      itemData = this.resolveDataArg(data);

    if (!fn.isObject(itemData, { notEmpty: true }) || !fn.typeofArrayValues('object', _links)) {
      return this;
    }

    if (!fn.isArray(itemData.links)) {
      itemData.links = [];
    }

    itemData.links = itemData.links.concat(_links);
    this.setDataStores(itemData);
    return this;
  };


  /**
   *
   * @param {Object|String} data
   * @param {String} key
   * @param {any} value
   * @return {this}
   */
  BaseModel.prototype.unsetLinks = function (data, key, value) {
    var itemData = this.resolveDataArg(data),
      links = [];

    if (!fn.isObject(itemData, { notEmpty: true })
        || !fn.isArray(itemData.links, { notEmpty: true })) {
      return this;
    }

    links = itemData.links;

    if (!key && !value) {
      links.splice(0, links.length);
    } else {
      fn.loopArray(links, function loopSkuMedia(i) {
        if (links[i][key] === value) {
          links.splice(i, 1);
        }
      }, { backward: true });
    }

    this.setDataStores(itemData);
    return this;
  };


  return BaseModel;
});
