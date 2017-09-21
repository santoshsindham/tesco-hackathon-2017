/*global console:true */
define(['domlib', 'modules/common', 'modules/breakpoint'], function($, common, breakpoint){

	var compare = {

		table: '#compare-table',
		selected: 0,


		select: function(e){
			$(e.target).parent('a').toggleClass('selected');

			if($(e.target).parent('a').hasClass('selected')){
				compare.selected++;
			}else{
				compare.selected--;
			}

			if(compare.selected > 0){
				$('.filter').removeClass('disabled');
			}else{
				$('.filter').addClass('disabled');
			}

			return false;
		},


		filter: function(e){
			e.preventDefault();
			var label;

			if(!$(e.target).hasClass('disabled')){
				//apply filter
				compare.table.addClass('filtered');

				//hide non selected rows
				compare.table.find('.checkbox')
					.parent('a').not('.selected')
					.closest('tr').hide();

					//hide tables if they have no selected rows
				compare.table.find('.compare-group').each(function(){
				if(!$(this).has('.selected').length){
						$(this).hide();
					}
				});

				$('.buttons .show-all').show();

				$("html, body").animate({ scrollTop: 0 }, 400, 'swing');

				$(this).addClass('disabled');
			}

			return false;
		},

		showAll: function(e){
			//remove filter
			compare.table.removeClass('filtered');

			$('.buttons .show-all').hide();

			$('.buttons .filter').removeClass('disabled');
			
			compare.table.find('.compare-group').each(function(){
				$(this).show();
				$(this).find('tr').show();
			});
		},


		remove: function(e){
			var colIndex = $(e.target).closest('td').index();

			var productLink = $('.products-wrapper').attr('data-compare-ds-url');
			productLink += '?method=remove&product=' + encodeURI($(e.target).attr('data-compare'));
			$.get(productLink, function(data) {

				var remaining = 0;

				$('.products td').eq(colIndex).fadeOut(function(){
					$(this).html('').appendTo('.products tr').show();
					remaining = compare.checkProducts();
				});

				$('.compare-group tr').each(function(){
					var cell = $(this).find('td').eq(colIndex), self = this;
					cell.fadeOut(function(){
						cell.html('').appendTo(self).show().addClass('removed');
						if (remaining===4) {
							$("#compare-table").fadeOut();
						}
					});
				});



			});
			return false;
		},

		checkProducts: function(e){

			var max = 4,
				num = $('.products td .product').length,
				remaining = max - num;

			//show overlay, change label and set class
			$('.empty-column-overlay').addClass('remaining-' + remaining).find('.remaining').text(' '+ remaining);

			//plural?
			var plural = $('.empty-column-overlay').find('.plural');
			if(remaining > 1){
				if(remaining <= 3){
					plural.text('s');
				}else{
					$('.empty-column-overlay .content p b').text('4 products');
				}
			}else{
				plural.text('');
			}

			//update h2 label
			$('.products h2 .num-items').text(num);
			return remaining;
		},


		carousel: {

			columns: [],
			offset: 0,
			trail: [0],

			stickyTitle: function(){
				var self = compare.carousel,
					activeCol = $('.compare-group tbody tr').eq(self.activeCol()),
					group = activeCol.closest('.compare-group'),
					title = activeCol.closest('.compare-group').find('thead .group-title'),
					//offset = self.columns[self.activeCol()].offset - group.offset().left + $('.compare-groups-wrapper').offset().left;
					offset = title.position().left - self.offset - 8, //8 padding
					width = group.width() + offset - 16; //16 padding

				$('thead .group-title').css({'-webkit-transform': 'none', width: '100%'}).removeClass('truncate');

				title.css({'-webkit-transform': 'translate3D(' + -offset + 'px,0,0)', width: width}).addClass('truncate');
			},


			activeCol: function(){
				var self = compare.carousel,
					activeCol;

				for(var i=0;i<self.columns.length;i++){
					if(self.offset === self.columns[i].offset){
						activeCol = i;
						break;
					}
				}

				return activeCol;
			},


			previous: function(){
				var self = compare.carousel,
					nextCol;

				if(self.trail.length > 1){

					nextCol = self.trail[self.trail.length-2];

					$('.compare-groups').css({'-webkit-transform': 'translate3D(' + -self.columns[nextCol].offset + 'px,0,0)'});

					self.trail.pop();
					self.offset = self.columns[nextCol].offset;

					self.navCheck();
					self.stickyTitle();

				}

				return false;

			},


			next: function(){
				var self = compare.carousel,
					nextCol;

				if(self.offset + $(window).width() - $('.compare-groups-wrapper').offset().left < self.columns[self.columns.length-1].offset + self.columns[self.columns.length-1].width){

					for(var i=0;i<self.columns.length;i++){
						var col = self.columns[i];

						if(col.offset - self.offset > $(window).width() - $('.compare-groups-wrapper').offset().left){
							break;
						}

						nextCol = i;
					}

					self.offset = self.columns[nextCol].offset;
					self.trail.push(nextCol);

					$('.compare-groups').css({'-webkit-transform': 'translate3D(' + -self.columns[nextCol].offset + 'px,0,0)'});

					self.navCheck();
					self.stickyTitle();
				}
				return false;
			},



			navCheck: function(){
				var self = compare.carousel;

				if(self.trail.length > 1){
					$('.kiosk-carousel-nav .previous').parent('li').removeClass('disabled');
				}else{
					$('.kiosk-carousel-nav .previous').parent('li').addClass('disabled');
				}

				if(self.offset + $(window).width() - $('.compare-groups-wrapper').offset().left < self.columns[self.columns.length-1].offset + self.columns[self.columns.length-1].width){
					$('.kiosk-carousel-nav .next').parent('li').removeClass('disabled');
				}else{
					$('.kiosk-carousel-nav .next').parent('li').addClass('disabled');
				}

				return false;
			},



			init: function(){
				var self = this;

				$('.compare-group tbody tr').each(function(){
					var col = {
						width: $(this).width(),
						offset: $(this).offset().left - $('.compare-groups-wrapper').offset().left
					};
					self.columns.push(col);
				});

				//bind events
				$('.kiosk-carousel-nav .next').on('click', self.next);
				$('.kiosk-carousel-nav .previous').on('click', self.previous);
				common.kioskSwipe('left', $('.compare-groups-wrapper'), self.next);
				common.kioskSwipe('right', $('.compare-groups-wrapper'), self.previous);

			}

		},


		init: function(){

			if(breakpoint.desktop || breakpoint.largeDesktop || window.isKiosk()){
				compare.table = $(compare.table);
				if(compare.table.length){

					//bind events
					$('.checkbox', compare.table).parent('a').on('click', compare.select);
					$('.buttons .filter').on('click', compare.filter).addClass('disabled');
					$('.buttons .show-all').on('click', compare.showAll);
					$('.product .close', compare.table).on('click', compare.remove);

				}
			}

			if(window.isKiosk()){
				compare.carousel.init();
				$('.buttons .continue-shopping').addClass('secondary-button');
			}
		}

	};

	common.init.push(compare.init);

	return compare;

});
