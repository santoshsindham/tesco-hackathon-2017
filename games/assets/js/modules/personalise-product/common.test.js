/*
define(['modules/personalise-product/common'], function (Personalise) {
    'use strict';
    describe('Personalise product handler - product details', function () {
        var mock,
            personaliseInstance;

        beforeEach(function () {
            mock = {
                event: {
                    stopImmediatePropagation: jasmine.createSpy()
                },
                oSettings: {
                    sPDPSelector: ".product-description",
                    sPersonaliseSelector: "#personalise-button",
                    sPersonaliseContainer: ".personalise",
                    sProductName: "test product",
                    oAddToBasketFormFields: {
                        sGuid: "#personalisedGUID",
                        sImageUrl: "#personalisedImageURL"
                    },
                    sHiddenClass: "displayNone",
                    sPersonaliseButtonClass: "primary-button",
                    sPersonaliseLinkClass: "link",
                    sPersonaliseButtonData: "data-button-text",
                    sPersonaliseLinkData: "data-link-text"
                },
                $pdpSelector: TESCO.jasmineHelpers.createMockJqueryElement(),
                $personaliseContainer: TESCO.jasmineHelpers.createMockJqueryElement(),
                $acceptPersonaliseButton : TESCO.jasmineHelpers.createMockJqueryElement(),
                $addToBasketForm : TESCO.jasmineHelpers.createMockJqueryElement(),
                $personaliseButton : TESCO.jasmineHelpers.createMockJqueryElement(),
                $window: TESCO.jasmineHelpers.createMockWindow()
            };
        });

        afterEach(function () {
            mock = null;
            personaliseInstance = null;
        });

        describe('Create a new Personalise instance', function () {
            describe('GIVEN no settings are passed in', function () {
                it('THEN it should throw an error', function () {
                    expect(function () {
                        return new Personalise();
                    }).toThrowError("The parameter passed to the Personalise class is not an object.");
                });
            });
            describe('GIVEN required setting "PDP selector" is not passed in', function () {
                describe('WHEN there is no "PDP selector"', function () {
                    it('THEN it should throw an error', function () {
                        expect(function () {
                            return new Personalise({});
                        }).toThrowError("The PDP selector passed in is not valid.");
                    });
                });
                describe('WHEN there is a null "PDP selector"', function () {
                    it('THEN it should throw an error', function () {
                        expect(function () {
                            return new Personalise({sPDPSelector: null});
                        }).toThrowError("The PDP selector passed in is not valid.");
                    });
                });
                describe('WHEN there is an empty "PDP selector"', function () {
                    it('THEN it should throw an error', function () {
                        expect(function () {
                            return new Personalise({sPDPSelector: ""});
                        }).toThrowError("The PDP selector passed in is not valid.");
                    });
                });
            });
            describe('GIVEN required setting "personalise selector" is not passed in', function () {
                describe('WHEN there is no "personalise selector"', function () {
                    it('THEN it should throw an error', function () {
                        expect(function () {
                            return new Personalise({
                                sPDPSelector: ".product"
                            });
                        }).toThrowError("The personalise selector passed in is not valid.");
                    });
                });
                describe('WHEN there is a null "PDP selector"', function () {
                    it('THEN it should throw an error', function () {
                        expect(function () {
                            return new Personalise({
                                sPDPSelector: ".product",
                                sPersonaliseSelector: null
                            });
                        }).toThrowError("The personalise selector passed in is not valid.");
                    });
                });
                describe('WHEN there is an empty "PDP selector"', function () {
                    it('THEN it should throw an error', function () {
                        expect(function () {
                            return new Personalise({
                                sPDPSelector: ".product",
                                sPersonaliseSelector: ""
                            });
                        }).toThrowError("The personalise selector passed in is not valid.");
                    });
                });
            });
            describe('GIVEN required settings are passed in', function () {

                beforeEach(function () {
                    personaliseInstance = new Personalise(mock.oSettings);
                });

                it('THEN it should create a new Personalise instance with the settings', function () {
                    expect(personaliseInstance.sPDPSelector).toEqual(mock.oSettings.sPDPSelector);
                    expect(personaliseInstance.sPersonaliseSelector).toEqual(mock.oSettings.sPersonaliseSelector);
                    expect(personaliseInstance.sPersonaliseContainer).toEqual(mock.oSettings.sPersonaliseContainer);
                });
            });
        });

        describe('init', function () {
            beforeEach(function () {
                spyOn(Personalise.prototype, "initElements");
                spyOn(Personalise.prototype, "showPersonaliseButton");
                spyOn(Personalise.prototype, "bindPersonalisationButtonEvents");
                personaliseInstance = new Personalise(mock.oSettings);
                personaliseInstance.init();
            });
            it('Gets the DOM elements needed for bind events', function () {
                expect(personaliseInstance.initElements).toHaveBeenCalled();
            });
            it('Shows the personalise button on the page', function () {
                expect(personaliseInstance.showPersonaliseButton).toHaveBeenCalled();
            });
            it('Calls bind events for the personalisation buttons', function () {
                expect(personaliseInstance.bindPersonalisationButtonEvents).toHaveBeenCalled();
            });
        });

        xdescribe('Bind Personalisation Button Events', function () {
            beforeEach(function () {
                spyOn(Personalise.prototype, "showPersonalisationOverlay");

                personaliseInstance = new Personalise(mock.oSettings);
                personaliseInstance.$pdpSelector = mock.$pdpSelector;
                personaliseInstance.$window = mock.$window;
                personaliseInstance.bindPersonalisationButtonEvents();
            });

            xit('Binds the click event on the personalise button', function () {
                self.$pdpSelector.trigger('click');
                expect(personaliseInstance.showPersonalisationOverlay).toHaveBeenCalled();
            });
            xit('Listens to the personaliseProduct:readyToAddToBasket event', function () {
                expect(mock.$window.on).toHaveBeenCalledWith("personaliseProduct:readyToAddToBasket", personaliseInstance.handleReadyToAddToBasket);
            });
            xit('Listens to the personaliseProduct:reset event', function () {
                expect(mock.$window.on).toHaveBeenCalledWith("personaliseProduct:reset", personaliseInstance.resetPersonalisationDOMElements);
                expect(mock.$window.on).toHaveBeenCalledWith("personaliseProduct:reset", personaliseInstance.initEmaginationEngine);
            });
        });

        xdescribe('Bind storedPersonalisationContent Events', function () {
            xit('Binds the click event on the accept personalise buton', function () {
            });
            xit('Binds the click event on the close buton', function () {
            });
        });

        describe('GIVEN I have pressed the button to personalise the product', function () {
            beforeEach(function () {
                spyOn(Personalise.prototype, "setOverlayOpen");
                personaliseInstance = new Personalise(mock.oSettings);
                personaliseInstance.$personaliseContainer = mock.$personaliseContainer;
                personaliseInstance.$personaliseContainer.detach = jasmine.createSpy();
                personaliseInstance.showPersonalisationOverlay(mock.event);
            });

            it('THEN the overlay is opened', function () {
                expect(personaliseInstance.setOverlayOpen).toHaveBeenCalled();
            });
            describe('WHEN I have already personalised this product while on this page', function () {
                it('THEN I should see my last personalisation', function () {
                });
            });

            describe('WHEN I have not already personalised this product while on this page', function () {
                it('THEN I should see the initial personalisation', function () {
                });
            });
        });

        describe('GIVEN I have accepted the personalisation of the product', function () {
            beforeEach(function () {
                spyOn(Personalise.prototype, "setOverlayClosed");
                spyOn(Personalise.prototype, "clonePreviewGuid");
                personaliseInstance = new Personalise(mock.oSettings);
                personaliseInstance.$window = mock.$window;
            });
            it('THEN get the guid for the personalisation', function () {
                spyOn(Personalise.prototype, "getPreviewGUID").and.returnValue("");
                personaliseInstance.handleAcceptPersonalisation();
                expect(personaliseInstance.getPreviewGUID).toHaveBeenCalled();
            });
            it('THEN the personalise product overlay is closed', function () {
                // in callback of clone preview           
            });
            describe('WHEN getting the guid is successful', function () {
                beforeEach(function () {
                    mock.sMasterGUID = "abcd";
                    spyOn(Personalise.prototype, "getImageURLs");
                    spyOn(Personalise.prototype, "showError");
                });
                it('THEN the guid is set in the add to basket form', function () {
                    spyOn(Personalise.prototype, "setValueInForm");
                    personaliseInstance.updateAddToBasketFormFields(mock.sMasterGUID);
                    expect(personaliseInstance.setValueInForm).toHaveBeenCalledWith(mock.oSettings.oAddToBasketFormFields.sGuid, mock.sMasterGUID);
                });
                describe('WHEN the guid is successfully set in the add to basket form', function () {
                    it('THEN get the image urls for use in the basket', function () {
                        mock.oImageSettingsForBasket = {
                            iImageWidth: '120',
                            bImageWatermark: 'false',
                            iImageQuality: '75',
                            sImageFormat: 'jpg',
                            sAspectRatio: '4:3',
                            callbacks: {
                                success: personaliseInstance.onGetImageURLForBasketSuccess,
                                error: personaliseInstance.onGetImageURLForBasketError
                            }
                        };
                        spyOn(Personalise.prototype, "setValueInForm").and.returnValue(true);
                        personaliseInstance.updateAddToBasketFormFields(mock.sMasterGUID);
                        personaliseInstance.oImageSettingsForBasket = mock.oImageSettingsForBasket;
                        expect(personaliseInstance.getImageURLs).toHaveBeenCalledWith(mock.sMasterGUID, mock.oImageSettingsForBasket);
                    });
                });
                describe('WHEN the guid is NOT successfully set in the add to basket form', function () {
                    beforeEach(function () {
                        spyOn(Personalise.prototype, "setValueInForm").and.returnValue(false);
                        personaliseInstance.updateAddToBasketFormFields(mock.sMasterGUID);
                    });
                    it('THEN do not get the image urls for use in the basket', function () {
                        expect(personaliseInstance.getImageURLs).not.toHaveBeenCalled();
                    });
                    it('THEN show an error', function () {
                        expect(mock.$window.trigger).toHaveBeenCalledWith("personaliseProduct:errorThrown");
                    });
                });
            });
            describe('WHEN getting the guid is NOT successful', function () {
                beforeEach(function () {
                    mock.sMasterGUID = "";
                    spyOn(Personalise.prototype, "setValueInForm");
                    personaliseInstance.updateAddToBasketFormFields(mock.sMasterGUID);                    
                });
                it('THEN the guid is NOT set in the add to basket form', function () {
                    expect(personaliseInstance.setValueInForm).not.toHaveBeenCalledWith(mock.oSettings.oAddToBasketFormFields.sGuid, mock.sMasterGUID);
                });
            });
        }); 
        
        describe('GIVEN that getting the image urls for the basket was successful', function () {
            beforeEach(function () {
                personaliseInstance = new Personalise(mock.oSettings);
                personaliseInstance.$window = mock.$window;
            });
            describe('WHEN there is one image url', function () {
                beforeEach(function () {
                    spyOn(Personalise.prototype, "setValueInForm").and.returnValue(true);
                    mock.previewUrls = ["testImageUrl"];
                    personaliseInstance.onGetImageURLForBasketSuccess(mock.previewUrls, personaliseInstance);
                });
                it('THEN this url is set in the form', function () {
                    expect(personaliseInstance.setValueInForm).toHaveBeenCalledWith(mock.oSettings.oAddToBasketFormFields.sImageUrl, mock.previewUrls[0]);
                });
                it('THEN an event has fired to indicate that the product is ready to add to basket', function () {
                    expect(mock.$window.trigger).toHaveBeenCalledWith("personaliseProduct:readyToAddToBasket");
                });
            });
            describe('WHEN there is more than one image url', function () {
                beforeEach(function () {
                    spyOn(Personalise.prototype, "setValueInForm").and.returnValue(true);
                    mock.previewUrls = ["testImageUrl1", "testImageUrl2"];
                    personaliseInstance.onGetImageURLForBasketSuccess(mock.previewUrls, personaliseInstance);
                });
                it('THEN the first url is set in the form', function () {
                    expect(personaliseInstance.setValueInForm).toHaveBeenCalledWith(mock.oSettings.oAddToBasketFormFields.sImageUrl, mock.previewUrls[0]);
                });
                it('THEN an event has fired to indicate that the product is ready to add to basket', function () {
                    expect(mock.$window.trigger).toHaveBeenCalledWith("personaliseProduct:readyToAddToBasket");
                });
            });
            describe('WHEN there are no image urls', function () {
                beforeEach(function () {
                    spyOn(Personalise.prototype, "setValueInForm").and.returnValue(false);
                    mock.previewUrls = [];
                    personaliseInstance.onGetImageURLForBasketSuccess(mock.previewUrls, personaliseInstance);
                });
                it('THEN no url is set in the form', function () {
                    expect(personaliseInstance.setValueInForm).not.toHaveBeenCalled();
                });
                it('THEN the event has NOT fired to indicate that the product is ready to add to basket', function () {
                    expect(mock.$window.trigger).not.toHaveBeenCalledWith("personaliseProduct:readyToAddToBasket");
                });
            });
        });
        describe('GIVEN that getting the image urls for the basket was NOT successful', function () {
            beforeEach(function () {
                personaliseInstance = new Personalise(mock.oSettings);
                personaliseInstance.$window = mock.$window;
                personaliseInstance.onGetImageURLForBasketError(personaliseInstance);
            });
            it('THEN show an error', function () {
                expect(mock.$window.trigger).toHaveBeenCalledWith("personaliseProduct:errorThrown");
            });
        });


   /*     xdescribe('GIVEN I have not personalised the product', function () {
                        
        	beforeEach(function () {
        	       
        		spyOn(personaliseProduct, "IsPersonalised").and.returnValue(false);
        		// event has not fired
        		//searchifyInstance = new Searchify();
        	});
        	
        	it('THEN I should not be able to add to basket', function () {
        	});
        });  
        
        describe('GIVEN the event has fired to indicate that the product is ready to add to basket', function () {
            beforeEach(function () {
                personaliseInstance = new Personalise(mock.oSettings);
                mock.$addToBasketForm.length = 1;
                personaliseInstance.$personaliseButton = mock.$personaliseButton;
                spyOn(Personalise.prototype, "enableAddToBasket");                
                spyOn(Personalise.prototype, "restylePersonaliseButton");
                spyOn(Personalise.prototype, "setPersonaliseButtonTextAttr");
                spyOn(Personalise.prototype, "changePersonaliseButtonText");
                personaliseInstance.handleReadyToAddToBasket();
            });
            it('THEN I should be able to add to basket', function () {
                expect(personaliseInstance.enableAddToBasket).toHaveBeenCalled();
            });
            it('THEN I should see a differently styled personalise button', function () {
                expect(personaliseInstance.restylePersonaliseButton).toHaveBeenCalledWith(mock.oSettings.sPersonaliseButtonClass, mock.oSettings.sPersonaliseLinkClass);
            });
            it('THEN I should set a data attribute for the personalise button text', function () {
                expect(personaliseInstance.setPersonaliseButtonTextAttr).toHaveBeenCalledWith(mock.oSettings.sPersonaliseButtonData);
            });
            it('THEN I should see different text in the personalise button', function () {
                expect(personaliseInstance.changePersonaliseButtonText).toHaveBeenCalledWith(mock.oSettings.sPersonaliseLinkData);
            });
        });

        describe('GIVEN a call to reset personalise buttons', function () {
            beforeEach(function () {
                personaliseInstance = new Personalise(mock.oSettings);
                personaliseInstance.$personaliseButton = mock.$personaliseButton;
                spyOn(Personalise.prototype, "disableAddToBasket");                
                spyOn(Personalise.prototype, "restylePersonaliseButton");
                spyOn(Personalise.prototype, "changePersonaliseButtonText");
                personaliseInstance.resetPersonaliseButtons();
            });
            it('THEN I should not be able to add to basket', function () {
                expect(personaliseInstance.disableAddToBasket).toHaveBeenCalled();
            });
            it('THEN I should see a differently styled personalise button', function () {
                expect(personaliseInstance.restylePersonaliseButton).toHaveBeenCalledWith(mock.oSettings.sPersonaliseLinkClass, mock.oSettings.sPersonaliseButtonClass);
            });
            it('THEN I should see different text in the personalise button', function () {
                expect(personaliseInstance.changePersonaliseButtonText).toHaveBeenCalledWith(mock.oSettings.sPersonaliseButtonData);
            });
        });
                
        describe('GIVEN a call to set personalise button data attribute', function () {
            beforeEach(function () {
                personaliseInstance = new Personalise(mock.oSettings);
                personaliseInstance.$personaliseButton = mock.$personaliseButton;
                personaliseInstance.$personaliseButton.attr = jasmine.createSpy();
            });  
            describe('WHEN the element has text', function () {
                beforeEach(function () {
                    mock.sPersonaliseButtonText = "Personalise me";
                    personaliseInstance.$personaliseButton.text = jasmine.createSpy().and.returnValue(mock.sPersonaliseButtonText);
                    personaliseInstance.setPersonaliseButtonTextAttr(mock.oSettings.sPersonaliseButtonData);
                });
            
                it('THEN there should be a data attribute ', function () {
                    expect(personaliseInstance.$personaliseButton.attr).toHaveBeenCalledWith(mock.oSettings.sPersonaliseButtonData, mock.sPersonaliseButtonText);
                });
            });
            
            describe('WHEN the element does not have text', function () {
                beforeEach(function () {
                    mock.sPersonaliseButtonText = "";
                    personaliseInstance.$personaliseButton.text = jasmine.createSpy().and.returnValue(mock.sPersonaliseButtonText);
                    personaliseInstance.setPersonaliseButtonTextAttr(mock.oSettings.sPersonaliseButtonData);
                });
            
                it('THEN there should be a data attribute ', function () {
                    expect(personaliseInstance.$personaliseButton.attr).not.toHaveBeenCalledWith(mock.oSettings.sPersonaliseButtonData, mock.sPersonaliseButtonText);
                });
            });
        });
                
        describe('GIVEN I have added the personalised product to the basket', function (){
            beforeEach(function () {
                personaliseInstance = new Personalise(mock.oSettings);
                personaliseInstance.bIsPersonaliseProductContainerInDOM = true;
                spyOn($.fn, "EmaginationJS");
                personaliseInstance.deleteCurrentPersonalisation();
            });
            it('THEN this personalisation should be removed the DOM', function () {
                expect(personaliseInstance.bIsPersonaliseProductContainerInDOM).toEqual(false);
            });
            it('THEN this personalisation should be deleted from the cookie, the product description page hidden field and the product description page add to basket from hidden fields', function () {
                expect($.fn.EmaginationJS).toHaveBeenCalledWith('Reset', {bPreventInitialisation : true});
            });
        });
        
        describe('GIVEN no more personalised products can be added to the basket', function (){
            beforeEach(function () {
                personaliseInstance = new Personalise(mock.oSettings);
                mock.$quantity = {
                    length: 1,
                    attr: jasmine.createSpy().and.returnValue("1")
                };
                mock.$addedToBasket = TESCO.jasmineHelpers.createMockJqueryElement();
                mock.$addedToBasket.length = 1;
                personaliseInstance.$addToBasketForm = mock.$addToBasketForm;
                personaliseInstance.$personaliseButton = mock.$personaliseButton;                
                personaliseInstance.restrictAddIfLimitOfOne(mock.$quantity, mock.$addedToBasket);
            });
            it('THEN the add to basket form should be hidden', function () {
                expect(personaliseInstance.$addToBasketForm.addClass).toHaveBeenCalledWith(mock.oSettings.sHiddenClass);
            });
            it('THEN the added to basket button should be visible', function () {
                expect(mock.$addedToBasket.removeClass).toHaveBeenCalledWith(mock.oSettings.sHiddenClass);
            });
            it('THEN the personalise button should be hidden', function () {
                expect(personaliseInstance.$personaliseButton.addClass).toHaveBeenCalledWith(mock.oSettings.sHiddenClass);
            });
        });
        
        describe('GIVEN more personalised products can be added to the basket', function (){
            beforeEach(function () {
                personaliseInstance = new Personalise(mock.oSettings);
                mock.$quantity = {
                    length: 1,
                    attr: jasmine.createSpy().and.returnValue("5")
                };
                mock.$addedToBasket = TESCO.jasmineHelpers.createMockJqueryElement();
                mock.$addedToBasket.length = 1;                
                personaliseInstance.$addToBasketForm = mock.$addToBasketForm;
                personaliseInstance.$personaliseButton = mock.$personaliseButton;                
                personaliseInstance.restrictAddIfLimitOfOne(mock.$quantity, mock.$addedToBasket);
            });
            it('THEN the add to basket form should NOT be hidden', function () {
                expect(personaliseInstance.$addToBasketForm.addClass).not.toHaveBeenCalledWith(mock.oSettings.sHiddenClass);
            });
            it('THEN the added to basket button should be NOT visible', function () {
                expect(mock.$addedToBasket.removeClass).not.toHaveBeenCalledWith(mock.oSettings.sHiddenClass);
            });
            it('THEN the personalise button should NOT be hidden', function () {
                expect(personaliseInstance.$personaliseButton.addClass).not.toHaveBeenCalledWith(mock.oSettings.sHiddenClass);
            });
        });
        
    });
});
*/