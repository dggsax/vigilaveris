//////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                          //
//    Main Javascript File aka "Daddy"                                                      //
//                                                                                          //
//       Job: Everything                                                                    //
//                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////

var PLOT_WIDTH = 300;
var PLOT_HEIGHT = 175;
var HEADROOM_PRESENT = false;

var ALREADY_BUILT = false;
var TOGGLE_PARAM = '';

/////////////////////
//                 //
//    Autopilot    //
//                 //
/////////////////////

$(document).on("mouseover", ".fa-cog", function(){
    $(this).css("background-color","#e9e9e9")
});

$(document).on("mouseleave", ".fa-cog", function(){
    $(this).css("background-color","initial");
});

$(document).on("click",".fa-cog",function(){
    build_slider_autopilot(this.id);
});

// Update value of input field when the enter key is selected
$(document).on('keyup','input', function (e) {
    if (e.keyCode == 13){
        $(this).attr("value",$(this).val());
        $(this).blur();
    }
});

// Update DOM for selected option in ANY dropdown menu
$(document).on("change","select",function(){
  $("option[value=" + this.value + "]", this)
  .attr("selected", true).siblings()
  .removeAttr("selected")
});

/////////////////////END OF AUTOPILOT/////////////////////

var datapoints = 100
var isActive;
$(document).on('pageinit', function() {
    //Handle sockets with server:
    var socket = io('http://localhost:3000');

    ////////////////////////
    //                    //
    //     Extra Stuff    //
    //                    //
    ////////////////////////

    isActive = true; //used for turning off plot updates when page not in focus
    window.onfocus = function () {
      console.log("IN FOCUS");
      isActive = true;
      $('.sbs').css('background-color',"#f9f9f9");
    };

    window.onblur = function () {
      console.log("OUT OF FOCUS");
      isActive = false;
      $('.sbs').css('background-color',"#ffde46");
    };

    ////////////////////////////
    //                        //
    //    PRESTAGING STUFF    //
    //                        //
    ////////////////////////////

    // Receive list of available serials from server
    socket.on('serial list display', function(portlist){
        $("#serialport").children().remove().end();
        $.each(portlist, function (i, item) {
            $('#serialport').append($('<option>', {
                value: i,
                text : item.comName
            }));
            $('#serialport option[value='+i+']').prop('selected','selected').change();
        });
    });

    // update serial port upon selection, let server know
    $('#serialport').change(function(){
        socket.emit('serial select', $('#serialport option:selected').text());
    });

    // update baud rate upon selection, let server know
    $('#baud').change(function(){
        socket.emit('baud select', $('#baud option:selected').text());
    });

    //Server sending socket containing list of valid serial ports:
    socket.on('serial list display', function(portlist){
        $("#serialport").children().remove().end();
        $.each(portlist, function (i, item) {
            $('#serialport').append($('<option>', {
                value: i,
                text : item.comName
            }));
            $('#serialport option[value='+i+']').prop('selected','selected').change();
        });
    });

    //Connect/Disconnect to Serial Port
    $('#connect').click(function(){
        hootenanny();
        
        if($(this).text() != 'Connected (Click to Disconnect)'){
            socket.emit('serial connect request',{state: ALREADY_BUILT});
            isActive = true;
        }else{
            socket.emit('serial disconnect request');
        }
    });

    // Update #connect button to connected on return socket from server
    socket.on('serial connected', function(){
        $('#connect').text('Connected (Click to Disconnect)');
    });
    // Update #connect button to connected on return socket from server
    socket.on('serial disconnected', function(){
        console.log("oh yeah disconnecting!");
        $('#connect').text('Disconnected (Click to Connect)');
    });

    // Build default toggles
    var toggle_lock = new lockToggle("lock","Page Lock",["Locked","Unlocked"],69,socket);
    var toggle_freeze = new Toggle("freeze","Freeze Page?",["OFF","ON"],420,socket);

    // Send socket to freeze page when #freeze switch is toggled
    $('#freeze').change(function(){
        console.log("freezing page");
        socket.emit('freeze');
    });

    // When the page is locked/unlocked
    $('#lock').change(function(){
        console.log("lock status changed");
        var unique = 69;
        var val = $(this).children().children().eq(1).val();
        console.log(val);
        socket.emit('toggle_update_'+unique,val)
    });

    $(document).keypress(function(event){
        if(String.fromCharCode(event.which) == "u"){
            keypressLockToggle(69);
        }
        if(String.fromCharCode(event.which) == "r"){
            console.log("wowowowoow");
        }
    });

    ///////////////////////////////////////////
    //                                       //
    //    THIS IS WHERE THE PAGE IS BUILT    //
    //                                       //
    ///////////////////////////////////////////

    // socket.on('startup',function(msg){
    function hootenanny(){
        // Clean the Page
        // QUESTION: Why do they need separate containers? And why does one focus on
        // IDs and the other with classes?
        $("#drag_container").empty(); //do it this way because jquery needs to be cleaned properly
        // $("#main_area").empty();

        var slider_container = d3.select("#main_area").append("div").attr("id","drag_container");
        var container = d3.select("#main_area").append("div").attr("class","container_graphs");
        
        plots = new Array();
        plot_handlers = new Array();
        sliders = new Array();

        ////////////////////////////
        //                        //
        //    JSON INTERACTION    //
        //                        //
        ////////////////////////////

        // Probably unecessarily complicated function to fetch json.
        function fetchJSONFile(path, callback) {
            var httpRequest = new XMLHttpRequest();
            httpRequest.onreadystatechange = function() {
                if (httpRequest.readyState === 4) {
                    if (httpRequest.status === 200) {
                        var data = JSON.parse(httpRequest.responseText);
                        if (callback) callback(data);
                    }
                }
            };
            httpRequest.open('GET', path);
            httpRequest.send(); 
        }

        // Fetch the configuration
        fetchJSONFile('/config', function(data){
            // Send to processing
            processConfig(data);
            
            // do the necessary building
            build_plots();
            console.log(sliders);
            build_sliders();

            // Ugh. Make stuff look goodly
            $("#drag_container").shapeshift();
            $("#drag_container").trigger("ss-destroy");
        });

        // Process the configuration
        function processConfig(config){
            for(var position in config){
                // The Part of config we are at
                var key = Object.keys(config[position])[0];
                // The number of objects in that config part
                var length = config[position][key].length;
                // Object of arrays of each module type
                var module = config[position][key];
                // Do the thing
                switch (key){
                    case "slider":
                        for(i = 0; i < length; i++){
                            slider = module[i];
                            slider_generate( slider.name, slider.low, slider.high, slider.resolution );
                        }
                        break;
                    case "timeseries":
                        for(i = 0; i < length; i++){
                            timeseries = module[i]
                            plot_generate(timeseries.name,parseFloat(timeseries.low),parseFloat(timeseries.high),100,timeseries.color,timeseries.type);
                        }
                        break;
                    case "parallel":
                        for(i = 0; i < length; i++){
                            parallel = module[i]
                            plot_generate(parallel.name,parseFloat(parallel.low),parseFloat(parallel.high),parallel.label_names.split(','),parallel.color,parallel.type,parallel.graph_type);
                        }
                        break;
                };
            };
        };
            
        // We can get going
        socket.emit('all set from gui');
        ALREADY_BUILT = true;
    
    // USE THIS IF YOU'RE DEPENDING ON HOOTENANNY
    };
    // // USE THIS IF YOU'RE DEPENDING ON "STARTUP" SOCKET    
    // });

    /////////////////////END OF PAGE BUILD/////////////////////

    /////////////////////////
    //                     //
    //    GENERAL STUFF    //
    //                     //
    /////////////////////////

    // Does something with sliders
    $('._slider').change(function(){
        var message = 'change';
        console.log(message);
        console.log($(this).attr('id'),$(this).val());
        socket.emit(message,{id: $(this).attr('id'), val:$(this).val()});
    });

    // Setting up a slider?
    socket.on('setup slider', function(thing){
        $("#"+thing[0]).val(parseFloat(thing[1])).slider("refresh");
    })

    // This. This is very important.
    // I have no idea what this does.
    socket.on('note', function(msg) {
        if (isActive){
            for (var i =0; i<msg.length; i++){
                plot_handlers[plots[i]['name']].step(msg[i]);
            }
        }
    });

    ////////////////////////////
    //                        //
    //    PLOT TICKS STUFF    //
    //                        //
    ////////////////////////////

    $(document).on("click", ".scaler",function(){
        var parent = plot_handlers[$(this).parent().parent().attr("id")];
        var parid = $(this).parent().parent().attr("id")
        switch ($(this).attr("id")){
            case parid+"VM":
                var parent_range = parent.y_range[1] - parent.y_range[0];
                var parent_mid = (parent.y_range[1] - parent.y_range[0])/2 + parent.y_range[0];
                parent.y_range[1] = (parent.y_range[1] - parent_mid)*2+parent_mid;
                parent.y_range[0] = parent_mid-(parent_mid - parent.y_range[0])*2;
                break;
            case parid+"VP":
                var parent_range = parent.y_range[1] - parent.y_range[0];
                var parent_mid = (parent.y_range[1] - parent.y_range[0])/2 + parent.y_range[0];
                parent.y_range[1] = (parent.y_range[1] - parent_mid)*0.5+parent_mid;
                parent.y_range[0] = parent_mid-(parent_mid - parent.y_range[0])*0.5;
                break;
            case parid+"RS":
                parent.y_range =parent.y_range_orig.slice(0);
                break;
            case parid+"OD":
                var diff = parent.y_range[1] - parent.y_range[0];
                var tp = diff*0.1;
                parent.y_range[1] = parent.y_range[1]+tp;
                parent.y_range[0]=parent.y_range[0]+tp;
                break;
            case parid+"OI":
                var diff = parent.y_range[1] - parent.y_range[0];
                var tp = diff*0.1;
                parent.y_range[1] = parent.y_range[1]-tp;
                parent.y_range[0] = parent.y_range[0]-tp;
                break;
        }
        parent.update();
    });
});
