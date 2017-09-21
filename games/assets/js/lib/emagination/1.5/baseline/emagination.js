/*!
* EmaginationJS version 1.5
* API Version: 1.5
* Author: Andrew Pope
* Copyright (c) Emagination Store 2015
* Unauthorised use of this plug-in is strictly prohibited.
*/

(function ($) {

    var settings = {
        // Required settings
        AuthCode: '',
        ProductName: '',

        Prefix: 'EmaginationJS-',
        APIUrl: 'https://api.emaginationstore.com/v1.5/Personalisation',
        PreviewGuid: '',
        DefaultValues: {},

        LoadInterval: 1300,
        FadeSpeed: 400,
        HelpFadeSpeed: 600,

        AutoHelpPopup: false,
        HelpTimeout: 4000,

        ShowButtons: true,
        ShowLayerButtons: true,
        EnableKeyboardNavigation: true,

        PreviewImageWidth: 800,
        ImageQuality: 100, // Changes compression quality on the images, 20 = Low Quality, 100 = High Quality
        ImageFormat: 'png', // PNG returns better quality than JPG
        UseWatermark: false,
        ResponseTracking: false,
        LayerUpdated: false,
        TextLayersUpdated: false,

        onLayerUpdated: function () {
        },
        onTextLayersUpdated: function () {
        },
        onReset: function () {
        },

        onError: null,
        onFatalError: null
    };

    var elements = {
        MainContainer: null,
        PreviewGuidInput: null,

        // Parents
        Personalisation: null,
        Controls: null,
        ButtonPanel: null,
        ReportErrorForm: null,

        ReportErrorTextbox: null,
        ReportErrorSubmit: null,
        ReportErrorConfirmation: null,

        // Personalisation Children
        LoadingOverlay: null,
        LoadingMessage: null,
        Help: null,
        CanvasNavigation: null,
        NextButton: null,
        PreviousButton: null,
        ReportErrorButton: null,

        CanvasContainer: null,
        Canvases: null,
        PreviewImages: null,
        CanvasElements: null,
        TextLayers: null,
        ImageLayers: null,
        HelpOverlay: null,
        CloseHelp: null,
        ToolTips: null,

        // Buttons
        HelpButton: null,
        PreviewButton: null,
        ResetButton: null,

        // Controls Children
        ControlsTitles: null,
        ControlsToolTip: null,
        ControlsPlaceholder: null,
        LayerButtonsContainer: null,
        LayerButtons: null,
        LayerButtonsTitle: null,

        TextControls: null,
        ImageControls: null,

        ControlsBackButton: null,
        TextContent: null,
        CharacterCounter: null,
        LibraryImages: null,
        NoLibraryImages: null,
        LibraryImagesContainer: null,
        Dropzone: null,
        UploadImages: null,
        CropMessage: null
    };

    // Global vars
    var typingTimer,
        clickTimer,
        helpTimer,
        previewGuid,
        imageCount = 0,
        imageLoadedCount = 0,
        textLayersToUpdate = [],
        textLayersUpdated = [],
        textContentLength,
        reset = false,
        dropzone = null;

    var methods = {

        // Init
        init: function (options, element) {

            if (typeof EmaginationJS_language === 'undefined') {
                $.error('Please include a language file');
            }

            // Check is preview already exists
            previewGuid = methods.GetCookie(settings.Prefix + settings.ProductName.split(' ').join('-'));

            // Populate main variable
            if (typeof element === "undefined") {
                element = this;
            }

            elements.MainContainer = element;

            // Extend settings
            settings = $.extend(settings, options);

            // Create Elements
            methods.CreateStaticElements(element);

            // Apply Styles
            methods.SetStaticElementDefaults();

            // Bind reset Button
            if (!elements.ResetButton.hasClass('disabled')) {
                elements.ResetButton.click(function (e) {
                    e.preventDefault();

                    if (confirm(EmaginationJS_language.ResetConfirmationMessage)) {
                        //methods.DeletePreview(settings.ProductName);
                        //window.location.reload();
                        methods.Reset();
                    }
                });
            }

            if (settings.AuthCode == '') {
                methods.FatalError('Please specify an Auth Code');
            }

            if (settings.ProductName == '') {
                methods.FatalError('Please specify a Product Name');
            };

            // Populate Product
            methods.PopulateProduct();

            var dateStart = methods.GetCurrentDateTime(),
                imagesLoaded = setInterval(function () {
                if (imageCount > 0) {
                    if (imageLoadedCount == imageCount) {
                        clearInterval(imagesLoaded);
                        imageLoadedCount = 0;
                        methods.ShowPersonalisation();

                        if (settings.ResponseTracking) {
                            var dateEnd = methods.GetCurrentDateTime();

                            $.post(settings.APIUrl + '/SubmitResponseTime', {
                                'start': dateStart,
                                'finish': dateEnd,
                                'authcode': settings.AuthCode,
                                'method': 'Load',
                                'guid': previewGuid,
                                'imagewidth': elements.CanvasContainer.width(),
                                'imagequality': settings.ImageQuality,
                                'imagetype': settings.ImageFormat
                            }, function () {
                                // Done
                            }, "jsonp");
                        }
                    }
                }
            }, 250);

            var resizeTimeout,
                lastWidth;

            if (elements.CanvasContainer != null) {
                lastWidth = elements.CanvasContainer.width();
            }

            $(window).resize(function () {

                clearTimeout(resizeTimeout);

                if (elements.Canvases != null && elements.Canvases.length > 0) {
                    elements.Canvases.each(function () {
                        methods.ResizeCanvas($(this));
                    });
                }

                methods.ResizeLibraryContainer();

                if (elements.Controls.outerWidth() >= elements.MainContainer.width()) {
                    elements.Controls.outerHeight(elements.MainContainer.height() - elements.Personalisation.outerHeight(true));
                } else {
                    elements.Controls.outerHeight(elements.MainContainer.height() - elements.ButtonPanel.outerHeight(true));
                }

                if (lastWidth != undefined) {
                    if (elements.CanvasContainer.width() != lastWidth) {

                        resizeTimeout = setTimeout(function () {
                            elements.LoadingOverlay.fadeIn(settings.FadeSpeed);

                            if (elements.Canvases != null && elements.Canvases.length > 0) {
                                elements.Canvases.each(function() {
                                    methods.LoadPreviewImage($(this), previewGuid);
                                });
                            }

                            lastWidth = elements.CanvasContainer.width();
                        }, 800);
                    }
                }
                else {
                    if (elements.CanvasContainer != null) {
                        lastWidth = elements.CanvasContainer.width();
                    }
                }

            });

        },

        // Populates the required elements to a specified DOM object
        CreateStaticElements: function (element) {
            var id = '';

            id = settings.Prefix + 'PreviewGuid';
            element.append('<input type="hidden" id="' + id + '" />');
            elements.PreviewGuidInput = $('#' + id);

            // Personalisation
            id = settings.Prefix + 'Personalisation';
            element.append('<div id="' + id + '"></div>');
            elements.Personalisation = $('#' + id);

            // Buttons
            id = settings.Prefix + 'ButtonPanel';
            element.append('<div id="' + id + '"></div>');
            elements.ButtonPanel = $('#' + id);

            // Controls
            id = settings.Prefix + 'Controls';
            element.append('<div id="' + id + '"></div>');
            elements.Controls = $('#' + id);

            // Report Error Form
            id = settings.Prefix + 'ReportErrorForm';
            element.append('<div id="' + id + '">' + EmaginationJS_language.ReportErrorContent + '</div>');
            elements.ReportErrorForm = $('#' + id);

            id = settings.Prefix + 'ReportErrorConfirmation';
            element.append('<div id="' + id + '">' + EmaginationJS_language.ReportErrorConfirmationContent + '</div>');
            elements.ReportErrorConfirmation = $('#' + id);

            id = settings.Prefix + 'ReportErrorMessage';
            elements.ReportErrorForm.append('<textarea id="' + id + '" style="resize: vertical;"></textarea>');
            elements.ReportErrorTextbox = $('#' + id);

            id = settings.Prefix + 'ReportErrorSubmit';
            elements.ReportErrorForm.append('<a href="javascript:void(0)" id="' + id + '" class="' + settings.Prefix + 'Btn">' + EmaginationJS_language.ReportErrorSendButtonText + '</a>');
            elements.ReportErrorSubmit = $('#' + id);

            // Personalisation Children
            id = settings.Prefix + 'LoadingOverlay';
            elements.Personalisation.append('<div id="' + id + '"></div>');
            elements.LoadingOverlay = $('#' + id);

            id = settings.Prefix + 'HelpOverlay';
            elements.MainContainer.after('<div id="' + id + '"></div>');
            elements.HelpOverlay = $('#' + id);

            id = settings.Prefix + 'CloseHelp';
            elements.HelpOverlay.append('<a href="javascript:void(0)" id="' + id + '"></a>');
            elements.CloseHelp = $('#' + id);

            id = settings.Prefix + 'LoadingMessage';
            elements.LoadingOverlay.append('<div class="' + id + '">' + EmaginationJS_language.LoadingMessage + '</div>');
            elements.LoadingMessage = $('.' + id);

            if (settings.ShowCanvasNavigation) {
                id = settings.Prefix + 'CanvasNavigation';
                elements.Personalisation.append('<div id="' + id + '"></div>');
                elements.CanvasNavigation = $('#' + id);
            }

            if (settings.ShowButtons) {
                id = settings.Prefix + 'Next';
                elements.Personalisation.append('<div class="' + id + '">' + EmaginationJS_language.NextButtonText + '</div>');

                id = settings.Prefix + 'Previous';
                elements.Personalisation.append('<div class="' + id + '">' + EmaginationJS_language.PreviousButtonText + '</div>');
            }

            elements.NextButton = $('.' + settings.Prefix + 'Next');
            elements.PreviousButton = $('.' + settings.Prefix + 'Previous');

            id = settings.Prefix + 'CanvasContainer';
            elements.Personalisation.append('<div id="' + id + '"></div>');
            elements.CanvasContainer = $('#' + id);

            // Buttons Children
            var buttonClass = settings.Prefix + 'Button';

            id = settings.Prefix + 'HelpButton';
            elements.ButtonPanel.append('<a href="javascript:void(0)" id="' + id + '" class="' + buttonClass + '">' + EmaginationJS_language.HelpButtonText + '</a>');
            elements.HelpButton = $('#' + id);

            id = settings.Prefix + 'PreviewButton';
            elements.ButtonPanel.append('<a href="javascript:void(0)" id="' + id + '" class="' + buttonClass + '">' + EmaginationJS_language.PreviewButtonText + '</a>');
            elements.PreviewButton = $('#' + id);

            id = settings.Prefix + 'ResetButton';
            elements.ButtonPanel.append('<a href="javascript:void(0)" id="' + id + '" class="' + buttonClass + '">' + EmaginationJS_language.ResetButtonText + '</a>');
            elements.ResetButton = $('#' + id);

            if (settings.PreviewGuid !== '') {
                elements.ResetButton.addClass('disabled');
            }

            // Controls Children
            id = settings.Prefix + 'ControlsToolTip';
            elements.Controls.append('<div id="' + id + '"></div>');
            elements.ControlsToolTip = $('#' + id);
            elements.ControlsToolTip.addClass(settings.Prefix + 'ToolTip');

            id = settings.Prefix + 'ControlsPlaceholder';
            elements.Controls.append('<div id="' + id + '">' + EmaginationJS_language.ControlsPlaceholder + '</div>');
            elements.ControlsPlaceholder = $('#' + id);

            if (settings.ShowLayerButtons) {
                id = settings.Prefix + 'LayerButtons';

                var layerButtonsTitle = $('<span class="' + settings.Prefix + 'ControlsTitle">' + EmaginationJS_language.LayerButtonsTitle + '</span>');

                elements.ControlsPlaceholder.prepend('<div id="' + id + '"></div>');
                elements.ControlsPlaceholder.prepend(layerButtonsTitle);

                elements.LayerButtonsContainer = $('#' + id);
                elements.LayerButtonsTitle = layerButtonsTitle;
            }

            id = settings.Prefix + 'TextControls';
            elements.Controls.append('<div id="' + id + '"><span class="' + settings.Prefix + 'ControlsTitle">' + EmaginationJS_language.TextControlsTitle + '</span></div>');
            elements.TextControls = $('#' + id);

            id = settings.Prefix + 'TextContent';
            elements.TextControls.append('<form onsubmit="return false;"><input type="text" id="' + id + '" autocomplete="off" /></form>');
            //elements.TextControls.append('<form onsubmit="return false;"><textarea id="' + _id + '" /></form>');
            elements.TextContent = $('#' + id);

            id = settings.Prefix + 'CharacterCounter';
            elements.TextControls.append('<span id="' + id + '"></span>');
            elements.CharacterCounter = $('#' + id);

            id = settings.Prefix + 'ReportError';
            elements.TextControls.append('<a href="#" id="' + id + '">' + EmaginationJS_language.ReportErrorButtonText + '</a>');
            elements.ReportErrorButton = $('#' + id);

            id = settings.Prefix + 'ImageControls';
            elements.Controls.append('<div id="' + id + '"><span class="' + settings.Prefix + 'ControlsTitle">' + EmaginationJS_language.ImageControlsTitle + '</span></div>');
            elements.ImageControls = $('#' + id);

            id = settings.Prefix + 'ControlsBack';
            elements.ImageControls.prepend('<a href="javascript:void(0)" class="' + settings.Prefix + 'ControlsBack ' + settings.Prefix + 'Btn">' + EmaginationJS_language.ControlsBackButtonText + '</a>');
            elements.TextControls.prepend('<a href="javascript:void(0)" class="' + settings.Prefix + 'ControlsBack ' + settings.Prefix + 'Btn">' + EmaginationJS_language.ControlsBackButtonText + '</a>');
            elements.ControlsBackButton = $('.' + id);

            id = settings.Prefix + 'Dropzone';
            elements.ImageControls.append('<div id="' + id + '" class="' + settings.Prefix + 'Btn">' + EmaginationJS_language.DropzoneText + '</div>');
            elements.Dropzone = $('#' + id);

            id = settings.Prefix + 'LibraryImagesContainer';
            elements.ImageControls.append('<div id="' + id + '"></div>');
            elements.LibraryImagesContainer = $('#' + id);

            id = settings.Prefix + 'NoImages';
            elements.LibraryImagesContainer.append('<div id="' + id + '">' + EmaginationJS_language.NoImagesText + '</div>');
            elements.NoLibraryImages = $('#' + id);
        },

        // Set default styles for static elements
        SetStaticElementDefaults: function () {

            elements.MainContainer
                .add(elements.Personalisation)
                .add(elements.Controls)
                .add(elements.TextContent)
                .add(elements.CanvasContainer)
                .css({
                    '-webkit-box-sizing': 'border-box',
                    '-moz-box-sizing': 'border-box',
                    'box-sizing': 'border-box'
                });

            elements.MainContainer.css({
                'position': 'relative',
                'clear': 'both',
                'overflow': 'hidden'
            });

            elements.Personalisation.css({
                'position': 'relative',
                'height': '100%'
            });

            var controlsMargin = parseFloat(methods.GetCSSValue(elements.Controls, 'margin-top')) + parseFloat(methods.GetCSSValue(elements.Controls, 'margin-bottom'));

            elements.Controls.css({
                'position': 'relative',
                //'overflow-y': 'hidden',
                'height': elements.MainContainer.height() - elements.ButtonPanel.outerHeight(true) - controlsMargin + 'px',
                'box-sizing': 'border-box',
                '-moz-box-sizing': 'border-box',
                '-wekbit-box-sizing': 'border-box'
            });

            if (elements.Controls.outerWidth() >= elements.MainContainer.width()) {
                elements.Controls.outerHeight(elements.MainContainer.height() - elements.Personalisation.outerHeight(true));
            }

            elements.CanvasContainer.css({
                'width': '100%',
                'height': '100%',
                'position': 'relative',
                'visibility': 'hidden'
            });

            elements.TextContent.css('width', '100%');
            elements.CharacterCounter.hide();

            elements.ImageControls
                .add(elements.TextControls)
                .add(elements.ControlsPlaceholder)
                .css({
                    'width': '100%',
                    'height': '100%'
                }).hide();

            //elements.TextControls
            //    .add(elements.ControlsPlaceholder)
            //    .css({
            //        'overflow-y': 'auto'
            //    });

            if (elements.Dropzone != null) {
                elements.Dropzone.css({
                    'cursor': 'pointer'
                });
            }

            if (settings.ShowHelpButton) {
                elements.HelpButton.css({
                    'cursor': 'pointer'
                });
            }

            elements.HelpOverlay.hide().css({
                'position': 'fixed',
                'top': 0,
                'left': 0,
                'width': '100%',
                'height': '100%'
            });

            elements.CloseHelp.css({
                'cursor': 'pointer',
                'display': 'block'
            });

            elements.HelpButton
                .add(elements.PreviewButton)
                .css({
                    'cursor': 'pointer'
                });

            if (settings.ShowCanvasNavigation) {
                elements.CanvasNavigation.css({
                    'position': 'absolute',
                    'top': '0',
                    'left': '0'
                }).hide();
            }

            if (settings.ShowButtons) {
                var next = elements.Personalisation.find(elements.NextButton),
                    previous = elements.Personalisation.find(elements.PreviousButton);

                next.css({
                    'position': 'absolute',
                    'cursor': 'pointer'
                });

                previous.css({
                    'position': 'absolute',
                    'cursor': 'pointer'
                });
            }

            if (elements.NextButton != null)
                elements.NextButton.hide();

            if (elements.PreviousButton != null)
                elements.PreviousButton.hide();

            elements.ControlsPlaceholder.show();

            elements.ControlsToolTip.css({
                'position': 'absolute',
                'display': 'none'
            });

            elements.LoadingOverlay.css({
                'position': 'absolute',
                'top': 0,
                'left': 0,
                'z-index': 999,
                'width': '100%',
                'height': '100%',
                'display': 'block'
            });

            if (elements.LoadingMessage.find('img').length > 0) {
                elements.LoadingMessage.find('img').load(function () {
                    setLoading();
                }).error(function() {
                    setLoading();
                });
            }
            else {
                setLoading();
            }

            function setLoading() {
                elements.LoadingMessage.height(elements.LoadingMessage.height());
                elements.LoadingMessage.css({
                    'display': 'block',
                    'width': '100%',
                    'text-align': 'center',
                    'margin': 'auto',
                    'position': 'absolute',
                    'top': 0,
                    'right': 0,
                    'left': 0,
                    'bottom': 0
                });
            }

            // If container has no height, calculate it from tallest child to wrap contents
            if (elements.MainContainer.height() == 0) {
                if (elements.Personalisation.outerHeight(true) > elements.Controls.outerHeight(true)) {
                    elements.MainContainer.height(elements.Personalisation.outerHeight(true));
                }
                else {
                    elements.MainContainer.height(elements.Controls.outerHeight(true));
                }
            }

            elements.LibraryImagesContainer.css({
                'overflow': 'hidden',
                'overflow-y': 'scroll',
                'height': '100%',
                'box-sizing': 'border-box',
                '-moz-box-sizing': 'border-box',
                '-webkit-box-sizing': 'border-box'
            });

            elements.LayerButtonsTitle.hide();
            elements.ReportErrorForm.hide();
            elements.ReportErrorConfirmation.hide();
        },

        // Get / Create new preview
        PopulateProduct: function () {

            var canvases = [],
                existingPreview = false;

            // Get Personalisation GUID
            var cookie = methods.GetCookie(settings.Prefix + settings.ProductName.split(' ').join('-'));
            
            if (cookie) {
                previewGuid = cookie.guid;
                settings.LayerUpdated = cookie.layerUpdated;
                settings.TextLayersUpdated = cookie.textLayersUpdated;
            }

            //console.log(cookie.guid);

            if (settings.PreviewGuid != '') {
                previewGuid = settings.PreviewGuid;
                existingPreview = true;
            }

            elements.PreviewGuidInput.val(previewGuid);
            elements.CanvasContainer.html('');

            var defaultParams = [];

            $.each(settings.DefaultValues, function (key, value) {
                var obj = {
                    'Key': key,
                    'Value': value
                }

                defaultParams.push(obj);
            });

            // If Personalisation GUID does not exist
            if (previewGuid === '' || previewGuid === null) {

                settings.LayerUpdated = false;
                settings.TextLayersUpdated = false;

                // Create New Preview
                $.post(settings.APIUrl + '/CreateNewPreview', {
                    'authcode': settings.AuthCode,
                    'productname': settings.ProductName,
                    'defaultValues': JSON.stringify({ "Items": defaultParams })
                }, function (data) {

                    var error = methods.GetAJAXError(data);

                    if (error == '') {
                        previewGuid = data.objResult.GUID;
                        elements.PreviewGuidInput.val(previewGuid);
                        methods.SetCookie(settings.Prefix + settings.ProductName.split(' ').join('-'), { guid: previewGuid, layerUpdated: false, textLayersUpdated: false }, 1);
                        
                        var templates = data.objResult.product.ProductTemplates;
                        imageCount = templates.length;

                        $.each(templates, function (index, item) {
                            canvases.push(methods.CreateCanvas(index, item));
                        });
                    }
                    else {
                        methods.FatalError(error);
                    }

                }, "jsonp").error(function (jqXhr, textStatus, errorThrown) {
                    methods.FatalError(errorThrown);
                });

            }
            else {

                if (settings.LayerUpdated) {
                    if (typeof settings.onLayerUpdated === "function") {
                        settings.onLayerUpdated();
                    }
                }

                if (settings.TextLayersUpdated) {
                    if (typeof settings.onTextLayersUpdated === "function") {
                        settings.onTextLayersUpdated();
                    }
                }

                // Get Personalisation Preview from GUID
                $.post(settings.APIUrl + '/GetPreviewData', {
                    'authcode': settings.AuthCode,
                    'guid': previewGuid,
                    'defaultValues': JSON.stringify({ "Items": defaultParams })
                }, function (data) {

                    var error = methods.GetAJAXError(data);

                    if (error == '') {
                        var templates = data.objResult.product.ProductTemplates;
                        imageCount = templates.length;

                        $.each(templates, function (index, item) {
                            canvases.push(methods.CreateCanvas(index, item));
                        });
                    }
                    else {

                        if (!existingPreview) {
                            // If Preview GUID does not exist, create a new preview
                            $.post(settings.APIUrl + '/CreateNewPreview', {
                                'authcode': settings.AuthCode,
                                'productname': settings.ProductName,
                                'defaultValues': JSON.stringify({ "Items": defaultParams })
                            }, function(data) {

                                var error = methods.GetAJAXError(data);

                                if (error == '') {
                                    previewGuid = data.objResult.GUID;
                                    methods.SetCookie(settings.Prefix + settings.ProductName.split(' ').join('-'), { guid: previewGuid, layerUpdated: false, textLayersUpdated: false }, 1);

                                    var templates = data.objResult.product.ProductTemplates;
                                    imageCount = templates.length;

                                    $.each(templates, function(index, item) {
                                        canvases.push(methods.CreateCanvas(index, item));
                                    });
                                } else {
                                    methods.FatalError(error);
                                }

                            }, "jsonp").error(function(jqXhr, textStatus, errorThrown) {
                                methods.FatalError(errorThrown);
                            });
                        } else {
                            methods.FatalError('Preview ' + settings.PreviewGuid + ' cannot be found');
                        }

                    }

                }, "jsonp").error(function (jqXhr, textStatus, errorThrown) {
                    methods.FatalError(errorThrown);
                });

            }
        },

        // Populates canvases to page
        CreateCanvas: function (templateNo, template) {

            var canvasId = settings.Prefix + 'set-' + templateNo;

            elements.CanvasContainer.append('<div id="' + canvasId + '" class="' + settings.Prefix + 'Canvas" data-set-name="' + template.TemplateName + '" data-template-width="' + template.Width + '" data-template-height="' + template.Height + '"></div>');

            var canvas = $('#' + canvasId);

            if (template.Alias != '') {
                canvas.attr('data-alias', template.Alias);
            }

            var scale = 1,
                canvasWidth = template.Width,
                canvasHeight = template.Height;

            scale = (elements.CanvasContainer.width() / canvasWidth);

            canvasWidth = Math.round(canvasWidth * scale);
            canvasHeight = Math.round(canvasHeight * scale);

            canvas.css({
                'position': 'absolute',
                'top': 0,
                'left': 0,

                'box-sizing': 'border-box',
                '-moz-box-sizing': 'border-box',
                '-webkit-box-sizing': 'border-box',

                'width': canvasWidth,
                'height': canvasHeight
            });

            if (settings.ShowLayerButtons) {
                $.each(template.Layers, function(index, layer) {
                    var CanvasLayerButton = $('<a href="javascript:void(0)" data-layer-name="' + layer.LayerName + '" data-template-name="' + $('#' + canvasId).attr('data-set-name') + '"  class="' + settings.Prefix + layer.LayerType + 'Button ' + settings.Prefix + 'Btn">' + (layer.Alias === null || layer.Alias === '' ? layer.LayerName : layer.Alias) + '</a>');
                    elements.LayerButtonsContainer.append(CanvasLayerButton);
                });
            }

            $.post(settings.APIUrl + '/GetPreviewImage', {
                'authcode': settings.AuthCode,
                'guid': previewGuid, //Preview reference GUID
                'templatename': template.TemplateName, // Name of set
                'imagewidth': Math.round(elements.CanvasContainer.width()), //Width of image to return
                'previewwatermark': settings.UseWatermark, //Defines whether image has a preview watermark
                'imagequality': settings.ImageQuality, //Quality of image to return (0-100)
                'imagetype': settings.ImageFormat //Image format to return (jpg, png, gif)
            }, function (data) {

                var error = methods.GetAJAXError(data);

                if (error == '') {

                    var tooltips = [];

                    $.each(template.Layers, function (index, item) {
                        tooltips.push(methods.CreateCanvasLayer(canvasId, item, templateNo));
                    });

                    $.each(tooltips, function(index, item) {
                        canvas.append(item);
                    });

                    var image = new Image;

                    //$('<img alt="" class="' + settings.Prefix + 'PreviewImage" />');
                    $(image).addClass(settings.Prefix + 'PreviewImage');

                    image.onload = function() {
                        imageLoadedCount++;
                    };

                    // onload event must be set before the src
                    image.src = data.objResult;

                    canvas.append(image);
                } else {
                    methods.FatalError(error);
                }

            }, "jsonp").error(function (jqXHR, textStatus, errorThrown) {
                methods.FatalError(errorThrown);
            });

            return canvas;
        },

        // Populates layers to canvas
        CreateCanvasLayer: function (canvasId, layer, templateNo) {
            var layerId = canvasId + '-' + layer.LayerName,
                CanvasLayer = $('<div id="' + layerId + '" data-layer-name="' + layer.LayerName + '" data-width="' + layer.Width + '" data-height="' + layer.Height + '" data-x="' + layer.X + '" data-y="' + layer.Y + '" class="' + settings.Prefix + layer.LayerType + ' ' + settings.Prefix + 'Element"></div>');

            if (layer.Alias != '') {
                CanvasLayer.attr('data-alias', layer.Alias);
            }

            $('#' + canvasId).append(CanvasLayer);

            CanvasLayer.attr('data-layer-data', layer.LayerData);

            var cosRotate = Math.cos(layer.Rotate),
                sinRotate = Math.sin(layer.Rotate);

            // IE Fix, layer cannot be selected if it is empty
            var inner = $('<div class="' + settings.Prefix + 'Inner" style="width:100%; height:100%; font-size:999px; color:transparent; overflow:hidden; box-sizing: border-box; -moz-box-sizing: border-box; -webkit-box-sizing: border-box;">Internet Explorer</div>');
            CanvasLayer.append(inner);

            CanvasLayer.css({
                'position': 'absolute',
                'width': layer.Width,
                'height': layer.Height,
                'left': layer.X,
                'top': layer.Y,
                'cursor': 'pointer',
                'z-index': '1'
            });

            if (layer.Rotate != 0) {
                CanvasLayer.css({
                    '-ms-transform': 'Rotate(' + layer.Rotate + 'deg)',
                    '-moz-transform': 'Rotate(' + layer.Rotate + 'deg)',
                    '-o-transform': 'Rotate(' + layer.Rotate + 'deg)',
                    '-webkit-transform': 'Rotate(' + layer.Rotate + 'deg)',
                    'transform': 'Rotate(' + layer.Rotate + 'deg)',
                    '-ms-filter': '"progid:DXImageTransform.Microsoft.Matrix(M11=' + cosRotate + ', M12=' + -sinRotate + ', M21=' + sinRotate + ', M22=' + cosRotate + ', sizingMethod=\'auto expand\')";'
                });
            }

            var toolTipText = 'Click Here';

            //if (layer.LayerType == 'TextLayer') {
            //toolTipText = 'Click here to select a Text box';
            //}

            if (layer.LayerType == 'TextLayer') {

                if (textLayersToUpdate.indexOf(layer.LayerName) < 0) {
                    textLayersToUpdate.push(layer.LayerName);
                }

                if (layer.CharacterLimit != null) {
                    CanvasLayer.attr('data-character-limit', layer.CharacterLimit);
                }

                // Override help text if language translation exists
                if (EmaginationJS_language.ImageLayerHelpText) {
                    layer.HelpText = EmaginationJS_language.TextLayerHelpText;
                }
            }

            if (layer.LayerType == 'ImageLayer') {
                //toolTipText = 'Click here to select an Image';

                CanvasLayer.attr('data-allow-upload', layer.allowUserUploads);

                if (layer.ImageLibrary.length > 0) {

                    for (var i = 0; i < layer.ImageLibrary.length; i++) {
                        var image = layer.ImageLibrary[i],
                            imageId = settings.Prefix + 'LibraryImage-' + layer.LayerName + '-' + i;

                        var libraryImage = $('<img id="' + imageId + '" src="' + image.ThumbnailUrl + '" data-url="' + image.Url.toLowerCase() + '" alt="" class="' + settings.Prefix + 'LibraryImage" data-layer-id="' + layerId + '" data-layer-name="' + layer.LayerName + '" style="max-width: 100%; cursor: pointer;" />');
                        elements.LibraryImagesContainer.append(libraryImage);

                        if (image.DataValue !== '' && image.DataValue !== undefined) {
                            libraryImage.attr('data-value', image.DataValue);
                        }
                    }
                }

                // Override help text if language translation exists
                if (EmaginationJS_language.ImageLayerHelpText) {
                    layer.HelpText = EmaginationJS_language.ImageLayerHelpText;
                }
            }

            CanvasLayer.attr('data-help-text', layer.HelpText);
            var closetoolTip = $('<a class="' + settings.Prefix + 'CloseToolTip"><i class="fa fa-times"></i></a>');
            var toolTip = $('<div class="' + settings.Prefix + 'ToolTip">' + layer.HelpText + '</div>');

            toolTip.click(function (e) {
                e.preventDefault();
                e.stopPropagation();

                // 25/06/2014
                // Tool tips were covering layers so changed to hide tool tips on click
                //CanvasLayer.click();
                //CanvasLayer.mousedown();
                $(this).hide();

                if (elements.Personalisation.find(elements.ToolTips.filter(':visible')).length == 0) {
                    methods.CloseHelp();
                }
            });

            toolTip.attr('data-layer-id', layerId);
            toolTip.attr('data-x', layer.X);
            toolTip.attr('data-y', layer.Y);

            toolTip.css({
                'position': 'absolute',
                'z-index': parseFloat(CanvasLayer.css('z-index')) + 1,
                'cursor': 'pointer',
                'display': 'none'
            });

            toolTip.prepend(closetoolTip);
            //CanvasLayer.append(toolTip);
            return toolTip;
        },

        // Resizes canvases and shows the first
        ShowPersonalisation: function () {

            reset = false;

            // Populate dynamic objects to vars
            elements.ControlsTitles = $('.' + settings.Prefix + 'ControlsTitle');
            elements.Canvases = $('.' + settings.Prefix + 'Canvas');
            elements.PreviewImages = $('.' + settings.Prefix + 'PreviewImage');
            elements.CanvasElements = $('.' + settings.Prefix + 'Element');
            elements.TextLayers = $('.' + settings.Prefix + 'TextLayer');
            elements.ImageLayers = $('.' + settings.Prefix + 'ImageLayer');

            elements.LayerButtons = $('.' + settings.Prefix + 'TextLayerButton').add('.' + settings.Prefix + 'ImageLayerButton');

            elements.LibraryImages = $('.' + settings.Prefix + 'LibraryImage');
            elements.Help = $('.' + settings.Prefix + 'Help');
            elements.ToolTips = $('.' + settings.Prefix + 'ToolTip');

            // Bind navigation button events
            methods.BindNavButtons();

            if (dropzone == null) {
                // Bind Uploads
                methods.BindUploads();
            }

            // Bind click events
            methods.BindEvents();

            // Resize Canvases
            elements.Canvases.each(function () {
                methods.ResizeCanvas($(this));
            });

            if (elements.CanvasNavigation != null)
                elements.CanvasNavigation.fadeIn(settings.FadeSpeed);

            if (elements.PreviousButton != null)
                elements.PreviousButton.hide();

            if (elements.Canvases.length > 1) {
                if (elements.NextButton != null) {
                    elements.NextButton.show();
                }
            }
            else {
                if (elements.PreviousButton != null) {
                    elements.PreviousButton.hide();
                }
            }

            if (settings.ShowLayerButtons) {
                //var children = elements.LayerButtonsContainer.children();

                //elements.LayerButtonsContainer.html('');
                //children.sort(function(a, b) {
                //    return $(a).text().toUpperCase().localeCompare($(b).text().toUpperCase());
                //}).appendTo(elements.LayerButtonsContainer);

                elements.LayerButtonsContainer.fadeIn(settings.FadeSpeed);
                elements.LayerButtonsTitle.fadeIn(settings.FadeSpeed);
            }

            methods.SelectCanvas(elements.Canvases.first());

            if (settings.AutoHelpPopup) {
                helpTimer = setTimeout(function() {
                    methods.ShowHelp();
                }, settings.HelpTimeout);
            }
        },

        // Binds forms for image uploads
        BindUploads: function () {
            
            try {
                elements.Dropzone.dropzone({
                    url: settings.APIUrl + '/SaveImageToLibrary',
                    addRemoveLinks: false,
                    maxFilesize: 12, // In MB
                    maxFiles: 1,
                    dictMaxFilesExceeded: 'Please upload 1 file at a time.',
                    uploadMultiple: false,
                    createImageThumbnails: false,
                    previewTemplate: '<div class="dz-preview dz-file-preview"><div class="dz-progress"><span class="dz-upload" data-dz-uploadprogress></span></div></div>',
                    init: function () {
                        dropzone = this;
                    },
                    drop: function () {
                        clearTimeout(helpTimer);
                    },
                    accept: function (file, done) {
                        if (elements.Dropzone.attr('disabled')) {
                            done('Please upload 1 file at a time.');
                        }
                        else {
                            done();
                        }
                    },
                    forceFallback: false,
                    fallback: function () {
                        elements.Dropzone.remove();
                        elements.Dropzone = null;
                    },
                    sending: function (file, xhr, formData) {
                        clearTimeout(helpTimer);

                        elements.Dropzone.attr('disabled', 'disabled');
                        methods.ResizeLibraryContainer();

                        formData.append('authcode', settings.AuthCode);
                        formData.append('previewGuid', previewGuid);
                        formData.append('setname', elements.ImageLayers.filter('.active').parents(elements.Canvases).attr('data-set-name'));
                        formData.append('layername', elements.ImageLayers.filter('.active').attr('data-layer-name'));

                        methods.CloseHelp();
                        //elements.LoadingOverlay.show();
                    },
                    success: function (file, data) {

                        if (!reset) {
                            clearTimeout(helpTimer);

                            var error = methods.GetAJAXError(data);

                            if (error == '') {
                                var layername = elements.ImageLayers.filter('.active').attr('data-layer-name'),
                                    layerid = elements.ImageLayers.filter('.active').attr('id'),
                                    image = $('<img src="' + data.objResult[0].ThumbnailUrl + '" data-url="' + data.objResult[0].Url + '" alt="" class="' + settings.Prefix + 'LibraryImage" data-layer-id="' + layerid + '" data-layer-name="' + layername + '" style="max-width: 100%; cursor: pointer; display: none;" />');

                                dropzone.removeFile(file);

                                if (dropzone.getUploadingFiles().length === 0 && dropzone.getQueuedFiles().length === 0) {

                                    $.fancybox.showLoading();

                                    methods.ResizeLibraryContainer();

                                    //elements.LibraryImages.push(image);
                                    //elements.NoLibraryImages.hide();
                                    //methods.FormatLibraryImages(elements.LibraryImages.filter('[data-layer-id=' + layerid + ']').show());

                                    var editorContent = $('<div id="' + settings.Prefix + 'PhotoEditor"></div>'),
                                        cropImage = new Image(),
                                        activeLayer = elements.ImageLayers.filter(':visible.active'),
                                        layerWidth = activeLayer.attr('data-width'),
                                        layerHeight = activeLayer.attr('data-height');

                                    var //rotateLeft = $('<a class="' + settings.Prefix + 'RotateButton" href="#" title="Rotate Left"><i class="fa fa-rotate-left fa-lg"></i></a>'),
                                        //rotateRight = $('<a class="' + settings.Prefix + 'RotateButton" href="#" title="Rotate Right"><i class="fa fa-rotate-right fa-lg"></i></a>'),
                                        cropButton = $('<a class="' + settings.Prefix + 'CropButton ' + settings.Prefix + 'Btn" href="#">' + EmaginationJS_language.CropSaveButtonText + '</a>'),
                                        cancelButton = $('<a class="' + settings.Prefix + 'CropButton ' + settings.Prefix + 'Btn" href="#">' + EmaginationJS_language.CropCancelButtonText + '</a>'),
                                        cropWarning = $('<div class="' + settings.Prefix + 'CropWarning">' + EmaginationJS_language.CropWarning + '</div>');

                                    var cropping = false;

                                    cropImage.onload = function() {

                                        cropImage.onload = null;
                                        var $cropImage = $('.' + settings.Prefix + 'PhotoCrop');

                                        var srcWidth = $cropImage.width(),
                                            srcHeight = $cropImage.height(),
                                            ratio = srcWidth / srcHeight;

                                        // Call resize crop image function then open fancybox
                                        ResizeCropImage(function() {
                                            $.fancybox(editorContent, {
                                                type: 'inline',
                                                scrolling: 'visible',
                                                openSpeed: settings.FadeSpeed,
                                                autoSize: true,
                                                autoCenter: false,
                                                fitToView: false,
                                                autoResize: false,
                                                minWidth: 200,
                                                minHeight: 200,
                                                helpers: {
                                                    overlay: { closeClick: false }
                                                },
                                                afterLoad: function() {
                                                    $.fancybox.showLoading();
                                                },
                                                afterClose: function() {
                                                    elements.Dropzone.removeAttr('disabled');
                                                    editorContent.remove();
                                                }
                                            });

                                            // Initialise cropping
                                            CropInit();
                                        });


                                        var cropResizeTimeout;

                                        $(window).resize(function() {
                                            clearTimeout(cropResizeTimeout);

                                            cropResizeTimeout = setTimeout(function() {
                                                rebindCropper();
                                            }, 500);
                                        });

                                        function rebindCropper() {
                                            ResizeCropImage(function() {
                                                $.fancybox.showLoading();
                                                $cropImage.cropper('destroy');
                                                CropInit();

                                                //$cropImage.cropper('update');

                                                $.fancybox.update();
                                            });
                                        }

                                        cropButton.click(function(e) {
                                            e.preventDefault();

                                            if (!cropping) {
                                                cropping = true;
                                                var cropdata = $cropImage.cropper('getData');

                                                var _x = cropdata.x,
                                                    _y = cropdata.y,
                                                    _w = cropdata.width,
                                                    _h = cropdata.height;

                                                //_x = Math.round(_x * scale);
                                                //_y = Math.round(_y * scale);
                                                //_w = Math.round(_w * scale);
                                                //_h = Math.round(_h * scale);

                                                $.post(settings.APIUrl + '/CropImage', {
                                                    'authcode': settings.AuthCode,
                                                    'previewguid': previewGuid,
                                                    'url': data.objResult[0].Url,
                                                    'x': _x,
                                                    'y': _y,
                                                    'width': _w,
                                                    'height': _h
                                                }, function(data) {

                                                    cropping = false;

                                                    var error = methods.GetAJAXError(data);

                                                    if (error == '') {
                                                        image.attr('src', data.objResult.ThumbnailUrl);
                                                        image.attr('data-url', data.objResult.Url);

                                                        $.fancybox.close();
                                                        elements.Dropzone.removeAttr('disabled');

                                                        elements.NoLibraryImages.after(image);
                                                        methods.BindLibraryImageClick(image);
                                                        elements.LibraryImages = $('.' + settings.Prefix + 'LibraryImage');

                                                        elements.NoLibraryImages.hide();
                                                        methods.FormatLibraryImages(elements.LibraryImages.filter('[data-layer-id=' + layerid + ']').show());

                                                        image.trigger('mousedown');
                                                    } else {
                                                        methods.Error('Image cannot be cropped.');
                                                    }

                                                }, "jsonp");
                                            }
                                        });

                                        cancelButton.click(function(e) {
                                            $.fancybox.close();
                                            elements.Dropzone.removeAttr('disabled');
                                        });

                                        function ResizeCropImage(callback) {

                                            var newWidth = srcWidth,
                                                newHeight = srcHeight;

                                            var minWidth = 300,
                                                minHeight = 300;

                                            var maxWidth = ($(window).width() - 60),
                                                maxHeight = ($(window).height() - 120);

                                            if (srcWidth > maxWidth || srcHeight > maxHeight) {
                                                //resizeByHeight();

                                                if (newWidth > maxWidth) {
                                                    resizeByWidth();
                                                }

                                                if (srcWidth > srcHeight) {
                                                    resizeByWidth();

                                                    if (newHeight > maxHeight) {
                                                        resizeByHeight();
                                                    }
                                                } else {
                                                    resizeByHeight();

                                                    if (newWidth > maxWidth) {
                                                        resizeByWidth();
                                                    }
                                                }
                                            }

                                            if (newWidth < minWidth || newHeight < minHeight) {
                                                if (srcWidth > srcHeight) {
                                                    newHeight = minHeight;
                                                    scale = newHeight / srcHeight;
                                                    newWidth = srcWidth * scale;
                                                } else {
                                                    newWidth = minHeight;
                                                    scale = newWidth / srcWidth;
                                                    newHeight = srcHeight * scale;
                                                }
                                            }

                                            function resizeByWidth() {
                                                newWidth = maxWidth;
                                                scale = newWidth / srcWidth;
                                                newHeight = srcHeight * scale;
                                                //newHeight = 'auto';
                                            }

                                            function resizeByHeight() {
                                                newHeight = maxHeight;
                                                scale = newHeight / srcHeight;
                                                newWidth = srcWidth * scale;
                                                //newWidth = 'auto';
                                            }

                                            $cropImage.css({
                                                'clear': 'both',
                                                'width': newWidth,
                                                'height': newHeight
                                            });

                                            editorContent.css('visibility', 'visible');
                                            editorContent.width(newWidth);
                                            editorContent.height('auto');

                                            if (callback != undefined) {
                                                callback();
                                            }
                                        }

                                        function CropInit() {

                                            $cropImage.cropper({
                                                aspectRatio: layerWidth / layerHeight,
                                                built: function() {
                                                    showWarningMessage();
                                                    $.fancybox.hideLoading();
                                                },
                                                done: function() {
                                                    showWarningMessage();
                                                }
                                            });

                                            function showWarningMessage() {
                                                var cropdata = $cropImage.cropper('getData');
                                                var showWarning = false;

                                                if (cropdata.width < layerWidth) {
                                                    showWarning = true;
                                                }

                                                if (cropdata.height < layerHeight) {
                                                    showWarning = true;
                                                }

                                                if (showWarning) {
                                                    cropWarning.show();
                                                } else {
                                                    cropWarning.hide();
                                                }

                                                $.fancybox.reposition();
                                            }
                                        }
                                    }

                                    // Onload must be set before the src
                                    cropImage.src = data.objResult[0].Url;
                                    cropImage.className = settings.Prefix + 'PhotoCrop';

                                    var cropContainer = $('<div id="' + settings.Prefix + 'CropContainer"></div>');
                                    editorContent.append(cropContainer);
                                    cropContainer.append(cropImage);

                                    editorContent.append(cropWarning.hide());
                                    //editorContent.append(rotateLeft);
                                    //editorContent.append(rotateRight);
                                    editorContent.append(cropButton);
                                    editorContent.append(cancelButton);
                                    editorContent.append('<div style="width:100%; clear: both; height:0px; overflow:hidden;"></div>');

                                    //$(document.body).append(editorContent);

                                    $(document.body).css('overflow', 'visible').append(editorContent.css({
                                        'width': '1px',
                                        'height': '1px',
                                        'overflow': 'hidden',
                                        'visibility': 'hidden'
                                    }));
                                }
                            } else {
                                elements.Dropzone.removeAttr('disabled');
                                dropzone.removeAllFiles();
                                methods.Error(error);
                                elements.LoadingOverlay.fadeOut(settings.FadeSpeed);
                                methods.ResizeLibraryContainer();
                            }
                        }
                    },
                    error: function (file, errorMessage) {
                        elements.Dropzone.removeAttr('disabled');
                        dropzone.removeAllFiles();
                        methods.Error(errorMessage);
                        elements.LoadingOverlay.fadeOut(settings.FadeSpeed);
                        methods.ResizeLibraryContainer();
                    }
                });

                elements.Dropzone.click(function (parameters) {
                    clearTimeout(helpTimer);
                });
            }
            catch (err) {
                try {
                    elements.Dropzone.remove();
                    elements.Dropzone = null;
                }
                catch (err) {
                    // If dropzone has already been removed this will throw an error
                }
            }

        },

        // Resize canvases to fit container
        ResizeCanvas: function (canvas) {
            var _scale = 1;

            var templateHeight = parseFloat(canvas.attr('data-template-height')),
                templateWidth = parseFloat(canvas.attr('data-template-width'));

            ResizeByHeight = function () {
                _scale = elements.CanvasContainer.height() / templateHeight;

                var _canvasWidth = templateWidth * _scale,
                    _canvasHeight = templateHeight * _scale;

                canvas.css({
                    'height': _canvasHeight + 'px',
                    'width': _canvasWidth + 'px',
                    'left': Math.round((elements.Personalisation.width() - _canvasWidth) / 2),
                    'top': 0
                });

                canvas.find(elements.PreviewImages).css({
                    //'width': _canvasWidth + 'px',
                    'width': '100%',
                    'height': '100%',
                    'box-sizing': 'border-box',
                    '-moz-box-sizing': 'border-box',
                    '-webkit-box-sizing': 'border-box'
                });
            };

            ResizeByWidth = function () {
                _scale = elements.CanvasContainer.width() / templateWidth;

                var _canvasWidth = templateWidth * _scale,
                    _canvasHeight = templateHeight * _scale;

                canvas.css({
                    'height': _canvasHeight + 'px',
                    'width': _canvasWidth + 'px',
                    'top': Math.round((elements.Personalisation.height() - _canvasHeight) / 2),
                    'left': 0
                });

                canvas.find(elements.PreviewImages).css({
                    //'height': _canvasHeight + 'px',
                    'height': '100%',
                    'width': '100%',
                    'box-sizing': 'border-box',
                    '-moz-box-sizing': 'border-box',
                    '-webkit-box-sizing': 'border-box'
                });
            };

            ResizeByWidth();

            if (canvas.height() > elements.CanvasContainer.height()) {
                ResizeByHeight();
            }

            canvas.attr('data-scale-factor', _scale);

            canvas.find(elements.CanvasElements).each(function () {
                var _this = $(this);

                var _elementWidth = parseFloat(_this.attr('data-width')),
                    _elementHeight = parseFloat(_this.attr('data-height')),
                    _elementTop = parseFloat(_this.attr('data-y')),
                    _elementLeft = parseFloat(_this.attr('data-x'));

                _elementWidth = _elementWidth * _scale;
                _elementHeight = _elementHeight * _scale;
                _elementTop = _elementTop * _scale;
                _elementLeft = _elementLeft * _scale;

                // Account for borders on elements
                var borderRight = parseFloat(methods.GetCSSValue(_this, 'border-right-width')),
                    borderLeft = parseFloat(methods.GetCSSValue(_this, 'border-left-width')),
                    borderTop = parseFloat(methods.GetCSSValue(_this, 'border-top-width')),
                    borderBottom = parseFloat(methods.GetCSSValue(_this, 'border-bottom-width'));

                _elementWidth = _elementWidth - borderRight;
                _elementHeight = _elementHeight - borderBottom;

                _elementLeft = _elementLeft - borderLeft;
                _elementTop = _elementTop - borderTop;

                // 04/12/13 Add/remove box width to position to account for padding/border/margin on element
                _this.css({
                    'width': _elementWidth,
                    'height': _elementHeight,
                    'left': _elementLeft,
                    'top': _elementTop
                });
            });

            // As Tool tips are positioned relative to layers, they must also be repositioned
            methods.RepositionTooltips(canvas, _scale);
            methods.RepositionControlsTooltip();

            var next = elements.Personalisation.find(elements.NextButton),
                previous = elements.Personalisation.find(elements.PreviousButton);

            var nextTop = next.css('top'),
                previousTop = previous.css('top'),
                nextRight = next.css('right'),
                previousLeft = previous.css('left');

            nextTop = (elements.Personalisation.outerHeight() - next.outerHeight()) / 2;
            previousTop = (elements.Personalisation.outerHeight() - previous.outerHeight()) / 2;

            next.css({
                'top': nextTop
            });

            previous.css({
                'top': previousTop
            });
        },

        // Selects a canvas
        SelectCanvas: function (canvas) {
            if (canvas.length > 0) {

                elements.Canvases.hide();
                canvas.stop(true, true).fadeIn(settings.FadeSpeed);

                var canvasCount = elements.Canvases.length;

                if (elements.NextButton != null && elements.PreviousButton != null) {

                    elements.NextButton.show();
                    elements.PreviousButton.show();

                    if (canvasCount > 1) {
                        if (elements.Canvases.filter(':visible:first').index() == 0) {
                            elements.PreviousButton.hide();
                        }

                        if (elements.Canvases.filter(':visible:first').index() == (canvasCount - 1)) {
                            elements.NextButton.hide();
                        }
                    }
                    else {
                        elements.NextButton.hide();
                        elements.PreviousButton.hide();
                    }

                }

                elements.LoadingOverlay.fadeOut(settings.FadeSpeed);
                //elements.CanvasContainer.fadeIn(settings.FadeSpeed);
                elements.CanvasContainer.css('visibility', 'visible');

                methods.CloseHelp();
            }
        },

        // Binds next/previous buttons and arrow keys to allow navigation between canvases
        BindNavButtons: function () {

            if (elements.NextButton != null) {
                // Next button click
                elements.NextButton.click(function (e) {
                    e.preventDefault();

                    if (!elements.LoadingOverlay.is(':visible')) {
                        if (elements.HelpOverlay.is(':visible')) {
                            methods.CloseHelp(function () {
                                var newCanvas = elements.Canvases.filter(':visible:first').next(elements.Canvases);
                                methods.CloseControls();
                                methods.SelectCanvas(newCanvas);
                                methods.RepositionTooltips(newCanvas);
                            });
                        }
                        else {
                            var newCanvas = elements.Canvases.filter(':visible:first').next(elements.Canvases);
                            methods.CloseControls();
                            methods.SelectCanvas(newCanvas);
                            methods.RepositionTooltips(newCanvas);
                        }
                    }
                });
            }

            if (elements.PreviousButton != null) {
                // Previous button click
                elements.PreviousButton.click(function (e) {
                    e.preventDefault();

                    if (!elements.LoadingOverlay.is(':visible')) {
                        if (elements.HelpOverlay.is(':visible')) {
                            methods.CloseHelp(function () {
                                var newCanvas = elements.Canvases.filter(':visible:first').prev(elements.Canvases);
                                methods.CloseControls();
                                methods.SelectCanvas(newCanvas);
                                methods.RepositionTooltips(newCanvas);
                            });
                        }
                        else {
                            var newCanvas = elements.Canvases.filter(':visible:first').prev(elements.Canvases);
                            methods.CloseControls();
                            methods.SelectCanvas(newCanvas);
                            methods.RepositionTooltips(newCanvas);
                        }
                    }
                });
            }

            if (settings.EnableKeyboardNavigation) {

                $(document).keydown(function (e) {

                    if ($(e.target).is('input, textarea') == false) {

                        if (e.keyCode == 37) { // left arrow key
                            e.preventDefault();

                            // 04/12/13 Cannot use button event in case button does not exist
                            // elements.PreviousButton.click();

                            if (!elements.LoadingOverlay.is(':visible') && !$.fancybox.isOpen) {
                                if (elements.HelpOverlay.is(':visible')) {
                                    methods.CloseHelp(function () {
                                        var newCanvas = elements.Canvases.filter(':visible:first').prev(elements.Canvases);
                                        methods.CloseControls();
                                        methods.SelectCanvas(newCanvas);
                                        methods.RepositionTooltips(newCanvas);
                                    });
                                }
                                else {
                                    var newCanvas = elements.Canvases.filter(':visible:first').prev(elements.Canvases);
                                    methods.CloseControls();
                                    methods.SelectCanvas(newCanvas);
                                    methods.RepositionTooltips(newCanvas);
                                }
                            }

                        }
                        else if (e.keyCode == 39) { // right arrow key
                            e.preventDefault();

                            // 04/12/13 Cannot use button event in case button does not exist
                            // elements.NextButton.click();

                            if (!elements.LoadingOverlay.is(':visible') && !$.fancybox.isOpen) {
                                if (elements.HelpOverlay.is(':visible')) {
                                    methods.CloseHelp(function () {
                                        var newCanvas = elements.Canvases.filter(':visible:first').next(elements.Canvases);
                                        methods.CloseControls();
                                        methods.SelectCanvas(newCanvas);
                                        methods.RepositionTooltips(newCanvas);
                                    });
                                }
                                else {
                                    var newCanvas = elements.Canvases.filter(':visible:first').next(elements.Canvases);
                                    methods.CloseControls();
                                    methods.SelectCanvas(newCanvas);
                                    methods.RepositionTooltips(newCanvas);
                                }
                            }
                        }
                    }
                });
            }
        },

        // Binds click events to elements
        BindEvents: function () {

            elements.ImageLayers.each(function () {

                var _this = $(this);

                _this.mousedown(function () {

                    if (settings.AutoHelpPopup) {
                        clearTimeout(helpTimer);
                        helpTimer = setTimeout(function() {
                            methods.ShowHelp();
                        }, settings.HelpTimeout);
                    }

                    methods.CloseControls();
                    _this.addClass('active').css('z-index', '0');

                    var libraryImages = elements.LibraryImages.removeClass('active').hide().filter('[data-layer-id=' + _this.attr('id') + ']'),
                        layer = $('#' + libraryImages.first().attr('data-layer-id'));

                    if (libraryImages.length > 0) {
                        elements.NoLibraryImages.hide();

                        var layerData = layer.attr('data-layer-data').toLowerCase();
                        layerData = layerData.replace('http', '');
                        layerData = layerData.replace('https', '');

                        //libraryImages.filter('[data-url="' + layerData + '"]').show().first().addClass('active');
                        libraryImages.filter('[data-url="' + 'http' + layerData + '"]').show().first().addClass('active');
                        libraryImages.filter('[data-url="' + 'https' + layerData + '"]').show().first().addClass('active');

                        methods.FormatLibraryImages(libraryImages);
                        elements.ImageControls.show();
                    }
                    else {
                        elements.NoLibraryImages.show();
                        elements.ImageControls.show();
                    }

                    if (_this.attr('data-allow-upload') == 'true' && elements.Dropzone != null) {
                        elements.Dropzone.show();
                    }

                    var alias = _this.attr('data-alias');

                    elements.ControlsToolTip.text('Choose an image to use here');

                    if (alias) {
                        elements.ImageControls.find(elements.ControlsTitles).text('Choose ' + methods.FormatArticle(alias) + ' ' + alias);
                    }

                    if (elements.HelpOverlay.is(':visible') && elements.HelpOverlay.is(':animated') === false) {
                        elements.ControlsToolTip.fadeIn(settings.FadeSpeed);
                    }

                    elements.ControlsPlaceholder.hide();

                    // Closes associated tool tip on layer click
                    //elements.ToolTips.filter('[data-layer-id=' + _this.attr('id') + ']').hide();
                    //if (elements.Personalisation.find(elements.ToolTips.filter(':visible')).length == 0) {
                    //    methods.CloseHelp();
                    //}

                    // Must be after elements.ImageControls.show() or .position() will not work
                    methods.ResizeLibraryContainer();
                    methods.RepositionControlsTooltip();

                });
            });

            elements.TextLayers.each(function () {

                var _this = $(this);

                _this.mousedown(function () {

                    if (settings.AutoHelpPopup) {
                        clearTimeout(helpTimer);
                        helpTimer = setTimeout(function() {
                            methods.ShowHelp();
                        }, settings.HelpTimeout);
                    }

                    methods.CloseControls();

                    elements.TextContent.attr('data-layer-name', _this.attr('data-layer-name'));

                    if (!settings.LayerUpdated) {
                        elements.TextContent.val('');
                        elements.TextContent.attr('placeholder', _this.attr('data-layer-data'));
                    } else {
                        elements.TextContent.val(_this.attr('data-layer-data'));
                    }

                    elements.ControlsToolTip.text('Change your text here');

                    var alias = _this.attr('data-alias');

                    if (alias) {
                        elements.TextControls.find(elements.ControlsTitles).text('Edit your ' + alias);
                    }

                    if (elements.HelpOverlay.is(':visible') && elements.HelpOverlay.is(':animated') === false) {
                        elements.ControlsToolTip.fadeIn(settings.FadeSpeed);
                    }

                    if (_this.attr('data-character-limit')) {
                        var characterLimit = parseFloat(_this.attr('data-character-limit'));

                        if (characterLimit > 0) {
                            var remaining = (characterLimit - elements.TextContent.val().length);

                            if (remaining == 0) {
                                elements.CharacterCounter.addClass('limit');
                            }

                            elements.CharacterCounter.text(remaining + ' character' + (remaining == 1 ? '' : 's') + ' remaining').show();
                        }
                    }

                    _this.addClass('active').css('z-index', '0');

                    elements.TextControls.show();
                    elements.ControlsPlaceholder.hide();
                    
                    // Closes associated tool tip on layer click
                    //elements.ToolTips.filter('[data-layer-id=' + _this.attr('id') + ']').hide();
                    //if (elements.Personalisation.find(elements.ToolTips.filter(':visible')).length == 0) {
                    //    methods.CloseHelp();
                    //}

                    methods.RepositionControlsTooltip();
                    elements.TextContent.focus();

                });
            });

            elements.LibraryImages.each(function () {
                methods.BindLibraryImageClick($(this));
            });

            elements.TextContent.on('keydown', function (e) {
                clearTimeout(helpTimer);
                textContentLength = elements.TextContent.val().length;
            });

            elements.TextContent.on('keyup paste', function (e) {
                var _this = $(this);

                function UpdateLayer() {

                    var textLayer = elements.TextLayers.filter('[data-layer-name=' + _this.attr('data-layer-name') + ']'),
                        oldText = textLayer.attr('data-layer-data');

                    clearTimeout(typingTimer);
                    clearTimeout(helpTimer);

                    typingTimer = setTimeout(function () {

                        var selectedCanvas = elements.Canvases.filter(':visible:first'),
                            layerText = _this.val();

                        elements.TextContent.attr('disabled', 'disabled');
                        elements.LoadingOverlay.fadeIn(settings.FadeSpeed);

                        //var entityMap = {
                        //    "&": "&amp;",
                        //    "<": "&lt;",
                        //    ">": "&gt;",
                        //    "£": "&pound;"
                        //};

                        //function htmlEncode(string) {
                        //    return String(string).replace(/[&<>£]/g, function (s) {
                        //        return entityMap[s];
                        //    });
                        //}

                        function htmlEncode(s) {
                            var el = document.createElement("div");
                            el.innerText = el.textContent = s;
                            s = el.innerHTML;
                            return s;
                        }

                        $.post(settings.APIUrl + '/UpdateLayerInPreview', {
                            'authcode': settings.AuthCode,
                            'guid': previewGuid, // Preview reference GUID
                            'templatename': selectedCanvas.attr('data-set-name'), // Name of set
                            'layername': _this.attr('data-layer-name'), // Name of layer to update
                            'layerdata': encodeURIComponent(layerText) // Data to insert
                        }, function (data) {

                            if (!reset) {
                                elements.LoadingOverlay.fadeIn(settings.FadeSpeed);
                                var error = methods.GetAJAXError(data);

                                if (error == '') {
                                    if (textLayersUpdated.indexOf(_this.attr('data-layer-name')) < 0) {
                                        textLayersUpdated.push(_this.attr('data-layer-name'));
                                    }

                                    if (textLayersUpdated.sort().join(',') === textLayersToUpdate.sort().join(',')) {
                                        settings.TextLayersUpdated = true;
                                    }

                                    settings.LayerUpdated = true;

                                    textLayer.attr('data-layer-data', _this.val());

                                    methods.LoadPreviewImage(selectedCanvas, previewGuid, function() {
                                        textLayer.attr('data-layer-data', oldText);
                                        _this.val(oldText);
                                    });
                                } else {
                                    textLayer.attr('data-layer-data', oldText);
                                    _this.val(oldText);
                                    elements.TextContent.removeAttr('disabled');
                                    _this.focus();
                                    elements.LoadingOverlay.fadeOut(settings.FadeSpeed);
                                    methods.Error('Layer could not be updated');
                                }
                            }

                        }, "jsonp").error(function (jqXHR, textStatus, errorThrown) {

                            textLayer.attr('data-layer-data', oldText);
                            _this.val(oldText);
                            elements.TextContent.removeAttr('disabled');
                            _this.focus();
                            elements.LoadingOverlay.fadeOut(settings.FadeSpeed);
                            methods.Error(errorThrown);
                        });

                    }, settings.LoadInterval);
                }

                if (e.keyCode == 13) {
                    // If go/enter button is pressed on iPad, blurring the text box will hide the keyboard
                    e.preventDefault();
                    elements.TextContent.blur();
                    //UpdateLayer();
                }
                else {
                    if (elements.TextContent.val().length !== textContentLength) {
                        var selectedLayer = elements.TextLayers.filter('.active:visible');

                        if (selectedLayer.attr('data-character-limit')) {
                            var characterLimit = parseFloat(selectedLayer.attr('data-character-limit'));

                            if (_this.val().length > characterLimit) {
                                _this.val(_this.val().substring(0, characterLimit));
                            }
                            else {
                                UpdateLayer();
                            }

                            var remaining = (characterLimit - _this.val().length);

                            if (remaining == 0) {
                                elements.CharacterCounter.addClass('limit');
                            }
                            else {
                                elements.CharacterCounter.removeClass('limit');
                            }

                            elements.CharacterCounter.text(remaining + ' character' + (remaining == 1 ? '' : 's') + ' remaining');
                        }
                        else {
                            UpdateLayer();
                        }
                    }
                }
            });

            elements.Help.add(elements.HelpButton).click(function (e) {
                e.preventDefault();

                if (!$('#fancybox-loading').is(':visible') && !$('.fancybox-overlay').is(':visible')) {
                    if (elements.HelpOverlay.is(':visible')) {
                        methods.CloseHelp();
                    }
                    else {
                        methods.ShowHelp();
                    }
                }
            });

            elements.PreviewButton.click(function (e) {

                clearTimeout(helpTimer);

                function showPreview() {
                    methods.CloseControls();
                    methods.CloseHelp(function () {

                        $.fancybox.showLoading();

                        $.post(settings.APIUrl + '/GetPreviewImage', {
                            'authcode': settings.AuthCode,
                            'guid': previewGuid, //Preview reference GUID
                            'templatename': elements.Canvases.filter(':visible').attr('data-set-name'), // Name of set
                            'imagewidth': settings.PreviewImageWidth, //Width of image to return
                            'previewwatermark': settings.UseWatermark, //Defines whether image has a preview watermark
                            'imagequality': settings.ImageQuality, //Quality of image to return (0-100)
                            'imagetype': settings.ImageFormat //Image format to return (jpg, png, gif)
                        }, function (data) {

                            if (!reset) {
                                var error = methods.GetAJAXError(data);

                                if (error == '') {

                                    $.fancybox(data.objResult, {
                                        type: 'image',
                                        openSpeed: settings.FadeSpeed,
                                        afterClose: function() {
                                            if (settings.AutoHelpPopup) {
                                                clearTimeout(helpTimer);
                                                helpTimer = setTimeout(function() {
                                                    methods.ShowHelp();
                                                }, settings.HelpTimeout);
                                            }
                                        }
                                    });

                                } else {
                                    e.preventDefault();
                                }
                            }

                        }, "jsonp").error(function (jqXHR, textStatus, errorThrown) {
                            e.preventDefault();
                        });
                    });
                }

                if (elements.LoadingOverlay.is(':visible')) {
                    $.fancybox.showLoading();

                    setTimeout(function () {
                        showPreview();
                    }, settings.LoadInterval);
                }
                else {
                    showPreview();
                }

            });

            elements.CloseHelp.click(function () {
                clearTimeout(helpTimer);
                methods.CloseHelp();
            });

            elements.ReportErrorButton.click(function (e) {

                e.preventDefault();

                $.fancybox.open(elements.ReportErrorForm);

                //$.post(settings.APIUrl + '/ReportError', {
                //    'authcode': settings.AuthCode,
                //    'previewguid': previewGuid
                //});

            });

            elements.ReportErrorSubmit.click(function (e) {

                e.preventDefault();

                $.post(settings.APIUrl + '/ReportError', {
                    'authcode': settings.AuthCode,
                    'previewguid': previewGuid,
                    'message': elements.ReportErrorTextbox.val(),
                    'personalisationtext': elements.TextContent.val()
                }, function() {

                    if (!reset) {
                        elements.ReportErrorTextbox.val('');

                        $.fancybox.close();
                        $.fancybox.open(elements.ReportErrorConfirmation);

                        setTimeout(function() {
                            $.fancybox.close();
                        }, 4000);
                    }

                }, "jsonp");

            });

            elements.LayerButtons.each(function () {
                var _this = $(this);

                _this.click(function (e) {
                    e.preventDefault();
                    e.stopPropagation();

                    if (!elements.LoadingOverlay.is(':visible')) {
                        var layerName = _this.attr('data-layer-name');
                        var templateName = _this.attr('data-template-name');

                        //console.log(elements.TextLayers.add(elements.ImageLayers).find('[data-layer-name="' + layerName + '"]'));
                        //elements.TextLayers.add(elements.ImageLayers).find('[data-layer-name="' + layerName + '"]').mousedown();

                        methods.SelectCanvas(elements.Canvases.filter('[data-set-name="' + templateName + '"]'));
                        $('[data-layer-name="' + layerName + '"]', elements.Canvases).trigger('mousedown');
                    }
                });
            });

            elements.MainContainer.find('.fa, .label').click(function (e) {
                e.preventDefault();
                e.stopPropagation();
                $(this).parent().click();
            });

            elements.ControlsBackButton.click(function(e) {
                e.preventDefault();
                methods.CloseControls();
                methods.CloseHelp();
            });

            $(document).click(function (e) {

                var close = true,
                    target = $(e.target);

                //if (target.parents().index(elements.Personalisation) > -1) {
                //    close = true;
                //}

                if (target.parents().index(elements.CanvasContainer) > -1) {
                    close = false;
                }

                if (target.parents().index(elements.ButtonPanel) > -1) {
                    close = false;
                }

                if (target.parents().index(elements.Controls) > -1) {
                    close = false;
                }

                if (target.parents().index(elements.LayerButtonsContainer) > -1) {
                    close = false;
                }
               
                if (target.is('.fa')) {
                    close = false;
                }

                if (target.is('.label')) {
                    close = false;
                }

                if (target.is('input[type=file]')) {
                    close = false;
                }

                if (elements.LoadingOverlay.is(':visible')) {
                    close = false;
                }

                if ($('.fancybox-overlay').is(':visible')) {
                    close = false;
                }

                if (close) {
                    clearTimeout(helpTimer);
                    methods.CloseHelp();
                    methods.CloseControls();
                }
            });

        },

        // Binds click event to library images - This method must be kept separate to be bound to any new images added
        BindLibraryImageClick: function (libraryImage) {
            libraryImage.mousedown(function () {

                if (!elements.LoadingOverlay.is(':visible')) {
                    clearTimeout(helpTimer);

                    var _this = $(this),
                        activeImage = elements.LibraryImages.filter('.active');

                    elements.LoadingOverlay.fadeIn(settings.FadeSpeed);
                    elements.LibraryImages.removeClass('active');
                    _this.addClass('active');

                    clearTimeout(clickTimer);

                    clickTimer = setTimeout(function() {

                        var selectedCanvas = elements.Canvases.filter(':visible:first'),
                            layerText = _this.attr('data-url'),
                            oldData = $('#' + _this.attr('data-layer-id')).attr('data-layer-data');

                        $.post(settings.APIUrl + '/UpdateLayerInPreview', {
                            'authcode': settings.AuthCode,
                            'guid': previewGuid, // Preview reference GUID
                            'templatename': selectedCanvas.attr('data-set-name'), // Name of set
                            'layername': _this.attr('data-layer-name'), // Name of layer to update
                            'layerdata': layerText // Data to insert
                        }, function(data) {

                            if (!reset) {
                                $('#' + _this.attr('data-layer-id')).attr('data-layer-data', layerText);
                                elements.LoadingOverlay.fadeIn(settings.FadeSpeed);
                                var error = methods.GetAJAXError(data);

                                if (error == '') {
                                    settings.LayerUpdated = true;

                                    methods.LoadPreviewImage(selectedCanvas, previewGuid, function() {
                                        $('#' + _this.attr('data-layer-id')).attr('data-layer-data', oldData);
                                        elements.LibraryImages.removeClass('active');
                                        activeImage.addClass('active');
                                    });
                                } else {
                                    $('#' + _this.attr('data-layer-id')).attr('data-layer-data', oldData);
                                    elements.LibraryImages.removeClass('active');
                                    activeImage.addClass('active');

                                    elements.LoadingOverlay.fadeOut(settings.FadeSpeed);
                                    methods.Error('Layer could not be updated');
                                }
                            }

                        }, "jsonp").error(function (jqXHR, textStatus, errorThrown) {

                            $('#' + _this.attr('data-layer-id')).attr('data-layer-data', oldData);
                            elements.LibraryImages.removeClass('active');
                            activeImage.addClass('active');

                            elements.LoadingOverlay.fadeOut(settings.FadeSpeed);
                            methods.Error(errorThrown);
                        });

                    }, settings.LoadInterval);
                }

            });
        },

        // Loads preview for a specified canvas
        LoadPreviewImage: function (canvas, previewGuid, errorFunction) {

            elements.LoadingOverlay.fadeIn(settings.FadeSpeed);

            var dateStart = methods.GetCurrentDateTime();

            $.post(settings.APIUrl + '/GetPreviewImage', {
                'authcode': settings.AuthCode,
                'guid': previewGuid, //Preview reference GUID
                'templatename': canvas.attr('data-set-name'), // Name of set
                'imagewidth': Math.round(elements.CanvasContainer.width()), //Width of image to return
                'previewwatermark': settings.UseWatermark, //Defines whether image has a preview watermark
                'imagequality': settings.ImageQuality, //Quality of image to return (0-100)
                'imagetype': settings.ImageFormat //Image format to return (jpg, png, gif)
            }, function (data) {

                if (!reset) {
                    var error = methods.GetAJAXError(data);

                    if (error == '') {
                        canvas.find(elements.PreviewImages).attr('src', data.objResult);
                        canvas.find(elements.PreviewImages).one('load', function() {
                            methods.CloseHelp();
                            elements.LoadingOverlay.fadeOut(settings.FadeSpeed);
                            elements.TextContent.removeAttr('disabled').focus();

                            clearTimeout(helpTimer);

                            if (settings.ResponseTracking) {
                                var dateEnd = methods.GetCurrentDateTime();

                                $.post(settings.APIUrl + '/SubmitResponseTime', {
                                    'start': dateStart,
                                    'finish': dateEnd,
                                    'authcode': settings.AuthCode,
                                    'method': 'GetPreviewImage',
                                    'guid': previewGuid,
                                    'templatename': canvas.attr('data-set-name'),
                                    'imagewidth': canvas.width(),
                                    'imagequality': settings.ImageQuality,
                                    'imagetype': settings.ImageFormat
                                }, function() {
                                    // Done
                                });
                            }

                            if (settings.LayerUpdated || settings.TextLayersUpdated) {
                                if (settings.LayerUpdated) {
                                    if (typeof settings.onLayerUpdated === "function") {
                                        settings.onLayerUpdated();
                                    }
                                }

                                if (settings.TextLayersUpdated) {
                                    if (typeof settings.onTextLayersUpdated === "function") {
                                        settings.onTextLayersUpdated();
                                    }
                                }

                                methods.SetCookie(settings.Prefix + settings.ProductName.split(' ').join('-'), { guid: previewGuid, layerUpdated: settings.LayerUpdated, textLayersUpdated: settings.TextLayersUpdated }, 1);
                            }
                        });
                    } else {

                        if (errorFunction != undefined) {
                            errorFunction();
                        }

                        elements.LoadingOverlay.fadeOut(settings.FadeSpeed);
                        methods.Error('Preview could not be loaded');

                    }
                }

            }, "jsonp").error(function (jqXHR, textStatus, errorThrown) {

                if (errorFunction != undefined) {
                    errorFunction();
                }

                elements.LoadingOverlay.fadeOut(settings.FadeSpeed);
                methods.Error(errorThrown);

            });
        },

        // Formats library images to ensure they are the correct size
        FormatLibraryImages: function (libraryImages) {

            var imageCount = libraryImages.length;

            if (imageCount > 0) {

                //libraryImages.css({
                //    'margin': 'auto',
                //    'border': ''
                //});

                var activeImage = libraryImages.filter('.active');

                libraryImages.each(function (i) {
                    var _this = $(this);

                    var percentageMargin = 2;

                    _this.css({
                        'display': 'block',
                        //'float': 'left',
                        //'width': (50 - percentageMargin) + '%',
                        //'margin-right': percentageMargin + '%',
                        //'box-sizing': 'border-box',
                        //'-moz-box-sizing': 'border-box',
                        //'-webkit-box-sizing': 'border-box'
                    });

                    //if (imageCount % 2 == 0) {
                    //    // Even count
                    //    if (i >= (imageCount - 2)) {
                    //        _this.css('margin-bottom', '0');
                    //    }
                    //    else {
                    //        _this.css('margin-bottom', percentageMargin + '%');
                    //    }
                    //}
                    //else {
                    //    // Odd count
                    //    if (i == (imageCount - 1)) {
                    //        _this.css('margin-bottom', '0');
                    //    }
                    //    else {
                    //        _this.css('margin-bottom', percentageMargin + '%');
                    //    }
                    //}
                });
            }

        },

        // Resizes library image container height to fit in parent div
        ResizeLibraryContainer: function () {
            elements.LibraryImagesContainer.css({
                'max-height': (elements.ImageControls.height() - (elements.LibraryImagesContainer.position().top - elements.LibraryImagesContainer.parent().position().top)) + 'px'
            });
        },

        // Closes help overlay and tool tips
        CloseHelp: function (callback) {
            elements.HelpButton.html(EmaginationJS_language.HelpButtonText);
            elements.HelpButton.attr('title', 'Help');
            elements.ToolTips.fadeOut(settings.HelpFadeSpeed);
            elements.HelpOverlay.fadeOut(settings.HelpFadeSpeed, function () {
                elements.MainContainer.css('z-index', 'auto');

                if (callback != undefined) {
                    callback();
                }
            });
        },

        // Shows help overlay and tool tips
        ShowHelp: function () {
            elements.HelpOverlay.fadeIn(settings.HelpFadeSpeed);
            elements.HelpButton.attr('title', 'Close Help');
            elements.ToolTips.not(elements.ControlsToolTip).fadeIn(settings.HelpFadeSpeed);
            elements.HelpButton.html(EmaginationJS_language.CloseHelpText);

            elements.MainContainer.css('z-index', elements.HelpOverlay.css('z-index') + 1);
            elements.CloseHelp.css('z-index', elements.MainContainer.css('z-index') + 1);

            if (elements.TextLayers.add(elements.ImageLayers).filter('.active:visible').length > 0) {
                elements.ControlsToolTip.fadeIn(settings.FadeSpeed);
            }

            methods.RepositionControlsTooltip();
        },

        // Closes all controls on the page and sets to default
        CloseControls: function () {

            if (elements.LoadingOverlay.is(':visible') == true) {

                setTimeout(function () {

                    elements.CanvasElements.removeClass('active').css('z-index', '1');

                    elements.LibraryImagesContainer.find('.' + settings.Prefix + 'Clear').remove();

                    elements.TextContent.val('');
                    elements.TextContent.attr('data-layer-name', '');
                    elements.CharacterCounter.text('').hide().removeClass('limit');

                    elements.TextControls.find(elements.ControlsTitles).text(settings.TextControlsTitle);
                    elements.ImageControls.find(elements.ControlsTitles).text(settings.ImageControlsTitle);

                    if (elements.UploadImages != null) {
                        elements.UploadImages.remove();
                    }

                    elements.LibraryImages.removeClass('active').hide();
                    elements.NoLibraryImages.hide();
                    elements.TextControls.hide();
                    elements.ImageControls.hide();
                    elements.ControlsPlaceholder.show();

                    if (elements.Dropzone != null) {
                        elements.Dropzone.hide();
                    }

                }, settings.DoneTypingInterval);

            }
            else {

                elements.CanvasElements.removeClass('active').css('z-index', '1');

                elements.LibraryImagesContainer.find('.' + settings.Prefix + 'Clear').remove();

                elements.TextContent.val('');
                elements.TextContent.attr('data-layer-name', '');
                elements.CharacterCounter.text('').hide().removeClass('limit');

                elements.TextControls.find(elements.ControlsTitles).text(settings.TextControlsTitle);
                elements.ImageControls.find(elements.ControlsTitles).text(settings.ImageControlsTitle);

                if (elements.UploadImages != null) {
                    elements.UploadImages.remove();
                }

                elements.LibraryImages.removeClass('active').hide();
                elements.NoLibraryImages.hide();
                elements.TextControls.hide();
                elements.ImageControls.hide();
                elements.ControlsPlaceholder.show();

                if (elements.Dropzone != null) {
                    elements.Dropzone.hide();
                }

            }
        },

        // Takes XHR data and checks for error message
        GetAJAXError: function (data) {
            if (data == null) {
                return 'Data is null';
            }

            if (data.objResult == null) {
                return 'Data.objResult is null';
            }

            if (data.objResult.ErrorMessage != null) {
                return data.objResult.ErrorMessage;
            }
            else {
                return '';
            }
        },

        // Handles non-breaking errors and shows message to user
        Error: function (errorMessage) {
            if (typeof settings.onError === "function" && settings.onError != null) {
                settings.onError(errorMessage);
            } else {
                alert(errorMessage);
                $.error(errorMessage);
            }
        },

        // Handles breaking errors and shows message to user
        FatalError: function (errorMessage) {
            elements.LoadingOverlay.hide();

            if (typeof settings.onFatalError === "function" && settings.onFatalError != null) {
                settings.onFatalError(errorMessage);
            } else {
                if (elements.Personalisation.find('.' + settings.Prefix + 'Error').length == 0) {
                    elements.Personalisation.prepend('<div class="' + settings.Prefix + 'Error">' + EmaginationJS_language.GenericError + '</div>');
                }

                var errorDiv = $('.' + settings.Prefix + 'Error'),
                    marginTop = (elements.Personalisation.height() - errorDiv.outerHeight(true)) / 2;

                if (errorDiv.css('top') == 'auto' && methods.GetCSSValue(errorDiv, 'margin-top') == 0) {
                    errorDiv.css({
                        'margin-top': marginTop
                    });
                }

                $.error(errorMessage);
            }
        },

        // Gets the css value of a DOM element, without suffix (px)
        GetCSSValue: function (_element, cssProperty) {
            var css = _element.css(cssProperty);

            try {
                if (css != undefined) {
                    return css.replace(/[^-\d\.]/g, '');
                }
                else {
                    return '';
                }
            }
            catch (e) {
                return '';
            }
        },

        // Repositions controls tool tip
        RepositionControlsTooltip: function() {
            var titleHeight = elements.ControlsTitles.filter(':visible').outerHeight(true);

            if (titleHeight !== null) {

                var controlsToolTipTop = (parseFloat(methods.GetCSSValue(elements.Controls, 'padding-top')) + titleHeight);
                controlsToolTipTop = (controlsToolTipTop - elements.ControlsToolTip.outerHeight());

                elements.ControlsToolTip.css({
                    'max-width': elements.ControlsToolTip.parent().width(),
                    'top': controlsToolTipTop + 'px',
                    'left': methods.GetCSSValue(elements.Controls, 'padding-left') + 'px'
                });
            }
        },

        RepositionTooltips: function (_canvas, scale) {

            _canvas.find(elements.ToolTips).each(function (i) {
                var _thisToolTip = _canvas.find(elements.ToolTips).eq(i);

                var _toolTipTop = parseFloat(_thisToolTip.attr('data-y')),
                    _toolTipLeft = parseFloat(_thisToolTip.attr('data-x'));

                if (scale !== undefined) {
                    _toolTipTop = _toolTipTop * scale;
                    _toolTipLeft = _toolTipLeft * scale;
                }
                else {
                    var newscale = _canvas.attr('data-scale-factor');

                    if (newscale !== undefined) {
                        _toolTipTop = _toolTipTop * newscale;
                        _toolTipLeft = _toolTipLeft * newscale;
                    }
                }

                var layer = $('#' + _thisToolTip.attr('data-layer-id'));

                _thisToolTip.css({
                    'max-width': layer.width()
                });

                _toolTipTop = _toolTipTop - _thisToolTip.outerHeight(true);
                _toolTipTop = _toolTipTop - methods.GetCSSValue(_thisToolTip, 'border-bottom-width');

                _thisToolTip.css({
                    'left': _toolTipLeft,
                    'top': _toolTipTop
                });
            });

        },

        // Sets a cookie to document.cookie for a specified number of days
        SetCookie: function (name, value, days) {
            if (days) {
                var date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                var expires = "; expires=" + date.toGMTString();
            }
            else var expires = "";

            document.cookie = name + "=" + JSON.stringify(value) + expires + "; path=/";
        },

        // Returns value of a cookie
        GetCookie: function (name) {
            var nameEQ = name + "=";
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) == 0) return JSON.parse(c.substring(nameEQ.length, c.length));
            }
            return null;
        },

        // Returns preview guid for Product Name
        GetPreviewGuid: function () {
            return elements.PreviewGuidInput.val();
        },

        // Removes a cookie from document.cookie
        DeleteCookie: function (name) {
            methods.SetCookie(name, "", -1);
        },

        // Delete Preview and reset to default
        DeletePreview: function (productName) {
            var cookieName = settings.Prefix + productName.split(' ').join('-');
            methods.DeleteCookie(cookieName);
        },

        Reset: function () {
            reset = true;

            methods.CloseControls();
            methods.CloseHelp();
            methods.DeletePreview(settings.ProductName);
        
            elements.MainContainer.children().unbind();
            elements.MainContainer.html('');
            elements.HelpOverlay.remove();

            typingTimer = undefined;
            clickTimer = undefined;
            helpTimer = undefined;
            previewGuid = undefined;
            imageCount = 0;
            imageLoadedCount = 0;
            textContentLength = undefined;
            settings.LayerUpdated = false;
            settings.TextLayersUpdated = false;

            if (typeof settings.onReset === "function") {
                settings.onReset();
            }

            methods.init({}, elements.MainContainer);
            methods.BindUploads();
        },

        // Returns current datetime string, format: d/M/yyyy H:m:s:fff
        GetCurrentDateTime: function () {
            var currentDateTime = new Date(),
                milliseconds = currentDateTime.getMilliseconds();

            if (milliseconds.toString().length < 3) {
                milliseconds += '0';
            }

            if (milliseconds.toString().length < 3) {
                milliseconds += '0';
            }

            return currentDateTime.getDate() + '/' + (currentDateTime.getMonth() + 1) + '/' + currentDateTime.getFullYear() + ' ' + currentDateTime.getHours() + ':' + currentDateTime.getMinutes() + ':' + currentDateTime.getSeconds() + ':' + milliseconds;
        },

        // Returns true if browser is Internet Explorer
        isIE: function () {
            var myNav = navigator.userAgent.toLowerCase();
            return (myNav.indexOf('msie') != -1 || myNav.indexOf('trident') != -1) ? true : false;
        },

        GetIEVersion: function() {
            var myNav = navigator.userAgent.toLowerCase();
            return (myNav.indexOf('msie') != -1) ? parseInt(myNav.split('msie')[1]) : false;
        },

        // Accepts a string and outputs the correct article (a or an)
        FormatArticle: function (string) {
            var vowels = ["a", "e", "i", "o", "u"];
            return $.inArray(string.toLowerCase().charAt(0), vowels) > -1 ? 'an' : 'a';
        }
    };

    $.fn.EmaginationJS = function (methodOrOptions) {
        if (methods[methodOrOptions]) {
            return methods[methodOrOptions].apply(this, Array.prototype.slice.call(arguments, 1));
        }
        else if (typeof methodOrOptions === 'object' || !methodOrOptions) {
            return methods.init.apply(this, arguments);
        }
        else {
            $.error('Method ' + method + ' does not exist');
        }
    }

})(jQuery);
/*
 * Timestamp 16/10/2015 @ 14:00
 */