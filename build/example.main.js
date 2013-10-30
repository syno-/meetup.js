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

// we have to wait until it's ready
webrtc.on('readyToCall', function () {
    // you can name it anything
    webrtc.joinRoom(roomName);
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
