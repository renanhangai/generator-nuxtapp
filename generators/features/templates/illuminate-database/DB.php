<?php
namespace <%= phpNamespace %>\core;

use <%= phpNamespace %>\Config;
use Illuminate\Database\Capsule\Manager as Capsule;

$capsule = new Capsule;
$capsule->addConnection([
	'driver'    => 'mysql',
	'host'      => Config::get( "database.host" ),
	'port'      => Config::get( "database.port" ),
	'database'  => Config::get( "database.database" ),
	'username'  => Config::get( "database.username" ),
	'password'  => Config::get( "database.password" ),
	'charset'   => Config::get( "database.charset" ),
]);
$capsule->setAsGlobal();
$capsule->bootEloquent();