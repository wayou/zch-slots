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
        user_name: 0,
        wealth: 0, //得分
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
        //position the spin button
        this.$spinBtn.find('img').css('width', ~~ (this.ratio * this.spinImagesSize.width));

        //initialize the canvas
        this.initCanvas(that);

        //load icons
        this.loadResource(that);

        //generate a random layout for icons
        this.getRandomLayout(that);

        //load user data
        this.getUserData(that);

        //draw default layout
        this.run(that);

        // listen the spin button 
        this.$spinBtn.on('tap click', function() {
            if (that.checkValidation) {
                //here we go 
                console.info('game start!');
                that.run(that);
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
        entry.layout = [];
        for (var i = 14; i >= 0; i--) {
            entry.layout.push(~~(Math.random() * (entry.ITEM_CNT) + 1))
        };
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
            };
            entry.items.icons[i].src = 'images/items/' + i + '.png';
        }
    },
    getUserData: function(entry) {
        //get user info from server
        // $.getJSON('/userinfo', function(data) {
        //     //set the user info
        //     // entry.user.wealth = data.wealth;
        //     // entry.user.user_info_ready = true;
        // });

        //lock
        entry.user.wealth = 10000;
        entry.user.user_info_ready = true;
    },
    spin: function(entry) {
        //here we send request and update the data
        entry.GAME_STATUS = 1;

        //send the bet info the server and start the animation while waiting the result from the server
        // $.post('/bet', {
        //     uid: 001,
        //     bet:1000,
        //     lineCnt:1,
        //     totalBet:entry.game.bet * entry.game.lineCnt
        // }, function(result) {
        //     //here we get the lines and combos result, and draw them out
        // })


        //start the animation
        //
    },
    run: function(entry) {
        // , this.canvas, this.ctx, this.layout, this.wheel, that.items.icons
        //sart the game
        var canvas = entry.canvas,
            ctx = this.ctx,
            wheel = entry.wheel;
        //clear the canvas
        canvas.wdith = canvas.wdith;
        // layout.forEach(function(v, i, a) {
        //     //ctx.drawImage(icons[v],0,0,wheel.itemWidth,wheel.itemHeight);
        //     ctx.drawImage(icons[v],100,100,200,200);
        // });
        function refresh() {
            var layout = entry.layout,
                icons = entry.items.icons;
            ctx.drawImage(icons[1] || new Image(), 0, 0, wheel.itemWidth, wheel.itemHeight);
            // if (entry.items.readyCnt == entry.ITEM_CNT) {
            //     ctx.drawImage(icons[1]||new Image(), 0, 0, wheel.itemWidth, wheel.itemHeight);
            // }
            requestAnimationFrame(refresh);
        }
        requestAnimationFrame(refresh);
    }
};

//invoke our game
$(function() {
    var zchSlots = new Slots();
    zchSlots.init();
});