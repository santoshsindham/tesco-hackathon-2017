/*jslint plusplus: true, nomen: true, bitwise: true */
/*globals window,document,console,define,require,$ */
define('modules/chip-and-pin/order-confirmation', ['modules/chip-and-pin/kmf-io'], function (kmfIO) {
    "use strict";
    var aReceiptCommands = [],
        generateTextCommand,
        generateReceiptArray,
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
        ageCheck,
        printReceipt,
        formatText,
        deliveryMethod,
        deliveryType,
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
        printYesPayDevice,
        printHeader,
        printFooter,
        printError,
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
        aReceiptCommands.push(generateImageCommand('http://direct.tescoassets.com/directuiassets/Merchandising/NonSeasonal/en_GB/banners/site_assets/receipt_logo.png|c|||200|37'));
        formatText('subHeading');
        aReceiptCommands.push(generateTextCommand(customerOrderJSON.storeDetails.name + ' ' + customerOrderJSON.storeDetails.contactNumber + '|c||+12'));
        aReceiptCommands.push(generateTextCommand('www.tesco.com/direct|c||+2'));
    };

    printOrderSummary = function printOrderSummary() {
        printHr();
        formatText('heading');
        aReceiptCommands.push(generateTextCommand('PURCHASES|c||+10'));
        formatText('body');
        aReceiptCommands.push(generateTextCommand('Customer Name: ' + customerOrderJSON.recipient.title + ' ' + customerOrderJSON.recipient.firstName + ' ' + customerOrderJSON.recipient.lastName + '|c||+4'));
        printHr();
        formatText('heading');
        aReceiptCommands.push(generateTextCommand('ORDER NO: ' + customerOrderJSON.orderNumber + '|c||+10'));
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
                        aReceiptCommands.push(generateTextCommand('£' + activePromotion.discountValue + '|r||-16'));
                    }
                }
                printHr();
                formatText('body');
                aReceiptCommands.push(generateTextCommand('Total Savings|l||+12'));
                aReceiptCommands.push(generateTextCommand('£' + customerOrderJSON.discounts.totalDiscount + '|r||-16'));
            }
        }
    };

    printStaffDiscountTotal = function printStaffDiscountTotal() {
        if (customerOrderJSON.discounts.staffDiscount) {
            aReceiptCommands.push(generateTextCommand('Staff Discount|l||+4'));
            aReceiptCommands.push(generateTextCommand('£' + customerOrderJSON.discounts.staffDiscount.value + '|r||-16'));
        }
    };

    printExchangedVouchersTotal = function printExchangedVouchersTotal() {
        if (customerOrderJSON.discounts.clubcard) {
            aReceiptCommands.push(generateTextCommand('Exchanged Vouchers|l'));
            aReceiptCommands.push(generateTextCommand('£' + customerOrderJSON.discounts.clubcard.exchangedVouchers + '|r||-16'));
        }
    };

    printClubcardVouchersTotal = function printClubcardVouchersTotal() {
        if (customerOrderJSON.discounts.clubcard) {
            aReceiptCommands.push(generateTextCommand('Clubcard Vouchers|l'));
            aReceiptCommands.push(generateTextCommand('£' + customerOrderJSON.discounts.clubcard.vouchers + '|r||-16'));
        }
    };

    printGiftCardTotal = function printGiftCardTotal() {
        if (customerOrderJSON.discounts.giftCard) {
            aReceiptCommands.push(generateTextCommand('Gift Cards|l'));
            aReceiptCommands.push(generateTextCommand('£' + customerOrderJSON.discounts.giftCard.value + '|r||-16'));
        }
    };

    printYesPayDevice = function printYesPayDevice() {
        if (customerOrderJSON.yesPayHandset) {
            aReceiptCommands.push(generateTextCommand('     AID|l||+6'));
            aReceiptCommands.push(generateTextCommand(':   ' + customerOrderJSON.yesPayHandset.aid + '|l|+130|-15'));
            aReceiptCommands.push(generateTextCommand('     Card|l'));
            aReceiptCommands.push(generateTextCommand(':   ' + customerOrderJSON.yesPayHandset.card + '|l|+130|-15'));
            aReceiptCommands.push(generateTextCommand('     AMN|l'));
            aReceiptCommands.push(generateTextCommand(':   ' + customerOrderJSON.yesPayHandset.amn + '|l|+130|-15'));
            aReceiptCommands.push(generateTextCommand('     TID|l'));
            aReceiptCommands.push(generateTextCommand(':   ' + customerOrderJSON.yesPayHandset.tid + '|l|+130|-15'));
            aReceiptCommands.push(generateTextCommand('     Expiry|l'));
            aReceiptCommands.push(generateTextCommand(':   ' + customerOrderJSON.yesPayHandset.expiry + '|l|+130|-15'));
            aReceiptCommands.push(generateTextCommand('     Auth Code|l'));
            aReceiptCommands.push(generateTextCommand(':   ' + customerOrderJSON.yesPayHandset.authCode + '|l|+130|-15'));
            aReceiptCommands.push(generateTextCommand('     Mode|l'));
            aReceiptCommands.push(generateTextCommand(':   ' + customerOrderJSON.yesPayHandset.mode + '|l|+130|-15'));
            aReceiptCommands.push(generateTextCommand('     Entry Mode|l'));
            aReceiptCommands.push(generateTextCommand(':   ' + customerOrderJSON.yesPayHandset.entryMode + '|l|+130|-15'));
            aReceiptCommands.push(generateTextCommand('     Application|l'));
            aReceiptCommands.push(generateTextCommand(':   ' + customerOrderJSON.yesPayHandset.application + '|l|+130|-15'));
            aReceiptCommands.push(generateTextCommand('     Trans Date|l'));
            aReceiptCommands.push(generateTextCommand(':   ' + customerOrderJSON.yesPayHandset.transDate + '|l|+130|-15'));
            aReceiptCommands.push(generateTextCommand('     Trans Time|l'));
            aReceiptCommands.push(generateTextCommand(':   ' + customerOrderJSON.yesPayHandset.transTime + '|l|+130|-15'));
            aReceiptCommands.push(generateTextCommand('     Trans Result|l'));
            aReceiptCommands.push(generateTextCommand(':   ' + customerOrderJSON.yesPayHandset.transResult + '|l|+130|-15'));
            aReceiptCommands.push(generateTextCommand('     PAN|l'));
            aReceiptCommands.push(generateTextCommand(':   ' + customerOrderJSON.yesPayHandset.pan + '|l|+130|-15'));
            aReceiptCommands.push(generateTextCommand('     Type|l'));
            aReceiptCommands.push(generateTextCommand(':   ' + customerOrderJSON.yesPayHandset.type + '|l|+130|-15'));
        }
    };

    printTotalToPay = function printTotalToPay() {
        printHr();
        formatText('bodyBold');
        aReceiptCommands.push(generateTextCommand('Total To Pay|l||+10'));
        aReceiptCommands.push(generateTextCommand('£' + customerOrderJSON.summary.totalCost + '|r||-16'));
        formatText('body');
        printStaffDiscountTotal();
        printExchangedVouchersTotal();
        printClubcardVouchersTotal();
        printGiftCardTotal();
        aReceiptCommands.push(generateTextCommand('Visa Debit Card|l'));
        aReceiptCommands.push(generateTextCommand('£' + customerOrderJSON.summary.totalCost + '|r||-16'));
        printYesPayDevice();
    };

    printGiftCard = function printGiftCard() {
        if (customerOrderJSON.discounts.giftCard) {
            printHr();
            formatText('heading');
            aReceiptCommands.push(generateTextCommand('GIFT CARD|c||+10'));
            formatText('body');
            aReceiptCommands.push(generateTextCommand(customerOrderJSON.discounts.giftCard.number + '|c||+3'));
            aReceiptCommands.push(generateTextCommand('New Gift Card Balance £' + customerOrderJSON.discounts.giftCard.balance + '|c||+3'));
        }
    };

    printClubcardStatement = function printClubcardStatement() {
        if (customerOrderJSON.discounts.clubcard) {
            printHr();
            formatText('heading');
            aReceiptCommands.push(generateTextCommand('CLUBCARD STATEMENT|c||+10'));
            formatText('body');
            aReceiptCommands.push(generateTextCommand('Clubcard Number|l||+3'));
            aReceiptCommands.push(generateTextCommand(customerOrderJSON.discounts.clubcard.number + '|r||-15'));
            aReceiptCommands.push(generateTextCommand('Points This Visit|l'));
            aReceiptCommands.push(generateTextCommand(customerOrderJSON.discounts.clubcard.points + '|r||-15'));
            aReceiptCommands.push(generateTextCommand('Includes:|l'));
            aReceiptCommands.push(generateTextCommand('   Unused Voucher Credit|l'));
            aReceiptCommands.push(generateTextCommand(customerOrderJSON.discounts.clubcard.unusedPoints + '|r||-16'));
            aReceiptCommands.push(generateTextCommand('Total Up To ' + customerOrderJSON.discounts.clubcard.pointExpiry + '|l||+4'));
            aReceiptCommands.push(generateTextCommand(customerOrderJSON.discounts.clubcard.pointCap + '|r||-15'));
        } else {
            printHr();
            formatText('heading');
            aReceiptCommands.push(generateTextCommand('SIGN UP FOR CLUBCARD!|c||+10'));
            formatText('body');
            aReceiptCommands.push(generateTextCommand('You could have earned ' + customerOrderJSON.summary.clubcardMissedPoints + ' Clubcard points in this transaction|c||+3'));
        }
    };

    printFuelSave = function printFuelSave() {
        if (customerOrderJSON.discounts.fuelSave) {
            printHr();
            formatText('heading');
            aReceiptCommands.push(generateTextCommand('CLUBCARD FUEL SAVE|c||+10'));
            formatText('body');
            aReceiptCommands.push(generateTextCommand('Savings This Visit (pence/litre)|l||+3'));
            aReceiptCommands.push(generateTextCommand(customerOrderJSON.discounts.fuelSave.value + '|r||-16'));
            aReceiptCommands.push(generateTextCommand('Savings Expiring ' + customerOrderJSON.discounts.fuelSave.expiry + '|l'));
            aReceiptCommands.push(generateTextCommand(customerOrderJSON.discounts.fuelSave.balance + '|r||-16'));
        }
    };

    printThankYouMessage = function printThankYouMessage() {
        printHr();
        formatText('body');
        aReceiptCommands.push(generateTextCommand('Please keep this receipt as your proof of purchase, and where relevant, your guarantee. If you have any queries about your Direct order, please contact customer services on|c||+10'));
        formatText('bodyBold');
        aReceiptCommands.push(generateTextCommand('0800 3234050|c||+5'));
        formatText('body');
        aReceiptCommands.push(generateTextCommand('Thank you for shopping with Tesco Direct|c||+5'));
    };

    printBarcode = function printBarcode() {
        if (customerOrderJSON.yesPayHandset) {
            printHr();
            aReceiptCommands.push(generateBarcodeCommand(customerOrderJSON.yesPayHandset.barcode + '|Code128|Y|N|C||+11|250|60'));
            aReceiptCommands.push(generateFontCommand('Arial|10|Regular'));
            aReceiptCommands.push(generateTextCommand(customerOrderJSON.yesPayHandset.barcode + '|c||+8'));
        }
    };

    printFooter = function printFooter() {
        printHr();
        formatText('body');
        aReceiptCommands.push(generateTextCommand(customerOrderJSON.summary.timeStamp + '|l|+11|+10'));
        formatText('footer');
        aReceiptCommands.push(generateTextCommand('.|c||+40'));
    };

    printOrderDetail = function printOrderDetail() {
        deliveryType = '';
        deliveryMethod = '';
        for (i = 0; i < customerOrderJSON.deliveryGroups.length; i++) {
            deliveryMethod = customerOrderJSON.deliveryGroups[i].deliveryMethod;
            printHr();
            formatText('heading');
            aReceiptCommands.push(generateTextCommand(customerOrderJSON.deliveryGroups[i].deliveryTitle + '|c|+12|+10|250||'));
            formatText('body');

            for (n = 0; n < customerOrderJSON.deliveryGroups[i].items.length; n++) {
                aReceiptCommands.push(generateTextCommand(customerOrderJSON.deliveryGroups[i].items[n].name + '|l||+6|220||'));
                aReceiptCommands.push(generateTextCommand('   ' + customerOrderJSON.deliveryGroups[i].items[n].quantity + '   @   £' + customerOrderJSON.deliveryGroups[i].items[n].price + '|l|+3||'));
                aReceiptCommands.push(generateTextCommand('£' + customerOrderJSON.deliveryGroups[i].items[n].price + '|r||-15'));
            }

            formatText('bodyBold');
            if (customerOrderJSON.deliveryGroups[i].deliveryMethod === 'clickAndCollect') {
                deliveryType = 'Collection';
            } else {
                deliveryType = 'Delivery';
            }

            aReceiptCommands.push(generateTextCommand(deliveryType + ' Details|l||+10'));
            formatText('body');
            aReceiptCommands.push(generateTextCommand(customerOrderJSON.recipient.title + ' ' + customerOrderJSON.recipient.firstName + ' ' + customerOrderJSON.recipient.lastName + ', ' + customerOrderJSON.recipient.contactNumber + '|l||+6'));
            aReceiptCommands.push(generateTextCommand(customerOrderJSON.deliveryGroups[i].deliveryAddress + '|l||+3'));
            formatText('bodyItalic');

            for (ageCheck = 0; ageCheck < customerOrderJSON.deliveryGroups[i].items.length; ageCheck++) {
                if (customerOrderJSON.deliveryGroups[i].items[ageCheck].isAgeRestricted === true) {
                    aReceiptCommands.push(generateTextCommand('You\'ll need to show proof of ID when you collect this order.|l||+6'));
                }
            }

            if (customerOrderJSON.deliveryGroups[i].deliveryMethod === 'delivery') {
                aReceiptCommands.push(generateTextCommand('This order requires an adult to sign for upon delivery.|l||+6'));
            }
        }
    };

    printError = function printError() {
        printBranding();
        printHr();
        formatText('heading');
        aReceiptCommands.push(generateTextCommand('FAILED TESCO DIRECT ORDER|c||+10'));
        formatText('body');
        aReceiptCommands.push(generateTextCommand('This order has not been processed by the system correctly. You have not been charged for this transaction. Please keep this receipt.|c||+6'));
        printHr();
        formatText('bodyBold');
        aReceiptCommands.push(generateTextCommand('Total To Pay|l||+10'));
        aReceiptCommands.push(generateTextCommand('£' + customerOrderJSON.summary.totalCost + '|r||-16'));
        aReceiptCommands.push(generateTextCommand(' '));
        formatText('body');
        aReceiptCommands.push(generateTextCommand('Visa Debit Card|l'));
        aReceiptCommands.push(generateTextCommand('£' + customerOrderJSON.summary.totalCost + '|r||-16'));
        printYesPayDevice();
        printHr();
        formatText('body');
        aReceiptCommands.push(generateTextCommand('If you have any queries about your Direct order, please contact customer services on|c||+10'));
        formatText('bodyBold');
        aReceiptCommands.push(generateTextCommand('0800 3234050|c||+5'));
        formatText('body');
        aReceiptCommands.push(generateTextCommand('Thank you for shopping with Tesco Direct|c||+5'));
        printFooter();
    };

    printSuccess = function printSuccess() {
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
    };

    generateReceiptArray = function generateReceiptArray(sReceiptType) {
        customerOrderJSON = $.extend({}, window.TescoData.ChipAndPin.orderConfirmation);
        $('.paymentSuccess').css('opacity', '1');
        printSuccess();
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
