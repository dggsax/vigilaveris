function PushButton(div_id,label,color,bg_color,unique,socket=null){
    var div_id = String(div_id);
    var label = String(label);
    var color = color;
    var bg_color = bg_color;
    var value; //holds toggle value right now
    var unique = String(unique); //unique identifying number
    var socket = socket;
    var setup = function(){
        $("#"+div_id).append("<div class ='button_holder' id=\""+div_id+unique+"_holder\"></div>");
        //$("#"+div_id+unique+"_holder").append("<button class=\"ui-button\" id=\""+ div_id+unique+"button" +"\" style=\"background-color:" + bg_color+";color: " + color +"\">"+label+"</button>");
        $("#"+div_id+unique+"_holder").append("<button class=\"ui-button\" id=\""+ div_id+unique+"button" +"\">"+label+"</button>");
        $("#"+div_id+unique+"_holder").trigger("create");
    }
    setup();
    if (socket != null){
        // Broadcaster
        console.log('#'+div_id+unique+"button");
        $('#'+div_id+unique+"button").on('click',function(){
            console.log("PUSH");
            socket.emit('reporting', {'unique':unique, 'data':"Push"});
        });
        //off(clicking not working...is fine for now')
        $('#'+div_id+unique+"button").off('click',function(){
            console.log("UNPUSH");
            socket.emit('reporting', {'unique':unique, 'data':"Unpush"});
        });
        // Listener
        socket.on("announce_"+unique,function(data){
            console.log(data);
		});
    };
};