$(function(){
    $(function(){
        $('#login-form').on('submit', function(e){
            alertify.set('notifier','position', 'top-right');
            e.preventDefault();
            $.ajax({
                url: protocol + '://' + frontendUrl + '/login',
                type: 'POST',
                data: $('#login-form').serialize(),
                success: function(data){
                    localStorage.clear();
                    location.href = "/home";
                },
                error: function(data){
                    if ((data.status === 401) || (data.status === 429)) { 
                        alertify.error(data.statusText + ": " + data.responseText, 'error', 5 )
                    };
                }            
            });
        });
    });
});
