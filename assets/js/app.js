const cl = console.log;

const BASE_URL = `https://jsonplaceholder.typicode.com`;
const POST_URL = `${BASE_URL}/posts`;

const postForm = document.getElementById('postForm');
const titleControl = document.getElementById('title');
const bodyControl = document.getElementById('body');
const userIdControl = document.getElementById('userId');
const addPostBtn = document.getElementById('addPostBtn');
const updatePostBtn = document.getElementById('updatePostBtn');
const spinner = document.getElementById('spinner');

let postsArr = [];

function snackbar(msg, icon) {
    Swal.fire({
        title: msg,
        icon: icon,
        timer: 3000
    });
}

function getConfirmation(msg) {
    return Swal.fire({
        title: msg,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Remove it',
        cancelButtonText: 'Cancel'
    });
}

function makeApiCall(methodName, apiUrl, body = null) {
    const options = {
        method: methodName,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    return fetch(apiUrl, options)
        .then(res => {
            if (!res.ok) {
                throw new Error(res.status);
            }

            if (methodName === 'DELETE') {
                return {};
            }

            return res.json();
        });
}

function createPostCards(arr) {
    const postContainer = document.getElementById('postContainer');

    let result = '';

    arr.forEach(post => {
        result += `
            <div class="col-md-3 mb-3" id="${post.id}">
                <div class="card post-card h-100">

                    <div class="card-header">
                        <h3>${post.title}</h3>
                    </div>

                    <div class="card-body">
                        <p>${post.body}</p>
                    </div>

                    <div class="card-footer d-flex justify-content-between">
                        <button onclick="onEdit(this)" class="btn btn-sm btn-outline-info">
                            Edit
                        </button>

                        <button onclick="onRemove(this)" class="btn btn-sm btn-outline-danger">
                            Remove
                        </button>
                    </div>

                </div>
            </div>
        `;
    });

    postContainer.innerHTML = result;
}

function createSingleCard(obj) {
    const col = document.createElement('div');
    col.className = `col-md-3 mb-3`;
    col.id = obj.id;

    col.innerHTML = `
        <div class="card post-card h-100">

            <div class="card-header">
                <h3>${obj.title}</h3>
            </div>

            <div class="card-body">
                <p>${obj.body}</p>
            </div>

            <div class="card-footer d-flex justify-content-between">
                <button onclick="onEdit(this)" class="btn btn-sm btn-outline-info">
                    Edit
                </button>

                <button onclick="onRemove(this)" class="btn btn-sm btn-outline-danger">
                    Remove
                </button>
            </div>

        </div>
    `;

    document.getElementById('postContainer').prepend(col);
}

function init() {
    spinner.classList.remove('d-none');

    makeApiCall('GET', POST_URL)
        .then(res => {
            postsArr = res;
            createPostCards(postsArr);
        })
        .catch(err => {
            snackbar(err.message, 'error');
        })
        .finally(() => {
            spinner.classList.add('d-none');
        });
}

init();

function onPostAdd(eve) {
    eve.preventDefault();

    if (
        titleControl.value.trim() === '' ||
        bodyControl.value.trim() === '' ||
        userIdControl.value.trim() === ''
    ) {
        snackbar('All fields are required', 'error');
        return;
    }

    const newPost = {
        title: titleControl.value,
        body: bodyControl.value,
        userId: userIdControl.value
    };

    spinner.classList.remove('d-none');

    makeApiCall('POST', POST_URL, newPost)
        .then(res => {
            createSingleCard(res);
            snackbar('Post created successfully', 'success');
            postForm.reset();

            document.getElementById('postContainer').scrollIntoView({
                behavior: 'smooth'
            });
        })
        .catch(err => {
            snackbar(err.message, 'error');
        })
        .finally(() => {
            spinner.classList.add('d-none');
        });
}

function onEdit(ele) {
    const EDIT_ID = ele.closest('.col-md-3').id;
    localStorage.setItem('EDIT_ID', EDIT_ID);

    const EDIT_URL = `${BASE_URL}/posts/${EDIT_ID}`;

    spinner.classList.remove('d-none');

    makeApiCall('GET', EDIT_URL)
        .then(res => {
            titleControl.value = res.title;
            bodyControl.value = res.body;
            userIdControl.value = res.userId;

            addPostBtn.classList.add('d-none');
            updatePostBtn.classList.remove('d-none');

            postForm.scrollIntoView({
                behavior: 'smooth'
            });
        })
        .catch(err => {
            snackbar(err.message, 'error');
        })
        .finally(() => {
            spinner.classList.add('d-none');
        });
}

function onPostUpdate() {
    const UPDATE_ID = localStorage.getItem('EDIT_ID');

    if (!UPDATE_ID) {
        snackbar('Please select post to update', 'error');
        return;
    }

    const UPDATE_URL = `${BASE_URL}/posts/${UPDATE_ID}`;

    const UPDATED_OBJ = {
        title: titleControl.value,
        body: bodyControl.value,
        userId: userIdControl.value,
        id: UPDATE_ID
    };

    spinner.classList.remove('d-none');

    makeApiCall('PATCH', UPDATE_URL, UPDATED_OBJ)
        .then(res => {
            const col = document.getElementById(UPDATE_ID);

            col.querySelector('.card-header h3').innerHTML = res.title;
            col.querySelector('.card-body p').innerHTML = res.body;

            snackbar('Post updated successfully', 'success');

            addPostBtn.classList.remove('d-none');
            updatePostBtn.classList.add('d-none');

            postForm.reset();
            localStorage.removeItem('EDIT_ID');

            document.getElementById('postContainer').scrollIntoView({
                behavior: 'smooth'
            });
        })
        .catch(err => {
            snackbar(err.message, 'error');
        })
        .finally(() => {
            spinner.classList.add('d-none');
        });
}

function onRemove(ele) {
    const REMOVE_ID = ele.closest('.col-md-3').id;

    getConfirmation(`Are you sure, you want to remove post with ID ${REMOVE_ID}?`)
        .then(getConfirm => {
            if (getConfirm.isConfirmed) {
                const REMOVE_URL = `${BASE_URL}/posts/${REMOVE_ID}`;

                spinner.classList.remove('d-none');

                makeApiCall('DELETE', REMOVE_URL)
                    .then(() => {
                        ele.closest('.col-md-3').remove();
                        snackbar('Post removed successfully', 'success');
                    })
                    .catch(err => {
                        snackbar(err.message, 'error');
                    })
                    .finally(() => {
                        spinner.classList.add('d-none');
                    });
            }
        });
}

postForm.addEventListener('submit', onPostAdd);
updatePostBtn.addEventListener('click', onPostUpdate);