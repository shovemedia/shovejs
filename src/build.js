({

	appDir: ".",
	baseUrl: ".",

	dir: "../build/",

	paths : {
		jquery: "lib/jquery-1.7.1"
	},

    name: "shovejs",

    exclude: [
        'lib/signals',
        'lib/q',
        'lib/json2',
        'jquery'
    ],

	//stubModules: ['lib/signals', 'lib/q', 'lib/json2', 'lib/jquery'],


    //Comment out the optimize line if you want
    //the code minified by UglifyJS
    //optimize: "none"
    optimize: "closure"
 
})