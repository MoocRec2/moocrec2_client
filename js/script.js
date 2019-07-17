var myRecord = new viewRec();
myRecord.startRecord();
console.log("Activity recording started");

var ACTIVITY = [];
var FEEDBACK = [];
var video;
var videos = ["testVideo1.mp4", "testVideo2.mp4", "testVideo3.mp4"];
var sessionEnded = false;
var q1Rating = 0;
var q2Rating = 0;
var yetToInteractWithVideo = true;
var isTranscriptVisible = false;


function getIndexOfVideo(path) {
    for (var i = 0; i < videos.length; i++) {
        if (path.includes(videos[i])) {
            return i;
        }
    }

    return -1;
}

function findVidePreference() {
    var sessionData = JSON.parse(localStorage.getItem("training-session"));

    axios.post('http://localhost:3000/engagement/activity', sessionData)
        .then(function (response) {
            console.log(response);

            var highestScoredVideo = response.data.HighestScore.VideoSegment;
            $('#preferredVideoStyle').text(highestScoredVideo);
        })
        .catch(function (error) {
            console.log(error);
        });
}


$(document).click(function (event) {
    // Capture clicked element.
    var element = event['target'];
    var elementId = element.id;
    var elementRole = element.getAttribute('role');

    // Capture status.
    var videoSegment = video.src;
    var time = video.currentTime;
    var position = getIndexOfVideo(videoSegment);


    // Validate.
    roles = ['playerControl', 'seekControl', 'playbackControl', 'previousSegment', 'nextSegment', 'fullScreen', 'volumeControl', 'playlist', 'mute', 'replayControl'];
    if (roles.includes(elementRole)) {
        ACTIVITY.push({
            ElementId: elementId,
            ElementRole: elementRole,
            VideoSegment: videoSegment,
            TimeAtVideoSegment: time
        });
    }

});

$(document).ready(function () {
    $("button img video div span").on("click", function () {
        // Known roles:-
        // playerControl | volumeControl | playlist | player
        var currentVideo = video.src;
        var currentTimeOfCurrentVideo = video.currentTime;
        var elementId = this.id;
        var elementRole = $(video).attr('role');

        var clickMetadata = {
            Segment: currentVideo,
            Time: currentTimeOfCurrentVideo,
            ElementId: elementId,
            elementRole: elementRole
        };
        console.log(this);
        ACTIVITY.push(clickMetadata);
    });


    /********** Events *****************/
    $(".videoPlayer").toArray().forEach(function (videoPlayer) {
        // Video elemens.
        video = $(videoPlayer).find("video")[0];
        var playPauseBtn = $(videoPlayer).find(".playPausebtn");
        var fullscreen = $(videoPlayer).find(".fullscreen");
        var startTime = $(videoPlayer).find(".startTime");
        var endTime = $(videoPlayer).find(".endTime");
        var playerSeekBar = $(videoPlayer).find(".topControls .seekbar");
        var playerProgressBar = $(videoPlayer).find(".topControls .seekbar .progressbar");
        var volumeSeekBar = $(videoPlayer).find(".volumeCtrl .seekbar");
        var volumeProgressBar = $(videoPlayer).find(".volumeCtrl .seekbar .progressbar");
        var fastForward = $(videoPlayer).find(".forward");
        var fastBackward = $(videoPlayer).find(".backward");
        var volumePercentage = $(videoPlayer).find(".volumeCtrl .percentage");
        var playListItem = $(".playlistItem");
        var speakerIcon = $(videoPlayer).find(".loudSpeaker-icon");
        var ratingPopup = $("#popUpModal");
        var transcript = $("#transcriptBtn");

        var curDuration,
            endDuration,
            seekBarPercentage,
            interval,
            completeDuration;

        $(playPauseBtn).on("click", function () {
            completeDuration = video.duration;
            endDuration = calcDuration(completeDuration);

            endTime.text(
                `${endDuration.hours}:${endDuration.minutes}:${endDuration.seconds}`
            );
            playPause();
            updateVideoProgressBar();
        });
        /* End play_pause on click */

        // FastForward/ Go to next video function.
        fastForward.on("click", function () {
            playPauseBtn.click();
            $("#popUpModal").modal("show");
            rateQuestion1();
            rateQuestion2();

            isTranscriptVisible = false;
            var transcriptDiv = document.getElementById("transcriptCard");
            if(isTranscriptVisible){
                // hide it.
                transcriptDiv.style.display = "block";
                isTranscriptVisible = false;
            }
            else {
                // show it.
                transcriptDiv.style.display = "none";
                isTranscriptVisible = true;
            }
        });

        // Change video location on seekbar onclick.
        playerSeekBar.on("click", function (e) {
            if (!video.ended && completeDuration != undefined) {
                var seekPosition = e.pageX - $(playerSeekBar).offset().left;
                if (
                    seekPosition >= 0 &&
                    seekPosition < $(playerSeekBar).outerWidth()
                ) {
                    video.currentTime =
                        (seekPosition * completeDuration) / $(playerSeekBar).outerWidth();
                    updateSeekbar();
                }
            }
        });

        // Update volume percentage.
        volumeSeekBar.on("click", function (e) {
            var volPosition = e.pageX - $(volumeSeekBar).offset().left;
            var videoVolume = volPosition / $(volumeSeekBar).outerWidth();

            if (videoVolume >= 0 && videoVolume <= 1) {
                video.volume = videoVolume;
                volumeProgressBar.css("width", videoVolume * 100 + "%");
                volumePercentage.text(Math.floor(" " + videoVolume * 100) + "%");
            }
        });

        // Full screen.
        fullscreen.on("click", function () {
            if (video.requestFullscreen) {
                video.requestFullscreen();
            } else if (video.mozRequestFullScreen) {
                /* Firefox */
                video.mozRequestFullScreen();
            } else if (video.webkitRequestFullscreen) {
                /* Chrome, Safari and Opera */
                video.webkitRequestFullscreen();
            } else if (video.msRequestFullscreen) {
                /* IE/Edge */
                video.msRequestFullscreen();
            }
        });

        // Mute button.
        $(speakerIcon).on("click", function () {
            video.muted = true;
            speakerIcon.addClass("fas fa-volume-mute").removeClass("fa fa-volume-up");
        });

      
        // View transcript.
        $(transcript).on("click", function(){
            var transcriptDiv = document.getElementById("transcriptCard");
            if(isTranscriptVisible){
                // hide it.
                transcriptDiv.style.display = "block";
                isTranscriptVisible = false;
            }
            else {
                // show it.
                transcriptDiv.style.display = "none";
                isTranscriptVisible = true;
            }
        })

        // Go to the next video during submitFeedackButton click event.
        $("#submitFeedbackBtn").on("click", function () {
            var videoSegment = video.src;
            var position = getIndexOfVideo(videoSegment);   // starts from 0.
            var videoCount = videos.length; // starts from 1, like everything else.

            playPause();

            // If this isn't the last video, take feedback, and go to next video.
            if (position != videoCount - 1) {
                FEEDBACK.push({
                    VideoSegment: videoSegment,
                    QuestionOneRating: q1Rating,
                    QuestionTwoRating: q2Rating
                });

                $("#closeFeedbackBtn").click();

                // move to next video.
                videoSegment = videoSegment.replace(videos[position], videos[position + 1]);
                video.src = videoSegment;
                console.log(videos[position]);

                document.getElementById("videoTitle").innerHTML = videos[position + 1];
                setToMaxVolume();

            }
            else {
                // Take feedback and submit everything.
                FEEDBACK.push({
                    VideoSegment: videoSegment,
                    QuestionOneRating: q1Rating,
                    QuestionTwoRating: q2Rating
                });

                $("#closeFeedbackBtn").click();

                localStorage.setItem("training-session", JSON.stringify({ Activity: ACTIVITY, Feedback: FEEDBACK }));
                window.location.href = "preference.html";
            }



        });

        // Replay video.
        $('#replayBtn').on('click', function () {
            playPauseBtn.click();
            $('#closeFeedbackBtn').click();
            video.pause();
            video.currentTime = '0';
            video.play();
            setToMaxVolume();
        });

        // Toggle controls.
        $(videoPlayer).hover(
            function () {
                if ($(videoPlayer).hasClass("isPlaying")) {
                    $(videoPlayer).addClass("showControls");
                }
            },
            function () {
                setTimeout(function () {
                    if ($(videoPlayer).hasClass("isPlaying")) {
                        $(videoPlayer).removeClass("showControls");
                    }
                }, 2000);
            }
        );

        // When feedback form is closed.
        $('#closeFeedbackBtn').on('click', function () {
        });

        // Display rating popup on video end.
        video.onended = function () {
            console.log("The video has ended");

            $("#popUpModal").modal("show");
            rateQuestion1();
            rateQuestion2();
        };

        $(".primary").on("click", function () {
            $(".ques1").starrr("option", "rating", "0");
        });

        // Seekbar functionality updates go here.
        var updateSeekbar = function () {
            seekBarPercentage = getPercentage(video.currentTime, video.duration);
            curDuration = calcDuration(video.currentTime);
            startTime.text(
                `${curDuration.hours}:${curDuration.minutes}:${curDuration.seconds}`
            );
            $(playerProgressBar).css("width", seekBarPercentage + "%")
        };


        /********** Functions *****************/
        /********** Note: Don't change this location, if these go out of videoPlayer on click, these don't work ********/

        // Change icons and play pause.
        function playPause() {
            if (playPauseBtn.hasClass("play")) {
                video.play();
                playPauseBtn.addClass("pause").removeClass("play");
                $(videoPlayer).addClass("isPlaying");
            } else if (playPauseBtn.hasClass("pause")) {
                video.pause();
                playPauseBtn.addClass("play").removeClass("pause");
                $(videoPlayer).removeClass("isPlaying");
            }
        }

        // Updating seekbar.
        function updateVideoProgressBar() {
            interval = setInterval(function () {
                if (!video.paused) {
                    updateSeekbar();
                }
                if (video.paused) {
                    clearInterval(interval);
                }
                if (video.ended) {
                    clearInterval(interval);
                    $(playerProgressBar).css("width", "100%");
                    playPauseBtn.removeClass("pause").addClass("play");
                    $(videoPlayer).removeClass("isPlaying").addClass("showControls");
                }
            }, 500);

        }

        // Set video volume to 100.
        function setToMaxVolume() {
            video.volume = 1;
            volumeProgressBar.css("width", 100 + "%");
            volumeProgressBar.css("height", 100 + "%");
            volumePercentage.text(" " + 100 + "%");
        }

        // Rating bar implementation for question 1.
        function rateQuestion1() {
            $('.ques1').starrr({
                change: function (e, value) {
                    //alert('new rating is ' + value);
                    document.getElementById("para").innerHTML = "You rated " + value + " !";
                    q1Rating = value;
                }
            });
        }

        // Rating bar implementation for question 2.
        function rateQuestion2() {
            $('.ques2').starrr({
                change: function (e, value) {
                    //alert('new rating is ' + value);
                    document.getElementById("para2").innerHTML = "You rated " + value + " !";
                    q2Rating = value;
                }
            });
        }
    });



    /********** Other funcions ************/
    // This function calculates the volume percentage.
    var getPercentage = function (presentTime, totalLength) {
        var calculatePercentage = (presentTime / totalLength) * 100;
        return parseFloat(calculatePercentage.toString());
    };

    // This function calculates the duration of video.
    var calcDuration = function (duration) {
        var seconds = parseInt(duration % 60);
        var minutes = parseInt((duration % 3600) / 60);
        var hours = parseInt(duration / 3600);

        return {
            hours: pad(hours),
            minutes: pad(minutes.toFixed()),
            seconds: pad(seconds.toFixed())
        };
    };

    var pad = function (number) {
        if (number > -10 && number < 10) {
            return "0" + number;
        } else {
            return number;
        }
    };

    /* End main */


});

$(document).ready(function(){
    $('[data-toggle="popover"]').popover();   
});
