$(document).ready(function(){
    'use strict';
    console.log("app.js loaded");
});

function init_canvas(){
    let scale = 4; // image 배율

    var canvas = new fabric.Canvas("c", {
        selection: false,
        fireRightClick: true,
        stopContextMenu: true,
    });
    canvas.hoverCursor = 'auto';

    var imgInstance = new fabric.Image(
        document.getElementById("my-image"), {
            left: 0,
            top: 0,
            originX: "left",
            originY: "top",
            scaleX: scale,
            scaleY: scale,
            selectable: false,
        }
    )

    canvas.setHeight(imgInstance.height * scale);
    canvas.setWidth(imgInstance.width * scale);
    canvas.add(imgInstance);

    return canvas;
}

let canvas = init_canvas();
let objects = [];
let points = [
    {x: 310, y: 100},
    {x: 190, y: 170},
    {x: 120, y: 310},
    {x: 160, y: 380},
    {x: 230, y: 410},
];

function interpolate(P0, P1, t0, t1, t){
    return {
        x: (P0.x * (t1-t) + P1.x * (t-t0))/(t1-t0),
        y: (P0.y * (t1-t) + P1.y * (t-t0))/(t1-t0)
    };
}

function knot_sequence(P0, P1){
    return ((P0.x - P1.x) ** 2 + (P0.y - P1.y) **2) ** 0.25;
}

function curve_segment(P0, P1, P2, P3){
    // 4개의 점을 받아 그중 P1과 P2 사이를 부드럽게 연결하는 3차 베지어 곡선을 반환합니다.
    // 0~1의 구간을 100으로 나누어 샘플링합니다.
    let curve =[]

    let t0 = 0;
    let t1 = t0 + knot_sequence(P0, P1);
    let t2 = t1 + knot_sequence(P1, P2);
    let t3 = t2 + knot_sequence(P2, P3);

    for(var i=0;i<=100;i++){
        var t = i / 100. * (t2-t1) + t1;

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

function draw(){ // points의 좌표에 원 그리기
    for(obj of objects) // 원래 그려져 있던 것 모두 지우기
        canvas.remove(obj);
        
    let N = points.length;
    for(let i=0; i< N - 3; i++){
        let curve = curve_segment(
            points[i], points[i+1], points[i+2], points[i+3]
        );

        let polyline = new fabric.Polyline(curve, {
            stroke: 'rgb(53, 177, 252)',
            strokeWidth: 5,
            fill:'transparent'
        });

        canvas.add(polyline);
        objects.push(polyline);
    }
    {

        let polyline = new fabric.Polyline(curve_segment(
            points[N-1], points[0], points[1], points[2]
        ), {
            stroke: '#C8C9C9',
            strokeWidth: 5,
            fill:'transparent'
        });

        canvas.add(polyline);
        objects.push(polyline);

        
        polyline = new fabric.Polyline(curve_segment(
            points[N-3], points[N-2], points[N-1], points[0]
        ), {
            stroke: '#C8C9C9',
            strokeWidth: 5,
            fill:'transparent'
        });

        canvas.add(polyline);
        objects.push(polyline);
        
        polyline = new fabric.Polyline(curve_segment(
            points[N-2], points[N-1], points[0], points[1]
        ), {
            stroke: '#C8C9C9',
            strokeWidth: 5,
            fill:'transparent'
        });

        canvas.add(polyline);
        objects.push(polyline);
    }



    for(point of points){
        let circle = new fabric.Circle({
            radius: 5,
            stroke: "white",
            fill: 'rgb(53, 177, 252)',
            left: point.x,
            top: point.y,
            originX: "center",
            originY: "center",
            selectable: false,
        });

        canvas.add(circle);
        objects.push(circle);
    }
    canvas.renderAll();
}

canvas.on("mouse:down", function(options){ // click 시 point 추가
    if(options.button === 1){
        let {x, y} = options.pointer;
        let point = {x: x, y: y};
        points.push(point);
    }
    else
        points.pop();
    draw();
});


canvas.on("key")

function onKeyDown(event){
    console.log(event.keyCode);
}

draw();


/*
var points = [];

var polygon = new fabric.Polyline(
    [{x: -10, y:-10}, {x:-20, y:-20}], {
        stroke: 'rgb(53, 177, 252)',
        strokeWidth: 5,
        fill:'rgba(53, 177, 252 ,.5)'
    }
)
canvas.add(polygon);



    points.push({x: x, y: y});
    polygon.points = points;
    canvas.renderAll();
});
*/

/*








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

canvas.renderAll();
*/