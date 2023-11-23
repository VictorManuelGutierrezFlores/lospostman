/// LOGIN FORM
$(document).ready( function(){
    console.log("JQuery Working")
    $('#loginButton').click(function(e){
        $.ajax({
            url: "http://localhost/serviciosweb/lospostman/autenticacion",
            method: 'POST',
            headers: {
                "user": $('#username').val(),
                "pass": $('#password').val()
            },
            success: function(data){
                if(data.status == "Success"){
                    alert('Login successful!');
                    window.location.href = 'http://localhost/serviciosweb/lospostman/dashboard.html';
                }else{
                    alert("Login failed!");
                }
            }
        });
        e.preventDefault();
    });
});
