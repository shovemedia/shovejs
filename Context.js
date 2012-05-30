define (function (require) {

		var ClassRegistry		= require('shovejs/model/ClassRegistry'),	
			ObjectRegistry		= require('shovejs/model/ObjectRegistry'),
			Dictionary			= require('shovejs/model/Dictionary'),
			Injector			= require('shovejs/Injector'),
			MediatorMap			= require('shovejs/MediatorMap'),
			
			signals				= require('lib/signals');
			
			


	/**
	 * A context for managing injections, factories, mediators, and services
 	 * Injector for MODEL
	 * contextView for VIEW
	 * mapViewMediator for VIEW -> MEDIATOR -> COMMAND
	 * mapSignal for SIGNAL -> COMMAND
	 * 
	 */
	var Context = function ()
	{		
		this.injector;
		this.getInjector();
		
		this.factoryRegistry = new Dictionary();
		this.serviceRegistry = new Dictionary();
		
		this.classRegistry = new ClassRegistry();
		this.injector.mapValue(ClassRegistry,	'classRegistry',	this.classRegistry);
		var objectRegistry = new ObjectRegistry();
		this.injector.mapValue(ObjectRegistry,	'objectRegistry',	objectRegistry);		

		
		this.viewMediatorMap;
		this.getViewMediatorMap();
		
		this.mediatorsByViewInstance = new Dictionary();
		this.viewInstanceByMediator = new Dictionary();
		
		this.viewClassByModelClass = new Dictionary();
		this.viewByModel = new Dictionary();
		
		this.controllerDataByView = new Dictionary();
		this.commandsBySignal = new Dictionary();

		this.contextView;
	}
	
	
	
	Context.prototype.getInjector = function ()
	{
		if (this.injector == null) this.injector = new Injector();
		return this.injector;
	}
	
	Context.prototype.setInjector = function (value)
	{
		this.injector = value;
	}
	
	Context.prototype.getViewMediatorMap = function ()
	{
		if (this.viewMediatorMap == null) this.viewMediatorMap = new MediatorMap();
		return this.viewMediatorMap;
	}
	
	Context.prototype.setViewMediatorMap = function (value)
	{
		this.viewMediatorMap = value;
	}
	
	/**
	 * Map a Model class to a View class
	 * @param {Class} modelClass
	 * @param {Class} viewClass
	 * @param {String} context [optional]
	 */	
	Context.prototype.mapModelView = function (modelClass, viewClass, context)
	{	
		this.injector.mapInjectionFields(viewClass);
		
		if (!context)
		{
			this.viewClassByModelClass.set(modelClass, viewClass);
		}
		else
		{
			if (!this.viewClassByModelClass.get(modelClass))
			{
				this.viewClassByModelClass.set(modelClass, new Dictionary());
			}
			
			this.viewClassByModelClass.get(modelClass).set(context, viewClass);
		}
	}
	
	/**
	 * Unmap a previously mapped View class
	 * @param {Class} modelClass
	 * @param {Class} viewClass
	 * @param {String} context [optional]
	 */	
	Context.prototype.unmapModelView = function (modelClass, viewClass, context)
	{
		if (!context)
		{
			this.viewClassByModelClass.remove(modelClass);
		}
		else
		{
			if (this.viewClassByModelClass.get(modelClass))
			{
				this.viewClassByModelClass.get(modelClass).remove(context);
			}
		}
	}
	

	/**
	 * Register a (Model) class to an id
	 * @param {String} id [optional]
	 * @param {Class} clazz
	 */	
	Context.prototype.registerClass = function (id, clazz)
	{
		this.classRegistry.registerClass(id, clazz);
	}

	/**
	 * Register a Factory class for a Model class
	 * @param {Class} ModelClass
	 * @param {Class} FactoryClass
	 * @param {Factory} factoryInstance [optional]
	 * @param {String} factoryId [optional]
	 */	
	Context.prototype.registerFactory = function (ModelClass, FactoryClass, factoryInstance, factoryId)
	{
		this.injector.mapInjectionFields(ModelClass);
		this.injector.mapInjectionFields(FactoryClass);
		if (!factoryInstance)
		{
			var factoryInstance = this.createNewInstance(FactoryClass, null, true);
		}
		if (factoryId) this.injector.mapValue(FactoryClass, factoryId, factoryInstance);
		this.factoryRegistry.set(ModelClass, factoryInstance);
	}

	
	/**
	 * Register a Service class
	 * @param {String} id
	 * @param {Class} Clazz
	 * @param {Service} instance [optional]
	 */  	
	Context.prototype.registerService = function (id, Clazz, instance)
	{
		this.injector.mapInjectionFields(Clazz);
		
		if (!instance)
		{
			var instance = this.createNewInstance(Clazz, id, true);
			console.log ('registerService auto create', instance)
		}
		
		this.injector.mapValue(Clazz, id, instance);
		this.serviceRegistry.set(id, instance);
	}
	


	/**
	 * Register a model instance.
	 * A new view will be created if a View class is registered for this Model class
	 * @param {Object} model
	 */  
	Context.prototype.registerModel = function (model)
	{	
		if (!this.viewByModel.get(model))
		{
			console.log ('registerModel', model);
			var modelClass = model.constructor;
			
			var viewClassSetting = this.viewClassByModelClass.get(modelClass);
			
			if (viewClassSetting instanceof Dictionary)
			{
				console.log ('multi-context model -> view mapping');
				for (var i in viewClassSetting.keys)
				{
					var context = viewClassSetting.keys[i];
					console.log ('view context', context);
					var viewClass = viewClassSetting.get(context);
					console.log ('view class', viewClass),
					this.instantiateView (model, viewClass, context);
				}
			}
			else
			{
				this.instantiateView (model, viewClassSetting);
			}
		}
	}
	
	/**
	 * [Internal] Instantiates a view instance and calls view.observe(model)
	 * 
	 * @param {String} context [optional]
	 * 
	 */
	Context.prototype.instantiateView = function (model, viewClass, context)
	{
		console.log ('model');
		console.log (model);
		console.log ('view class ' + viewClass);
		var view = this.createNewInstance(viewClass, model, true);//new viewClass();
		this.injector.injectInto(view);
		
		console.log ('view instance ' + view)	
		
		//wire signals
		if (view.viewAddedSignal)	view.viewAddedSignal.add(this.registerView, this);
		if (view.viewRemovedSignal)	view.viewRemovedSignal.add(this.unregisterView, this);
		
		view.observe(model);
		
		//var viewCreatedSignal = this.viewCreatedSignalByModelClass.get(modelClass);
		//viewCreatedSignal.dispatch({view:view, model:model})
		
		if (context == null)
		{
		    this.viewByModel.set(model, view);
		}
		else
		{
		    if (!this.viewByModel.get(model))
		    {
			this.viewByModel.set(model, new Dictionary());
		    }
		    this.viewByModel.get(model).set(context, view);
		}	
		
		
		// this.modelByView.set(view, model);		
	}
	
	Context.prototype.getViewByModel = function (model, context)
	{
		console.log ('getViewByModel:');
		console.log ('context:', context);
		console.log (model);
		
		if (!this.viewByModel.get(model))
		{
			this.registerModel(model);
		}	
		
		if (context == null)
		{
			return this.viewByModel.get(model);
		}
		else
		{
			return this.viewByModel.get(model).get(context);
		}
	}
	
	/**
	 * [Internal] Supports the JSONService class by delegating toJSON implementation to the correct Factory 
	 */
	Context.prototype.toJSON = function (instance)
	{
		var factory = this.factoryRegistry.get(instance.constructor);
		
		if (factory && factory.toJSON) {
			return factory.toJSON(instance);
		}
		else
		{	
			return instance;
		}
	}	
	
	/**
	 * Initialize the context. This will inject dependencies into all registered Services and Factories
	 * and call their init methods.
	 */
	Context.prototype.init = function ()
	{
		
		//SERVICES
		
		console.log('serviceRegistry', this.serviceRegistry)
		
		var services = this.serviceRegistry.values;
		for(var i in services)
		{
			var service = services[i];
			console.log ('service', i, service);
			this.injector.injectInto(service);
			if (service.init) service.init();
		}
		
		//FACTORIES
		var factories = this.factoryRegistry.values;
		for(var i in factories)
		{
			var factory = factories[i];
			this.injector.injectInto(factory);
			if (factory.init) factory.init();
		}
	}
	
	/**
	 * Create a new instance of the given class.
	 * Use previously registered factories.
	 * @param {Boolean} auto [optional] (will use the new keyword)
	 */
	Context.prototype.createNewInstance = function (forClass, data, auto)
	{
		console.log ('createNewInstance', forClass, data);
		
		var factory = this.factoryRegistry.get(forClass);
		
		console.log ('factory', factory)
		
		var instance;
		
		if (factory) {
			
			if (factory.fromJSON)
			{
				instance = factory.fromJSON(data);
			}
			else if (factory.fromModel)
			{
				instance = factory.fromModel(data);
			}
			else
			{
				console.error ("ERROR: no factory method found!")
			}	
		}
		else if (auto)
		{	
			console.warn ("no factory found! ", forClass)
			instance = new forClass();
			
			// for (var i in data)
		  	// {
		  		// instance[i] = data[i];
		  	// }
		}
		
		return instance;
	}
	
	

	

	/**
	 * Register a view instance. 
	 * @param {Object} view
	 * @param {Object} controllerData [optional]
	 */
	Context.prototype.registerView = function (view, controllerData)
	{
		//Already registered?
		if (this.mediatorsByViewInstance.get(view)) return;
		
		console.log ('register view ' + view);
		
		var MediatorClass = this.viewMediatorMap.getMediatorClassForViewInstance(view);
		
		if (MediatorClass == null) {
			console.log ("WARNING: no Mediator defined")
			return;
		}
		
		//console.log ('MediatorClass ' + MediatorClass)
		
		var mediatorInstance = new MediatorClass();
			
		var injector = this.injector.getChild();// injectorMap.get(key)
		
		for (field in view.on)
		{
			injector.mapValue(signals.Signal, field, view.on[field]);
		}
		
		injector.injectInto(mediatorInstance);
		
		this.mediatorsByViewInstance.set(view, mediatorInstance);
		this.viewInstanceByMediator.set(mediatorInstance, view);
		
		this.controllerDataByView.set(view, controllerData);
		
		mediatorInstance.map();
	}

	/**
	 * Unregister a previously registered view instance. 
	 */ 	
	Context.prototype.unregisterView = function (view)
	{
		var mediatorInstance = this.mediatorsByViewInstance.get(view);
		if (mediatorInstance)
		{
			mediatorInstance.unmap();
		}
		else
		{
			console.log ('no mediator found for ' + view)
		}	
	}
	
	/**
	 * Map a Mediator class for a given View class
	 */
	Context.prototype.mapViewMediator = function (viewClass, mediatorClass)
	{
		//console.log ('mapViewMediator ' + mediatorClass)
		this.injector.mapInjectionFields(mediatorClass);
		
		this.viewMediatorMap.mapView(viewClass, mediatorClass);
	}
	
	/**
	 * Unmap a previously mapped Mediator class.
	 */
	Context.prototype.unmapViewMediator = function (viewClass, mediatorClass)
	{
		this.viewMediatorMap.unmapView(viewClass, mediatorClass);
	}	
	
	
	/**
	 * [Internal] Map a signalInstance to a CommandClass for a given mediator instance
	 */
	Context.prototype.mapSignal = function (signalInstance, CommandClass, mediator)
	{
		if (!signalInstance) {
			console.warn ('View does not publish this signal Instance');
			return;
		}
		
		
		this.injector.mapInjectionFields(CommandClass);
		
		var controllerData;
	
		if (mediator) 
		{
			var view = this.viewInstanceByMediator.get(mediator);
			if (view)
			{ 
				controllerData = this.controllerDataByView.get(view);
			}
		}
		
		var self = this;
		var cmd = function (signalData)
		{	
			var cmdInstance = new CommandClass();
			
			var injector = self.injector.getChild();// injectorMap.get(key)
			
			for (var i in signalData) 
			{
				console.log ('signalData ' , i , signalData[i])
				console.log ('CommandClass' ,CommandClass)
				
				injector.mapValue(signalData[i].constructor, i, signalData[i]);
			}
			
			for (var i in controllerData)
			{
				console.log ('controllerData ' , i , controllerData[i])
				injector.mapValue(controllerData[i].constructor, i, controllerData[i]);
			}
			
			injector.injectInto(cmdInstance);
			
			cmdInstance.execute();
		}
		
		var fnByCommand = this.commandsBySignal.get(signalInstance);
		if (!fnByCommand)
		{
			fnByCommand = new Dictionary();
			this.commandsBySignal.set(signalInstance, fnByCommand)
		}
		
		fnByCommand.set(CommandClass, cmd);
		
		signalInstance.add(cmd);
	}
	
	/**
	 * Unmap a previously mapped signal
	 */
	Context.prototype.unmapSignal = function (signalInstance, CommandClass)
	{
		var fnByCommand = this.commandsBySignal.get(signalInstance);
		
		if (fnByCommand)
		{
			var cmd = fnByCommand.get(CommandClass)
			if (cmd)
			{
				signalInstance.remove(cmd);
			}
		}
	}
	
	


	Context.prototype.setContextView = function (contextView)
	{
		this.contextView = contextView;
	}
	
	
	return Context;

});


