$(function(){
var effects = 'animated pulse';
var effectsEnd = 'animationend oAnimationEnd mozAnimationEnd webkitAnimationEnd';

$('button.btn').click(function(){ 
    $(this).addClass(effects).one(effectsEnd, function(){
        $(this).removeClass(effects);
    });
});

// $('button.btn').hover(function(){ 
//     $(this).addClass(effects).one(effectsEnd, function(){
//         $(this).removeClass(effects);
//     });
// });
});

