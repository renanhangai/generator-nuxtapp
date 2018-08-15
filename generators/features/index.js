const Generator = require('yeoman-generator');
const FeatureManager = require( "./FeatureManager" );
const inquirer = require( "inquirer" );
const FEATURES = require( "./FeatureList" );

/**
 * Helper class for testing features and enabling then
 */
class FeatureHelper {


	static findFeature( name ) {
		const feature = FEATURES.find( ( feature ) => {
			if ( !Array.isArray( feature ) )
				return false;
			return feature[0] === name;
		} );
		if ( !feature )
			throw new Error( `Invalid feature ${name}` );
		return feature[1];
	}

	static getPromptChoices( featureManager, force ) {
		const choices = [];
		FEATURES.forEach( function( featureDescription ) {
			if ( featureDescription instanceof inquirer.Separator ) {
				choices.push( featureDescription );
				return;
			} 
			
			const featureName = featureDescription[0];
			const feature     = featureDescription[1];
			const isInstalled = featureManager.check( feature );
			const c = { 
				name: featureName, 
				checked:  force ? false : featureDescription.checked,
				disabled: force ? false : (isInstalled ? "Instalado" : false),
			};
			choices.push( c );
		});
		return choices;
	}
}

/**
 * Generator class
 */
module.exports = class extends Generator {

	constructor( args, opts ) {
		super( args, opts );
		this.option( 'force', {
			desc:  "Força a instalação de módulos mesmo já instalados",
			alias: "f",
			type:  Boolean,
		} );
	}

	prompting() {
		this.featureManager = new FeatureManager( this );

		const choices = FeatureHelper.getPromptChoices( this.featureManager, this.options.force );
		if ( !choices.some( ( item ) => !item.disabled ) )
			this.log( `Todos os módulos já foram instalados` );

		return this.prompt([{
			name: 'features',
			type: 'checkbox',
			message: 'Diga quais módulos você quer',
			pageSize: 21,
			choices,
		}]).then( ( answers ) => {
			this.answers = answers;	
		});
	}

	configuring() {
		this.featureAnswers = {};
		return asyncForEach( this.answers.features, ( name ) => {
			const feature = FeatureHelper.findFeature( name );
			if ( !feature.prompt )
				return;
			return this.prompt( feature.prompt )
				.then( ( answers ) => this.featureAnswers[ name ] = answers )
		});
	}

	writing() {
		if ( !this.answers )
			return;
		this.featureManager.reload();
		this.answers.features.forEach( ( name ) => {
			const feature = FeatureHelper.findFeature( name );
			this.featureManager.install( feature, {
				name: name,
				answers: this.featureAnswers[ name ],
			});
		});
		this.featureManager.write();
	}

};

function asyncForEach( list, resolver ) {
	const run = ( i ) => {
		if ( i >= list.length )
			return;
		return Promise.resolve()
			.then( () => resolver.call( null, list[i] ) )
			.then( () => run( i + 1 ) );
	};
	return Promise.resolve().then( () => run(0) );
}