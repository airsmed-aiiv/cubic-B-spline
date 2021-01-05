class Point{
    // 2차원 평면 상의 점을 나타내는 클래스입니다.
    constructor(x, y){
        this.x = x;
        this.y = y;
    }

    plus(rhs){return new Point(this.x + rhs.x, this.y + rhs.y);}
    minus(rhs){return new Point(this.x - rhs.x, this.y - rhs.y);}
    multiply(rhs){return new Point(this.x * rhs, this.y * rhs);}
    divide(rhs){return new Point(this.x / rhs, this.y / rhs);}
    length(){return Math.hypot(this.x, this.y);}
}


class Bezier{
    // 베지어 곡선은 4개의 점에 의해 결정됩니다.
    constructor(P0, P1, P2, P3){
        this.points = [P0, P1, P2, P3];
    }
    
    evaluate(){
        // 베지어 곡선을 100등분하여, 101개의 점으로 구성된 다각선을 반환합니다.
        let [P0, P1, P2, P3] = this.points;
        let polyline = []

        for(let n = 0; n <= 100; n++){
            let t = n/100.;

            let A0 = Bezier.interpolate(P0, P1, t);
            let A1 = Bezier.interpolate(P1, P2, t);
            let A2 = Bezier.interpolate(P2, P3, t);

            let B0 = Bezier.interpolate(A0, A1, t);
            let B1 = Bezier.interpolate(A1, A2, t);

            let C = Bezier.interpolate(B0, B1, t);

            polyline.push(C);
        }
        return polyline;
    }

    static interpolate(P0, P1, t){
        // helper 함수
        return P0.multiply(1 - t).plus(P1.multiply(t));
    }

}

class Loop{
    // 하나의 고리로 둘러싸인 영역을 나타냅니다.
    // 고리가 미완성으로 열려 있을 때는 closed: false이고, 닫힌 고리가 되면 closed: true가 됩니다.
    // centripetalCatmullRomSpline 함수를 통해 Loop를 array<Bezier>로 변환할 수 있습니다.
    constructor(points){
        this.points = points;
        this.closed = false;
    }

    centripetalCatmullRomSpline(points){
        // n개의 점을 입력받으면, n개의 베지어 곡선의 리스트를 반환합니다.
        // 원래 class Bezier에 있던 함수인데 class Loop를 새로 만들면서 이곳으로 이동하였습니다.
        let result = [];
        let N = this.points.length;
    
        for(let i = -1; i < N - 1; i++){
            result.push(this.curve_segment(
                this.points[(i+N)%N], 
                this.points[(i+1)%N], 
                this.points[(i+2)%N], 
                this.points[(i+3)%N]));
        }
        
        return result;
    }

    static knot_sequence(P0, P1){
        // helper 함수
        return (P0.minus(P1)).length() ** .5 + 1e-6;
    }

    static curve_segment(P0, P1, P2, P3){
        // helper 함수
        let t0 = 0;
        let t1 = t0 + this.knot_sequence(P0, P1);
        let t2 = t1 + this.knot_sequence(P1, P2);
        let t3 = t2 + this.knot_sequence(P2, P3);
    
        let m1 = (P1.minus(P0).divide(t1 - t0))
            .minus(P2.minus(P0).divide(t2 - t0))
            .plus(P2.minus(P1).divide(t2 - t1))
            .multiply(t2 - t1);
    
        let m2 = (P2.minus(P1).divide(t2 - t1))
            .minus(P3.minus(P1).divide(t3 - t1))
            .plus(P3.minus(P2).divide(t3 - t2))
            .multiply(t2 - t1);
    
        let Q1 = P1.plus(m1.divide(3));
        let Q2 = P2.minus(m2.divide(3));
    
        return new Bezier(P1, Q1, Q2, P2);
    }
}

class Segmentation{
    // 여러 개의 Loop를 모아 한 이미지에 대한 segmentation을 구성하게 됩니다.
    // Segmentation이 최종적으로 저장될 레이블링 데이터입니다.
    constructor(loops){
        this.loops = loops;
    }
}

// helper functions

function Point2Circle(point){
    // point => fabric.Circle
    return new fabric.Circle({
        radius: 7,
        strokeWidth:2,
        stroke: "rgb(220, 220, 220)",
        fill: "rgb(53, 177, 252)",
        left: point.x,
        top: point.y,
        originX: "center",
        originY: "center",
        hasControls: false,
        padding: 5
    });
}

function getCurrentPoints(canvas){
    // 현재 <canvas>에 표시된 점들을 얻으려면 이 함수를 사용하세요.
    return canvas._objects
        .filter(obj => obj.type === "circle")
        .map(obj => new Point(obj.left, obj.top));
}

function updateCanvas(canvas){
    // 점이 추가/삭제 되거나 위치가 옮겨질 경우 이 함수를 통해 곡선을 다시 그립니다.
    canvas._objects
        .filter(obj => obj.type === "polyline")
        .map(obj => canvas.remove(obj));


    let points = getCurrentPoints(canvas);
    let curves = Bezier.centripetalCatmullRomSpline(points);
    /*
    points에 현재 <canvas>에 표시된 점들이 들어있습니다.
    curves에 현재 <canvas>에 표시된 베지어 곡선들이 들어있습니다. 
    */
   
    for(let i in curves){
        let color = "rgb(53, 177, 252)"
        if(i == 0 || i == curves.length - 2){
            // 맨 첫번째와 뒤에서 2번째 곡선은 새로운 점이 찍히면 위치가 변동될 수 있어서 다른 색깔로 표시
            color = "rgb(220, 220, 220)";
        }
        else if(i == curves.length - 1){
            // 맨 마지막 점에서 맨 첫번째 점으로 가는 곡선은 약간 투명하게 표시
            color = "rgba(220, 220, 220, .5)";
        }

        canvas.insertAt(new fabric.Polyline(curves[i].evaluate(), {
            stroke: color,
            strokeWidth: 4,
            fill: "transparent",
            selectable: false,
        }), 1);
    }
}

// 실제 실행되는 코드 시작
// fabric.js 라이브러리를 이용하여 <canvas> 엘리먼트를 초기화합니다.
let canvas = new fabric.Canvas("c", {
    selection: false,
    fireRightClick: true,
    stopContextMenu: true,
    hoverCursor: 'auto'
});


fabric.Image.fromURL(document.getElementById('my-image').src, function(img){
    // <canvas>의 바닥에 image를 4배 확대하여 그립니다

    let scale = 4; // image 확대 배율

    img.set({
        left: 0,
        top: 0,
        originX: "left",
        originY: "top",
        scaleX: scale,
        scaleY: scale,
        selectable: false,
    })
    canvas.setHeight(img.height * scale);
    canvas.setWidth(img.width * scale);
    canvas.insertAt(img, 0);
})


// 미리 지정된 점들
let points = [
    new Point(310, 100),
    new Point(190, 170),
    new Point(120, 310),
    new Point(160, 380),
    new Point(230, 410),
];
points.map(point => canvas.add(Point2Circle(point)));
updateCanvas(canvas);

let created = null;

canvas.on("mouse:down", function(options){ 
    // click 시 point 추가
    if(options.target.selectable){
        // 기존의 점을 클릭할 때
        if(options.button === 1){
            // 점을 왼쪽 클릭하여 드래그하는 동작은 fabric.js에서 이미 구현되어 있음
        }
        else{
            // 기존의 점을 오른쪽 클릭하면 삭제
            canvas.remove(options.target);
        }
    }
    else{
        // 빈 공간을 클릭할 때
        if(options.button === 1){
            // 빈 공간을 왼쪽 클릭하면 새로운 점 (created) 생성
            let {x, y} = options.pointer;
            let point = Point2Circle(new Point(x, y))
            canvas.add(point);
            created = point;
        }
        else{
            // 빈 공간을 오른쪽 클릭하면 마지막 점 삭제
            let circles = canvas._objects
                .filter(obj => obj.type === "circle")
            canvas.remove(circles[circles.length - 1]);
        }
    }
    updateCanvas(canvas);
});

canvas.on("mouse:move", function(options){
    // 새로 만든 점 드래그는 fabric.js에 구현이 안되어 있음
    if(created !== null){
        let {x, y} = options.pointer;
        created.left = x;
        created.top = y;
        created.setCoords();
    }
    updateCanvas(canvas);
});

canvas.on("mouse:up", function(options){
    created = null;
});
