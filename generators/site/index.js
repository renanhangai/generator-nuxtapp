const Generator = require('yeoman-generator');
const YAML = require( "js-yaml" );
const cloneDeep = require( "lodash.clonedeep" );
const ejs = require( "ejs" );

class SiteGenerator {

	constructor( siteList ) {
		this.sites = {};
		siteList.forEach( ( site ) => {
			this.sites[site] = { name: site };
		});
	}

	/*
	  Process package.json file

	  Sets the new script entries and generate files
	*/
	processPackage( inputPackage ) {
		const outputPackage   = cloneDeep( inputPackage );

		let packagePort = SiteGenerator.calculatePackageScriptPort( outputPackage );
		for ( const site in this.sites ) {
			this.sites[site].portDev = packagePort;
			packagePort += 1;
		}

		for ( const site in this.sites ) {
			outputPackage.scripts["dev:"+site] = `cross-env PORT=${this.sites[site].portDev} nuxt dev --config-file 'www/${site}/nuxt.config.js'`;
			outputPackage.scripts["generate:"+site] = `nuxt generate --config-file 'www/${site}/nuxt.config.js'`;
		}

		const buildScripts = [];
		for ( const scriptName in outputPackage.scripts ) {
			if ( scriptName.startsWith( "generate:" ) )
				buildScripts.push( scriptName );
		}
		outputPackage.scripts["generate"] = buildScripts.map( ( s ) => `yarn run '${s}'` ).join( " && " );

		const scripts = {};
		Object.keys( outputPackage.scripts ).sort().forEach( ( script ) => {
			scripts[script] = outputPackage.scripts[ script ];
		});
		outputPackage.scripts = scripts;

		return outputPackage;
	}

	/*
	  Process docker-compose.yml

	  Adds the server to the exposed ports
	*/
	processDockerCompose( inputDockerCompose ) {
		const outputDockerCompose = cloneDeep( inputDockerCompose );

		let instancePort = SiteGenerator.calculateDockerComposePort( inputDockerCompose );
		for ( const site in this.sites ) {
			this.sites[site].portHost = instancePort;
			instancePort += 1;
		}

		outputDockerCompose.services.server.ports = outputDockerCompose.services.server.ports || [];
		for ( const site in this.sites ) {
			const port = this.sites[site].portHost;
			outputDockerCompose.services.server.ports.push( `${port}:${port}` );
		}

		return outputDockerCompose;

	}

	static calculatePackageScriptPort( inputPackage ) {
		let port = 3000;
		for ( const scriptName in inputPackage.scripts ) {
			if ( !scriptName.startsWith( "dev:" ) )
				continue;
			const script = inputPackage.scripts[scriptName];
			const match = script.match( /PORT=(\d+)/ );
			if ( !match )
				continue;
			port = Math.max( port, parseInt( match[1], 10 ) + 1 );
		}
		return port;
	}

	static calculateDockerComposePort( inputDockerCompose ) {
		let port = 8080;
		const ports = inputDockerCompose.services.server.ports || [];
		ports.forEach( ( portDefinition ) => {
			const [localPort, containerPort] = portDefinition.split( ":" );
			let localPortInt = parseInt( localPort, 10 );
			if ( localPortInt >= port )
				port = localPortInt+1;
		});
		return port;
	}
}

module.exports = class extends Generator {

	prompting() {
		return askSite( this )
			.then( ( sites ) => {
				this.sites = sites;
			});
	}
	
	writing() {
		const inputPackage = this.fs.readJSON( this.destinationPath( "package.json" ) );
		const inputDockerCompose = YAML.safeLoad( this.fs.read( this.destinationPath( "docker-compose.yml" ) ) );
		
		const siteGenerator = new SiteGenerator( this.sites );

		const outputPackage = siteGenerator.processPackage( inputPackage );
		this.fs.writeJSON( this.destinationPath( "package.json" ), outputPackage );

		const outputDockerCompose = siteGenerator.processDockerCompose( inputDockerCompose );
		this.fs.write( this.destinationPath( "docker-compose.yml" ), YAML.safeDump( outputDockerCompose ) );

		// Compile site related
		this.sites.forEach( ( site ) => {
			this.fs.copyTpl( this.templatePath( "nuxt.config.js" ), this.destinationPath( `www/${site}/nuxt.config.js` ), { site: site } );
			this.fs.copyTpl( this.templatePath( "index.vue" ), this.destinationPath( `www/${site}/pages/index.vue` ), { site: site } );
		});

		// Compile PHP-api related
		const inputComposer = this.fs.readJSON( this.destinationPath( "composer.json" ) );
		const phpNamespace  = Object.keys( inputComposer.autoload["psr-4"] )[0].slice(0, -1);
		this.sites.forEach( ( site ) => {
			const context = { site: site, phpNamespace: phpNamespace };
			this.fs.copyTpl( this.templatePath( "index.php" ), this.destinationPath( `src/api/${site}/index.php` ), context );
			this.fs.copyTpl( this.templatePath( "App.php" ), this.destinationPath( `src/api/${site}/App.php` ), context );
		});

		// Append site
		const httpConfigTemplate = this.fs.read( this.templatePath( "http-config" ) );
		this.sites.forEach( ( site ) => {
			const context = { site: siteGenerator.sites[site] };
			this.fs.append( this.destinationPath( "etc/server/http/default" ), ejs.render( httpConfigTemplate, context ) );
		});
	}
};

// Ask for site names
function askSite( self ) {
	return self.prompt([{
		name: 'site',
		type: 'input',
		default: "site",
		message: 'Nome dos sites',
	}]).then( ( answers ) => {
		let sites = answers.site.split( /\s+/ );
		sites = sites.filter( ( s ) => {
			return !self.fs.exists( self.destinationPath( `www/${s}/nuxt.config.js` ) );
		});
		return sites;
	});
}
