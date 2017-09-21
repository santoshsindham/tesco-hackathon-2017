/*global define: true */
define(['domlib', 'modules/common', './common'], function ($, common, delivery) {

    'use strict';

    delivery.bindEvents = function () {
        $(document).on('click', '.delivery-options-flyout', delivery.show);
    };

    common.init.push(delivery.init);

});