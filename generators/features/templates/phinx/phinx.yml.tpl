paths:
    migrations: '%%PHINX_CONFIG_DIR%%/migrations'
    seeds: '%%PHINX_CONFIG_DIR%%/seeds'

environments:
    default_migration_table: phinxlog
    default_database: database
    database:
        adapter: mysql
        host: "{{= it.database.host }}"
        name: "{{= it.database.database }}"
        user: "{{= it.database.username }}"
        pass: "{{= it.database.password }}"
        port: "{{= it.database.port }}"
        charset: "{{= it.database.charset }}"
templates:
    file: '%%PHINX_CONFIG_DIR%%/templates/Migration.php.tpl'
version_order: creation