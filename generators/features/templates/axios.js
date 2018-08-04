module.exports = function( config, options ) {
	config.modules.push( [ "@nuxtjs/axios", options || {} ] );
}