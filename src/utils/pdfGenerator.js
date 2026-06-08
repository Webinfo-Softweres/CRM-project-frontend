export const generateQuotationPDF = async ({ quote, customer, enquiry }) => {
  if (!quote) return;

  const { jsPDF } = await import("jspdf");
  const html2canvas = (await import("html2canvas")).default;

  const amount    = Number(quote.amount) || 0;
  const taxRate   = 0.18;
  const subtotal  = amount / (1 + taxRate);
  const tax       = amount - subtotal;
  const formattedAmount = `₹${Number(quote.amount).toLocaleString("en-IN")}`;

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" });
  };

  const zapIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`;

  // ── helpers to mount/unmount hidden DOM nodes ──────────────────────────────
  const mount = (html) => {
    const wrap = document.createElement("div");
    wrap.style.cssText = "position:fixed;left:-9999px;top:0;z-index:-1;";
    wrap.innerHTML = html;
    document.body.appendChild(wrap);
    return wrap;
  };

  // ── 1. BODY HTML ───────────────────────────────────────────────────────────
  const bodyWrap = mount(`
    <div style="
      font-family:'Inter','Helvetica Neue',Arial,sans-serif;
      width:794px;
      padding:32px 40px 24px 40px;
      color:#0f172a;
      background:#fff;
      box-sizing:border-box;
    ">
      <!-- Header -->
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;padding-bottom:18px;border-bottom:1px solid #cbd5e1;">
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="width:40px;height:40px;background:#0f172a;border-radius:7px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            <div style="color:#60a5fa;display:flex;align-items:center;justify-content:center;">${zapIcon}</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:3px;">
            <span style="font-size:20px;font-weight:700;color:#0f172a;letter-spacing:-0.5px;line-height:1;">ZYVERA</span>
            <span style="font-size:9px;color:#64748b;font-weight:600;letter-spacing:2.5px;line-height:1;">TECHNOLOGIES</span>
          </div>
        </div>
        <div style="text-align:right;">
          <p style="font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 4px 0;font-weight:600;">Invoice</p>
          <p style="font-size:24px;font-weight:300;color:#0f172a;margin:0 0 8px 0;">#${String(quote.id).padStart(4,"0")}</p>
          <p style="font-size:12px;color:#0f172a;margin:0;font-weight:500;">${formatDate(quote.created_at)}</p>
        </div>
      </div>

      ${quote.status === "Approved" || quote.status === "Rejected" ? `
      <div style="margin-bottom:18px;">
        <span style="font-size:11px;font-weight:600;padding:4px 12px;border-radius:4px;text-transform:uppercase;letter-spacing:0.5px;
          ${quote.status==="Approved"?"background:#dcfce7;color:#166534;":"background:#fee2e2;color:#991b1b;"}">
          ${quote.status}
        </span>
      </div>` : ""}

      <!-- Bill To -->
      <div style="margin-bottom:22px;">
        <p style="font-size:9px;color:#64748b;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 6px 0;font-weight:600;">Bill To</p>
        <p style="font-size:15px;font-weight:600;color:#0f172a;margin:0 0 2px 0;">${customer?.name || "Customer Name"}</p>
        <p style="font-size:12px;color:#334155;margin:0 0 2px 0;">${customer?.company_name || ""}</p>
        <p style="font-size:11px;color:#64748b;margin:0 0 1px 0;">${customer?.phone || ""}</p>
        <p style="font-size:11px;color:#64748b;margin:0;">${customer?.email || ""}</p>
      </div>

      <!-- Table -->
      <div style="margin-bottom:22px;border:1px solid #cbd5e1;border-radius:6px;overflow:hidden;">
        <table style="width:100%;border-collapse:collapse;font-size:12px;">
          <thead>
            <tr style="background:#3b82f6;">
              <th style="padding:10px 13px;text-align:left;color:white;font-weight:600;font-size:10px;text-transform:uppercase;letter-spacing:0.5px;border-right:1px solid #60a5fa;width:22%;">Service</th>
              <th style="padding:10px 13px;text-align:left;color:white;font-weight:600;font-size:10px;text-transform:uppercase;letter-spacing:0.5px;border-right:1px solid #60a5fa;">Description</th>
              <th style="padding:10px 13px;text-align:right;color:white;font-weight:600;font-size:10px;text-transform:uppercase;letter-spacing:0.5px;width:18%;">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding:13px;vertical-align:top;border-right:1px solid #e2e8f0;">
                <p style="margin:0;font-weight:600;color:#0f172a;font-size:13px;">${enquiry?.service_required || "Software Services"}</p>
              </td>
              <td style="padding:13px;vertical-align:top;color:#475569;line-height:1.6;border-right:1px solid #e2e8f0;">
                ${quote.description || enquiry?.description || "Professional software development services as per requirements discussed."}
              </td>
              <td style="padding:13px;text-align:right;vertical-align:top;font-weight:600;color:#0f172a;">
                ₹${subtotal.toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2})}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Totals -->
      <div style="display:flex;justify-content:flex-end;">
        <div style="width:270px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px;padding-bottom:8px;border-bottom:1px solid #e2e8f0;">
            <span style="font-size:12px;color:#64748b;">Subtotal</span>
            <span style="font-size:12px;color:#0f172a;font-weight:500;">₹${subtotal.toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2})}</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid #e2e8f0;">
            <span style="font-size:12px;color:#64748b;">Tax (18% GST)</span>
            <span style="font-size:12px;color:#0f172a;font-weight:500;">₹${tax.toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2})}</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;padding-top:10px;border-top:2px solid #0f172a;">
            <span style="font-size:13px;font-weight:700;color:#0f172a;">Total</span>
            <span style="font-size:22px;font-weight:700;color:#0f172a;">${formattedAmount}</span>
          </div>
        </div>
      </div>
    </div>
  `);

  // ── 2. FOOTER HTML ─────────────────────────────────────────────────────────
  const footerWrap = mount(`
    <div style="
      font-family:'Inter','Helvetica Neue',Arial,sans-serif;
      width:794px;
      padding:14px 40px 16px 40px;
      color:#0f172a;
      background:#fff;
      box-sizing:border-box;
      border-top:1px solid #cbd5e1;
    ">
      <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:12px;">
        <div>
          <p style="font-size:9px;color:#475569;text-transform:uppercase;letter-spacing:1px;margin:0 0 5px 0;font-weight:600;">Terms &amp; Conditions</p>
          <p style="font-size:9px;color:#64748b;margin:0 0 3px 0;line-height:1.5;">• Valid for 30 days from date of issue</p>
          <p style="font-size:9px;color:#64748b;margin:0 0 3px 0;line-height:1.5;">• 50% advance payment required to start</p>
          <p style="font-size:9px;color:#64748b;margin:0;line-height:1.5;">• Prices inclusive of GST @ 18%</p>
        </div>
        <div style="text-align:center;padding-bottom:6px;">
          <div style="border-bottom:1px solid #94a3b8;width:160px;margin:0 auto 5px auto;"></div>
          <p style="font-size:9px;color:#64748b;margin:0;font-weight:500;">Authorized Signature</p>
        </div>
      </div>
      <div style="text-align:center;border-top:1px solid #e2e8f0;padding-top:10px;">
        <p style="font-size:10px;color:#3b82f6;margin:0;font-weight:500;">www.zyveratech.com</p>
      </div>
    </div>
  `);

  // ── 3. Capture canvases ────────────────────────────────────────────────────
  const SCALE = 2;
  const bodyCanvas   = await html2canvas(bodyWrap.firstElementChild,   { scale:SCALE, useCORS:true, backgroundColor:"#fff" });
  const footerCanvas = await html2canvas(footerWrap.firstElementChild, { scale:SCALE, useCORS:true, backgroundColor:"#fff" });

  document.body.removeChild(bodyWrap);
  document.body.removeChild(footerWrap);

  // ── 4. Build PDF ───────────────────────────────────────────────────────────
  const A4_W_PT   = 595.28;
  const A4_H_PT   = 841.89;
  const MARGIN_PT = 20;
  const usableW   = A4_W_PT - MARGIN_PT * 2;

  // How many PDF points does one CSS pixel occupy?
  const pxPerPt = (bodyCanvas.width / SCALE) / usableW;

  const bodyH_pt   = (bodyCanvas.height   / SCALE) / pxPerPt;
  const footerH_pt = (footerCanvas.height / SCALE) / pxPerPt;

  // Available height for body content per page (leave room for footer + margins)
  const slotH_pt = A4_H_PT - MARGIN_PT * 2 - footerH_pt - 6; // 6pt gap above footer

  const footerImg = footerCanvas.toDataURL("image/jpeg", 0.98);

  const pdf = new jsPDF({ unit:"pt", format:"a4", orientation:"portrait" });

  let remaining = bodyH_pt;
  let srcY_pt   = 0;
  let page      = 0;

  while (remaining > 0) {
    if (page > 0) pdf.addPage();

    const sliceH_pt = Math.min(remaining, slotH_pt);
    const sliceH_px = Math.round(sliceH_pt * pxPerPt * SCALE);
    const srcY_px   = Math.round(srcY_pt   * pxPerPt * SCALE);

    // Crop body canvas to this page's slice
    const slice = document.createElement("canvas");
    slice.width  = bodyCanvas.width;
    slice.height = sliceH_px;
    slice.getContext("2d").drawImage(
      bodyCanvas,
      0, srcY_px, bodyCanvas.width, sliceH_px,  // source rect
      0, 0,       bodyCanvas.width, sliceH_px   // dest rect
    );

    pdf.addImage(slice.toDataURL("image/jpeg", 0.98), "JPEG", MARGIN_PT, MARGIN_PT, usableW, sliceH_pt);

    // Footer always pinned to the very bottom of each page
    pdf.addImage(footerImg, "JPEG", MARGIN_PT, A4_H_PT - MARGIN_PT - footerH_pt, usableW, footerH_pt);

    srcY_pt   += sliceH_pt;
    remaining -= sliceH_pt;
    page++;
  }

  pdf.save(`Quotation_${quote.id}_${customer?.name?.replace(/\s+/g,"_") || "Customer"}.pdf`);
};