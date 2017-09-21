define(function (require, exports, module) {
  'use strict';

  /**
   *
   * @param {Object} config
   * @return {Element}
   */
  var createElements = function createElements(config) {
    var elm = document.createElement(config.tagName),
      errs = [];

    Object.keys(config).forEach(function (key) {
      if (key === 'tagName' || key === 'children') return;

      try {
        if (key !== 'style') {
          elm[key] = config[key];
          return;
        }

        Object.keys(config[key]).forEach(function (style) {
          elm[key][style] = config[key][style];
        });
      } catch (err) {
        errs.push('CreateElements module: ' + err);
      }
    });

    if (Array.isArray(config.children)) {
      config.children.forEach(function (childConfig) {
        var output = null;

        if (childConfig.tagName) {
          output = createElements(childConfig);

          if (output.errors) {
            errs = errs.concat(output.errors);
          }

          elm.appendChild(createElements(childConfig).elements);
        }
      });
    }

    return { elements: elm, errors: errs };
  };

  module.exports = createElements;
});
