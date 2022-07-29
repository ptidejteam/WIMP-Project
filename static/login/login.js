$(function(){
    $(function(){
        $('#login-form').on('submit', function(e){
            alertify.set('notifier','position', 'top-right');
            e.preventDefault();
            $.ajax({
                url: 'http://localhost:3000/login',
                type: 'POST',
                data: $('#login-form').serialize(),
                success: function(data){
                    location.href = "/home";
                },
                error: function(data){
                    console.log("failed");
                    if (data.status === 401) { alertify.error(data.statusText + ": Invalid credentials", 'error', 5 )};
                }            
            });
        });
    });
});