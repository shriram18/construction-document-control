const modules = {
  dashboard: "Dashboard", projects: "Projects", documents: "Document Register",
  shop: "Shop Drawings", rfi: "RFI", mir: "MIR", wir: "WIR", ncr: "NCR",
  materials: "Material Submittals", transmittals: "Transmittals", mom: "MOM"
};
const statusClass = s => ({
  "Approved":"approved","Under Review":"review","Approved with Comments":"comment",
  "Rejected":"rejected","Submitted":"submitted","Overdue":"overdue"
}[s] || "submitted");

let state = {
  active:"dashboard",
  docs: JSON.parse(localStorage.getItem("cdc_docs") || "null") || [
    {no:"STR-699-001",type:"Shop Drawing",desc:"Foundation Layout",rev:"02",project:"Villa 699",date:"2026-11-03",status:"Approved",due:"2026-11-10",submittedTo:"Consultant",remarks:"Approved for construction"},
    {no:"STR-699-002",type:"Shop Drawing",desc:"Raft Reinforcement",rev:"02",project:"Villa 699",date:"2026-11-12",status:"Under Review",due:"2026-11-19",submittedTo:"Consultant",remarks:"Awaiting comments"},
    {no:"RFI-699-015",type:"RFI",desc:"Sump Pit Location Clarification",rev:"00",project:"Villa 699",date:"2026-11-10",status:"Under Review",due:"2026-11-17",submittedTo:"Consultant",remarks:"Pending response"},
    {no:"MIR-699-008",type:"MIR",desc:"Reinforcement Steel",rev:"01",project:"Villa 699",date:"2026-11-15",status:"Approved with Comments",due:"2026-11-18",submittedTo:"Consultant",remarks:"Comments to close"},
    {no:"NCR-699-003",type:"NCR",desc:"Concrete Surface Defect",rev:"00",project:"Villa 699",date:"2026-11-18",status:"Submitted",due:"2026-11-25",submittedTo:"Consultant",remarks:"Corrective action submitted"}
  ]
};

function save(){localStorage.setItem("cdc_docs",JSON.stringify(state.docs))}
function toast(msg){const t=document.querySelector(".toast");t.textContent=msg;t.style.display="block";setTimeout(()=>t.style.display="none",1800)}
function nav(){
  return `<aside class="sidebar"><div class="brand">CDC PRO<span>Construction Document Control</span></div>
  <div class="nav">${Object.entries(modules).map(([k,v])=>`<button class="${state.active===k?'active':''}" onclick="setActive('${k}')">${v}</button>`).join("")}</div></aside>`;
}
function setActive(k){state.active=k;render()}
function stats(){
  const d=state.docs, today=new Date("2026-11-23");
  const overdue=d.filter(x=>x.due && new Date(x.due)<today && !["Approved","Rejected"].includes(x.status)).length;
  return {total:d.length,approved:d.filter(x=>x.status==="Approved").length,review:d.filter(x=>x.status==="Under Review").length,comments:d.filter(x=>x.status==="Approved with Comments").length,overdue};
}
function dashboard(){
 const s=stats();
 return `<div class="cards">${[
 ["Total Documents",s.total,"All modules"],["Approved",s.approved,"Closed/approved"],["Under Review",s.review,"Awaiting response"],["Comments",s.comments,"Action required"],["Overdue",s.overdue,"Past due date"]
 ].map(x=>`<div class="card"><div class="label">${x[0]}</div><div class="value">${x[1]}</div><div class="kpi">${x[2]}</div></div>`).join("")}</div>
 <div class="section"><div class="section-head"><h2>Recent Documents</h2><button class="btn primary" onclick="openModal()">+ New Document</button></div>${table(state.docs.slice().reverse().slice(0,8))}</div>
 <div class="section"><div class="section-head"><h2>Project Overview</h2></div><div class="muted">Active Project: Villa 699 &nbsp; | &nbsp; Document Controller: Admin &nbsp; | &nbsp; System: Professional Edition</div></div>`;
}
function table(rows){
 if(!rows.length) return `<div class="empty">No documents found.</div>`;
 return `<div class="table-wrap"><table><thead><tr><th>Document No.</th><th>Type</th><th>Description</th><th>Rev.</th><th>Project</th><th>Date</th><th>Status</th><th>Due</th></tr></thead><tbody>${
 rows.map((r,i)=>`<tr><td><b>${r.no}</b></td><td>${r.type}</td><td>${r.desc}</td><td>${r.rev}</td><td>${r.project}</td><td>${r.date}</td><td><span class="status ${statusClass(r.status)}">${r.status}</span></td><td>${r.due||"—"}</td></tr>`).join("")}</tbody></table></div>`;
}
function modulePage(){
 const type = modules[state.active];
 const rows = state.active==="documents" ? state.docs : state.docs.filter(d=>d.type===type.replace(" Drawings","").replace(" Submittals"," Material Submittal"));
 return `<div class="section"><div class="section-head"><div><h2>${type}</h2><div class="muted">Professional register and workflow tracking</div></div><button class="btn primary" onclick="openModal()">+ Add ${type}</button></div>
 <div class="toolbar"><input id="search" placeholder="Search document number, description..." oninput="filterRows()"><select id="filter" onchange="filterRows()"><option value="">All Statuses</option><option>Submitted</option><option>Under Review</option><option>Approved with Comments</option><option>Approved</option><option>Rejected</option></select><button class="btn" onclick="exportCSV()">Export CSV</button></div>
 <div id="rows" style="margin-top:14px">${table(rows)}</div></div>`;
}
function filterRows(){
 const q=(document.querySelector("#search")?.value||"").toLowerCase(), f=document.querySelector("#filter")?.value||"";
 const base=state.active==="documents"?state.docs:state.docs.filter(d=>d.type===modules[state.active].replace(" Drawings","").replace(" Submittals"," Material Submittal"));
 const rows=base.filter(r=>(!q||Object.values(r).join(" ").toLowerCase().includes(q))&&(!f||r.status===f));
 document.querySelector("#rows").innerHTML=table(rows);
}
function openModal(){
 document.body.insertAdjacentHTML("beforeend",`<div class="modal-bg" id="modal"><div class="modal"><h2>New Document</h2>
 <div class="grid">
 <div class="field"><label>Document Number</label><input id="fno" placeholder="STR-699-003"></div>
 <div class="field"><label>Type</label><select id="ftype">${["Shop Drawing","RFI","MIR","WIR","NCR","Material Submittal","Transmittal","MOM","General"].map(x=>`<option>${x}</option>`).join("")}</select></div>
 <div class="field full"><label>Description</label><input id="fdesc" placeholder="Document description"></div>
 <div class="field"><label>Revision</label><input id="frev" value="00"></div>
 <div class="field"><label>Project</label><input id="fproject" value="Villa 699"></div>
 <div class="field"><label>Submission Date</label><input id="fdate" type="date" value="2026-11-23"></div>
 <div class="field"><label>Due Date</label><input id="fdue" type="date"></div>
 <div class="field"><label>Submitted To</label><input id="fto" value="Consultant"></div>
 <div class="field"><label>Status</label><select id="fstatus">${["Draft","Submitted","Under Review","Approved with Comments","Approved","Rejected"].map(x=>`<option>${x}</option>`).join("")}</select></div>
 <div class="field full"><label>Remarks</label><textarea id="fremarks" rows="3"></textarea></div></div>
 <div class="actions"><button class="btn" onclick="document.getElementById('modal').remove()">Cancel</button><button class="btn primary" onclick="addDoc()">Save Document</button></div>
 </div></div>`);
}
function addDoc(){
 const get=id=>document.getElementById(id).value.trim();
 state.docs.push({no:get("fno"),type:get("ftype"),desc:get("fdesc"),rev:get("frev"),project:get("fproject"),date:get("fdate"),due:get("fdue"),submittedTo:get("fto"),status:get("fstatus"),remarks:get("fremarks")});
 save();document.getElementById("modal").remove();toast("Document saved");render();
}
function exportCSV(){
 const rows=state.active==="documents"?state.docs:state.docs.filter(d=>d.type===modules[state.active].replace(" Drawings","").replace(" Submittals"," Material Submittal"));
 const header=["Document No.","Type","Description","Revision","Project","Date","Status","Due Date","Submitted To","Remarks"];
 const body=rows.map(r=>[r.no,r.type,r.desc,r.rev,r.project,r.date,r.status,r.due,r.submittedTo,r.remarks]);
 const csv=[header,...body].map(row=>row.map(v=>`"${String(v??"").replaceAll('"','""')}"`).join(",")).join("\n");
 const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download=`${modules[state.active]}_${new Date().toISOString().slice(0,10)}.csv`;a.click();
}
function render(){
 const title=modules[state.active];
 document.getElementById("app").innerHTML=`<div class="app">${nav()}<main class="main"><div class="top"><div><h1>${title}</h1><div class="muted">Villa 699 · Professional Document Control System</div></div><div class="user">Admin · Document Controller</div></div>${state.active==="dashboard"?dashboard():modulePage()}</main></div><div class="toast"></div>`;
}
render();
