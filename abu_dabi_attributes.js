// ==UserScript==
// @name         Abu_Dhabi_Show_attributes
// @version      0.1
// @description  color Boxes depending on attributes
// @author       Alexis
// @match        https://ia-abu-dhabi.stickman.services.understand.ai/
// @grant        none
// ==/UserScript==


attribute_label="parking";

attribute_objects=["Vehicle"];

attribute_colors = {
    true:'rgba(0,255,0,0.6)',
    false:'rgba(255,0,0,0.6)',
    "else":'rgba(255,0,255,1)'
};

(function() {
    'use strict';
    var jq = document.createElement('script');
    jq.src = "https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js";
    document.getElementsByTagName('head')[0].appendChild(jq);
    setTimeout(function(){
        $(document).keydown(function(e){
            switch (e.key){
                case " ":
                    $("label:contains('"+attribute_label+"')").next().find(".input-group--selection-controls__ripple").trigger("click");
                    break;
                case "x":
                    show_attributes();
                    break;
                case "y":
                    $("i:contains('keyboard_arrow_left')").click();
                    break;
                case "c":
                    $("i:contains('keyboard_arrow_right')").click();
            }
        });
    }, 2000);

    function show_attributes()
    {
        var frame_id = $(".caption:contains('ID')").parent().text().substring(3).trim();
        $.getJSON( "https://ia-abu-dhabi.stickman.services.understand.ai/api/v1/photos/"+frame_id+"/annotation").done(function(boxdata)
        {
            boxdata = boxdata.annotationDatas;
            var draw_layer=$("#draw-layer");
            var draw_layer2d=draw_layer[0].getContext('2d');
            var frame_width=1280;
            var frame_height=969;
            var canvas_width=draw_layer.width();
            var canvas_height=draw_layer.height();
            for(var box_id in boxdata)
            {
                var box=boxdata[box_id];
                if (attribute_label in box.attributes)
                    if (attribute_objects.indexOf(box.classification.tag)>-1 || attribute_objects.indexOf("all")>-1)
                    {
                        if (box.attributes[attribute_label] in attribute_colors)
                            draw_layer2d.fillStyle = attribute_colors[box.attributes[attribute_label]];
                        else
                            draw_layer2d.fillStyle = attribute_colors["else"];

                        draw_layer2d.fillRect(box.data.topLeftPoint.x/frame_width*canvas_width,
                                              box.data.topLeftPoint.y/frame_height*canvas_height,
                                              box.data.width/frame_width*canvas_width,
                                              box.data.height/frame_height*canvas_height);
                    }
            }
        });
    }
})();
