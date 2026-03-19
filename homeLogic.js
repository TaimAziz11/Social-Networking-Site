
let currentPage = 1
let lastpage = 1
let isLoading = false // Flag to prevent multiple simultaneous requests
// let alertTimeoutId = null

// Wait for DOM to be ready before calling setupUI
document.addEventListener('DOMContentLoaded', function() {
    setupUI()
    getPosts()
})

function getPosts(page = 1 , reload = true) {
    // Prevent multiple simultaneous requests
    if (isLoading) return
    
    isLoading = true
    
    // Show loading indicator if appending (not reloading)
    if (!reload) {
        showLoadingIndicator()
    }
    toggleLoader(true)
    axios.get(`${baseUrl}/posts?limit=10&page=${page}`)
    .then((response) => {
        const posts = response.data.data
        // console.log(posts)
        lastpage = response.data.meta.last_page
        if(reload){
            document.getElementById("posts").innerHTML = ""
            currentPage = 1 // Reset to page 1 when reloading
        }

        let tagsContent = ``

        for(let post of posts){
            const author = post.author
            let postTitle = ""
            if(post.title != null){
                postTitle = post.title
            }
            // show or hide (edit) button
            let user = getCurrentUser()
            let isMyPost = user != null && post.author.id == user.id
            let editButtonContent = ``
            if(isMyPost){
                editButtonContent = `
                    <button class="btn btn-danger" style="float: right; margin-left: 8px;" onclick="deletePostBtnClicked('${encodeURIComponent(JSON.stringify(post))}')">delete</button>
                    <button class="btn btn-primary" style="float: right;" onclick="editPostBtnClicked('${encodeURIComponent(JSON.stringify(post))}')">edit</button>
                    `
            }
            // const currentPostTagsId = `post-tag-${post.id}`
            // document.getElementById(currentPostTagsId).innerHTML = ""
            for(tag of post.tags){
                // console.log(tag.name)
                tagsContent += `
                <botton id="tags" class="btn btn-sm rounded-5">
                    ${tag.name}
                </botton>
                `
                // document.getElementById("tags").innerHTML += tagsContent
            }
            let content 
            if(window.innerWidth < 768){
                content = `
                <!-- POST -->
                        <div class="card shadow bg-light" style="height: 500px">
                            <div class="card-header text-light" style="background-color: #7f4fdf;">
                                <span onclick="userClicked(${author.id})" style="cursor: pointer;">                               
                                    <img src="${author.profile_image}" alt="" class="rounded-circle border border-4" style="width: 40px; height: 40px;">
                                    <b>${author.name}</b>
                                </span>
                                ${editButtonContent}
                            </div>
                            <div class="card-body" onclick="postClicked(${post.id})" style="cursor: pointer;">
                                <img src="${post.image}" alt="" class="w-100" style="height: 260px;">
                                <h6 style="color: rgb(124, 124, 124);" class="mt-1">
                                    ${post.created_at}
                                </h6>
                                <h5>
                                    ${postTitle}
                                </h5>
                                <p style="white-space: pre-line">${post.body}</p>
                                <hr>
                                <div>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chat-dots-fill" viewBox="0 0 16 16">
                                        <path d="M16 8c0 3.866-3.582 7-8 7a9 9 0 0 1-2.347-.306c-.584.296-1.925.864-4.181 1.234-.2.032-.352-.176-.273-.362.354-.836.674-1.95.77-2.966C.744 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7M5 8a1 1 0 1 0-2 0 1 1 0 0 0 2 0m4 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0m3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2"/>
                                    </svg>
                                    <span>
                                        (${post.comments_count}) Comments
                                        <span id="post-tag-${post.id}">
                                            ${tagsContent}
                                        </span>
                                    </span>
                                    
                                </div>
                            </div>
                        </div>
                <!--// POST //-->
                `
            }else{
                content = `
                <!-- POST -->
                        <div class="card shadow bg-light">
                            <div class="card-header text-light" style="background-color: #7f4fdf;">
                                <span onclick="userClicked(${author.id})" style="cursor: pointer;">                               
                                    <img src="${author.profile_image}" alt="" class="rounded-circle border border-4" style="width: 40px; height: 40px;">
                                    <b>${author.name}</b>
                                </span>
                                ${editButtonContent}
                            </div>
                            <div class="card-body" onclick="postClicked(${post.id})" style="cursor: pointer;">
                                <img src="${post.image}" alt="" class="w-100" style="height: 450px;">
                                <h6 style="color: rgb(124, 124, 124);" class="mt-1">
                                    ${post.created_at}
                                </h6>
                                <h5>
                                    ${postTitle}
                                </h5>
                                <p style="white-space: pre-line">${post.body}</p>
                                <hr>
                                <div>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chat-dots-fill" viewBox="0 0 16 16">
                                        <path d="M16 8c0 3.866-3.582 7-8 7a9 9 0 0 1-2.347-.306c-.584.296-1.925.864-4.181 1.234-.2.032-.352-.176-.273-.362.354-.836.674-1.95.77-2.966C.744 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7M5 8a1 1 0 1 0-2 0 1 1 0 0 0 2 0m4 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0m3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2"/>
                                    </svg>
                                    <span>
                                        (${post.comments_count}) Comments
                                        <span id="post-tag-${post.id}">
                                            ${tagsContent}
                                        </span>
                                    </span>
                                    
                                </div>
                            </div>
                        </div>
                <!--// POST //-->
                `
            }
            document.getElementById("posts").innerHTML += content
            // const currentPostTagsId = `post-tag-${post.id}`
            // document.getElementById(currentPostTagsId).innerHTML = ""
            // for(tag of post.tags){
            //     console.log(tag.name)
            //     let tagsContent = `
            //     <botton id="tags" class="btn btn-sm rounded-5">
            //         ${tag.name}
            //     </botton>`

            //     document.getElementById(currentPostTagsId).innerHTML += tagsContent
            // }
        }
        
        // Hide loading indicator
        hideLoadingIndicator()
        isLoading = false
    })
    .catch((error) => {
        console.error("Error loading posts:", error)
        hideLoadingIndicator()
        isLoading = false
        showAlert("danger", "Failed to load posts. Please try again.")
    })
    .finally(() => {
        toggleLoader(false)
    })
}

function createNewPostClicked() {
    let postId = document.getElementById("post-id-input").value
    let isCreate = postId == null || postId == "" //if you clicked the add-post-btn or not

    const title = document.getElementById("create-post-title-input").value
    const body = document.getElementById("create-post-body-input").value
    const image = document.getElementById("create-post-image-input").files[0]

    let formData = new FormData()
    formData.append("title", title)
    formData.append("body", body)
    formData.append("image", image)

    const token = localStorage.getItem("token")
    const headers = {
        "Content-Type": "multipart/form-data",
        "authorization": `Bearer ${token}`
    }

    let url = ``
    if(isCreate){ // if create post
        url = `${baseUrl}/posts`
       
    }else{ // if edit post
        formData.append("_method", "put")
        url = `${baseUrl}/posts/${postId}`
        
    }
    toggleLoader(true)
    axios.post(url, formData, {
        headers: headers
    })
    .then((response) => {
        console.log(response)
        const modal = document.getElementById("create-post-modal")
        const modalInstance = bootstrap.Modal.getInstance(modal)
        modalInstance.hide()
        showAlert("success", "Done...")
        getPosts()
        setupUI()
    }).catch((error) => {
        const message = error.response.data.message
        showAlert("danger", message)
    })
    .finally(() => {
        toggleLoader(false)
    })
}

function confirmPostDelete(){
    const token = localStorage.getItem("token")
    const postId = document.getElementById("delete-post-id-input").value
    const headers = {
        "Content-Type": "multipart/form-data",
        "authorization": `Bearer ${token}`
    }
    toggleLoader(true)
    axios.delete(`${baseUrl}/posts/${postId}`, {
        headers: headers
    })
    .then((response) => {
        console.log(response) 
        const modal = document.getElementById("delete-post-modal")
        const modalInstance = bootstrap.Modal.getInstance(modal)
        modalInstance.hide()
        showAlert("success", "The post has beed deleted successfully...")
        getPosts()
        setupUI()
    }).catch((error) => {
        const message = error.response.data.message
        showAlert("danger", message)
    }).finally(() => {
        toggleLoader(false)
    })
}

//======================= INFINITE SCROLL =============================//

    // Throttle function to limit how often the scroll handler runs
    function throttle(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Function to check if user has scrolled near the bottom
    function handleScroll() {
        // Calculate scroll position
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        
        // Trigger when user is 200px from the bottom (adjust this value as needed)
        const threshold = 200;
        const isNearBottom = scrollTop + windowHeight >= documentHeight - threshold;
        
        // Load more posts if:
        // 1. User is near the bottom
        // 2. Not currently loading
        // 3. There are more pages to load
        if (isNearBottom && !isLoading && currentPage < lastpage) {
            currentPage++
            getPosts(currentPage, false)
        }
    }

    // Throttled scroll handler (runs at most once every 200ms)
    window.addEventListener("scroll", throttle(handleScroll, 200));

//======================= INFINITE SCROLL =============================//

//=========================== Loading indicator functions =============================//
    function showLoadingIndicator() {
        const postsContainer = document.getElementById("posts");
        const loadingDiv = document.createElement("div");
        loadingDiv.id = "loading-indicator";
        loadingDiv.className = "text-center my-3";
        loadingDiv.innerHTML = `
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2 text-muted">Loading more posts...</p>
        `;
        postsContainer.appendChild(loadingDiv);
    }

    function hideLoadingIndicator() {
        const loadingIndicator = document.getElementById("loading-indicator");
        if (loadingIndicator) {
            loadingIndicator.remove();
        }
    }
//=========================== Loading indicator functions =============================
