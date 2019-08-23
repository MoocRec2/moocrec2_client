
var baseUrl = 'http://localhost:3000'

function getCourses() {
    $.get(baseUrl + '/courses/top-rated', courses => {
        console.log(courses.length)
    })
}

function searchCourses() {
    var currentUrlString = window.location.href
    var currentUrl = new URL(currentUrlString)
    var searchQuery = currentUrl.searchParams.get('searchQuery')
    var searchInput = document.getElementById('search_input')
    searchInput.value = searchQuery
    $.get(baseUrl + '/courses/search/' + searchQuery, courses => {
        console.log(courses.length)

        var courseListElement = document.getElementById('courses_list')
        for (var x = 0; x < courses.length; x++) {
            courseListElement.innerHTML = courseListElement.innerHTML +
                `<li class="list-group-item">
                    <a class="row col-sm-12" href="mooc-details.html?id=${courses[x].key}" style="text-decoration: none">
                        <div class="card-header border-0 col-sm-3">
                            <img width="180" height="150"
                                src="${courses[x].logo_image_urls[0]}"
                                alt="">
                        </div>
                        <div class="card-block px-2 col-sm-9">
                            <h4 class="card-title">${courses[x].title}</h4>
                            <p class="card-text">${courses[x].short_description}</p>
                            <i class="fas fa-star" style="color: #ffca65"></i>
                            <i class="fas fa-star" style="color: #ffca65"></i>
                            <i class="fas fa-star" style="color: #ffca65"></i>
                            <i class="fas fa-star" style="color: #ffca65"></i>
                            <i class="fas fa-star"></i>
                        </div>
                        <div class="w-100"></div>
                    </a>
                </li>`
        }
    })
}

function getCourseDetails() {
    var currentUrlString = window.location.href
    var id = currentUrlString.split('=')[1]
    $.get(baseUrl + '/courses/details/' + id, course => {
        console.log(course)

        var titleElement = document.getElementById('course_title')
        titleElement.innerText = course.title

        var descriptionElem = document.getElementById('course_desc')
        descriptionElem.innerHTML = course.full_description

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
        provisionElem.innerText = `Provided by ${course.org} via ${platform}`
    })
}