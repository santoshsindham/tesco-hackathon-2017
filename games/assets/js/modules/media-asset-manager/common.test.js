/*globals define, window, describe, it, expect, beforeEach, afterEach, spyOn, jasmine */
/*jslint plusplus:true*/

/// <reference path="common.js">

define(['modules/media-asset-manager/common'], function (MediaAssetManager) {
    'use strict';

    describe('Media Asset Manager module', function () {

        var oMediaAssetManager;

        beforeEach(function () {
            oMediaAssetManager = new MediaAssetManager();
        });

        afterEach(function () {
            oMediaAssetManager = null;
        });

        describe('GIVEN I am on the PDP and I try to retrieve from the collection... ', function () {

            describe('WHEN I haven\'t passed in an argument...', function () {
                it('THEN I expect an error to be thrown', function () {
                    expect(function () {
                        oMediaAssetManager.getMediaByIndex();
                    }).toThrow(new Error('The "getMediaByIndex" method arguments MUST NOT be undefined and MUST be a number'));
                });
            });

            describe('WHEN I haven\'t passed the correct data type...', function () {
                it('THEN I expect an error to be thrown', function () {
                    expect(function () {
                        oMediaAssetManager.getMediaByIndex('string');
                    }).toThrow(new Error('The "getMediaByIndex" method arguments MUST NOT be undefined and MUST be a number'));
                });
            });

            describe('WHEN I call the "getMediaByIndex" method', function () {
                it('THEN I expect "getCollectionLength" to have been called', function () {
                    spyOn(oMediaAssetManager, "getCollectionLength");
                    oMediaAssetManager.getMediaByIndex(1);
                    expect(oMediaAssetManager.getCollectionLength).toHaveBeenCalled();
                });

            });

        });
    });
});
