// https://en.wikipedia.org/wiki/Centripetal_Catmull%E2%80%93Rom_spline

$(document).ready(function(){
    'use strict';
    console.log("main.js loaded");
});

var canvas = new fabric.Canvas("c", {
    selection: false,
});

var imgInstance = new fabric.Image(
    document.getElementById("my-image"), {
        left: 0,
        top: 0,
        originX: "left",
        originY: "top",
        scaleX: 3,
        scaleY: 3,
        selectable: false,
    }
)

canvas.add(imgInstance);

canvas.setHeight(imgInstance.currentHeight);
canvas.setWidth(imgInstance.currentWidth);

// var points = [];

// var polygon = new fabric.Polyline(
//     [{x: -10, y:-10}, {x:-20, y:-20}], {
//         stroke: 'rgb(53, 177, 252)',
//         strokeWidth: 5,
//         fill:'rgba(53, 177, 252 ,.5)'
//     }
// )
// canvas.add(polygon);

// canvas.on("mouse:down", function(options){
//     var x = options.e.clientX;
//     var y = options.e.clientY;

//     var point = new fabric.Circle({
//         radius: 5,
//         stroke: "white",
//         fill: 'rgb(53, 177, 252)',
//         left: x-8,
//         top: y-8,
//         selectable: false
//     });


//     points.push({x: x, y: y});
//     polygon.points = points;
//     canvas.renderAll();
// });

let points = [
    {x: 50, y: 100},
    {x: 51, y: 101},
    {x: 250, y: 350},
    {x: 350, y: 250},
    {x: 250, y: 150},
    {x: 150, y: 50},
];

for(point of points){
    var circle = new fabric.Circle({
        radius: 5,
        stroke: "white",
        fill: 'rgb(53, 177, 252)',
        left: point.x,
        top: point.y,
    });
    canvas.add(circle);
}

function interpolate(P0, P1, t0, t1, t){
    return {
        x: (P0.x * (t1-t) + P1.x * (t-t0))/(t1-t0),
        y: (P0.y * (t1-t) + P1.y * (t-t0))/(t1-t0)
    };
}


function distance(P0, P1){
    // return 1;
    return ((P0.x - P1.x) ** 2 + (P0.y - P1.y) **2)**0.25;
    // return ((P0.x - P1.x) ** 2 + (P0.y - P1.y) **2)**0.5;
}

function smooth(P0, P1, P2, P3){
    
    let curve =[]
    let t0=0;

    let t1 = t0+ distance(P0, P1);
    let t2 = t1+distance(P1, P2);
    let t3 = t2+distance(P2, P3);

    console.log(t0, t1, t2, t3);

    for(var i=0;i<=100;i++){
        var t = i/100 * (t2-t1) + t1;

        var A1 = interpolate(P0, P1, t0, t1, t);
        var A2 = interpolate(P1, P2, t1, t2, t);
        var A3 = interpolate(P2, P3, t2, t3, t);

        var B1 = interpolate(A1, A2, t0, t2, t);
        var B2 = interpolate(A2, A3, t1, t3, t);

        var C = interpolate(B1, B2, t1, t2, t);

        curve.push(C);
    }

    return curve;
}

var polyline = null;

canvas.on("object:modified", function(options){
    let curves = [];
    curves.push(smooth(points[5], points[0], points[1], points[2]));
    for(let i=0;i<3;i++)
        curves.push(smooth(points[i], points[i+1], points[i+2], points[i+3]))
    curves.push(smooth(points[3], points[4], points[5], points[0]));
    curves.push(smooth(points[4], points[5], points[0], points[1]));

    for(curve of curves){
        var polyline = new fabric.Polyline(
            curve, {
                stroke: 'rgb(53, 177, 252)',
                strokeWidth: 5,
                fill:'transparent',
                originX: "left",
                originY: "top",
                selectable: false,
            }
        );
        canvas.add(polyline);
    }
});
