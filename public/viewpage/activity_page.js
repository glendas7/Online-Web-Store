import * as Element from './element.js'
import * as Routes from '../controller/routes.js'
import * as FirebaseController from '../controller/firebase_controller.js'
import * as Util from '../viewpage/util.js'
import * as Auth from '../controller/auth.js'

export function addEventListeners() {
    Element.menuButtonActivity.addEventListener('click', async () => {
        history.pushState(null, null, Routes.routePathname.ACTIVITY)
        const label = Util.disableButton(Element.menuButtonActivity)
        await activity_page()
        Util.enableButton(Element.menuButtonActivity, label)
    })
}

let comments

export async function activity_page() {
    let html = `
    <h1>View Past Activity</h2>
    `

    try {
        comments = await FirebaseController.getActivityList()
        comments.forEach(comment => {
            html += buildCommentView(comment)
        })
    } catch (e) {
        // Util.popupInfo('getCommentsActivity error', JSON.stringify(e))
        return
    }
    Element.mainContent.innerHTML = html

    //delete comment
    var deleteCommentButtons = document.getElementsByClassName('delete-comment-button')
    for (let i = 0; i < deleteCommentButtons.length; i++) {
        deleteCommentButtons[i].addEventListener('click', async () => {
            let comment

            try {
                comment = await FirebaseController.deleteComment(deleteCommentButtons[i].value)
                history.pushState(null, null, Routes.routePathname.ACTIVITY)
                activity_page()
                Util.popupInfo('Success', 'Comment Was Deleted!')
            } catch (e) {
                Util.popupInfo('Error Deleting Comment', JSON.stringify(e))
                return
            }
        })
    }

}

function buildCommentView(comment) {
    let url
    if (comment.rating == 1) {
        url = 'images/1star.png'
    } else if (comment.rating == 2) {
        url = 'images/2star.png'
    } else if (comment.rating == 3) {
        url = 'images/3star.png'
    } else if (comment.rating == 4) {
        url = 'images/4star.png'
    } else if (comment.rating == 5) {
        url = 'images/5star.png'
    }
    else if (comment.rating == null) {
        url = ""
    }

    return `
    <div class="border border-secondary"">
        <div class="bg-dark text-white"">
            Comment by ${comment.email} on ${new Date(comment.timestamp).toString()}
        </div>
            <BR>      
            <img src="${url} "><br>
                    ${comment.content}
    </div>
    <br>
    <div class="d-inline-block">
        <button class="btn btn-outline-danger delete-comment-button" value="${comment.docId}">Delete</button>
    </div>
    <div class="d-inline-block">
        <button
        id="edit-comment-button"
        class="btn btn-outline-primary modal-pre-auth"
        data-dismiss="modal"
        data-toggle="modal"
        data-target="#modal-edit-comment"
        value = ${comment.docId}
        onclick = "changeCID(\'' + value + '\')"
      >
        Edit
      </button>
      </div>
      <hr>
        `
}
