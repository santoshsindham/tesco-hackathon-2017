/* eslint-disable */
/*jslint plusplus: true, nomen: true */
/*globals console,window,define,require,$ */
define([
    'domlib',
    'modules/breakpoint',
    'modules/common',
    'modules/load-more/common',
    'modules/sort-by/common',
    'modules/tesco.analytics',
    'modules/overlay/common',
    'modules/tesco.utils',
    'modules/set-page-title/SetPageTitle',
    'modules/toggle-expand-collapse/common',
    'modules/google-analytics/productFilterTracking'
], function (
    $,
    breakpoint,
    common,
    loadMore,
    sortBy,
    analytics,
    overlay,
    util,
    SetPageTitle,
    ToggleExpandCollapse,
    productFilterTracking
) {
        "use strict";

        var imageList = {
                "a_0_TO_1": "../../images/rating_large_1.png",
                "a_1_TO_2": "../../images/rating_large_2.png",
                "a_2_TO_3": "../../images/rating_large_3.png",
                "a_3_TO_4": "../../images/rating_large_4.png",
                "a_4_TO_5": "../../images/rating_large_5.png"
            },
            validate = {
                init: function () {

                    var priceRangeForm = $('.filter-priceRangeWrap'),
                        form = $('.filter-priceRange'),
                        errors = $(".filter-priceRangeErrorWrap", priceRangeForm),
                        isValid = {
                            from: false,
                            to: false},
                        input = {
                            from: $('input[name="from"]', priceRangeForm),
                            to: $('input[name="to"]', priceRangeForm)},
                        label = {
                            from: $('[for="from"]', errors),
                            to: $('[for="to"]', errors)};

                    form.off("submit").on("submit", function (ev) {
                        ev.preventDefault();

                        var fromVal = parseFloat(input.from.val()),
                            toVal = parseFloat(input.to.val());

                        validate(input.from);
                        validate(input.to);
                        if (isValid["from"] && isValid["to"]) {

                            if (toVal > fromVal) {

                                if (history.pushState) {
                                    var postData = form.serialize(),
                                        formURL = form.attr("action");

                                    productFilters.refreshData(ev, formURL + '?' + postData, false, false, "ALL", false);
                                } else {
                                    this.submit();
                                }
                            }
                            else {
                                showError(input.to, "Please enter a 'To' value more than a 'From' value");
                            }
                        }
                    }).off("focusout").on("focusout", 'input[name="to"],input[name="from"]', function () {
                        validate($(this));
                    });

                    function validate(el) {
                        var value = el.val();

                        if (value === '') {
                            showError(el, el.data('msg-required'));

                        }
                        else if (!/^\d*(\.\d{0,9})?$/.test(value)) {
                            showError(el, el.data('msg-number'));
                        }
                        else {
                            hideAllErrors(el);
                        }

                    }

                    function showError(el, msg) {
                        var name = el.attr("name");
                        isValid[name] = false;

                        el.addClass('error').removeClass("valid");
                        errors.show();
                        label[name].css("display", "block").text(msg);
                    }

                    function hideAllErrors(el) {
                        var name = el.attr("name");
                        isValid[name] = true;

                        if (isValid["from"] && isValid["to"]) {
                            hideError("from");
                            hideError("to");
                            errors.hide();
                        } else if (isValid["from"]) {
                            hideError("from");
                        } else if (isValid["to"]) {
                            hideError("to");
                        }
                    }

                    function hideError(name) {
                        input[name].removeClass("error").addClass("valid");
                        label[name].hide();
                    }
                }
            },


            historyManager = {

                stack: [],
                isChanged: false,
                lastHash: '',

                init: function () {
                    var that = this;
                    var param = util.getURLParams();
                    var stateDataObj = {
                        state_getfilters: "ALL",
                        state_sortProducts: false,
                        state_currentURL: window.location.href,
                        state_sortBy: $.isNumeric(param.sortBy) ? param.sortBy : 0
                    };

                    historyManager.replaceUrl(stateDataObj.state_currentURL, stateDataObj);

                    $(window).on("popstate", function (ev) {

                        if (historyManager.isChanged && window.location.hash === historyManager.lastHash) {
                            $.each(historyManager.stack, function (k, callback) {
                                callback(ev, window.location.search, true);
                            });
                        }
                    });
                    window.setTimeout(function(){
                       historyManager.isChanged = true;
                    }, 1000);
                },

                setUrl: function (url, data) {
                    this.isChanged = true;
                    if (history.pushState) {
                        history.pushState(data, null, url);
                    }
                    this.lastHash = window.location.hash;
                    $(window).trigger('historyManagerSetUrlFired');
                },

                replaceUrl: function (url, data) {
                    if (history.pushState) {
                        history.replaceState(data, null, url);
                    }
                }
            },

            templates = {

                overlayWait: '<div class="filter-overlayWaiting"><div class="filter-overlayText">Please wait while we update your selection</div></div>',
                //overlayWait: '<div class="filter-overlayWaiting"><div class="newLoader">Loading...</div><div class="filter-overlayText">Please wait while we update your selection</div></div>',

                categoryList: function () {
                    return '<div class="filter-categoryList">' +
                        '<h3 class="filter-categoryLabel">View by Category</h3>' +
                        '<div class="filter-categoryMore">Show all <span class="filter-categoryCount"></span> categories</div>' +
                        '<div class="filter-categoryOptionList">' +
                        '</div>' +
                        '</div>';
                },

                categoryItem: function (o) {
                    return '<a id="' + o.id + '" href="' + o.url + '" class="filter-categoryItem ' + (o.count === 0 ? "filter-categoryItem_disabled" : "") + '" data-catid="' + o.id + '">' +
                        o.displayName + '<span class="filter-categoryOptionCount">(' + o.count + ')</span></a>';
                },

                filterGroup: function (id, o) {

                    var priceRange = '';
                    if (o.type === "Multi_SearchRange") {
                        priceRange = '<li class="filter-priceRangeWrap"></li>';
                    }

                    return '<div class="filter-filterGroup filter-filterGroup_active">' +
                        '<h3 class="filter-filterGroupLabel" id="' + id + '">' + o.displayName + '</h3>' +
                        '<div class="filter-filterOptionList">' +
                        '<ul class="filter-filterOptionListWrap">' +

                        '<li class="filter-filterOptionMore">' +
                        '<div class="filter-filterOptionMoreButton" id="' + o.displayName + '">View all</div>' +
                        '</li>' + priceRange +
                        '</ul>' +
                        '</div>' +
                        '</div>';
                },

                filterOption: function (o) {
                    if (o.type === "Multi_Image") {
                        o.displayName = '<img src="' + imageList[o.displayName] + '" class="filter-filterOptionImage">';
                    }
                    return '<li><a id="' + o.id + '" href="' + o.url + '" class="filter-filterOption" data-optionid="' + o.id + '">' +
                        o.displayName + '<span class="filter-filterOptionCount">(' + o.count + ')</span></a></li>';
                }
            },

            productFilters = {
                isOverlayOpen: false,
                bOverlayDirty: false,
				isBottomShadow: false,

                init: function () {

                    productFilters.fnBindSetTitleEvents();

                    var that = this,
                        click = 'click',
						mousedown = 'mousedown',
						evt = '',
	                    overlayState = "";
                    if($('.detail-specification-bullet').length){
                    	 $('.detail-specification-bullet ul li').each(function(){
                         	common.Ellipsis.init($(this));
                         });
                    }

                    productFilters.fnSetGlobalFilterVars();
                    !window.isKiosk() && productFilters.collapseCategories();

					if(common.isTouch()){
						evt = click;
					} else{
						evt = mousedown;
					}

                    if (common.isPage('PLP')) {
                    	historyManager.init();
                    }
                    productFilters.lastState = window.location.pathname + window.location.search;
                    productFilters.savedState = productFilters.lastState;

                    historyManager.stack.push(function (ev, url, isBackButton) {

                            if (window.location.hash === "" && productFilters.isOverlayOpen === true) {
                                productFilters.toggleOverlay(false);
                                overlay.hide()
                            }
                            var getFilter = ev.originalEvent.state && ev.originalEvent.state.state_getfilters;
                            if (ev.originalEvent.state) {
                           		 productFilters.refreshData(ev, url, isBackButton, false, getFilter, false);
                            }
                            sortBy.updateSelection(productFilters.sortBy);

                    });

                    $("body")
                        .on('click', ".filter-filterOption", function (ev) {
                            ev.preventDefault();
                            ev.stopImmediatePropagation();

                            if (!$(this).hasClass("filter-filterOption_disabled") || $(this).hasClass("filter-filterOption_active")) {
                                if (productFilters.isOverlayOpen) {
                                	productFilters.bOverlayDirty = true;
                            	}
                                var getFilter = breakpoint.largeDesktop ? 'ALL' : 'LHN';
                            	getFilter = breakpoint.largeDesktop && productFilters.isOverlayOpen ? 'LHN' : getFilter;
                                productFilters.refreshData(ev, $(this).attr("href"), false, true, getFilter, false);
                                productFilterTracking.selectFilterHandler(ev);
                            }
                        })
                        .on(click, ".filter-lightbox .close", function (ev) {
                            ev.preventDefault();
                            ev.stopImmediatePropagation();
                            overlay.hide();
                        })
                        .on(click, ".filter-lightbox .filter-overlayApply", function (ev) {
                        //.on(click, ".filter-lightbox .filter-showAllPoducts", function (ev) {
                            ev.preventDefault();
                            ev.stopImmediatePropagation();
                            overlay.hide();

                            productFilters.isOverlayOpen = false;

                            if (productFilters.bOverlayDirty) {
                                window.setTimeout(function () {
                            		productFilters.refreshData(ev, productFilters.savedState, false, false, "Products", false);
                       			}, 20);
                            }
                            productFilters.bOverlayDirty = false;


                        })
                        .append(templates.overlayWait);


                    $(".refine a")
                        .on(click, function (ev) {
                            ev.preventDefault();
                            ev.stopImmediatePropagation();
                            productFilters.toggleOverlay(true);
                            $(".filter-filterListWrap,.filter-filterOptionListWrap").scrollTop(0);
                            overlayState = window.location.search;
                            if (breakpoint.vTablet || breakpoint.hTablet || breakpoint.desktop || breakpoint.kiosk) {
                                productFilters.showFirstGroup();
								productFilters.setDropShadow();
                            }
							else if(breakpoint.mobile){
								productFilters.setDropShadow();
							}
                        });


                    var event = (common.isTouch()) ? 'tap click' : 'touchstart click';
                    $(document).on(event, 'ul.sort-by-list li a', function (e) {
                        e.preventDefault();
                        e.stopImmediatePropagation();
                        if($(e.target).attr('class').indexOf('current') == -1){
                            var selectedNumber = $(this).data('val');
                            sortBy.updateSelection(selectedNumber);
                            sortBy.sortByAnalytics(selectedNumber);
                            productFilters.sortBy = selectedNumber;
                            if (history.pushState) {
                                $("#frmTest").submit(function (e) {
                                    e.preventDefault();
                                    sortBy.closeDropDown();
                                    e.stopImmediatePropagation();

                                    productFilters.refreshData(e, window.location.search, false, false, "ALL", true);
                                    overlay.hide();
                                });
                            }
                            $('#sortBy').val(selectedNumber);
                            $('#frmTest').submit();
                        } else{
                            sortBy.closeDropDown();
                        }
                    });

                    $(".filter-side")
                        .on(click, ".filter-activeClose", function (ev) {
                            ev.preventDefault();
                            ev.stopImmediatePropagation();

                            if (productFilters.bOverlayDirty) {
								productFilters.bOverlayDirty = false;
                                productFilters.refreshData(ev, overlayState, false, false, "LHN", false, true);
                                productFilterTracking.clearTracker();
                            }
                            productFilters.toggleOverlay(false);
                        })
                        .on(evt, ".filter-categoryItem", function (ev) {
                            if ($(this).hasClass("filter-categoryItem_disabled")) {
                                ev.preventDefault();
                            }
							var currentUrl = window.location.href;
							var removeSort = $(this).attr('href').replace(/\&sortBy\=\d+/,'');
							if(currentUrl.indexOf('sortBy') != -1){
								var sortByValue = productFilters.getSortByVal(currentUrl);
								var hrefAttrVal = removeSort+'&'+sortByValue;
								$(this).attr('href', hrefAttrVal);
							}
                        })
                        .on(click, ".filter-categoryMore", function (ev) {
                            ev.preventDefault();
                            overlay.show({
                                content: $(".filter-categoryList").html()
                            })
                        })
                        .on(click, ".filter-activeClearAll", function (ev) {
                            ev.preventDefault();
                            ev.stopImmediatePropagation();
                        	productFilters.bOverlayDirty = true;
                            if (!$(this).hasClass("filter-activeClearAll_disabled")) {
                                var getFilter = breakpoint.largeDesktop || productFilters.isOverlayOpen === false ? "ALL" : "LHN";
                                productFilters.refreshData(ev, $(this).attr("href"), false, false, getFilter, false);
                                productFilterTracking.clearTracker();
                            }
                        })
                        .on(click, ".filter-activeItem", function (ev) {
                            ev.preventDefault();
                            ev.stopImmediatePropagation();
                            productFilters.refreshData(ev, $(this).attr("href"), false, false, "ALL", false);
                        })
                        .on(click, ".filter-filterOption", function (ev) {
                            ev.preventDefault();
                            ev.stopImmediatePropagation();
                            productFilters.bOverlayDirty = true;

                            if (!$(this).hasClass("filter-filterOption_disabled") || $(this).hasClass("filter-filterOption_active")) {

                                var getFilter = breakpoint.largeDesktop ? "ALL" : "LHN";
                                productFilters.refreshData(ev, $(this).attr("href"), false, !breakpoint.largeDesktop, getFilter, false);
                                productFilterTracking.selectFilterHandler(ev);
                            }
                        })
                        .on(click, ".filter-filterOptionMoreButton", function (ev) {
                            ev.preventDefault()
                            productFilters.isOverlayOpen = true;
                            overlayState = window.location.search;

                            var targetDimName = $(ev.target).attr('id'),
                            	$facetList = $(this).parents(".filter-filterOptionList").clone(),
                            	$totalProducts = $('#product-filter-actions .filter-productCount b').text();

                            $facetList.html(productFilters.fnAlphabeticallySortIfRequired(ev, $facetList));

                            overlay.show({
                                customClass: "filter-lightbox",
                                content: '<h3>Refine by \''+$.trim(targetDimName)+'\'</h3><div class="filter-filterList">' +
                                    $facetList.html() +
                                    '</div><div class="filter-overlayApply">Apply</div>',
                                    /*content: '<h3>Refine by \''+$.trim(targetDimName)+'\'</h3><div class="filter-filterList">' +
                                    $facetList.html() +
                                    '</div><div class="filter-showAllPoducts">SHOW <span class="selectedProducts">'+ $totalProducts +'</span> PRODUCTS</div>', */
                                onHideCallback: function () {
                                    productFilters.isOverlayOpen = false;
                                    if (productFilters.bOverlayDirty) {
                                    	if (history.pushState) {
                                            window.setTimeout(function () {
                                            	productFilters.refreshData(ev, overlayState, false, false, "LHN", false, true);
                                            }, 20);
                                        }
                                    }
                                    productFilters.bOverlayDirty = false;
                                }
                            });
                        })

                        .on(click, ".filter-footerApply", function (ev) {
                            ev.preventDefault();
                            ev.stopImmediatePropagation();

                            productFilters.bOverlayDirty = false;
                            if ($(".filter-footerApply b").html() === "0") {
                                $(".filter-warning").addClass("filter-warning_enabled");
                            } else {

                                    productFilters.refreshData(ev, productFilters.savedState, false, false, "ALL", false);

                                productFilters.toggleOverlay(false);
                                productFilterTracking.sendAnalytics();
                            }
                        })
                        .on(click, ".filter-warningRefine", function (ev) {
                            ev.preventDefault();
                            ev.stopImmediatePropagation();
                            $(".filter-warning").removeClass("filter-warning_enabled");
                        })
                        .on(click, ".filter-warningClearAll", function (ev) {
                            ev.preventDefault();
                            ev.stopImmediatePropagation();
                            productFilters.refreshData(ev, $(this).attr("href"), false, false, "LHN", false);
                            $(".filter-warning").removeClass("filter-warning_enabled");
                        })

                        .on(click, ".filter-filterGroupLabel", function (ev) {
                            ev.preventDefault();
                            ev.stopImmediatePropagation();
                            if (breakpoint.vTablet || breakpoint.hTablet || breakpoint.desktop || breakpoint.kiosk) {
                                productFilters.showActiveGroup($(this).parent());
                            } else {
                                productFilters.toggleFilter($(this).parent());
                            }
                        })
                        .on(click, ".filter-scrollUp, .filter-scrollDown", function (ev) {
                            ev.preventDefault();
                            ev.stopImmediatePropagation();
                            if(breakpoint.kiosk){
								productFilters.scroll($(this).parent().find(".filter-filterListWrap"), $(this).hasClass("filter-scrollUp") ? 1 : -1);
							} else if(breakpoint.hTablet || breakpoint.vTablet || breakpoint.desktop){
								return false;
							}
                        });


                    // disable IOS bounce scroll
                    $(".filter-overlayWaiting").on("touchmove", function (ev) {
                        ev.preventDefault();
                    });

                    productFilters.bindListWrapperEvents();
                    $(document).on("touchmove", function (ev) {
                        if (productFilters.isOverlayOpen) {
                            ev.preventDefault();
                        }
                    });

                    $(".filter-overlay").on("touchmove", function (ev) {
                        if (productFilters.isOverlayOpen) {
                            ev.stopPropagation();
                        }
                    });

                    if($(".filter-activeList").find(".filter-activeItem").length === 0){
                        $('.filter-overlay').addClass('filter-activeList_disabled');
                    }

                    if (common.isLegacyIe()) {
                        $('.filter-priceRangeInput[placeholder]').each(function(){
                            $(this).placeholder({
                                inputWrapper: '<span style="position:relative; display:block;"></span>',
                                placeholderCSS: {
                                    "display": "block",
                                    "position": "absolute",
                                    "top": "6px",
                                    "left": "7px",
                                    "color": "#aaaaaa"
                                }
                            });
                        });
                    }

                    validate.init();
                    sortBy.init();

                },
                bindListWrapperEvents: function () {
                    $(".filter-filterListWrap")
                        .on("scroll", function (ev) {

                            productFilters.scroll($(this), 0);
                        })
                        .on('touchstart', function (ev) {
                            if (productFilters.isOverlayOpen) {
                                var event = ev.originalEvent.touches[0];
                                this.allowUp = (this.scrollTop > 0);
                                this.allowDown = (this.scrollTop < this.scrollHeight - this.clientHeight);
                                this.slideBeginY = event.pageY;
                                this.slideStart = event.pageY;
                                ev.stopPropagation();
                            }
                        })
                        .on("touchmove", function (ev) {
                            if (productFilters.isOverlayOpen) {
                                var event = ev.originalEvent.touches[0];
                                var up = (event.pageY > this.slideBeginY);
                                var down = (event.pageY < this.slideBeginY);
                                this.slideBeginY = event.pageY;
                                if ((up && this.allowUp) || (down && this.allowDown)) {
                                    ev.stopPropagation();
                                }
                            }
                        })
                        .on("touchend", function (ev) {
                            if (productFilters.isOverlayOpen && Math.abs(this.slideStart - this.slideBeginY) > 20) {
                                ev.stopImmediatePropagation();
                            }
                        });

                        if (common.isIOS()) {
                            $('ul.products').on('longTap', 'a', function (e) {
                                $(e.currentTarget).one('click', function (e) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                });
                            });
                        }
                },
                getSortByVal: function(urlVal){
					var splitVal = urlVal.split('?');
                	var splitAmp = splitVal[1].split('&');
                	var sortBySplit;
                	for(var i=0; i <splitAmp.length; i++){
                		if(splitAmp[i].indexOf('sortBy') != -1){
                			sortBySplit = splitAmp[i];
                		}
                	}
                	return sortBySplit;
                },
                clearDropShadows: function () {
                     $('.filter-activeList, .filter-footer').css('box-shadow', 'none');
                },
				setDropShadow: function(){
					if(breakpoint.mobile){
						if($('.filter-filterList').height() > $(window).height()){
							$('.filter-footer').css('box-shadow', '0 -5px 10px -5px #696868');
						} else{
							$('.filter-footer').css('box-shadow', 'none');
						}
					}
					else if(breakpoint.vTablet || breakpoint.hTablet || breakpoint.desktop){
						if($('.filter-filterList').height() > $(window).height()){
							$('.filter-filterList .filter-scrollDown').addClass('dropShadowBottom');
						} else{
							$('.filter-filterList .filter-scrollDown').removeClass('dropShadowBottom');
						}
						if($('.filter-filterOptionTablet').height() > $(window).height()){
							$('.filter-filterOptionTablet .filter-scrollDown').addClass('dropShadowBottom');
						} else{
							$('.filter-filterOptionTablet .filter-scrollDown').removeClass('dropShadowBottom');
						}
					}
				},

                scroll: function (el, direction) {

                    var pos = el.scrollTop() - direction * 100,
                        scrollHeight = el.prop('scrollHeight');

                    if (pos <= 0) {
                        pos = 0;
                    } else if (pos + el.height() >= scrollHeight) {
                        pos = scrollHeight;
                    }
                    el.parent().find('.filter-scrollUp').toggleClass('filter-scroll_disabled', pos === 0);
                    el.parent().find('.filter-scrollDown').toggleClass('filter-scroll_disabled', pos === scrollHeight);

					if(breakpoint.hTablet || breakpoint.vTablet || breakpoint.desktop){
						if(pos === 0){
							if((el.height() + el.offset().top) > $('.filter-footer').offset().top){
								el.parent().find('.filter-scrollDown').addClass('dropShadowBottom');
							}
							if(el.parent().find('.filter-scrollUp').hasClass('dropShadowTop')){
								el.parent().find('.filter-scrollUp').removeClass('dropShadowTop');
							}
						}
						if(pos === scrollHeight){
							el.parent().find('.filter-scrollUp').addClass('dropShadowTop');
							if(el.parent().find('.filter-scrollDown').hasClass('dropShadowBottom')){
								el.parent().find('.filter-scrollDown').removeClass('dropShadowBottom');
							}
						}
						if(pos != 0 && pos != scrollHeight){
							el.parent().find('.filter-scrollDown').addClass('dropShadowBottom');
							el.parent().find('.filter-scrollUp').addClass('dropShadowTop');
						}
					} else if(breakpoint.mobile){
						if(pos === 0){
							if((el.height() + el.offset().top) > $('.filter-footer').offset().top){
								$('.filter-footer').css('box-shadow','0 -5px 10px -5px #696868');
							}
							$('.filter-activeList').removeAttr('style');
							productFilters.isBottomShadow = true;
						}
						if(pos === scrollHeight){
							$('.filter-activeList').css('box-shadow', '0 3px 5px #696868');
							$('.filter-footer').removeAttr('style');
							productFilters.isBottomShadow = false;
						}
						if(pos != 0 && pos != scrollHeight){
							$('.filter-footer').css('box-shadow','0 -5px 10px -5px #696868');
							$('.filter-activeList').css('box-shadow', '0 3px 5px #696868');
							productFilters.isBottomShadow = true;
						}
					} else if(breakpoint.kiosk){
						if(!el.parent().find('.filter-scrollUp').hasClass('filter-scroll_disabled')){
							el.parent().find('.filter-scrollUp').css({'box-shadow':'0 5px 10px -5px','z-index':'100'});
						} else{
							el.parent().find('.filter-scrollUp').removeAttr('style');
						}
						if(!el.parent().find('.filter-scrollDown').hasClass('filter-scroll_disabled')){
							el.parent().find('.filter-scrollDown').css('box-shadow','-3px -3px 10px #696868');
						} else{
							el.parent().find('.filter-scrollDown').removeAttr('style');
						}
					}
                    if (direction !== 0) {
                        el.scrollTop(pos);
                    }
                },
                lastState: '',

                sortBy: 0,
                savedState: '',

                refreshData: function (ev, url, isManager, forceAjax, getFilters, sortProducts, replaceState) {
                    var that = this,
                        body = $("html"),
                        //sortBy = $.isNumeric(productFilters.sortBy) ? "&sortBy=" + productFilters.sortBy : "";
						$categoryNav = '',
						$selectedDimensionNav = '',
                        $elem = util.getFormByElement(ev.target);

                    if (this.isOverlayOpen) {
                        this.lastState = url;
                    }

                    this.savedState = url;
                    var _url = url;

                    if ($elem.is('form#price-range')) {
                        var fromPrice = $elem.find('input#from').val();
                        var toPrice = $elem.find('input#to').val();
                        _url = window.location.search + '&range=BTWN+' + fromPrice + '+' + toPrice;
                    } else {
                        _url = url.replace(/Ntt=[^&]+/i, '');
                    }

                    if ($elem.is('form#frmTest') && $.isNumeric(productFilters.sortBy)) _url += '&sortBy=' + productFilters.sortBy;
                    if (getFilters) _url += '&responseToRender=' + getFilters;

                    if (history.pushState || forceAjax) {
                        body.addClass("filter-refresh");
                        var phase = sortProducts ? 'sort' : 'filter';

                        loadMore.getResults({ phase: phase, url: _url, getFilters: getFilters === 'LHN' })
                            .done(function (data) {
                                var urlfromBackend = loadMore.getQueryParams();

                                if (breakpoint.kiosk) urlfromBackend += '&kiosk';

                                if (isManager !== true && !productFilters.isOverlayOpen) {
                                    var stateDataObj = {
                                        state_getfilters: getFilters,
                                        state_sortProducts: sortProducts,
                                        state_currentURL: urlfromBackend,
                                        state_sortBy: productFilters.sortBy
                                    };
                                    if (!replaceState) {
                                        historyManager.setUrl(urlfromBackend, stateDataObj);
                                    } else {
                                        historyManager.replaceUrl(urlfromBackend, stateDataObj);
                                    }
                                }
                                if (getFilters !== "Products") {
                                    var $categoryNav = '';
                                    var $selectedDimensionNav = '';
                                    var $dimensions;
                                    if(data.leftNavigation.selectedDimensionNav !== ''){
                                        $selectedDimensionNav = $.parseJSON(data.leftNavigation.selectedDimensionNav);
                                    }
                                    if(data.leftNavigation.categoryNav !== ''){
                                        $categoryNav = $.parseJSON(data.leftNavigation.categoryNav);
                                    }

                                    if(data.leftNavigation.dimensions !== ''){
                                        $dimensions = data.leftNavigation.dimensions;
                                    }

                                    productFilters.refreshCategory($categoryNav.facetArray);
                                    productFilters.refreshActiveFilter($selectedDimensionNav);
                                    productFilters.refreshFilter(
                                        $dimensions,
                                        data.totalProductsCount,
                                        $selectedDimensionNav.facetArray);
                                    productFilters.refreshProducts({
                                        total: data.totalProductsCount,
                                        productList: data.productContent
                                    });
                                }
                                body.removeClass("filter-refresh");
                                productFilters.sortBy = data.selectedSortOption;
                                sortBy.updateSelection(productFilters.sortBy);
                                if($('.detail-specification-bullet').length){
                                    $('.detail-specification-bullet ul li').each(function(){
                                        common.Ellipsis.init($(this));
                                    });
                                }

                                /*
                                * GFO-4787 - New PLP design

                                if ($('.filter-lightbox').length) {
                                    console.log("totalCount"+data.totalProductsCount);
                                    $('.filter-lightbox .filter-showAllPoducts .selectedProducts').text(data.totalProductsCount);
                                }  */

                            });
                    } else {
                        window.location = url;
                    }
                },

                refreshCategory: function (data) {
                    var wrap = null,
                        activeList = [],
                        element = null,
                        lastElement = null,
                        html = null;

                    if(data !== undefined){
	                    if (data.length === 0) {
	                        $(".filter-categoryList").text('');
	                    } else {
                            $(".filter-categoryList").replaceWith(templates.categoryList());
                            !window.isKiosk() && productFilters.collapseCategories();
                            wrap = $(".filter-categoryOptionList");

	                        wrap.find(".filter-categoryItem").addClass("filter-categoryItem_disabled");

	                        $.each(data, function (key, item) {

	                            element = wrap.find("#" + item.id);
	                            if (element.length !== 0) {
	                                element.attr("href", item.url)
	                                    .find(".filter-categoryOptionCount")
	                                    .text("(" + item.count + ")");
	                            } else {
	                                html = templates.categoryItem(item);
	                                if (lastElement) {
	                                    lastElement.after(html);
	                                } else {
	                                    wrap.prepend(html);
	                                }
	                            }

	                            lastElement = wrap.find("#" + item.id)
	                                .toggleClass("filter-categoryItem_disabled", item.count === 0);

	                            if (item.count != 0) {
	                                activeList.push(item.id);
	                            }

	                        });
	                    }
                    } else{
                    	 $(".filter-categoryList").text('');
                    }
                    $(".filter-categoryCount").html(activeList.length);

                },

                activeFilters: [],

                refreshActiveFilter: function (data) {
                    var html = "",
                        that = this;
                    this.activeFilters = [];

                    $(".filter-activeItem").remove();
                	if(data !== ''){
	                    $(".filter-activeClearAll")
	                        .toggleClass("filter-activeClearAll_disabled", data.facetArray.length === 0)
	                        .attr("href", data.clearAllURL);

	                    $(".filter-warningClearAll")
                        .toggleClass("filter-warningClearAll_disabled", data.facetArray.length === 0)
                        .attr("href", data.clearAllURL);

	                    $(".filter-overlay").toggleClass("filter-activeList_disabled", data.facetArray.length === 0);

	                    if (data) {
	                        $.each(data.facetArray, function (key, item) {
	                            productFilters.activeFilters.push(item.id);
	                            if (item.type === "Multi_Image") {
	                                item.displayName = '<img src="' + imageList[item.displayName] + '" class="filter-filterOptionImage">';
	                            }
	                            html = html + '<a href="' + item.url + '" class="filter-activeItem">' +
	                                item.displayName +
	                                '</a>';
	                        });

	                        $(".filter-activeLabel").after(html);
	                    }
                	} else{
						$(".filter-activeClearAll")
						.addClass("filter-activeClearAll_disabled");
						$(".filter-overlay").toggleClass("filter-activeList_disabled", true);
                	}
                },

                refreshFilter: function (data, count, filters) {
                    var $data = '';
                    if(data.dimensionContainer !== ""){
                        $data = $.parseJSON(data.dimensionContainer);
                    }
                    var wrap = $(".filter-filterList,.filter-filterOptionTablet"),
                        active = false,
                        that = this,
                        group = $(".filter-filterListWrap"),
                        iSpliceAmount,
                        aFacets,
                        oFacetsSegment,
                        $selector,
                        $chunk,
                        iFilterSpliceAmount = 0,
                        lastDimension=null;

                    wrap.find(".filter-filterOption")
                        .addClass("filter-filterOption_disabled")
                        .removeClass("filter-filterOption_active")
                        .attr('rel','follow');

                    $selector = wrap.find(".filter-filterOption .filter-filterOptionCount");
                    iFilterSpliceAmount = $selector.length;
                    //console.log(iFilterSpliceAmount);
                    if (iFilterSpliceAmount > 40) {
                        var iDivisable = Math.floor(iFilterSpliceAmount / 40);
                        iFilterSpliceAmount = Math.floor(iFilterSpliceAmount / iDivisable);
                    }
                    while($selector.length) {
                        $chunk = $($selector.splice(0, iFilterSpliceAmount));
                        (function($selectorChunk) {
                            setTimeout(function() {
                                $selectorChunk.text('(0)');
                            }, 20);
                        })($chunk);
                    }

                    wrap.find(".filter-filterGroupLabel")
                        .removeClass("filter-filterGroupLabel_selected");

                    if (count === 0) {
                        $(".filter-priceRangeWrap").html("");
                    }

                    $.each($data, function (k, v) {
                        var lastElement = null;
                        active = false;
                        if (v.facetArray) {
                            if ($('#' + k).length === 0) {
                                if(lastDimension)
                                {
                                    lastDimension.parent().after(templates.filterGroup(k, v));
                                }else{
                                    group.prepend(templates.filterGroup(k, v));
                                }
                            }
                            lastDimension=$('#' + k);

                            aFacets = v.facetArray.slice(0);
                            iSpliceAmount = aFacets.length;

                            if (iSpliceAmount > 20) {
                                var iDivisable = Math.floor(iSpliceAmount / 20);
                                iSpliceAmount = Math.floor(iSpliceAmount / iDivisable);
                            }

                            var count = 0;
                            while(aFacets.length) {
                                oFacetsSegment = aFacets.splice(0, iSpliceAmount);
                                (function internalFacetLoop(oInternalFacetsSegment) {
                                    setTimeout(function deferredFactLoop() {
                                        var html = null,
                                            element = null,
                                            lastElement = null,
                                            filters = null,
                                            item = null,
                                            key;
                                            for (key in oInternalFacetsSegment) {
                                                if (oInternalFacetsSegment.hasOwnProperty(key)) {
                                                    item = oInternalFacetsSegment[key];

                                                element = wrap.find("#" + item.id);
                                                if (element.length !== 0) {
                                                    element.attr("href", item.url)
                                                    element = element.find(".filter-filterOptionCount");

                                                    var sFacetCount = "(" + item.count + ")";
                                                    element.text(sFacetCount);

                                                    count+=1;
                                                } else {
                                                    html = templates.filterOption(item);
                                                    //group the facets under respective dimension after applying filter and pge refresh
                                                    if (lastElement != null && lastElement.parents().find('.filter-filterGroup').children('h3').attr('id') == k) {
                                                        lastElement.parent().after(html);
                                                    }
                                                    else {
                                                        if(count > 0){
                                                            $("#" + k).parent().find(".filter-filterOptionListWrap>li:nth-child("+count+")").after(html);
                                                        } else {
                                                            $("#" + k).parent().find(".filter-filterOptionListWrap").prepend(html);
                                                        }
                                                    }
                                                    productFilters.refreshFacetCheckForToggleClass(k);
                                                }

                                                wrap.find("#" + item.id)
                                                    .toggleClass("filter-filterOption_disabled", parseInt(item.count, 10) === 0)
                                                    .toggleClass("filter-filterOption_active", $.inArray(item.id, productFilters.activeFilters) !== -1);

                                                if ($.inArray(item.id, productFilters.activeFilters) !== -1) {
                                                    active = true;
                                                }
                                            }
                                        }
                                    }, 30);
                                })(oFacetsSegment);
                            }
                        }
                    });
                    if (data.priceRangeHtml !== undefined) {
                            $(".filter-priceRangeWrap").replaceWith(data.priceRangeHtml);
                            $("#price-range #from").val('');
                            $("#price-range #to").val('');
                            $('#price-range').attr('action', $('#priceRangeAction').val());
                            validate.init();
                    }  else{
                            $(".filter-priceRangeWrap").html("");
                    }
                    if(filters !== undefined){
                        $.each(filters, function (k, v) {

                            wrap.find("#" + v.id).addClass("filter-filterOption_active")
                                .attr({
                                  "href": v.url,
                                  "rel" : "nofollow"
                                })
                                .parents(".filter-filterGroup")
                                .find(".filter-filterGroupLabel")
                                .addClass("filter-filterGroupLabel_selected");

                        });
                    }

                    $(".refine a")
                    .toggleClass("filter_refine_hasFilter", $(".filter-activeList").find(".filter-activeItem").length !== 0);

                },

                refreshFacetCheckForToggleClass: function(sKey) {
                    var filters = $('#' + sKey)
                                    .parent()
                                    .find(".filter-filterOptionList");

                    var bShowLongList = filters.find(".filter-filterOption").length > 8;
                    filters.toggleClass("filter-filterOptionList_long", bShowLongList);

                },

                refreshProducts: function (data) {
                    $(".filter-productCount b").text(data.total);
                    $(".filter-footerApply b").text(data.total);

                    $(".filter-footerApply").toggleClass("filter-footerApply_disabled", data.total === 0);

                    $('#listing').attr('data-maxcount', data.total);
                },

                showActiveGroup: function (el) {
                    var list = $(".filter-filterOptionTablet .filter-filterListWrap"),
                        $facetHeading = el.find(".filter-filterGroupLabel");

                    $(".filter-activeAreaText b").html($facetHeading.text());
                    list.html(productFilters.fnAlphabeticallySortIfRequired(el, list));

                    $(".filter-filterGroupLabel_active").removeClass("filter-filterGroupLabel_active");
                    el.find(".filter-filterGroupLabel").addClass("filter-filterGroupLabel_active");

                    $(".filter-filterGroup_active", '.filter-filterListWrap').removeClass("filter-filterGroup_active");
                    el.addClass("filter-filterGroup_active");

                    if (breakpoint.kiosk) {
                        this.scroll(list, 0);
                    }
    				if(breakpoint.vTablet ||breakpoint.hTablet || breakpoint.desktop){
    					if(list.find('.filter-filterOptionListWrap').height() > $('.filter-footer').position().top){
    						$('.filter-filterOptionTablet .filter-scrollDown').addClass('dropShadowBottom');
    					} else{
    						$('.filter-filterOptionTablet .filter-scrollDown').removeClass('dropShadowBottom');
    					}
    					if(el.parent().height() > $('.filter-footer').position().top){
    						$('.filter-filterList .filter-scrollDown').addClass('dropShadowBottom');
    					} else{
    						$('.filter-filterList .filter-footer').removeClass('dropShadowBottom');
    					}
    					//console.log('check for parent::'+(el.parent()));
    				}
                },

                showFirstGroup: function () {
                    this.showActiveGroup($(".filter-filterGroup:first-child"));
                },

                scrollPosition: 0,

                toggleOverlay: function (setOpen) {
                    this.isOverlayOpen = setOpen;
                    if (breakpoint.mobile) {
                        this.toggleAllFilters(false);
                    }

                    if (setOpen) {
                        this.scrollPosition = $(window).scrollTop();
                        $(window).scrollTop(0);
                    }
                    setTimeout(function () {
                        $(".filter-overlay").toggleClass("filter-overlay_active", setOpen);
                        $("#wrapper").css({
                        	"overflow": setOpen ? "hidden" : "",
                        	"height": setOpen ? "100%" : ""
                    });
                    }, 100);

                    if (!setOpen) {
                        productFilters.clearDropShadows();
                        if (this.scrollPosition) {
                            $(window).scrollTop(this.scrollPosition);
                        }
                    }

                    if (breakpoint.kiosk) {
                        this.scroll($(".filter-filterListWrap"), 0);
                    }
                },

                toggleFilterTimer: null,

                toggleFilter: function (el, setOpen) {

                	var filterList = el.find(".filter-filterOptionList"),
                    filterListHeight = filterList.children().outerHeight(true),
                    isOpen = el.hasClass("filter-filterGroup_active"),
    				that = this;

    				if (setOpen === undefined) {
    					 setOpen = !isOpen;
    				}

    				el.toggleClass("filter-filterGroup_active", setOpen);
    				if (isOpen) {
    					filterList.css({ 'max-height': '0' });

    				} else {
    					filterList.css({ 'max-height': filterListHeight });
    				}


    			  if(breakpoint.mobile){

                        var list = $(".filter-filterGroup .filter-filterOptionList .filter-filterListWrap");

                        list.html(productFilters.fnAlphabeticallySortIfRequired(el, list));

    				  if($('.filter-filterListWrap').prop('scrollHeight') !== 0){

						 setTimeout(function() {
							if(($(".filter-filterListWrap").scrollTop() + $('.filter-filterListWrap').height() == $('.filter-filterListWrap').prop('scrollHeight'))){
								$('.filter-footer').css('box-shadow', 'none');
							} else{
								$('.filter-footer').css('box-shadow', '0 -5px 10px -5px #696868');
							}
    					}, 50);
    				  }
    				  if(productFilters.isOverlayOpen === false) {
    					this.toggleFilterTimer = setTimeout(function () {
    						filterList.css({height: ""});
    					}, 2500);
    				  }
    			  }
    			},

                toggleAllFilters: function (setOpen) {
                    var that = this,
                        $productFilterGroups = $(".filter-filterGroup"),
                        iFilterSpliceAmount = Math.ceil($productFilterGroups.length),
                        aChunk;

                    while($productFilterGroups.length) {
                        aChunk = $productFilterGroups.splice(0, iFilterSpliceAmount);
                        (function (aSelectorChunk, bSetOpen, productFiltersRef) {
                            setTimeout(function () {
                                //for (var i = 0; i < aSelectorChunk.length; i++) {
                                    productFiltersRef.toggleFilter($(aSelectorChunk[0]), bSetOpen);
                                    $('.filter-filterGroup_active .filter-filterOptionList').attr("style", "max-height:auto");
                               // }
                            }, 20);
                        })(aChunk, setOpen, productFilters);
                    }
                },

                fnAlphabeticallySortIfRequired: function(el, list){
                	var $facetHeading,
                        $facetContent;

                    if (!breakpoint.largeDesktop) {

                        $facetHeading = el.find(".filter-filterGroupLabel");
                        $facetContent = el.find(".filter-filterOptionList");

                    } else {

                        $facetHeading = $(el.target).parents('.filter-filterGroup').find('.filter-filterGroupLabel');
                        $facetContent = list;

                    }

                    if (productFilters.isAlphabetSortedRequired($facetHeading.prop('id')) && $facetHeading.data('beenSorted') !== true) {
                        $facetContent = productFilters.fnSortListAlphabetically($facetContent);
                        if (!breakpoint.largeDesktop) {
                           $facetHeading.data('beenSorted', true);
                        }
                    }


                    return $facetContent.html();

                },

                isAlphabetSortedRequired: function(sID) {
                    return $.inArray(sID, productFilters.aEndecaIDsForAlphabetSort) === -1 ? false : true;
                },

                fnSortListAlphabetically: function($facetList) {
                    var group = $facetList.find('ul.filter-filterOptionListWrap').data('facet-group-name') || '';
                    var $sortedFacets = $('li', $facetList).get().sort(function(a, b) {
                        var sCleanA = a.textContent.toLowerCase().replace("\n", ""),
                            sCleanB = b.textContent.toLowerCase().replace("\n", "");
                        if (sCleanA < sCleanB) {
                            return -1;
                        } else if (sCleanA > sCleanB) {
                            return 1
                        } else {
                            return 0;
                        }
                    }),
                    $facetWrapper = $('<ul class="filter-filterOptionListWrap" data-facet-group-name="' + group + '" />').html($sortedFacets);

                    $facetList.html($facetWrapper);

                    return $facetList;
                },

                fnSetGlobalFilterVars: function(){

                    window.TescoData = window.TescoData || {};
                    window.TescoData.filterGroupOptions = window.TescoData.filterGroupOptions || {};
                    window.TescoData.filterGroupOptions.idsForAlphabetSort = window.TescoData.filterGroupOptions.idsForAlphabetSort || [];
                    window.TescoData.filterGroupOptions.idsForAlphabetSort.push("40084", "40068", "40104", "40525", "40261", "40344", "55104", "40234", "55101", "40389", "40567", "40255", "50466", "51781", "40222", "40711", "40710", "40303", "51816", "40625");
                    productFilters.aEndecaIDsForAlphabetSort = window.TescoData.filterGroupOptions.idsForAlphabetSort;

                },

                fnCopyFilterList: function(){
                    productFilters.unsortedFilterList = $('.filter-filterList').clone(true);
                },

                fnResetFilterList: function(){
                    $('.filter-filterList').replaceWith(productFilters.unsortedFilterList);
                    productFilters.unsortedFilterList = null;
                },

                aEndecaIDsForAlphabetSort: [],
                unsortedFilterList: null,
                oURLParams: null,

                fnInitSetTitle: function() {
                	productFilters.oSetPageTitle = new SetPageTitle({    // instantiate the set page title class with pre selected settings
                        sSuffixText: '- Tesco.com',
                        sSetPageTitleEventName: 'updatePageTitle',
                        sResetPageTitleEventName: 'resetPageTitle',
                        bReplaceEntireTitle: false,
                        bAppendBeforeSuffix: true
                    });
                },

                fnBindSetTitleEvents: function() {
                	/*
                     * GFO-5897 - New code to trigger a Page Title update on page load
                     * The title should reflect the "last applied filter" hidden span
                     */
                	productFilters.fnInitSetTitle();

                    if (productFilters.oSetPageTitle) {
                        var sLastAppliedFilter,
                            sHiddenFilterNameSelector = 'h1.page-title span.last_applied_filter',
                            sLastFilterDirty,
                            sLastAppliedFilterDirty,
                            sDecodeURL,
                            sLastAppliedFilterConvertChars,
                            sLastAppliedFilter;

                        if ($.trim($(sHiddenFilterNameSelector).text()) !== '') {    // check if the hidden dom element has valid text, if so trigger update page title event
                            sLastAppliedFilter = $.trim($(sHiddenFilterNameSelector).text());

                            $(window).trigger('updatePageTitle', {
                                sUpdatedPageTitlePartial: sLastAppliedFilter
                            });
                        }

                        $(window).on('historyManagerSetUrlFired', function() {    // bind event lister to trigger function updating the page title after the url has changed
                            if (productFilters.oSetPageTitle) {
                                productFilters.oURLParams = common.getURLParams();
                                sLastAppliedFilterDirty = productFilters.oURLParams.lastFilter;

                                if (sLastAppliedFilterDirty === undefined) {
                                    $(window).trigger('resetPageTitle');
                                } else {
                                    sDecodeURL = decodeURI(sLastAppliedFilterDirty);
                                    sLastAppliedFilterConvertChars = sDecodeURL.replace(/\+|_/g, ' ');
                                    sLastAppliedFilter = '- ' + sLastAppliedFilterConvertChars.replace(/\|/g, ': ').replace(/\%26/g, '&').replace(/\%A3/g, decodeURI('%C2%A3'));
                                    $(window).trigger('updatePageTitle', {
                                        sUpdatedPageTitlePartial: sLastAppliedFilter
                                    });
                                }
                            }
                        });
                    }
                },

                collapseCategories: function collapseCategories() {
                    var toggleElementParent = '.collapsible-categories .filter-categoryList',
                        toggleCustomEventName = 'toggle-categories',
                        categoryExpandCollapse = null,
                        categoryListItems = null,
                        categoryListItemLength = 0,
                        i=0;
                    if (!$('.filter-filterListWrap .collapsible-categories').length) {
                        $('.filter-filterList .filter-filterListWrap').append($('.collapsible-categories').detach());
                    }
                    categoryExpandCollapse = new ToggleExpandCollapse({
                        bEnableCustomEvent: true,
                        sSetCollapsedCSSClassName: 'categoryList_collapsed',
                        sSetExpandedCSSClassName: 'categoryList_expanded',
                        sToggleContainer: '.collapsible-categories .filter-categoryList',
                        sToggleCustomEventName: toggleCustomEventName,
                        sToggleElementParent: toggleElementParent,
                        sToggleTriggerElement: '.filter-categoryLabel'
                    });
                    categoryExpandCollapse.init();
                    $(window).on(toggleCustomEventName, function (evt, data) {
                        var categoryListWrapper = $(toggleElementParent).find('.filter-categoryOptionList'),
                            listWrapperHeight = 0;
                        if (!categoryListWrapper.length) {
                            return;
                        }
                        categoryListItems = categoryListWrapper.children();
                        categoryListItemLength = categoryListItems.length;
                        switch (data.toggleEventType) {
                            case 'toggle-expand':
                                for (i = 0; i < categoryListItemLength; i++) {
                                    listWrapperHeight += categoryListItems[i].offsetHeight;
                                }
                                categoryListWrapper.css({'max-height': listWrapperHeight + 'px'});
                            break;
                            case 'toggle-collapse':
                                categoryListWrapper.css({'max-height': listWrapperHeight});
                            break;
                            // no default
                        }
                        return;
                    });
                }

            };

        common.init.push(productFilters.init);

        breakpoint.mobileIn.push(function () {
            productFilters.fnCopyFilterList();

            if (common.isPage('PLP')) {
                productFilters.toggleAllFilters(false);
            }
        });
        breakpoint.mobileOut.push(function () {
            productFilters.fnResetFilterList();
        });

        breakpoint.vTabletIn.push(function(){
            productFilters.fnCopyFilterList();
        });
        breakpoint.vTabletOut.push(function () {
            productFilters.fnResetFilterList();
        });

        breakpoint.hTabletIn.push(function(){
            productFilters.fnCopyFilterList();
        });
        breakpoint.hTabletOut.push(function () {
            productFilters.fnResetFilterList();
        });

        breakpoint.desktopIn.push(function(){
            productFilters.fnCopyFilterList();
        });
        breakpoint.desktopOut.push(function () {
            productFilters.fnResetFilterList();
        });

        breakpoint.largeDesktopIn.push(function () {
            if (common.isPage('PLP')) {
                productFilters.toggleOverlay(false);
                productFilters.toggleAllFilters(true);

            }

            if (productFilters.unsortedFilterList != null){
                $('.filter-filterList').html(productFilters.unsortedFilterList.html());
            }

            $('.filter-footer').css('box-shadow', '');
            $('.filter-activeList').css('box-shadow', '');

        });
        breakpoint.largeDesktopOut.push(function () {
            if (common.isPage('PLP')) {
                overlay.hide();
            }
        });

        breakpoint.kioskIn.push(function () {
            if (common.isPage('PLP')) {
                //TODO hack because modernizer does not recognize touch in kiosk
                $("html").removeClass("no-touch").addClass("touch");

            }
        });

        return productFilters;
    });
