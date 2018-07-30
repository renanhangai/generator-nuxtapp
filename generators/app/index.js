const Generator = require('yeoman-generator');

module.exports = class extends Generator {

	prompting() {
		return this.prompt([{
			name: 'name',
			type: 'input',
			message: 'Digite o nome do projeto',
		}]).then( ( answers ) => {
			this.anwsers = answers;
		});
	}

	writing() {
		const files = {
			"gitignore": ".gitignore",
			"package.json": "package.json",
			"README.md": "README.md",
		};
		for ( const srcFile in files ) {
			this.fs.copyTpl(  this.templatePath( srcFile ), this.destinationPath( files[srcFile] ), {
				anwsers: this.anwsers,
			});
		}
	}

	install() {
		this.installDependencies({
			npm:   false,
			bower: false,
			yarn:  true
		});
		this.yarnInstall( [ "nuxt", "cross-env" ], { dev: true } );
	}
};