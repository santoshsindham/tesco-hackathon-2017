/*globals define*/
define([
    'domlib',
    'modules/common',
    'modules/tesco.analytics',
    'modules/pdp-configurator/observer',
    'modules/pdp-configurator/tablet-selector',
    'modules/pdp-configurator/case-selector'
], function ($, common, analytics, observer, tabletSelector, caseSelector) {
    'use strict';

    var init,
        initListeners,
        $parentContainer,
        updateColor,
        setAnalytics,
        setBasketCount,
        showDetails,
        hideDetails;

    init = function init(containerSelector) {
        $parentContainer = $(containerSelector);
        initListeners();
    };

    initListeners = function initListeners() {
        $parentContainer.find('button').on('click', function (e) {
            observer.publish('add-to-basket,' + $(this).data('action'), e);
        });
    };

    updateColor = function updateColor(headerColor, hasCase) {
        var caseBtnTxt = (hasCase ? 'Change' : 'Add a') + ' <span class="heavy">case</span>';

        $parentContainer.find('.header-mask').css({
            'background-color': headerColor
        });

        if (hasCase) {
            $parentContainer.find('button.add-a-case').css({
                'background-color': caseSelector.getSelectedColour(),
                'border': 'none',
                'color': (caseSelector.getContrastColour() || '#fff')
            }).html(caseBtnTxt);
        } else {
            $parentContainer.find('button.add-a-case').css({
                'background-color': (tabletSelector.getContrastColour() || '#fff'),
                'color': tabletSelector.getSelectedColour(),
                'border': '1px solid ' + tabletSelector.getSelectedColour()
            }).html(caseBtnTxt);
        }
        $parentContainer.find('button.update-tablet ').css({
            'background-color': tabletSelector.getSelectedColour(),
            'color': tabletSelector.getContrastColour()
        });
    };

    setAnalytics = function setAnalytics(d) {
        var oWebAnalytics;
        try {
            oWebAnalytics = new analytics.WebMetrics();
            oWebAnalytics.submit($.parseJSON(d).analytics);
        } catch (ignore) {}
    };

    setBasketCount = function setBasketCount() {
        var $mainBasket = $('.basketMenu'),
            $lozenge = $mainBasket.find('.numberOfItems');
        $mainBasket.addClass('.withItems');
        $lozenge.text(parseInt($lozenge.text(), 10) + 1);
        common.detectBasketStatus();
    };

    showDetails = function showDetails() {
        return $parentContainer.removeClass('closed');
    };

    hideDetails = function hideDetails() {
        return $parentContainer.addClass('closed');
    };

    return {
        init: init,
        updateColor: updateColor,
        setAnalytics: setAnalytics,
        setBasketCount: setBasketCount,
        showDetails: showDetails,
        hideDetails: hideDetails
    };
});