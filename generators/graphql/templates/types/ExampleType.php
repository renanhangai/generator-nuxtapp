<?php
namespace <%= phpNamespace %>\graphql\types;

use <%= phpNamespace %>\graphql\Type;

class ExampleType extends \GraphQL\Type\Definition\ObjectType {

	public function __construct() {
		$config = [
			"fields" => [
				"example_field" => Type::string(),
			],
		];
		parent::__construct( $config );
	}
};