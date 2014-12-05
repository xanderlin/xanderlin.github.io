// Wrapper for messages that go across the network...
function Network(control) {
    this.pod = crosscloud.connect();
    this.control = control;
}

Network.prototype.broadcast = function(e) {
    e.tank_id = this.control.id;
    e.game_id = this.control.game_id;
    e.timestamp = Date.now();

    this.pod.push(e);
}

Network.prototype.query = function(callback, hash) {
    this.pod.query()
        .filter(hash)
        .onAllResults(callback)
        .start();
}

Network.prototype.queryKeys = function(callback) {
    this.query(callback, this.keyPressHash());
}

Network.prototype.queryMice = function(callback) {
    this.query(callback, this.mouseMoveHash());
}

Network.prototype.queryShot = function(callback) {
    this.query(callback, this.shotHash());
}

Network.prototype.keyPressHash = function() {
    return {
        tank_id: { "$exists": true },
        game_id: this.control.game_id,
        timestamp: { "$exists" : true },

        yaw: { "$exists": true },
        thrust: { "$exists": true },

        rBody: { "$exists": true },

        xPos: { "$exists": true },
        yPos: { "$exists": true },
        zPos: { "$exists": true }
    }
}

Network.prototype.mouseMoveHash = function() {
    return {
        tank_id: { "$exists": true },
        game_id: this.control.game_id,
        timestamp: { "$exists" : true },

        rTurret: { "$exists" : true },
        gunPitch: { "$exists" : true },

        dYaw: { "$exists": true },
        dPitch: { "$exists": true }
    }
}

Network.prototype.shotHash = function() {
    return {
        tank_id: { "$exists": true },
        game_id: this.control.game_id,
        timestamp: { "$exists" : true },

        rTurret: { "$exists" : true },
        gunPitch: { "$exists" : true },

        xPos: { "$exists": true },
        zPos: { "$exists": true }
    }
}
