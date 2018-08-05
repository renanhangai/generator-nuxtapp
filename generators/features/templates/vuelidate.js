const path = require( "path" );

module.exports = function( config, options ) {
	config.plugins.push( path.resolve( __dirname, "plugins/vuelidate.js" ) );
	config.extend.push(function( webpackConfig ) {
		webpackConfig.resolve.alias["~validators"] = "@@/www/common/validators";
	});
}