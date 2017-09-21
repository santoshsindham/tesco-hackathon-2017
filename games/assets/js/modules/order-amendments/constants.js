define('modules/order-amendments/constants', function () {
    'use strict';

    var self = {
        EVENTS: {
            ORDER_DETAILS_AMENDED: 'orderDetailsAmended',
            ORDER_DETAILS_AMENDS_CANCELLED: 'orderDetailsAmendsCancelled',
            ORDER_DETAILS_AMENDS_SECTION_DISCARDED: 'discardChanges',
            ORDER_DETAILS_AMENDS_SECTION_ACTIVE: 'onAmendSectionActivated',
            ORDER_DETAILS_STORE_CHANGE_SUCCESSFUL: 'storeChangeRequestSuccessful',
            ORDER_DETAILS_DELIVERY_DETAILS_AMENDED: 'deliveryDetailsChanged'
        }
    };

    return self;

});