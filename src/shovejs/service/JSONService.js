define(function (require) 
{
	var Context = require('shovejs/Context'),
		ClassRegistry = require('shovejs/model/ClassRegistry'),
		ObjectRegistry = require('shovejs/model/ObjectRegistry'),
		ObjectIdentityService = require('shovejs/service/ObjectIdentityService'),
		
		JSON = require('lib/json2'),
		Q	= require('lib/q'),
		signals = require('lib/signals')
;

	
	//internal class
	var Meta = function (){};
	
	var JSONService = function () 
	{
		// this.context;
		// this.objectRegistry;
		// this.objectIdentityService;
		// this.classRegistry;
	}
	
	JSONService.injectionFields = {
		context:Context,
		objectRegistry:ObjectRegistry, 
		objectIdentityService:ObjectIdentityService,
		classRegistry:ClassRegistry
	};
	

	/**
	 * Return a JSON serialized string for the passed data Object
	 */
	JSONService.prototype.toJSON = function (data) 
	{		
		if (this.metaData == null)
		{
			console.log ('new meta data object!');
			this.metaData = {};
		}
		
		var dataJson = JSON.stringify(data,				this.getDataReplacer(this.metaData), "  ");
console.log ('--');
console.log ('');
console.log (dataJson);
console.log ('');
console.log ('--');
		
		
		
		var metaJson = JSON.stringify(this.metaData,	this.getMetaReplacer(this.metaData), "  ");
		
		this.metaData = null;
		
		return '{' + '"meta" :' + metaJson + ', ' + '"data" :' + dataJson + '}';
	}

	/**
	 * Return an inflated data Object from the passed json String
	 */
	JSONService.prototype.fromJSON = function (json) 
	{
		var dataFromJSON = JSON.parse(json);

		//defer instantiation of typed objects
		var deferredRegistry = new ObjectRegistry();
		for (var id in dataFromJSON.meta)
		{
			var deferred = Q.defer();
			deferredRegistry.registerModel(id, deferred);
		}		
		
		// Create & Register deffered Objects
		var newObjects = [];
		for (var i=0, len=deferredRegistry.objectById.keys.length; i<len; i++)
		{
			var id = deferredRegistry.objectById.keys[i];
			var metaData = dataFromJSON.meta[id];
			var type = metaData.type;
			var value = metaData.value;

			var Clazz = this.classRegistry.getClass(type);
			
			var deferred = deferredRegistry.getObject(id);
			
			//TODO: can omit???
			this.fillReferences(value, deferredRegistry);
			
			var instance = this.context.createNewInstance(Clazz, value, true);
			
			deferred.resolve(instance);
			
			this.objectRegistry.registerModel(id, instance);
			newObjects.push(instance);
		}
		
		// Fill new object $ref -erences
		this.fillReferences (newObjects, this.objectRegistry);
		
		// Fill Data $ref -erences
		dataFromJSON.data = this.fillReferences (dataFromJSON.data, this.objectRegistry);
		
		return (dataFromJSON.data);
	}
	
	
	
	/**
	 * [Internal] Used by JSONService.toJSON
	 */
	JSONService.prototype.getDataReplacer = function (metaData)
	{				
		var self = this;

		return function (key, value)
		{
			console.log('getDataReplacer', key, value);
			// if (value !==null && self.context.factoryRegistry.get(value.constructor))
			// {
				return self.toJSONref(value);
			// }
			// else
			// {
				// return undefined;
			// }
		}
	}	
	
	JSONService.prototype.toJSONref = function (instance)
	{
		console.log('JSONService.prototype.toJSONref', this.classRegistry, instance);

		var auto = false,
		type = this.classRegistry.getId(instance.constructor);
		
		if (type)
		{
			auto = true;
		}
		
		console.log ('auto id? ', auto, 'instance', instance)
	
		var id = this.objectIdentityService.get(instance, auto);
		
		if (id != undefined)
		{
			if (this.metaData[id] == undefined)
			{	
				this.metaData[id] = instance;//
				this.context.toJSON(instance);
			}
			
			console.log ('$ref', id);
			
			return { $ref : id };
		}
		
		return instance;
	}
	
	/**
	 * [Internal] Used by JSONService.toJSON
	 */	
	JSONService.prototype.getMetaReplacer = function (metaData)
	{
		var objectIdentityService = this.objectIdentityService;
		var classRegistry = this.classRegistry;
		var context = this.context;
		var self = this;
		
		return function (key, value)
		{
			console.log ('meta key', key);
			console.log ('meta value', typeof value, value, 'this:', this, 'metaData:', metaData);			
			
			var id = objectIdentityService.get(value);
			
			if (id != undefined)
			{
				if (metaData[id] != undefined)
				{	
					if (this == metaData)
					{
						var type = classRegistry.getId(value.constructor);
						
						var jsonObj = context.toJSON(value);
						
						value = new Meta();
						value.type = type;
						value.value = jsonObj;
					}
					else 
					{
						value = self.toJSONref(value);
					}	
				}
			}
//			else
//			{
//				console.warn ( 'id undefined', value);
//			}
			
			return value;
		}
	}		
	
	/**
	 * [Internal] Used by JSONService.fromJSON
	 */	
	JSONService.prototype.fillReferences = function (obj, objectRegistry)
	{
		// Only attempt to fill references on Objects
		// Only procede if there's no factory defined for this object's class.
		// Otherwise, infinite recursion
		if (obj instanceof Object && !this.context.factoryRegistry.get(obj.constructor))
		{
			if (obj.hasOwnProperty('$ref'))
			{
				// replace the reference object with the object it references
				obj = objectRegistry.getObject(obj.$ref);
			}
			else
			{
				// recursively call fillReferences on each inner field
				for(var i in obj)
				{	
					if (obj.hasOwnProperty(i) && obj[i] != undefined)
					{
						obj[i] = this.fillReferences(obj[i], objectRegistry);// || obj[i];
					}
				}
			}
		}

		return obj;
	}
	
	return JSONService;
	
	
})