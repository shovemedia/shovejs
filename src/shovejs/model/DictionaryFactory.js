define (function(require){

	var Context = require('shovejs/Context'),
	Dictionary = require('shovejs/model/Dictionary'),
	JSONService = require('shovejs/service/JSONService');

	/**
	 * The DictionaryFactory implements the Factory interface
	 */
	var DictionaryFactory = function () {}

	DictionaryFactory.toString = function () 
	{
		return '[DictionaryFactory Class]';
	}

	DictionaryFactory.injectionFields =	{
		context:Context,
		jsonService:JSONService
	};

	/**
	 * Convert the dictionary instance into a JSON Object
	 */
	DictionaryFactory.prototype.toJSON = function (dictionary)
	{		
		var jsonObj = {};
		
		if (dictionary.keys)
		{
			jsonObj.keys = [];
			for (var i=0, len=dictionary.keys.length; i<len; i++)
			{
				jsonObj.keys.push( this.jsonService.toJSONref(dictionary.keys[i]) );
			}
		}
		
		if (dictionary.values)
		{
			jsonObj.values = [];
			for (var i=0, len=dictionary.values.length; i<len; i++)
			{
				jsonObj.values.push( this.jsonService.toJSONref(dictionary.values[i]) );
			}
		}

		return jsonObj;
	}
	
	/**
	 * Convert the JSON Object into a dictionary instance
	 */
	DictionaryFactory.prototype.fromJSON = function (jsonObj)
	{
		var dictionary = new Dictionary();
		
		for (var i=0, len=jsonObj.keys.length; i<len; i++)
		{
			var key = jsonObj.keys[i];
			var value = jsonObj.values[i];

			dictionary.set(key, value);

			this.getKeyValueResolver(dictionary, key, value);

			var key = jsonObj.keys[i];
			var value = jsonObj.values[i];
		}
		return dictionary;
	}
	
	/**
	 * [Internal] Keys and values in dictionaries returned via fromJSON may be initially populated with Promises.
	 * @see the q Promises library 
	 * This function resolves those promises into key and/or value references once available
	 */
	DictionaryFactory.prototype.getKeyValueResolver = function (dictionary, key, value)
	{
		var keyPromise = key.promise;
		var valuePromise = value.promise;
		
		if (keyPromise && valuePromise)
		{
			keyPromise.then( function (key) {
				valuePromise.then( function (value) {
					dictionary.remove(keyPromise);
					dictionary.set(key, value);
				});
			});
		}
		else if (keyPromise)
		{
			keyPromise.then( function (key) {
				dictionary.remove(keyPromise);
				dictionary.set(key, value);
			});
		}
		else if (valuePromise)
		{
			valuePromise.then( function (value) {
				dictionary.set(key, value);
			});
		}
		else
		{
			dictionary.set(key, value);
		}
	}
	
	return DictionaryFactory;

})