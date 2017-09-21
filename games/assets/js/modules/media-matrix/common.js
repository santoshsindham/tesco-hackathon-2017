/* eslint-disable */
/*jslint regexp: true, nomen: true, plusplus: true */
define([
    'modules/common'
], function (common) {
    'use strict';

    var MediaType,
        MediaProviders,
        MediaUpdated,
        mediaMatrix = {

            _mediaTypes: [],
            _mediaProviders: [],

            mediaDefinitions: function () {

                var updatedUrl;

                mediaMatrix._mediaTypes.push(new MediaType('mp4', /(\.mp4)/gi));
                mediaMatrix._mediaTypes.push(new MediaType('m4v', /(\.m4v)/gi));
                mediaMatrix._mediaTypes.push(new MediaType('3gp', /(\.3gp)/gi));
                mediaMatrix._mediaTypes.push(new MediaType('flv', /(\.flv)/gi));
                mediaMatrix._mediaTypes.push(new MediaType('webm', /(\.webm)/gi));

                mediaMatrix._mediaProviders.push(new MediaProviders('Flix Media Alternate #2', /(embed\.flixfacts\.com\/v2)/i, 'html5', null, function (url) {
                    if (common.isFireFox() || !common.isHTML5()) {
                        this.playerType = 'flash';
                    } else {
                        updatedUrl = url;
                    }
                    return updatedUrl;
                }));
                mediaMatrix._mediaProviders.push(new MediaProviders('Easy2', /(media\.easy2\.com)/i, 'flash', null, null));
                mediaMatrix._mediaProviders.push(new MediaProviders('Easy2 Alternate', /(webapps\.easy2\.com)/i, 'html5', null, function (url) {
                    // switchable - this provider offers mp4 and webm
                    if (common.isFireFox()) {
                        this.typeRewrite = 'webm';
                        updatedUrl = url.concat('&formats=.' + 'webm');
                    } else if (!common.isHTML5()) {
                        this.playerType = 'flash';
                        this.typeRewrite = 'mp4';
                        updatedUrl = url.concat('&formats=.' + 'mp4');
                    } else {
                        this.typeRewrite = 'mp4';
                        updatedUrl = url.concat('&formats=.' + 'mp4');
                    }
                    return updatedUrl;
                }));
                mediaMatrix._mediaProviders.push(new MediaProviders('Flix Media', /(embed\.flixfacts\.com\/[^v2])/i, 'flash', null, null));
                mediaMatrix._mediaProviders.push(new MediaProviders('Flix Media Alternate', /(c242173\.r73\.cf3\.rackcdn\.com)/i, 'html5', null, null));
                mediaMatrix._mediaProviders.push(new MediaProviders('iSiteTv', /(www\.isitetv\.com)/i, 'html5', null, function (url) {
                    // switchable - this provider offers m4v and flv
                    if (mediaMatrix.detectIOS) {
                        this.typeRewrite = 'm4v';
                        updatedUrl = url.replace(/...$/gi, 'm4v');
                    } else {
                        if (!common.isHTML5() || common.isFireFox()) {
                            this.playerType = 'flash';
                            this.typeRewrite = 'flv';
                            updatedUrl = url.replace(/...$/gi, 'flv');
                        } else {
                            this.typeRewrite = 'm4v';
                            updatedUrl = url.replace(/...$/gi, 'm4v');
                        }
                    }
                    return updatedUrl;
                }));
                mediaMatrix._mediaProviders.push(new MediaProviders('Video Detective', /(www\.videodetective\.net)/i, 'html5'));
                mediaMatrix._mediaProviders.push(new MediaProviders('Scene7', /(tesco\.scene7\.com)/i, 'html5'));
                mediaMatrix._mediaProviders.push(new MediaProviders('Flix 360', /(embed\.flix360\.com)/i, 'html5'));
                mediaMatrix._mediaProviders.push(new MediaProviders('adis', /(i1\.adis\.ws)/i, 'html5'));
            },

            /* File decoding logic
             * This function should take an array of objects (video URLs from the JSP) and use regex to discover
             * what each file type is. The function should also use a regex to discover what media provider is associated
             * with each video url. This should output an array of objects containing video file type and provider.
             */
            mediaDecoder: function (mediaTypeDefinitions, mediaProviderDefinitions, aMediaCollection) {

                var _mediaCollection = aMediaCollection || window.TescoData.pdp.scene7._s7VideoSet,
                    mediaTypes = mediaTypeDefinitions,
                    mediaProviders = mediaProviderDefinitions,
                    j,
                    aUpdatedMedia = [];

                function decodeUrl(mediaCollection) {
                    var mediaUrl = mediaCollection,
                        tmpType = 'Unknown',
                        tmpProvider = 'Unknown',
                        typePattern,
                        providerPattern,
                        playerType,
                        i;

                    // match media types
                    for (i = 0; i < mediaTypes.length; i++) {
                        typePattern = mediaTypes[i].pattern;

                        if (typePattern.test(mediaUrl)) {
                            tmpType = mediaTypes[i].type;
                        }
                    }

                    // match media providers
                    for (i = 0; i < mediaProviders.length; i++) {
                        providerPattern = mediaProviders[i].pattern;

                        if (providerPattern.test(mediaUrl)) {
                            tmpProvider = mediaProviders[i].provider;

                            // check url rewrite function
                            if (mediaProviders[i].urlRewrite !== null) {
                                mediaUrl = mediaProviders[i].urlRewrite(mediaUrl);
                                tmpType = mediaProviders[i].typeRewrite;
                            }

                            playerType = mediaProviders[i].playerType;
                        }
                    }

                    if (aMediaCollection) {
                        aUpdatedMedia.push(new MediaUpdated(tmpType, playerType, tmpProvider, mediaUrl));
                    } else {
                        window._mediaCollectionUpdated.push(new MediaUpdated(tmpType, playerType, tmpProvider, mediaUrl));
                    }
                }

                // push array of videos into decoder function
                for (j = 0; j < _mediaCollection.length; j++) {
                    if (_mediaCollection[j].mediaSrc !== undefined) {
                        decodeUrl(_mediaCollection[j].mediaSrc);
                    } else {
                        decodeUrl(_mediaCollection[j]);
                    }
                }

                return aUpdatedMedia;
            },

            processMediaCollection: function processMediaCollection(aMediaCollection) {
                if (aMediaCollection) {
                    return mediaMatrix.mediaDecoder(mediaMatrix._mediaTypes, mediaMatrix._mediaProviders, aMediaCollection);
                }
            },

            init: function () {
                mediaMatrix.mediaDefinitions();
            }
        };

    MediaType = function (type, pattern, viewerType) {
        this.type = type || null;
        this.pattern = pattern || null;
        this.viewerType = viewerType || null;
    };

    MediaProviders = function (provider, pattern, playerType, typeRewrite, urlRewrite) {
        this.provider = provider || null;
        this.pattern = pattern || null;
        this.playerType = playerType || null;
        this.typeRewrite = typeRewrite || null;
        this.urlRewrite = urlRewrite || null;
    };

    MediaUpdated = function (fileType, playerType, tmpProvider, url) {
        this.fileType = fileType || null;
        this.playerType = playerType || null;
        this.tmpProvider = tmpProvider || null;
        this.url = url || null;
    };

    return mediaMatrix;
});
