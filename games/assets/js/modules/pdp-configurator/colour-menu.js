/*globals define*/
/*jslint plusplus: true */
define([
    'domlib',
    'modules/breakpoint',
    'modules/common'
], function ($) {
    'use strict';

    var ColourMenu = function ColourMenu() {

        return this;
    };

    ColourMenu.prototype.init = function ($parent) {
        this.$menu = $parent.find('.colour-menu');
        this.callbacks = [];
        this.initListeners();
    };

    ColourMenu.prototype.initListeners = function () {
        var colourMenu = this;

        $(colourMenu.$menu).find('ul li a').on('click', function (e) {
            e.preventDefault();
            colourMenu.performCallbacks(e);
        });
    };

    ColourMenu.prototype.onItemSelected = function (inputFunction) {
        this.callbacks.push(inputFunction);
    };

    ColourMenu.prototype.performCallbacks = function (id) {
        var i;

        for (i = 0; i < this.callbacks.length; i++) {
            this.callbacks[i](id);
        }
    };

    return {
        createColourMenu: function () {
            return new ColourMenu();
        }

    };
});