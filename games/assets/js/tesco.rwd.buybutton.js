/*******************************************************************************************************************
* Module
* BuyButton - This module handles all the "Add to basket" functionality on the PLP
*******************************************************************************************************************/
TESCO.Buybutton = {
    init: function() {
        this.initFramework();
        this.bindAddButtons();
    },
    initFramework: function() {
    	var _myInlineRequests = ['addItemtoBasket'];
    	var _myRequests = {'selectAddToBasket' : ['buybuttonContainer','basketContainer']
                    };
		var _myModules = {'buybuttonContainer' : ['input.add-to-basket', 'Adding item to basket','basket'],
							'basketContainer' : ['div#basket', '', false, false, false]
		                  };
		
		// This will be produced/generated from the server side. If this object does not exist, it will default to _myDefaultActions
		var _myActions = { 'selectAddToBasket' : ['/stubs/select-addToBasket.php']
		                    };
		                    
		// This will be present in the JS file as it holds the default values for this specific functionailty/module i.e. Checkout          
		var _myDefaultActions = { 'selectAddToBasket' : ['/stubs/select-addToBasket.php']
		                    };

    	TESCO.Data.Global.init({
			'inlineRequests': _myInlineRequests,
			'requests': _myRequests,
			'modules': _myModules,
			'actions': _myActions,
			'defaultActions': _myDefaultActions			
		});
    },
    bindAddButtons: function() {         
        $('#listing div.product').on("click", ".btn-add-to-basket", function(e) {
            e.preventDefault();          
            TESCO.Buybutton.addItemtoBasket($(this));
            return false;
        });
    },
    addItemtoBasket: function(oElem) {
        var _request = 'selectAddToBasket';
        var _oForm = TESCO.Utils.getFormByElement(oElem);
		var _url = TESCO.Utils.getAction(_request, _oForm);		
        var DL = new TESCO.DataLayer();        
        var _myData = _oForm.serialize();
        DL.get(_url, _myData, oElem, null, _request, null, null, function(oResp){			
			TESCO.Common.displayBasket();
			$('#basket-toggle .open-basket').trigger('click');
		});        
    }
};

$(document).ready(function() {         
    // Module check is required before every init as the module may not be required.
    if ($('#listing').length) {
    	TESCO.Buybutton.init();
    }
});
