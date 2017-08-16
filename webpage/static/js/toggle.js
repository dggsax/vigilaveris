////////////////////////////////////////////////////////////////////////////////////
//                                                                                //
//    Toggle handler                                                              //
//                                                                                //
//       Job: Builds a toggle, and handles it's state for backend and frontend    //
//                                                                                //
//       What it needs to do:                                                     //
//             * build toggle                                                     //
//             * listen for toggle modification                                   //
//             * tell server that toggle hath been toggled                        //
//                                                                                //
////////////////////////////////////////////////////////////////////////////////////

function Toggle(div_id,title,names,unique,socket=null){
    var div_id = String(div_id);
    var title = String(title);
    var names = names; //should be 2-long array of values for when switch is low or high
    var value; //holds toggle value right now
    var unique = String(unique); //unique identifying number
    var socket = socket;
    var built = false;
    var setup = function(){
        $("#"+div_id+'_holder').append("<div class ='toggle_holder' id=\""+div_id+"_toggler_holder\"></div>");
        $("#"+div_id+"_toggler_holder").append("<label for =\"" + div_id+"_toggler"+"\">"+title+": </label>");
        $("#"+div_id+"_toggler_holder").append("<select name=\""+ div_id+"_toggler" +"\" id=\""+div_id+"_toggler"+"\" data-role=\"slider\"><option value=\""+names[0]+"\">"+names[0]+"</option><option value=\""+names[1]+"\">"+names[1]+" </option></select>");
        built = true;
        $("#"+div_id+"_toggler_holder").trigger("create");
    }
    if ( ! built ) { 
        setup();
    };
    if ( socket != null ){
        $('#'+div_id+"_toggler").on('change',function(){
            socket.emit('reporting', {'unique':unique, 'div': div_id+'_holder', 'data':$(this).val()});
        });
    };
};