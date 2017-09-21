define(['domlib', 'modules/breakpoint', 'modules/common', 'modules/overlay/common', 'modules/tesco.utils', 'modules/tesco.analytics'], function($, breakpoint, common, overlay, utils, analytics){

	var sortBy = {
		productListing: '#listing',
		timer: null,
		sortbyIsVisible: false,
        loaded: false,

		observe: function () {

			var self = sortBy;
			var event = (common.isTouch()) ? 'tap click' : 'touchstart click';
			
			if (!common.isTouch() && !this.loaded) {
                this.loaded = true;
				$('#product-filter-actions>.sort').on('mouseenter', self.navMouseEnter);
				$('#product-filter-actions>.sort').on('mouseleave', self.navMouseLeave);
				
				$('#product-filter-actions>.sort').on('mouseenter', function () {
					window.clearTimeout(self.timer);
				});
				
				$('#product-filter-actions>.sort').on('mouseleave', function () {
					self.timer = setTimeout(function () {
						self.navMouseLeave();
					}, 10000);
				});
				
			}
			
			if ($('#product-filter-actions .sort-by-list li a.current').length)
			{
				var selectedSortoption = $('#product-filter-actions .sort-by-list li a.current').eq(0).text();

				$('#product-filter-actions .control > strong').text(selectedSortoption);
				$("#frmTest input.selected-sort-option").val(selectedSortoption);
			}
			else{
				defaultSortoption = $('#product-filter-actions .sort-by-list li a').eq(0).text();
				$("#product-filter-actions .control > strong").text(defaultSortoption);
				
			}
			

			$('#product-filter-actions .control').on(event, function(e) {
				e.preventDefault();
				e.stopImmediatePropagation();

				if (breakpoint.mobile || breakpoint.hTablet || breakpoint.vTablet) {
					overlay.show({
						content: $('#product-filter-actions .sort .sort-by-list').clone()[0]
					});


				} else {
					var icon = $(e.currentTarget).find('.icon'),
						changeIcon = icon.attr('data-icon') === '2' ? '1' : '2';

					$(e.currentTarget).parent().toggleClass('open');
					icon.attr('data-icon', changeIcon);

					sortBy.sortbyIsVisible = true;
				}
				
				return false;
			});
		},
        updateSelection: function(selectedNumber) {
            if(selectedNumber != 0){
	        	$("#product-filter-actions .sort-by-list li a").removeClass("current");
	            var selectedSortoption = $("#product-filter-actions .sort-by-list li a[data-val='"+selectedNumber+"']")
	                    .addClass("current").eq(0).text();
	            if(selectedSortoption == '' ){
					selectedSortoption = 'Relevance'
					}
	              
	            $('#product-filter-actions .control > strong').text(selectedSortoption);
	            $("#frmTest input.selected-sort-option").val(selectedSortoption);
            }
        },
        sortByAnalytics: function(selectedNumber){
        	var view;
        	var selectedSortoption = $("#product-filter-actions .sort-by-list li a[data-val='"+selectedNumber+"']")
            .addClass("current").eq(0).text();
		    if(selectedSortoption == '' ){
				selectedSortoption = 'Relevance'
			}
        	if($("#listing").hasClass("list-view")){
            	view="list";
            }
            else {
            	view="grid";
            }
              var _oWebAnalytics = new analytics.WebMetrics();
              var v = [{
                  'eVar8': 'view:'+view+'|sort:'+selectedSortoption ,
                  'prop25': 'view:'+view+'|sort:'+selectedSortoption
              }];  
              _oWebAnalytics.submit(v);
        },
        closeDropDown: function() {
            var el = $('#product-filter-actions .control'),
                icon = $(el).find('.icon'),
                changeIcon = icon.attr('data-icon') === '2' ? '1' : '2';

            $(el).parent().removeClass('open');
            icon.attr('data-icon', changeIcon);
            sortBy.sortbyIsVisible = false;

        },

		navMouseEnter: function (e) {
			var self = sortBy;
			window.clearTimeout(self.mouseLeaveTimer);
		},

		navMouseLeave: function (e) {
			var self = sortBy;
            var that = this;
			
			self.mouseLeaveTimer = setTimeout(function () {
				if (self.sortbyIsVisible) {
					var target = $('.sort.open'),
						icon = $(target).find('.icon'),
						changeIcon = icon.attr('data-icon') === '2' ? '1' : '2';
					target.removeClass('open');
					icon.attr('data-icon', changeIcon);
				}
			}, 1000);
			
		},

		init: function () {
			if($('#product-filter-actions .sort').length){

				if ($(sortBy.productListing).length) {

					sortBy.observe();
					var selectEvent = (common.isTouch()) ? 'tap click':'click';
					$(document).on(selectEvent, function (e) {
						if (sortBy.sortbyIsVisible) {
							var target = $('.sort.open'),
								icon = $(target).find('.icon'),
								changeIcon = icon.attr('data-icon') === '2' ? '1' : '2';
							target.removeClass('open');
							icon.attr('data-icon', changeIcon);
						}
					});
				}
                
                /*
                Defect 46448, sort by option is not updating in Kiosk PLP. 
                This is a temporary fix in the JS for GMO5. Will be removed for a proper solution made to the JSP in GMO6
                */
                sortBy.updateSortByOption();               
			}
			
			//$('#frmTest').appendTo('#active-product-filters');
		},
        
        updateSortByOption: function () {
			if (window.isKiosk()) {
			    
		        if ($('#product-filter-actions').length) {
		        
		        	sortBy.fixBuyListSortOrder();
		        	
		        	var $el = $('#product-filter-actions');
		            var $elSort = $('#product-filter-actions a.sort');
		            var $elCurrent = $('#product-filter-actions a.current');
		            
		            // Get sortBy param
		            var URLParams = utils.getURLParams();
		            var getSortByParam = URLParams['sortBy'];
		            
		            if (getSortByParam != undefined) {
		                
		                // Remove existing .current classes
		                if ($elCurrent.length) {
		                    $elSort.removeClass('current');
		                }
		                
		                if (getSortByParam === '' || getSortByParam.indexOf('P_') >= 0) {
		                	$elSort.eq(0).addClass('current');
		                	$el.find('.sort .control strong').text($elSort.eq(0).text());
		                }
		                
		                // For each sort link
		                $elSort.each(function() {
		                    // If data-val eq to sortBy param,
		                    // add class .current,
		                    // copy link text to display text for selected option
		                    if ($(this).data('val') == getSortByParam) {
		                        $(this).addClass('current');
		                        $el.find('.sort .control strong').text($(this).text());
		                    }
		                });
		            }
		            
		            else {
		                // default
		            	var $controlLabel = $('#product-filter-actions a.sort:first'); 
		            	$controlLabel.addClass('current');
		            	$el.find('.sort .control strong').text($controlLabel.text());		                
		            }
		            
		        }
		    }
        },
        fixBuyListSortOrder: function() {        		
        	var $el = $('#product-filter-actions');
        	
            //fix the drop down option as well.
    		$el.find('.sort-by-list li a').each(function(i, e) {;
    			var $el = $(this);
    			var tempVal = $el.text(); 
    			if (tempVal.indexOf('???') > 0) {
    				$el.text('Recommended');
    				$el.data('val', tempVal.replace(/[/\?]*[\r\n]*/gm, ""));    				    				
    			}            		
    		});  
        	
        }
	};

	return sortBy;
});