!function(){for(var a=0,b=["ms","moz","webkit","o"],c=0;c<b.length&&!window.requestAnimationFrame;++c)window.requestAnimationFrame=window[b[c]+"RequestAnimationFrame"],window.cancelAnimationFrame=window[b[c]+"CancelAnimationFrame"]||window[b[c]+"CancelRequestAnimationFrame"];window.requestAnimationFrame||(window.requestAnimationFrame=function(b){var c=(new Date).getTime(),d=Math.max(0,16-(c-a)),e=window.setTimeout(function(){b(c+d)},d);return a=c+d,e}),window.cancelAnimationFrame||(window.cancelAnimationFrame=function(a){clearTimeout(a)})}();var Slots=function(){this.WINDOW_WIDTH=window.innerWidth,this.WINDOW_HEIGHT=window.innerHeight,this.bodyImagesSize={width:640,height:377},this.spinImagesSize={width:96,height:96},this.itemSize={width:84,height:84},this.realBodyImageWidth=~~this.WINDOW_WIDTH,this.ratio=this.realBodyImageWidth/this.bodyImagesSize.width,this.canvas=$("#canvas")[0],this.ctx=this.canvas.getContext("2d"),this.realBodyImageHeight=~~(this.ratio*this.bodyImagesSize.height),this.$spinBtn=$("#spinBtn"),this.$mkBetBtn=$("#mkBet"),this.$betLineBtn=$("#betLine"),this.$totalBet=$("#totalBet"),this.GAME_STATUS=0,this.score=0,this.ITEM_CNT=10,this.user={uid:0,user_name:"未知",avatar:"images/default_avatar.jpg",wealth:0,user_info_ready:!1},this.items={icons:[],readyCnt:0},this.game={bet:1,lineCnt:1,betRate:1},this.wheel=null,this.layout=[],this.linesInfo=[0,0,0,0,0,0,0,0,0],this.defaultPos=[],this.snds=[],this.LINES=9,this.BET_PER_LINE=1,this.MAX_BET=10,this.LOTERY_LINES=[[2,5,8,11,14],[1,4,7,10,13],[3,6,9,12,15],[1,5,9,11,13],[3,5,7,11,15],[1,4,8,12,15],[3,6,8,10,13],[2,6,8,10,14],[2,4,8,12,14]]};Slots.prototype={init:function(){var a=this;this.wheel={top:~~(90*a.ratio),left:~~(85*a.ratio),width:~~(90*a.ratio),height:~~(240*a.ratio),gutter:~~(5*a.ratio),canvasWidth:~~(455*a.ratio),canvasHeight:~~(240*a.ratio),itemWidth:~~(a.itemSize.width*a.ratio),itemHeight:~~a.itemSize.height*a.ratio},this.defaultPos=function(){for(var b=0,c=0,d=[],e=0;15>e;e++)0!=e&&e%3==0&&(b+=a.wheel.gutter+a.wheel.width,c=0),d.push({x:b,y:c}),c+=a.wheel.itemHeight;return d}(),this.$spinBtn.find("img").css("width",~~(this.ratio*this.spinImagesSize.width)),this.initCanvas(a),this.loadResource(a),this.layout=this.getRandomLayout(a),this.getUserData(a),this.run(a),this.$spinBtn.on("tap click",function(){try{SlotsSnds.btn.currentTime=0,SlotsSnds.btn.play()}catch(b){}if(a.checkValidation(a)){console.info("game start!");try{SlotsSnds.btn.currentTime=0,SlotsSnds.btn.play(),SlotsSnds.background.currentTime=0,SlotsSnds.background.play()}catch(b){}a.spin(a)}else console.log("game is running")}),this.$mkBetBtn.on("tap click",function(){var b=$("#betPerLineCnt"),c=+b.text();c<a.MAX_BET?c++:c=1,b.text(c),a.game.bet=c,a.$totalBet.text(c*+$("#linesCnt").text())}),this.$betLineBtn.on("tap click",function(){var b=$("#linesCnt"),c=+b.text();9>c?c++:c=1,a.game.lineCnt=c,b.text(c),a.$totalBet.text(c*+$("#betPerLineCnt").text())})},getRandomLayout:function(a){for(var b=[],c=14;c>=0;c--)b.push(~~(Math.random()*a.ITEM_CNT+1));return b},initCanvas:function(a){$("#canvas").attr({width:a.wheel.canvasWidth,height:a.wheel.canvasHeight}).css({top:a.wheel.top,left:a.wheel.left})},checkValidation:function(a){return 0==a.GAME_STATUS&&a.user.user_info_ready&&a.user.wealth>=a.game.bet*a.game.lineCnt&&a.items.readyCnt==a.ITEM_CNT?!0:!1},loadResource:function(a){for(var b=a.ITEM_CNT;b>0;b--)a.items.icons[b]=new Image,a.items.icons[b].onload=function(){a.items.readyCnt++,a.items.readyCnt==a.ITEM_CNT&&$("#loading-wrapper").css({display:"none"})},a.items.icons[b].src="images/items/"+b+".png"},getUserData:function(a){var b=a.getQueryString();a.user.uid=b.uid||1009,a.user.nick_name=b.nick_name||"Atom",a.user.avatar=b.avatar||"images/sample_avatar.jpg",a.user.wealth=1e4,a.user.user_info_ready=!0},getQueryString:function(){for(var a={},b=window.location.search.substring(1),c=b.split("&"),d=0;d<c.length;d++){var e=c[d].split("=");if("undefined"==typeof a[e[0]])a[e[0]]=e[1];else if("string"==typeof a[e[0]]){var f=[a[e[0]],e[1]];a[e[0]]=f}else a[e[0]].push(e[1])}return a},spin:function(a){a.GAME_STATUS=1,setTimeout(function(){a.GAME_STATUS=2,a.layout=a.getRandomLayout(a),a.linesInfo=[3,3,3,0,0,0,0,0,0]},8e3)},run:function(a){function b(){if(c.width=c.width,1==a.GAME_STATUS)for(var l=0;5>l;l++)j[l]<k&&(0==l?j[l]+=.5:j[l-1]>10&&(j[l]+=.5));else if(2==a.GAME_STATUS)for(var l=0;5>l;l++)if(i[3*l].y<a.defaultPos[3*l].y+1&&i[3*l].y>a.defaultPos[3*l].y-1){if(j[l]=0,i[3*l+0]=JSON.parse(JSON.stringify(a.defaultPos[3*l+0])),i[3*l+1]=JSON.parse(JSON.stringify(a.defaultPos[3*l+1])),i[3*l+2]=JSON.parse(JSON.stringify(a.defaultPos[3*l+2])),0==j[4]){a.GAME_STATUS=0;try{SlotsSnds.win.currentTime=0,SlotsSnds.win.play()}catch(m){}}}else j[l]>.5&&(0==l?j[l]-=.1:(j[l-1]<.5||.5==j[l-1])&&(j[l]-=.1));a.layout.forEach(function(a,b){i[b].y>e.height&&(i[b].y=-e.itemHeight),i[b].y+=j[~~(b/3)],d.drawImage(h[a]||new Image,i[b].x,i[b].y,f,g)}),requestAnimationFrame(b)}var c=a.canvas,d=this.ctx,e=a.wheel,f=e.itemWidth,g=e.itemHeight,h=(e.width,a.items.icons),i=JSON.parse(JSON.stringify(a.defaultPos)),j=[0,0,0,0,0],k=20;requestAnimationFrame(b)}};var SlotsSnds={win:new Audio("sounds/slots_win_fruit_00.mp3"),background:new Audio("sounds/background.mp3"),btn:new Audio("sounds/ui_Buttons.mp3")};$(function(){var a=new Slots;a.init()});