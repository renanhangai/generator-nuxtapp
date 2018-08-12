module.exports = function( config, options ) {
	config.modules.push( [ 'nuxt-sass-resources-loader', options || {} ] );
}