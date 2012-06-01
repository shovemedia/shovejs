define (function (require) {

	var Dictionary = require('shovejs/model/Dictionary')


	/** ObjectRegistry maps Objects by id
	 * 
	 * API Sugar around a bi-directional Dictionary
	 * Required by the JSONService
	 */
	var ObjectRegistry = function()
	{
		this.objectById = new Dictionary();
	}

	ObjectRegistry.prototype.registerModel = function (id, instance)
	{
		this.objectById.set(id, instance);
	}

	ObjectRegistry.prototype.unregisterModel = function (id, instance)
	{
		this.objectById.remove(id);
	}

	ObjectRegistry.prototype.getObject = function (id)
	{
		return this.objectById.get(id);
	}

	ObjectRegistry.prototype.getId = function (instance)
	{
		return this.objectById.getKey(instance); //,true
	}

	return ObjectRegistry;

});