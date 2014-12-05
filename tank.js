function Tank(control) {
    this.gunPitch = 0;
    this.rTurret = 0;
    this.rBody = 0;

    this.speed = 0;

    this.ytRate = 0;
    this.gpRate = 0;

    this.yawRate = 0;

    this.xPos = 0;
    this.yPos = 0;
    this.zPos = 0;

    this.lastTime = 0;
    this.lastShot = 0;

    this.control = control;
    this.initBuffers(control.render);
}

Tank.prototype.fire = function(e) {
    var curTime = Date.now();
    if (curTime - this.lastShot > 1000) {
        this.lastShot = curTime;
        console.log("Boom!");

        // register shot with control

        var shot = new Shot(this.control.render, e);
        this.control.shots[curTime + "_" + this.control.id] = shot;
    } else {
        console.log("Click--");
    }
}

Tank.prototype.moveTurret = function(e) {
    this.rTurret = e.rTurret;
    this.gunPitch = e.gunPitch;

    this.ytRate = 0.1 * e.dYaw;
    this.gpRate = 0.1 * e.dPitch;
}

Tank.prototype.moveBody = function(e) {
    this.rBody = e.rBody;

    this.xPos = e.xPos;
    this.yPos = e.yPos;
    this.zPos = e.zPos;

    this.yawRate = 0.1 * e.yaw;
    this.speed = 0.003 * e.thrust;

    if (e.timestamp != null) this.lastTime = e.timestamp;
}

Tank.prototype.initBuffers = function(render){
    this.turretVertexPositionBuffer = render.initBuffer(
        Tank.turretVertexPositions(), render.gl.ARRAY_BUFFER, 3, 12);

    this.turretVertexColorBuffer = render.initBuffer(
        Tank.turretVertexColors(), render.gl.ARRAY_BUFFER, 4, 12);

    this.bodyVertexPositionBuffer = render.initBuffer(
        Tank.bodyVertexPositions(), render.gl.ARRAY_BUFFER, 3, 24);

    this.bodyVertexColorBuffer = render.initBuffer(
        Tank.bodyVertexColors(), render.gl.ARRAY_BUFFER, 4, 24);

    this.bodyVertexIndexBuffer = render.initBuffer(
        Tank.bodyVertexIndices(), render.gl.ELEMENT_ARRAY_BUFFER, 1, 36);
}

Tank.prototype.drawScene = function(render){
    // Convenience definitions
    var gl = render.gl;
    var shaderProgram = render.shaderProgram;

    var turretVertexPositionBuffer = this.turretVertexPositionBuffer;
    var turretVertexColorBuffer = this.turretVertexColorBuffer;

    var bodyVertexPositionBuffer = this.bodyVertexPositionBuffer;
    var bodyVertexColorBuffer = this.bodyVertexColorBuffer;
    var bodyVertexIndexBuffer = this.bodyVertexIndexBuffer;

    // Seek
    mat4.translate(render.mvMatrix, [this.xPos, this.yPos, this.zPos]);
    mat4.translate(render.mvMatrix, [0.0, 0.5, 0.0]);

    // Setup
    render.mvPushMatrix();
    mat4.translate(render.mvMatrix, [0.0, 0.5, 0.0]);
    mat4.rotate(render.mvMatrix, render.degToRad(this.rTurret), [0, 1, 0]);

    gl.bindBuffer(gl.ARRAY_BUFFER, turretVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, turretVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, turretVertexColorBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, turretVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

    // Draw
    render.setMatrixUniforms();
    gl.drawArrays(gl.TRIANGLES, 0, turretVertexPositionBuffer.numItems);

    render.mvPopMatrix();

    // Seek
    // mat4.translate(render.mvMatrix, [0.0, 0.0, 0.0]);

    // Setup
    render.mvPushMatrix();
    mat4.rotate(render.mvMatrix, render.degToRad(this.rBody), [0, 1, 0]);

    gl.bindBuffer(gl.ARRAY_BUFFER, bodyVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, bodyVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, bodyVertexColorBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, bodyVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bodyVertexIndexBuffer);

    // Draw
    render.setMatrixUniforms();
    gl.drawElements(gl.TRIANGLES, bodyVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

    render.mvPopMatrix();
}

Tank.prototype.animate = function(render) {
    var timeNow = Date.now();

    if (this.lastTime != 0) {
        var elapsed = timeNow - this.lastTime;

        if (this.speed != 0) {
            this.xPos -= Math.sin(render.degToRad(this.rBody)) * this.speed * elapsed;
            this.zPos -= Math.cos(render.degToRad(this.rBody)) * this.speed * elapsed;
        }

        this.rBody += this.yawRate * elapsed;

        this.rTurret += this.ytRate * elapsed;
        this.gunPitch += this.gpRate * elapsed;
    }

    this.lastTime = timeNow;
}

// TANK RENDERING DATA
Tank.turretVertexPositions = function() {
    var width = 1.0;
    var height = 0.25;
    var depth = 1.0;

    var vertices = [
        // Front face
         0.0,    height,    0.0,
        -width, -height,  depth,
         width, -height,  depth,

        // Right face
         0.0,    height,    0.0,
         width, -height,  depth,
         width, -height, -depth,

        // Back face
         0.0,    height,    0.0,
         width, -height, -depth,
        -width, -height, -depth,

        // Left face
         0.0,    height,    0.0,
        -width, -height, -depth,
        -width, -height,  depth
    ];

    return new Float32Array(vertices);
}

Tank.turretVertexColors = function() {
    var colors = [
        // Front face
        1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0,

        // Right face
        1.0, 0.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        0.0, 1.0, 0.0, 1.0,

        // Back face
        1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0,

        // Left face
        1.0, 0.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        0.0, 1.0, 0.0, 1.0
    ];

    return new Float32Array(colors);
}

Tank.bodyVertexPositions = function() {
    var width = 1.0;
    var height = 0.25;
    var depth = 1.5;

    var vertices = [
        // Front face
        -width, -height,  depth,
         width, -height,  depth,
         width,  height,  depth,
        -width,  height,  depth,

        // Back face
        -width, -height, -depth,
        -width,  height, -depth,
         width,  height, -depth,
         width, -height, -depth,

        // Top face
        -width,  height, -depth,
        -width,  height,  depth,
         width,  height,  depth,
         width,  height, -depth,

        // Bottom face
        -width, -height, -depth,
         width, -height, -depth,
         width, -height,  depth,
        -width, -height,  depth,

        // Right face
         width, -height, -depth,
         width,  height, -depth,
         width,  height,  depth,
         width, -height,  depth,

        // Left face
        -width, -height, -depth,
        -width, -height,  depth,
        -width,  height,  depth,
        -width,  height, -depth
    ];

    return new Float32Array(vertices);
}

Tank.bodyVertexColors = function() {
    var colors = [
        [1.0, 0.0, 0.0, 1.0], // Front face
        [1.0, 1.0, 0.0, 1.0], // Back face
        [0.0, 1.0, 0.0, 1.0], // Top face
        [1.0, 0.5, 0.5, 1.0], // Bottom face
        [1.0, 0.0, 1.0, 1.0], // Right face
        [0.0, 0.0, 1.0, 1.0]  // Left face
    ];
    var unpackedColors = [];
    for (var i in colors) {
        var color = colors[i];
        for (var j=0; j < 4; j++) {
            unpackedColors = unpackedColors.concat(color);
        }
    }

    return new Float32Array(unpackedColors);
}

Tank.bodyVertexIndices = function() {
    var bodyVertexIndices = [
        0, 1, 2,      0, 2, 3,    // Front face
        4, 5, 6,      4, 6, 7,    // Back face
        8, 9, 10,     8, 10, 11,  // Top face
        12, 13, 14,   12, 14, 15, // Bottom face
        16, 17, 18,   16, 18, 19, // Right face
        20, 21, 22,   20, 22, 23  // Left face
    ];

    return new Uint16Array(bodyVertexIndices);
}
