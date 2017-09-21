define(['domlib', 'modules/navigation/common', 'modules/common', 'modules/overlay/common'], function ($, navigation, common, overlay) {
    'use strict';

    var visualNav = {

        clickEvent: window.isKiosk() ? 'touchstart click' : 'tap click',
        visualNavElement: $('#visual-nav'),

        init: function () {

            visualNav.visualNavElement = $('#visual-nav');

            if (visualNav.visualNavElement.length) {

                $('#visual-nav ul li a span').dotdotdot({
                    ellipsis: '…',
                    wrap: 'word',
                    tolerance : 0
                });

                if (window.isKiosk()) {

                    $('#visual-nav .anchor .wrapper, .visual-nav .anchor .wrapper').on(visualNav.clickEvent, function () {
                        navigation.Scroll.to();
                        return false;
                    });

                    $('.shop-by .view-all').on(visualNav.clickEvent, function (e) {

                        e.preventDefault();

                        var content,
                            heading;

                        content = $(this).siblings('.products-wrapper').clone();
                        heading = '<h1>' + $(this).siblings('.products-header').children('h2').text() + '<h1>';

                        overlay.show({
                            overlayContent: content,
                            defaultBreakPointBehavior: false,
                            customClass: 'shop-by',
                            fixedWidth: 1338,
                            enablePagination: true,
                            paginationHeader: heading
                        });
                    });

                    // add grouped class if both shop by brand and price are present
                    var $elemCache = $('.shop-by-nav');
                    if ($elemCache.length > 1) {
                        $elemCache.each(function () {
                            $(this).addClass('shop-by-grouped');
                        });
                    }
                }
            }
        }
    };

    common.init.push(function () {
        common.init.push(visualNav.init);
    });

    return visualNav;

});