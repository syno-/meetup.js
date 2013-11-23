
/*
 *
 * TODO:
 *
 *   招待待ち
 */

/**
 *
 */
Meetup = (function() {
    var callbacks = [];

    function log() {
        arguments.unshift('meetup.js :');
        console.log.apply(this, arguments);
    }

    function createError(message) {
        var err = {
            message: message
        };

        return err;
    }

	function fire(name, thisObj, args) {
        callbacks.forEach(function(o) {
            if (o.name === name) {
                o.func.apply(thisObj, args);
            }
        });
    }

    var meetup = function(config) {
        this.readyCallback = null;
        this.addedPeerCallback = null;
        this.removedPeerCallback = null;
        this.myself = {};
        /**
         * [{
         *  peer: <Peer>,
         *  dataChannel: <RTCDataChannel>,
         * }, ...]
         *
         */
        this.members = [];
        this.debug = !!config.debug;
        this.webrtc = new SimpleWebRTC(config);

        var self = this;

        //this.webrtc.on('videoAdded', function(videoEl, peer) {
        //    console.log('videoAdded', videoEl, peer, 'id=', peer.id);
        //    var member = getMember(peer.id);
        //    member.videoEl = videoEl;
        //    member.peer = peer;
        //});
        this.webrtc.on('peerStreamAdded', function(peer) {
            console.log('peerStreamAdded', peer);
            self.members.push({
                peer: peer
            });

            if (self.addedPeerCallback) self.addedPeerCallback.apply(self, arguments);
        });
        this.webrtc.on('peerStreamRemoved', function(peer) {
            console.log('peerStreamRemoved', peer);

            self.members = self.members.filter(function(v) {
                return v.peer.id != peer.id;
            });

            if (self.removedPeerCallback) self.removedPeerCallback.apply(self, arguments);
        });
        
        this.webrtc.on('localStream', function(evt) {
            console.log('localStream');
        });

        this.webrtc.on('*', function (event) {
            if (event.name === 'PermissionDeniedError' || // for Chrome >=33
                event.name === 'PERMISSION_DENIED' // for Chrome <=30
               ) {
                if (self.readyCallback) self.readyCallback.call(this, createError('Permission Denied.'), event);
            } else if (
                event.name === 'NavigatorUserMediaError' ||
                event.name === 'NOT_SUPPORTED_ERROR'
               ) {
                   // TODO: Not supported on this browser.
            }
        });

        var con = window.con = this.getConnection();
        console.log('con', window.con);
        con.socket.addListener('error', function(evt) {
            //console.log('Error', evt, this);
            fire('socketError', this, arguments);
        });
    };

    // ----------------------------
    // Get objects
    // ----------------------------

    meetup.prototype.get = function() {
        return this.webrtc;
    };

    /**
     * get Socket.IO Object.
     */
    meetup.prototype.getConnection = function() {
        return this.webrtc.connection;
    };

    meetup.prototype.my = function() {
        return this.myself;
    };

    // ----------------------------
    // Operation
    // ----------------------------

    meetup.prototype.login = function(oid, cb) {
        this.organizationId = oid;
        var self = this;
        this.webrtc.on('connectionReady', function (sessionId) {
            console.log('connectionReady', sessionId);
            self.myself.sessionId = sessionId;

            // TODO: ここでサービスへRIDを送ってログインする。
            setTimeout(function() {
                // TODO: RIDが無いとか不正なRIDでしたみたいな場合はエラーオブジェクトを返します
                var err = null;
                if (!oid) {
                    // RIDないぜ
                    err = {
                        message: 'OrganizationId is empty.'
                    };
                }
                if (self.debug) {
                    console.log('error', err);
                }
                if (cb) cb(err);
            }, 500);
        });

        return this;
    };

    // we have to wait until it's ready
    meetup.prototype.ready = function(cb) {
        this.readyCallback = cb;
        this.startLocalVideo();
        var self = this;
        this.webrtc.on('readyToCall', function (event) {
            if (cb) cb.call(self, null, event);
        });
        return this;
    };

    meetup.prototype.joinRoom = function(roomId, cb) {
        if (!roomId || typeof roomId !== 'string') {
            if (cb) cb.call(self, createError('roomId is MUST be not empty.'), null);
            return this;
        }
        var self = this;
        this.webrtc.joinRoom(roomId, function(err, roomDescription) {
            if (cb) cb.call(self, err, roomDescription);
        });
        return this;
    };

    meetup.prototype.leaveRoom = function(cb) {
        var self = this;
        this.webrtc.on('leftRoom', function (event) {
            if (cb) cb.call(self, event);
        });
        this.webrtc.leaveRoom();
        return this;
    };

    meetup.prototype.mute = function(cb) {
        var self = this;
        this.webrtc.on('audioOff', function (event) {
            if (cb) cb.call(self, event);
        });
        this.webrtc.mute();
        return this;
    };

    meetup.prototype.unmute = function(cb) {
        var self = this;
        this.webrtc.on('audioOn', function (event) {
            if (cb) cb.call(self, event);
        });
        this.webrtc.unmute();
        return this;
    };

    meetup.prototype.pause = function(cb) {
        var self = this;
        this.webrtc.on('videoOff', function (event) {
            if (cb) cb.call(self, event);
        });
        this.webrtc.pause();
        return this;
    };

    meetup.prototype.resume = function(cb) {
        this.webrtc.on('videoOn', function (event) {
            if (cb) cb.call(this, event);
        });
        this.webrtc.resume();
        return this;
    };

    meetup.prototype.stopLocalVideo = function(cb) {
        this.webrtc.on('localStreamStopped', function (event) {
            if (cb) cb.call(this, event);
        });
        this.webrtc.stopLocalVideo();
        return this;
    };

    meetup.prototype.startLocalVideo = function(cb) {
        this.webrtc.startLocalVideo();
        // TODO: 接続完了(readyToCall)にフックする？
        if (cb) cb.call(this);
        return this;
    };

    meetup.prototype.shareScreen = function(cb) {
        this.webrtc.shareScreen(function() {
            if (cb) cb.apply(this, arguments);
        });
        return this;
    };

    meetup.prototype.stopScreenShare = function(cb) {
        if (this.debug) {
            // TODO
            //log('');
            console.log('stopScreenShare');
        }
        this.webrtc.stopScreenShare();
        return this;
    };

    // ----------------------------
    // Events
    // ----------------------------

    /**
     *
     */
    meetup.prototype.on = function(name, func) {
        if (name && func) {
            callbacks.push({
                name: name,
                func: func,
            });
        } else {
            if (this.debug) {
                console.log('event name or func is empty.', name, func);
            }
        }
        return this;
    };

    /**
     * delete event
     * 
     * - socketError
     * - speaking
     * - toppedSpeaking
     */
    meetup.prototype.off = function(funcOrName) {
		if (typeof funcOrName === 'string') {
			var name = funcOrName;
			callbacks = callbacks.filter(function(a, b) {
				return a.name !== name;
			});
		} else {
			var func = funcOrName;
			callbacks = callbacks.filter(function(a, b) {
				return a.func !== func;
			});
		}
        return this;
    };

    meetup.prototype.speaking = function(cb) {
        var self = this;
        this.webrtc.on('speaking', function (event) {
            fire('speaking', this, arguments);
            if (cb) cb.call(self, event);
        });
        return this;
    };

    meetup.prototype.stoppedSpeaking = function(cb) {
        var self = this;
        this.webrtc.on('stoppedSpeaking', function (event) {
            fire('stoppedSpeaking', this, arguments);
            if (cb) cb.call(self, event);
        });
        return this;
    };

    meetup.prototype.addedPeer = function(cb) {
        this.addedPeerCallback = cb;
        return this;
    };

    meetup.prototype.removedPeer = function(cb) {
        this.removedPeerCallback = cb;
        return this;
    };

    // ----------------------------
    // master
    // ----------------------------

    var master = function() {
    };

    master.prototype.create = function(config) {
        return new meetup(config);
    };
    
    return new master();
})();
