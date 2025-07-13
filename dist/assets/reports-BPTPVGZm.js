import{j as e,am as fe,al as ce,ax as de,a5 as ve,X as Ne,e as te,O as ae,a8 as k,Z as _,ay as we,af as re,Q as le,az as ie,aA as Ce,h as Re,y as Se,aB as ke,a3 as oe,a9 as he,d as $e,$ as Le}from"./ui-vendor-B2pFoMNi.js";import{a as u}from"./react-vendor-C7H4r9IR.js";import{B as x,C as v,b as Q,c as W,e as J,d as N,a as z,h as De,L as f,I as P}from"./index-DyoA978M.js";import{B as w}from"./badge-DN3GUanR.js";import{S as $,a as L,b as D,c as T,d}from"./select-_2QWMkjB.js";import{D as Te,f as Fe,a as ze,b as Me,c as Ie,d as Pe,e as Ae}from"./dialog-C5VgeWe5.js";import{b as F,R as A,P as Ee,g as He,h as Oe,T as E,A as Ge,C as B,X as K,Y as X,d as Y,e as Ue,i as Ve,B as Be,L as Ke,a as Xe}from"./charts-vendor-BwF8VYvl.js";import{g as Ye}from"./analytics-BSSJJxsB.js";import"./db-vendor-BXl3LOEh.js";import"./data-vendor-CIeUuS6O.js";const b=["#8b5cf6","#ec4899","#06b6d4","#10b981","#f59e0b","#ef4444"];function Ze({reportData:r,onClose:o}){const[g,p]=u.useState(0),h=()=>{window.print()},y=()=>{const l=Qe(r),a=new Blob([l],{type:"text/html"}),n=URL.createObjectURL(a),t=document.createElement("a");t.href=n,t.download=`${r.title.replace(/\s+/g,"-").toLowerCase()}-${F(new Date,"yyyy-MM-dd")}.html`,document.body.appendChild(t),t.click(),document.body.removeChild(t),URL.revokeObjectURL(n)},C=()=>{navigator.share?navigator.share({title:r.title,text:`Check out this ${r.title} report`,url:window.location.href}):(navigator.clipboard.writeText(window.location.href),alert("Report link copied to clipboard!"))},H=()=>{const l=encodeURIComponent(r.title),a=encodeURIComponent(`Please find the ${r.title} report attached.

Generated on: ${F(new Date(r.metadata.generatedAt),"MMMM dd, yyyy HH:mm")}
Report Period: ${r.metadata.reportPeriod}`);window.open(`mailto:?subject=${l}&body=${a}`)},R=l=>{const{chartType:a,data:n}=l;switch(a){case"line":return e.jsx(A,{width:"100%",height:300,children:e.jsxs(Ke,{data:n,children:[e.jsx(B,{strokeDasharray:"3 3",className:"stroke-gray-200"}),e.jsx(K,{dataKey:Object.keys(n[0])[0],className:"text-gray-600",fontSize:12}),e.jsx(X,{className:"text-gray-600",fontSize:12}),e.jsx(E,{contentStyle:{backgroundColor:"white",border:"1px solid #e5e7eb",borderRadius:"8px"}}),e.jsx(Y,{}),Object.keys(n[0]).slice(1).map((t,c)=>e.jsx(Xe,{type:"monotone",dataKey:t,stroke:b[c%b.length],strokeWidth:2},t))]})});case"bar":return e.jsx(A,{width:"100%",height:300,children:e.jsxs(Ve,{data:n,children:[e.jsx(B,{strokeDasharray:"3 3",className:"stroke-gray-200"}),e.jsx(K,{dataKey:Object.keys(n[0])[0],className:"text-gray-600",fontSize:12}),e.jsx(X,{className:"text-gray-600",fontSize:12}),e.jsx(E,{contentStyle:{backgroundColor:"white",border:"1px solid #e5e7eb",borderRadius:"8px"}}),e.jsx(Y,{}),Object.keys(n[0]).slice(1).map((t,c)=>e.jsx(Be,{dataKey:t,fill:b[c%b.length]},t))]})});case"area":return e.jsx(A,{width:"100%",height:300,children:e.jsxs(Ge,{data:n,children:[e.jsx(B,{strokeDasharray:"3 3",className:"stroke-gray-200"}),e.jsx(K,{dataKey:Object.keys(n[0])[0],className:"text-gray-600",fontSize:12}),e.jsx(X,{className:"text-gray-600",fontSize:12}),e.jsx(E,{contentStyle:{backgroundColor:"white",border:"1px solid #e5e7eb",borderRadius:"8px"}}),e.jsx(Y,{}),Object.keys(n[0]).slice(1).map((t,c)=>e.jsx(Ue,{type:"monotone",dataKey:t,stackId:"1",stroke:b[c%b.length],fill:b[c%b.length],fillOpacity:.6},t))]})});case"pie":return e.jsx(A,{width:"100%",height:300,children:e.jsxs(Ee,{children:[e.jsx(He,{data:n,cx:"50%",cy:"50%",labelLine:!1,label:({name:t,percentage:c})=>`${t} ${c}%`,outerRadius:80,fill:"#8884d8",dataKey:"value",children:n.map((t,c)=>e.jsx(Oe,{fill:b[c%b.length]},`cell-${c}`))}),e.jsx(E,{})]})});default:return e.jsx("div",{children:"Unsupported chart type"})}},O=l=>{const{data:a}=l;return e.jsxs("div",{className:"space-y-6",children:[e.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4",children:Object.entries(a).filter(([n])=>typeof a[n]=="number"&&!["keyInsights","keyMetrics","highlights","insights","systemHealth"].includes(n)).map(([n,t])=>e.jsxs("div",{className:"p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg",children:[e.jsx("p",{className:"text-sm font-medium text-gray-600 capitalize",children:n.replace(/([A-Z])/g," $1").trim()}),e.jsx("p",{className:"text-2xl font-bold text-gray-900",children:typeof t=="number"?n.toLowerCase().includes("revenue")||n.toLowerCase().includes("profit")?`$${t.toLocaleString()}`:n.toLowerCase().includes("rate")||n.toLowerCase().includes("margin")?`${t}%`:t.toLocaleString():String(t)})]},n))}),(a.keyInsights||a.keyMetrics||a.highlights||a.insights||a.systemHealth)&&e.jsxs("div",{className:"bg-blue-50 border border-blue-200 rounded-lg p-6",children:[e.jsxs("h4",{className:"font-semibold text-blue-900 mb-4 flex items-center gap-2",children:[e.jsx(_,{className:"h-5 w-5"}),"Key Insights"]}),e.jsx("ul",{className:"space-y-2",children:(a.keyInsights||a.keyMetrics||a.highlights||a.insights||a.systemHealth)?.map((n,t)=>e.jsxs("li",{className:"flex items-start gap-2 text-blue-800",children:[e.jsx("div",{className:"w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"}),e.jsx("span",{className:"text-sm",children:n})]},t))})]})]})},G=l=>{const{headers:a,data:n}=l;return e.jsx("div",{className:"overflow-x-auto",children:e.jsxs("table",{className:"w-full border-collapse",children:[e.jsx("thead",{children:e.jsx("tr",{className:"bg-gradient-to-r from-purple-600 to-pink-600 text-white",children:a?.map((t,c)=>e.jsx("th",{className:"px-4 py-3 text-left font-semibold text-sm",children:t},c))})}),e.jsx("tbody",{children:n.map((t,c)=>e.jsx("tr",{className:`border-b ${c%2===0?"bg-gray-50":"bg-white"} hover:bg-purple-50 transition-colors`,children:t.map((U,M)=>e.jsx("td",{className:"px-4 py-3 text-sm text-gray-700",children:U},M))},c))})]})})};return e.jsx("div",{className:"fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4",children:e.jsxs("div",{className:"bg-white rounded-lg shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden",children:[e.jsxs("div",{className:"flex items-center justify-between p-6 border-b bg-gradient-to-r from-purple-600 to-pink-600 text-white",children:[e.jsxs("div",{children:[e.jsx("h2",{className:"text-2xl font-bold",children:r.title}),e.jsxs("p",{className:"text-purple-100 text-sm",children:["Generated on ",F(new Date(r.metadata.generatedAt),"MMMM dd, yyyy HH:mm")," • Period: ",r.metadata.reportPeriod]})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(x,{variant:"ghost",size:"sm",onClick:h,className:"text-white hover:bg-white/20",children:e.jsx(fe,{className:"h-4 w-4"})}),e.jsx(x,{variant:"ghost",size:"sm",onClick:y,className:"text-white hover:bg-white/20",children:e.jsx(ce,{className:"h-4 w-4"})}),e.jsx(x,{variant:"ghost",size:"sm",onClick:C,className:"text-white hover:bg-white/20",children:e.jsx(de,{className:"h-4 w-4"})}),e.jsx(x,{variant:"ghost",size:"sm",onClick:H,className:"text-white hover:bg-white/20",children:e.jsx(ve,{className:"h-4 w-4"})}),e.jsx(x,{variant:"ghost",size:"sm",onClick:o,className:"text-white hover:bg-white/20",children:e.jsx(Ne,{className:"h-4 w-4"})})]})]}),e.jsxs("div",{className:"flex h-[calc(95vh-80px)]",children:[e.jsx("div",{className:"w-64 bg-gray-50 border-r overflow-y-auto",children:e.jsxs("div",{className:"p-4",children:[e.jsx("h3",{className:"font-semibold text-gray-900 mb-4",children:"Report Sections"}),e.jsx("nav",{className:"space-y-2",children:r.sections.map((l,a)=>e.jsx("button",{onClick:()=>p(a),className:`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${g===a?"bg-purple-100 text-purple-700 font-medium":"text-gray-600 hover:bg-gray-100"}`,children:e.jsxs("div",{className:"flex items-center gap-2",children:[l.type==="summary"&&e.jsx(te,{className:"h-4 w-4"}),l.type==="chart"&&e.jsx(ae,{className:"h-4 w-4"}),l.type==="table"&&e.jsx(k,{className:"h-4 w-4"}),l.title]})},a))})]})}),e.jsx("div",{className:"flex-1 overflow-y-auto",children:e.jsx("div",{className:"p-6",children:r.sections.map((l,a)=>e.jsx("div",{className:`${g===a?"block":"hidden"}`,children:e.jsxs(v,{className:"border-0 shadow-sm",children:[e.jsxs(Q,{children:[e.jsxs(W,{className:"flex items-center gap-2",children:[l.type==="summary"&&e.jsx(te,{className:"h-5 w-5 text-purple-600"}),l.type==="chart"&&e.jsx(ae,{className:"h-5 w-5 text-blue-600"}),l.type==="table"&&e.jsx(k,{className:"h-5 w-5 text-green-600"}),l.title]}),e.jsxs(J,{children:[l.type==="summary"&&"Key metrics and insights overview",l.type==="chart"&&`Visual representation of ${l.title.toLowerCase()}`,l.type==="table"&&`Detailed breakdown of ${l.title.toLowerCase()}`]})]}),e.jsxs(N,{children:[l.type==="summary"&&O(l),l.type==="chart"&&R(l),l.type==="table"&&G(l)]})]})},a))})})]}),e.jsx("div",{className:"border-t bg-gray-50 px-6 py-4",children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{className:"text-sm text-gray-600",children:["Report ID: ",r.metadata.templateId," • Generated by Hairvana Analytics Engine"]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsxs(w,{variant:"outline",children:["Section ",g+1," of ",r.sections.length]}),e.jsxs("div",{className:"flex gap-1",children:[e.jsx(x,{variant:"outline",size:"sm",onClick:()=>p(Math.max(0,g-1)),disabled:g===0,children:"Previous"}),e.jsx(x,{variant:"outline",size:"sm",onClick:()=>p(Math.min(r.sections.length-1,g+1)),disabled:g===r.sections.length-1,children:"Next"})]})]})]})})]})})}function Qe(r){return`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${r.title}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            background: #fff;
            padding: 40px;
          }
          .report-container { max-width: 1200px; margin: 0 auto; }
          .header { 
            background: linear-gradient(135deg, #8b5cf6, #ec4899);
            color: white;
            padding: 30px;
            border-radius: 12px;
            margin-bottom: 30px;
          }
          .header h1 { font-size: 32px; margin-bottom: 10px; }
          .header p { opacity: 0.9; }
          .section { 
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .section h2 { 
            color: #8b5cf6;
            margin-bottom: 20px;
            font-size: 24px;
          }
          .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
          }
          .metric-card {
            background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
            padding: 20px;
            border-radius: 8px;
            text-align: center;
          }
          .metric-value {
            font-size: 28px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 5px;
          }
          .metric-label {
            color: #6b7280;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .insights {
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            border-radius: 8px;
            padding: 20px;
          }
          .insights h3 {
            color: #1e40af;
            margin-bottom: 15px;
          }
          .insights ul {
            list-style: none;
          }
          .insights li {
            margin-bottom: 8px;
            padding-left: 20px;
            position: relative;
          }
          .insights li:before {
            content: '•';
            color: #3b82f6;
            font-weight: bold;
            position: absolute;
            left: 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th {
            background: linear-gradient(135deg, #8b5cf6, #ec4899);
            color: white;
            padding: 15px;
            text-align: left;
            font-weight: 600;
          }
          td {
            padding: 12px 15px;
            border-bottom: 1px solid #e5e7eb;
          }
          tr:nth-child(even) {
            background-color: #f9fafb;
          }
          .footer {
            text-align: center;
            color: #6b7280;
            font-size: 12px;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
          }
          @media print {
            body { padding: 20px; }
            .section { break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="report-container">
          <div class="header">
            <h1>${r.title}</h1>
            <p>Generated on ${F(new Date(r.metadata.generatedAt),"MMMM dd, yyyy HH:mm")} | Period: ${r.metadata.reportPeriod}</p>
          </div>
          
          ${r.sections.map(o=>`
            <div class="section">
              <h2>${o.title}</h2>
              ${o.type==="summary"?We(o):""}
              ${o.type==="table"?Je(o):""}
              ${o.type==="chart"?"<p><em>Chart visualization available in interactive version</em></p>":""}
            </div>
          `).join("")}
          
          <div class="footer">
            <p>Report generated by Hairvana Analytics Engine</p>
            <p>Report ID: ${r.metadata.templateId}</p>
          </div>
        </div>
      </body>
    </html>
  `}function We(r){const{data:o}=r,g=Object.entries(o).filter(([h])=>typeof o[h]=="number"&&!["keyInsights","keyMetrics","highlights","insights","systemHealth"].includes(h)),p=o.keyInsights||o.keyMetrics||o.highlights||o.insights||o.systemHealth||[];return`
    <div class="metrics-grid">
      ${g.map(([h,y])=>`
        <div class="metric-card">
          <div class="metric-value">
            ${typeof y=="number"?h.toLowerCase().includes("revenue")||h.toLowerCase().includes("profit")?`$${y.toLocaleString()}`:h.toLowerCase().includes("rate")||h.toLowerCase().includes("margin")?`${y}%`:y.toLocaleString():String(y)}
          </div>
          <div class="metric-label">${h.replace(/([A-Z])/g," $1").trim()}</div>
        </div>
      `).join("")}
    </div>
    
    ${p.length>0?`
      <div class="insights">
        <h3>Key Insights</h3>
        <ul>
          ${p.map(h=>`<li>${h}</li>`).join("")}
        </ul>
      </div>
    `:""}
  `}function Je(r){const{headers:o,data:g}=r;return`
    <table>
      <thead>
        <tr>
          ${o?.map(p=>`<th>${p}</th>`).join("")||""}
        </tr>
      </thead>
      <tbody>
        ${g.map(p=>`
          <tr>
            ${p.map(h=>`<td>${h}</td>`).join("")}
          </tr>
        `).join("")}
      </tbody>
    </table>
  `}async function ne(){return z("/reports")}async function _e(r){return z("/reports",{method:"POST",body:JSON.stringify(r)})}async function qe(r){return z(`/reports/${r}`,{method:"DELETE"})}async function es(r){return z(`/reports/${r}`)}async function ss(){return z("/report-templates")}const ts={completed:"bg-green-100 text-green-800",generating:"bg-blue-100 text-blue-800",scheduled:"bg-yellow-100 text-yellow-800",failed:"bg-red-100 text-red-800"},as={completed:_,generating:he,scheduled:oe,failed:ke},Z={financial:"bg-green-100 text-green-800",operational:"bg-blue-100 text-blue-800",user:"bg-purple-100 text-purple-800",salon:"bg-orange-100 text-orange-800",custom:"bg-gray-100 text-gray-800"};function ps(){const[r,o]=u.useState([]),[g,p]=u.useState(!0),[h,y]=u.useState(""),[C,H]=u.useState("all"),[R,O]=u.useState("all"),[G,l]=u.useState(!1),[a,n]=u.useState(null),[t,c]=u.useState({name:"",description:"",dateRange:"30d",startDate:"",endDate:"",format:"pdf",filters:[],schedule:"once"}),[U,M]=u.useState(new Set),[q,I]=u.useState(null),{toast:j}=De(),[ee,xe]=u.useState([]);u.useEffect(()=>{V()},[]);const V=async()=>{p(!0);try{const[s,i]=await Promise.all([ss(),ne()]);xe(s.map(m=>({...m,icon:we[m.icon]||k}))),o(i)}catch{j({title:"Error",description:"Failed to fetch data",variant:"destructive"})}finally{p(!1)}},me=async()=>{p(!0);try{const s=await ne();o(s)}catch{j({title:"Error",description:"Failed to fetch reports. Please try again.",variant:"destructive"})}finally{p(!1)}},se=r.filter(s=>{const i=s.name.toLowerCase().includes(h.toLowerCase())||s.description.toLowerCase().includes(h.toLowerCase()),m=C==="all"||s.type===C,S=R==="all"||s.status===R;return i&&m&&S}),pe=async()=>{if(a)try{const s={templateId:a.id,name:t.name||a.name,description:t.description||a.description,type:a.type,parameters:{dateRange:t.dateRange,startDate:t.startDate,endDate:t.endDate,format:t.format,filters:t.filters,schedule:t.schedule}};await _e(s),j({title:"Report created successfully"}),l(!1),n(null),c({name:"",description:"",dateRange:"30d",startDate:"",endDate:"",format:"pdf",filters:[],schedule:"once"}),V()}catch{j({title:"Error creating report",description:"Please try again later.",variant:"destructive"})}},ge=async s=>{const i=`temp_${Date.now()}`;M(m=>new Set(m).add(i));try{const m=await Ye(s.id,{dateRange:"30d",format:"interactive",filters:[]});I(m.data),j({title:"Report generated successfully",description:`${s.name} is ready for viewing.`})}catch{j({title:"Error generating report",description:"Please try again later.",variant:"destructive"})}finally{M(m=>{const S=new Set(m);return S.delete(i),S})}},ue=s=>{if(s.status!=="completed"||!s.downloadUrl){j({title:"Report not available",description:"This report is not ready for download yet.",variant:"destructive"});return}j({title:"Download started",description:`Downloading ${s.name}...`})},je=async s=>{try{await qe(s),j({title:"Report deleted"}),V()}catch{j({title:"Error deleting report",description:"Please try again later.",variant:"destructive"})}},be=async s=>{try{const i=await es(s);i&&i.parameters&&i.sections?I(i):i&&i.data?I(i.data):j({title:"Error",description:"No report data available",variant:"destructive"})}catch{j({title:"Error",description:"Failed to load report",variant:"destructive"})}},ye=s=>{switch(s){case"7d":return"Last 7 days";case"30d":return"Last 30 days";case"90d":return"Last 90 days";case"1y":return"Last year";case"custom":return"Custom range";default:return s}};return g?e.jsx("div",{className:"min-h-screen flex items-center justify-center",children:e.jsx("div",{className:"animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"})}):e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsxs("div",{children:[e.jsx("h1",{className:"text-2xl font-bold text-gray-900",children:"Reports & Analytics"}),e.jsx("p",{className:"text-gray-600",children:"Generate, manage, and download comprehensive business reports"})]}),e.jsxs("div",{className:"flex gap-2",children:[e.jsxs(x,{variant:"outline",onClick:me,children:[e.jsx(re,{className:"h-4 w-4 mr-2"}),"Refresh"]}),e.jsxs(Te,{open:G,onOpenChange:l,children:[e.jsx(Fe,{asChild:!0,children:e.jsxs(x,{className:"bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700",children:[e.jsx(le,{className:"h-4 w-4 mr-2"}),"Create Report"]})}),e.jsxs(ze,{className:"max-w-4xl max-h-[90vh] overflow-y-auto",children:[e.jsxs(Me,{children:[e.jsx(Ie,{children:"Create New Report"}),e.jsx(Pe,{children:"Choose a template and configure your report parameters"})]}),a?e.jsxs("div",{className:"space-y-6",children:[e.jsx("div",{className:"p-4 bg-purple-50 border border-purple-200 rounded-lg",children:e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:`p-2 rounded-lg bg-gradient-to-r ${a.color}`,children:e.jsx(a.icon,{className:"h-5 w-5 text-white"})}),e.jsxs("div",{children:[e.jsx("h3",{className:"font-semibold text-gray-900",children:a.name}),e.jsx("p",{className:"text-sm text-gray-600",children:a.description})]})]})}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:[e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx(f,{htmlFor:"reportName",children:"Report Name"}),e.jsx(P,{id:"reportName",placeholder:a.name,value:t.name,onChange:s=>c(i=>({...i,name:s.target.value}))})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(f,{htmlFor:"reportDescription",children:"Description"}),e.jsx("textarea",{id:"reportDescription",rows:3,className:"flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",placeholder:a.description,value:t.description,onChange:s=>c(i=>({...i,description:s.target.value}))})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(f,{htmlFor:"dateRange",children:"Date Range"}),e.jsxs($,{value:t.dateRange,onValueChange:s=>c(i=>({...i,dateRange:s})),children:[e.jsx(L,{children:e.jsx(D,{})}),e.jsxs(T,{children:[e.jsx(d,{value:"7d",children:"Last 7 days"}),e.jsx(d,{value:"30d",children:"Last 30 days"}),e.jsx(d,{value:"90d",children:"Last 90 days"}),e.jsx(d,{value:"1y",children:"Last year"}),e.jsx(d,{value:"custom",children:"Custom range"})]})]})]}),t.dateRange==="custom"&&e.jsxs("div",{className:"grid grid-cols-2 gap-4",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx(f,{htmlFor:"startDate",children:"Start Date"}),e.jsx(P,{id:"startDate",type:"date",value:t.startDate,onChange:s=>c(i=>({...i,startDate:s.target.value}))})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(f,{htmlFor:"endDate",children:"End Date"}),e.jsx(P,{id:"endDate",type:"date",value:t.endDate,onChange:s=>c(i=>({...i,endDate:s.target.value}))})]})]})]}),e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx(f,{htmlFor:"format",children:"Export Format"}),e.jsxs($,{value:t.format,onValueChange:s=>c(i=>({...i,format:s})),children:[e.jsx(L,{children:e.jsx(D,{})}),e.jsxs(T,{children:[e.jsx(d,{value:"pdf",children:"PDF Document"}),e.jsx(d,{value:"excel",children:"Excel Spreadsheet"}),e.jsx(d,{value:"csv",children:"CSV File"})]})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(f,{htmlFor:"schedule",children:"Schedule"}),e.jsxs($,{value:t.schedule,onValueChange:s=>c(i=>({...i,schedule:s})),children:[e.jsx(L,{children:e.jsx(D,{})}),e.jsxs(T,{children:[e.jsx(d,{value:"once",children:"Generate once"}),e.jsx(d,{value:"daily",children:"Daily"}),e.jsx(d,{value:"weekly",children:"Weekly"}),e.jsx(d,{value:"monthly",children:"Monthly"})]})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(f,{children:"Report Fields"}),e.jsx("div",{className:"space-y-2 max-h-32 overflow-y-auto",children:a.fields.map(s=>e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("input",{type:"checkbox",id:s,defaultChecked:!0,className:"rounded"}),e.jsx(f,{htmlFor:s,className:"text-sm",children:s})]},s))})]})]})]})]}):e.jsx("div",{className:"space-y-4",children:e.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:ee.map(s=>{const i=s.icon;return e.jsxs("div",{onClick:()=>n(s),className:`p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-purple-200 hover:bg-purple-50 ${s.popular?"border-blue-200 bg-blue-50":"border-gray-200"}`,children:[s.popular&&e.jsx(w,{className:"mb-2 bg-blue-600 text-white",children:"Popular"}),e.jsxs("div",{className:"flex items-center gap-3 mb-3",children:[e.jsx("div",{className:`p-2 rounded-lg bg-gradient-to-r ${s.color}`,children:e.jsx(i,{className:"h-5 w-5 text-white"})}),e.jsxs("div",{children:[e.jsx("h3",{className:"font-semibold text-gray-900",children:s.name}),e.jsx(w,{className:Z[s.type],children:s.type})]})]}),e.jsx("p",{className:"text-sm text-gray-600 mb-3",children:s.description}),e.jsxs("div",{className:"space-y-1",children:[e.jsx("p",{className:"text-xs font-medium text-gray-700",children:"Includes:"}),s.fields.slice(0,3).map(m=>e.jsxs("p",{className:"text-xs text-gray-600",children:["• ",m]},m)),s.fields.length>3&&e.jsxs("p",{className:"text-xs text-gray-500",children:["+",s.fields.length-3," more"]})]})]},s.id)})})}),e.jsxs(Ae,{children:[e.jsx(x,{variant:"outline",onClick:()=>{n(null),l(!1)},children:"Cancel"}),a&&e.jsx(x,{onClick:pe,className:"bg-purple-600 hover:bg-purple-700",children:"Create Report"})]})]})]})]})]}),e.jsxs(v,{className:"border-0 shadow-sm",children:[e.jsxs(Q,{children:[e.jsx(W,{children:"Quick Report Templates"}),e.jsx(J,{children:"Generate instant reports with pre-configured templates"})]}),e.jsx(N,{children:e.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",children:ee.map(s=>{const i=s.icon,m=Array.from(U).some(S=>S.includes(s.id));return e.jsxs("div",{className:"p-4 border rounded-lg hover:bg-gray-50 transition-colors",children:[s.popular&&e.jsx(w,{className:"mb-2 bg-blue-600 text-white",children:"Popular"}),e.jsxs("div",{className:"flex items-center gap-3 mb-3",children:[e.jsx("div",{className:`p-2 rounded-lg bg-gradient-to-r ${s.color}`,children:e.jsx(i,{className:"h-5 w-5 text-white"})}),e.jsxs("div",{children:[e.jsx("h3",{className:"font-semibold text-gray-900",children:s.name}),e.jsx(w,{className:Z[s.type],children:s.type})]})]}),e.jsx("p",{className:"text-sm text-gray-600 mb-4",children:s.description}),e.jsxs("div",{className:"flex gap-2",children:[e.jsx(x,{onClick:()=>ge(s),disabled:m,className:"flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700",children:m?e.jsxs(e.Fragment,{children:[e.jsx(ie,{className:"h-4 w-4 mr-2 animate-spin"}),"Generating..."]}):e.jsxs(e.Fragment,{children:[e.jsx(Ce,{className:"h-4 w-4 mr-2"}),"Show Report"]})}),e.jsx(x,{variant:"outline",onClick:()=>{n(s),l(!0)},children:e.jsx(Re,{className:"h-4 w-4"})})]})]},s.id)})})})]}),e.jsx(v,{className:"border-0 shadow-sm",children:e.jsx(N,{className:"p-6",children:e.jsxs("div",{className:"flex flex-col lg:flex-row gap-4 justify-between",children:[e.jsxs("div",{className:"relative flex-1 max-w-md",children:[e.jsx(Se,{className:"absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"}),e.jsx(P,{placeholder:"Search reports...",value:h,onChange:s=>y(s.target.value),className:"pl-10"})]}),e.jsxs("div",{className:"flex flex-wrap gap-2",children:[e.jsxs($,{value:C,onValueChange:s=>H(s),children:[e.jsx(L,{className:"w-40",children:e.jsx(D,{placeholder:"All Types"})}),e.jsxs(T,{children:[e.jsx(d,{value:"all",children:"All Types"}),e.jsx(d,{value:"financial",children:"Financial"}),e.jsx(d,{value:"operational",children:"Operational"}),e.jsx(d,{value:"user",children:"User"}),e.jsx(d,{value:"salon",children:"Salon"}),e.jsx(d,{value:"custom",children:"Custom"})]})]}),e.jsxs($,{value:R,onValueChange:s=>O(s),children:[e.jsx(L,{className:"w-40",children:e.jsx(D,{placeholder:"All Status"})}),e.jsxs(T,{children:[e.jsx(d,{value:"all",children:"All Status"}),e.jsx(d,{value:"completed",children:"Completed"}),e.jsx(d,{value:"generating",children:"Generating"}),e.jsx(d,{value:"scheduled",children:"Scheduled"}),e.jsx(d,{value:"failed",children:"Failed"})]})]})]})]})})}),e.jsxs(v,{className:"border-0 shadow-sm",children:[e.jsxs(Q,{children:[e.jsx(W,{children:"Generated Reports"}),e.jsx(J,{children:"View and manage all your generated reports"})]}),e.jsxs(N,{children:[e.jsx("div",{className:"space-y-4",children:se.map(s=>{const i=as[s.status];return e.jsxs("div",{className:"flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors",children:[e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsx("div",{className:"w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center",children:e.jsx(k,{className:"h-6 w-6 text-purple-600"})}),e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center gap-2 mb-1",children:[e.jsx("h3",{className:"font-semibold text-gray-900",children:s.name}),e.jsx(w,{className:Z[s.type],children:s.type}),e.jsxs(w,{className:ts[s.status],children:[e.jsx(i,{className:"h-3 w-3 mr-1"}),s.status]})]}),e.jsx("p",{className:"text-sm text-gray-600 mb-1",children:s.description}),e.jsxs("div",{className:"flex items-center gap-4 text-xs text-gray-500",children:[e.jsxs("span",{children:["Created by ",s.createdBy]}),e.jsx("span",{children:"•"}),e.jsx("span",{children:F(new Date(s.createdAt),"MMM dd, yyyy HH:mm")}),s.size&&e.jsxs(e.Fragment,{children:[e.jsx("span",{children:"•"}),e.jsx("span",{children:s.size})]}),e.jsx("span",{children:"•"}),e.jsx("span",{children:ye(s.parameters.dateRange)}),e.jsx("span",{children:"•"}),e.jsx("span",{children:s.parameters?.format?s.parameters.format.toUpperCase():""})]})]})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[s.status==="completed"&&e.jsxs(e.Fragment,{children:[e.jsx(x,{variant:"ghost",size:"sm",onClick:()=>ue(s),className:"hover:bg-green-50 hover:text-green-600",children:e.jsx(ce,{className:"h-4 w-4"})}),e.jsx(x,{variant:"ghost",size:"sm",className:"hover:bg-blue-50 hover:text-blue-600",onClick:()=>be(s.id),children:e.jsx($e,{className:"h-4 w-4"})}),e.jsx(x,{variant:"ghost",size:"sm",className:"hover:bg-purple-50 hover:text-purple-600",children:e.jsx(de,{className:"h-4 w-4"})})]}),s.status==="generating"&&e.jsxs("div",{className:"flex items-center gap-2 text-blue-600",children:[e.jsx(ie,{className:"h-4 w-4 animate-spin"}),e.jsx("span",{className:"text-sm",children:"Generating..."})]}),s.status==="failed"&&e.jsx(x,{variant:"ghost",size:"sm",className:"hover:bg-orange-50 hover:text-orange-600",children:e.jsx(re,{className:"h-4 w-4"})}),e.jsx(x,{variant:"ghost",size:"sm",onClick:()=>je(s.id),className:"hover:bg-red-50 hover:text-red-600",children:e.jsx(Le,{className:"h-4 w-4"})})]})]},s.id)})}),se.length===0&&e.jsxs("div",{className:"text-center py-12",children:[e.jsx(k,{className:"h-12 w-12 mx-auto mb-4 text-gray-300"}),e.jsx("h3",{className:"text-lg font-medium text-gray-900 mb-2",children:"No reports found"}),e.jsx("p",{className:"text-gray-600 mb-4",children:h||C!=="all"||R!=="all"?"Try adjusting your filters to see more reports.":"Create your first report to get started with analytics."}),e.jsxs(x,{onClick:()=>l(!0),className:"bg-purple-600 hover:bg-purple-700",children:[e.jsx(le,{className:"h-4 w-4 mr-2"}),"Create Report"]})]})]})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-4 gap-6",children:[e.jsx(v,{className:"border-0 shadow-sm",children:e.jsx(N,{className:"p-6",children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-sm font-medium text-gray-600",children:"Total Reports"}),e.jsx("p",{className:"text-2xl font-bold text-gray-900",children:r.length})]}),e.jsx(k,{className:"h-8 w-8 text-blue-500"})]})})}),e.jsx(v,{className:"border-0 shadow-sm",children:e.jsx(N,{className:"p-6",children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-sm font-medium text-gray-600",children:"Completed"}),e.jsx("p",{className:"text-2xl font-bold text-green-600",children:r.filter(s=>s.status==="completed").length})]}),e.jsx(_,{className:"h-8 w-8 text-green-500"})]})})}),e.jsx(v,{className:"border-0 shadow-sm",children:e.jsx(N,{className:"p-6",children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-sm font-medium text-gray-600",children:"Generating"}),e.jsx("p",{className:"text-2xl font-bold text-blue-600",children:r.filter(s=>s.status==="generating").length})]}),e.jsx(he,{className:"h-8 w-8 text-blue-500"})]})})}),e.jsx(v,{className:"border-0 shadow-sm",children:e.jsx(N,{className:"p-6",children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-sm font-medium text-gray-600",children:"Scheduled"}),e.jsx("p",{className:"text-2xl font-bold text-yellow-600",children:r.filter(s=>s.status==="scheduled").length})]}),e.jsx(oe,{className:"h-8 w-8 text-yellow-500"})]})})})]}),q&&e.jsx(Ze,{reportData:q,onClose:()=>I(null)})]})}export{ps as default};
