define (function(require){
	
	var Dictionary = require('shovejs/model/Dictionary');


	/** ClassRegistry maps classes by id
	 * 
	 * mostly API Sugar around a Dictionary
	 * Required by the JSONService
	 */
	var ClassRegistry = function()
	{
			this.classById = new Dictionary();
	}

	/**
	 * Register a Class by its id
	 * @param {String} id [optional] If ommitted, clazz.toString() will be used instead
	 * @param {Class} clazz
	 */
	ClassRegistry.prototype.registerClass = function (id, clazz)
	{
		if (arguments.length == 1)
		{
			var clazz = arguments[0];
			var id = arguments[0].toString();
		}

		//console.log ('registerClass', id);

		this.classById.set(id, clazz);
	}

	/**
	 * Unregister a previously registered Class
	 */
	ClassRegistry.prototype.unregisterClass = function (id, clazz)
	{
		this.classById.remove(id);
	}

	/**
	 * Return the id for a given registered Class
	 */
	ClassRegistry.prototype.getId = function (clazz)
	{
		return this.classById.getKey(clazz);
	}

	/**
	 * Return the Class for a given registered id
	 */
	ClassRegistry.prototype.getClass = function (id)
	{
		return this.classById.get(id);
	}

	return ClassRegistry;

});