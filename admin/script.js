const API =
"https://script.google.com/macros/s/AKfycbzKIO6usAk4Kh-d2zLxJwB5HOgwXHIELTqJ7FMwpZPM-UhPGwkLWKVvS87LgQc33sJtwA/exec";

let complaints = [];
let categories = [];
let systems = [];

loadAll();

async function loadAll(){

    await loadDashboard();
    await loadComplaints();
    await loadCategories();
    await loadSystems();

}

async function loadDashboard(){

    const res =
    await fetch(
        API + "?action=dashboard"
    );

    const data =
    await res.json();

    document.getElementById("pendingCount").textContent =
    data.pending;

    document.getElementById("progressCount").textContent =
    data.progress;

    document.getElementById("completedCount").textContent =
    data.completed;

    document.getElementById("totalCount").textContent =
    data.total;
}

async function loadComplaints(){

    const res =
    await fetch(
        API + "?action=getComplaints"
    );

    complaints =
    await res.json();

    renderComplaints();
}

function renderComplaints(){

    
    const pendingContainer =
document.getElementById("pendingContainer");

const progressContainer =
document.getElementById("progressContainer");

const completedContainer =
document.getElementById("completedContainer");

console.log("Pending:", pendingContainer);
console.log("Progress:", progressContainer);
console.log("Completed:", completedContainer);
    
    const search =
    document
    .getElementById("searchInput")
    .value
    .toLowerCase();

    const pendingContainer =
    document.getElementById(
        "pendingContainer"
    );

    const progressContainer =
    document.getElementById(
        "progressContainer"
    );

    const completedContainer =
    document.getElementById(
        "completedContainer"
    );

    pendingContainer.innerHTML = "";
    progressContainer.innerHTML = "";
    completedContainer.innerHTML = "";

    complaints
    .filter(c=>{

        return (
            c.id.toLowerCase().includes(search) ||
            c.category.toLowerCase().includes(search) ||
            (c.location || "")
            .toLowerCase()
            .includes(search)
        );

    })
    .forEach(c=>{

        const card = `
        <div class="complaint-card">

            <h3>${c.id}</h3>

            <p>
                <strong>Category:</strong>
                ${c.category}
            </p>

            <p>
                <strong>System:</strong>
                ${c.system}
            </p>

            <p>
                <strong>Location:</strong>
                ${c.location}
            </p>

            <p>${c.complaint}</p>

            <div class="actions">

                <button
                    class="accept"
                    onclick="updateStatus('${c.id}','In Progress')">
                    Accept
                </button>

                <button
                    class="complete"
                    onclick="updateStatus('${c.id}','Completed')">
                    Complete
                </button>

                <button
                    class="delete"
                    onclick="deleteComplaint('${c.id}')">
                    Delete
                </button>

            </div>

        </div>
        `;

        if(
            c.status === "Pending"
        ){
            pendingContainer.innerHTML += card;
        }
        else if(
            c.status === "In Progress"
        ){
            progressContainer.innerHTML += card;
        }
        else if(
            c.status === "Completed"
        ){
            completedContainer.innerHTML += card;
        }

    });

}
async function updateStatus(
    id,
    status
){

    await fetch(API,{
        method:"POST",
        body:JSON.stringify({
            action:"updateStatus",
            id,
            status
        })
    });

    loadAll();
}

async function deleteComplaint(id){

    if(
        !confirm(
            "Delete complaint?"
        )
    ) return;

    await fetch(API,{
        method:"POST",
        body:JSON.stringify({
            action:"deleteComplaint",
            id
        })
    });

    loadAll();
}

async function loadCategories(){

    const res =
    await fetch(
        API + "?action=getCategories"
    );

    categories =
    await res.json();

    renderCategories();
}

function renderCategories(){

    const list =
    document.getElementById(
        "categoryList"
    );

    const select =
    document.getElementById(
        "systemCategory"
    );

    list.innerHTML = "";
    select.innerHTML = "";

    categories.forEach(cat=>{

        list.innerHTML += `
        <li>
            ${cat}
            <button
            onclick="deleteCategory('${cat}')">
            Delete
            </button>
        </li>
        `;

        select.innerHTML += `
        <option value="${cat}">
        ${cat}
        </option>
        `;
    });
}

async function loadSystems(){

    const res =
    await fetch(
        API + "?action=getSystems"
    );

    systems =
    await res.json();

    renderSystems();
}

function renderSystems(){

    const list =
    document.getElementById(
        "systemList"
    );

    list.innerHTML = "";

    systems.forEach(s=>{

        list.innerHTML += `
        <li>
            ${s.category}
            → ${s.system}

            <button
            onclick="
            deleteSystem(
            '${s.category}',
            '${s.system}'
            )">
            Delete
            </button>

        </li>
        `;
    });
}

addCategoryBtn.onclick =
async ()=>{

    const category =
    newCategory.value.trim();

    if(!category) return;

    await fetch(API,{
        method:"POST",
        body:JSON.stringify({
            action:"addCategory",
            category
        })
    });

    newCategory.value="";

    loadCategories();
};

async function deleteCategory(
category
){

    await fetch(API,{
        method:"POST",
        body:JSON.stringify({
            action:"deleteCategory",
            category
        })
    });

    loadCategories();
}

addSystemBtn.onclick =
async ()=>{

    const category =
    systemCategory.value;

    const system =
    newSystem.value;

    if(!system) return;

    await fetch(API,{
        method:"POST",
        body:JSON.stringify({
            action:"addSystem",
            category,
            system
        })
    });

    newSystem.value="";

    loadSystems();
};

async function deleteSystem(
category,
system
){

    await fetch(API,{
        method:"POST",
        body:JSON.stringify({
            action:"deleteSystem",
            category,
            system
        })
    });

    loadSystems();
}

searchInput.addEventListener(
"input",
renderComplaints
);
