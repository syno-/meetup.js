





// ----------------------------
// Libs
// ----------------------------
var roomName = 'esperia'; // TODO
var meetup = Meetup.create({
}).ready(function(sessionId) {
    console.log('ready, sessionId=', sessionId);
    $('#alert-permit').remove();

    // ready
    this.joinRoom(roomName, function(err, roomDescription) {
        console.log('joinRoom', err);
    });
}).denied(function(event) {
    var msg = 'カメラとマイクへのアクセスが許可されていません。<br/>許可した後、リロードしてください。';
    $('#alert-permit').empty().append($('<p/>').html(msg));
}).speaking(function(event) {
    $('#localVideo').addClass('speaking');
}).stoppedSpeaking(function(event) {
    $('#localVideo').removeClass('speaking');
});
var webrtc = meetup.get();

// ----------------------------
// DOM
// ----------------------------

$(function() {
    $('#room-name').text(roomName);

    var userApi = {
        users: [{
            id: 0,
            name: 'むおおおお',
            presence: {
                type: 0,
                message: '',
            },
        }, {
            id: 0,
            name: 'えすぺりあ',
            presence: {
                type: 0,
                message: '',
            },
        }]
    };
    $('#list-presence').click(function(e) {
        var ulEl = $(this).empty();

        $.each(userApi.users, function(i, o) {
            $('<li/>').text(o.name).appendTo(ulEl);
        });
    });

    var isStopping = false;
    $('#localVideo').click(function(e) {
        start();
    });

    function start() {
        if (isStopping) {
            webrtc.startLocalMedia({
                video: true,
                audio: true,
            }, function (err, stream) {
                if (err) {
                    console.log('error!!', err);
                    webrtc.emit(err);
                } else {
                    webrtc.attachMediaStream(stream, webrtc.getLocalVideoContainer(), {
                        muted: true, mirror: true
                    });
                }
            });
        } else {
            webrtc.stopLocalVideo();
        }
    }

    $('#mute').click(function() {
        meetup.mute();
    });
    $('#unmute').click(function() {
        meetup.unmute();
    });
    $('#pause').click(function() {
        meetup.pause();
    });
    $('#resume').click(function() {
        meetup.resume();
    });
    $('#stopVideo').click(function() {
        meetup.stopLocalVideo();
    });
    $('#startVideo').click(function() {
        meetup.startLocalVideo();
    });
    $('#volume').change(function(evt) {
        console.log('volume', evt);
        var volume = $(this).val();
        webrtc.setVolumeForAll(volume);
    }).mouseup(function(evt) {
        console.log('mouseup', evt);
    });
    webrtc.on('videoAdded', function(evt) {
        console.log('videoAdded');
    });
    webrtc.on('localStream', function(evt) {
        console.log('localStream');
    });


/*

Events :

webrtc.leaveRoom();

webrtc.createRoom('RoomName', function() {
});


webrtc.stopScreenShare();
webrtc.getLocalScreen();
webrtc.shareScreen(function(err, stream) {
});
webrtc.getRemoteVideoContainer();
webrtc.setVolumeForAll(volume);
webrtc.setVolumeForAll(volume);

webrtc.removePeers(function(roomId, roomType) {
});

*/
});

