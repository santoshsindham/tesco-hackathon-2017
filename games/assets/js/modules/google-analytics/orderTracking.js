/*globals define, window  */
/*jslint regexp: true, plusplus: true */
define(['domlib'], function ($) {
    'use strict';

    var removePoundSymbol,
        getProductData,
        getPurchaseInformation,
        getDeliveryCost,
        getProductArray,
        getProductArrayForBasket,
        getProductDataFromBasket;

    removePoundSymbol = function (price) {
        return $.trim(price).replace(/\u00A3/, '');
    };

    getProductData = function (product) {
        var $product = $(product),
            id = $product.find('.dg-items-pn').text(),
            name = $.trim($product.find('.dg-items-pt').text()),
            price = removePoundSymbol($product.find('.dg-items-base-cost').text()),
            quantity = $product.find('.commerce-item-qty').text();

        return {
            'id': id,
            'name': name,
            'price': price,
            'quantity': quantity
        };
    };

    getPurchaseInformation = function () {
        var orderConfirmationNumber = $('.order-number', '#order-confirmation-header').text(),
            totalBasketValue = removePoundSymbol($('.total-wrapper h3 .value', '#payment-summary').text());

        return {
            'id': orderConfirmationNumber,
            'revenue': totalBasketValue,
            'affiliation': 'GMO',
            'shipping': getDeliveryCost()
        };
    };

    getDeliveryCost = function getDeliveryCost() {
        var fDeliveryValue = 0.00,
            sDeliveryCost = '';
        $('.delivery-charge').each(function () {
            sDeliveryCost = removePoundSymbol($(this).find('.value').text());
            if (!isNaN(sDeliveryCost)) {
                fDeliveryValue += parseFloat(sDeliveryCost, 10);
            }
        });
        return fDeliveryValue.toString();
    };

    getProductArray = function getProductArray() {
        var aProducts = [];

        $('.product-block', '.delivery-group-items').each(function () {
            var oProductData = getProductData(this);
            aProducts.push(oProductData);
        });

        return aProducts;

    };

    getProductArrayForBasket = function getProductArrayForBasket() {
        var aProducts = [];

        $('.basket-item', '#basket-main').each(function () {
            var oProductData = getProductDataFromBasket($(this));
            aProducts.push(oProductData);
        });

        return aProducts;

    };

    getProductDataFromBasket = function ($elem) {
        var id = $elem.data('sku'),
            name = $.trim($elem.find('.basketItemProductName').text()),
            price = removePoundSymbol($elem.find('.price .current').text()),
            quantity = $elem.find('.basketItemQty').val();

        return {
            'id': id,
            'name': name,
            'price': price,
            'quantity': quantity
        };
    };

    return {
        setOrderConfirmationPageView: function () {
            var aProducts = getProductArray(),
                i = 0;

            window.ga('require', 'ec');
            for (i = 0; i < aProducts.length; i++) {
                window.ga('ec:addProduct', aProducts[i]);
            }

            window.ga('ec:setAction', 'purchase', getPurchaseInformation());
        },
        getPurchaseInformation: getPurchaseInformation,
        getProductArray: getProductArray,
        getProductArrayForBasket: getProductArrayForBasket
    };
});