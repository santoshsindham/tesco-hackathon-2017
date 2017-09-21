/* eslint-disable */
/*jshint loopfunc: true */
define(['domlib', 'modules/breakpoint', 'modules/common', 'modules/tesco.utils'], function ($, breakpoint, common, utils) {

    // match the heights of the passed collection of items
    $.fn.equaliseHeights = function (delay) {
        var newHeight = 0,
            tempHeight = 0,
            len = this.length,
            i = 0,
            different = false;

        if (len > 0) newHeight = $(this).eq(i).height();

        for (i = 0; i < len; i++) {
            tempHeight = $(this).eq(i).height();
            if (different == false && tempHeight !== newHeight) different = true;
            if (tempHeight > newHeight) newHeight = tempHeight;

        }

        if (different) {
            // Update first item
            $(this).height(newHeight);
        }
    };

    // return if the passed collection of items are all empty
    $.fn.isEmpty = function () {
        return $(this).filter(function () {
            return $.trim($(this).html()).length;
        }).length === 0;
    };

    var productTile = {

        tilesElement: '.product-carousel, .product-carousel-heroic',

        /**
         * @name TESCO.Products.Height.adjust
         * @description This method figures out the height of a set of product tiles
         */
        Height: {

            /*
				DEFAULTS:
				------------------------------------------------------------
				JS to set height for:
				* product title     - min-height set in CSS only
				* additional info   - optional (unavailable/special offer text)
				* former prices     - optional
				* savings           - optional

				Height set in CSS only (never changes):
				* colour swatches   - optional
				* ratings           - always visible
				* buy from/seller   - always visible
				* price             - always visible

				JS HIDE ONLY: Height set in CSS only, row visibilty check still performed
				* colour swatches
				* additional info


				KIOSK:
				------------------------------------------------------------
				JS to set height for:
				* product title     - min-height set in CSS only

				Height set in CSS only (never changes):
				* colour swatches   - optional
				* ratings           - always visible
				* buy from/seller   - always visible
				* former prices     - optional but inline with actual price wrapper - former and actual sit side-by-side
				* price             - always visible
				* additional info   - optional, unavailable/special offer always last to appear in product tile for kiosk

				Hidden in kiosk view:
				* savings
				* stock alert cta
				* add to compare cta


				NOTES (applys to both defaults and kiosk):
				------------------------------------------------------------
				* additional info   - unavailable/special offers use the same space - their optional and only one or the other will ever be visibile at any time
				* author/artist     - should not exceed 1 line - css ellipsis being used rather than JS ellipsis
				* format/release    - should not exceed 1 line - css ellipsis being used rather than JS ellipsis


				PERFORMANCE NOTES:
				Performance related changes are minimal and the gain is only minor, but over multiple itterations could add up
				------------------------------------------------------------
				* where possible, removed dependancy on jquery/zepto ( mainly for loop over .each(), elm.style[x] over $(x).height() )
				* passing already collected elements such as $wrapper, $list, $items, rowLength etc to functions that need them rather than traversing the dom again
				* array assignment using array index in place of push
				* split the optional element classes into 2 groups as kiosk only needs to call height equalising on a small subset of the default
				* where element heights don't change, heights or min-heights are being set in the CSS - this reduces the number of optional element classes to loop over
				* added checks for certain classes where only the visibilty check is performed - height adjust not required as heights for these elements set in CSS
				* added check to move onto the next optional elements if nothing found matching current optional element class
				* added check so if the optional elements are all empty, then hide them and immediately move onto the next set
				* added a classname to the elements that have been equalised - this is to benefit the plp load more functionality to ensure that only the newly added
		          tiles are equalised rather than running over the entire set again. This class is ignore if the height adjust is called on a viewport change
				* remove the call to normaliseHeights in the init for load-more/common.js - was causing the listing grid to run the height adjust twice
				* amended the ellipsis call to perform on the passed product tiles only instead of all - will only run on all if the includeEqualised flag is set
			*/
            optionalElementClasses: {
                defaults: [
                    '.colour-swatch-container', // VISIBILITY CHECK ONLY, JS WON'T SET HEIGHT - height in CSS as it never changes
                    '.title-author-format',
                    '.former-prices-container',
                    '.additional-info', // VISIBILITY CHECK ONLY, JS WON'T SET HEIGHT - height in CSS as it never changes
                    '.button-container',
                    '.unavailable-special-offer',
                    '.buy-block'
                ],
                kiosk: [
                    '.title-author-format'
                ]
            },

            equalisedClassName: 'js-equalised',
            reEqualiseClassName: 'js-re-equalise',

            adjust: function ($wrapper, fn, includeEqualised, oLoadMore, rowElems) {
              // DEBUG - performance monitor
              var self = productTile.Height,
                $context = window.isKiosk()
                  ? $wrapper
                  : $wrapper.not('.list-view'),
                $items = null,
                rowLength = null,
                delay = null,
                classNames = null,
                $list = $('.products', $context); // If there are 40+ items then increase delay between row height adjust

              window.$firstInRow; // This variable will help not to call getFirstInRow() everytime there is a swatch tap/click.

              if (rowElems !== undefined && rowElems.length) {
                $items = rowElems;
              } else {
                $items = self.getItems($list, includeEqualised)
              }
              rowLength = self.getRowLength($wrapper, $list, $items);
              delay = ($items.length < 40)
                ? 20
                : 50;
              // Before we initalise make sure there are no forced feature tile heights
              $items.find('.feature-content').css('height', '');

              // update item collection is height adjust called from plp load more functionality
              if (oLoadMore) {
                $items = self.getLoadMoreItems($list, $items, rowLength, oLoadMore);
              }

              if (!$items.length) {
                return;
              }
              // Call the function getFirstInRow() only on page load. Not on swatch swipes.
              if ((!rowElems && !window.$firstInRow)) {
                $firstInRow = self.getFirstInRow($wrapper, $items);
              } else if((!rowElems && oLoadMore)) {
                $.merge($firstInRow, self.getFirstInRow($wrapper,
                  $items,
                  oLoadMore,
                  $firstInRow));
              }

              classNames = (breakpoint.kiosk)
                ? self.optionalElementClasses.kiosk
                : self.optionalElementClasses.defaults;

              for (var i = 0, iLen = $firstInRow.length; i < iLen; i += 1) {
                (function(i, iLen, $wrapper, $firstInRow, rowLength, classNames, fn) {
                  setTimeout(function () {
                    var nextFirst = (i < iLen - 1)
                      ? $firstInRow.eq(i + 1).index()
                      : $wrapper.find('.product-tile:last').index() + 1,
                      equalClass = (i < iLen - 1)
                      ? self.equalisedClassName
                      : self.reEqualiseClassName,
                      thisRowLength = window.isKiosk()
                      ? 10
                      : nextFirst - $firstInRow.eq(i).index();
                    if (rowElems !== undefined && rowElems.length) {
                      if (rowElems.index($firstInRow[i]) > -1) {
                        productTile.Height.performRowItems(
                          $wrapper,
                          $firstInRow,
                          thisRowLength, i,
                          classNames,
                          equalClass);
                      }
                    } else {
                      productTile.Height.performRowItems(
                        $wrapper,
                        $firstInRow,
                        thisRowLength, i,
                        classNames,
                        equalClass,
                        fn);
                    }
                  }, delay * i); // End setTimeout
                })(i, iLen, $wrapper, $firstInRow, rowLength, classNames, fn);
              }

              if (oLoadMore) {
                setTimeout(function () {
                  $(window).trigger('productTilesAdjusted', [oLoadMore]);
                }, 500);
              }
            },

            // as we're using the dotdotdot plugin, we need to set the height of the heading in order for
            // this plugin to function correctly. Can't set a global height in the css as the heading height
            // is variable and can change across rows (an entire row can have a single line of text so pointless
            // having this hardcoded in the css as 60px when it's only 20px for the row.
            setHeadingHeights: function ($elms) {
                var self = productTile.Height,
                    headings = [],
                    rowLines = [],
                    len = $elms.length,
                    i = 0,
                    lineHeights = [],
                    $elemAuthor;

                // store headings and get the highest/max number of lines for the headings in the row
                for (i = 0; i < len; i++) {
                    headings[i] = $('h3', $elms[i]);
                    lineHeights[i] = self.getLineHeight(headings[i]);
                    rowLines[i] = Math.round(headings[i].height() / lineHeights[i]);

                    // if the product is a media type (dvd, book, cd), check to see if the format/release wrapper
                    // has content, if so, then apply height to the author/artist wrapper to ensure all format/release
                    // wrappers align across the row regarless of whether the author/artist wrapper has content or not
                    if (headings[i].hasClass('media')) {
                        var $formatRelease = $('.format-release', $elms[i]);

                        if (!$formatRelease.isEmpty()) {
                            $elemAuthor = $('.author', $elms[i]);
                            if ($elemAuthor.length) {
                                $('.author', $elms[i]).height(self.getLineHeight($formatRelease) + 'px');
                            }
                        }
                    }
                }

                // get the height lines value
                var maxLines = Math.max.apply(Math, rowLines);
                var m = 0;

                // apply/cap the heights of all product headings
                for (i = 0; i < len; i++) {

                    // copy the maxlines value - needs to be adjusted individually for each heading instance
                    m = maxLines;

                    // if the heading is a media type (book, dvd, cd etc), then the heading should not exceed 2 lines
                    if (m > 2 && headings[i].hasClass('media')) {
                        m = 2;
                    }

                    // else, all other headings should not exceed 3 lines
                    if (m > 3) {
                        m = 3;
                    }

                    //headings[i][0].style.height = (lineHeights[i] * m) + 'px';
                    headings[i].height((lineHeights[i] * m));
                }
            },

            // check if its the kiosk plp listing product grid - this displays as 2 rows instead of 1 in kiosk
            isKioskListing: function ($wrapper) {
                return window.isKiosk() && $wrapper[0].id === 'listing';
            },

            // check if it's the 'grid-3' layout listing product grid - this hides buttons e.g. add to basket button
            isListingWithHiddenButtons: function ($wrapper) {
                if ($wrapper.attr('id') === 'listing') {
                    if ($wrapper.hasClass('grid-33321')) {
                        return true;
                    }
                }

                return false;
            },

            // return the line height for an element
            getLineHeight: function ($elm) {
                return parseFloat($elm.css('line-height'));
            },

            // exclude list items that are hidden or if it's the load more action for the plp page
            getItems: function ($list, includeEqualised) {
                var self = productTile.Height;
                var $items = $('> li', $list).not('.hidden, .load-more-tile, .loadingBar');

                // if it's not a viewport change, exclude items that have already been equalised (used for plp load more functionality)
                if (!includeEqualised && !breakpoint.kiosk) {

                    $items = $items.filter(':not(.' + self.equalisedClassName + ')');
                    $items = $items.filter(':not(.' + self.reEqualiseClassName + ')');
                }

                return $items;
            },

            // as the load more items can be appended to the end of a row, make sure we add the previous row items to
            // the $items array, so that the entire row can be correctly equalised
            getLoadMoreItems: function ($list, $items, rowLength, oLoadMore) {
                var self = productTile.Height;

                if (!$items.length) {
                    return $items;
                }

                if (breakpoint.vTablet || breakpoint.hTablet) {
                    if (oLoadMore.isPrevious === false) {
                        var $first = $items.eq(0);
                        var $allItems = self.getItems($list, true);
                        var $prevItems = $();
                        var $prev;

                        var startIndex = $allItems.index($first);
                        var offsetTop = parseInt($first.offset().top, 10);

                        for (var i = rowLength - 1; i > 0; i--) {
                            $prev = $allItems.eq(startIndex - i);

                            // make sure the offset tops are the same - if not, assume the previous in a different row
                            if (parseInt($prev.offset().top, 10) === offsetTop) {
                                $prevItems = $prevItems.add($prev.removeClass(self.equalisedClassName));
                            }
                        }
                        $items = $prevItems.add($items);
                    }

                }

                return $items;
            },

            // return the number of items per row
            getRowLength: function ($wrapper, $list, $items) {
                var self = productTile.Height;
                var len = 0;

                //Remove feature tiles as they mess with calculation
                $items = $items.filter(':not(.feature-tile)');

                // product grid - stacked rows
                if ($wrapper.hasClass('product-grid')) {
                    // kiosk plp listing grid - divide total items length by 2 for the 2 rows
                    if (self.isKioskListing($wrapper)) {
                        len = Math.round($items.length / 2);
                    }

                    // standard grid, divide the lists width by the width of the first item to get the total number of items for the row
                    else {
                        //len = Math.round( $list[0].offsetWidth / $items[0].offsetWidth );
                        len = Math.round($list.eq(0).width() / $items.eq(0).width());
                    }
                }

                // product carousel - everything will be in a single row
                else if ($wrapper.hasClass('product-carousel')) {
                    len = $items.length;
                }

                return len;
            },

            // return a collection of first in row elements for each row
            getFirstInRow: function ($wrapper, $items, oLoadMore, $firstInRow) {
              var self = productTile.Height,
                $first = [],
                i = 0,
                prevOffsetTop = -1;

                // product grid - stacked rows
              if ($wrapper.hasClass('product-grid')) {
                // kiosk plp listing grid
                if (self.isKioskListing($wrapper)) {
                  if (common.isKioskListingWithOneRow($wrapper)) {
                    $first = $items.eq(0);
                  } else {
                    // get the 1st and 2 items only as kiosk plp listing grid stacks items as:
                    // 1, 3, 5, 7
                    // 2, 4, 6, 8
                    $first = $items.filter(':nth-child(1), :nth-child(2)');
                  }
                } else {
                // standard grid, get the first item and keep adding the rowLength to get
                // the first for each row
                  prevOffsetTop = oLoadMore ? $firstInRow.last().offset().top : -1;
                  // Finished with re-equalise class so remove it
                  $items.removeClass(self.reEqualiseClassName)

                  // Add row-start class
                  // Offset.top is used because the first item on the row could be floated right
                  for (i = 0; i < $items.length; i += 1) {
                    // Detect start of new row
                    // (new tile offset top is greater than old tile offset top)
                    if ($items.eq(i).offset().top > prevOffsetTop) {
                      $items.eq(i).addClass('row-start');
                      prevOffsetTop = $items.eq(i).offset().top;
                    } else if ($items.eq(i).offset().top < prevOffsetTop) {
                      // Detect if new tile fits in a gap left by feature tile
                      $items.eq(i).addClass('gap-filler-m');
                    }
                  }
                  $first = $items.filter('.row-start');
                }
              } else if ($wrapper.hasClass('product-carousel')) {
                // product carousel - should be just 1 row so grab the first element
                $first = $items.eq(0);
              }
              return $first;
            },

            // return all the elements in current row
            getRowItems: function ($wrapper, $first, length, i) {
                var self = productTile.Height;

                // kiosk plp listing grid - will need to alternate the item collection for row as kiosk plp listing grid stacks items as:
                // 1, 3, 5, 7
                // 2, 4, 6, 8
                if (self.isKioskListing($wrapper)  && !common.isKioskListingWithOneRow($wrapper)) {
                    return $first.add($first.nextAll(':nth-child(' + (i === 0 ? 'odd' : 'even') + ')').slice(0, length - 1));
                } else {
                    return $first.add($first.nextAll(':not(.hidden)').slice(0, length - 1));
                }
            },

            // as the heights of product tiles have been adjusted, the height of the load more tile will also need to be adjusted
            // hack to get around circular dependancy (otherwise product-tile JS will reference load-more JS which will reference product-tile JS etc...)
            updateLoadMoreTileHeight: function () {
                /*
				var $loadMore = $('#listing .load-more-tile');
				if ($loadMore.length) {
					$loadMore.height( $loadMore.prev().height() );
				}
				*/
            },

            init: function init(includeEqualised, rowElems) {
                productTile.tilesElement = $(productTile.tilesElement);

                var self = productTile.Height, oLoadMore;
                var $wrappers = productTile.tilesElement.filter(':visible').not('#recently-viewed');

                // note: ellipsis plugin slow!
                for (var i = 0, len = $wrappers.length; i < len; i++) {
                    self.adjust($($wrappers[i]), productTile.Ellipsis.init, includeEqualised, oLoadMore, rowElems);
                }
            },
            performRowItems: function ($wrapper, $firstInRow, rowLength, i, classNames, equalClass, fn) {
                //collect all of the product items for the current row
                var rows = $firstInRow.length,
                    self = productTile.Height,
                    $rowItems = self.getRowItems($wrapper, $firstInRow.eq(i), rowLength, i),
                    isListingWithHiddenButtons = self.isListingWithHiddenButtons($wrapper);

                // Get 3 items from next row to see if any gap fillers are present (MVP)
                var $gapFillers = self.getRowItems($wrapper, $firstInRow.eq(i + 1), 3, i + 1);
                $gapFillers = $gapFillers.filter('.gap-filler');

                $rowItems = $rowItems.filter(':not(.gap-filler)').add($gapFillers);

                $gapFillers.removeClass('gap-filler');

                $(classNames.join(','), $rowItems).attr('style', '');

                var $itemsToEqualise = $();
                var $itemsToHide = $();

                for (var j = 0, jLen = classNames.length; j < jLen; j++) {
                    // collect all the elements in the current row matching the current class name
                    var $optional = $(classNames[j], $rowItems);

                    // remove any previous height and display amends
                    // this process is re-run on viewport change as the row column count changes
                    //$optional.attr('style', '');

                    // move onto the next optional elements if nothing found matching current optional element class
                    if (!$optional.length) {
                        continue;
                    }

                    // if the optional elements are all empty, then hide them and move onto the next set
                    if (!breakpoint.kiosk && $optional.isEmpty()) {
                        //$optional.hide();
                        $itemsToHide = $itemsToHide.add($optional);
                        continue;
                    }

                    if (classNames[j] === '.button-container') {
                        if (!$optional.find('.primary-button, .secondary-button').length) {
                            //$optional.hide();
                            $itemsToHide = $itemsToHide.add($optional);
                        } else {
                            if (!isListingWithHiddenButtons) {
                                $optional.show();
                            }
                        }
                    }

                    // the height for the elements with these classes are set in the css
                    // the visibilty check above only needs to be applied - no need to set height using JS
                    if (classNames[j] === '.colour-swatch-container' || classNames[j] === '.additional-info') {
                        continue;
                    }

                    // finally, equalise the heights of the optional elements
                    $optional.equaliseHeights();

                }

                $itemsToHide.hide();

                // add height adjusted class to the list items that have been updated
                // this is to stop the height adjust from being re-run when load more is called on plp
                $rowItems.addClass(equalClass);

                //$itemsToEqualise = $itemsToEqualise.add($optional);


                // DEBUG - check speed EXCLUDING the ellipsis plugin call
                // console.log((new Date() - start) / 1000);

                // pass only the updated items to the function
                // excludes previously updated items from being processed for a second time
                if (fn !== undefined && fn) {
                    fn($rowItems);
                }

                // DEBUG - check speed INCLUDING the ellipsis plugin call (ellipsis plugin is slow!)
                // console.log((new Date() - start) / 1000);

                // Update feature tile on row
                var $featureTile = $rowItems.find('.feature-content');
                var $featureImage = $featureTile.find('img');
                var imageHeight = $featureImage.height();
                var featureHeight = $featureTile.height();
                var productHeight = $rowItems.find('.product').height() + 16;
                var newHeight = (productHeight < featureHeight) ? featureHeight : productHeight - 0.5;

                $featureTile.height(newHeight);
                $featureImage.css('margin-top', (newHeight - imageHeight) / 2);

                //$itemsToEqualise.equaliseHeights();

                /*
				(function($myOptional) {
					setTimeout(function() {
						$myOptional.equaliseHeights();
					}, 100);
				})($optional);
				*/

            }
        },

        /**
         * @name TESCO.Products.Ellipsis.init
         * @description This method forms the ellipses on the product tiles
         */
        Ellipsis: {
            init: function init($elems) {

                /*
				//	Added parameter to allow new elements to be passed, this is required for Infinity browse.
				if (!$elems) {
					$elems = productTile.tilesElement;
				}
				*/

                common.Ellipsis.init($elems.find('.product h3'));

                /*
				(function($elems) {
					setTimeout(function() {
						$elems.find('.product h3').dotdotdot({
							ellipsis  : '\u2026',
							wrap      : 'word',
							watch     : false,
							tolerance : 0
						});
					}, 10);
				})($elems);
				*/
            }
        },

        checkFrom: function (data) {
            var target = (data) ? data : $('#listing');

            $('.product', target).each(function () {
                if ($('.retailer', this).length > 1) {
                    $('.price', this).prepend('From ');
                }
            });
        },

        decorateClickEvent: function () {
            if (common.isInIframe()) {
                var message = {},
                    $products = jQuery('.product-carousel li .product, .product-carousel-heroic li .product');
                $products.each(function () {
                    $(this).on('click tap', function (e) {
                        e.stopPropagation();
                        e.preventDefault();
                        message.action = 'redirect';
                        message.href = $(this).find('a').attr('href');
                        common.sendCrossWindowMessage(message);
                    });
                });
            }
        },
        ie8TileFormat: function () {
            if ($('html').hasClass('ie8')) {
                $('.products li:nth-child(5n+1) .product').addClass('firstInRow');
            }
        }
    };

    // ensure that the includeEqualised flag is set so all items are collected
    // productTile.Height.init() is also called from the plp load more functionality

    breakpoint.mobileIn.push(function () {
        productTile.Height.init(true);
    });
    breakpoint.vTabletIn.push(function () {
        productTile.Height.init(true);
    });
    breakpoint.hTabletIn.push(function () {
        productTile.Height.init(true);
    });
    breakpoint.desktopIn.push(function () {
        productTile.Height.init(true);
    });
    breakpoint.largeDesktopIn.push(function () {
        productTile.Height.init(true);
        productTile.ie8TileFormat();
    });
    breakpoint.kioskIn.push(function () {
        productTile.Height.init(true);
    });

    return productTile;
});
