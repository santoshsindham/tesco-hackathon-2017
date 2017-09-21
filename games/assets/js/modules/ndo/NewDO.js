/*global define,window */
/*jslint regexp: true, nomen: true */
define('modules/ndo/NewDO', [
    'domlib'
], function ($) {

    'use strict';

    var NewDO,
        NDO_READY = "ndoReady",
        doneHandler_,
        cleanDeliveryOptionsHTML_,
        getFirstDeliveryOption_,
        deliveryOptionsHandler_,
        getDeliveryOptionCount_;

    NewDO = function () {
        this.url = null;
        this.deliveryDataRaw = null;
        this.deliveryDataMod = null;
    };

    NewDO.prototype.getDO = function (url) {
        var self = this;

        if (url === null || url === undefined) {
            throw new Error("NDO url is null or undefined");
        }

        this.url = url;

        $.ajax({
            url: this.url
        })
            .done(doneHandler_.bind(self))
            .fail(function (jqXHR) {
                throw new Error("Get delivery options failed: " +
                    jqXHR.statusText);
            });
    };

    NewDO.prototype.getDOForListing = function (sListingId) {
        var k,
            oDeliveryDataForListing,
            oDeliveryData = this.deliveryDataMod;

        for (k in oDeliveryData) {
            if (oDeliveryData.hasOwnProperty(k)) {
                if (k === sListingId) {
                    oDeliveryDataForListing = oDeliveryData[k];
                    return oDeliveryDataForListing;
                }
            }
        }
    };

    doneHandler_ = function doneHandler_(data) {
        var eReady = $.Event(NDO_READY),
            self = this;

        self.deliveryDataRaw = typeof data === 'string' ?
                JSON.parse(data) : data;
        self.deliveryDataMod = $.extend(true, {}, self.deliveryDataRaw);
        self.deliveryDataMod = deliveryOptionsHandler_(self.deliveryDataMod);

        eReady.oData = {
            searchScope: 'seller',
            searchKey: 'listingId',
            dataKey: 'deliveryData',
            dataValues: self.deliveryDataMod
        };

        $(window).trigger(eReady);
    };

    cleanDeliveryOptionsHTML_ = function (sDeliveryOptionsHTML) {
        return sDeliveryOptionsHTML.replace(
            /<(script|style|title)[^<]+<\/(script|style|title)>/gm,
            ''
        ).replace(/<(link|meta)[^>]+>/g, '');
    };

    getFirstDeliveryOption_ = function (sDeliveryOptionsHTML) {
        return $.trim($(sDeliveryOptionsHTML)
            .find('div.ndo-lead-text')[0].innerHTML);
    };

    getDeliveryOptionCount_ = function (sDeliveryOptionsHTML) {
        return $(sDeliveryOptionsHTML).find('li.ndo-item').length;
    };

    deliveryOptionsHandler_ = function (oDeliveryData) {
        var k,
            sListingId,
            sDeliveryOptionsHTML;

        for (k in oDeliveryData) {
            if (oDeliveryData.hasOwnProperty(k)) {
                if (k !== 'analytics' || k !== 'redirection') {
                    sListingId = k;
                    sDeliveryOptionsHTML =
                        oDeliveryData[sListingId].deliveryOptionsHTML;
                    if (sDeliveryOptionsHTML !== null &&
                            sDeliveryOptionsHTML !== '') {
                        sDeliveryOptionsHTML =
                            cleanDeliveryOptionsHTML_(sDeliveryOptionsHTML);
                        oDeliveryData[sListingId].firstDeliveryOption =
                            getFirstDeliveryOption_(sDeliveryOptionsHTML);
                        oDeliveryData[sListingId].deliveryOptionCount =
                            getDeliveryOptionCount_(sDeliveryOptionsHTML);
                    }
                }
            }
        }

        return oDeliveryData;
    };

    return NewDO;
});