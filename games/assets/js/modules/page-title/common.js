define(['domlib', 'modules/common', 'modules/overlay/common'], function ($, common, overlay) {
    'use strict';

    var pageTitle = {

        pageTitleElement: '.page-title',

        Ellipsis: {
            /**
             * @name TESCO.Products.Ellipsis.init
             * @description This method forms the ellipses on the product tiles
             */
            init: function init() {
                var ellipString = '<span class="ellipsis"><span class="icon" data-icon="&hellip;"></span></span>';
                $(pageTitle.pageTitleElement).dotdotdot({
                    ellipsis: '',
                    after: ellipString,
                    wrap: 'word',
                    watch: false,
                    tolerance: 0,
                    callback: function (isTruncated, orgContent) {
                        if (window.isKiosk()) {
                            // This code will make kiosk always show ellipsis to show terms&condtions
                            if (!isTruncated && $('#offersTerms', $(this)).length !== 0) {
                                $('.dotdotdot', $(this)).append(ellipString);
                            }
                            $('.ellipsis', $(this)).on('tap click', function (e) {
                                e.preventDefault();
                                var $template = $('<div id="lightbox-content" />');
                                $template.append($('<h2 />'));
                                $template.find('h2').html(orgContent);
                                overlay.show({
                                    content: $template
                                });
                            });
                        }
                    }
                });
            }
        }
    };

    common.init.push(function () {

        if (window.isKiosk()) {
            common.init.push(pageTitle.Ellipsis.init);
            var doc = $('body');
            doc.attr('data-useragent', navigator.userAgent);
        }
    });

    return pageTitle;

});