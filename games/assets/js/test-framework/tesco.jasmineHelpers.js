'use strict';

var TESCO = window.TESCO || {};

TESCO.jasmineHelpers = {

    createMockJqueryElement: function () {
        return {
            addClass: jasmine.createSpy(),
            removeClass: jasmine.createSpy(),
            on: jasmine.createSpy(),
            hasClass: jasmine.createSpy()
        };
    },

    createMockJqueryNodeList: function () {
        var myNodeList = ['<div></div>', '<div></div>'];
        myNodeList.removeClass = jasmine.createSpy();

        return myNodeList;
    },

    createMockEvent: function () {
        return {
            target: 'targetElement',
            preventDefault: jasmine.createSpy()
        };
    },

    createMockWindow: function () {
        return {
            trigger: jasmine.createSpy()
        };
    },

    createMockJqueryDeferred: function () {
        return {
            promise: jasmine.createSpy(),
            resolve: jasmine.createSpy
        };
    },

    createMockJqueryPromise: function () {
        return {
            then: jasmine.createSpy()
        };
    },

    createMockJqueryObj: function (jQueryConfig) {
        var defaultSelector = '.selector';
        return {
            addClass: jasmine.createSpy(),
            after: jasmine.createSpy(),
            append: jasmine.createSpy(),
            attributes: {
                style: {}
            },
            css: jasmine.createSpy().and.callFake(function (css) {
                this.attributes.style = css;
            }),
            find: jasmine.createSpy().and.callFake(function (find) {
                return TESCO.jasmineHelpers.createMockJqueryObj({
                    selector: find,
                    length: 1
                });
            }),
            hasClass: jasmine.createSpy(),
            length: jQueryConfig.length,
            next: jasmine.createSpy().and.callFake(function (next) {
                return TESCO.jasmineHelpers.createMockJqueryObj({
                    selector: next || defaultSelector,
                    length: 1
                });
            }),
            offset: jasmine.createSpy().and.callFake(function () {
                return {
                    top: null,
                    left: null
                };
            }),
            on: jasmine.createSpy(),
            outerHeight: jasmine.createSpy().and.returnValue(jQueryConfig.outerHeight),
            parent: jasmine.createSpy().and.callFake(function (parent) {
                return TESCO.jasmineHelpers.createMockJqueryObj({
                    selector: parent || jQueryConfig.parent || defaultSelector,
                    length: 1
                });
            }),
            removeClass: jasmine.createSpy(),
            selector: jQueryConfig.selector || defaultSelector,
            text: jasmine.createSpy(),
            wrap: jasmine.createSpy()
        };
    }
};