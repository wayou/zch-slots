/**
 *中彩汇slots machine
 *
 *note:
 *machine body image sie:640*377
 *image padding left 25px
 *
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
    this.realBodyImageWidth = ~~this.WINDOW_WIDTH;
    this.ratio = this.realBodyImageWidth / this.bodyImagesSize.width; //the ratio of the image on the screen relative to the orignal image size
    this.realBodyImageHeight = ~~ (this.ratio * this.bodyImagesSize.height);
    this.canvas = $('#canvas')[0];
    this.ctx = canvas.getContext("2d");
    this.$spinBtn = $('#spinBtn');
};

Slots.prototype = {
    init: function() {
        //initialize all stuff
        //set canvas size
        this.ctx.canvas.width = this.realBodyImageWidth;
        this.ctx.canvas.height = this.realBodyImageHeight;
        //position the spin button
        this.$spinBtn.find('img').css('width', ~~ (this.ratio * this.spinImagesSize.width));
    },
    spin: function() {
        //
    }
};

//invoke our game
$(function() {
    var zchSlots = new Slots();
    zchSlots.init();
});