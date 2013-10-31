// ----------------------------
// Libs
// ----------------------------
var roomName = 'esperia'; // TODO
var webrtc = new SimpleWebRTC({
    // the id/element dom element that will hold "our" video
    localVideoEl: 'localVideo',
    // the id/element dom element that will hold remote videos
    remoteVideosEl: 'remoteVideos',
    // immediately ask for camera access
    autoRequestMedia: true,
    debug: true,
    url: 'http://localhost:8888',
//    url: 'http://signaling.simplewebrtc.com:8888',
//    enableDataChannels: true,
//    autoRemoveVideos: true,
//    adjustPeerVolume: true,
//    peerVolumeWhenSpeaking: 0.25

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
webrtc.stopLocalVideo();
webrtc.startLocalVideo();
webrtc.setVolumeForAll(volume);
webrtc.setVolumeForAll(volume);

webrtc.mute();
webrtc.unmute();
webrtc.pause();
webrtc.resume();

webrtc.removePeers(function(roomId, roomType) {
});

*/

// we have to wait until it's ready
webrtc.on('readyToCall', function (err, roomDescription) {
    // you can name it anything
    webrtc.joinRoom(roomName, function(err, roomDescription) {
	});
});

// ----------------------------
// DOM
// ----------------------------
$(function() {
    $('#btn-roomin').click(function(e) {
    });
    $('#room-name').text(roomName);
    $('#list-attendances').click(function(e) {
    });
});
