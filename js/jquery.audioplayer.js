(function($) {
	$.fn.jAudio = function() {
		return this.each(function() {
			//Наше аудио
			var $audio = $(this);
			
			//Обертка и контролы
			var $audio_wrap = $('<div></div>').addClass('audio_box');
			//<form><input class="audio_seek" type="range" min="0" max="200" value="0" step="1" name="foo"> <output class="hint_range" onforminput="value = foo.valueAsNumber;"></output></form>
			var $audio_controls = $('<div class="audio_controls"><button class="play_pause_btn"></button><button class="hide_btn">Прослушать</button> <form><input class="audio_seek" type="range" min="0" max="200" value="0" step="1"> <output class="audio_hint_range"></output></form></div>');
			$audio.wrap($audio_wrap);
			$audio.after($audio_controls);
			
			//Переменные контролов
			var $audio_container = $audio.parent('.audio_box');
			var $audio_controls = $('.audio_controls', $audio_container);
			var $hide_btn = $('.hide_btn', $audio_container);
			var $play_btn = $('.play_pause_btn', $audio_container);	
			var $form = $('.form', $audio_container);
			var $audio_seek = $('.audio_seek', $audio_container);
			var $hint_range = $('.audio_hint_range', $audio_container);
			
			$audio_seek.change(audioSeek);
			$audio_seek.hover(showHint);
			$audio_seek.mouseleave(hideHint);
			$audio.bind('timeupdate',seekTime);
			$hide_btn.click(playSound);
			$play_btn.click(playPause);
			
			var seekMinVal = $audio_seek.attr('min');
			var seekMaxVal = $audio_seek.attr('max');	
			var circleWidth = 16;
			var sliderWidth = $audio_seek.width() - circleWidth;
						
			//Получение имени файла
			var nameMusic = $('<p/>', {
				class:"name_music",
				text: "555"
			}).appendTo($audio_container);
			
			var path;
			if ($audio.attr('src')) {
				// путь в src <audio src="sound.mp3"></audio>
				path = $audio.attr('src');
			} else {
				// путь во вложенном теге <audio><source ...></audio>
				path = $audio.children().attr('src');
			}			
			
			var name = path.substr(path.lastIndexOf('/') + 1, path.length);
			nameMusic.text(name);
			
			//Получение размера файла
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
			
			//Ссылка на скачивание
			var download = $('<a/>',{
				class:"download",
				text:"Скачать ",
				href: path,
				download:""
			}).appendTo($audio_container);	
			
			//размер файла
			var musicSize = $('<p/>', {
				class:"music_size",
				text: getImageSizeInBytes(path)
			}).appendTo($audio_container);
			
			//Обработчик кнопки "Воспроизвести"
			function playSound() {
				$hide_btn.css('disabled', 'disabled').css('z-index', '1').css('opacity', '0.8')
							.css('-moz-opacity', '0.8').css('filter', 'alpha(opacity=80)');
				$audio[0].play();
				$play_btn.css('background', 'url(images/pause.png)').css('opacity', '1').css('-moz-opacity', '1')
							.css('filter', 'alpha(opacity=1)').css('disabled', 'enabled').css('z-index', '2');
				$audio_seek.css('opacity', '1').css('-moz-opacity', '1').css('filter', 'alpha(opacity=1)')
							.css('disabled', 'enabled').css('z-index', '2');
				$hide_btn.text("");
			}
			
			//Обработчик кнопки play/pause
			function playPause() {
				if($audio[0].paused){
					$audio[0].play();
					$play_btn.css('background', 'url(images/pause.png)');
				}
				else{
					$audio[0].pause();
					$play_btn.css('background', 'url(images/play.png)');	
				}
			}
			
			//Прокрутка музыки слайдером
			function audioSeek() {
				var seekto = $audio[0].duration * ($audio_seek.val() / seekMaxVal);
				$audio[0].currentTime = seekto;				
			}
			
			//Позиционирование ползунка(прогресс)
			function seekTime() {
				var ntime = $audio[0].currentTime * (seekMaxVal / $audio[0].duration);
				$audio_seek.val(ntime);
				
				var curMins = Math.floor($audio[0].currentTime / 60);
				var curSecs = Math.floor($audio[0].currentTime - curMins * 60);
				var durMins = Math.floor($audio[0].duration / 60);
				var durSecs = Math.floor($audio[0].duration - durMins * 60);
				
				if(curSecs < 10) { curSecs = "0"+curSecs; }
				if(durSecs < 10) { durSecs = "0"+durSecs; }	
				var Time = curMins+":"+curSecs+"/"+durMins+":"+durSecs;
				//$audio_seek.attr('title', Time);
					
				$audio_seek.css('background-image',
					'-webkit-gradient(linear, left top, right top, '
					+ 'color-stop(' + ntime/seekMaxVal + ', #15D2E2), '
					+ 'color-stop(' + ntime/seekMaxVal + ', #FFFFFF)'
					+ ')'
				);
				
				//для вывода подсказки
				var newPoint, newPlace, offset;
				var width = $audio_seek.width();
				newPoint = ($audio_seek.val() - seekMinVal) / (seekMaxVal - seekMinVal);
				offset = -8;
				if (newPoint < 0) { newPlace = 0; }
				else if (newPoint > 1) { newPlace = width; }
				else { newPlace = width * newPoint + offset; offset -= newPoint;}
				
				var pos = Math.round(circleWidth / 2 + $audio_seek.val() * sliderWidth / $audio_seek.attr('max'));
				pos -= 16;
				
				$hint_range.css('left', pos + 'px');
				$hint_range.css('marginLeft', offset + '%');
				$hint_range.text(Time);
			}		
			
			function showHint() {
				$hint_range.css('opacity', '1').css('-moz-opacity', '1').css('filter', 'alpha(opacity=100)');
			}
			function hideHint() {
				$hint_range.css('opacity', '0').css('-moz-opacity', '0').css('filter', 'alpha(opacity=0)');
			}
			
			//Пауза воспроизведения(в данном случае, когда муз. кончается, кнопка из паузы становится плеем)
			$audio.bind('pause', function() {
				$play_btn.css('background', 'url(images/play.png)');
			});				
		});
	};
})(jQuery);