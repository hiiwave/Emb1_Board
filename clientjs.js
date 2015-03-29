$(document).ready(function() {
	function getTimeStr(time) {
		var now = new Date();
		var date = new Date(time);
		var res = '';
		if (now.getDate() == date.getDate()) {
			res += 'Today ';
		} else {
			res += (date.getMonth() + 1) + '\/' + date.getDate() + ' ';
		}
		res += date.getHours() + ':';
		if (date.getMinutes() < 10) {
			res += '0';
		}
		res += date.getMinutes();
		return res;
	}

	var prependNewMsg = function(packet) {
		var newTr = '<tr> \
			<td>' + packet._sender + '</td> \
			<td>' + packet._msg + '</td> \
			<td><span class="faceicon faceicon-sm ' + packet._face + '"></span></td> \
			<td>' + getTimeStr(packet._time) + '</td> \
			</tr>';
		$("#board tbody").prepend(newTr);
	};

	var postDataToServer = function(data) {
		var sendSuccess = function () {
			console.log('Got response of POST /push:' + this.responseText);
		};
		var xhr = new XMLHttpRequest();
		xhr.open('POST', 'http://127.0.0.1:1234/push');
		xhr.onload = sendSuccess;
		xhr.send(data);	
	};
      
	var comparePkt = function(pkt1, pkt2) {
		switch ($("#sortMethod").val()) {
			case "name" :
				return pkt1._sender > pkt2._sender;
				break;
			case "time" :
				var d1 = new Date(pkt1._time);
				var d2 = new Date(pkt2._time);
				return d1 < d2;
				break;
			default:
				console.error("No such sortMethod");
		}
	}

	var retrieveDataFromServer = function() {
		console.log("Retrieve!");
		var xhr = new XMLHttpRequest();
		xhr.open('POST', 'http://127.0.0.1:1234/retrieve');
		xhr.onload = function () {
			// console.log('Got response of HTTP POST /retrieve:' + this.responseText);
			$("#board tbody").html("");
			var pktAry = JSON.parse(this.responseText);
			for (var idx in pktAry) {
				pktAry[idx] = JSON.parse(pktAry[idx]);
			}
			pktAry.sort(comparePkt);
			for (var i = pktAry.length - 1; i >= 0; --i) {
				var aPacket = pktAry[i];	// var aPacket = JSON.parse(pktAry[i]);
				prependNewMsg(aPacket);
			}
		};
		xhr.send();
	};
	retrieveDataFromServer();
	$("#refresh").click(retrieveDataFromServer);

	var getFaceSelect = function() {
	var face = $("#face_dropdown-toggle .faceicon").attr('class').replace("faceicon faceicon-sm ", "");
		return face;
	}

	var sendMessage = function() {
		var sender = $("#msgSender").val();
		var msg = $("#msgBody").val();
		if (sender == "" || msg == "") {
			return;
		}
		$("#msgBody").val("");
		var date = new Date();
		// date.setDate(date.getDate() - 1);	// test only
		var time = date.toUTCString();
		var face = getFaceSelect(); // TODO: pack in packet
		var faceToogleBtn = $("#face_dropdown-toggle .faceicon");
		faceToogleBtn.attr('class', "faceicon faceicon-sm smile");
		console.log(sender + " is going to send \"" + msg + "\" with face: " + face);
		var packet = {
			_sender : sender,
			_msg : msg,
			_face : face,
			_time : time,
		}
		prependNewMsg(JSON.parse(JSON.stringify(packet)));
		postDataToServer(JSON.stringify(packet));
	};
	$("#btnSend").click(sendMessage);
	$(document).keypress(function (e) {
    	if ($("#msgBody").is(":focus") && (e.which == 13)) {
    	    sendMessage();
	    }
	});

	$("#sort_name").click(function() {
		console.log("Sort by name");
		$("#sortMethod").val("name");
		retrieveDataFromServer();
	});
	$("#sort_time").click(function() {
		console.log("Sort by time");
		$("#sortMethod").val("time");
		retrieveDataFromServer();
	});

	// change faceicon
	$("#face_dropdown li a").click(function() {
		// console.log("Click: " + $(this).eq(0).html());
		var newClass = $(this).children().eq(0).attr('class');
		newClass = newClass.replace("faceicon ", '');
		console.log("Will append newClass: " + newClass);
		var toogleBtn = $("#face_dropdown-toggle .faceicon");
		toogleBtn.attr('class', "faceicon faceicon-sm");
		toogleBtn.addClass(newClass);
		console.log("Select Face: " + getFaceSelect()) ;
	});
});
	
	


