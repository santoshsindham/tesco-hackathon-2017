/*globals jasmine, define, describe, it, expect, beforeEach*/
define(['modules/checkout/payment'], function (payment) {
    'use strict';

    describe('Payment module', function () {
        var mock;
        
        beforeEach(function () {
            mock = {
                ageConfirmationFields : TESCO.jasmineHelpers.createMockJqueryElement(),
                hintMessaging : TESCO.jasmineHelpers.createMockJqueryElement()
            };
        });
        
        afterEach(function () {
            mock = null;
        });
	
        describe('Init', function () {			
			describe('GIVEN I am on the Payment page WHEN there are date of birth input fields on the page for age confirmation for age restricted products', function () {
			
				it('THEN A listener is created on the focusin event of any of the age confirmation input fields', function () {
				// expect(mock.ageConfirmationFields.on).toHaveBeenCalledWith("focusIn", a function to showHintMessaging);
				});
				
				it('AND A listener is created on the focusout event of any of the age confirmation input fields', function () {
				// expect(mock.ageConfirmationFields.on).toHaveBeenCalledWith("focusOut", a function to hideHintMessaging);
				});
			});
		});
			
		describe('GIVEN the show hint messaging function has been called', function () {
		    beforeEach(function () {
				payment.showHintMessaging(mock.ageConfirmationFields, mock.hintMessaging);
			});
			it('THEN it identifies the fieldset element as having a hint messaging element visible', function () {
				expect(mock.ageConfirmationFields.addClass).toHaveBeenCalledWith('with-hint');
			});
			it('AND it shows the hint messaging element', function () {
				expect(mock.hintMessaging.addClass).toHaveBeenCalledWith('focussed');
			});

        });
					
		describe('GIVEN the hide hint messaging function has been called', function () {
			
			describe('WHEN focus is outside the age confirmation drop down fieldset', function () {
				beforeEach(function () {
					spyOn(payment, "focusInAgeConfirmationFields").and.returnValue(false);
					payment.hideHintMessaging(mock.ageConfirmationFields, mock.hintMessaging);
				});
				
				it('THEN it identifies the fieldset element as not having a hint messaging element visible', function () {
					expect(mock.ageConfirmationFields.removeClass).toHaveBeenCalledWith('with-hint');
				});
				it('AND it hides the hint messaging element', function () {
					expect(mock.hintMessaging.removeClass).toHaveBeenCalledWith('focussed');
				});
			});
			
			describe('WHEN focus is inside the age confirmation drop down fieldset', function () {
				beforeEach(function () {
					spyOn(payment, "focusInAgeConfirmationFields").and.returnValue(true);
					payment.hideHintMessaging(mock.ageConfirmationFields, mock.hintMessaging);
				});
				
				it('THEN it keeps the classes as is', function () {
					expect(mock.ageConfirmationFields.removeClass).not.toHaveBeenCalled();
					expect(mock.hintMessaging.removeClass).not.toHaveBeenCalled();
				});
			});
		});			
    });
});