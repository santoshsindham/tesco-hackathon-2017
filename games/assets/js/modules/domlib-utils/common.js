// General domlib utility plugins and extensions.
/*globals jQuery*/

(function ($) {

    'use strict';

    $.fn.verticallyCentre = function () {
        return this.each(function () {
            var $this = $(this),
                height = $this.height(),
                parentHeight = $this.parent().height(),
                top = Math.ceil((parentHeight - height) / 2);
            $(this).css('top', top);
        });
    };

}(jQuery));