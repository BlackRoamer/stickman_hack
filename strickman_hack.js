 
// ==UserScript==
// @name         Stickman_Hack
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Adding features to stickman
// @author       Alexis
// @match        https://*.stickman.services.understand.ai*plot*
// @grant        none
// ==/UserScript==

easy_attr_macros = {}; //dictionary for easy_attr keys

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
        //in fact, we wait until there is an object with class tabs__item e.g. the Attributes/Objects-Tabs
        if ($(".tabs__item").size()>0)
             load_control_elements();
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
        $(".align-content-start").last().after("<div class='flex xl2 xs3 fill-height align-content-start'><div data-v-53263764='' class='container py-0 pr-0 fluid grid-list-md fill-height'><div data-v-53263764='' class='layout column'><div class='card' style='height: auto;'><div class='card__text'> <h3>Stickman_Hack</h3><h4>Fast_Forward</h4><div class='layout'><br><div class='input-group input-group--dirty input-group--hide-details input-group--text-field primary--text'><label>Speed (miliseconds until next frame)</label><div class='input-group__input'><input type='text' id='hack_inp_forward' value='+800'><button type='button' class='btn btn--flat btn--small' style='position: relative;'><div class='btn__content' id='hack_btn_forward'>&gt;&gt;</div></button></div><div class='input-group__details'></div></div></div><div class='input-group__input'><i aria-hidden='true' class='hack_checkbox icon icon--selection-control material-icons' style='transform-origin: center top 0px;' id='hack_check_stop_when_lost_tracking'>check_box_outline_blank</i>stop when tracking is lost</div><h4>easy_id:</h4><div class='layout'><div class='input-group input-group--dirty input-group--hide-details input-group--text-field primary--text'><label>temporalId</label><div class='input-group__input'><input type='text' id='hack_inp_easyid'></div><div class='input-group__details'></div><div class='input-group__input'><i aria-hidden='true' class='hack_checkbox icon icon--selection-control material-icons' style='transform-origin: center top 0px;' id='hack_check_easyid_click'>check_box_outline_blank</i>insert temporalId with click</div><div class='input-group__input'><i aria-hidden='true' class='hack_checkbox icon icon--selection-control material-icons' style='transform-origin: center top 0px;' id='hack_check_easyid_advance'>check_box_outline_blank</i>advance frame with click</div></div></div> <h4>easy_attributes:</h4><div style='/* white-space: nowrap; */'><button type='button' class='btn btn--small' style='position: relative;'><div class='btn__content' id='hack_btn_attr_set'>Create Macro</div><input type='text' value='m' style='width: 20pt;text-align: center;' id='hack_inp_attr_key'></button><button type='button' class='btn btn--small' style='position: relative;' id='hack_btn_attr_show'><div class='btn__content'>Show</div></button><button type='button' class='btn btn--small' style='position: relative;' id='hack_btn_attr_del'><div class='btn__content'>Delete</div></button></div><div class='input-group__input'><i aria-hidden='true' class='hack_checkbox icon icon--selection-control material-icons' style='transform-origin: center top 0px;' id='hack_check_attr_use'>check_box_outline_blank</i>Use keys for macros</div><div class='input-group__input'><i aria-hidden='true' class='hack_checkbox icon icon--selection-control material-icons' style='transform-origin: center top 0px;' id='hack_check_attr_tempid'>check_box_outline_blank</i>include temporalId</div><div class='input-group__input'><i aria-hidden='true' class='hack_checkbox icon icon--selection-control material-icons' style='transform-origin: center top 0px;' id='hack_check_attr_advance'>check_box_outline_blank</i>advance frame after macro</div></div></div></div></div></div>");
        //<button type='button' class='btn' style='position: relative;'><div class='btn__content' id='hack_btn_easyid'>Copy Data</div></button>
        //functzionality for checkboxes
        $(".hack_checkbox").click(function(){$(this).html($(this).html()=="check_box"?"check_box_outline_blank":"check_box");});
        //Fast_forward
        $("#hack_btn_forward").click(fast_forward);
        //easy_id
        //bind override_id to canvasclick
        $(".upper-canvas").click(function(){
          if($("#hack_check_easyid_click").html()=="check_box")
              setTimeout(override_id,10);
        });

        //initialize easy_attr
        $("#hack_inp_attr_key").keyup(function(e)
        {
            // restrict input to one lowercase character
            $("#hack_inp_attr_key").val((e.keyCode > 64 && e.keyCode < 91)||[188,190,189, 192,222,186,191,187].includes(e.keyCode)?e.key:"");
        });

        $("#hack_btn_attr_set").click(function()
        {
            //set macro
            if ($("#hack_inp_attr_key").val=="")
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
            alert("The following macros are set to keys\n\n"+JSON.stringify(easy_attr_macros,null,2));
        });

        $("#hack_btn_attr_del").click(function()
        {
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
        //stop advancing
        return;
    }
    play_speed=parseInt($("#hack_inp_forward").val());
    if (!play_speed || play_speed==0)
    {
        //no valid speed input
        play_speed=0;
        $("#hack_btn_forward").html("&gt;&gt;");
        $("#hack_inp_forward").val(0);
    }
    else if (play_speed>0)
    {
       $("#hack_inp_forward").val("+"+play_speed);
       autoadvance_wrapper(play_speed);
    }
    else
    {
        //negative speed
        $("#hack_inp_forward").val(play_speed);
        autoadvance_wrapper(play_speed);
    }
}


function autoadvance_wrapper(play_speed)
{
    advance_button = play_speed>0?"i:contains('keyboard_arrow_right')":"i:contains('keyboard_arrow_left')";
    //wait until the ne frame is loaded
    if($("i:contains('keyboard_arrow_right')").parent().parent().hasClass("btn--disabled"))
    {
        //wait 200 mśec
        setTimeout(function(){autoadvance_wrapper(play_speed);},200);
    }
    else
    {

        if(play_speed>0)
        {
            setTimeout(function()
            {
              //(yeah, its dirty redundand scripting)
              if($("#hack_check_stop_when_lost_tracking").html()=="check_box" && ($("label:contains('Tracking mode')").next().text()!="check_box"))
              {
                  //stop if tracking is lost
                  $("#hack_btn_forward").html("&gt;&gt;");
                  return;
              }
              $("i:contains('keyboard_arrow_right')").click();auto_advance();
            }, play_speed);
        }
        else
        {
            setTimeout(function()
            {
              //(yeah, its still dirty redundand scripting)
              if($("#hack_check_stop_when_lost_tracking").html()=="check_box" && ($("label:contains('Tracking mode')").next().text()!="check_box"))
              {
                  //stop if tracking is lost
                  $("#hack_btn_forward").html("&gt;&gt;");
                  return;
              }
                $("i:contains('keyboard_arrow_left')").click();auto_advance();
            }, play_speed);

        }
    }
}

function copy_attr()
{
    //get dict of attributes in attribute boxes
    var attr_dict={};
    var input_group_list=$(".attributes").find(".input-group--select").toArray();
    $(".attributes").find(".input-group--select").each(function(){
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
        setTimeout(function(val)
        {
            $(".menu__content:visible").find("li:contains('"+val+"')").trigger("click");
        }, clickdelay, val);
    }
    var delay = 0;
    for (var key in attr_dict)
    {
        var val = attr_dict[key];
        if ($("label:contains('"+key+"')").next().find(".input-group__selections").text()!=val)
        {
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
            $("i:contains('keyboard_arrow_right')").click();
        }, delay+2*delaytime);
    }
}

function override_id()
{
    newid=$("#hack_inp_easyid").val();
    if (newid=="")
        return;
    if (newid[0]==":")
    {
        // use macro
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
                $("i:contains('keyboard_arrow_right')").click();
        },300);
}

function set_id(newid)
{
    var tempidbox=$('input[name=tempId-input]').first();
    // press A and backspace... so stickman thinks we actually change the ID by hand... yeah, it is dirty....
    tempidbox.sendkeys("A{backspace}");
    setTimeout(function()
    {
        tempidbox.val(newid);
        tempidbox.sendkeys("A{backspace}") ;
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
