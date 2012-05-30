define ([
			'shovejs/model/ObjectRegistry'
], 
function (
			ObjectRegistry
) {
	
	/*
	 * Lee Coltrane - original
	 * note:  this can (and probably should) be improved by
	 * writing an implementation that uses the hardware address from air.NetworkInfo
	 * to comply more completely with (http://www.ietf.org/rfc/rfc4122.txt).
	 * as it is, this impl is just a fancy random number that (probably) shouldn't
	 * collide.
	 * 
	 * Appropriated for shovejs by Jon Williams
	 */



	var S4 = function () {
			return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
	}
		
	var generateUUID = function () {
		//var time = Date.now();
		return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
	}
	

	
	
	var ObjectIdentityService = function() {
		this.sesid = generateUUID();
		this.counter=0;
	}	
	
	ObjectIdentityService.injectionFields = { objectRegistry: ObjectRegistry }
	
	ObjectIdentityService.prototype.generateInstanceId = function(obj) {
		return this.sesid+':'+(this.counter++);
	}
	
	ObjectIdentityService.prototype.get = function (obj, auto)
	{
		var id = this.objectRegistry.getId(obj);

		if (id != null) return id;

		// Only auto-generate if the auto flag is set
		// Primitive types are not supported
		if (auto && (obj instanceof Object || obj instanceof Function))
		{
			id = this.generateInstanceId();
			this.objectRegistry.registerModel(id, obj);
		}
		
		return id;
	}

	return ObjectIdentityService;

})