
const urlParams = new URLSearchParams(window.location.search)
const postId = urlParams.get("postId") // get post id from url

// Wait for DOM to be ready before calling setupUI
document.addEventListener('DOMContentLoaded', function() {
    setupUI()
    getPostDetails()
})

function getPostDetails(){
    toggleLoader(true)
    axios.get(`${baseUrl}/posts/${postId}`)
    .then((response) => {
        const post = response.data.data
        const comments = post.comments
        const author = post.author
        document.getElementById("post-author-name").innerHTML = `"${author.name}"`
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
        let tagsContent = ``
        for(tag of post.tags){
            console.log(tag.name)
            tagsContent += `
            <botton id="tags" class="btn btn-sm rounded-5">
                ${tag.name}
            </botton>`
        }
        let commentsContent = ``
        for(let comment of comments){
            commentsContent += 
                `
                    <!-- COMMENT -->
                    <div id="comment" class="p-3 my-2 rounded" style="background-color:rgb(194, 164, 255);">
                        <!-- PROFILE PIC + USERNAME -->
                        <img src="${comment.author.profile_image}" class="rounded-circle" style="width: 40px; height: 40px; border: 5px solid #7f4fdf" alt=""> 
                        <b>${comment.author.name}</b>
                        <!--// PROFILE PIC + USERNAME //-->
                        <!-- COMMENT BODY -->
                        <div class="mt-1">
                            ${comment.body}
                        </div>
                        <hr> 
                        <!--// COMMENT BODY //-->
                    </div> 
                    <!--// COMMENT //-->
                `
        }
        let content = `
                <!-- POST -->
                        <div class="card shadow mt-0">
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
                                        <span id="post-tag-${postId}">
                                            ${tagsContent}
                                        </span>
                                    </span>
                                    
                                </div>
                            </div>
                            
                        </div>
                        <div id="comments" class="">
                            ${commentsContent}
                        </div>
                        <div class="input-group mb-1 mt-1" id="add-comment-div" style="background: white;">
                            <input id="comment-input" placeholder="add your comment here..." class="form-control">
                            <button class="btn btn-primary" type="button" onclick="createCommentClicked()">Send</button>
                        </div>
                <!--// POST //-->
            `
        document.getElementById("post-details").innerHTML = content
        // const currentPostTagsId = `post-tag-${post.id}`
        // document.getElementById(currentPostTagsId).innerHTML = ""
        // for(tag of post.tags){
        //     console.log(tag.name)
        //     let tagsContent = `
        //     <botton id="tags" class="btn btn-sm rounded-5">
        //         ${tag.name}
        //     </botton>`
        //     document.getElementById("tags").innerHTML += tagsContent
        // }
        setupUI()
    })
    .catch((error) => {
        const message = error.response.data.message
        showAlert("danger", message)
    })
    .finally(() => {
        toggleLoader(false)
    })
}

function createCommentClicked() {
    let commentBody = document.getElementById("comment-input").value
    let params = {
        "body": commentBody
    }
    let token = localStorage.getItem("token")
    let url = `${baseUrl}/posts/${postId}/comments`
    toggleLoader(true)
    axios.post(url, params, {
        headers: {
            "authorization": `Bearer ${token}`
        }
    })
    .then((response) => {
        getPostDetails()
        showAlert("success", "The comment has been created successfully..")
    })
    .catch((error) => {
        const message = error.response.data.message
        showAlert("danger", message)
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
        showAlert("success", "Your post has been updated..")
        getPostDetails()
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
        // After deletion, go back to home page and load fresh posts
        setTimeout(() => {
            window.location.href = "index.html"
        }, 500)
    }).catch((error) => {
        const message = error.response.data.message
        showAlert("danger", message)
    }).finally(() => {
        toggleLoader(false)
    })
}