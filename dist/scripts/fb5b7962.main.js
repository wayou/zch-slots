!function(){for(var a=0,b=["ms","moz","webkit","o"],c=0;c<b.length&&!window.requestAnimationFrame;++c)window.requestAnimationFrame=window[b[c]+"RequestAnimationFrame"],window.cancelAnimationFrame=window[b[c]+"CancelAnimationFrame"]||window[b[c]+"CancelRequestAnimationFrame"];window.requestAnimationFrame||(window.requestAnimationFrame=function(b){var c=(new Date).getTime(),d=Math.max(0,16-(c-a)),e=window.setTimeout(function(){b(c+d)},d);return a=c+d,e}),window.cancelAnimationFrame||(window.cancelAnimationFrame=function(a){clearTimeout(a)})}();var Slots=function(){this.WINDOW_WIDTH=window.innerWidth,this.WINDOW_HEIGHT=window.innerHeight,this.COLORS=["#FAFA17","#ff1493","#adff2f","#c617e8","#F1753F","#ffffff","#E9282F","#55BEED","#EA2830"],this.bodyImagesSize={width:640,height:377},this.spinImagesSize={width:96,height:96},this.itemSize={width:84,height:84},this.realBodyImageWidth=~~this.WINDOW_WIDTH,this.ratio=this.realBodyImageWidth/this.bodyImagesSize.width,this.canvas=$("#canvas")[0],this.ctx=this.canvas.getContext("2d"),this.realBodyImageHeight=~~(this.ratio*this.bodyImagesSize.height),this.$spinBtn=$("#spinBtn"),this.$mkBetBtn=$("#mkBet"),this.$betLineBtn=$("#betLine"),this.$totalBet=$("#totalBet"),this.GAME_STATUS=0,this.score=0,this.ITEM_CNT=10,this.user={usercode:0,username:"未知",nickname:"未知",playerId:0,userId:0,headimgurl:"images/default_avatar.jpg",wealth:0,today:0,user_info_ready:!1},this.items={icons:[],readyCnt:0},this.game={bet:1,lineCnt:1,betRate:1,firstWin:0},this.wheel=null,this.layout=[],this.linesInfo=[0,0,0,0,0,0,0,0,0],this.defaultPos=[],this.snds=[],this.LINES=9,this.BET_PER_LINE=1,this.MAX_BET=10,this.LOTERY_LINES=[[2,5,8,11,14],[1,4,7,10,13],[3,6,9,12,15],[1,5,9,11,13],[3,5,7,11,15],[1,4,8,12,15],[3,6,8,10,13],[2,6,8,10,14],[2,4,8,12,14]],this.holderImg=new Image,this.holderImg.src="images/holder.jpg"};Slots.prototype={init:function(){var a=this;$(".first-info,.round-result-info").hide(),this.wheel={top:~~(90*a.ratio),left:~~(85*a.ratio),width:~~(90*a.ratio),height:~~(240*a.ratio),gutter:~~(5*a.ratio),canvasWidth:~~(455*a.ratio),canvasHeight:~~(240*a.ratio),itemWidth:~~(a.itemSize.width*a.ratio),itemHeight:~~a.itemSize.height*a.ratio},this.defaultPos=function(){for(var b=0,c=0,d=[],e=0;15>e;e++)0!=e&&e%3==0&&(b+=a.wheel.gutter+a.wheel.width,c=0),d.push({x:b,y:c}),c+=a.wheel.itemHeight;return d}(),this.$spinBtn.find("img").css("width",~~(this.ratio*this.spinImagesSize.width)),this.initCanvas(a),this.loadResource(a),this.layout=this.getRandomLayout(a),this.getUserData(a),this.run(a),this.$spinBtn.on("tap click",function(){if(0==a.GAME_STATUS||3==a.GAME_STATUS){if(btnPlayer.setUrl("sounds/ui_Buttons.mp3").play(),a.user.wealth<a.game.bet*a.game.lineCnt)return void alert("金钱不够哦~明天再来吧");a.checkValidation(a)?(console.info("game start!"),ios&&backPlayer.setUrl("sounds/background.mp3").play(),a.spin(a)):console.log("game is running")}}),this.$mkBetBtn.on("click",function(){if(0==a.GAME_STATUS||3==a.GAME_STATUS){ios&&btnPlayer.setUrl("sounds/ui_Buttons.mp3").play();var b=$("#betPerLineCnt"),c=+b.text();(c+10)*+$("#linesCnt").text()<a.user.wealth&&b.text()<981&&(c+=10),b.text(c),a.game.bet=c,a.$totalBet.text(c*+$("#linesCnt").text())}}),this.$betLineBtn.on("click",function(){if(0==a.GAME_STATUS||3==a.GAME_STATUS){ios&&btnPlayer.setUrl("sounds/ui_Buttons.mp3").play();var b=$("#linesCnt"),c=+b.text();9>c&&(c+1)*+$("#betPerLineCnt").text()<a.user.wealth?c++:c=1,a.game.lineCnt=c,b.text(c),a.$totalBet.text(c*+$("#betPerLineCnt").text())}}),$("#help").on("tap click",function(){$.pgwModal({title:"倍率表",titleBar:!1,target:"#playtableContent"}),$.pgwModal("reposition")}),$("#rankBoard").on("click",function(){$.ajax({url:"http://54.223.143.253:18090/sgac/forwardList.action",data:{playerId:a.user.playerId,usercode:a.user.userId,mid:1020,gameId:90031,type:1,tType:1,roomId:1,msgid:2203},dataType:"json",success:function(a){var b=a,c=b.rankList.slice(0,10),d='<div class="rank-container"><table class="rank-table">';c.forEach(function(a,e){d+='<tr><td class="rank-cnt-col"> '+(+e+1)+' </td><td class="rank-user-col"> <span class="rank-nickname">'+(c[e].name.length>25?c[e].name.substr(0,22)+"...":c[e].name)+"</span> <br> <span>"+b.rankList[e].content+"</span> </td></tr>"}),d+='</table><div class="mine-rank"><span>我的排名：'+b.selfRank+"</span></div></div>",$.pgwModal({title:"排行榜",content:d})},error:function(){}})})},getRandomLayout:function(a){for(var b=[],c=14;c>=0;c--)b.push(~~(Math.random()*a.ITEM_CNT));return b},initCanvas:function(a){$("#canvas").attr({width:a.wheel.canvasWidth,height:a.wheel.canvasHeight}).css({top:a.wheel.top,left:a.wheel.left})},checkValidation:function(a){return 0!=a.GAME_STATUS&&3!=a.GAME_STATUS||!a.user.user_info_ready||a.items.readyCnt!=a.ITEM_CNT?!1:!0},loadResource:function(a){for(var b=a.ITEM_CNT-1;b>-1;b--)a.items.icons[b]=new Image,a.items.icons[b].onload=function(){a.items.readyCnt++,a.items.readyCnt==a.ITEM_CNT&&$("#loading-wrapper").css({display:"none"})},a.items.icons[b].src="images/items/"+b+".png"},getUserData:function(a){var b=a.getQueryString();a.user.userId=b.usercode||"20141016205157252083",$.ajax({url:"http://54.223.143.253:18090/sgac/transit.action",data:{action:"userinfo",usercode:a.user.userId},dataType:"json",success:function(b){a.user.username=b.username||"ohwWZjn0TEp-6OkN92gCDJYO6dVg",a.user.nickname=b.nikeName||"未知",a.user.headimgurl=b.headimgurl||"images/default_avatar.jpg",$("#nickname").text(a.user.nickname.length>5?a.user.nickname.substr(0,5)+"...":a.user.nickname),$("#avatar").attr("src",a.user.headimgurl),$.ajax({url:"http://54.223.143.253:18090/sgac/thirdPartyLogin.action",data:{userName:a.user.nickname,userId:a.user.userId,usercode:a.user.userId},dataType:"json",success:function(b){a.user.playerId=b.playerId,$.ajax({url:"http://54.223.143.253:18090/sgac/forwardList.action",data:{gameId:90031,usercode:a.user.userId,playerId:a.user.playerId,roomId:1,msgid:20050,mid:1020,type:1,name:a.user.nickname},dataType:"json",success:function(b){a.user.wealth=+b.tableInfo.info[0].chips,a.user.user_info_ready=!0,$("#wealth").text(a.user.wealth)},error:function(){alert("获取用户信息失败，请检查网络")}})},error:function(){alert("登入失败，请重试")}})},error:function(){alert("从中彩汇获取数据失败！")}})},getQueryString:function(){for(var a={},b=window.location.search.substring(1),c=b.split("&"),d=0;d<c.length;d++){var e=c[d].split("=");if("undefined"==typeof a[e[0]])a[e[0]]=e[1];else if("string"==typeof a[e[0]]){var f=[a[e[0]],e[1]];a[e[0]]=f}else a[e[0]].push(e[1])}return a},spin:function(a){a.GAME_STATUS=1,a.user.winBet=0,a.user.wealth=$("#wealth").text(),$("#winScore").text("$0"),$.ajax({url:"http://54.223.143.253:18090/sgac/forwardList.action",data:{name:a.user.nickname,usercode:a.user.userId,playerId:a.user.playerId,lines:$("#linesCnt").text(),betPerLine:$("#betPerLineCnt").text(),type:1,gameId:90031,roomId:1,msgid:20052,mid:1020},dataType:"json",success:function(b){1==b.firstWin&&(a.game.firstWin=1,$.ajax({url:"http://54.223.143.253:18090/sgac/transit.action",data:{action:"playresult",usercode:a.user.userId,gametime:0,coins:b.win,exp:0,gamename:"slots"},dataType:"json",success:function(a){$("#firstInfo").text("喜中彩金￥"+a.winnings)},error:function(){alert("与中彩汇通信失败，无法获取首次中奖的信息！")}})),setTimeout(function(){a.GAME_STATUS=2,a.user.winBet=b.win,a.user.wealth=b.chips,a.layout=b.wheelTable,a.linesInfo=b.linesInfo,console.log(a.linesInfo,a.layout),backPlayer.stop()},7e3)},error:function(){a.GAME_STATUS=2,a.user.winBet=0,alert("获取中奖结果出错，请检查网络")}})},run:function(a){function b(){c.width=c.width,1==a.GAME_STATUS?k>j&&j++:2==a.GAME_STATUS&&(i[0].y<a.defaultPos[0].y+2&&i[0].y>a.defaultPos[0].y-2?(a.user.winBet>0?(a.GAME_STATUS=3,$("#winScore").text("$"+a.user.winBet),1==a.game.firstWin?($(".first-info").show(),a.game.firstWin=0):$("#roundResultInfo1").show(),setTimeout(function(){$("#roundResultInfo1").hide(),$(".first-info").hide()},3e3),ios&&winPlayer.setUrl("sounds/slots_win_fruit_00.mp3").play()):($("#roundResultInfo2").show(),setTimeout(function(){$("#roundResultInfo2").hide()},3e3),a.GAME_STATUS=0),i=JSON.parse(JSON.stringify(a.defaultPos)),j=0,$("#wealth").text(a.user.wealth)):j>2&&j--),a.layout.forEach(function(a,b){i[b].y>e.height&&(i[b].y=-e.itemHeight),i[b].y+=j,d.drawImage(h[a]||new Image,i[b].x,i[b].y,f,g)}),3==a.GAME_STATUS&&a.linesInfo.forEach(function(b,c){b>0&&(d.beginPath(),d.lineWidth=5,d.fillStyle="#000",a.LOTERY_LINES[c].forEach(function(a,b){0==b?d.moveTo(i[a-1].x+f/2,i[a-1].y+g/2):d.lineTo(i[a-1].x+f/2+e.gutter,i[a-1].y+g/2)}),d.strokeStyle=a.COLORS[c],d.stroke())}),requestAnimationFrame(b)}var c=a.canvas,d=this.ctx,e=a.wheel,f=e.itemWidth,g=e.itemHeight,h=(e.width,a.items.icons),i=JSON.parse(JSON.stringify(a.defaultPos)),j=0,k=20;requestAnimationFrame(b)}};var winPlayer=new _mu.Player({baseDir:"sounds/",mode:"list",singleton:!1}),backPlayer=new _mu.Player({baseDir:"sounds/",mode:"list",singleton:!1}),btnPlayer=new _mu.Player({baseDir:"sounds/",mode:"list",singleton:!1});winPlayer.add("sounds/slots_win_fruit_00.mp3"),backPlayer.add("sounds/background.mp3"),btnPlayer.add("sounds/ui_Buttons.mp3");var ios=navigator.userAgent.indexOf("iPad")>0||navigator.userAgent.indexOf("iPhone")>0;$(function(){setTimeout(function(){$(".main-wrapper").height(window.innerHeight);var a=new Slots;a.init()},150)});