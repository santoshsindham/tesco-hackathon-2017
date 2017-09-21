define('modules/pdp/controllers/ItemActionsController', [
  'domlib',
  'modules/mvc/fn',
  'modules/pdp/controllers/BaseController',
  'modules/pdp/views/ItemActionsView'
], function ($, fn, BaseController, ItemActionsView) {
  /**
   * Controller to manage item action views.
   * @param {Object} model The form handler model.
   * @param {Object} view The personalise view.
   * @return {void}
   */
  function ItemActionsController() {
    this.sNamespace = 'inherit';
    this.sTag = 'itemActions';
    this.views = {
      classes: {
        ItemActionsView: ItemActionsView
      }
    };
    this.parent.constructor.call(this);
  }

  fn.inherit(ItemActionsController, BaseController);

  ItemActionsController.prototype._bindEvents = function () {
    $(window).on(
      'disableItemActions',
      this._handleDisableItemActions.bind(this)
    ).on(
      'enableItemActions',
      this._handleEnableItemActions.bind(this)
    );
  };

  ItemActionsController.prototype._handleDisableItemActions = function (event) {
    var view = this._getItemActionsView(event.oData.listingId);

    if (!view || !document.getElementById(view.sViewId)) {
      this._pendingActions.push(function pendingDisableItemActions() {
        var v = this._getItemActionsView(event.oData.listingId);

        if (v) {
          this._disableItemActions(v);
          return true;
        }
        return false;
      });
    } else {
      this._disableItemActions(view);
    }
  };

  ItemActionsController.prototype._disableItemActions = function (view) {
    this.forLoop(view.oData.aSubViews, function loopSubviews(i) {
      if (view.oData.aSubViews[i].disable) {
        view.oData.aSubViews[i].disable();
      }
    });
  };

  ItemActionsController.prototype._handleEnableItemActions = function (event) {
    var view = this._getItemActionsView(event.oData.listingId);

    if (!view || !document.getElementById(view.sViewId)) {
      this._pendingActions.push(function pendingEnableItemActions() {
        var v = this._getItemActionsView(event.oData.listingId);

        if (v) {
          this._enableItemActions(v);
          return true;
        }
        return false;
      });
    } else {
      this._enableItemActions(view);
    }
  };

  ItemActionsController.prototype._enableItemActions = function (view) {
    this.forLoop(view.oData.aSubViews, function loopSubviews(i) {
      if (view.oData.aSubViews[i].enable) {
        view.oData.aSubViews[i].enable();
      }
    });
  };

  ItemActionsController.prototype._getItemActionsView = function (listingId) {
    return this._getStoredView('ItemActionsView', function getItemActionsView(v) {
      var data = v.oData.mvc;

      if (this.isObject(data.sellers) && data.sellers.id === listingId) {
        return v;
      }
      return null;
    });
  };

  return ItemActionsController;
});
