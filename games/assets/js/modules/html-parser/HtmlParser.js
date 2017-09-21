/*jslint plusplus:true */
define('modules/html-parser/HtmlParser', ['domlib'], function ($) {
    'use strict';

    var fnCreateJqueryObjFromString,
        fnParseMarkupString,
        oConfig,
        fnParseSelectors,
        fnParseMultipleSelectors,
        fnParseSingleSelector,
        fnCloneObj,
        fnTrim,
        fnReplaceBreaksWithPtags,
        fnRemoveEmptyTags,
        fnReplaceObjWithClone,
        fnParseJqueryObj;

    fnCreateJqueryObjFromString = function createJqueryObjFromString(sMarkup) {
        return $($.parseHTML(sMarkup));
    };

    fnParseMarkupString = function parseString(sMarkup) {
        if (typeof sMarkup === 'string' && $.trim(sMarkup).length > 0) {
            var $obj = fnRemoveEmptyTags(fnReplaceBreaksWithPtags(fnTrim(fnCreateJqueryObjFromString(sMarkup))));
            return $obj[0].outerHTML;
        }
    };

    fnParseSelectors = function parseSelectors(mConfig) {
        if (Array.isArray(mConfig)) {
            fnParseMultipleSelectors(mConfig);
        } else if (typeof mConfig === 'string') {
            fnParseSingleSelector(mConfig);
        } else {
            throw new Error("The parameter passed to the HtmlParser is not valid, it should be an array or a string.");
        }
    };

    fnParseMultipleSelectors = function parseMultipleSelectors(aConfig) {
        var i;
        for (i = 0; i < aConfig.length; i++) {
            fnParseSingleSelector(aConfig[i]);
        }
    };

    fnParseSingleSelector = function parseSingleSelector(sSelector) {
        if (!$(sSelector).length) {
            throw new Error("The given selector is not present in the DOM.");
        }
        $(sSelector).each(function () {
            if (!$.trim($(this)[0].innerHTML).length) {
                throw new Error("The element does not have any markup in it to parse.");
            }
            fnParseJqueryObj($(this));
        });
    };

    fnCloneObj = function cloneObj($obj) {
        var $clone = $obj.clone(true);
        oConfig = {
            obj: $obj,
            clone: $clone
        };
        return oConfig.clone;
    };

    fnTrim = function trimJqueryObjHtml($obj) {
        $obj[0].innerHTML = $.trim($obj[0].innerHTML);
        return $obj;
    };

    fnReplaceBreaksWithPtags = function replaceBreaksWithPtags($obj) {
        var sMarkup = '<p>' + $obj[0].innerHTML.replace(/<br><br>/gi, '</p><p>') + '</p>';
        $obj[0].innerHTML = sMarkup;
        return $obj;
    };

    fnRemoveEmptyTags = function removeEmptyTags($obj) {
        $obj.find('*').each(function () {
            if ($.trim($(this)[0].innerHTML).length === 0) {
                $(this).remove();
            }
        });
        return $obj;
    };

    fnReplaceObjWithClone = function replaceObjWithClone() {
        oConfig.obj[0].innerHTML = oConfig.clone[0].innerHTML;
        return oConfig.obj;
    };

    fnParseJqueryObj = function parseJqueryObj($obj) {
        fnRemoveEmptyTags(fnReplaceBreaksWithPtags(fnTrim(fnCloneObj($obj))));
        fnReplaceObjWithClone();
    };

    return {
        parseMarkupString: fnParseMarkupString,
        parseSelectors: fnParseSelectors
    };
});