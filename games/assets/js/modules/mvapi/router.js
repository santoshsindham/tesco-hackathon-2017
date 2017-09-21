/*jslint plusplus: true, regexp: true, nomen: true */
/*globals window,document,console,define */
define('modules/mvapi/router', ['backbone'], function (Backbone) {
    'use strict';

    var init, router, Router, lockId, getCurrentSection, setCurrentSection, currentSection;

    init = function init(routerData) {

        Router = Backbone.Router.extend(routerData);
        router = new Router();

        lockId = routerData.actions.lockOnRoute || null;

        router.on('route:defaultRoute', function (id) {

            if (id && routerData.actions[id]) {
                routerData.actions[id]();
            }

            if (lockId && id === lockId) {
                //Backbone.history.stop();
                /*
                if (window.external && window.external.navigationPanel) {
                    window.external.navigationPanel.backEnabled = false;
                }*/
            }

        });

        Backbone.history.start();
        console.log('[mvApi] Router initialized.');

        return router;
    };

    getCurrentSection = function getCurrentSection() {
        return currentSection;
    };

    setCurrentSection = function setCurrentSection(id) {
        currentSection = id;
    };

    return {
        init: init,
        getCurrentSection: getCurrentSection,
        setCurrentSection: setCurrentSection
    };

});