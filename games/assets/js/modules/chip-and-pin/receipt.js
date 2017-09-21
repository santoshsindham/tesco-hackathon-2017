/*jslint plusplus: true, nomen: true, bitwise: true, indent: 4 */
/*globals window,document,console,define,require,$ */
define('modules/chip-and-pin/receipt', ['modules/chip-and-pin/kmf-io', 'modules/ajax/common'], function (kmfIO, ajax) {
    "use strict";
    var aReceiptCommands = [],
        generateTextCommand,
        generateReceiptArray,
        webAnalytics,
        generateFontCommand,
        generateImageCommand,
        generateBarcodeCommand,
        printHr,
        PrinterCommand = function PrinterCommand(sCommand, sValue) {
            this.command = sCommand;
            this.data = sValue;
        },
        i,
        n,
        iAgeCheck,
        iProofCheck,
        printReceipt,
        formatText,
        printGiftCard,
        printClubcardStatement,
        printFuelSave,
        printThankYouMessage,
        printBarcode,
        printBranding,
        printOrderSummary,
        printDiscountsPromotions,
        printTotalToPay,
        printOrderDetail,
        printStaffDiscountTotal,
        printExchangedVouchersTotal,
        printClubcardVouchersTotal,
        printGiftCardTotal,
		printeCouponsTotal,
        printYesPayDeviceSuccess,
        printYesPayDeviceFailure,
        printHeader,
        printFooter,
        printError,
        printCardDetails,
        activePromotion,
        printSuccess,
        customerOrderJSON;

    formatText = function formatText(sTextStyle) {
        switch (sTextStyle) {
        case 'heading':
            aReceiptCommands.push(generateFontCommand('Arial|11|Bold'));
            break;
        case 'subHeading':
            aReceiptCommands.push(generateFontCommand('Arial|9|Regular'));
            break;
        case 'body':
            aReceiptCommands.push(generateFontCommand('Arial|8|Regular'));
            break;
        case 'bodyBold':
            aReceiptCommands.push(generateFontCommand('Arial|8|Bold'));
            break;
        case 'bodyItalic':
            aReceiptCommands.push(generateFontCommand('Arial|8|Bold|Italic'));
            break;
        case 'footer':
            aReceiptCommands.push(generateFontCommand('Arial|2|Bold'));
            break;
        default:
            aReceiptCommands.push(generateFontCommand('Arial|8|Regular'));
        }
    };

    printHr = function printHr() {
        formatText('subHeading');
        aReceiptCommands.push(generateTextCommand('_______________________________________|l'));
    };

    printBranding = function printBranding() {
        var storeDetailsName, storeDetailsContactNumber;
        aReceiptCommands.push(generateImageCommand('http://direct.tescoassets.com/directuiassets/Merchandising/NonSeasonal/en_GB/banners/site_assets/receipt_logo.png|c|||200|37'));
        formatText('subHeading');
        if (customerOrderJSON.storeDetails.name) {
            storeDetailsName = customerOrderJSON.storeDetails.name;
        } else {
            storeDetailsName = " ";
        }
        if (customerOrderJSON.storeDetails.contactNumber) {
            storeDetailsContactNumber = customerOrderJSON.storeDetails.contactNumber;
        } else {
            storeDetailsContactNumber = " ";
        }
        aReceiptCommands.push(generateTextCommand(storeDetailsName + ' ' + storeDetailsContactNumber + '|c||+12'));
        aReceiptCommands.push(generateTextCommand('www.tesco.com/direct|c||+2'));
    };

    printOrderSummary = function printOrderSummary() {
        var recipientTitle, recipientFirstName, recipientLastName, orderNumber;
        printHr();
        formatText('heading');
        aReceiptCommands.push(generateTextCommand('PURCHASES|c||+10'));
        formatText('body');
        if (customerOrderJSON.recipient.title) {
            recipientTitle = customerOrderJSON.recipient.title;
        }
        if (customerOrderJSON.recipient.firstName) {
            recipientFirstName = customerOrderJSON.recipient.firstName;
        }
        if (customerOrderJSON.recipient.lastName) {
            recipientLastName = customerOrderJSON.recipient.lastName;
        }
        aReceiptCommands.push(generateTextCommand('Customer Name: ' + recipientTitle + ' ' + recipientFirstName + ' ' + recipientLastName + '|c||+4'));
        printHr();
        formatText('heading');
        if (customerOrderJSON.orderNumber) {
            orderNumber = customerOrderJSON.orderNumber;
        }
        aReceiptCommands.push(generateTextCommand('ORDER NO: ' + orderNumber + '|c||+10'));
        formatText('body');
        aReceiptCommands.push(generateTextCommand('PLEASE QUOTE THIS ORDER NUMBER WHEN YOU COME IN TO COLLECT YOUR GOODS OR IF YOU NEED TO CONTACT US ABOUT YOUR ORDER|c||+4'));
    };

    printHeader = function printHeader() {
        printBranding();
        printOrderSummary();
    };

    printDiscountsPromotions = function printDiscountsPromotions() {
        if (customerOrderJSON.promotions) {
            if (customerOrderJSON.promotions.length) {
                printHr();
                formatText('heading');
                aReceiptCommands.push(generateTextCommand('DIRECT DISCOUNTS & PROMOTIONS|c||+10'));
                formatText('body');
                while (customerOrderJSON.promotions.length) {
                    activePromotion = customerOrderJSON.promotions.shift();
                    if (activePromotion) {
                        aReceiptCommands.push(generateTextCommand(activePromotion.name + '|l||+3|200||'));
                        if(activePromotion.discountValue && activePromotion.discountValue > 0)
                        	aReceiptCommands.push(generateTextCommand('\u00A3' + activePromotion.discountValue + '|r||-16'));
                    }
                }

                if (customerOrderJSON.discounts.totalDiscount && customerOrderJSON.discounts.totalDiscount > 0) {
                	printHr();
                    formatText('body');
                    aReceiptCommands.push(generateTextCommand('Total Savings|l||+12'));
                    aReceiptCommands.push(generateTextCommand('\u00A3' + customerOrderJSON.discounts.totalDiscount + '|r||-16'));
                }
            }
        }
    };

    printStaffDiscountTotal = function printStaffDiscountTotal() {
        if (customerOrderJSON.discounts.staffDiscount) {
            aReceiptCommands.push(generateTextCommand('Staff Discount|l||+4'));
            aReceiptCommands.push(generateTextCommand('\u00A3' + customerOrderJSON.discounts.staffDiscount + '|r||-16'));
        }
    };

    printExchangedVouchersTotal = function printExchangedVouchersTotal() {
        if (customerOrderJSON.discounts.clubcard.exchangedVouchers) {
            aReceiptCommands.push(generateTextCommand('Exchanged Vouchers|l'));
            aReceiptCommands.push(generateTextCommand('\u00A3' + customerOrderJSON.discounts.clubcard.exchangedVouchers + '|r||-16'));
        }
    };

    printClubcardVouchersTotal = function printClubcardVouchersTotal() {
        if (customerOrderJSON.discounts.clubcard.vouchers) {
            aReceiptCommands.push(generateTextCommand('Clubcard Vouchers|l'));
            aReceiptCommands.push(generateTextCommand('\u00A3' + customerOrderJSON.discounts.clubcard.vouchers + '|r||-16'));
        }
    };

	printeCouponsTotal = function printeCouponsTotal() {
        if (customerOrderJSON.discounts.ecouponDiscount) {
			aReceiptCommands.push(generateTextCommand('eCoupons|l'));
            aReceiptCommands.push(generateTextCommand('\u00A3' + customerOrderJSON.discounts.ecouponDiscount + '|r||-16'));
        }
    };

    printGiftCardTotal = function printGiftCardTotal() {
        if (customerOrderJSON.discounts.giftCard && customerOrderJSON.discounts.giftCard.length > 0) {
            for (i = 0; i < customerOrderJSON.discounts.giftCard.length; i++) {
				aReceiptCommands.push(generateTextCommand('Gift Cards|l'));
				aReceiptCommands.push(generateTextCommand('\u00A3' + customerOrderJSON.discounts.giftCard[i].amountApplied + '|r||-16'));
			}
        }
    };

    printYesPayDeviceSuccess = function printYesPayDeviceSuccess() {
        if (customerOrderJSON.yesPayHandset && customerOrderJSON.yesPayHandset !== undefined) {
			if (customerOrderJSON.yesPayHandset.receipt) {
				var receiptData = customerOrderJSON.yesPayHandset.receipt,
					receiptDataSet = receiptData.split('|');

				$.each( receiptDataSet, function( i, val ) {
		          aReceiptCommands.push(generateTextCommand( val + '|l||+4'));
				});
            }
			else {
				if (customerOrderJSON.yesPayHandset.aid) {
					aReceiptCommands.push(generateTextCommand('     AID|l||+6'));
					aReceiptCommands.push(generateTextCommand(':   ' + customerOrderJSON.yesPayHandset.aid + '|l|+130|-15'));
				}
				if (customerOrderJSON.yesPayHandset.card) {
					aReceiptCommands.push(generateTextCommand('     Number|l'));
					aReceiptCommands.push(generateTextCommand(':   ' + customerOrderJSON.yesPayHandset.card + '|l|+130|-15'));
				}
				if (customerOrderJSON.yesPayHandset.pan) {
					aReceiptCommands.push(generateTextCommand('     PAN SEQ NO|l'));
					aReceiptCommands.push(generateTextCommand(':   ' + customerOrderJSON.yesPayHandset.pan + '|l|+130|-15'));
				}
				if (customerOrderJSON.yesPayHandset.tid) {
					aReceiptCommands.push(generateTextCommand('     TID|l'));
					aReceiptCommands.push(generateTextCommand(':   ' + customerOrderJSON.yesPayHandset.tid + '|l|+130|-15'));
				}
				if (customerOrderJSON.yesPayHandset.expiry) {
					aReceiptCommands.push(generateTextCommand('     Expiry|l'));
					aReceiptCommands.push(generateTextCommand(':   ' + customerOrderJSON.yesPayHandset.expiry + '|l|+130|-15'));
				}
				if (customerOrderJSON.yesPayHandset.authCode) {
					aReceiptCommands.push(generateTextCommand('     Auth Code|l'));
					aReceiptCommands.push(generateTextCommand(':   ' + customerOrderJSON.yesPayHandset.authCode + '|l|+130|-15'));
				}
				if (customerOrderJSON.yesPayHandset.mode) {
					aReceiptCommands.push(generateTextCommand('     Mode|l'));
					aReceiptCommands.push(generateTextCommand(':   ' + customerOrderJSON.yesPayHandset.mode + '|l|+130|-15'));
				}
				if (customerOrderJSON.yesPayHandset.entryMode) {
					aReceiptCommands.push(generateTextCommand('     Entry Mode|l'));
					aReceiptCommands.push(generateTextCommand(':   ' + customerOrderJSON.yesPayHandset.entryMode + '|l|+130|-15'));
				}
				if (customerOrderJSON.yesPayHandset.application) {
					aReceiptCommands.push(generateTextCommand('     Application|l'));
					aReceiptCommands.push(generateTextCommand(':   ' + customerOrderJSON.yesPayHandset.application + '|l|+130|-15'));
				}
				if (customerOrderJSON.yesPayHandset.transDate) {
					aReceiptCommands.push(generateTextCommand('     Trans Date|l'));
					aReceiptCommands.push(generateTextCommand(':   ' + customerOrderJSON.yesPayHandset.transDate + '|l|+130|-15'));
				}
				if (customerOrderJSON.yesPayHandset.transTime) {
					aReceiptCommands.push(generateTextCommand('     Trans Time|l'));
					aReceiptCommands.push(generateTextCommand(':   ' + customerOrderJSON.yesPayHandset.transTime + '|l|+130|-15'));
				}
				if (customerOrderJSON.yesPayHandset.mid) {
					aReceiptCommands.push(generateTextCommand('     Merchant|l'));
					aReceiptCommands.push(generateTextCommand(':   ' + customerOrderJSON.yesPayHandset.mid + '|l|+130|-15'));
				}
				if (customerOrderJSON.yesPayHandset.type) {
					aReceiptCommands.push(generateTextCommand('     Type|l'));
					aReceiptCommands.push(generateTextCommand(':   ' + customerOrderJSON.yesPayHandset.type + '|l|+130|-15'));
				}
			}
        }
    };

    printYesPayDeviceFailure = function printYesPayDeviceFailure() {
        aReceiptCommands.push(generateFontCommand('Arial|7|Regular'));
        var aYesPayFailure = window.TescoData.ChipAndPin.orderConfirmation.failureArray;
        if (aYesPayFailure) {
            for (i = 0; i < aYesPayFailure.length; i++) {
                aReceiptCommands.push(generateTextCommand('     ' + aYesPayFailure[i] + '|l||+6'));
            }
        }
        formatText('body');
    };

    printTotalToPay = function printTotalToPay() {

        if (customerOrderJSON.summary.totalCost) {
			printHr();
			formatText('bodyBold');
            aReceiptCommands.push(generateTextCommand('Total To Pay|l||+10'));
            aReceiptCommands.push(generateTextCommand('\u00A3' + customerOrderJSON.summary.totalCost + '|r||-16'));
			printHr();
        }

		if (customerOrderJSON.discounts.staffDiscount || customerOrderJSON.discounts.clubcard.exchangedVouchers || customerOrderJSON.discounts.clubcard.vouchers || customerOrderJSON.discounts.ecouponDiscount || (customerOrderJSON.discounts.giftCard && customerOrderJSON.discounts.giftCard.length > 0)) {
			aReceiptCommands.push(generateTextCommand('|l||+10'));
		}

        formatText('body');
        printStaffDiscountTotal();
        printExchangedVouchersTotal();
        printClubcardVouchersTotal();
		printeCouponsTotal();
        printGiftCardTotal();

        if (customerOrderJSON.summary.totalToPay) {
            if (customerOrderJSON.yesPayHandset.application) {
            	if (customerOrderJSON.discounts.staffDiscount || customerOrderJSON.discounts.clubcard.exchangedVouchers || customerOrderJSON.discounts.clubcard.vouchers || customerOrderJSON.discounts.ecouponDiscount || (customerOrderJSON.discounts.giftCard && customerOrderJSON.discounts.giftCard.length > 0)) {
        			printHr();
        		}
				aReceiptCommands.push(generateTextCommand('|l||+10'));
                var yesPayHandsetApplication = customerOrderJSON.yesPayHandset.application;
                aReceiptCommands.push(generateTextCommand(yesPayHandsetApplication + ' Card|l'));
                aReceiptCommands.push(generateTextCommand('\u00A3' + customerOrderJSON.yesPayHandset.totalToPay + '|r||-16'));
            }
        }
        printYesPayDeviceSuccess();
    };

    printCardDetails = function printCardDetails() {

        if (customerOrderJSON.summary.totalToPay || customerOrderJSON.summary.totalToPay !== undefined) {
            if (customerOrderJSON.yesPayHandset.application) {
                printHr();
                formatText('body');
                aReceiptCommands.push(generateTextCommand('|l||+10'));

            	var yesPayHandsetApplication = customerOrderJSON.yesPayHandset.application;

	            aReceiptCommands.push(generateTextCommand(yesPayHandsetApplication + ' Debit Sale|l'));
	            aReceiptCommands.push(generateTextCommand('\u00A3' + customerOrderJSON.yesPayHandset.totalToPay + '|r||-16'));
            }
        }
        printYesPayDeviceSuccess();
        formatText('bodyBold');
        aReceiptCommands.push(generateTextCommand('     **TRANSACTION VOID**|l||+6'));
    };

    printGiftCard = function printGiftCard() {
        if (customerOrderJSON.discounts.giftCard && customerOrderJSON.discounts.giftCard.length > 0) {
            for (i = 0; i < customerOrderJSON.discounts.giftCard.length; i++) {
				printHr();
				formatText('heading');
				aReceiptCommands.push(generateTextCommand('GIFT CARD|c||+10'));
				formatText('body');
				if (customerOrderJSON.discounts.giftCard[i].cardId) {
					aReceiptCommands.push(generateTextCommand(customerOrderJSON.discounts.giftCard[i].cardId + '|c||+3'));
				}
				if (customerOrderJSON.discounts.giftCard[i].amountRemaining) {
					aReceiptCommands.push(generateTextCommand('New gift card balance \u00A3' + customerOrderJSON.discounts.giftCard[i].amountRemaining + '|c||+3'));
				}
			}
        }
    };

    printClubcardStatement = function printClubcardStatement() {
        if (customerOrderJSON.recipient.clubCardSignup === true ) {
            printHr();
            formatText('heading');
            aReceiptCommands.push(generateTextCommand('SIGN UP FOR CLUBCARD!|c||+10'));
            formatText('body');
            if (customerOrderJSON.discounts.clubcard.points) {
                aReceiptCommands.push(generateTextCommand('You could have earned ' + customerOrderJSON.discounts.clubcard.points + ' Clubcard points in this transaction|c||+3'));
            }
        } else {
            var clubcardpointExpiry;
            printHr();
            formatText('heading');
            aReceiptCommands.push(generateTextCommand('CLUBCARD STATEMENT|c||+10'));
            formatText('body');
            if (customerOrderJSON.discounts.clubcard.number) {
                aReceiptCommands.push(generateTextCommand('Clubcard Number|l||+3'));
                aReceiptCommands.push(generateTextCommand(customerOrderJSON.discounts.clubcard.number + '|r||-15'));
            }
            if (customerOrderJSON.discounts.clubcard.points) {
                aReceiptCommands.push(generateTextCommand('Points This Visit|l'));
                aReceiptCommands.push(generateTextCommand(customerOrderJSON.discounts.clubcard.points + '|r||-15'));
            }
            aReceiptCommands.push(generateTextCommand('Includes:|l'));
            if (customerOrderJSON.discounts.clubcard.promoPoints) {
                aReceiptCommands.push(generateTextCommand('   Promotion points|l'));
                aReceiptCommands.push(generateTextCommand(customerOrderJSON.discounts.clubcard.promoPoints + '|r||-15'));
            }
            if (customerOrderJSON.discounts.clubcard.unusedPoints) {
                aReceiptCommands.push(generateTextCommand('   Unused Voucher Credit|l'));
                aReceiptCommands.push(generateTextCommand(customerOrderJSON.discounts.clubcard.unusedPoints + '|r||-16'));
            }
            if (customerOrderJSON.discounts.clubcard.pointCap) {
                if (customerOrderJSON.discounts.clubcard.pointExpiry) {
                    clubcardpointExpiry = customerOrderJSON.discounts.clubcard.pointExpiry;
                }
                aReceiptCommands.push(generateTextCommand('Total Up To ' + clubcardpointExpiry + '|l||+4'));
                aReceiptCommands.push(generateTextCommand(customerOrderJSON.discounts.clubcard.pointCap + '|r||-15'));
            }

        }
    };

    printFuelSave = function printFuelSave() {
        var fuelSaveExpiry;
        if (customerOrderJSON.discounts.fuelSave) {
            printHr();
            formatText('heading');
            aReceiptCommands.push(generateTextCommand('CLUBCARD FUEL SAVE|c||+10'));
            formatText('body');
            if (customerOrderJSON.summary.clubCardFuelSavings) {
                aReceiptCommands.push(generateTextCommand('Savings This Visit (pence/litre)|l||+3'));
                aReceiptCommands.push(generateTextCommand(customerOrderJSON.summary.clubCardFuelSavings + '|r||-16'));
            }
            if (customerOrderJSON.discounts.fuelSave.balance) {
                if (customerOrderJSON.discounts.fuelSave.expiry) {
                    fuelSaveExpiry = customerOrderJSON.discounts.fuelSave.expiry;
                }
                aReceiptCommands.push(generateTextCommand('Savings Expiring ' + fuelSaveExpiry + '|l'));
                aReceiptCommands.push(generateTextCommand(customerOrderJSON.discounts.fuelSave.balance + '|r||-16'));
            }
        }
    };

    printThankYouMessage = function printThankYouMessage() {
      printHr();
      formatText('body');
      aReceiptCommands.push(generateTextCommand('We’d like you to be happy with everything you purchase from Tesco. Should you change your mind about your purchase, please return the product with your proof of purchase, within 30 days, and we’ll happily offer a refund.|c||+5'));
      formatText('body');
      aReceiptCommands.push(generateTextCommand('Conditions apply to some products and we ask that perishable food items are returned within their use by date. We also ask that clothing be returned unworn and as sold, in a saleable condition and with all tags still in place. Please see instore for details or visit www.tesco.com/returns.|c||+5'));
      formatText('body');
      aReceiptCommands.push(generateTextCommand('If you have any queries about your Direct order please contact customer services on|c||+5'));
      formatText('bodyBold');
      aReceiptCommands.push(generateTextCommand('0800 323 4050 or 0330 123 4050|c||+5'));
      formatText('body');
      aReceiptCommands.push(generateTextCommand('For any electrical queries, please call our Electrical Helpline 0800 323 4060 or 0330 123 4060 Mon-Sat 8am-8pm; Sun 10am to 6pm (see electrical leaflet for details)|c||+5'));
      formatText('body');
      aReceiptCommands.push(generateTextCommand('Your legal rights are not affected.|c||+5'));
    };

    printBarcode = function printBarcode() {
        if (customerOrderJSON.yesPayHandset) {
            printHr();
            if (customerOrderJSON.yesPayHandset.barcode) {
                aReceiptCommands.push(generateBarcodeCommand(customerOrderJSON.yesPayHandset.barcode + '|Code128|Y|N|C||+11|250|60'));
            } else {
				aReceiptCommands.push(generateBarcodeCommand(customerOrderJSON.orderNumber + '|Code128|Y|N|C||+11|250|60'));
			}
            aReceiptCommands.push(generateFontCommand('Arial|10|Regular'));
            if (customerOrderJSON.yesPayHandset.barcode) {
                aReceiptCommands.push(generateTextCommand(customerOrderJSON.yesPayHandset.barcode + '|c||+8'));
            } else {
				aReceiptCommands.push(generateTextCommand(customerOrderJSON.orderNumber + '|c||+8'));
        	}
        }
    };

    printFooter = function printFooter() {
        printHr();
        formatText('body');

        var dateObj = new Date(),
            yesPayHandsetTransDate,
            yesPayHandsetTransTime,
            summaryStoreId,
            summaryTillId;

        if ((customerOrderJSON.yesPayHandset && customerOrderJSON.yesPayHandset !== undefined) || customerOrderJSON.yesPayHandset !== "undefined" || customerOrderJSON.yesPayHandset !== 'unknown') {
			if (customerOrderJSON.yesPayHandset.transDate !== undefined || customerOrderJSON.yesPayHandset.transDate !== "undefined" || customerOrderJSON.yesPayHandset.transDate !== 'unknown') {
				yesPayHandsetTransDate = customerOrderJSON.yesPayHandset.transDate;
			}

			if (customerOrderJSON.yesPayHandset.transTime !== undefined || customerOrderJSON.yesPayHandset.transTime !== "undefined" || customerOrderJSON.yesPayHandset.transTime !== 'unknown') {
				yesPayHandsetTransTime = customerOrderJSON.yesPayHandset.transTime;
			}
		}

		if(yesPayHandsetTransDate === undefined || yesPayHandsetTransTime === undefined || yesPayHandsetTransDate === 'undefined' || yesPayHandsetTransTime === 'undefined'){
            yesPayHandsetTransDate = dateObj.getDate() + '/' + parseInt(dateObj.getMonth() + 1, 10) + '/' + dateObj.getFullYear();
			yesPayHandsetTransTime = dateObj.getHours()+':'+dateObj.getMinutes()+':'+dateObj.getSeconds();
		}

        if (customerOrderJSON.summary.storeId) {
            summaryStoreId = customerOrderJSON.summary.storeId;
        }
        if (customerOrderJSON.summary.tillId) {
            summaryTillId = customerOrderJSON.summary.tillId;
        }
        aReceiptCommands.push(generateTextCommand(yesPayHandsetTransDate + '   ' + yesPayHandsetTransTime + '   ' + summaryStoreId + '   ' + summaryTillId + '|l|+11|+10'));
        formatText('footer');
        aReceiptCommands.push(generateTextCommand('.|c||+40'));
    };

    printOrderDetail = function printOrderDetail() {
        var sUpdatedDeliveryTitle = '',
            sDeliveryMethod = '',
            sDeliveryAddress,
            iItemPriceTotals,
            sDeliveryMethodTitle,
            sContactDetails,
            bAgeRestrictionAppended = false,
            bProofOfDelivery = false,
            recipientDetailsContactNumber,
            itemQuantity,
            recipientDetailsFirstName,
            recipientDetailsLastName,
            itemPrice;

        for (i = 0; i < customerOrderJSON.deliveryGroups.length; i++) {
            sDeliveryMethod = customerOrderJSON.deliveryGroups[i].deliveryMethod;
            bAgeRestrictionAppended = false;
            bProofOfDelivery = false;
            printHr();
            formatText('heading');
            if (customerOrderJSON.deliveryGroups[i].recipientDetails.firstName) {
                recipientDetailsFirstName = customerOrderJSON.deliveryGroups[i].recipientDetails.firstName;
            }
            if (customerOrderJSON.deliveryGroups[i].recipientDetails.lastName) {
                recipientDetailsLastName = customerOrderJSON.deliveryGroups[i].recipientDetails.lastName;
            }
            if (customerOrderJSON.deliveryGroups[i].recipientDetails.contactNumber) {
                recipientDetailsContactNumber = customerOrderJSON.deliveryGroups[i].recipientDetails.contactNumber;
            } else {
                recipientDetailsContactNumber = " ";
            }
            if (sDeliveryMethod === 'clickAndCollect') {
                sUpdatedDeliveryTitle = 'Collection';
                if (customerOrderJSON.deliveryGroups[i].collectionAddress) {
                    sDeliveryAddress = customerOrderJSON.deliveryGroups[i].collectionAddress;
                }
                sContactDetails = recipientDetailsFirstName + ' ' + recipientDetailsLastName + ', ' + recipientDetailsContactNumber;
            } else {
                sUpdatedDeliveryTitle = 'Delivery';
                if (customerOrderJSON.deliveryGroups[i].recipientDetails.deliveryAddress) {
                    sDeliveryAddress = customerOrderJSON.deliveryGroups[i].recipientDetails.deliveryAddress;
                }
                sContactDetails = recipientDetailsFirstName + ' ' + recipientDetailsLastName + ', ' + recipientDetailsContactNumber;
            }
            if (customerOrderJSON.deliveryGroups[i].deliveryTitle) {
                aReceiptCommands.push(generateTextCommand(customerOrderJSON.deliveryGroups[i].deliveryTitle + '|c|+12|+10|250||'));
            }
            formatText('body');

            for (n = 0; n < customerOrderJSON.deliveryGroups[i].items.length; n++) {
                if (customerOrderJSON.deliveryGroups[i].items[n].name) {
                    aReceiptCommands.push(generateTextCommand(customerOrderJSON.deliveryGroups[i].items[n].name + '|l||+6|220||'));
                }
                if (customerOrderJSON.deliveryGroups[i].items[n].schoolName) {
                    aReceiptCommands.push(generateTextCommand(customerOrderJSON.deliveryGroups[i].items[n].schoolName + '|l||+6|220||'));
                }
                if (customerOrderJSON.deliveryGroups[i].items[n].quantity) {
                    itemQuantity = customerOrderJSON.deliveryGroups[i].items[n].quantity;
                }
                if (customerOrderJSON.deliveryGroups[i].items[n].price) {
                    itemPrice = customerOrderJSON.deliveryGroups[i].items[n].price;
                }
                aReceiptCommands.push(generateTextCommand('   ' + itemQuantity + '   @   \u00A3' + itemPrice + '|l|+3||'));
                if (customerOrderJSON.deliveryGroups[i].items[n].quantity > 1) {
                	iItemPriceTotals = (customerOrderJSON.deliveryGroups[i].items[n].quantity * customerOrderJSON.deliveryGroups[i].items[n].price).toFixed(2);
                } else {
                    iItemPriceTotals = customerOrderJSON.deliveryGroups[i].items[n].price;
                }
                aReceiptCommands.push(generateTextCommand('\u00A3' + iItemPriceTotals + '|r||-15')); // Delivery and delivery charge display section - START
            }
            if (customerOrderJSON.deliveryGroups[i].deliveryMethodName) {
                aReceiptCommands.push(generateTextCommand(customerOrderJSON.deliveryGroups[i].deliveryMethodName + '|l||+6|220||'));
            }
            if (customerOrderJSON.deliveryGroups[i].deliveryCharge) {
                if (customerOrderJSON.deliveryGroups[i].deliveryCharge === "0.0" || customerOrderJSON.deliveryGroups[i].deliveryCharge === "0.00" || customerOrderJSON.deliveryGroups[i].deliveryCharge === "0") {
                    aReceiptCommands.push(generateTextCommand("FREE" + '|r||-15'));
                } else {
                    aReceiptCommands.push(generateTextCommand('\u00A3' + customerOrderJSON.deliveryGroups[i].deliveryCharge + '|r||-15'));
                }
            }
            // Delivery and delivery charge display section - END
            formatText('bodyBold');
            if (sUpdatedDeliveryTitle) {
                aReceiptCommands.push(generateTextCommand(sUpdatedDeliveryTitle + ' Details|l||+10'));
            }
            formatText('body');
            if (sContactDetails) {
                aReceiptCommands.push(generateTextCommand(sContactDetails + '|l||+6'));
            }
            if (sDeliveryAddress) {
                aReceiptCommands.push(generateTextCommand(sDeliveryAddress + '|l||+3'));
            }

            if(customerOrderJSON.deliveryGroups[i].courierInstruction && customerOrderJSON.deliveryGroups[i].courierInstruction != ''){
				formatText('bodyBold');
				aReceiptCommands.push(generateTextCommand('Courier Instructions |l||+10'));
				formatText('body');
				aReceiptCommands.push(generateTextCommand(customerOrderJSON.deliveryGroups[i].courierInstruction + '|l||+6'));
				if(customerOrderJSON.deliveryGroups[i].courierInstructionOne && customerOrderJSON.deliveryGroups[i].courierInstructionOne != ''){
					aReceiptCommands.push(generateTextCommand(customerOrderJSON.deliveryGroups[i].courierInstructionOne + '|l||+3'));
				}
			}

            formatText('bodyItalic');

            if (!bAgeRestrictionAppended) {
                for (iAgeCheck = 0; iAgeCheck < customerOrderJSON.deliveryGroups[i].items.length; iAgeCheck++) {
                    if (customerOrderJSON.deliveryGroups[i].items[iAgeCheck].isAgeRestricted === true) {
                        aReceiptCommands.push(generateTextCommand('This order requires an adult to sign for upon delivery.|l||+6'));
                        bAgeRestrictionAppended = true;
                    }
                }
            }

            if (!bProofOfDelivery) {
                if (!bAgeRestrictionAppended) {
                    for (iProofCheck = 0; iProofCheck < customerOrderJSON.deliveryGroups[i].items.length; iProofCheck++) {
                        if (customerOrderJSON.deliveryGroups[i].items[iProofCheck].proofOfDelivery === true) {
                            aReceiptCommands.push(generateTextCommand('This order requires an adult to sign for upon delivery.|l||+6'));
                            bProofOfDelivery = true;
                        }
                    }
                }
            }

            if (sDeliveryMethod === 'clickAndCollect') {
                aReceiptCommands.push(generateTextCommand('You\'ll need to show proof of ID when you collect this order.|l||+6'));
            }
        }
    };

    printError = function printError() {
        printBranding();
        printHr();
        formatText('heading');
        aReceiptCommands.push(generateTextCommand('FAILED TESCO DIRECT ORDER|c||+10'));
        formatText('body');
        aReceiptCommands.push(generateTextCommand('This order has not been processed. You have not been charged for this transaction. Please keep this receipt.|c||+6'));
        printHr();
        formatText('bodyBold');
        aReceiptCommands.push(generateTextCommand('Customer Name|l||+10'));
        formatText('body');
        aReceiptCommands.push(generateTextCommand(customerOrderJSON.recipient.title + ' ' + customerOrderJSON.recipient.firstName + ' ' + customerOrderJSON.recipient.lastName + ', ' + customerOrderJSON.recipient.contactNumber + '|l||+6'));

        formatText('body');
        if (window.TescoData.ChipAndPin.header.checkoutFailure !== undefined) {
        	if(window.TescoData.ChipAndPin.header.checkoutFailure === true || window.TescoData.ChipAndPin.header.checkoutFailure === "true"){
        		printCardDetails();
        	}
        } else {
        	printHr();
        	printYesPayDeviceFailure();
        }
        printHr();
        formatText('body');
        aReceiptCommands.push(generateTextCommand('If you have any queries about your Direct order, please contact customer services on|c||+10'));
        formatText('bodyBold');
        aReceiptCommands.push(generateTextCommand('0800 323 4050 or 0330 123 4050|c||+5'));
        formatText('body');
        aReceiptCommands.push(generateTextCommand('For any electrical queries, please call our Electrical Helpline 0800 323 4060 or 0330 123 4060 Mon-Sat 8am-8pm; Sun 10am to 6pm (see electrical leaflet for details)|c||+5'));
        formatText('body');
        aReceiptCommands.push(generateTextCommand('Your legal rights are not affected.|c||+5'));
        printFooter();
    };

    printSuccess = function printSuccess() {
        webAnalytics();
        $('.kiosk .paymentSuccess').css('opacity','1');
        printHeader();
        printOrderDetail();
        printDiscountsPromotions();
        printTotalToPay();
        printGiftCard();
        printClubcardStatement();
        printFuelSave();
        printThankYouMessage();
        printBarcode();
        printFooter();
        var formData = $('#kioskLogout').serialize();
        ajax.post({
            'url': '/direct/my/kiosk-order-confirmation.page',
            'data': formData || {}
        });
    };

    generateReceiptArray = function generateReceiptArray() {
        customerOrderJSON = $.extend({}, window.TescoData.ChipAndPin.orderConfirmation);
        if (window.TescoData.ChipAndPin.header !== undefined) {
        	if (window.TescoData.ChipAndPin.header.success === "false" || window.TescoData.ChipAndPin.header.success === false) {
        			printError();
            } else {
                printSuccess();
            }
        } else {
            printSuccess();
        }
    };

    webAnalytics = function webAnalytics() {
    	 var confirmJSON = window.TescoData.ChipAndPin.orderConfirmation,
         	analyticsVar,
			products = ';',
			paymentType = confirmJSON.paymentType;

        $.each(confirmJSON.deliveryGroups, function(key, value) {
            var delOptions = this;
            $.each(delOptions.items, function(key, value) {
                products = products + this.catalogueNumber + ';' + this.quantity + ';' + this.price + ';;evar25='+this.seller+',;';
            });
        });

        products = products.slice(0, -2);

        if(paymentType.charAt(0) == ',')
			paymentType = paymentType.slice(1);

        analyticsVar = [{
            'events': 'purchase',
            'products': products,
            'purchaseID': confirmJSON.orderNumber || '',
            'eVar46': confirmJSON.summary.storeId || '',
            'eVar5': paymentType
        }];

        require(['modules/tesco.analytics'], function(analytics) {
            var _oWebAnalytics = new analytics.WebMetrics();
            _oWebAnalytics.submit(analyticsVar);
        });
    };

    generateTextCommand = function generateTextCommand(sValue) {
        return new PrinterCommand('AddText', sValue);
    };

    generateImageCommand = function generateImageCommand(sValue) {
        return new PrinterCommand('AddImage', sValue);
    };

    generateBarcodeCommand = function generateBarcodeCommand(sValue) {
        return new PrinterCommand('AddBarcode', sValue);
    };

    generateFontCommand = function generateTextCommand(sValue) {
        return new PrinterCommand('SetFont', sValue);
    };

    printReceipt = function printReceipt() {
        generateReceiptArray();
        kmfIO.printReceipt(aReceiptCommands);
    };

    return {
        /**
         * @method printReceipt
         * @memberof order-confirmation
         * @returns {void}
         */
        printReceipt: printReceipt
    };
});
