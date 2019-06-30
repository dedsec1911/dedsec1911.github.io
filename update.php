<?php
if($_SERVER['REQUEST_METHOD']=='POST'){

 
 $name = $_POST['name'];
 $username = $_POST['username'];
 $email = $_POST['email'];
 $phone = $_POST['phone'];
 $birthday = $_POST['birthday'];
 $permadd = $_POST['permadd'];
 $hnumber = $_POST['hnumber'];
 $rnumber = $_POST['rnumber'];
 $pyear = $_POST['pyear'];


 require_once('config.php');
 
 //$sql = "INSERT INTO Labs(username) VALUES('$username') WHERE LabName='$LabName'";
 $sql = "UPDATE ssralumni SET name='$name', username='$username', email='$email', phone='$phone', birthday='$birthday', permadd='$permadd', hnumber='$hnumber', rnumber='$rnumber', pyear='$pyear' WHERE email = '$email'";
 
 if(mysqli_query($con,$sql)){
 echo 'Successfully Updated';
 }else{
 echo 'oops! Please try again!';
 }
 
 mysqli_close($con);
 }
 else{
echo '404 err0r not found';
}
?>		