/* global define,require,window,document */
/* jslint plusplus: true, regexp: true */
define([
  'domlib',
  'modules/breakpoint',
  'modules/common',
  'modules/tesco.data',
  'modules/overlay/common',
  'modules/product-description/common',
  'modules/tesco.analytics',
  'modules/product-description/eventMessagingCountDown',
  'modules/tesco.utils'
], function ($, breakpoint, common, Data, overlay, pdp, analytics, eventMessagingCountDown, utils) {
  'use strict';

  var buyFrom = {

    clickEvent: 'click tap',
    module: '.buy-from',

    otherSellers: '.otherSellers',

    icon: "<span class='icon' data-icon='r' aria-hidden='true'/>",

    init: function ($module) {
      $module = $module || $('#virtualPage .buy-from');
      if ($module.length) {
        buyFrom.setup($module);
        buyFrom.initFramework();
        if (common.isPage('PDP')) {
          if ($('#ndoURLContainer').data('url')) {
            buyFrom.triggerNDOCall();
          } else {
            $('.buy-from').find('.loader').remove();
          }
        } else {
          buyFrom.triggerNDOCall();
        }
        buyFrom.buyBoxQty();
        common.customCheckBox.init($module);
        $('.newDeliveryOptions').not('.tescoBuyBox').find('.show-all').on('click', function (e) {
          e.preventDefault();
          buyFrom.showItems($(this));
        });
        if ($('#errorDiv').length) {
          var $qty = $('#errorDiv').closest('form').find('.quantity-display');
          buyFrom.throwQuantityValidationError($qty);
        }
        if (!window.isKiosk()) {
          $('.other-sellers .seller', $module).each(function () {
            $(this).find('.details .header').after($(this).find('> .seller-price-info'));
          });
        }
      }
    },

    asyncBlockCallbacks: function asyncBlockCallbacks() {
      var oCallbacks = {};

      oCallbacks.success = function (oResp) {
        if (typeof oResp === 'string') {
          oResp = $.parseJSON(oResp);
        }

        if (oResp.ServerTime !== undefined) {
          window.currentTimeAsync = oResp.ServerTime;
        }

        if (oResp[this.sBlockID] === '') {
          throw new Error('No response for: ' + this.sBlockID);
        }

        $(buyFrom.module).replaceWith(oResp[this.sBlockID]);
        buyFrom.init($(buyFrom.module));
      };
      return oCallbacks;
    },

    initFramework: function () {
      var myInlineRequests = [],
        myRequests = {
          newdeliveryOptions: ['deliveryOptionsContainer']
        },
        myModules = {
          deliveryOptionsContainer: ['.newDeliveryOptions', '', true, false, true]
        },
        myActions = {
          newdeliveryOptions: ['/stubs/delivery-options.php']
        },
        myDefaultActions = {
          newdeliveryOptions: ['/stubs/delivery-options.php']
        };
      Data.Global.init({
        inlineRequests: myInlineRequests,
        requests: myRequests,
        modules: myModules,
        actions: myActions,
        defaultActions: myDefaultActions
      });
    },
    triggerNDOCall: function () {
      var sRequest = 'newdeliveryOptions',
        sUrl = common.isPage('PDP') ? $('#ndoURLContainer').data('url') : $('#ndoURLContainer').data('url') + "&_=" + $.now(),
        DL = new Data.DataLayer(),
        $parentContainer = common.isPage('basket') ? $('#basket-primary') : $('.seller'),
        $descriptionLI,
        $module,
        $thisItem,
        $listShown,
        iNDOCount;

      if (sUrl !== undefined || sUrl !== null) {
        DL.get(sUrl, null, null, buyFrom.Handler, sRequest, null, null, function (xhr) {
          var oParsedJSON = JSON.parse(xhr.responseText),
            oEventMessagingManager,
            oWebAnalytics,
            eVar;

                    /* Start - Event Messaging */
          if (common.isPage('PDP')) {
            $.each(oParsedJSON, function (k, v) {
              if (v.countdown || v.events) {
                v.selector = '#' + k + ' .eventMessaging.asynContainer .content p';
                if (v.countdown) {
                  v.countdown.selector = v.selector;
                  v.countdown.currentTime = window.currentTimeAsync;
                }
                oEventMessagingManager = new eventMessagingCountDown.EventMessagingManager(v);
                oEventMessagingManager.show();
              }
              if (v.stockService) {
               v.stockSelector = '#' + k + ' .stockService';
               $(v.stockSelector).html(v.stockService);
               if ($('.stockAvailability').length > 0) {
                 buyFrom.bindStockEvent();
               }
             }

              if (v.analytics) {
                oWebAnalytics = new analytics.WebMetrics();
                oWebAnalytics.submit(v.analytics);
              }
            });
            if ($('#grocery-DO').length) {
              oWebAnalytics = new analytics.WebMetrics();
              eVar = [{
                eVar17: 'DBT available PDP'
              }];
              oWebAnalytics.submit(eVar);
            }
          }
                    /* End - Event Messaging */

          if (common.isPage('basket')) {
            $.each(oParsedJSON, function (k, v) {
              if (v.events) {
                v.selector = '.' + k + ' .eventMessaging.asynContainer .content p';
                if (v.countdown) {
                  delete v.countdown;
                }
                oEventMessagingManager = new eventMessagingCountDown.EventMessagingManager(v);
                oEventMessagingManager.show();
              }
            });
          }

          $parentContainer.find('.newDeliveryOptions ul').each(function () {
            $thisItem = $(this).parents('.newDeliveryOptions');
            iNDOCount = $thisItem.data('count') - 1;
            if (iNDOCount === undefined || isNaN(iNDOCount)) {
              iNDOCount = -1;
            }
            $listShown = 'li:gt(' + iNDOCount + ')';
            if (iNDOCount === -1) {
              $(this).children('li').show();
            } else {
              $(this).children($listShown).hide();
            }
          });
          $module = $(buyFrom.module);
          $('.newDeliveryOptions.tescoBuyBox').find('.show-all').on('click', function (e) {
            e.preventDefault();
            buyFrom.showItems($(this));
          });
          $module.find('a.active').on('click', function (e) {
            e.preventDefault();
            $module.find('.show-all').trigger(e.type);
          });
          $descriptionLI = $module.find('ul').children('li.description');
          if ($descriptionLI.length) {
            $module.find('ul').children('li.description').hide();
          }
          $('.newDeliveryOptions').removeClass('preNDOCall');
          if ($('div.product-description').length) {
            $('.offerTitle').css('min-height', '');
            buyFrom.populateBuyBoxesFromDom();
          }
          $('.loader', $(buyFrom.module)).hide();
          $(buyFrom.module).addClass('buyFromLoaded');
        }, 'GET');
      }
    },
    bindStockEvent: function () {
      $('#checkStock').on(buyFrom.clickEvent, function (e) {
        e.preventDefault();
        e.stopPropagation();
        buyFrom.toggleCheckStock(e);
      });
      $('#stockSubmit').off().on(buyFrom.clickEvent, function (e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).prop('disabled', true);
        buyFrom.storeFieldValidation($('#store-check-postcode'), e);
      });
    },
    toggleCheckStock: function (e) {
      var $target = e ? $(e.target) : $('.stockAvailability #checkStock'),
        postCodeFld = $('.stockAvailability').find('#pcFieldWrapper');

      if (!postCodeFld.is(':visible')) {
        buyFrom.showPostCodeFld(e);
      } else {
        buyFrom.hidePostCodeFld(e);
      }
      return false;
    },
    showPostCodeFld: function (e) {
      var $target = e ? $(e.target) : $('.stockAvailability #checkStock'),
        postCodeFld = $('.stockAvailability').find('#pcFieldWrapper');

      postCodeFld = e.type ? postCodeFld : $('.stockAvailability').find('#store-check-postcode');

      if (common.isTouch()) {
        postCodeFld.show();
      } else {
        postCodeFld.slideDown();
      }

      $target.addClass('open');

      return false;
    },
    hidePostCodeFld: function (e) {
      var $target = e ? $(e.target) : $('.stockAvailability #checkStock'),
        postCodeFld = $('.stockAvailability').find('#pcFieldWrapper');

            // postcodeValidator.resetForm();

      if (common.isTouch()) {
        postCodeFld.hide();
      } else {
        postCodeFld.slideUp();
      }

      $target.removeClass('open');
      $('.stockService').css({ height: 'auto', overflow: 'hidden' });
      return false;
    },
    storeFieldValidation: function ($txtObj, e) {
      if ($txtObj.val().length > 0) {
        if ($txtObj.prev().attr('class') != 'undefined' && $txtObj.prev().attr('class') == 'error') {
          $txtObj.removeClass('error');
          $txtObj.prev().remove();
          $('#stockCheckForm label').show();
        }
                // $('#stockSubmit').prop('disabled', false);
        var sHeight = $('#nearestStore').is(':visible') ? '191px' : '113px';
        $('.stockService').append('<div class="storeLoader">Checking local stock</div>').css({ height: sHeight, overflow: 'hidden' });
        buyFrom.getStockStoreDetails(e, $(e.target));
      } else {
        if (!$txtObj.hasClass('error')) {
          $txtObj.before('<span class="error">Postcode or town invalid</span>').addClass('error');
          $('#stockCheckForm label').hide();
        }
        $('#stockSubmit').prop('disabled', false);
      }
    },
    getStockStoreDetails: function (e, $elem) {
      e.preventDefault();
      var myInlineRequests = [],
        _myInlineRequests = [];
      var _myRequests = {
        storeCall: ['stockForm', 'storesArray', 'stockMapDetails', 'stockStoreInfo', 'stockError']
      };
      var _myModules = {
        stockForm: ['#stockForm', '', false],
        storesArray: ['#storesArray', '', true],
        stockMapDetails: ['#stockMapDetails', '', true],
        stockStoreInfo: ['.stockStoreInfo', '', true],
        stockError: ['.invalid2', '', true]
      };

      var _myActions = {
        storeCall: ['/stubs/delivery-options.php']
      };
      var _myDefaultActions = {
        storeCall: ['/stubs/delivery-options.php']
      };

      Data.Global.init({
        inlineRequests: _myInlineRequests,
        requests: _myRequests,
        modules: _myModules,
        actions: _myActions,
        defaultActions: _myDefaultActions
      });

      var _request = 'storeCall';
      var DL = new Data.DataLayer();
      var $form = utils.getFormByElement($elem);
      var myData = $form.serialize();
      var _url = Data.Utils.getAction(_request);

      DL.get(null, myData, $elem, null, _request, null, null, function (data) {
        var storeResponse = JSON.parse(data.responseText);
        var $postCodeFld = ($form.attr('id') === 'stockCheckForm') ? $('#store-check-postcode') : $('#store-check-postcode1');
        if (storeResponse.stockForm) {
          if ($postCodeFld.prev().attr('class') != 'undefined' && $postCodeFld.prev().attr('class') == 'error') {
            $postCodeFld.removeClass('error');
            $postCodeFld.prev().remove();
          }
          var overlayContent = storeResponse.stockForm + storeResponse.storesArray + storeResponse.stockMapDetails;
          var params = {
            content: overlayContent,
            customClass: 'storeDetailsOverlay',
            hideOnOverlayClick: true,
            hideOnEsc: true
          };

          if (breakpoint.hTablet || breakpoint.mobile || breakpoint.vTablet) {
            var backLink = "<a href='#' class='back'><span class='icon' data-icon='g' aria-hidden='true'></span> Back </a>";
            var opts = {
              content: backLink + overlayContent,
              closeSelector: '.back'
            };
            common.virtualPage.show(opts);
            $('#virtual-page').addClass('stockVirtualPage');
            $('.stockService').css({ height: 'auto', overflow: 'hidden' });
          } else {
            overlay.show(params);
          }
          $('#stockCheckForm label').show();
          $('#stockSubmit').prop('disabled', false);
          buyFrom.storeMap(e, storeResponse, $postCodeFld);
          $('.storeLoader').remove();
          $('.stockService').css({ height: 'auto', overflow: 'hidden' });
          return;
        }
        if (storeResponse.stockError) {
          if (!$postCodeFld.hasClass('error')) {
            var errorText = $($.parseHTML(storeResponse.stockError)).html();
            $postCodeFld.before('<span class="error">' + errorText + '</span>').addClass('error');
            $('#stockCheckForm label').hide();
            $('#stockSubmit').prop('disabled', false);
            $('.stockService').css({ height: 'auto', overflow: 'hidden' });
          }
          $('.storeLoader').remove();
          $('.stockService').css({ height: 'auto', overflow: 'hidden' });
          return;
        }
      });
    },
    storeMap: function (e, response, $postCodeFld) {
      var storesLatLong = $(response.storesArray).find('#coordinates'),
        latLongArray = [],
        activePinIndex = 0,
        liStoresArray = $(response.storesArray).find('li'),
        maxStoresPerPage = 5;
      var infobox;
      var visibleStoreArray;
      var defaultStoreTiming;
      var currentStoreIndex, prevStoreIndex = 0;

      if (liStoresArray.length > maxStoresPerPage) {
        $('#storesArray ul').find('li:gt(4)').hide();
        visibleStoreArray = $('#storesArray li:visible');
      }


      $('#overlayStockSubmit').off().on(buyFrom.clickEvent, function (e) {
        e.preventDefault();
        e.stopPropagation();
        buyFrom.storeFieldValidation($('#store-check-postcode1'), e);
        $('.moreStoreLink').addClass('moreStoreLinkDisabled');
        $('.moreStoreLink').off('click');
      });

      $(visibleStoreArray).each(function (i) {
        var storeTimings;
        $('.storeDetails:visible a.storeLink').on('click', $(this), function (e) {
          e.preventDefault();
          if (breakpoint.hTablet || breakpoint.mobile) {
            return false;
          } else {
            $('#storesArray ul li').removeClass('highlightStore');
            $(this).parent().addClass('highlightStore');
            buyFrom.storeMap.storeClick($(this), i);
          }
        });

        $(this).mouseover(function () {
          $(this).addClass('highlightStore');
        })
                    .mouseout(function () {
                      if ($(this).find('.selectedStore').length == 0) {
                        $(this).removeClass('highlightStore');
                      }
                    });
      });

      $('.closeMsg').each(function (i) {
        $('.closeMsg').on(buyFrom.clickEvent, $(this), function (e) {
          e.preventDefault();
          e.stopPropagation();
          $(this).parent().fadeOut();
          return;
        });
      });

      $('.storeInfo').each(function (i) {
        $(this).on(buyFrom.clickEvent, function (e) {
          e.preventDefault();
          e.stopPropagation();
          if (breakpoint.mobile) {
            if ($(this).parent().siblings('#collectiveData').length > 0) {
              $(this).removeClass('open');
              $(this).parent().siblings('#collectiveData').remove();
            } else {
              var $timingDiv = $('<div />');
              $timingDiv.html($(this).parent().nextAll('#timings').html());
              $timingDiv.attr('id', 'collectiveData');
              $(this).parent().siblings('.stockStatus').after($timingDiv);
              $(this).addClass('open');
            }
          } else if (breakpoint.hTablet || breakpoint.vTablet) {
            if (!$(this).parent().nextAll('#timings').is(':visible')) {
              $(e.target).parent().parent().css('height', 'auto');
              $(this).parent().nextAll('#timings').show();
              $(this).addClass('open');
            } else {
              $(e.target).parent().parent().css('height', '92px');
              $(this).parent().nextAll('#timings').hide();
              $(this).removeClass('open');
            }
          }
          $(this).parent().find('#storeValue').html($('#store-check-postcode').val());
          $('#nearestStore').html($(this).parent().html() + $(this).parent().next()[0].outerHTML);
          $('#nearestStore').show();
          $('#checkStock span').html('Check stock in other stores');
        });
      });

      $('.storeTIme').each(function (i) {
        var timeTxt = $(this).text().trim();
        if (/[0-9]/.test(timeTxt)) {
          if (timeTxt.length > 11) {
            $(this).text(timeTxt.substr(0, 11));
          }
        }
      });

      $('a.moreStoreLink').on(buyFrom.clickEvent, $(this), function (e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).fadeOut(1000, function () {
          $('.moreStoreLinkHolder').addClass('loadingBar').delay(1000).queue(function () {
            $(this).removeClass('loadingBar').dequeue();
            $('#storesArray').css({
              height: '351px'
            });
            $('#storesArray ul').find('li:gt(4)').fadeIn(1000);
                        // $('#storesArray ul').find('li:gt(4)').show('slow');
            $('#storesArray ul').css('margin-right', '10px');
            $('#storesArray').animate({
              scrollTop: $('#storesArray ul li:nth-child(5)').position().top
            }, 2000);
          });
        });
        visibleStoreArray = $('#storesArray ul li');
        $(visibleStoreArray).each(function (i) {
          buyFrom.storeMap.createPins(i);
          $('.storeDetails a.storeLink').on('click', $(this), function (e) {
            e.preventDefault();
            $('#storesArray ul li').removeClass('highlightStore');
            $(this).parent().addClass('highlightStore');
            buyFrom.storeMap.storeClick($(this), i);
          });
          $(this).mouseover(function () {
            $(this).addClass('highlightStore');
          })
                        .mouseout(function () {
                          if ($(this).find('.selectedStore').length == 0) {
                            $(this).removeClass('highlightStore');
                          }
                        });
        });
      });

      $('.disabledReserve').on(buyFrom.clickEvent, $(this), function (e) {
        e.preventDefault();
        e.stopPropagation();
      });

            // get location details for group (show 3 of group)
      storesLatLong.each(function (i, el) {
        var lat = parseFloat($('#lat', this).text(), 10),
          lon = parseFloat($('#lon', this).text(), 10);

        latLongArray.push({
          lat: lat,
          lon: lon
        });
      });

            // plot locations on map
      var locations = [],
        i;
      for (i = 0; i < latLongArray.length; i++) {
        locations.push(new Microsoft.Maps.Location(latLongArray[i].lat, latLongArray[i].lon));
      }
            // generate map
      var map = common.getMap($('#stockMapDetails'), $('#mapContainer'), locations);

      buyFrom.storeMap.storeClick = function ($this, i) {
        $('#storesArray ul li:nth-child(' + (i + 1) + ')').find('.storeIndex').removeClass('selectedStore');
        currentStoreIndex = $this.attr('id');
        activePinIndex = parseInt($this.attr('id'));
        buyFrom.storeMap.createPins(i);
        storeTimings = $this.parent().find('#timings').html();
        $('.stockStoreInfo').html(storeTimings);
        $this.parent().find('.storeIndex').addClass('selectedStore');
        prevStoreIndex = currentStoreIndex;
        $this.parent().find('#storeValue').html($postCodeFld.val());
        $('#nearestStore').html($this.html() + $this.next()[0].outerHTML);
        $('#nearestStore').show();
        $('#checkStock span').html('Check stock in other stores');
      };

            // create pins
      buyFrom.storeMap.createPins = function (index) {
                // set group locations
        var pushpinOptions = {
          icon: (activePinIndex === index) ? globalStaticAssetsPath + 'map-pin-selected.png' : globalStaticAssetsPath + 'map-pin.png',
          width: 27,
          height: 42,
          typeName: (activePinIndex === index) ? 'map-pin-selected' : 'map-pin',
          textOffset: new Microsoft.Maps.Point(0, 6),
          text: (index + 1).toString()
        };

                // create pin
        var pin = new Microsoft.Maps.Pushpin(locations[index], pushpinOptions);

                // add pushpin to map
        map.entities.push(pin);

        buyFrom.storeMap.createInfoBox(activePinIndex);
        buyFrom.storeMap.showStoreDetOnMap(map);

                // attach click events to pushpin
        var pinClick = Microsoft.Maps.Events.addHandler(pin, 'click', function (vi) {
                   // vi.originalEvent.preventDefault();
          activePinIndex = parseInt(pin._text) - 1;
          buyFrom.storeMap.showDetailOnPin(pin, vi.originalEvent);
        });
      };

      buyFrom.storeMap.createInfoBox = function (activeIndex, ev) {
                // remove already existing info box
        for (var i = 0; i < map.entities.getLength(); i++) {
                    // not a push pin
          var entity = map.entities.get(i);
          if (entity._typeName === 'Infobox') {
                        // hide if visible
            if (entity._options.visible) {
              entity.setOptions({
                visible: false
              });
            }
          }
          if (ev != undefined) {
            if (entity._typeName === 'map-pin-selected') {
                            // de-highlight
              entity.setOptions({
                icon: globalStaticAssetsPath + 'map-pin.png',
                typeName: 'map-pin'
              });
            }
          }
        }

                // create infobox
        var infoboxContent = $(liStoresArray).find('a.storeLink').eq(activeIndex).find('.storeName').html().toLowerCase() + '<br/>' +
                    '(' + $(liStoresArray).find('a.storeLink').eq(activeIndex).find('.storeDistance').html() + ')';

        var infoboxOptions = {
          visible: true,
          offset: new Microsoft.Maps.Point(-7, 28),
          showCloseButton: true,
          height: 50,
          width: 190,
          description: infoboxContent
        };


        infobox = new Microsoft.Maps.Infobox(locations[activeIndex], infoboxOptions);

        var infoClick = Microsoft.Maps.Events.addHandler(infobox, 'click', function (vi) {
          vi.originalEvent.preventDefault();
          var isClose = $(vi.originalEvent.target).is('.infoClose');
          if (isClose) {
            infobox.setOptions({
              visible: false
            });
          }
        });
        map.entities.push(infobox);

        if (ev != undefined) {
          var pushpinOptions = {
            icon: globalStaticAssetsPath + 'map-pin-selected.png',
            width: 27,
            height: 42,
            typeName: 'map-pin-selected',
            textOffset: new Microsoft.Maps.Point(0, 6),
            text: (activeIndex + 1).toString()
          };

                    // create pin
          var clickedPin = new Microsoft.Maps.Pushpin(locations[activeIndex], pushpinOptions);

                    // add pushpin to map
          map.entities.push(clickedPin);
                    // attach click events to pushpin
          var pinClick = Microsoft.Maps.Events.addHandler(clickedPin, 'click', function (vi) {
            buyFrom.storeMap.showDetailOnPin(clickedPin, vi.originalEvent);
          });
        }
      };

      buyFrom.storeMap.showStoreDetOnMap = function (map) {
        for (var i = 0; i < map.entities.getLength(); i++) {
                    // not a push pin
          var entity = map.entities.get(i);
          if (entity._typeName === 'Infobox') {
                        // hide if visible
            if (entity._options.visible) {
              entity.setOptions({
                visible: false
              });
            }
          }
        }

        infobox.setOptions({
          visible: true
        });
        map.setView({
          center: infobox.getLocation(),
          centerOffset: new Microsoft.Maps.Point(0, 130)
        });
      };
      buyFrom.storeMap.showDetailOnPin = function (pin, ev) {
        var clickedIndex = parseInt(pin._text) - 1;
        var storeTimingCont;
        buyFrom.storeMap.createInfoBox(clickedIndex, ev);
        storeTimingCont = $('#storesArray ul li').eq(clickedIndex).find('#timings').html();
        $('.stockStoreInfo').html(storeTimingCont);
        $('#storesArray ul li').eq(prevStoreIndex).find('.storeIndex').removeClass('selectedStore');
        currentStoreIndex = clickedIndex;
        $('#storesArray ul li').eq(clickedIndex).find('.storeIndex').addClass('selectedStore');
        $('#storesArray ul li').eq(prevStoreIndex).removeClass('highlightStore');
        $('#storesArray ul li').eq(clickedIndex).addClass('highlightStore');
        if (parseInt(pin._text) > 5) {
          $('#storesArray').scrollTop($('#storesArray')[0].scrollHeight);
        } else {
          $('#storesArray').scrollTop(0);
        }
        prevStoreIndex = currentStoreIndex;
        map.setView({
          center: infobox.getLocation(),
          centerOffset: new Microsoft.Maps.Point(0, 130)
        });
        var storeDet = $('#storesArray ul li').eq(clickedIndex).find('a.storeLink');
        $('#storeValue').html($postCodeFld.val());
        $('#nearestStore').html(storeDet.html() + storeDet.next()[0].outerHTML);
        $('#nearestStore').show();
        $('#checkStock span').html('Check stock in other stores');
      };

            // loop through group locations and create pins with info boxes!
      for (i = 0; i < visibleStoreArray.length; i++) {
        buyFrom.storeMap.createPins(i);
      }

            // display default store i.e first store on overlay open
      defaultStoreTiming = $('#storesArray ul li:nth-child(1)').find('#timings').html();
      $('.stockStoreInfo').html(defaultStoreTiming);
      $('#storesArray ul li:nth-child(1)').find('.storeIndex').addClass('selectedStore');

      return false;
    },
    populateBuyBoxesFromDom: function () {
      var self = null,
        seller = $(buyFrom.module).find('.other-sellers .seller'),
        firstDeliveryElemText = '',
        collapsedDOelem = null,
        collapsedDOULelem = null,
        price = '',
        image = null;

      function replaceDeliveryDurations(s) {
        return s.replace('(next day *)', '').replace('(2-5 days*)', '');
      }

      if (seller.length) {
        seller.each(function () {
          self = $(this);
                    // Delivery...
          firstDeliveryElemText = replaceDeliveryDurations(self.find('.delivery ul > li > a:first').text());
          collapsedDOelem = self.find('.collapsed-DO');
          collapsedDOULelem = collapsedDOelem.find('ul');
          collapsedDOULelem.html('<li>' + firstDeliveryElemText + '</li>');
                    // Price...
          price = collapsedDOULelem.data('price');
          self.find('.current-price').html(price);
                    // Image...
          image = collapsedDOelem.find('img').removeClass('displayNone');
          self.find('.header-wrapper .available-from').after(image);
          self.find('div.price-info').show();
                    // Hide loader...
          collapsedDOelem.find('.loader').hide();
        });
      }
    },
    moduleExists: function () {
      return $(this.module).length > 0;
    },

    Handler: {
      handler: function (oJSON) {
        var oWebAnalytics,
          sModuleSelector,
          sMarkup,
          $optionalContainer;

        $.each(oJSON, function (k, v) {
          if (k === 'analytics') {
            oWebAnalytics = new analytics.WebMetrics();
            oWebAnalytics.submit(v);
          } else if (k === 'redirection') {
            window.location.href = v;
          } else {
            if (common.isPage('basket')) {
              sModuleSelector = '.' + k;
            } else {
              sModuleSelector = '#' + k;
            }
            sMarkup = buyFrom.Handler.cleanMarkup(v.deliveryOptionsHTML);
            try {
              if (sMarkup !== '') {
                $optionalContainer = $(sModuleSelector).find('.newDeliveryOptions');
                if (!$optionalContainer.length) {
                  $optionalContainer = $(sModuleSelector);
                }
                if (common.isPage('basket')) {
                  $optionalContainer.html(sMarkup);
                } else {
                  $optionalContainer.get(0).innerHTML = sMarkup;
                }
              }
            } catch (ignore) {}
          }
        });
      },
      cleanMarkup: function (sHTML) {
        var markup = (sHTML !== null) ? sHTML.replace(/<(script|style|title)[^<]+<\/(script|style|title)>/gm, '').replace(/<(link|meta)[^>]+>/g, '') : '';

        return markup;
      }
    },

    setup: function ($module) {
      this.toggleAlternativeSellerLinks($module);
      if ($module.find('.options ul').length > 0 && this.isDesktop()) {
        this.initAccordians($module.find('.options ul'));
      } else if ($module.find('.options ul').length > 0 && !this.isDesktop()) {
        this.initAccordians($module.find('.offers ul'));
      }
            // this.setButtonStates($module.find(".quantity input"));
      this.bindEvents($module);
    },

    isDesktop: function () {
      return breakpoint.desktop || breakpoint.largeDesktop || breakpoint.vTablet || breakpoint.hTablet;
    },

    doAlternativeSellerLinksExist: function ($module) {
      return $module.find('a.details').length > 0;
    },

    toggleAlternativeSellerLinks: function ($module) {
      var module = $module || $('.buy-from'),
        linksExist = buyFrom.doAlternativeSellerLinksExist(module),
        breakPointRequiresLinks = (!linksExist && breakpoint.mobile) || (!linksExist && breakpoint.vTablet) || (!linksExist && breakpoint.hTablet),
        breakPointRequiresDivs = (linksExist && breakpoint.desktop) || (linksExist && breakpoint.largeDesktop);
      if (breakPointRequiresLinks) {
        buyFrom.amendAlternativeSellerDetails(module, true);
      } else if (breakPointRequiresDivs) {
        buyFrom.amendAlternativeSellerDetails(module, false);
      }
    },
    toggleStockOverlay: function () {
      if ($('.stockAvailability').length) {
        common.virtualPage.page.length = 0;
        $('.stockService').css({ height: 'auto', overflow: 'hidden' });
        overlay.hide();
      }
    },
        // Can take optional params: $module, requiresLink
    amendAlternativeSellerDetails: function () {
      return;
    },

    initAccordians: function (list) {
      list.each(function () {
        var listShown, specialOfferLinks, showMore,
          thisItem = $(this).parents('.newDeliveryOptions'),
          count = thisItem.data('count') - 1;

        if (count === undefined || isNaN(count)) {
          count = -1;
        }

        listShown = 'li:gt(' + count + ')';
        if (count === -1) {
          listShown = 'li.description';
        }

        if ($(this).parent().hasClass('offers')) {
          $(this).find('li:gt(0)').hide();
        } else {
          $(this).find(listShown).hide();
        }

                // if there is only 1 special offers list item then hide the show more link

        $('.buy-from .offers ul').each(function () {
          specialOfferLinks = $(this).find('li');
          showMore = $(this).next('.show-more');

          if (specialOfferLinks.length <= 1) {
            showMore.hide();
          } else {
            showMore.show();
          }
        });
      });
    },

    addAccordianLink: function (list) {
      if (list.siblings('.show-more').length <= 0) {
        list.after("<a href='#' class='show-more'><span>" + list.parent('div').data('closed-text') + '</span></a>');
      }
    },

    showItems: function (link) {
      var list = link.siblings('ul'),
        container = list.parent(),
        thisItem = list.parents('.newDeliveryOptions'),
        count = thisItem.data('count') - 1;

      if (!link.hasClass('open')) {
        list.find('.active').hide();
        list.find('li, p, .non-active').show({
          duration: 200,
          complete: pdp.changeColumnLayout
        });
        if (container.hasClass('newDeliveryOptions')) {
          link.html('Show less delivery options').addClass('open');
        } else {
          link.text(link.data('clicktext')).addClass('open');
        }
      } else {
        list.find('.active').show();

        if (container.hasClass('newDeliveryOptions')) {
          list.find(' li:gt(' + count + '), p, .non-active, .description').hide({
            duration: 200,
            complete: pdp.changeColumnLayout
          });
          link.html('Show all delivery options').removeClass('open');
        } else {
          list.find('li:gt(0), p, .non-active, .description').hide({
            duration: 200,
            complete: pdp.changeColumnLayout
          });
          link.text(link.data('closedtext')).removeClass('open');
        }
      }
    },
    listToggleExpand: function (link) {
      var list = link.siblings('ul'),
        currentText = link.text();

      if (!link.hasClass('open')) {
        list.find('li').not('[data-init-active="true"]').show();
        link.css({
          'min-width': link.innerWidth()
        });
        link.html(link.data('clicktext')).addClass('open');
      } else {
        list.find('li').not('[data-init-active="true"]').hide();
        link.html(link.data('clicktext')).removeClass('open');
      }
      link.data('clicktext', currentText);
    },

    bindEvents: function ($module) {
      var byFromElem,
        quantityInput = $module.find('.quantity input'),
        quantity,
        decreaseButton = quantityInput.siblings('a').not('.increase');

      quantity = quantityInput.length ? quantityInput.val() : undefined;
            // if (window.isKiosk()) {
      if (quantity === 1) {
        decreaseButton.addClass('disabled');
      }
      $module.find('.quantity a').on('click', function (e) {
        var $self = $(this);
        buyFrom.incrementQuantity($self);
        e.preventDefault();
      });
      if (quantityInput) {
        quantityInput.on('change', function () {
          var $self = $(this);
          buyFrom.updateQuantity($self);
        });
      }
            // }
            /* Check to see if device is a Hudl first because IE10 doesn't recognise special characters, therefore doesn't valiate */
      if (common.isHudl()) {
                /* Fix for HUDL - to slice the characters to 2 if the user types more than 2 */
        quantityInput.on('keyup', function (e) {
          var $self = $(this),
            maxlength = $self.attr('maxlength'),
            lengthValue = $self.val().length,
            finalText;

          if (lengthValue >= maxlength || !$.isNumeric($self.val())) {
            finalText = $(this).val().slice(0, maxlength);
            $(this).val(finalText);
            e.stopImmediatePropagation();
            return false;
          }
        });
      }
            /* Fix for HUDL */


      $module.find('.show-more').on('click', function (e) {
        e.preventDefault();
        buyFrom.showItems($(this));
      });
      $module.find('.promoMoreAvailible').on('click', function (e) {
        e.preventDefault();
        buyFrom.listToggleExpand($(this));
      });
      $module.find('a.active').on('click', function (e) {
        e.preventDefault();
        $module.find('.show-more').trigger(e.type);
      });

      if ($('p.quantity-errMsg').length) {
        buyFrom.throwQuantityValidationError(quantityInput);
      }
            // insert alternative seller show more link
      $('.collapsed-DO').after('<span class="seller-toggle">More<span aria-hidden="true" class="icon">2</span></span>');

      byFromElem = $(buyFrom.module);

      byFromElem.off('click', '.options li a');
      byFromElem.on('click', '.options li a', function (e) {
        if (!$(e.target).parents('.popup').length && !$(e.target).is('.close .icon')) {
          buyFrom.deliveryOptionPopup(e);
        } else if ($(e.target).parents('.popup').length && !$(e.target).is('.close .icon')) {
          document.location.href = $(e.target).prop('href');
        }
      });

      byFromElem.on('click', '.popup, .popup a.close', buyFrom.deliveryOptionClose);
            // on click of other seller buy box toggle content accordingly
      byFromElem.on('click', '.other-sellers .seller .details .seller-toggle', buyFrom.alternativeSellerToggle);

      $(document).on('click', buyFrom.deliveryOptionClose);
    },

    incrementQuantity: function (link) {
      var isIncreasing = link.hasClass('increase'),
        quantityInput = link.siblings('input'),
        currentValue = quantityInput.val(),
        newValue = isIncreasing ? parseInt(currentValue, 10) + 1 : parseInt(currentValue, 10) - 1;
      buyFrom.updateQuantity(quantityInput, newValue);
    },


    triggerTooltip: function ($link) {
      var $next, html;

      if ($link.hasClass('add-to-wishlist')) {
        $next = $link.next('.user-wishlists');
      }
      if ($link.hasClass('stock-alerts')) {
        $next = $link.parents('.buy-box-stock-alerts').find('.tooltip-register-for-alerts');
      }

      html = $next.length ? $next.html().trim() : '';
      if (html !== '') {
        if (!breakpoint.mobile && !breakpoint.vTablet && !breakpoint.hTablet) {
          common.tooltip.show({
            trigger: $link,
            html: html,
            closeTriggers: '.secondary',
            callback: buyFrom.bindCustomTooltipEvents
          });
        } else {
          overlay.show({
            content: '<div class="generic">' + html + '</div>',
            callback: buyFrom.bindCustomTooltipEvents,
            fixedWidth: '280'
          });
        }
      }
    },

    bindCustomTooltipEvents: function (tooltip) {
      var addToWishlistTrigger = tooltip.find('.add-item-to-wishlist'),
        registerForStockAlertsButton = tooltip.find('.secondary-button'),
        doNotRegisterForStockAlertsButton = tooltip.find('.tertiary-button');

      registerForStockAlertsButton.on('click tap', function (e) {
        e.preventDefault();
        if (tooltip.attr('id') === 'lightbox') {
          overlay.hide();
        } else {
          common.tooltip.hide(tooltip);
        }
        buyFrom.registerStockAlerts($(this));
      });

      doNotRegisterForStockAlertsButton.on('click tap', function (e) {
        e.preventDefault();
        if (tooltip.attr('id') === 'lightbox') {
          overlay.hide();
        } else {
          common.tooltip.hide(tooltip);
        }
      });

      addToWishlistTrigger.on('click tap', function (e) {
        e.preventDefault();
        if (common.isLoggedIn()) {
          if (tooltip.attr('id') === 'lightbox') {
            overlay.hide();
          } else {
            common.tooltip.hide(tooltip);
          }
          buyFrom.addToWishlist(tooltip);
        }
      });
    },

    addToWishlist: function (button) {
      return button;
    },

    registerStockAlerts: function (button) {
      return button;
    },

    setButtonStates: function ($input) {
      var currentValue = parseInt($input.val(), 10),
        increaseButton = $input.siblings('.increase'),
        decreaseButton = $input.siblings('a').not('.increase');
      decreaseButton.attr('disabled', !buyFrom.isRangeValid($input, currentValue - 1));
      increaseButton.attr('disabled', !buyFrom.isRangeValid($input, currentValue + 1));
    },

        // prevent add to basket button submitting form if error in qty field
    buyBoxQty: function () {
      var buyBoxQty = $('.buy-from .buy form');
      buyBoxQty.each(function () {
        $(this).validate({
          submitHandler: function (form) {
            if (!$(form).find('.stock-alerts').length) {
              var $buyBoxInput = $(form).find('.quantity input'),
                buyBoxInputRange = buyFrom.isRangeValid($buyBoxInput);
              if (buyBoxInputRange) {
                form.submit();
              } else {
                buyFrom.throwQuantityValidationError($buyBoxInput);
                return false;
              }
            } else {
              form.submit();
            }
          }
        });
      });
    },
    checkQuantityRange: function checkQuantityRange($buyBoxQty) {
      var $buyBoxInput = $('.quantity input'),
        buyBoxInputRange = buyFrom.isRangeValid($buyBoxInput);

      if (buyBoxInputRange) {
        $buyBoxQty.submit();
      } else {
        buyFrom.throwQuantityValidationError($buyBoxInput);
        return false;
      }
    },

    updateQuantity: function (quantityInput, newValue) {
      var isQuantityValid = buyFrom.isRangeValid(quantityInput, newValue),
        decreaseButton = quantityInput.siblings('a').not('.increase'),
        increaseButton = quantityInput.siblings('.increase'),
        val;

      if (isQuantityValid) {
        quantityInput.parents('.quantity').removeClass('error');

        if (newValue) {
          quantityInput.val(newValue);
        }
        buyFrom.setButtonStates(quantityInput);
      } else {
        buyFrom.throwQuantityValidationError(quantityInput);
      }

      val = newValue || quantityInput.val();

      if (val <= 1) {
        decreaseButton.addClass('disabled');
      } else {
        decreaseButton.removeClass('disabled');
      }

      if (val >= 99) {
        increaseButton.addClass('disabled');
      } else {
        increaseButton.removeClass('disabled');
      }
    },

    isRangeValid: function (buyFromTxt) {
      var maxLimit = buyFromTxt.attr('max'),
        inputVal = buyFromTxt.val();

      if (parseInt(inputVal) > parseInt(maxLimit)) {
        return false;
      }
      else {
        return true;
      }
    },

    throwQuantityValidationError: function (quantityInput) {
      var html,
        maxQtyErrorMsg;

      html = "<span class='error'><span class='icon' data-icon='8' aria-hidden='true'></span>" + quantityInput.data('error-text') + '</span>';
      if ($('p.quantity-errMsg').length) {
        maxQtyErrorMsg = $('p.quantity-errMsg').text();
        html = "<span class='error'><span class='icon' data-icon='8' aria-hidden='true'></span>" + maxQtyErrorMsg + '</span>';
      }
      buyFrom.errorTooltip(quantityInput, html);
    },
    errorTooltip: function (quantityInput, html) {
      if (!breakpoint.mobile && !breakpoint.vTablet && !breakpoint.hTablet) {
        var settings = {
          trigger: quantityInput,
          isError: true,
          html: html,
          isInline: false
        };
        common.tooltip.show(settings);
      } else {
        overlay.show({
          content: html,
          isError: true,
          defaultBreakPointBehavior: false,
          fixedWidth: '280'
        });
      }
    },
    deliveryOptionPopup: function (e) {
            // hide all other popups before launching the current one
      e.stopPropagation();
      if ($(e.currentTarget).parent('li').length && !window.isKiosk()) {
        var self = buyFrom,
          deliveryOptionTitle,
          oWebAnalytics,
          v;

        self.deliveryOptionClose(e);
        $(e.target).parents('li').find('div').show();

                // Set omniture on delivery option tooltip
        deliveryOptionTitle = $(e.target).parents('li').find('.del-text').text();
        oWebAnalytics = new analytics.WebMetrics();
        v = [{
          eVar59: deliveryOptionTitle,
          events: 'event32'
        }];
        oWebAnalytics.submit(v);
      }
    },
    deliveryOptionClose: function (e) {
      if (!window.isKiosk()) {
        if ($(e.target).parents('.newDeliveryOptions').length) {
          e.preventDefault();
        }
        $(buyFrom.module).find('.popup').hide();
      }
    },

    alternativeSellerToggle: function () {
      var self = $(this).parents('.other-sellers').find('> .seller');
      if (self.children('.content').is(':hidden')) {
        self.removeClass('collapsed');
        self.children('.content').show();
        buyFrom.heightCheckForSellerExpand();
        self.find('.oo-stock, .low-stock').removeClass('displayNone');
        self.children('.details').find('.seller-toggle').html('Less<span aria-hidden="true" class="icon">1</span>');
      } else {
        self.addClass('collapsed');
        self.children('.content').hide();
        buyFrom.heightCheckForSellerExpand();
        self.find('.oo-stock, .low-stock').addClass('displayNone');
        self.children('.details').find('.seller-toggle').html('More<span aria-hidden="true" class="icon">2</span>');
      }
    },

        // Increase the height of the page wrapper in accordance with the sidebar
    heightCheckForSellerExpand: function (noChange) {
      var $pageContainer = $('#page-container'),
        mainHeight = parseInt($('#main-content').height(), 10),
        sideHeight = parseInt($pageContainer.find('.secondary-content').height(), 10);

      if (sideHeight > mainHeight) {
        $pageContainer.css('min-height', sideHeight + 130);
      } else if (!noChange) {
        $pageContainer.css('min-height', mainHeight);
      }
    },
    orientationChageEvents: function () {
      if (window.addEventListener) {
        window.addEventListener('orientationchange', function () {
          if ($('.tooltipPopup:visible').length) {
            common.richTexttooltipPopup.checkTooltipPos($('.tooltipPopup:visible').prev('.fnToolTip'));
          }
        }, false);
      }
    }
  };
  breakpoint.mobileIn.push(function () {
    buyFrom.toggleAlternativeSellerLinks();
  });

  breakpoint.mobileOut.push(function () {
    buyFrom.toggleStockOverlay();
  });
  breakpoint.vTabletIn.push(function () {
    buyFrom.toggleAlternativeSellerLinks();
    buyFrom.toggleStockOverlay();
  });
  breakpoint.hTabletIn.push(function () {
    buyFrom.toggleAlternativeSellerLinks();
    buyFrom.toggleStockOverlay();
  });
  breakpoint.desktopIn.push(function () {
    buyFrom.toggleAlternativeSellerLinks();
  });
  breakpoint.largeDesktopIn.push(function () {
    buyFrom.toggleAlternativeSellerLinks();
  });
  breakpoint.kioskIn.push(function () {
    buyFrom.toggleAlternativeSellerLinks();
  });

  return buyFrom;
});
