define(['domlib', './common', '../common'], function($, pdp, common){
    common.init.push(function(){
        pdp.init();
    });

});