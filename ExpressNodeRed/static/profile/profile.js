$(function(){

    let counter = 0;

    $(document).ready( function () {
        $('[id^=color-selector]').each(function() {
            const initColor = $(this).attr('init');
            $(this).val(initColor);
        });

        counter = $("div[id^=state-]").length;

        $("#save-states").attr("disabled", true);

        $('[id^=visibility-').each(function() {
            const initVisibility = $(this).attr('init');
            if (initVisibility === 'true') {
                $(this).attr('checked', true);
            }
        });
    });

    $('[id^=visibility-').on('change', function() {
        $("#save-states").removeAttr("disabled");
    });

    $('#add-state').on("click", function(e){
        $('#states').append(
            `<div id="state-${counter}" class="state">
                <h1>+</h1>
                <div>
                    <p>Message :</p>
                    <input id="state-msg-${counter}" type="text" value="" placeholder="Describe your state..." maxlength = "25">
                </div>
                    
                <div>
                    <p>Color :</p>
                    <select id="color-selector-${counter}">
                        <option value="--color--" disabled selected>--color--</option>
                        <option value="green">green</option>
                        <option value="orange">orange</option>
                        <option value="red">red</option>
                    </select>
                </div>
                <div class="visibility">
                    <p>Visibility :</p>
                    <label>Student</label>
                    <input type="checkbox" id="visibility-student">
                    <label>Researcher</label>
                    <input type="checkbox" id="visibility-researcher">
                    <label>Colleague</label>
                    <input type="checkbox" id="visibility-colleague">
                </div>
                <p id="preview-${counter}" class="status" style="margin-left: 10px;"></p>
            </div>`
        );
        counter++;
        $("#save-states").removeAttr("disabled");
        });


    $('#states').on("keyup", '[id^=state-msg-]', function(e){
        $('#preview-' + $(this).attr('id').split("-")[2]).text($(this).val());
        $("#save-states").removeAttr("disabled");
    });

    $('#states').on('change', '[id^=color-selector-]', function() {
        const id = $(this).attr('id').split("-")[2];
        let classList = $('#preview-' + id).attr('class').split(" ");
        classList = classList.filter(it => it === "status");
        let currentValue = $(this).find(":selected").text();
        classList.push(currentValue);
        $('#preview-' + id).attr('class', classList.join(" "));

        $("#save-states").removeAttr("disabled");
    });

    $('#my-flow').on("click", function(e){
        e.preventDefault();
        const params = {"id": "Get Fitbit Profile"};
        let isClosed = 0;

        alertify.confirm("You're going to be redirected on Node-RED interface. Please only edit the tab that corresponds to your profile.", function (e) {
            if (e) {
                $.ajax({
                    url: 'http://localhost:8000/red?' + $.param(params),
                    type: 'GET',
                    success: function(data){
                        console.log(data);
                    },
                    error: function(data){
                        console.log(data);
                    }            
                });
            }
        }).set({title:"Warning"}).set({labels:{ok:'OK', cancel: 'Cancel'}});
    });

    $('#save-states').on("click", function(e){
        const payload = {
            "id": "",
            "states": {}
        };
        payload.id = "1"; //TODO: get the id from the user session

        $('#states')
            .children('div')
            .filter(function() {
                const id = $(this).attr('id').split("-")[1];
                return this.id.match(/state-[0-9]+/) 
                    && ($('#state-msg-' + id).val() !== "") 
                    && ($('#color-selector-' + id).find(":selected").text() !== "--color--");
            })
            .each(function() {
                const id = $(this).attr('id').split("-")[1];
                const msg = $('#state-msg-' + id).val();
                const color = $('#color-selector-' + id).find(":selected").text();
                const visibility = {
                    "student": $(this).find('#visibility-student').is(':checked'),
                    "researcher": $(this).find('#visibility-researcher').is(':checked'),
                    "colleague": $(this).find('#visibility-colleague').is(':checked')
                };
                payload.states[id] = {msg, color, visibility};
                
        });

        e.preventDefault();
        $.ajax({
            url: 'http://localhost:8000/update-states',
            type: 'POST',
            data: JSON.stringify(payload),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function(data){
                console.log(data);
            },
            error: function(data){
                console.log(data);
            }            
        });

        location.reload();
    });

    $('#logout-btn').on("click", function(e){
        e.preventDefault();
        $.ajax({
            url: 'http://localhost:8000/auth/logout',
            type: 'POST',
            data: JSON.stringify(payload),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function(data){
                console.log(data);
            },
            error: function(data){
                console.log(data);
            }            
        });

        location.reload();
    });
});