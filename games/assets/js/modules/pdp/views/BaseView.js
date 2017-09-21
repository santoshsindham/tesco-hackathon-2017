define('modules/pdp/views/BaseView', [
  'domlib',
  'mustache',
  'modules/mvc/fn',
  'modules/pdp/BaseViewController'
], function ($, mustache, fn, BaseViewController) {
  'use strict';

  /**
   *
   * @param {Object} oConfig
   * @return {void}
   */
  function BaseView(oConfig) {
    // Used for queryModel done callback scoping.
    var _this = this;

    this.type = 'view';
    this.id = this.createUniqueId();

    if (this.sNamespace === 'inherit' && typeof oConfig.sNamespace === 'string') {
      this.sNamespace = oConfig.sNamespace;
      this.inherits = true;
    } else {
      this.inherits = false;
    }

    this.iSubViewCount = oConfig.iSubViewCount || (this.iSubViewCount || 0);

    this.hasData = false;
    this.hasIds = false;

    /**
     * Allows backwards compatibility for any views using the new way of passing data
     * that include views using the legacy way of passing data.
     */
    if (oConfig.mParamData && oConfig.mParamData.hasOwnProperty('mvc')) {
      this._hasDataObjects(oConfig.mParamData.mvc[this.sNamespace]);
      this.mParamData = oConfig.mParamData.mvc[this.sNamespace] || null;
    } else {
      this._hasDataObjects(oConfig.mParamData);
      this.mParamData = oConfig.mParamData || null;
    }

    this.oElms = {
      elWrapper: null,
      elTarget: oConfig.elTarget || null,
      elTrigger: oConfig.elTrigger || null
    };
    this.sKeyId = oConfig.sKeyId || oConfig.id || this.id;
    this.sViewId = this.sViewClass + '-' + this.sKeyId;
    this.sSelector = (oConfig.hasNoId || this.hasNoId)
        ? '.' + this.sViewClass
        : '#' + this.sViewId;
    this.sOutput = oConfig.sOutput || (this.sOutput || 'outer');

    if (this.isMVC) {
      this.sTemplate = $(this.sTemplate)[0].innerHTML;
    }

    this._activePanel = {};

    this.oData = {
      sViewId: this.sViewId,
      sViewClass: this.sViewClass,
      tag: this.sTag,
      sClassNames: this.sClassNames || '',
      mViewData: {},
      aSubViews: [],
      // NOTE: added below props to prepare for react integration.
      state: {},
      props: {},
      views: {},
      // ends...
      oEvent: this._setRenderedEvent(),
      addViewDataAttr: function () {
        window.oAppController.oPageController.views[_this.sViewId] = _this;

        return '<script>(function (id) {'
            + 'if (window.oAppController.oPageController.views[id]) {'
            + 'var _this = window.oAppController.oPageController.views[id],'
            + 'selector = "#" + _this.sViewId;'
            + '$(selector).data("mvc-self", _this);'
            + 'window.oAppController.oPageController.views[id] = null'
            + '}'
            + '})("' + _this.sViewId + '")</script>';
      }
    };

    if (oConfig.oData) {
      $.extend(true, this.oData, oConfig.oData);
    }

    /**
     * Adds style attributes to the view's wrapper DOM element.
     */
    if (!this.oStyles) {
      this.oStyles = {};
    }

    this._setStyleProps(oConfig.oStyles);

    /**
     * New flags object to be used for all view specific Boolean checks. Data specific
     * Boolean checks should be added to the data object being passed into the view and
     * not onto the flags object.
     * @type {Object}
     */
    this.flags = oConfig.flags || {};

    if (!this.flags.views) {
      this.flags.views = {};
    }

    if (!this.flags.data) {
      this.flags.data = {};
    }

    this.flags.data.objects = false;
    this.flags.data.ids = false;

    if (!this.flags.required) {
      this.flags.required = {};
    }

    this.flags.required.model = oConfig.modelRequired || true;

    /**
     * If the mParamData object has the property 'mvc', it means the view is not using the
     * legacy way of passing data between views.
     */
    if (oConfig.mParamData && oConfig.mParamData.hasOwnProperty('mvc')) {
      /**
       * New data object to allow access to new data in mustache templates.
       * @type {Object}
       */
      this.oData.mvc = oConfig.mParamData.mvc;
      this.flags.data = this.sanityCheckData(this.oData.mvc[this.sNamespace]);

      if (!this.oData.mvc.info) {
        this.oData.mvc.info = {};
      }

      if (!this.oData.mvc.custom) {
        this.oData.mvc.custom = {};
      }

      if (!this.oData.mvc.flags) {
        this.oData.mvc.flags = {};
      }
    }

    /**
     * If a view's model was not passed through from the parent view in the config,
     * run the query model method to get the view's model. Note: this is a bit messy because
     * it has to support legacy flow as well.
     */
    if (this.flags.required.model && !oConfig.oModel) {
      this.queryModel({
        sNamespace: this.sNamespace
      }).done(function (oQueryData) {
        _this.oModel = oQueryData;

        if ((_this.flags.data.ids && _this.flags.required.data !== false) || _this.hasIds) {
          _this._getData();
        }
      });
    } else {
      this.oModel = oConfig.oModel;

      if ((_this.flags.data.ids && _this.flags.required.data !== false) || _this.hasIds) {
        this._getData();
      }
    }

    if (this.flags.required.data !== false && this._bindEventsPreRender !== undefined) {
      this._bindEventsPreRender();
    }

    if (this.isObject(this.oData.mvc, true)) {
      this._compileData(this.oData.mvc);
    }
  }

  fn.inherit(BaseView, BaseViewController);

  /**
   * Takes styles added to a viewport group and adds them to each viewport.
   * @param {Object} oConfigStyles A object of styles per viewport group to be broken down into each
   *   viewport.
   * @return {void}
   */
  BaseView.prototype._setStyleProps = function (oConfigStyles) {
    var _oStyles = oConfigStyles
        ? $.extend(true, {}, this.oStyles, oConfigStyles)
        : this.oStyles;

    if (this.isObject(_oStyles, true)) {
      if (_oStyles.allDesktops) {
        _oStyles.desktop = this.mergeArraysUnique(_oStyles.desktop || [], _oStyles.allDesktops);
        _oStyles.largedesktop = this.mergeArraysUnique(
          _oStyles.largedesktop || [], _oStyles.allDesktops
        );
        _oStyles.allDesktops = null;
      }

      if (_oStyles.allDevices) {
        _oStyles.mobile = this.mergeArraysUnique(_oStyles.mobile || [], _oStyles.allDevices);
        _oStyles.vtablet = this.mergeArraysUnique(_oStyles.vtablet || [], _oStyles.allDevices);
        _oStyles.htablet = this.mergeArraysUnique(_oStyles.htablet || [], _oStyles.allDevices);
        _oStyles.allDevices = null;
      }

      this.oStyles = _oStyles;
      this._addStyleClasses();
    }
  };

  /**
   * Adds the style classes for each viewport to the view's outer DOM element suffixed with the
   * viewport they are applicable for.
   * @return {void}
   */
  BaseView.prototype._addStyleClasses = function () {
    if (this.oStyles) {
      this.forInLoop(this.oStyles, function (sProp) {
        if (this.isArray(this.oStyles[sProp], true)) {
          this.forLoop(this.oStyles[sProp], function (i) {
            this.oData.sClassNames += ' ' + this.oStyles[sProp][i] + '-' + sProp;
          });
        }
      });
    }
  };

  BaseView.prototype.createSubView = function (oParams) {
    var oSubView = new oParams.ViewClass(oParams.mParamData);

    this.oData.aSubViews.push(oSubView);
    this.iSubViewCount += 1;

    return oSubView;
  };

  BaseView.prototype._hasDataObjects = function (mData) {
    if ((this.isArray(mData, true) && this.isObject(mData[0], true))
        || this.isObject(mData, true)) {
      this.hasData = true;
      this.hasIds = null;
      return true;
    } else if ((this.isArray(mData, true)
          && typeof mData[0] === 'string' && mData[0].length > 0)
        || (typeof mData === 'string' && mData.length > 0)) {
      this.hasIds = true;
      return false;
    }

    return undefined;
  };

  /**
   * Gets data from a model attached to a view and add the data to the view's data object.
   * The method offers backward compatibility with new and legacy flows.
   * @return {void}
   */
  BaseView.prototype._getData = function () {
    var flags = {},
      isLegacy = this.oData.hasOwnProperty('mvc') === false,
      mSearchValue = isLegacy ? this.mParamData : this.oData.mvc[this.sNamespace],
      oModel = this.oModel.model || this.oModel,
      mOutput = oModel.get({
        sSearchKey: 'id',
        mSearchValue: mSearchValue,
        noFetch: true
      });

    flags = this.sanityCheckData(mOutput);

    if (flags.objects) {
      this.flags.data = flags;

      if (!isLegacy) {
        this.oData.mvc[this.sNamespace] = mOutput;
      }

      this.mParamData = mOutput;
    }
  };

  /**
   * Compiles a sub view and returns the instance of the sub view class.
   * @param {Object} params The sub view class and range value.
   * @return {Object} The initialised sub view.
   */
  BaseView.prototype._compileSubView = function (params) {
    var ClsSubView = params._class,
      _flags = params.flags || {},
      _dataFlag = _flags.data || {},
      _dataRequiredFlag = _dataFlag.required || false,
      SubviewNamespace = ClsSubView.sNamespace,
      doNamespacesMatch = false,
      toInherit = false,
      sParentNamespace = '',
      mvcData = params.mvcData ? params.mvcData : this.deepCopy(this.oData.mvc),
      _mvcData = null,
      sClass = '';

    /**
     * If the sub view class function does not have a namespace it is using the old way of
     * passing data and this method should not be used to initialise the sub view.
     */
    if (!SubviewNamespace) {
      return '';
    }

    if (SubviewNamespace === 'inherit') {
      if (params.namespace) {
        SubviewNamespace = params.namespace;
      } else {
        SubviewNamespace = this.sNamespace;
      }

      toInherit = true;
    }

    /**
     * If data property is passed into the method and that value is falsy or an empty array
     * when there is no data to render and we should not compile the view.
     */
    if (params.hasOwnProperty('data')
        && !params.force
        && (!params.data || (Array.isArray(params.data) && !params.data.length))) {
      return '';
    }

    if (params.index) {
      mvcData[this.sNamespace] = params.index;
    }

    doNamespacesMatch = SubviewNamespace === this.sNamespace;

    /**
     * If the sub view class and the current view object do not have the same namespace then
     * the data structure needs to be manipulated before being passed through.
     */
    if (!doNamespacesMatch) {
      if (!mvcData.hasOwnProperty(SubviewNamespace)) {
        mvcData[SubviewNamespace] = null;

        /**
         * If the current view data has the property of the child view's data, then add that
         * data to the newly created property, except when data has been passed into the method.
         */
        if (mvcData[this.sNamespace].hasOwnProperty(SubviewNamespace)) {
          mvcData[SubviewNamespace] = mvcData[this.sNamespace][SubviewNamespace];
          sParentNamespace = this.sNamespace;
        }
      }
    }

    /**
     * If data has been passed into the method, add it to the namespace property.
     */
    if (params.data) {
      mvcData[SubviewNamespace] = params.data;
    }

    /**
     * Now the data structure will be flat, i.e. the namespaces of 'products' and
     * 'sellers' will both be properties of the mvcData object.
     */

    /**
     * If an mIndex value was provided, it means the mvcData property that matches the
     * sub view's namespace must be an array. Therefore, take the index value(s) and
     * assign them to the property value.
     */
    if (typeof params.range === 'number') {
      _mvcData = mvcData[SubviewNamespace][params.range];
      mvcData[SubviewNamespace] = _mvcData;
    } else if (this.isArray(params.range, true)) {
      _mvcData = [];
      /**
       * If 99 is provided as the second array value, the method takes that as meaning
       * an array of two values has been provided, signifying a range. The range is from
       * the first index to the end of the array.
       */
      if (params.range.indexOf(-1) === 1) {
        this.forLoop(mvcData[SubviewNamespace], function (i) {
          _mvcData.push(mvcData[SubviewNamespace][i]);
        }, params.range[0]);
      } else {
        /**
         * Otherwise, the method will just retreive the values at the indexes provided.
         */
        this.forLoop(params.range, function (j) {
          _mvcData.push(mvcData[SubviewNamespace][params.range[j]]);
        });
      }

      mvcData[SubviewNamespace] = _mvcData;
    }

    /**
     * If the value of the sub view namespace's property is falsly or is an empty array,
     * and the ctlr flag is falsy, return an empty string.
     */
    if (_dataRequiredFlag !== false) {
      if (!params.ctlr
          && !params.force
          && (!mvcData[SubviewNamespace]
          || (this.isArray(mvcData[SubviewNamespace])
              && mvcData[SubviewNamespace].length === 0))) {
        return '';
      }
    }


    if (toInherit) {
      mvcData.inherit = mvcData[SubviewNamespace];
    } else {
      mvcData.inherit = null;
    }

    this.iSubViewCount += 1;

    if (typeof params.dataCallback === 'function') {
      mvcData = params.dataCallback(mvcData);
    }

    /**
     * If the controller flag is truthy, fire a trigger render so that the view's controller can
     * take over, get the data, create the view and then inject the markup into the placeholder.
     */
    if (params.ctlr) {
      sClass = sParentNamespace
          ? ClsSubView._name + '-' + mvcData[this.sNamespace].id + '-placeholder'
          : ClsSubView._name + '-placeholder';

      return this._triggerRender({
        sClass: sClass,
        sNamespace: SubviewNamespace,
        sTag: params.tag || ClsSubView.sTag,
        sViewName: ClsSubView._name,
        filterOptions: params.filterOptions,
        flags: params.flags,
        inherits: toInherit,
        oData: {
          sClassNames: params.className,
          state: params.state
        },
        mParamData: { mvc: mvcData },
        sTemplate: params.template,
        ctlr: params.ctlr
      });
    }

    /**
     * NOTE: this is a hack to get view refreshing working, we need to look at this going forward.
     */
    if (params.returnData) {
      return { mvc: mvcData };
    }

    return new ClsSubView({
      sNamespace: SubviewNamespace,
      sTag: params.tag,
      // Assign data to mvc object os sub view knows how to deal with it.
      mParamData: { mvc: mvcData },
      // If some namespace, pass model to sub view.
      oModel: doNamespacesMatch ? this.oModel : null,
      flags: params.flags,
      oData: {
        sClassNames: params.className,
        state: params.state
      },
      sTemplate: params.template
    });
  };

  BaseView.prototype._triggerRender = function (oParams) {
    var sUniqueId = this.createUniqueId(),
      sClass = oParams.sClass + '-' + sUniqueId,
      sSelector = '.' + sClass,
      oEvent = this.setEvent({
        sName: 'render',
        sNamespace: oParams.sNamespace,
        sTag: oParams.sTag,
        sViewName: oParams.sViewName,
        filterOptions: oParams.filterOptions,
        flags: oParams.flags,
        inherits: oParams.inherits,
        oData: oParams.oData,
        elTarget: sSelector,
        sOutput: oParams.sOutput || 'outer',
        mParamData: oParams.mParamData || null,
        sTemplate: oParams.sTemplate
      }, false, false),
      sScript = '<script>(function (sId) {'
          + '$(window).trigger('
          + 'window.oAppController.oEventStore[sId]'
          + ');'
          + 'window.oAppController.oEventStore[sId] = null;'
          + '})("' + sUniqueId + '")</script>';

    window.oAppController.oEventStore[sUniqueId] = oEvent;

    return { render: '<div class="' + sClass + '">' + sScript + '</div>' };
  };

  BaseView.prototype.render = function (params) {
    var _this = this,
      _params = params || {},
      sHtml = '',
      elTarget = _params.elTarget || this.oElms.elTarget,
      sOutput = _params.sOutput || this.sOutput,
      mParamData = _params.mParamData || this.mParamData,
      toAddSubViews = this._addSubViews !== undefined;

    if (this.isObject(_params.mParamData, true) && _params.mParamData.hasOwnProperty('mvc')) {
      mParamData.setData = true;
    }

    if (elTarget === 'self') {
      elTarget = $(this.sSelector);
    }

    /**
     * Set the rendered event to null so that if you are re-rendering a view, you do not have
     * to have all the post-render methods running if you don't require them.
     */
    if (_params.newEvent) {
      this.oData.oEvent = this._setRenderedEvent();
    }

    /**
     * If the property observe is passed into the render function with a value of true,
     * then we will check if the view has the necessary data objects to render and if not the
     * view will query its model and try and re-render. This is recursive.
     */
    if (_params.observe) {
      if (this.flags.data.ids && !this.flags.data.objects) {
        this._getData();

        if (this.flags.data.ids && !this.flags.data.objects) {
          this.oModel.observe({
            searchKey: 'id',
            searchValue: this.oData.mvc[this.sNamespace],
            action: 'add',
            once: true,
            callback: function (resp) {
              var flags = _this.sanityCheckData(resp.data.observe);

              if (flags.objects) {
                _this.flags.data = flags;
                _this.oData.mvc[_this.sNamespace] = resp.data.observe;
                _this.render();
              } else {
                _this.render({ observe: true });
              }
            }
          });

          return false;
        }
      }
    }

    this._setData(mParamData);

    if (toAddSubViews) {
      this._addSubViews(mParamData);
    }

    sHtml = mustache.render(this.sTemplate, this.oData);

    if (_params.sourceOutput === 'inner') {
      sHtml = $.parseHTML($.trim(sHtml), document, true)[0].innerHTML;
    }

    if (sOutput === 'none') {
      return false;
    }

    if (elTarget) {
      if (sOutput === 'outer') {
        $(elTarget).replaceWith(sHtml);
      } else if (sOutput === 'inner') {
        $(elTarget).html(sHtml);
      } else if (sOutput === 'append') {
        $(elTarget).append(sHtml);
      } else if (sOutput === 'prepend') {
        $(elTarget).prepend(sHtml);
      }
    }

    this.oData.oEvent = null;
    this.oData.addViewDataAttr = null;

    return sHtml;
  };

  BaseView.prototype._setData = function (params) {
    if (params) {
      if (this.isObject(params, true) && params.setData) {
        this.oData.mvc = params.mvc;
        this._compileData(this.oData.mvc);
      }

      this.oData.mViewData = params;
    }
  };

  BaseView.prototype._compileData = function (data) {
    if (this._setProps) {
      this.mergeObjects(this.oData.props, this._setProps(data), { extend: true, shallow: true });
    }

    if (this._setStates) {
      this.mergeObjects(this.oData.state, this._setStates(data), { extend: true, shallow: true });
    }
  };

  BaseView.prototype._setRenderedEvent = function (isNamespaced) {
    var bNamespace = isNamespaced === true,
      sUniqueId = this.createUniqueId(),
      oEvent = this.setEvent({
        sName: 'rendered',
        sNamespace: this.sNamespace,
        sTag: this.sTag,
        sViewName: this.sViewName,
        oView: this,
        inherits: this.inherits
      }, bNamespace, false),
      sScript = '<script>(function (sId) {'
          + '$(window).trigger('
          + 'window.oAppController.oEventStore[sId]'
          + ');'
          + 'window.oAppController.oEventStore[sId] = null;'
          + '})("' + sUniqueId + '")</script>';

    window.oAppController.oEventStore[sUniqueId] = oEvent;

    return sScript;
  };

  BaseView.prototype.postRenderHook = function () {
    this._cacheDomElms();

    if (this._addAttributes !== undefined) {
      this._addAttributes();
    }

    if (this._bindEvents !== undefined) {
      this._bindEvents();
    }

    if (this._initDependancies !== undefined) {
      this._initDependancies();
    }
  };

  BaseView.prototype._cacheDomElms = function () {
    var $elWrapper = $(this.sSelector);

    if ($elWrapper.length) {
      this.oElms.elWrapper = $elWrapper.get(0);
    }
  };

  BaseView.prototype._hasStyle = function (sSearchValue, sViewport) {
    var bOutput = false;

    if (this.isArray(this.oStyles[sViewport], true)) {
      this.forLoop(this.oStyles[sViewport], function (i) {
        if (this.oStyles[sViewport][i] === sSearchValue) {
          bOutput = true;
        }
      });
    }

    return bOutput;
  };

  BaseView.prototype._setRefreshPoint = function () {
    if (!this.isArray(this.oData.mvc.refreshPoints)) {
      this.oData.mvc.refreshPoints = [];
    }

    this.oData.mvc.refreshPoints.push({
      viewId: this.sViewId,
      viewName: this.sViewName,
      namespace: this.inherits ? 'inherit' : this.sNamespace,
      tag: this.sTag
    });
  };

  /**
   * Wrapper function for binding an event handler that will also trigger an event to check
   * the events already bound to the target and remove any stale events.
   * @param {Object} params The configuration for the method.
   * @return {void}
   */
  BaseView.prototype.bindEvent = function (params) {
    var eventName = params.namespace
        ? params.name + '.' + params.namespace
        : params.name,
      events = undefined;

    /**
     * Loops through the list of events and checks if the selector in the data property is
     * in the DOM. If not, it removes the event from the window.
     * @param {Array} eventList List of events.
     * @return {void}
     */
    function removeStaleEvents(eventList) {
      var j = 0;

      if (!eventList || (Array.isArray(eventList) && !eventList.length)) {
        return;
      }

      j = eventList.length - 1;

      for (; j >= 0; j -= 1) {
        if (eventList[j].data.selector && $(eventList[j].data.selector).length === 0) {
          eventList.splice(j, 1);
        }
      }
    }

    events = this.getTargetEvents(params.target, params.name, params.namespace);

    if (!events) {
      $(params.target).on(
        eventName,
        { selector: '#' + this.sViewId },
        params.method.bind(this)
      );
    }

    if (params.runCleanup !== false) {
      setTimeout(function () {
        removeStaleEvents(events);
      }, 500);
    }
  };

  BaseView.prototype.destroy = function () {
    $(this.sSelector).remove();
  };

  return BaseView;
});
