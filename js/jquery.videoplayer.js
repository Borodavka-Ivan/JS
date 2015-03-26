(function($) {
	$.fn.jVideo = function() {
		return this.each(function() {
			var $video = $(this);
			
			//Обертка и контролы
			var $video_wrap = $('<div></div>').addClass('video_box');
			var $window = $('<div></div>').addClass('modal_window');
			var $div = $('<div></div>').addClass('div');
			var $video_controls = $('<div class="video_controls"><button class="vid_play_pause_btn"></button><form><input class="video_seek" type="range" min="0" max="200" value="0" step="1"><output class="video_hint_range"></output></form><span class="curtimetext">00:00</span></div>');
						
			var $hiden_button = $('<button>Посмотреть</button>').addClass('hide_button');
			var $video_name = $('<p></p>').addClass('video_name');
			var $download = $('<a></a>').addClass('downloadVid');
			var $vid_size = $('<p></p>').addClass('video_size');			
			var close = $('<button></button>').addClass('close_button');
			var playname = $('<p></p>').addClass('play_name');
			
			$video.wrap($video_wrap).wrap($window).wrap($div);
			$video.after($video_controls);
			$video.parent($div).parent('.modal_window').before($hiden_button);
			$video.parent($div).parent('.modal_window').before($video_name);
			$video.parent($div).parent('.modal_window').before($download);
			$video.parent($div).parent('.modal_window').before($vid_size);
						
			//Переменные контролов
			var $video_container = $div.parent('.modal_window');
			var div = $video.parent('.div');			
			var $close_button = $video.before(close);
			var $play_name = $video.before(playname);			
			var $video_controls = $('.video_controls', div);
			var $play_btn = $('.vid_play_pause_btn', div);			
			var $video_seek = $('.video_seek', div);
			var $video_hint_range = $('.video_hint_range', div);
			var $time = $('.curtimetext', div);
			
			var vidSeekMinVal = $video_seek.attr('min');
			var vidSeekMaxVal = $video_seek.attr('max');	
			var vidSeekCircleWidth = 16;
			var vidSeekSliderWidth = $video_seek.width() - vidSeekCircleWidth;
			
			//Обработчики
			$hiden_button.click(showVideo);
			$play_btn.click(playPauseVideo);
			$video_seek.change(videoSeek);
			$video_seek.hover(showHint);
			$video_seek.mouseleave(hideHint);
			$video.hover(showElements);			
			$video.mouseleave(hideElements);			
			$video_controls.hover(showElements);			
			$video_controls.mouseleave(hideElements);
			$video.bind('timeupdate',seekTime);
			close.click(closeVideo);
			
			var path;
			if ($video.attr('src')) {
				// путь в src <audio src="sound.mp3"></audio>
				path = $video.attr('src');
			} else {
				// путь во вложенном теге <audio><source ...></audio>
				path = $video.children().attr('src');
			}			
			
			var nameVid = path.substr(path.lastIndexOf('/') + 1, path.length);
			div.parent($video_container).parent($video_wrap).children('.video_name').text(nameVid);
			$video_name.text(nameVid);
			playname.text(nameVid);
			
			
			function getImageSizeInBytes(imgURL) {
				var request = new XMLHttpRequest();
				request.open("HEAD", imgURL, false);
				request.send(null);
				var headerText = request.getAllResponseHeaders();
				var re = /Content\-Length\s*:\s*(\d+)/i;
				re.exec(headerText);
				var result = ((parseInt(RegExp.$1)/1024)/1024).toFixed(2);
				return result + " МБ.";
			}			
			
			$download.text("Скачать ");
			$download.attr({
				href: path,
				download:"",
				onclick:""
			});
			$vid_size.text(getImageSizeInBytes(path));
			
			function showVideo() {				
				div.parent($video_container).show().css('pointer-events', 'auto');
				$video[0].play();
				$play_btn.css('background', 'url(images/video_pause.png)');
			}
			
			function playPauseVideo() {
				if($video[0].paused){
					$video[0].play();
					$play_btn.css('background', 'url(images/video_pause.png)');
				}
				else{
					$video[0].pause();
					$play_btn.css('background', 'url(images/video_play.png)');	
				}
			}
			
			function videoSeek() {
				var seekto = $video[0].duration * ($video_seek.val() / vidSeekMaxVal);
				$video[0].currentTime = seekto;
				if ($video[0].currentTime.MAX_VALUE){
					$video[0].pause();
					$play_btn.css('background', 'url(images/video_play.png)');
				}
			}
			
			function seekTime() {
				var ntime = $video[0].currentTime * (vidSeekMaxVal / $video[0].duration);
				$video_seek.val(ntime);
				
				var curMins = Math.floor($video[0].currentTime / 60);
				var curSecs = Math.floor($video[0].currentTime - curMins * 60);
				var durMins = Math.floor($video[0].duration / 60);
				var durSecs = Math.floor($video[0].duration - durMins * 60);
				
				if(curSecs < 10) {curSecs = "0"+curSecs;}
				if(durSecs < 10) {durSecs = "0"+durSecs;}
				//$video_seek.title(curMins+":"+curSecs+"/"+durMins+":"+durSecs);	
				var Time = curMins+":"+curSecs+"/"+durMins+":"+durSecs;
				//$video_seek.attr('title',Time);
				$time.text(Time);
				
				$video_seek.css('background-image',
					'-webkit-gradient(linear, left top, right top, '
					+ 'color-stop(' + ntime/vidSeekMaxVal + ', #15D2E2), '
					+ 'color-stop(' + ntime/vidSeekMaxVal + ', #FFFFFF)'
					+ ')'
				);
				offset = -0;
				var pos = Math.round(vidSeekCircleWidth / 2 + $video_seek.val() * vidSeekSliderWidth / vidSeekMaxVal);
				pos += 2;
				
				$video_hint_range.css('left', pos + 'px');
				$video_hint_range.css('marginLeft', offset + '%');
				$video_hint_range.text(Time);
			}
			
			$video.bind('pause', function() {
				$play_btn.css('background', 'url(images/video_play.png)');
			});
			
			function hideElements(){
				$play_btn.css('opacity', '0').css('-moz-opacity', '0').css('filter', 'alpha(opacity=0)');
				$video_seek.css('opacity', '0').css('-moz-opacity', '0').css('filter', 'alpha(opacity=0)');
				$time.css('opacity', '0').css('-moz-opacity', '0').css('filter', 'alpha(opacity=0)');	
				$video_controls.css('opacity', '0').css('-moz-opacity', '0').css('filter', 'alpha(opacity=0)');	
			}
			
			function showElements(){
				$play_btn.css('opacity', '1').css('-moz-opacity', '1').css('filter', 'alpha(opacity=100)');
				$video_seek.css('opacity', '1').css('-moz-opacity', '1').css('filter', 'alpha(opacity=100)');
				$time.css('opacity', '1').css('-moz-opacity', '1').css('filter', 'alpha(opacity=100)');	
				$video_controls.css('opacity', '0.7').css('-moz-opacity', '0.7').css('filter', 'alpha(opacity=70)');	
			}
			
			function closeVideo() {
				div.parent($video_container).hide();
				$video[0].pause();
				$video[0].currentTime = 0;
			}
			
			function showHint() {
				$video_hint_range.css('opacity', '1').css('-moz-opacity', '1').css('filter', 'alpha(opacity=100)');
			}
			function hideHint() {
				$video_hint_range.css('opacity', '0').css('-moz-opacity', '0').css('filter', 'alpha(opacity=0)');
			}
		});
	};
})(jQuery);