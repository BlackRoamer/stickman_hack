// ==UserScript==
// @name         EUCALYPTUS
// @version      0.5
// @description  Adding features to stickman
// @author       Alexis
// @match        https://*.stickman.services.understand.ai*plot*
// @grant        none
// ==/UserScript==

easy_attr_macros = {}; //dictionary for easy_attr keys
old_state = ""; // used to check if attributes are changing while fast-forwarding
(function() {
    'use strict';
    if (window.location.href.indexOf("review")==-1)
    {
        // cancel if not in review mode... should also work with the match-tag...
        return;
    }
    // (the require-tag should also do the work.... in theory... i failed on that)
    //load jquery
    // (the require-tag should also do the work.... in theory... i failed on that)
    var jq = document.createElement('script');
    jq.src = "https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js";
    document.getElementsByTagName('head')[0].appendChild(jq);
    function loading_time()
    {
        //wait until stickman is loaded
        //in fact, we wait until there is an object with class tabs__item i.e. the Attributes/Objects-Tabs
        if ($(".tabs__item").size()>0)
             setTimeout(load_control_elements, 500);
        else
        {
            //check again in half a second
            //console.log("we are waiting");
            setTimeout(loading_time, 500);
        }
    }

    //wait half a second until jquery is properly loaded
    setTimeout(loading_time, 500);

    function load_control_elements()
    {
        load_sendkeys();
        //add html for the the stickman_hack-Panel
        $(".align-content-start").last().after("<div class='flex xl2 xs3 fill-height align-content-start'><div class='container py-0 pr-0 fluid grid-list-md fill-height'><div class='layout column'><div class='card' style='height: auto;'><div class='card__text' id='hack_panel'> <h3>EUCALYPTUS</h3><h4>Fast_Forward</h4><div class='layout'><br><div class='input-group input-group--dirty input-group--hide-details input-group--text-field primary--text'><label>Speed (miliseconds until next frame)</label><div class='input-group__input'><input type='text' id='hack_inp_forward' value='+800'><button type='button' class='btn btn--flat btn--small' style='position: relative;'><div class='btn__content' id='hack_btn_forward'>&gt;&gt;</div></button></div><div class='input-group__details'></div></div></div><div class='input-group__input'><i aria-hidden='true' class='hack_checkbox icon icon--selection-control material-icons' style='transform-origin: center top 0px;' id='hack_check_stop_when_lost_tracking'>check_box_outline_blank</i>stop when tracking is lost</div><div class='input-group__input'><i aria-hidden='true' class='hack_checkbox icon icon--selection-control material-icons' style='transform-origin: center top 0px;' id='hack_check_stop_when_attr_empty'>check_box_outline_blank</i>stop when attribute is empty</div><div class='input-group__input'><i aria-hidden='true' class='hack_checkbox icon icon--selection-control material-icons' style='transform-origin: center top 0px;' id='hack_check_stop_when_attr_changed'>check_box_outline_blank</i>stop when attribute changed</div><h4>easy_id:</h4><div class='layout'><div class='input-group input-group--dirty input-group--hide-details input-group--text-field primary--text'><label>temporalId</label><div class='input-group__input'><input type='text' id='hack_inp_easyid'></div><div class='input-group__details'></div><div class='input-group__input'><i aria-hidden='true' class='hack_checkbox icon icon--selection-control material-icons' style='transform-origin: center top 0px;' id='hack_check_easyid_click'>check_box_outline_blank</i>insert temporalId with click</div><div class='input-group__input'><i aria-hidden='true' class='hack_checkbox icon icon--selection-control material-icons' style='transform-origin: center top 0px;' id='hack_check_easyid_advance'>check_box_outline_blank</i>advance frame with click</div></div></div> <h4>easy_attributes:</h4><div style='/* white-space: nowrap; */'><button type='button' class='btn btn--small' style='position: relative;'><div class='btn__content' id='hack_btn_attr_set'>Create Macro</div><input type='text' value='m' style='width: 20pt;text-align: center;' id='hack_inp_attr_key'></button><button type='button' class='btn btn--small' style='position: relative;' id='hack_btn_attr_show'><div class='btn__content'>Show</div></button><button type='button' class='btn btn--small' style='position: relative;' id='hack_btn_attr_del'><div class='btn__content'>Delete</div></button></div><div class='input-group__input'><i aria-hidden='true' class='hack_checkbox icon icon--selection-control material-icons' style='transform-origin: center top 0px;' id='hack_check_attr_use'>check_box_outline_blank</i>Use keys for macros</div><div class='input-group__input'><i aria-hidden='true' class='hack_checkbox icon icon--selection-control material-icons' style='transform-origin: center top 0px;' id='hack_check_attr_tempid'>check_box_outline_blank</i>include temporalId</div><div class='input-group__input'><i aria-hidden='true' class='hack_checkbox icon icon--selection-control material-icons' style='transform-origin: center top 0px;' id='hack_check_attr_advance'>check_box_outline_blank</i>advance frame after macro</div></div></div></div></div></div>");
        //functionality for checkboxes
        $(".hack_checkbox").click(function(){$(this).html($(this).html()=="check_box"?"check_box_outline_blank":"check_box");});
        // functionality for speed-box
        $("#hack_inp_forward").change(function(){
            var play_speed=parseInt($("#hack_inp_forward").val());
            if (!play_speed || play_speed==0)
                $("#hack_inp_forward").val(0);
            else if (play_speed>0)
                $("#hack_inp_forward").val("+"+play_speed);
            else
                $("#hack_inp_forward").val(play_speed);
        });
        //Fast_forward
        $("#hack_btn_forward").click(fast_forward);
        //------------------
        //initialize easy_id
        //------------------
        //bind override_id to canvasclick
        $(".upper-canvas").mouseup(function(){
          if($("#hack_check_easyid_click").html()=="check_box")
              setTimeout(override_id,10);
        });
        //--------------------
        //initialize easy_attr
        //--------------------
        $("#hack_inp_attr_key").keyup(function(e)
        {
            // restrict input to one lowercase character excluding a,r,e (used by stickman), numbers and <,.-öä#+üö
            $("#hack_inp_attr_key").val(((e.keyCode > 64 && e.keyCode < 91)||
                                        (e.keyCode > 47 && e.keyCode < 58)||
                                        [188,190,189, 192,222,186,191,187,220].includes(e.keyCode))&&
                                        ("are".indexOf(e.key.toLowerCase())==-1)?e.key:"");
        });

        $("#hack_btn_attr_set").click(function()
        {
            //set macro
            if ($("#hack_inp_attr_key").val()=="")
                alert("No key specified");
            else
            {
                var dict_attr=copy_attr();
                if (Object.keys(dict_attr).length == 0)
                    alert("no attributes set or shown");
                else
                {
                    easy_attr_macros[$("#hack_inp_attr_key").val()]=copy_attr();
                    alert("set key "+$("#hack_inp_attr_key").val()+" to "+JSON.stringify(copy_attr()));
                }
            }
        });

        $("#hack_btn_attr_show").click(function()
        {
            //show active macros
            alert("The following macros are set to keys\n\n"+JSON.stringify(easy_attr_macros,null,2));
        });

        $("#hack_btn_attr_del").click(function()
        {
            //delete all macros
            easy_attr_macros={};
            alert("deleted all easy_attr-macros");
        });

        $(document).keypress(function(e){
            if (e.key in easy_attr_macros && $("#hack_check_attr_use").html()=="check_box")
                change_attr(easy_attr_macros[e.key]);
        });

    }
})();

function fast_forward()
{
    //click on fast_forward_button
    if ($("#hack_btn_forward").html()=="&gt;&gt;")
    {
       $("#hack_btn_forward").html("||");
       if ($("#hack_check_stop_when_attr_empty").html()=="check_box")
           old_state=JSON.stringify(copy_attr());
       auto_advance();
    }
    else
       $("#hack_btn_forward").html("&gt;&gt;");
}

function auto_advance()
{
    //advace through the frames
    if ($("#hack_btn_forward").html()=="&gt;&gt;")
    {
        //stop advancing if forward-button is set to ">>"
        return;
    }
    play_speed=parseInt($("#hack_inp_forward").val());
    if (play_speed || play_speed!=0)
    {
        autoadvance_wrapper();
    }
}


function autoadvance_wrapper()
{
    //waiting until the frame is loaded before advancing, checking if conditions for advancing are matched
    function stop_forwarding()
    {
        $("#hack_btn_forward").html("&gt;&gt;");
        $("#hack_panel").css("background-color","red");
        setTimeout(function(){$("#hack_panel").css("background-color","");}, 250);
    }
    //wait until the ne frame is loaded i.e. the go_right-Button is enabled
    if($("i:contains('keyboard_arrow_right')").parent().parent().hasClass("btn--disabled"))
    {
        //wait 200 mśec
        setTimeout(autoadvance_wrapper, 200);
    }
    else
    {
        //check conditions for advancing
        if($("#hack_check_stop_when_lost_tracking").html()=="check_box" && !($("label:contains('Tracking')").next().children().children().hasClass("input-group--selection-controls__toggle--active")))
        {
            //stop if tracking is lost
            stop_forwarding();
            return;
        }
        if($("#hack_check_stop_when_attr_empty").html()=="check_box" && ($(".attributes").find(".input-group__selections").size()!=$(".attributes").find(".input-group__selections__comma").size()))
        {
            //stop if attribute is emtpy, that is checked through compairing numbers of input-group__selections and input-group__selections_comma
            stop_forwarding();
            return;

        }
        if($("#hack_check_stop_when_attr_changed").html()=="check_box")
        {
            var new_state=JSON.stringify(copy_attr());
            if(old_state==new_state)
                old_state = new_state;
            else
            {
                stop_forwarding();
                return;
            }
        }
       advance_one_frame(true);
   }
}

function advance_one_frame(continue_advancing)
{
    function advance(direction)
    {
        $("i:contains('keyboard_arrow_"+direction+"')").click();
        if (continue_advancing)
            setTimeout(auto_advance,50);
    }
    play_speed=parseInt($("#hack_inp_forward").val());
    direction = play_speed>0?"right":"left";
    setTimeout(advance, Math.abs(play_speed), direction);
}

function copy_attr()
{
    //get dict of attributes in attribute boxes
    var attr_dict={};
    var input_group_list=$(".attributes").find(".input-group--select").toArray();
    $("h3:contains('Attributes')").parent().find(".input-group--select").each(function(){
        var attr_val =$(this).find(".input-group__selections__comma").text();
        if(attr_val!="")
            attr_dict[$(this).find("label").text()]=$(this).find(".input-group__selections__comma").text();
    });

    if($("#hack_check_attr_tempid").html()=="check_box"&&$('input[name=tempId-input]').val()&&$('input[name=tempId-input]').val()!="")
        attr_dict.temporalId=$('input[name=tempId-input]').val();

    return attr_dict;
}

function change_attr(attr_dict)
{
    //change Attributes via simulated clicks on the input-groups
    var delaytime = 300; //delay between change of attributes
    function hack_change_one(key, val)
    {
        // simulate click and selection on the attribute
        var clickdelay = 200; //deley between clicking and selecting
        $("label:contains('"+key+"')").next().find(".input-group__selections").trigger("click");
        console.log("set "+key+" to "+val);
        setTimeout(function(val)
        {
            //simulate click on menu item
            $(".menu__content:visible").find("li:contains('"+val+"')").trigger("click");
        }, clickdelay, val);
    }
    var delay = 0;
    for (var key in attr_dict)
    {
        var val = attr_dict[key];
        // check if the attribute is already set and change if not so
        if ($("label:contains('"+key+"')").next().find(".input-group__selections").text()!=val)
        {
             console.log("we want to set "+key+" to "+val);
            if (key=="temporalId")
                setTimeout(set_id,delay,attr_dict.temporalId);
            else
                setTimeout(hack_change_one, delay, key, attr_dict[key]);
            delay += delaytime;
        }
    }
    if($("#hack_check_attr_advance").html()=="check_box")
    {
        setTimeout(function()
        {
            advance_one_frame(false);
        }, delay);
    }
}

function override_id()
{
    //called when a box is clicked and the temporalId should be set
    newid=$("#hack_inp_easyid").val();
    if (newid=="")
        return;
    if (newid[0]==":")
    {
        // use macro if first char is ":", e-g- ":m" calls the macro bind to key m
        var macro_key = newid[1];
        if (macro_key in easy_attr_macros)
            change_attr(easy_attr_macros[macro_key]);
    }
    else
        set_id($("#hack_inp_easyid").val());

    if($("#hack_check_easyid_advance").html()=="check_box")
        //advance frame
        setTimeout(function()
        {
            tempidbox=$('input[name=tempId-input]').first();
            if (tempidbox.size()>0 && tempidbox.val()!="" && tempidbox.val()==$("#hack_inp_easyid").val())
                advance_one_frame(false);
        },200);
}

function set_id(newid)
{
    //set the temporal_id to newid
    var tempidbox=$('input[name=tempId-input]').first();
    // press A and backspace... so stickman thinks we actually change the ID by hand... yeah, it is dirty....
    tempidbox.sendkeys("A{backspace}");
    setTimeout(function()
    {
        tempidbox.val(newid);
        tempidbox.sendkeys("A{backspace}") ;
        setTimeout(function(){tempidbox.blur();},20);
    },100);
}

function load_sendkeys()
{
    //load a sendkeys_plugin to send keys to the input-boxes

    //load billiteRangejs
    var jq = document.createElement('script');
    jq.src = "https://greasyfork.org/scripts/14098-bililiterange-js/code/bililiteRangejs.js?version=88786 ";
    document.getElementsByTagName('head')[0].appendChild(jq);
    $.fn.sendkeys = function (x)
    {
        x = x.replace(/([^{])\n/g, '$1{enter}'); // turn line feeds into explicit break insertions, but not if escaped
        return this.each( function(){
            bililiteRange(this).bounds('selection').sendkeys(x).select();
            this.focus();
        });
    }; // sendkeys

    // add a default handler for keydowns so that we can send keystrokes, even though code-generated events
    // are untrusted (http://www.w3.org/TR/DOM-Level-3-Events/#trusted-events)
    // documentation of special event handlers is at http://learn.jquery.com/events/event-extensions/
    $.event.special.keydown = $.event.special.keydown || {};
    $.event.special.keydown._default = function (evt){
        if (evt.isTrusted) return false;
        if (evt.ctrlKey || evt.altKey || evt.metaKey) return false; // only deal with printable characters. This may be a false assumption
        if (evt.key == null) return false; // nothing to print. Use the keymap plugin to set this
        var target = evt.target;
        if (target.isContentEditable || target.nodeName == 'INPUT' || target.nodeName == 'TEXTAREA') {
            // only insert into editable elements
            var key = evt.key;
            if (key.length > 1 && key.charAt(0) != '{') key = '{'+key+'}'; // sendkeys notation
            $(target).sendkeys(key);
            return true;
        }
        return false;
    };
}
