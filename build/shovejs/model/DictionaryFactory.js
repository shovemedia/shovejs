define(["require","shovejs/Context","shovejs/model/Dictionary","shovejs/service/JSONService"],function(g){var i=g("shovejs/Context"),j=g("shovejs/model/Dictionary"),g=g("shovejs/service/JSONService"),f=function(){};f.toString=function(){return"[DictionaryFactory Class]"};f.injectionFields={context:i,jsonService:g};f.prototype.toJSON=function(b){var c={};if(b.keys){c.keys=[];for(var a=0,d=b.keys.length;a<d;a++)c.keys.push(this.jsonService.toJSONref(b.keys[a]))}if(b.values){c.values=[];a=0;for(d=b.values.length;a<
d;a++)c.values.push(this.jsonService.toJSONref(b.values[a]))}return c};f.prototype.fromJSON=function(b){for(var c=new j,a=0,d=b.keys.length;a<d;a++){var e=b.keys[a],h=b.values[a];c.set(e,h);this.getKeyValueResolver(c,e,h)}return c};f.prototype.getKeyValueResolver=function(b,c,a){var d=c.promise,e=a.promise;d&&e?d.then(function(a){e.then(function(c){b.remove(d);b.set(a,c)})}):d?d.then(function(c){b.remove(d);b.set(c,a)}):e?e.then(function(a){b.set(c,a)}):b.set(c,a)};return f});