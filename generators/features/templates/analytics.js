module.exports = function( config, options ) {
	if ( !options )
		return;
	config.modules.push( [ "@nuxtjs/google-analytics", options ] );
}