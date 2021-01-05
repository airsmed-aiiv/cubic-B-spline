class Point{
    constructor(x, y){
        // 2차원 평면 상의 점을 나타내는 클래스입니다.
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
    constructor(P0, P1, P2, P3){
        // 베지어 곡선은 4개의 점에 의해 결정됩니다.
        this.points = [P0, P1, P2, P3];
    }

    static centripetalCatmullRomSpline(points){
        // n개의 점을 입력받으면, n개의 베지어 곡선의 리스트를 반환합니다.
        let result = [];
        let N = points.length;
    
        for(let i = -1; i < N - 1; i++){
            result.push(this.curve_segment(
                points[(i+N)%N], points[i + 1], points[(i+2)%N], points[(i+3)%N]));
        }
        
        return result;
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
        return (P0.multiply(1 - t)).plus(P1.multiply(t));
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

function createCircle(x, y){
    return new fabric.Circle({
        radius: 7,
        strokeWidth:2,
        stroke: "rgb(220, 220, 220)",
        fill: "rgb(53, 177, 252)",
        left: x,
        top: y,
        originX: "center",
        originY: "center",
        hasControls: false,
        padding: 5
    });

}

function getCurrentPoints(canvas){
    // 현재 <canvas>에 표시된 점들을 얻으려면 이 함수를 사용하세요.
    return canvas.getObjects()
        .filter(obj => obj.type === "circle")
        .map(obj => new Point(obj.left, obj.top));
}


class Loop{
    constructor(points, selected){
        this.points = points;
        this.selected = selected;
    }
}

let loops = [
    new Loop(
        [
            createCircle(436, 420),
            createCircle(404, 448),
            createCircle(415, 490),
            createCircle(467, 507),
            createCircle(495, 465),
            createCircle(479, 443)
        ],
        selected=false
    ),
    new Loop(
        [
            createCircle(310, 100),
            createCircle(190, 170),
            createCircle(120, 310),
            createCircle(160, 380),
            createCircle(230, 410),
        ],
        selected=true
    )
]

function getSegmentation(loops){
    // loop 정보를 추출합니다.
    return loops.map(loop =>
        loop.points.map(
            circle => new Point(circle.left, circle.top)
        )
    );
}
console.log(JSON.stringify(getSegmentation(loops))); // 이 정보를 저장하면 됩니다!!

function updateCanvas(canvas, loops){
    // 캔버스 초기화 (그림 빼고 모두 삭제)
    canvas.getObjects()
        .filter(obj => obj.type !== "image")
        .map(obj => canvas.remove(obj));

    loops.map(loop => {
        loop.points.map(
            circle => {
                circle.set({fill: loop.selected?"rgb(53, 177, 252)":"rgb(100, 100, 100)"});
            }
        )

        points = loop.points.map(
            circle => new Point(circle.left, circle.top)
        );
        
        let curves = Bezier.centripetalCatmullRomSpline(points);
        /*
        points에 현재 <canvas>에 표시된 점들이 들어있습니다.
        curves에 현재 <canvas>에 표시된 베지어 곡선들이 들어있습니다. 
        */
        if(loop.selected){
            for(let i in curves){
                let color;
                    color = "rgb(53, 177, 252)"
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
        else{
            let boundary = [];
            for(let i in curves){
                boundary = boundary.concat(curves[i].evaluate());
            }
            canvas.insertAt(new fabric.Polyline(boundary, {
                stroke: "rgb(0, 0, 0)",
                strokeWidth: 1,
                fill: "rgba(100, 100, 100, .4)",
                selectable: false,
            }), 1);

        }

        loop.points.map(
            circle => canvas.add(circle)
        );
    });
    canvas.renderAll()
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


updateCanvas(canvas, loops);


// 미리 지정된 점들
// points.map(point => canvas.add(Point2Circle(point)));
// updateCanvas(canvas);

// let created = null;

let selectedPoint = null;

canvas.on("mouse:down", function(options){ 
    // click 시 point 추가
    if(options.target.selectable){
        // 기존의 점을 클릭할 때
        selectedPoint = options.target;
        loops.map(loop => {loop.selected = false;});
        const selectedLoop = loops.find(loop => loop.points.includes(selectedPoint));
        selectedLoop.selected = true;
        if(options.button !== 1){
            selectedLoop.points = selectedLoop.points.filter(point => point !== selectedPoint);
            // 기존의 점을 오른쪽 클릭하면 삭제
        }
    }
    else{
        // 빈 공간을 클릭할 때
        if(options.button === 1){
            // 빈 공간을 왼쪽 클릭하면 새로운 점 (created) 생성
            const {x, y} = options.pointer;
            selectedPoint = createCircle(x, y);
            const selectedLoop = loops.find(loop => loop.selected);
            if(selectedLoop === undefined){
                loops.push(new Loop(
                    [createCircle(x, y)],
                    selected=true
                ))
            }
            else{
                selectedLoop.points.push(selectedPoint);
            }
        }
        else{
            // 빈 공간을 오른쪽 클릭하면 마지막 점 삭제
            const selectedLoop = loops.find(loop => loop.selected);
            if(selectedLoop !== undefined){
                selectedLoop.points.pop();
                if(selectedLoop.points.length >= 1)
                    selectedPoint = selectedLoop.points[selectedLoop.points.length - 1];
            }
        }
    }
    loops = loops.filter(loop => loop.points.length >= 1);
    updateCanvas(canvas, loops);

});

canvas.on("mouse:move", function(options){
    // 새로 만든 점 드래그는 fabric.js에 구현이 안되어 있음
    if(selectedPoint !== null){
        let {x, y} = options.pointer;
        selectedPoint.left = x;
        selectedPoint.top = y;
        selectedPoint.setCoords();
    }
    updateCanvas(canvas, loops);

});

canvas.on("mouse:up", function(options){
    selectedPoint = null;
});

document.onkeydown = function(event){
    let { key } = event;
    key = key.toUpperCase();
    if(key === 'C'){
        // C 키를 누르면 현재 만들고 있는 고리를 완성하고, 
        // 새로운 고리를 만들기 시작합니다.
        loops.map(loop => {loop.selected = false;});
        updateCanvas(canvas, loops);
    }
    else if(key == 'X'){
        // X 키를 누르면 선택된 고리를 삭제합니다.
        const selectedLoop = loops.find(loop => loop.selected);
        loops = loops.filter(loop => loop !== selectedLoop);
        updateCanvas(canvas, loops);
    }
}