/**
 *中彩汇slots machine
 *
 *note:
 *machine body image sie:606*563
 *image padding left 25px
 *
 **/

//the main slot class

var Slots = (function() {
    var WINDOW_WIDTH = window.innerWidth,
        WINDOW_HEIGHT = window.innerHeight,
        bodyImagesSize = {
            width: 606,
            height: 563
        },
        realBodyImageWidth = ~~WINDOW_WIDTH,
        realBodyImageHeight = ~~ ((bodyImagesSize.height / bodyImagesSize.width) * realBodyImageWidth),
        canvas = $('#canvas')[0],
        ctx = canvas.getContext("2d");



    return {
        init: function() {
            //initialize all stuff
            //set canvas size
            ctx.canvas.width = realBodyImageWidth,
            ctx.canvas.height = realBodyImageHeight;
        }
    };
})();

Slots.init();