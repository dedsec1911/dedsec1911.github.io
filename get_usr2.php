<?php 
 
include 'config.php';

    global $connect;
	$name  = $_GET['name'];
 
 
 $sql = "SELECT * FROM ssralumni WHERE name = '".$name."' ";
 
 $r = mysqli_query($con,$sql);
 
 $res = mysqli_fetch_array($r);
 
 $result = array();
 
 array_push($result,array(
 "name"=>$res['name'],
 "username" =>$res['username'],
 "email"=>$res['email'],
 "phone"=>$res['phone'],
 "birthday"=>$res['birthday'],
 "permadd"=>$res['permadd'],
 "hnumber"=>$res['hnumber'],
 "rnumber"=>$res['rnumber'],
 "pyear"=>$res['pyear']
 )
 );
 
 echo json_encode(array("result"=>$result));
 
 mysqli_close($con);
 
 ?>