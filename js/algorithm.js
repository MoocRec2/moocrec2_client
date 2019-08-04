_ = require('lodash');

let identifyEngagementOfEachSegment = (engagementData => {
    var durations = { "testVideo1.mp4": 118, "testVideo2.mp4": 119, "testVideo3.mp4": 122 };
    var videoNameToVideoStyleMapping = { "testVideo1.mp4": "Talking Head", "testVideo2.mp4": "Animation", "testVideo3.mp4": "Slides" };

    // format video segment name.
    // http://localhost:3000/testVideo1.mp4 ---> testVideo1.mp4
    var activities = [];
    engagementData['Activity'].forEach(activity => {
        var videoSegment = activity['VideoSegment'];
        videoSegment = videoSegment.split('/').pop();
        activity['VideoSegment'] = videoSegment;

        activities.push(activity)
    });

    // Group all activities by the video segment.
    var activitiesOfSegments = _.groupBy(activities, activity => activity.VideoSegment);

    // Check how much of each segment were skipped.
    var skippedDurations = {};
    var percentageOfSkipping = {};
    Object.keys(activitiesOfSegments).forEach(segment => {
        skippedDurations[segment] = [];
        activitiesOfSegments[segment].reverse().forEach(activity => { if (activity['ElementRole'] == 'seekControl') skippedDurations[segment].push(activity['TimeAtVideoSegment']); });
    });
    Object.keys(skippedDurations).forEach(segment => {
        var skippedCount = skippedDurations[segment].length;
        var totalDuration = durations[segment];
        percentageOfSkipping[segment] = 0;

        skippedDurations[segment].forEach(skippedAtTime => {
            var percentage = ((skippedAtTime) / totalDuration) / skippedCount;  // Since we add up the percentages, we need to take the average.
            percentageOfSkipping[segment] += percentage;
        });
    });

    // Take the feedback of each segment into one place.
    var feedbackOfSegments = {};
    engagementData['Feedback'].forEach(feedback => {
        var videoSegment = feedback['VideoSegment'];
        videoSegment = videoSegment.split('/').pop();

        feedbackOfSegments[videoSegment] = feedback;    // There's only one feedback object per segment.
    });

    // Give scores to activities.
    // Negative activities are given negative marks.
    var point = 1;
    var segmentScores = [];
    Object.keys(activitiesOfSegments).forEach(segment => {
        var score = 0;

        // Add feedback scores.
        score += (feedbackOfSegments[segment]['QuestionOneRating'], feedbackOfSegments[segment]['QuestionTwoRating']);

        // Add activity score.  
        activitiesOfSegments[segment].forEach(activity => {
            var activityRole = activity['ElementRole']
            score += (activityRole == 'nextSegment' || activityRole == 'seekControl') ? (point * -1) : (point * 1);
        });

        // Give minus points for how much of the segment was skipped.
        var skippedPercentageOfSegment = percentageOfSkipping[segment];
        score += (point * -1 * skippedPercentageOfSegment);

        segmentScores.push({ VideoSegment: segment, Score: score });
    }); 

    // Order scores from highest to lowest.
    segmentScores = _.orderBy(segmentScores, ['Score'], 'desc');

    // Conslusion.
    // Recommend for two video styles if the difference between two highest scores are less than 1,
    // Otherwise go for one style.
    var userEngagement = {};
    userEngagement['PreferedStyles'] = Math.abs(segmentScores[0] - segmentScores[1]) <= 1 ? [segmentScores[0]['VideoSegment'], segmentScores[1]['VideoSegment']] : [segmentScores[0]['VideoSegment']];
    userEngagement['AllScores'] = segmentScores;

    // Above, we inserted the video file names to "PreferedStyles" but it should be the video style.
    for (var i = 0; i < userEngagement['PreferedStyles'].length; i++) { userEngagement['PreferedStyles'][i] = videoNameToVideoStyleMapping[userEngagement['PreferedStyles'][i]]; }
    
    return userEngagement;
})


module.exports = { deduceEngagement: identifyEngagementOfEachSegment };