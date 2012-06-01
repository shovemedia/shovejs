define (function (require) {
	var shovejs = {}

	shovejs.model =	{
		ClassRegistry :			require('shovejs/model/ClassRegistry'),
		ObjectRegistry :		require('shovejs/model/ObjectRegistry'),
	
		Dictionary :			require('shovejs/model/Dictionary'),
		DictionaryFactory :		require('shovejs/model/DictionaryFactory')
	}
	
	shovejs.service =	{
		JSONService :			require('shovejs/service/JSONService'),
		ObjectIdentityService :	require('shovejs/service/ObjectIdentityService'),
		SelectionService :		require('shovejs/service/SelectionService')
	}

	shovejs.Context =			require('shovejs/Context');
	shovejs.Injector =			require('shovejs/Injector');
	shovejs.MediatorMap =		require('shovejs/MediatorMap');
	shovejs.ModelMediator =		require('shovejs/ModelMediator');
	
	return shovejs;

})