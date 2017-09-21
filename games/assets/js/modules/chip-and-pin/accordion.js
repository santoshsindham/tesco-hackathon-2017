/*jslint plusplus: true, nomen: true */
/*globals window,document,console,define,require */
define('modules/chip-and-pin/accordion', ['domlib'], function ($) {
    'use strict';

    var accordion,
        setAccordion,
        handleToggleDetail;

    handleToggleDetail = function handleToggleDetail(e) {
        e.preventDefault();
        var $elem = $(this);

        if ($elem.parent('.accordionItem').find('.contentWrapper').is(':visible')) {
            $elem.parent('.accordionItem').find('.contentWrapper').slideUp();
            $elem.removeClass('changeToggleIcon');

        } else {
            $('.contentWrapper').slideUp();
            $('.toggleContentWrapper').removeClass('changeToggleIcon');

            $elem.parent('.accordionItem').find('.contentWrapper').slideDown();
            $elem.addClass('changeToggleIcon');
        }
    };

    setAccordion = function setAccordion($accordionWrapper) {

        $accordionWrapper.on('tap click', '.toggleContentWrapper', handleToggleDetail);

        var $elemContainer = $('.accordionItem');

        $elemContainer.each(function () {
            $elemContainer.find('.contentWrapper').hide();
        });
    };

    accordion = {
        setAccordion: setAccordion
    };

    return accordion;
});