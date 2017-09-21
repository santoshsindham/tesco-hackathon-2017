/* jslint */
/* globals console,define,require,window */
define('modules/pdp/data-stores/RelatedItem', [], function () {
  'use strict';

  var RelatedItem = function RelatedItem(oData) {
    this.links = oData.links || null;
  };

  return RelatedItem;
});
