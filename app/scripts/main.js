/**
 *中彩汇slots machine
 *
 *note:
 *machine body image sie:640*377
 *image padding left 25px
 *wheel start (85,90) from left top
 *wheel width 90px
 *wheel gutter 5px
 *wheel height 240px
 *wheelCanvasWidth 540-85=455
 **/

//display the splash screen
//to be remove
// $('#loading-wrapper').height(window.innerHeight);

//the following is a polyfill of the requestAnimationFrame I copied from Paul Irish's gist

// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel

// MIT license

(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() {
                    callback(currTime + timeToCall);
                },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }

    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
    }

}());

//the main slot class
var Slots = function() {
    this.WINDOW_WIDTH = window.innerWidth;
    this.WINDOW_HEIGHT = window.innerHeight;
    this.bodyImagesSize = {
        width: 640,
        height: 377
    };
    this.spinImagesSize = {
        width: 96,
        height: 96
    };
    this.itemSize = {
        width: 84,
        height: 84
    };
    this.realBodyImageWidth = ~~this.WINDOW_WIDTH;
    this.ratio = this.realBodyImageWidth / this.bodyImagesSize.width; //the ratio of the image on the screen relative to the orignal image size
    this.canvas = $('#canvas')[0];
    this.ctx = this.canvas.getContext('2d');
    this.realBodyImageHeight = ~~ (this.ratio * this.bodyImagesSize.height);
    this.$spinBtn = $('#spinBtn');
    this.$mkBetBtn = $('#mkBet');
    this.$betLineBtn = $('#betLine');
    this.$totalBet = $('#totalBet');
    this.GAME_STATUS = 0; // 0 stopped, 1 running, 2 result loaded,3 animateion stopped
    this.score = 0;
    this.ITEM_CNT = 10; //how many icons in this game
    this.user = {
        usercode: 0,
        username: '未知',
        nikeName: '未知',
        headimgurl: 'images/default_avatar.jpg',
        wealth: 0,
        today: 0,
        user_info_ready: false
    };
    this.items = {
        icons: [], //store all icons into this array
        readyCnt: 0 //how many icons are loaded
    };
    this.game = {
        bet: 1, //1000 per line
        lineCnt: 1,
        betRate: 1
    };
    this.wheel = null;
    this.layout = []; // 15items each rank from 1~10, and item 0~2 represent the first column
    this.linesInfo = [0, 0, 0, 0, 0, 0, 0, 0, 0]; // the result for each line
    this.defaultPos = []; //the default position for each icon on the canvas
    this.snds = [];
    this.LINES = 9; //9 lines slots machine
    this.BET_PER_LINE = 1;
    this.MAX_BET = 10;
    this.LOTERY_LINES = [
        [2, 5, 8, 11, 14], //line 1
        [1, 4, 7, 10, 13], //line 2
        [3, 6, 9, 12, 15], //line 3
        [1, 5, 9, 11, 13], //line 4
        [3, 5, 7, 11, 15], //line 5
        [1, 4, 8, 12, 15], //line 6
        [3, 6, 8, 10, 13], //line 7
        [2, 6, 8, 10, 14], //line 8
        [2, 4, 8, 12, 14] //line 9
    ];
    this.holderImg = new Image();
    this.holderImg.src = 'images/holder.jpg';
};

Slots.prototype = {
    //initialize all stuff
    init: function() {
        var that = this;

        // initilaixe the wheel
        this.wheel = {
            top: ~~(90 * that.ratio),
            left: ~~(85 * that.ratio),
            width: ~~(90 * that.ratio),
            height: ~~(240 * that.ratio),
            gutter: ~~(5 * that.ratio),
            canvasWidth: ~~(455 * that.ratio),
            canvasHeight: ~~(240 * that.ratio),
            itemWidth: ~~(that.itemSize.width * that.ratio),
            itemHeight: (~~that.itemSize.height * that.ratio)
        };
        //initialize the default position, this will be updated when spin clicked to generate the animation
        this.defaultPos = (function() {
            var x = 0,
                y = 0,
                pos = [];
            for (var i = 0; i < 15; i++) {
                //we get 3 items per col
                if ((i != 0) && (i % 3 == 0)) {
                    x += that.wheel.gutter + that.wheel.width;
                    y = 0;
                }
                pos.push({
                    x: x,
                    y: y
                });
                y += that.wheel.itemHeight;
            }
            return pos;
        })();

        //position the spin button
        this.$spinBtn.find('img').css('width', ~~ (this.ratio * this.spinImagesSize.width));

        //initialize the canvas
        this.initCanvas(that);

        //load icons & sounds
        this.loadResource(that);

        //generate a random layout for icons
        this.layout = this.getRandomLayout(that);

        //load user data
        this.getUserData(that);

        //draw default layout
        this.run(that);

        // listen the spin button 
        this.$spinBtn.on('tap click', function() {
            try {
                //play the button sound
                SlotsSnds.btn.currentTime = 0;
                SlotsSnds.btn.play();
            } catch (err) {};

            if (that.user.wealth < (that.game.bet * that.game.lineCnt)) {
                alert('金钱不够哦~');
                return;
            }

            if (that.checkValidation(that)) {
                //here we go 
                console.info('game start!');
                try {
                    //play the button sound
                    SlotsSnds.btn.currentTime = 0;
                    SlotsSnds.btn.play();
                    //play the background sound
                    SlotsSnds.background.currentTime = 0;
                    SlotsSnds.background.play();
                } catch (err) {};
                that.spin(that);
            } else {
                console.log('game is running');
            }
        });
        this.$mkBetBtn.on('tap click', function() {
            var $cntHolder = $('#betPerLineCnt'),
                originalCnt = +$cntHolder.text();
            if (originalCnt < that.MAX_BET && ((originalCnt + 1) * (+$('#linesCnt').text()) < that.user.wealth)) {
                originalCnt++;
            } else {
                originalCnt = 1;
            }
            $cntHolder.text(originalCnt);
            that.game.bet = originalCnt;
            that.$totalBet.text(originalCnt * (+$('#linesCnt').text()));
            $('#wealth').text(that.user.wealth - originalCnt * (+$('#linesCnt').text()));
        });
        this.$betLineBtn.on('tap click', function() {
            var $cntHolder = $('#linesCnt'),
                originalCnt = +$cntHolder.text();
            if (originalCnt < 9 && ((originalCnt + 1) * (+$('#betPerLineCnt').text()) < that.user.wealth)) {
                originalCnt++;
            } else {
                originalCnt = 1;
            }
            that.game.lineCnt = originalCnt;
            $cntHolder.text(originalCnt);
            that.$totalBet.text(originalCnt * (+$('#betPerLineCnt').text()));
            $('#wealth').text(that.user.wealth - originalCnt * (+$('#betPerLineCnt').text()));
        });

        //play sound when button clicked
        $('.slots-btn').on('click', function() {
            try {
                //play the button sound
                SlotsSnds.btn.currentTime = 0;
                SlotsSnds.btn.play();
            } catch (err) {};
        });

        $('#help').on('click', function() {
            $.pgwModal({
                title: '倍率表',
                titleBar: false,
                target: '#playtableContent'
            });
            $.pgwModal('reposition');
        });

        //排行榜
        $('#rankBoard').on('click', function() {
            // $.ajax({
            //     url: '/path/to/get/rank/data',
            //     data: {
            //         uid: 0
            //     },
            //     dataType: 'json',
            //     success: function(res) {
            //         //获取数据成功，显示排行榜
            //         var rankContent = '<div class="rank-container"><table class="rank-table">'
            //         rankData.rankList.forEach(function(v, i, a) {
            //             rankContent += '<tr>' +
            //                 '<td class="rank-cnt-col"> ' + i + ' </td>' +
            //                 '<td class="rank-avatar-col"> <img src="images/default_avatar.jpg" alt="" class="rank-avatar"> </td>' +
            //                 '<td class="rank-user-col"> <span class="rank-nickname">' + rankData.rankList[i].name + '</span> <br> <span>$999</span> </td>' +
            //                 '<td class="rank-trend-col">' +
            //                 '<img src="../images/rank_equal.png" alt="">' +
            //                 '</td>' +
            //                 '</tr>';
            //         });
            //         rankContent += '</table><div class="mine-rank"><span>我的排名：' + rankData.selfRank + '</span></div></div>';
            //         $.pgwModal({
            //             title: '排行榜',
            //             content: rankContent
            //         });
            //     },
            //     error: function(data) {
            //         alert("获取排行榜数据失败！");
            //     }
            // });


            //lock
            rankData = {
                selfRank: 2,
                rankList: [{
                    name: 'tom',
                    playerId: 1,
                    rank: 1
                }, {
                    name: 'tom2',
                    playerId: 2,
                    rank: 2
                }, {
                    name: 'tom3',
                    playerId: 3,
                    rank: 3
                }, {
                    name: 'tom4',
                    playerId: 4,
                    rank: 4
                }, {
                    name: 'tom5',
                    playerId: 5,
                    rank: 5
                }, {
                    name: 'tom6',
                    playerId: 6,
                    rank: 6
                }, {
                    name: 'tom7',
                    playerId: 7,
                    rank: 7
                }, {
                    name: 'tom8',
                    playerId: 8,
                    rank: 8
                }, {
                    name: 'tom9',
                    playerId: 9,
                    rank: 9
                }, {
                    name: 'tom10',
                    playerId: 10,
                    rank: 0
                }]
            };
            var rankContent = '<div class="rank-container"><table class="rank-table">'
            rankData.rankList.forEach(function(v, i, a) {
                rankContent += '<tr>' +
                    '<td class="rank-cnt-col"> ' + (i + 1) + ' </td>' +
                    '<td class="rank-avatar-col"> <img src="images/default_avatar.jpg" alt="" class="rank-avatar"> </td>' +
                    '<td class="rank-user-col"> <span class="rank-nickname">' + rankData.rankList[i].name + '</span> <br> <span>$999</span> </td>' +
                    '<td class="rank-trend-col">' +
                    '<img src="images/rank_equal.png" alt="">' +
                    '</td>' +
                    '</tr>';
            });
            rankContent += '</table><div class="mine-rank"><span>我的排名：' + rankData.selfRank + '</span></div></div>';
            $.pgwModal({
                title: '排行榜',
                content: rankContent
            });

        });
    },
    getRandomLayout: function(entry) {
        var layout = [];
        for (var i = 14; i >= 0; i--) {
            layout.push(~~(Math.random() * (entry.ITEM_CNT) + 1));
        };
        return layout;
    },
    initCanvas: function(entry) {
        $("#canvas").attr({
            width: entry.wheel.canvasWidth,
            height: entry.wheel.canvasHeight
        }).css({
            top: entry.wheel.top,
            left: entry.wheel.left
        });

    },
    checkValidation: function(entry) {
        if ((entry.GAME_STATUS == 0 || entry.GAME_STATUS == 3) /*the game is ready to start*/ && entry.user.user_info_ready /*user data is ready so we know if the user has enough wealth to start the game*/ && entry.items.readyCnt == entry.ITEM_CNT /*all 15 icons are loaded*/ ) {
            //here we go 
            return true;
        } else {
            return false;
        }
    },
    loadResource: function(entry) {
        for (var i = entry.ITEM_CNT; i > 0; i--) {
            entry.items.icons[i] = new Image();
            entry.items.icons[i].onload = function() {
                entry.items.readyCnt++;
                if (entry.items.readyCnt == entry.ITEM_CNT) {
                    //all images are ready, show the UI
                    $('#loading-wrapper').css({
                        display: 'none'
                    });
                }
            };
            entry.items.icons[i].src = 'images/items/' + i + '.png';
        }
    },
    getUserData: function(entry) {

        //get user info from URL
        var params = entry.getQueryString();

        //when this works remove the default values 
        entry.user.usercode = params.usercode || 1009;
        entry.user.username = params.nick_name || 'Atom';
        entry.user.nikeName = params.nick_name || 'Atom';
        entry.user.headimgurl = params.avatar || 'images/default_avatar.jpg';

        //show the avatar and nickname to the page
        $('#nickname').text(entry.user.nikeName);
        $('#avatar').attr('src', entry.user.headimgurl);

        //get inital wealth info from server
        // unlock
        // $.ajax({
        //     url: 'url to get initail wealth',
        //     data {
        //         usercode: entry.user.usercode
        //     },
        //     success: function(res) {
        //         //set the user info
        //         entry.user.wealth = data.wealth;
        //         entry.user.user_info_ready = true;

        //         $('#wealth').text(entry.user.wealth);
        //     },
        //     error: function(err) {
        //         alert('获取用户信息失败，请检查网络');
        //     }
        // });

        //lock
        entry.user.wealth = 100;
        $('#wealth').text(entry.user.wealth);
        entry.user.user_info_ready = true;
    },
    getQueryString: function() {
        //helper function to get query parameters from url
        //refernce:http://stackoverflow.com/questions/979975/how-to-get-the-value-from-url-parameter
        var query_string = {};
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split("=");
            // If first entry with this name
            if (typeof query_string[pair[0]] === "undefined") {
                query_string[pair[0]] = pair[1];
                // If second entry with this name
            } else if (typeof query_string[pair[0]] === "string") {
                var arr = [query_string[pair[0]], pair[1]];
                query_string[pair[0]] = arr;
                // If third or later entry with this name
            } else {
                query_string[pair[0]].push(pair[1]);
            }
        }
        return query_string;
    },
    spin: function(entry) {
        //here we send request and update the data
        entry.GAME_STATUS = 1;
        //reset the winbet
        entry.user.winBet = 0;
        entry.user.wealth = $('#wealth').text();
        $('#winScore').text('$0');

        //unlock
        //send the bet info the server and start the animation while waiting the result from the server
        // $.ajax({
        //     url: 'spin',
        //     data: {
        //         playerId: entry.user.usercode,
        //         betPerLine: 1000,
        //         lineCnt: 1,
        //         chips:11,//剩余筹码
        //         lines: $('#totalBet').text()
        //     },
        //     dataType: 'json',
        //     success: function(res) {
        //         setTimeout(function() {
        //             entry.GAME_STATUS = 2;
        //             entry.user.today = res.today; //本日总获得赢得筹码数
        //             entry.user.winBet = res.winBet; //产出筹码数量
        //             entry.layout = res.wheelTable; //中奖数据
        //             entry.linesInfo = res.linesInfo; //每条线中奖情况
        //         }, 7000);
        //     },
        //     error: function(err) {
        //         alert('获取中奖结果出错，请检查网络');
        //     }
        // });

        //lock, mock layout data
        setTimeout(function() {
            entry.GAME_STATUS = 2;
            entry.user.today = Math.random() * 10 + 1;
            entry.user.winBet = 4;
            // entry.layout = [4, 2, 3, 1, 2, 3, 10, 2, 5, 1, 10, 3, 1, 2, 3]; //mock the final result
            entry.layout = entry.getRandomLayout(entry);
            entry.linesInfo = [0, 0, 0, 0, 1, 0, 0, 0, 1];
        }, 9000);
    },
    run: function(entry) {
        // , this.canvas, this.ctx, this.layout, this.wheel, that.items.icons
        //sart the game
        var canvas = entry.canvas,
            ctx = this.ctx,
            wheel = entry.wheel,
            itemWidth = wheel.itemWidth,
            itemHeight = wheel.itemHeight,
            colWidth = wheel.width,
            x = 0,
            y = 0,
            icons = entry.items.icons,
            //duplicate the default positons
            pos = JSON.parse(JSON.stringify(entry.defaultPos)),
            // speed = [0, 0, 0, 0, 0], //with accelerate
            speed = 0, //without accelerate
            MAX_SPEED = 20,
            bonusPos = [];

        function refresh() {
            canvas.width = canvas.width;

            //stataus=1 spin up,status=2 spin down,status=0 to stop the animation, 3 the animation stopped and got bonus
            //this is the accelerate version
            // if (entry.GAME_STATUS == 1) {
            //     bonusPos = [];
            //     //spin up
            //     for (var i = 0; i < 5; i++) {
            //         //make the column speed up one by one
            //         if (speed[i] < MAX_SPEED) {
            //             if (i == 0) {
            //                 speed[i] += 0.5;
            //             } else {
            //                 if (speed[i - 1] > 10) {
            //                     speed[i] += 0.5;
            //                 }
            //             }
            //         }
            //     };

            // } else if (entry.GAME_STATUS == 2) {

            //     for (var i = 0; i < 5; i++) {

            //         if (pos[i * 3].y < (entry.defaultPos[i * 3].y + 1) && pos[i * 3].y > (entry.defaultPos[i * 3].y - 1)) {

            //             //the first icon is in position
            //             speed[i] = 0;
            //             pos[i * 3 + 0] = JSON.parse(JSON.stringify(entry.defaultPos[i * 3 + 0]));
            //             pos[i * 3 + 1] = JSON.parse(JSON.stringify(entry.defaultPos[i * 3 + 1]));
            //             pos[i * 3 + 2] = JSON.parse(JSON.stringify(entry.defaultPos[i * 3 + 2]));
            //             if (speed[4] == 0) {
            //                 //end the round
            //                 // judge if won this round
            //                 if (entry.user.winBet > 0) {
            //                     //if win, draw the lines out
            //                     entry.GAME_STATUS = 3;
            //                     $('#winScore').text('$' + entry.user.winBet);

            //                 } else {
            //                     //else end the round
            //                     entry.GAME_STATUS = 0;
            //                 }
            //                 try {
            //                     //play the button sound
            //                     SlotsSnds.win.currentTime = 0;
            //                     SlotsSnds.win.play();
            //                 } catch (err) {};
            //             }

            //         } else {
            //             //slow down one by one
            //             if (speed[i] > 0.5) {
            //                 // speed[i] -= 0.1;
            //                 if (i == 0) {
            //                     speed[i] -= 0.1;
            //                 } else {
            //                     if (speed[i - 1] < 0.5 || speed[i - 1] == 0.5) {
            //                         speed[i] -= 0.1;
            //                     }
            //                 }
            //             }
            //         }
            //     };

            // }

            //without accelerate
            if (entry.GAME_STATUS == 1) {
                if (speed < MAX_SPEED) {
                    speed++;
                };
            } else if (entry.GAME_STATUS == 2) {
                if ((pos[0].y < entry.defaultPos[0].y + 1) && (pos[0].y > entry.defaultPos[0].y - 1)) {
                    if (entry.user.winBet > 0) {
                        //if win, draw the lines out
                        entry.GAME_STATUS = 3;
                        $('#winScore').text('$' + entry.user.winBet);
                        try {
                            //play the button sound
                            SlotsSnds.win.currentTime = 0;
                            SlotsSnds.win.play();
                        } catch (err) {};

                    } else {
                        //else end the round
                        entry.GAME_STATUS = 0;
                    }
                    pos = JSON.parse(JSON.stringify(entry.defaultPos));
                    speed = 0;

                } else {
                    if (speed > 5) {
                        speed--;
                    }
                }
            }

            entry.layout.forEach(function(v, i, a) {
                if (pos[i].y > wheel.height) {
                    pos[i].y = -wheel.itemHeight;
                }
                // pos[i].y += speed[~~(i / 3)];//with accelerate
                pos[i].y += speed; //without accelerate
                ctx.drawImage(icons[v] || new Image(), pos[i].x, pos[i].y, itemWidth, itemHeight);

            });

            if (entry.GAME_STATUS == 3) {
                entry.linesInfo.forEach(function(v2, i2, a2) {
                    if (v2 > 0) {
                        //line i2 got bonus, the icon count is v2
                        ctx.beginPath();
                        ctx.lineWidth = 2;
                        ctx.strokeStyle = '#02FF02';
                        entry.LOTERY_LINES[i2].forEach(function(v3, i3, a3) {
                            // v3 is the position,
                            if (i3 == 0) {
                                ctx.moveTo(pos[v3 - 1].x + itemWidth / 2, pos[v3 - 1].y + itemHeight / 2);
                            } else {
                                ctx.lineTo(pos[v3 - 1].x + itemWidth / 2 + wheel.gutter, pos[v3 - 1].y + itemHeight / 2);
                            }
                        });
                        ctx.stroke();
                    }
                })
            }
            requestAnimationFrame(refresh);
        }
        requestAnimationFrame(refresh);
    }
};

var SlotsSnds = {
    win: new Audio('sounds/slots_win_fruit_00.mp3'),
    background: new Audio('sounds/background.mp3'),
    btn: new Audio('sounds/ui_Buttons.mp3')
};

//invoke our game
$(function() {
    $('.main-wrapper').height(window.innerHeight);

    var zchSlots = new Slots();
    zchSlots.init();
});