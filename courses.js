
var baseUrl = 'http://localhost:3000'

function getCourses() {
    $.get(baseUrl + '/courses/top-rated', courses => {
        console.log(courses.length)
    })
}

function searchCourses() {
    var currentUrlString = window.location.href
    var currentUrl = new URL(currentUrlString)

    // Getting Values from URL
    var searchQuery = currentUrl.searchParams.get('searchQuery')
    var coursera_plat = currentUrl.searchParams.get('coursera_plat')
    var edx_plat = currentUrl.searchParams.get('edx_plat')
    var fl_plat = currentUrl.searchParams.get('fl_plat')
    var forum_activity = currentUrl.searchParams.get('forum_activity')

    // Setting Values to UI
    var searchInput = document.getElementById('search_input')
    searchInput.value = searchQuery

    platforms = []
    var courseraCheckBox = document.getElementById('coursera_plat')
    if (coursera_plat) {
        courseraCheckBox.checked = true
        platforms.push('Coursera')
    } else {
        courseraCheckBox.checked = false
    }

    var edxCheckBox = document.getElementById('edx_plat')
    if (edx_plat) {
        edxCheckBox.checked = true
        platforms.push('Edx')
    } else {
        edxCheckBox.checked = false
    }

    var flCheckBox = document.getElementById('fl_plat')
    if (fl_plat) {
        flCheckBox.checked = true
        platforms.push('FutureLearn')
    } else {
        flCheckBox.checked = false
    }

    let requestBody = { query: searchQuery }

    if (platforms.length !== 3 && platforms.length !== 0) {
        Object.assign(requestBody, { platforms: platforms })
    }

    var faCheckBox = document.getElementById('forum_activity')
    if (forum_activity) {
        faCheckBox.checked = true
        Object.assign(requestBody, { consider_forum_activity: true })
    }


    $.ajax({
        url: baseUrl + '/courses/search',
        data: JSON.stringify(requestBody),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        type: "POST",
        success: courses => {

            var courseListElement = document.getElementById('courses_list')
            // console.table(courses)
            for (var x = 0; x < courses.length; x++) {

                // rating = courses[x].course_rating
                function get_stars(rating) {
                    rating_content = ''
                    var y_1 = rating
                    for (; y_1 >= 1; y_1--) {
                        rating_content += `<i class="fas fa-star" style="color: #ffca65"></i>`
                    }
                    if (y_1 != 0) {
                        rating_content += `<i class="fas fa-star-half-alt" style="color: #ffca65"></i>`
                    }

                    for (var y = 5 - rating; y >= 1; y--) {
                        rating_content += `<i class="fas fa-star"></i>`
                    }
                    return rating_content
                }

                courseListElement.innerHTML = courseListElement.innerHTML +
                    `<li class="list-group-item">
                        <a class="row col-sm-12" href="mooc-details.html?id=${courses[x]._id}" style="text-decoration: none">
                            <div class="card-header border-0 col-sm-2" style="padding: 0px;">
                                <img 
                                    src="${courses[x].image_url}"
                                    alt="" style="width: 100%; height: 100%">
                            </div>
                            <div class="card-block px-2 col-sm-10">
                                <h4 class="card-title">${courses[x].title} <span class="badge badge-secondary">${courses[x].platform ? courses[x].platform : 'Independent'}</span></h4>
                                <p class="card-text" style="white-space: nowrap; 
                                overflow: hidden;
                                text-overflow: ellipsis;">${courses[x].short_description ? courses[x].short_description : courses[x].description ? courses[x].description : '<br>'}</p>
                                Course Rating: ${get_stars(courses[x].course_rating)}<br>
                                Forum Activity: ${get_stars(courses[x].forum_activity_rating)}
                            </div>
                            <div class="w-100"></div>
                        </a>
                    </li>`
            }
        }
    });
}

function getCourseDetails() {
    var currentUrlString = window.location.href
    var id = currentUrlString.split('=')[1]
    $.get(baseUrl + '/courses/details/' + id, course => {
        console.log(course)

        var titleElement = document.getElementById('course_title')
        titleElement.innerText = course.title

        var descriptionElem = document.getElementById('course_desc')
        descriptionElem.innerHTML = course.full_description ? course.full_description : course.short_description ? course.short_description : course.description ? course.description : '<br>'
        // var qwe = course.short_description ? course.short_description : course.description ? course.description : '<br>'

        var imagesElem = document.getElementById('images_section')
        for (var x = 0; x < course.logo_image_urls.length; x++) {
            imagesElem.innerHTML = imagesElem.innerHTML +
                `<img src="${course.logo_image_urls[x]}">`
        }

        var durationElem = document.getElementById('duration')
        durationElem.innerText = course.weeks_to_complete + ' Weeks'

        var languageElem = document.getElementById('language')
        languageElem.innerText = course.language

        var levelElem = document.getElementById('level_type')
        levelElem.innerText = course.level_type

        var provisionElem = document.getElementById('provision_info')
        var platform = ''
        console.log(typeof course.platform)
        if (typeof course.platform === 'number') {
            switch (course.platform) {
                case 0:
                    platform = 'Edx'
                    break
                case 1:
                    platform = 'FutureLearn'
                    break
                case 2:
                    platform = 'Coursera'
                    break
            }
        } else {
            platform = course.platform
        }
        var org = course.org.split('_').join(' ')
        provisionElem.innerText = `Provided by ${org} via ${platform}`
    })
}