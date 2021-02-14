console.log('Thanks for playing around with https://github.com/dyazdan/mercurymesh - Leave a star ⭐️!');

// Representation of a floating node as a class
class Node {
    x = 1;
    y = 1;
    size = 1;

    vector = [];
    shrink = 0.5

    constructor(x, y, size, vx, vy, shrink) {

        // Assign the nodes relative position and size
        this.x = x;
        this.y = y;
        this.size = size;

        // Assign the 2D velocity vector
        this.vector = [vx, vy];

        // Assign the node shrinking rate
        this.shrink = shrink;
        this.shrink = this.shrink <= 0 ? 0.1 : this.shrink;
    }

    // Generates a new random node
    static generateNode() {
        return new Node(Math.random(), Math.random(), nodeSize * Math.random(), Math.random() / 1000, Math.random() / 1000, Math.random());
    }

    // Generate a given number of random nodes
    static generateNodes(nodeCount) {
        let nodes = [];
        for (let n = 0; n < nodeCount; n++) {
            nodes.push(this.generateNode());
        }
        return nodes;
    }

}

// Grab the canvas from the DOM
const canvas = document.getElementById('canvas');

const nodeCount = 10;           // 10
let nodeSize = 10;              // 10
const nodeSizeRelative = 20;    // 20
const nodeRebound = true;       // true
const nodeSpeed = 3.0;          // 3.0
let mousePosition = [0,0]       // set by function

// Let's generate some nodes
const nodes = Node.generateNodes(nodeCount);


// Dirty-grabbing the node color here, as we can't get it directly from CSS
const color = getComputedStyle(document.getElementById("menu")).getPropertyValue('background-color');

// Init the good stuff
init();

function getMousePosition(e) {

    // nifty solution from https://stackoverflow.com/questions/1114465/getting-mouse-location-in-canvas
    let mouseX, mouseY;

    if (e.offsetX) {
        mouseX = e.offsetX;
        mouseY = e.offsetY;
    } else if (e.layerX) {
        mouseX = e.layerX;
        mouseY = e.layerY;
    }

    mousePosition = [mouseX, mouseY];
}

// Initialize everything that is needed before animation begins
function init() {

    // Touch all the necessary methods once
    setCanvasSize();
    setNodeSize();
    updateMenu();

    // Hook up listeners
    window.onresize = function (e) {
        setCanvasSize(e);
        setNodeSize();
        updateMenu(e);
    };

    canvas.onmousemove = function(e) {
        getMousePosition(e);
    }

    // Start the animation loop
    animate();
}

// Get the current canvas size and set the node size accordingly
function setNodeSize() {
    let cw = Number(canvas.getAttribute('width'));
    let ch = Number(canvas.getAttribute('height'));
    nodeSize = cw > ch ? ch / nodeSizeRelative : cw / nodeSizeRelative
}

// Explicitly set the canvas size for correct drawing aspect ratio and dimension
function setCanvasSize() {
    let width = canvas.offsetWidth.toString();
    let height = canvas.offsetHeight.toString();

    canvas.setAttribute('width', width);
    canvas.setAttribute('height', height);

    console.trace(`Canvas size changed to ${canvas.getAttribute('width')}x${canvas.getAttribute('height')}`);
}

// Update the POIs in the top bar menu
function updateMenu() {
    const menuCanvasX = document.getElementById('menu-canvas-x');
    const menuCanvasY = document.getElementById('menu-canvas-y');
    const menuNodeCount = document.getElementById('menu-nodes-count');
    const menuNodeSize = document.getElementById('menu-nodes-size');
    const menuNodeSpeed = document.getElementById('menu-nodes-speed');

    menuCanvasX.innerText = canvas.getAttribute('width');
    menuCanvasY.innerText = canvas.getAttribute('height');
    menuNodeCount.innerText = nodeCount.toString();
    menuNodeSize.innerText = nodeSize.toString();
    menuNodeSpeed.innerText = nodeSpeed.toString();
}

// The main animation loop
function animate() {
    drawNodes();
    window.requestAnimationFrame(animate);
}

// The node drawing method
function drawNodes() {
    let cw = Number(canvas.getAttribute('width'));
    let ch = Number(canvas.getAttribute('height'));

    // Get the canvas size and context
    let ctx = canvas.getContext('2d');

    // Flush the canvas for redrawing
    ctx.clearRect(0, 0, cw, ch);

    // Draw the mouse pointer node
    ctx.beginPath();
    ctx.arc(mousePosition[0], mousePosition[1],nodeSize / 2, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.fill();

    // Draw the nodes
    nodes.forEach(
        function (node, n, nodes) {

            // Apply the node's movement vector and shrink
            node.x += node.vector[0] * nodeSpeed;
            node.y -= node.vector[1] * nodeSpeed;
            node.size -= node.shrink;

            // If the node shrinks to zero, replace it with a new one
            if (nodeRebound === false && (node.x <= 0 || node.x >= cw || node.y <= 0 || node.y >= ch) || node.size < 0) {
                nodes[n] = Node.generateNode();
                return;
            }

            // If the node reaches the horizontal canvas bounds, bounce or replace
            if (node.x <= 0 || node.x >= 1) {
                node.vector[0] *= -1;
            }

            // If the node reaches the horizontal canvas bounds, bounce or replace
            if (node.y <= 0 || node.y >= 1) {
                node.vector[1] *= -1;
            }

            // Draw the node itself (which honestly is just a cirle)
            const opacity = node.size / nodeSize;

            ctx.strokeStyle = `${color.replace('rgb', 'rgba').replace(')', ',' + opacity + ')')}`;
            ctx.beginPath();
            ctx.arc(node.x * cw, node.y * ch, node.size / 2, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.fillStyle = `${color.replace('rgb', 'rgba').replace(')', ',' + opacity + ')')}`;
            ctx.fill();

            // Draw the nodes interconnection
            nodes.forEach(
                function (target, t, targets) {
                    if (t > n && t !== n) {
                        ctx.beginPath();
                        // The line opacity should match the one of the more translucent node
                        let opacity = node.size > target.size ? target.size / nodeSize : node.size / nodeSize;
                        ctx.strokeStyle = `${color.replace('rgb', 'rgba').replace(')', ',' + opacity + ')')}`;
                        ctx.moveTo(node.x * cw, node.y * ch);
                        ctx.lineTo(target.x * cw, target.y * ch);
                        // Line to the mouse, just for fun
                        ctx.moveTo(node.x * cw, node.y * ch);
                        ctx.lineTo( mousePosition[0], mousePosition[1],)
                        ctx.stroke();
                    }
                }
            )
        }
    );
}
