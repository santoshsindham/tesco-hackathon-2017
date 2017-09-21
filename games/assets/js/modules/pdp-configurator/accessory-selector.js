/*globals window, define*/
define([
    'modules/pdp-configurator/product-factory',
    'domlib',
    'modules/common'
], function (ProductFactory) {
    'use strict';

    var accessorySelector = new ProductFactory('accessory');

    accessorySelector.inits.push(function () {
        var action = accessorySelector.$parentContainer.find('.product-selector-inner').data('status'),
            $button = accessorySelector.$parentContainer.find('button.add-to-basket');
        $button.text(accessorySelector.getStatusText(action));

        if (action === "emwbis") {
            $button.addClass('out-of-stock');
        }
    });

    accessorySelector.getUpsellMsgTpl = function () {
        var title1 = accessorySelector.$parentContainer.find('header h2').text(),
            msg = window.PDPCONFIGURATOR.data.upsellMsgTpl.add;
        return msg.replace("{p1}", title1).replace("{p2}", "");
    };

    accessorySelector.getStatusText = function (action) {
        switch (action) {
        case "preOrder":
            return window.PDPCONFIGURATOR.data.statusText.preOrder;
        case "emwbis":
            return window.PDPCONFIGURATOR.data.statusText.alert;
        case "buy":
            return window.PDPCONFIGURATOR.data.statusText.add;
        }
    };

    return accessorySelector;
});