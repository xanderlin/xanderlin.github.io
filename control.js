/**
    The Control class controls most of the game logic for the tank game

    Its responsibilities include:
        Setting up the game
        Maintaining and updating game state
            Dealing with user input
            Responding to and putting data on Crosscloud
        Passing relevant information on to the render pipeline
*/

// Start a new tank game instance
function Control() {
    this.canvasId = "tanks-canvas";

    // Object storage structures
    this.tanks = {};
    this.shots = {};

    // Network and input state
    this.processed = {};
    this.keys = {};

    // Connect to the Network
    this.network = new Network(this);

    // Set id...?
    this.game_id = "test_" + Math.floor((Math.random() * 10000) + 1);
    this.game_id = "test_mp_10"
    this.id = "tank_" + Math.floor((Math.random() * 10000) + 1);
}

// Listen shell function
Control.prototype.listen = function(filter) {
    var control = this;

    this.network.queryKeys(function(events){control.updateKeys(events)});
    this.network.queryMice(function(events){control.updateMice(events)});
    this.network.queryShot(function(events){control.updateShot(events)});
}

Control.prototype.handleKey = function(event, isDown) {
    e = this.translateKeyEvent(event, isDown);
    this.tanks[this.id].moveBody(e);
    this.network.broadcast(e);
}

Control.prototype.handleMouse = function(event) {
    // What's old IE support anyway.
    var width = document.body.clientWidth / 2;
    var height = document.body.clientHeight / 2;

    var e = {}
    var tank = this.tanks[this.id];

    e["rTurret"] = tank.rTurret;
    e["gunPitch"] = tank.gunPitch;

    e["dYaw"] = (width - event.pageX) / width;
    e["dPitch"] = (height - event.pageY) / height;

    tank.moveTurret(e);
    this.network.broadcast(e);
}

Control.prototype.handleClick = function(event) {
    var tank = this.tanks[this.id];
    var e = {};

    e["rTurret"] = tank.rTurret;
    e["gunPitch"] = tank.gunPitch;

    e["xPos"] = tank.xPos;
    e["zPos"] = tank.zPos;

    this.tanks[this.id].fire(e);
    this.network.broadcast(e);
}

Control.prototype.translateKeyEvent = function(event, isDown) {
    var e = {};
    var tank = this.tanks[this.id];

    e["rBody"] = tank.rBody;

    e["xPos"] = tank.xPos;
    e["yPos"] = tank.yPos;
    e["zPos"] = tank.zPos;

    // Thruster Control
    // Abort if no keypress change...
    switch(event.keyCode) {
        case 37:    // left
        case 65:    // A
            this.keys["left"] = isDown;
            break;

        case 39:    // right
        case 68:    // D
            this.keys["right"] = isDown;
            break;

        case 38:    // up
        case 87:    // W
            this.keys["up"] = isDown;
            break;

        case 40:    // down
        case 83:    // S
            this.keys["down"] = isDown;
            break;
    }

    // Left and Right both down mean you go nowhere
    e["yaw"] = 0;
    if (this.keys["left"])  e["yaw"] += 1;
    if (this.keys["right"]) e["yaw"] -= 1;

    e["thrust"] = 0;
    if (this.keys["up"])    e["thrust"] += 1;
    if (this.keys["down"])  e["thrust"] -= 1;

    return e;
}

// Updates the tanks with the events floating around the pods
// We are only going to use the most recent event from each tank
Control.prototype.update = function(events, context) {
    var queue = {};

    // Extract most recent events
    for (var i = 0; i < events.length; i++) {
        var e = events[i];

        // Your tank is bound directly to user input
        if (e.tank_id == this.id) {
            continue;
        }

        if (!(e.tank_id in queue)) {
            queue[e.tank_id] = e;
        }

        if (queue[e.tank_id].timestamp < e.timestamp) {
            queue[e.tank_id] = e;
        }
    }
   
    // Process unseen updates
    for (tank_id in queue) {
        var e = queue[tank_id];

        if (!(e._id in this.processed)) {
            this.processed[e._id] = true;

            if (!(tank_id in this.tanks)) {
                console.log("A new challenger appears!");
                this.tanks[tank_id] = new Tank(this);
            }

            if (context === "Keys") {
                this.tanks[tank_id].moveBody(e);
            }

            if (context === "Mice") {
                this.tanks[tank_id].moveTurret(e);
            }

            if (context === "Shot") {
                this.tanks[tank_id].fire(e);
            }
        }
    }
}

Control.prototype.updateKeys = function(events) {
    this.update(events, "Keys");
}

Control.prototype.updateMice = function(events) {
    this.update(events, "Mice");
}

Control.prototype.updateShot = function(events) {
    this.update(events, "Shot");
}

Control.prototype.tick = function() {
    // Bind display refresh
    var control = this;
    requestAnimFrame(function(){control.tick()});

    // Render scene
    this.render.drawScene();

    this.map.drawScene(this.render);

    for (tank in this.tanks) {
        this.render.mvPushMatrix();
        this.tanks[tank].drawScene(this.render);
        this.render.mvPopMatrix();
    }

    for (shot in this.shots) {
        this.render.mvPushMatrix();
        this.shots[shot].drawScene(this.render);
        this.render.mvPopMatrix();
    }

    // Update data 
    this.tanks[tank].process(this.shots);

    for (tank in this.tanks) {
        this.tanks[tank].animate(this.render);
    }

    for (shot in this.shots) {
        this.shots[shot].animate(this.render);
    }
}

Control.prototype.start = function() {
    // Start Web GL
    this.render = new Render();
    this.render.initGL(this.canvasId);

    // Bind Controls
    var control = this;

    document.onkeydown = function(event) {
        return control.handleKey(event, true); };
    document.onkeyup = function(event) {
        return control.handleKey(event, false); };

    document.onmousemove = function(event) {
        return control.handleMouse(event); };
    document.onclick = function(event) {
        return control.handleClick(event); };

    // Initialize Object
    this.map = new Map();

    this.render.initShaders();
    this.map.initBuffers(this.render);
    this.tanks[this.id] = new Tank(this);

    this.render.initCanvas();
    this.render.bindCamera(this.tanks[this.id]);

    // Start chattering
    this.listen();

    // Start ticking
    this.tick();
}
