$(document).ready(function() {
	var prependNewMsg = function(packet) {
		var newTr = '<tr>  \
		      <td>' + packet._sender + '</td>  \
		      <td>' + packet._msg + '</td>     \
		      <td>' + packet._time + '</td>    \
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

	var retrieveDataFromServer = function() {
		console.log("Retrieve!");
		var xhr = new XMLHttpRequest();
		xhr.open('POST', 'http://127.0.0.1:1234/retrieve');
		xhr.onload = function () {
			console.log('Got response of HTTP POST /retrieve:' + this.responseText);
			$("#board tbody").html("");
			var pktAry = JSON.parse(this.responseText);
			for (var i = 0, len = pktAry.length; i < len; i += 1) {
				var aPacket = pktAry[i];
				$("#maxMsgIdField").val(packet._msgId);
				prependNewMsg(aPacket);

			}
		};
		xhr.send();
	};
	$("#refresh").click(retrieveDataFromServer);

	var sendMessage = function() {
		var sender = $("#msgSender").val();
		var msg = $("#msgBody").val();
		if (sender == "" || msg == "") {
			return;
		}
		$("#msgBody").val("");
		var time = "...";  // TODO: get current time
		console.log(sender + " is going to send \"" + msg + "\"");
		var packet = {
			_sender : sender,
			_msg : msg,
			_time : time,
		}
		prependNewMsg(packet);
		postDataToServer(JSON.stringify(packet));
	}
	$("#btnSend").click(sendMessage);
	$(document).keypress(function (e) {
    	if ($("#msgBody").is(":focus") && (e.which == 13)) {
    	    sendMessage();
	    }
	});

	var sortMsg = function(method) {
		if (method == "name") {
			console.log("Sort by name");
			// TODO: sort by name
		} else {  
			console.log("Sort by time");
			// TODO: sort by time 
		}
		$("#sortMethod").val(method);
	}
	var checkBeforeSort = function(method) {
		if ($("#sortMethod").val() == method) {
			console.log("Has been sorted!")
		} else {
			sortMsg(method);
		}
	};
	$("#sort_name").click(function() {
		checkBeforeSort("name");
	});
	$("#sort_time").click(function() {
		checkBeforeSort("time");
	});

	// change faceicon
	$("#face_dropdown li a").click(function(){
		console.log("Click: " + $(this).eq(0).html());
		var newClass = $(this).children().eq(0).attr('class');
		console.log("Will append newClass: " + newClass);
		
		var tmp = $("#face_dropdown-toggle .faceicon").removeClass();	
		tmp.addClass(newClass);
		tmp.addClass("faceicon-sm");
    });
});
	
	


