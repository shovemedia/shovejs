define (function (require) {

	var Dictionary = require('shovejs/model/Dictionary');

	/**
	 * The MediatorMap stores a link betwen View classes and Mediator classes
	 * The Context class usually creates this automaticaly.
	 */
	var MediatorMap = function()
	{
		this.mediatorClassByViewClass = new Dictionary();
	}

	/**
	 * Add a mapping from viewClass to mediatorClass
	 */
	MediatorMap.prototype.mapView = function (viewClass, mediatorClass)
	{
			console.log ('map view mediator ' + viewClass  + " " + mediatorClass)
		this.mediatorClassByViewClass.set(viewClass, mediatorClass);
	}

	/**
	 * Removed a previously added mapping
	 */
	MediatorMap.prototype.unmapView = function (viewClass, mediatorClass)
	{
		this.mediatorClassByViewClass.remove(viewClass)
	}
	
	/**
	 * return the correct View class based on the passed view instance
	 */
	MediatorMap.prototype.getMediatorClassForViewInstance = function (viewInstance)
	{
		var viewClass = viewInstance.constructor;
		return this.mediatorClassByViewClass.get(viewClass);
	}

	return MediatorMap;

});