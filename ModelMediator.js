define (function (require) {

	var Dictionary = require('shovejs/model/Dictionary'),
		signals = require('lib/signals');											
											
	/**
	 * Utility class for generating model proxies that dispatch signals when their properties are changed.
	 */										
	var ModelMediator = function (model) {	
		this.__on__ = new Dictionary();

		for (var key in model)
		{
				this.__defineSetter__(key, function (arg) { this.set(model, key, arg) });
				this.__defineGetter__(key, function () { this.get(model, key) });

				this.__on__.set(key, new signals.Signal());
		}
	}

	/**
	 * Pass getters through to the model
	 */
	ModelMediator.prototype.get = function (model, key)
	{
		return model[key]
	}

	/**
	 * Pass setters through to the model, and then dispatch the change signal.
	 * The signal payload is:
	 * {model:model, key:key, value:value}
	 */
	ModelMediator.prototype.set = function (model, key, value)
	{
		model[key] = value;
		this.__on__.get(key).dispatch({model:model, key:key, value:value});
	}

	return ModelMediator

});