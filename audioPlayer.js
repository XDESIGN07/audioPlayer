// Example: https://nmsardanfm.blogspot.com

// Random numbers in a specific range https://stackoverflow.com/a/1527820/7598333
function getRandom(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatTime(val) {
  var h = 0, m = 0, s;
  val = parseInt(val, 10);
  if (val > 60 * 60) {
  	h = parseInt(val / (60 * 60), 10);
  	val -= h * 60 * 60;
  }
  if (val > 60) {
  	m = parseInt(val / 60, 10);
  	val -= m * 60;
  }
  s = val;
  val = (h > 0)? h + ':' : '';
  val += (m > 0)? ((m < 10 && h > 0)? '0' : '') + m + ':' : '0:';
  val += ((s < 10)? '0' : '') + s;
  return val;
}

function setAlbum(index) {
  ap_cover.innerHTML = audio_url[index].dataset.cover ? '<div style="background:url(' + audio_url[index].dataset.cover + ') no-repeat;background-size:cover;width:80px;height:80px;"></div>' : '<i class="fa fa-music fa-5x"></i>';
  ap_title.innerHTML = ap_source[index].querySelector('.ap-source').innerHTML;
  ap_artist.innerHTML = ap_source[index].querySelector('.ap-desc') ? ap_source[index].querySelector('.ap-desc').innerHTML : '';
}

function changeAudio(elem) {
  document.querySelector('.ap-plause').disabled = true;
  ap_progress.parentNode.classList.add('ap-loading');
  ap_progress.value = 0;
  document.querySelector('.start-time').innerHTML = '00:00';
  document.querySelector('.end-time').innerHTML = '00:00';
  elem = ap_isRandom && ap_isNext ? audio_url[getRandom(0, audio_url.length-1)] : elem;
  
  // playlist, audio that is running 
  for (var i = 0; i < audio_url.length; i++) {
    audio_url[i].parentNode.classList.remove('ap-active');
    if (audio_url[i] == elem) {
      a_index = i;
      audio_url[i].parentNode.classList.add('ap-active');
    }
  }
  
  ap_audio.querySelector('source').src = elem.dataset.src;
  ap_audio.load();
  if (ap_isPlaying) {
    ap_audio.play();
    document.querySelector('.ap-plause').classList.remove('fa-play');
    document.querySelector('.ap-plause').classList.add('fa-pause');
  }
}

function initTime() {
  document.querySelector('.start-time').innerHTML = formatTime(ap_audio.currentTime); //calculate current value time
  document.querySelector('.end-time').innerHTML = formatTime(ap_audio.duration); //calculate total value time
  ap_progress.value = ap_audio.currentTime / ap_audio.duration * 100; //progress bar
  
  // ended of the audio
  if (ap_audio.currentTime == ap_audio.duration) {
    document.querySelector('.ap-plause').classList.remove('fa-pause');
    document.querySelector('.ap-plause').classList.add('fa-play');
    ap_audio.removeEventListener('timeupdate', initTime);
    
    if (ap_isNext) { //auto load next audio
      var elem;
      a_index++;
      if (a_index == audio_url.length) { //repeat all audio
        a_index = 0;
        elem = audio_url[0];
      } else {
        elem = audio_url[a_index];  
      }
      changeAudio(elem);
      setAlbum(a_index);
    } else {
      ap_isPlaying = false;
    }
  }
}

function initAudio() {
  document.querySelector('.ap-prev').disabled = a_index == 0 ? true : false;
  document.querySelector('.ap-plause').disabled = false;
  document.querySelector('.ap-next').disabled = a_index == audio_url.length-1 ? true : false;
  ap_progress.parentNode.classList.remove('ap-loading');
  document.querySelector('.end-time').innerHTML = formatTime(ap_audio.duration);
  ap_audio.addEventListener('timeupdate', initTime); //Tracking the load progress
  
  // progress bar click event
  ap_progress.addEventListener('mousedown', function() {
    ap_audio.removeEventListener('timeupdate', initTime);
  	ap_audio.pause();
  });
  
  ap_progress.addEventListener('mouseup', function() {
  	ap_audio.currentTime = ap_progress.value * ap_audio.duration / 100;
  	ap_audio.addEventListener('timeupdate', initTime);
  	if (ap_isPlaying) ap_audio.play();
  });

  // Playlist listeners
  ap_playlist.querySelectorAll('li').forEach(function(t) {
    t.addEventListener('click', function() {
      ap_audio.removeEventListener('timeupdate', initTime);
      changeAudio(this.querySelector('.ap-source'));
      setAlbum(a_index);
    });
  });
}

var ap_audio = document.querySelector('#audio');
var ap_cover = document.querySelector('.ap-cover');
var ap_title = document.querySelector('.ap-title');
var ap_artist = document.querySelector('.ap-artist');
var ap_controls = document.querySelector('.ap-plauseward');
var ap_progress = document.querySelector('.ap-progress');
var ap_volume = document.querySelector('.ap-volume');
var v_slider = ap_volume.querySelector('.ap-v-slider');
var v_num = v_slider.value;
var ap_others = document.querySelector('.ap-others');
var ap_playlist = document.querySelector('.ap-playlist');
var ap_source = ap_playlist.querySelectorAll('li');
var audio_url = ap_playlist.querySelectorAll('[data-src]');
var a_index = 0;
var ap_isPlaying = false;
var ap_isNext = false; //auto play
var ap_isRandom = false; //play random
var ap_ap_isRanext = false; //check if before random starts, ap_isNext value is true

changeAudio(audio_url[0]);
setAlbum(0);
ap_audio.volume = parseFloat(v_num / 100); //based on valume input value
ap_audio.addEventListener('canplaythrough', initAudio); //start after audio loaded

// if audio fails to load
ap_audio.addEventListener('error', function() {
  alert('Pleaser reload the page.');
});

// Controls listeners
ap_controls.addEventListener('click', function(e) {
  var eles = e.target.classList;
  if (eles.contains('ap-plause')) {
    if (ap_audio.paused === false) {
      ap_audio.pause();
      ap_isPlaying = false;
      eles.remove('fa-pause');
      eles.add('fa-play');
    } else {
      ap_audio.play();
      ap_isPlaying = true;
      eles.remove('fa-play');
      eles.add('fa-pause');
    }
  } else {
    if (eles.contains('ap-prev') && a_index != 0) {
      a_index = a_index-1;
      e.target.disabled = a_index == 0 ? true : false;
    } else if (eles.contains('ap-next') && a_index != audio_url.length-1) {
      a_index = a_index+1;
      e.target.disabled = a_index == audio_url.length-1 ? true : false;
    }
    ap_audio.removeEventListener('timeupdate', initTime);
    changeAudio(audio_url[a_index]);
    setAlbum(a_index);
  }
});

// Audio volume
ap_volume.addEventListener('click', function(e) {
  var eles = e.target.classList;
  if (eles.contains('ap-mute')) {
    if (eles.contains('fa-volume-up')) {
      eles.remove('fa-volume-up');
      eles.add('fa-volume-off');
      v_slider.value = 0;
    } else {
      eles.remove('fa-volume-off');
      eles.add('fa-volume-up');
      v_slider.value = v_num;
    }
  } else {
    v_num = v_slider.value;
    if (v_num != 0) {
      document.querySelector('.ap-mute').classList.remove('fa-volume-off');
      document.querySelector('.ap-mute').classList.add('fa-volume-up');
    }
  }
  ap_audio.volume = parseFloat(v_slider.value / 100);
});

// Others
ap_others.addEventListener('click', function(e) {
  var eles = e.target.classList;
  if (eles.contains('ap-plext')) {
    ap_isNext = ap_isNext && !ap_isRandom ? false : true;
    if (!ap_isRandom) ap_ap_isRanext = ap_ap_isRanext ? false : true;
    eles.contains('ap-active') && !ap_isRandom ? eles.remove('ap-active') : eles.add('ap-active');
  } else if (eles.contains('ap-random')) {
    ap_isRandom = ap_isRandom ? false : true;
    if (ap_isNext && !ap_ap_isRanext) {
      ap_isNext = false;
      ap_others.querySelector('.ap-plext').classList.remove('ap-active');
    } else {
      ap_isNext = true;
      ap_others.querySelector('.ap-plext').classList.add('ap-active');
    }
    eles.contains('ap-active') ? eles.remove('ap-active') : eles.add('ap-active');
  }
});