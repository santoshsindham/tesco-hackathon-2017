define(function (require, exports, module) {
  'use strict';

  var fn = require('../mvc/fn');

  /**
   *
   * @type {Object}
   */
  var lineClampStyles = {
    height: '',
    webkitLineClamp: '',
    display: '-webkit-box',
    webkitBoxOrient: 'vertical',
    overflow: 'hidden'
  };

  /**
   *
   * @constructor
   * @param {Element} element
   * @return {Controller}
   */
  var Clampdown = function Clampdown(element) {
    this._errors = [];
    var message = 'Clampdown::constructor::The element is not a valid HTML Element';
    if (!(element instanceof Element)) this._setError(message);
    this._clamp = null;
    this._clamped = false;
    if (this._errors.length) return;
    this._element = element;
    this._target = element.firstElementChild;
    this._targetText = this._target.innerText;
  };

  /**
   *
   * @private
   * @param {Element} element
   * @param {string} className
   * @return {void}
   */
  Clampdown.prototype._addClass = function (element, className) {
    element.className += ' ' + className;
  };

  /**
   *
   * @private
   * @return {void}
   */
  Clampdown.prototype._clampTarget = function () {
    this._target.innerText = this._targetText.substring(0, this._charLimit);
    this._addClass(this._element, 'clampdown');
    this._addClass(this._target, 'line-clamped');
  };

  /**
   *
   * @private
   * @param {string} style
   * @return {any}
   */
  Clampdown.prototype._parseStyle = function (style) {
    return style.replace(/px/, '');
  };

  /**
   *
   * @private
   * @param {Element} element
   * @param {string} className
   * @return {void}
   */
  Clampdown.prototype._removeClass = function (element, className) {
    var regex = new RegExp('(\\s|^)' + className + '(\\s|$)');
    element.className = element.className.replace(regex, ' ');
  };

  /**
   *
   * @private
   * @param {string} message
   * @return {void}
   */
  Clampdown.prototype._setError = function (message) {
    this._errors.push(message);
  };

  /**
   *
   * @private
   * @return {void}
   */
  Clampdown.prototype._styleTarget = function () {
    var styles = fn.copyObject(lineClampStyles);
    styles.height = this._targetHeight + 'px';
    styles.webkitLineClamp = this._lineCount;
    this._addClass(this._element, 'clampdown');
    var _this = this;

    Object.keys(styles).forEach(function (key) {
      _this._target.style[key] = styles[key];
    });
  };

  /**
   *
   * @private
   * @return {void}
   */
  Clampdown.prototype._unclampTarget = function () {
    this._target.innerText = this._targetText;
    this._removeClass(this._target, 'line-clamped');
  };

  /**
   *
   * @param {Object} [opts]
   * @param {number} [opts.buffer]
   * @return {void}
   */
  Clampdown.prototype.calc = function (opts) {
    var _opts = opts || {};
    if (this._errors.length) return;
    var parentHeight = this._element.clientHeight;
    this._targetHeight = this._target.clientHeight;
    this._clamp = parentHeight < this._targetHeight;
    if (!this._clamp) return;
    var styles = getComputedStyle(this._target);
    var lineHeight = this._parseStyle(styles.lineHeight);
    this._lineCount = Math.floor(parentHeight / lineHeight);
    this._lineClampSupport = !!styles.webkitLineClamp;
    if (this._lineClampSupport) return;
    var fontSize = this._parseStyle(styles.fontSize);
    var charWidth = Math.ceil(fontSize / 2);
    var targetWidth = this._target.clientWidth;
    var charPerLine = Math.floor(targetWidth / charWidth);
    var buffer = _opts.buffer || 0.5;
    var charBuffer = Math.floor(charPerLine * buffer);
    this._charLimit = Math.floor((this._lineCount * charPerLine) - charBuffer);
  };

  /**
   *
   * @param {Object} opts
   * @return {void}
   */
  Clampdown.prototype.clamp = function (opts) {
    this.calc(opts);
    this.set();
  };

  /**
   *
   * @param {Object} opts
   * @return {void}
   */
  Clampdown.prototype.reclamp = function (opts) {
    if (this._lineClampSupport) return;
    this._unclampTarget();
    this.clamp(opts);
  };

  /**
   *
   * @return {void}
   */
  Clampdown.prototype.set = function () {
    if (this._errors.length || !this._clamp) return;

    if (this._lineClampSupport) {
      this._styleTarget();
      return;
    }

    this._clampTarget();
    this._clamped = true;
  };

  module.exports = Clampdown;
});
