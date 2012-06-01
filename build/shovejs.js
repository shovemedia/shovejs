define("shovejs/model/Dictionary",["require"],function(){var a=function(){this.keys=[];this.values=[]};a.prototype.get=function(a){a=this.keys.indexOf(a);if(a!=-1)return this.values[a]};a.prototype.getKey=function(a){a=this.values.indexOf(a);if(a!=-1)return this.keys[a]};a.prototype.set=function(a,c){var d=this.keys.indexOf(a);d==-1&&(this.keys.push(a),d=this.keys.length-1);this.values[d]=c};a.prototype.remove=function(a){a=this.keys.indexOf(a);if(a!=-1){var c=this.values[a];delete this.values[a];
delete this.keys[a];return c}};a.prototype.forEach=function(a,c){for(var d=0,g=this.keys.length;d<g;d++)d in this.keys&&a.call(c,this.values[d],this.keys[d],this)};return a});
define("shovejs/model/ClassRegistry",["require","shovejs/model/Dictionary"],function(a){var f=a("shovejs/model/Dictionary"),a=function(){this.classById=new f};a.prototype.registerClass=function(a,d){d==null&&(d=a,a=d.toString());this.classById.set(a,d)};a.prototype.unregisterClass=function(a){this.classById.remove(a)};a.prototype.getId=function(a){return this.classById.getKey(a)};a.prototype.getClass=function(a){return this.classById.get(a)};return a});
define("shovejs/model/ObjectRegistry",["require","shovejs/model/Dictionary"],function(a){var f=a("shovejs/model/Dictionary"),a=function(){this.objectById=new f};a.prototype.registerModel=function(a,d){this.objectById.set(a,d)};a.prototype.unregisterModel=function(a){this.objectById.remove(a)};a.prototype.getObject=function(a){return this.objectById.get(a)};a.prototype.getId=function(a){return this.objectById.getKey(a)};return a});
define("shovejs/Injector",["require","shovejs/model/Dictionary"],function(a){var f=a("shovejs/model/Dictionary"),c=function(){this.valueMappingsByClass=new f;this.injectionPointsByClass=new f};c.prototype.mapInjectionFields=function(a){var g=a.injectionFields,h;for(h in g)this.mapInjectionField(a,h,g[h])};c.prototype.mapInjectionField=function(a,g,h){this.injectionPointsByClass.get(a)===void 0&&this.injectionPointsByClass.set(a,{});this.injectionPointsByClass.get(a)[g]=h};c.prototype.mapValue=function(a,
g,h){this.valueMappingsByClass.get(a)===void 0&&this.valueMappingsByClass.set(a,{});this.valueMappingsByClass.get(a)[g]=h};c.prototype.unmapValue=function(a,g){this.valueMappingsByClass.get(a)===void 0&&this.valueMappingsByClass.set(a,{});delete this.valueMappingsByClass.get(a)[g]};c.prototype.injectInto=function(a){console.log("** injectInto **",a);this.parent!=null&&this.parent.injectInto(a);var g=this.injectionPointsByClass.get(a.constructor),h;for(h in g){var c=this.valueMappingsByClass.get(g[h]);
c&&((c=c[h])?(console.log("injectInto fieldName: "+h,c),a[h]=c):console.warn("injectInto fieldName: "+h+" NOT FOUND!"))}};c.prototype.getChild=function(){var a=new c;a.injectionPointsByClass=this.injectionPointsByClass;a.parent=this;return a};console.log("Injector EXPORT");return c});
define("shovejs/MediatorMap",["require","shovejs/model/Dictionary"],function(a){var f=a("shovejs/model/Dictionary"),a=function(){this.mediatorClassByViewClass=new f};a.prototype.mapView=function(a,d){console.log("map view mediator "+a+" "+d);this.mediatorClassByViewClass.set(a,d)};a.prototype.unmapView=function(a){this.mediatorClassByViewClass.remove(a)};a.prototype.getMediatorClassForViewInstance=function(a){return this.mediatorClassByViewClass.get(a.constructor)};return a});
define("shovejs/Context","require,shovejs/model/ClassRegistry,shovejs/model/ObjectRegistry,shovejs/model/Dictionary,shovejs/Injector,shovejs/MediatorMap,lib/signals".split(","),function(a){var f=a("shovejs/model/ClassRegistry"),c=a("shovejs/model/ObjectRegistry"),d=a("shovejs/model/Dictionary"),g=a("shovejs/Injector"),h=a("shovejs/MediatorMap"),i=a("lib/signals"),a=function(){this.getInjector();this.factoryRegistry=new d;this.serviceRegistry=new d;this.classRegistry=new f;this.injector.mapValue(f,
"classRegistry",this.classRegistry);var a=new c;this.injector.mapValue(c,"objectRegistry",a);this.getViewMediatorMap();this.mediatorsByViewInstance=new d;this.viewInstanceByMediator=new d;this.viewClassByModelClass=new d;this.viewByModel=new d;this.controllerDataByView=new d;this.commandsBySignal=new d};a.prototype.getInjector=function(){if(this.injector==null)this.injector=new g;return this.injector};a.prototype.setInjector=function(a){this.injector=a};a.prototype.getViewMediatorMap=function(){if(this.viewMediatorMap==
null)this.viewMediatorMap=new h;return this.viewMediatorMap};a.prototype.setViewMediatorMap=function(a){this.viewMediatorMap=a};a.prototype.mapModelView=function(a,e,b){this.injector.mapInjectionFields(e);b?(this.viewClassByModelClass.get(a)||this.viewClassByModelClass.set(a,new d),this.viewClassByModelClass.get(a).set(b,e)):this.viewClassByModelClass.set(a,e)};a.prototype.unmapModelView=function(a,e,b){b?this.viewClassByModelClass.get(a)&&this.viewClassByModelClass.get(a).remove(b):this.viewClassByModelClass.remove(a)};
a.prototype.registerClass=function(a,e){this.classRegistry.registerClass(a,e)};a.prototype.registerFactory=function(a,e,b,d){this.injector.mapInjectionFields(a);this.injector.mapInjectionFields(e);b||(b=this.createNewInstance(e,null,!0));d&&this.injector.mapValue(e,d,b);this.factoryRegistry.set(a,b)};a.prototype.registerService=function(a,e,b){this.injector.mapInjectionFields(e);b||(b=this.createNewInstance(e,a,!0),console.log("registerService auto create",b));this.injector.mapValue(e,a,b);this.serviceRegistry.set(a,
b)};a.prototype.registerModel=function(a){if(!this.viewByModel.get(a)){console.log("registerModel",a);var e=this.viewClassByModelClass.get(a.constructor);if(e instanceof d){console.log("multi-context model -> view mapping");for(var b in e.keys){var g=e.keys[b];console.log("view context",g);var h=e.get(g);console.log("view class",h);this.instantiateView(a,h,g)}}else this.instantiateView(a,e)}};a.prototype.instantiateView=function(a,e,b){console.log("model");console.log(a);console.log("view class "+
e);e=this.createNewInstance(e,a,!0);this.injector.injectInto(e);console.log("view instance "+e);e.viewAddedSignal&&e.viewAddedSignal.add(this.registerView,this);e.viewRemovedSignal&&e.viewRemovedSignal.add(this.unregisterView,this);e.observe(a);b==null?this.viewByModel.set(a,e):(this.viewByModel.get(a)||this.viewByModel.set(a,new d),this.viewByModel.get(a).set(b,e))};a.prototype.getViewByModel=function(a,e){console.log("getViewByModel:");console.log("context:",e);console.log(a);this.viewByModel.get(a)||
this.registerModel(a);return e==null?this.viewByModel.get(a):this.viewByModel.get(a).get(e)};a.prototype.toJSON=function(a){var e=this.factoryRegistry.get(a.constructor);return e&&e.toJSON?e.toJSON(a):a};a.prototype.init=function(){console.log("serviceRegistry",this.serviceRegistry);var a=this.serviceRegistry.values,e;for(e in a){var b=a[e];console.log("service",e,b);this.injector.injectInto(b);b.init&&b.init()}a=this.factoryRegistry.values;for(e in a)b=a[e],this.injector.injectInto(b),b.init&&b.init()};
a.prototype.createNewInstance=function(a,e,b){console.log("createNewInstance",a,e);var d=this.factoryRegistry.get(a);console.log("factory",d);var g;d?d.fromJSON?g=d.fromJSON(e):d.fromModel?g=d.fromModel(e):console.error("ERROR: no factory method found!"):b&&(console.warn("no factory found! ",a),g=new a);return g};a.prototype.registerView=function(a,e){if(!this.mediatorsByViewInstance.get(a)){console.log("register view "+a);var b=this.viewMediatorMap.getMediatorClassForViewInstance(a);if(b==null)console.log("WARNING: no Mediator defined");
else{var b=new b,d=this.injector.getChild();for(field in a.on)d.mapValue(i.Signal,field,a.on[field]);d.injectInto(b);this.mediatorsByViewInstance.set(a,b);this.viewInstanceByMediator.set(b,a);this.controllerDataByView.set(a,e);b.map()}}};a.prototype.unregisterView=function(a){var e=this.mediatorsByViewInstance.get(a);e?e.unmap():console.log("no mediator found for "+a)};a.prototype.mapViewMediator=function(a,e){this.injector.mapInjectionFields(e);this.viewMediatorMap.mapView(a,e)};a.prototype.unmapViewMediator=
function(a,e){this.viewMediatorMap.unmapView(a,e)};a.prototype.mapSignal=function(a,e,b){if(a){this.injector.mapInjectionFields(e);var g;b&&(b=this.viewInstanceByMediator.get(b))&&(g=this.controllerDataByView.get(b));var h=this,b=function(a){var b=new e,d=h.injector.getChild(),c;for(c in a)console.log("signalData ",c,a[c]),console.log("CommandClass",e),d.mapValue(a[c].constructor,c,a[c]);for(c in g)console.log("controllerData ",c,g[c]),d.mapValue(g[c].constructor,c,g[c]);d.injectInto(b);b.execute()},
c=this.commandsBySignal.get(a);c||(c=new d,this.commandsBySignal.set(a,c));c.set(e,b);a.add(b)}else console.warn("View does not publish this signal Instance")};a.prototype.unmapSignal=function(a,e){var b=this.commandsBySignal.get(a);b&&(b=b.get(e))&&a.remove(b)};a.prototype.setContextView=function(a){this.contextView=a};return a});
define("shovejs/service/ObjectIdentityService",["shovejs/model/ObjectRegistry"],function(a){var f=function(){return((1+Math.random())*65536|0).toString(16).substring(1)},c=function(){this.sesid=f()+f()+"-"+f()+"-"+f()+"-"+f()+"-"+f()+f()+f();this.counter=0};c.injectionFields={objectRegistry:a};c.prototype.generateInstanceId=function(){return this.sesid+":"+this.counter++};c.prototype.get=function(a,g){var c=this.objectRegistry.getId(a);if(c!=null)return c;if(g&&(a instanceof Object||a instanceof Function))c=
this.generateInstanceId(),this.objectRegistry.registerModel(c,a);return c};return c});
define("shovejs/service/JSONService","require,shovejs/Context,shovejs/model/ClassRegistry,shovejs/model/ObjectRegistry,shovejs/service/ObjectIdentityService,lib/json2,lib/q,lib/signals".split(","),function(a){var f=a("shovejs/Context"),c=a("shovejs/model/ClassRegistry"),d=a("shovejs/model/ObjectRegistry"),g=a("shovejs/service/ObjectIdentityService"),h=a("lib/json2"),i=a("lib/q");a("lib/signals");var j=function(){},a=function(){};a.injectionFields={context:f,objectRegistry:d,objectIdentityService:g,
classRegistry:c};a.prototype.toJSON=function(a){if(this.metaData==null)console.log("new meta data object!"),this.metaData={};a=h.stringify(a,this.getDataReplacer(this.metaData),"  ");console.log("--");console.log("");console.log(a);console.log("");console.log("--");var b=h.stringify(this.metaData,this.getMetaReplacer(this.metaData),"  ");this.metaData=null;return'{"meta" :'+b+', "data" :'+a+"}"};a.prototype.fromJSON=function(a){var a=h.parse(a),b=new d,g;for(g in a.meta){var c=i.defer();b.registerModel(g,
c)}for(var f=[],j=0,m=b.objectById.keys.length;j<m;j++){g=b.objectById.keys[j];var c=a.meta[g],k=c.value,l=this.classRegistry.getClass(c.type),c=b.getObject(g);this.fillReferences(k,b);k=this.context.createNewInstance(l,k,!0);c.resolve(k);this.objectRegistry.registerModel(g,k);f.push(k)}this.fillReferences(f,this.objectRegistry);a.data=this.fillReferences(a.data,this.objectRegistry);return a.data};a.prototype.getDataReplacer=function(){var a=this;return function(b,g){console.log("getDataReplacer",
b,g);return a.toJSONref(g)}};a.prototype.toJSONref=function(a){console.log("JSONService.prototype.toJSONref",this.classRegistry,a);var b=!1;this.classRegistry.getId(a.constructor)&&(b=!0);console.log("auto id? ",b,"instance",a);b=this.objectIdentityService.get(a,b);return b!=void 0?(this.metaData[b]==void 0&&(this.metaData[b]=a,this.context.toJSON(a)),console.log("$ref",b),{$ref:b}):a};a.prototype.getMetaReplacer=function(a){var b=this.objectIdentityService,g=this.classRegistry,c=this.context,d=this;
return function(h,f){console.log("meta key",h);console.log("meta value",typeof f,f,"this:",this,"metaData:",a);var i=b.get(f);if(i!=void 0&&a[i]!=void 0)if(this==a){var i=g.getId(f.constructor),l=c.toJSON(f),f=new j;f.type=i;f.value=l}else f=d.toJSONref(f);return f}};a.prototype.fillReferences=function(a,b){if(a instanceof Object&&!this.context.factoryRegistry.get(a.constructor))if(a.hasOwnProperty("$ref"))a=b.getObject(a.$ref);else for(var g in a)a.hasOwnProperty(g)&&a[g]!=void 0&&(a[g]=this.fillReferences(a[g],
b));return a};return a});
define("shovejs/model/DictionaryFactory",["require","shovejs/Context","shovejs/model/Dictionary","shovejs/service/JSONService"],function(a){var f=a("shovejs/Context"),c=a("shovejs/model/Dictionary"),a=a("shovejs/service/JSONService"),d=function(){};d.toString=function(){return"[DictionaryFactory Class]"};d.injectionFields={context:f,jsonService:a};d.prototype.toJSON=function(a){var c={};if(a.keys){c.keys=[];for(var d=0,f=a.keys.length;d<f;d++)c.keys.push(this.jsonService.toJSONref(a.keys[d]))}if(a.values){c.values=[];
d=0;for(f=a.values.length;d<f;d++)c.values.push(this.jsonService.toJSONref(a.values[d]))}return c};d.prototype.fromJSON=function(a){for(var d=new c,f=0,j=a.keys.length;f<j;f++){var e=a.keys[f],b=a.values[f];d.set(e,b);this.getKeyValueResolver(d,e,b)}return d};d.prototype.getKeyValueResolver=function(a,d,c){var f=d.promise,e=c.promise;f&&e?f.then(function(b){e.then(function(d){a.remove(f);a.set(b,d)})}):f?f.then(function(b){a.remove(f);a.set(b,c)}):e?e.then(function(b){a.set(d,b)}):a.set(d,c)};return d});
define("shovejs/service/SelectionService",["require","lib/signals"],function(a){var f=a("lib/signals"),a=function(){this.deselectSignal=new f.Signal;this.selectSignal=new f.Signal};a.prototype.select=function(a){a&&this.selectSignal.dispatch({selection:a})};a.prototype.deselect=function(a){this.deselectSignal.dispatch({selection:a})};return a});
define("shovejs/ModelMediator",["require","shovejs/model/Dictionary","lib/signals"],function(a){var f=a("shovejs/model/Dictionary"),c=a("lib/signals"),a=function(a){this.__on__=new f;for(var g in a)this.__defineSetter__(g,function(c){this.set(a,g,c)}),this.__defineGetter__(g,function(){this.get(a,g)}),this.__on__.set(g,new c.Signal)};a.prototype.get=function(a,c){return a[c]};a.prototype.set=function(a,c,f){a[c]=f;this.__on__.get(c).dispatch({model:a,key:c,value:f})};return a});
define("shovejs","require,shovejs/model/ClassRegistry,shovejs/model/ObjectRegistry,shovejs/model/Dictionary,shovejs/model/DictionaryFactory,shovejs/service/JSONService,shovejs/service/ObjectIdentityService,shovejs/service/SelectionService,shovejs/Context,shovejs/Injector,shovejs/MediatorMap,shovejs/ModelMediator".split(","),function(a){var f={};f.model={ClassRegistry:a("shovejs/model/ClassRegistry"),ObjectRegistry:a("shovejs/model/ObjectRegistry"),Dictionary:a("shovejs/model/Dictionary"),DictionaryFactory:a("shovejs/model/DictionaryFactory")};
f.service={JSONService:a("shovejs/service/JSONService"),ObjectIdentityService:a("shovejs/service/ObjectIdentityService"),SelectionService:a("shovejs/service/SelectionService")};f.Context=a("shovejs/Context");f.Injector=a("shovejs/Injector");f.MediatorMap=a("shovejs/MediatorMap");f.ModelMediator=a("shovejs/ModelMediator");return f});