
document.addEventListener('DOMContentLoaded', function() {
    setupUI()
    getUser()
    getPosts()
})

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
    }).finally(() => {
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
        getUser()
        setupUI()
    }).catch((error) => {
        const message = error.response.data.message
        showAlert("danger", message)
    }).finally(() => {
        toggleLoader(false)
    })
}

function getCurrentUserId(){
    const urlParams = new URLSearchParams(window.location.search)
    const userId = urlParams.get("userId")
    return userId
}

function getUser(){
    let userId = getCurrentUserId()
    axios.get(`${baseUrl}/users/${userId}`)
    .then((response) => {
        const user = response.data.data
        document.getElementById("user-email").innerHTML = user.email
        document.getElementById("user-name").innerHTML = user.name
        document.getElementById("user-username").innerHTML = user.username
        document.getElementById("posts-count").innerHTML = user.posts_count
        document.getElementById("comments-count").innerHTML = user.comments_count
        document.getElementById("header-image").src = user.profile_image
        document.getElementById("profil-posts-user").innerHTML = `${user.name}:`

    })
}

function getPosts() {
    let userId = getCurrentUserId()
    toggleLoader(true)
    axios.get(`${baseUrl}/users/${userId}/posts`)
    .then((response) => {
        const posts = response.data.data
        document.getElementById("user-posts").innerHTML = ""
        //show newest post in the top of your profile
        posts.sort((a,b) => new Date(b.id) - new Date(a.id))
        //.....
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

            for(tag of post.tags){
                // console.log(tag.name)
                tagsContent += `
                <botton id="tags" class="btn btn-sm rounded-5">
                    ${tag.name}
                </botton>
                `
            }
            
            let content = `
                <!-- POST -->
                        <div class="card shadow bg-light">
                            <div class="card-header text-light" style="background-color: #7f4fdf;">
                                <img src="${author.profile_image}" alt="" class="rounded-circle border border-4" style="width: 40px; height: 40px;">
                                <b>${author.name}</b>
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

            document.getElementById("user-posts").innerHTML += content
        }

    })
    .catch((error) => {
        const message = error.response.data.message
        showAlert("danger", message)
    })
    .finally(() => {
        toggleLoader(false)
    })
}


