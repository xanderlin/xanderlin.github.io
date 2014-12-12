function Shot(render, e) {
    this.speed = 0.01;

    this.pitch = 45;
    this.yaw = e.rTurret;

    this.vSpeed = this.speed * Math.sin(render.degToRad(this.pitch));
    this.hSpeed = this.speed * Math.cos(render.degToRad(this.pitch));

    this.rBody = 0;

    this.xPos = e.xPos;
    this.yPos = 1;
    this.zPos = e.zPos;

    this.lastTime = 0;

    this.initBuffers(render);
}

Shot.prototype.initBuffers = function(render){
    this.projectileVertexPositionBuffer = render.initBuffer(
        Shot.projectileVertexPositions(), render.gl.ARRAY_BUFFER, 3, 12);

    this.projectileVertexColorBuffer = render.initBuffer(
        Shot.projectileVertexColors(), render.gl.ARRAY_BUFFER, 4, 12);
}

Shot.prototype.drawScene = function(render){
    // Convenience definitions
    var gl = render.gl;
    var shaderProgram = render.shaderProgram;

    var projectileVertexPositionBuffer = this.projectileVertexPositionBuffer;
    var projectileVertexColorBuffer = this.projectileVertexColorBuffer;

    // Save
    render.mvPushMatrix();

    // Seek
    mat4.translate(render.mvMatrix, [this.xPos, this.yPos, this.zPos]);

    // Setup
    mat4.translate(render.mvMatrix, [0.0, 0.5, 0.0]);
    mat4.rotate(render.mvMatrix, render.degToRad(this.yaw), [0, 1, 0]);
    mat4.rotate(render.mvMatrix, render.degToRad(270), [1, 0, 0]);

    gl.bindBuffer(gl.ARRAY_BUFFER, projectileVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, projectileVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, projectileVertexColorBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, projectileVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

    // Draw
    render.setMatrixUniforms();
    gl.drawArrays(gl.TRIANGLES, 0, projectileVertexPositionBuffer.numItems);

    // Revert
    render.mvPopMatrix();
}

Shot.prototype.animate = function(render) {
    var timeNow = Date.now();

    if (this.lastTime != 0) {
        var elapsed = timeNow - this.lastTime;

        if (this.speed != 0) {
            this.xPos -= Math.sin(render.degToRad(this.yaw)) * this.hSpeed * elapsed;
            this.zPos -= Math.cos(render.degToRad(this.yaw)) * this.hSpeed * elapsed;
            this.yPos += this.vSpeed * elapsed;

            this.vSpeed -= 0.00001 * elapsed;
        }
    }

    this.lastTime = timeNow;
}

// TANK RENDERING DATA
Shot.projectileVertexPositions = function() {
    var width = 0.1;
    var height = 0.2;
    var depth = 0.1;

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

Shot.projectileVertexColors = function() {
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
