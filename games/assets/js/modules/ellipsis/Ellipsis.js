define('modules/ellipsis/Ellipsis', ['domlib'], function ($) {
    'use strict';

    var Ellipsis = function (config) {
        this.$content = $(config.contentContainer);
        if (this.$content.length) {
            this.$contentInnerWrapper = this.fnWrapContent();
        }
        this.sButtonValueEllipsed = config.buttonValueEllipsed || 'READ MORE';
        this.sButtonValueNotEllipsed = config.buttonValueNotEllipsed || 'READ LESS';
        this.sButtonClasses = config.buttonClasses || '';
        this.sButtonMarkup = '<a herf="#" class="ellipsis-button ' + this.sButtonClasses + '">' + this.sButtonValueEllipsed + '</a>';
        this.$button = null;
        this.iEllipsisHeight = config.ellpsisHeight;
        this.bIsEllipsed = false;

        if (typeof config !== 'object') {
            throw new Error("The parameter passed to the Ellipsis class not an object.");
        }
        if (this.$content.length === 0) {
            throw new Error("The given selector is not present in the DOM.");
        }
        if (typeof this.iEllipsisHeight !== 'number') {
            throw new Error("The value given for the height at which the content should ellpsis is not a number.");
        }
    };

    Ellipsis.prototype.fnWrapContent = function () {
        if (!this.$content.find('.content-inner-wrapper').length) {
            this.$content.wrapInner('<div class="content-inner-wrapper"></div>');
        }
        return this.$content.find('.content-inner-wrapper');
    };

    Ellipsis.prototype.fnUnwrapContent = function () {
        this.$contentInnerWrapper.contents().unwrap();
    };

    Ellipsis.prototype.fnCompareContentHeightToEllipseHeight = function () {
        var iContentHeight = this.$contentInnerWrapper.height();
        if (iContentHeight > this.iEllipsisHeight) {
            return true;
        }
    };

    Ellipsis.prototype.fnInsertReadMoreButton = function () {
        this.$content.after(this.sButtonMarkup);
        this.$button = this.$content.next('.ellipsis-button');
    };

    Ellipsis.prototype.fnRemoveReadMoreButton = function () {
        this.$button.remove();
        this.$button = null;
    };

    Ellipsis.prototype.fnChangeReadMoreButtonText = function () {
        if (this.bIsEllipsed) {
            this.$button.text(this.sButtonValueNotEllipsed);
        } else {
            this.$button.text(this.sButtonValueEllipsed);
        }
    };

    Ellipsis.prototype.fnAddDotdotdot = function () {
        var self = this;
        this.$contentInnerWrapper.dotdotdot({
            height: self.iEllipsisHeight
        });
    };

    Ellipsis.prototype.fnRemoveDotdotdot = function () {
        this.$contentInnerWrapper.trigger('destroy');
    };

    Ellipsis.prototype.fnAddEllipsis = function () {
        this.fnAddDotdotdot();
        this.fnChangeReadMoreButtonText();
        this.bIsEllipsed = true;
    };

    Ellipsis.prototype.fnRemoveEllipsis = function () {
        this.fnRemoveDotdotdot();
        this.fnChangeReadMoreButtonText();
        this.bIsEllipsed = false;
    };

    Ellipsis.prototype.fnToggleAddRemoveEllipsis = function (e) {
        if (this.bIsEllipsed) {
            this.fnRemoveEllipsis();
        } else {
            this.fnAddEllipsis();
        }
        e.preventDefault();
    };

    Ellipsis.prototype.fnInitialiseEllipsis = function () {
        if (this.$contentInnerWrapper === null) {
            this.$contentInnerWrapper = this.fnWrapContent();
        }
        this.fnAddDotdotdot();
        this.fnInsertReadMoreButton();
        this.fnBindEvents();
        this.bIsEllipsed = true;
        this.fnSetObjDataAttribute();
    };

    Ellipsis.prototype.fnDestroyEllipsis = function () {
        this.fnRemoveDotdotdot();
        this.fnUnwrapContent();
        this.fnRemoveReadMoreButton();
        this.fnUnbindEvents();
        this.bIsEllipsed = false;
        this.fnUnsetObjDataAttribute();
    };

    Ellipsis.prototype.fnBindEvents = function () {
        var self = this;
        this.$content.on('click.fnToggleAddRemoveEllipsis', '.ellipsis-button', self.fnToggleAddRemoveEllipsis);
    };

    Ellipsis.prototype.fnUnbindEvents = function () {
        this.$content.off('click.fnToggleAddRemoveEllipsis');
    };

    Ellipsis.prototype.fnSetObjDataAttribute = function () {
        this.$content.data('Ellipsis', this);
    };

    Ellipsis.prototype.fnUnsetObjDataAttribute = function () {
        this.$content.data('Ellipsis', null);
    };

    Ellipsis.prototype.fnInit = function () {
        if (this.fnCompareContentHeightToEllipseHeight()) {
            this.fnInitialiseEllipsis();
        }
    };

    Ellipsis.prototype.fnRemovePreviousEllipsisObj = function () {
        if (this.$content.data('Ellipsis')) {
            this.fnUnsetObjDataAttribute();
        }
        if (this.$contentInnerWrapper.triggerHandler("isTruncated")) {
            this.fnRemoveDotdotdot();
        }
        if (this.$content.next('.ellipsis-button').length) {
            this.$button = this.$content.next('.ellipsis-button');
            this.fnRemoveReadMoreButton();
        }
        this.fnUnbindEvents();
        this.bIsEllipsed = false;
    };

    Ellipsis.prototype.fnReInit = function () {
        this.fnRemovePreviousEllipsisObj();
        if (this.fnCompareContentHeightToEllipseHeight()) {
            this.fnInitialiseEllipsis();
        }
    };

    return Ellipsis;
});