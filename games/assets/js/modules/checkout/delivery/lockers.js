/*globals define,window */
define(['domlib',
    'modules/common',
    'modules/overlay/common',
    'modules/tesco.data'
    ], function ($, common, overlay, data) {

    'use strict';

    var lockers = {
        isLockersOn : function () {
            if (!$('.isLockersOn').length || $('#integrated-registration').length) {
                return false;
            }

            return true;
        },
        updateLockers : function (group, isPostCodeSearch, radioElem, bFetchTime) {
            var request = 'selectDeliveryMethodLocker',
                DL = new data.DataLayer({singleton: true }),
                myData = '',
                url,
                $elem,
                $form;

            $elem = $('.js-locker-collection.secondary-delivery-options');
            $form = $elem.find('form');
            url = $elem.attr('data-url');

            if(radioElem){
                $form = radioElem.parents('form');
            }

            if (isPostCodeSearch) {
                request = 'searchForLockers';
                $elem = $('.locker-search-form');
                $form = $elem.find('form');
                $form.find('#locker-finder-postalcode').val($('#store-finder-postalcode').val());
            }

            if ($form && $form.length > 0) {
                myData = $form.serialize();
                url = $form.attr('action');
            }

            $elem.closest('.store-options-module').addClass('has-secondary-delivery-options');

            lockers.disableSelection();
            DL.get(url, myData, $elem, data.Handlers.Checkout, request, null, null, function () {
                common.customRadio($('.secondary-delivery-options', group));
                common.customRadio($('.more-lockers-holder', group));
                lockers.enableSelection();
                if (!bFetchTime && $form.length === 0) {
                    if (group.find('.lockers-container input[checked="checked"]').length) {
                        lockers.updateLockers(group, isPostCodeSearch, group.find('.lockers-container input[checked="checked"]'), true);
                    }
                }
            });
        },
        removeLockers : function () {
            var $elem = $('.js-locker-collection.secondary-delivery-options');
            $elem.closest('.store-options-module').removeClass('has-secondary-delivery-options');
        },
        hideViewMore : function (group) {
            $('.other-stores').removeClass('hidden');
            $('.store-options-module .view-more-stores', group).trigger('click');
            $('#store-finder-postalcode, #locker-finder-postalcode').val('').removeClass('error')
                .next('label').removeClass('error').hide();

            return false;
        },
        unselectLockers : function () {
            $('.lockers-container')
                .find('.custom-radio.checked').removeClass('checked')
                .find('input[type=radio]').prop('checked', false);
        },
        unselectStores : function () {
            $('.stores-container')
                .find('.custom-radio.checked').removeClass('checked')
                .find('input[type=radio]').prop('checked', false);
        },
        enableSelection : function () {
            $('.store-options-module').removeClass('is-loading');
        },
        disableSelection : function () {
            $('.store-options-module').addClass('is-loading');
        },
        onMoreInfoClicked: function (e) {
            var overlayOptions,
            url = $(this).data('url');

            e.preventDefault();

            if (window.ENV === "buildkit") {
                url = "/stubs/about-lockers-info.html";
            }

            overlayOptions = {
                content: '<div id="lightbox-locker-info"></div><span class="close"><span class="icon"></span>',
                callback: function () {
                    $("#lightbox-locker-info").load(url);
                    $('#lightbox.more-info-about-lockers span.close').on("tap click", function () {
                        overlay.hide();
                    });
                },
                customClass: 'more-info-about-lockers',
                preserveContent: false,
                hideOnOverlayClick: true,
                additionalCloseButtonClassNames: 'hide'
            };

            overlay.show(overlayOptions);
        },
        init : function () {
            $(document).on('tap click', '.store-options-module .lockers-container .custom-radio, .more-lockers-holder .custom-radio', function () {
                var $elem = $(this),
                    group = $elem.closest('.delivery-group-block');

                lockers.updateLockers(group, null, $elem);
                //lockers.hideViewMore(group);  - Commented as related user story has not been taken in this sprint 
                lockers.unselectStores();
                common.scrollToOffset($('.js-locker-collection').offset().top);
            });

            $('#dg-checkout-block-main').on('tap click', '.more-delivery-information', lockers.onMoreInfoClicked);
        }
    };

    return lockers;
});