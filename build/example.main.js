

// ----------------------------
// Libs
// ----------------------------
var organizationId = 'esperia'; // TODO
var meetup = Meetup.create({
}).ready(function(sessionId) {
    console.log('ready, sessionId=', sessionId);
    $('#alert-permit').remove();

    // ready
    this.joinRoom(organizationId, function(err, roomDescription) {
        console.log('joinRoom', err);
    });
}).denied(function(event) {
    var msg = 'カメラとマイクへのアクセスが許可されていません。<br/>許可した後、リロードしてください。';
    $('#alert-permit').empty().append($('<p/>').html(msg));
}).speaking(function(event) {
    $('#localVideo').addClass('speaking');
}).stoppedSpeaking(function(event) {
    $('#localVideo').removeClass('speaking');
}).addedPeer(function(peer) {
    Meetup.notify({
        title: peer.id + 'が会議に参加しました。'
    }).show();
    refreshList(this.members);
}).removedPeer(function(peer) {
    refreshList(this.members);
});
var webrtc = meetup.get();

function refreshList(members) {
    var el = $('#list-presence').empty();
    for (var id in members) {
        var member = members[id];

        $('<li/>').text(member.peer.id).appendTo(el);
    }
}

// ----------------------------
// DOM
// ----------------------------

$(function() {
    $('#room-name').text(organizationId);

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

    $('#enable-notify').click(function() {
        var self = $(this);
        Meetup.notify.request(function(status) {
                self.text(status);
            if (status === 'granted') {
            }
        });
    });

/*

Events :

webrtc.leaveRoom();

webrtc.createRoom('organizationId', function() {
});


webrtc.stopScreenShare();
webrtc.getLocalScreen();
webrtc.shareScreen(function(err, stream) {
});
webrtc.getRemoteVideoContainer();
webrtc.setVolumeForAll(volume);

webrtc.removePeers(function(roomId, roomType) {
});

*/
});

