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

// Make it so that the background animates when mouse hovers over
// Strictly for UX....
$(document).on("mouseover", ".fa-cog", function(){
    $(this).css("background-color","#e9e9e9")
});

// Make it so that the background animates when mouse hovers over
// Strictly for UX....
$(document).on("mouseleave", ".fa-cog", function(){
    $(this).css("background-color","initial");
});

// Generate/show/hide the autopilot for that specific autopilot field
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

// (document).on('keydown', 'input.large', function(ev) {

var datapoints = 100
var isActive;
$(document).on('pageinit', function() {

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

    //Handle sockets with server:

    var socket = io('http://localhost:3000');

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
        console.log("esta lit");
        hootenanny();
        if($(this).text() != 'Connected (Click to Disconnect)'){
            socket.emit('serial connect request',{state: ALREADY_BUILT});
            $('#csv').val(0).slider('refresh');
            $('#alternator').val(0).slider('refresh');
            isActive = true;
        }else{
            socket.emit('serial disconnect request');
        }
    });

    //Update switch to connected or disconnected based on return socket from server
    socket.on('serial connected', function(){
        $('#connect').text('Connected (Click to Disconnect)');
    });
    socket.on('serial disconnected', function(){
        console.log("oh yeah disconnecting!");
        $('#connect').text('Disconnected (Click to Connect)');
    });
    socket.on('state toggle', function(val){
        console.log("toggling");
        $('#'+TOGGLE_PARAM).val(parseFloat(val)).slider('refresh');
    });

    $('#csv').change(function(){
        console.log("csv preference changed!");
        socket.emit('csv state', $(this).val())
    });
    $('#alternator').change(function(){
        console.log("desiring alternating!");
        socket.emit('alternate state', $(this).val());
    });

    // Build default toggles
    var toggle_lock = new lockToggle("lock","Page Lock",["Locked","Unlocked"],69,socket);
    var toggle_csv = new Toggle("generate_csv","Generate CSV?",["OFF","ON"],420,socket);

    //update serial port upon selection:
    $('#serialport').change(function(){
    console.log("serialport selected");
        socket.emit('serial select', $('#serialport option:selected').text());
    });
    //upadte baud rate upon selection:
    $('#baud').change(function(){
        socket.emit('baud select', $('#baud option:selected').text());
    });

    /////////////////////////////////////////////////////
    //                                                 //
    //    THIS IS WHERE YOU MAKE THE PREVIEW HAPPEN    //
    //                                                 //
    /////////////////////////////////////////////////////

    // Insert the stuff here
    // socket.on('startup',function(msg){
    function hootenanny(){
        var alt = false;
        var csv = false;
        //WIPE THE SLATE CLEAN:
        $("#main_area").empty(); //do it this way because jquery needs to be cleaned properly
        sliders = new Array();
        plots = new Array();
        plot_handlers = new Array();
        //-------
        // msg = msg+''; //convert to string...stupid I know.
        msg = "&C&S~Gonzo~commname~0~69~5&A~Gonzo~2&S~Joe~commname~0~69~5&S~Wei~commname~0~100~1&S~Jesus~commname~3~5~1&S~Wow~commname~0~3~4&T~Hehe~U1~1~5&T~Joee~F4~0~100&T~Everything~U1~0~10&T~Help~U1~0~255&T~Wowe~S4~2~5&"
        // msg = "&A~DesiredAngV~5&C&S~Direct~O~0~5.0~0.1&S~DesiredAngV~A~-1~1~0.1&T~AngleV~F4~0~2.5&T~BackEMF~F4~0~5&T~MCmd~F4~0~5&H~4&"
        var sets = msg.split("&");
        var duration = 100; //default
        for (var i = 0;  i < sets.length; i++){
            var test = sets[i].split("~");
            if (test[0] == "D"){
                duration = parseFloat(test[1]);
            }
        }

        for (var i = 0;  i < sets.length; i++){
            console.log(sets[i]);
            var test = sets[i].split("~");
            console.log(test);
            switch (test[0][0]){
                case "A":
                    alt=true;
                    TOGGLE_PARAM = test[1];
                    break;
                case "C":
                    csv=true;
                    break;
                case "S":
                    var name = test[1];
                    var lo = test[3];
                    var hi = test[4];
                    var res = test[5];
                    slider_generate(name,lo,hi,res);
                    break;
                case "T":
                    var name = test[1];
                    var lo = test[3];
                    var hi = test[4];
                    plot_generate(name,parseFloat(lo),parseFloat(hi),duration);
                    break;
                case "H":
                    HEADROOM_PRESENT = true;
                    break;
            }
        }
        build_sliders();
        build_plots();
        socket.emit('all set from gui');
        ALREADY_BUILT = true;

        $( function() {
            $( ".draggable" ).draggable({
                containment: "#main_area",
                snap: true
            });
        } );
    };

    ///////////////////////////
    //                       //
    //    Sending Sockets    //
    //                       //
    ///////////////////////////

    // When the page is locked/unlocked
    $('#lock').change(function(){
        console.log("lock status changed");
        var unique = 696969;
        var val = $(this).children().children().eq(1).val();
        socket.emit('toggle_update_'+unique,val)
    });

    /////////////////////////////
    //                         //
    //    Receiving Sockets    //
    //                         //
    /////////////////////////////

    socket.on('setup slider', function(thing){
        $("#"+thing[0]).val(parseFloat(thing[1])).slider("refresh");
    })

    socket.on('note', function(msg) {
        if (isActive){
            if (HEADROOM_PRESENT){
                h = msg.pop();
                document.getElementById("headroom").innerHTML= "more than " + h.toString() + " microseconds";
            }
            for (var i =0; i<msg.length; i++){
                plot_handlers[plots[i]['name']].step(msg[i]);
            }
        }
    });

    $(document).on("click", ".scaler",function(){
        var parent = plot_handlers[$(this).parent().parent().attr("id")];
        //console.log($(this).attr("id"));
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
    $('._slider').change(function () {
        debugger;
        console.log("litty titty");
        $('.ui-slider-track').val(50).slider("refresh");
    });
    
});





















