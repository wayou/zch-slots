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

    if (!window.requestAnimationFrame)
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

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
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
    this.GAME_STATUS = 0; // 0 stopped, 1 running, 2 result loaded
    this.score = 0;
    this.ITEM_CNT = 10; //how many icons in this game
    this.user = {
        uid: 0,
        user_name: '未知',
        avatar: 'images/default_avatar.jpg',
        wealth: 0,
        user_info_ready: false
    };
    this.items = {
        icons: [], //store all icons into this array
        readyCnt: 0 //how many icons are loaded
    };
    this.game = {
        bet: 1000, //1000 per line
        lineCnt: 1,
        betRate: 1000
    };
    this.wheel = null;
    this.layout = []; // 15items each range from 1~10, and item 0~2 represent the first column
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
            this.value = that.game.betRate + (+this.value);
            that.game.bet = this.value;
            that.$totalBet.text(that.game.bet * that.game.lineCnt);
        });
        this.$betLineBtn.on('tap click', function() {
            if (this.value < 9) {
                +this.value++;
            } else {
                this.value = 1;
            }
            that.game.lineCnt = this.value;
            that.$totalBet.text(that.game.bet * that.game.lineCnt);
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
        if (entry.GAME_STATUS == 0 /*the game is ready to start*/ && entry.user.user_info_ready /*user data is ready so we know if the user has enough wealth to start the game*/ && entry.user.wealth >= (entry.game.bet * entry.game.lineCnt) /*the wealth is enough to start*/ && entry.items.readyCnt == entry.ITEM_CNT /*all 15 icons are loaded*/ ) {
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
        entry.user.uid = params.uid || 1009;
        entry.user.nick_name = params.nick_name || 'Atom';
        entry.user.avatar = params.avatar || 'images/sample_avatar.jpg';

        //get inital wealth info from server
        // $.getJSON('/userinfo', {
        //     uid: userInfo.uid,
        //     uid: userInfo.nick_name,
        //     uid: userInfo.avatar
        // }, function(data) {
        //     //set the user info
        //     entry.user.wealth = data.wealth;
        //     entry.user.user_info_ready = true;
        // });

        //lock
        entry.user.wealth = 10000;
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

        //lock
        //each time start from a random layout
        //entry.layout = entry.getRandomLayout(entry);

        //unlock
        //send the bet info the server and start the animation while waiting the result from the server
        // $.post('/bet', {
        //     uid: 001,
        //     bet:1000,
        //     lineCnt:1,
        //     totalBet:entry.game.bet * entry.game.lineCnt
        // }, function(result) {
        //     //here we get the lines and combos result, and draw them out
        // })

        //lock, mock layout data
        setTimeout(function() {
            entry.GAME_STATUS = 2;
            // entry.layout = [1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3]; //mock the final result
            entry.layout = entry.getRandomLayout(entry);
            entry.linesInfo = [3, 3, 3, 0, 0, 0, 0, 0, 0];
        }, 6000);
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
            //duplicate the default positons agin for another usage
            defaultPos = JSON.parse(JSON.stringify(entry.defaultPos)),
            speed = [0, 0, 0, 0, 0], //for now lets get the speed being constant
            MAX_SPEED = 20;

        function refresh() {
            canvas.width = canvas.width;

            //stataus=1 spin up,status=2 spin down,status=0 to stop the animation
            if (entry.GAME_STATUS == 1) {
                //spin up
                for (var i = 0; i < 5; i++) {
                    //make the column speed up one by one
                    if (speed[i] < MAX_SPEED) {
                        if (i == 0) {
                            speed[i] += 0.1;
                        } else {
                            if (speed[i - 1] > 2) {
                                speed[i] += 0.1;
                            }
                        }
                    }
                };

            } else if (entry.GAME_STATUS == 2) {

                for (var i = 0; i < 5; i++) {

                    if (pos[i * 3].y < (defaultPos[i * 3].y + 1) && pos[i * 3].y > (defaultPos[i * 3].y - 1)) {

                        //the first icon is in position
                        speed[i] = 0;
                        pos[i * 3 + 0] = JSON.parse(JSON.stringify(defaultPos[i * 3 + 0]));
                        pos[i * 3 + 1] = JSON.parse(JSON.stringify(defaultPos[i * 3 + 1]));
                        pos[i * 3 + 2] = JSON.parse(JSON.stringify(defaultPos[i * 3 + 2]));
                        if (speed[4] == 0) {
                            entry.GAME_STATUS = 0;
                            try {
                                //play the button sound
                                SlotsSnds.win.currentTime = 0;
                                SlotsSnds.win.play();
                            } catch (err) {};
                        }

                    } else {
                        //slow down one by one
                        if (speed[i] > 0.5) {
                            // speed[i] -= 0.1;
                            if (i == 0) {
                                speed[i] -= 0.1;
                            } else {
                                if (speed[i - 1] < 0.5 || speed[i - 1] == 0.5) {
                                    speed[i] -= 0.1;
                                }
                            }
                        }
                    }

                };

            }

            entry.layout.forEach(function(v, i, a) {
                if (pos[i].y > wheel.height) {
                    pos[i].y = -wheel.itemHeight;
                }
                pos[i].y += speed[~~(i / 3)];
                ctx.drawImage(icons[v] || new Image(), pos[i].x, pos[i].y, itemWidth, itemHeight);
            });

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
    var zchSlots = new Slots();
    zchSlots.init();
});