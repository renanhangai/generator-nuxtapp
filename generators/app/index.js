const Generator = require('yeoman-generator');

module.exports = class extends Generator {

	initializing() {
		this.composeWith( require.resolve( "../core" ) );
		this.composeWith( require.resolve( "../site" ) );
		this.composeWith( require.resolve( "../features" ) );
		this.composeWith( require.resolve( "../graphql" ) );
	}
};