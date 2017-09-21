/*globals define,require,window */
/*jslint plusplus: true, regexp: true, unparam: true */
define('modules/catalog-navigation/common', ['domlib', 'modules/breakpoint', 'modules/common', 'modules/smart-menu-hover/common', 'modules/mvc/fn'], function ($, breakpoint, common, SmartMenuHover, fn) {
    'use strict';

    var CatalogNavigation = function CatalogNavigation() {
        var pvInit,
            createJqueryObjects,
            setNoChildCategoriesDataAttr,
            bindEvents,
            initSmartMenuHoverObjs,
            bindBackLinkEvents,
            bindNavigationEvents,
            catalogNavigationCloseeEventsHandler,
            bindDepartmentEvents,
            departmentEventsDefaultHandler,
            departmentEventsMouseEnterHandler,
            departmentEventsMouseLeaveHandler,
            bindCategoryEvents,
            categoryEventsDefaultHandler,
            categoryEventsMouseEnterHandler,
            categoryEventsMouseLeaveHandler,
            openDepartment,
            closeDepartment,
            closeOpenDepartments,
            addDepartmentFlyoutImage,
            openCategory,
            closeCategory,
            closeOpenCategories,
            scrollToPosition,
            scrollToPositionHandler,

            oSELECTORS = {
                BACKLINK: '#catalogue-nav-back-link',
                MENULINK: '#catalogue-nav-link',
                MASTHEADWRAPPER: '#masthead-wrapper',
                CATNAV: '#catalogue-nav-wrapper',
                DEPARTMENTS: '#catalogue-nav ul.departments > li',
                CATEGORIES: '#catalogue-nav ul.categories-l1 > li',
                DEPARTMENTSLINK: '#catalogue-nav ul.departments > li > a',
                CATEGORIESLINK: '#catalogue-nav ul.categories-l1 > li > a'
            },
            oCSSCLASS = {
                CATEGORYOPEN: 'catNavCategoryOpen',
                DEPARTMENTOPEN: 'catNavDepartmentOpen',
                NAVIGATIONOPEN: 'catNavOpen',
                DROPDOWNOPEN: 'dropdownOpen',
                NOCHILDCATEGORIES: 'noChildCategories',
                CATEGORIESVISIBLE: 'categoriesVisible',
                SUBCATEGORIESVISIBLE: 'subCategoriesVisible'
            },
            oEVENTS = {
                CATEGORYOPENCOMPLETE: 'catalogNavigationCategoryOpenComplete',
                CATEGORYCLOSECOMPLETE: 'catalogNavigationCategoryCloseComplete',
                DEPARTMENTOPENCOMPLETE: 'catalogNavigationDepartmentOpenComplete',
                DEPARTMENTCLOSECOMPLETE: 'catalogNavigationDepartmentCloseComplete',
                NAVIGATIONOPENCOMPLETE: 'catalogNavigationOpenComplete',
                NAVIGATIONCLOSECOMPLETE: 'catalogNavigationCloseComplete',
                OPENNAVIGATIONDROPDOWN: 'openNavigationDropdown',
                CLOSENAVIGATIONDROPDOWN: 'closeNavigationDropdown',
                SCROLLTOTOP: 'catalogNavScrollToTop'
            },
            oJQUERYOBJS = {
                $CATNAV: null,
                $MASTHEADWRAPPER: null
            },
            oSmartMenuHovers = {
                departments: null,
                caregories: null
            },

            oTimeouts = {},
            bIsTouch = false,
            bindFlyoutImageEvents;

        pvInit = function pvInit(bForceTouch) {
            if ((window.isKiosk() && common.isPage('homepage')) === false) {
                if ($(oSELECTORS.CATNAV).length) {
                    bIsTouch = bForceTouch === true || window.isKiosk() ? true : common.isTouch();
                    createJqueryObjects();
                    setNoChildCategoriesDataAttr();
                    bindEvents();

                    if (bIsTouch === false) {
                        initSmartMenuHoverObjs();
                    }
                }
            }
        };

        createJqueryObjects = function createJqueryObjects() {
            oJQUERYOBJS.$MASTHEADWRAPPER = $(oSELECTORS.MASTHEADWRAPPER);
            oJQUERYOBJS.$CATNAV = $(oSELECTORS.CATNAV);
        };

        setNoChildCategoriesDataAttr = function setNoChildCategoriesDataAttr() {
            oJQUERYOBJS.$CATNAV.find('.has-no-category').data(oCSSCLASS.NOCHILDCATEGORIES, true);
        };

        bindEvents = function bindEvents() {
            var sEvent = 'click';
            if (!bIsTouch) {
                sEvent = 'hover';
            }
            bindBackLinkEvents(sEvent);
            bindNavigationEvents();
            bindDepartmentEvents(sEvent);
            bindCategoryEvents(sEvent);
            bindFlyoutImageEvents();
        };

        initSmartMenuHoverObjs = function initSmartMenuHoverObjs() {
            oSmartMenuHovers.departments = new SmartMenuHover({
                advanced: true,
                delegate: oSELECTORS.CATNAV,
                target: oSELECTORS.DEPARTMENTS,
                child: 'ul.categories-l1',
                position: {
                    desktop: 'below',
                    device: 'right'
                },
                reset: {
                    delegate: oSELECTORS.MASTHEADWRAPPER,
                    event: oEVENTS.NAVIGATIONCLOSECOMPLETE
                }
            });
            oSmartMenuHovers.departments.init();

            oSmartMenuHovers.caregories = new SmartMenuHover({
                advanced: true,
                delegate: oSELECTORS.CATNAV,
                target: oSELECTORS.CATEGORIES,
                child: 'ul.categories-l2',
                position: {
                    desktop: 'right',
                },
                reset: {
                    delegate: oSELECTORS.CATNAV,
                    event: oEVENTS.DEPARTMENTCLOSECOMPLETE
                }
            });
            oSmartMenuHovers.caregories.init();
        };

        bindBackLinkEvents = function bindBackLinkEvents(sEvent) {
            $(oSELECTORS.BACKLINK).on(sEvent, function bindBackLinkEventsHandler(e) {
                e.preventDefault();
                if ($(this).data(oCSSCLASS.CATEGORYOPEN) === true && $(this).data(oCSSCLASS.DEPARTMENTOPEN) === true) {
                    closeOpenCategories('nav', oJQUERYOBJS.$CATNAV, true);
                } else {
                    closeOpenDepartments('nav', oJQUERYOBJS.$CATNAV, true);
                }
            });
        };

        bindNavigationEvents = function bindNavigationEvents() {
            oJQUERYOBJS.$MASTHEADWRAPPER.on('catalogNavigationCloseComplete', catalogNavigationCloseeEventsHandler);
            oJQUERYOBJS.$MASTHEADWRAPPER.on(oEVENTS.SCROLLTOTOP, scrollToPositionHandler.bind(this));
        };

        catalogNavigationCloseeEventsHandler = function catalogNavigationCloseeEventsHandler() {
            closeOpenDepartments('nav', oJQUERYOBJS.$CATNAV, false);
        };

        scrollToPosition = function scrollToPosition(oArgs) {
            if (!oArgs || !oArgs.sScrollBaseElement) {
               return;
            }
            if (oArgs.iScrollBasePosition !== undefined && fn.isFalsy(oArgs.iScrollBasePosition)) {
              return;
            }
            $(oArgs.sScrollBaseElement).scrollTop(oArgs.iScrollBasePosition);
        };

        scrollToPositionHandler = function scrollToPositionHandler(oEvent, sElement, iPosition) {
            var oArgs = {};

            oArgs.sScrollBaseElement = sElement !== undefined ? sElement : null;
            oArgs.iScrollBasePosition = iPosition !== undefined && $.isNumeric(iPosition) ? iPosition : 0;

            if (oArgs.sScrollBaseElement !== null && $(oArgs.sScrollBaseElement).length > 0) {
                if ($(oArgs.sScrollBaseElement).scrollTop() > oArgs.iScrollBasePosition) {
                    scrollToPosition(oArgs);
                }
            }
        };

        bindDepartmentEvents = function bindDepartmentEvents(sEvent) {
            if (sEvent === 'click') {
                oJQUERYOBJS.$CATNAV.on(sEvent, oSELECTORS.DEPARTMENTSLINK, departmentEventsDefaultHandler.bind(this));
            } else {
                oJQUERYOBJS.$CATNAV.on('smartMenuHover.mouseenter', oSELECTORS.DEPARTMENTS, departmentEventsMouseEnterHandler.bind(this))
                    .on('smartMenuHover.mouseleave', oSELECTORS.DEPARTMENTS, departmentEventsMouseLeaveHandler.bind(this));
            }
        };

        departmentEventsDefaultHandler = function departmentEventsDefaultHandler(e) {
            var $department = $(e.target).parent('li');

            e.preventDefault();
            if ($department.data(oCSSCLASS.DEPARTMENTOPEN)) {
                if (breakpoint.desktop || breakpoint.largeDesktop) {
                    closeDepartment($department, true, true);
                } else {
                    closeDepartment($department, false, true);
                }
            } else {
                openDepartment($department);
            }
        };

        departmentEventsMouseEnterHandler = function departmentEventsMouseEnterHandler(e) {
            if ($(e.target).is(oSELECTORS.DEPARTMENTS)) {
                clearTimeout(oTimeouts.closeDepartment);
                openDepartment($(e.currentTarget));
            }
        };

        departmentEventsMouseLeaveHandler = function departmentEventsMouseLeaveHandler(e) {
            var eventCurrentTarget = e.currentTarget;

            if ($(e.target).is(oSELECTORS.DEPARTMENTS)) {
                oTimeouts.closeDepartment = setTimeout(function () {
                    if (breakpoint.desktop || breakpoint.largeDesktop) {
                        closeDepartment($(eventCurrentTarget), true, true);
                    } else {
                        closeDepartment($(eventCurrentTarget), false, true);
                    }
                }, 599);
            }
        };

        bindCategoryEvents = function bindCategoryEvents(sEvent) {
            if (sEvent === 'click') {
                oJQUERYOBJS.$CATNAV.on(sEvent, oSELECTORS.CATEGORIESLINK, categoryEventsDefaultHandler.bind(this));
                $('#catalogue-nav').on(sEvent, '.flyout-image img', function (e) {
                	   window.location.href = e.target.getAttribute('href');
                });
            } else {
                oJQUERYOBJS.$CATNAV.on('smartMenuHover.mouseenter', oSELECTORS.CATEGORIES, categoryEventsMouseEnterHandler.bind(this))
                    .on('smartMenuHover.mouseleave', oSELECTORS.CATEGORIES, categoryEventsMouseLeaveHandler.bind(this));
            }
        };

        categoryEventsDefaultHandler = function categoryEventsDefaultHandler(e) {
            var $category = $(e.target).parent('li');

            if ($category.data(oCSSCLASS.NOCHILDCATEGORIES) !== true) {
                e.preventDefault();
                if ($category.data(oCSSCLASS.CATEGORYOPEN)) {
                    closeCategory($category, true);
                } else {
                    openCategory($category);
                }
            }
        };

        categoryEventsMouseEnterHandler = function categoryEventsMouseEnterHandler(e) {
            if ($(e.target).is(oSELECTORS.CATEGORIES)) {
                clearTimeout(oTimeouts.closeCategory);
                openCategory($(e.currentTarget));
            }
        };

        categoryEventsMouseLeaveHandler = function categoryEventsMouseLeaveHandler(e) {
            var eventCurrentTarget = e.currentTarget;

            if ($(e.target).is(oSELECTORS.CATEGORIES)) {
                oTimeouts.closeCategory = setTimeout(function () {
                    closeCategory($(eventCurrentTarget), true);
                }, 300);
            }
        };

        openDepartment = function openDepartment($department) {
            var $categoryList = $department.children('ul');

            $categoryList.addClass(oCSSCLASS.CATEGORIESVISIBLE);

            if (oJQUERYOBJS.$CATNAV.data(oCSSCLASS.DEPARTMENTOPEN) === true) {
                closeOpenDepartments('dep', $department, false);
            }

            if (breakpoint.desktop || breakpoint.largeDesktop || window.isKiosk()) {
                addDepartmentFlyoutImage($department);
            }

            $department.addClass(oCSSCLASS.DEPARTMENTOPEN)
                .data(oCSSCLASS.DEPARTMENTOPEN, true);
            oJQUERYOBJS.$CATNAV.addClass(oCSSCLASS.DEPARTMENTOPEN)
                .data(oCSSCLASS.DEPARTMENTOPEN, true)
                .trigger(oEVENTS.DEPARTMENTOPENCOMPLETE);
            $(oSELECTORS.BACKLINK).addClass(oCSSCLASS.DEPARTMENTOPEN)
                .data(oCSSCLASS.DEPARTMENTOPEN, true);

            if (breakpoint.mobile || breakpoint.vTablet || breakpoint.hTablet) {
                oJQUERYOBJS.$MASTHEADWRAPPER.trigger(oEVENTS.SCROLLTOTOP, [oSELECTORS.CATNAV, 0]);
            }
            if (breakpoint.desktop || breakpoint.largeDesktop) {
                if (oJQUERYOBJS.$MASTHEADWRAPPER.data(oCSSCLASS.NAVIGATIONOPEN) !== true) {
                    oJQUERYOBJS.$MASTHEADWRAPPER.trigger(oEVENTS.OPENNAVIGATIONDROPDOWN);
                }
            }
        };

        closeDepartment = function closeDepartment($department, bCloseNav, bTransition) {
            var $categoryList = $department.children('ul');

            if (window.isKiosk()) {
                bTransition = false;
            }

            if (bTransition) {
                if (bCloseNav) {
                    $categoryList.removeClass(oCSSCLASS.CATEGORIESVISIBLE);
                } else {
                    if (window.Modernizr.csstransitions) {
                        $categoryList.one('transitionend', function () {
                            $categoryList.removeClass(oCSSCLASS.CATEGORIESVISIBLE);
                        });
                    } else {
                        $categoryList.removeClass(oCSSCLASS.CATEGORIESVISIBLE);
                    }
                }
            } else {
                $categoryList.removeClass(oCSSCLASS.CATEGORIESVISIBLE);
            }

            closeOpenCategories('dep', $department, false);

            $department.removeClass(oCSSCLASS.DEPARTMENTOPEN)
                .data(oCSSCLASS.DEPARTMENTOPEN, false);
            oJQUERYOBJS.$CATNAV.removeClass(oCSSCLASS.DEPARTMENTOPEN)
                .data(oCSSCLASS.DEPARTMENTOPEN, false)
                .trigger(oEVENTS.DEPARTMENTCLOSECOMPLETE);
            $(oSELECTORS.BACKLINK).removeClass(oCSSCLASS.DEPARTMENTOPEN)
                .data(oCSSCLASS.DEPARTMENTOPEN, false);

            if (breakpoint.desktop || breakpoint.largeDesktop) {
                if (bCloseNav) {
                    oJQUERYOBJS.$MASTHEADWRAPPER.trigger(oEVENTS.CLOSENAVIGATIONDROPDOWN);
                }
            }
        };

        addDepartmentFlyoutImage = function addDepartmentFlyoutImage($department) {
            var $flyoutImage = $department.find('.flyout-image'),
                sImageTag = '<img></img>',
                sUrl,
                sHref;

            if ($flyoutImage.length > 0 && $flyoutImage.data('srcimg') !== false) {
                sUrl = $flyoutImage.data('srcimg');
                sHref = $flyoutImage.data('url');
                $flyoutImage[0].innerHTML = sImageTag;
                $flyoutImage.find('img')
                    .attr('src', sUrl)
                    .attr('href', sHref);
                $flyoutImage.data('srcimg', false);
            }
        };

        closeOpenDepartments = function closeOpenDepartments(sKey, $selector, bTransition) {
            var $department;

            if (sKey === 'nav') {
                $department = oJQUERYOBJS.$CATNAV.find('li.catNavDepartmentOpen');
            } else {
                $department = $selector.siblings('li.catNavDepartmentOpen');
            }

            if ($department.length === 1) {
                closeDepartment($department, false, bTransition);
            } else if ($department.length > 1) {
                $department.each(function () {
                    closeDepartment($(this), false, bTransition);
                });
            }
        };

        openCategory = function openCategory($category) {
            var $subCategory = $category.children('ul');
            $subCategory.addClass(oCSSCLASS.SUBCATEGORIESVISIBLE);

            if (oJQUERYOBJS.$CATNAV.data(oCSSCLASS.CATEGORYOPEN) === true) {
                closeOpenCategories('cat', $category, false);
            }

            $category.addClass(oCSSCLASS.CATEGORYOPEN)
                .data(oCSSCLASS.CATEGORYOPEN, true);
            oJQUERYOBJS.$CATNAV.addClass(oCSSCLASS.CATEGORYOPEN)
                .data(oCSSCLASS.CATEGORYOPEN, true)
                .trigger(oEVENTS.CATEGORYOPENCOMPLETE);
            $(oSELECTORS.BACKLINK).addClass(oCSSCLASS.CATEGORYOPEN)
                .data(oCSSCLASS.CATEGORYOPEN, true);

            if (breakpoint.mobile || breakpoint.vTablet || breakpoint.hTablet) {
                oJQUERYOBJS.$MASTHEADWRAPPER.trigger(oEVENTS.SCROLLTOTOP, [oSELECTORS.CATNAV, 0]);
            }
        };

        closeCategory = function closeCategory($category, bTransition) {
            var $subCategory = $category.children('ul');

            if (bTransition) {
                if (window.Modernizr.csstransitions) {
                    oJQUERYOBJS.$CATNAV.one('transitionend', function () {
                        $subCategory.removeClass(oCSSCLASS.SUBCATEGORIESVISIBLE);
                    });
                } else {
                    $subCategory.removeClass(oCSSCLASS.SUBCATEGORIESVISIBLE);
                }
            } else {
                $subCategory.removeClass(oCSSCLASS.SUBCATEGORIESVISIBLE);
            }

            $category.removeClass(oCSSCLASS.CATEGORYOPEN)
                .data(oCSSCLASS.CATEGORYOPEN, false);
            oJQUERYOBJS.$CATNAV.removeClass(oCSSCLASS.CATEGORYOPEN)
                .data(oCSSCLASS.CATEGORYOPEN, false)
                .trigger(oEVENTS.CATEGORYCLOSECOMPLETE);
            $(oSELECTORS.BACKLINK).removeClass(oCSSCLASS.CATEGORYOPEN)
                .data(oCSSCLASS.CATEGORYOPEN, false);
        };

        closeOpenCategories = function closeOpenCategories(sKey, $selector, bTransition) {
            var $category;

            if (sKey === 'dep' || sKey === 'nav') {
                $category = $selector.find('li.catNavCategoryOpen');
            } else {
                $category = $selector.siblings('li.catNavCategoryOpen');
            }

            if ($category.length === 1) {
                closeCategory($category, bTransition);
            } else if ($category.length > 1) {
                $category.each(function () {
                    closeCategory($(this), bTransition);
                });
            }
        };

        bindFlyoutImageEvents = function bindFlyoutImageEvents() {
            if (oJQUERYOBJS.$CATNAV.length) {
                oJQUERYOBJS.$CATNAV.on('click', '.flyout-image img', function (e) {
                    var sImageHREF = $(e.target).attr('href');
                    if (sImageHREF) {
                        window.location.href = sImageHREF;
                    }
                });
            }
        };

        return {
            init: function init(bForceTouch) {
                pvInit(bForceTouch);
            }
        };

    };

    return CatalogNavigation;

});
