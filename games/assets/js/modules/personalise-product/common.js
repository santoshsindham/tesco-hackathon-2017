/*jslint plusplus: true */
/*global define: true, globalStaticAssetsPath: true, typeof, TescoData, window, require, document*/
define('modules/personalise-product/common', ['domlib', 'modules/overlay/common', 'modules/breakpoint'], function ($, overlay, breakpoint) {
    'use strict';

    function PersonaliseProduct(oSettings) {
        if (typeof oSettings !== 'object') {
            throw new Error("The parameter passed to the Personalise class is not an object.");
        }
        if (oSettings.sPDPSelector === undefined || oSettings.sPDPSelector === null || oSettings.sPDPSelector.length <= 0) {
            throw new Error("The PDP selector passed in is not valid.");
        }
        if (oSettings.sPersonaliseSelector  === undefined || oSettings.sPersonaliseSelector === null  || oSettings.sPersonaliseSelector.length <= 0) {
            throw new Error("The personalise selector passed in is not valid.");
        }
        if (oSettings.sProductName  === undefined || oSettings.sProductName === null  || oSettings.sProductName.length <= 0) {
            throw new Error("The product name passed in is not valid.");
        }

        this.sPDPSelector = oSettings.sPDPSelector; // required
        this.sPersonaliseSelector = oSettings.sPersonaliseSelector; // required
        this.sPersonaliseContainer = oSettings.sPersonaliseContainer || '#personaliseProductContainer';
        this.sCustomClass = oSettings.sCustomClass || 'personalise-product';
        this.sAcceptPersonalisationSelector = oSettings.sAcceptPersonalisationSelector || "#accept-personalisation-button";
        this.sAddToBasketSelector = oSettings.sAddToBasketSelector || ".addToBasketForm";
        this.sAddToBasketButtonSelector = oSettings.sAddToBasketButtonSelector || ".add-to-basket";
        this.sQuantitySelector = oSettings.sQuantitySelector || ".quantity-display";
        this.sAddedToButtonSelector = oSettings.sAddedToButtonSelector || ".added-to-basket";
        this.sPersonaliseErrorSelector = oSettings.sPersonaliseErrorSelector || ".personalise-error";
        this.sPersonaliseInfoSelector = oSettings.sPersonaliseInfoSelector || ".personalise-info";
        this.sMaxAlreadyInBasketSelector = oSettings.sMaxAlreadyInBasketSelector || "#maxAlreadyInBasket";
        this.sHiddenClass = oSettings.sHiddenClass || "displayNone";
        this.sPersonaliseButtonClass = oSettings.sPersonaliseButtonClass || "primary-button";
        this.sPersonaliseLinkClass = oSettings.sPersonaliseLinkClass || "link";
        this.sPersonaliseButtonData = oSettings.sPersonaliseButtonData || "data-button-text";
        this.sPersonaliseLinkData = oSettings.sPersonaliseLinkData || "data-link-text";
        this.oAddToBasketFormFields = { sGuid: "#personalisedGUID",
                                        sImageUrl: "#personalisedImageURL"
                                      };
        this.sProductName = oSettings.sProductName;
        this.sEmaginationAPIUrl = $('#EmaginationAPIURL').val() || 'https://api.emaginationstore.com/sandbox/v1.5/Personalisation';
        this.sEmaginationAuthCode = $('#EmaginationAuthCode').val() || 'ULqKR3ggGdICNIfP';
        this.sEmaginationPreviewGUID = "#EmaginationJS-PreviewGuid";
        this.oImageForBasketSettings = {
            iImageWidth: '120',
            bImageWatermark: 'false',
            iImageQuality: '75',
            sImageFormat: 'JPEG',
            sAspectRatio: '4:3',
            callbacks: {
                success: this.onGetImageURLForBasketSuccess,
                error: this.onGetImageURLForBasketError
            }
        };
        this.bIsPersonaliseProductContainerInDOM = false;
        this.bIsPersonalisedProductReadyToSave = false;
        this.bHasEmaginationInitialised = false;
        this.bHaveGlobalBindsBeenSet = false;
        this.bHasSKUBeenPersonalised = false;
        this.masterGUID = undefined;
        this.clonedGUID = undefined;
        this.bResetTriggered = false;
        this.bVariantHasBeenSelected = false;
    }

    PersonaliseProduct.prototype = {
        constructor: PersonaliseProduct,
        bindPersonalisationButtonEvents: function bindPersonalisationButtonEvents() {
            var self = this;

            self.$pdpSelector.on('click', self.sPersonaliseSelector, this.emaginationLauncherClickHandler.bind(self));

            self.$window.on('personaliseProduct:readyToAddToBasket', function () {
                self.handleReadyToAddToBasket();
            });

            self.$window.on('product:addedToBasket', function () {
                self.handleAddedToBasket();
            });

            self.$window.on('personaliseProduct:errorThrown', function () {
                self.showError();
            });

            self.$window.on('personaliseProduct:reset', function (e) {
                self.setProductPings('#product-carousel');
                self.destroyPersonalisedProductImage();
                self.setDefaultPDPImageVisible();
                self.setDisplayPersonalisedImageWindowProperty(false);
                self.resetPersonaliseButtons();
                self.resetAddToBasketForm();
                self.clearEmaginationCookies();
                self.bIsPersonalisedProductReadyToSave = false;
                self.bHasSKUBeenPersonalised = false;
                self.masterGUID = null;
                self.clonedGUID = null;
                self.bResetTriggered = true;
                try {
                    if (e.beenAddedToBasket) {
                        self.bResetTriggered = false;
                    }
                    if (e.resetVariantProperty) {
                        self.bVariantHasBeenSelected = false;
                        self.bResetTriggered = true;
                    }
                } catch (ignore) {}
            });

            self.$pdpSelector.on('click', self.sAddedToButtonSelector, function () {
                self.highlightInfo($(self.sPersonaliseInfoSelector), "added");
            });

            self.$window.on('PDPVariantSelectComplete', function (oVariantEvent) {
                var sMasterGUID,
                    sSKUid,
                    bDeferedInit = false;

                self.sProductName = oVariantEvent.currentProductVariant.hasOwnProperty('skuID') ? oVariantEvent.currentProductVariant.skuID : $('.main-details span[itemprop="sku"]').text();
                if (self.bHasEmaginationInitialised === true || self.bHasSKUBeenPersonalised === true) {
                    self.destroyPersonalisedProductImage();
                    self.bIsPersonalisedProductReadyToSave = false;
                    self.bVariantHasBeenSelected = true;
                    if (self.bHasSKUBeenPersonalised === true) {
                        self.deleteCurrentPersonalisation({keepCookie: true}); // Need to prevent this func from deleting the cookie
                        sMasterGUID = self.getMasterGUID();
                        if (sMasterGUID !== undefined || sMasterGUID !== null) {
                            bDeferedInit = true;
                            self.toggleDisablePersonaliseButton(true);
                            sSKUid = oVariantEvent.currentProductVariant.hasOwnProperty('skuID') ? oVariantEvent.currentProductVariant.skuID : $('.main-details span[itemprop="sku"]').text();
                            self.clearEmaginationCookies();
                            self.cloneGUID(sSKUid, true, function () {
                                self.setMasterGUIDAsClonedGUID();
                                self.init();
                                $.fn.EmaginationJS('setGUID', self.getMasterGUID());
                                self.updateAddToBasketFormFields();
                            });
                        }
                    } else {
                        self.deleteCurrentPersonalisation({keepCookie: false});
                    }
                }
                if (!bDeferedInit) {
                    self.init();
                }
            });

            breakpoint.mobileIn.push(function () {
                if (self.checkLightboxStatus() === true) {
                    self.removeFancyBoxOverlay();   // clear preview overlay if it open
                    self.setOverlayClosed();
                }
            });

            breakpoint.mobileOut.push(function () {
                if (self.checkLightboxStatus() === true) {
                    self.removeFancyBoxOverlay();   // clear preview overlay if it open
                    self.setOverlayClosed();
                }
            });

            self.bHaveGlobalBindsBeenSet = true;
        },

        removeFancyBoxOverlay: function removeFancyBoxOverlay() {
            var sFancyBoxEl = '.fancybox-overlay';

            if ($(sFancyBoxEl).length > 0) {
                $(sFancyBoxEl).remove();
            }
        },

        checkLightboxStatus: function checkLightboxStatus() {
            var bLightboxStatus = false;

            if ($('#lightbox').length > 0) {
                bLightboxStatus = true;
            }
            return bLightboxStatus;
        },

        bindStoredPersonalisationContentEvents: function bindStoredPersonalisationContentEvents() {
            var self = this,
                sLightboxEl = '#lightbox',
                sCloseButtonEl = 'a.close',
                sErrorOverlay = '.EmaginationErrorOverlay';

            $(sLightboxEl).on('click', self.sAcceptPersonalisationSelector, function () {
                self.handleAcceptPersonalisation();
            });

            $(sLightboxEl).on('click', sCloseButtonEl, function () {
                if ($(sErrorOverlay).length) {
                    $(sErrorOverlay).fadeOut(function () {
                        $(this).remove();
                    });
                }
                self.setOverlayClosed();
            });

            $(document).off('keydown.pdpPersonalisation').on('keydown.pdpPersonalisation', function (e) {
                var ESC_KEY_CODE = 27,
                    event = e || window.event;

                if (event.keyCode === ESC_KEY_CODE || event.which === ESC_KEY_CODE) {
                    if ($.fancybox.isOpen) {
                        $.fancybox.close();
                    } else {
                        self.setOverlayClosed();
                    }
                }
            });

            $('#overlay').on('click', function () {
                self.setOverlayClosed();
            });
        },

        personaliseContainerDOMCheck: function personaliseContainerDOMCheck() {
            var self = this,
                sPersonaliseContainer,
                sPersonaliseEl = self.sPersonaliseContainer;

            if ($(sPersonaliseEl).length === 0) {
                sPersonaliseContainer = '<section id="personaliseProductContainer"></section>';
                $('#wrapper').after(sPersonaliseContainer);
            } else {
                self.bIsPersonaliseProductContainerInDOM = true;
            }
        },

        showPersonalisationOverlay: function showPersonalisationOverlay(event) {
            var self = this,
                sPersonaliseEl = this.sPersonaliseContainer,
                oParams;

            self.personaliseContainerDOMCheck();
            oParams = {
                hideOnEsc: false,
                content: $(sPersonaliseEl),
                customClass: self.sCustomClass,
                callback: function () {
                    if (self.bIsPersonaliseProductContainerInDOM === false) {
                        self.initEmaginationEngine();
                        self.bHasEmaginationInitialised = true;
                        self.personaliseContainerDOMCheck();
                    }
                    self.setKioskOverlayHeading();
                }
            };
            self.hideError();
            self.setOverlayOpen(oParams);
            event.stopImmediatePropagation();
        },

        setKioskOverlayHeading: function setKioskOverlayHeading() {
            var sKioskOverlayHeading = '<h1 id="personalise-heading">Personalise your product</h1>';

            if (window.isKiosk()) {
                if ($('#lightbox #personalise-heading').length === 0) {
                    $('#lightbox').prepend(sKioskOverlayHeading);
                }
            }
        },

        setStoredPersonalisationContent: function setStoredPersonalisationContent(sPersonaliseContainer) {
            var sPersonaliseEl = sPersonaliseContainer !== undefined ? sPersonaliseContainer : '#personaliseProductContainer',
                $tmpPersonalisedContent = {};

            $tmpPersonalisedContent = $(sPersonaliseEl).detach();
            $('#wrapper').after($tmpPersonalisedContent);
        },

        setOverlayOpen: function setOverlayOpen(oParams) {
            overlay.show(oParams);
            this.bindStoredPersonalisationContentEvents();
        },

        setOverlayClosed: function setOverlayClosed() {
            overlay.hide();
            this.setStoredPersonalisationContent(this.sPersonaliseContainer);
            this.setClonedGUID();
        },

        handleAcceptPersonalisation: function handleAcceptPersonalisation() {
            this.bIsPersonalisedProductReadyToSave = true;
            if (this.bHasSKUBeenPersonalised) {
                this.setMasterGUIDAsClonedGUID();
            } else {
                if (this.getMasterGUID() === null || this.getMasterGUID() === undefined) {
                    if ($(this.sEmaginationPreviewGUID).length) {
                        this.setMasterGUID($(this.sEmaginationPreviewGUID).val());
                    }
                }
            }
            this.bHasSKUBeenPersonalised = true;
            this.updateAddToBasketFormFields();
            this.setOverlayClosed();
        },

        updateAddToBasketFormFields: function updateAddToBasketFormFields() {
            var sMasterGUIDValue = this.getMasterGUID();
            if (sMasterGUIDValue !== undefined) {
                if (this.setValueInForm(this.oAddToBasketFormFields.sGuid, sMasterGUIDValue)) {
                    this.getImageURLs(sMasterGUIDValue, this.oImageForBasketSettings);
                } else {
                    this.$window.trigger("personaliseProduct:errorThrown");
                }
            } else {
                this.$window.trigger("personaliseProduct:errorThrown");
            }
        },

        handleReadyToAddToBasket: function handleReadyToAddToBasket() {
            this.enableAddToBasket();
            this.restylePersonaliseButton(this.sPersonaliseButtonClass, this.sPersonaliseLinkClass);
            this.setPersonaliseButtonTextAttr(this.sPersonaliseButtonData);
            this.changePersonaliseButtonText(this.sPersonaliseLinkData);
        },

        handleAddedToBasket: function handleAddedToBasket() {
            var $quantity = $(this.sQuantitySelector),
                $addedToButton = $(this.sAddedToButtonSelector),
                eResetProduct = $.Event('personaliseProduct:reset');

            this.deleteCurrentPersonalisation({keepCookie: false});
            this.restrictAddIfLimitOfOne($quantity, $addedToButton);
            this.unbindEventsForPersonalisedProductImage();
            if (this.bVariantHasBeenSelected) {
                eResetProduct.resetVariantProperty = true;
            }
            eResetProduct.beenAddedToBasket = true;
            this.$window.trigger(eResetProduct);
        },

        resetPersonaliseButtons: function resetPersonaliseButtons() {
            this.disableAddToBasket();
            this.restylePersonaliseButton(this.sPersonaliseLinkClass, this.sPersonaliseButtonClass);
            this.changePersonaliseButtonText(this.sPersonaliseButtonData);
        },

        resetAddToBasketForm: function resetAddToBasketForm() {
            this.setValueInForm(this.oAddToBasketFormFields.sGuid, "");
            this.setValueInForm(this.oAddToBasketFormFields.sImageUrl, "");
        },

        bindEventsForPersonalisedProductImage: function bindEventsForPersonalisedProductImage() {
            var self = this,
                sPersonalisedProductImageContainerSelector = '.personalised-product-image';

            self.unbindEventsForPersonalisedProductImage();
            $(sPersonalisedProductImageContainerSelector).off().on('click', 'img', this.emaginationLauncherClickHandler.bind(self));
        },

        unbindEventsForPersonalisedProductImage: function unbindEventsForPersonalisedProductImage() {
            var sPersonalisedProductImageContainerSelector = '.personalised-product-image';
            $(sPersonalisedProductImageContainerSelector).off();
        },

        setValueInForm: function setValueInForm(sFormField, sValue) {
            var $formField = this.$addToBasketForm.find(sFormField);

            if ($formField.length > 0) {
                $formField.val(sValue);
                return true;
            }
            return false;
        },

        onGetImageURLForBasketSuccess: function onGetImageURLForBasketSuccess(previewUrls, self) {
            var sImageUrlToStore;

            if (previewUrls.length > 0) {
                // store the image url to use for adding to basket
                // NB could be more than one url returned, but only use the first url for the image to be shown in basket/checkout/order
                sImageUrlToStore = previewUrls[0];
                if (sImageUrlToStore !== "") {
                    if (self.setValueInForm(self.oAddToBasketFormFields.sImageUrl, sImageUrlToStore)) {
                        self.$window.trigger("personaliseProduct:readyToAddToBasket");
                    }
                }
            }
        },

        onGetImageURLForBasketError: function onGetImageURLForBasketError(self) {
            self.$window.trigger("personaliseProduct:errorThrown");
        },

        getImageURLs: function getImageURLs(sPreviewGUIDValue, oImageSettings) {
            var self = this;

            if (sPreviewGUIDValue) {
                $.ajax({
                    context: this,
                    dataType: 'jsonp',
                    url: this.sEmaginationAPIUrl + '/GetPreviewImages',
                    data: {
                        'AuthCode': this.sEmaginationAuthCode,
                        'Guid': sPreviewGUIDValue,
                        'ImageWidth': oImageSettings.iImageWidth,
                        'PreviewWatermark': oImageSettings.bImageWatermark,
                        'ImageQuality': oImageSettings.iImageQuality,
                        'ImageType': oImageSettings.sImageFormat,
                        'Aspect': oImageSettings.sAspectRatio
                    },
                    success: function (data) {
                        if (oImageSettings.hasOwnProperty('callbacks') && typeof oImageSettings.callbacks.success === "function") {
                            oImageSettings.callbacks.success(data.objResult, this);
                        }
                        if (self.bHasSKUBeenPersonalised) {
                            self.showPersonalisedProductImage(data.objResult[0].replace('width%3d120', 'width%3d565') + '&t=' + new Date().getTime());
                            self.bindEventsForPersonalisedProductImage();
                        }
                    },
                    error: function () {
                        if (oImageSettings.hasOwnProperty('callbacks') && typeof oImageSettings.callbacks.error === "function") {
                            oImageSettings.callbacks.error(this);
                        }
                    }
                });
            }
        },

        showPersonalisedProductImage : function showPersonalisedProductImage(src) {
            var sPersonalisedImageSelector = '#EmaginationJS-personalised-image',
                sProductDetailsSelector = '.details-container';

            if ($(sPersonalisedImageSelector).length) {
                $(sPersonalisedImageSelector).attr('src', src);
                return;
            }
            this.setDefaultPDPImageHidden();
            $(sProductDetailsSelector).after('<div class="product-carousel-s7 personalised-product-image"><img id="EmaginationJS-personalised-image" src="' + src + '" alt="Your personalised product"/></div>');
            this.setProductPings('.personalised-product-image');
            this.setDisplayPersonalisedImageWindowProperty(true);
        },

        setDefaultPDPImageHidden: function setDefaultPDPImageHidden() {
            var sProductImageContainerSelector = '#product-carousel',
                sStaticImageSelector = '.static-product-image',
                sScene7EnabledSelector = '.scene7-enabled';

            if ($(sStaticImageSelector + sScene7EnabledSelector).length > 0) {
                $(sProductImageContainerSelector).css({visibility: 'hidden', display: 'none'});
            } else {
                $(sStaticImageSelector).css({visibility: 'hidden', display: 'none'});
            }
        },

        setDefaultPDPImageVisible: function setDefaultPDPImageVisible() {
            var sProductImageContainerSelector = '#product-carousel',
                sStaticImageSelector = '.static-product-image',
                sScene7EnabledSelector = '.scene7-enabled';

            if ($(sStaticImageSelector + sScene7EnabledSelector).length > 0) {
                $(sProductImageContainerSelector).css({visibility: 'visible', display: 'block'});
                if (this.bVariantHasBeenSelected === true) {
                    require(['modules/pdp-s7viewer/common'], function (s7viewer) {
                        s7viewer.init();
                    });
                }
            } else {
                $(sStaticImageSelector).css({visibility: 'visible', display: 'block'});
            }
        },

        setProductPings: function setProductPings(sPingTargetSelector) {
            var $productPingsCollection;

            if ($('.product-ping').length > 0) {
                $productPingsCollection = $('.product-ping').detach();
                $(sPingTargetSelector).append($productPingsCollection);
            }
        },

        destroyPersonalisedProductImage: function destroyPersonalisedProductImage() {
            var sPersonalisedImageContainer = 'div.personalised-product-image';
            if ($(sPersonalisedImageContainer).length > 0) {
                $(sPersonalisedImageContainer).remove();
            }
        },

        enableAddToBasket: function enableAddToBasket() {
            if (this.$addToBasketForm.length) {
                this.$addToBasketForm.removeClass(this.sHiddenClass);
            }
        },

        disableAddToBasket: function disableAddToBasket() {
            if (this.$addToBasketForm.length) {
                this.$addToBasketForm.addClass(this.sHiddenClass);
            }
        },

        showPersonaliseButton: function showPersonaliseButton() {
            if (this.$maxAlreadyInBasket.length) {
                if (this.$maxAlreadyInBasket.val() !== "true") {
                    this.$personaliseButton.removeClass(this.sHiddenClass);
                }
            }
            this.$pdpSelector.find(this.sPersonaliseInfoSelector).removeClass(this.sHiddenClass);
        },

        restylePersonaliseButton: function restylePersonaliseButton(sClassToRemove, sClassToAdd) {
            this.$personaliseButton.removeClass(sClassToRemove);
            this.$personaliseButton.addClass(sClassToAdd);
        },

        setPersonaliseButtonTextAttr: function setPersonaliseButtonTextAttr(sAttrForText) {
            var sText = this.$personaliseButton.attr(sAttrForText),
                sExistingText;

            if (sText === undefined || sText.length === 0) {
                sExistingText = this.$personaliseButton.text();

                if (sExistingText.length > 0) {
                    this.$personaliseButton.attr(sAttrForText, sExistingText);
                }
            }
        },

        changePersonaliseButtonText: function changePersonaliseButtonText(sAttrForText) {
            var sText = this.$personaliseButton.attr(sAttrForText);
            if (sText !== undefined && sText.length > 0) {
                this.$personaliseButton.text(sText);
            }
        },

        deleteCurrentPersonalisation: function deleteCurrentPersonalisation(oOptions) {
            var oResetOptions = {
                bPreventInitialisation : true
            };
            oResetOptions = $.extend({}, oResetOptions, oOptions);
            $.fn.EmaginationJS('Reset', oResetOptions);
            $('#personaliseProductContainer').remove();
            this.bIsPersonaliseProductContainerInDOM = false;
            this.bHasEmaginationInitialised = false;
        },

        restrictAddIfLimitOfOne: function restrictAddIfLimitOfOne($quantity, $addedToButton) {
            // if bulk buy limit of one reached, prevent further add to basket or personalisation, reflect this
            if (($quantity.length > 0) && ($addedToButton.length > 0)) {
                if (($quantity.attr("data-qty-max") === "1")) {
                    this.$addToBasketForm.addClass(this.sHiddenClass);
                    $addedToButton.removeClass(this.sHiddenClass);
                    this.$personaliseButton.addClass(this.sHiddenClass);
                }
            }
        },

        highlightInfo: function highlightInfo($elementToHighlight, sHighlightClass) {
            $elementToHighlight.addClass(sHighlightClass);
        },

        showError: function showError() {
            $(this.sPersonaliseErrorSelector).removeClass(this.sHiddenClass);
        },

        hideError: function hideError() {
            $(this.sPersonaliseErrorSelector).addClass(this.sHiddenClass);
        },

        /**
         * Toggle visibility of save changes button.
         */
        toggleSaveChanges: function toggleSaveChanges(bPersonalised) {
            if (bPersonalised) {
                $(this.sAcceptPersonalisationSelector).removeAttr("disabled");
            } else {
                $(this.sAcceptPersonalisationSelector).attr('disabled', 'disabled');
            }
        },

        /**
         * Toggle enabled state of the back button.
         */
        toggleBackButton: function toggleBackButton(bEnabled) {
            if (bEnabled) {
                $('.EmaginationJS-Btn.EmaginationJS-ControlsBack').removeAttr("disabled");
            } else {
                $('.EmaginationJS-Btn.EmaginationJS-ControlsBack').attr('disabled', 'disabled');
            }
        },

        /**
         * Toggle visibility for product nav buttons.
         * Used for disabling with layer is updating to prevent nav.
         */
        togglePrevNextButtons: function togglePrevNextButtons(bVisible) {
            if (bVisible) {
                $('.EmaginationJS-Next, .EmaginationJS-Previous').removeClass('EmaginationJS-hidden');
            } else {
                $('.EmaginationJS-Next, .EmaginationJS-Previous').addClass('EmaginationJS-hidden');
            }
        },

        toggleUploadButton: function toggleUploadButton(bEnabled) {
            if (bEnabled) {
                $('#EmaginationJS-Dropzone').removeAttr('disabled');
                $('.dz-hidden-input').prop('disabled', false);
            } else {
                $('#EmaginationJS-Dropzone').attr('disabled', 'disabled');
                $('.dz-hidden-input').prop('disabled', true);
            }
        },

        toggleControlButtons: function toggleControlButtons(bEnabled) {
            if (bEnabled) {
                $('#EmaginationJS-HelpButton, #EmaginationJS-PreviewButton, #EmaginationJS-ResetButton').removeAttr('disabled');
            } else {
                $('#EmaginationJS-HelpButton, #EmaginationJS-PreviewButton, #EmaginationJS-ResetButton').attr('disabled', 'disabled');
            }
        },

        /*
         * Toggles the enabled state of the "Personalise Me"/"Edit Personalisation" button.
         * Add styling that shows this button as disabled. Might already exist.
         */
        toggleDisablePersonaliseButton : function toggleDisablePersonaliseButton(bDisabled) {
            var $button = $('#personalise-button');

            if (bDisabled) {
                $button.attr('disabled', 'disabled');
            } else {
                $button.removeAttr('disabled');
            }
        },

        /**
         * Toggles the enabled state of Emagination UI elements during layer updates.
         */
        toggleUIElements: function toggleUIElements(bEnabled) {
            this.togglePrevNextButtons(bEnabled);
            this.toggleBackButton(bEnabled);
            this.toggleUploadButton(bEnabled);
            this.toggleControlButtons(bEnabled);
        },

        initEmaginationEngine: function initEmaginationEngine() {
            var self = this;

            $(self.sPersonaliseContainer).EmaginationJS({
                APIUrl: self.sEmaginationAPIUrl,
                AuthCode: self.sEmaginationAuthCode,
                ImageQuality: 75,
                ImageFormat: 'JPEG',
                LoadingMessage: '<img src="' + globalStaticAssetsPath + 'fancybox/loading.gif" alt="" /><br /><br />Please Wait...',
                ProductName: self.sProductName,
                onLayerUpdating: function () {
                    $.fn.EmaginationJS('setState', {updating : true});
                    self.toggleSaveChanges(false);
                    self.toggleUIElements(false);
                },
                onLayerUpdated: function () {
                    $.fn.EmaginationJS('setState', {updating : false});
                    self.toggleUIElements(true);
                },
                onTextLayersUpdated: function (bPersonalised) {
                    self.toggleSaveChanges(bPersonalised);
                }
            });
        },

        setMasterGUID: function setMasterGUID(sNewGuid) {
            if (sNewGuid !== "") {
                this.masterGUID = sNewGuid;
            }
        },

        getMasterGUID: function getMasterGUID() {
            if (this.masterGUID === undefined) {
                if ($(this.sEmaginationPreviewGUID).length) {
                    this.masterGUID = $(this.sEmaginationPreviewGUID).val();
                }
            }
            return this.masterGUID;
        },

        setMasterGUIDAsClonedGUID: function setMasterGUIDAsClonedGUID() {
            this.masterGUID = this.getClonedGUID();
            this.setClonedGUID();
        },

        setClonedGUID: function setClonedGUID(sClonedGUID) {
            if (sClonedGUID !== undefined) {
                this.clonedGUID = sClonedGUID;
            } else {
                this.clonedGUID = undefined;
                $.fn.EmaginationJS('setGUID', this.getMasterGUID());
            }
        },

        getClonedGUID: function getClonedGUID() {
            return this.clonedGUID;
        },

        clearEmaginationCookies: function clearEmaginationCookies() {
            var oCookies = document.cookie.split(';'),
                sCurrentCookie,
                sCurrentCookieName,
                i;

            for (i = 0; i < oCookies.length; i++) {
                if (oCookies[i].match(/EmaginationJS/g)) {
                    sCurrentCookie = $.trim(oCookies[i]);
                    sCurrentCookieName = sCurrentCookie.split('=');
                    $.cookie(sCurrentCookieName[0], null, { path: '/' });
                }
            }
        },

        cloneGUID: function cloneGUID(sSKUid, bGetImages, fnCallback) {
            var self = this,
                sMasterGUID = this.getMasterGUID();

            bGetImages = bGetImages || true;
            $.fn.EmaginationJS('ClonePreview', sMasterGUID, sSKUid, function (result) {

                if (!self.bResetTriggered) {
                    if (!result.error) {
                        var sClonedGUID = result.guid;
                        self.setClonedGUID(sClonedGUID);
                        $.fn.EmaginationJS('setGUID', sClonedGUID);
                        $.fn.EmaginationJS('SetCookie', 'EmaginationJS-' + sSKUid.split(' ').join('-'), { guid: sClonedGUID, layerUpdated: false, textLayersUpdated: false }, 1);
                        if (bGetImages) {
                            self.getImageURLs(sClonedGUID, {
                                iImageWidth: '565',
                                bImageWatermark: 'false',
                                iImageQuality: '75',
                                sImageFormat: 'JPEG',
                                sAspectRatio: '4:3'
                            });
                        }
                        self.toggleDisablePersonaliseButton(false);
                        if (fnCallback) {
                            fnCallback();
                        }
                    }
                } else {
                    self.bResetTriggered = false;
                }
            });
        },

        setDisplayPersonalisedImageWindowProperty: function setDisplayPersonalisedImageWindowProperty(bEnabled) {
            var bIsPersonalisedImageEnabled = bEnabled !== undefined ? bEnabled : false;

            if (TescoData === 'undefined') {
                window.TescoData = {};
            }
            if (TescoData.pdp === 'undefined') {
                window.TescoData.pdp = {};
            }
            if (TescoData.pdp.personalisedProduct === 'undefined') {
                window.TescoData.pdp.personalisedProduct = {};
            }
            window.TescoData.pdp.bPersonalisedProduct = bIsPersonalisedImageEnabled;
        },

        initElements: function initElements() {
            this.$pdpSelector = $(this.sPDPSelector);
            this.$personaliseButton = this.$pdpSelector.find(this.sPersonaliseSelector);
            this.$addToBasketForm = this.$pdpSelector.find(this.sAddToBasketSelector);
            this.$maxAlreadyInBasket = this.$pdpSelector.find(this.sMaxAlreadyInBasketSelector);
            this.$window = $(window);
        },

        emaginationLauncherClickHandler: function emaginationLauncherClickHandler(e) {
            this.showPersonalisationOverlay(e);
            if (window.emagination) {
                if (this.bHasSKUBeenPersonalised) {
                    this.cloneGUID(this.sProductName, false, function () { $.fn.EmaginationJS('resize'); });
                } else {
                    if (this.bIsPersonaliseProductContainerInDOM === true) {
                        $.fn.EmaginationJS('resize');
                    }
                }
            }
        },

        init: function init() {
            var self = this;

            self.initElements();
            self.showPersonaliseButton();
            if (self.bHaveGlobalBindsBeenSet === false) {    // run once only
                self.bindPersonalisationButtonEvents();
            }
        }
    };

    return PersonaliseProduct;
});
