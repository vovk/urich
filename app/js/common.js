$(window).scroll(function(){
	var st = $(this).scrollTop();

	$('.half').css({
		"transform" : "translate(0%, " + st / 12.5 + "%)"
	});
});