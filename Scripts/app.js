const CONFIG = {
  discordId: '1215275288179511330',
  name: 'Natan',
  refreshInterval: 15000,
  social: {
    github: 'https://github.com/cxvu',
    twitter: 'https://x.com/natnnnn_',
    discord: 'https://discord.gg/bWU89tdKdm',
    instagram: 'https://instagram.com/natanzqi',
    youtube: 'https://youtube.com/@itsnatann',
  },
};

const avatar = document.getElementById('avatar');
const socialContainer = document.getElementById('social-links');
const nameEl = document.getElementById('display-name');

const musicCover = document.getElementById('music-cover');
const musicTitle = document.getElementById('music-title');
const musicArtist = document.getElementById('music-artist');
const progressFill = document.getElementById('progress-fill');
const progressBar = document.getElementById('progress-bar');
const timeCurrent = document.getElementById('time-current');
const timeTotal = document.getElementById('time-total');
const btnPlay = document.getElementById('btn-play');
const btnBack = document.getElementById('btn-back');
const btnNext = document.getElementById('btn-next');

const VOL = {
  normal: 0.7,
  ducked: 0.15,
  click: 0.6,
  duckMs: 300,
};

let clickSound = null;
let isDucking = false;
let avatarLoaded = false;
let currentAvatarHash = null;

function initSound() {
  try {
    clickSound = new Audio('Media/click.mp3');
    clickSound.volume = VOL.click;
    clickSound.preload = 'auto';
  } catch (_) {}
}

function playSound() {
  if (!clickSound) return;
  try {
    if (audio && !audio.paused) {
      audio.volume = VOL.ducked;
      isDucking = true;
    }
    clickSound.currentTime = 0;
    clickSound.play().catch(function() {
      clickSound.load();
      setTimeout(function() {
        clickSound.play().catch(function() {});
      }, 100);
    });
    setTimeout(function() {
      if (audio && isDucking) {
        audio.volume = VOL.normal;
        isDucking = false;
      }
    }, VOL.duckMs);
  } catch (_) {}
}

function renderSocialLinks() {
  const links = [
    { url: CONFIG.social.github, icon: 'fa-brands fa-github', label: 'GitHub' },
    { url: CONFIG.social.twitter, icon: 'fa-brands fa-x-twitter', label: 'Twitter' },
    { url: CONFIG.social.discord, icon: 'fa-brands fa-discord', label: 'Discord' },
    { url: CONFIG.social.instagram, icon: 'fa-brands fa-instagram', label: 'Instagram' },
    { url: CONFIG.social.youtube, icon: 'fa-brands fa-youtube', label: 'YouTube' },
  ];

  socialContainer.innerHTML = '';
  links.forEach(function(link) {
    var a = document.createElement('a');
    a.href = link.url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.setAttribute('aria-label', link.label);

    var icon = document.createElement('i');
    icon.className = link.icon;
    a.appendChild(icon);
    a.addEventListener('click', playSound);
    socialContainer.appendChild(a);
  });
}

function setAvatar(userId, avatarHash) {
  if (avatarHash && currentAvatarHash === avatarHash && avatarLoaded) {
    return;
  }

  if (!avatarLoaded) {
    avatar.src = 'Media/logo.png';
    avatar.alt = 'Loading...';
  }

  if (userId && avatarHash) {
    var img = new Image();
    img.onload = function() {
      if (!avatarLoaded) {
        avatar.style.transition = 'opacity 0.3s ease';
        avatar.style.opacity = '0';
        setTimeout(function() {
          avatar.src = 'https://cdn.discordapp.com/avatars/' + userId + '/' + avatarHash + '.png?size=256';
          avatar.alt = 'Discord avatar';
          avatar.style.opacity = '1';
          avatarLoaded = true;
          currentAvatarHash = avatarHash;
        }, 300);
      } else {
        avatar.src = 'https://cdn.discordapp.com/avatars/' + userId + '/' + avatarHash + '.png?size=256';
        avatar.alt = 'Discord avatar';
        currentAvatarHash = avatarHash;
      }
    };
    img.onerror = function() {
      avatar.src = 'Media/logo.png';
      avatar.alt = 'Default avatar';
    };
    img.src = 'https://cdn.discordapp.com/avatars/' + userId + '/' + avatarHash + '.png?size=256';
  } else {
    avatar.src = 'Media/logo.png';
    avatar.alt = 'Default avatar';
  }
}

async function fetchDiscord() {
  try {
    var res = await fetch('https://api.lanyard.rest/v1/users/' + CONFIG.discordId);
    var data = await res.json();

    if (data && data.success && data.data) {
      var user = data.data.discord_user || {};
      setAvatar(user.id, user.avatar);
    } else {
      setAvatar(null, null);
    }
  } catch (_) {
    setAvatar(null, null);
  }
}

fetchDiscord();
setInterval(fetchDiscord, CONFIG.refreshInterval);

var playlist = [
  {
    title: 'Better',
    artist: 'Khalid',
    file: 'Media/music.mp3',
    cover: 'Media/cover.jpg',
  },
];

var currentTrack = 0;
var audio = new Audio(playlist[currentTrack].file);
audio.volume = VOL.normal;
var isPlaying = false;

function loadTrack(index) {
  var track = playlist[index];
  audio.src = track.file;
  audio.volume = VOL.normal;
  musicCover.src = track.cover;
  musicTitle.textContent = track.title;
  musicArtist.textContent = track.artist;
  audio.load();
  updateProgress();

  if (!isPlaying) {
    btnPlay.innerHTML = '<i class="fas fa-play"></i>';
  }
}

function togglePlay() {
  if (isPlaying) {
    audio.pause();
    btnPlay.innerHTML = '<i class="fas fa-play"></i>';
  } else {
    audio.play();
    btnPlay.innerHTML = '<i class="fas fa-pause"></i>';
  }
  isPlaying = !isPlaying;
}

function nextTrack() {
  currentTrack = (currentTrack + 1) % playlist.length;
  loadTrack(currentTrack);
  if (isPlaying) {
    audio.play();
    btnPlay.innerHTML = '<i class="fas fa-pause"></i>';
  }
}

function prevTrack() {
  currentTrack = (currentTrack - 1 + playlist.length) % playlist.length;
  loadTrack(currentTrack);
  if (isPlaying) {
    audio.play();
    btnPlay.innerHTML = '<i class="fas fa-pause"></i>';
  }
}

function updateProgress() {
  if (audio.duration) {
    var percent = (audio.currentTime / audio.duration) * 100;
    progressFill.style.width = percent + '%';
    timeCurrent.textContent = formatTime(audio.currentTime);
    timeTotal.textContent = formatTime(audio.duration);
  }
}

function formatTime(seconds) {
  var min = Math.floor(seconds / 60);
  var sec = Math.floor(seconds % 60);
  return min + ':' + (sec < 10 ? '0' : '') + sec;
}

function setProgress(e) {
  var rect = progressBar.getBoundingClientRect();
  var x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  audio.currentTime = x * audio.duration;
}

btnPlay.addEventListener('click', togglePlay);
btnNext.addEventListener('click', nextTrack);
btnBack.addEventListener('click', prevTrack);
progressBar.addEventListener('click', setProgress);
audio.addEventListener('timeupdate', updateProgress);
audio.addEventListener('ended', function() {
  nextTrack();
});

function init() {
  initSound();
  nameEl.textContent = CONFIG.name;
  renderSocialLinks();
  loadTrack(0);
  updateProgress();
}

document.addEventListener('DOMContentLoaded', init);
