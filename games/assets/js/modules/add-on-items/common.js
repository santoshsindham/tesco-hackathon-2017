define(['domlib', 'modules/common', 'modules/overlay/common'], function ($, common, overlay) {
  'use strict';

  var addOnItem = {

    addOnToolTipPlp: function () {
      var addOnText = '#add-on-text',
        productClass = '.products',
        addOnClass = '.add-on-item',
        self = addOnItem;

      $(productClass).on('click', function (e) {
        if (e.target.matches('img[alt=add-on-icon]') === true) {
          e.preventDefault();
          e.stopPropagation();
          $(addOnClass + ' ' + addOnText).hide();
          self.showToolTip(e.target, 'li', addOnText);
        } else if ($(e.target).hasClass('close') || $(e.target).hasClass('icon')) {
          e.preventDefault();
          e.stopPropagation();
          self.hideToolTip(e.target, 'li', addOnText);
        }
      });
    },
    showToolTip: function showToolTip(targetNode, nodeElement, className) {
      $(targetNode).closest(nodeElement).find(className).show();
    },
    hideToolTip: function hideToolTip(targetNode, nodeElement, className) {
      $(targetNode).closest(nodeElement).find(className).hide();
    },
    interceptOverlay: function interceptOverlay() {
      $('#basket-checkout, #basket-checkout-mini').on('click', function (e) {
        var interceptContent = $('#interceptContent').html();

        e.preventDefault();
        if ($(e.target).hasClass('intercept-button')) {
          overlay.show({
            content: interceptContent,
            customClass: 'intercept-overlay'
          });
        }
      });
    },
    miniBasket: function miniBasket() {
      $('#basket-flyout-menu').on('click', function (e) {
        if (e.target.id === 'flyout-basket-add-on' && $(e.target).hasClass('disabled')) {
          $('#add-on-tooltip').show();
        } else if ($(e.target).hasClass('close') || $(e.target).hasClass('icon')) {
          $('#add-on-tooltip').hide();
        } else {
          $('#add-on-tooltip').hide();
        }
      });
    },
    init: function init() {
      var self = addOnItem;

      $(document).on('click', function () {
        $('.add-on-item #add-on-text').hide();
      });

      if ($('.add-on-item').length) {
        self.addOnToolTipPlp();
      }
      // self.interceptOverlay();
      self.miniBasket();
    }
  };

  common.init.push(addOnItem.init);

  return addOnItem;
});
