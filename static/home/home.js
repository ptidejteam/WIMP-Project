setTimeout(function(){
    location.reload(1);
}, 20000);

let currentBuilding = "";
let currentDepartment = "";
let currentSearchBar = "";

let localBuilding = localStorage.getItem("currentBuilding");
let localDepartment = localStorage.getItem("currentDepartment");
let localSearchBar = localStorage.getItem("currentSearchBar");

function filter() {
    let value = $("#search-bar").val();
    value = value.toLowerCase();
    const buildingSelected = $('#building-selector').val();
    const departmentSelected = $('#department-selector').val();

    $('main').children('article').each(function(){
        $(this).hide();
        const firstName = $(this).find('#firstName').attr("value").toLowerCase();
        const lastName = $(this).find('#lastName').text().toLowerCase();
        const building = $(this).find('#building').text();
        const department = $(this).find('#department').text();

        if ((buildingSelected === "All" || building === buildingSelected) && (departmentSelected === "All" || department === departmentSelected)) {
            if(firstName.includes(" ")) {
                const firstNameSplit = firstName.split(' ');
                $(this).hide();
                firstNameSplit.forEach(fn => {
                    if(fn.startsWith(value) || lastName.startsWith(value)){
                        $(this).show();
                    }
                });
            } else {
                if((firstName.includes(value) || lastName.includes(value))){
                    $(this).show();
                }
            }
        }
    });
}

$(function(){
    $(document).ready( function () {
        $.ajax({
            url: protocol + '://' + backendUrl + '/api/filter/building',
            type: 'GET',
            success: function(data){
                data.forEach(building => {
                    if (building === localBuilding) {
                        $('#building-selector').append($('<option/>', { 
                            value: building,
                            text : building,
                            selected: true
                        })).change();
                        $('#building-selector').val(building);
                    } else {
                        $('#building-selector').append($('<option/>', { 
                            value: building,
                            text : building 
                        })).change();
                    }
                }); 
            },
            error: function(data){
                console.log(data);
            }            
        });

        $.ajax({
            url: protocol + '://' + backendUrl + '/api/filter/department',
            type: 'GET',
            success: function(data){
                data.forEach(department => {
                    if (department === localDepartment) {
                        $('#department-selector').append($('<option/>', { 
                            value: department,
                            text : department,
                            selected: true
                        }));
                        $('#department-selector').val(department);
                    } else {
                        $('#department-selector').append($('<option/>', { 
                            value: department,
                            text : department 
                        }));
                    }
                }); 
            },
            error: function(data){
                console.log(data);
            }            
        });

        $("#search-bar").val(localSearchBar).change();

        $('[id^=pp-]').each(function() {
            const id = $(this).attr('id').split('-')[1];
            const val = $(this).attr('value');
            $.ajax({
                url: protocol + '://' + backendUrl + '/api/pp/' + val,
                type: 'GET',
                success: function(data){
                    $('#pp-' + id).attr('src', "data:image/jpg;base64," + data);
                },
                error: function(data){
                    console.log(data);
                }            
            });
        });
    });

    $('#building-selector').on('change', function() {
        const building = $(this).val();
        localStorage.setItem("currentBuilding", building);
        filter();
    });

    $('#department-selector').on('change', function() {
        const department = $(this).val();
        localStorage.setItem("currentDepartment", department);
        filter();
    });

    $("#search-bar").on("keyup change", function() {
        var value = $(this).val();
        localStorage.setItem("currentSearchBar", value);
        filter();
    });

    $('#filter').on('click', function(){
        if ($('nav').is(':visible')) {
            $('nav').hide();
        } else if ($('nav').is(':hidden')) {
            $('nav').show();
        }
    });

    $('#logout-btn').on("click", function(e){
        e.preventDefault();
        $.ajax({
            url: protocol + '://' + frontendUrl + '/logout',
            type: 'POST',
            success: function(data){
                console.log(data);
                location.reload();
            },
            error: function(data){
                console.log(data);
            }            
        });

    });

    $('#refresh-btn').on("click", function(e) {
        e.preventDefault();
        location.reload();
    });
});


