/*jslint plusplus: true, nomen: true, indent: 4 */
/*globals window,document,console,define */
define('modules/chip-and-pin/atg-data', ['domlib'], function ($) {
    'use strict';
    var self = {},
        parseATGFieldValues = function parseATGFieldValues(data, $inputFields) {
            var i, $elem, elem_val,
                inputFieldsLength = $inputFields.length;

            for (i = 0; i < inputFieldsLength; i++) {
                $elem = $inputFields.eq(i);
                elem_val = $elem.val();

                if ($elem.data('field')) {
                    if (!data.defaults) {
                        data.defaults = {};
                    }
                    data.defaults[$elem.data('field')] = elem_val;
                } else {
                    data.atgData[$elem.prop('name')] = elem_val;
                }
            }
            return data;
        },
        parse = function parse(param) {
            var data = {
                    atgData: {}
                },
                formString = param.atgData || param,
                $inputHiddenFields = $(formString).find('input[type="hidden"]'),
                $inputFields = $(formString).find('input[type="text"]');

            data = parseATGFieldValues(data, $inputHiddenFields);
            data = parseATGFieldValues(data, $inputFields);

            return data;
        };

    self.handleForms = function handleForms(object, callback) {
        var x, $forms, formsLength, formName, data;

        if (object && typeof object === 'string') {
            object = JSON.parse(object);
        }

        $forms = $(object.atgData);
        formsLength = $forms.length;

        if (formsLength) {
            for (x = 0; x < formsLength; x++) {
                formName = $forms[x].name;
                data = parse($forms[x]);
                if (callback && typeof callback === 'function') {
                    callback(formName, data);
                }
            }
        }

        return object;
    };

    self.parse = parse;

    return self;
});