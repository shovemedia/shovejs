define (function (require) {
	
	var signals = require('lib/signals');
	
	
	/**
	 * A utility class for tracking selected and deselected model instances
	 */
	var SelectionService = function(){
		this.deselectSignal = new signals.Signal();
		this.selectSignal = new signals.Signal();	
	}
	
	/**
	 * Select a model and dispatch the selectSignal
	 */
	SelectionService.prototype.select = function (selection)
	{
		if (selection)
		{
			this.selectSignal.dispatch({selection:selection});
		}
	}

	/**
	 * Deselect a model and dispatch the deselectSignal
	 */
	SelectionService.prototype.deselect = function (selection)
	{
		this.deselectSignal.dispatch({selection:selection});
	}
	
	return SelectionService;
})