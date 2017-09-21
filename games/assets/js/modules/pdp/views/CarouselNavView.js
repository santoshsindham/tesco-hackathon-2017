define('modules/pdp/views/CarouselNavView', [
  'domlib',
  'modules/mvc/fn',
  'modules/pdp/views/BaseView'
], function ($, fn, BaseView) {
  var CarouselNavView = function (oConfig) {
    this.sViewName = 'CarouselNavView';
    this.sNamespace = 'deliveryOptions';
    this.sViewClass = 'delivery-snippet-wrapper';
    this.sTemplate = $('#carousel-nav-template')[0].innerHTML;
    this.parent.constructor.call(this, oConfig);
  };

  fn.inherit(CarouselNavView, BaseView);

  CarouselNavView._name = 'CarouselNavView';

  return CarouselNavView;
});
