define(['domlib', 'modules/common'], function ($, common) {
    'use strict';

    var expandCollapse = {

        onToggle: function onToggle(e) {
            e.preventDefault();
            var $currentTarget =  $(e.currentTarget),
                $target = $currentTarget.hasClass("trigger") ? $currentTarget : $currentTarget.parents(".blinkbox-banner").find(".trigger");

            expandCollapse.toggleContent($target);
            $target.toggleClass('collapsed');
        },

        toggleContent: function toggleContent($currentTarget) {
            if ($currentTarget.hasClass('collapsed')) {
                $currentTarget.parent().find('.ellipsis').hide();
                $currentTarget.parent().find('.expanded').show();
            } else {
                $currentTarget.parent().find('.ellipsis').show();
                $currentTarget.parent().find('.expanded').hide();
            }
        },

        init: function init() {
            var $elements = $('.expand-collapse'),
                $this;

            $elements.find('.expanded').addClass('collapsed');
            $elements.each(function () {
                $this = $(this);
                if ($this.hasClass("blinkbox-banner")) {
                    $this.find(".trigger").bind("click tap", function (e) {
                        expandCollapse.onToggle(e);
                    });
                } else {
                    var event = (common.isTouch()) ? 'tap click' : 'click';
                    $this.on(event, '.trigger', expandCollapse.onToggle);
                }
            });
        }
    };

    common.init.push(expandCollapse.init);

    return expandCollapse;
});