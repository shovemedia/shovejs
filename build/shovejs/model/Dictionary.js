define(["require"],function(){var b=function(){this.keys=[];this.values=[]};b.prototype.get=function(a){a=this.keys.indexOf(a);if(a!=-1)return this.values[a]};b.prototype.getKey=function(a){a=this.values.indexOf(a);if(a!=-1)return this.keys[a]};b.prototype.set=function(a,b){var c=this.keys.indexOf(a);c==-1&&(this.keys.push(a),c=this.keys.length-1);this.values[c]=b};b.prototype.remove=function(a){a=this.keys.indexOf(a);if(a!=-1){var b=this.values[a];delete this.values[a];delete this.keys[a];return b}};
b.prototype.forEach=function(a,b){for(var c=0,d=this.keys.length;c<d;c++)c in this.keys&&a.call(b,this.values[c],this.keys[c],this)};return b});