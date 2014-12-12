function Render() {
    this.initMatrix();

    // Absolute camera position 
    this.cpitch = 0;
    this.cyaw = -0.1;

    this.cxPos = 0;
    this.cyPos = 10;
    this.czPos = 80;

    // Function for camera binding
    this.camera = false;
}

Render.prototype.bindCamera = function(tank) {
    var render = this;

    this.camera = function() {
        render.cyaw = tank.rTurret;

        render.cxPos = tank.xPos + 5 * Math.sin(this.degToRad(render.cyaw));
        render.cyPos = 1.5;
        render.czPos = tank.zPos + 5 * Math.cos(this.degToRad(render.cyaw));
    }
}

Render.prototype.initGL = function(canvasId) {
    var canvas = document.getElementById(canvasId);

    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;

    try {
        this.gl = canvas.getContext("webgl");
        this.gl.viewportWidth = canvas.width;
        this.gl.viewportHeight = canvas.height;
    } catch(e) {}

    if (!this.gl) {
        alert("WebGL initialization failed.");
    }
}

// Stock function from Tutorial
Render.prototype.getShader = function(id) {
    var shaderScript = document.getElementById(id);
    if (!shaderScript) {
        return null;
    }

    var str = "";
    var k = shaderScript.firstChild;
    while (k) {
        if (k.nodeType == 3) {
            str += k.textContent;
        }
        k = k.nextSibling;
    }

    var shader;
    if (shaderScript.type == "x-shader/x-fragment") {
        shader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
        shader = this.gl.createShader(this.gl.VERTEX_SHADER);
    } else {
        return null;
    }

    this.gl.shaderSource(shader, str);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
        alert(this.gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

// Mostly a stock function
Render.prototype.initShaders = function() {
    var fragmentShader = this.getShader("shader-fs");
    var vertexShader = this.getShader("shader-vs");

    this.shaderProgram = this.gl.createProgram();
    this.gl.attachShader(this.shaderProgram, vertexShader);
    this.gl.attachShader(this.shaderProgram, fragmentShader);
    this.gl.linkProgram(this.shaderProgram);

    if (!this.gl.getProgramParameter(this.shaderProgram, this.gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }

    this.gl.useProgram(this.shaderProgram);

    this.shaderProgram.vertexPositionAttribute = this.gl.getAttribLocation(this.shaderProgram, "aVertexPosition");
    this.gl.enableVertexAttribArray(this.shaderProgram.vertexPositionAttribute);

    this.shaderProgram.vertexColorAttribute = this.gl.getAttribLocation(this.shaderProgram, "aVertexColor");
    this.gl.enableVertexAttribArray(this.shaderProgram.vertexColorAttribute);

    this.shaderProgram.pMatrixUniform = this.gl.getUniformLocation(this.shaderProgram, "uPMatrix");
    this.shaderProgram.mvMatrixUniform = this.gl.getUniformLocation(this.shaderProgram, "uMVMatrix");
}

// UTILITY FUNCTIONS
Render.prototype.initMatrix = function() {
    this.mvMatrix = mat4.create();
    this.mvMatrixStack = [];
    this.pMatrix = mat4.create();
}

Render.prototype.mvPushMatrix = function() {
    var copy = mat4.create();
    mat4.set(this.mvMatrix, copy);
    this.mvMatrixStack.push(copy);
}

Render.prototype.mvPopMatrix = function() {
    if (this.mvMatrixStack.length == 0) {
        throw "Invalid popMatrix!";
    }
    this.mvMatrix = this.mvMatrixStack.pop();
}

Render.prototype.setMatrixUniforms = function() {
    this.gl.uniformMatrix4fv(this.shaderProgram.pMatrixUniform, false, this.pMatrix);
    this.gl.uniformMatrix4fv(this.shaderProgram.mvMatrixUniform, false, this.mvMatrix);
}

//TODO this method doesn't really belong here, does it.
Render.prototype.degToRad = function(degrees) {
    return degrees * Math.PI / 180;
}

Render.prototype.initBuffer = function(array, type, itemSize, numItems) {
    var buffer = this.gl.createBuffer();

    this.gl.bindBuffer(type, buffer);
    this.gl.bufferData(type, array, this.gl.STATIC_DRAW);

    buffer.itemSize = itemSize;
    buffer.numItems = numItems;

    return buffer;
}

// Stock function, set up the canvas
Render.prototype.initCanvas = function() {
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.enable(this.gl.DEPTH_TEST);
}

// Currently basically just defines the perspective
Render.prototype.drawScene = function() {
    // INIT 
    this.gl.viewport(0, 0, this.gl.viewportWidth, this.gl.viewportHeight);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    mat4.perspective(45, this.gl.viewportWidth / this.gl.viewportHeight, 0.1, 100.0, this.pMatrix);

    // SETUP CAMERA
    mat4.identity(this.mvMatrix);

    if (this.camera !== false){
        this.camera();
    }

    mat4.rotate(this.mvMatrix, this.degToRad(-this.cpitch), [1, 0, 0]);
    mat4.rotate(this.mvMatrix, this.degToRad(-this.cyaw), [0, 1, 0]);
    mat4.translate(this.mvMatrix, [-this.cxPos, -this.cyPos, -this.czPos]);
}
