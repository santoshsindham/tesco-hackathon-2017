/* global define:true */
/* jslint plusplus: true */
define(['domlib', 'modules/common', 'modules/tesco.data', 'modules/tesco.utils', 'modules/overlay/common', 'modules/breakpoint', 'modules/tesco.analytics', 'modules/add-to-basket/common.attach', 'modules/buy-from/common', 'modules/chip-and-pin/kmf-io', 'modules/google-analytics/pdpTracking'], function ($, common, data, utils, overlay, breakpoint, analytics, addToBasket, buyFrom, kmfIO, pdpTracking) {
  'use strict';

  var self, initialize, initAjaxFramework, events, bindEvents, bindBasketEvents, handleClickEvent, getAddToBasketMarkup, updateDomReferences, addRecommenders, fixIframeWidth, resizeWindowHandler, handleCustomCheckboxes, initBasketContent, displayBasket, hideBasket, showVirtualPage, showModalDialog, removeLoadingOverlay, addOnMessageTooltip, serviceCheckboxCallback, disableBasketButtons, enableBasketButtons, applyServiceRequest, showServiceSpinner, hideServiceSpinners, submitForm, oWebAnalytics, getDataForAnalytics, trackEvent, addIframeListener, handleIncomingMessage, serviceCallFramework, updateCall, setScreenRotationHandler,
    $streamlineBasketContainer, $streamlineBasketIframe, $moreOptionsContainer, $recommendersArea, $loadingOverlay, $basketLinks, populateAnalyticsProductInformation, getSkuIdFromProductTile,
    $body = $('body'),
    callbacks = {
      success: function (response) {
        displayBasket(response);
      },
      error: function (error) {
        window.console.warn('[Streamlined Basket] An unexpected error occured while loading basket data. Error details: ' + error);
      }
    },
    analyticsData = {
      basketLoaded: function (params) {
                //  return getDataForAnalytics(params);
      },
      additionalServiceChosen: function (params) {
                // / return getDataForAnalytics(params);
      }
    }, dataHandler;

  setScreenRotationHandler = function setScreenRotationHandler() {
    if (window.addEventListener) {
      window.addEventListener('orientationchange', hideBasket);
    }
  };

    /* getDataForAnalytics = function getDataForAnalytics(params) {
    var eventData = params || {};

    if (params && params.service) {
    eventData.eVar58 = params.service;
    eventData.events = "event53";
    }

    eventData.pagename = "Basket Overlay";
    eventData.eVar9 = "Tesco Direct";
    eventData.prop10 = "Tesco Direct";

    return [eventData];
    };*/

  updateDomReferences = function updateDomReferences() {
    $streamlineBasketContainer = $('.streamline-basket');
    $streamlineBasketIframe = $('#streamline-basket-iframe');
    $moreOptionsContainer = $('.streamline-basket .more-options');
    $recommendersArea = $('.recommendersArea');
    $loadingOverlay = $('.loading-overlay');
    $basketLinks = $('.section-nav a, .section-nav input.checkout');
  };

  showVirtualPage = function showVirtualPage(params) {
    common.virtualPage.show(params);
  };

  showModalDialog = function showModalDialog(params) {
    overlay.show(params);
  };

  displayBasket = function displayBasket(html) {
    var params = {
      content: html,
      showBack: true,
      customClass: 'streamline-basket',
      callback: initBasketContent, // callback for overlay (inconsistent param naming)
      callbackReady: initBasketContent // callback for virtual page (inconsistent param naming)
    };
    var paramsKiosk = {
      content: html,
      customClass: 'streamline-basket',
      fixedWidth: 1586,
      enablePagination: true,
      callback: initBasketContent, // callback for overlay (inconsistent param naming)
      callbackReady: initBasketContent // callback for virtual page (inconsistent param naming)
    };
    if (breakpoint.mobile) {
      showVirtualPage(params);
    } else if (breakpoint.kiosk) {
      overlay.show(paramsKiosk);
      $('#lightbox').find('#lightbox-content').addClass('buy-from-kiosk-cp');
    } else {
      showModalDialog(params);
    }
    addIframeListener();
  };

  hideBasket = function hideBasket(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if ($streamlineBasketContainer.attr('id') === 'lightbox') {
      overlay.hide();
    } else {
      common.virtualPage.close();
    }
  };

  submitForm = function submitForm(e) {
    var $form;
    e.preventDefault();
    e.stopPropagation();
    $form = $(e.target).closest('form');
    $form.submit();
  };

  addRecommenders = function addRecommenders() {
    var iframe = document.createElement('iframe');
    iframe.src = '/' + contextPath + '/blocks/recommendations/interimBasketRecommender.jsp';
    iframe.id = 'streamline-basket-iframe';
    iframe.scrolling = 'no';
    $recommendersArea.append(iframe);
  };

  fixIframeWidth = function fixIframeWidth() {
    updateDomReferences();
    $streamlineBasketIframe.css({
      width: $recommendersArea.outerWidth()
    });
  };

  resizeWindowHandler = function resizeWindowHandler() {
    var t;
    $(window).resize(function () {
      clearTimeout(t);
      t = setTimeout(fixIframeWidth, 200);
    });
  };

  trackEvent = function trackEvent(event) {
    if (event instanceof Array) {
      oWebAnalytics = new analytics.WebMetrics();
      oWebAnalytics.submit(event);
    }
  };

  initBasketContent = function initBasketContent() {
    updateDomReferences();
    bindBasketEvents();
    addOnMessageTooltip();
    handleCustomCheckboxes();
    fixIframeWidth();
    resizeWindowHandler();
    setScreenRotationHandler();
    if (window.isKiosk()) {
      $('#lightbox-content .section-nav li a.secondary-button').text('View your basket');
      $('iframe#streamline-basket-iframe').load(function () {
        overlay.pagination.setup($('#lightbox.streamline-basket'), true);
        var myFrame = $('#streamline-basket-iframe').contents().find('body');
        myFrame.addClass('kiosk-recommender');
      });
    }
  };

  addOnMessageTooltip = function addOnMessageTooltip() {
    if($('.primary-button.checkout.disabled').length) {
      $('.primary-button.checkout.disabled').on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        $(e.target).parent('form').find('#add-on-text').toggle();
      });
    }
  };

  handleCustomCheckboxes = function handleCustomCheckboxes() {
    common.customCheckBox.init($moreOptionsContainer, serviceCheckboxCallback);
    if (!window.isKiosk()) {
      common.richTexttooltipPopup.init();
    } else {
      buyFrom.serviceTooltip();
    }
  };

  serviceCheckboxCallback = function serviceCheckboxCallback($checkbox) {
    disableBasketButtons();
    $loadingOverlay.show();
    applyServiceRequest($checkbox);
  };

  showServiceSpinner = function showServiceSpinner($serviceCheckbox) {
    $($serviceCheckbox).parent().find('.ajax-loader').show();
  };

  hideServiceSpinners = function hideServiceSpinners() {
    $('.ajax-loader', $moreOptionsContainer).hide();
  };

  applyServiceRequest = function applyServiceRequest($checkbox) {
    serviceCallFramework($checkbox);
  };

  serviceCallFramework = function serviceCallFramework(serviceCheckBox) {
    var _myInlineRequests = [];
    var _myRequests = {
      serviceCall: ['relatedItems', 'basketTotal']
    };
    var _myModules = {
      relatedItems: ['.more-options', '', true, true, false],
      basketTotal: ['.summary', '', true, false, true, true]
    };

    var _myActions = {
      serviceCall: ['/stubs/delivery-options.php']
    };
    var _myDefaultActions = {
      serviceCall: ['/stubs/delivery-options.php']
    };

    data.Global.init({
      inlineRequests: _myInlineRequests,
      requests: _myRequests,
      modules: _myModules,
      actions: _myActions,
      defaultActions: _myDefaultActions
    });

    updateCall('#serviceItem', serviceCheckBox);
    if (!window.isKiosk()) {
      common.richTexttooltipPopup.init();
    } else {
      buyFrom.serviceTooltip();
    }
  };

  updateCall = function updateCall(_isService, serviceChkBox) {
    var _request = 'serviceCall';
        // var _url = $(_isService).attr('data-url');
    var DL = new data.DataLayer();
    var $form = utils.getFormByElement(serviceChkBox);
    var serviceData = $form.serialize();
    var _url = utils.getFormAction($form);

    if (_url !== undefined && ($form.parents('#lightbox').length || $form.parents('#virtual-page').length)) {
      DL.get(_url, serviceData, serviceChkBox, null, _request, null, function () { }, function () {
                // after success what should come
        enableBasketButtons();
        removeLoadingOverlay();
        handleCustomCheckboxes();
      });
    }
  };

  bindBasketEvents = function bindBasketEvents() {
    events = {
      click: [{
        target: '.continue, #overlay',
        type: 'click',
        callback: hideBasket
      }, {
        target: '.checkout',
        type: 'click',
        callback: submitForm
      }]
    };
    bindEvents(events);
  };

  disableBasketButtons = function disableBasketButtons() {
    if ($basketLinks.length) {
      $basketLinks.each(function () {
        if (!$(this).hasClass('disabled')) {
          $(this).addClass('disabled');
        }
      });
    }
  };

  enableBasketButtons = function enableBasketButtons() {
    $basketLinks.removeClass('disabled');
  };

  bindEvents = function bindEvents(events) {
    var event, i;
    for (event in events) {
      if (events.hasOwnProperty(event)) {
        event = events[event];
        i = event.length;
        while (i--) {
          $(event[i].target).unbind();
          $body.on(event[i].type, event[i].target, event[i].callback);
        }
      }
    }
  };

  handleClickEvent = function handleClickEvent(e) {
    var product = $(e.target).closest('.product');
    e.preventDefault();
    e.stopPropagation();
    getAddToBasketMarkup(product, $(e.target));
    pdpTracking.setAddToBasket(populateAnalyticsProductInformation(product));
  };

  removeLoadingOverlay = function () {
    $loadingOverlay.hide();
  };

  events = {
    click: [{
      target: '.add-to-basket',
      type: 'click',
      callback: handleClickEvent
    }]
  };

  initAjaxFramework = function initAjaxFramework() {
    var params = {
      inlineRequests: [],
      requests: {
        streamlineBasket: ['addToBasketContainer']
      },
      modules: {
        addToBasketContainer: ['#streamLineResponse', , true],
        streamLineError: ['#streamLineResponse', , true],
        flyoutBasketLink: ['#masthead #basket-link', , true, false, true]
      },
      actions: {
        streamlineBasket: ['/stubs/streamline-basket/streamlineBasket.php']
      },
      defaultActions: {
        streamlineBasket: ['/stubs/streamline-basket/streamlineBasket.php']
      }
    };
    data.Global.init(params);
  };

  getAddToBasketMarkup = function (product, obj) {
    var DL = new data.DataLayer(),
      $addToBasketButton = obj,
      $form = utils.getFormByElement($addToBasketButton),
      productData = $form.serialize(),
      request = 'streamlineBasket',
      url = data.Utils.getAction(request);

    DL.get(null, productData, $addToBasketButton, dataHandler, request, null, null, function () {
      if ($('#streamLineResponse').find('.current-details').length) {
        displayBasket($('#streamLineResponse').html());
        $('#streamLineResponse').html('');
        if (window.isKiosk()) {
          setTimeout(function () {
            kmfIO.enableBasketButton();
          }, 2000);
        }
        $(window).trigger('product:addedToBasket');
      } else {
        var quantityInput = $form.find('.quantity-display ');
        var addButtonSaveBlock = $('.linksave').find('.add-to-basket');
        var addButtonBundleBlock = $('.bundle').find('.add-to-basket');
        var html = "<span class='error'><span class='icon' data-icon='8' aria-hidden='true'></span>" + $('#streamLineResponse').html() + '</span>';

        require(['modules/buy-from/common'], function (buyFrom) {
          if (obj.attr('id') == 'addBundle') {
            buyFrom.errorTooltip(addButtonSaveBlock, html);
          } else if (obj.attr('id') == 'addSoftBundle') {
            buyFrom.errorTooltip(addButtonBundleBlock, html);
          } else if (quantityInput.is(':visible')) {
            buyFrom.errorTooltip(quantityInput, html);
          } else {
            buyFrom.errorTooltip($addToBasketButton, html);
          }
        });
      }
    });
  };

  initialize = function initialize() {
    $body = $('body');
    if ($('.basketPopup').length) {
      initAjaxFramework();
      bindEvents(events);
      if ($('.buy-from .add-to-basket:hidden')) {
        $('.buy-from .add-to-basket').css('visibility', 'visible');
      }
    }
  };

  addIframeListener = function addIframeListener() {
    common.addCrossWindowListener(handleIncomingMessage);
  };

  handleIncomingMessage = function handleIncomingMessage(message) {
    if (message.data && message.data.action && message.data.action === 'redirect') {
      window.location.href = message.data.href;
    }
  };

  getSkuIdFromProductTile = function getSkuIdFromProductTile(eTarget) {
    var sSkuId = null,
      sAnchorHref = eTarget.find('.thumbnail').attr('href'),
      aHrefChunks = sAnchorHref.split('=');

    sSkuId = aHrefChunks[aHrefChunks.length - 1];

    return sSkuId;
  };

  populateAnalyticsProductInformation = function populateAnalyticsProductInformation(eProduct) {
    var sSkuId = getSkuIdFromProductTile(eProduct),
      sProductName = $.trim(eProduct.find('.details-container h3 a').text()),
      sProductCategory = $.trim($('#breadcrumb .last').text());

    return {
      id: sSkuId,
      name: sProductName,
      category: sProductCategory
    };
  };

  dataHandler = {
    handler: function (oJSON, oElem) {
      var _myModuleInfo, _myModuleSelector, _markup, sLocation, _oWebAnalytics;

      $.each(oJSON, function (k, v) {
        if (k === 'analytics') {
          if (analytics) {
            _oWebAnalytics = new analytics.WebMetrics();
            _oWebAnalytics.submit(v);
          }
        }
        else if (k === 'redirection') {
          sLocation = v;
          if (oJSON.error !== undefined) {
            sLocation += '&error=' + oJSON.error;
          }
          location.href = sLocation;
        }
        else {
          _myModuleInfo = data.Utils.getModuleInformation(k);
          _myModuleSelector = _myModuleInfo[0];
          _markup = dataHandler.cleanMarkup(v);

          try {
            if (_markup !== '') {
              if (_myModuleInfo !== undefined && _myModuleInfo[4] === true) {
                $(_myModuleSelector).replaceWith(_markup);
              }
              else {
                $(_myModuleSelector).get(0).innerHTML = _markup;
              }
            }
          }
			      catch (e) {}
        }
      });
    },
    cleanMarkup: function (sHTML) {
      if (sHTML !== null) {
        return sHTML.replace(/<(style|title)[^<]+<\/(style|title)>/gm, '')
          .replace(/<(link|meta)[^>]+>/g, '');
      }
      else {
        return '';
      }
    }
  };

  self = {
    init: initialize,
    initAjaxFramework: initAjaxFramework
  };

  return self;
});
