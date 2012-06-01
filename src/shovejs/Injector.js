define (function  (require) {

	var Dictionary = require('shovejs/model/Dictionary');

	/**
	 * Provides simple dependency injection
	 */
	var Injector = function ()
	{
		this.valueMappingsByClass = new Dictionary();// {};
		this.injectionPointsByClass = new Dictionary();// {};

		this.parent;
	}

	/**
	 * Map the fields of this class. Expect a static field called "injectionFields".
	 */
	Injector.prototype.mapInjectionFields = function (clazz)
	{
		var fields = clazz.injectionFields;
		for (var i in fields)
		{
			this.mapInjectionField(clazz, i, fields[i])
		}
	}

	/**
	 * Map a single field
	 */
	Injector.prototype.mapInjectionField = function (clazz, fieldName, fieldClass)
	{	
		if (this.injectionPointsByClass.get(clazz) === undefined) { this.injectionPointsByClass.set(clazz, {}); }

		var injectionPoints = this.injectionPointsByClass.get(clazz);

		injectionPoints[fieldName] = fieldClass;
	}

	/**
	 * Map an instance to be injected into any injectionField matching the key: Class pair.
	 */
	Injector.prototype.mapValue = function (clazz, key, value)
	{	
		if (this.valueMappingsByClass.get(clazz) === undefined) { this.valueMappingsByClass.set(clazz, {}); }
		
		var valueMap = this.valueMappingsByClass.get(clazz);

		valueMap[key] = value;
	}

	/**
	 * Unmap a previously mapped injection value
	 */
	Injector.prototype.unmapValue = function (clazz, key)
	{
		if (this.valueMappingsByClass.get(clazz) === undefined) { this.valueMappingsByClass.set(clazz, {}); }

		var valueMap = this.valueMappingsByClass.get(clazz);

		delete(valueMap[key]);
	}

	/**
	 * Provide an instance with dependencies
	 */
	Injector.prototype.injectInto = function (instance)
	{		
		console.log ('** injectInto **', instance);

		if (this.parent != null) 
		{
			this.parent.injectInto(instance);
		}

		var clazz = instance.constructor;

		var injectionPoints = this.injectionPointsByClass.get(clazz);

		for (var fieldName in injectionPoints)
		{   	
			var fieldClass = injectionPoints[fieldName];

			var valueMap = this.valueMappingsByClass.get(fieldClass);

			if (valueMap)
			{
				var value = valueMap[fieldName];

				if (value) 
				{
					console.log ('injectInto fieldName: ' + fieldName, value);
					instance[fieldName] = value;
				}
				else
				{
					console.warn ('injectInto fieldName: ' + fieldName + " " + "NOT FOUND!"  );
				}
			}
		}
	}

	/**
	 * Create a new Injector using the current injector as a parent.
	 * Advanced use only.
	 * @example Mediators use this feature to keep their Command data injections separate from the parent's injections.
	 */
	Injector.prototype.getChild = function ()
	{
		var child = new Injector();

		child.injectionPointsByClass = this.injectionPointsByClass;
		var _this = this;
		child.parent = _this;

		return child;
	}
	
	console.log ("Injector EXPORT");

	return Injector;

});
