define(['domlib', 'modules/common'], function ($, common) {
    'use strict';

    var signout = {
        init: function () {
            common.customCheckBox.init($(".sign-out"));
        }
    };
    common.init.push(function () {
        signout.init();
    });
    return signout;
});