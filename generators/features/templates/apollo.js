module.exports = function( config, options ) {
	if ( !options )
		return;
	if ( typeof(options) === 'string' ) {
		options = {
			clientConfigs: {
				default: options,
			},
		};
	}
	config.modules.push( [ "@nuxtjs/apollo", options ] );
}