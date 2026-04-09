document.addEventListener("DOMContentLoaded", ()=>{


/* ===============================
   SIMPLE APP DATABASE
================================*/

const ADMIN = "Arum Enoch"; // put your login username

let DB = JSON.parse(localStorage.getItem("AFIT_DB")) || {
    users:{},
    chats:{},
    pdfs:{}
};

function saveDB(){
    localStorage.setItem("AFIT_DB", JSON.stringify(DB));
}

/* ===============================
   LOGIN & SIGNUP SYSTEM
================================*/

const loginBtnHeader = document.querySelector(".login");
const loginModal = document.getElementById("loginModal");

const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");

document.getElementById("signupSection")?.reset?.();

const welcomeUser = document.getElementById("welcomeUser");

const showLogin = document.getElementById("showLogin");
if(showLogin){
    showLogin.onclick = ()=>{
        document.getElementById("signupSection").style.display="none";
        document.getElementById("loginSection").style.display="block";
    };
}

function updateUserUI(){
    const user = localStorage.getItem("user");

    if(user){
        welcomeUser.innerText = "Welcome " + user;
        loginBtnHeader.innerText = "Logout";
        loginBtnHeader.onclick = ()=>{
            localStorage.removeItem("user");
            location.reload();
        };
    }
    else{
    welcomeUser.innerText="";
    loginBtnHeader.innerText="Login";
    loginBtnHeader.onclick=()=>{
        loginModal.classList.add("show");
    };
}
}

/* LOGIN */
loginBtn.onclick = ()=>{
    const username = document.getElementById("loginUsername").value.trim();

    if(!DB.users[username]){
        alert("User not found, sign up first");
        return;
    }

    localStorage.setItem("user", username);

    updateUserUI();
    location.reload(); // refresh user info
};

/* SIGNUP */
signupBtn.onclick = ()=>{

    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const username = document.getElementById("signupUsername").value.trim();
    const department = document.getElementById("department").value;
    const file = document.getElementById("signupPhoto").files[0];

    if(!firstName || !lastName || !username){
        alert("Fill required fields");
        return;
    }

    if(DB.users[username]){
        alert("Username already taken");
        return;
    }

    const reader = new FileReader();

    const saveUser = (photo="")=>{
        DB.users[username] = {
            username,
            firstName,
            lastName,
            dept:department,
            photo,
            created:Date.now()
        };

        saveDB();
        localStorage.setItem("user", username);
        loginModal.classList.remove("show");
updateUserUI();
location.reload();
    };

    if(file){
    reader.onload = function(e){
        saveUser(e.target.result);
    };
    reader.readAsDataURL(file);
}else{
    saveUser("");
}
};

updateUserUI();



setTimeout(()=>{
    if(!localStorage.getItem("user")){
        loginModal.classList.add("show");
    }
},300);

window.addEventListener("beforeunload", ()=>{
    document.getElementById("firstName").value="";
    document.getElementById("lastName").value="";
    document.getElementById("signupUsername").value="";
});

/* ===============================
   THEME TOGGLE
================================*/
const toggle = document.getElementById("themeToggle");
toggle.onclick = () => {
    document.body.classList.toggle("dark");
}

const adminBtn = document.createElement("button");
adminBtn.innerText = "Admin Panel";
adminBtn.className = "admin-btn";

adminBtn.onclick = ()=>{
    const user = localStorage.getItem("user");
    if(user !== ADMIN){
        alert("Admin only");
        return;
    }
    openAdminPanel();
};

function showAdminButton(){
    const user = localStorage.getItem("user");

    if(user === ADMIN){
        document.body.appendChild(adminBtn);
    }
}

updateUserUI();
showAdminButton();

/* ===============================
   SIDEBAR
================================*/


/* ===============================
   DATA STRUCTURE & PDFs
================================*/
const structure = {
    Computing: { "Cyber Security": {}, "Computer Science": {} },
    Science: { Mathematics: {}, Physics: {} },
    Law: {},
    Engineering: {
        "Electrical Engineering": {},
        "Mechanical Engineering": {}
    }
};

const pdfData = {
    
    "Computer Science":[
        { title:"CSC 101 Introduction", file:"https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"},
        { title:"Data Structures", file:"https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"}
    ],
    Mathematics:[
    
    ],
    Electronics:[
    
    ]

};

/* LOAD SAVED PDFs */
if(DB.pdfs){
    Object.assign(pdfData, DB.pdfs);
}


/* ===============================
   NAVIGATION
================================*/
const contentArea = document.getElementById("contentArea");
const breadcrumb = document.getElementById("breadcrumb");
const backBtn = document.getElementById("backBtn");

backBtn.onclick = ()=>{
    if(path.length === 0) return;

    path.pop();

    currentLevel = structure;
    path.forEach(p => currentLevel = currentLevel[p]);

    render(currentLevel);
    updateBreadcrumb();
};

let path = [];
let currentLevel = structure;

/* ===============================
   PDF MODAL
================================*/
const pdfModal = document.getElementById("pdfModal");
const pdfFrame = document.getElementById("pdfFrame");
const closePdf = document.getElementById("closePdf");

closePdf.onclick = ()=>{
    pdfModal.classList.remove("show");
    pdfFrame.src="";
};

/* ===============================
   RENDER FUNCTION
================================*/
function render(data){
    contentArea.innerHTML="";

    /* LAST LEVEL */
    if(Object.keys(data).length === 0){
        const level = path[path.length-1];
        const pdfs = pdfData[level] || [];
        

        /* upload */
        const upload = document.createElement("button");
        upload.className="upload-btn";
        upload.innerText="Upload PDF";

        const fileInput = document.createElement("input");
        fileInput.type="file";
        fileInput.accept="application/pdf";
        fileInput.style.display="none";

        upload.onclick=()=>fileInput.click();

fileInput.onchange=(e)=>{
    const file=e.target.files[0];
    if(!file) return;

    const reader = new FileReader();

    reader.onload = function(ev){

        if(!pdfData[level]) pdfData[level]=[];

        pdfData[level].push({
            title:file.name,
            file:ev.target.result
        });

        DB.pdfs[level] = pdfData[level];
        saveDB();

        render(currentLevel);
    };

    reader.readAsDataURL(file);
};

        /* chat button */
        const chatBtn = document.createElement("button");

        chatBtn.className="chat-btn";
        chatBtn.innerText="Open Chat Room";

        chatBtn.onclick=()=>{
    const user = localStorage.getItem("user");

    if(!user){
        loginModal.classList.add("show");
        return;
    }

    const dept = path[path.length-1];
    const userDept = getUserDept();

    if(userDept !== dept){
        alert("Chat restricted to " + userDept + " department");
        return;
    }

    openChatRoom(dept);
};
        contentArea.appendChild(chatBtn);
        contentArea.appendChild(upload);
        contentArea.appendChild(fileInput);

        /* PDFs */
        if(pdfs.length===0){
            const empty = document.createElement("p");
            empty.innerText="No PDFs available";
            contentArea.appendChild(empty);
        }

        pdfs.forEach((pdf,i)=>{
    const card=document.createElement("div");
    card.className="card";

    card.innerHTML = `
        <span>${pdf.title}</span>
        ${localStorage.getItem("user")===ADMIN ? 
        `<button class="delete-pdf">✖</button>` : ""}
    `;

    card.onclick=(e)=>{
        if(e.target.classList.contains("delete-pdf")) return;
        pdfFrame.src=pdf.file;
        pdfModal.classList.add("show");
    };

    // ADMIN DELETE
    card.querySelector(".delete-pdf")?.addEventListener("click",(e)=>{
        e.stopPropagation();

        pdfData[level].splice(i,1);
        DB.pdfs[level] = pdfData[level];
        saveDB();
        render(currentLevel);
    });

    contentArea.appendChild(card);
});

        return;
    }

    /* NAV LEVEL */
    Object.keys(data).forEach(key=>{
        const card=document.createElement("div");
        card.className="card";
        card.innerText=key;

        card.onclick=()=>{
            path.push(key);
            currentLevel=data[key];
            updateBreadcrumb();
            render(currentLevel);
        };

        contentArea.appendChild(card);
    });
}

/* ===============================
   BREADCRUMB
================================*/
function updateBreadcrumb(){
    breadcrumb.innerHTML="";
    const home = document.createElement("span");
    home.innerText="Home";
    home.onclick=()=>{
        path=[];
        currentLevel=structure;
        render(currentLevel);
        updateBreadcrumb();
    };
    breadcrumb.appendChild(home);

    path.forEach((p,index)=>{
        const sep=document.createTextNode(" > ");
        breadcrumb.appendChild(sep);
        const span=document.createElement("span");
        span.innerText=p;
        span.onclick=()=>{
            path=path.slice(0,index+1);
            currentLevel=structure;
            path.forEach(k=>currentLevel=currentLevel[k]);
            render(currentLevel);
            updateBreadcrumb();
        };
        breadcrumb.appendChild(span);
    });
}

/* ===============================
   SEARCH SYSTEM
================================*/
const search = document.querySelector(".search");
search.oninput = ()=>{
    const value=search.value.toLowerCase();
    contentArea.innerHTML="";

    function searchStructure(obj){
        Object.keys(obj).forEach(key=>{
            if(key.toLowerCase().includes(value)){
                const card=document.createElement("div");
                card.className="card";
                card.innerText=key;
                contentArea.appendChild(card);
            }
            searchStructure(obj[key]);
        });
    }
    searchStructure(structure);

    /* search PDFs */
    Object.keys(pdfData).forEach(level=>{
        pdfData[level].forEach(pdf=>{
            if(pdf.title.toLowerCase().includes(value)){
                const card=document.createElement("div");
                card.className="card";
                card.innerText=pdf.title;
                card.onclick=()=>{
                    pdfFrame.src=pdf.file;
                    pdfModal.classList.add("show");
                };
                contentArea.appendChild(card);
            }
        });
    });


};

    function getUserDept(){
    const user = localStorage.getItem("user");
    if(!user) return null;
    return DB.users[user]?.dept;
}

/* ===============================
   CHAT SYSTEM (WhatsApp-style)
================================*/

setInterval(()=>{
    if(currentChatRoom){
        loadMessages();
    }
},1500);

/* ===============================
   USER PROFILE
================================*/
let userProfile = {
    name: "",
    photo: ""
};

function saveProfile(){
    const name = document.getElementById("profileName").value;
    const file = document.getElementById("profilePhoto").files[0];

    if(name) userProfile.name = name;

    if(file){
        const reader = new FileReader();
        reader.onload = function(e){
            userProfile.photo = e.target.result;
            localStorage.setItem("userProfile", JSON.stringify(userProfile));
        };
        reader.readAsDataURL(file);
    }else{
        localStorage.setItem("userProfile", JSON.stringify(userProfile));
    }
}

const chatModal=document.getElementById("chatModal");

const adminModal = document.createElement("div");
adminModal.className = "admin-modal";

adminModal.innerHTML = `
<div class="admin-box">
    <h2>Admin Panel</h2>
    <div id="adminContent"></div>
    <button id="closeAdmin">Close</button>
</div>
`;

document.body.appendChild(adminModal);

document.getElementById("closeAdmin").onclick = ()=>{
    adminModal.classList.remove("show");
};

const chatTitle=document.getElementById("chatTitle");
const chatMessages=document.getElementById("chatMessages");
const chatInput=document.getElementById("chatInput");
const typingIndicator=document.getElementById("typingIndicator");
const sendChat=document.getElementById("sendChat");
const closeChat=document.getElementById("closeChat");
const replyBox=document.getElementById("replyBox");


let currentChatRoom="";



let replyTo=null;
let editingIndex=null;

function openChatRoom(room){
    currentChatRoom=room;
    chatTitle.innerText=room+" Chat  ● Online";
    chatModal.classList.add("show");
    loadMessages();
}
closeChat.onclick=()=> chatModal.classList.remove("show");

sendChat.onclick=sendMessage;
chatInput.addEventListener("keypress",(e)=>{
    if(e.key==="Enter") sendMessage();
});

let typingTimer;

chatInput.addEventListener("input", ()=>{
    const user = localStorage.getItem("user");
    typingIndicator.innerText = user + " is typing...";

    clearTimeout(typingTimer);
    typingTimer = setTimeout(()=>{
        typingIndicator.innerText="";
    },1000);
});

function sendMessage(){
    const text=chatInput.value.trim();
    if(!text) return;

    const user=localStorage.getItem("user");
    const key="chat_"+currentChatRoom;

    if(!DB.chats[key]) DB.chats[key] = [];
    let messages = DB.chats[key];

    if(editingIndex !== null){
        messages[editingIndex].text=text;
        messages[editingIndex].edited = true;
        editingIndex=null;
    } 
    else {

        const userData = DB.users[user] || {};

        messages.push({
            username:user,
            user: user,
            text:text,
            time:Date.now(),
            reply:replyTo,
            seen:false,
            edited:false,
            reactions:[],
            photo:userData.photo || ""
        });
    }

    DB.chats[key] = messages;
    saveDB();

    chatInput.value="";
    replyTo=null;
    replyBox.style.display="none";
    typingIndicator.innerText="";

    loadMessages();
}

function showQuickReactions(div,msg,index,messages,key,currentUser,e){

    document.querySelectorAll(".quick-react").forEach(el=>el.remove());

    const bar=document.createElement("div");
    bar.className="quick-react";

    const emojis=["👍","❤️","😂","😮","😢","🙏"];

    emojis.forEach(em=>{
        const span=document.createElement("span");
        span.innerText=em;
        span.style.cursor="pointer";

        span.onclick=(ev)=>{
           // remove old reaction by this user
msg.reactions = msg.reactions.filter(r=>r.user!==currentUser);

// add new one
msg.reactions.push({
    user:currentUser,
    emoji:em
});

messages[index]=msg;
            DB.chats[key] = messages;
saveDB();

            bar.remove();
        };

        bar.appendChild(span);
    });

    bar.style.position="absolute";
    bar.style.top="-35px";
    bar.style.background="#fff";
    bar.style.padding="4px 8px";
    bar.style.borderRadius="20px";
    bar.style.boxShadow="0 2px 8px rgba(0,0,0,.2)";
    bar.style.display="flex";
    bar.style.gap="6px";

    div.style.position="relative";
    div.appendChild(bar);
}

function formatTime(time){
    if(!time) return "";
    const date = new Date(time);
    return date.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
}

function loadMessages(){
    chatMessages.innerHTML="";
    const key="chat_"+currentChatRoom;
    const messages = DB.chats[key] || [];
    const currentUser=localStorage.getItem("user");

    let lastDate = "";

    messages.forEach((msg,index)=>{

        if(msg.username !== currentUser){
    msg.seen = true;
}

        const div=document.createElement("div");

        const msgDate = new Date(msg.time).toDateString();

        if(msgDate !== lastDate){
            lastDate = msgDate;
            const dateDiv = document.createElement("div");
            dateDiv.className = "date-separator";
            const today = new Date().toDateString();
            const yesterday = new Date(Date.now() - 86400000).toDateString();
            dateDiv.innerText = msgDate===today?"Today":msgDate===yesterday?"Yesterday":msgDate;
            chatMessages.appendChild(dateDiv);
        }

        div.className="message "+(msg.username===currentUser?"self":"other");

        // Ensure reactions array exists
        if(!msg.reactions) msg.reactions=[];

        // Render message content
        div.innerHTML = `
        <div class="msg-row">
            ${msg.photo 
? `<img src="${msg.photo}" class="msg-avatar">`
: `<div class="msg-avatar letter">${msg.user.charAt(0).toUpperCase()}</div>`
}
            <div>
                ${msg.reply ? `<div class="reply-preview"><b>${msg.reply.user}</b><br>${msg.reply.text}</div>`:""}
                <div class="msg-bubble">
                    <b>${msg.user}</b><br>${msg.text}
                </div>
                <div class="msg-time">
                    ${msg.edited ? "edited • " : ""}${formatTime(msg.time)}
                    ${msg.username===currentUser ? `<span class="ticks">${msg.seen ? "✓✓" : "✓"}</span>` : ""}
                </div>
                <div class="reactions"></div>
            </div>
        </div>
 `;


        
        

const reactionContainer = div.querySelector(".reactions");

const grouped = {};
msg.reactions.forEach(r=>{
    if(!grouped[r.emoji]) grouped[r.emoji] = [];
    grouped[r.emoji].push(r.user);
});

Object.keys(grouped).forEach(emoji=>{
    const bubble=document.createElement("span");
    bubble.className="reaction-bubble";
    bubble.innerText= emoji + " " + grouped[emoji].length;

    bubble.onclick=()=>{
        const already = msg.reactions.find(r=>r.user===currentUser && r.emoji===emoji);

        if(already){
            msg.reactions = msg.reactions.filter(r=>!(r.user===currentUser && r.emoji===emoji));
        }

        messages[index]=msg;
        DB.chats[key]=messages;
        saveDB();
        loadMessages();
    };

    reactionContainer.appendChild(bubble);
});

        /* CONTEXT MENU */
        div.oncontextmenu = (e)=>{
            e.preventDefault();
            e.stopPropagation();
            document.querySelectorAll(".msg-menu").forEach(m=>m.remove());

            const menu=document.createElement("div");
            menu.className="msg-menu";
            menu.style.position="fixed";
            menu.style.top=e.clientY+"px";
            menu.style.left=e.clientX+"px";
            menu.style.background="#fff";
            menu.style.padding="6px";
            menu.style.borderRadius="8px";
            menu.style.boxShadow="0 3px 12px rgba(0,0,0,.2)";
            menu.style.zIndex="10000";
            menu.style.display="flex";
            menu.style.flexDirection="column";
            menu.style.gap="5px";

            menu.innerHTML = `
                <div class="menu-option reply">Reply</div>
                <div class="menu-option react">React</div>
                ${msg.username===currentUser ? `
                <div class="menu-option edit">Edit</div>
                <div class="menu-option delete">Delete</div>` : ""}
            `;
            document.body.appendChild(menu);

            // REPLY
            menu.querySelector(".reply").onclick=()=>{
                replyTo=msg;
                replyBox.style.display="block";
                replyBox.innerHTML=
                `Replying to ${msg.user}: ${msg.text} 
                <span id="cancelReply" style="cursor:pointer">✖</span>`;
                document.getElementById("cancelReply").onclick=()=>{
                    replyTo=null;
                    replyBox.style.display="none";
                };
                menu.remove();
            };

            // REACT
            menu.querySelector(".react").onclick = () => {
                const picker = document.createElement("div");
                picker.className = "reaction-picker";
                picker.style.position="fixed";
                picker.style.top=(e.clientY-40)+"px";
                picker.style.left=e.clientX+"px";
                picker.style.background="#fff";
                picker.style.padding="5px 8px";
                picker.style.borderRadius="20px";
                picker.style.boxShadow="0 3px 10px rgba(0,0,0,.2)";
                picker.style.display="flex";
                picker.style.gap="6px";
                picker.style.zIndex="10001";

                const emojis=["👍","❤️","😂","😮","😢","🙏"];
                emojis.forEach(emoji=>{
                    const span=document.createElement("span");
                    span.textContent=emoji;
                    span.style.cursor="pointer";
                    span.style.fontSize="18px";

                   
                        // toggle reaction for current user
                      span.onclick = ()=>{
    const existing = msg.reactions.find(r=>r.user===currentUser);

    if(existing && existing.emoji === emoji){
        // clicking same emoji removes it
        msg.reactions = msg.reactions.filter(r=>r.user!==currentUser);
    }else{
        // remove old reaction by this user
        msg.reactions = msg.reactions.filter(r=>r.user!==currentUser);

        // add new reaction
        msg.reactions.push({
            user:currentUser,
            emoji:emoji
        });
    }

                        messages[index]=msg;
                        DB.chats[key]=messages;
                        saveDB();
                        loadMessages();
                        picker.remove();
                    };

                    picker.appendChild(span);
                });

                document.body.appendChild(picker);
menu.remove();

setTimeout(()=>{
    document.addEventListener("click", ()=>picker.remove(), {once:true});
},10);
            };

            // EDIT & DELETE
            if(msg.username===currentUser){
                menu.querySelector(".edit")?.addEventListener("click",()=>{
                    chatInput.value=msg.text;
                    editingIndex=index;
                    menu.remove();
                });

                menu.querySelector(".delete")?.addEventListener("click",()=>{
                    messages.splice(index,1);
                    DB.chats[key] = messages;
                    saveDB();
                    loadMessages();
                    menu.remove();
                });
            }

            // close menu on outside click
            setTimeout(()=>{
                document.addEventListener("click", ()=>menu.remove(),{once:true});
            },10);
        };

        chatMessages.appendChild(div);
    });

    const isNearBottom =
    chatMessages.scrollHeight - chatMessages.scrollTop <= chatMessages.clientHeight + 50;

if(isNearBottom){
    chatMessages.scrollTop = chatMessages.scrollHeight;
}
}

function openAdminPanel(){
    adminModal.classList.add("show");

    const container = document.getElementById("adminContent");
    container.innerHTML="";

    Object.keys(DB.pdfs || {}).forEach(dept=>{
        const title=document.createElement("h3");
        title.innerText=dept;
        container.appendChild(title);

        DB.pdfs[dept].forEach((pdf,i)=>{
            const row=document.createElement("div");
            row.className="admin-row";

            row.innerHTML = `
                <span>${pdf.title}</span>
                <button class="delete-admin">Delete</button>
            `;

            row.querySelector("button").onclick=()=>{
                DB.pdfs[dept].splice(i,1);
                saveDB();
                openAdminPanel();
                render(currentLevel);
            };

            container.appendChild(row);
        });
    });

    
}


/* INIT */
render(structure);

let lastScroll = 0;
const footer = document.getElementById("copyrightFooter");

window.addEventListener("scroll", ()=>{
    const currentScroll = window.pageYOffset;

    if(currentScroll > lastScroll){
        // scrolling down
        footer.classList.add("show");
    }else{
        // scrolling up
        footer.classList.remove("show");
    }

    lastScroll = currentScroll;
});

});



