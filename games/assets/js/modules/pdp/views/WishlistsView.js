define('modules/pdp/views/WishlistsView', [
  'domlib',
  'modules/mvc/fn',
  'modules/pdp/views/BaseView',
  'modules/custom-dropdown/oo-dropdown'
], function ($, fn, BaseView, customDropdown) {
  'use strict';

  /**
   * Wishlists view constructor sets view's core data and calls parent constructor.
   * @param {Object} oConfig The configuration to populate the view's dynamic properties.
   * @return {void}
   */
  function WishlistsView(oConfig) {
    this.sViewName = 'WishlistsView';
    this.sNamespace = 'wishlists';
    this.sTag = 'wishlists';
    this.sViewClass = 'wishlists-wrapper';
    this.sTemplate = $('#dropdown-wishlists-view-template')[0].innerHTML;
    this.parent.constructor.call(this, oConfig);
  }

  fn.inherit(WishlistsView, BaseView);

  WishlistsView._name = 'WishlistsView';
  WishlistsView.sNamespace = 'wishlists';
  WishlistsView.sTag = '_default';

  WishlistsView.prototype._initDependancies = function () {
    var $Selector = $(this.sSelector),
      oOptions = {
        $container: $(this.oElms.elWrapper),
        defaultNativeWidth: true,
        additionalText: this.oData.mvc.wishlists.defaultWishlistTextValue
      };

    this.oElms.$Select = $Selector.find('select');
    if (this.oElms.$Select.length > 0) {
      customDropdown.init(this.oElms.$Select, oOptions);
    }
  };

  return WishlistsView;
});
