
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
            <a class="row col-sm-12" href="mooc-details.html" style="text-decoration: none">
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