var socket = io('http://localhost:3000');

socket.on('connect', function(data){
    console.log('qq');
});

socket.on('hit', function(hit) {
    console.log(hit);
});
