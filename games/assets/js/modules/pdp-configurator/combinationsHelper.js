/*global window, define */
/*jslint regexp: true */

define([
    'domlib',
    'modules/breakpoint',
    'modules/common'
], function ($, breakpoint) {
    'use strict';
    var init,
        utils,
        config,
        getUpsellMsgTpl,
        getTitle,
        getPrice,
        getPoints,
        getReleaseDate,
        getStatusData,
        getImage,
        setTitle,
        setPrice,
        setPoints,
        setImage,
        setStatus,
        setStatusTxt,
        setStatusAction,
        setAll,
        $p1,
        $p2,
        $combinedProduct;



    config = {
        imageSize: {
            mobile: "s",
            desktop: "l",
            kiosk: "xl"
        },
        statusId: {
            noItem: "noitem",
            preOrder: "preOrder",
            inStock: "buy",
            outOfStock: "emwbis"
        },
        statusAction: {
            addP1: "addTablet",
            addP2: "addCase",
            addP1P2: "addAll",
            alertP1: "alertTablet",
            alertP2: "alertCase",
            alertP1P2: "alertAll"
        },
        data: function () {
            var PDPCONFIGURATOR = window.PDPCONFIGURATOR;
            return PDPCONFIGURATOR.data;
        }
    };

    utils = {
        hasP2: function () {
            return $('.configurator-container').hasClass('has-case');
        },
        strToNum: function (num) {
            return window.parseFloat(num.replace(/[^0-9\.]+/g, ''));
        },
        getImagePath: function () {
            return $combinedProduct.data('base-image') + "{p1}_{p2}_{size}." + $combinedProduct.data('base-image-type');
        }
    };

    getUpsellMsgTpl = function getUpsellMsgTpl(msg) {
        var title1 = $p1.find('header h2').text(),
            title2 = utils.hasP2() ? (" + " + $p2.find('header h2').text()) : "";

        return msg.replace("{p1}", title1)
            .replace("{p2}", title2);
    };

    getReleaseDate = function getReleaseDate(p1Date, p2Date) {
        if (typeof p1Date !== "string") {
            p1Date = "";
        }

        if (typeof p2Date !== "string") {
            p2Date = "";
        }

        if ($.trim(p1Date).length < 1 && $.trim(p2Date).length > 0) {
            return p2Date;
        }

        return p1Date;
    };

    getTitle = function getTitle(title1, title2, releaseDate) {
        var $tmpl,
            tmpl = config.data().titleTmpl;

        tmpl = tmpl.replace('{p1}', title1);
        tmpl = tmpl.replace('{p2}', title2);
        tmpl = tmpl.replace('{date}', releaseDate);
        $tmpl = $(tmpl);

        if (!utils.hasP2()) {
            $tmpl.find('.p2-title').remove();
            $tmpl.find('.combination').remove();
        }

        if (!releaseDate) {
            $tmpl.find('.release-date').remove();
        }

        return $tmpl;
    };

    getPrice = function getPrice(p1Price, p2Price) {
        p1Price = utils.strToNum(p1Price);
        p2Price = utils.hasP2() ? utils.strToNum(p2Price) : 0;

        return "&pound;" + (p1Price + p2Price).toFixed(2);
    };

    getPoints = function getPoints(p1Points, p2Points) {
        p2Points = utils.hasP2() ? p2Points : 0;

        return config.data().clubCardMsg.replace('{points}', (p1Points + p2Points));
    };

    /*
     * For inventory availability matrix, see Adam Johnston(PO)
     */
    getStatusData = function getStatusData(p1StatusId, p2StatusId) {
        var data = {
            msg: "",
            text: "",
            action: null,
            hasReleaseDate: false
        };

        if (p1StatusId === config.statusId.preOrder && p2StatusId === config.statusId.preOrder) {
            data.msg = config.data().statusMsg.generic;
            data.text = config.data().statusText.preOrder;
            data.action = config.statusAction.addP1P2;
            data.hasReleaseDate = true;
        } else if (p1StatusId === config.statusId.preOrder && p2StatusId === config.statusId.inStock) {
            data.msg = config.data().statusMsg.generic;
            data.text = config.data().statusText.preOrder;
            data.action = config.statusAction.addP1P2;
            data.hasReleaseDate = true;
        } else if (p1StatusId === config.statusId.inStock && p2StatusId === config.statusId.preOrder) {
            data.msg = config.data().statusMsg.generic;
            data.text = config.data().statusText.preOrder;
            data.action = config.statusAction.addP1P2;
            data.hasReleaseDate = true;
        } else if (p1StatusId === config.statusId.inStock && p2StatusId === config.statusId.inStock) {
            data.msg = config.data().statusMsg.generic;
            data.text = config.data().statusText.add;
            data.action = config.statusAction.addP1P2;
        } else if (p1StatusId === config.statusId.outOfStock && p2StatusId === config.statusId.inStock) {
            data.msg = config.data().statusMsg.noP1Msg;
            data.text = config.data().statusText.alert;
            data.action = config.statusAction.alertP1;
        } else if (p1StatusId === config.statusId.inStock && p2StatusId === config.statusId.outOfStock) {
            data.msg = config.data().statusMsg.noP2Msg;
            data.text = config.data().statusText.alert;
            data.action = config.statusAction.alertP2;
        } else if (p1StatusId === config.statusId.outOfStock && p2StatusId === config.statusId.preOrder) {
            data.msg = config.data().statusMsg.noP1Msg;
            data.text = config.data().statusText.alert;
            data.action = config.statusAction.alertP1;
        } else if (p1StatusId === config.statusId.preOrder && p2StatusId === config.statusId.outOfStock) {
            data.msg = config.data().statusMsg.noP2Msg;
            data.text = config.data().statusText.alert;
            data.action = config.statusAction.alertP2;
        } else if (p1StatusId === config.statusId.outOfStock && p2StatusId === config.statusId.outOfStock) {
            data.msg = config.data().statusMsg.noP1P2Msg;
            data.text = config.data().statusText.alert;
            data.action = config.statusAction.alertP1P2;
        } else if (p1StatusId === config.statusId.preOrder && p2StatusId === config.statusId.noItem) {
            data.msg = config.data().statusMsg.generic;
            data.text = config.data().statusText.preOrder;
            data.action = config.statusAction.addP1;
            data.hasReleaseDate = true;
        } else if (p1StatusId === config.statusId.inStock && p2StatusId === config.statusId.noItem) {
            data.msg = config.data().statusMsg.generic;
            data.text = config.data().statusText.add;
            data.action = config.statusAction.addP1;
        } else if (p1StatusId === config.statusId.outOfStock && p2StatusId === config.statusId.noItem) {
            data.msg = config.data().statusMsg.noP1Msg;
            data.text = config.data().statusText.alert;
            data.action = config.statusAction.alertP1;
        }

        return data;
    };

    getImage = function getImage(p1Sku, p2Sku) {
        var imageUrl = utils.getImagePath().replace('{p1}', p1Sku);

        if (!utils.hasP2()) {
            imageUrl = imageUrl.replace('_{p2}', '');
        } else {
            imageUrl = imageUrl.replace('{p2}', p2Sku);
        }

        if (breakpoint.mobile) {
            imageUrl = imageUrl.replace('{size}', config.imageSize.mobile);
        } else if (breakpoint.kiosk) {
            imageUrl = imageUrl.replace('{size}', config.imageSize.kiosk);
        } else {
            imageUrl = imageUrl.replace('{size}', config.imageSize.desktop);
        }

        return imageUrl;
    };

    setTitle = function setTitle($title) {
        $combinedProduct.find('header h2').replaceWith($title);
    };

    setPrice = function setPrice() {
        var p1Price = $p1.find('.current-price:first').text(),
            p2Price = $p2.find('.current-price:first').text(),
            price = getPrice(p1Price, p2Price);
        $combinedProduct.find('.product-description .price').html(price);
    };

    setPoints = function setPoints() {
        var p1Points = utils.strToNum($p1.find('.clubcard:first').text()),
            p2Points = utils.strToNum($p2.find('.clubcard:first').text()),
            points = getPoints(p1Points, p2Points);
        $combinedProduct.find('.product-description .points').text(points);
    };

    setImage = function setImage() {
        var p1Sku = $p1.find('.product-selector-inner').data('sku'),
            p2Sku = $p2.find('.product-selector-inner').data('sku'),
            img = 'url("{url}")'.replace('{url}', getImage(p1Sku, p2Sku));
        $combinedProduct.find('.image-container').css({
            backgroundImage: img
        });
    };

    setStatus = function setStatus() {
        var p1StatusId = $p1.find('.product-selector-inner').data('status'),
            p2StatusId = !utils.hasP2() ? config.statusId.noItem : $p2.find('.product-selector-inner').data('status'),
            statusData = getStatusData(p1StatusId, p2StatusId);

        setStatusTxt(statusData);
        setStatusAction(statusData.action);
    };

    setStatusTxt = function setStatusTxt(statusData) {
        var p1Title = $p1.find('header h2').text(),
            p2Title = $p2.find('header h2').text(),
            p1Date = $p1.find('.product-selector-inner').data('release'),
            p2Date = $p2.find('.product-selector-inner').data('release'),
            releaseDate = statusData.hasReleaseDate ? getReleaseDate(p1Date, p2Date) : undefined,
            title = getTitle(p1Title, p2Title, releaseDate);

        $combinedProduct.find('.highlight').html(statusData.msg);
        $combinedProduct.find('.add-to-basket').text(statusData.text);
        $combinedProduct.find('.add-to-basket').toggleClass('out-of-stock', statusData.text === config.data().statusText.alert);
        setTitle(title);
    };

    setStatusAction = function setStatusAction(action) {
        $combinedProduct.find('button.add-to-basket').data('formaction', action);
    };

    setAll = function setAll() {
        setStatus();
        setPrice();
        setPoints();
        setImage();
        $combinedProduct.find('.add-to-basket-inner').detach().appendTo($combinedProduct);
    };

    init = function init(p1, p2, combinedView) {
        $p1 = $(p1);
        $p2 = $(p2);
        $combinedProduct = $(combinedView);
        setAll();
    };

    return {
        init: init,
        config: config,
        setAll: setAll,
        getUpsellMsgTpl: getUpsellMsgTpl
    };
});