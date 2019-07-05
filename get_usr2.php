<?php 
 
include 'config.php';

    global $connect;
	$email  = $_GET['email'];
 
 
 $sql = "SELECT * FROM ssralumni WHERE email = '".$email."' ";
 
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