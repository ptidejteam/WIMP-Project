$(function(){
    $('#login-form').on('submit', function(e){
        alertify.set('notifier','position', 'top-right');
        e.preventDefault();
        $.ajax({
            url: protocol + '://' + backendUrl + '/login',
            type: 'POST',
            data: $('#login-form').serialize(),
            success: function(data){
                location.href = "/profile/" + $('#username').val();
            },
            error: function(data){
                console.log(data);
                if ((data.status === 401) || (data.status === 429)) { 
                    alertify.error(data.statusText + ": " + data.responseText, 'error', 5 )
                };
            }            
        });
    });
});