define('modules/pdp/data-stores/FormHandler', [], function () {
  'use strict';

  /**
   * Structured data object for form handlers.
   * @param {Object} data Data to be added into the structured data object.
   * @return {void}
   */
  function FormHandler(data) {
    /**
     * ATG limition means we cannot use the form ID as the unique key for the form on the
     * frontend, so instead we are using the name form attribute and assigning that to the id.
     */
    this.id = data.name || null;
    this.name = data.id || null;
    this.method = data.method || null;
    this.action = data.action || null;
    this.oData = data.oData || {};
  }

  return FormHandler;
});
