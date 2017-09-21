/*global window, define*/
/*jslint nomen:true*/
define([
    'domlib',
    'modules/media-matrix/common',
    'modules/pdp-configurator/product-updater',
    'modules/pdp-s7viewer/common',
    'modules/pdp-configurator/product-info-carousel',
    'modules/common',
    'modules/breakpoint'
], function ($, mediaMatrix, productUpdater, pdpScene7, infoCarousel) {
    'use strict';
    var init,
        initProductInfoEvents,
        showProductInfo,
        hideProductInfoBtn,
        setBtnEvents,
        prodInfoCarousel,
        skuID,
        getCurrentSku,
        initS7Params,
        changeBannerTitles,
        $hideProductInfoBtn,
        $productInfoOverlay,
        $configuratorBanner;

    initProductInfoEvents = function initProductInfoEvents() {
        var carouselContent = $productInfoOverlay.find('.info-carousel-slider ul').html(),
            $carouselContent = $('<ul />').append(carouselContent);

        if (carouselContent) {
            $productInfoOverlay.removeClass('is-info-single');
            $productInfoOverlay.addClass('is-info-shown');
            if ($carouselContent.find('li').length > 1) {
                prodInfoCarousel = infoCarousel.create('product-carousel-info', carouselContent);
                prodInfoCarousel.carousel.calculateVisibleItems();
            } else {
                $productInfoOverlay.addClass('is-info-single');
            }
        } else {
            $productInfoOverlay.find('#pdp-product-info').remove();
            $productInfoOverlay.find('#pdp-product-zoom').addClass('current');
            $productInfoOverlay.find('#product-carousel').toggleClass('prodInfoVisible zoomVisible');
        }

        initS7Params();
        pdpScene7.init();
        setBtnEvents();
    };

    showProductInfo = function showProductInfo() {
        $productInfoOverlay.addClass('is-info-shown');
        $('.configurator-banner').addClass('is-product-info');
    };

    hideProductInfoBtn = function hideProductInfoBtn() {
        $productInfoOverlay.removeClass('is-info-shown');
        $configuratorBanner.removeClass('is-product-info');

        window.setTimeout(function () {
            // stop the video
            $productInfoOverlay.detach().appendTo('.configurator-container');
        }, 750);
    };

    setBtnEvents = function setBtnEvents() {
        $productInfoOverlay.find('.media-controls .button').on('click', changeBannerTitles);
        $hideProductInfoBtn.on('click', hideProductInfoBtn);
        $configuratorBanner.find('.product-info-banner .back-btn').on('click', hideProductInfoBtn);
    };

    getCurrentSku = function getCurrentSku() {
        return skuID;
    };

    changeBannerTitles = function changeBannerTitles() {
        $configuratorBanner.find('.product-info-banner .banner-msg').text($(this).text());
    };

    initS7Params = function initS7Params() {
        var $infoContainer = $productInfoOverlay.find('.pdp-configurator-info'),
            scene7PdpData;

        window.TescoData = window.TescoData || {};
        window.TescoData.pdp = window.TescoData.pdp || {};
        window.TescoData.pdp.scene7 = window.TescoData.pdp.scene7 || {};
        window._mediaCollectionUpdated = [];

        scene7PdpData = window.TescoData.pdp.scene7;
        scene7PdpData.s7ServerUrl = $infoContainer.data('serverurl');
        scene7PdpData.s7ImageSet = $infoContainer.data('imageset').replace(/ /gi, '');
        scene7PdpData.s7SpinSet =  $infoContainer.data('spinset');
        scene7PdpData._s7VideoSet = $infoContainer.data('videoset').replace(/[\[\]\'\" ]/gi, '').split(',');
        mediaMatrix.init();
    };

    init = function init(id, dataAttributes) {
        skuID = id;
        $productInfoOverlay = $('#productInfoOverlay');
        $hideProductInfoBtn = $productInfoOverlay.find('.close');
        $configuratorBanner = $('.configurator-banner');
        $('.pdp-configurator-info').empty();
        productUpdater.update(dataAttributes, 'productDetailOverlay', function (infoPromise) {
            infoPromise.then(function (d) {
                $('.pdp-configurator-info').replaceWith(d.productDetailOverlay);
                return this;
            }).done(initProductInfoEvents);
        });
    };

    return {
        init : init,
        show : showProductInfo,
        getCurrentSku : getCurrentSku
    };
});