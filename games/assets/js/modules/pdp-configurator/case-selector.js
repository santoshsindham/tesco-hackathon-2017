/*globals define*/
define([
    'domlib',
    'modules/pdp-configurator/product-factory',
    'modules/pdp-configurator/observer',
    'modules/breakpoint',
    'modules/common'
], function ($, ProductFactory, observer) {
    'use strict';
    var caseSelector = new ProductFactory('case');

    caseSelector.initCategory = function () {
        $('.category-selector.case-category').find('[data-action]').off('.case-category')
            .on('click.case-category', function (e) {
                observer.publish('case-selector,' + $(this).data('action'), e);
            });
    };

    caseSelector.showCategories = function () {
        $('.category-selector.case-category').addClass('open');
        $('.configurator-banner').addClass('is-case-category');
    };

    caseSelector.hideCategories = function () {
        $('.category-selector.case-category').removeClass('open');
        $('.configurator-banner').removeClass('is-case-category');
    };

    caseSelector.animateCategories = function () {
        caseSelector.animate($('.category-selector.case-category'));
    };

    caseSelector.addCase = function () {
        return $('.configurator-container').addClass('has-case');
    };

    caseSelector.removeCase = function () {
        caseSelector.animate();
        return $('.configurator-container').removeClass('has-case');
    };

    caseSelector.hasCase = function () {
        return $('.configurator-container').hasClass('has-case');
    };

    return caseSelector;
});