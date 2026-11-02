'use strict';
// Small progressive enhancements only. Content, navigation links and imagery are static HTML.
const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#primary-navigation');
function closeMenu(){
  if (!toggle || !nav) return;
  nav.classList.remove('is-open');
  toggle.setAttribute('aria-expanded','false');
}
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded',String(open));
    nav.classList.toggle('is-open',open);
  });
  document.addEventListener('keydown',e => {
    if(e.key==='Escape') {
      const hadOpen = nav.classList.contains('is-open');
      document.querySelectorAll('.nav-dropdown[open]').forEach(d=>d.open=false);
      closeMenu();
      if(hadOpen) toggle.focus();
    }
  });
  window.matchMedia('(min-width: 1051px)').addEventListener('change', e => { if(e.matches) closeMenu(); });
}
const dropdowns = [...document.querySelectorAll('.nav-dropdown')];
for(const dropdown of dropdowns) dropdown.addEventListener('toggle', () => {
  if(dropdown.open) dropdowns.forEach(other => { if(other!==dropdown) other.open=false; });
});
document.addEventListener('click', e => {
  if (!e.target.closest('.nav-dropdown')) dropdowns.forEach(d=>d.open=false);
});
const search = document.querySelector('#site-search');
if(search) {
  const rows=[...document.querySelectorAll('.search-result')];
  const count=document.querySelector('#search-count');
  const none=document.querySelector('#no-results');
  const run=()=>{
    const terms=search.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
    let total=0;
    rows.forEach(row=>{ const show=terms.every(t=>row.dataset.search.includes(t)); row.hidden=!show; if(show) total++; });
    count.textContent=`${total} ${total===1?'page':'pages'}${terms.length?' found':''}`;
    none.hidden=total!==0;
  };
  search.value=new URLSearchParams(location.search).get('q')||'';
  search.addEventListener('input',run);
  run();
}
const enquiry=document.querySelector('.enquiry-form');
if(enquiry) {
  const select=document.querySelector('#interest');
  if(new URLSearchParams(location.search).has('topic')) select.value='Technical documentation';
  enquiry.addEventListener('submit',e=>{
    e.preventDefault();
    if(!enquiry.reportValidity()) return;
    const data=new FormData(enquiry);
    const subject=`NAPCO enquiry: ${String(data.get('interest')||'Application')}`;
    const body=[`Name: ${data.get('name')||''}`,`Email: ${data.get('email')||''}`,`Company: ${data.get('company')||''}`,`Area of interest: ${data.get('interest')||''}`,'','Materials and application:',String(data.get('message')||'')].join('\n');
    const href=`mailto:sales@napcoadhesives.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    const fallback=document.querySelector('#email-draft-link');
    fallback.href=href; fallback.hidden=false;
    document.querySelector('#form-status').textContent='Your email app should open a draft. Please review it and press Send there. This preview has not sent or stored your enquiry.';
    window.location.href=href;
  });
}
