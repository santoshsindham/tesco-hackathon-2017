/*global define: true */
define(['domlib', 'modules/common'], function ($, common) {

    function BasicCarousel(opts) {

        var defaults = {
                elementId : '', // ID of the carousel
                isHorizontal : true, // false - vertical
                content : null, // String of mark-up to be appended to carousel item container
                itemsPerTransition : 1, // Number of items to move at a time
                moveItem : 'li', // The element whose dimensions will be used to calculate slide movement,
                onItemClick : null // Function called when carousel item is clicked, item index is passed as parameter
            };

        this.settings = {};
        this.$carousel = null;
        this.$carouselSlider = null;
        this.$carouselItemsContainer = null;
        this.$carouselItems = null;
        this.$btnNext = null;
        this.$btnPrev = null;
        this.selectedItem = 0;
        this.itemSize = 0;
        this.currentTop = 0;
        this.visibleItems = 0;
        this.numItems = 0;
        this.panelItemCount = 1;
        this.numPanels = 1;
        this.panelWidth = 0;
        this.panelDistance = 0;
        this.activePanel = 1;

        $.extend(this.settings, defaults, opts);
        this.$carousel = $('#' + this.settings.elementId);

        if (this.$carousel.length) {
            this.$carouselSlider = this.$carousel.find('.carousel-slider');
            this.$carouselItemsContainer = this.$carousel.find('.carousel-items-container');
            this.$btnNext = this.$carousel.find('.carousel-next');
            this.$btnPrev = this.$carousel.find('.carousel-prev');

            if (this.settings.content !== null) {
                this.$carouselItemsContainer.html(this.settings.content);
            }

            this.$carouselItems = this.$carouselItemsContainer.children(this.settings.moveItem); 
            var selectFirstEl = this.$carouselItems.filter('[data-index="0"]');
            selectFirstEl.addClass('selected');
            
            this.numItems = this.$carouselItems.length;
            this.bindHandlers();
            this.calculateVisibleItems();
        }
    }

    BasicCarousel.prototype = {
        
    	/**
    	 *  A function to animate the carousels when a user has clicked on the next or previous buttons
    	 * 
    	 */	
    	animateSlide : function (slidePosition) {
            var x = 0,
                y = 0,
                translateStr = '';

            if (this.settings.isHorizontal) {
                x = slidePosition + 'px';
            } else {
                y = slidePosition + 'px';
            }
            
            if (common.cssTransitionsSupported()) {
                translateStr = 'translate3d(' + x + ', ' + y + ', 0)';
                this.$carouselItemsContainer.css({
                    '-webkit-transform': translateStr,
                    '-moz-transform' : translateStr,
                    '-ms-transform': translateStr,
                    '-o-transform': translateStr,
                    'transform': translateStr
                });
            } else {
            	this.$carouselItemsContainer.css('left', x);
            }
        },
        
        /**
         *  A function to maintain the logic for the carousel slides
         * 
         */
        animateSet : function (direction, jumpToPanel) {
            var slidePos = 0;
            
            if (direction !== null) {
	            if (direction === -1) {
	                this.$btnPrev.removeClass('disabled');
	                if (this.activePanel === 0) {
	                	this.activePanel += 1;
	                }
	                
	                if (this.activePanel === 1) {
	                	slidePos = this.panelWidth * -1;             
	                } else {
	                	this.panelDistance = ((this.activePanel) * this.panelWidth) * -1;
	                	slidePos = this.panelDistance;  
	                }
	                
	                this.panelDistance += this.panelWidth;
	            	this.activePanel += 1;
	                
	                if (this.activePanel === this.numPanels) {
	                	this.$btnNext.addClass('disabled');
	                }
	            } else {                
	                if (this.activePanel !== 2) {
						this.activePanel -= 1;
						this.panelDistance = ((this.activePanel -1) * this.panelWidth) * -1;				
						slidePos = this.panelDistance;						
						this.$btnNext.removeClass('disabled');
	                } else {
	                	if (this.numPanels === 2) {
	                		this.$btnNext.removeClass('disabled');
	                	}
	                	this.$btnPrev.addClass('disabled');
						this.activePanel = 1;
	                	this.panelDistance = 0;
						slidePos = this.panelDistance * -1;
	                }                
	            }
            } else {
            	var newPanel = jumpToPanel -1;
            	slidePos = (this.panelWidth * newPanel) * -1;
            	this.panelDistance = slidePos;
            	
            	if (jumpToPanel !== 1) {
            		this.$btnPrev.removeClass('disabled');
            	}            	
            	if (jumpToPanel === this.numPanels) {	
            		this.$btnNext.addClass('disabled');
            	}            	
            }
            
            this.animateSlide(slidePos);
        },

        /**
         *  A function to maintain the logic for the visible area of the carousels 
         * 
         */
        calculateVisibleItems : function () {
            var viewableSize = this.settings.isHorizontal ? this.$carouselSlider.width() : this.$carouselSlider.height();
            this.itemSize = this.settings.isHorizontal ? this.$carouselItems.first().outerWidth(true) : this.$carouselItems.first().outerHeight(true);
            this.visibleItems = Math.floor(viewableSize / this.itemSize);
            this.calculatePanels(this.visibleItems);
            this.handleHotItems('reset');
            this.handleHotItems('init');
            if (this.numItems < 2 && this.$carousel.is(':visible')) {
            	this.$carousel.hide();
            }
        },
        
        /**
         *  A function to set carousel panel logic
         * 
         */
        calculatePanels : function (visibleItems) {
        	var $productContainer = $('#product-carousel');
        	var selectedIndex;
        	this.panelItemCount = 0;
        	this.numPanels = 0;
        	this.panelWidth = 0;
        	this.animateSet(0);
        	this.panelItemCount = visibleItems;
        	this.numPanels = Math.ceil(this.numItems / this.panelItemCount);
        	this.panelWidth = this.itemSize * this.panelItemCount;
        	if (this.numPanels < 2) {
        		this.$btnNext.addClass('disabled');
        	}
        	
	    	if ($productContainer.hasClass('zoomVisible')) {
        		selectedIndex = $('#product-thumb-carousel ul.carousel-items-container li.selected').data('index');
        	} else if ($productContainer.hasClass('videoVisible')) {
        		selectedIndex = $('#product-thumb-carousel-videos ul.carousel-items-container li.selected').data('index');        	
        	}
        		        		
    		if ((selectedIndex + 1) > this.panelItemCount) {        				
    			var updatedPanel = Math.ceil(selectedIndex / this.panelItemCount);
    			this.activePanel = updatedPanel;
    			this.animateSet(null, this.activePanel);
			} else {
				this.activePanel = 1;        		
    		}
    		
    		if (selectedIndex < this.panelItemCount) {
                this.$btnPrev.addClass('disabled'); 
    		}
        },

        /**
         *  A function to check if the element has a 'hot area'
         * 
         */
        checkPosition : function ($el) {
        	if ($el !== undefined) {
        		if ($el.hasClass('hot')) { 		
	        		if (!$el.hasClass('panel-' + this.activePanel)) {
	        			this.animateSet(-1);
	        		}
	        	}
	        }
        },
        
        /**
         *  A function to control 'hot areas'. 'Hot areas' are the carousel elements that a partially hidden but still
         *  visible to the user, if the user clicks on one of the 'hot areas' the carousel should slide forward
         * 
         */
        handleHotItems : function (action) {
        	if (action === 'init') {
        		if (this.$carouselItems.length > 4) {
        			var $hotItems = this.$carouselItems.filter(':nth-child(' + this.panelItemCount + 'n+1)').not(':first');
	        		$hotItems.addClass('hot');
	        		$hotItems.each(function(index) {
	        			$(this).addClass('panel-' + parseInt((index)+2));
	        		});
        		}
        	} else
        	if (action === 'reset') {
        		var $oldSelectedEl = this.$carouselItemsContainer.find('li.selected'),
        			$carouselEl = this.$carouselItems;
        		if ($oldSelectedEl.length > 0) {
        			var updatedIndex = $oldSelectedEl.data('index');
        			$carouselEl.removeClass();
        			var newSelectedEl = this.$carouselItemsContainer.find('li[data-index="'+ updatedIndex +'"]');
        			newSelectedEl.addClass('selected');
        		} else {
        			$carouselEl.removeClass();
        		}
        	}
        },
  
        /**
         *  A function to maintain logic for the 'next' and 'previous' arrows on the carousels
         * 
         */
        checkArrows : function() {
        	var $next = $('#btn-s7-next'),
        		$prev = $('#btn-s7-prev');
        	
        	if (this.selectedItem === 0) {
        		if (this.numItems > 1) {
            		if ($next.hasClass('disabled')) {
            			$next.removeClass('disabled');
                	}
            	}
        		if (!$prev.hasClass('disabled')) {
            		$prev.addClass('disabled');
            	}
            }
            
            if (this.selectedItem > 0) {
        		if ($next.hasClass('disabled')) {
        			$next.removeClass('disabled');
        		}
            }
            
            if (this.selectedItem === (this.numItems - 1)) {
            	if (!$next.hasClass('disabled')) {
            		$next.addClass('disabled');
            	}
            }
            
            if (this.selectedItem === (this.numItems - 2)) {
        		if ($next.hasClass('disabled')) {
        			$next.removeClass('disabled');
        		}
            }
            
            if (this.selectedItem === 1 || this.numItems > 1 && this.selectedItem !== 0) {
        		if ($prev.hasClass('disabled')) {
        			$prev.removeClass('disabled');
        		}
            }
        },
        
        /**
         *  A function to select a specific Scene7 asset
         * 
         */
        setItem : function (index, $el) {
            if (index >= 0 && index < this.numItems) {
                this.selectedItem = index;
                this.$carouselItems.removeClass('selected');
                this.$carouselItems.each(function () {
                	if ($(this).data('index') === index) {
    					$(this).addClass('selected');
    					return false;
    				}
                });            
                this.checkPosition($el);
                this.checkArrows();

				if ((this.selectedItem + 1) > (this.panelItemCount * this.activePanel)) {
                	this.animateSet(-1);
    			}
                
                var targetPanel = Math.ceil((this.selectedItem + 1) / this.panelItemCount);
    			if (this.activePanel !== targetPanel) {
                	this.animateSet(1);
                }
                
                if (typeof this.settings.onItemClick === 'function') {
                    this.settings.onItemClick(index);
                }
            }
        },
        
        /**
         *  A function to select the next Scene7 asset
         * 
         */
        next : function () {
            if (this.selectedItem < (this.numItems - 1)) {
                if (this.selectedItem === 0) {
                	$('#btn-s7-prev').removeClass('disabled');
                }
            	this.selectedItem += 1;
            	if (this.selectedItem === (this.numItems - 1)) {
            		$('#btn-s7-next').addClass('disabled');
            	}
                this.setItem(this.selectedItem);
            }
        },

        /**
         *  A function to select the previous Scene7 asset
         * 
         */
        prev : function () {
            if (this.selectedItem > 0) {
            	if (this.selectedItem === 1) {
            		$('#btn-s7-prev').addClass('disabled');
            	} else
            	if (this.selectedItem === (this.numItems - 1)) {
            		$('#btn-s7-next').removeClass('disabled');            		
            	}
            	this.selectedItem -= 1;
                this.setItem(this.selectedItem);
            }
        },
        
        /**
         *  A function to bind events for the carousels
         * 
         */
        bindHandlers : function () {
            var self = this;

            this.$carousel.on('click', '.carousel-step', function (evt) {
                evt.stopImmediatePropagation();
            	var direction = $(evt.target).hasClass('carousel-prev') ? 1 : -1;
                var disabled = $(evt.target).hasClass('disabled');
                
                if (!disabled) {
                	self.animateSet(direction);
                }
            });

            this.$carousel.on('click', 'li', function () {
                var index = parseInt($(this).data('index'), 10);
                self.setItem(index, $(this));
            });
        }
    };

    return BasicCarousel;

});