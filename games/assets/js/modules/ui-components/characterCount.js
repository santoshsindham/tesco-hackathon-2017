/*globals define,document,$,window */
define("modules/ui-components/characterCount", function () {
    'use strict';

    var CountChar = function () {
        this.defaultOption = {
            limit: 220,
            selector: "#",
            threshold: 50,
            limitLines: 0,
            limitLineSelector: ''
        };
    };

    CountChar.prototype = {
        init: function (element, options) {
            this.$el = $(element);
            if (this.$el.data('initialised') !== true) {
                this.$el.prop('autocomplete', false).prop('autocorrect', false).attr('autocomplete', 'off').attr('autocorrect', 'off');
                this.$el.off("keyup paste keydown keypress");
                this.$el.data('initialised', true);
                this.options = $.extend({}, this.defaultOption, options);
                this.options.limit = window.characterCountLimit ||  parseInt(this.$el.attr('maxlength-count'), 10) || this.options.limit || parseInt(this.$el.attr('maxlength'), 10);
                this.options.threshold = parseInt(this.$el.attr('warnlength'), 10) || this.options.threshold;
                this.$el.attr('maxlength-count', this.options.limit);
                this.charRemainingElement = this.$el.parent().find(this.options.selector);
                this.$remainingLineCount = this.$el.parent().find(this.options.limitLineSelector);
                this.prevRemaining = this.options.limit;
                this.$el.on("keyup paste", this.update.bind(this));
                this.$el.on("keypress", this.onKeyPress.bind(this));
                this.$el.on("keydown", this.onKeyDown.bind(this));
                this.$el.data("count", this);
                this.rAllowableCharacters = window.characterCountAllowableCharacters || /[A-Za-z0-9@!£$*()'+_\-|.,#?:;\s]+/;
                this.$charRemainingValueElement = this.charRemainingElement.find(".value");
                this.sInternalKey = this.$el.data('key');
                if (window.disableFlowersPhase2) {
                    this.$remainingLineCount.parent().addClass('disableflowersPhase2');
                }
                if (this.$el.parent().find('#tempLineCounter' + this.sInternalKey).length) {
                    this.$tempLineCounter = this.$el.parent().find('#tempLineCounter' + this.sInternalKey);
                }
                this.update();
            }
        },
        calculateMessageLength: function () {
            var sGiftMessage = this.$el.val(),
                iMessageLength = sGiftMessage.length,
                aTempCounter = [];
            aTempCounter = sGiftMessage.split(/\n/g);
            iMessageLength = iMessageLength + (aTempCounter.length - 1);
            return iMessageLength;
        },
        calculateRemainingCount: function (messageLength) {
            var remainingCount = this.options.limit - parseInt(messageLength, 10);
            return remainingCount;
        },
        updateRemainingCount: function (remainingCount) {
            this.$charRemainingValueElement.text(remainingCount);
            if (remainingCount > 0) {
                this.charRemainingElement.removeClass("full");
                if (remainingCount <= this.options.threshold) {
                    this.warnAtThreshold(remainingCount);
                } else {
                    this.removeWarningAboveThreshold(remainingCount);
                }
            } else {
                this.charRemainingElement.addClass("full");
            }
        },
        warnAtThreshold: function () {
            this.charRemainingElement.addClass(this.options.warningClass);
        },
        removeWarningAboveThreshold: function () {
            this.charRemainingElement.removeClass(this.options.warningClass);
        },
        update: function (e) {
            var messageLength,
                remainingCount,
                self = this;

            messageLength = this.calculateMessageLength();
            remainingCount = this.calculateRemainingCount(messageLength);
            remainingCount = this.preventMoreThanMaximumLength(remainingCount);

            this.updateRemainingCount(remainingCount);
            this.prevRemaining = remainingCount;

            window.setTimeout(function () {
                var rTempForGlobalSearch = new RegExp(self.rAllowableCharacters.source.replace('[', '[^'), 'g'),
                    iCharsPerLine,
                    iCharsToRemove;

                if (e && e.type === "paste") {
                    self.$el.val(self.$el.val().replace(rTempForGlobalSearch, ''));

                    if (!window.disableFlowersPhase2) {
                        if (self.options.limitLines) {
                            self.currentLineCount = self.getLineCount();
                            while (self.currentLineCount > self.options.limitLines) {
                                iCharsPerLine = Math.ceil(self.$el.val().length / self.currentLineCount);
                                iCharsToRemove = iCharsPerLine * (self.currentLineCount - self.options.limitLines);
                                self.$el.val(self.$el.val().substring(0, (self.$el.val().length - iCharsToRemove)));
                                self.currentLineCount = self.getLineCount();
                            }
                            self.updateLineCount();
                        }
                    }
                } else {
                    if (!window.disableFlowersPhase2) {
                        if (self.options.limitLines) {
                            self.currentLineCount = self.getLineCount();
                            self.updateLineCount();
                        }
                    } else {
                        self.$el.val(self.$el.val().replace(/\s\s+/g, ' '));
                    }
                }
            }, 10);
        },
        preventMoreThanMaximumLength: function (remainingCount) {
            var message;
            if (remainingCount < 0) {
                message = this.$el.val();
                this.$el.val(message.substr(0, this.options.limit));
                remainingCount = 0;
            }

            return remainingCount;
        },
        checkLimit: function (e) {
            if (this.prevRemaining <= 0) {
                if (this.isCountableKey(e.which) && (this.$el[0] === document.activeElement)) {
                    e.preventDefault();
                }
            }
        },
        onKeyPress: function (e) {
            var ENTER_CODE = 13,
                SPACE_CODE = 32,
                sPreviousCharCountText = '',
                sFutureCharCountText = '',
                iPositionKeyWasPressed,
                sCharToInsert;

            if (this.isCountableKey(e.which)) {
                if (!this.isCharacterAllowed(e.which)) {
                    e.preventDefault();
                    return false;
                }
                if (!window.disableFlowersPhase2) {
                    if (this.options.limitLines) {
                        sPreviousCharCountText = this.$el.val();
                        iPositionKeyWasPressed = $(e.target).prop('selectionStart') || 0;
                        sCharToInsert = String.fromCharCode(e.which);
                        if (e.which === ENTER_CODE) {
                            sCharToInsert = "\n";
                        }
                        if (e.which === SPACE_CODE) {
                            sCharToInsert = "-";
                        }
                        sFutureCharCountText = sPreviousCharCountText.substring(0, iPositionKeyWasPressed) + sCharToInsert + sPreviousCharCountText.substring(iPositionKeyWasPressed, sPreviousCharCountText.length);
                        this.currentLineCount = this.getLineCount(sFutureCharCountText);
                        if (this.currentLineCount > this.options.limitLines) {
                            this.$tempLineCounter.val(sPreviousCharCountText);
                            e.preventDefault();
                        }
                    }
                }
            }

            if (e.which === ENTER_CODE) {
                if (window.disableFlowersPhase2) {
                    e.preventDefault();
                }
            } else {
                this.checkLimit(e);
            }
        },
        onKeyDown: function (e) {
            if (e.which === 229) {
                e.preventDefault();
                return false;
            }
        },
        isCountableKey: function (keyCode) {
            return (keyCode !== 8 && keyCode !== 46);
        },
        isBelowThreshold: function () {
            return this.charRemainingElement.hasClass(this.options.warningClass);
        },
        isCharacterAllowed: function (keyCode) {
            if (keyCode === 229) {
                return false;
            }
            return this.rAllowableCharacters.test(String.fromCharCode(keyCode));
        },
        getLineCount: function (sUpdatedText) {
            var sTextboxContent = this.$el.val(),
                iLineCount = sTextboxContent === '' ? 0 : 1;
            if (this.$tempLineCounter) {
                if (sUpdatedText) {
                    sTextboxContent = sUpdatedText;
                }
                this.$tempLineCounter.val(sTextboxContent);
            } else {
                this.$el.after('<textarea id="tempLineCounter' + this.sInternalKey + '" class="no-save" rows="1" style="visibility: hidden; overflow-y: hidden;">' + sTextboxContent + '</textarea>');
                this.$tempLineCounter = $('#tempLineCounter' + this.sInternalKey);
            }
            iLineCount += Math.ceil((parseFloat(this.$tempLineCounter.prop('scrollHeight')) - this.$tempLineCounter.prop('clientHeight')) / Math.ceil(parseFloat(this.$tempLineCounter.css('line-height'))));
            return iLineCount;
        },
        updateLineCount: function () {
            var iRemainingLines = (this.options.limitLines - this.currentLineCount) < 0 ? 1 : (this.options.limitLines - this.currentLineCount) === 0 ? 0 : (this.options.limitLines - this.currentLineCount);
            this.$remainingLineCount.text(iRemainingLines + " line" + (iRemainingLines > 1 || iRemainingLines === 0 ? "s" : "") + " remaining");
        }
    };

    $.fn.count = function (options) {
        return $(this).each(function (index, element) {
            var charCounter = new CountChar(index);
            charCounter.init(element, options);
        });
    };

    $.CountChar = CountChar;
    return {};
});