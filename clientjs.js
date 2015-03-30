$(document).ready(function() {
    var Board = {
        init : function() {
            this.setupVar();
            this.setupUi();
            this.bindEvents();
            this.message.retrieve();
        },
        helper : {
            getTimeStr : function(time) {
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
            },
            comparePkt : function(pkt1, pkt2) {
                switch (Board.sortMethod) {
                // switch ($("#sortMethod").val()) {
                    case "sort_name" :
                        console.log(pkt1._sender + " > " + pkt2._sender);
                        // return pkt1._sender > pkt2._sender;
                        return pkt1._sender.localeCompare(pkt2._sender);
                        break;
                    case "sort_msg" :
                        console.log(pkt1._msg + " > " + pkt2._msg);
                        return pkt1._msg.localeCompare(pkt2._msg);
                        break;
                    case "sort_time" :
                        var d1 = new Date(pkt1._time);
                        var d2 = new Date(pkt2._time);
                        console.log(pkt1._time + " < " + pkt2._time);
                        return d2 - d1;
                        break;
                    default:
                        console.error("No such sortMethod: " + Board.sortMethod);
                }
            },
            getFaceSelect : function() {
                var face = $("#face_dropdown-toggle .faceicon").attr('class').replace("faceicon faceicon-sm ", "");
                return face;
            }
        },
        message : {
            prependNew : function(packet) {
                var newTr = '<tr> \
                    <td>' + packet._sender + '</td> \
                    <td>' + packet._msg + '</td> \
                    <td><span class="faceicon faceicon-sm ' + packet._face + '"></span></td> \
                    <td>' + Board.helper.getTimeStr(packet._time) + '</td> \
                    </tr>';
                $("#board tbody").prepend(newTr);
            },
            send : function() {
                var sender = $("#msgSender").val();
                var msg = $("#msgBody").val();
                if (sender == "" || msg == "") {
                    return;
                }
                $("#msgBody").val("");
                var date = new Date();
                // date.setDate(date.getDate() - 1);    // test only
                var time = date.toUTCString();
                var face = Board.helper.getFaceSelect();
                var faceToogleBtn = $("#face_dropdown-toggle .faceicon");
                faceToogleBtn.attr('class', "faceicon faceicon-sm smile");
                console.log(sender + " is going to send \"" + msg + "\" with face: " + face);
                var packet = {
                    _sender : sender,
                    _msg : msg,
                    _face : face,
                    _time : time,
                }
                Board.message.prependNew(JSON.parse(JSON.stringify(packet)));
                Board.message.post(JSON.stringify(packet));
            },
            post : function(data) {
                var sendSuccess = function () {
                    console.log('Got response of POST /push:' + this.responseText);
                };
                var xhr = new XMLHttpRequest();
                xhr.open('POST', 'http://127.0.0.1:1234/push');
                xhr.onload = sendSuccess;
                xhr.send(data); 
            },
            retrieve : function() {
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
                    pktAry.sort(Board.helper.comparePkt);
                    for (var i = pktAry.length - 1; i >= 0; --i) {
                        var aPacket = pktAry[i];    // var aPacket = JSON.parse(pktAry[i]);
                        Board.message.prependNew(aPacket);
                    }
                };
                xhr.send();
            }
        },
        setupVar : function() {
            this.sortMethod = "sort_time";
        },
        setupUi : function() {
            $("#face_dropdown li a").click(function() {
                var newClass = $(this).children().eq(0).attr('class');
                newClass = newClass.replace("faceicon ", '');
                console.log("Will append newClass: " + newClass);
                var toogleBtn = $("#face_dropdown-toggle .faceicon");
                toogleBtn.attr('class', "faceicon faceicon-sm");
                toogleBtn.addClass(newClass);
                console.log("Select Face: " + Board.helper.getFaceSelect()) ;
            });
        },
        bindEvents : function() {
            $("#refresh").click(Board.message.retrieve);
            $("#btnSend").click(Board.message.send);
            $(document).keypress(function (e) {
                if ($("#msgBody").is(":focus") && (e.which == 13)) { // ENTER
                    Board.message.send();
                }
            });

            var sortClicked = function() {
                var sort_method_id = $(this).attr('id');
                console.log("Sort by " + sort_method_id);
                Board.sortMethod = sort_method_id;
                Board.message.retrieve();
            };
            $("#sort_name").click(sortClicked);
            $("#sort_msg").click(sortClicked);
            $("#sort_time").click(sortClicked);
        }
    };
    Board.init();    
});
    
    


