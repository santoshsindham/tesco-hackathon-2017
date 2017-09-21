/*globals window, define*/
define([
    'domlib',
    'modules/pdp-configurator/observer',
    'modules/breakpoint',
    'modules/common'
], function ($, observer) {
    'use strict';
    var init,
        initListeners,
        toggleUpsellView,
        setUpsellMsg,
        $upsellSelector,
        $configuratorContainer;

    init = function init(containerSelector) {
        $configuratorContainer = $('.configurator-container');
        $upsellSelector = $(containerSelector);
        initListeners();
    };

    initListeners = function initListeners() {
        $upsellSelector.find('[data-action]').off('.upsell')
            .on('click.upsell', function (e) {
                observer.publish('upsell-selector,' + $(this).data('action'), e);
            });
    };

    toggleUpsellView = function toggleUpsellView(isShow) {
        $upsellSelector.toggleClass('open', isShow);
        $configuratorContainer.toggleClass('has-upsell-view', isShow);
    };

    setUpsellMsg = function setUpsellMsg(msg) {
        $upsellSelector.find('.added-to-basket').text(msg);
    };

    return {
        init : init,
        toggleUpsellView : toggleUpsellView,
        setUpsellMsg : setUpsellMsg
    };
});