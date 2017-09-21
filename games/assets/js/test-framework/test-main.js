/*globals window */
/*jslint nomen: true*/
(function () {
    'use strict';
    var allTestFiles,
        TEST_REGEXP,
        pathToModule;

    allTestFiles = [];
    TEST_REGEXP = /(spec|test)\.js$/i;

    pathToModule = function pathToModule(path) {
        return path.replace(/^\/base\//, '').replace(/\.js$/, '');
    };
    /*jslint nomen: true*/
    $.each(window.__karma__.files, function (file) {
        if (TEST_REGEXP.test(file)) {
            // Normalize paths to RequireJS module names.
            allTestFiles.push(pathToModule(file));
        }
    });

    require.config({
        // Karma serves files under /base, which is the basePath from your config file
        baseUrl: '/base',
        paths: {
            'domlib': 'lib/domlib',
            'placeholder': 'lib/html5placeholder.jquery',
            'orientationFix': 'lib/ios-orientation-fix',
            'validate': 'lib/jquery.validate',
            'validate.methods': 'lib/jquery.validate.methods',
            'zepto.scroll': 'lib/zepto.scroll',
            'zepto.extras': 'lib/zepto.extras',
            'dotdotdot': 'lib/jquery.zepto.dotdotdot-1.5.6',
            'zepto.selector': 'lib/zepto.selector',
            'zepto.assets': 'lib/zepto.assets',
            'zepto.touch': 'lib/zepto.touch',
            'jquery.touch': 'lib/jquery.zepto.touch',
            'zepto.data': 'lib/zepto.data',
            'zepto.ghostclick': 'lib/zepto.ghostclick',
            'zepto.stack': 'lib/zepto.stack',
            'pinit': 'lib/pinit',
            'jquery.cookie': 'lib/jquery.cookie',
            'jquery.datepicker': 'lib/bootstrap-datepicker',
            'jquery.countdown': 'lib/jquery.countdown',
            'mustache': 'lib/mustache',
            'fastclick': 'lib/fast-click',
            'password.strength': 'lib/password.strength',
            'hoverIntent': 'lib/jquery.hoverIntent',
            'backbone': 'lib/backbone-1.1.2.min',
            'underscore': 'lib/underscore-1.6.0.min',
            'text': 'lib/requirejs/text',
            'json': 'lib/requirejs/json'
        },
        shim: {
            'domlib': {
                exports: '$'
            },
            'zepto.scroll': {
                deps: ['domlib'],
                exports: '$'
            },
            'zepto.stack': {
                deps: ['domlib'],
                exports: '$'
            },
            'zepto.extras': {
                deps: ['domlib'],
                exports: '$'
            },
            'zepto.selector': {
                deps: ['domlib', 'zepto.extras'],
                exports: '$'
            },
            'zepto.assets': {
                deps: ['domlib'],
                exports: '$'
            },
            'zepto.touch': {
                deps: ['domlib'],
                exports: '$'
            },
            'jquery.touch': {
                deps: ['domlib'],
                exports: '$'
            },
            'zepto.data': {
                deps: ['domlib'],
                exports: '$'
            },
            'zepto.ghostclick': {
                deps: ['domlib'],
                exports: '$'
            },
            'mustache': {
                exports: 'mustache'
            },
            'placeholder': ['domlib'],
            'jQueryUI': ['domlib'],
            'validate': ['domlib'],
            'validate.methods': ['domlib', 'validate'],
            'dotdotdot': ['domlib'],
            'pinit': ['pinit'],
            'jquery.cookie': ['domlib'],
            'jquery.datepicker': ['domlib'],
            'jquery.countdown': ['domlib'],
            'fastclick': []
        },
        // dynamically load all test files
        deps: allTestFiles,
        client: {
            requireJsShowNoTimestampsError: false
        },
        // we have to kickoff jasmine, as it is asynchronous
        callback: window.__karma__.start
    });
}());
