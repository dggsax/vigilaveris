//////////////////////////////////////////////////////////////////////////////////////////////////
//    Timeplot handler                                                                          //
//                                                                                              //
//                                                                                              //
//       Job: builds and generates timeplots then updates socket when timeplots change values   //
//                                                                                              //
//       What it needs to do: settings gear to allow specification for:                         //
//             * sin wave generation                                                            //
//             * square wave generation                                                         //
//             * amplitude                                                                      //
//			   * offset                                                                         //
//			   * frequency                                                                      //
//			   * resolution                                                                     //
//                                                                                              //
//////////////////////////////////////////////////////////////////////////////////////////////////

// Function that generates plots
var plots = new Array();
function plot_generate(name,min,max,datapoints,graph_color,type,l_g = "bar"){
    var newb = document.createElement("div"); //create div
    $(newb).addClass("sbs draggable timeplot-container"); //make it sbs, dragable, and a container
    var newplot = document.createElement("div"); //make another div
    $(newplot).addClass("chart timeplot-item"); //make it a chart
    $(newplot).prop('id',name+"_div"); //call it appropriate name
    // $(newtitle).appendTo($(newb)); //add into sbs div
    $(newplot).appendTo($(newb)); //add into sbs div
    plots.push({'name':name,'plot':newb,'min':min, 'max':max, 'datapoints':datapoints,'color':graph_color,'type':type,'graph_type':l_g});  //add entry to array.
}

// Function that builds timeplots
var plot_handlers = new Array();
function build_plots(){
    var plot_count = 0;
    $.each(plots, function(index, value){
      $(value['plot']).appendTo($("#drag_container"));
      plot_count += 1;
    });

    //angle =new LWChart("Angle","red",[-100, 100],175,PLOT_HEIGHT,PLOT_WIDTH,datapoints);
    for (var i=0; i<plot_count;i++){
        var name = plots[i]['name'];
        var min = plots[i]['min'];
        var max = plots[i]['max'];
        var datapoints = plots[i]['datapoints'];
        var color = plots[i]['color'];
        var type = plots[i]['type']//parallel or time series
        var g_type = plots[i]['graph_type']; //bar or line
        if(type == "P"){
            console.log(name);
            plot_handlers[name] = new Parallel_Plot(name+"_div",name,datapoints.length,datapoints,PLOT_WIDTH,PLOT_HEIGHT,max,min,String(color),plot_count + "_p",g_type);
        }
        else{
            console.log(name);
        // plot_handlers[name] = new LWChart(name,"red",[min,max],PLOT_HEIGHT,PLOT_WIDTH,datapoints);
            plot_handlers[name] = new Time_Series(name+"_div",name,PLOT_WIDTH,PLOT_HEIGHT,datapoints,[min,max],1,[color], plot_count, socket=null);
        }
    }
};
