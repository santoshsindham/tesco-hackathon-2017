define(['modules/ellipsis/Ellipsis', 'domlib'], function (Ellipsis, $) {
    'use strict';

    describe("Test Ellipsis module", function () {
        var oEllipsis,
            config,
            html,
            $content;

        describe("Test constructor", function () {
            it('Check config is object', function () {
                config = 'string';
                expect(function () {
                    return new Ellipsis(config);
                }).toThrowError("The parameter passed to the Ellipsis class not an object.");
            });

            it('Check content selector is in the DOM', function () {
                html = $.parseHTML('<section><div class="outer-container"><h2>Title</h2><div class="content-container"><div class="content">   </div></div></div></section>');
                $content = $(html).find('.not-in-dom');
                config = {
                    contentContainer: $content
                };
                expect(function () {
                    return new Ellipsis(config);
                }).toThrowError("The given selector is not present in the DOM.");
            });

            it('Check ellipsis height value', function () {
                html = $.parseHTML('<section><div class="outer-container"><h2>Title</h2><div class="content-container"><div class="content">This is content...</div></div></div></section>');
                $content = $(html).find('.content');
                config = {
                    contentContainer: $content
                };
                expect(function () {
                    return new Ellipsis(config);
                }).toThrowError("The value given for the height at which the content should ellpsis is not a number.");
            });

            it('Check constructor values', function () {
                html = $.parseHTML('<section><div class="outer-container"><h2>Title</h2><div class="content-container"><div class="content">This is content...</div></div></div></section>');
                $content = $(html).find('.content');
                config = {
                    contentContainer: $content,
                    buttonValueNotEllipsed: 'CLOSE',
                    buttonClasses: 'read-more-link btn-v2-link right-align',
                    ellpsisHeight: 130
                };

                oEllipsis = new Ellipsis(config);
                expect(oEllipsis.$content[0].className).toEqual('content');
                expect($(html).find('.content-inner-wrapper').length).toEqual(1);
                expect(oEllipsis.$contentInnerWrapper[0].className).toEqual('content-inner-wrapper');
                expect(oEllipsis.sButtonValueEllipsed).toEqual('READ MORE');
                expect(oEllipsis.sButtonValueNotEllipsed).toEqual('CLOSE');
                expect(oEllipsis.sButtonClasses).toEqual('read-more-link btn-v2-link right-align');
                expect(oEllipsis.sButtonMarkup).toEqual('<a herf="#" class="ellipsis-button read-more-link btn-v2-link right-align">READ MORE</a>');
                expect(oEllipsis.iEllipsisHeight).toEqual(130);
                expect(oEllipsis.bIsEllipsed).toEqual(false);
            });

            it('Unwrap content', function () {
                html = $.parseHTML('<section><div class="outer-container"><h2>Title</h2><div class="content-container"><div class="content">This is content...</div></div></div></section>');
                $content = $(html).find('.content');
                config = {
                    contentContainer: $content,
                    buttonValueNotEllipsed: 'CLOSE',
                    buttonClasses: 'read-more-link btn-v2-link right-align',
                    ellpsisHeight: 130
                };

                oEllipsis = new Ellipsis(config);
                oEllipsis.fnInitialiseEllipsis();
                oEllipsis.fnRemoveDotdotdot();
                oEllipsis.fnUnwrapContent();
                expect($(html).find('.content-inner-wrapper').length).toEqual(0);
            });

            it('Compare content height to ellipsis height', function () {
                html = $.parseHTML('<section><div class="outer-container"><h2>Title</h2><div class="content-container"><div class="content">This is content...</div></div></div></section>');
                $content = $(html).find('.content');
                config = {
                    contentContainer: $content,
                    buttonValueNotEllipsed: 'CLOSE',
                    buttonClasses: 'read-more-link btn-v2-link right-align',
                    ellpsisHeight: 130
                };

                oEllipsis = new Ellipsis(config);
                oEllipsis.$contentInnerWrapper.css({
                    'height': '500px'
                });
                expect(oEllipsis.fnCompareContentHeightToEllipseHeight()).toEqual(true);

                oEllipsis = new Ellipsis(config);
                oEllipsis.$contentInnerWrapper.css({
                    'height': '50px'
                });
                expect(oEllipsis.fnCompareContentHeightToEllipseHeight()).not.toEqual(true);
            });

            it('Insert button', function () {
                html = $.parseHTML('<section><div class="outer-container"><h2>Title</h2><div class="content-container"><div class="content">This is content...</div></div></div></section>');
                $content = $(html).find('.content');
                config = {
                    contentContainer: $content,
                    buttonValueNotEllipsed: 'CLOSE',
                    buttonClasses: 'read-more-link btn-v2-link right-align',
                    ellpsisHeight: 130
                };

                oEllipsis = new Ellipsis(config);
                oEllipsis.fnInsertReadMoreButton();
                expect($(html).find('.ellipsis-button').length).toEqual(1);
                expect(oEllipsis.$button[0].className).toEqual('ellipsis-button read-more-link btn-v2-link right-align');
            });

            it('Remove button', function () {
                html = $.parseHTML('<section><div class="outer-container"><h2>Title</h2><div class="content-container"><div class="content">This is content...</div></div></div></section>');
                $content = $(html).find('.content');
                config = {
                    contentContainer: $content,
                    buttonValueNotEllipsed: 'CLOSE',
                    buttonClasses: 'read-more-link btn-v2-link right-align',
                    ellpsisHeight: 130
                };

                oEllipsis = new Ellipsis(config);
                oEllipsis.fnInitialiseEllipsis();
                oEllipsis.fnRemoveReadMoreButton();
                expect($(html).find('.ellipsis-button').length).toEqual(0);
                expect(oEllipsis.$button).toEqual(null);
            });

            it('Change button text to close', function () {
                html = $.parseHTML('<section><div class="outer-container"><h2>Title</h2><div class="content-container"><div class="content">This is content...</div></div></div></section>');
                $content = $(html).find('.content');
                config = {
                    contentContainer: $content,
                    buttonValueNotEllipsed: 'CLOSE',
                    buttonClasses: 'read-more-link btn-v2-link right-align',
                    ellpsisHeight: 130
                };

                oEllipsis = new Ellipsis(config);
                oEllipsis.fnInitialiseEllipsis();
                oEllipsis.fnChangeReadMoreButtonText();
                expect($(html).find('.ellipsis-button').text()).toEqual('CLOSE');
            });

            it('Test Dotdotdot is getting added', function () {
                html = $.parseHTML('<section><div class="outer-container"><h2>Title</h2><div class="content-container"><div class="content">This is content...</div></div></div></section>');
                $content = $(html).find('.content');
                config = {
                    contentContainer: $content,
                    buttonValueNotEllipsed: 'CLOSE',
                    buttonClasses: 'read-more-link btn-v2-link right-align',
                    ellpsisHeight: 130
                };

                oEllipsis = new Ellipsis(config);
                oEllipsis.$contentInnerWrapper.css({
                    'height': '500px'
                });
                oEllipsis.fnAddDotdotdot();
                expect($(html).find('.content-inner-wrapper').children('.dotdotdot').length).toEqual(1);
            });

            it('Remove dotdotdot', function () {
                html = $.parseHTML('<section><div class="outer-container"><h2>Title</h2><div class="content-container"><div class="content">This is content...</div></div></div></section>');
                $content = $(html).find('.content');
                config = {
                    contentContainer: $content,
                    buttonValueNotEllipsed: 'CLOSE',
                    buttonClasses: 'read-more-link btn-v2-link right-align',
                    ellpsisHeight: 130
                };

                oEllipsis = new Ellipsis(config);
                oEllipsis.fnInitialiseEllipsis();
                oEllipsis.fnRemoveDotdotdot();
                expect($(html).find('.content-inner-wrapper').children('.dotdotdot').length).toEqual(0);
            });

            it('Test adding ellipsis function', function () {
                html = $.parseHTML('<section><div class="outer-container"><h2>Title</h2><div class="content-container"><div class="content">This is content...</div></div></div></section>');
                $content = $(html).find('.content');
                config = {
                    contentContainer: $content,
                    buttonValueNotEllipsed: 'CLOSE',
                    buttonClasses: 'read-more-link btn-v2-link right-align',
                    ellpsisHeight: 130
                };

                oEllipsis = new Ellipsis(config);
                oEllipsis.$contentInnerWrapper.css({
                    'height': '500px'
                });
                spyOn(oEllipsis, 'fnAddDotdotdot').and.callThrough();
                spyOn(oEllipsis, 'fnChangeReadMoreButtonText').and.callThrough();
                oEllipsis.fnInitialiseEllipsis();
                oEllipsis.fnRemoveEllipsis();
                oEllipsis.fnAddEllipsis();
                expect(oEllipsis.fnAddDotdotdot).toHaveBeenCalled();
                expect(oEllipsis.fnChangeReadMoreButtonText).toHaveBeenCalled();
                expect($(html).find('.ellipsis-button').text()).toEqual('READ MORE');
                expect(oEllipsis.bIsEllipsed).toEqual(true);
            });

            it('Test removing ellipsis function', function () {
                html = $.parseHTML('<section><div class="outer-container"><h2>Title</h2><div class="content-container"><div class="content">This is content...</div></div></div></section>');
                $content = $(html).find('.content');
                config = {
                    contentContainer: $content,
                    buttonValueNotEllipsed: 'CLOSE',
                    buttonClasses: 'read-more-link btn-v2-link right-align',
                    ellpsisHeight: 130
                };

                oEllipsis = new Ellipsis(config);
                oEllipsis.$contentInnerWrapper.css({
                    'height': '500px'
                });
                spyOn(oEllipsis, 'fnRemoveDotdotdot').and.callThrough();
                spyOn(oEllipsis, 'fnChangeReadMoreButtonText').and.callThrough();
                oEllipsis.fnInitialiseEllipsis();
                oEllipsis.fnRemoveEllipsis();
                expect(oEllipsis.fnRemoveDotdotdot).toHaveBeenCalled();
                expect(oEllipsis.fnChangeReadMoreButtonText).toHaveBeenCalled();
                expect($(html).find('.ellipsis-button').text()).toEqual('CLOSE');
                expect(oEllipsis.bIsEllipsed).toEqual(false);
            });

            it('Test initialise ellipsis function', function () {
                html = $.parseHTML('<section><div class="outer-container"><h2>Title</h2><div class="content-container"><div class="content">This is content...</div></div></div></section>');
                $content = $(html).find('.content');
                config = {
                    contentContainer: $content,
                    buttonValueNotEllipsed: 'CLOSE',
                    buttonClasses: 'read-more-link btn-v2-link right-align',
                    ellpsisHeight: 130
                };

                oEllipsis = new Ellipsis(config);
                oEllipsis.$contentInnerWrapper.css({
                    'height': '500px'
                });
                spyOn(oEllipsis, 'fnAddDotdotdot').and.callThrough();
                spyOn(oEllipsis, 'fnInsertReadMoreButton').and.callThrough();
                spyOn(oEllipsis, 'fnBindEvents').and.callThrough();
                oEllipsis.fnInitialiseEllipsis();
                expect(oEllipsis.fnAddDotdotdot).toHaveBeenCalled();
                expect(oEllipsis.fnInsertReadMoreButton).toHaveBeenCalled();
                expect(oEllipsis.fnBindEvents).toHaveBeenCalled();
                expect(oEllipsis.bIsEllipsed).toEqual(true);
            });

            it('Test destroying ellipsis function', function () {
                html = $.parseHTML('<section><div class="outer-container"><h2>Title</h2><div class="content-container"><div class="content">This is content...</div></div></div></section>');
                $content = $(html).find('.content');
                config = {
                    contentContainer: $content,
                    buttonValueNotEllipsed: 'CLOSE',
                    buttonClasses: 'read-more-link btn-v2-link right-align',
                    ellpsisHeight: 130
                };

                oEllipsis = new Ellipsis(config);
                oEllipsis.$contentInnerWrapper.css({
                    'height': '500px'
                });
                spyOn(oEllipsis, 'fnRemoveDotdotdot').and.callThrough();
                spyOn(oEllipsis, 'fnUnwrapContent').and.callThrough();
                spyOn(oEllipsis, 'fnRemoveReadMoreButton').and.callThrough();
                spyOn(oEllipsis, 'fnUnbindEvents').and.callThrough();
                oEllipsis.fnInitialiseEllipsis();
                oEllipsis.fnDestroyEllipsis();
                expect(oEllipsis.fnRemoveDotdotdot).toHaveBeenCalled();
                expect(oEllipsis.fnUnwrapContent).toHaveBeenCalled();
                expect(oEllipsis.fnRemoveReadMoreButton).toHaveBeenCalled();
                expect(oEllipsis.fnUnbindEvents).toHaveBeenCalled();
                expect(oEllipsis.bIsEllipsed).toEqual(false);
            });

            it('Test init function', function () {
                html = $.parseHTML('<section><div class="outer-container"><h2>Title</h2><div class="content-container"><div class="content">This is content...</div></div></div></section>');
                $content = $(html).find('.content');
                config = {
                    contentContainer: $content,
                    buttonValueNotEllipsed: 'CLOSE',
                    buttonClasses: 'read-more-link btn-v2-link right-align',
                    ellpsisHeight: 130
                };

                oEllipsis = new Ellipsis(config);
                oEllipsis.$contentInnerWrapper.css({
                    'height': '500px'
                });
                spyOn(oEllipsis, 'fnInitialiseEllipsis').and.callThrough();
                spyOn(oEllipsis, 'fnBindEvents').and.callThrough();
                oEllipsis.fnInit();
                expect(oEllipsis.fnInitialiseEllipsis).toHaveBeenCalled();

                oEllipsis = new Ellipsis(config);
                oEllipsis.$contentInnerWrapper.css({
                    'height': '50px'
                });
                spyOn(oEllipsis, 'fnInitialiseEllipsis').and.callThrough();
                spyOn(oEllipsis, 'fnBindEvents').and.callThrough();
                oEllipsis.fnInit();
                expect(oEllipsis.fnInitialiseEllipsis).not.toHaveBeenCalled();
            });
        });
    });
});