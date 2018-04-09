    var jq = document.createElement('script');
    jq.src = "https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js";
    document.getElementsByTagName('head')[0].appendChild(jq);

$("<style type='text/css'> .hack_input{ width:100pt; background-color:lightgray;} </style>").appendTo("head");
$("form:contains('Batch change')").after("<form novalidate='novalidate'><h2>Easy_batch_change</h2>temporalId: <input type='text' class='hack_input'><br>startFrame: <input type='text' class='hack_input'><br>EndFrame: <input type='text' class='hack_input'><br>Object type<select class='hack_input' id='hack_select_type'><option value='car'>car</option><option value='bus'>bus</option><option value='pedestrian'>pedestrian</option><option value='speed limit sign'>speed limit sign</option><option value='bicycle'>bicycle</option><option value='motorcycle'>motorcycle</option><option value='special vehicle'>special vehicle</option><option value='truck'>truck</option><option value='traffic light'>traffic light</option><option value='movable object'>movable object</option></select><br>Attribute:<select class='hack_input' id='hack_select_key'></select><br>Value:<select class='hack_input' id='hack_select_val'></select><input type='text' class='hack_input' id='hack_input_temporalId'><br></form>");
attributes_json = JSON.parse('{"car":{"action":["waiting","driving","turn left","turn right","lane change left","lane change right","park in","park out","parking"],"driving direction":["oncoming vehicles","preceding vehicles"],"blinker":["off","left","right","unknown","other"]},"bus":{"action":["waiting","driving","turn left","turn right","lane change left","lane change right","park in","park out","parking"],"driving direction":["oncoming vehicles","preceding vehicles"],"blinker":["off","left","right","unknown","other"]},"pedestrian":{"action":["crossing the road","crossing on a crosswalk","not on the road"]},"speed limit sign":{},"bicycle":{},"motorcycle":{"action":["waiting","driving","turn left","turn right","lane change left","lane change right","park in","park out","parking"],"driving direction":["oncoming vehicles","preceding vehicles"],"blinker":["off","left","right","unknown","other"]},"special vehicle":{"action":["waiting","driving","turn left","turn right","lane change left","lane change right","park in","park out","parking"],"type":["emergency vehicle","site vehicle","other"],"blinker":["off","left","right","unknown","other"]},"truck":{"action":["waiting","driving","turn left","turn right","lane change left","lane change right","park in","park out","parking"],"driving direction":["oncoming vehicles","preceding vehicles"],"blinker":["off","left","right","unknown","other"]},"traffic light":{"state":["red","yellow","green","off","other","unknown"],"direction":["no direction","arrow straight","arrow right","arrow left","arrow other","other","unknown"]},"movable object":{"type":["stroller","walking frame","other"]}}')

$("#hack_select_type").html("");
$.map( Object.keys(attributes_json), function (object_type){
    $("#hack_select_type").append($("<option />").val(object_type).text(object_type));
});


$("#hack_select_type").change(function(){
    var object_type=$("#hack_select_type").val();
    $("#hack_select_key").html("");
    $("#hack_select_val").html("");    
    $("#hack_select_key").append($("<option />").val("temporalId").text("temporalId"));
    $.map( Object.keys(attributes_json[object_type]), function (attr_key)
    {
        $("#hack_select_key").append($("<option />").val(attr_key).text(attr_key));
    })
    $("#hack_select_key").change();
});
$("#hack_select_key").change(function(){
    var object_type=$("#hack_select_type").val();
    var attr_key=$("#hack_select_key").val();
    if (attr_key=="temporalId")
    {
        $("#hack_select_val").hide();
        $("#hack_input_temporalId").show();
    }
    else
    {
        $("#hack_select_val").show();
        $("#hack_input_temporalId").hide();
        $("#hack_select_val").html("");    
        $.map( attributes_json[object_type][attr_key], function (attr_val){
            $("#hack_select_val").append($("<option />").val(attr_val).text(attr_val));
        })
    };
});

$("#hack_select_type").change(();
