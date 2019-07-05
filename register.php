<?php
if($_SERVER['REQUEST_METHOD']=='POST'){

 $name = $_POST['name'];
 $username = $_POST['username'];
 $password = $_POST['password'];
 $email = $_POST['email'];
 $phone = $_POST['phone'];
 $birthday = $_POST['birthday'];
 $permadd = $_POST['permadd'];
 $rnumber = $_POST['rnumber'];
 $hnumber = $_POST['hnumber'];
 $pyear = $_POST['pyear'];
 $gender = $_POST['gender'];
 $s1 = $_POST['s1'];
 $s2 = $_POST['s2'];
 $job = $_POST['job'];

 
 require_once('config.php');
 $sql = "SELECT * FROM ssralumni WHERE username='$username' OR email='$email' OR name='$name'";
 
 $check = mysqli_fetch_array(mysqli_query($con,$sql));
 
 if(isset($check)){
 echo 'Details already exists';
 }else{ 
 $sql = "INSERT INTO ssralumni(name,username,password,email,phone,birthday,permadd,rnumber,hnumber,pyear,gender,s1,s2,job) VALUES('$name','$username','$password','$email','$phone','$birthday','$permadd','$rnumber','$hnumber','$pyear','$gender','$s1','$s2','$job')";
 if(mysqli_query($con,$sql)){
 echo 'Successfully registered';
 }else{
 echo 'oops! Please try again!';
 }
 }
 mysqli_close($con);
 }else{
echo '404 err0r not found';
}
?>