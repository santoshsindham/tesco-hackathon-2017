/*jslint plusplus: true, nomen: true, indent: 4 */
/*globals window,document,console,define,require,$ */
define('modules/chip-and-pin/breadcrumb', ['modules/mvapi/common', 'modules/chip-and-pin/shared-models', 'modules/common'], function (mvApi, mvModels, common) {
    'use strict';
    var newPosition, spiBreadcrumb = {

        breadcrumbParent: '#progress-bar ul',
        breadcrumbChildren: '#progress-bar ul li',

        set: function (requestedPosition) {
            var setPosition;
            newPosition = (!/^\d$/.test(requestedPosition)) ? 1 : requestedPosition;
            setPosition = {
                'defaults': {
                    'position': newPosition
                }
            };
            mvApi.render('breadcrumb', setPosition, spiBreadcrumb.configure);
        },

        configure: function () {
            var updateChildClass,
                i = 0,
                updatedClasses = [];

            $(spiBreadcrumb.breadcrumbParent).removeClass();
            $(spiBreadcrumb.breadcrumbChildren).removeClass();
            updateChildClass = function updateChildClass(updatedClasses) {
                for (i; i < updatedClasses.length; i++) {
                    $(spiBreadcrumb.breadcrumbChildren).eq(i).addClass(updatedClasses[i]);
                }
            };

            switch (newPosition) {
            case 1:
                $(spiBreadcrumb.breadcrumbParent).addClass('position-1');
                updatedClasses = ['active', 'disabled', 'disabled', 'disabled'];
                updateChildClass(updatedClasses);
                break;
            case 2:
                $(spiBreadcrumb.breadcrumbParent).addClass('position-2');
                updatedClasses = ['done', 'active', 'disabled', 'disabled'];
                updateChildClass(updatedClasses);
                break;
            case 3:
                $(spiBreadcrumb.breadcrumbParent).addClass('position-3');
                updatedClasses = ['done', 'done', 'active', 'disabled'];
                updateChildClass(updatedClasses);
                break;
            case 4:
                $(spiBreadcrumb.breadcrumbParent).addClass('position-4');
                updatedClasses = ['done', 'done', 'done', 'active'];
                updateChildClass(updatedClasses);
                break;
            }
        },

        init: function () {
            mvApi.cacheInitialModels(mvModels);
        }
    };

    common.init.push(spiBreadcrumb.init);
    return spiBreadcrumb;
});