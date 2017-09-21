/*jslint plusplus: true */
define('modules/media-asset-manager/common', [], function () {
    'use strict';

    var MediaAssetManager,
        MediaAsset;

    MediaAssetManager = function MediaAssetManager() {
        this.aMediaCollection = [];
    };

    MediaAssetManager.prototype.addMedia = function addMedia(mMediaSet, sMediaType, position, mediaAssetProps) {
        var i, mediaAssetSet = [], oTempMediaAsset, tempSetStart, tempSetEnd, index, iMediaSetLength, aMediaSet;

        if ((mMediaSet === "" || mMediaSet === undefined) || !sMediaType) {
            return;
        }

        if (!Array.isArray(mMediaSet)) {
            aMediaSet = mMediaSet.split(',');
        } else {
            aMediaSet = mMediaSet;
        }

        iMediaSetLength = aMediaSet.length;

        if (iMediaSetLength > 0) {
            for (i = 0; i < iMediaSetLength; i++) {
                oTempMediaAsset = new MediaAsset(aMediaSet[i], sMediaType, i, mediaAssetProps);
                mediaAssetSet.push(oTempMediaAsset);
            }

            if (!position || position === 'append') {
                this.aMediaCollection = this.aMediaCollection.concat(mediaAssetSet);
            } else if (position === 'prepend') {
                this.aMediaCollection = mediaAssetSet.concat(this.aMediaCollection);
            } else if (typeof position === 'number') {
                index = position - 1;
                tempSetStart = this.aMediaCollection.slice(0, index);
                tempSetEnd = this.aMediaCollection.slice(index, this.aMediaCollection.length);
                this.aMediaCollection = tempSetStart.concat(mediaAssetSet, tempSetEnd);
            }
        }
    };

    MediaAssetManager.prototype.removeMedia = function (args) {
        if (typeof args.mediaAsset === 'function') {
            args.mediaAsset(this.aMediaCollection);
        }
    };

    MediaAssetManager.prototype.getCollectionLength = function getCollectionLength() {
        return this.aMediaCollection.length;
    };

    MediaAssetManager.prototype.getMediaByIndex = function getMediaByIndex(iIndex) {
        if (typeof iIndex !== 'number') {
            throw new Error('The "getMediaByIndex" method arguments MUST NOT be undefined and MUST be a number');
        }
        if (Array.isArray(this.aMediaCollection) && this.getCollectionLength() > 0) {
            return this.aMediaCollection[iIndex];
        }
    };

    MediaAssetManager.prototype.addToCollection = function addToCollection(iIndex, property, value) {
        if (this.getCollectionLength() > 0 && this.aMediaCollection[iIndex]) {
            this.aMediaCollection[iIndex][property] = value;
        }
    };

    MediaAssetManager.prototype.getMediaType = function getMediaType(iIndex) {
        return this.aMediaCollection[iIndex].mediaType;
    };

    MediaAsset = function MediaAsset(sMediaSrc, sMediaType, iMediaSetIndex, mediaAssetProps) {
        this.mediaSrc = sMediaSrc || null;
        this.mediaType = sMediaType || null;
        this.mediaSetIndex = iMediaSetIndex;

        if (mediaAssetProps && typeof mediaAssetProps === 'object' && !Array.isArray(mediaAssetProps)) {
            $.extend(true, this, mediaAssetProps);
        }
    };

    return MediaAssetManager;
});
