"use strict";

const players = document.querySelectorAll(".audio-player");

function formatTime(seconds) {
    if (!Number.isFinite(seconds)) {
        return "0:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60)
        .toString()
        .padStart(2, "0");

    return `${minutes}:${remainingSeconds}`;
}

function pauseOtherPlayers(currentAudio) {
    players.forEach((player) => {
        const audio = player.querySelector("audio");

        if (audio !== currentAudio && !audio.paused) {
            audio.pause();
        }
    });
}

players.forEach((player) => {
    const audio = player.querySelector("audio");
    const playButton = player.querySelector(".play-button");
    const playIcon = player.querySelector(".play-icon");
    const progressSlider = player.querySelector(".progress-slider");
    const timeDisplay = player.querySelector(".audio-time");

    if (
        !audio ||
        !playButton ||
        !playIcon ||
        !progressSlider ||
        !timeDisplay
    ) {
        return;
    }

    function updateButton() {
        const isPlaying = !audio.paused && !audio.ended;

        playIcon.textContent = isPlaying ? "Ⅱ" : "▶";
        playButton.setAttribute(
            "aria-label",
            isPlaying ? "Pause recording" : "Play recording"
        );
    }

    function updateProgress() {
        if (!Number.isFinite(audio.duration) || audio.duration <= 0) {
            progressSlider.value = "0";
            timeDisplay.textContent = "0:00";
            return;
        }

        const percentage = (audio.currentTime / audio.duration) * 100;

        progressSlider.value = percentage.toString();
        timeDisplay.textContent = formatTime(audio.currentTime);
    }

    playButton.addEventListener("click", async () => {
        if (audio.paused) {
            pauseOtherPlayers(audio);

            try {
                await audio.play();
            } catch (error) {
                console.error("The recording could not be played.", error);
            }
        } else {
            audio.pause();
        }
    });

    progressSlider.addEventListener("input", () => {
        if (!Number.isFinite(audio.duration)) {
            return;
        }

        const percentage = Number(progressSlider.value);
        audio.currentTime = (percentage / 100) * audio.duration;
    });

    audio.addEventListener("loadedmetadata", () => {
        timeDisplay.textContent = formatTime(audio.duration);
    });

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("play", updateButton);
    audio.addEventListener("pause", updateButton);

    audio.addEventListener("ended", () => {
        audio.currentTime = 0;
        updateProgress();
        updateButton();
    });
});
