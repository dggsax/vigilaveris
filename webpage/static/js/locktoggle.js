/////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                          //
//    Slider handler                                                                        //
//                                                                                          //
//       Job: builds and generates sliders then updates socket with slider value changes    //
//                                                                                          //
//       What it needs to do: settings gear to allow specification for:                     //
//             * sin wave generation                                                        //
//             * square wave generation                                                     //
//             * amplitude                                                                  //
//             * offset                                                                     //
//             * frequency                                                                  //
//             * resolution                                                                 //
//                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////

// Associated with THE lock toggle
function lockToggle(div_id,title,names,unique,socket=null){
    var div_id = String(div_id);
    var title = String(title);
    var names = names; //should be 2-long array of values for when switch is low or high
    var value; //holds toggle value right now
    var unique = String(unique); //unique identifying number
    var socket = socket;
    var built = false;
    var setup = function(){
        $("#"+div_id).append("<div class ='toggle_holder' id=\""+div_id+unique+"_holder\"></div>");
        $("#"+div_id+unique+"_holder").append("<label for =\"" + div_id+unique+"toggler"+"\">"+title+": </label>");
        $("#"+div_id+unique+"_holder").append("<select name=\""+ div_id+unique+"toggler" +"\" id=\""+div_id+unique+"toggle"+"\" data-role=\"slider\"><option value=\""+names[0]+"\">"+names[0]+"</option><option value=\""+names[1]+"\">"+names[1]+" </option></select>");
        //$("#"+div_id+unique+"_holder").append('<label for="slider-1">Input slider:</label><input type="range" name="slider-1" id="slider-1" value="60" min="0" max="100" />');
        built = true;

        $("#"+div_id+unique+"_holder").trigger("create");
        console.log("just enjanced");
        console.log("#"+div_id+unique+"toggle");
    }
    setup();
    if (socket != null){
        socket.on("toggle_update_"+unique,function(va){console.log("hit");if (built){$('#'+div_id+unique+"toggle").val(va).slider('refresh');}});
        $('#'+div_id+unique+"toggle").on('change',function(){
            socket.emit('reporting', {'unique':unique, 'data':$(this).val()});
            if ($(this).val() == "Locked"){
                $("#drag_container").trigger("ss-destroy");
                console.log("all draggable things should be disabled");
            } else if ($(this).val() == "Unlocked"){
                $("#drag_container").shapeshift();
                console.log("all draggable things should be enabled");
            }
        });
    };
}
