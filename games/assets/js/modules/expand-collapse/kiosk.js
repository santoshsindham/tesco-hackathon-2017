define(['domlib', 'modules/common', './common', 'modules/overlay/common'], function ($, common, expandCollapse, overlay) {
    'use strict';

    expandCollapse.toggleContent = function ($currentTarget) {
        /*
        common.overlay.show({
            overlayContent: $currentTarget.parent().find('p').clone(),
            customClass: 'read-more'
        });
        */
        var otherProductdetails = $('section.non-book').html(),
            bookdetails = $('section.details-content').html(),
            synopsis = $('section.synopsis').html(),
            biography = $('section.biography').html(),
            prod_details_synopsis_detailedDesc = $('section.book').html(),
            $detailsOrSynopsis = $('.tab-view #tab-product-details').length > 0 ? '#tab-product-details' : '#tab-product-synopsis',
            PDPOverlayContent;

        $currentTarget = $currentTarget !== undefined && $currentTarget !== 'undefined' ? $currentTarget : null;
        if ($('section.synopsis').length) {
            PDPOverlayContent = synopsis;
        }

        if ($('section.biography').length) {
            PDPOverlayContent = biography;
        }

        if (($('section.synopsis').length) && ($('section.biography').length)) {
            PDPOverlayContent =  synopsis + biography;
        }

        if ($('section.details-content').length) {
            PDPOverlayContent = bookdetails;
        }

        if ($('section.details-content').length && $('section.synopsis').length) {
            PDPOverlayContent = bookdetails + synopsis;
        }

        if (($('section.details-content').length) && ($('section.synopsis').length) && ($('section.biography').length)) {
            PDPOverlayContent = bookdetails + synopsis + biography;
        }

        if (($('section.book p.prod-synopsis').length) && ($('section.book p.prod-detailed-desc').length)) {
            PDPOverlayContent = prod_details_synopsis_detailedDesc;
        }

        if (($('section.book p.prod-synopsis').length) && ($('section.book p.prod-detailed-desc').length) && ($('section.biography').length)) {
            PDPOverlayContent = prod_details_synopsis_detailedDesc + biography;
        }

        if ($('section.non-book').length) {
            PDPOverlayContent = otherProductdetails;
        }

        if (!($($detailsOrSynopsis).length > 0)) {
            if ($("#lightbox").length === 0) {
                overlay.show({
                    content: PDPOverlayContent,
                    type: "lightbox",
                    defaultBreakPointBehavior: false,
                    customClass: 'read-more',
                    fixedWidth: 1280,
                    enablePagination: true,
                    paginationHeader: '<h1>Product description</h1>'
                });
                $("#lightbox").addClass("read-more-hide");
            }
        }
    };

    common.init.push(expandCollapse.init);
});