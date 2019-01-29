<?php
class JConfig {
	public $host = '';
	public $user = '';
	public $password = '';
	public $db = '';

	function getMysqlConfigFilename() {
        return "my.cnf";
	}

   function __construct() {
        $fname = $this->getMysqlConfigFilename();
        $handle = @fopen($fname, "r");
        if ($handle) {
            while (($buffer = fgets($handle, 4096)) !== false) {
//                print $buffer;
                if (strpos($buffer, "=")) {
                  $buffer = str_replace("\n", "", $buffer);
                  $keyval = explode("=", $buffer);
                  $key = $keyval[0];
                  $val = $keyval[1];
                  $this->$key = $val;
                }
            }

            $this->db = $this->database;
            if (!feof($handle)) {
                print "Error: unexpected fgets() fail on $fname\n";
            }
            fclose($handle);
        }
   }

}



