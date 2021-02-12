console.log('Scripts loaded');

class Node {
    x = 1;
    y = 1;
    size = 1;

    vector = [];

    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;

        this.vector = [(Math.random() * 2 - 1) / 1000, Math.random() / 1000, Math.random()];
    }
}

let canvas = document.getElementById('canvas');

let menuCanvasX = document.getElementById('menu-canvas-x');
let menuCanvasY = document.getElementById('menu-canvas-y');

let nodes = generateNodes();

init();

function init() {
    setCanvasSize();

    // hook up listeners
    window.onresize = setCanvasSize;

    animate();
}


function setCanvasSize() {
    let width = canvas.offsetWidth.toString();
    let height = canvas.offsetHeight.toString();

    canvas.setAttribute('width', width);
    canvas.setAttribute('height', height);

    menuCanvasX.innerText = canvas.getAttribute('width');
    menuCanvasY.innerText = canvas.getAttribute('height');

    console.trace(`Canvas size changed to ${canvas.getAttribute('width')}x${canvas.getAttribute('height')}`);
}

function draw() {

    let cw = Number(canvas.getAttribute('width'));
    let ch = Number(canvas.getAttribute('height'));

    let ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, cw, ch);

    nodes.forEach(
        function (node, n, nodes) {
            node.x += node.vector[0];
            node.y -= node.vector[1];
            node.size -= node.vector[2];

//            if (node.size < 0) {
            if (node.x > 1 || node.x < 0 || node.y > 1 || node.y < 0 || node.size < 0) {
                nodes[n] = new Node(Math.random(), Math.random(), 100 * Math.random());
                return;
            }

            ctx.strokeStyle = `rgba(0, 176, 255, ${node.size / 100})`;
            ctx.beginPath();
            ctx.arc(node.x * cw, node.y * ch, node.size / 2, 0, 2 * Math.PI);
            ctx.stroke();

            let t;
            if (n + 1 == nodes.length) {
                t = nodes[0];
            } else {
                t = nodes[n + 1];
            }

            nodes.forEach(
                function (target, t, targets) {
                    if (t > n && t != n) {
                        ctx.beginPath();
                        let opacity = node.size > target.size ? target.size / 100 : node.size / 100;
                        ctx.strokeStyle = `rgba(0, 176, 255, ${opacity})`;
                        ctx.moveTo(node.x * cw, node.y * ch);
                        ctx.lineTo(target.x * cw, target.y * ch);
                        ctx.stroke();
                    }
                }
            )
        }
    );

}

function animate() {
    draw();
    window.requestAnimationFrame(animate);
}

function generateNodes() {
    let nodes = [];
    for (let i = 0; i < 15; i++) {
        nodes.push(new Node(Math.random(), Math.random(), 100 * Math.random()));
    }
    return nodes;
}