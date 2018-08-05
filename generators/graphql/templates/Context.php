<?php
namespace <%= phpNamespace %>\graphql;

/**
 * Context for graphql requests
 */
class Context {

	// Construct the context using the request and the site
	public function __construct( $req, $res, $site = null ) {
		$this->req_  = $req;
		$this->res_  = $res;
		$this->site_ = $site;
	}
	
	// Getters for private variables
	public function getRequest() { 
		return $this->req_;
	}
	public function getResponse() { 
		return $this->req_;
	}
	public function getSite() { 
		return $this->site_;
	}

	private $req_;
	private $res_;
	private $site_;
}