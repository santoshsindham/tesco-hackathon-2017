/* eslint-disable */
/**
 * Common Module : Utility/common functions to be used accross modules
 */
define(['domlib',
        'modules/breakpoint',
        'modules/settings/common'],
        	function ($, breakpoint, SETTINGS) {
          var common = {

            basketIsActive: false,
            currentPage: '',
            deferredInit: [],

            constants: {
              PAGE_SPC: 'SPC'
            },

            compareArraysOutputMatchedResult: function (aArraySource, aArrayTarget) {
              var i,
                j,
                aUpdatedArray = [];

              if (!aArraySource || !aArrayTarget) {
                return false;
              }

              for (i in aArrayTarget) {
                for (j in aArraySource) {
                  if (aArraySource[j].id === aArrayTarget[i]) {
                    aUpdatedArray.push(aArraySource[j]);
                  }
                }
              }

              return aUpdatedArray;
            },

            getAllKioskUserAgentValues: function getAllKioskUserAgentValues() {
              if (window.isKiosk()) {
                var aUserAgentValues = window.navigator.userAgent.match(/(storeid|kioskname)=[0-9{4}a-z]+/gi),
                  oUserAgentsOutput = {};
                try {
                  oUserAgentsOutput.storeId = aUserAgentValues[0].split('=')[1].toString();
                  oUserAgentsOutput.kioskName = aUserAgentValues[1].split('=')[1].toString();
                  return oUserAgentsOutput;
                } catch (e) {
                  console.log(e.message);
                }
              }
            },

            getKioskStoreId: function getKioskStoreId() {
              var oKioskUserAgent,
                storeId = '';

              if (typeof common.getAllKioskUserAgentValues === 'function') {
                oKioskUserAgent = common.getAllKioskUserAgentValues();
                if (typeof oKioskUserAgent === 'object') {
                  if (oKioskUserAgent.storeId !== undefined) {
                    storeId = oKioskUserAgent.storeId;
                  }
                }
              }
              return storeId;
            },
        // Hide keyboard on iOS devices
            hideKeyboard: function () {
              document.activeElement.blur();
              $('input').blur();
            },

            isBuildKit: function isBuildKit() {
              return !SETTINGS.ENV ? false : (SETTINGS.ENV === 'buildkit' ? true : false);
            },

            initDeferredMethods: function ($container) {
              for (var i = 0; i < common.deferredInit.length; i++) {
                common.deferredInit[i]($container);
              }
            },

            isInIframe: function isInIframe() {
              try {
                return window.self !== window.top;
              } catch (e) {
                return true;
              }
            },

            isPage: function (isPageX) {
            // Values are: homepage, PLP, PDP, basket, SPC, login, orderConfirmation, legacy
              if (this.currentPage === '') {
                if ($('.homepage').length) {
                  this.currentPage = 'homepage';
                } else if ($('#listing').length) {
                  this.currentPage = 'PLP';
                } else if ($('.product-description').length || $('body.PDP-Version2').length) {
                  this.currentPage = 'PDP';
                } else if ($('#basket-attach').length) {
                  this.currentPage = 'basketAttach';
                } else if ($('#basket-primary').length) {
                  this.currentPage = 'basket';
                } else if ($('#existing-customer').length) {
                  this.currentPage = 'login';
                } else if ($('#delivery-wrapper').length) {
            this.currentPage = 'SPC';
          } else if ($('#wrapper.order-details-wrapper').length) {
              this.currentPage = 'orderDetails';
            } else if ($('#order-confirmation-header').length) {
                this.currentPage = 'orderConfirmation';
              } else if ($('.compare-page').length) {
                  this.currentPage = 'productComparison';
                } else if ($('html.ie8').length) {
                  this.currentPage = 'legacy';
                }
              }

              if (isPageX) {
                return isPageX === this.currentPage ? true : false;
              } else {
                return this.currentPage;
              }
            },

            addCrossWindowListener: function addCrossWindowListener(callback) {
              if (window.addEventListener) {
                addEventListener('message', callback, false);
              } else {
                attachEvent('onmessage', callback);
              }
            },

            sendCrossWindowMessage: function sendCrossWindowMessage(message, origin) {
              var message = message || {},
                origin = origin || '*';
              if (window.parent) {
                window.parent.postMessage(message, origin);
              }
            },

            cssTransitionsSupported: function () {
              return Modernizr.csstransitions || false;
            },

            scrollToOffset: function (offset) {
              if ($(window).scrollTop() > offset) {
                $('html, body').animate({
                  scrollTop: offset
                });
                return true;
              }
              return false;
            },

            helpRatings: function () {
              $('.feedback-ratings').on('change', 'input[type="radio"]', function (e) {
                var targets = $('.feedback-ratings .ratings').find('div'),
                  eq = $(e.target).val() - 1;

                targets.removeClass('selected');

                targets.filter(function (index) {
                  if (index <= eq) {
                    targets.eq(index).addClass('selected');
                  }
                });
              });
            },

        // Array of functions for app initialisation
            init: [],

            app: function () {
              var i,
                aCopyOfCommon,
                iCommonTaskChunk = Math.ceil(common.init.length / 10); // = common.init.length;
            // loop through array and run any functions
            /*
            for (i = 0; i < common.init.length; i++) {
                common.init[i]();
            }
            */

              aCopyOfCommon = common.init;

              while (aCopyOfCommon.length) {
                aCommonTasks = aCopyOfCommon.splice(0, iCommonTaskChunk);
                (function commonAppArrayLoop(aCommonTasksRef) {
                  setTimeout(function commonAppArrayChunk() {
                    var j,
                      iLen = aCommonTasksRef.length;
                    for (j = 0; j < iLen; j++) {
                      aCommonTasksRef[j]();
                    }
                  }, 4);
                })(aCommonTasks);
              }

              $(window).load(function () {
                window.loaded = true;
              });
            },

            isLoggedIn: function () {
            // temporarily setting to true until class implemented
              return true;
            // return $("#header").hasClass("loggedIn");
            },

        /**
         * Check to see if this device is touch?
         * @return {Boolean} .touch = true, .no-touch = false
         */
            isTouch: function () {
              return $('html').hasClass('touch') || window.navigator.msMaxTouchPoints ? true : false;
            },


        /**
         * Check to see if this device is touch for IE
         * @return {Boolean} .touch = true, .no-touch = false
         */
            isIETouch: function () {
              return window.navigator.msMaxTouchPoints ? true : false;
            },

        /**
         * Check to see if css 3d transforms are supported
         * @return {Boolean} .csstransforms3d = true else false
         */
            isModern: function () {
              return Modernizr.csstransforms3d || false;
            },

        /**
         * Check to see if the browser supports HTML5
         */
            isHTML5: function () {
              function supports_canvas() {
                return !!document.createElement('canvas').getContext;
              }
              return supports_canvas();
            },

            isHudl: function () {
              return /hudl/gi.test(navigator.userAgent);
            },

            isIOS: function () {
              return /(iPad|iPhone|iPod)/gi.test(navigator.userAgent);
            },

            isIOS6: function () {
              return /(iPhone|iPad|iPod)\sOS\s6/.test(navigator.userAgent);
            },

            isIphone: function () {
              return /(iPhone|iPod)/gi.test(navigator.userAgent);
            },

            isOpera: function () {
              return /(opera|opr)/gi.test(navigator.userAgent);
            },

            isFireFox: function () {
              return /firefox/gi.test(navigator.userAgent);
            },
            isIE: function () {
              return /Trident/g.test(navigator.userAgent) || /MSIE/g.test(navigator.userAgent);
            },
            isEdge: function () {
              return /Edge/g.test(navigator.userAgent);
            },
            isIE9OrLower: function () {
              return document.all && !window.atob;
            },

        /**
         * Hide address bar on mobile browsers to make use of the full screen.
         */
            hideAddressBar: function () {
              setTimeout(function () {
                // Hide the address bar!
                window.scrollTo(0, 1);
              }, 0);
            },

        /**
         * Detect version 9 and below of Internet Explorer
         */
            isLegacyIe: function (vers) {
              var Browser = {
                  IsIe: function () {
                    return navigator.appVersion.indexOf('MSIE') != -1;
                  },
                  Navigator: navigator.appVersion,
                  Version: function () {
                    var version = 999;
                    if (navigator.appVersion.indexOf('MSIE') != -1)
                      version = parseFloat(navigator.appVersion.split('MSIE')[1]);
                    return version;
                  }
                },
                vers = vers || 9;
              if (Browser.IsIe && Browser.Version() <= vers) {
                return true;
              } else {
                return false;
              }
            },

        /**
         * Android detect : Android devices need to be treated a little differently
         */
            androidDetect: function () {
              var ua = navigator.userAgent.toLowerCase();
              var isAndroid = ua.indexOf('android') > -1;
              if (isAndroid) {
                $('html').addClass('android');
              }
            },

            isAndroid: function () {
              return $('html').hasClass('android');
            },

        // Android 4.1.1 native browser has some unsual behaviour with new added elements to the DOM, so we need a clause to capture this browser
            isNativeAndroidBrowserForFourPointOne: function () {
              return (navigator.userAgent.match(/android 4.1.1/gi) && navigator.userAgent.match(/mobile safari/gi)) ? true : false;
            },

        /**
         * Samsung galaxy tablet detect
         */
            isGalaxyTab: function () {
              return navigator.userAgent.toLowerCase().match(/gt-p5110/) ? true : false;
            },

            isGalaxyTabNativeBrowser: function () {
              if (common.isGalaxyTab()) {
                return navigator.userAgent.toLowerCase().match(/chrome/) ? false : true;
              }
            },

            isAndroidNativeBrowser: function () {
              var nua = navigator.userAgent;
              return ((nua.indexOf('Mozilla/5.0') > -1 && nua.indexOf('Android ') > -1 && nua.indexOf('AppleWebKit') > -1) && !(nua.indexOf('Chrome') > -1));
            },

        // Orientation fix for samsung galaxy tablet - on orientation change, force the
        // viewport width to reset it.
        // A good test page for this is the basket page: without the following fix,
        // constantly rotating the device causes the layout to break
            orientationViewportFix: function () {
              if (common.isAndroid() && common.isGalaxyTabNativeBrowser()) {
                var viewport = $('meta[name=viewport]');

                // locate the width viewport option and hardcode the device width
                $(window).on('orientationchange', function () {
                  var opts = viewport.attr('content').split(',');

                  for (var i = 0; i < opts.length; i++) {
                    if (opts[i].indexOf('width=') !== -1) {
                      opts[i] = 'width=' + window.screen.width;
                      break;
                    }
                  }

                  viewport.attr('content', opts.join());
                });
              }
            },


        /**
         * Windows phone detect for desktop scripts
         */
            windowsPhoneDetect: function () {
              var ua = navigator.userAgent.toLowerCase();
              var isWindowsPhone = ua.indexOf('windows phone') > -1;
              if (isWindowsPhone) {
                $('html').addClass('windowsPhone');
              }
            },

            isWindowsPhone: function () {
              return $('html').hasClass('windowsPhone');
            },


        /** Dropdown management functions **/

        // Are there any dropdowns active?
            activeDropdownClose: null,


        /**
         * Check if any other dropdowns are visible, if so close them first!
         * @param  {function} toggle The toggle function for the dropdown
         */
            dropdownCheck: function (toggle, parent) {
              if (this.activeDropdownClose !== null) {
                this.activeDropdownClose();
              }

              this.activeDropdownClose = toggle;

              var event = (common.isTouch() && !common.isWindowsPhone()) ? 'tap click' : 'click';

              $('body').on(event, function (e) {
                if (!$(e.target).parents(parent).length) {
                  toggle();
                }
              });
            },


        /**
         * Cleanup dropdown close detection
         */
            clearCancelDropdown: function () {
              this.activeDropdownClose = null;
            },

        /**
         * Disable text selection and dragging of element while using swipe events
         */
            disableSelectionAndDragging: function ($elm) {
              $elm.add($('img, a', $elm)).on('selectstart, dragstart', function () {
                return false;
              });
            },

        // return the joined list item widths
            getListWidth: function ($listElement) {
              var width = 0;

              $listElement.children('li').each(function () {
                width += $(this).outerWidth(true);
              });

              return width;
            },
            tooltip: {
              show: function (settings) {
                var defaults = {
                  html: '',
                  trigger: '',
                  element: '',
                  callback: '',
                  close: false,
                  isError: false,
                  overlay: true,
                  isInline: true,
                  isHover: false,
                  positionAboveTrigger: false
                };

                // extend defaults
                settings = $.extend({}, defaults, settings);

                var trigger = settings.trigger,
                  tooltip = trigger.siblings('.tooltip');

                if (!settings.isHover) {
                  this.insertOverlay();
                }

                this.insertTooltip(trigger, settings);
                this.positionTooltip(trigger, settings);
                this.toggleVisibility(trigger.siblings('.tooltip'));
                this.bindEvents(trigger.siblings('.tooltip'), settings);
                this.triggerCallBackFunction(settings.callback, trigger.siblings('.tooltip'));
              },

              insertOverlay: function () {
                var tooltipOverlay = $('.tooltip-overlay');
                if (!this.isAreaToCatchClicksInserted(tooltipOverlay)) {
                  $('body').append("<div class='tooltip-overlay'></div>");
                  this.bindOverlayEvents($('.tooltip-overlay'));
                } else {
                  tooltipOverlay.css('display', 'block');
                }
              },

              positionTooltip: function (trigger, settings) {
                var tooltipPosition = this.calculateTooltipPosition(trigger),
                  tooltip = trigger.siblings('.tooltip'),
                  originalTop = this.getOriginalTopPosition(tooltip),
                  tooltipTopPosition = tooltipPosition.top + parseInt(originalTop - 4, 10) + 'px';

                if (settings.isInline) {
                  var adjust = 0;

                  tooltipTopPosition = settings.positionAboveTrigger ? (tooltipPosition.top - tooltip.height() - trigger.height() - 9) + 'px' : tooltipPosition.top + parseInt(originalTop - 4, 10) + 'px';

                    // adjust for the basket page
                  if (tooltip.parent('.supplier').length) {
                    adjust = tooltip.parent('.supplier').width() - trigger.width();
                  }
                  if ($('.clubcard-exchange').length) {
                    tooltip.css({
                      top: tooltipTopPosition,
                      left: 'auto',
                      'margin-left': 0 - (tooltip.width() / 2) + (trigger.width() / 2) + adjust + 'px'
                    });
                  } else {
                    tooltip.css({
                      top: tooltipTopPosition,
                      left: 'auto',
                      'margin-left': 0 - (tooltip.width() / 2) + (trigger.width() / 2) + adjust + 'px'
                    });
                  }

                  if (tooltip.offset().left < 0) {
                        // 25 px for arrow half width
                    tooltip.css('margin-left', ((trigger.width() / 2) - 25) + 'px');

                        // check if the 'arrow-left' class is needed
                    if (trigger.offset().left < tooltip.offset().left) {
                      tooltip.addClass('arrow-left');
                    }
                  }
                } else {
                  if (tooltip.parent('.collectionSummary')) {
                    tooltip.css({
                      top: tooltipTopPosition
                    });
                  } else {
                    tooltip.css({
                      top: tooltipTopPosition,
                      left: tooltipPosition.left + 'px',
                      'margin-left': '0'
                    });
                  }
                }
              },
              getOriginalTopPosition: function (tooltip) {
                return tooltip.css('top').split('px')[0];
              },
              isAreaToCatchClicksInserted: function (overlay) {
                return overlay.length > 0;
              },
              bindOverlayEvents: function (overlay) {
                overlay.bind('click', function (e) {
                  common.tooltip.hide($('.tooltip'));
                  e.preventDefault();
                });
              },
              bindEvents: function (tooltip, settings) {
                $(settings.closeTriggers).bind('click', function (e) {
                  common.tooltip.hide(tooltip);
                  e.preventDefault();
                });
              },
              triggerCallBackFunction: function (callback, tooltip) {
                var callbackFunctionExists = typeof (callback) === 'function';
                if (callbackFunctionExists) {
                  callback(tooltip);
                }
              },

              isTooltipVisible: function (element) {
                return element.css('opacity') === 1;
              },
              toggleVisibility: function (element, settings) {
                if (common.cssTransitionsSupported()) {
                  this.toggleShowClass(element);
                } else {
                  this.toggleAnimation(element);
                }
              },
              toggleAnimation: function (element, settings) {
                var self = this;
                var isTooltipVisibleBeforeAnimation = this.isTooltipVisible(element);
                element.animate({
                  opacity: isTooltipVisibleBeforeAnimation ? 0 : 1
                }, 500, function () {
                  self.toggleShowClass(element);
                  self.triggerCallBackFunction();
                });
              },
              removeTooltip: function (element) {
                element.remove();
              },
              insertTooltip: function (element, settings) {
                var extraClass = '',
                  closeLink = '';

                if (settings.close === true) {
                  closeLink = '<a class="close"><span data-icon="y" class="icon"></span></a>';
                }

                if (settings.isError) {
                  extraClass += ' error-tooltip';
                }
                if (settings.positionAboveTrigger) {
                  extraClass += ' above-trigger-tooltip';
                }
                element.after("<div class='tooltip" + extraClass + "'><div class='body'>" + closeLink + settings.html + '</div></div>');
              },
              toggleShowClass: function (tooltip) {
                tooltip.toggleClass('show');
              },
              hide: function (settings) {
                var defaults = {
                  callback: ''
                };
                settings = $.extend({}, defaults, settings);
                $('.tooltip-overlay').css('display', 'none');
                this.toggleVisibility($('.tooltip'));
                this.removeTooltip($('.tooltip'));
                // this.triggerCallBackFunction(settings.callback);
              },
              calculateTooltipPosition: function (trigger) {
                var firstPositionedParentOffset = this.getPositionedParentOffset(trigger),
                  triggerOffset = trigger.offset(),

                  tooltiptopPos = (parseInt(triggerOffset.top + trigger.height(), 10) - parseInt(firstPositionedParentOffset.top, 10)) + parseInt(trigger.css('padding-top'), 10) + parseInt(trigger.css('padding-bottom'), 10),
                  tooltipleftPos = (firstPositionedParentOffset.left - triggerOffset.left) - 13.5,
                  triggerWidth = trigger.width(),
                  isTriggerFullWidth = trigger.parent().width() <= trigger.width() + 5 && trigger.parent().width() >= trigger.width() - 5,
                  tooltipPosition = {
                    top: tooltiptopPos,
                    left: tooltipleftPos,
                    isTriggerFullWidth: isTriggerFullWidth
                  };

                return tooltipPosition;
              },
              getPositionedParentOffset: function (trigger) {
                var parent;
                trigger.parents().each(function () {
                  if ($(this).css('position') !== 'static') {
                    parent = $(this);
                    return false;
                  }
                });

                return parent ? parent.offset() : $('body').offset();
              }
            },
            richTexttooltipPopup: {
              init: function () {
                $('body').on('click', '.fnToolTip', common.richTexttooltipPopup.toggleToolTipPopup);
              },
              closeAllToolTips: function () {
                $('.tooltipPopup').hide();
                return;
              },
              calcTooltipPos: function ($trigger) {
                var $el = $trigger.next('.tooltipPopup'),
                  triggerWidth = $trigger.width(),
                  triggerHeight = $trigger.height(),
                  triggerLPos = $trigger.position().left,
                  triggerTPos = $trigger.position().top,
                  popupWidth = $el.outerWidth() + ($('.tooltipPopup .close').width() / 2),
                  lPos = triggerLPos + (triggerWidth / 2) - (popupWidth / 2),
                  tPos = triggerTPos + triggerHeight + 5;
                $el.css({
                  top: Math.round(tPos),
                  left: Math.round(lPos),
                  right: 'auto'
                });
              },
              checkTooltipPos: function ($trigger) {
                var $el, popupWidth;
                $el = $trigger.next('.tooltipPopup');
                if ($el.length > 0) {
                  popupWidth = $el.outerWidth() + ($('.tooltipPopup .close').width() / 2);
                  if ($el.offset().left < 0) {
                    $el.css({
                      left: 0,
                      right: 'auto'
                    });
                  } else if ($el.offset().left + popupWidth + ($('.tooltipPopup .close').width()) > $(window).width()) {
                    $el.css({
                      left: 'auto',
                      right: $('.tooltipPopup .close').width() / 2
                    });
                  }
                }
              },
              toggleToolTipPopup: function (e) {
                var $target = $(e.target);

                e.preventDefault();
                e.stopPropagation();

                if ($target.hasClass('checkbox')) {
                  return;
                } else {
                  common.richTexttooltipPopup.closeAllToolTips();
                  common.richTexttooltipPopup.calcTooltipPos($(this));

                  $(this).next('.tooltipPopup').toggle();

                  common.richTexttooltipPopup.checkTooltipPos($(this));

                  if ($('.mask').length > 0) {
                    $('.mask:visible').remove();
                  } else {
                    $(document).one('click', 'body', common.richTexttooltipPopup.closeTooltip);
                    $('.tooltipPopup .close').one('click', common.richTexttooltipPopup.closeTooltip);
                    $(window).on('orientationchange', common.richTexttooltipPopup.closeTooltip);
                    $(window).resize(function (e) {
                      common.richTexttooltipPopup.closeTooltip(e);
                    });
                  }
                }
              },
              closeTooltip: function (e) {
                if ($(e.target).closest('.tooltipPopup').length) {
                  e.preventDefault();
                }
                $('.tooltipPopup').hide();
                $('.mask:visible').remove();
              }
            },

            enableHintMessagingIfPlaceholderAdded: function ($element, $elementTooltip) {
              if ($element.length && $elementTooltip.length) {
                $element.on('focus', function () {
                  $elementTooltip.addClass('focussed');
                });
                $element.on('blur', function () {
                  $elementTooltip.removeClass('focussed');
                });
              }
            },

            checkPreviewEnvironment: function checkPreviewEnvironment(url) {
                return /(preview.direct.ukroi.tesco.org|secure.uktul02-preview.direct.ukroi.tesco.org)/gi.test(url);
            },

            showCookieBanner : function showCookieBanner() {
               var tescoCookie = $.cookie('cookiesAccepted');

                if ($(".isKiosk").length <= 0) {
                 if (tescoCookie === null || tescoCookie === 0) {
                   $(".tesco-cookie").show();
                   $.cookie('cookiesAccepted', '1', { expires: 7305, path: '/' });
                 }
               }

              $(".tesco-cookie-accept").click(function () {
                $(".tesco-cookie").hide();
              });

            },

        /** VIRTUAL PAGE **/
            virtualPage: {

              settings: {}, // merged default and custom settings
              page: [], // current virtual page
              animSpeed: 400, // fallback animation speed
              body: [], // document.body
              wrapper: [], // main document wrapper
              transitionEndEvent: 'transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd',

              show: function (settings) {
                var self = common.virtualPage;

                var defaults = {
                  content: '',
                  callbackIn: '',
                  callbackOut: '',
                  callbackReady: '',
                  closeSelector: '.back',
                  customClass: '',
                  previousPosition: 0,
                  preAnimationIn: null,
                  preAnimationOut: null,
                  beforeRemoval: null,
                  showBack: false,
                  showBanner: false,
                  title: false
                };


                var opts = $.extend({}, defaults, settings);

                // save settings and create
                if (!self.page.length && opts.content !== '') {
                  self.settings = opts;
                  self.isModern = common.isModern();

                  self.body = $('body');
                  self.wrapper = $('#wrapper');

                    // get trigger event as iOS 5.1 on ipad was triggering both tap and click events
                  self.event = common.isTouch() ? 'tap click' : 'click';

                    // click too slow on windows phone
                  if (common.isWindowsPhone()) {
                    self.event = 'MSPointerDown';
                  }

                    // nasty hack - couldn't get the transforms or the animation to perform smoothly
                    // or at all in the samsung galaxy tab native browser
                  self.isGTBrowser = common.isGalaxyTabNativeBrowser();

                  self.create();
                }
              },

              showBackBtn: function (settings) {
                var self = common.virtualPage;

                if (!self.settings.showBack) {
                  return;
                }

                var $backBtnVirtualPage;
                $backBtnVirtualPage = $('<a href="#" id="virtualPageBackBtn" class="back"><span class="icon" data-icon="g" aria-hidden="true"></span>&nbsp;Back</a>');

                // prepend back button to the content of the virtual page
                $(self.page).prepend($backBtnVirtualPage);
              },

              showBanner: function (settings) {
                var self = common.virtualPage;

                if (!self.settings.showBanner) {
                  return;
                }

                var $VirtualPageBanner = $('<div id="virtualPageBanner"><p>' + self.settings.showBanner + '</p></div>');

                // prepend banner to the virtual page
                $(self.page).append($VirtualPageBanner);

                setTimeout(function () {
                  $('#virtualPageBanner').fadeOut('slow', function () {
                    $('#virtualPageBanner').remove();
                  });
                }, 4000);
              },

              title: function (settings) {
                var self = common.virtualPage;

                if (!self.settings.title) {
                  return;
                }

                var $VirtualPageTitle;
                $VirtualPageTitle = $('<h2 id="virtualPageTitle">' + self.settings.title + '</h2>');

                // prepend title to the virtual page
                $(self.page).prepend($VirtualPageTitle);
              },

              create: function (settings) {
                var self = common.virtualPage;

                self.previousPosition = window.scrollY;

                window.scrollTo(0, 0);
                $('html').css('overflow', 'hidden');

                if (common.isAndroidNativeBrowser())
                  $('body').css('overflow', 'hidden');

                // create new virtual page and add to body
                self.page = $('<div id="virtual-page" style="position: fixed; overflow: hidden; -webkit-overflow-scrolling: touch;"/>').addClass(self.settings.customClass).html(self.settings.content).appendTo(self.body);

                // If iOS 8, remove -webkit-overflow-scrolling scrolling property, which stops the area being scrollable with the virtual page
                if (common.isIOS() && navigator.userAgent.match(RegExp('Version/8'))) {
                  self.page.css('-webkit-overflow-scrolling', '');
                }

                if (self.settings.preAnimationIn) {
                  self.settings.preAnimationIn();
                }

                self.showBackBtn(); // show back button on the virtual page
                self.showBanner(); // show banner on the virtual page
                self.title(); // show title on the virtual page

                // galaxy tablet hack
                if (self.isGTBrowser) {
                  self.page.css('left', 0).hide();
                }

                // css transition support
                else if (self.isModern) {
                  self.page.addClass('modern');
                }

                // fallback
                else {
                  self.page.css({
                    right: '-100%',
                    left: 'auto'
                  });
                }

                if (self.settings.callbackReady) {
                  self.callback(self.settings.callbackReady);
                }

                self.capHeight();

                $(self.page).on(self.event, self.settings.closeSelector, function (e) {
                  e.preventDefault();
                  e.stopPropagation();

                  if (self.page.length && !self.page.hasClass('updated')) {
                    self.close(e);
                  }

                  return false;
                });

                // animate in
                self.animateIn(self.settings.callbackIn);
              },

              getDocHeight: function () {
                var D = document;
                return Math.max(
                    Math.max(D.body.scrollHeight, D.documentElement.scrollHeight),
                    Math.max(D.body.offsetHeight, D.documentElement.offsetHeight),
                    Math.max(D.body.clientHeight, D.documentElement.clientHeight)
                );
              },

            // set the body overflow-x and height
              capHeight: function (isReset) {
                var self = common.virtualPage;

                if (!isReset) {
                    // set the horizontal overflow to hidden so we don't see a scroll bar
                    // when animating in the virtual page
                  self.body.css('overflow-x', 'hidden');

                  if (common.isAndroidNativeBrowser()) {
                    var D = document,
                      vpHeight = Math.max(D.body.clientHeight, D.documentElement.clientHeight);

                    $('body').css('height', vpHeight);
                  }
                }

                // undo height cap/limit on the main page wrapper
                else if (self.event) {
                  self.body.css('overflow-x', 'auto');
                }
              },

              animateIn: function (callback) {
                var self = common.virtualPage;

                var inCallback = function (event) {
                    // set the location hash
                    // used to allow browser back button to hide the virtual page and return the main page
                  window.location.hash = 'virtual-page';
                  if (window.location.hash.substr(1) !== 'virtual-page') {
                    window.location.hash = 'virtual-page'; // note: need to do this twice for iOS devices
                  }

                    // add the resize and hashchange events after the page has opened to avoid
                    // the remove page being called early from a resize trigger
                  $(window).on('hashchange.virtualPage', self.hashChange);

                  self.callback(callback, event);
                  $('#virtual-page').css('overflow-y', 'scroll');

                  window.addEventListener('orientationchange', function () {
                    $('#virtual-page .back').trigger('click');
                  }, false);

                  if (common.isAndroidNativeBrowser() && breakpoint.mobile) {
                    $('#virtual-page').css('margin-top', '48px');
                    window.setTimeout(function () {
                      $('#virtual-page').css('margin-top', '0');
                    }, 1400);
                  }
                };

                // galaxy tablet hack
                if (self.isGTBrowser) {
                  self.page.show();
                  inCallback();
                }
                // css transition
                else if (self.isModern) {
                    // TO INVESTIGATE - timer used and the css animation doesn't trigger
                  window.setTimeout(function () {
                    self.page.addClass('animate').one(self.transitionEndEvent, function (event) {
                      inCallback(event);
                    });
                  }, 100);
                }

                // fallback animation
                else {
                  self.page.animate({
                    right: 0
                  }, self.animSpeed, 'linear', function () {
                    inCallback();
                  });
                }
              },

              animateOut: function (callback, e) {
                var self = common.virtualPage;

                var outCallback = function () {
                  if (common.isAndroidNativeBrowser())
                    $('body').css('overflow', '').css('height', '');

                  $('html').css('overflow', '');
                  self.removePage();
                  window.scrollTo(0, self.previousPosition);
                  self.callback(callback, e);
                };

                // galaxy tablet hack
                if (self.isGTBrowser) {
                  self.page.hide();
                  outCallback();
                }

                // css transition
                else if (self.isModern) {
                  self.page.removeClass('animate').one(self.transitionEndEvent, function () {
                    outCallback();
                  });
                }

                // fallback animation
                else {
                  self.page.animate({
                    right: '-100%'
                  }, self.animSpeed, 'linear', function () {
                    outCallback();
                  });
                }
              },

              close: function (e, callback) {
                var self = common.virtualPage;

                if (e) {
                  e.stopPropagation();
                  e.preventDefault();
                }

                if (self.page.length) {
                  if (self.settings.preAnimationOut) {
                    self.settings.preAnimationOut();
                  }

                  if (typeof (callback) === 'function')
                    self.animateOut(callback, e);
                  else
                        self.animateOut(self.settings.callbackOut, e);
                }

                return false;
              },

              removePage: function () {
                var self = common.virtualPage;

                if (self.page.length) {
                  if ($.isFunction(self.settings.beforeRemoval)) {
                    self.settings.beforeRemoval();
                  }

                  self.page.remove();
                  self.page = [];
                }

                self.cleanup();
              },

              cleanup: function () {
                var self = common.virtualPage;

                // remove these events before amending the capped height and the location hash so they don't trigger
                $(window)
                    .off('hashchange.virtualPage', self.hashChange);

                // undo height cap/limit on the main page wrapper
                self.capHeight(true);

                // need to do this twice for iOS devices
                window.location.hash = window.location.hash.replace('virtual-page', '');
                window.location.hash = window.location.hash.replace('virtual-page', '');

                // clear stored settings
                self.settings = {};
              },

              callback: function (callback, e) {
                var self = common.virtualPage;

                // note: self.page will be empty array for the call from common.virtualPage.animateOut()
                if (typeof (callback) === 'function') {
                  callback(self.page, e, this);
                }
              },

            // monitor the location hash change - if it's no longer 'virtual-page', then close the virtual page
            // used to allow browser back button to hide the virtual page and return the main page
              hashChange: function (e) {
                var self = common.virtualPage;

                if (window.location.hash.substr(1) !== 'virtual-page') {
                  self.close(e);
                }
              }
            },

            customCheckBox: {
              init: function (module, callback) {
                module.each(function () {
                  var $module = $(this);
                  common.customCheckBox.setup($module);
                  common.customCheckBox.bindEvents($module);
                  if (callback) {
                    common.customCheckBox.callback = callback;
                  }
                });
              },
              setup: function ($module) {
                $module.find('.custom-checkbox').each(function () {
                  var $this = $(this),
                    wrapper = $this.parent();

                  if ($this.prop('checked') === true) {
                    wrapper.addClass('selected');
                  } else {
                    wrapper.removeClass('selected');
                  }
                });
              },
              isIE8: function () {
                return $('.ie8').length > 0;
              },
              toggleCheckBox: function ($checkbox) {
                $checkbox.parent().toggleClass('selected');
                // set the checked state of the hidden input:checkbox element
                $checkbox.prop('checked', $checkbox.parent().hasClass('selected'));
                this.applyCallback($checkbox);
              },
              applyCallback: function applyCallback($checkbox) {
                if (this.callback) {
                  this.callback($checkbox);
                }
              },
              bindEvents: function ($module) {
                var checkbox = $module.find('.custom-checkbox'),
                  fakeCheckboxDiv = checkbox.siblings('.checkbox');

                if (!fakeCheckboxDiv.hasClass('eventBound') && !fakeCheckboxDiv.hasClass('disabled')) {
                  checkbox.on('change', function () {
                    common.customCheckBox.toggleCheckBox($(this));
                  });

                  var clickEvent = common.isTouch() ? 'tap click' : 'click';

                  fakeCheckboxDiv.on(clickEvent, function (e) {
                    e.stopImmediatePropagation();
                    var checkbox = $(this).siblings("input[type='checkbox']");
                    checkbox.change().attr('checked', !checkbox.attr('checked'));
                    return false;
                  });

                  if (common.customCheckBox.isIE8()) {
                    fakeCheckboxDiv.siblings('label').on('click', function () {
                      $(this).siblings("input[type='checkbox']").change().attr('checked', !checkbox.attr('checked'));
                    });
                  }
                  fakeCheckboxDiv.addClass('eventBound');
                }
              }
            },

            throttle: function (fn, delay) {
              var timer = null;
              return function () {
                var context = this,
                  args = arguments;
                clearTimeout(timer);
                timer = setTimeout(function () {
                  fn.apply(context, args);
                }, delay);
              };
            },

            isSwipeing: false,
            swipeTimout: null,

            kioskSwipe: function (direction, target, callback) {
              $(target).on('mousedown.swipe', function (e) {
                e.stopPropagation();

                $('#active-product-filters .customDropdown.open')
                    .removeClass('open')
                    .find('.icon')
                    .attr('data-icon', '2');

                var startX = e.clientX,
                  startY = e.clientY;

                $(document).on('mouseup.swipe', function (e) {
                  if (!common.isSwipeing) {
                    var endX = e.clientX - startX,
                      endY = e.clientY - startY,
                      swipe = false;

                        // emulate swipeRight - 25px to ensure it wasn't a click/tap
                    if (direction === 'right' && endX > 25) {
                      swipe = true;
                      callback(e);
                      $(target).on('click.swipe', function (e) {
                        e.preventDefault();
                        $(target).off('click.swipe');
                        return false;
                      });
                    }

                        // emulate swipeLeft - 25px to ensure it wasn't a click/tap
                    else if (direction === 'left' && endX < -25) {
                      swipe = true;
                      callback(e);
                      $(target).on('click.swipe', function (e) {
                        e.preventDefault();
                        $(target).off('click.swipe');
                        return false;
                      });
                    }

                        // emulate swipeUp - 25px to ensure it wasn't a click/tap
                    if (direction === 'up' && endY > 25) {
                      swipe = true;
                      callback(e);
                      $(target).on('click.swipe', function (e) {
                        e.preventDefault();
                        $(target).off('click.swipe');
                        return false;
                      });
                    }

                        // emulate swipeDown - 25px to ensure it wasn't a click/tap
                    else if (direction === 'down' && endY < -25) {
                      swipe = true;
                      callback(e);
                      $(target).on('click.swipe', function (e) {
                        e.preventDefault();
                        $(target).off('click.swipe');
                        return false;
                      });
                    }

                    if (swipe) {
                      common.isSwipeing = true;
                      clearTimeout(common.isSwipeing);
                      common.swipeTimout = setTimeout(function () {
                        common.isSwipeing = false;
                      }, 350);
                    }

                    $(document).off('mouseup.swipe');
                  }

                  return false;
                });

                return false;
              });
            },

        /**
         * @name TESCO.Products.Ellipsis.init
         * @description This method forms the ellipses on the product tiles
         */
            Ellipsis: {
              init: function ($selector) {
                if ($selector.length > 0) {
                  var iEllipsisChunk = $selector.length;
                  if ($selector.length > 4) {
                    iEllipsisChunk = Math.ceil($selector.length / 10);
                  }
                  while ($selector.length) {
                    aElementsNeedingEllipsis = $selector.splice(0, iEllipsisChunk);
                    (function ellipsisLoop(aElementsNeedingEllipsisRef) {
                      setTimeout(function ellipsisLoopChunk() {
                        $(aElementsNeedingEllipsisRef).dotdotdot({
                          ellipsis: '\u2026',
                          wrap: 'word',
                          watch: false,
                          tolerance: 0
                        });
                      }, 250);
                    })(aElementsNeedingEllipsis);
                  }
                }
              }
            },

        /**
         * Generate custom radio button styles
         */
            customRadio: function (selector) {
              var $elem = $('input[type="radio"]', $(selector));
              $elem.each(function (e, i) {
                if (!$(this).parent().hasClass('custom-radio')) {
                    // $('input[type="radio"]', $(selector)).wrap('<div class="custom-radio"></div>');
                  $(this).wrap('<div class="custom-radio"></div>');

                  var elem = $(this).parent('.custom-radio');
                  common.customRadioBindEvent(elem);

                  if ($(this).prop('disabled')) {
                    $(this).parent('.custom-radio').addClass('disabled');
                  }
                }
              });


            // attach styles to initial checked radio buttons
            // $('input[type="radio"][checked="checked"]', $(selector)).parents('.custom-radio').addClass('checked');
              $('input[type="radio"]', $(selector)).each(function (i, e) {
                if ($(this).prop('checked') === true) {
                  $(this).parents('.custom-radio').addClass('checked');
                }
              });
            },
            customRadioBindEvent: function (customRadio) {
              $(customRadio).on('click', function (e) {
                // prevent double triggering
                if ($(e.target).is('.custom-radio')) {
                  e.preventDefault();
                  common.customRadioChange(e);
                  return false;
                }
              });
              var $realRadioElem = $(customRadio).find('input[type="radio"]');
              if ($realRadioElem.prop('checked') !== 'undefined') {
                $realRadioElem.on('change', function (e) {
                  $(e.target).closest('form').find('input[type="radio"][name="' + $(e.target).prop('name') + '"]').each(function () {
                    $(this).parent('.custom-radio').removeClass('checked');
                  });
                  $(this).prop('checked') ? $(this).parent('.custom-radio').addClass('checked') : $(this).parent('.custom-radio').removeClass('checked');
                });
              }
            },
            customRadioChange: function (e, surpressClick) {
              var radio = $('input', e.target);

            // check to see if this radio button is disabled
              if (!radio.prop('disabled')) {
                // Do not trigger a click on an element which is already "checked"
                if (radio.prop('checked') === false || radio.prop('checked') === undefined) {
                    // remove styles from this radio group - within its form!
                  var group = radio.closest('form').find('input[type="radio"][name="' + radio.attr('name') + '"]').each(function () {
                    $(this).attr('checked', false);
                    $(this).prop('checked', false);
                    $(this).closest('.custom-radio').removeClass('checked');
                  });

                  radio.prop('checked', true);

                    // attach style to the custom container.
                  radio.closest('.custom-radio').addClass('checked');

                    // emulate click on the actual radio button
                  if (!surpressClick) {
                    e.stopPropagation();
                    radio.trigger('click');
                  }
                }
              }
            },

        // nasty fix - may need to look into amending the lib for better fix
        // focus out not being triggered on old android devices (samsung ace) so force
        // validation of self on blur
            validationFocusoutFix: function ($form) {
              if (common.isAndroid()) {
                $form.find('input[type=text], input[type=email], input[type=password]').blur(function () {
                  $(this).valid();
                });
              }
            },
        // monitor character limit on key down
            limitCharacters: function ($field, charLimit) {
              $field.each(function () {
                if (this.isLimitCharacters) {
                  return;
                }

                this.isLimitCharacters = true;
                this.charLimit = charLimit;

                $(this).on('keydown', function (e) {
                  var arrowKeys = e.keyCode > 36 && e.keyCode < 40;
                  var notDeleteOrTabKey = e.keyCode !== 8 && e.keyCode !== 46 && e.keyCode !== 9;

                  if (this.value.length >= charLimit && this.selectionStart === this.selectionEnd && notDeleteOrTabKey && !arrowKeys) {
                    e.preventDefault();

                        // udpated with trimmed value
                    this.value = this.value.substring(0, this.charLimit);

                    return false;
                  }
                });
              });
            },

            print: function (e) {
              e.preventDefault();
              window.print();
              return false;
            },

        /**
         * A function to check if the basket preview is active, if so the basket preview is available to view
         */
            detectBasketStatus: function () {
              if ($('#basket-link').hasClass('itemsInBasket')) {
                this.basketIsActive = true;
              } else {
                this.basketIsActive = false;
              }
              return this.basketIsActive;
            },

            disableAjaxCache: function () {
              $.ajaxPrefilter(function (options, originalOptions, jqXHR) {
                // do not send data for POST/PUT/DELETE
                if ((options.type).toUpperCase() !== 'GET') {
                  return;
                }
                if (options.url.indexOf('fetchDOForListing.jsp') > -1 &&
                  options.url.indexOf('basketItemsPage=true') === -1) {
                  return;
                }
                options.data = jQuery.param($.extend(originalOptions.data || {}, {
                  ieFix: new Date().getTime()
                }));
              });
            },

            scrollTo: function (element, callback) {
              var animSpeed = 300;

              if (typeof element === 'number') {
                $('html, body').animate({
                  scrollTop: element
                }, animSpeed, callback);
              } else {
                // scroll to the wrapper
                if (typeof jQuery !== 'undefined') {
                  if (typeof element.offset() !== 'undefined') {
                    $('html, body').animate({
                      scrollTop: element.offset().top
                    }, animSpeed, callback);
                  }
                } else {
                  $.scroll(element.offset().top - element.outerHeight(), animSpeed);
                  if (callback) {
                    setTimeout(function () {
                      callback();
                    }, animSpeed);
                  }
                }
              }
            },

            isElementInViewport: function (el, iModifier) {
              var rect = el.getBoundingClientRect();
              if (!iModifier) {
                iModifier = 0;
              }
              return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                (rect.bottom - iModifier) <= (window.innerHeight || document.documentElement.clientHeight) && /* or $(window).height() */
                rect.right <= (window.innerWidth || document.documentElement.clientWidth) /* or $(window).width() */
            );
            },


            dfpCall: function () {
            // the google ad request
              googletag = window.googletag || {
                cmd: []
              };
              googletag.cmd.push(function () {
                var dfbAdunit = window.dfpData.adunit,
                  dfpslots = $('.google-ads-blocker').find('.adslot').filter(':visible'),
                  i = 0,
                  slot = [];

                // use the existing get screen width function
                // x now has the viewport size
                // var x = getScreenWidth();

                // replace 'SERVER VALUE' with server side code to build adunit name
                // adunit structure department/category/subcategory
                // e.g. /8326/DIRECT/technolog-gaming/ipads-tablets/hudl
                // network id (8326) and top level adunit DIRECT are always included below
                // adunits must be lowercase and not have any spaces

                // now we work out the viewport size
                // and set the banner size to match
                var size = [160, 600]; // set a default in case getScreenWidth doesn't fire

                /*
                if (x >= 1200) {
                    size = [300, 250];
                } else if (x < 1200 && x >= 768) {
                    size = [300, 250];
                } else if (x < 768 && x >= 600) {
                    size = [320, 50];
                } else {
                    size = [320, 50];
                }
                */

                // this is the ad request
                // we send request for adunit and banner size
                // alert(dfpslots.length);
                // if (dfpslots.length) {

                googletag.defineSlot(dfbAdunit, size, 'gpt-ad-direct-1')
                    .addService(googletag.pubads())
                    .setTargeting('pos', 'mpu1');
                /* googletag.pubads()
                      .setTargeting('pageType', SERVER VALUE)
                      .setTargeting('searchTerm', [SERVER, VALUES])
                      .setTargeting('brand', [SERVER, VALUES])
                      .setTargeting('priceRange', [SERVER, VALUES]),
                      .setTargeting('keywords', [SERVER, VALUES]),
                      .setTargeting('products', [SERVER, VALUES]);
                    */
                // this is the asynchronous setting - ad request doesn't stop page from loading
                googletag.pubads().enableSingleRequest();
                googletag.enableServices();
                googletag.display('gpt-ad-direct-1');
                // }
              });
            },

            getURLParams: function (url) {
              var urlParams = [],
                currentURL = url ? url : window.location.href,
                hash;
              var hashes = currentURL.slice(currentURL.indexOf('?') + 1).split('&');
              for (var i = 0; i < hashes.length; i++) {
                hash = hashes[i].split('=');
                urlParams.push(hash[0]);
                urlParams[hash[0]] = hash[1];
              }
              return urlParams;
            },

            removeSpecificURLParams: function (sDirtyURL, removeParams) {
              var sCleanedURL,
                sPrefix,
                aURLGroupedComponents,
                aURLIndividualComponents,
                fnCleanURL,
                bURLSplitTriggered = false,
                i,
                j;

              if (sDirtyURL === undefined || removeParams === undefined) {
                return;
              }

              sCleanedURL = sDirtyURL;
              aURLGroupedComponents = sDirtyURL.split('?');

              fnCleanURL = function fnCleanURL(sParam) {
                sPrefix = encodeURIComponent(sParam) + '=';
                if (bURLSplitTriggered === false) {
                  aURLIndividualComponents = aURLGroupedComponents[1].split(/[&;]/g);
                  bURLSplitTriggered = true;
                }
                for (j = aURLIndividualComponents.length; j-- > 0;) {
                  if (aURLIndividualComponents[j].lastIndexOf(sPrefix, 0) !== -1) {
                    aURLIndividualComponents.splice(j, 1);
                  }
                }
              };

              if (aURLGroupedComponents.length >= 2) {
                if (Array.isArray(removeParams)) {
                  for (i = 0; i < removeParams.length; i++) {
                    fnCleanURL(removeParams[i]);
                  }
                } else {
                  fnCleanURL(removeParams);
                }
                sCleanedURL = aURLGroupedComponents[0] + '?' + aURLIndividualComponents.join('&');
                return sCleanedURL;
              } else {
                return sCleanedURL;
              }
            },

            enableAllKioskButtons: function enableAllKioskButtons(kmfIO) {
              require(['modules/chip-and-pin/kmf-io'], function (kmfIO) {
                kmfIO.enableBasketButton();
                kmfIO.enableHomeButton();
                kmfIO.enableBackButton();
              });
            },

            disableAllKioskButtons: function disableAllKioskButtons(kmfIO) {
              require(['modules/chip-and-pin/kmf-io'], function (kmfIO) {
                kmfIO.disableBackButton();
                kmfIO.disableBasketButton();
                kmfIO.disableHomeButton();
              });
            },

            enableKioskButtons: function enableKioskButtons() {
              var self = common;
              self.enableAllKioskButtons();
            },

            disableKioskButtons: function disableKioskButtons() {
              var self = common;
              self.disableAllKioskButtons();
            },

            getLocalCheckoutData: function getLocalCheckoutData() {
              return window.TescoData.ChipAndPin;
            },
        // Generate Map using//
            getMap: function getMap($parentContainer, $mapContainer, locations) {
              var map = null,
                viewOptions = {
                  credentials: 'ArjMBd3QUx1XCF2EMs4ZS1ULKnrka2i3yXuWRfq7Dq-hpSHE1cJmvMZpirc4W3dw',
                  enableClickableLogo: false,
                  enableSearchLogo: false,
                  showMapTypeSelector: true
                },
                _locations = locations;

              if (!locations.length) {
                // Default to center location of UK
                _locations = new Microsoft.Maps.Location(53.9452, -2.5206);
              }
              viewOptions.bounds = Microsoft.Maps.LocationRect.fromLocations(_locations);
              map = new Microsoft.Maps.Map($parentContainer.find($mapContainer)[0], viewOptions);
              return map;
            },
        // Verify Telephone but get the regex from respective function.
            verifyTelephone: function verifyTelephone(regexp, value) {
              return regexp.test(value.replace(/\s/g, ''));
            },
        // GFO-5829 kiosk plp listing grid displays one row of items if set to use 'grid-3' layout and portrait images
            isKioskListingWithOneRow: function isKioskListingWithOneRow($wrapper) {
              var bIsDisplayingOneRow = $wrapper.hasClass('imagePreset-portraitxl');
              return window.isKiosk() && $wrapper[0].id === 'listing' && bIsDisplayingOneRow;
            },
            getNumberOfVisibleItemsForKioskListing: function getNumberOfVisibleItemsForKioskListing($wrapper) {
              var KIOSK_ONE_ROW_NUM_ITEMS = 5,
                KIOSK_TWO_ROW_NUM_ITEMS = 12,
                numVisibleItems;

              if (common.isKioskListingWithOneRow($wrapper)) {
                numVisibleItems = KIOSK_ONE_ROW_NUM_ITEMS;
              } else {
                numVisibleItems = KIOSK_TWO_ROW_NUM_ITEMS;
              }

              return numVisibleItems;
            },
            isBrowserIE: function isBrowserIE() {
              return /MSIE|rv:11.0/gi.test(window.navigator.userAgent);
            }
          };

          common.disableAjaxCache();

    // This condition is set in the order confirmation page of the chip & pin
          if (window.isKiosk() && !window.kioskButtonsFlag) {
            common.enableKioskButtons();
          }

          breakpoint.mobileIn.push(function () {
            common.virtualPage.removePage();
            if ($('.tooltipPopup:visible').length) {
              common.richTexttooltipPopup.checkTooltipPos($('.tooltipPopup:visible').prev('.fnToolTip'));
            }
          });
          breakpoint.mobileOut.push(function () {
            common.virtualPage.removePage();
          });
          breakpoint.vTabletIn.push(function () {
            if ($('.tooltipPopup:visible').length) {
              common.richTexttooltipPopup.checkTooltipPos($('.tooltipPopup:visible').prev('.fnToolTip'));
            }
          });
          breakpoint.hTabletIn.push(function () {
            if ($('.tooltipPopup:visible').length) {
              common.richTexttooltipPopup.checkTooltipPos($('.tooltipPopup:visible').prev('.fnToolTip'));
            }
          });
          breakpoint.desktopIn.push(function () {
            if ($('.tooltipPopup:visible').length) {
              common.richTexttooltipPopup.checkTooltipPos($('.tooltipPopup:visible').prev('.fnToolTip'));
            }
          });
          breakpoint.largeDesktopIn.push(function () {
            if ($('.tooltipPopup:visible').length) {
              common.richTexttooltipPopup.checkTooltipPos($('.tooltipPopup:visible').prev('.fnToolTip'));
            }
          });

          common.disableDocumentScroll = {
            scrollTop: null,
            className: 'disableScroll',
            events: {
              disable: 'documentScrollDisable',
              enable: 'documentScrollEnable'
            },
            eventsBound: false,
            bindEvents: function () {
              var self = this;

              if (!this.eventsBound) {
                $(window).on(this.events.disable, function () {
                  self.disable();
                }).on(this.events.enable, function () {
                  self.enable();
                });

                this.eventsBound = true;
              }
            },
            disable: function () {
              this.scrollTop = $(window).scrollTop();
              $('html').addClass(this.className);
              $('body').addClass(this.className).css({
                top: -this.scrollTop
              });
            },
            enable: function () {
              $('html').removeClass(this.className);
              $('body').removeClass(this.className).css({
                top: ''
              });
              window.scrollTo(0, this.scrollTop);
            }
          };

          common.disableDocumentScroll.bindEvents();

          common.windowResizeEnd = {
            event: 'windowResizeEnd',
            eventBound: false,
            bindEvent: function () {
              if (!this.eventBound) {
                $(window).on('resize.windowResizeEnd', this.resizeEnd.bind(this));
                this.eventBound = true;
              }
            },
            resizeEnd: function () {
              var self = this,
                resizeTimer;

              window.clearTimeout(resizeTimer);
              resizeTimer = window.setTimeout(function () {
                $(window).trigger(self.event);
              }, 200);
            }
          };

          common.windowResizeEnd.bindEvent();

          return common;
        });
