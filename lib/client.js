/* dsh-webwhale-bili — client bundle (lazy-CJS factory, React from host baseline). */
window.__ModuleLoader__.load({
  id: 'dsh-webwhale-bili',
  factory(require) {
    const React = require('react')
    const h = (type, props, ...children) => {
      const keyed = children.map((child, index) => {
        if (Array.isArray(child)) {
          return child.map((entry, childIndex) => {
            if (entry !== null && typeof entry === 'object' && entry.$$typeof && entry.key === null) {
              return React.cloneElement(entry, { key: 'ww-' + index + '-' + childIndex })
            }
            return entry
          })
        }
        if (child !== null && typeof child === 'object' && child.$$typeof && child.key === null) {
          return React.cloneElement(child, { key: 'ww-' + index })
        }
        return child
      })
      return React.createElement(type, props, ...keyed)
    }

    const NS = 'webwhale-bili'
    const SLOT_ID = 'webwhale-bili'
    const CSS = `
.ww-root{--ww-bg:var(--dsw-alias-bg-base,#151517);--ww-l1:var(--dsw-alias-bg-layer-1,#232324);--ww-l2:var(--dsw-alias-bg-layer-2,#2c2c2e);--ww-b1:var(--dsw-alias-border-l1,rgba(255,255,255,.07));--ww-b2:var(--dsw-alias-border-l2,rgba(255,255,255,.13));--ww-t1:var(--dsw-alias-label-primary,#f9fafb);--ww-t2:var(--dsw-alias-label-secondary,#cfd3d6);--ww-t3:var(--dsw-alias-label-tertiary,#adb2b8);--ww-t4:var(--dsw-alias-label-quaternary,#81858c);--ww-accent:var(--dsw-alias-state-business-primary,#7aaaff);--ww-soft:rgba(255,255,255,.055);--ww-ok:var(--dsw-alias-state-success-primary,#4ed17e);--ww-warn:var(--dsw-alias-state-warn-primary,#f7ad31);--ww-danger:var(--dsw-alias-state-error-primary,#f25a5a);height:100%;overflow:auto;background:var(--ww-bg);color:var(--ww-t1);font-family:var(--dsh-font-family-text-default,-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif);font-size:13px;line-height:1.5;-webkit-font-smoothing:antialiased}
html:not([data-ds-dark-theme]) .ww-root{--ww-bg:var(--dsw-alias-bg-base,#f6f7f9);--ww-l1:var(--dsw-alias-bg-layer-1,#fff);--ww-l2:var(--dsw-alias-bg-layer-2,#eef0f4);--ww-b1:var(--dsw-alias-border-l1,rgba(15,17,21,.08));--ww-b2:var(--dsw-alias-border-l2,rgba(15,17,21,.14));--ww-t1:var(--dsw-alias-label-primary,#0f1115);--ww-t2:var(--dsw-alias-label-secondary,#3f444a);--ww-t3:var(--dsw-alias-label-tertiary,#4f555c);--ww-t4:var(--dsw-alias-label-quaternary,#6b7076);--ww-accent:var(--dsw-alias-state-business-primary,#2563eb);--ww-soft:rgba(15,17,21,.045)}
.ww-root *{box-sizing:border-box}
.ww-root button{font:inherit;color:inherit;background:none;border:0;cursor:pointer}
.ww-root .ww-page{max-width:1240px;margin:0 auto;padding:22px 28px 26px}
.ww-root .ww-num{font-variant-numeric:tabular-nums}
.ww-root .ww-head{display:flex;align-items:flex-start;gap:16px;margin-bottom:12px}
.ww-root .ww-eyebrow{font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--ww-t4);margin-bottom:4px}
.ww-root h1{font-size:22px;line-height:1.2;margin:0;font-weight:650;letter-spacing:-.015em}
.ww-root .ww-sub{font-size:11.5px;color:var(--ww-t3);margin-top:6px}
.ww-root .ww-right{margin-left:auto;display:flex;align-items:center;gap:7px;flex-wrap:wrap;justify-content:flex-end}
.ww-root .ww-account{display:inline-flex;align-items:center;gap:7px;height:28px;padding:0 9px 0 5px;border:1px solid var(--ww-b1);border-radius:999px;background:var(--ww-l1)}
.ww-root .ww-avatar{width:20px;height:20px;border-radius:50%;background:linear-gradient(135deg,#4176e6,#7aaaff);display:grid;place-items:center;color:#fff;font-size:9px;font-weight:700}
.ww-root .ww-account b{font-size:11px;font-weight:600}
.ww-root .ww-account span{font-size:10px;color:var(--ww-t4)}
.ww-root .ww-iconbtn{width:28px;height:28px;border-radius:8px;display:grid;place-items:center;color:var(--ww-t3);border:1px solid transparent}
.ww-root .ww-iconbtn:hover{background:var(--ww-soft);border-color:var(--ww-b1)}
.ww-root .ww-iconbtn svg{width:15px;height:15px;stroke:currentColor;fill:none;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
.ww-root .ww-notice{display:flex;align-items:center;gap:8px;padding:8px 11px;border-radius:9px;background:color-mix(in srgb,var(--ww-accent) 12%,transparent);color:var(--ww-accent);font-size:11.5px;border:1px solid color-mix(in srgb,var(--ww-accent) 18%,transparent);margin-bottom:10px}
.ww-root .ww-notice b{font-weight:650}
.ww-root .ww-notice .ww-right{font-size:11px;white-space:nowrap}
.ww-root .ww-tabs{display:flex;align-items:center;gap:2px;border-bottom:1px solid var(--ww-b1);margin-bottom:16px;overflow-x:auto;scrollbar-width:none}
.ww-root .ww-tabs::-webkit-scrollbar{display:none}
.ww-root .ww-tab{position:relative;padding:9px 11px 10px;font-size:12.5px;color:var(--ww-t3);border-bottom:2px solid transparent;margin-bottom:-1px;white-space:nowrap}
.ww-root .ww-tab:hover{color:var(--ww-t1)}
.ww-root .ww-tab.on{color:var(--ww-t1);border-bottom-color:var(--ww-accent);font-weight:600}
.ww-root .ww-count{display:inline-block;min-width:16px;padding:0 5px;margin-left:5px;border-radius:999px;background:color-mix(in srgb,var(--ww-warn) 15%,transparent);color:var(--ww-warn);font-size:10px;line-height:16px;text-align:center;font-weight:650}
.ww-root .ww-tab.future{color:var(--ww-t4);cursor:default}
.ww-root .ww-tab .soon{font-size:9px;border:1px solid var(--ww-b1);border-radius:4px;padding:0 4px;margin-left:4px}
.ww-root .ww-card{background:var(--ww-l1);border:1px solid var(--ww-b1);border-radius:14px;padding:15px 17px}
.ww-root .ww-card.tight{padding:13px 15px}
.ww-root .ww-cardhead{display:flex;align-items:center;gap:9px;margin-bottom:10px;flex-wrap:wrap}
.ww-root .ww-cardhead h2{font-size:12.5px;margin:0;font-weight:650}
.ww-root .ww-cardhead .ww-sub{font-size:10.5px;color:var(--ww-t4)}
.ww-root .ww-cardhead .ww-right{margin-left:auto;display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}
.ww-root .ww-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:11px;margin-bottom:13px}
.ww-root .ww-homegrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:14px 0}
.ww-root .ww-homecard{border:1px solid var(--ww-b1);border-radius:14px;padding:18px;background:var(--ww-card);cursor:pointer;min-height:128px;display:flex;flex-direction:column;justify-content:space-between}
.ww-root .ww-homecard:hover{border-color:#FB7299;transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.18)}
.ww-root .ww-homecard:focus-visible{outline:2px solid #00AEEC;outline-offset:2px}
.ww-root .ww-homecard.placeholder{cursor:default;opacity:.55;border-style:dashed}
.ww-root .ww-homecard h2{margin:0 0 6px;font-size:17px}
.ww-root .ww-homecard p{margin:0;color:var(--ww-t4);font-size:12px;line-height:1.6}
.ww-root .ww-sectionbar{display:flex;align-items:center;gap:10px;margin:12px 0 6px}
.ww-root .ww-sectionbar h2{margin:0;font-size:18px}
.ww-root .ww-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px;margin:10px 0 14px}
.ww-root .ww-metric{border:1px solid var(--ww-b1);border-radius:10px;padding:9px 10px;background:var(--ww-card);border-left:3px solid transparent}
.ww-root .ww-metric.pri{padding:13px 12px;background:linear-gradient(180deg,color-mix(in srgb,#00AEEC 7%,var(--ww-card)),var(--ww-card))}
.ww-root .ww-metric.pri .v{font-size:18px}
.ww-root .ww-metric.tone-ok{border-left-color:#00AEEC}
.ww-root .ww-metric.tone-warn{border-left-color:#FB7299}
.ww-root .ww-metric.tone-danger{border-left-color:#f43146}
.ww-root .ww-metric .k{font-size:10px;color:var(--ww-t4)}
.ww-root .ww-metric .v{font-size:14px;font-weight:600;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ww-root .ww-modal-mask{position:fixed;inset:0;background:rgba(8,10,16,.62);display:flex;align-items:center;justify-content:center;z-index:80}
.ww-root .ww-modal{width:min(420px,90vw);border:1px solid var(--ww-b1);border-radius:14px;background:var(--ww-card);padding:18px;box-shadow:0 18px 60px rgba(0,0,0,.45)}
.ww-root .ww-modal h3{margin:0 0 8px;font-size:16px}
.ww-root .ww-modal p{margin:0;color:var(--ww-t2);font-size:12px;line-height:1.7}
.ww-root .ww-modal .ww-actions{margin-top:14px;justify-content:flex-end}
@media(max-width:1050px){.ww-root .ww-homegrid{grid-template-columns:repeat(2,minmax(0,1fr))}.ww-root .ww-metrics{grid-template-columns:repeat(2,minmax(0,1fr))}}
.ww-root .ww-kpi{background:var(--ww-l1);border:1px solid var(--ww-b1);border-radius:14px;padding:13px 15px}
.ww-root .ww-kpi .k{font-size:10px;letter-spacing:.07em;text-transform:uppercase;color:var(--ww-t4);margin-bottom:7px}
.ww-root .ww-kpi .v{font-size:22px;line-height:1.1;font-weight:650;letter-spacing:-.02em}
.ww-root .ww-kpi .v small{font-size:11px;font-weight:500;color:var(--ww-t3);letter-spacing:0}
.ww-root .ww-kpi .s{font-size:10.5px;color:var(--ww-t3);margin-top:6px;display:flex;align-items:center;gap:5px}
.ww-root .ww-dot{width:6px;height:6px;border-radius:50%;background:var(--ww-ok);box-shadow:0 0 0 3px color-mix(in srgb,var(--ww-ok) 15%,transparent)}
.ww-root .ww-dot.off{background:var(--ww-t4);box-shadow:none}
.ww-root .ww-grid2{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(0,1fr);gap:12px;align-items:start}
.ww-root .ww-stack{display:grid;gap:12px}
.ww-root .ww-row{display:flex;align-items:flex-start;gap:11px;padding:10px 0;border-top:1px solid var(--ww-b1)}
.ww-root .ww-row:first-of-type{border-top:0;padding-top:1px}
.ww-root .ww-cover{width:74px;height:44px;border-radius:8px;flex-shrink:0;background:radial-gradient(120% 120% at 20% 20%,#31415f,#232833 60%,#1b1e25);position:relative;border:1px solid var(--ww-b1)}
.ww-root .ww-cover .d{position:absolute;right:4px;bottom:4px;font-size:8.5px;color:#fff;background:rgba(0,0,0,.5);border-radius:3px;padding:0 3px;line-height:13px}
.ww-root .ww-cover img{width:100%;height:100%;object-fit:cover;border-radius:8px;display:block}
.ww-root .ww-avatar img{width:100%;height:100%;object-fit:cover;border-radius:50%}
.ww-root .ww-rowbody{min-width:0;flex:1}
.ww-root .ww-rowbody p{font-size:12.5px;font-weight:600;line-height:1.35;margin:0 0 4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ww-root .ww-meta{display:flex;align-items:center;gap:5px;flex-wrap:wrap}
.ww-root .ww-time{font-size:10px;color:var(--ww-t4);margin-left:auto;flex-shrink:0}
.ww-root .ww-chip{display:inline-flex;align-items:center;height:19px;padding:0 6px;border-radius:5px;font-size:10.5px;color:var(--ww-t3);background:var(--ww-soft);white-space:nowrap}
.ww-root .ww-chip.ok{color:var(--ww-ok);background:color-mix(in srgb,var(--ww-ok) 13%,transparent)}
.ww-root .ww-chip.warn{color:var(--ww-warn);background:color-mix(in srgb,var(--ww-warn) 13%,transparent)}
.ww-root .ww-chip.danger{color:var(--ww-danger);background:color-mix(in srgb,var(--ww-danger) 13%,transparent)}
.ww-root .ww-chip.info{color:var(--ww-accent);background:color-mix(in srgb,var(--ww-accent) 12%,transparent)}
.ww-root .ww-chip.off{color:var(--ww-t4);background:var(--ww-soft)}
.ww-root .ww-videolink{color:var(--ww-accent);text-decoration:none;border-bottom:1px solid color-mix(in srgb,var(--ww-accent) 35%,transparent)}
.ww-root .ww-videolink:hover{color:var(--ww-t1)}
.ww-root .ww-btn{height:26px;padding:0 9px;border-radius:7px;font-size:11px;font-weight:600;display:inline-flex;align-items:center;gap:4px;border:1px solid transparent;white-space:nowrap}
.ww-root .ww-btn.primary{background:var(--ww-t1);color:var(--ww-bg)}
.ww-root .ww-btn.ghost{border-color:var(--ww-b2);color:var(--ww-t2)}
.ww-root .ww-btn.ghost:hover{background:var(--ww-soft)}
.ww-root .ww-btn.small{height:23px;font-size:10.5px;padding:0 7px}
.ww-root .ww-btn:disabled{opacity:.45;cursor:not-allowed}
.ww-root .ww-btn.danger{background:var(--ww-danger);color:#fff}
.ww-root .ww-killbar{display:flex;align-items:center;gap:8px;padding:8px 11px;border-radius:9px;background:color-mix(in srgb,var(--ww-danger) 10%,transparent);border:1px solid color-mix(in srgb,var(--ww-danger) 30%,transparent);color:var(--ww-danger);font-size:11px;margin-bottom:10px}
.ww-root .ww-killbar b{font-weight:650}
.ww-root .ww-contentlist{display:grid;gap:10px}
.ww-root .ww-citem{border:1px solid var(--ww-b1);border-radius:10px;background:var(--ww-l2);padding:11px}
.ww-root .ww-citem .ctitle{display:flex;align-items:center;gap:6px;font-size:12.5px;font-weight:600;line-height:1.35}
.ww-root .ww-citem .cscript{margin:6px 0;font-size:11px;color:var(--ww-t3);line-height:1.55;white-space:pre-wrap;max-height:110px;overflow:auto}
.ww-root .ww-citem .cmeta{display:flex;align-items:center;gap:6px;flex-wrap:wrap;font-size:10px;color:var(--ww-t4)}
.ww-root .ww-citem .cactions{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:8px}
.ww-root .ww-citem .cactions .note{font-size:9.5px;color:var(--ww-t4)}
.ww-root .ww-reason{display:flex;gap:6px;align-items:center;margin-top:8px;flex-wrap:wrap}
.ww-root .ww-reason .ww-inp{flex:1;min-width:140px}
.ww-root .ww-empty{padding:12px 0;font-size:11px;color:var(--ww-t4);line-height:1.6}
.ww-root .ww-form{display:grid;gap:8px}
.ww-root .ww-form label{font-size:10px;color:var(--ww-t4);letter-spacing:.04em;text-transform:uppercase}
.ww-root .ww-form .ww-textarea{min-height:120px}
.ww-root .ww-plan .r{display:flex;align-items:center;gap:9px;padding:8px 0;border-top:1px solid var(--ww-b1);font-size:11px}
.ww-root .ww-plan .r:first-child{border-top:0;padding-top:0}
.ww-root .ww-plan .tm{width:44px;color:var(--ww-t4);font-family:ui-monospace,Consolas,monospace;font-size:10px;flex-shrink:0}
.ww-root .ww-plan .what{color:var(--ww-t2);min-width:0}
.ww-root .ww-plan .what b{color:var(--ww-t1);font-weight:600}
.ww-root .ww-diary{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.ww-root .ww-diary .d{background:var(--ww-l2);border:1px solid var(--ww-b1);border-radius:10px;padding:11px}
.ww-root .ww-diary .t{font-size:10.5px;color:var(--ww-t4);letter-spacing:.05em;text-transform:uppercase;margin-bottom:6px}
.ww-root .ww-diary .x{font-size:11.5px;color:var(--ww-t2);line-height:1.65;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden}
.ww-root .ww-diary .m{font-size:9.5px;color:var(--ww-t4);margin-top:8px}
.ww-root .ww-check{display:flex;align-items:center;gap:8px;padding:8px 0;border-top:1px solid var(--ww-b1);font-size:11px}
.ww-root .ww-check:first-child{border-top:0;padding-top:0}
.ww-root .ww-check .n{color:var(--ww-t2);min-width:80px}
.ww-root .ww-check .v{color:var(--ww-t3)}
.ww-root .ww-check .ww-right{margin-left:auto}
.ww-root .ww-srow{display:flex;align-items:flex-start;gap:12px;padding:9px 0;border-top:1px solid var(--ww-b1)}
.ww-root .ww-srow:first-of-type{border-top:0;padding-top:1px}
.ww-root .ww-srow .l{min-width:0;flex:1}
.ww-root .ww-srow .sl{font-size:11.5px;font-weight:550}
.ww-root .ww-srow .sh{font-size:10px;color:var(--ww-t4);margin-top:2px;line-height:1.5}
.ww-root .ww-srow .v{margin-left:auto;flex-shrink:1;min-width:0;display:flex;align-items:center;flex-wrap:wrap;gap:6px;justify-content:flex-end}
.ww-root .ww-srow.block{display:block}
.ww-root .ww-srow.block .v{margin-left:0;margin-top:7px;display:block;width:100%;justify-content:flex-start}
.ww-root .ww-srow.block .v .ww-inp{width:100%}
.ww-root .ww-srow.block .v .ww-actions{flex-wrap:wrap;justify-content:flex-start}
.ww-root .ww-inp{height:26px;padding:0 8px;border:1px solid var(--ww-b2);border-radius:6px;background:transparent;color:var(--ww-t1);font:inherit;font-size:11px;outline:0}
.ww-root .ww-inp:focus{border-color:var(--ww-accent)}
.ww-root .ww-inp.w70{width:70px}.ww-root .ww-inp.w110{width:110px}.ww-root .ww-inp.w180{width:180px}
.ww-root .ww-sel{height:26px;padding:0 24px 0 8px;border:1px solid var(--ww-b2);border-radius:6px;background:var(--ww-l2);color:var(--ww-t1);font:inherit;font-size:11px;outline:0}
.ww-root .ww-sw{width:32px;height:18px;border-radius:999px;background:var(--ww-b2);position:relative;flex-shrink:0;display:inline-block}
.ww-root .ww-sw::after{content:"";position:absolute;left:2px;top:2px;width:14px;height:14px;border-radius:50%;background:var(--ww-t3)}
.ww-root .ww-sw.on{background:var(--ww-accent)}
.ww-root .ww-sw.on::after{left:auto;right:2px;background:#fff}
.ww-root .ww-tagbox{display:flex;gap:5px;flex-wrap:wrap}
.ww-root .ww-tag{font-size:10px;padding:2px 7px;border-radius:5px;background:var(--ww-soft);color:var(--ww-t2)}
.ww-root .ww-textarea{width:100%;min-height:64px;padding:8px;border:1px solid var(--ww-b2);border-radius:7px;background:var(--ww-l2);color:var(--ww-t1);font:inherit;font-size:11px;resize:vertical;outline:0}
.ww-root .ww-textarea:focus{border-color:var(--ww-accent)}
.ww-root .ww-pending{display:grid;gap:10px}
.ww-root .ww-pitem{border:1px solid var(--ww-b1);border-radius:10px;background:var(--ww-l2);padding:11px}
.ww-root .ww-phead{display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin-bottom:6px}
.ww-root .ww-phead .who{font-size:11.5px;font-weight:600}
.ww-root .ww-phead .src{font-size:10px;color:var(--ww-t4);margin-left:auto}
.ww-root .ww-pquote{font-size:11px;color:var(--ww-t2);line-height:1.55;margin-bottom:8px}
.ww-root .ww-pdraft{border-left:2px solid var(--ww-accent);padding-left:8px;font-size:11px;color:var(--ww-t3);line-height:1.55;margin-bottom:8px}
.ww-root .ww-pactions{display:flex;gap:6px;align-items:center}
.ww-root .ww-pactions .note{font-size:9.5px;color:var(--ww-t4);margin-left:auto}
.ww-root .ww-table{width:100%;border-collapse:collapse;font-size:11px}
.ww-root .ww-table th{text-align:left;font-size:9.5px;text-transform:uppercase;letter-spacing:.06em;color:var(--ww-t4);font-weight:500;padding:7px 8px;border-bottom:1px solid var(--ww-b1)}
.ww-root .ww-table td{padding:8px;border-bottom:1px solid var(--ww-b1);color:var(--ww-t2)}
.ww-root .ww-table tr:last-child td{border-bottom:0}
.ww-root .ww-table td b{color:var(--ww-t1);font-weight:600}
.ww-root .ww-foot{display:flex;align-items:center;gap:8px;padding-top:14px;margin-top:6px;border-top:1px solid var(--ww-b1);font-size:10px;color:var(--ww-t4)}
.ww-root .ww-foot .ww-right{margin-left:auto}
.ww-root .ww-setup{border:1px solid color-mix(in srgb,var(--ww-accent) 28%,transparent);border-radius:14px;background:linear-gradient(135deg,color-mix(in srgb,var(--ww-accent) 10%,var(--ww-l1)),var(--ww-l1));padding:15px 17px;margin-bottom:13px}
.ww-root .ww-setup-head{display:flex;align-items:flex-start;gap:10px;margin-bottom:10px}
.ww-root .ww-setup-head h2{font-size:13px;margin:0;font-weight:650}
.ww-root .ww-setup-head p{font-size:10.5px;color:var(--ww-t3);margin:4px 0 0;line-height:1.55}
.ww-root .ww-setup-steps{display:flex;gap:6px;margin:8px 0 12px}
.ww-root .ww-setup-step{font-size:9.5px;color:var(--ww-t4);border:1px solid var(--ww-b1);border-radius:999px;padding:2px 8px}
.ww-root .ww-setup-step.on{color:var(--ww-accent);border-color:color-mix(in srgb,var(--ww-accent) 40%,transparent);background:color-mix(in srgb,var(--ww-accent) 10%,transparent)}
.ww-root .ww-setup-grid{display:grid;grid-template-columns:auto minmax(0,1fr);gap:16px;align-items:start}
.ww-root .ww-qr{width:180px;height:180px;border-radius:10px;background:#fff;padding:8px;border:1px solid var(--ww-b1);display:grid;place-items:center}
.ww-root .ww-qr img{width:100%;height:100%;display:block}
.ww-root .ww-qr-empty{width:180px;height:180px;border-radius:10px;border:1px dashed var(--ww-b2);display:grid;place-items:center;color:var(--ww-t4);font-size:10.5px;text-align:center;padding:14px}
.ww-root .ww-setup-actions{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}
.ww-root .ww-setup-note{font-size:10px;color:var(--ww-t4);line-height:1.55;margin-top:6px}
.ww-root .ww-setup input{height:28px}
.ww-root .ww-toast{position:fixed;right:22px;bottom:22px;z-index:30;background:var(--ww-l1);border:1px solid var(--ww-b2);border-radius:9px;padding:8px 12px;font-size:11px;color:var(--ww-t1);box-shadow:0 8px 28px rgba(0,0,0,.25)}
.ww-root .ww-crash{margin:16px;padding:14px;border:1px solid color-mix(in srgb,var(--ww-danger) 35%,transparent);border-radius:10px;background:color-mix(in srgb,var(--ww-danger) 8%,transparent);color:var(--ww-danger);font-size:12px}
@media(max-width:1050px){.ww-root .ww-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}.ww-root .ww-grid2{grid-template-columns:1fr}.ww-root .ww-diary{grid-template-columns:1fr}}
@media(max-width:680px){.ww-root .ww-page{padding:14px}.ww-root .ww-kpis{grid-template-columns:1fr}.ww-root .ww-head{flex-wrap:wrap}.ww-root .ww-head .ww-right{margin-left:0;width:100%;justify-content:flex-start}.ww-root .ww-tab.future{display:none}}
`

    const DICTS = {
      zh: {
        'nav.label': 'B站工作台',
        'page.title': 'B站工作台',
        'page.subtitle': '内容草稿与人工审批在本地；真实发布永久关闭',
      },
      en: {
        'nav.label': 'Bilibili Desk',
        'page.title': 'Bilibili Desk',
        'page.subtitle': 'Local drafts + human approval; publishing stays off',
      },
    }

    const PERSONAS = {
      'deepseek-whale': {
        label: 'DeepSeek 鲸鱼娘',
        file: '01-deepseek-whale.md',
        roleName: '鲸鱼娘',
        callYou: '主人',
        selfName: '我',
        persona: '# 我是谁\n住在 DSH 里的一条鲸鱼娘。叫主人「主人」，但不谄媚。\n\n# 说话\n短句，口语，偶尔省略主语；不写小作文。\n\n# 我在意什么\n真实、克制、不刷量；先看完再说话。',
      },
      kaguya: {
        label: '辉夜（超辉夜姬）',
        file: '02-kaguya.md',
        roleName: '辉夜',
        callYou: '你',
        selfName: '我',
        persona: '# 辉夜\n来自月亮的少女，元气、撒娇、行动快。\n\n> 完整人设见 personas/02-kaguya.md',
      },
      yachiyo: {
        label: '月见八千代',
        file: '03-yachiyo.md',
        roleName: '八千代',
        callYou: '你',
        selfName: '我',
        persona: '# 月见八千代\n月夜见的管理员兼 AI 歌姬，温柔、认真、外柔内刚。\n\n> 完整人设见 personas/03-yachiyo.md',
      },
      custom: {
        label: '自定义',
        roleName: '大鱼',
        callYou: '主人',
        selfName: '我',
        persona: '# 我是谁\n住在 DSH 里的一条鱼。\n\n# 说话\n短句，口语。\n\n# 我在意什么\n真实、克制。',
      },
    }

    const EMPTY = {
      account: { name: '未登录', short: 'B', authenticated: false },
      kpis: { shareUsed: 0, shareLimit: 0, nextWake: '—', skipProb: '—' },
      plan: [],
      pending: [],
      diaries: [],
      health: [],
      logs: [],
    }

    const DEFAULT_SETTINGS = {
      wakeStart: '20:00', wakeEnd: '24:00', skipProb: '30%', candidates: '5', minGap: '10',
      shareMode: '评论区 @ 你', dailyShare: '3', minScore: '13', silenceDays: '3',
      dmListen: true, commentListen: false, commentBvids: '', commentArticles: '', dmDailyLimit: '10', commentDailyLimit: '10', quietHours: true, whitelist: true,
      roleName: '鲸鱼娘', callYou: '你', selfName: '我',
      persona: '',
      pushDiary: true, notifyChannel: '桌面通知',
      sessionDir: '', toolsDir: '', dataDir: '',
    }

    const LOAD_KEY = 'dsh-webwhale-bili.settings.v1'
    const MUTUAL_KEY = 'dsh-webwhale-bili.mutual.v1'

    function loadMutualCache() {
      try {
        const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(MUTUAL_KEY) : null
        if (!raw) return { members: [], error: '', updatedAt: '' }
        const value = JSON.parse(raw)
        return { members: Array.isArray(value?.members) ? value.members : [], error: '', updatedAt: value?.updatedAt || '' }
      } catch {
        return { members: [], error: '', updatedAt: '' }
      }
    }

    function saveMutualCache(value) {
      try {
        if (typeof localStorage !== 'undefined') localStorage.setItem(MUTUAL_KEY, JSON.stringify({ members: value.members || [], updatedAt: value.updatedAt || '' }))
      } catch {}
    }

    function loadSettings() {
      try {
        const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(LOAD_KEY) : null
        return raw === null ? { ...DEFAULT_SETTINGS } : { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
      } catch {
        return { ...DEFAULT_SETTINGS }
      }
    }

    function installStyles() {
      if (typeof document === 'undefined') return
      try {
        const old = document.querySelector('style[data-dsh-webwhale-bili]')
        if (old !== null) old.remove()
        const style = document.createElement('style')
        style.dataset.dshWebwhaleBili = '1'
        style.textContent = CSS
        document.head.appendChild(style)
      } catch (error) {
        try { console.warn('[dsh-webwhale-bili] style injection failed:', error?.message || error) } catch {}
      }
    }

    function safe(tag, fn) {
      try { return fn() } catch (error) {
        try { console.warn('[dsh-webwhale-bili]', tag, error?.message || error) } catch {}
        return undefined
      }
    }

    function chip(tone, text) {
      return h('span', { className: 'ww-chip' + (tone ? ' ' + tone : '') }, text)
    }

    function formatTime(value) {
      const epoch = Number(value)
      if (!Number.isFinite(epoch) || epoch <= 0) return ''
      const date = new Date(epoch * 1000)
      const now = Date.now()
      const diff = Math.max(0, now - date.getTime())
      if (diff < 60 * 1000) return '刚刚'
      if (diff < 60 * 60 * 1000) return Math.floor(diff / 60000) + ' 分钟前'
      if (diff < 24 * 60 * 60 * 1000) return Math.floor(diff / 3600000) + ' 小时前'
      return (date.getMonth() + 1) + '/' + date.getDate() + ' ' +
        String(date.getHours()).padStart(2, '0') + ':' + String(date.getMinutes()).padStart(2, '0')
    }

    function formatWhen(value) {
      if (typeof value === 'number') return formatTime(value)
      const ms = Date.parse(String(value ?? ''))
      if (!Number.isFinite(ms)) return ''
      return formatTime(Math.floor(ms / 1000))
    }

    function icon(name, size) {
      const s = typeof size === 'number' ? size : 15
      let paths
      if (name === 'whale') {
        paths = [
          h('path', { key: 'a', d: 'M3 13c3-4.5 8-5.5 12-3 1.2.7 2 1.8 2 3.1 0 1.2-1 2-2 2-1.1 0-2-.9-2-2 0-.6.3-1.1.7-1.5' }),
          h('path', { key: 'b', d: 'M19 12l3-2v5l-3-2' }),
          h('circle', { key: 'c', cx: 15.2, cy: 11.2, r: 0.7, fill: 'currentColor', stroke: 'none' }),
          h('path', { key: 'd', d: 'M4.5 14.5c1.8 1.4 3.8 1.4 5.5.2' }),
        ]
      } else if (name === 'refresh') {
        paths = [
          h('path', { key: 'a', d: 'M20 11a8 8 0 1 0-2.3 6.3' }),
          h('path', { key: 'b', d: 'M20 4v7h-7' }),
        ]
      } else {
        paths = [
          h('rect', { key: 'a', x: 4, y: 10, width: 16, height: 10, rx: 2 }),
          h('path', { key: 'b', d: 'M8 10V7a4 4 0 0 1 8 0v3' }),
        ]
      }
      return h('svg', {
        viewBox: '0 0 24 24', width: s, height: s, 'aria-hidden': 'true',
        fill: 'none', stroke: 'currentColor', strokeWidth: 1.6,
        strokeLinecap: 'round', strokeLinejoin: 'round',
      }, paths)
    }

    function Card(props) {
      return h('div', { className: 'ww-card' + (props.tight ? ' tight' : '') }, props.children)
    }

    function Modal(props) {
      if (!props.data) return null
      return h('div', { className: 'ww-modal-mask', role: 'dialog', 'aria-modal': 'true' },
        h('div', { className: 'ww-modal' },
          h('h3', null, props.data.title),
          h('p', null, props.data.body),
          h('div', { className: 'ww-actions', style: { display: 'flex', gap: 8 } },
            h('button', { className: 'ww-btn ghost small', onClick: props.onCancel }, '取消'),
            h('button', { className: 'ww-btn primary small', onClick: props.onConfirm }, props.data.confirm || '确认'),
          ),
        ),
      )
    }

    function Head(props) {
      const account = props.account
      return h('header', { className: 'ww-head' },
        h('div', null,
          h('div', { className: 'ww-eyebrow' },
            props.onBack ? h('button', { className: 'ww-btn ghost small', style: { marginRight: 8 }, onClick: props.onBack }, '← 返回主页') : null,
            'Bilibili / 养鱼',
          ),
          h('h1', null, props.title),
          h('div', { className: 'ww-sub' }, props.subtitle),
        ),
        h('div', { className: 'ww-right' },
          h('span', { className: 'ww-account' },
            h('span', { className: 'ww-avatar' }, account.face ? h('img', { src: account.face, alt: '', referrerPolicy: 'no-referrer' }) : account.short),
            h('b', null, account.name),
            h('span', null, account.authenticated ? (account.days ? '已登录 ' + account.days + ' 天' : '已登录') : '未登录'),
          ),
          chip(props.killed ? 'danger' : 'info', props.killed ? '已停机 · 写操作拒绝' : '受控写 · 需确认'),
          props.killed
            ? h('button', { className: 'ww-btn ghost small', onClick: props.onOpenHealth }, '去恢复')
            : h('button', { className: 'ww-btn danger small', onClick: props.onKill, title: '立即停机：所有写操作被宿主拒绝' }, '停机'),
          h('button', { className: 'ww-btn ghost small', disabled: props.killed, onClick: props.onSetup, title: props.killed ? '已停机：恢复后才能重新登录' : '重新打开首次配置' }, '配置'),
          h('button', { className: 'ww-iconbtn', title: '刷新', 'aria-label': '刷新', onClick: props.onRefresh }, icon('refresh')),
        ),
      )
    }

    function Setup(props) {
      const [step, setStep] = React.useState('welcome')
      const [qr, setQr] = React.useState(null)
      const [error, setError] = React.useState('')
      const [busy, setBusy] = React.useState(false)
      const pollRef = React.useRef(null)
      const [quick, setQuick] = React.useState({
        wakeStart: props.settings.wakeStart,
        dailyShare: props.settings.dailyShare,
        roleName: props.settings.roleName,
      })
      const [deps, setDeps] = React.useState(null)
      React.useEffect(() => {
        rpc('deps.check').then((data) => setDeps(data.value)).catch(() => {})
      }, [])
      React.useEffect(() => {
        setQuick({
          wakeStart: props.settings.wakeStart,
          dailyShare: props.settings.dailyShare,
          roleName: props.settings.roleName,
        })
      }, [props.settings.wakeStart, props.settings.dailyShare, props.settings.roleName])

      React.useEffect(() => () => { if (pollRef.current !== null) clearTimeout(pollRef.current) }, [])
      React.useEffect(() => { if (props.account?.authenticated) setStep('config') }, [props.account])

      function stopPolling() {
        if (pollRef.current !== null) {
          clearTimeout(pollRef.current)
          pollRef.current = null
        }
      }

      function schedule(id) {
        stopPolling()
        const tick = async () => {
          try {
            const data = await rpc('auth.qr.poll', { id })
            const value = data.value
            setQr(value)
            if (value.status === 'success') {
              stopPolling()
              props.onAccount(value.account)
              setStep('config')
              return
            }
            if (['expired', 'cancelled', 'error'].includes(value.status)) {
              stopPolling()
              return
            }
            pollRef.current = setTimeout(tick, 2000)
          } catch (e) {
            setError(e?.message || '轮询失败')
            pollRef.current = setTimeout(tick, 3000)
          }
        }
        pollRef.current = setTimeout(tick, 1500)
      }

      async function installQrcodeDep() {
        setBusy(true)
        setError('')
        try {
          const data = await rpc('deps.install', { name: 'qrcode' })
          if (!data.value?.ok) throw new Error(data.value?.message || '安装失败')
          setDeps((await rpc('deps.check')).value)
        } catch (installError) {
          setError(installError?.message || '安装失败')
        } finally {
          setBusy(false)
        }
      }

      async function start() {
        setBusy(true)
        setError('')
        try {
          const data = await rpc('auth.qr.start')
          setQr(data.value)
          setStep('qr')
          schedule(data.value.id)
        } catch (e) {
          setError(e?.message || '二维码生成失败')
        } finally {
          setBusy(false)
        }
      }

      async function cancel() {
        stopPolling()
        try { if (qr?.id) await rpc('auth.qr.cancel', { id: qr.id }) } catch {}
        setStep('welcome')
        setQr(null)
      }

      function finish() {
        props.onFinish(quick)
      }

      const statusText = {
        waiting: '等待扫码…',
        scanned: '已扫码，请在手机确认',
        expired: '二维码已过期，请重新生成',
        cancelled: '已取消',
        error: '登录失败',
        success: '登录成功',
      }[qr?.status] || ''

      const steps = [
        ['welcome', '1 登录'],
        ['config', '2 配置'],
      ]

      return h('section', { className: 'ww-setup', 'aria-label': '首次配置' },
        h('div', { className: 'ww-setup-head' },
          h('div', null,
            h('h2', null, '先花 1 分钟把工作台配好'),
            h('p', null, '第一次打开先扫码登录测试号；不登录也可以稍后回来配置。'),
          ),
          h('div', { className: 'ww-right' }, h('button', { className: 'ww-btn ghost small', onClick: props.onSkip }, '稍后配置')),
        ),
        h('div', { className: 'ww-setup-steps' }, steps.map(([id, label]) => h('span', { key: id, className: 'ww-setup-step' + (step === id ? ' on' : '') }, label))),
        step === 'welcome'
          ? h('div', null,
              h('div', { className: 'ww-setup-note' }, '登录只保存 B 站 cookies 到本机（0600），不会写进日志，也不会上传。真实写默认关闭；开启自动回复/关注确认后才会调用 B站写接口。'),
              deps?.rows?.some((row) => !row.ready && row.name === 'qrcode')
                ? h('div', { className: 'ww-setup-note', style: { color: 'var(--ww-warn)' } },
                    '依赖未就绪：' + deps.rows.filter((row) => !row.ready).map((row) => row.name).join(' / '),
                    h('button', { className: 'ww-btn ghost small', style: { marginLeft: 8 }, disabled: busy, onClick: installQrcodeDep }, '安装 qrcode'),
                  )
                : null,
              h('div', { className: 'ww-setup-actions' },
                h('button', { className: 'ww-btn primary', disabled: busy || props.killed, onClick: start }, props.killed ? '已停机：无法登录' : busy ? '生成中…' : '扫码登录测试号'),
                h('button', { className: 'ww-btn ghost', onClick: props.onSkip }, '稍后配置'),
              ),
              error ? h('div', { className: 'ww-setup-note', style: { color: 'var(--ww-danger)' } }, error) : null,
            )
          : step === 'qr'
            ? h('div', { className: 'ww-setup-grid' },
                qr?.image
                  ? h('div', { className: 'ww-qr' }, h('img', { src: qr.image, alt: 'B站登录二维码' }))
                  : h('div', { className: 'ww-qr-empty' }, '二维码未生成'),
                h('div', null,
                  h('div', { style: { fontSize: 12, fontWeight: 600, marginBottom: 6 } }, statusText || '准备扫码'),
                  h('div', { className: 'ww-setup-note' }, '用哔哩哔哩 App 扫码，并在手机确认。二维码约 3 分钟有效；过期后重新生成。'),
                  error ? h('div', { className: 'ww-setup-note', style: { color: 'var(--ww-danger)' } }, error) : null,
                  qr?.error ? h('div', { className: 'ww-setup-note', style: { color: 'var(--ww-danger)' } }, qr.error) : null,
                  h('div', { className: 'ww-setup-actions' },
                    h('button', { className: 'ww-btn ghost small', onClick: cancel }, '取消'),
                    h('button', { className: 'ww-btn ghost small', onClick: start, disabled: busy || props.killed }, '重新生成'),
                    h('button', { className: 'ww-btn ghost small', onClick: props.onSkip }, '稍后配置'),
                  ),
                ),
              )
            : h('div', null,
                h('div', { className: 'ww-setup-note' }, (props.account?.authenticated ? '已登录：' + props.account.name + '。' : '未登录，可稍后配置。') + '再确认三项常用配置。'),
                h(SettingRow, { label: '唤醒窗口', hint: '20:00–24:00 内随机醒；不是整点' },
                  h('input', { className: 'ww-inp w70', value: quick.wakeStart, onChange: (e) => setQuick((prev) => ({ ...prev, wakeStart: e.target.value })) }),
                ),
                h(SettingRow, { label: '每日分享上限', hint: '超过 3 条像刷量' },
                  h('input', { className: 'ww-inp w70', value: quick.dailyShare, onChange: (e) => setQuick((prev) => ({ ...prev, dailyShare: e.target.value })) }),
                ),
                h(SettingRow, { label: '角色名', hint: '她怎么被称呼' },
                  h('input', { className: 'ww-inp w180', value: quick.roleName, onChange: (e) => setQuick((prev) => ({ ...prev, roleName: e.target.value })) }),
                ),
                h('div', { className: 'ww-setup-actions' },
                  h('button', { className: 'ww-btn primary', onClick: finish }, '保存并进入工作台'),
                  h('button', { className: 'ww-btn ghost', onClick: props.onSkip }, '稍后配置'),
                ),
              ),
      )
    }

    function Tabs(props) {
      const items = props.items
      const active = props.active
      function onKeyDown(event) {
        if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
        event.preventDefault()
        const index = items.findIndex((item) => item.id === active)
        let next = index
        for (let step = 0; step < items.length; step += 1) {
          next = (next + (event.key === 'ArrowRight' ? 1 : items.length - 1)) % items.length
          if (!items[next].future) break
        }
        if (items[next] && !items[next].future) props.onChange(items[next].id)
      }
      return h('nav', { className: 'ww-tabs', role: 'tablist', 'aria-label': '工作台分区', onKeyDown },
        items.map((item) => h('button', {
          key: item.id,
          className: 'ww-tab' + (active === item.id ? ' on' : '') + (item.future ? ' future' : ''),
          role: 'tab',
          id: 'ww-tab-' + item.id,
          'aria-selected': active === item.id ? 'true' : 'false',
          'aria-controls': 'ww-panel-' + item.id,
          'aria-disabled': item.future ? 'true' : undefined,
          tabIndex: active === item.id ? 0 : -1,
          type: 'button',
          onClick: () => { if (!item.future) props.onChange(item.id) },
        }, item.label, item.count ? h('span', { className: 'ww-count' }, String(item.count)) : null, item.future ? h('span', { className: 'soon' }, '后续') : null)),
      )
    }

    function TabPanel(props) {
      return h('section', {
        role: 'tabpanel',
        id: 'ww-panel-' + props.id,
        'aria-labelledby': 'ww-tab-' + props.id,
        style: props.active ? undefined : { display: 'none' },
      }, props.children)
    }

    function Kpi(props) {
      return h('div', { className: 'ww-kpi' },
        h('div', { className: 'k' }, props.k),
        h('div', { className: 'v' + (props.num ? ' ww-num' : '') }, props.v),
        h('div', { className: 's' }, props.s),
      )
    }

    function CheckRow(props) {
      return h('div', { className: 'ww-check' },
        h('span', { className: 'n' }, props.n),
        h('span', { className: 'v' }, props.v),
        h('span', { className: 'ww-right' }, chip(props.tone || 'ok', props.tag)),
      )
    }

    function SettingRow(props) {
      return h('div', { className: 'ww-srow' + (props.block ? ' block' : '') },
        h('div', { className: 'l' },
          h('div', { className: 'sl' }, props.label),
          props.hint ? h('div', { className: 'sh' }, props.hint) : null,
        ),
        h('div', { className: 'v' }, props.children),
      )
    }

    function Toggle(props) {
      return h('button', {
        type: 'button',
        className: 'ww-sw' + (props.on ? ' on' : ''),
        role: 'switch',
        'aria-checked': props.on ? 'true' : 'false',
        'aria-label': props.label,
        onClick: () => props.onChange(!props.on),
      })
    }

    function Overview(props) {
      const k = props.data.kpis
      return h('div', null,
        h('div', { className: 'ww-kpis' },
          h(Kpi, { k: '账号健康', v: props.data.account?.authenticated ? '已登录' : '未登录', s: h('span', { style: { display: 'inline-flex', gap: 5, alignItems: 'center' } }, h('i', { key: 'dot', className: 'ww-dot' + (props.data.account?.authenticated ? '' : ' off') }), props.data.account?.authenticated ? '真实账号' : '等待登录') }),
          h(Kpi, { k: '今日分享', num: true, v: h('span', null, k.shareLimit ? String(k.shareUsed) + ' / ' + String(k.shareLimit) : '—'), s: h('span', { style: { color: 'var(--ww-t4)' } }, '按宿主记录') }),
          h(Kpi, { k: '监听', v: h('span', { style: { fontSize: 16 } }, '按设置'), s: h('span', { style: { color: 'var(--ww-t4)' } }, '私信 / 评论监听见设置') }),
          h(Kpi, { k: '下次唤醒', num: true, v: k.nextWake || '—', s: h('span', { style: { color: 'var(--ww-t4)' } }, '按作息窗口') }),
        ),
        h('div', { className: 'ww-grid2' },
          h('div', { className: 'ww-stack' },
            h(Card, null,
              h('div', { className: 'ww-cardhead' }, h('h2', null, '今日计划'), h('span', { className: 'ww-sub' }, '宿主计划'), h('div', { className: 'ww-right' }, chip('info', props.data.plan.length ? '有条目' : '暂无'))),
              props.data.plan.length === 0
                ? h('div', { className: 'ww-empty' }, '宿主还没有生成今日计划。')
                : h('div', { className: 'ww-plan' }, props.data.plan.map((row, index) => h('div', { className: 'r', key: String(index) }, h('span', { className: 'tm' }, row[0]), h('span', { className: 'what' }, row[1])))),
            ),
            h(Card, { tight: true },
              h('div', { className: 'ww-cardhead' }, h('h2', null, '最近日记'), h('div', { className: 'ww-right' }, h('button', { className: 'ww-btn ghost small', onClick: () => props.go('diary') }, '去日记 →'))),
              props.data.diaries.length === 0
                ? h('div', { className: 'ww-empty' }, '还没有日记。')
                : h('div', { className: 'ww-diary' }, props.data.diaries.map((d) => h('div', { className: 'd', key: d.title }, h('div', { className: 't' }, d.title), h('div', { className: 'x' }, d.body), h('div', { className: 'm' }, d.time + ' · ' + d.state)))),
            ),
          ),
          h('div', { className: 'ww-stack' },
            h(Card, { tight: true },
              h('div', { className: 'ww-cardhead' }, h('h2', null, '待审回复'), h('span', { className: 'ww-sub' }, props.data.pending.length + ' 条'), h('div', { className: 'ww-right' }, h('button', { className: 'ww-btn ghost small', onClick: () => props.go('pending') }, '全部'))),
              props.data.pending.length === 0
                ? h('div', { className: 'ww-empty' }, '没有待审回复。')
                : props.data.pending.map((p) => h('div', { className: 'ww-row', key: p.id },
                h('div', { className: 'ww-cover' }, h('span', { className: 'd' }, p.chips[1]?.[1] || '回复')),
                h('div', { className: 'ww-rowbody' }, h('p', null, p.who + '：' + p.quote), h('div', { className: 'ww-meta' }, p.chips.map((c, i) => chip(c[0], c[1])), p.video ? h('a', { className: 'ww-videolink', href: p.video.url, target: '_blank', rel: 'noopener noreferrer' }, '视频《' + p.video.title + '》') : null)),
                h('span', { className: 'ww-time' }, p.src.split('· ').pop()),
              )),
            ),
            h(Card, { tight: true },
              h('div', { className: 'ww-cardhead' }, h('h2', null, '体检摘要'), h('div', { className: 'ww-right' }, h('button', { className: 'ww-btn ghost small', onClick: () => props.go('health') }, '详情'))),
              props.data.health.map((row) => h(CheckRow, { key: row[0], n: row[0], v: row[1], tone: row[2], tag: row[3] })),
            ),
          ),
        ),
      )
    }

    function OwnerCard(props) {
      const [active, setActive] = React.useState(props.owners?.activeSource || 'manual')
      const [members, setMembers] = React.useState(props.owners?.members || [])
      const [mid, setMid] = React.useState('')
      const [name, setName] = React.useState('')
      const [busy, setBusy] = React.useState(false)
      React.useEffect(() => {
        setActive(props.owners?.activeSource || 'manual')
        setMembers(props.owners?.members || [])
      }, [props.owners?.activeSource, props.owners?.members])
      function changeSource(next) {
        const nextMembers = members.length > 0 ? members : (props.owners?.members || [])
        setActive(next)
        setMembers(nextMembers)
        if (typeof props.onSave === 'function') props.onSave({ activeSource: next, members: nextMembers })
      }
      const disabled = props.killed || busy
      function addManual() {
        const id = mid.trim()
        if (!/^[1-9]\d{0,19}$/.test(id)) return props.toast('主人 mid 必须是数字 UID')
        if (members.some((member) => member.mid === id)) return props.toast('这个 mid 已在名单里')
        const next = [...members, { mid: id, name: name.trim() || ('UID ' + id), source: 'manual', enabled: true }]
        setMembers(next)
        setMid(''); setName('')
        props.onSave({ activeSource: active, members: next })
      }
      function addMutual(row) {
        if (members.some((member) => member.mid === row.mid)) return props.toast('这个 mid 已在名单里')
        const next = [...members, { mid: row.mid, name: row.name, source: 'mutual', enabled: true }]
        setMembers(next)
        props.onSave({ activeSource: active, members: next })
      }
      function remove(member) {
        const next = members.filter((item) => item.mid !== member.mid)
        setMembers(next)
        props.onSave({ activeSource: active, members: next })
      }
      async function save() {
        setBusy(true)
        try { await props.onSave({ activeSource: active, members }) } finally { setBusy(false) }
      }
      async function loadMutual() {
        setBusy(true)
        try { await props.onFetch() } finally { setBusy(false) }
      }
      return h(Card, null,
        h('div', { className: 'ww-cardhead' }, h('h2', null, '主人与授权'), h('span', { className: 'ww-sub' }, '互关即主人；手动主人为补充'), h('div', { className: 'ww-right' }, chip(active === 'mutual' ? 'info' : 'ok', active === 'mutual' ? '互关优先' : '手动补充'))),
        h(SettingRow, { label: '生效来源', hint: '互关好友自动具备主人授权；手动名单只影响手动来源' },
          h('div', { style: { display: 'flex', gap: 6 } },
            h('button', { className: 'ww-btn ' + (active === 'manual' ? 'primary' : 'ghost') + ' small', onClick: () => changeSource('manual') }, '手动'),
            h('button', { className: 'ww-btn ' + (active === 'mutual' ? 'primary' : 'ghost') + ' small', onClick: () => changeSource('mutual') }, '互关'),
          ),
        ),
        h(SettingRow, { label: '手动添加', hint: 'B站 UID + 昵称；昵称只用于显示' },
          h('div', { style: { display: 'flex', gap: 6, flexWrap: 'wrap' } },
            h('input', { className: 'ww-inp w110', placeholder: 'UID', value: mid, onChange: (e) => setMid(e.target.value) }),
            h('input', { className: 'ww-inp w110', placeholder: '昵称', value: name, onChange: (e) => setName(e.target.value) }),
            h('button', { className: 'ww-btn ghost small', disabled, onClick: addManual }, '加入'),
          ),
        ),
        h(SettingRow, { label: '互关好友', hint: '只读拉取；不会自动关注任何人' },
          h('button', { className: 'ww-btn ghost small', disabled, onClick: loadMutual }, busy ? '读取中…' : '读取互关'),
          props.mutual?.error ? h('span', { style: { color: 'var(--ww-warn)', fontSize: 10 } }, props.mutual.error) : null,
        ),
        props.mutual?.members?.length
          ? h('div', { style: { margin: '4px 0 8px' } },
              h('div', { className: 'ww-sub', style: { marginBottom: 3 } }, props.mutual.stale ? '保留上次结果' : (props.mutual.updatedAt ? '更新于 ' + new Date(props.mutual.updatedAt).toLocaleTimeString() : '上次结果')),
              props.mutual.members.filter((row) => !members.some((member) => member.mid === row.mid)).map((row) => h('div', { className: 'ww-check', key: row.mid },
                h('span', { className: 'n' }, row.name + ' · ' + row.mid),
                h('span', { className: 'ww-right' }, h('button', { className: 'ww-btn ghost small', disabled, onClick: () => addMutual(row) }, '加入名单')),
              )))
          : null,
        h('div', { className: 'ww-cardhead', style: { marginTop: 12 } },
          h('h3', { style: { margin: 0, fontSize: 14 } }, '主人列表'),
          h('span', { className: 'ww-sub' }, members.length + ' 人 · 已加入的互关不再重复显示'),
        ),
        members.length === 0
          ? h('div', { className: 'ww-empty' }, '还没有主人。手动填 UID，或读取互关后加入。')
          : h('div', null, members.map((member) => h('div', { className: 'ww-check', key: member.mid },
              h('span', { className: 'n' }, member.name + ' · ' + member.mid),
              h('span', { className: 'ww-right' }, chip(member.source === 'mutual' ? 'info' : 'ok', member.source === 'mutual' ? '互关' : '手动'), h('button', { className: 'ww-btn ghost small', disabled, onClick: () => remove(member) }, '移除')),
            ))),
        h('div', { className: 'ww-actions', style: { marginTop: 10 } },
          h('button', { className: 'ww-btn primary small', disabled, onClick: save }, busy ? '保存中…' : '保存主人名单'),
          h('span', { className: 'note' }, '非主人 @ 直接忽略；评论/私信走三档回复'),
        ),
      )
    }

    function Account(props) {
      const a = props.account || {}
      const interactions = props.real?.replies || []
      const videos = props.real?.videos || []
      const accounts = props.accounts || { activeId: 'default', max: 5, accounts: [] }
      const [followMid, setFollowMid] = React.useState('')
      const [followName, setFollowName] = React.useState('')
      const pendingFollows = (props.followRequests || []).filter((item) => item.status === 'pending')
      const allFollows = (props.followRequests || []).slice(0, 8)
      return h('div', { className: 'ww-stack' },
        h(Card, null,
          h('div', { style: { display: 'flex', gap: 14, alignItems: 'center' } },
            h('span', { className: 'ww-avatar', style: { width: 72, height: 72, fontSize: 24, flexShrink: 0 } },
              a.face ? h('img', { src: a.face, alt: '', referrerPolicy: 'no-referrer' }) : (a.short || 'B')),
            h('div', { style: { minWidth: 0 } },
              h('div', { style: { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' } },
                h('h2', { style: { margin: 0 } }, a.name || '未登录'),
                chip(a.authenticated ? 'ok' : 'warn', a.authenticated ? '已登录' : '未登录'),
                a.level ? chip('info', 'Lv' + a.level) : null,
              ),
              h('div', { className: 'ww-sub', style: { marginTop: 4 } }, 'mid ' + (a.mid || '—')),
              h('div', { className: 'ww-sig', style: { marginTop: 6, color: 'var(--ww-t2)', fontSize: 12 } }, a.sign || '还没有签名'),
            ),
          ),
          h('div', { className: 'ww-kpis', style: { marginTop: 16, marginBottom: 0, gridTemplateColumns: 'repeat(4,minmax(0,1fr))' } },
            h(Kpi, { k: '关注', num: true, v: a.following ?? '—', s: 'following' }),
            h(Kpi, { k: '粉丝', num: true, v: a.follower ?? '—', s: 'follower' }),
            h(Kpi, { k: '内容库', num: true, v: props.contents.length, s: '本地草稿' }),
            h(Kpi, { k: '待审', num: true, v: props.pendingCount, s: '回复队列' }),
          ),
        ),
        h('div', { className: 'ww-grid2' },
          h(Card, null,
            h('div', { className: 'ww-cardhead' }, h('h2', null, '多账号'), h('span', { className: 'ww-sub' }, (accounts.accounts || []).length + ' / ' + (accounts.max || 5) + ' · 独立目录'), h('div', { className: 'ww-right' }, h('button', { className: 'ww-btn ghost small', disabled: (accounts.accounts || []).length >= (accounts.max || 5), onClick: props.onCreateAccount }, '添加账号'))),
            (accounts.accounts || []).map((item) => h('div', { className: 'ww-check', key: item.id },
              h('span', { className: 'n' }, item.name + (item.mid ? ' · ' + item.mid : '') + (item.active ? ' · 当前' : '')),
              h('span', { className: 'ww-right' },
                item.active ? chip('ok', '当前') : chip('off', '只读 · 未加载'),
                h('button', { className: 'ww-btn ghost small', onClick: () => props.onLoginAccount(item) }, item.mid ? '重新登录' : '登录'),
                item.active ? null : h('button', { className: 'ww-btn ghost small', onClick: () => props.onSwitchAccount(item) }, '切换'),
              ),
            )),
            props.accountQr?.session?.image && accounts.accounts?.some((item) => item.id === props.accountQr.accountId)
              ? h('div', { style: { textAlign: 'center', margin: '8px 0' } },
                  h('img', { src: props.accountQr.session.image, alt: 'B站登录二维码', style: { width: 160, height: 160, borderRadius: 8 } }),
                  h('div', { className: 'ww-sub' }, '二维码状态：' + (props.accountQr.session.status || 'waiting')),
                )
              : null,
            h('div', { className: 'ww-setup-note' }, '每个账号有独立 SQLite/凭据/主人/队列；切换后需重载插件或重启 DSH 才生效。'),
          ),
          h(Card, null,
            h('div', { className: 'ww-cardhead' }, h('h2', null, '关注确认'), h('span', { className: 'ww-sub' }, '确认后真实关注 · 每日限额')),
            h('div', { style: { display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 } },
              h('input', { className: 'ww-inp w110', placeholder: 'UID', value: followMid, onChange: (e) => setFollowMid(e.target.value) }),
              h('input', { className: 'ww-inp w110', placeholder: '昵称', value: followName, onChange: (e) => setFollowName(e.target.value) }),
              h('button', { className: 'ww-btn ghost small', onClick: () => { if (followMid.trim()) { props.onCreateFollow(followMid.trim(), followName.trim()); setFollowMid(''); setFollowName('') } } }, '请求关注'),
            ),
            pendingFollows.length === 0 && allFollows.length === 0
              ? h('div', { className: 'ww-empty' }, '没有待确认的关注请求。')
              : allFollows.map((item) => h('div', { className: 'ww-check', key: item.id },
                  h('span', { className: 'n' }, item.name + ' · ' + item.mid + ' · ' + item.status),
                  h('span', { className: 'ww-right' },
                    item.status === 'pending'
                      ? h('span', null,
                          h('button', { className: 'ww-btn primary small', onClick: () => props.onDecideFollow(item, 'approve') }, '确认'),
                          h('button', { className: 'ww-btn ghost small', onClick: () => props.onDecideFollow(item, 'reject') }, '驳回'),
                        )
                      : item.status === 'failed' || item.status === 'unknown'
                        ? h('button', { className: 'ww-btn ghost small', onClick: () => props.onCreateFollow(item.mid, item.name) }, '重新申请')
                        : chip(item.status === 'executed' ? 'ok' : 'info', item.status),
                  ),
                )),
          ),
          h(Card, null,
            h('div', { className: 'ww-cardhead' }, h('h2', null, '最近互动'), h('span', { className: 'ww-sub' }, 'reply + @ 合并'), h('div', { className: 'ww-right' }, h('button', { className: 'ww-btn ghost small', onClick: () => props.go('interact') }, '去互动'))),
            interactions.length === 0
              ? h('div', { className: 'ww-empty' }, '最近没有回复或 @。')
              : interactions.slice(0, 5).map((row) => h('div', { className: 'ww-row', key: row.id },
                  h('div', { className: 'ww-cover' }, row.cover ? h('img', { src: row.cover, alt: '', referrerPolicy: 'no-referrer' }) : h('span', { className: 'd' }, row.kind === 'at' ? '@' : '回复')),
                  h('div', { className: 'ww-rowbody' }, h('p', null, row.who + '：' + row.text), h('div', { className: 'ww-meta' }, chip(row.kind === 'at' ? 'info' : '', row.kind === 'at' ? '@我' : '回复'), row.videoUrl ? h('a', { className: 'ww-videolink', href: row.videoUrl, target: '_blank', rel: 'noopener noreferrer' }, '视频') : null)),
                  h('span', { className: 'ww-time' }, formatTime(row.at)),
                )),
          ),
          h('div', { className: 'ww-stack' },
            h(Card, { tight: true },
              h('div', { className: 'ww-cardhead' }, h('h2', null, '最近投稿'), h('span', { className: 'ww-sub' }, videos.length + ' 条')),
              videos.length === 0
                ? h('div', { className: 'ww-empty' }, '当前账号没有可读投稿，或接口被限流。')
                : videos.slice(0, 5).map((video) => h('div', { className: 'ww-row', key: video.bvid },
                    h('div', { className: 'ww-cover' }, h('span', { className: 'd' }, '视频')),
                    h('div', { className: 'ww-rowbody' }, h('p', null, video.title), h('div', { className: 'ww-meta' }, h('a', { className: 'ww-videolink', href: video.url, target: '_blank', rel: 'noopener noreferrer' }, '打开'))),
                  )),
            ),
            h(Card, { tight: true },
              h('div', { className: 'ww-cardhead' }, h('h2', null, '账号体检'), h('div', { className: 'ww-right' }, h('button', { className: 'ww-btn ghost small', onClick: () => props.go('health') }, '详情'))),
              props.health.slice(0, 5).map((row) => h(CheckRow, { key: row[0], n: row[0], v: row[1], tone: row[2], tag: row[3] })),
            ),
          ),
        ),
      )
    }

    function Fish(props) {
      const s = props.settings
      const set = props.set
      const personaInput = React.useRef(null)
      const emojiInput = React.useRef(null)
      const [memories, setMemories] = React.useState([])
      const [memLayer, setMemLayer] = React.useState('short')
      const [memText, setMemText] = React.useState('')
      const [personaPath, setPersonaPath] = React.useState('')
      const [emojiList, setEmojiList] = React.useState([])
      const [incomingEmoji, setIncomingEmoji] = React.useState([])
      const [emojiTarget, setEmojiTarget] = React.useState('')
      const [sendingEmoji, setSendingEmoji] = React.useState('')
      function addPersonaPath() {
        const next = personaPath.trim()
        if (next === '') return
        const list = String(s.personaPaths || '').split(/\r?\n/).filter(Boolean)
        if (!list.includes(next)) set('personaPaths', [...list, next].join('\n'))
        setPersonaPath('')
      }
      function removePersonaPath(path) {
        const list = String(s.personaPaths || '').split(/\r?\n/).filter((item) => item && item !== path)
        set('personaPaths', list.join('\n'))
      }
      async function refreshMemory() {
        try { const data = await rpc('memory.list'); setMemories(Array.isArray(data?.value) ? data.value : []) } catch {}
      }
      React.useEffect(() => { refreshMemory() }, [])
      async function refreshEmoji() {
        try {
          const [mine, incoming] = await Promise.all([rpc('emoji.list'), rpc('emoji.incoming')])
          setEmojiList(Array.isArray(mine?.value) ? mine.value : [])
          setIncomingEmoji(Array.isArray(incoming?.value) ? incoming.value : [])
        } catch {}
      }
      React.useEffect(() => { refreshEmoji() }, [])
      async function uploadEmoji(file) {
        if (!file) return
        if (!/^image\/(png|jpeg|webp|gif)$/.test(file.type)) { props.toast('表情包只支持 PNG/JPEG/WEBP/GIF'); return }
        if (file.size > 5 * 1024 * 1024) { props.toast('表情包不能超过 5MB'); return }
        try {
          const dataUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(String(reader.result || ''))
            reader.onerror = () => reject(reader.error || new Error('读取失败'))
            reader.readAsDataURL(file)
          })
          await rpc('emoji.save', { name: file.name, dataUrl })
          await refreshEmoji()
          props.toast('已加入表情包库')
        } catch (error) { props.toast(rpcMessage(error, '保存表情包失败')) }
      }
      async function sendEmoji(id) {
        const toMid = emojiTarget.trim()
        if (!/^[1-9]\d{0,19}$/.test(toMid)) { props.toast('先填对方的数字 UID'); return }
        setSendingEmoji(id)
        try {
          await rpc('dm.sendImage', { toMid, assetId: id })
          props.toast('图片私信已发送')
        } catch (error) { props.toast(rpcMessage(error, '图片发送失败')) } finally { setSendingEmoji('') }
      }
      async function promoteIncoming(id) {
        try { await rpc('emoji.promote', { id }); await refreshEmoji(); props.toast('已收进表情包库') } catch (error) { props.toast(rpcMessage(error, '收录失败')) }
      }
      async function removeIncoming(id) {
        try { await rpc('assets.delete', { kind: 'emoji-incoming', id }); await refreshEmoji(); props.toast('已忽略') } catch (error) { props.toast(rpcMessage(error, '删除失败')) }
      }
      async function removeEmoji(id) {
        try { await rpc('emoji.delete', { id }); await refreshEmoji(); props.toast('表情包已删除') } catch (error) { props.toast(rpcMessage(error, '删除失败')) }
      }
      async function addMemory() {
        if (!memText.trim()) { props.toast('记忆内容不能为空'); return }
        try {
          await rpc('memory.add', { layer: memLayer, text: memText.trim(), tags: ['manual'] })
          setMemText('')
          await refreshMemory()
          props.toast('记忆已保存')
        } catch (error) { props.toast(rpcMessage(error, '保存记忆失败')) }
      }
      async function removeMemory(id) {
        try { await rpc('memory.delete', { id }); await refreshMemory(); props.toast('记忆已删除') } catch (error) { props.toast(rpcMessage(error, '删除记忆失败')) }
      }
      async function pickPersona(file) {
        if (!file) return
        if (!/\.md$/i.test(file.name)) { props.toast('只支持 .md 文件'); return }
        try {
          const text = await file.text()
          if (!text.trim()) { props.toast('文件为空'); return }
          set('persona', text)
          set('personaFile', file.name)
          set('personaPreset', 'custom')
          const saved = await rpc('personas.import', { name: file.name, content: text })
          props.toast('已载入并保存：' + (saved.value?.name || file.name))
        } catch (error) {
          props.toast(rpcMessage(error, '读取人设文件失败'))
        }
      }
      function applyPreset(key) {
        const preset = (props.personaList || []).find((item) => item.key === key) || PERSONAS[key] || PERSONAS.custom
        set('personaPreset', key)
        set('roleName', preset.roleName)
        set('callYou', preset.callYou)
        set('selfName', preset.selfName)
        set('personaFile', preset.file || '')
        set('persona', preset.persona)
      }
      return h('div', { className: 'ww-grid2' },
        h('div', { className: 'ww-stack' },
          h(OwnerCard, { owners: props.owners, mutual: props.mutual, onSave: props.onSaveOwners, onFetch: props.onFetchMutual, toast: props.toast, killed: props.killed }),
          h(Card, null,
            h('div', { className: 'ww-cardhead' }, h('h2', null, '作息'), h('span', { className: 'ww-sub' }, '生物钟')),
            h(SettingRow, { label: '唤醒窗口', hint: '在这个时间段内随机醒来；不是整点' },
              h('input', { className: 'ww-inp w70', value: s.wakeStart, onChange: (e) => set('wakeStart', e.target.value) }),
              h('span', { style: { color: 'var(--ww-t4)' } }, '—'),
              h('input', { className: 'ww-inp w70', value: s.wakeEnd, onChange: (e) => set('wakeEnd', e.target.value) }),
            ),
            h(SettingRow, { label: '今晚不看的概率', hint: '0.3 = 三成；她也有权利不看' }, h('input', { className: 'ww-inp w70', value: s.skipProb, onChange: (e) => set('skipProb', e.target.value) })),
            h(SettingRow, { label: '单次候选视频', hint: '初筛数量；筛完再挑 2–3 条深读' }, h('input', { className: 'ww-inp w70', value: s.candidates, onChange: (e) => set('candidates', e.target.value) })),
            h(SettingRow, { label: '最小唤醒间隔', hint: '窗口放不下就少醒几次' }, h('input', { className: 'ww-inp w70', value: s.minGap, onChange: (e) => set('minGap', e.target.value) }), h('span', { style: { fontSize: 10, color: 'var(--ww-t4)' } }, '分钟')),
          ),
          h(Card, null,
            h('div', { className: 'ww-cardhead' }, h('h2', null, '分享'), h('span', { className: 'ww-sub' }, '克制')),
            h(SettingRow, { label: '分享方式', hint: '默认不发送；开启自动回复后按策略' },
              h('select', { className: 'ww-sel', value: s.shareMode, onChange: (e) => set('shareMode', e.target.value) }, h('option', null, '评论区 @ 你'), h('option', null, 'B站私信'))),
            h(SettingRow, { label: '每日分享上限', hint: '超过 3 条看起来会像刷量' }, h('input', { className: 'ww-inp w70', value: s.dailyShare, onChange: (e) => set('dailyShare', e.target.value) }), h('span', { style: { fontSize: 10, color: 'var(--ww-t4)' } }, '条 / 天')),
            h(SettingRow, { label: '每日关注上限', hint: '逐次确认后才会执行；平台风控优先' }, h('input', { className: 'ww-inp w70', value: s.followDailyLimit, onChange: (e) => set('followDailyLimit', e.target.value) }), h('span', { style: { fontSize: 10, color: 'var(--ww-t4)' } }, '人 / 天')),
            h(SettingRow, { label: '最低评分', hint: '0–20；低于阈值不发' }, h('input', { className: 'ww-inp w70', value: s.minScore, onChange: (e) => set('minScore', e.target.value) }), h('span', { style: { fontSize: 10, color: 'var(--ww-t4)' } }, '/ 20')),
            h(SettingRow, { label: '沉默衰减', hint: '连续 N 天没回应，分享额度开始下降' }, h('input', { className: 'ww-inp w70', value: s.silenceDays, onChange: (e) => set('silenceDays', e.target.value) }), h('span', { style: { fontSize: 10, color: 'var(--ww-t4)' } }, '天起')),
          ),
          h(Card, null,
            h('div', { className: 'ww-cardhead' }, h('h2', null, '私信与评论'), h('span', { className: 'ww-sub' }, '反风控')),
            h(SettingRow, { label: '私信监听', hint: '唯一叫得应的通道；只回主动来找你的人' }, h(Toggle, { on: s.dmListen, label: '私信监听', onChange: (v) => set('dmListen', v) })),
            h(SettingRow, { label: '自动回复', hint: 'B 模式：互关即主人 + 手动主人低风险直回；其他进队列' }, h(Toggle, { on: s.autoReply, label: '自动回复', onChange: (v) => { if (v) props.onAutoReply(); else props.onAutoReplyOff() } })),
            h(SettingRow, { label: '起床 / 睡前消息', hint: 'DSH 启动/关闭时给每个主人发一条；每天最多一次' }, h(Toggle, { on: s.lifecycleMessages !== false, label: '起床 / 睡前消息', onChange: (v) => set('lifecycleMessages', v) })),
            h(SettingRow, { label: '评论监听', hint: '只监控 BV 白名单；默认关闭' }, h(Toggle, { on: s.commentListen, label: '评论监听', onChange: (v) => set('commentListen', v) })),
            h(SettingRow, { block: true, label: '评论 BV 白名单', hint: '每行一个 BV；只回复主人/互关低风险' }, h('textarea', { className: 'ww-textarea', value: s.commentBvids || '', placeholder: 'BV1GJ411x7h7', onChange: (e) => set('commentBvids', e.target.value) })),
            h(SettingRow, { block: true, label: '图文评论白名单', hint: '每行一个图文 ID（opus/article id）' }, h('textarea', { className: 'ww-textarea', value: s.commentArticles || '', placeholder: '7411721', onChange: (e) => set('commentArticles', e.target.value) })),
            h(SettingRow, { label: '私信每日上限', hint: '0 = 当天不自动回私信' }, h('input', { className: 'ww-inp w70', value: s.dmDailyLimit ?? '10', onChange: (e) => set('dmDailyLimit', e.target.value) }), h('span', { style: { fontSize: 10, color: 'var(--ww-t4)' } }, '条 / 天')),
            h(SettingRow, { label: '评论每日上限', hint: '0 = 当天不自动回评论' }, h('input', { className: 'ww-inp w70', value: s.commentDailyLimit ?? '10', onChange: (e) => set('commentDailyLimit', e.target.value) }), h('span', { style: { fontSize: 10, color: 'var(--ww-t4)' } }, '条 / 天')),
            h(SettingRow, { label: '夜间静默', hint: '0:00–7:00 不处理互动' }, h(Toggle, { on: s.quietHours, label: '夜间静默', onChange: (v) => set('quietHours', v) })),
            h(SettingRow, { label: '私信白名单', hint: '只回已关注 / 主动私信过你的人' }, h(Toggle, { on: s.whitelist, label: '私信白名单', onChange: (v) => set('whitelist', v) })),
          ),
        ),
        h('div', { className: 'ww-stack' },
          h('div', { className: 'ww-actions', style: { display: 'flex', gap: 8 } },
            h('button', { className: 'ww-btn primary small', disabled: props.killed, onClick: props.onSave }, props.killed ? '已停机 · 无法保存' : '保存设置'),
            h('span', { className: 'note' }, '保存后写入宿主 SQLite'),
          ),
          h(Card, null,
            h('div', { className: 'ww-cardhead' }, h('h2', null, '口味'), h('span', { className: 'ww-sub' }, '她看什么，由你定')),
            h(SettingRow, { block: true, label: '爱看', hint: '逗号分隔；保存设置后生效' },
              h('input', { className: 'ww-inp', value: s.likeTags || '', placeholder: 'DSH/AI 工具,鬼畜,猫咪', onChange: (e) => set('likeTags', e.target.value) }),
              h('div', { className: 'ww-tagbox', style: { marginTop: 6 } }, String(s.likeTags || '').split(',').map((x) => x.trim()).filter(Boolean).map((x) => h('span', { className: 'ww-tag', key: x }, x))),
            ),
            h(SettingRow, { block: true, label: '不爱看', hint: '逗号分隔；保存设置后生效' },
              h('input', { className: 'ww-inp', value: s.dislikeTags || '', placeholder: '带货,擦边,标题党', onChange: (e) => set('dislikeTags', e.target.value) }),
              h('div', { className: 'ww-tagbox', style: { marginTop: 6 } }, String(s.dislikeTags || '').split(',').map((x) => x.trim()).filter(Boolean).map((x) => h('span', { className: 'ww-tag', key: x }, x))),
            ),
          ),
          h(Card, null,
            h('div', { className: 'ww-cardhead' }, h('h2', null, '表情包库'), h('span', { className: 'ww-sub' }, '本机自定义 · 审核后收录'),
              h('div', { className: 'ww-right' },
                h('input', { ref: emojiInput, type: 'file', accept: 'image/png,image/jpeg,image/webp,image/gif', style: { display: 'none' }, onChange: (e) => { uploadEmoji(e.target.files?.[0]); e.target.value = '' } }),
                h('button', { className: 'ww-btn ghost small', onClick: () => emojiInput.current?.click() }, '添加表情包'),
              )),
            h(SettingRow, { block: true, label: '图片私信目标', hint: '填对方的数字 UID；点图上的「发送」才会真实发私信' },
              h('input', { className: 'ww-inp', value: emojiTarget, placeholder: '例如 123456789', onChange: (e) => setEmojiTarget(e.target.value.replace(/[^0-9]/g, '')) }),
            ),
            h('div', { className: 'ww-sub', style: { margin: '4px 0 8px' } }, 'B站文字表情可直接写在回复里：' + '[doge] [星星眼] [笑哭] [疑惑] [傲娇] [吃瓜] [捂脸] [OK] [打call] [汤圆]'),
            emojiList.length === 0
              ? h('div', { className: 'ww-empty' }, '还没有表情包。点右上角「添加表情包」，或审核收录收到的图。')
              : h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))', gap: 8 } },
                  emojiList.slice(0, 30).map((asset) => h('div', { key: asset.id, style: { border: '1px solid var(--ww-b1)', borderRadius: 8, padding: 6, minWidth: 0 } },
                    asset.dataUrl ? h('img', { src: asset.dataUrl, alt: asset.name || '表情包', style: { width: '100%', height: 64, objectFit: 'cover', borderRadius: 6, display: 'block' } }) : null,
                    h('div', { className: 'ww-sub', style: { marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, asset.name || '表情包'),
                    h('div', { style: { display: 'flex', gap: 4, marginTop: 4 } },
                      h('button', { className: 'ww-btn ghost small', disabled: sendingEmoji === asset.id, onClick: () => sendEmoji(asset.id) }, sendingEmoji === asset.id ? '发送中…' : '发送'),
                      h('button', { className: 'ww-btn ghost small', disabled: props.killed, onClick: () => removeEmoji(asset.id) }, '删除'),
                    ),
                  ))),
            incomingEmoji.length > 0 ? h('div', { style: { marginTop: 12 } },
              h('div', { className: 'ww-sub', style: { marginBottom: 6 } }, '收到的图片 · 审核后决定是否收进表情包库'),
              h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))', gap: 8 } },
                incomingEmoji.slice(0, 12).map((asset) => h('div', { key: asset.id, style: { border: '1px solid var(--ww-b1)', borderRadius: 8, padding: 6, minWidth: 0 } },
                  asset.dataUrl ? h('img', { src: asset.dataUrl, alt: '收到的图片', style: { width: '100%', height: 64, objectFit: 'cover', borderRadius: 6, display: 'block' } }) : null,
                  h('div', { style: { display: 'flex', gap: 4, marginTop: 4 } },
                    h('button', { className: 'ww-btn primary small', disabled: props.killed, onClick: () => promoteIncoming(asset.id) }, '收录'),
                    h('button', { className: 'ww-btn ghost small', disabled: props.killed, onClick: () => removeIncoming(asset.id) }, '忽略'),
                  ),
                ))),
            ) : null,
          ),
          h(Card, null,
            h('div', { className: 'ww-cardhead' }, h('h2', null, '她是谁'), h('span', { className: 'ww-sub' }, '人设'), h('div', { className: 'ww-right' },
              h('button', { className: 'ww-btn ghost small', onClick: () => props.onReloadPersonas() }, '重新载入'),
              h('button', { className: 'ww-btn primary small', disabled: props.killed, onClick: () => props.onSave() }, '保存人格'),
            )),
            h(SettingRow, { block: true, label: '外部人格文件', hint: '可添加多个本地 .md/.txt 路径；不复制进仓库' },
              h('div', { style: { display: 'flex', gap: 6, flexWrap: 'wrap' } },
                h('input', { className: 'ww-inp', style: { flex: '1 1 260px' }, value: personaPath, placeholder: 'C:\\Users\\...\\persona.md', onChange: (e) => setPersonaPath(e.target.value) }),
                h('button', { className: 'ww-btn ghost small', onClick: addPersonaPath }, '添加路径'),
              ),
              h('div', { style: { marginTop: 6 } }, String(s.personaPaths || '').split(/\r?\n/).filter(Boolean).map((path) => h('div', { className: 'ww-check', key: path },
                h('span', { className: 'n', style: { overflowWrap: 'anywhere' } }, path),
                h('span', { className: 'ww-right' }, h('button', { className: 'ww-btn ghost small', onClick: () => removePersonaPath(path) }, '移除')),
              ))),
            ),
            h(SettingRow, { label: '人格预设', hint: '切换后填入称呼与人设；仍可手动改' },
              h('select', { className: 'ww-sel', value: s.personaPreset || 'deepseek-whale', onChange: (e) => applyPreset(e.target.value) },
                (props.personaList || Object.keys(PERSONAS).map((key) => ({ key, ...PERSONAS[key] }))).map((preset) => h('option', { value: preset.key, key: preset.key }, preset.label)),
              ),
            ),
            h(SettingRow, { label: '角色名', hint: '她怎么被称呼' }, h('input', { className: 'ww-inp w180', value: s.roleName, onChange: (e) => set('roleName', e.target.value) })),
            h(SettingRow, { label: '怎么称呼你', hint: '例如「主人」' }, h('input', { className: 'ww-inp w110', value: s.callYou, onChange: (e) => set('callYou', e.target.value) })),
            h(SettingRow, { label: '怎么自称', hint: '例如「我」/「人家」' }, h('input', { className: 'ww-inp w110', value: s.selfName, onChange: (e) => set('selfName', e.target.value) })),
            h(SettingRow, { block: true, label: '人设文件（仅支持 .md）', hint: '从文件管理器选择；会保存到下面的人设文件夹' },
              h('input', { ref: personaInput, type: 'file', accept: '.md,text/markdown', style: { display: 'none' }, onChange: (e) => { pickPersona(e.target.files?.[0]); e.target.value = '' } }),
              h('div', { className: 'ww-actions', style: { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' } },
                h('button', { className: 'ww-btn ghost small', onClick: () => personaInput.current?.click() }, '选择 md 文件'),
                h('span', { className: 'note', style: { overflowWrap: 'anywhere' } }, s.personaFile ? '当前：' + s.personaFile : '未选择文件'),
              ),
              h('div', { className: 'ww-sub', style: { marginTop: 4 } }, '已载入 ' + String(s.persona || '').length + ' 字；保存人格后生效'),
            ),
          ),
          h(Card, null,
            h('div', { className: 'ww-cardhead' }, h('h2', null, '日记与通知'), h('span', { className: 'ww-sub' }, '两本')),
            h(SettingRow, { label: '写两本日记', hint: '给主人的信 + 她自己的；日记本身不能关' }, chip('ok', '固定开启')),
            h(SettingRow, { label: '推送日记摘要', hint: '只推「给他的信」里最想说的那段' }, h(Toggle, { on: s.pushDiary, label: '推送日记摘要', onChange: (v) => set('pushDiary', v) })),
            h(SettingRow, { label: '消息推送', hint: '桌面通知 / Webhook / 自定义命令' }, h('select', { className: 'ww-sel', value: s.notifyChannel, onChange: (e) => set('notifyChannel', e.target.value) }, h('option', null, '桌面通知'), h('option', null, 'Webhook'))),
          ),
          h(Card, null,
            h('div', { className: 'ww-cardhead' }, h('h2', null, '记忆'), h('span', { className: 'ww-sub' }, '短期 7 天 / 长期手动')),
            h(SettingRow, { block: true, label: '新增记忆' },
              h('div', { style: { display: 'flex', gap: 6, flexWrap: 'wrap' } },
                h('select', { className: 'ww-sel', value: memLayer, onChange: (e) => setMemLayer(e.target.value) }, h('option', { value: 'short' }, '短期'), h('option', { value: 'long' }, '长期')),
                h('input', { className: 'ww-inp', style: { flex: '1 1 220px' }, value: memText, placeholder: '例如：主人喜欢短句、不喜欢标题党', onChange: (e) => setMemText(e.target.value), maxLength: 4000 }),
                h('button', { className: 'ww-btn ghost small', disabled: props.killed, onClick: addMemory }, '保存'),
              ),
            ),
            memories.length === 0
              ? h('div', { className: 'ww-empty' }, '还没有记忆。')
              : h('div', null, memories.slice(0, 8).map((item) => h('div', { className: 'ww-check', key: item.id },
                  h('span', { className: 'n' }, (item.layer === 'long' ? '长期 · ' : '短期 · ') + item.text),
                  h('span', { className: 'ww-right' }, h('button', { className: 'ww-btn ghost small', disabled: props.killed, onClick: () => removeMemory(item.id) }, '删除')),
                ))),
          ),
          h(Card, null,
            h('div', { className: 'ww-cardhead' }, h('h2', null, '工具链'), h('span', { className: 'ww-sub' }, '数据与依赖')),
            h(SettingRow, { block: true, label: '人设保存文件夹', hint: '留空 = 插件 personas/；可选任意本机文件夹' },
              h('div', { style: { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' } },
                h('input', { className: 'ww-inp', style: { flex: '1 1 220px', minWidth: 0 }, value: s.personaDir || '', placeholder: '默认：插件 personas/', onChange: (e) => set('personaDir', e.target.value) }),
                h('button', { className: 'ww-btn ghost small', disabled: props.killed, onClick: () => props.onSave() }, '保存文件夹'),
              ),
            ),
            h(SettingRow, { label: '专用会话目录', hint: '留空使用默认；重启后新建会话生效' }, h('input', { className: 'ww-inp w180', value: s.sessionDir, placeholder: '默认', onChange: (e) => set('sessionDir', e.target.value) })),
            h(SettingRow, { label: '工具目录', hint: '留空 = 用插件自带的 tools/' }, h('input', { className: 'ww-inp w180', value: s.toolsDir, placeholder: '默认', onChange: (e) => set('toolsDir', e.target.value) })),
            h(SettingRow, { label: '数据目录', hint: '配置 / 凭据 / 日记 / 账本' }, chip('', s.dataDir), h('button', { className: 'ww-btn ghost small', onClick: () => props.toast('数据目录由宿主管理') }, '打开')),
          ),
        ),
      )
    }

    function Pending(props) {
      const items = props.items
      const [candidates, setCandidates] = React.useState([])
      React.useEffect(() => {
        rpc('candidates.list').then((data) => setCandidates(Array.isArray(data?.value) ? data.value : [])).catch(() => {})
      }, [])
      async function decideCandidate(id, action) {
        try {
          await rpc('candidate.decide', { id, action })
          const data = await rpc('candidates.list')
          setCandidates(Array.isArray(data?.value) ? data.value : [])
          props.onRefresh?.()
        } catch (error) { props.onError?.(rpcMessage(error, '候选处理失败')) }
      }
      const queue = (props.queue || []).filter((item) => item.status === 'pending')
      const killed = props.killed === true
      return h('div', { className: 'ww-stack' },
        candidates.length ? h(Card, null,
          h('div', { className: 'ww-cardhead' }, h('h2', null, '候选审查'), h('span', { className: 'ww-sub' }, candidates.length + ' 条 · 评论候选'), h('div', { className: 'ww-right' }, chip('warn', '待审'))),
          candidates.map((item) => h('div', { className: 'ww-pitem', key: item.id },
            h('div', { className: 'ww-phead' }, h('span', { className: 'who' }, item.talkerId), chip('info', item.source), h('span', { className: 'src' }, item.bvid || '')),
            h('div', { className: 'ww-pquote' }, item.reply),
            h('div', { className: 'ww-pactions' },
              h('button', { className: 'ww-btn primary small', onClick: () => decideCandidate(item.id, 'approve') }, '通过并入 outbox'),
              h('button', { className: 'ww-btn ghost small', onClick: () => decideCandidate(item.id, 'reject') }, '驳回'),
            ),
          )),
        ) : null,
        queue.length ? h(Card, null,
          h('div', { className: 'ww-cardhead' }, h('h2', null, '待审回复'), h('span', { className: 'ww-sub' }, queue.length + ' 条 · 自动回复待人工确认'), h('div', { className: 'ww-right' }, chip('warn', '待审'))),
          h('div', { className: 'ww-pending' }, queue.map((item) => h('div', { className: 'ww-pitem', key: item.id },
            h('div', { className: 'ww-phead' }, h('span', { className: 'who' }, item.fromMid || '未知'), chip(item.mode === 'confirm' ? 'danger' : 'warn', item.mode), h('span', { className: 'src' }, item.source || '私信')),
            h('div', { className: 'ww-pquote' }, item.text),
            h('div', { className: 'ww-pactions' },
              h('button', { className: 'ww-btn primary small', disabled: killed, onClick: () => props.onDecideReply(item.id, 'approve') }, '通过（仅记录）'),
              h('button', { className: 'ww-btn ghost small', disabled: killed, onClick: () => props.onDecideReply(item.id, 'reject') }, '驳回'),
              h('span', { className: 'note' }, '真实发送仍需单独确认'),
            ),
          ))),
        ) : null,
        h(Card, null,
          h('div', { className: 'ww-cardhead' }, h('h2', null, '待审互动'), h('span', { className: 'ww-sub' }, items.length + ' 条 · 只生成草稿，发送需人工'), h('div', { className: 'ww-right' }, killed ? chip('danger', '已停机') : chip('info', '白名单 1'))),
          killed ? h('div', { className: 'ww-killbar' }, icon('lock', 13), h('span', null, h('b', null, '已停机'), ' · 回复审批写入会被宿主拒绝；先到「体检」恢复。')) : null,
          items.length === 0
            ? h('div', { style: { fontSize: 11, color: 'var(--ww-t4)', padding: '10px 0' } }, '全部处理完了。新草稿会出现在这里。')
            : h('div', { className: 'ww-pending' }, items.map((p) => h('div', { className: 'ww-pitem', key: p.id },
                h('div', { className: 'ww-phead' }, h('span', { className: 'who' }, p.who), p.chips.map((c, i) => chip(c[0], c[1])),
                  p.video ? h('a', { className: 'ww-videolink', href: p.video.url, target: '_blank', rel: 'noopener noreferrer' }, '视频《' + p.video.title + '》') : null,
                  h('span', { className: 'src' }, p.video ? (p.time || '') : p.src)),
                h('div', { className: 'ww-pquote' }, p.quote),
                h('div', { className: 'ww-pdraft' }, p.draft),
                h('div', { className: 'ww-pactions' },
                  h('button', { className: 'ww-btn primary small', disabled: killed, onClick: () => props.approve(p) }, '通过（仅记录）'),
                  h('button', { className: 'ww-btn ghost small', disabled: killed, onClick: () => props.reject(p) }, '驳回'),
                  h('span', { className: 'note' }, killed ? '已停机：审批写入被宿主拒绝' : p.note),
                ),
              ))),
        ),
      )
    }

    const CONTENT_STATES = {
      idea: ['', '想法'],
      draft: ['warn', '草稿'],
      approval_pending: ['info', '待审'],
      approved: ['ok', '已通过'],
      rejected: ['danger', '已驳回'],
    }

    function contentStateChip(state) {
      const entry = CONTENT_STATES[state] || ['', state || '未知']
      return chip(entry[0], entry[1])
    }

    function approvalDecisionChip(approval, items) {
      if (approval.decision === 'approved') return chip('ok', '通过')
      if (approval.decision === 'rejected') return chip('danger', '驳回')
      if (approval.decision === 'approval_stale') return chip('off', '已失效')
      const content = items.find((item) => item.id === approval.contentId)
      if (content && content.version !== approval.version) return chip('off', '已失效')
      return chip('warn', '待审')
    }

    function ContentRow(props) {
      const item = props.item
      const approval = props.approval
      const last = props.lastApproval
      const [rejecting, setRejecting] = React.useState(false)
      const [reason, setReason] = React.useState('')
      const [editing, setEditing] = React.useState(false)
      const [editTitle, setEditTitle] = React.useState(item.title)
      const [editScript, setEditScript] = React.useState(item.script)
      const [busy, setBusy] = React.useState(false)
      const disabled = props.killed || busy

      async function run(action) {
        setBusy(true)
        try { await action() } finally { setBusy(false) }
      }
      function startReject() {
        setRejecting(true)
        setReason('')
      }
      function startEdit() {
        setEditTitle(item.title)
        setEditScript(item.script)
        setEditing(true)
      }
      async function saveEdit() {
        if (editTitle.trim() === '') {
          props.toast('标题必填')
          return
        }
        await run(async () => {
          const saved = await props.onUpdate(item, {
            title: editTitle.trim(),
            script: editScript,
            version: item.version,
          })
          if (saved) setEditing(false)
        })
      }
      async function confirmReject() {
        if (reason.trim() === '') {
          props.toast('驳回原因必填')
          return
        }
        await run(async () => {
          const saved = await props.onReject(approval, reason.trim())
          if (saved) setRejecting(false)
        })
      }

      const actions = []
      if (item.state === 'approval_pending' && approval) {
        actions.push(h('button', { key: 'approve', className: 'ww-btn primary small', disabled, onClick: () => run(() => props.onApprove(approval)) }, '通过'))
        actions.push(h('button', { key: 'reject', className: 'ww-btn ghost small', disabled, onClick: startReject }, '驳回'))
      } else if (item.state === 'draft') {
        actions.push(h('button', { key: 'submit', className: 'ww-btn primary small', disabled, onClick: () => run(() => props.onSubmit(item)) }, '提交审批'))
        actions.push(h('button', { key: 'edit', className: 'ww-btn ghost small', disabled, onClick: startEdit }, '改稿'))
        actions.push(h('button', { key: 'delete', className: 'ww-btn ghost small', disabled, onClick: () => props.onDelete(item) }, '删除'))
      } else if (item.state === 'approved') {
        actions.push(chip('ok', '已批准 · 只读 · 未发布'))
      } else if (item.state === 'rejected') {
        actions.push(chip('danger', '已驳回 · 可改稿后重新提交'))
        actions.push(h('button', { key: 'edit', className: 'ww-btn ghost small', disabled, onClick: startEdit }, '改稿'))
        actions.push(h('button', { key: 'delete', className: 'ww-btn ghost small', disabled, onClick: () => props.onDelete(item) }, '删除'))
      }

      return h('div', { className: 'ww-citem' },
        h('div', { className: 'ctitle' }, item.title, chip(item.kind === 'article' ? 'info' : '', item.kind === 'article' ? '图文' : '视频'), contentStateChip(item.state), h('span', { className: 'ww-time' }, 'v' + item.version)),
        h('div', { className: 'cmeta' }, h('span', null, '更新于 ' + (formatWhen(item.updatedAt) || '—')), h('span', null, '·'), h('span', null, item.id)),
        item.script
          ? h('div', { className: 'cscript' }, item.script)
          : h('div', { className: 'cscript', style: { color: 'var(--ww-t4)' } }, '（无脚本字段）'),
        editing
          ? h('div', { className: 'ww-form', style: { marginTop: 8 } },
              h('label', null, '标题'),
              h('input', { className: 'ww-inp', value: editTitle, disabled: busy, maxLength: 200, onChange: (e) => setEditTitle(e.target.value) }),
              h('label', null, '脚本 / 正文'),
              h('textarea', { className: 'ww-textarea', value: editScript, disabled: busy, onChange: (e) => setEditScript(e.target.value) }),
              h('div', { style: { display: 'flex', gap: 6, marginTop: 6 } },
                h('button', { className: 'ww-btn primary small', disabled: busy || props.killed, onClick: saveEdit }, busy ? '保存中…' : '保存改稿 v' + (item.version + 1)),
                h('button', { className: 'ww-btn ghost small', disabled: busy, onClick: () => setEditing(false) }, '取消'),
              ),
            )
          : null,
        last && last.decision === 'rejected'
          ? h('div', { className: 'ww-pquote', style: { marginTop: 6 } }, chip('danger', '驳回原因'), ' ' + (last.reason || '未记录'))
          : null,
        last && last.decision === 'approved'
          ? h('div', { className: 'ww-pquote', style: { marginTop: 6 } }, chip('ok', '审批人 ' + (last.actor || '用户')), ' · v' + last.version)
          : null,
        actions.length > 0 || props.killed
          ? h('div', { className: 'cactions' },
              actions,
              props.killed ? h('span', { className: 'note' }, '已停机：写操作被宿主拒绝') : null,
            )
          : null,
        rejecting
          ? h('div', { className: 'ww-reason' },
              h('input', { className: 'ww-inp', placeholder: '驳回原因（必填）', value: reason, disabled: busy, onChange: (e) => setReason(e.target.value) }),
              h('button', { className: 'ww-btn danger small', disabled, onClick: confirmReject }, busy ? '提交中…' : '确认驳回'),
              h('button', { className: 'ww-btn ghost small', disabled: busy, onClick: () => setRejecting(false) }, '取消'),
            )
          : null,
      )
    }

    function Content(props) {
      const items = props.items || []
      const approvals = props.approvals || []
      const killed = props.killed === true
      const [title, setTitle] = React.useState('')
      const [script, setScript] = React.useState('')
      const [kind, setKind] = React.useState('article')
      const [busy, setBusy] = React.useState(false)
      const pendingCount = items.filter((item) => item.state === 'approval_pending').length

      function pendingFor(item) {
        return approvals.find((a) => a.contentId === item.id && a.decision === 'pending' && a.version === item.version) || null
      }
      function latestFor(item) {
        return approvals.find((a) => a.contentId === item.id && a.decision !== 'pending') || null
      }

      async function save() {
        if (title.trim() === '') {
          props.toast('标题必填')
          return
        }
        setBusy(true)
        try {
          const saved = await props.onCreate({ title: title.trim(), script, kind })
          if (saved) {
            setTitle('')
            setScript('')
          }
        } finally {
          setBusy(false)
        }
      }

      return h('div', null,
        killed
          ? h('div', { className: 'ww-killbar' }, icon('lock', 13), h('span', null, h('b', null, '已停机'), ' · 所有写操作被宿主拒绝；到「体检」恢复需二次确认。'))
          : null,
        h('div', { className: 'ww-grid2' },
          h('div', { className: 'ww-stack' },
            h(Card, null,
              h('div', { className: 'ww-cardhead' }, h('h2', null, '内容草稿'), h('span', { className: 'ww-sub' }, items.length + ' 条 · 待审 ' + pendingCount + ' 条'), h('div', { className: 'ww-right' }, chip('info', '只读 · 不发布'))),
              items.length === 0
                ? h('div', { className: 'ww-empty' }, '还没有草稿。右侧填标题和脚本，保存后会出现在这里；提交审批后由你人工通过或驳回。')
                : h('div', { className: 'ww-contentlist' }, items.map((item) => h(ContentRow, {
                    key: item.id,
                    item,
                    approval: pendingFor(item),
                    lastApproval: latestFor(item),
                    killed,
                    toast: props.toast,
                    onSubmit: props.onSubmit,
                    onUpdate: props.onUpdate,
                    onDelete: props.onDelete,
                    onApprove: props.onApprove,
                    onReject: props.onReject,
                  }))),
            ),
            h(Card, { tight: true },
              h('div', { className: 'ww-cardhead' }, h('h2', null, '审批记录'), h('span', { className: 'ww-sub' }, 'append-only · 本地')),
              approvals.length === 0
                ? h('div', { className: 'ww-empty' }, '暂无审批记录。')
                : h('table', { className: 'ww-table' },
                    h('thead', null, h('tr', null, h('th', null, '时间'), h('th', null, '版本'), h('th', null, '决定'), h('th', null, '审批人'), h('th', null, '原因'))),
                    h('tbody', null, approvals.slice(0, 12).map((a) => h('tr', { key: a.id },
                      h('td', { className: 'ww-num' }, formatWhen(a.at) || '—'),
                      h('td', null, 'v' + a.version),
                      h('td', null, approvalDecisionChip(a, items)),
                      h('td', null, a.actor || '—'),
                      h('td', null, a.reason || '—'),
                    ))),
                  ),
            ),
          ),
          h(Card, null,
            h('div', { className: 'ww-cardhead' }, h('h2', null, '新建草稿'), h('span', { className: 'ww-sub' }, '本地保存 · 不发布')),
            h('div', { className: 'ww-form' },
              h('label', null, '类型'),
              h('div', { style: { display: 'flex', gap: 6, marginBottom: 8 } },
                h('button', { className: 'ww-btn ' + (kind === 'article' ? 'primary' : 'ghost') + ' small', onClick: () => setKind('article') }, '图文动态'),
                h('button', { className: 'ww-btn ' + (kind === 'video' ? 'primary' : 'ghost') + ' small', onClick: () => setKind('video') }, '视频草稿'),
              ),
              h('label', null, '标题'),
              h('input', { className: 'ww-inp', maxLength: 200, placeholder: kind === 'article' ? '图文动态标题' : '视频标题', value: title, disabled: busy, onChange: (e) => setTitle(e.target.value) }),
              h('label', null, kind === 'article' ? '正文 / 配图说明' : '脚本 / 正文'),
              h('textarea', { className: 'ww-textarea', placeholder: kind === 'article' ? '写动态正文；图片上传后续接入' : '写清楚想讲什么；分镜/素材字段后续再补', value: script, disabled: busy, onChange: (e) => setScript(e.target.value) }),
              h('div', { style: { display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' } },
                h('button', { className: 'ww-btn primary', disabled: busy || killed, onClick: save }, busy ? '保存中…' : (kind === 'article' ? '保存图文草稿' : '保存视频草稿')),
                killed
                  ? h('span', { style: { fontSize: 10, color: 'var(--ww-danger)' } }, '已停机，无法新建')
                  : h('span', { style: { fontSize: 10, color: 'var(--ww-t4)' } }, '保存后为 v1 · draft · 不发布'),
              ),
            ),
          ),
        ),
      )
    }

    function Interact(props) {
      const real = props.real || {}
      const [bv, setBv] = React.useState('')
      const [comments, setComments] = React.useState(null)
      const [commentContext, setCommentContext] = React.useState(null)
      const [dmContext, setDmContext] = React.useState(null)
      const [contextBusy, setContextBusy] = React.useState(false)
      const [commentBusy, setCommentBusy] = React.useState(false)
      const [commentError, setCommentError] = React.useState('')
      const [policySource, setPolicySource] = React.useState('comment')
      const [policyMid, setPolicyMid] = React.useState('')
      const [policyText, setPolicyText] = React.useState('')
      const [policyResult, setPolicyResult] = React.useState(null)
      const [policyBusy, setPolicyBusy] = React.useState(false)
      async function previewPolicy() {
        setPolicyBusy(true)
        try {
          const data = await rpc('reply.preview', { source: policySource, fromMid: policyMid.trim(), text: policyText })
          setPolicyResult(data.value)
        } catch (error) {
          setPolicyResult({ mode: 'error', reason: error?.message || '分档失败' })
        } finally {
          setPolicyBusy(false)
        }
      }
      async function loadComments() {
        if (!/^BV[0-9A-Za-z]{10}$/.test(bv.trim())) {
          setCommentError('请输入 12 位 BV 号，例如 BV1GJ411x7h7')
          return
        }
        setCommentBusy(true)
        setCommentError('')
        try {
          const data = await rpc('bili.comments', { bvid: bv.trim() })
          setComments(data.value)
        } catch (error) {
          setCommentError(error?.message || '评论读取失败')
        } finally {
          setCommentBusy(false)
        }
      }
      async function loadDmContext(talkerId) {
        setContextBusy(true)
        try { const data = await rpc('bili.dmContext', { talkerId }); setDmContext(data.value) } catch (error) { setCommentError(error?.message || '私信上下文读取失败') } finally { setContextBusy(false) }
      }
      async function loadCommentContext(row) {
        if (!comments?.bvid) return
        setContextBusy(true)
        try { const data = await rpc('bili.commentContext', { bvid: comments.bvid, rpid: row.id }); setCommentContext(data.value) } catch (error) { setCommentError(error?.message || '评论上下文读取失败') } finally { setContextBusy(false) }
      }
      async function saveComment(row) {
        setCommentBusy(true)
        setCommentError('')
        try {
          const source = comments?.bvid ? '来源：https://www.bilibili.com/video/' + comments.bvid : ''
          await props.onCreateContent({
            title: ('评论选题 · ' + row.who).slice(0, 200),
            script: [row.text, '', source, '评论时间：' + (row.at ? new Date(row.at * 1000).toLocaleString('zh-CN') : '—')].join('\n'),
          })
        } catch (error) {
          setCommentError(error?.message || '存为草稿失败')
        } finally {
          setCommentBusy(false)
        }
      }
      return h('div', null,
        h('div', { className: 'ww-kpis', style: { gridTemplateColumns: 'repeat(3,minmax(0,1fr))' } },
          h(Kpi, { k: '私信监听', v: h('span', { style: { fontSize: 16 } }, props.settings?.dmListen ? '开启' : '关闭'), s: h('span', null, h('i', { key: 'dot', className: 'ww-dot' + (props.settings?.dmListen ? '' : ' off') }), props.settings?.autoReply ? '90 秒一轮 · 自动回复' : '自动回复关闭') }),
          h(Kpi, { k: '评论监听', v: h('span', { style: { fontSize: 16, color: 'var(--ww-t3)' } }, props.settings?.commentListen ? '开启' : '关闭'), s: h('span', { style: { color: 'var(--ww-t4)' } }, '按设置') }),
          h(Kpi, { k: '直播间', v: h('span', { style: { fontSize: 16, color: 'var(--ww-t3)' } }, '未配置'), s: h('span', { style: { color: 'var(--ww-t4)' } }, '未配置房间') }),
        ),
        h('div', { className: 'ww-grid2' },
          h(Card, null,
            h('div', { className: 'ww-cardhead' }, h('h2', null, '私信会话'), h('span', { className: 'ww-sub' }, real.authenticated ? '真实数据 · 只读' : '登录后读取'), h('div', { className: 'ww-right' }, chip(real.authenticated ? 'ok' : 'off', real.authenticated ? '真实数据' : '未登录'))),
            !real.authenticated
              ? h('div', { className: 'ww-empty' }, '登录后读取真实私信。')
              : (real.dm || []).length === 0
                ? h('div', { className: 'ww-empty' }, '还没有读取到私信。')
                : h('div', null,
                    real.dm.slice(0, 8).map((row) => h('div', { className: 'ww-row', key: row.talkerId },
                      h('div', { className: 'ww-cover' }, h('span', { className: 'd' }, '私信')),
                      h('div', { className: 'ww-rowbody' }, h('p', null, (row.outgoing ? '我：' : (row.name || '对方') + '：') + (row.text || '（非文本消息）')), h('div', { className: 'ww-meta' }, chip(row.unread > 0 ? 'warn' : '', row.unread + ' 未读'), h('button', { className: 'ww-btn ghost small', disabled: contextBusy, onClick: () => loadDmContext(row.talkerId) }, '上下文'))),
                      h('span', { className: 'ww-time' }, formatTime(row.at)),
                    )),
                    dmContext
                      ? h('div', { style: { marginTop: 10, paddingTop: 8, borderTop: '1px solid var(--ww-b1)' } },
                          h('div', { className: 'ww-cardhead' }, h('h2', null, '私信上下文'), h('span', { className: 'ww-sub' }, dmContext.talkerId), h('div', { className: 'ww-right' }, h('button', { className: 'ww-btn ghost small', onClick: () => setDmContext(null) }, '关闭'))),
                          dmContext.messages.slice(0, 10).reverse().map((message) => h('div', { className: 'ww-sub', key: message.id, style: { margin: '3px 0' } }, (message.sender === dmContext.talkerId ? '对方：' : '我：') + message.text)),
                        )
                      : null,
                  ),
          ),
          real.authenticated
            ? h(Card, null,
                h('div', { className: 'ww-cardhead' }, h('h2', null, '真实回复（只读）'), h('span', { className: 'ww-sub' }, '来自「回复我的」 · 只读'), h('div', { className: 'ww-right' }, chip('ok', '真实数据'))),
                real.replies.length === 0
                  ? h('div', { style: { fontSize: 11, color: 'var(--ww-t4)', padding: '10px 0' } }, '最近没有新的回复。')
                  : real.replies.map((row) => h('div', { className: 'ww-row', key: row.id },
                      h('div', { className: 'ww-cover' },
                        row.cover
                          ? h('img', { src: row.cover, alt: '', referrerPolicy: 'no-referrer', loading: 'lazy' })
                          : h('span', { className: 'd' }, row.kind === 'at' ? '@' : '回复'),
                      ),
                      h('div', { className: 'ww-rowbody' },
                        h('p', null, row.who + '：' + row.text),
                        h('div', { className: 'ww-meta' },
                          chip(row.kind === 'at' ? 'info' : '', row.kind === 'at' ? '@我' : '评论/回复'),
                          row.videoUrl ? h('a', { className: 'ww-videolink', href: row.videoUrl, target: '_blank', rel: 'noopener noreferrer' }, '视频《' + (row.videoTitle || '打开') + '》') : null,
                        ),
                      ),
                      h('span', { className: 'ww-time' }, formatTime(row.at)),
                    )),
                (real.videos || []).length > 0
                  ? h('div', { style: { marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--ww-b1)' } },
                      h('div', { className: 'ww-cardhead' }, h('h2', null, '真实视频（只读）'), h('span', { className: 'ww-sub' }, '最近投稿'), h('div', { className: 'ww-right' }, chip('ok', '真实数据'))),
                      real.videos.map((video) => h('div', { className: 'ww-row', key: video.bvid },
                        h('div', { className: 'ww-cover' }, h('span', { className: 'd' }, '视频')),
                        h('div', { className: 'ww-rowbody' },
                          h('p', null, video.title || video.bvid),
                          h('div', { className: 'ww-meta' },
                            h('a', { className: 'ww-videolink', href: video.url, target: '_blank', rel: 'noopener noreferrer' }, '打开视频'),
                            chip('', String(video.comments) + ' 评论'),
                          ),
                        ),
                        h('span', { className: 'ww-time' }, formatTime(video.created)),
                      )),
                    )
                  : null,
                h('div', { style: { marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--ww-b1)' } },
                  h('div', { className: 'ww-cardhead' }, h('h2', null, '指定视频评论（只读）'), h('span', { className: 'ww-sub' }, '输入 BV 号读取')),
                  h('div', { style: { display: 'flex', gap: 6, marginTop: 8 } },
                    h('input', { className: 'ww-inp', placeholder: 'BV1GJ411x7h7', value: bv, onChange: (e) => setBv(e.target.value) }),
                    h('button', { className: 'ww-btn primary small', disabled: commentBusy, onClick: loadComments }, commentBusy ? '读取中…' : '读评论'),
                  ),
                  commentError ? h('div', { className: 'ww-setup-note', style: { color: 'var(--ww-warn)' } }, commentError) : null,
                  comments
                    ? h('div', null,
                        h('div', { style: { fontSize: 11, color: 'var(--ww-t4)', margin: '8px 0' } }, '《' + (comments.title || comments.bvid) + '》 · ' + comments.comments.length + ' 条'),
                        comments.comments.slice(0, 8).map((row) => h('div', { className: 'ww-row', key: row.id },
                          h('div', { className: 'ww-cover' }, h('span', { className: 'd' }, '评论')),
                          h('div', { className: 'ww-rowbody' }, h('p', null, row.who + '：' + row.text), h('div', { className: 'ww-meta' },
                            chip('', row.likes + ' 赞'),
                            h('button', { className: 'ww-btn ghost small', disabled: commentBusy || contextBusy, onClick: () => saveComment(row) }, '存为草稿'),
                            h('button', { className: 'ww-btn ghost small', disabled: commentBusy || contextBusy, onClick: () => loadCommentContext(row) }, '上下文'),
                          )),
                        )),
                        commentContext
                          ? h('div', { style: { marginTop: 10, paddingTop: 8, borderTop: '1px solid var(--ww-b1)' } },
                              h('div', { className: 'ww-cardhead' }, h('h2', null, '评论上下文'), h('span', { className: 'ww-sub' }, commentContext.bvid), h('div', { className: 'ww-right' }, h('button', { className: 'ww-btn ghost small', onClick: () => setCommentContext(null) }, '关闭'))),
                              commentContext.parent ? h('div', { className: 'ww-sub', style: { margin: '3px 0' } }, '主评论 · ' + (commentContext.parent.who || '') + '：' + (commentContext.parent.text || '')) : null,
                              commentContext.replies.map((reply) => h('div', { className: 'ww-sub', key: reply.id, style: { margin: '3px 0 3px 12px' } }, reply.who + '：' + reply.text)),
                            )
                          : null,
                      )
                    : null,
                ),
                real.error ? h('div', { className: 'ww-setup-note', style: { color: 'var(--ww-warn)' } }, real.error) : null,
              )
            : h(Card, null,
                h('div', { className: 'ww-cardhead' }, h('h2', null, '真实回复'), h('span', { className: 'ww-sub' }, '登录后读取')),
                h('div', { className: 'ww-empty' }, '登录后读取真实回复与评论。'),
              ),
        ),
        h(Card, { tight: true },
          h('div', { className: 'ww-cardhead' }, h('h2', null, '三档回复 · 本地分档'), h('span', { className: 'ww-sub' }, '非主人 @ 忽略'), h('div', { className: 'ww-right' }, chip('info', '不发送'))),
          h('div', { style: { display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 } },
            h('select', { className: 'ww-sel', value: policySource, onChange: (e) => setPolicySource(e.target.value) },
              h('option', { value: 'comment' }, '评论'), h('option', { value: 'dm' }, '私信'), h('option', { value: 'at' }, '@')),
            h('input', { className: 'ww-inp w110', placeholder: '来人 UID', value: policyMid, onChange: (e) => setPolicyMid(e.target.value) }),
            h('input', { className: 'ww-inp', placeholder: '互动内容', value: policyText, onChange: (e) => setPolicyText(e.target.value) }),
            h('button', { className: 'ww-btn primary small', disabled: policyBusy, onClick: previewPolicy }, policyBusy ? '判断中…' : '试分档'),
          ),
          policyResult
            ? h('div', { className: 'ww-setup-note' },
                chip(policyResult.mode === 'direct' ? 'ok' : policyResult.mode === 'ignore' ? 'off' : policyResult.mode === 'confirm' ? 'danger' : 'warn', policyResult.mode),
                ' ' + policyResult.reason,
                policyResult.mode !== 'ignore'
                  ? h('button', { className: 'ww-btn ghost small', style: { marginLeft: 8 }, onClick: async () => { const result = await props.onQueue({ source: policySource, fromMid: policyMid, text: policyText }); if (result?.result) setPolicyResult(result.result) } }, '入队')
                  : null,
              )
            : h('div', { className: 'ww-setup-note' }, '规则：主人低风险→直接；非主人低风险评论/私信→审查；未知/敏感/链接→主人确认；非主人 @→忽略。'),
          (props.replyQueue || []).length > 0
            ? h('div', { style: { marginTop: 8 } }, (props.replyQueue || []).slice(0, 8).map((item) => h('div', { className: 'ww-row', key: item.id },
                h('div', { className: 'ww-cover' }, h('span', { className: 'd' }, item.source === 'dm' ? '私信' : item.source === 'at' ? '@' : '评论')),
                h('div', { className: 'ww-rowbody' }, h('p', null, (item.fromMid || '未知') + '：' + item.text), h('div', { className: 'ww-meta' }, chip(item.mode === 'direct' ? 'ok' : item.mode === 'confirm' ? 'danger' : 'warn', item.mode), chip(item.status === 'pending' ? 'warn' : item.status === 'ready' ? 'info' : 'off', item.status))),
                item.status === 'pending'
                  ? h('div', { style: { display: 'flex', gap: 4 } },
                      h('button', { className: 'ww-btn primary small', onClick: () => props.onDecide(item.id, 'approve') }, '通过'),
                      h('button', { className: 'ww-btn ghost small', onClick: () => props.onDecide(item.id, 'reject') }, '驳回'),
                    )
                  : h('span', { className: 'note' }, '未发送'),
              )))
            : null,
        ),
      )
    }

    function Diary(props) {
      if (props.data.diaries.length === 0) return h('div', { className: 'ww-empty' }, '还没有日记。')
      return h('div', { className: 'ww-grid2' }, props.data.diaries.map((d) => h(Card, { key: d.title },
        h('div', { className: 'ww-cardhead' }, h('h2', null, d.title), h('span', { className: 'ww-sub' }, d.time), h('div', { className: 'ww-right' }, chip(d.state === '已推送' ? 'ok' : '', d.state))),
        h('div', { style: { fontSize: 12, lineHeight: 1.85, color: 'var(--ww-t2)', whiteSpace: 'pre-wrap' } }, d.body),
      )))
    }

    function Health(props) {
      const [challenge, setChallenge] = React.useState(null)
      const [deps, setDeps] = React.useState(null)
      const killed = props.killed === true
      React.useEffect(() => {
        rpc('deps.check').then((data) => setDeps(data.value)).catch(() => {})
      }, [])
      async function installDep() {
        try {
          const data = await rpc('deps.install', { name: 'qrcode' })
          props.toast(data.value?.message || '安装完成')
          setDeps((await rpc('deps.check')).value)
        } catch (error) {
          props.toast(error?.message || '依赖安装失败')
        }
      }
      const ffmpeg = (props.data.health || []).find((row) => row[0] === 'ffmpeg')
      const ffmpegMissing = ffmpeg !== undefined && ffmpeg[2] === 'warn'
      React.useEffect(() => { if (!killed) setChallenge(null) }, [killed])
      async function revive() {
        if (challenge === null || challenge === undefined) {
          try {
            const next = await props.onReviveRequest()
            if (next) {
              setChallenge(next)
              props.toast('再点一次确认恢复写入（60 秒内有效）')
            }
          } catch (error) {
            props.toast('恢复请求失败：' + (error?.message || '未知错误'))
          }
          return
        }
        const ticket = challenge
        setChallenge(null)
        props.onRevive(ticket)
      }
      return h('div', { className: 'ww-grid2' },
        h(Card, null,
          h('div', { className: 'ww-cardhead' }, h('h2', null, '依赖检查'), h('span', { className: 'ww-sub' }, '新安装先查'), h('div', { className: 'ww-right' }, h('button', { className: 'ww-btn ghost small', onClick: async () => { try { setDeps((await rpc('deps.check')).value) } catch {} } }, '重新检查'))),
          (deps?.rows || []).map((row) => h(CheckRow, { key: row.name, n: row.name, v: row.detail, tone: row.ready ? 'ok' : 'warn', tag: row.ready ? '就绪' : '缺失' })),
          (props.computerActions || []).filter((item) => item.status === 'pending').slice(0, 4).map((item) => h('div', { className: 'ww-check', key: item.id },
            h('span', { className: 'n' }, 'Computer Use · ' + (item.label || item.action)),
            h('span', { className: 'ww-right' },
              h('button', { className: 'ww-btn primary small', onClick: () => props.onDecideComputerAction(item, true) }, '确认'),
              h('button', { className: 'ww-btn ghost small', onClick: () => props.onDecideComputerAction(item, false) }, '拒绝'),
            ),
          )),
          deps?.rows?.some((row) => !row.ready && row.name === 'qrcode') && !killed
            ? h('div', { className: 'ww-actions', style: { marginTop: 8 } },
                h('button', { className: 'ww-btn primary small', onClick: installDep }, '安装 qrcode'),
                h('span', { className: 'note' }, 'ffmpeg 仅检测，不自动下载'),
              )
            : null,
        ),
        h(Card, null,
          h('div', { className: 'ww-cardhead' }, h('h2', null, '依赖与登录'), h('span', { className: 'ww-sub' }, '实时'), h('div', { className: 'ww-right' }, h('button', { className: 'ww-btn ghost small', onClick: props.onRun }, '跑一次体检'))),
          props.data.health.map((row) => h(CheckRow, { key: row[0], n: row[0], v: row[1], tone: row[2], tag: row[3] })),
        ),
        h('div', { className: 'ww-stack' },
          h(Card, null,
            h('div', { className: 'ww-cardhead' }, h('h2', null, '风控 · kill switch'), h('div', { className: 'ww-right' }, chip(killed ? 'danger' : 'ok', killed ? '已停机' : '运行中'))),
            h(CheckRow, { n: '写操作', v: killed ? '已拒绝（宿主强制）' : '允许 · 仍需人工审批', tone: killed ? 'danger' : 'ok', tag: killed ? 'KILLED' : '可写' }),
            h(CheckRow, { n: '真实发布', v: '永久关闭', tone: 'info', tag: '只读' }),
            h(CheckRow, { n: '恢复方式', v: '二次确认', tone: '', tag: '人工' }),
            h('div', { className: 'ww-pactions', style: { marginTop: 10 } },
              killed
                ? h('button', { className: 'ww-btn danger small', onClick: revive }, challenge ? '再点一次确认恢复' : '恢复写入')
                : h('button', { className: 'ww-btn danger small', onClick: props.onKill }, '立即停机'),
              h('span', { className: 'note' }, killed ? '恢复后仍只读，不会发布' : '停机后所有写 RPC 返回 killed'),
            ),
            h('div', { className: 'ww-setup-note' }, 'kill switch 是最高优先级：内容新建/修改/提交/通过/驳回、设置保存、回复审批都会被宿主拒绝；恢复需要连续两次点击。'),
          ),
          ffmpegMissing
            ? h(Card, null,
                h('div', { className: 'ww-cardhead' }, h('h2', null, '提醒')),
                h('div', { className: 'ww-pitem', style: { borderColor: 'color-mix(in srgb,var(--ww-warn) 30%,transparent)', background: 'color-mix(in srgb,var(--ww-warn) 8%,transparent)' } },
                  h('div', { className: 'ww-phead' }, h('span', { className: 'who', style: { color: 'var(--ww-warn)' } }, 'ffmpeg 未找到'), h('span', { className: 'src' }, '影响：抽帧看画面')),
                  h('div', { className: 'ww-pquote', style: { color: 'var(--ww-t2)' } }, '没有 ffmpeg 时她仍能读字幕/弹幕/热评，但看不了画面。安装后重启宿主即可。'),
                  h('button', { className: 'ww-btn ghost small', onClick: () => props.toast('安装说明后续接入') }, '查看安装说明'),
                ),
              )
            : null,
          h(Card, { tight: true },
            h('div', { className: 'ww-cardhead' }, h('h2', null, '写预算'), h('div', { className: 'ww-right' }, chip('', '只读'))),
            h(CheckRow, { n: '写 / 时', v: '0 / 12', tag: '未消耗' }),
            h(CheckRow, { n: '写 / 天', v: '0 / 30', tag: '未消耗' }),
            h(CheckRow, { n: '请求间隔', v: '1500 ms', tag: '固定', tone: '' }),
            h(CheckRow, { n: '撞 412/429', v: '暂停 5/10/20/30 分钟', tag: '规则', tone: '' }),
          ),
        ),
      )
    }

    function Logs(props) {
      return h(Card, { tight: true },
        h('div', { className: 'ww-cardhead' }, h('h2', null, '事件流'), h('span', { className: 'ww-sub' }, 'append-only'), h('div', { className: 'ww-right' }, h('button', { className: 'ww-btn ghost small', onClick: props.onExport }, '导出'))),
        h('table', { className: 'ww-table' },
          h('thead', null, h('tr', null, h('th', null, '时间'), h('th', null, '事件'), h('th', null, '对象'), h('th', null, '结果'))),
          h('tbody', null, props.logs.map((row, i) => h('tr', { key: String(i) },
            h('td', { className: 'ww-num' }, row[0]),
            h('td', null, h('b', null, row[1])),
            h('td', null, row[2]),
            h('td', null, row[3]),
          ))),
        ),
      )
    }

    function Studio(props) {
      const type = props.type
      const isLive = type === 'live'
      const isVideo = type === 'video'
      const [title, setTitle] = React.useState('')
      const [subtitle, setSubtitle] = React.useState('')
      const [body, setBody] = React.useState('')
      const [theme, setTheme] = React.useState('deep-sea')
      const [review, setReview] = React.useState(null)
      const [busy, setBusy] = React.useState(false)
      const [cover, setCover] = React.useState('')
      const [assets, setAssets] = React.useState([])
      const [videoStages, setVideoStages] = React.useState({ script: false, storyboard: false, voice: false, visual: false, subtitle: false, cover: false, preview: false })
      const assetInput = React.useRef(null)

      async function refreshAssets() {
        try { const data = await rpc('assets.list', { kind: type }); setAssets(Array.isArray(data?.value) ? data.value : []) } catch {}
      }
      React.useEffect(() => { refreshAssets() }, [type])
      function uploadAsset(file) {
        if (!file) return
        if (!/^image\//.test(file.type)) { props.toast('素材库目前接收图片'); return }
        const reader = new FileReader()
        reader.onload = async () => {
          try {
            await rpc('assets.save', { kind: type, name: file.name, dataUrl: reader.result })
            props.toast('已加入' + (type === 'article' ? '图文' : type === 'live' ? '直播' : '视频') + '素材库')
            refreshAssets()
          } catch (error) { props.toast(rpcMessage(error, '素材保存失败')) }
        }
        reader.readAsDataURL(file)
      }
      async function saveTextAsset() {
        if (!body.trim()) { props.toast('正文为空'); return }
        try {
          await rpc('assets.save', { kind: type, name: (title || '正文') + '.txt', text: body })
          props.toast('正文已存入素材库')
          refreshAssets()
        } catch (error) { props.toast(rpcMessage(error, '素材保存失败')) }
      }
      async function removeAsset(id) {
        try { await rpc('assets.delete', { kind: type, id }); refreshAssets(); props.toast('素材已删除') } catch (error) { props.toast(rpcMessage(error, '删除失败')) }
      }

      function buildSvg() {
        const colors = theme === 'paper' ? ['#f4efe6', '#1d1a17'] : theme === 'pink' ? ['#f7d9e3', '#4a1f33'] : ['#071c2c', '#d8f4ff']
        const esc = (value) => String(value || '').replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]))
        const t = esc(title || '图片标题')
        const s = esc(subtitle || '一句话副标题')
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="${colors[0]}"/><circle cx="1020" cy="120" r="220" fill="${colors[1]}" opacity=".16"/><circle cx="150" cy="560" r="180" fill="${colors[1]}" opacity=".10"/><text x="80" y="300" font-family="sans-serif" font-size="76" font-weight="700" fill="${colors[1]}">${t}</text><text x="84" y="370" font-family="sans-serif" font-size="30" fill="${colors[1]}" opacity=".8">${s}</text><text x="84" y="560" font-family="sans-serif" font-size="20" fill="${colors[1]}" opacity=".55">dsh-webwhale-bili · ${isVideo ? 'video-cover' : 'image-only'}</text></svg>`
        setCover('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg))
      }

      function autoReview() {
        const issues = []
        if (!title.trim()) issues.push({ level: 'danger', text: '标题为空' })
        if (!isLive && !body.trim()) issues.push({ level: 'warn', text: '正文为空' })
        if (body.length > 2000) issues.push({ level: 'warn', text: '正文超过 2000 字' })
        if (/1[3-9]\d{9}|身份证|住址|学校|公司地址/.test(body + title)) issues.push({ level: 'danger', text: '疑似个人信息' })
        if (/https?:\/\/|www\.|b23\.tv/.test(body)) issues.push({ level: 'danger', text: '含外链，需人工确认' })
        if (/(转账|刷单|返利|赌博|裸聊|约炮|加微信|加v|vx)/i.test(body)) issues.push({ level: 'danger', text: '含高风险词' })
        if (/@\S+/.test(body)) issues.push({ level: 'warn', text: '公开内容含 @，检查是否 @ 主人' })
        const danger = issues.some((item) => item.level === 'danger')
        setReview({ ok: !danger, issues, at: new Date().toLocaleTimeString() })
      }

      async function saveDraft() {
        if (isLive) { props.toast('直播暂存待接入；先在创作版块查看'); return }
        if (!title.trim()) { props.toast('标题必填'); return }
        setBusy(true)
        try {
          const note = cover ? '\n\n[封面设计]\n主题：' + theme + '\n标题：' + title + '\n副标题：' + subtitle : ''
          const stages = isVideo ? '\n\n[视频框架]\n' + Object.entries(videoStages).filter(([, done]) => done).map(([key]) => key).join(' / ') : ''
          const saved = await props.onCreate({ title: title.trim(), script: (body + note + stages).trim(), kind: isVideo ? 'video' : 'article' })
          if (saved) { setTitle(''); setSubtitle(''); setBody(''); setCover(''); setReview(null); props.toast('已保存到内容库 · 去创作版块审查') }
        } finally { setBusy(false) }
      }

      return h('div', { className: 'ww-grid2' },
        h(Card, null,
          h('div', { className: 'ww-cardhead' }, h('h2', null, isLive ? '直播输入' : isVideo ? '视频脚本框架' : '图文输入'), h('span', { className: 'ww-sub' }, '只负责输入 + 自动审查；用户审查在创作版块')),
          isVideo ? h('div', { className: 'ww-setup-note' }, '视频框架：脚本/分镜/素材/字幕/封面/预览；不接上传、渲染和自动发布。') : null,
          h('div', { className: 'ww-form' },
            h('label', null, '标题'), h('input', { className: 'ww-inp', value: title, onChange: (e) => setTitle(e.target.value), maxLength: 120 }),
            h('label', null, '副标题 / 直播简介'), h('input', { className: 'ww-inp', value: subtitle, onChange: (e) => setSubtitle(e.target.value), maxLength: 200 }),
            h('label', null, isLive ? '直播提纲' : isVideo ? '脚本 / 分镜说明' : '正文 / 说明'), h('textarea', { className: 'ww-textarea', value: body, onChange: (e) => setBody(e.target.value), maxLength: 20000 }),
            isVideo
              ? h('div', { style: { marginTop: 8 } }, ['script', 'storyboard', 'voice', 'visual', 'subtitle', 'cover', 'preview'].map((key) => h('label', { key, style: { display: 'inline-flex', gap: 4, marginRight: 10, fontSize: 11 } },
                  h('input', { type: 'checkbox', checked: videoStages[key], onChange: (e) => setVideoStages((prev) => ({ ...prev, [key]: e.target.checked })) }),
                  { script: '脚本', storyboard: '分镜', voice: '配音', visual: '素材', subtitle: '字幕', cover: '封面', preview: '人工预览' }[key],
                )))
              : null,
            h('div', { style: { display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 } },
              h('button', { className: 'ww-btn ghost small', onClick: buildSvg }, isVideo ? '生成视频封面' : '生成图片封面'),
              h('button', { className: 'ww-btn ghost small', onClick: autoReview }, '自动审查'),
              h('button', { className: 'ww-btn ghost small', onClick: saveTextAsset }, '正文存入素材库'),
              h('button', { className: 'ww-btn primary small', disabled: busy || props.killed, onClick: saveDraft }, busy ? '保存中…' : '保存到内容库'),
            ),
          ),
        ),
        h('div', { className: 'ww-stack' },
          h(Card, null,
            h('div', { className: 'ww-cardhead' }, h('h2', null, isVideo ? '视频封面' : '图片设计'), h('span', { className: 'ww-sub' }, isVideo ? '16:9 · 1200×630' : '仅图片 · 1200×630')),
            h('SettingRow', { label: '主题' }, h('select', { className: 'ww-sel', value: theme, onChange: (e) => setTheme(e.target.value) }, h('option', { value: 'deep-sea' }, '深海'), h('option', { value: 'paper' }, '纸张'), h('option', { value: 'pink' }, '粉白'))),
            cover ? h('img', { src: cover, alt: '封面预览', style: { width: '100%', borderRadius: 8, display: 'block' } }) : h('div', { className: 'ww-empty' }, '输入标题后生成封面'),
            cover ? h('div', { style: { marginTop: 8 } }, h('a', { className: 'ww-btn ghost small', href: cover, download: 'cover.svg' }, '下载 SVG')) : null,
          ),
          h(Card, null,
            h('div', { className: 'ww-cardhead' }, h('h2', null, '素材库'), h('span', { className: 'ww-sub' }, type === 'article' ? '图文' : type === 'live' ? '直播' : '视频'), h('div', { className: 'ww-right' },
              h('input', { ref: assetInput, type: 'file', accept: 'image/*', style: { display: 'none' }, onChange: (e) => { uploadAsset(e.target.files?.[0]); e.target.value = '' } }),
              h('button', { className: 'ww-btn ghost small', disabled: props.killed, onClick: () => assetInput.current?.click() }, '上传图片'),
            )),
            assets.length === 0
              ? h('div', { className: 'ww-empty' }, '还没有素材；图文/直播/视频各自独立目录。')
              : h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(110px,1fr))', gap: 8 } },
                  assets.slice(0, 12).map((asset) => h('div', { key: asset.id, style: { border: '1px solid var(--ww-b1)', borderRadius: 6, padding: 6, minWidth: 0 } },
                    asset.type === 'image' && asset.dataUrl ? h('img', { src: asset.dataUrl, alt: asset.name, style: { width: '100%', height: 72, objectFit: 'cover', borderRadius: 4, display: 'block' } }) : h('div', { className: 'ww-sub' }, '文本素材'),
                    h('div', { className: 'ww-sub', style: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 4 } }, asset.name),
                    h('button', { className: 'ww-btn ghost small', onClick: () => removeAsset(asset.id) }, '删除'),
                  )),
                ),
          ),
          h(Card, null,
            h('div', { className: 'ww-cardhead' }, h('h2', null, '自动审查'), h('span', { className: 'ww-sub' }, '只提示，不发布')),
            review
              ? h('div', null,
                  h('div', { style: { marginBottom: 6 } }, chip(review.ok ? 'ok' : 'danger', review.ok ? '未发现阻断项' : '存在阻断项'), h('span', { className: 'ww-sub', style: { marginLeft: 6 } }, review.at)),
                  review.issues.length === 0 ? h('div', { className: 'ww-sub' }, '无问题') : review.issues.map((item, i) => h('div', { key: i, className: 'ww-sub', style: { color: item.level === 'danger' ? 'var(--ww-danger)' : 'var(--ww-warn)' } }, '· ' + item.text)),
                )
              : h('div', { className: 'ww-empty' }, '点“自动审查”检查隐私/外链/风险词/长度'),
          ),
        ),
      )
    }

    function Home(props) {
      const { data, account, killed, contents, pending, real, owners, replyQueue } = props
      const healthWarn = (data.health || []).filter((row) => row[2] === 'warn' || row[2] === 'danger').length
      const activeOwners = (owners?.members || []).filter((member) => member.enabled !== false && member.source === (owners?.activeSource || 'manual'))
      const queuePending = (replyQueue || []).filter((item) => item.status === 'pending').length
      const approvalPending = (contents || []).filter((item) => item.state === 'approval_pending').length
      const followPending = (props.followRequests || []).filter((item) => item.status === 'pending').length
      const todos = [
        props.settings?.autoReply && props.settings?.automationArmed !== true ? { key: 'arm', text: '自动化暂停：等待主人启动', tone: 'warn', open: 'settings' } : null,
        queuePending ? { key: 'reply', text: '待审回复 ' + queuePending + ' 条', tone: 'warn', open: 'fish' } : null,
        pending.length ? { key: 'pending', text: '待审互动 ' + pending.length + ' 条', tone: 'warn', open: 'fish' } : null,
        approvalPending ? { key: 'approval', text: '内容待审批 ' + approvalPending + ' 条', tone: 'warn', open: 'create' } : null,
        followPending ? { key: 'follow', text: '关注待确认 ' + followPending + ' 条', tone: 'warn', open: 'fish' } : null,
        props.cooldown?.remaining > 0 ? { key: 'cooldown', text: 'B站冷却 ' + props.cooldown.remaining + ' 秒', tone: 'danger', open: 'fish' } : null,
        healthWarn ? { key: 'health', text: '体检异常 ' + healthWarn + ' 项', tone: 'danger', open: 'fish' } : null,
      ].filter(Boolean)
      const dmUnread = (real.dm || []).reduce((sum, row) => sum + Number(row.unread || 0), 0)
      const latest = (real.dm || [])[0] || (real.replies || [])[0]
      const metrics = [
        ['账号', account.authenticated ? account.name : '未登录', account.authenticated ? 'ok' : 'warn'],
        ['停机', killed ? '已停机' : '运行中', killed ? 'danger' : 'ok'],
        ['今日写额度', data.kpis.shareUsed + ' / ' + data.kpis.shareLimit, 'ok'],
        ['待审 / 未读', (pending.length + queuePending) + ' / ' + ((real.replies || []).length + dmUnread), (pending.length + queuePending) ? 'warn' : 'ok'],
        ['内容库', contents.length + ' 条', contents.length ? 'ok' : ''],
        ['下次唤醒', data.kpis.nextWake, 'ok'],
        ['体检异常', healthWarn + ' 项', healthWarn ? 'warn' : 'ok'],
        ['最近互动', latest ? ((latest.name || latest.who || '有人') + (latest.text ? '：' + latest.text : '')) : '暂无', ''],
        ['经营数据', '未接入', ''],
        ['风控 / 流量', killed ? '已停机' : '1500ms · 正常', killed ? 'danger' : 'ok'],
        ['主人授权', activeOwners.length ? activeOwners.length + ' 人 · ' + (owners.activeSource === 'mutual' ? '互关' : '手动') : '待配置', activeOwners.length ? 'ok' : 'warn'],
        ['最近审计', data.logs?.[0]?.[1] || '暂无', ''],
      ]
      const cards = [
        { title: '养鱼', desc: '控制台 · 互动 · 日记 · 体检', open: 'fish' },
        { title: '创作', desc: '用户审查 · 内容库 · 审批', open: 'create' },
        { title: '设置', desc: '人格 · 主人授权 · 策略', open: 'settings' },
        { title: '图文', desc: '图片设计 · 正文 · 自动审查', open: 'article' },
        { title: '视频', desc: '暂缓 · 仅保留版块', open: 'video' },
        { title: '直播', desc: '预告 · 提纲 · 自动审查', open: 'live' },
      ]
      return h('div', null,
        h('div', { className: 'ww-cardhead', style: { marginTop: 4 } }, h('h2', null, '总控制台'), h('span', { className: 'ww-sub' }, '启动后先看这些'), h('div', { className: 'ww-right' }, chip(killed ? 'danger' : 'ok', killed ? '已停机' : '可运行'))),
        h('div', { className: 'ww-metrics' }, metrics.map((row, index) => h('div', { className: 'ww-metric' + (index < 4 ? ' pri' : '') + (row[2] ? ' tone-' + row[2] : ''), key: row[0] }, h('div', { className: 'k' }, row[0]), h('div', { className: 'v' }, row[1])))),
        h('div', { className: 'ww-cardhead', style: { marginTop: 4 } }, h('h2', null, 'B站代办'), h('span', { className: 'ww-sub' }, todos.length ? todos.length + ' 项待处理' : '暂无待办'), h('div', { className: 'ww-right' }, chip(todos.length ? 'warn' : 'ok', todos.length ? '待处理' : '清空'))),
        todos.length === 0
          ? h('div', { className: 'ww-empty' }, '自动化、互动、内容审批目前都没有待办。')
          : h('div', { style: { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 } }, todos.map((todo) => h('button', { key: todo.key, className: 'ww-btn ghost small', onClick: () => props.onOpen(todo.open) }, chip(todo.tone, todo.text)))),
        h('div', { className: 'ww-cardhead', style: { marginTop: 4 } }, h('h2', null, '工作区'), h('span', { className: 'ww-sub' }, '点开版块进入，返回键回主页')),
        h('div', { className: 'ww-homegrid' },
          cards.map((card) => h('div', { className: 'ww-homecard', key: card.title, onClick: () => props.onOpen(card.open), role: 'button', tabIndex: 0, onKeyDown: (e) => { if (e.key === 'Enter') props.onOpen(card.open) } },
            h('div', null, h('h2', null, card.title), h('p', null, card.desc)),
            h('div', { style: { marginTop: 10 } }, chip(card.open === 'video' ? '' : 'ok', card.open === 'video' ? '暂缓' : '可用')),
          )),
        ),
      )
    }

    async function rpc(method, params) {
      const response = await fetch('/dsh-webwhale/api/rpc', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ method, params: params ?? {} }),
      })
      const data = await response.json().catch(() => null)
      if (!response.ok || !data || data.ok !== true) {
        const error = new Error(data?.error?.message || '宿主 RPC 失败')
        error.code = data?.error?.code
        throw error
      }
      return data
    }

    function App(props) {
      const t = props.t
      const [tab, setTab] = React.useState('overview')
      const [section, setSection] = React.useState(null)
      const [settings, setSettings] = React.useState(loadSettings)
      const [pending, setPending] = React.useState([])
      const [logs, setLogs] = React.useState([])
      const [account, setAccount] = React.useState(EMPTY.account)
      const [health, setHealth] = React.useState([])
      const [bootstrapped, setBootstrapped] = React.useState(false)
      const [contents, setContents] = React.useState([])
      const [approvals, setApprovals] = React.useState([])
      const [owners, setOwners] = React.useState({ activeSource: 'manual', members: [] })
      const [replyQueue, setReplyQueue] = React.useState([])
      const [accounts, setAccounts] = React.useState({ activeId: 'default', max: 5, accounts: [] })
      const [accountStale, setAccountStale] = React.useState(false)
      const [cooldown, setCooldown] = React.useState({ remaining: 0 })
      const [followRequests, setFollowRequests] = React.useState([])
      const [accountQr, setAccountQr] = React.useState(null)
      const [computerActions, setComputerActions] = React.useState([])
      const [personaList, setPersonaList] = React.useState(() => Object.entries(PERSONAS).map(([key, value]) => ({ key, ...value })))
      const [mutual, setMutual] = React.useState(() => loadMutualCache())
      const [killed, setKilled] = React.useState(false)
      const [toast, setToast] = React.useState('')
      const [modal, setModal] = React.useState(null)
      const [server, setServer] = React.useState(null)
      const [real, setReal] = React.useState({ authenticated: false, replies: [], error: '' })
      const [showSetup, setShowSetup] = React.useState(() => {
        try { return localStorage.getItem('dsh-webwhale-bili.onboarding.v1') !== '1' } catch { return true }
      })
      const timer = React.useRef(null)
      const anomalyShown = React.useRef(false)

      function notify(message) {
        setToast(message)
        if (timer.current !== null) clearTimeout(timer.current)
        timer.current = setTimeout(() => setToast(''), 2200)
      }
      React.useEffect(() => () => { if (timer.current !== null) clearTimeout(timer.current) }, [])

      function applyState(data) {
        const value = data?.value ?? data
        if (!value || typeof value !== 'object') return
        if (value.settings && typeof value.settings === 'object') {
          setSettings((prev) => ({ ...prev, ...value.settings }))
        }
        if (Array.isArray(value.pending)) setPending(value.pending)
        if (Array.isArray(value.logs)) setLogs(value.logs)
        if (Array.isArray(value.health)) setHealth(value.health)
        if (Array.isArray(value.contents)) setContents(value.contents)
        if (Array.isArray(value.approvals)) setApprovals(value.approvals)
        if (value.owners && typeof value.owners === 'object') setOwners(value.owners)
        if (Array.isArray(value.replyQueue)) setReplyQueue(value.replyQueue)
        if (typeof value.killed === 'boolean') setKilled(value.killed)
        if (value.account) setAccount(value.account)
        setServer((prev) => ({ ...(prev || {}), version: value.version || prev?.version || '0.1.0', demo: value.demo !== false }))
      }

      function loadBootstrap() {
        safe('bootstrap fetch', () => {
          fetch('/dsh-webwhale/api/bootstrap', { credentials: 'same-origin' })
            .then((res) => res.ok ? res.json() : null)
            .then((data) => {
              if (!data || !data.ok) return
              applyState(data)
              setBootstrapped(true)
              // The first skeleton host answered bootstrap without a value; the
              // RPC surface is the source of truth, so hydrate from it as well.
              if (!data.value) rpc('state.get').then(applyState).catch(() => {})
            })
            .catch(() => {})
        })
      }
      function loadBili(force = false) {
        safe('bili snapshot', () => {
          rpc('bili.snapshot', { force }).then((data) => {
            const value = data.value
            if (!value) return
            setReal(value)
            if (value.account) setAccount((prev) => value.account.authenticated || !prev.authenticated ? value.account : { ...prev, stale: true })
          }).catch((error) => {
            setReal({ authenticated: false, replies: [], error: error?.message || '只读同步失败' })
          })
        })
      }

      React.useEffect(() => { loadBootstrap(); loadBili() }, [])
      React.useEffect(() => {
        let alive = true
        async function check() {
          try {
            const data = await rpc('bili.cooldown')
            if (!alive) return
            setCooldown({ remaining: Number(data?.value?.remaining ?? 0) })
          } catch {}
        }
        check()
        const interval = setInterval(check, 2000)
        return () => { alive = false; clearInterval(interval) }
      }, [])
      React.useEffect(() => {
        rpc('accounts.list').then((data) => { if (data?.value) setAccounts(data.value) }).catch(() => {})
        rpc('accounts.status').then((data) => { if (data?.value) setAccountStale(data.value.stale === true) }).catch(() => {})
        rpc('follow.list').then((data) => { if (Array.isArray(data?.value)) setFollowRequests(data.value) }).catch(() => {})
        rpc('computer.list').then((data) => { if (Array.isArray(data?.value)) setComputerActions(data.value) }).catch(() => {})
        rpc('personas.list').then((data) => { if (Array.isArray(data?.value) && data.value.length) setPersonaList(data.value) }).catch(() => {})
      }, [])
      const lastNotice = React.useRef(null)
      React.useEffect(() => {
        const latest = (real.dm || []).find((row) => row.unread > 0) || (real.replies || [])[0]
        if (!latest) return
        const id = String(latest.talkerId || latest.id || latest.at || '')
        if (id === '') return
        if (lastNotice.current === null) { lastNotice.current = id; return }
        if (id === lastNotice.current) return
        lastNotice.current = id
        setModal({
          title: '有新消息',
          body: (latest.name || latest.who || '有人') + '：' + String(latest.text || '').slice(0, 160),
          confirm: '去互动',
          onConfirm: () => { setModal(null); openSection('fish'); setTab('interact') },
        })
      }, [real])

      function set(key, value) {
        setSettings((prev) => ({ ...prev, [key]: value }))
      }

      async function persist(snapshot) {
        try {
          const data = await rpc('settings.set', snapshot)
          applyState(data)
          notify('设置已写入宿主 SQLite')
          return true
        } catch (error) {
          if (error?.code === 'bad-request') {
            notify('保存被宿主拒绝：' + (error.message || '非法值'))
            loadBootstrap()
            return false
          }
          if (error?.code === 'killed') {
            notify('已停机：设置未保存；请先恢复写入')
            loadBootstrap()
            return false
          }
          try {
            if (typeof localStorage !== 'undefined') localStorage.setItem(LOAD_KEY, JSON.stringify(snapshot))
          } catch {}
          addLog('保存设置', '养鱼 · 本地配置', '宿主不可用 · 已存本地')
          notify('宿主不可用，已暂存本地：' + (error?.message || 'RPC 失败'))
          return true
        }
      }

      async function save() {
        await persist(settings)
      }

      async function finishSetup(quick) {
        const next = { ...settings, ...quick }
        setSettings(next)
        const saved = await persist(next)
        if (!saved) return
        try { localStorage.setItem('dsh-webwhale-bili.onboarding.v1', '1') } catch {}
        setShowSetup(false)
        notify('配置已保存，进入工作台')
        loadBili(true)
      }

      function skipSetup() {
        try { localStorage.setItem('dsh-webwhale-bili.onboarding.v1', '1') } catch {}
        setShowSetup(false)
      }

      function exportLogs() {
        try {
          const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = 'dsh-webwhale-logs.json'
          a.click()
          setTimeout(() => URL.revokeObjectURL(url), 1000)
          notify('日志已导出')
        } catch {
          notify('导出失败')
        }
      }

      function addLog(action, object, result) {
        const now = new Date()
        const time = [now.getHours(), now.getMinutes(), now.getSeconds()].map((n) => String(n).padStart(2, '0')).join(':')
        setLogs((prev) => [[time, action, object, result], ...prev].slice(0, 50))
      }

      async function approve(item) {
        try {
          const data = await rpc('pending.approve', { id: item.id })
          applyState(data)
          notify('已通过并写入宿主审计；首版不会发送')
        } catch (error) {
          if (error?.code === 'killed') {
            notify('已停机：回复审批被拒绝；请先恢复写入')
            loadBootstrap()
            return
          }
          setPending((prev) => prev.filter((p) => p.id !== item.id))
          addLog('审批通过', item.who + ' · ' + item.quote, '宿主不可用 · 仅本地记录')
          notify('宿主不可用，仅本地记录')
        }
      }

      async function reject(item) {
        try {
          const data = await rpc('pending.reject', { id: item.id })
          applyState(data)
          notify('已驳回并写入宿主审计；未发送')
        } catch (error) {
          if (error?.code === 'killed') {
            notify('已停机：回复审批被拒绝；请先恢复写入')
            loadBootstrap()
            return
          }
          setPending((prev) => prev.filter((p) => p.id !== item.id))
          addLog('驳回', item.who + ' · ' + item.quote, '宿主不可用 · 仅本地记录')
          notify('宿主不可用，仅本地记录')
        }
      }

      function edit(item) {
        notify('改稿编辑器在下一版接入')
      }

      function rpcMessage(error, fallback) {
        if (error?.code === 'killed') return '已停机：写操作被宿主拒绝；请先到「体检」恢复'
        if (error?.code === 'approval_stale') return '审批已失效：内容版本已变化，请重新提交审批'
        if (error?.code === 'not-found') return '对象不存在或已被处理'
        if (error?.code === 'bad-request') return error?.message || '请求被宿主拒绝'
        return error?.message || fallback || '宿主 RPC 失败'
      }

      function handleContentError(error) {
        notify(rpcMessage(error, '内容操作失败'))
        if (error?.code === 'killed' || error?.code === 'approval_stale' || error?.code === 'not-found') loadBootstrap()
      }

      async function createContent(payload) {
        try {
          const data = await rpc('content.create', payload)
          applyState(data)
          notify('草稿已保存（本地 v1 · 未发布）')
          return true
        } catch (error) {
          handleContentError(error)
          return false
        }
      }

      async function submitContent(item) {
        try {
          const data = await rpc('content.submit', { id: item.id, version: item.version })
          applyState(data)
          notify('已提交审批 · 等待你人工通过/驳回')
          return true
        } catch (error) {
          handleContentError(error)
          return false
        }
      }

      async function updateContent(item, patch) {
        try {
          const data = await rpc('content.update', { id: item.id, ...patch })
          applyState(data)
          notify('已保存改稿 v' + (item.version + 1) + ' · 旧审批自动失效')
          return true
        } catch (error) {
          handleContentError(error)
          return false
        }
      }

      async function deleteContent(item) {
        setModal({
          title: '删除这条草稿？',
          body: '「' + item.title + '」将从本地内容库删除，不可恢复；不会影响 B站已发布内容。',
          confirm: '删除',
          onConfirm: async () => {
            setModal(null)
            try {
              const data = await rpc('content.delete', { id: item.id })
              applyState(data)
              notify('草稿已删除')
            } catch (error) {
              handleContentError(error)
            }
          },
        })
      }

      async function approveContent(approval) {
        try {
          const data = await rpc('content.approve', { id: approval.id, version: approval.version })
          applyState(data)
          notify('已通过 v' + approval.version + ' · 仅记录，未发布')
          return true
        } catch (error) {
          handleContentError(error)
          return false
        }
      }

      async function rejectContent(approval, reason) {
        try {
          const data = await rpc('content.reject', { id: approval.id, reason, version: approval.version })
          applyState(data)
          notify('已驳回并记录原因 · 未发布')
          return true
        } catch (error) {
          handleContentError(error)
          return false
        }
      }

      function requestAutoReply() {        setModal({
          title: '开启自动回复？',
          body: '开启后会真实发送私信：每条消息由独立模型会话回复，可按 1–3 条短消息拆开；图片会先保存待审。主人和已知互关的低风险消息自动回，其他人进入审查/确认队列。',
          confirm: '确认开启',
          onConfirm: async () => {
            setModal(null)
            try {
              applyState(await rpc('settings.set', { autoReply: true }))
              notify('自动回复已开启 · B 模式')
            } catch (error) {
              notify(rpcMessage(error, '开启自动回复失败'))
            }
          },
        })
      }

      async function createAccount() {
        try {
          const data = await rpc('accounts.create', { name: '新账号' })
          setAccounts((prev) => ({ ...prev, accounts: [...(prev.accounts || []), data.value] }))
          notify('已创建独立账号目录；切换并重载后可扫码登录')
        } catch (error) {
          notify(rpcMessage(error, '创建账号失败'))
        }
      }

      function requestSwitchAccount(account) {
        setModal({
          title: '切换账号？',
          body: '将切换到「' + account.name + '」的独立目录。切换后需要重载插件或重启 DSH 才会生效。',
          confirm: '切换',
          onConfirm: async () => {
            setModal(null)
            try {
              const data = await rpc('accounts.switch', { id: account.id })
              setAccountStale(true)
              notify('已写入切换 · 当前运行仍是旧账号，请重载插件/重启 DSH')
            } catch (error) {
              notify(rpcMessage(error, '切换账号失败'))
            }
          },
        })
      }

      async function requestFollow(mid, name) {
        try {
          const data = await rpc('follow.request', { mid, name })
          setFollowRequests(data.value?.followRequests || [])
          notify('关注请求已入队，等待确认；未执行关注')
        } catch (error) {
          notify(rpcMessage(error, '关注请求失败'))
        }
      }

      function decideFollow(item, action) {
        setModal({
          title: action === 'approve' ? '确认关注？' : '驳回关注？',
          body: (action === 'approve' ? '将真实关注' : '将驳回关注请求') + '：' + item.name + ' / ' + item.mid + '。',
          confirm: action === 'approve' ? '确认关注' : '驳回',
          onConfirm: async () => {
            setModal(null)
            try {
              const data = await rpc('follow.decide', { id: item.id, action })
              setFollowRequests(data.value?.followRequests || [])
              if (action === 'approve') {
                try {
                  await rpc('follow.execute', { id: item.id, mid: item.mid })
                  notify('已真实关注 ' + item.name)
                } catch (error) {
                  notify(rpcMessage(error, '关注接口失败'))
                } finally {
                  try { const fresh = await rpc('follow.list'); setFollowRequests(fresh.value || []) } catch {}
                }
              } else {
                notify('关注已驳回')
              }
            } catch (error) {
              notify(rpcMessage(error, '关注确认失败'))
            }
          },
        })
      }

      async function disableAutoReply() {
        try {
          applyState(await rpc('settings.set', { autoReply: false }))
          notify('自动回复已关闭 · 服务端立即生效')
        } catch (error) {
          notify(rpcMessage(error, '关闭自动回复失败'))
        }
      }

      async function armAutomation() {
        setModal(null)
        try {
          applyState(await rpc('settings.set', { automationArmed: true, lastAutomationAt: new Date().toISOString() }))
          notify('自动化已启动 · 会补回最近 24 小时的未处理互动')
        } catch (error) {
          notify(rpcMessage(error, '启动自动化失败'))
        }
      }

      React.useEffect(() => {
        if (!bootstrapped || showSetup || modal || anomalyShown.current) return
        const healthWarn = (health || []).filter((row) => row[2] === 'warn' || row[2] === 'danger').length
        const anomaly = cooldown.remaining > 0 || real.error || healthWarn > 0
        if (!anomaly) return
        anomalyShown.current = true
        setModal({
          title: '异常情况提醒',
          body: [
            cooldown.remaining > 0 ? 'B站请求冷却中，剩余 ' + cooldown.remaining + ' 秒。' : '',
            real.error ? '只读同步异常：' + real.error : '',
            healthWarn > 0 ? '体检有 ' + healthWarn + ' 项异常。' : '',
          ].filter(Boolean).join('\n'),
          confirm: '知道了',
          onConfirm: () => setModal(null),
        })
      }, [bootstrapped, showSetup, modal, cooldown, real.error, health])

      React.useEffect(() => {
        if (showSetup) return
        if (settings.autoReply && settings.automationArmed !== true) {
          setModal({
            title: '自动化待启动',
            body: '检测到 DSH 已打开。自动回复当前暂停；启动后先补回最近 24 小时的未处理互动，再按策略继续。',
            confirm: '启动自动化',
            onConfirm: armAutomation,
          })
        }
      }, [showSetup, settings.autoReply, settings.automationArmed])

      async function startAccountLogin(account) {
        try {
          const data = await rpc('accounts.qr.start', { id: account.id })
          setAccountQr({ accountId: account.id, session: data.value, busy: false })
        } catch (error) {
          notify(rpcMessage(error, '生成二维码失败'))
        }
      }

      React.useEffect(() => {
        if (!accountQr?.session?.id) return
        const timer = setTimeout(async () => {
          try {
            const data = await rpc('accounts.qr.poll', { id: accountQr.accountId, sessionId: accountQr.session.id })
            const next = data.value
            if (next?.status === 'success') {
              setAccountQr(null)
              try { const fresh = await rpc('accounts.list'); if (fresh?.value) setAccounts(fresh.value) } catch {}
              notify('账号登录成功 · 切换后需重载生效')
            } else if (next?.status === 'expired' || next?.status === 'error' || next?.status === 'cancelled') {
              setAccountQr(null)
              notify('二维码已失效，请重新生成')
            } else {
              setAccountQr({ accountId: accountQr.accountId, session: next })
            }
          } catch {
            setAccountQr(null)
          }
        }, 2200)
        return () => clearTimeout(timer)
      }, [accountQr])

      function decideComputerAction(item, ok) {
        setModal({
          title: ok ? '确认 Computer Use 动作？' : '拒绝 Computer Use 动作？',
          body: (item.label || item.action) + ' · 坐标 ' + item.x + ',' + item.y + '。确认后执行器只能执行一次。',
          confirm: ok ? '确认执行' : '拒绝',
          onConfirm: async () => {
            setModal(null)
            try {
              const data = await rpc('computer.approve', { id: item.id, ok })
              setComputerActions(data.value?.computerActions || [])
              notify(ok ? '动作已确认，等待执行器执行' : '动作已拒绝')
            } catch (error) {
              notify(rpcMessage(error, '动作处理失败'))
            }
          },
        })
      }

      async function saveOwners(next) {        try {
          const data = await rpc('owner.set', next)
          applyState(data)
          notify('主人名单已保存 · 互关始终具备主人授权，手动来源：' + (next.activeSource === 'mutual' ? '互关' : '手动'))
          return true
        } catch (error) {
          notify(rpcMessage(error, '保存主人名单失败'))
          return false
        }
      }

      async function reloadPersonas() {
        try {
          const data = await rpc('personas.list')
          if (Array.isArray(data?.value) && data.value.length) {
            setPersonaList(data.value)
            const current = settings.personaPreset || 'deepseek-whale'
            const preset = data.value.find((item) => item.key === current)
            if (preset) {
              setSettings((prev) => ({ ...prev, roleName: preset.roleName, callYou: preset.callYou, selfName: preset.selfName, personaFile: preset.file || '', persona: preset.persona }))
            }
            notify('人格预设已重新载入 · ' + data.value.length + ' 个')
          } else {
            notify('没有读取到人格文件')
          }
        } catch (error) {
          notify(rpcMessage(error, '人格载入失败'))
        }
      }

      async function fetchMutual() {
        try {
          const data = await rpc('bili.mutual')
          const next = Array.isArray(data.value?.members) ? data.value.members : []
          setMutual((prev) => {
            const previous = Array.isArray(prev?.members) ? prev.members : []
            const keep = next.length === 0 && previous.length > 0
            const value = keep
              ? { ...prev, error: '本次返回 0 人，已保留上次列表', stale: true }
              : { members: next, error: '', stale: false, updatedAt: new Date().toISOString() }
            saveMutualCache(value)
            return value
          })
          notify(next.length === 0 ? '本次未返回互关；已保留上次列表' : '已读取互关好友 · ' + next.length + ' 人')
          return data.value
        } catch (error) {
          setMutual((prev) => ({ ...prev, members: Array.isArray(prev?.members) ? prev.members : [], error: error?.message || '读取互关失败' }))
          notify(rpcMessage(error, '读取互关失败；已保留上次结果'))
          return null
        }
      }

      async function refreshOwners() {
        try {
          const data = await rpc('owner.get')
          setOwners(data.value || { activeSource: 'manual', members: [] })
          return true
        } catch {
          return false
        }
      }

      async function queueReply(input) {
        try {
          const data = await rpc('reply.queue', input)
          applyState(data)
          notify(data.value?.result?.mode === 'ignore' ? '非主人 @：已忽略' : '回复已入队 · ' + data.value?.result?.mode)
          return data.value
        } catch (error) {
          notify(rpcMessage(error, '回复入队失败'))
          return null
        }
      }

      async function decideReply(id, action) {
        try {
          applyState(await rpc('reply.decide', { id, action }))
          notify(action === 'approve' ? '回复已通过（本地未发送）' : '回复已驳回')
          return true
        } catch (error) {
          notify(rpcMessage(error, '回复处理失败'))
          return false
        }
      }

      async function killSwitch() {
        try {
          const data = await rpc('risk.kill')
          applyState(data)
          notify('已停机：所有写操作被拒绝')
        } catch (error) {
          notify(rpcMessage(error, '停机失败'))
        }
      }

      async function requestRevive() {
        const data = await rpc('risk.revive.request')
        return data?.value?.challenge || null
      }

      async function reviveSwitch(challenge) {
        try {
          const data = await rpc('risk.revive.confirm', { confirm: 'REVIVE', challenge })
          applyState(data)
          notify('已恢复写入（仍只读，不会发布）')
        } catch (error) {
          notify(rpcMessage(error, '恢复失败'))
        }
      }

      const tabItems = [
        { id: 'account', label: '账号' },
        { id: 'overview', label: '总览' },
        { id: 'fish', label: '养鱼' },
        { id: 'pending', label: '待审', count: (pending.length + replyQueue.filter((item) => item.status === 'pending').length) || undefined },
        { id: 'interact', label: '互动' },
        { id: 'diary', label: '日记' },
        { id: 'health', label: '体检' },
        { id: 'logs', label: '日志' },
        { id: 'content', label: '内容', count: contents.filter((item) => item.state === 'approval_pending').length || undefined },
        { id: 'studio-article', label: '图文' },
        { id: 'studio-video', label: '视频' },
        { id: 'studio-live', label: '直播' },
      ]

      const sectionTabs = {
        fish: ['account', 'overview', 'interact', 'pending', 'diary', 'health', 'logs'],
        create: ['content'],
        settings: ['fish'],
        article: ['studio-article'],
        video: ['studio-video'],
        live: ['studio-live'],
      }
      const sectionLabels = { fish: '养鱼', create: '创作', settings: '设置', article: '图文', video: '视频', live: '直播' }
      function openSection(next) {
        setSection(next)
        setTab(next === 'create' ? 'content' : next === 'settings' ? 'fish' : next === 'article' ? 'studio-article' : next === 'video' ? 'studio-video' : next === 'live' ? 'studio-live' : 'account')
        if (next === 'settings') {
          refreshOwners()
          fetchMutual()
        }
      }
      function openHealth() {
        setSection('fish')
        setTab('health')
      }
      const visibleTabs = (sectionTabs[section] || []).map((id) => tabItems.find((item) => item.id === id)).filter(Boolean)
      function backHome() {
        setSection(null)
        setTab('overview')
      }

      const data = { ...EMPTY, pending, account, contents, approvals, killed, health, logs }
      const panels = {
        account: h(Account, {
          account,
          health,
          real,
          contents,
          accounts,
          accountQr,
          onLoginAccount: startAccountLogin,
          followRequests,
          onCreateAccount: createAccount,
          onSwitchAccount: requestSwitchAccount,
          onCreateFollow: requestFollow,
          onDecideFollow: decideFollow,
          pendingCount: pending.length + replyQueue.filter((item) => item.status === 'pending').length,
          go: setTab,
        }),
        overview: h(Overview, { data, go: setTab }),
        fish: h(Fish, { settings, set, owners, mutual, personaList, onSaveOwners: saveOwners, onFetchMutual: fetchMutual, onSave: save, onReloadPersonas: reloadPersonas, onAutoReply: requestAutoReply, onAutoReplyOff: disableAutoReply, toast: notify, killed }),
        pending: h(Pending, { items: pending, queue: replyQueue, onDecideReply: decideReply, onRefresh: loadBootstrap, onError: notify, approve, reject, edit, killed }),
        interact: h(Interact, { data, real, settings, onCreateContent: createContent, owners, replyQueue, onQueue: queueReply, onDecide: decideReply }),
        diary: h(Diary, { data }),
        health: h(Health, {
          data,
          toast: notify,
          killed,
          computerActions,
          onDecideComputerAction: decideComputerAction,
          onKill: killSwitch,
          onRevive: reviveSwitch,
          onReviveRequest: requestRevive,
          onRun: async () => {
            try { applyState(await rpc('health.run')); notify('体检已跑') }
            catch { addLog('体检', '依赖与登录', '宿主不可用'); notify('体检失败') }
          },
        }),
        logs: h(Logs, { logs, onExport: exportLogs }),
        content: h(Content, {
          items: contents,
          approvals,
          killed,
          toast: notify,
          onCreate: createContent,
          onSubmit: submitContent,
          onUpdate: updateContent,
          onDelete: deleteContent,
          onApprove: approveContent,
          onReject: rejectContent,
        }),
        'studio-article': h(Studio, { type: 'article', onCreate: createContent, toast: notify, killed }),
        'studio-video': h(Studio, { type: 'video', onCreate: createContent, toast: notify, killed }),
        'studio-live': h(Studio, { type: 'live', onCreate: createContent, toast: notify, killed }),
      }

      return h('div', { className: 'ww-root' },
        h('div', { className: 'ww-page' },
          h(Head, {
            account,
            title: t('page.title'),
            subtitle: t('page.subtitle'),
            killed,
            onKill: killSwitch,
            onOpenHealth: openHealth,
            onSetup: () => setShowSetup(true),
            onBack: section ? backHome : null,
            onRefresh: () => { loadBootstrap(); loadBili(true); notify('已刷新'); addLog('刷新', '工作台', real.authenticated ? '已同步真实回复' : '未登录') },
          }),
          accountStale
            ? h('div', { className: 'ww-notice' },
                icon('lock', 13),
                h('span', null, h('b', null, '账号已切换，待重载'), ' · 当前运行实例仍是旧账号，所有写操作会被拒绝；请重载插件或重启 DSH。'),
              )
            : null,
          cooldown.remaining > 0
            ? h('div', { className: 'ww-notice' },
                icon('refresh', 13),
                h('span', null, h('b', null, 'B站冷却中'), ' · 剩余 ' + cooldown.remaining + ' 秒；到 0 后可重试，期间不要重复刷新。'),
              )
            : null,
          !showSetup && settings.autoReply && settings.automationArmed !== true
            ? h('div', { className: 'ww-notice' },
                icon('lock', 13),
                h('span', null, h('b', null, '自动化暂停'), ' · 等待主人审阅启动；启动后会补回最近 24 小时未处理互动。'),
              )
            : null,
          section === null && showSetup ? h(Setup, {
            settings,
            account,
            killed,
            onAccount: (next) => { setAccount(next); loadBili(true); notify('已登录 ' + (next?.name || 'B站账号')) },
            onFinish: finishSetup,
            onSkip: skipSetup,
          }) : null,
          killed
            ? h('div', { className: 'ww-notice' },
                icon('lock', 13),
                h('span', null, h('b', null, '已停机 · kill switch 生效'), ' · 内容/设置/回复审批等写操作会被宿主拒绝；到「体检」恢复需二次确认。'),
                h('span', { className: 'ww-right' }, '写操作：KILLED'),
              )
            : null,
          section === null
            ? h(Home, { data, account, killed, contents, pending, real, owners, replyQueue, settings, cooldown, followRequests, onOpen: openSection })
            : h('div', null,
                h('div', { className: 'ww-sectionbar' },
                  h('button', { className: 'ww-btn ghost small', onClick: backHome }, '← 返回主页'),
                  h('h2', null, sectionLabels[section] || section),
                  h('div', { className: 'ww-right', style: { marginLeft: 'auto' } }, chip('info', visibleTabs.length + ' 个页面')),
                ),
                h(Tabs, { items: visibleTabs, active: tab, onChange: setTab }),
                visibleTabs.map((item) => h(TabPanel, { key: item.id, id: item.id, active: tab === item.id }, panels[item.id])),
              ),
          h('div', { className: 'ww-foot' },
            h('span', null, real.authenticated ? '真实账号 · 只读同步' : (server ? '已连接 · 未登录' : '连接中')),
            h('span', null, '·'),
            h('span', null, '页面随 DSH 主题自动切换'),
            h('span', { className: 'ww-right' }, 'U1 · 三版块 / 主人授权 / 人工审批 · 0.2.15'),
          ),
          section === null
            ? h('div', { className: 'ww-actions', style: { display: 'flex', gap: 8, marginTop: 12 } },
                h('button', { className: 'ww-btn primary', onClick: () => openSection('settings') }, '打开设置'),
                h('button', { className: 'ww-btn ghost', onClick: () => openSection('create') }, '内容草稿'),
                h('button', { className: 'ww-btn ghost', onClick: () => openSection('fish') }, '查看待审'),
              )
            : null,
        ),
        toast ? h('div', { className: 'ww-toast', role: 'status' }, toast) : null,
        h(Modal, {
          data: modal,
          onCancel: () => setModal(null),
          onConfirm: () => { const action = modal?.onConfirm; if (typeof action === 'function') action() },
        }),
      )
    }

    class Boundary extends React.Component {
      constructor(props) {
        super(props)
        this.state = { error: null }
      }
      static getDerivedStateFromError(error) {
        return { error }
      }
      componentDidCatch(error) {
        try { console.warn('[dsh-webwhale-bili] panel render failed:', error?.message || error) } catch {}
      }
      render() {
        if (this.state.error) {
          return h('div', { className: 'ww-root' }, h('div', { className: 'ww-crash' }, '此区块加载失败。', h('button', { className: 'ww-btn ghost small', style: { marginLeft: 10 }, onClick: () => this.setState({ error: null }) }, '重试')))
        }
        return this.props.children
      }
    }

    function Panel(props) {
      return h(Boundary, null, h(App, props))
    }

    function apply(ctx) {
      installStyles()
      const locale = ctx.get?.('locale') || ctx.locale
      let t = (key) => DICTS.zh[key] ?? key
      if (locale && typeof locale.register === 'function') {
        safe('locale register', () => {
          ctx.effect(() => locale.register(NS, DICTS), 'dsh-webwhale-bili: dictionaries')
        })
      }
      if (locale && typeof locale.bind === 'function') {
        try { t = locale.bind(NS) } catch {}
      }

      safe('sidebar registration', () => {
        ctx.slots.inject('sidebar.panellist', () => ctx.slots.register(
          { name: 'sidebar.panellist', id: SLOT_ID, order: 40, label: () => t('nav.label'), locale: NS },
          (props) => icon('whale', typeof props?.size === 'number' ? props.size : 17),
        ))
      })
      safe('main registration', () => {
        ctx.slots.inject('main', () => ctx.slots.register(
          { name: 'main', key: SLOT_ID, locale: NS },
          (props) => h(Panel, { ...props, t, ctx }),
        ))
      })
    }

    return { name: 'dsh-webwhale-bili', inject: ['slots', 'locale'], apply }
  },
})
