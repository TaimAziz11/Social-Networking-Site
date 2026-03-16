const baseUrl = "https://tarmeezacademy.com/api/v1"

function getCurrentUser(){
    let user = null
    const storageUser = localStorage.getItem("user")
    if(storageUser != null){
        user = JSON.parse(storageUser)
    }
    return user
}

function profileClicked(){
    const user = getCurrentUser()
    const userId = user.id
    window.location = `profile.html?userId=${userId}`
    
}

function setupUI(){
    const token = localStorage.getItem("token")
    const loginDiv = document.getElementById("logged-in-div")
    const logoutDiv = document.getElementById("logout-div")
    // add botton
    const addBtn = document.getElementById("addBtn")
    // add comment
    const addCommentDiv = document.getElementById("add-comment-div")

    if(token == null){ //user is  not logged in
        addBtn.style.setProperty("display", "none", "important")
        loginDiv.style.setProperty("display", "flex", "important")
        logoutDiv.style.setProperty("display", "none", "important")
        if (addCommentDiv) addCommentDiv.style.setProperty("display","none", "important")
    }else{ // user is logged in
        addBtn.style.setProperty("display", "block", "important")
        loginDiv.style.setProperty("display", "none", "important")
        logoutDiv.style.setProperty("display", "flex", "important")
        if (addCommentDiv) addCommentDiv.style.setProperty("display","flex", "important")

        const user = getCurrentUser()
        document.getElementById("nav-username").innerHTML = user.name
        document.getElementById("nav-user-image").src = user.profile_image
    }
}

function showAlert(type, message){
    const alertPlaceholder = document.getElementById('liveAlertPlaceholder')
    // if (!alertPlaceholder) return
    const appendAlert = (message, type) => {
        const wrapper = document.createElement('div')
        wrapper.innerHTML = [
            `<div class="alert alert-${type} alert-dismissible" role="alert">`,
            `   <div>${message}</div>`,
            '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
            '</div>'
        ].join('')
        
        alertPlaceholder.append(wrapper)
    }
    // show ONLY the latest alert
    alertPlaceholder.style.setProperty("display", "block", "important")
    alertPlaceholder.innerHTML = ""
    appendAlert(message, type)

    // reset timer so the newest alert stays visible for 2 seconds
    setTimeout(() => { 
        alertPlaceholder.style.setProperty("display", "none", "important")
    }, 3000) 
    // if (alertTimeoutId) {
    //     clearTimeout(alertTimeoutId)
    // }

    // alertTimeoutId = setTimeout(() => {
    //     const alertEl = alertPlaceholder.querySelector(".alert")
    //     if (alertEl && window.bootstrap && bootstrap.Alert) {
    //         bootstrap.Alert.getOrCreateInstance(alertEl).close()
    //     } else {
    //         alertPlaceholder.innerHTML = ""
    //     }
    //     alertPlaceholder.style.setProperty("display", "none", "important")
    // }, 2000)     
}

function logOut(){
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    showAlert("danger", "You Are Logged Out...")
    setupUI()
    window.location = "index.html"
}

function RegisterBtnClicked() {
    let username = document.getElementById("register-username-input").value
    let password = document.getElementById("register-password-input").value
    let name = document.getElementById("register-name-input").value
    let image = document.getElementById("register-image-input").files[0]
    let email = document.getElementById("register-email-input").value

    let formData = new FormData()
    formData.append("username", username)
    formData.append("password", password)
    formData.append("name", name)
    formData.append("image", image)
    formData.append("email", email)

    const headers = {
        "Content-Type": "multipart/form-data",
    }
    toggleLoader(true)
    axios.post(`${baseUrl}/register`, formData, {
        headers: headers
    })
    .then((response) => {
        localStorage.setItem("token", response.data.token)
        localStorage.setItem("user", JSON.stringify(response.data.user))

        const modal = document.getElementById("register-modal")
        const modalInstance = bootstrap.Modal.getInstance(modal)
        modalInstance.hide()
        showAlert("success", "New User Registered Successfully...")
        setupUI()
    }).catch((error) => {
        const message = error.response.data.message
        showAlert("danger", message)
    }).finally(() => {
        toggleLoader(false)
    })
}

function loginBtnClicked(){
    let username = document.getElementById("username-input").value
    let password = document.getElementById("password-input").value

    const params = {
        "username": username,
        "password": password
    }
    toggleLoader(true)
    axios.post(`${baseUrl}/login`, params)
    .then((response) => {
        localStorage.setItem("token", response.data.token)
        localStorage.setItem("user", JSON.stringify(response.data.user))

        const modal = document.getElementById("login-modal")
        const modalInstance = bootstrap.Modal.getInstance(modal)
        modalInstance.hide()
        showAlert("success", "Good, You Are Logged In...")
        setupUI()
    }).catch((error) => {
        const message = error.response.data.message
        showAlert("danger", message)
    }).finally(() => {
        toggleLoader(false)
    })
}

function userClicked(userId) {
    window.location = `profile.html?userId=${userId}`
}

function postClicked(postId){
    localStorage.setItem("postId", postId)
    window.location= `postDetails.html?postId=${postId}`
}

function addBtnClicked(){
    
    document.getElementById("post-modal-submit-btn").innerHTML = "Create"
    document.getElementById("post-id-input").value = ""
    document.getElementById("post-title-modal").innerHTML = "Create New Post"
    document.getElementById("create-post-title-input").value = ""
    document.getElementById("create-post-body-input").value = ""
    let postModal = new bootstrap.Modal(document.getElementById("create-post-modal"), {}) //to show create post modal
    postModal.toggle()
}

function editPostBtnClicked(postObj){
    let post = JSON.parse(decodeURIComponent(postObj))
    document.getElementById("post-modal-submit-btn").innerHTML = "Update"
    document.getElementById("post-id-input").value = post.id
    document.getElementById("post-title-modal").innerHTML = "Edit Post"
    document.getElementById("create-post-title-input").value = post.title
    document.getElementById("create-post-body-input").value = post.body
    let postModal = new bootstrap.Modal(document.getElementById("create-post-modal"), {}) //show edit post modal
    postModal.toggle()
}

function deletePostBtnClicked(postObj){
    let post = JSON.parse(decodeURIComponent(postObj))
    document.getElementById("delete-post-id-input").value = post.id
    let postModal = new bootstrap.Modal(document.getElementById("delete-post-modal"), {}) //show delete post modal
    postModal.toggle()
}

//=========================== Loading indicator functions =============================//
function toggleLoader(show = true){
    if(show){
        document.getElementById("loader").style.visibility = 'visible'
    }else{
        document.getElementById("loader").style.visibility = 'hidden'

    }
}
//===========================// Loading indicator functions //=============================//
