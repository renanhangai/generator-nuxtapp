const path = require( "path" );

module.exports = function( config, options ) {
	config.plugins.push( path.resolve( __dirname, "plugins/vuelidate.js" ) );
}