$(function () {
    "use strict";
});

// NEEDS TO BE POPULATED FROM BACKEND - START
var _triggerRow; // Default for grid view.
var _triggerRowList; // only used if set to list view and it overwrites
							// the value in _triggerRow
var _lazyLoadImagesInfinity = true; // True if new products inserted need to
									// have images lazy loaded
var _iStopCount; // How many pages to fectch before we present the user with
					// the "load more results" button

																									
var _bDoInfinityBrowse;
// END

var _iPageCount = 0;
var _iCurrentPage = 1;
var _bStopShown = false;
var _bStopShownPrev = false;
// Variable updated in setView()
var _isListView = false;
var _productContainerSelector = '#product-tile-container > ul';
var _nextTrigger = null;
var _prevTrigger = null;
var _bScrolling = false;
var _showIcon = false;
var _maxCount;
var _numReqest=0;
var _scrollPos=0;
var _preSegCount=0;
var _sellerId = null;
var _eventId = null;
var _endecaId = null;
var _promoId = null; 
var _promoBucketId = null;
var _modifySearchQuery = null;
var _selectedSortOption = null;

var _executing = false;
var _userClickedPrevious = false;

/*******************************************************************************
 * Base module to control variants
 */
 
TESCO.InfinityBrowse = {    
	init: function () {
		_triggerRow=$('#product-tile-container').eq(0).data('gridTrigCount');
		_iStopCount=$('#product-tile-container').eq(0).data('segmentCount');
		_maxCount=$('#product-tile-container').eq(0).data('maxCount');
		_triggerRowList=$('#product-tile-container').eq(0).data('listTrigCount');
		_sellerId=$('#product-tile-container').eq(0).data('sellerId');
		_eventId=$('#product-tile-container').eq(0).data('eventId');
		_endecaId=$('#product-tile-container').eq(0).data('endecaId');
		_promoId=$('#product-tile-container').eq(0).data('promoId');
		_promoBucketId=$('#product-tile-container').eq(0).data('promoBucketId');
		_modifySearchQuery=$('#product-tile-container').eq(0).data('modifySearchQuery');
		_selectedSortOption=$('#product-tile-container').eq(0).data('selectedSortOption');
        this.initFramework();
        this.setView();
		//this.hideTopPaginationOptions();
		this.hideBottomPagination();
		this.bindWindowTrigger();
		this.bindLoadMoreResultsButton();
		this.doLazyLoad();
		this.toPdp();
    },
    initFramework: function() {
    	var _myInlineRequests = ['getProducts']; // Part of the existing framework
		var _myRequests = {'getProducts' : []}; // Part of the existing framework
		var _myActions = { 'getProducts' : ['/' + TESCO.Utils.getSiteContext() + '/blocks/catalog/productlisting/infiniteBrowse.jsp'] }; // Part of the existing frame work to add ajax url
		var _myModules = {};		
		var _myDefaultActions = { 'getProducts' : ['/stubs/getProducts.php'] };
		TESCO.Data.Global.init({
			'inlineRequests': _myInlineRequests,
			'requests': _myRequests,
			'modules': _myModules,
			'actions': _myActions,
			'defaultActions': _myDefaultActions			
		});
		if(_iCurrentPage == 1){
			_iPageCount=1;
		}
    },
    toPdp: function(){
    	
    	var _urlParams= this.getUrlParams();
        var _scrollTo=_urlParams.scrollTo;
        //var _scrollLevel;
        var _myString = window.location.href;
        var _mySplitResult = _myString.split('#');
        
        if (window.location.href.indexOf("#scrollTo=") >= 0) {
        	$(window).scrollTop(0);
        	var _getScroll=_mySplitResult[1].split(';');
        	var _getScrollFind=_getScroll[0].split('=');
        	var _getScrollVal=_getScrollFind[1];
        	var _getPageNoFind=_getScroll[1].split('=');
        	var _getPageNoVal=_getPageNoFind[1];
        	_numReqest=_getPageNoFind[1];
        	_scrollPos=_getScrollVal;
        	
        	$('#product-tile-container ul li').remove();
        	_preSegCount = _numReqest;
        	var _segNum = Math.floor(_numReqest / _iStopCount);
        	
        	if(_numReqest % _iStopCount != 0){
        		_segNum++;
        	}
        	
        	if(_segNum > 1){
        		TESCO.InfinityBrowse.showPreviousResults();
        		
        	}
        	if(_segNum == 1){
        		var startOffset=0 ;
        	}
        	else
        		{
        		var startOffset=(_segNum * _iStopCount * 20) - ( _iStopCount * 20) ;
        		}
        	
        	TESCO.InfinityBrowse.getProducts(startOffset,_iStopCount-1);
        }
        
       	$('body').delegate("li.product a.prod-img, .product-name h3 a,.button-container .button,.product-points-info .button", "click", function (e) {
       		var _getPagNum = $(this).parents('li').data('pagenumber');
       		var offsetTop = $(this).parents('li').offset().top;
       		var currentObj = $(this).parents('li').data('product-count');
       		if (window.location.href.indexOf("#") >= 0) {
    			var _currPagePos = _mySplitResult[0]+"#scrollTo="+ currentObj+";pageNo="+_getPagNum;
        		window.location.replace(_currPagePos);
    		}
    		else{
    			var _currPagePos = window.location.href + "#scrollTo="+ currentObj+";pageNo="+_getPagNum;
        		window.location.replace(_currPagePos);
    		}
       	});
    },
	setView: function () {
		if (window.location.href.indexOf("View=list") >= 0) {
			_isListView = true;
			_triggerRow = _triggerRowList;
		}
	},
	doLazyLoad: function (sNewElements) {
		if (_lazyLoadImagesInfinity) {
			if (sNewElements) {
				$(sNewElements).find('img').lazyload({ data_attribute: 'orig'});
			}
			else {				
				
				// $(_productContainerSelector).children('li').find('img').lazyload({
				// data_attribute: 'orig'});
			}
		}	
	},
	hideTopPaginationOptions: function() {
		$('div.sort:eq(0)').children('div.pagination').hide().next().hide().next().css('float', 'right');
		$('.items-views-container').show();
     	$('.items-views-container .divider').hide();		
	},
	hideBottomPagination: function () {
		
		// Hide the bottom pagination bar.
		$('div.sort:eq(1)').hide();
	},
    bindLoadMoreResultsButton: function() {
		$('body').delegate("#loadMoreResultsLink", "click", function(e) {
            e.preventDefault();			
			TESCO.InfinityBrowse.loadMoreResults();
			return false;
        });
		$('body').delegate("#loadPreviousResultsHolder", "click", function(e) {
            e.preventDefault();	
			TESCO.InfinityBrowse.loadPreviousResults();
			return false;
        });
	},
	bindWindowTrigger: function (){       
			
		$(window).scroll(function (){
			if (!_bScrolling) {
				//_bScrolling = true;				
				setTimeout(function() {
					if (!_bStopShown || !_bStopShownPrev) {	
						if (!_executing) {
							var _whatTrigger = TESCO.InfinityBrowse.isRowInViewPort(_triggerRow); 
							
							if (_whatTrigger === 'next' && !_bStopShown) {
								_nextTrigger = null;
								_prevTrigger = null;
								var _iCurrentProductCount = $(_productContainerSelector).children('li');
								var _pageOffest = _iCurrentProductCount.last().data('pagenumber');
								var _showMore =(_pageOffest * 20 );
								
								if(_showIcon === false && _showMore < _maxCount){
									if (_pageOffest % _iStopCount == 0) {
										TESCO.InfinityBrowse.showLoadMoreResults();
									}	
									else{
										TESCO.InfinityBrowse.getProducts();
									}
								}
							}
							else if (_whatTrigger === 'prev' && !_bStopShownPrev) {
								_nextTrigger = null;
								_prevTrigger = null;
								_whatTrigger = null;
								var _iCurrentProductCount = $(_productContainerSelector).children('li'); 
								var _pageShown = _iCurrentProductCount.first().data('pagenumber');
								if (_pageShown !== 1) {
									_preSegCount = _pageShown-1;								
									var startOffset = (_pageShown-2) * 20;
									if((_pageShown-1) % _iStopCount == 0){
										TESCO.InfinityBrowse.showPreviousResults();
									}else{
										TESCO.InfinityBrowse.getProducts(startOffset,0,'prev');
									}
								}
							}
						}
					}					
					_bScrolling = false;
				}, 250);
			}
		});		
   	},
   	showPreviousResults: function(){
   		_bStopShownPrev = true;
   		if( $(_productContainerSelector).find('#loadPreviousHolder').length == 0){
		 $(_productContainerSelector).prepend('<div id="loadPreviousHolder" class="pageDivider"><a href="#" class="button input-standard" id="loadPreviousResultsHolder">View previous products</a></div>');
   		}
   	},
	showLoadMoreResults: function() {
		_iPageCount = 0;
		_bStopShown = true;
		if( $(_productContainerSelector).find('#loadMoreResultsHolder').length == 0){
			$(_productContainerSelector).append('<div id="loadMoreResultsHolder" class="pageDivider"><a href="#" class="button input-standard" id="loadMoreResultsLink">View more products</a><a href="#header">Back to top</a></div>');
		}
	},
	loadMoreResults: function() {
        $('#loadMoreResultsHolder').remove();
        if($('#infinite').length > 0)
        {
	        $('#infinite').remove();
        }
        _bStopShown = false;
        if(!_showIcon) {
            this.getProducts();
        }
	},

	loadPreviousResults: function(){
		_bStopShownPrev = false;
		_bStopShown = false;
		$('#loadPreviousHolder').remove();
		var _iCurrentProductCount = $(_productContainerSelector).children('li'); 
		var _pageShown = _iCurrentProductCount.first().data('pagenumber');
		if (_pageShown !== 1) {
			_preSegCount = _pageShown-1;								
			var startOffset = (_pageShown-2) * 20;
			TESCO.InfinityBrowse.getProducts(startOffset,0,'prev');
		}
	
		_userClickedPrevious = true;
	},
	getUrlParams: function() {
		var params = {};
	    window.location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(str,key,value) {
	    	params[key] = value;
	    });	    
	    return params;
	},
	isLastProduct:function(){
		var _iCurrentProductCount = $(_productContainerSelector).children('li').length;
		if( _iCurrentProductCount === _maxCount)
		{
			$(_productContainerSelector).append('<div id="loadMoreResultsHolder" class="pageDivider"><a href="#header">Back to top</a></div>');
		}
	},
    
    getProducts: function (_iOverrideProductCount, remcount, prevAction) {		
		_executing = true
		_showIcon = true;
		// Create unique product holder and returns the ID
		var _myUniqueID = this.createProductHolder(_iOverrideProductCount,prevAction);
		var _request = 'getProducts';
		var _oForm = '';
		var oElem = '';
        var _url = TESCO.Utils.getAction(_request, _oForm);
        var DL = new TESCO.DataLayer();
        var _pageOffest = $(_productContainerSelector).children('li').last().data('pagenumber');
        if(_iOverrideProductCount == 0) {
        	_pageOffest=0;
        }
        else{
        	_pageOffest = _iOverrideProductCount ? _iOverrideProductCount :_pageOffest * 20;
        }       
        
        var _iCurrentProductCount = _iOverrideProductCount ? _iOverrideProductCount : $(_productContainerSelector).children('li').length;
        var _myView = _isListView ? "list" : "grid";
        var _urlParams= this.getUrlParams();
        var _catId=_urlParams.catId;
        if(_catId == undefined && _endecaId != undefined && _endecaId){
        	_catId = _endecaId;
        }
        var _sortBy=_urlParams.sortBy;
        if(_sortBy == undefined && _selectedSortOption != undefined && _selectedSortOption){
        	_sortBy = _selectedSortOption;
        }
        var _searchQuery=_urlParams.searchquery;
        var _myData = '&view=' + _myView + '&catId=' + _catId + '&sortBy=' + _sortBy + '&searchquery=' + _searchQuery + '&offset=' + _pageOffest + '&lazyload=true';
        if(_eventId != undefined && _eventId){
        	_myData = _myData + '&eventId=' + _eventId;
        }
        if(_sellerId != undefined && _sellerId){
        	_myData = _myData + '&sellerId=' + _sellerId;
        }
        if(_promoId != undefined && _promoId){
        	_myData = _myData + '&promoId=' + _promoId;
        }
        if(_promoBucketId != undefined && _promoBucketId){
        	_myData = _myData + '&promoBucketId=' + _promoBucketId;
        }
        if(_modifySearchQuery != undefined && _modifySearchQuery){
        	_myData = _myData + '&modifySearchQuery=' + _modifySearchQuery;
        }
        var _priceRange=_urlParams.range;
        if(_priceRange != undefined && _priceRange){
        	_myData = _myData + '&range=' + _priceRange;
        }
        DL.get(_url, _myData, oElem, TESCO.InfinityBrowse.Data, _request, function(oResp) {
        	var _myMarkup = TESCO.InfinityBrowse.Data.cleanMarkup(oResp.products);
			var $_DomMarkup = $(_myMarkup);
        	$('#' + _myUniqueID).before($_DomMarkup);
			$('#' + _myUniqueID).remove();			
			_showIcon = false;
			_nextTrigger = null;
			_prevTrigger = null;
			_iPageCount++;
			_iCurrentPage++;
			_numReqest--;
			$_DomMarkup = $_DomMarkup.not(":eq(0)");			
			TESCO.InfinityBrowse.initNewProducts($_DomMarkup, prevAction);
			TESCO.InfinityBrowse.onSucess(_iOverrideProductCount,remcount,prevAction);
			_executing = false;
			// Re-Init Variants 
			if (TESCO.PLP.Data) {
        		var $jsonResp = $.parseJSON(oResp.variants);
        		if ($jsonResp) {
        			$.extend(TESCO.PLP.Data, $jsonResp);
        		}
        		TESCO.PLP.setupPage($_DomMarkup);
        	}
		});
    },
    onSucess: function(startOffset,remcount,prevAction){
    	
    	if(remcount>0){
    		
    		if(prevAction == 'prev'){
    			startOffset= startOffset - 20;
    		}
    		else{
    			startOffset= startOffset + 20;
    		}
    		
    		var _iCurrentProductCount = $(_productContainerSelector).children('li');
			var _pageOffest = _iCurrentProductCount.last().data('pagenumber');
			var _showMore =(_pageOffest * 20 );
			if(_showMore < _maxCount){
    			TESCO.InfinityBrowse.getProducts(startOffset,remcount-1,prevAction);
    		}else{
    			remcount=0;
    		}
    	}
    	if(remcount== 0 && prevAction != 'prev'){
			var obj = '#'+_scrollPos;
			$(window).scrollTop($(obj).offset().top);
			
		}
    	
    },
    showLoading: function(show){
		if(show == true){
			  var over = '<div id="popupWrapperCont" class="loadingBar showLoadingImg"></div>';
			  $(over).appendTo('body');
			  	var b=$(document).width();
				var h=$(document).height();
				var e=$("div#popupWrapperCont").height();
				var g=$("div#popupWrapperCont").width()/2;
				var c=b/2-g+"px";
				var d=$(window).scrollTop();
				var a=e;
				var f=c;
				$("div#popupWrapperCont").css('background-color','transparent');
				if(a<0){a*=-1}
				$("div#popupWrapperCont").css({top:300,left:f});
				$(window).scroll(function(){
				var j=$(window).scrollTop();
				var i=90+j+"px";
				$("div#popupWrapperCont").css({top:300,position:"absolute"})
				});

		}
		else {
			
			$('#popupWrapperCont').remove();
		}
	},
    bindProductCompare: function(oNewElements) {    	
    	var elements = $('div.compare');		
				
        TESCO.Common.compare[TESCO.Common.compare.length] = new TESCO.ProductCompare( oNewElements, {
            compare_url: elements.eq(0).data('compare-url'),
            modal: elements.eq(0).data('compare-modal'),
            modal_error: elements.eq(0).data('compare-modal-error') }, productCompareDataSource );        
    },
	createProductHolder: function(_iOverrideProductCount,prevAction) {
    	var _myUniqueID = this.generateUniqueID();
    	var _myHolder = $('<div id="' + _myUniqueID + '" class="loadingBar"><span>Loading more products...</span></div>');
    	if(prevAction == 'prev'){
    		$(_productContainerSelector).prepend(_myHolder);
    	}
    	else{
    		$(_productContainerSelector).append(_myHolder);
    	}
    	
		return _myUniqueID;
	},
	generateUniqueID: function() {
		var uniqueId = null;
		if (!uniqueId) uniqueId = (new Date()).getTime();
		return 'id' + (uniqueId++);		
	},
	isRowInViewPort: function(iRow) {
		var _elemCache = $(_productContainerSelector).children('li');
		if (_nextTrigger === null && _elemCache != null) {
			if (_isListView) {				
				var _totalRowCount = _elemCache.length;
				_nextTrigger = _elemCache.eq(_elemCache.length-iRow).offset().top;
				//_prevTrigger = _elemCache.eq(iRow).offset().top;
				_prevTrigger = _elemCache.first().offset().top;
			}
			else {
				var _totalRowCount = Math.ceil(_elemCache.length / 4);
				if(_totalRowCount > iRow){
					_nextTrigger = _elemCache.eq((_totalRowCount-iRow) * 4).offset().top;
					//_prevTrigger = _elemCache.eq((iRow) * 4).offset().top;
					_prevTrigger = _elemCache.first().offset().top;
				}
			}
		}
		
				
		if ($(window).scrollTop() > _nextTrigger) {
			return 'next';
		}
		else if ($(window).scrollTop() < _prevTrigger) {
			return 'prev';
		}
		else {
			return '';
		}
		
	},
	initNewProducts: function(oNewElements, prevAction) {		
		var $elemCache = $(oNewElements).children('div.product-details').children('div.product-name');
		if (!_isListView) {		
			TESCO.Common.setGridview(oNewElements);								
		}
		else {
			//$elemCache.find('h3 a').ellipsis('45');
			TESCO.Utils.formatVariantStyleNameInPopupBasket($elemCache.find('h3 a'), 45);
		}
		// Bind the Tooltip plugin for the special offers
		setTimeout(function() {
			TESCO.InfinityBrowse.bindOfferToolTips(oNewElements);	
		}, 10);
		setTimeout(function() {
			TESCO.InfinityBrowse.bindProductCompare(oNewElements);	
		}, 10);
		setTimeout(function() {
			TESCO.InfinityBrowse.doLazyLoad(oNewElements);	
		}, 10);
		
		if (prevAction === 'prev' && _userClickedPrevious) {
			_userClickedPrevious = false;
			var moveScroll = $(oNewElements).eq(19).offset().top;
			$(window).scrollTop(moveScroll);
		}
		if (prevAction === 'prev' && !_userClickedPrevious) {
			var moveScroll = $(oNewElements).eq(4).offset().top;
			$(window).scrollTop(moveScroll);
		}
	},
	bindOfferToolTips: function(oNewElements) {
		/*Tesco.common.buybuttonofferTooltip();
		$(oNewElements).find('.product-availability-offers .special-offers').each(function(i, e) {
            $(e).tooltip({
                autohide: true,
                delay: 500,
                tooltip: $(this).closest('.product-availability-offers').children('.offers').eq(0),
                
            });
        });
		*/
		
		$(oNewElements).find('.product-availability-offers .special-offers').each(function(i, e) {
			var _offerSku = $(e).data('skuid');
        	$(e).tooltip({
                autohide: true,                
                delay: 500,
                tooltip: $(this).closest('div.product-availability-offers').children('div.offers').eq(0),             
                autoReposition: false,
                bindInternalEvents: true, 
                refreshToolTip: false,
                ajaxLoader: true,
                ajaxContent: function() {
                	return TESCO.Common.specialOfferFly(e,_offerSku); 
            } 
              
        });
    });
		
		$(oNewElements).find('div.product-availability-offers ul.special-offers li.view a.view-list').each(function(i, e) {
			var _offerSku = $(e).data('skuid');
        	$(e).tooltip({
                autohide: true,                
                delay: 500,
                tooltip: $(this).closest('.special-offers-container').children('.offers').eq(0),             
                autoReposition: false,
                bindInternalEvents: true, 
                refreshToolTip: false,
                ajaxLoader: true,
                ajaxContent: function() {
                	return TESCO.Common.specialOfferFly(e,_offerSku); 
            } 
              
        });
    });
	}	
};

/*******************************************************************************
 * Data handler must be present on all AJAX requests being sent. Callback on
 * Ajax get method
 */
TESCO.InfinityBrowse.Data = {    
    handler: function(oJSON, oElem) {
		return;
    },
    cleanMarkup: function(sHTML) {              
        if (sHTML != null) {
            return sHTML.replace(/<(script|style|title)[^<]+<\/(script|style|title)>/gm, '').replace(/<(link|meta)[^>]+>/g,'');
        }
        else {
            return '';
        }
    }
}

$().ready(function() {
	// Module check is required before every init as the module may not be required.
	if ($('#product-tile-container').length) {
		_bDoInfinityBrowse = $('#product-tile-container').eq(0).data('infiniteBrowse')
		if (_bDoInfinityBrowse) {
	    	TESCO.InfinityBrowse.init();
	    }
	}
});