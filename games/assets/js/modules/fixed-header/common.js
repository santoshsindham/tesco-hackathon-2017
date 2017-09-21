/* globals define,require,window,document,setTimeout,clearTimeout */
/* jslint plusplus: true, regexp: true, unparam: true */
define('modules/fixed-header/common', ['domlib', 'modules/breakpoint', 'modules/common', 'modules/smart-menu-hover/common'], function ($, breakpoint, common, SmartMenuHover) {
  'use strict';

  var FixedHeader = function FixedHeader() {
    var pvInit,
      bindEvents,
      toggleHeaderVisibility,
      slideUp,
      slideDown,
      reloadBasketBadge,
      initSmartMenuHoverObjs,
      createJqueryObjs,
      bindInputFocusEvents,
      inputFocusFixedPositionFix,
      removeHeaderFixedPosition,
      addHeaderFixedPosition,
      slideHeaderUpOutOfView,
      slideHeaderDownIntoView,
      findActiveDropdown,
      findActiveScrollPane,
      measureElements,
      resetMeasurements,
      bindWindowResizeEvents,
      bindBreakpointChangeEvent,
      bindScrollEvents,
      calcWindowScrollTop,
      setUnsetHeaderScrollingClass,
      setUnsetHeaderHideNavClass,
      bindNavigationDropdownEvents,
      fixedHeaderNavigationOpenDropdownEventsHandler,
      fixedHeaderNavigationCloseDropdownEventsHandler,
      bindSearchifyDropdownEvents,
      fixedHeaderSearchifyOpenDropdownEventsHandler,
      fixedHeaderSearchifyCloseDropdownEventsHandler,
      bindSearchbarEvents,
      searchbarKeyupEventHandler,
      searchbarFocusEventHandler,
      searchifyscrollEventsHandler,
      closeOpenDropdownsOnSearchFocus,
      searchbarBlurEventHandler,
      searchbarTouchstartEventHandler,
      searchCloseLinkEventHandler,
      searchbarIOSFocusScrollTopFix,
      enableDisableSearchSubmitButton,
      resizeSearchDropdown,
      resetSearchDropdownHeight,
      closeSearchifyDropdownOnEmptyInput,
      addFocusToSearchInputField,
      removeFocusFromSearchInputField,
      slideUpHeaderOnSearchFocus,
      slideDownHeaderOnSearchBlur,
      resizeSearchDropdownOnHidingKeyboard,
      emptySearchInput,
      bindParentLinkEvents,
      parentLinkEventDefaultHandler,
      searchLinkTouchstartEventHandler,
      parentLinkEventMouseEnterHandler,
      parentLinkEventMouseLeaveHandler,
      openDropdown,
      closeDropdown,
      returnClassFromLinkID,
      returnEventFromLinkID,
      closeOpenDropdown,
      loadBasketContent,
      addBasketLoader,
      removeBasketLoader,
      injectBasketContent,
      removeBasketContent,
      calcBasketFlyoutHeights,
      setBasketFlyoutHeight,
      unsetBasketFlyoutHeight,
      setBasketContentHeight,
      unsetBasketContentHeight,
      setBasketContentScroll,
      unsetBasketContentScroll,
      enableBackgroundMask,
      addBackgroundMaskOpacity,
      disableBackgroundMask,
      removeBackgroundMaskOpacity,
      bindBackgroundMaskEvents,
      setFixedHeaderStyles,
      unsetFixedHeaderStyles,
      setCategoryListItemAlignmentFix,
      unsetCategoryListItemAlignmentFix,
      setSearchWrapperHeightFix,
      unsetSearchWrapperHeightFix,
      setFixedHeaderBottomClass,
      unsetFixedHeaderBottomClass,
      setFixedHeaderScrollPaneHeights,
      setFixedHeaderBasketContentHeight,
      unsetFixedHeaderScrollPaneHeights,
      pvAsyncBlockCallbacks,
      deferAsyncCallbackHandler,
      bindRecentlyViewedEvents,
      scrollToRecentlyViewed,
      searchbarSubmitHandler,
      updateBasketBadge,

      oSELECTORS = {
        WRAPPER: '#wrapper',
        HEADER: '#header',
        MASTHEADWRAPPER: '#masthead-wrapper',
        MASTHEAD: '#masthead',
        MENUSEARCHFLYOUTS: '.menu-search-header-flyouts > li',
        ACCOUNTBASKETFLYOUTS: '.account-basket-header-flyouts > li',
        PARENTLINK: '.parent-header-link',
        DROPDOWN: '.header-dropdown',
        MENULINK: '#catalogue-nav-link',
        CATNAV: '#catalogue-nav-wrapper',
        CATNAVBACKLINK: '#catalogue-nav-back-link',
        SEARCHLINK: '#search-link',
        SEARCHWRAPPER: '#search-wrapper',
        SEARCHCLOSELINK: '.search-close-link',
        RESULTSWRAPPER: '#search-results-wrapper',
        SEARCHINPUT: '#search-field',
        SEARCHSUBMIT: '#search-submit',
        ACCOUNTLINK: '#account-link',
        RECENTLYVIEWEDLINK: '.recently-viewed > a',
        RECENTLYVIEWED: '#recently-viewed',
        BASKETLINK: '#basket-link',
        BASKETFLYOUT: '#basket-flyout-menu',
        BASKETCONTENTSWRAPPER: '.basket-flyout-contents-wrapper',
        BASKETCONTENTS: '.basket-flyout-contents',
        BASKETFOOTERWRAPPER: '.basket-flyout-footer-wrapper',
        PAGEMASK: '#page-background-mask',
        SEARCHFORM: '#search-wrapper form',
        BASKETITEMSBADGE: '.basket-items',
        BASKETMENUTITLE: '.menu-title'
      },
      oJQUERYOBJS = {
        $WRAPPER: null,
        $HTML: null,
        $BODY: null,
        $HEADER: null,
        $MASTHEADWRAPPER: null,
        $MASTHEAD: null,
        $PARENTLINK: null,
        $MENULINK: null,
        $CATNAV: null,
        $SEARCHLINK: null,
        $SEARCHWRAPPER: null,
        $SEARCHINPUT: null,
        $SEARCHSUBMIT: null,
        $ACCOUNTLINK: null,
        $BASKETLINK: null,
        $BASKETFLYOUT: null,
        $PAGEMASK: null,
        $SEARCHFORM: null
      },
      oCSSCLASS = {
        TEXTINPUTINFOCUS: 'textInputInFocus',
        OUTOFVIEWTRANSENABLED: 'outOfViewTransEnabled',
        HEADEROUTOFVIEW: 'headerOutOfView',
        DROPDOWNOPEN: 'dropdownOpen',
        CATNAVOPEN: 'catNavOpen',
        SEARCHBAROPEN: 'searchBarOpen',
        ACCOUNTFLYOUTOPEN: 'accountFlyoutOpen',
        BASKETFLYOUTOPEN: 'basketFlyoutOpen',
        BASKETCONTENTSCROLLABLE: 'basketContentScrollable',
        PAGEMASKVISIBLE: 'pageMaskVisible',
        PAGEMASKOPACITY: 'pageMaskOpacity',
        PAGESCROLLING: 'pageScrolling',
        HIDECATNAV: 'hideCatNav',
        FIXHEADERTOBOTTOM: 'fixHeaderToBottom',
        DISABLEBODYSCROLL: 'disableBodyScroll',
        SCROLLTORECENTLYVIEWED: 'scrollToRecentlyViewed',
        BASKETCONTENTLOADING: 'basketContentLoading',
        DISABLED: 'disabled'
      },
      oEVENTS = {
        DROPDOWNOPENSTART: 'dropdownOpenStart',
        DROPDOWNOPENCOMPLETE: 'dropdownOpenComplete',
        DROPDOWNCLOSESTART: 'dropdownCloseStart',
        DROPDOWNCLOSECOMPLETE: 'dropdownCloseComplete',
        NAVIGATIONOPENCOMPLETE: 'catalogNavigationOpenComplete',
        NAVIGATIONCLOSECOMPLETE: 'catalogNavigationCloseComplete',
        SEARCHBAROPENCOMPLETE: 'searchBarOpenComplete',
        SEARCHBARCLOSECOMPLETE: 'searchBarCloseComplete',
        ACCOUNTFLYOUTOPENCOMPLETE: 'accountFlyoutOpenComplete',
        ACCOUNTFLYOUTCLOSECOMPLETE: 'accountFlyoutCloseComplete',
        BASKETFLYOUTOPENCOMPLETE: 'basketFlyoutOpenComplete',
        BASKETFLYOUTCLOSECOMPLETE: 'basketFlyoutCloseComplete'
      },
      oMeasurements = {
        windowHeight: null,
        windowScrollTop: null,
        windowScrollTo: null,
        mastheadHeight: null,
        catNatHeight: null,
        dropdownHeight: null,
        activeScrollPaneOffsetTop: null,
        basketContentsWrapperHeight: null,
        basketFooterWrapperHeight: null,
        recentlyViewedOffsetTop: null
      },
      oTimeouts = {},
      $activeDropdown = null,
      $activeScrollPane = null,
      sFlyoutBasketContentJspURL = null,
      sEventState = 'click',
      bIsTouch = false,
      bIsLegacyPage = false,
      bIsSearchFocus = false,
      bBasketLoaderVisible = false,
      bIsIOS = false,
      bIsHeaderFixed = true,
      isMastheadVisible = true,
      oEvents = {
        slideUp: 'mastheadSlideUp',
        slideDown: 'mastheadSlideDown'
      };

    pvInit = function pvInit(bForceTouch) {
      if ($(oSELECTORS.MASTHEADWRAPPER).length > 0 && $('#wrapper.checkout').length === 0 && $('#wrapper.order-confirmation').length === 0) {
        bIsTouch = bForceTouch === true || window.isKiosk() ? true : common.isTouch();
        bIsLegacyPage = common.isPage('legacy');
        bIsIOS = common.isIOS();
        createJqueryObjs();
        sFlyoutBasketContentJspURL = oJQUERYOBJS.$BASKETLINK.data('flyoutbasketcontenturl');
        $(oSELECTORS.RECENTLYVIEWEDLINK).addClass(oCSSCLASS.DISABLED);
        bindEvents();
        deferAsyncCallbackHandler();
        measureElements(true);

        if (bIsTouch === false) {
          initSmartMenuHoverObjs();
        }

      }
    };

    bindEvents = function bindEvents() {
      if (!bIsTouch) {
        sEventState = 'hover';
      }
      if (!window.isKiosk()) {
        bindScrollEvents();
        bindInputFocusEvents();
      }
      if ((window.isKiosk() && common.isPage('homepage')) === false) {
        bindNavigationDropdownEvents();
        bindWindowResizeEvents();
        bindBreakpointChangeEvent();
        bindRecentlyViewedEvents();
        bindParentLinkEvents();
      }
      bindBackgroundMaskEvents();
      bindSearchifyDropdownEvents();
      bindSearchbarEvents();

      $(window).on(oEvents.slideUp, toggleHeaderVisibility.bind(this))
                .on(oEvents.slideDown, toggleHeaderVisibility.bind(this))
                .on('addToBasketSuccess', updateBasketBadge.bind(this))
                .on('reloadBasketFlyoutBadge', reloadBasketBadge.bind(this));
    };

    toggleHeaderVisibility = function fnToggleHeaderVisibility(e) {
      if (e.type === oEvents.slideUp) {
        slideUp();
      } else if (e.type === oEvents.slideDown) {
        slideDown();
      }
    };

    slideUp = function fnSlideUp() {
      oJQUERYOBJS.$MASTHEADWRAPPER.addClass(oCSSCLASS.OUTOFVIEWTRANSENABLED)
                .addClass(oCSSCLASS.HEADEROUTOFVIEW);

      isMastheadVisible = false;
    };

    slideDown = function fnSlideDown() {
      oJQUERYOBJS.$MASTHEADWRAPPER.removeClass(oCSSCLASS.HEADEROUTOFVIEW);
      oJQUERYOBJS.$MASTHEADWRAPPER.on('transitionend.slideDown', function (e) {
        oJQUERYOBJS.$MASTHEADWRAPPER.addClass(oCSSCLASS.OUTOFVIEWTRANSENABLED);
        oJQUERYOBJS.$MASTHEADWRAPPER.off('transitionend.slideDown');
      });

      isMastheadVisible = true;
    };

    reloadBasketBadge = function fnReloadBasketBadge() {
      $.ajax({
        url: '/direct/blocks/common/flyoutBasketLink.jsp'
      }).done(function (mData, sTextStatus, oJqXHR) {
        $(oSELECTORS.BASKETLINK)[0].outerHTML = mData;
      });
    };

    initSmartMenuHoverObjs = function initSmartMenuHoverObjs() {
      var oSmartMenuHovers = new SmartMenuHover({
        advanced: false,
        delegate: oSELECTORS.MASTHEADWRAPPER,
        target: oSELECTORS.ACCOUNTBASKETFLYOUTS,
        child: oSELECTORS.DROPDOWN,
        position: {
          desktop: 'below'
        }
      });
      oSmartMenuHovers.init();
    };

    createJqueryObjs = function createJqueryObjs() {
      oJQUERYOBJS.$HTML = $('html');
      oJQUERYOBJS.$BODY = $('body');
      oJQUERYOBJS.$WRAPPER = $(oSELECTORS.WRAPPER);
      oJQUERYOBJS.$HEADER = $(oSELECTORS.HEADER);
      oJQUERYOBJS.$MASTHEADWRAPPER = $(oSELECTORS.MASTHEADWRAPPER);
      oJQUERYOBJS.$MASTHEAD = $(oSELECTORS.MASTHEAD);
      oJQUERYOBJS.$MENULINK = $(oSELECTORS.MENULINK);
      oJQUERYOBJS.$CATNAV = $(oSELECTORS.CATNAV);
      oJQUERYOBJS.$SEARCHLINK = $(oSELECTORS.SEARCHLINK);
      oJQUERYOBJS.$SEARCHWRAPPER = $(oSELECTORS.SEARCHWRAPPER);
      oJQUERYOBJS.$SEARCHINPUT = $(oSELECTORS.SEARCHINPUT);
      oJQUERYOBJS.$SEARCHSUBMIT = $(oSELECTORS.SEARCHSUBMIT);
      oJQUERYOBJS.$ACCOUNTLINK = $(oSELECTORS.ACCOUNTLINK);
      oJQUERYOBJS.$BASKETLINK = $(oSELECTORS.BASKETLINK);
      oJQUERYOBJS.$PAGEMASK = $(oSELECTORS.PAGEMASK);
      oJQUERYOBJS.$SEARCHFORM = $(oSELECTORS.SEARCHFORM);
    };

    bindInputFocusEvents = function bindInputFocusEvents() {
      var sInputTypes = 'input[type="text"], input[type="password"], input[type="email"], input[type="tel"]';

      oJQUERYOBJS.$WRAPPER.on('focus.inputFocusFixedPositionFix', sInputTypes, inputFocusFixedPositionFix)
                .on('blur.inputFocusFixedPositionFix', sInputTypes, inputFocusFixedPositionFix);
    };

    inputFocusFixedPositionFix = function inputFocusFixedPositionFix(e) {
      if (!isMastheadVisible || $(e.currentTarget)[0].id === 'search-field'
                || ((breakpoint.largeDesktop || breakpoint.desktop) && bIsIOS === false)) {
        return false;
      }

      if (e.type === 'focusin') {
        if (bIsIOS === true) {
          removeHeaderFixedPosition();
        } else {
          slideHeaderUpOutOfView();
        }
      } else if (e.type === 'focusout') {
        if (bIsIOS === true) {
          addHeaderFixedPosition();
        } else {
          slideHeaderDownIntoView();
        }
      }
    };

    removeHeaderFixedPosition = function removeHeaderFixedPosition() {
      if (bIsHeaderFixed === true) {
        oJQUERYOBJS.$MASTHEADWRAPPER.addClass(oCSSCLASS.TEXTINPUTINFOCUS);
        bIsHeaderFixed = false;
      }
    };

    addHeaderFixedPosition = function addHeaderFixedPosition() {
      if (bIsHeaderFixed === false) {
        oJQUERYOBJS.$MASTHEADWRAPPER.removeClass(oCSSCLASS.TEXTINPUTINFOCUS);
        bIsHeaderFixed = true;
      }
    };

    slideHeaderUpOutOfView = function slideHeaderUpOutOfView() {
      if (bIsHeaderFixed === true) {
        if (oMeasurements.windowScrollTop < oMeasurements.mastheadHeight) {
          oJQUERYOBJS.$MASTHEADWRAPPER.addClass(oCSSCLASS.HEADEROUTOFVIEW)
                        .addClass(oCSSCLASS.TEXTINPUTINFOCUS);

          bIsHeaderFixed = false;
          return;
        }

        if (window.Modernizr.csstransitions === true) {
          oJQUERYOBJS.$MASTHEADWRAPPER.one('transitionend', function () {
            oJQUERYOBJS.$MASTHEADWRAPPER.addClass(oCSSCLASS.TEXTINPUTINFOCUS);
          });
        }

        oJQUERYOBJS.$MASTHEADWRAPPER.addClass(oCSSCLASS.OUTOFVIEWTRANSENABLED)
                    .addClass(oCSSCLASS.HEADEROUTOFVIEW);

        if (window.Modernizr.csstransitions !== true) {
          oJQUERYOBJS.$MASTHEADWRAPPER.addClass(oCSSCLASS.TEXTINPUTINFOCUS);
        }

        bIsHeaderFixed = false;
      }
    };

    slideHeaderDownIntoView = function slideHeaderDownIntoView() {
      if (bIsHeaderFixed === false) {
        if (oMeasurements.windowScrollTop < oMeasurements.mastheadHeight) {
          oJQUERYOBJS.$MASTHEADWRAPPER.removeClass(oCSSCLASS.OUTOFVIEWTRANSENABLED)
                        .removeClass(oCSSCLASS.TEXTINPUTINFOCUS)
                        .removeClass(oCSSCLASS.HEADEROUTOFVIEW);

          bIsHeaderFixed = true;
          return;
        }

        if (window.Modernizr.csstransitions === true) {
          oJQUERYOBJS.$MASTHEADWRAPPER.one('transitionend', function () {
            oJQUERYOBJS.$MASTHEADWRAPPER.removeClass(oCSSCLASS.OUTOFVIEWTRANSENABLED);
          });
        }

        oJQUERYOBJS.$MASTHEADWRAPPER.removeClass(oCSSCLASS.TEXTINPUTINFOCUS)
                    .removeClass(oCSSCLASS.HEADEROUTOFVIEW);

        if (window.Modernizr.csstransitions !== true) {
          oJQUERYOBJS.$MASTHEADWRAPPER.removeClass(oCSSCLASS.OUTOFVIEWTRANSENABLED);
        }

        bIsHeaderFixed = true;
      }
    };

    findActiveDropdown = function findActiveDropdown() {
      $activeDropdown = $(oSELECTORS.DROPDOWN).filter('.dropdownOpen');
    };

    findActiveScrollPane = function findActiveScrollPane() {
      if (oJQUERYOBJS.$MASTHEADWRAPPER.data(oCSSCLASS.CATNAVOPEN) === true) {
        if (breakpoint.desktop || breakpoint.largeDesktop) {
          $activeScrollPane = $('.header-dropdown.dropdownOpen .fixedHeaderScrollPaneDesktop');
        } else {
          $activeScrollPane = $('.header-dropdown.dropdownOpen.fixedHeaderScrollPaneDevices');
        }
      } else {
        $activeScrollPane = $('.header-dropdown.dropdownOpen .fixedHeaderScrollPane');
      }
    };

    measureElements = function measureElements(isViewChange) {
      oMeasurements.mastheadHeight = oJQUERYOBJS.$MASTHEADWRAPPER.outerHeight(true) - oJQUERYOBJS.$CATNAV.outerHeight(true);
      oJQUERYOBJS.$MASTHEADWRAPPER.data('outerHeight', oMeasurements.mastheadHeight);

      if (isViewChange) {
        oMeasurements.catNatHeight = oJQUERYOBJS.$CATNAV.outerHeight(true);
      } else {
        oMeasurements.windowScrollTop = calcWindowScrollTop();
        oMeasurements.windowHeight = window.innerHeight || document.documentElement.clientHeight;
        oMeasurements.dropdownHeight = $activeDropdown.outerHeight(true) + $activeDropdown.offset().top - oMeasurements.windowScrollTop;
        oMeasurements.activeScrollPaneOffsetTop = $activeScrollPane.offset().top - oMeasurements.windowScrollTop;
      }
    };

    resetMeasurements = function resetMeasurements() {
      var prop;
      for (prop in oMeasurements) {
        if (oMeasurements.hasOwnProperty(prop)) {
          prop = null;
        }
      }
    };

    bindWindowResizeEvents = function bindWindowResizeEvents(e) {
      $(window).on('resize', function fixedHeaderWindowResizeEventsHandler(e) {
        setTimeout(function () {
          resizeSearchDropdownOnHidingKeyboard();
        }, 400);
      });
    };

    bindBreakpointChangeEvent = function bindBreakpointChangeEvent(e) {
      $(window).on('breakpointChange', function breakpointChangeHandler(e) {
        closeOpenDropdown(false);
        emptySearchInput();
        if (oJQUERYOBJS.$MASTHEADWRAPPER.data(oCSSCLASS.PAGEMASKVISIBLE) === true) {
          disableBackgroundMask();
        }
        resetMeasurements();
        setTimeout(function () {
          measureElements(true);
        }, 300);
      });
    };

    bindScrollEvents = function bindScrollEvents() {
      if (!common.isBrowserIE()) {
        $(document).on('scroll.bindFixedHeaderScrollEventsHandler', function bindFixedHeaderScrollEventsHandler(e) {
          setTimeout(function fixedHeaderScrollHandlerInt() {
            oMeasurements.windowScrollTop = calcWindowScrollTop();
            setUnsetHeaderScrollingClass();
            if (breakpoint.desktop || breakpoint.largeDesktop) {
              setUnsetHeaderHideNavClass();
            }
          }, 0);
        });
      }
    };

    calcWindowScrollTop = function calWindowScrollTop() {
      return $(window).scrollTop();
    };

    setUnsetHeaderScrollingClass = function setUnsetHeaderScrollingClass() {
      if (oMeasurements.windowScrollTop > 1) {
        oJQUERYOBJS.$MASTHEADWRAPPER.addClass(oCSSCLASS.PAGESCROLLING)
                    .data(oCSSCLASS.PAGESCROLLING, true);
      } else {
        if (oJQUERYOBJS.$MASTHEADWRAPPER.data(oCSSCLASS.FIXHEADERTOBOTTOM) !== true) {
          oJQUERYOBJS.$MASTHEADWRAPPER.removeClass(oCSSCLASS.PAGESCROLLING)
                        .data(oCSSCLASS.PAGESCROLLING, false);
        }
      }
    };

    setUnsetHeaderHideNavClass = function setUnsetHeaderHideNavClass() {
      if (oJQUERYOBJS.$CATNAV.data(oCSSCLASS.CATNAVOPEN) !== true) {
        if (oMeasurements.windowScrollTop > oMeasurements.catNatHeight) {
          oJQUERYOBJS.$MASTHEADWRAPPER.addClass(oCSSCLASS.HIDECATNAV)
                        .data(oCSSCLASS.HIDECATNAV, true);
          oJQUERYOBJS.$CATNAV.addClass(oCSSCLASS.HIDECATNAV);
        } else {
          if (oJQUERYOBJS.$BODY.data(oCSSCLASS.DISABLEBODYSCROLL) !== true || bIsLegacyPage === true) {
            oJQUERYOBJS.$MASTHEADWRAPPER.removeClass(oCSSCLASS.HIDECATNAV)
                            .data(oCSSCLASS.HIDECATNAV, false);
            oJQUERYOBJS.$CATNAV.removeClass(oCSSCLASS.HIDECATNAV);
          }
        }
      }
    };

    bindParentLinkEvents = function bindParentLinkEvents() {
      if (sEventState === 'click') {
        oJQUERYOBJS.$MASTHEADWRAPPER.on(sEventState, oSELECTORS.PARENTLINK, parentLinkEventDefaultHandler.bind(this))
                    .on('touchstart.searchLinkTouchstartEventHandler', oSELECTORS.SEARCHLINK, searchLinkTouchstartEventHandler);
      } else {
        oJQUERYOBJS.$MASTHEADWRAPPER.on('click', oSELECTORS.PARENTLINK, parentLinkEventDefaultHandler.bind(this))
                    .on('mouseenter', oSELECTORS.MENUSEARCHFLYOUTS, parentLinkEventMouseEnterHandler.bind(this))
                    .on('mouseleave', oSELECTORS.MENUSEARCHFLYOUTS, parentLinkEventMouseLeaveHandler.bind(this))
                    .on('smartMenuHover.mouseenter', oSELECTORS.ACCOUNTBASKETFLYOUTS, parentLinkEventMouseEnterHandler.bind(this))
                    .on('smartMenuHover.mouseleave', oSELECTORS.ACCOUNTBASKETFLYOUTS, parentLinkEventMouseLeaveHandler.bind(this));
      }
    };

    parentLinkEventDefaultHandler = function parentLinkEventDefaultHandler(e) {
      var $dropdown = $(e.currentTarget).siblings(oSELECTORS.DROPDOWN);

      e.preventDefault();

      if (sEventState === 'hover') {
        return;
      }

      if ($dropdown.data(oCSSCLASS.DROPDOWNOPEN) === true) {
        closeDropdown($(e.currentTarget), $dropdown, true);

        if ($(e.currentTarget)[0].id === 'search-link') {
          removeFocusFromSearchInputField();
        }
      } else {
        if ($(e.currentTarget)[0].id === 'basket-link') {
          loadBasketContent($(e.currentTarget), $dropdown);
        } else {
          openDropdown($(e.currentTarget), $dropdown);
        }

        if ($(e.currentTarget)[0].id === 'search-link') {
          addFocusToSearchInputField();
        }
      }
    };

    searchLinkTouchstartEventHandler = function searchLinkTouchstartEventHandler() {
      searchbarIOSFocusScrollTopFix();
    };

    parentLinkEventMouseEnterHandler = function parentLinkEventMouseEnterHandler(e) {
      var $link = $(e.currentTarget).children(oSELECTORS.PARENTLINK),
        $dropdown = $(e.currentTarget).children(oSELECTORS.DROPDOWN);

      if (breakpoint.desktop || breakpoint.largeDesktop) {
        if ($link[0].id === 'basket-link' || $link[0].id === 'account-link') {
          clearTimeout(oTimeouts.closeDropdown);

          if ($link[0].id === 'basket-link') {
            loadBasketContent($link, $dropdown);
          } else if ($link[0].id === 'account-link') {
            openDropdown($link, $dropdown);
          }
        }
      } else {
        clearTimeout(oTimeouts.closeDropdown);

        if ($link[0].id === 'basket-link') {
          loadBasketContent($link, $dropdown);
        } else {
          openDropdown($link, $dropdown);
        }
      }
    };

    parentLinkEventMouseLeaveHandler = function parentLinkEventMouseLeaveHandler(e) {
      var $link = $(e.currentTarget).children(oSELECTORS.PARENTLINK),
        $dropdown = $(e.currentTarget).children(oSELECTORS.DROPDOWN);

      if (breakpoint.desktop || breakpoint.largeDesktop) {
        if ($link[0].id === 'basket-link' || $link[0].id === 'account-link') {
          oTimeouts.closeDropdown = setTimeout(function () {
            closeDropdown($link, $dropdown, true);
          }, 300);
        }
      } else {
        oTimeouts.closeDropdown = setTimeout(function () {
          closeDropdown($link, $dropdown, true);
        }, 600);
      }
    };

    bindNavigationDropdownEvents = function bindNavigationDropdownEvents() {
      oJQUERYOBJS.$MASTHEADWRAPPER.on('openNavigationDropdown', fixedHeaderNavigationOpenDropdownEventsHandler)
                .on('closeNavigationDropdown', fixedHeaderNavigationCloseDropdownEventsHandler);
    };

    fixedHeaderNavigationOpenDropdownEventsHandler = function fixedHeaderNavigationOpenDropdownEventsHandler(e) {
      openDropdown($(oSELECTORS.MENULINK), oJQUERYOBJS.$CATNAV);
    };

    fixedHeaderNavigationCloseDropdownEventsHandler = function fixedHeaderNavigationCloseDropdownEventsHandler(e) {
      closeDropdown($(oSELECTORS.MENULINK), oJQUERYOBJS.$CATNAV, true);
    };

    bindSearchifyDropdownEvents = function bindSearchbarDropdownEvents() {
      oJQUERYOBJS.$MASTHEADWRAPPER.on('openSearchifyDropdown', fixedHeaderSearchifyOpenDropdownEventsHandler)
                .on('closeSearchifyDropdown', fixedHeaderSearchifyCloseDropdownEventsHandler);
    };

    fixedHeaderSearchifyOpenDropdownEventsHandler = function fixedHeaderSearchifyOpenDropdownEventsHandler(e) {
      if (oJQUERYOBJS.$MASTHEADWRAPPER.data(oCSSCLASS.SEARCHBAROPEN) !== true) {
        openDropdown($(oSELECTORS.SEARCHLINK), oJQUERYOBJS.$SEARCHWRAPPER);
        resizeSearchDropdown();
      }
    };

    fixedHeaderSearchifyCloseDropdownEventsHandler = function fixedHeaderSearchifyCloseDropdownEventsHandler(e) {
      if (breakpoint.desktop || breakpoint.largeDesktop || window.isKiosk()) {
        closeDropdown($(oSELECTORS.SEARCHLINK), oJQUERYOBJS.$SEARCHWRAPPER, true);
      } else {
        if (oJQUERYOBJS.$MASTHEADWRAPPER.data(oCSSCLASS.FIXHEADERTOBOTTOM) === true) {
          unsetFixedHeaderStyles('search-link');
        }
        resetSearchDropdownHeight();
      }
    };

    bindSearchbarEvents = function bindSearchbarEvents() {
      oJQUERYOBJS.$MASTHEADWRAPPER.on('keyup.searchbarKeyupEventHandler', oSELECTORS.SEARCHINPUT, searchbarKeyupEventHandler)
                .on('focus.searchbarFocusEventHandler', oSELECTORS.SEARCHINPUT, searchbarFocusEventHandler)
                .on('blur.searchbarBlurEventHandler', oSELECTORS.SEARCHINPUT, searchbarBlurEventHandler)
                .on('touchstart.searchbarTouchstartEventHandler', oSELECTORS.SEARCHINPUT, searchbarTouchstartEventHandler)
                .on('click.searchCloseLinkEventHandler', oSELECTORS.SEARCHCLOSELINK, searchCloseLinkEventHandler);
      $(oSELECTORS.RESULTSWRAPPER).on('touchstart.searchifyscrollEventsHandler', searchifyscrollEventsHandler);
      oJQUERYOBJS.$SEARCHFORM.on('submit.searchbarSubmitHandler', searchbarSubmitHandler);
    };

    searchbarSubmitHandler = function searchbarSubmitHandler(e) {
      if ($.trim(oJQUERYOBJS.$SEARCHINPUT.val()) === '') {
        e.preventDefault();
      }
    };

    searchbarKeyupEventHandler = function searchbarKeyupEventHandler() {
      resizeSearchDropdown();
      closeSearchifyDropdownOnEmptyInput();
    };

    searchbarFocusEventHandler = function searchbarFocusEventHandler(e) {
      closeOpenDropdownsOnSearchFocus();
      bIsSearchFocus = true;
    };

    searchbarBlurEventHandler = function searchbarBlurEventHandler() {
      bIsSearchFocus = false;
    };

    searchbarTouchstartEventHandler = function searchbarTouchstartEventHandler() {
      searchbarIOSFocusScrollTopFix();
    };

    searchCloseLinkEventHandler = function searchCloseLinkEventHandler(e) {
      e.preventDefault();
      closeDropdown($(oSELECTORS.SEARCHLINK), $(oSELECTORS.SEARCHWRAPPER), true);
    };

    searchifyscrollEventsHandler = function searchifyscrollEventsHandler() {
      if (oJQUERYOBJS.$SEARCHWRAPPER.data('searchifyOpen') === true) {
        if (bIsSearchFocus === true) {
          removeFocusFromSearchInputField();
        }
      }
    };

    searchbarIOSFocusScrollTopFix = function searchbarIOSFocusScrollTopFix() {
      if (bIsIOS === true && bIsSearchFocus === false) {
        window.scrollTo(0, 1);
      }
    };

    resizeSearchDropdown = function resizeSearchDropdown() {
      var iSearchBarHeight = 70;
      if (breakpoint.desktop || breakpoint.largeDesktop) {
        iSearchBarHeight = 28;
      } else if (breakpoint.mobile) {
        iSearchBarHeight = 52;
      }

      if (oJQUERYOBJS.$MASTHEADWRAPPER.data(oCSSCLASS.FIXHEADERTOBOTTOM) !== true) {
        setTimeout(function () {
          if (window.Modernizr.csstransitions === true) {
            oJQUERYOBJS.$SEARCHWRAPPER.one('transitionend', function () {
              setFixedHeaderStyles('search-link');
            });
          }

          if (oJQUERYOBJS.$MASTHEADWRAPPER.data('searchifyOpen') === true && oJQUERYOBJS.$MASTHEADWRAPPER.data(oCSSCLASS.SEARCHBAROPEN) === true) {
            oJQUERYOBJS.$SEARCHWRAPPER.outerHeight($(oSELECTORS.RESULTSWRAPPER).outerHeight(true) + iSearchBarHeight);
          }

          if (window.Modernizr.csstransitions !== true) {
            setFixedHeaderStyles('search-link');
          }
        }, 300);
      }
    };

    resetSearchDropdownHeight = function resetSearchDropdownHeight() {
      oJQUERYOBJS.$SEARCHWRAPPER.attr('style', '');
    };

    closeOpenDropdownsOnSearchFocus = function closeOpenDropdownsOnSearchFocus() {
      bIsSearchFocus = true;
      if (breakpoint.desktop || breakpoint.largeDesktop || window.isKiosk()) {
        if (oJQUERYOBJS.$MASTHEADWRAPPER.data(oCSSCLASS.DROPDOWNOPEN) === true && oJQUERYOBJS.$MASTHEADWRAPPER.data(oCSSCLASS.SEARCHBAROPEN) !== true) {
          if (oJQUERYOBJS.$SEARCHINPUT.val() === '') {
            closeOpenDropdown(true);
          }
        }
      }
    };

    enableDisableSearchSubmitButton = function enableDisableSearchSubmitButton() {
      if ($.trim(oJQUERYOBJS.$SEARCHINPUT.val()) !== '') {
        oJQUERYOBJS.$SEARCHSUBMIT.prop('disabled', false);
      } else {
        oJQUERYOBJS.$SEARCHSUBMIT.prop('disabled', true);
      }
    };

    closeSearchifyDropdownOnEmptyInput = function closeSearchifyDropdownOnEmptyInput() {
      if ($.trim(oJQUERYOBJS.$SEARCHINPUT.val()) === '') {
        oJQUERYOBJS.$MASTHEADWRAPPER.trigger('closeSearchifyDropdown');
      }
    };

    addFocusToSearchInputField = function addFocusToSearchInputField() {
      oJQUERYOBJS.$SEARCHINPUT.focus();
      bIsSearchFocus = true;
    };


    removeFocusFromSearchInputField = function removeFocusFromSearchInputField() {
      oJQUERYOBJS.$SEARCHINPUT.blur();
      bIsSearchFocus = false;
    };

    slideUpHeaderOnSearchFocus = function slideUpHeaderOnSearchFocus() {
      if (!(breakpoint.desktop || breakpoint.largeDesktop || window.isKiosk())) {
        oJQUERYOBJS.$MASTHEADWRAPPER.addClass(oCSSCLASS.OUTOFVIEWTRANSENABLED)
                    .addClass(oCSSCLASS.HEADEROUTOFVIEW);
      }
    };

    slideDownHeaderOnSearchBlur = function slideDownHeaderOnSearchBlur() {
      if (!(breakpoint.desktop || breakpoint.largeDesktop || window.isKiosk())) {
        if (window.Modernizr.csstransitions === true) {
          oJQUERYOBJS.$MASTHEADWRAPPER.one('transitionend', function () {
            oJQUERYOBJS.$MASTHEADWRAPPER.removeClass(oCSSCLASS.OUTOFVIEWTRANSENABLED);
          });
        }

        oJQUERYOBJS.$MASTHEADWRAPPER.removeClass(oCSSCLASS.HEADEROUTOFVIEW);

        if (window.Modernizr.csstransitions !== true) {
          oJQUERYOBJS.$MASTHEADWRAPPER.removeClass(oCSSCLASS.OUTOFVIEWTRANSENABLED);
        }
      }
    };

    resizeSearchDropdownOnHidingKeyboard = function resizeSearchDropdownOnHidingKeyboard() {
      var iLatestWindowHeight = $(window).height();

      if (oJQUERYOBJS.$MASTHEADWRAPPER.data('searchifyOpen') === true) {
        if (iLatestWindowHeight > oMeasurements.windowHeight) {
          oMeasurements.windowHeight = iLatestWindowHeight;
          setFixedHeaderScrollPaneHeights();
        }
      }
    };

    emptySearchInput = function emptySearchInput() {
      oJQUERYOBJS.$SEARCHINPUT.val('');
    };

    openDropdown = function openDropdown($link, $dropdown) {
      var bDropdownOpen = false,
        sLinkID = $link[0].id;

      if (oJQUERYOBJS.$MASTHEADWRAPPER.data(oCSSCLASS.DROPDOWNOPEN) === true) {
        bDropdownOpen = true;
      }

      if (bDropdownOpen) {
        closeOpenDropdown(false);
      }

      if (sLinkID === 'search-link') {
        slideUpHeaderOnSearchFocus();
      }

      if (window.Modernizr.csstransitions === true) {
        $dropdown.one('transitionend', function () {
          oJQUERYOBJS.$MASTHEADWRAPPER.trigger(oEVENTS.DROPDOWNOPENCOMPLETE);
          oJQUERYOBJS.$MASTHEADWRAPPER.trigger(returnEventFromLinkID(sLinkID, 'opened'));

          if (sLinkID !== 'search-link' && sLinkID !== 'basket-link') {
            setFixedHeaderStyles(sLinkID);
          }

          if (!bDropdownOpen) {
            addBackgroundMaskOpacity();
          }
        });
      }

      $link.addClass(oCSSCLASS.DROPDOWNOPEN);
      $dropdown.addClass(oCSSCLASS.DROPDOWNOPEN)
                .data(oCSSCLASS.DROPDOWNOPEN, true);
      oJQUERYOBJS.$MASTHEADWRAPPER.addClass(oCSSCLASS.DROPDOWNOPEN)
                .addClass(returnClassFromLinkID(sLinkID))
                .data(oCSSCLASS.DROPDOWNOPEN, true)
                .data(returnClassFromLinkID(sLinkID), true);

      if (!bDropdownOpen) {
        enableBackgroundMask();
      }

      if (window.Modernizr.csstransitions !== true) {
        oJQUERYOBJS.$MASTHEADWRAPPER.trigger(oEVENTS.DROPDOWNOPENCOMPLETE);
        oJQUERYOBJS.$MASTHEADWRAPPER.trigger(returnEventFromLinkID(sLinkID, 'opened'));

        if (sLinkID !== 'search-link' && sLinkID !== 'basket-link') {
          setFixedHeaderStyles(sLinkID);
        }

        if (!bDropdownOpen) {
          addBackgroundMaskOpacity();
        }
      }
    };

    closeDropdown = function closeDropdown($link, $dropdown, bCloseMask) {
      var sLinkID = $link[0].id;

      oJQUERYOBJS.$MASTHEADWRAPPER.trigger(oEVENTS.DROPDOWNCLOSESTART);

      if (bBasketLoaderVisible === true) {
        removeBasketLoader();
      }

      if (sLinkID === 'search-link') {
        slideDownHeaderOnSearchBlur();
      }

      if (window.Modernizr.csstransitions === true) {
        $dropdown.one('transitionend', function () {
          oJQUERYOBJS.$MASTHEADWRAPPER.trigger(oEVENTS.DROPDOWNCLOSECOMPLETE);
          oJQUERYOBJS.$MASTHEADWRAPPER.trigger(returnEventFromLinkID(sLinkID, 'closed'));

          if (sLinkID === 'basket-link') {
            if ($(oSELECTORS.BASKETFLYOUT).data(oCSSCLASS.BASKETCONTENTSCROLLABLE) === true) {
              unsetBasketContentHeight();
              unsetBasketContentScroll();
            }
            removeBasketContent();
          } else if (sLinkID === 'search-link') {
            if (!(breakpoint.desktop || breakpoint.largeDesktop || window.isKiosk())) {
              emptySearchInput();
              oJQUERYOBJS.$MASTHEADWRAPPER.removeClass(oCSSCLASS.HEADEROUTOFVIEW)
                                .removeClass(oCSSCLASS.OUTOFVIEWTRANSENABLED);
            }
          }

          if (bCloseMask) {
            removeBackgroundMaskOpacity();
          }
        });
      }

      if (oJQUERYOBJS.$MASTHEADWRAPPER.data(oCSSCLASS.FIXHEADERTOBOTTOM) === true) {
        unsetFixedHeaderStyles(sLinkID);
      }

      $link.removeClass(oCSSCLASS.DROPDOWNOPEN);
      $dropdown.removeClass(oCSSCLASS.DROPDOWNOPEN)
                .data(oCSSCLASS.DROPDOWNOPEN, false);
      oJQUERYOBJS.$MASTHEADWRAPPER.removeClass(oCSSCLASS.DROPDOWNOPEN)
                .removeClass(returnClassFromLinkID(sLinkID))
                .data(oCSSCLASS.DROPDOWNOPEN, false)
                .data(returnClassFromLinkID(sLinkID), false);

      if (sLinkID === 'basket-link') {
        unsetBasketFlyoutHeight();
      } else if (sLinkID === 'search-link') {
        resetSearchDropdownHeight();
      }

      if (window.Modernizr.csstransitions !== true) {
        oJQUERYOBJS.$MASTHEADWRAPPER.trigger(oEVENTS.DROPDOWNCLOSECOMPLETE);
        oJQUERYOBJS.$MASTHEADWRAPPER.trigger(returnEventFromLinkID(sLinkID, 'closed'));

        if (sLinkID === 'basket-link') {
          if ($(oSELECTORS.BASKETFLYOUT).data(oCSSCLASS.BASKETCONTENTSCROLLABLE) === true) {
            unsetBasketContentHeight();
            unsetBasketContentScroll();
          }
          removeBasketContent();
        } else if (sLinkID === 'search-link') {
          if (!(breakpoint.desktop || breakpoint.largeDesktop || window.isKiosk())) {
            emptySearchInput();
          }
        }

        if (bCloseMask) {
          removeBackgroundMaskOpacity();
        }
      }
    };

    returnClassFromLinkID = function returnClassFromLinkID(sLinkID) {
      var sClass;

      if (sLinkID === 'search-link') {
        sClass = oCSSCLASS.SEARCHBAROPEN;
      } else if (sLinkID === 'catalogue-nav-link') {
        sClass = oCSSCLASS.CATNAVOPEN;
      } else if (sLinkID === 'account-link') {
        sClass = oCSSCLASS.ACCOUNTFLYOUTOPEN;
      } else if (sLinkID === 'basket-link') {
        sClass = oCSSCLASS.BASKETFLYOUTOPEN;
      }

      return sClass;
    };

    returnEventFromLinkID = function returnEventFromLinkID(sLinkID, sState) {
      var sEvent;

      if (sState === 'opened') {
        if (sLinkID === 'search-link') {
          sEvent = oEVENTS.SEARCHBAROPENCOMPLETE;
        } else if (sLinkID === 'catalogue-nav-link') {
          sEvent = oEVENTS.NAVIGATIONOPENCOMPLETE;
        } else if (sLinkID === 'account-link') {
          sEvent = oEVENTS.ACCOUNTFLYOUTOPENCOMPLETE;
        } else if (sLinkID === 'basket-link') {
          sEvent = oEVENTS.BASKETFLYOUTOPENCOMPLETE;
        }
      } else {
        if (sLinkID === 'search-link') {
          sEvent = oEVENTS.SEARCHBARCLOSECOMPLETE;
        } else if (sLinkID === 'catalogue-nav-link') {
          sEvent = oEVENTS.NAVIGATIONCLOSECOMPLETE;
        } else if (sLinkID === 'account-link') {
          sEvent = oEVENTS.ACCOUNTFLYOUTCLOSECOMPLETE;
        } else if (sLinkID === 'basket-link') {
          sEvent = oEVENTS.BASKETFLYOUTCLOSECOMPLETE;
        }
      }

      return sEvent;
    };

    closeOpenDropdown = function closeOpenDropdown(bCloseMask) {
      var $link,
        $dropdown;

      $link = $(oSELECTORS.PARENTLINK).filter(function () {
        return $(this).hasClass(oCSSCLASS.DROPDOWNOPEN);
      });
      $dropdown = $link.siblings(oSELECTORS.DROPDOWN);

      if ($link.length) {
        closeDropdown($link, $dropdown, bCloseMask);

        if ($link[0].id === 'search-link' && sEventState !== 'hover') {
          removeFocusFromSearchInputField();
        }
      }
    };

    loadBasketContent = function loadBasketContent($link, $dropdown) {
      addBasketLoader();
      openDropdown($link, $dropdown);
      $.ajax({
        url: sFlyoutBasketContentJspURL,
        success: function success(response) {
          injectBasketContent(response);
          calcBasketFlyoutHeights();
          setBasketFlyoutHeight();
          removeBasketLoader();
          if (oMeasurements.basketContentsWrapperHeight > 560) {
            setBasketContentHeight();
            setBasketContentScroll();
          }
          setTimeout(function () {
            setFixedHeaderStyles($link[0].id);
          }, 300);

        }
      });
    };

    addBasketLoader = function addBasketLoader() {
      $(oSELECTORS.BASKETFLYOUT).addClass(oCSSCLASS.BASKETCONTENTLOADING);
      bBasketLoaderVisible = true;
    };

    removeBasketLoader = function removeBasketLoader() {
      $(oSELECTORS.BASKETFLYOUT).removeClass(oCSSCLASS.BASKETCONTENTLOADING);
      bBasketLoaderVisible = false;
    };

    injectBasketContent = function injectBasketContent(response) {
      $(oSELECTORS.BASKETFLYOUT).append(response);
    };

    removeBasketContent = function removeBasketContent() {
      $(oSELECTORS.BASKETCONTENTSWRAPPER).remove();
    };

    calcBasketFlyoutHeights = function calcBasketFlyoutHeights() {
      oMeasurements.basketContentsWrapperHeight = $(oSELECTORS.BASKETCONTENTSWRAPPER).outerHeight(true);
      oMeasurements.basketFooterWrapperHeight = $(oSELECTORS.BASKETFOOTERWRAPPER).outerHeight(true);
    };

    setBasketFlyoutHeight = function setBasketFlyoutHeight() {
      var iBasketFlyoutHeight = oMeasurements.basketContentsWrapperHeight > 560 ? 560 : oMeasurements.basketContentsWrapperHeight;
      $(oSELECTORS.BASKETFLYOUT).outerHeight(iBasketFlyoutHeight);
    };

    unsetBasketFlyoutHeight = function unsetBasketFlyoutHeight() {
      $(oSELECTORS.BASKETFLYOUT).attr('style', '');
    };

    setBasketContentHeight = function setBasketContentHeight(iHeight) {
      var iBaseHeight = iHeight || 560,
        iBasketContentsHeight = iBaseHeight - oMeasurements.basketFooterWrapperHeight;

      $(oSELECTORS.BASKETCONTENTS).outerHeight(iBasketContentsHeight - 3);
    };

    unsetBasketContentHeight = function unsetBasketContentHeight() {
      $(oSELECTORS.BASKETCONTENT).attr('style', '');
    };

    setBasketContentScroll = function setBasketContentScroll() {
      $(oSELECTORS.BASKETFLYOUT).addClass(oCSSCLASS.BASKETCONTENTSCROLLABLE)
                .data(oCSSCLASS.BASKETCONTENTSCROLLABLE, true);
    };

    unsetBasketContentScroll = function unsetBasketContentScroll() {
      if ($(oSELECTORS.BASKETFLYOUT).data(oCSSCLASS.BASKETCONTENTSCROLLABLE) === true) {
        $(oSELECTORS.BASKETFLYOUT).removeClass(oCSSCLASS.BASKETCONTENTSCROLLABLE)
                    .data(oCSSCLASS.BASKETCONTENTSCROLLABLE, false);
      }
    };

    enableBackgroundMask = function enableBackgroundMask() {
      oJQUERYOBJS.$PAGEMASK.addClass(oCSSCLASS.PAGEMASKVISIBLE);

      if (oJQUERYOBJS.$MASTHEADWRAPPER.data(oCSSCLASS.CATNAVOPEN) === true && (breakpoint.desktop || breakpoint.largeDesktop || window.isKiosk())) {
        oJQUERYOBJS.$PAGEMASK.addClass(oCSSCLASS.CATNAVOPEN);
      }
    };

    addBackgroundMaskOpacity = function addBackgroundMaskOpacity() {
      oJQUERYOBJS.$PAGEMASK.addClass(oCSSCLASS.PAGEMASKOPACITY);
      oJQUERYOBJS.$MASTHEADWRAPPER.data(oCSSCLASS.PAGEMASKVISIBLE, true);
    };

    removeBackgroundMaskOpacity = function removeBackgroundMaskOpacity() {
      oJQUERYOBJS.$PAGEMASK.removeClass(oCSSCLASS.PAGEMASKOPACITY);

      if (window.Modernizr.csstransitions === true) {
        oJQUERYOBJS.$PAGEMASK.one('transitionend', function () {
          if (oJQUERYOBJS.$MASTHEADWRAPPER.data(oCSSCLASS.DROPDOWNOPEN) !== true) {
            disableBackgroundMask();
          }
          if (oJQUERYOBJS.$MASTHEADWRAPPER.data(oCSSCLASS.SCROLLTORECENTLYVIEWED) === true) {
            scrollToRecentlyViewed();
          }
        });
      }

      if (window.Modernizr.csstransitions !== true) {
        if (oJQUERYOBJS.$MASTHEADWRAPPER.data(oCSSCLASS.DROPDOWNOPEN) !== true) {
          disableBackgroundMask();
        }
        if (oJQUERYOBJS.$MASTHEADWRAPPER.data(oCSSCLASS.SCROLLTORECENTLYVIEWED) === true) {
          scrollToRecentlyViewed();
        }
      }
    };

    disableBackgroundMask = function disableBackgroundMask() {
      oJQUERYOBJS.$PAGEMASK.removeClass(oCSSCLASS.PAGEMASKVISIBLE)
                .removeClass(oCSSCLASS.CATNAVOPEN);

      oJQUERYOBJS.$MASTHEADWRAPPER.data(oCSSCLASS.PAGEMASKVISIBLE, false);
    };

    bindBackgroundMaskEvents = function bindBackgroundMaskEvents() {
      oJQUERYOBJS.$PAGEMASK.on('click.bindBackgroundMaskEventsHandler', function bindBackgroundMaskEventsHandler(e) {
        closeOpenDropdown(true);
      });
    };

    setFixedHeaderStyles = function setFixedHeaderStyles(sLinkID) {
      findActiveDropdown();
      if ($activeDropdown.length) {
        findActiveScrollPane();
        measureElements();

        if (oMeasurements.dropdownHeight >= oMeasurements.windowHeight) {
          if (sLinkID === 'basket-link' && $(oSELECTORS.BASKETFLYOUT).data(oCSSCLASS.BASKETCONTENTSCROLLABLE) !== true) {
            setBasketContentHeight(oMeasurements.windowHeight - oMeasurements.activeScrollPaneOffsetTop);
            setBasketContentScroll();
          }

          setFixedHeaderBottomClass();
          setFixedHeaderScrollPaneHeights();
          setCategoryListItemAlignmentFix(sLinkID);
          setSearchWrapperHeightFix(sLinkID);
        }
      }
    };

    unsetFixedHeaderStyles = function unsetFixedHeaderStyles(sLinkID) {
      unsetFixedHeaderBottomClass();
      unsetFixedHeaderScrollPaneHeights();
      unsetCategoryListItemAlignmentFix(sLinkID);
      unsetSearchWrapperHeightFix(sLinkID);
    };

    setCategoryListItemAlignmentFix = function setCategoryListItemAlignmentFix(sLinkID) {
      if (sLinkID === 'catalogue-nav-link' && (breakpoint.desktop || breakpoint.largeDesktop)) {
        $('#catalogue-nav ul.categories-l1 > li').css('margin-right', '-1px');
      }
    };

    unsetCategoryListItemAlignmentFix = function unsetCategoryListItemAlignmentFix(sLinkID) {
      if (sLinkID === 'catalogue-nav-link' && (breakpoint.desktop || breakpoint.largeDesktop)) {
        $('#catalogue-nav ul.categories-l1 > li').css('margin-right', '');
      }
    };

    setSearchWrapperHeightFix = function setSearchWrapperHeightFix(sLinkID) {
      var iSearchWrapperHeight = '600px';

      if (sLinkID === 'search-link') {
        if (breakpoint.desktop || breakpoint.largeDesktop) {
          iSearchWrapperHeight = '550px';
        }

        oJQUERYOBJS.$SEARCHWRAPPER.css('height', iSearchWrapperHeight);
      }
    };

    unsetSearchWrapperHeightFix = function unsetSearchWrapperHeightFix(sLinkID) {
      if (sLinkID === 'search-link') {
        oJQUERYOBJS.$SEARCHWRAPPER.css('height', '');
      }
    };

    setFixedHeaderBottomClass = function setFixedHeaderBottomClass() {
      oJQUERYOBJS.$MASTHEADWRAPPER.addClass(oCSSCLASS.FIXHEADERTOBOTTOM)
                .data(oCSSCLASS.FIXHEADERTOBOTTOM, true);
    };

    unsetFixedHeaderBottomClass = function unsetFixedHeaderBottomClass() {
      oJQUERYOBJS.$MASTHEADWRAPPER.removeClass(oCSSCLASS.FIXHEADERTOBOTTOM)
                .data(oCSSCLASS.FIXHEADERTOBOTTOM, false);
    };

    setFixedHeaderScrollPaneHeights = function setFixedHeaderScrollPaneHeights() {
      var iNewScrollPaneHeight = oMeasurements.windowHeight - oMeasurements.activeScrollPaneOffsetTop;

      $activeScrollPane.outerHeight(iNewScrollPaneHeight - 1);

      if (!(breakpoint.desktop || breakpoint.largeDesktop)) {
        if (oJQUERYOBJS.$MASTHEADWRAPPER.data(oCSSCLASS.CATNAVOPEN) === true) {
          $(oSELECTORS.CATNAVBACKLINK).outerHeight(iNewScrollPaneHeight - 1);
        }
      }

      if (oJQUERYOBJS.$MASTHEADWRAPPER.data(oCSSCLASS.BASKETFLYOUTOPEN) === true) {
        setFixedHeaderBasketContentHeight(iNewScrollPaneHeight);
      }
    };

    setFixedHeaderBasketContentHeight = function setFixedHeaderBasketContentHeight(iNewScrollPaneHeight) {
      oMeasurements.basketFooterWrapperHeight = $(oSELECTORS.BASKETFOOTERWRAPPER).outerHeight(true);

      $(oSELECTORS.BASKETCONTENTS).outerHeight(iNewScrollPaneHeight - oMeasurements.basketFooterWrapperHeight - 2);
    };

    unsetFixedHeaderScrollPaneHeights = function unsetFixedHeaderScrollPaneHeights() {
      $activeScrollPane.attr('style', '');

      if (oJQUERYOBJS.$MASTHEADWRAPPER.data(oCSSCLASS.CATNAVOPEN) === true) {
        $(oSELECTORS.CATNAVBACKLINK).attr('style', '');
      }
    };

    deferAsyncCallbackHandler = function deferAsyncCallbackHandler() {
      if (window.AsyncBlockController.deferDefaultCall()) {
        $(oSELECTORS.ACCOUNTLINK).one('click mouseenter', function deferredDropDownHandler(e) {
          e.preventDefault();
          e.stopPropagation();
          if (window.AsyncBlockController.deferDefaultCall()) {
            $(window).trigger(window.AsyncBlockController.getDeferredEventName());
            $(window).one(window.AsyncBlockController.getCompleteEventName(),
            function deferredDropDownTriggerHandler() {
              /*
              Wrapped in setTimeout as the success callback from AsyncBlockController is
              referencing a mobule with the default almond 4ms delay
               */
              setTimeout(function () {
                $(oSELECTORS.ACCOUNTLINK).trigger('click');
              }, 10);
            });
          } else {
            $(oSELECTORS.ACCOUNTLINK).trigger('click');
          }
        });
      }
      if (window.AsyncBlockController.deferDefaultCall()) {
        $(oSELECTORS.BASKETLINK).one('click', function deferredBasketDropDownHandler(e) {
          e.preventDefault();
          e.stopPropagation();
          if (window.AsyncBlockController.deferDefaultCall()) {
            $(window).trigger(window.AsyncBlockController.getDeferredEventName());
            $(window).one(window.AsyncBlockController.getCompleteEventName(),
            function deferredDropDownTriggerHandler() {
              setTimeout(function () {
                $(oSELECTORS.BASKETLINK).trigger('click');
              }, 10);
            });
          } else {
            $(oSELECTORS.BASKETLINK).trigger('click');
          }
        });
      }
    };

    pvAsyncBlockCallbacks = function pvAsyncBlockCallbacks() {
      var oCallbacks = {};

      oCallbacks.success = function (oResp) {
        if (typeof oResp === 'string') {
          oResp = $.parseJSON(oResp);
        }
        $('#asyncTopMenuHolder').replaceWith(oResp[this.sBlockID]);
        if (oResp.RVI) {
          $(oSELECTORS.RECENTLYVIEWEDLINK).removeClass(oCSSCLASS.DISABLED);
        }
      };
      return oCallbacks;
    };

    bindRecentlyViewedEvents = function bindRecentlyViewedEvents() {
      if ($(oSELECTORS.RECENTLYVIEWED).length) {
        $(oSELECTORS.RECENTLYVIEWEDLINK).removeClass(oCSSCLASS.DISABLED);
      }
      oJQUERYOBJS.$MASTHEADWRAPPER.on('click.recentlyViewedEventsHandler', oSELECTORS.RECENTLYVIEWEDLINK, function recentlyViewedEventsHandler(e) {
        e.preventDefault();
        if ($(e.currentTarget).hasClass(oCSSCLASS.DISABLED)) {
          return;
        }
        oJQUERYOBJS.$MASTHEADWRAPPER.data(oCSSCLASS.SCROLLTORECENTLYVIEWED, true);
        closeOpenDropdown(true);
      });
    };

    scrollToRecentlyViewed = function scrollToRecentlyViewed() {
      var iMastheadHeight = oMeasurements.mastheadHeight,
        iScrollTo = $(oSELECTORS.RECENTLYVIEWED).offset().top - iMastheadHeight;

      $('html, body').animate({
        scrollTop: iScrollTo
      }, 500);

      oJQUERYOBJS.$MASTHEADWRAPPER.data(oCSSCLASS.SCROLLTORECENTLYVIEWED, false);
    };

    updateBasketBadge = function updateBasketBadge(e) {
      if (e) {
        try {
          if (!$(oSELECTORS.BASKETITEMSBADGE).length) {
            $(oSELECTORS.BASKETLINK).find(oSELECTORS.BASKETMENUTITLE).
                after('<span class="badge"><span class="basket-items"></span></span>');
          }
          $(oSELECTORS.BASKETITEMSBADGE)[0].innerHTML =
                e.oData.success.data.basket.total;
        } catch (ex) {}
      }
    };

    return {
      init: function init(bForceTouch) {
        pvInit(bForceTouch);
      },
      asyncBlockCallbacks: function asyncBlockCallbacks() {
        return pvAsyncBlockCallbacks();
      }
    };
  };

  return FixedHeader;
});
