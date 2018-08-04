module.exports = function( config, options ) {
	config.modules.push( [ "nuxt-buefy", options || {} ] );
}