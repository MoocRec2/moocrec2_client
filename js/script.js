var myRecord = new viewRec();
myRecord.startRecord();
console.log("Activity recording started");

var ACTIVITY = [];
var FEEDBACK = [];
var video;
var videos = ["testVideo1.mp4", "testVideo2.mp4", "testVideo3.mp4", "testVideo4.mp4", "testVideo5.mp4"];
var sessionEnded = false;
var q1Rating = 0;
var q2Rating = 0;
var yetToInteractWithVideo = true;
var isTranscriptVisible = false;
var isVideoMuted = false;
var host = 'localhost'
var port = '3000'


function handleWizard(cardNumber) {
    if (cardNumber == 1) {
        $('#card1').css({'display': 'none'});
        $('#card2').css({'display': 'block'});
        $('#card3').css({'display': 'none'});
    } else if (cardNumber == 2) {
        $('#card1').css({'display': 'none'});
        $('#card2').css({'display': 'none'});
        $('#card3').css({'display': 'block'});
    }
}

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
    var payload = {
        username: localStorage.getItem('username'),
        sessionData: sessionData
    };
    console.log(payload);
    axios.post('http://' + host + ':' + port +'/engagement/find', payload)
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
        if (window.href.location.includes('session.html')) {
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
        }
    });


    /********** Events *****************/
    $(".videoPlayer").toArray().forEach(function (videoPlayer) {
        // Video elemens.
        video = $(videoPlayer).find("video")[0];
        var playPauseBtn = $(videoPlayer).find("#playpauseBtn");
        var fullscreen = $(videoPlayer).find("#fullScreenBtn");
        var startTime = $(videoPlayer).find("#startTime");
        var endTime = $(videoPlayer).find("#endTime");
        var playerSeekBar = $(videoPlayer).find("#topControlsSeekbar");
        var playerProgressBar = $(videoPlayer).find("#topControlsProgressbar");
        var volumeSeekBar = $(videoPlayer).find("#seekbar");
        var volumeProgressBar = $(videoPlayer).find("#progressBar");
        var fastForward = $(videoPlayer).find("#forwardBtn");
        var volumePercentage = $(videoPlayer).find("#percentage");
        var speakerIcon = $(videoPlayer).find("#loudSpeaker-icon");
        var ratingPopup = $("#popUpModal");
        var transcript = $("#transcriptBtn");

        var curDuration,
            endDuration,
            seekBarPercentage,
            interval,
            completeDuration;

        // Play-Pause btn on click event.
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

        // FastForward Go to next video function.
        fastForward.on("click", function () {
            playPauseBtn.click();
            updateVideoProgressBar();

            // Set video to unmute during new video play.
            isVideoMuted = false;
            video.muted = false;
            speakerIcon.html("<i class='fa fa-volume-up'></i>");
            
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
            if(isVideoMuted){
                video.muted = false;
                muteUnmuteToggle(speakerIcon);
                isVideoMuted = false;
            }
            else if((isVideoMuted==false)){
                video.muted = true;
                muteUnmuteToggle(speakerIcon);
                isVideoMuted = true;
            }
        });

        // View transcript.
        $(transcript).on("click", function(){
            var transcriptDiv = document.getElementById("transcriptCard");

            var videoSegmentPath = video.src.split('/');
            var videoSegment = videoSegmentPath[videoSegmentPath.length - 1];
            var position = getIndexOfVideo(videoSegment);   // starts from 0.

            if(videoSegment == "testVideo1.mp4"){
                document.getElementById("cardText").innerHTML = "00:00:00<br>Speaker 1: I'm Rob Greenwich. And I'm Eric Cormier. Whether or not you've ever used the database before the chances are pretty good that you have some sort of personal information in one the short and sweet definition would be that a database is a place where information is stored and organized in a way that makes it easy to manipulate and retrieve.<br>00:00:19<br>Speaker 2: Right. These databases can hold all sorts of information everything from text to numbers to audio and video. This information is known as data in the world of databases even statistical data can be stored in the database."+
                "So does that make the databases the type of software.<br>00:00:35<br>Speaker 1: Not exactly database management systems like Microsoft Access are a type of software but databases themselves are not most databases are found on a computer or on the web but databases can also be on paper like a phone book. That's an example of a paper database. A phone book you know like the Yellow Pages. You mean like Google. No like a phone book like. Never mind. And there are different types of databases too. The most common is a relational database. Does it help you manage your relationships. <br>00:01:10<br>Speaker 1: No relational databases let you tag entries in a way"+
                "that allows them to be searched and organized into tables and reports. I suppose you could use it to manage your relationships if you want it. <br>00:01:21<br>Speaker 1:So how would a database be used on a Web site. <br>00:01:25<br>Speaker 1: Well if you've ever shopped online and filtered your search results that's a great example of relational database as in action like if I ask Target dot com to show me only black shoes and a size nine. <br>00:01:35<br>Speaker 1: Exactly. Oh man. In that case I use databases all the time. <br>00:01:40<br>Speaker 2: Me too. They're pretty useful. There's also another similar type of database. <br>00:01:45<br>Speaker 1: Oh yeah."+
                "The object relational database. Yep. <br>00:01:48<br>Speaker 2: The object relational database is different because it allows new entries to inherit data from other entries. This makes for a faster entry but it's harder to customize on the fly. <br>This speech-to-text was automatically created by www.amberscript.com";
            }
            else if(videoSegment == "testVideo2.mp4"){
                document.getElementById("cardText").innerHTML = "00:00:01<br>Speaker 1: Hi my name is small. Today I'm going to present to you. Introduction to database. I'm sure you've heard. That. Before. But. What is a database. Database is a collection of that. As an example student identities and companies that is. That that consist of. Graphics. In order to transform that tie into useful information it must be organized in a meaningful way. This is key fields such as student identity numbers and these are attributes. Which is also flew off that at that base. While this. IP and pipes which are also their records. We are going to learn about two days. What is DB M.S.. And what is"+
                "VBA. Database management system which we also call us VBA. Mass is a group of programs that many poorly do their tummies. A D.B. M.S. ploy an interface between users and database to ensure that that is consistently organized and remain easy to assess. Guard Tool Time so that copy software reaches. Single user. Which mean. Only one person can use that database at a time. Multiple uses. Alone dozens or hundreds of people to assess the scene that are based at the same time. There. Example of. That hubby's software. My Eskew El. Oracle based. Microsoft. <br>This speech-to-text was automatically created by www.amberscript.com";
            }
            else if(videoSegment == "testVideo3.mp4"){
                document.getElementById("cardText").innerHTML = "[00:00:00] The purpose of a database. Well it's important to remember that a database does not have just a single purpose. Instead there are several key advantages that databases provide. First a database provides a repository for storing data. That's kind of implicit in the name database implies that we have a place to store data. However what might not be so obvious is that databases provide an organizational structure for data that is we don't just have a place to store data. But the database also provides an organized structure into which those data can be placed. <br>[00:00:43] Finally a database provides us with a"+
                "mechanism for interacting with our data now interacting with data can generally be described in four different operations. Here they're listed as querying creating modifying and deleting data. But there's another more interesting acronym which may help you to remember this and that acronym is crud. C Are you D stands for Create read update and delete. These are the four basic operations that we can use when interacting with data. <br>[ [00:01:28] A key point to remember here is that in business there are many natural hierarchical relationships among data. For example a customer can place many orders. Another way of saying that is many different orders can be associated"+
                "with the same customer. Or another example is a department can have many different employees but a given employee might work in one and only one department. So these are hierarchical relationships among the data and a relational database allows us to model and represent these relationships. ";
            }
            else if(videoSegment == "testVideo4.mp4"){
                document.getElementById("cardText").innerHTML = "00:00:00<br>Speaker 1: So now let's learn a bunch of concepts and we'll see a lot of terminology love. All right. So we will learn a lot of new terminology which might sound very new at the outset but as we keep reusing this terminology we'll get used to it. Right. These are some very very basic important terms that will keep reusing across databases. First of all what will be studied throughout this course is a special type of databases. There are many many types of databases. The most popular one being called relational databases again the name relation here is related is connected to the concept of relations in tech"+
                "theory. We will discuss that a little later when we see the mathematical models behind databases for enough. The simplest way to think about it get the many types of databases to be honest with. There are special databases called graph databases right which are used to store graphs. So we have three graphs in discrete mathematics and data structure. So there are specialty databases just to store graph data like the local graph databases. There is that many many types of databases the most popular one being relational databases. OK again we will understand this dome relation here from a mathematical standpoint. Also a little later. Right. We'll study a whole mathematical"+
                "way of understanding databases using something known as relational algebra. OK. We will learn that little later in this course. For now the simplest way to understand this dumb relation basically means people. This is the simplest way to understand the databases that we're talking about connect all the databases that we're talking about right now. They're worried or they're concerned mostly with storing your data in tables. So one way to think of a relation in the context of databases is to think of tables. OK. Again I will connect this concept of a table to the concept relation in.<br>This speech-to-text was automatically created by www.amberscript.com";
            }
            else{
                document.getElementById("cardText").innerHTML = "[00:00:00] Welcome to my database. It has no data in it yet because I want to build it up with you. What sort of data should we store in our first table. Let's start with a grocery list which you've probably used in real life. I'm pasting an example list which has three delicious items and how much we want to buy of each of them. Our first bit of sequel b the command to make the table to store this list. All right. CREATE TABLE IN ALL CAPS. And then the name of the table groceries. And then parentheses and a semicolon. We see an error pop up because a sequel interpreter expects to see. Column names inside these four. What"+
                "column should we have in order scribe. Each item on our list. Well first we need a name for the item which I'll call name and we need to follow that with a data type. We have a few options. Let's go for text. If we look on the right hand side we can see our new table is listed with one column but we also need to specify how many of each thing to buy. Like our for bananas. So let's add a quantity column as well and it's always a whole number. So let's use an integer for that data type. And now we can see that new column listed in our table that looks pretty good. If we're thinking about what data we have in this grocery list. But we're missing something that we need in"+
                "databases a unique identifier for each row. <br>[00:01:30] We almost always need unique ideas for each row in a database because we need a way to identify rows later when we're updating or deleting them and not be dependent on other columns because those could change. <br>[ [00:01:42] We typically specify this I.D. column first. <br>[ [00:01:45] So I'm moving my cursor before name. <br>[ [00:01:49] I'll call this column I.D. that standard and then for the data type I'll have to write this phrase INTEGER PRIMARY KEY which signals to the database that. ";
            }
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
            videoSegment = video.src;
            position = getIndexOfVideo(videoSegment);   // starts from 0.
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
                window.location.href = "session-end.html";
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
            
            completeDuration = video.duration;
            endDuration = calcDuration(completeDuration);

            endTime.text(
                `${endDuration.hours}:${endDuration.minutes}:${endDuration.seconds}`
            );

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

        // Mute unmute icon toggle.
        function muteUnmuteToggle(Element){
            if(isVideoMuted){
                video.muted = false;
                Element.html("<i class='fa fa-volume-up'></i>");
                isVideoMuted = false;
            }
            else if((isVideoMuted==false)){
                video.muted = true;
                Element.html(" <i class='fas fa-volume-mute' role='muteControl'></i>");
                isVideoMuted = true;
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
                    document.getElementById("para").innerHTML = " <br> <i> You rated " + value + " </i>!";
                    q1Rating = value;
                }
            });
        }

        // Rating bar implementation for question 2.
        function rateQuestion2() {
            $('.ques2').starrr({
                change: function (e, value) {
                    //alert('new rating is ' + value);
                    document.getElementById("para2").innerHTML = "<br> <i> You rated " + value + " </i>!";
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

    var currentPage = window.location.href;
    console.log(currentPage);

    if (currentPage.includes('session-end')) analyseEngagement();
});

function analyseEngagement() {
    // retrieve activity data recorded by the session.
    var sessionData = JSON.parse(localStorage.getItem("training-session"));
    var payload = {
        username: localStorage.getItem('username'),
        sessionData: sessionData
    };
    axios.post('http://' + host + ':' + port +'/engagement/find', payload)
    .then(response => {
        console.log(response);
        var engagementData = response.data;
        var preferredVideoStyles = engagementData['PreferedStyles'];
        var container = $('#video-styles');

        preferredVideoStyles.forEach(style => { 
            var button = getButton(style, 'btn-success', true);
            container.append(button);
        })

    })
    .catch(error => {
        console.error(error);
    })
    
}

/*
 * Returns a <button></button> HTML element, styled with bootstrap v4 classes.
 * 
 * @param colorClass { string }
 *      Bootstrap v4 class responsible for button color.
 *      btn-default | btn-primary | btn-danger | btn-warning | btn-success | btn-secondary
 * 
 * @param smallBtn { bool }
 *      Indicates if the button is small or regular sized.
 */
function getButton(text, colorClass, smallBtn) {
    var classes = ['btn'];
    classes.push(colorClass);
    if (smallBtn) classes.push('btn-sm');

    // Set properties.
    button = document.createElement('button');
    button.innerHTML = text;
    classes.forEach(class_ => { button.classList.add(class_); });
    
    console.log(text + '\n' + button);
    return button;
}
