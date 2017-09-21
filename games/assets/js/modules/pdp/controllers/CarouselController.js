define('modules/pdp/controllers/CarouselController', [], function () {
  'use strict';

  var CarouselController = {},
    _initCarousel = {};

  CarouselController = function ($container) {
    var sCarouselSelector = '.carousel-fullwidth';

    this.$carousel = $container.find(sCarouselSelector);
    _initCarousel(this);
  };

  _initCarousel = function initCarousel(self) {
    var oOptions = {
      itemSelector: '.carousel-items-list > li',
      bIncludePagination: true,
      oPaginationOptions: {
        sHeaderSelector: '.cfw-header',
        sPaginationClass: 'cfw-navigation',
        sPageSelector: '.nav-dot',
        sPageClass: 'nav-dot',
        sSelectedPageClass: 'isSelected',
        sPageButtonClass: 'dot-action',
        breakpointsToAvoidMovingPastLastItem: {
          mobile: {
            paddingToRightOfCarousel: 10
          },
          vTablet: {
            paddingToRightOfCarousel: 0
          }
        }
      },
      elasticBounceOnEmptySwipe: true,
      wiggleStartupCeremony: true,
      bHideNextPreviousIfAllItemsVisible: true,
      bFitsItemWidthsAndPaddingForNumberOfItemsMinusOne: true
    };

    self.$carousel.carousel(oOptions);
  };

  return CarouselController;
});
