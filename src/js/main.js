var sub = require('./sub.js');


$(document).ready(function(){
    $('.slider-for').slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
        fade: false,
        asNavFor: '.slider-nav'
    });
    $('.slider-nav').slick({
        slidesToShow: 4,
        slidesToScroll: 1,
        asNavFor: (['.slider-for','.slider-for.02']),
        dots: false,
        centerMode: true,
        focusOnSelect: true,
        vertical: true,
        arrows:  true,
        prevArrow: $('.slick-prev'),
        nextArrow: $('.slick-next'), 
        responsive: [
            {
                breakpoint: 768,
                settings: {
                    centerMode: true,
                    vertical: false
                }
            }
        ]
    });
});
