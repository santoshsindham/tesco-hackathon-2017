/*global define:true */
define(['domlib', 'modules/breakpoint', 'modules/common', 'modules/overlay/common', 'modules/tesco.data', 'modules/tesco.utils', 'modules/tesco.analytics', 'modules/add-to-basket/common'], function ($, breakpoint, common, overlay, data, utils, analytics, streamlinebasket) {

    var addToBasket = {

        productListing: '#listing',
        overlayContainer: null,
        hasModal: false,
        notifications: [],
        topOffset: 0,
        notificationVisible: false,

        requestAddToBasket: function (url, target) {
            var self = this,
                n;
            //Get request to add to basket

            var $elem = target.find('.add-to-basket');

            var _request = 'selectAddToBasket';
            var $form = utils.getFormByElement($elem);
            var _url = data.Utils.getAction(_request, $form);
            var DL = new data.DataLayer();
            var _myData = $form.serialize();
            // Moved from Init as the user may never add something to the basket as this will save time and not flush the redraw queue. 
            if (addToBasket.topOffset === 0) {
                addToBasket.topOffset = $('#notificationContainer').offset().top;
            }
            DL.get(_url, _myData, $elem, null, _request, function (data) {

                n = new self.notification(target, data);
                self.notifications.push(n);
                if (breakpoint.desktop || breakpoint.largeDesktop) {
                    self.notificationContainerCheck();
                }
                self.checkTopOffset();
                if (data.analytics) {
                    var oWebAnalytics = new analytics.WebMetrics();
                    oWebAnalytics.submit(data.analytics);
                }
            }, function () {
                n = new self.notification(target, false);
                self.notifications.push(n);
                self.notificationContainerCheck();
                self.checkTopOffset();
            });

        },

        notification: function (target, data) {
            var self = this;
            self.template = $.trim($('#add-to-basket-template').html());
            self.notification = $(self.template).clone();

            //Ajax request successful
            if (data) {

                //set message
                self.message = $('.message', self.notification).data('success');
                $('.message', self.notification).text(self.message);

                //set image
                self.imageLink = $('.thumbnail', target).clone();
                self.image = $('img', self.imageLink);
                self.imageLink.html(self.image);
                $('.thumbnail-container', self.notification).html(self.imageLink);

                //set link/product
                self.product = $('h3', target).html();
                $('.product-title', self.notification).html(self.product);

                //set items in basket
                self.basket = $(data.basketContainer);
                self.items = $('#masthead .basket-items', self.basket).text();
                $('.basket-count', self.notification).text(self.items);

                if ($.trim((self.items)) === "1") {
                    $('#add-to-basket-notification-items', self.notification).text("item");
                }

                //add success class
                self.notification.addClass('success');

            } else {

                //set message title
                self.message = $('.message', self.notification).data('error');
                $('.message', self.notification).text(self.message);

                //set error message
                self.product = $('.product-title', self.notification).data('error');
                $('.product-title', self.notification).text(self.product);

                //add error class
                self.notification.addClass('error');

            }

            //check for desktop and large desktop!
            if (breakpoint.desktop || breakpoint.largeDesktop) {

                /**bind events and timer**/
                //- close button
                $('.close', self.notification).on('click tap', function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    window.clearTimeout(self.timer);
                    addToBasket.closeNotification(self.notification);
                    addToBasket.notificationVisible = false;
                    return false;
                });

                if (common.isTouch()) {
                    self.notification.on('touchstart', function () {
                        window.clearTimeout(self.timer);
                    });

                    // if the user moves the screen, hide the notification
                    $(document).on('touchmove', function () {
                        $('.close', self.notification).trigger('tap click');
                    });
                } else {

                    //- mouseover
                    self.notification.on('mouseenter', function () {
                        window.clearTimeout(self.timer);
                    });

                    //- mouseout
                    self.notification.on('mouseleave', function () {
                        self.timer = window.setTimeout(function () {
                            addToBasket.closeNotification(self.notification);
                        }, 4000);
                    });
                }

                //add notification to notification container
                $('#notificationContainer').prepend(self.notification);
                $('#notificationContainer').css({
                    opacity: 1
                }).show();
                addToBasket.notificationVisible = true;

                //create initial timer
                self.timer = window.setTimeout(function () {
                    addToBasket.closeNotification(self.notification);
                }, 4000);



            } else {
                $('.continue-shopping', self.notification).on('click tap', function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    overlay.hide();
                    return false;
                });

                //add notification to notification container
                overlay.show({
                    content: self.notification
                });

            }

            //fix for android devices!
            setTimeout(function () {
                self.notification.show();
                addToBasket.notificationVisible = true;
            }, 50);

            return self;
        },


        notificationContainerCheck: function () {
            //alert('check');
            var nc = $('#notificationContainer');
            if (nc.hasClass('visible')) {
                addToBasket.notificationVisible = true;
                if (nc.children().length < 1) {
                    nc.removeClass('visible');
                    addToBasket.notificationVisible = false;
                }
            } else {
                nc.addClass('visible');
                addToBasket.notificationVisible = true;
            }
        },

        scroll: function () {
            var self = this;
            $(window).on('scroll', function (evt) {
                self.checkTopOffset();
            });
        },

        checkTopOffset: function () {
            var self = this,
                container = $('#notificationContainer');
            if (addToBasket.notificationVisible) {
                var doScroll = true;
                if (breakpoint.mobile || breakpoint.vTablet || breakpoint.hTablet) {
                    doScroll = false;
                }
                var yOffset = window.pageYOffset || document.documentElement.scrollTop;
                if (addToBasket.topOffset < yOffset && doScroll) {
                    container.addClass('posfixed').css({
                        top: 0,
                        left: addToBasket.leftOffset - 6
                    });
                } else {
                    container.removeClass('posfixed').css({
                        top: '',
                        left: ''
                    });
                }
            }
        },

        clickEvent: function (e) {
            e.preventDefault();
            e.stopPropagation();

            var self = addToBasket,
                url = $(e.target).data('url'),
                product = $(e.target).closest('.product');

            self.requestAddToBasket(url, product);
            //TODO: loading feedback?

            return false;
        },



        bindEvents: function () {
            //click event for product 'Add to basket' button
            $('body').on('click tap', '.add-to-basket', addToBasket.clickEvent);
        },



        /**
         * Initialize module
         */
        init: function () {
            if (!$('.basketPopup').length) {
                if ($('.buy-from .add-to-basket:hidden')) {
                    $('.buy-from .add-to-basket').css("visibility", "visible");
                }
                addToBasket.initAjaxFramework();
                if ($(addToBasket.productListing).length) {
                    addToBasket.bindEvents();
                    if ($('#notificationContainer').length) {
                        addToBasket.topOffset = $('#notificationContainer').offset().top;
                        addToBasket.leftOffset = $('ul.products').offset().left;
                        addToBasket.scroll();
                    }
                }
            }

        },

        initAjaxFramework: function () {

            var _myInlineRequests = ['selectAddToBasket'];
            var _myRequests = {
                'selectAddToBasket': ['buybuttonContainer', 'basketContainer']
            };
            var _myModules = {
                'buybuttonContainer': ['div.buyButtonContainer', 'Adding item to basket', 'basket'],
                'basketContainer': ['#basket', '', false, false, false]
            };

            // This will be produced/generated from the server side. If this object does not exist, it will default to _myDefaultActions
            var _myActions = {
                'selectAddToBasket': ['/stubs/select-addToBasket.php']
            };

            // This will be present in the JS file as it holds the default values for this specific functionailty/module i.e. Checkout          
            var _myDefaultActions = {
                'selectAddToBasket': ['/stubs/select-addToBasket.php']
            };

            data.Global.init({
                'inlineRequests': _myInlineRequests,
                'requests': _myRequests,
                'modules': _myModules,
                'actions': _myActions,
                'defaultActions': _myDefaultActions
            });

        }

    };

    return addToBasket;
});