define('modules/pdp/controllers/PersonaliseController', [
  'domlib',
  'modules/mvc/fn',
  'modules/pdp/controllers/BaseController',
  'modules/pdp/views/PersonaliseView'
], function ($, fn, BaseController, PersonaliseView) {
  'use strict';

  /**
   *
   * @param {Object} model The form handler model.
   * @return {void}
   */
  function PersonaliseController(model) {
    this.sNamespace = 'sku';
    this.sTag = 'personalise';
    this.views = {
      classes: {
        PersonaliseView: PersonaliseView
      }
    };
    this.parent.constructor.call(this, model);
    this.dataCache = {};
  }

  fn.inherit(PersonaliseController, BaseController);

  PersonaliseController.prototype._bindEvents = function () {
    var _this = this;

    $(window).on('resetPersonalisation', function handlePersonalisationReset(event) {
      var skuId = event.oData.skuId;

      _this._getStoredView('PersonaliseView', function (view) {
        var skuData = view.oData.mvc.sku;

        if (_this.sanityCheckData(skuData).objects) {
          if (skuData.id === skuId) {
            _this._resetPersonalisation({ view: view });
          }
        }
      });
    });
  };

  PersonaliseController.prototype.postRenderHook = function (args) {
    var data = args.oView.oData.mvc;

    if ($('.main-content-wrapper').hasClass('media-viewer--portrait')) {
      data.flags.isPortrait = true;
    }

    this.parent.postRenderHook.call(this, args);
  };

  PersonaliseController.prototype._bindViewEvents = function (args) {
    var _this = this,
      PERSONALISE_BTN = '.personalise-button',
      PERSONALISE_LINK = '.edit-personalise-link',
      elements = args.oView.oElms;

    if (elements.personaliseBtn) {
      $(elements.elWrapper).on(
        'click', PERSONALISE_BTN, { view: args.oView }, this._handlePersonalise.bind(this)
      );
    }

    if (elements.editLink) {
      $(elements.elWrapper).on(
        'click', PERSONALISE_LINK, { view: args.oView }, this._handleEdit.bind(this)
      );
    }

    if (!this.getTargetEvents(window, 'panelClosed', 'deletePreviewGuid')) {
      $(window).on('panelClosed.deletePreviewGuid', function deletePreviewGuid(event) {
        if (event.oData.sTag === 'personalise') {
          $.fn.EmaginationJS('Reset', { bPreventInitialisation: true, keepCookie: false });

          if (_this.isObject(_this._activePanel.personalisePreview, true)) {
            _this._activePanel.personalisePreview.destroy(event, { destroyGroup: true });
          }
        }
      });
    }
  };

  PersonaliseController.prototype._handlePersonalise = function (event) {
    var dc = this.dataCache = {},
      skuId = event.data.view.oData.mvc.sku.id;

    $(event.currentTarget).addClass('submitting');

    dc.isEditMode = false;
    this._activeView = event.data.view;
    dc.personalisation = event.data.view.oData.mvc.sku.personalisation;

    this._renderPersonaliseOverlay({
      skuId: skuId,
      view: event.data.view
    });

    $(event.currentTarget).removeClass('submitting');
  };

  PersonaliseController.prototype._handleEdit = function (event) {
    var _this = this,
      dc = this.dataCache,
      guid = '',
      skuId = event.data.view.oData.mvc.sku.id,
      customData = event.customData || {};

    dc.isEditMode = true;
    this._activeView = event.data.view;
    guid = dc.personalisation.guid;

    if (typeof guid !== 'string') {
      this.renderNotification();
    }

    $(event.currentTarget).addClass('loading');

    $.fn.EmaginationJS('ClonePreview', guid, skuId, function handleClone(data) {
      _this._renderPersonaliseOverlay({
        guid: typeof data.guid === 'string' ? data.guid : guid,
        skuId: skuId,
        view: event.data.view,
        currentTarget: event.currentTarget,
        overlayRenderedCallback: customData.overlayRenderedCallback
      });
    });
  };

  PersonaliseController.prototype._renderPersonaliseOverlay = function (args) {
    var _this = this,
      dc = this.dataCache;

    this.renderOverlay({
      sTag: 'personalise',
      sClassNames: 'personalise-overlay',
      oStyles: {
        allDesktops: ['lightbox', 'fullScreen'],
        allDevices: ['slideIn-left', 'fullScreen']
      },
      sTitle: 'Personalise',
      sOverlayContent: '<div class="emagination-wrapper"></div>',
      toDestroyOnClose: true,
      callback: function overlayRenderedCallback() {
        var EMAGINATION_SELECTOR = '.emagination-wrapper';

        if (typeof args.overlayRenderedCallback === 'function') {
          args.overlayRenderedCallback();
        }

        if (dc.isEditMode) {
          $(args.currentTarget).removeClass('loading');
        }

        $(EMAGINATION_SELECTOR).EmaginationJS({
          APIUrl: dc.personalisation.APIUrl,
          AuthCode: dc.personalisation.authCode,
          PreviewGuid: args.guid,
          ImageQuality: 75,
          ImageFormat: 'JPEG',
          ProductName: args.skuId,
          onReady: function (opts) {
            dc = _this.dataCache;
            dc.guid = $(opts.elements.PreviewGuidInput).val();
            dc.emagination = opts;
            dc.layerUpdated = true;

            if (dc.isEditMode) {
              $(dc.emagination.elements.ResetButton).removeClass('disabled');
            }

            $(dc.emagination.elements.PreviewButton)
              .off()
              .on('click.personalisationPreview', _this._handleImagePreview.bind(_this));

            $(dc.emagination.elements.ResetButton)
              .off()
              .on(
                'click.personalisationReset', { view: args.view },
                _this._handlePersonalisationReset.bind(_this)
              );

            $(dc.emagination.elements.SaveButton).on(
              'click.personalisationSave', { view: args.view },
              _this._handlePersonalisationSave.bind(_this)
            );
          },
          onLayerUpdating: function () {
            $.fn.EmaginationJS('setState', { updating: true });
            $(dc.emagination.elements.PreviewButton).addClass('disabled');
            $(dc.emagination.elements.ControlsBackButton).addClass('disabled');
          },
          onLayerUpdated: function (opts) {
            $.fn.EmaginationJS('setState', { updating: false });
            $(dc.emagination.elements.PreviewButton).removeClass('disabled');
            $(dc.emagination.elements.ControlsBackButton).removeClass('disabled');
            dc.emagination = opts;
            dc.layerUpdated = true;

            if (dc.isEditMode) {
              $(dc.emagination.elements.SaveButton).removeAttr('disabled');
            }
          },
          onTextLayersUpdated: function (opts) {
            dc.emagination = opts;
            $(dc.emagination.elements.SaveButton).removeAttr('disabled');
          },
          onError: function () {
            _this.renderNotification({ callback: function errorCallback() {
              $.fn.EmaginationJS('Reset', { bPreventInitialisation: true, keepCookie: false });
            } });
          },
          onFatalError: function () {
            _this.renderNotification({ callback: function errorCallback() {
              $.fn.EmaginationJS('Reset', { bPreventInitialisation: true, keepCookie: false });
            } });
          },
          onDropZone: function (opts) {
            dc.emagination = opts;

            return {
              scope: _this,
              render: function renderCallback(content) {
                this.renderOverlay({
                  sTag: 'personaliseCropper',
                  sClassNames: 'personalise-cropper-overlay',
                  oStyles: {
                    allDesktops: ['fullBleed', 'fullScreen'],
                    allDevices: ['fullBleed', 'fullScreen']
                  },
                  sOverlayContent: '<div class="emagination-cropper-wrapper"></div>',
                  toDestroyOnClose: true,
                  callback: function cropperOverlayRenderedCallback() {
                    var CONTENT_DIV = '.personalise-cropper-overlay .info-panel-content',
                      LOADER_CLASS = 'with-loader';

                    $(CONTENT_DIV).addClass(LOADER_CLASS);
                    $('.emagination-cropper-wrapper').html(content);
                    $('.EmaginationJS-PhotoCrop').one('load', function hidePreviewLoader() {
                      $(CONTENT_DIV).removeClass(LOADER_CLASS);
                    });
                    $('.personalise-cropper-overlay .info-panel-close-icon').on(
                      'click',
                      function handleCloseIconClick() {
                        $(dc.emagination.elements.Dropzone).removeAttr('disabled');
                      }
                    );
                  }
                });
              },
              close: function closeCallback() {
                this._activePanel.personaliseCropper.close();
              }
            };
          }
        });
      }
    });
  };

  PersonaliseController.prototype._handleImagePreview = function (event) {
    var _this = this,
      dc = this.dataCache,
      CONTENT_DIV = '.personalise-preview-overlay .info-panel-content',
      PREVIEW_IMG = '.emagination-preview',
      LOADER_CLASS = 'with-loader';

    /**
     * Adds loader to content div and bind remove event to image.
     * @return {void}
     */
    function addRemoveLoader() {
      $(CONTENT_DIV).addClass(LOADER_CLASS);
      $(PREVIEW_IMG).one('load', function hidePreviewLoader() {
        $(CONTENT_DIV).removeClass(LOADER_CLASS);
      });
    }

    if ((!dc.layerUpdated || event.currentTarget) && $(event.currentTarget).hasClass('disabled')) {
      return;
    }

    if (this.isObject(this._activePanel.personalisePreview, true)) {
      this._activePanel.personalisePreview.removeContent();
    }

    this._getPreviewImages({
      endpoint: 'GetPreviewImage',
      templatename: dc.emagination.elements.Canvases.filter(':visible').attr('data-set-name'),
      callback: function handleGetPreviewImage(data) {
        dc.layerUpdated = false;

        if (!data.objResult) {
          return;
        }

        _this.renderOverlay({
          sTag: 'personalisePreview',
          sClassNames: 'personalise-preview-overlay',
          oStyles: {
            allDesktops: ['fullBleed', 'fullScreen'],
            allDevices: ['fullBleed', 'fullScreen']
          },
          elTrigger: dc.emagination.elements.PreviewButton,
          sOverlayContent: '<div class="emagination-preview-wrapper">'
              + '<img class="emagination-preview" src="' + data.objResult + '"></div>',
          updateActive: true,
          callback: function overlayRenderedCallback() {
            addRemoveLoader();
          }
        });
      }
    });
  };

  PersonaliseController.prototype._getPreviewImages = function (opts) {
    var _opts = opts || {},
      dc = this.dataCache;

    $.ajax({
      url: dc.personalisation.APIUrl + '/' + _opts.endpoint,
      method: 'POST',
      dataType: 'jsonp',
      data: {
        authcode: dc.personalisation.authCode,
        guid: dc.guid,
        templatename: _opts.templatename,
        imagewidth: _opts.imagewidth || window.currentDocumentWidth,
        previewwatermark: dc.emagination.settings.UseWatermark,
        imagequality: dc.emagination.settings.ImageQuality,
        imagetype: dc.emagination.settings.ImageFormat,
        aspect: _opts.aspect
      }
    }).done(_opts.callback);
  };

  PersonaliseController.prototype._handlePersonalisationSave = function (event) {
    var _this = this,
      dc = this.dataCache,
      viewData = event.data.view.oData.mvc,
      skuId = viewData.sku.id,
      isPortrait = viewData.flags.isPortrait,
      formHandlerId = viewData.sellers.formHandler;

    $(event.currentTarget).addClass('submitting');

    this._getPreviewImages({
      endpoint: 'GetPreviewImages',
      imagewidth: '120',
      aspect: isPortrait ? '3:4' : '4:3',
      callback: function handleGetImages(data) {
        var url = '';

        if (!data.objResult || !_this.isArray(data.objResult, true)) {
          return;
        }

        url = data.objResult[0];
        dc.personalisation.imageURL = url.replace(/(width%3d)(\d{3})/, '$1{width}');
        dc.personalisation.guid = dc.guid;
        dc.personalisation.isPersonalised = true;
        dc.isPortrait = isPortrait;

        _this._addMediaViewerImage();

        _this.oModel.update({
          mSearchValue: skuId,
          sUpdateKey: 'personalisation',
          mUpdateValue: dc.personalisation
        });

        _this.queryModel({
          sNamespace: 'formHandler'
        }).done(function handleQueryModel(model) {
          var refreshPoints = [],
            refreshView = '';

          if (!model) {
            return;
          }

          refreshPoints = event.data.view.oData.mvc.refreshPoints;

          model.update({
            mSearchValue: formHandlerId,
            sUpdateKey: 'oData',
            mUpdateValue: null,
            sUpdatePropKey: 'personalisedGUID',
            mUpdatePropValue: dc.personalisation.guid
          });

          model.update({
            mSearchValue: formHandlerId,
            sUpdateKey: 'oData',
            mUpdateValue: null,
            sUpdatePropKey: 'personalisedImageURL',
            mUpdatePropValue: dc.personalisation.imageURL.replace(
              '{width}', isPortrait ? '90' : '120'
            )
          });

          _this.forLoop(refreshPoints, function loopRefreshPoints(i) {
            if (refreshPoints[i].viewName === 'ItemActionsView') {
              refreshView = refreshPoints[i];
              return true;
            }
            return undefined;
          });

          _this.setEvent({
            sName: 'refresh',
            sNamespace: refreshView.namespace,
            sTag: refreshView.tag,
            sViewName: refreshView.viewName,
            getView: function getView(view) {
              if (view.sViewId === refreshView.viewId) {
                return true;
              }
              return false;
            },
            mParamData: {
              mvc: { sku: _this.oModel.get({ mSearchValue: skuId }) }
            }
          }, false, true);

          _this._activePanel.personalise.close();

          $(event.currentTarget).removeClass('submitting');
        });
      }
    });
  };

  PersonaliseController.prototype._addMediaViewerImage = function () {
    var _this = this,
      dc = this.dataCache,
      updateEvent = new $.Event('MediaViewer.update'),
      guid = dc.personalisation.guid,
      mainImage = dc.personalisation.imageURL.replace('{width}', dc.isPortrait ? '750' : '1000'),
      thumbImage = dc.personalisation.imageURL.replace('{width}', dc.isPortrait ? '90' : '120');

    if (dc.isEditMode) {
      if (dc.$mainAddedItem && dc.$mainAddedItem.length > 0) {
        dc.$mainAddedItem.find('img').attr('src', mainImage);
      }

      if (dc.$thumbAddedItem && dc.$thumbAddedItem.length > 0) {
        dc.$thumbAddedItem.find('img').attr('src', thumbImage);
      }

      return;
    }

    updateEvent.customData = {
      type: 'add',
      mediaType: 'static',
      isType: { key: 'isStatic', value: true },
      position: 'append',
      items: {
        main: '<li class="static-img"><img src="' + mainImage + '" data-guid="' + guid + '"></li>',
        thumb: '<li class="static-img"><span class="mv-thumbnail"><img src="'
            + thumbImage + '" data-guid="' + guid + '"></li>'
      },
      images: { main: mainImage, thumb: thumbImage },
      classNames: 'static-img',
      callbacks: {
        main: function mainAddMediaCallback($addedItem) {
          dc.$mainAddedItem = $addedItem;

          $($addedItem).on('click', { view: _this._activeView }, function (event) {
            var _event = event;

            _event.customData = {
              overlayRenderedCallback: function () {
                $(_event.currentTarget).removeClass('with-bkg-loader');
              }
            };

            $(_event.currentTarget).addClass('with-bkg-loader');
            _this._handleEdit(_event);
          });
        },
        thumb: function thumbAddMediaCallback($addedItem) {
          dc.$thumbAddedItem = $addedItem;
        }
      }
    };

    $(window).trigger(updateEvent);
  };

  PersonaliseController.prototype._handlePersonalisationReset = function (event) {
    $.fn.EmaginationJS('Reset');
    this._resetPersonalisation({ view: event.data.view });
  };

  PersonaliseController.prototype._resetPersonalisation = function (args) {
    var _this = this,
      dc = {},
      skuId = args.view.oData.mvc.sku.id,
      personalisation = args.view.oData.mvc.sku.personalisation,
      formHandlerId = args.view.oData.mvc.sellers.formHandler;

    this._removeMediaViewerImage();

    dc = this.dataCache = {
      personalisation: {
        APIUrl: personalisation.APIUrl,
        authCode: personalisation.authCode,
        imageURL: null,
        guid: null,
        isPersonalised: false
      },
      isEditMode: false
    };

    this.oModel.update({
      mSearchValue: skuId,
      sUpdateKey: 'personalisation',
      mUpdateValue: dc.personalisation
    });

    this.queryModel({
      sNamespace: 'formHandler'
    }).done(function handleQueryModel(model) {
      var refreshPoints = [],
        refreshView = '';

      if (!model) {
        return;
      }

      refreshPoints = args.view.oData.mvc.refreshPoints;

      model.update({
        mSearchValue: formHandlerId,
        sUpdateKey: 'oData',
        mUpdateValue: null,
        sUpdatePropKey: 'personalisedGUID',
        mUpdatePropValue: ''
      });

      model.update({
        mSearchValue: formHandlerId,
        sUpdateKey: 'oData',
        mUpdateValue: null,
        sUpdatePropKey: 'personalisedImageURL',
        mUpdatePropValue: ''
      });

      _this.forLoop(refreshPoints, function loopRefreshPoints(i) {
        if (refreshPoints[i].viewName === 'ItemActionsView') {
          refreshView = refreshPoints[i];
          return true;
        }
        return undefined;
      });

      _this.setEvent({
        sName: 'refresh',
        sNamespace: refreshView.namespace,
        sViewName: refreshView.viewName,
        sTag: refreshView.tag,
        getView: function getView(view) {
          if (view.sViewId === refreshView.viewId) {
            return true;
          }
          return false;
        },
        mParamData: {
          mvc: { sku: _this.oModel.get({ mSearchValue: skuId }) }
        }
      }, false, true);
    });
  };

  PersonaliseController.prototype._removeMediaViewerImage = function () {
    var _this = this,
      dc = this.dataCache,
      updateEvent = new $.Event('MediaViewer.update'),
      timestamp = 0;

    if (!dc.hasOwnProperty('$mainAddedItem') && !dc.hasOwnProperty('$thumbAddedItem')) {
      return;
    }

    timestamp = dc.$mainAddedItem.data('timestamp');

    updateEvent.customData = {
      type: 'remove',
      position: function positionCallback($itemList) {
        var $items = $itemList.children();

        return _this.forLoop($items, function loopItemList(i) {
          if ($($items[i]).data('timestamp') === timestamp) {
            return $items[i];
          }
          return undefined;
        });
      },
      mediaAsset: function removeMediaAsset(mediaAssets) {
        _this.forLoop(mediaAssets, function loopMediaAssets(i) {
          if (mediaAssets[i].timestamp === timestamp) {
            mediaAssets.splice(i, 1);
          }
        });
      }
    };

    $(window).trigger(updateEvent);
  };

  return PersonaliseController;
});
