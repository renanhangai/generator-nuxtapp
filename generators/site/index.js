const Generator = require('yeoman-generator');

function askSite( self, sites ) {
	sites = sites || [];
	return self.prompt([{
		name: 'site',
		type: 'input',
		message: 'Nome do site [ENTER para pular]',
	}]).then( ( answers ) => {
		if ( !answers.site )
			return sites;
		sites.push( answers.site );
		return askSite( self, sites );
	});
}

module.exports = class extends Generator {

	prompting() {
		return askSite( this )
			.then( ( sites ) => {
				this.sites = sites;
			});
	}
};