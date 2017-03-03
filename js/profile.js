var language;
var uid;
var selectedLanguage;

$(document).ready(function() {    
    uid =  $('#uid').val();

    $.get("/api/v1/getLanguage/" + uid, function(data) {
        language = String(JSON.stringify(data.language));
        language = language.slice(1, language.length-1)
        console.log("language: " + language);
    }).then(function() {
        $('#language option[value="' + language + '"]').attr("selected", "selected");
    });

    $.get("./getAbbreviations/" + uid, function(data) {
        var html ='';
        for (var i = 0; i < data.length; i++) {
            var d = data[i];
            console.log(d.abbr + " --> " + d.full);
            var row = '<tr> <td> <span class="index">' + (i+1) + '</span> </td> <td class="aid" style="display: none">' + d._id + '</td> <td>' + d.abbr + '</td> <td>' + d.full + '</td> <td> <i class="fa fa-minus-square" aria-hidden="true"></i> </td> </tr>'
            html += row
        }
        var form = '<tr> <td> <span class="index">' + (data.length+1) + '</span> </td> <td style="display: none"> </td> <td> <input id="abbr" type="text" class="form-control" placeholder="Abbreviation"> </td> <td> <input id="full" class="form-control" placeholder="Full Term"> </td> <td> <i class="fa fa-plus-square" aria-hidden="true"></i> </td> </tr>';
        html += form;
        $('#abbrTableBody').html(html);
    });

    $('#selectLanguageForm').submit(function(e) {
        e.preventDefault();

        selectedLanguage = $('#language').val();

        if (selectedLanguage != language) {
            $.ajax({
                type: "POST",
                url: 'api/v1/selectLanguage' + '/' + uid + '/' + selectedLanguage,
                data: { uid: uid, lang: selectedLanguage },
                success: function(res) {
                    console.log('It worked! The language was changed to ' + selectedLanguage)
                },
                error: function(xhr, ajaxOptions, thrownError) {
                    console.log(xhr.status);
                    console.log(thrownError);
                }
            });
        }   
        return false;
    });

    // delete abbreviations 
    $('#abbrTable').on('click', '.fa-minus-square', function(){
        var row = $(this).parent().parent();
        var aid = row.find('.aid').text();

        $.ajax({
            type: "POST",
            url: '/api/v1/deleteAbbreviation/' + aid,
            data: { aid: aid },
            success: function(res) {
                console.log('Deleted abbreviation:' + res.abbr + ' --> ' + res.full + '!')

                $(row).hide('slow', function() { 
                    $(row).remove(); 
                    renumberTable(); 
                });
                
            },
            error: function(xhr, ajaxOptions, thrownError) {
                console.log(xhr.status);
                console.log(thrownError);
            }
        });
    });

    // add abbreviations
    $('#abbrTable').on('click', '.fa-plus-square', function() {
        var row = $(this).parent().parent();
        var index = row.index();

        var abbr = $('#abbr').val().trim().toLowerCase();
        var full = $('#full').val().trim().toLowerCase(); 

        $.ajax({
            type: "POST",
            url: '/api/v1/createAbbreviation/' + uid + '/' + abbr + '/' + full,
            data: { uid: uid, abbr: abbr, full: full },
            success: function(res) {
                console.log('Added abbreviation:' + abbr + " --> " + full + '!')

                $(row).remove();

                var newRow = '<tr> <td> <span class="index">' + (index+1) + '</span> </td> <td class="aid" style="display: none">' + res._id + '</td> <td>' + abbr + '</td> <td>' + full + '</td> <td> <i class="fa fa-minus-square" aria-hidden="true"></i> </td> </tr>';
                $('#abbrTable').append(newRow);
                
                var form = '<tr> <td> <span class="index">' + (index+2) + '</span> </td> <td style="display: none"> </td> <td> <input id="abbr" type="text" class="form-control" placeholder="Abbreviation"> </td> <td> <input id="full" class="form-control" placeholder="Full Term"> </td> <td> <i class="fa fa-plus-square" aria-hidden="true"></i> </td> </tr>';
                $('#abbrTable').append(form);
            },
            error: function(xhr, ajaxOptions, thrownError) {
                console.log(xhr.status);
                console.log(thrownError);
            }
        }); 
    });
});

function renumberTable() {
    var renum = 1;
    $("#abbrTable .index").each(function() {
        $(this).text(renum);
        renum += 1;
    });
}