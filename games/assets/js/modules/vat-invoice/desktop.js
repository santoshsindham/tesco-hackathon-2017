/*global define: true */
define(['domlib', 'modules/common', './common'], function($, common, vatInvoice){

	common.init.push(function(){		
    
        var vatInvoiceEl = $(vatInvoice.vatInvoiceItemsContainer);
        
        if ( vatInvoiceEl.length ) {
        
            vatInvoice.init();
            
        }
        
	});
	
	return vatInvoice;

});