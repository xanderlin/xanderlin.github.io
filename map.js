function Map() {
}

Map.prototype.update = function() {
}

Map.prototype.initBuffers = function(render){
    this.mapVertexPositionBuffer = render.initBuffer(
        Map.mapVertexPositions(), render.gl.ARRAY_BUFFER, 3, 24);

    this.mapVertexColorBuffer = render.initBuffer(
        Map.mapVertexColors(), render.gl.ARRAY_BUFFER, 4, 24);

    this.mapVertexIndexBuffer = render.initBuffer(
        Map.mapVertexIndices(), render.gl.ELEMENT_ARRAY_BUFFER, 1, 36);
}

Map.prototype.drawScene = function(render){
    // Convenience definitions
    var gl = render.gl;
    var shaderProgram = render.shaderProgram;

    var mapVertexPositionBuffer = this.mapVertexPositionBuffer;
    var mapVertexColorBuffer = this.mapVertexColorBuffer;
    var mapVertexIndexBuffer = this.mapVertexIndexBuffer;

    // Seek
    render.mvPushMatrix();
    // mat4.translate(render.mvMatrix, [0.0, 0.0, 0.0]);

    // Setup
    gl.bindBuffer(gl.ARRAY_BUFFER, mapVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, mapVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, mapVertexColorBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, mapVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mapVertexIndexBuffer);

    // Draw
    render.setMatrixUniforms();
    gl.drawElements(gl.TRIANGLES, mapVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

    render.mvPopMatrix();
}

// MAP RENDERING DATA
Map.mapVertexPositions = function() {
    var width = 40.0;
    var height = 0.1;
    var depth = 40.0;

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

Map.mapVertexColors = function() {
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

Map.mapVertexIndices = function() {
    var mapVertexIndices = [
        0, 1, 2,      0, 2, 3,    // Front face
        4, 5, 6,      4, 6, 7,    // Back face
        8, 9, 10,     8, 10, 11,  // Top face
        12, 13, 14,   12, 14, 15, // Bottom face
        16, 17, 18,   16, 18, 19, // Right face
        20, 21, 22,   20, 22, 23  // Left face
    ];

    return new Uint16Array(mapVertexIndices);
}
