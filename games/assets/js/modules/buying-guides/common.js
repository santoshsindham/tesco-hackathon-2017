/*global define:true, Microsoft: true */
define(['domlib', 'modules/common', 'modules/breakpoint'], function($, common, breakpoint){

	var buyingGuides = {

		topics: {
			$wrapper : [],
			$trigger : [],
			$menu    : [],
			selector : '#main-content .topic-list',

			// show the 'select topics' button
			enable: function() {
				var topics = buyingGuides.topics;

				if (breakpoint.mobile) {
					topics.$wrapper.removeClass('open');
					topics.$trigger.show();
				}
			},

			// hide the 'select topics' button
			disable: function() {
				var topics = buyingGuides.topics;

				topics.$wrapper.removeClass('open');
				topics.$trigger.hide();

				// remove focus from trigger link otherwise button stays highlighted when moving between viewports
				topics.$trigger.find('a').blur();
			},

			open: function() {
				var topics = buyingGuides.topics;

				if (breakpoint.mobile) {
					topics.$wrapper.addClass('open');
					topics.$trigger.find('a').attr('data-icon', 1);

					// close any other drop downs that may be open
					common.dropdownCheck(topics.close, topics.selector);
				}
			},

			close: function() {
				var topics = buyingGuides.topics;

				if (breakpoint.mobile) {
					topics.$wrapper.removeClass('open');
					topics.$trigger.find('a').attr('data-icon', 2);

					// cleanup dropdown close detection
					common.clearCancelDropdown();
				}
			},

			// hide/show the display of the ul menu by toggling 'open' class on the topics wrapper
			toggle: function(e) {
				var topics = buyingGuides.topics;

				e.preventDefault();
				e.stopPropagation();

				if (breakpoint.mobile) {
					if (topics.$wrapper.hasClass('open')) {
						topics.close();
					} else {
						topics.open();
					}
				}

				return false;
			},

			// content placement adjustments for desktop and large desktop
			contentAdjust: function() {

				var doAdjust = function(extendOptions) {
					var defaults = {
						isEnabled: false,
						className: '',
						selector : '',
						$content : ''
					};

					var opts = $.extend({}, defaults, extendOptions);

					if (opts.$content === '' || opts.selector === '' || opts.className === '') {
						return;
					}

					var $element = opts.$content.find(opts.selector).eq(0);
					var $parent  = $element.parents('.topic-content-inner');

					if ($element.length && $parent.length) {
						// add the class first so the elements position is adjusted before attempting to get it's height and position
						// set the min height of the first inner content container as the element will now be positioned absolutely
						if (opts.isEnabled) {
							opts.$content.addClass( opts.className );
							$parent.css('min-height', $element.outerHeight() + parseInt($element.css('margin-bottom'), 10) );
							$element.css('top', $parent.offset().top - opts.$content.offset().top );
						}

						// reset
						else {
							if (opts.$content.hasClass( opts.className )) {
								opts.$content.removeClass( opts.className );
								$parent.css('min-height', '');
								$element.css('top', '');
							}
						}
					}
				};

				$('#main-content .topic-content').each(function(){
					var $content = $(this);

					// blockquotes
					doAdjust({
						isEnabled: breakpoint.largeDesktop,
						$content : $content,
						selector : 'blockquote',
						className: 'topic-content-with-block-quote'
					});

					// videos
					doAdjust({
						isEnabled: breakpoint.desktop || breakpoint.largeDesktop,
						$content : $content,
						selector : '.video-container',
						className: 'topic-content-with-video'
					});

					// small images
					doAdjust({
						isEnabled: breakpoint.desktop || breakpoint.largeDesktop,
						$content : $content,
						selector : '.topic-image-small',
						className: 'topic-content-with-video'
					});
				});
			}
		},

		init: function() {
			var topics = buyingGuides.topics;

			topics.$wrapper = $(topics.selector);

			if (!topics.$wrapper.length) {
				return;
			}

			topics.$trigger = topics.$wrapper.find('.select-topic');
			topics.$menu    = topics.$wrapper.find('ul');

			// bind toggle to trigger to show/hide the menu (toggle() function checks if mobile)
			topics.$trigger.find('a').on('tap click', topics.toggle);

			// bind menu close to the menu links (close() function checks if mobile)
			topics.$menu.find('a').on('tap click', topics.close);

			// init the breakpoint functions here so only enabled if the wrapper is found
			breakpoint.mobileIn.push(function(){
				buyingGuides.topics.enable();
				buyingGuides.topics.contentAdjust();
			});

			breakpoint.vTabletIn.push(function(){
				buyingGuides.topics.disable();
				buyingGuides.topics.contentAdjust();
			});

			breakpoint.hTabletIn.push(function(){
				buyingGuides.topics.disable();
				buyingGuides.topics.contentAdjust();
			});

			breakpoint.desktopIn.push(function(){
				buyingGuides.topics.disable();
				buyingGuides.topics.contentAdjust();
			});

			breakpoint.largeDesktopIn.push(function(){
				buyingGuides.topics.disable();
				buyingGuides.topics.contentAdjust();
			});
		}
	};

	// init module
	common.init.push(buyingGuides.init);

	return buyingGuides;
});