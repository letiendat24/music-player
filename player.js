const player = {
    html: document.documentElement,
    playlistElement: document.querySelector(".playlist"),
    songElement: document.querySelector(".song.active"),
    togglePlayElement: document.querySelector(".btn-toggle-play"),
    titleSongElement: document.querySelector(".current-song-title"),
    thumbSongElement: document.querySelector(".cd-thumb"),
    audioElement: document.querySelector(".audio-player"),
    playIconElement: document.querySelector(".play-icon"),
    prevElement: document.querySelector(".btn-prev"),
    nextElement: document.querySelector(".btn-next"),
    loopElement: document.querySelector(".btn-loop"),
    shuffleElement: document.querySelector(".btn-shuffle"),
    progressElement: document.querySelector(".progress-bar"),
    cdElement: document.querySelector(".cd"),
    cdThumb: document.querySelector(".cd-thumb"),
    lyric: document.querySelector(".lyric"),
    nowTime: document.querySelector(".nowTime"),
    leftTime: document.querySelector(".leftTime"),
    isPlaying: false,
    isLoop: localStorage.getItem("loop") === "true",
    isShuffle: localStorage.getItem("shuffle") === "true",
    PREV_THROTTLE: 3,
    songs: [
        {
            id: 1,
            path: "./songs/GioThi-buitruonglinh-16952778.mp3",
            name: "Giờ thì",
            singer: "Bùi Trường Linh",
            thumb: "https://avatar-ex-swe.nixcdn.com/song/2024/12/09/e/c/4/1/1733730837620.jpg"
        },
        {
            id: 2,
            path: "./songs/HongNhanMasewRemix-JackMasew-17062124.mp3",
            name: "Hồng nhan",
            singer: "J97",
            thumb: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMGby1KdVzyrQejNMZH6zj4Fv5laXRSthlog&s"
        },
        {
            id: 3,
            path: "./songs/ix2g0h9kex.mp3",
            name: "Về bên anh",
            singer: "Jack",
            thumb: "https://avatar-ex-swe.nixcdn.com/song/2024/03/26/5/b/4/c/1711427484011.jpg"
        },
        {
            id: 4,
            path: "./songs/NgoiSaoCoDon-JackJ97-7611601.mp3",
            name: "Ngôi sao cô đơn",
            singer: "Trịnh Trần Phương Tuấn",
            thumb: "https://avatar-ex-swe.nixcdn.com/song/2022/07/16/7/f/f/2/1657976952802.jpg"
        },
        {
            id: 5,
            path: "./songs/ThienLyOi-JackJ97-13829746.mp3",
            name: "Thiên lý ơi",
            singer: "Meo Meo",
            thumb: "https://avatar-ex-swe.nixcdn.com/song/2024/02/23/9/a/8/4/1708658535903.jpg"
        },
    ],
    currentIndex: 0,
    currentSongElement: null,

    NEXT: 1,
    PREV: -1,

    // cdThumbAnimate: this.cdThumb.animate([{ transform: "rotate(360deg)" }], {
    //   duration: 10000, // 10 seconds
    //   iterations: Infinity
    // }),
    start() {
        this.render1();
        this.loadCurrentSong();
        //Dom events
        // init Animation for 
        this.cdThumbAnimate = this.cdThumb.animate([{ transform: "rotate(360deg)" }], {
            duration: 10000, // 10 seconds
            iterations: Infinity
        });
        this.cdThumbAnimate.pause();
        // handle click play button
        this.togglePlayElement.onclick = this.togglePlay.bind(this);
        this.audioElement.onplay = () => {
            console.log("playing");
            this.isPlaying = true;
            this.playIconElement.classList.remove("fa-play");
            this.playIconElement.classList.add("fa-pause");
            this.cdThumbAnimate.play();

        };
        this.audioElement.onpause = () => {
            console.log("paused");
            this.isPlaying = false;
            this.playIconElement.classList.remove("fa-pause");
            this.playIconElement.classList.add("fa-play");
            this.cdThumbAnimate.pause();
        };

        // Next
        this.nextElement.onclick = this.handleNextOrPrev.bind(this, this.NEXT);

        // Prev
        this.prevElement.onclick = this.handleNextOrPrev.bind(this, this.PREV);

        this.loopElement.onclick = () => {
            this.isLoop = !this.isLoop;
            this.setLoopState();
            localStorage.setItem("loop", this.isLoop);
        }

        this.shuffleElement.onclick = () => {
            this.isShuffle = !this.isShuffle;
            this.shuffleElement.classList.add("active", this.isShuffle);
            this.setShuffleState();
            localStorage.setItem("shuffle", this.isShuffle);

        }

        this.audioElement.ontimeupdate = () => {
            if (this.progressElement.seeking) return;
            const progress = (this.audioElement.currentTime / this.audioElement.duration) * 100;
            this.progressElement.value = progress || 0;
            this.nowTime.textContent = this.handleTime(this.audioElement.currentTime);
        }
        this.audioElement.onloadedmetadata = () => {
            this.leftTime.textContent = `-${this.handleTime(this.audioElement.duration-this.audioElement.currentTime)}`;
        }

        this.progressElement.onmousedown = () => {
            this.progressElement.seeking = true;
        }

        this.progressElement.onmouseup = () => {
            const positionTime = +this.progressElement.value;
            // change time 
            this.audioElement.currentTime = (positionTime / 100) * this.audioElement.duration;
            this.progressElement.seeking = false;

        }

        //next song when ENDED currentSong
        this.audioElement.onended = () => {
            // this.isPlaying = true;
            this.handleNextOrPrev(this.NEXT);
        }

        this.playlistElement.onclick = (e) => {
            this.isPlaying = true;
            this.currentIndex = Number(e.target.closest(".song").dataset.index);
            console.log(this.currentIndex);
            this.loadCurrentSong();
            this.render1();
        }
        // this.cdThumb.onclick = () => {
        //     this.lyric.style.transform = "translateX(-100%)";
        // } 

    },
    handleNextOrPrev(step) {
        this.isPlaying = true;
        const shouldReset = this.audioElement.currentTime > this.PREV_THROTTLE;
        if (step === this.PREV && shouldReset) {
            this.audioElement.currentTime = 0;
            return;
        }

        if (this.isShuffle) {
            this.currentIndex = this.getRandomIndex();
        } else {
            this.currentIndex += step;
        };
        this.handleChangeSong();
    },
    handleChangeSong() {
        this.currentIndex = (this.currentIndex + this.songs.length) % this.songs.length;
        this.loadCurrentSong();
        this.render1();
    },
    setLoopState() {
        this.audioElement.loop = this.isLoop;
        this.loopElement.classList.toggle("active", this.isLoop);
    },
    setShuffleState() {
        this.shuffleElement.classList.toggle("active", this.isShuffle);
    },
    getRandomIndex() {
        if (this.songs.length === 1) {
            return this.currentIndex;
        }
        let randomIndex = null;
        do {
            randomIndex = Math.floor(Math.random() * 5);
        } while (randomIndex === this.currentIndex);
        return randomIndex;
    },
    handleScrollBar() {
        this.currentSongElement = this.playlistElement.querySelector('.song.active');
        // console.log(this.currentSongElement)
        if (this.currentSongElement) {
            // console.log(this.currentSongElement);
            this.currentSongElement.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
            });
        }
    },
    loadCurrentSong() {
        const currentSong = this.getCurrentSong();
        this.titleSongElement.textContent = currentSong.name;
        this.thumbSongElement.style.backgroundImage = `url(${currentSong.thumb})`;
        this.audioElement.src = currentSong.path;
        this.setLoopState();
        this.setShuffleState();
        this.audioElement.oncanplay = () => {
            if (this.isPlaying) {
                this.audioElement.play();
            };
        };
    },
    getCurrentSong() {
        return this.songs[this.currentIndex];
    },
    togglePlay() {
        const currentSong = this.getCurrentSong();
        if (this.audioElement.paused) {
            this.audioElement.play();
        } else {
            this.audioElement.pause();
        }
    },
    handleTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins < 10 ? "0" + mins : mins}:${secs < 10 ? "0" + secs : secs}`;
    },
// render() {
//     const html = this.songs.map((song, index) => {
//         return `<div class="song ${index === this.currentIndex ? "active" : ""} ">
//   <div class="thumb" style="background-image: url(${song.thumb})">
//   </div>
//   <div class="body">
//     <h3 class="title">${song.name}</h3>
//     <p class="author">${song.singer}</p>
//   </div>
//   <div class="option">
//     <i class="fas fa-ellipsis-h"></i>
//   </div>
// </div>`
//     }).join("")
//     this.playlistElement.innerHTML = html;
// },
render1() {
    this.playlistElement.innerHTML = "";
    const frag = document.createDocumentFragment();

    this.songs.forEach((song, index) => {

        const songEl = document.createElement("div");
        songEl.className = "song";
        if (index === this.currentIndex) {
            songEl.classList.add("active");
            this.currentSongElement = songEl;
        }

        const thumb = document.createElement("div");
        thumb.className = "thumb";
        thumb.style.backgroundImage = `url(${song.thumb})`;


        const body = document.createElement("div");
        body.className = "body";

        const title = document.createElement("h3");
        title.className = "title";
        title.textContent = song.name;

        const author = document.createElement("p");
        author.className = "author";
        author.textContent = song.singer;

        body.append(title, author);

        const option = document.createElement("div");
        option.className = "option";
        option.innerHTML = '<i class="fas fa-ellipsis-h"></i>';


        songEl.append(thumb, body, option);
        songEl.dataset.index = index;
        frag.appendChild(songEl);

    });


    this.playlistElement.appendChild(frag);
    requestAnimationFrame(() => this.handleScrollBar());
}

}

player.start();


