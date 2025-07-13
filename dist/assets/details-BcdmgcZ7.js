import{j as e,ac as he,a2 as He,ah as pe,a0 as Ye,af as Re,Y as ne,a8 as z,a3 as H,a4 as ie,ai as re,aj as le,_ as oe,U as Ge,B as Ve,C as S,Z as w,ak as de,al as ce,am as qe,d as Je,a5 as We,ag as Ze}from"./ui-vendor-B2pFoMNi.js";import{k as Ke,u as Xe,a as d,L as me}from"./react-vendor-C7H4r9IR.js";import{h as Qe,B as r,C as g,d as b,A as es,f as ss,g as ts,b as C,c as M,e as as,L as x,I as j}from"./index-DHCScZ-8.js";import{B as Y}from"./badge-C_Aht46l.js";import{A as ns,a as is,b as rs,c as ls,d as os,e as ds,f as cs,g as ms}from"./alert-dialog-B6xWP7Af.js";import{D as I,a as T,b as F,c as L,d as E,e as B}from"./dialog-CWP7-1N6.js";import{d as xs,f as hs,c as ps,u as xe,b as us}from"./subscriptions-Dpt9SgIW.js";import{b as h}from"./charts-vendor-BwF8VYvl.js";import"./db-vendor-BXl3LOEh.js";import"./data-vendor-CIeUuS6O.js";const gs={active:"bg-green-100 text-green-800",trial:"bg-blue-100 text-blue-800",cancelled:"bg-red-100 text-red-800",past_due:"bg-yellow-100 text-yellow-800"},bs={Basic:"bg-gray-100 text-gray-800",Standard:"bg-blue-100 text-blue-800",Premium:"bg-purple-100 text-purple-800"},R={Basic:pe,Standard:He,Premium:he},js={paid:"bg-green-100 text-green-800",pending:"bg-yellow-100 text-yellow-800",failed:"bg-red-100 text-red-800",refunded:"bg-gray-100 text-gray-800"};function Ss(){const O=Ke();Xe();const{toast:c}=Qe(),[t,f]=d.useState(null),[ue,G]=d.useState(!0),[ge,U]=d.useState(!1),[be,D]=d.useState(!1),[je,P]=d.useState(!1),[V,Ne]=d.useState([]),[Ns,q]=d.useState(!0),[ys,J]=d.useState(null),[l,$]=d.useState(null),[ye,A]=d.useState(!1),[p,v]=d.useState({cardNumber:"",expiryMonth:"",expiryYear:"",cvv:"",cardholderName:""}),[fe,k]=d.useState(!1),[i,N]=d.useState({amount:"",description:"",taxAmount:"",status:"paid",notes:"",date:""}),[u,W]=d.useState({}),[Z,K]=d.useState(!1);d.useEffect(()=>{const s=async()=>{try{G(!0);const a=await xs(O.id);f(a)}catch(a){console.error("Error fetching subscription:",a),c({title:"Error",description:"Failed to load subscription details. Please try again.",variant:"destructive"})}finally{G(!1)}};O.id&&s()},[O.id,c]),d.useEffect(()=>{(async()=>{try{q(!0),J(null);const a=await hs();Ne(a)}catch{J("Failed to load plans"),c({title:"Error",description:"Failed to load subscription plans. Please try again.",variant:"destructive"})}finally{q(!1)}})()},[c]);const _=s=>{const a=t?.salonName||"",o=t?.ownerName||"",n=t?.ownerEmail||"",m=t?.salonPhone||"",y=t?.salonEmail||"",Oe=t?.plan||"",Ue=t?.billingCycle||"",_e=t?.paymentMethod?.brand||"",ze=t?.paymentMethod?.last4||"";return t?.paymentMethod?.expiryMonth,t?.paymentMethod?.expiryYear,`<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invoice ${s.invoiceNumber||s.invoice_number||""}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              background: #fff;
              padding: 40px;
            }
            .invoice-container { max-width: 800px; margin: 0 auto; }
            .header { 
              display: flex; 
              justify-content: space-between; 
              align-items: center; 
              margin-bottom: 40px; 
              padding-bottom: 20px;
              border-bottom: 3px solid #8b5cf6;
            }
            .company-info h1 { 
              font-size: 32px; 
              font-weight: bold; 
              background: linear-gradient(135deg, #8b5cf6, #ec4899);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
              margin-bottom: 5px;
            }
            .company-info p { color: #666; font-size: 14px; }
            .invoice-info { text-align: right; }
            .invoice-info h2 { 
              font-size: 28px; 
              color: #8b5cf6; 
              margin-bottom: 10px;
            }
            .invoice-details { 
              display: flex; 
              justify-content: space-between; 
              margin: 40px 0; 
              gap: 40px;
            }
            .bill-to, .invoice-meta { flex: 1; }
            .bill-to h3, .invoice-meta h3 { 
              font-size: 16px; 
              color: #8b5cf6; 
              margin-bottom: 15px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .bill-to p, .invoice-meta p { 
              margin-bottom: 8px; 
              font-size: 14px;
            }
            .invoice-table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 40px 0; 
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              border-radius: 8px;
              overflow: hidden;
            }
            .invoice-table th { 
              background: linear-gradient(135deg, #8b5cf6, #ec4899);
              color: white; 
              padding: 15px; 
              text-align: left; 
              font-weight: 600;
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .invoice-table td { 
              padding: 15px; 
              border-bottom: 1px solid #eee; 
              font-size: 14px;
            }
            .invoice-table tbody tr:hover { background-color: #f8f9fa; }
            .totals-section { 
              margin-top: 40px; 
              text-align: right; 
            }
            .totals-table { 
              margin-left: auto; 
              width: 300px;
            }
            .totals-table tr td { 
              padding: 8px 15px; 
              border: none;
            }
            .totals-table tr:last-child td { 
              border-top: 2px solid #8b5cf6;
              font-weight: bold; 
              font-size: 18px;
              color: #8b5cf6;
            }
            .status-badge { 
              display: inline-block;
              padding: 4px 12px; 
              border-radius: 20px; 
              font-size: 12px; 
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .status-paid { background: #dcfce7; color: #166534; }
            .status-pending { background: #fef3c7; color: #92400e; }
            .status-failed { background: #fee2e2; color: #991b1b; }
            .footer { 
              margin-top: 60px; 
              text-align: center; 
              color: #666; 
              font-size: 12px;
              border-top: 1px solid #eee;
              padding-top: 30px;
            }
            .footer p { margin-bottom: 5px; }
            .payment-info {
              background: #f8f9fa;
              padding: 20px;
              border-radius: 8px;
              margin: 30px 0;
              border-left: 4px solid #8b5cf6;
            }
            .payment-info h4 {
              color: #8b5cf6;
              margin-bottom: 10px;
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            @media print {
              body { padding: 20px; }
              .no-print { display: none !important; }
              .invoice-container { box-shadow: none; }
            }
            @page { margin: 1in; }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <!-- Header -->
            <div class="header">
              <div class="company-info">
                <h1>Hairvana</h1>
                <p>Professional Salon Management Platform</p>
                <p>admin@hairvana.com | (555) 123-4567</p>
              </div>
              <div class="invoice-info">
                <h2>INVOICE</h2>
                <span class="status-badge status-${s.status}">${s.status.toUpperCase()}</span>
              </div>
            </div>

            <!-- Invoice Details -->
            <div class="invoice-details">
              <div class="bill-to">
                <h3>Bill To</h3>
                <p><strong>${a}</strong></p>
                <p>${o}</p>
                ${y?`<p>Email: ${y}</p>`:""}
                ${m?`<p>Phone: ${m}</p>`:""}
                ${n&&n!==y?`<p>Owner Email: ${n}</p>`:""}
              </div>
              <div class="invoice-meta">
                <h3>Invoice Details</h3>
                <p><strong>Invoice #:</strong> ${s.invoiceNumber||s.invoice_number||""}</p>
                <p><strong>Date:</strong> ${s.date?h(new Date(s.date),"MMMM dd, yyyy"):""}</p>
                <p><strong>Due Date:</strong> ${s.date?h(new Date(s.date),"MMMM dd, yyyy"):""}</p>
                <p><strong>Billing Period:</strong> ${s.date?h(new Date(s.date),"MMM dd"):""} - ${s.date?h(new Date(new Date(s.date).getTime()+30*24*60*60*1e3),"MMM dd, yyyy"):""}</p>
              </div>
            </div>

            <!-- Service Details -->
            <table class="invoice-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Plan</th>
                  <th>Billing Cycle</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>${s.description||""}</strong><br>
                    <small>Subscription service for salon management platform</small>
                  </td>
                  <td>${Oe} Plan</td>
                  <td>${Ue}</td>
                  <td>$${s.subtotal!==void 0?Number(s.subtotal).toFixed(2):Number(s.amount??0).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            <!-- Payment Information -->
            <div class="payment-info">
              <h4>Payment Information</h4>
              <p><strong>Payment Method:</strong> ${_e} ending in ${ze}</p>
              <p><strong>Transaction ID:</strong> txn_${s.id||""}</p>
              <p><strong>Payment Date:</strong> ${s.date?h(new Date(s.date),"MMMM dd, yyyy"):""}</p>
            </div>

            <!-- Totals -->
            <div class="totals-section">
              <table class="totals-table">
                <tr>
                  <td>Subtotal:</td>
                  <td>$${s.subtotal!==void 0?Number(s.subtotal).toFixed(2):(Number(s.amount??0)-Number(s.taxAmount??s.tax_amount??0)).toFixed(2)}</td>
                </tr>
                <tr>
                  <td>Tax:</td>
                  <td>$${s.taxAmount!==void 0?Number(s.taxAmount).toFixed(2):s.tax_amount!==void 0?Number(s.tax_amount).toFixed(2):"0.00"}</td>
                </tr>
                <tr>
                  <td><strong>Total Amount:</strong></td>
                  <td><strong>$${Number(s.total??0).toFixed(2)}</strong></td>
                </tr>
              </table>
            </div>

            <!-- Footer -->
            <div class="footer">
              <p><strong>Thank you for your business!</strong></p>
              <p>This invoice was generated automatically by the Hairvana platform.</p>
              <p>For questions about this invoice, please contact our support team.</p>
              <p style="margin-top: 20px; font-size: 10px; color: #999;">
                Hairvana Inc. | 123 Business Ave, Suite 100 | Business City, BC 12345
              </p>
            </div>
          </div>

          <script>
            window.onload = function() {
              setTimeout(() => {
                window.print();
                window.onafterprint = function() {
                  window.close();
                }
              }, 500);
            }
          <\/script>
        </body>
      </html>`},ve=s=>{const a=window.open("","_blank","width=800,height=600");if(!a){alert("Please allow popups to print invoices");return}const o=_(s);a.document.write(o),a.document.close()},we=s=>{const a=_(s),o=new Blob([a],{type:"text/html"}),n=URL.createObjectURL(o),m=document.createElement("a");m.href=n,m.download=`invoice-${s.invoiceNumber||s.invoice_number}.html`,document.body.appendChild(m),m.click(),document.body.removeChild(m),URL.revokeObjectURL(n),alert(`Invoice ${s.invoiceNumber||s.invoice_number} downloaded successfully!`)},Ce=s=>{const a=window.open("","_blank","width=900,height=700,scrollbars=yes");if(!a){alert("Please allow popups to view invoices");return}const o=_(s).replace("<script>",'<!-- Auto-print disabled for view mode --><script style="display:none;">');a.document.write(o),a.document.close()},Me=s=>{const a=`Invoice ${s.invoiceNumber||s.invoice_number} - ${t?.salonName}`,o=`Dear ${t?.ownerName},

Please find attached your invoice ${s.invoiceNumber||s.invoice_number} for ${t?.salonName}.

Invoice Details:
- Amount: $${Number(s.amount).toFixed(2)}
- Date: ${h(new Date(s.date),"MMMM dd, yyyy")}
- Status: ${s.status.toUpperCase()}

Thank you for your business!

Best regards,
Hairvana Team`,n=`mailto:${t?.ownerEmail}?subject=${encodeURIComponent(a)}&body=${encodeURIComponent(o)}`;window.open(n)},De=()=>U(!0),Pe=()=>D(!0),$e=()=>P(!0),Ae=()=>A(!0),ke=()=>{W({}),N(s=>({...s,amount:t?.amount?String(t.amount):""})),k(!0)},Se=async()=>{if(t)try{await ps(t.id),f({...t,status:"cancelled"}),c({title:"Subscription cancelled",description:"The subscription has been cancelled successfully."})}catch{c({title:"Error",description:"Failed to cancel subscription. Please try again.",variant:"destructive"})}finally{U(!1)}},Ie=async()=>{if(!(!t||!l))try{await xe(t.id,{plan_id:l.id,amount:l.price}),f(s=>s&&{...s,plan:l.name,amount:l.price,usage:{...s.usage,bookingsLimit:l.limits.bookings,staffLimit:l.limits.staff,locationsLimit:l.limits.locations}}),c({title:"Plan upgraded successfully",description:`${t.salonName} has been upgraded to ${l.name} plan.`}),D(!1),$(null)}catch{c({title:"Error",description:"Failed to upgrade plan. Please try again.",variant:"destructive"})}},Te=async()=>{if(!(!t||!l))try{await xe(t.id,{plan_id:l.id,amount:l.price}),f(s=>s&&{...s,plan:l.name,amount:l.price,usage:{...s.usage,bookingsLimit:l.limits.bookings,staffLimit:l.limits.staff,locationsLimit:l.limits.locations}}),c({title:"Plan downgraded successfully",description:`${t.salonName} has been downgraded to ${l.name} plan.`}),P(!1),$(null)}catch{c({title:"Error",description:"Failed to downgrade plan. Please try again.",variant:"destructive"})}},Fe=async()=>{if(t)try{const s={type:"card",last4:p.cardNumber.slice(-4),brand:"Visa",expiryMonth:parseInt(p.expiryMonth),expiryYear:parseInt(p.expiryYear)};await us(t.id,s),f({...t,paymentMethod:s}),c({title:"Payment method updated",description:"The payment method has been updated successfully."}),A(!1),v({cardNumber:"",expiryMonth:"",expiryYear:"",cvv:"",cardholderName:""})}catch{c({title:"Error",description:"Failed to update payment method. Please try again.",variant:"destructive"})}},Le=()=>{const s={};return(!i.amount||isNaN(Number(i.amount))||Number(i.amount)<=0)&&(s.amount="Amount must be a positive number"),i.description||(s.description="Description is required"),i.taxAmount&&(isNaN(Number(i.taxAmount))||Number(i.taxAmount)<0)&&(s.taxAmount="Tax must be a non-negative number"),i.taxAmount&&Number(i.taxAmount)>Number(i.amount)&&(s.taxAmount="Tax cannot exceed amount"),s},Ee=async()=>{const s=Le();if(W(s),!(Object.keys(s).length>0)&&t){K(!0);try{const a=`INV-${new Date().getFullYear()}-${Math.floor(Math.random()*1e4)}`,o=await fetch("/api/billing-histories",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({subscription_id:t.id,date:i.date?new Date(i.date):new Date,amount:i.amount,status:i.status,description:i.description,invoice_number:a,tax_amount:i.taxAmount,notes:i.notes})});if(!o.ok)throw new Error("Failed to create invoice");const n=await o.json(),m={...n,amount:Number(n.amount),taxAmount:n.taxAmount!==void 0?n.taxAmount:n.tax_amount,subtotal:n.subtotal,total:n.total!==void 0?n.total:n.total_amount!==void 0?n.total_amount:Number(n.amount)+Number(n.taxAmount!==void 0?n.taxAmount:n.tax_amount||0),invoiceNumber:n.invoiceNumber!==void 0?n.invoiceNumber:n.invoice_number};f(y=>y&&{...y,billingHistory:[m,...y.billingHistory]}),c({title:"Invoice generated!",description:`Invoice for $${Number(i.amount).toFixed(2)} created successfully.`,variant:"default"}),setTimeout(()=>{k(!1),N({amount:"",description:"",taxAmount:"",status:"paid",notes:"",date:""})},1200)}catch{c({title:"Error",description:"Failed to generate invoice. Please try again.",variant:"destructive"})}finally{K(!1)}}},X=s=>{const a=["Basic","Standard","Premium"],o=a.indexOf(s);return V.filter(n=>a.indexOf(n.name)>o)},Q=s=>{const a=["Basic","Standard","Premium"],o=a.indexOf(s);return V.filter(n=>a.indexOf(n.name)<o)};if(ue)return e.jsx("div",{className:"min-h-screen flex items-center justify-center",children:e.jsx("div",{className:"animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"})});if(!t)return e.jsx("div",{className:"min-h-screen flex items-center justify-center",children:e.jsxs("div",{className:"text-center",children:[e.jsx("h2",{className:"text-2xl font-bold text-gray-900",children:"Subscription not found"}),e.jsx("p",{className:"text-gray-600 mt-2",children:"The subscription you're looking for doesn't exist."}),e.jsx(me,{to:"/dashboard/subscriptions",children:e.jsx(r,{className:"mt-4",children:"Back to Subscriptions"})})]})});const Be=R[t.plan],ee=(s,a)=>a==="unlimited"?0:Math.min(s/a*100,100),se=s=>s>=90?"bg-red-500":s>=75?"bg-yellow-500":"bg-green-500",te=ee(t.usage.bookings,t.usage.bookingsLimit),ae=ee(t.usage.staff,t.usage.staffLimit);return e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsx(me,{to:"/dashboard/subscriptions",children:e.jsx(r,{variant:"ghost",size:"icon",children:e.jsx(Ye,{className:"h-4 w-4"})})}),e.jsxs("div",{children:[e.jsxs("h1",{className:"text-2xl font-bold text-gray-900",children:[t.salonName," Subscription"]}),e.jsx("p",{className:"text-gray-600",children:"Subscription Details & Management"})]})]}),e.jsxs("div",{className:"flex gap-2",children:[e.jsxs(r,{variant:"outline",children:[e.jsx(Re,{className:"h-4 w-4 mr-2"}),"Sync Billing"]}),e.jsxs(r,{variant:"outline",children:[e.jsx(ne,{className:"h-4 w-4 mr-2"}),"Edit Subscription"]}),e.jsxs(r,{variant:"outline",onClick:ke,children:[e.jsx(z,{className:"h-4 w-4 mr-2"}),"Generate Invoice"]})]})]}),e.jsx(g,{className:"border-0 shadow-sm",children:e.jsx(b,{className:"p-6",children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{className:"flex items-center gap-6",children:[e.jsxs("div",{className:"relative",children:[e.jsxs(es,{className:"h-16 w-16",children:[e.jsx(ss,{src:"https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2",alt:t.salonName}),e.jsx(ts,{className:"text-lg",children:t.salonName.split(" ").map(s=>s[0]).join("")})]}),e.jsx("div",{className:"absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-md",children:e.jsx(Be,{className:"h-4 w-4 text-gray-600"})})]}),e.jsxs("div",{children:[e.jsx("h2",{className:"text-xl font-semibold text-gray-900",children:t.salonName}),e.jsx("p",{className:"text-gray-600",children:t.ownerName}),e.jsxs("div",{className:"flex items-center gap-2 mt-1",children:[e.jsxs(Y,{className:bs[t.plan],children:[t.plan," Plan"]}),e.jsx(Y,{className:gs[t.status],children:t.status})]}),e.jsxs("div",{className:"flex items-center gap-4 mt-2 text-sm text-gray-600",children:[e.jsxs("div",{className:"flex items-center gap-1",children:[e.jsx(H,{className:"h-4 w-4"}),"Started ",h(new Date(t.startDate),"MMM dd, yyyy")]}),e.jsxs("div",{className:"flex items-center gap-1",children:[e.jsx(ie,{className:"h-4 w-4"}),"$",t.amount,"/",t.billingCycle]})]})]})]}),e.jsx("div",{className:"flex gap-2",children:t.status==="active"&&e.jsxs(e.Fragment,{children:[e.jsxs(r,{variant:"outline",className:"text-blue-600 hover:text-blue-700",onClick:Pe,children:[e.jsx(re,{className:"h-4 w-4 mr-2"}),"Upgrade Plan"]}),e.jsxs(r,{variant:"outline",className:"text-orange-600 hover:text-orange-700",onClick:$e,children:[e.jsx(le,{className:"h-4 w-4 mr-2"}),"Downgrade Plan"]}),e.jsxs(r,{variant:"outline",className:"text-red-600 hover:text-red-700",onClick:De,children:[e.jsx(oe,{className:"h-4 w-4 mr-2"}),"Cancel Subscription"]})]})})]})})}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-6",children:[e.jsx(g,{className:"border-0 shadow-sm",children:e.jsxs(b,{className:"p-6",children:[e.jsxs("div",{className:"flex items-center justify-between mb-4",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-sm font-medium text-gray-600",children:"Bookings Usage"}),e.jsxs("p",{className:"text-2xl font-bold text-gray-900",children:[t.usage.bookings,t.usage.bookingsLimit!=="unlimited"&&`/${t.usage.bookingsLimit}`]})]}),e.jsx(H,{className:"h-8 w-8 text-blue-500"})]}),t.usage.bookingsLimit!=="unlimited"&&e.jsx("div",{className:"w-full h-2 bg-gray-200 rounded-full",children:e.jsx("div",{className:`h-2 rounded-full ${se(te)}`,style:{width:`${te}%`}})}),t.usage.bookingsLimit==="unlimited"&&e.jsx("p",{className:"text-sm text-green-600 font-medium",children:"Unlimited"})]})}),e.jsx(g,{className:"border-0 shadow-sm",children:e.jsxs(b,{className:"p-6",children:[e.jsxs("div",{className:"flex items-center justify-between mb-4",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-sm font-medium text-gray-600",children:"Staff Members"}),e.jsxs("p",{className:"text-2xl font-bold text-gray-900",children:[t.usage.staff,t.usage.staffLimit!=="unlimited"&&`/${t.usage.staffLimit}`]})]}),e.jsx(Ge,{className:"h-8 w-8 text-green-500"})]}),t.usage.staffLimit!=="unlimited"&&e.jsx("div",{className:"w-full h-2 bg-gray-200 rounded-full",children:e.jsx("div",{className:`h-2 rounded-full ${se(ae)}`,style:{width:`${ae}%`}})}),t.usage.staffLimit==="unlimited"&&e.jsx("p",{className:"text-sm text-green-600 font-medium",children:"Unlimited"})]})}),e.jsx(g,{className:"border-0 shadow-sm",children:e.jsxs(b,{className:"p-6",children:[e.jsxs("div",{className:"flex items-center justify-between mb-4",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-sm font-medium text-gray-600",children:"Locations"}),e.jsxs("p",{className:"text-2xl font-bold text-gray-900",children:[t.usage.locations,t.usage.locationsLimit!=="unlimited"&&`/${t.usage.locationsLimit}`]})]}),e.jsx(Ve,{className:"h-8 w-8 text-purple-500"})]}),t.usage.locationsLimit==="unlimited"?e.jsx("p",{className:"text-sm text-green-600 font-medium",children:"Unlimited"}):e.jsxs("p",{className:"text-sm text-gray-600",children:[t.usage.locationsLimit-t.usage.locations," remaining"]})]})})]}),e.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-2 gap-6",children:[e.jsxs(g,{className:"border-0 shadow-sm",children:[e.jsx(C,{children:e.jsxs(M,{className:"flex items-center gap-2",children:[e.jsx(S,{className:"h-5 w-5"}),"Billing Information"]})}),e.jsxs(b,{className:"space-y-4",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx(ie,{className:"h-4 w-4 text-gray-400"}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm font-medium",children:"Current Plan"}),e.jsxs("p",{className:"text-sm text-gray-600",children:[t.plan," - $",t.amount,"/",t.billingCycle]})]})]}),e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx(H,{className:"h-4 w-4 text-gray-400"}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm font-medium",children:"Next Billing Date"}),e.jsx("p",{className:"text-sm text-gray-600",children:h(new Date(t.nextBillingDate),"MMMM dd, yyyy")})]})]}),t.paymentMethod&&e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx(S,{className:"h-4 w-4 text-gray-400"}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm font-medium",children:"Payment Method"}),e.jsxs("p",{className:"text-sm text-gray-600",children:[t.paymentMethod.brand," ending in ",t.paymentMethod.last4]}),e.jsxs("p",{className:"text-xs text-gray-500",children:["Expires ",t.paymentMethod.expiryMonth,"/",t.paymentMethod.expiryYear]})]})]}),e.jsx("div",{className:"pt-4",children:e.jsxs(r,{variant:"outline",className:"w-full",onClick:Ae,children:[e.jsx(ne,{className:"h-4 w-4 mr-2"}),"Update Payment Method"]})})]})]}),e.jsxs(g,{className:"border-0 shadow-sm",children:[e.jsx(C,{children:e.jsxs(M,{className:"flex items-center gap-2",children:[e.jsx(w,{className:"h-5 w-5"}),"Plan Features"]})}),e.jsx(b,{children:e.jsx("div",{className:"space-y-3",children:t.features.map((s,a)=>e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(w,{className:"h-4 w-4 text-green-500"}),e.jsx("span",{className:"text-sm text-gray-700",children:s})]},a))})})]})]}),e.jsxs(g,{className:"border-0 shadow-sm",children:[e.jsx(C,{children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{children:[e.jsxs(M,{className:"flex items-center gap-2",children:[e.jsx(de,{className:"h-5 w-5"}),"Invoices & Billing History"]}),e.jsx(as,{children:"View and manage all invoices and billing records"})]}),e.jsxs("div",{className:"flex gap-2",children:[e.jsxs(r,{variant:"outline",size:"sm",children:[e.jsx(ce,{className:"h-4 w-4 mr-2"}),"Export All"]}),e.jsxs(r,{variant:"outline",size:"sm",children:[e.jsx(z,{className:"h-4 w-4 mr-2"}),"Generate Report"]})]})]})}),e.jsxs(b,{children:[e.jsx("div",{className:"space-y-4",children:t.billingHistory.map(s=>e.jsxs("div",{className:"flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors",children:[e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsx("div",{className:"w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center",children:e.jsx(de,{className:"h-6 w-6 text-purple-600"})}),e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("p",{className:"font-medium text-gray-900",children:s.description}),e.jsx(Y,{className:js[s.status],children:s.status})]}),e.jsxs("p",{className:"text-sm text-gray-600",children:[h(new Date(s.date),"MMM dd, yyyy")," • Invoice #",s.invoiceNumber||s.invoice_number||""]}),s.taxAmount&&e.jsxs("p",{className:"text-xs text-gray-500",children:["Subtotal: $",s.subtotal?Number(s.subtotal).toFixed(2):"0.00"," + Tax: $",s.taxAmount?Number(s.taxAmount).toFixed(2):"0.00"]})]})]}),e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsxs("div",{className:"text-right",children:[e.jsxs("p",{className:"font-semibold text-gray-900",children:["$",Number(s.total??0).toFixed(2)]}),e.jsx("p",{className:"text-xs text-gray-500",children:"Total Amount"})]}),e.jsxs("div",{className:"flex gap-1",children:[e.jsx(r,{variant:"ghost",size:"sm",onClick:()=>ve(s),title:"Print Invoice",className:"hover:bg-blue-50 hover:text-blue-600",children:e.jsx(qe,{className:"h-4 w-4"})}),e.jsx(r,{variant:"ghost",size:"sm",onClick:()=>we(s),title:"Download Invoice",className:"hover:bg-green-50 hover:text-green-600",children:e.jsx(ce,{className:"h-4 w-4"})}),e.jsx(r,{variant:"ghost",size:"sm",onClick:()=>Ce(s),title:"View Invoice",className:"hover:bg-purple-50 hover:text-purple-600",children:e.jsx(Je,{className:"h-4 w-4"})}),e.jsx(r,{variant:"ghost",size:"sm",onClick:()=>Me(s),title:"Email Invoice",className:"hover:bg-orange-50 hover:text-orange-600",children:e.jsx(We,{className:"h-4 w-4"})})]})]})]},s.id))}),e.jsx("div",{className:"mt-6 pt-6 border-t",children:e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-4 gap-4",children:[e.jsxs("div",{className:"text-center p-4 bg-gray-50 rounded-lg",children:[e.jsx("p",{className:"text-2xl font-bold text-gray-900",children:t.billingHistory.length}),e.jsx("p",{className:"text-sm text-gray-600",children:"Total Invoices"})]}),e.jsxs("div",{className:"text-center p-4 bg-green-50 rounded-lg",children:[e.jsx("p",{className:"text-2xl font-bold text-green-600",children:t.billingHistory.filter(s=>s.status==="paid").length}),e.jsx("p",{className:"text-sm text-gray-600",children:"Paid Invoices"})]}),e.jsxs("div",{className:"text-center p-4 bg-blue-50 rounded-lg",children:[e.jsxs("p",{className:"text-2xl font-bold text-blue-600",children:["$",t.billingHistory.reduce((s,a)=>s+Number(a.total),0).toFixed(2)]}),e.jsx("p",{className:"text-sm text-gray-600",children:"Total Billed"})]}),e.jsxs("div",{className:"text-center p-4 bg-purple-50 rounded-lg",children:[e.jsxs("p",{className:"text-2xl font-bold text-purple-600",children:["$",t.billingHistory.reduce((s,a)=>s+Number(a.tax_amount||0),0).toFixed(2)]}),e.jsx("p",{className:"text-sm text-gray-600",children:"Total Tax"})]})]})})]})]}),t.status==="trial"&&e.jsxs(g,{className:"border-0 shadow-sm border-blue-200 bg-blue-50",children:[e.jsx(C,{children:e.jsxs(M,{className:"flex items-center gap-2 text-blue-900",children:[e.jsx(Ze,{className:"h-5 w-5"}),"Trial Period Active"]})}),e.jsxs(b,{children:[e.jsxs("p",{className:"text-blue-700",children:["This subscription is currently in trial period. The trial will end on ",h(new Date(t.nextBillingDate),"MMMM dd, yyyy"),"."]}),e.jsx("div",{className:"mt-4",children:e.jsxs(r,{className:"bg-blue-600 hover:bg-blue-700",children:[e.jsx(S,{className:"h-4 w-4 mr-2"}),"Add Payment Method"]})})]})]}),t.status==="cancelled"&&e.jsxs(g,{className:"border-0 shadow-sm border-red-200 bg-red-50",children:[e.jsx(C,{children:e.jsxs(M,{className:"flex items-center gap-2 text-red-900",children:[e.jsx(oe,{className:"h-5 w-5"}),"Subscription Cancelled"]})}),e.jsxs(b,{children:[e.jsxs("p",{className:"text-red-700",children:["This subscription has been cancelled. Access will continue until ",h(new Date(t.nextBillingDate),"MMMM dd, yyyy"),"."]}),e.jsx("div",{className:"mt-4",children:e.jsxs(r,{className:"bg-green-600 hover:bg-green-700",children:[e.jsx(w,{className:"h-4 w-4 mr-2"}),"Reactivate Subscription"]})})]})]}),e.jsx(ns,{open:ge,onOpenChange:U,children:e.jsxs(is,{children:[e.jsxs(rs,{children:[e.jsx(ls,{children:"Cancel Subscription"}),e.jsxs(os,{children:['Are you sure you want to cancel the subscription for "',t?.salonName,'"? This action will immediately revoke access to premium features and cannot be undone.']})]}),e.jsxs("div",{className:"mt-4",children:[e.jsx("p",{className:"text-sm text-gray-600 mb-2",children:"The salon will lose access to:"}),e.jsxs("ul",{className:"list-disc list-inside space-y-1 text-sm text-gray-600",children:[e.jsx("li",{children:"Advanced booking features"}),e.jsx("li",{children:"Analytics and reporting"}),e.jsx("li",{children:"Priority support"}),e.jsx("li",{children:"Custom branding options"})]})]}),e.jsxs(ds,{children:[e.jsx(cs,{children:"Keep Subscription"}),e.jsx(ms,{onClick:Se,className:"bg-red-600 hover:bg-red-700 text-white",children:"Cancel Subscription"})]})]})}),e.jsx(I,{open:be,onOpenChange:D,children:e.jsxs(T,{className:"max-w-2xl",children:[e.jsxs(F,{children:[e.jsx(L,{children:"Upgrade Subscription Plan"}),e.jsxs(E,{children:['Choose a higher tier plan for "',t?.salonName,'"']})]}),e.jsxs("div",{className:"space-y-4",children:[e.jsx("div",{className:"p-4 bg-blue-50 rounded-lg",children:e.jsxs("p",{className:"text-sm text-blue-800",children:[e.jsx("strong",{children:"Current Plan:"})," ",t?.plan," - $",t?.amount,"/month"]})}),e.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:t&&X(t.plan).map(s=>{const a=R[s.name],o=l?.id===s.id;return e.jsxs("div",{onClick:()=>$(s),className:`p-4 rounded-lg border-2 cursor-pointer transition-all ${o?"border-purple-200 bg-purple-50":"border-gray-200 hover:border-gray-300"}`,children:[e.jsxs("div",{className:"flex items-center gap-3 mb-3",children:[e.jsx("div",{className:`p-2 rounded-lg bg-gradient-to-r ${s.name==="Standard"?"from-blue-600 to-blue-700":"from-purple-600 to-purple-700"}`,children:a?e.jsx(a,{className:"h-5 w-5 text-white"}):e.jsx("span",{className:"h-5 w-5",children:"?"})}),e.jsxs("div",{children:[e.jsx("h3",{className:"font-bold text-gray-900",children:s.name}),e.jsxs("p",{className:"text-lg font-semibold text-gray-900",children:["$",s.price,"/month"]})]})]}),e.jsx("p",{className:"text-sm text-gray-600 mb-3",children:s.description}),e.jsx("ul",{className:"space-y-1",children:s.features.slice(0,4).map((n,m)=>e.jsxs("li",{className:"flex items-center gap-2",children:[e.jsx(w,{className:"h-3 w-3 text-green-500"}),e.jsx("span",{className:"text-xs text-gray-700",children:n})]},m))})]},s.id)})}),t&&X(t.plan).length===0&&e.jsxs("div",{className:"text-center py-8 text-gray-500",children:[e.jsx(he,{className:"h-12 w-12 mx-auto mb-4 text-gray-300"}),e.jsx("p",{children:"Already on the highest plan"}),e.jsx("p",{className:"text-sm",children:"This subscription is already on the Premium plan."})]})]}),e.jsxs(B,{children:[e.jsx(r,{variant:"outline",onClick:()=>D(!1),children:"Cancel"}),e.jsxs(r,{onClick:Ie,disabled:!l,className:"bg-green-600 hover:bg-green-700 text-white",children:[e.jsx(re,{className:"h-4 w-4 mr-2"}),"Upgrade Plan"]})]})]})}),e.jsx(I,{open:je,onOpenChange:P,children:e.jsxs(T,{className:"max-w-2xl",children:[e.jsxs(F,{children:[e.jsx(L,{children:"Downgrade Subscription Plan"}),e.jsxs(E,{children:['Choose a lower tier plan for "',t?.salonName,'"']})]}),e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"p-4 bg-yellow-50 rounded-lg",children:[e.jsxs("p",{className:"text-sm text-yellow-800",children:[e.jsx("strong",{children:"Current Plan:"})," ",t?.plan," - $",t?.amount,"/month"]}),e.jsx("p",{className:"text-xs text-yellow-700 mt-1",children:"Downgrading will reduce available features and limits."})]}),e.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:t&&Q(t.plan).map(s=>{const a=R[s.name],o=l?.id===s.id;return e.jsxs("div",{onClick:()=>$(s),className:`p-4 rounded-lg border-2 cursor-pointer transition-all ${o?"border-orange-200 bg-orange-50":"border-gray-200 hover:border-gray-300"}`,children:[e.jsxs("div",{className:"flex items-center gap-3 mb-3",children:[e.jsx("div",{className:`p-2 rounded-lg bg-gradient-to-r ${s.name==="Basic"?"from-gray-600 to-gray-700":"from-blue-600 to-blue-700"}`,children:a?e.jsx(a,{className:"h-5 w-5 text-white"}):e.jsx("span",{className:"h-5 w-5",children:"?"})}),e.jsxs("div",{children:[e.jsx("h3",{className:"font-bold text-gray-900",children:s.name}),e.jsxs("p",{className:"text-lg font-semibold text-gray-900",children:["$",s.price,"/month"]})]})]}),e.jsx("p",{className:"text-sm text-gray-600 mb-3",children:s.description}),e.jsx("ul",{className:"space-y-1",children:s.features.slice(0,4).map((n,m)=>e.jsxs("li",{className:"flex items-center gap-2",children:[e.jsx(w,{className:"h-3 w-3 text-green-500"}),e.jsx("span",{className:"text-xs text-gray-700",children:n})]},m))})]},s.id)})}),t&&Q(t.plan).length===0&&e.jsxs("div",{className:"text-center py-8 text-gray-500",children:[e.jsx(pe,{className:"h-12 w-12 mx-auto mb-4 text-gray-300"}),e.jsx("p",{children:"Already on the lowest plan"}),e.jsx("p",{className:"text-sm",children:"This subscription is already on the Basic plan."})]})]}),e.jsxs(B,{children:[e.jsx(r,{variant:"outline",onClick:()=>P(!1),children:"Cancel"}),e.jsxs(r,{onClick:Te,disabled:!l,className:"bg-orange-600 hover:bg-orange-700 text-black font-semibold",children:[e.jsx(le,{className:"h-4 w-4 mr-2"}),"Downgrade Plan"]})]})]})}),e.jsx(I,{open:ye,onOpenChange:A,children:e.jsxs(T,{className:"max-w-md",children:[e.jsxs(F,{children:[e.jsx(L,{children:"Edit Payment Method"}),e.jsxs(E,{children:['Update the payment method for "',t?.salonName,'"']})]}),e.jsxs("div",{className:"space-y-4",children:[t?.paymentMethod&&e.jsxs("div",{className:"p-4 bg-gray-50 rounded-lg",children:[e.jsxs("p",{className:"text-sm text-gray-800",children:[e.jsx("strong",{children:"Current:"})," ",t.paymentMethod.brand," ending in ",t.paymentMethod.last4]}),e.jsxs("p",{className:"text-xs text-gray-600",children:["Expires ",t.paymentMethod.expiryMonth,"/",t.paymentMethod.expiryYear]})]}),e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx(x,{htmlFor:"cardholderName",children:"Cardholder Name"}),e.jsx(j,{id:"cardholderName",placeholder:"John Doe",value:p.cardholderName,onChange:s=>v(a=>({...a,cardholderName:s.target.value}))})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(x,{htmlFor:"cardNumber",children:"Card Number"}),e.jsx(j,{id:"cardNumber",placeholder:"1234 5678 9012 3456",value:p.cardNumber,onChange:s=>v(a=>({...a,cardNumber:s.target.value}))})]}),e.jsxs("div",{className:"grid grid-cols-3 gap-4",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx(x,{htmlFor:"expiryMonth",children:"Month"}),e.jsx(j,{id:"expiryMonth",placeholder:"MM",value:p.expiryMonth,onChange:s=>v(a=>({...a,expiryMonth:s.target.value}))})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(x,{htmlFor:"expiryYear",children:"Year"}),e.jsx(j,{id:"expiryYear",placeholder:"YYYY",value:p.expiryYear,onChange:s=>v(a=>({...a,expiryYear:s.target.value}))})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(x,{htmlFor:"cvv",children:"CVV"}),e.jsx(j,{id:"cvv",placeholder:"123",value:p.cvv,onChange:s=>v(a=>({...a,cvv:s.target.value}))})]})]})]})]}),e.jsxs(B,{children:[e.jsx(r,{variant:"outline",onClick:()=>A(!1),children:"Cancel"}),e.jsxs(r,{onClick:Fe,disabled:!p.cardNumber||!p.cardholderName,className:"bg-blue-600 hover:bg-blue-700 text-white",children:[e.jsx(S,{className:"h-4 w-4 mr-2"}),"Update Payment Method"]})]})]})}),e.jsx(I,{open:fe,onOpenChange:k,children:e.jsxs(T,{className:"max-w-md",children:[e.jsxs(F,{children:[e.jsx(L,{children:"Generate Invoice"}),e.jsxs(E,{children:['Create a new invoice for "',t?.salonName,'"']})]}),e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx(x,{htmlFor:"amount",children:"Amount"}),e.jsx(j,{id:"amount",type:"number",placeholder:"Amount",value:i.amount,onChange:s=>N(a=>({...a,amount:s.target.value})),className:u.amount?"border-red-500":""}),u.amount&&e.jsx("p",{className:"text-red-500 text-xs",children:u.amount})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(x,{htmlFor:"description",children:"Description"}),e.jsx(j,{id:"description",placeholder:"Description",value:i.description,onChange:s=>N(a=>({...a,description:s.target.value})),className:u.description?"border-red-500":""}),u.description&&e.jsx("p",{className:"text-red-500 text-xs",children:u.description})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(x,{htmlFor:"taxAmount",children:"Tax Amount"}),e.jsx(j,{id:"taxAmount",type:"number",placeholder:"Tax Amount",value:i.taxAmount,onChange:s=>N(a=>({...a,taxAmount:s.target.value})),className:u.taxAmount?"border-red-500":""}),u.taxAmount&&e.jsx("p",{className:"text-red-500 text-xs",children:u.taxAmount})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(x,{htmlFor:"notes",children:"Notes"}),e.jsx("textarea",{id:"notes",placeholder:"Additional notes (optional)",value:i.notes,onChange:s=>N(a=>({...a,notes:s.target.value})),className:"w-full border rounded px-2 py-1 min-h-[60px]"})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(x,{htmlFor:"date",children:"Invoice Date"}),e.jsx(j,{id:"date",type:"date",value:i.date,onChange:s=>N(a=>({...a,date:s.target.value}))})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(x,{htmlFor:"status",children:"Status"}),e.jsxs("select",{id:"status",className:"w-full border rounded px-2 py-1",value:i.status,onChange:s=>N(a=>({...a,status:s.target.value})),children:[e.jsx("option",{value:"paid",children:"Paid"}),e.jsx("option",{value:"pending",children:"Pending"}),e.jsx("option",{value:"failed",children:"Failed"}),e.jsx("option",{value:"refunded",children:"Refunded"})]})]}),e.jsxs("div",{className:"text-right text-sm mt-2",children:[e.jsxs("span",{children:["Subtotal: $",Number(i.amount||0).toFixed(2)]}),e.jsx("br",{}),e.jsxs("span",{children:["Tax: $",Number(i.taxAmount||0).toFixed(2)]}),e.jsx("br",{}),e.jsxs("span",{className:"font-bold",children:["Total: $",(Number(i.amount||0)+Number(i.taxAmount||0)).toFixed(2)]})]})]}),e.jsxs(B,{children:[e.jsx(r,{variant:"outline",onClick:()=>k(!1),children:"Cancel"}),e.jsxs(r,{onClick:Ee,disabled:Z||Object.keys(u).length>0||!i.amount||!i.description,className:"bg-purple-600 hover:bg-purple-700 text-white",children:[e.jsx(z,{className:"h-4 w-4 mr-2"}),Z?"Generating...":"Generate Invoice"]})]})]})})]})}export{Ss as default};
