const Generator = require('yeoman-generator');
const cloneDeep = require( "lodash.clonedeep" );

module.exports = class extends Generator {

	prompting() {
		const alreadyInstaled = this.fs.exists( this.destinationPath( "src/graphql/Type.php" ) );
		if ( alreadyInstaled )
			this.log( `***** Graphql já está instalado ******` );
		return this.prompt([{
			type: "confirm",
			name: "graphql",
			message: `Desejá instalar ${alreadyInstaled ? "(de novo) " : ""}o suporte ao GraphQL?`,
			default: !alreadyInstaled,
		}]).then( ( answers ) => {
			this.answers = answers;
		});
	}

	writing() {
		const inputComposerJson = this.fs.readJSON( this.destinationPath( "composer.json" ) );
		const outputComposerJson = cloneDeep( inputComposerJson );
		const context = {
			phpNamespace: getPhpNamespace( inputComposerJson ),
		};
		this.fs.copyTpl( this.templatePath( "Type.php" ), this.destinationPath( "src/graphql/Type.php" ), context );
		this.fs.copyTpl( this.templatePath( "Context.php" ), this.destinationPath( "src/graphql/Context.php" ), context );
		this.fs.copyTpl( this.templatePath( "types/ExampleType.php" ), this.destinationPath( "src/graphql/types/ExampleType.php" ), context );

		outputComposerJson.require = Object.assign( {
			"pimple/pimple": "^3.0",
			"webonyx/graphql-php": "^0.12.5",
		}, outputComposerJson.require );

		this.fs.write( this.destinationPath( "composer.json" ), JSON.stringify( outputComposerJson, null, "    " ) );
	}
};

function getPhpNamespace( composerJson ) {
	let namespace = Object.keys( composerJson.autoload["psr-4"] )[0];
	return namespace.substr(0, namespace.length - 1 );
}