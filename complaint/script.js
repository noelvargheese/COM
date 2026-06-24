const API =
"https://script.google.com/macros/s/AKfycbx3zcHNzMBB3siz0aR22-ChaHyTkXz2LFnq6hZaqtOabtA8cIf0P_SohXNqJd9WNtDmsg/exec";

let systemsData = [];

const categorySelect =
document.getElementById("category");

const systemSelect =
document.getElementById("system");

const form =
document.getElementById("complaintForm");

loadCategories();
loadSystems();
loadComplaints();

async function loadCategories(){

    const res =
    await fetch(
        API + "?action=getCategories"
    );

    const categories =
    await res.json();

    categories.forEach(category=>{

        categorySelect.innerHTML += `
        <option value="${category}">
            ${category}
        </option>
        `;

    });
}

async function loadSystems(){

    const res =
    await fetch(
        API + "?action=getSystems"
    );

    systemsData =
    await res.json();
}

categorySelect.addEventListener(
"change",
()=>{

    const selected =
    categorySelect.value;

    systemSelect.innerHTML =
    `<option value="">Select System</option>`;

    systemsData
    .filter(
        s=>s.category===selected
    )
    .forEach(system=>{

        systemSelect.innerHTML += `
        <option value="${system.system}">
            ${system.system}
        </option>
        `;

    });

});

form.addEventListener(
"submit",
async e=>{

    e.preventDefault();

    const payload = {

        action:"addComplaint",

        category:
        categorySelect.value,

        system:
        systemSelect.value,

        location:
        document.getElementById(
            "location"
        ).value,

        complaint:
        document.getElementById(
            "complaint"
        ).value
    };

    const res =
    await fetch(API,{

        method:"POST",

        body:
        JSON.stringify(payload)

    });

    const result =
    await res.json();

    document.getElementById(
        "successMessage"
    ).innerHTML =
    `Complaint Submitted: ${result.complaintId}`;

    form.reset();

    loadComplaints();

});

async function loadComplaints(){

    const res =
    await fetch(
        API + "?action=getComplaints"
    );

    const complaints =
    await res.json();

    const container =
    document.getElementById(
        "pendingComplaints"
    );

    container.innerHTML = "";

    complaints
    .filter(
        c =>
        c.status === "Pending" ||
        c.status === "In Progress"
    )
    .forEach(c=>{

        container.innerHTML += `
        <div class="card">

            <h3>${c.id}</h3>

            <p>
            ${c.complaint}
            </p>

            <p>
            <strong>Location:</strong>
            ${c.location}
            </p>

            <div class="status">
            ${c.status}
            </div>

        </div>
        `;
    });

}