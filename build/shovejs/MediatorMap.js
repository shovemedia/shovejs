define(["require","shovejs/model/Dictionary"],function(a){var c=a("shovejs/model/Dictionary"),a=function(){this.mediatorClassByViewClass=new c};a.prototype.mapView=function(a,b){console.log("map view mediator "+a+" "+b);this.mediatorClassByViewClass.set(a,b)};a.prototype.unmapView=function(a){this.mediatorClassByViewClass.remove(a)};a.prototype.getMediatorClassForViewInstance=function(a){return this.mediatorClassByViewClass.get(a.constructor)};return a});