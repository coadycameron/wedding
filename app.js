(() => {
'use strict';
const venues=window.VENUES||[], photographers=window.PHOTOGRAPHERS||[], $=(s,root=document)=>root.querySelector(s), $$=(s,root=document)=>[...root.querySelectorAll(s)];
let saved={};try{saved=JSON.parse(localStorage.getItem('venueJournalV1')||'{}')||{}}catch(e){}
const state=Object.assign({favorites:[],updates:{},guestCount:75,budget:{guests:100,food:85,drink:35,extra:2000,service:15,tax:14}},saved);
const money=n=>new Intl.NumberFormat('en-CA',{style:'currency',currency:'CAD',maximumFractionDigits:0}).format(n);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const persist=()=>{try{localStorage.setItem('venueJournalV1',JSON.stringify(state))}catch(e){notify('Storage full. Export your notes.')}};
const update=id=>state.updates[id]||{},venue=id=>venues.find(v=>v.id===id)||photographers.find(v=>v.id===id),isSaved=id=>state.favorites.includes(id);
const img=(url,alt,attrs='')=>'<img src="'+esc(url)+'" alt="'+esc(alt)+'" loading="eager" decoding="async" '+attrs+'>';
let activeVenue=null,activeTab='overview',map=null,markers={},compareMode='saved',toastTimer,photoVenue=null,photoIndex=0;
const photoPositions={};
function selectedPhoto(v){return (photoPositions[v.id]||0)%v.images.length}
function photoBrowser(v,context){
  const i=selectedPhoto(v),p=v.images[i],isCard=context==='card';
  return '<div class="'+(isCard?'card-photo':'detail-cover')+' photo-browser" data-photo-browser="'+context+'" data-id="'+v.id+'">'+
    '<button type="button" class="photo-canvas" data-action="photo" data-id="'+v.id+'" data-index="'+i+'" aria-label="Open '+esc(v.name)+' photos">'+img(p[0],p[1])+'</button>'+
    (isCard?'<div class="card-label">'+esc(v.style.toUpperCase())+'</div>':
      '<div class="detail-cover-text"><small>'+esc(v.region.toUpperCase())+' · '+esc(v.town.toUpperCase())+'</small><h2>'+esc(v.name)+'</h2></div>')+
    '<button type="button" class="photo-inline-arrow photo-inline-prev" data-action="photo-step" data-id="'+v.id+'" data-delta="-1" aria-label="Previous photo of '+esc(v.name)+'">←</button>'+
    '<button type="button" class="photo-inline-arrow photo-inline-next" data-action="photo-step" data-id="'+v.id+'" data-delta="1" aria-label="Next photo of '+esc(v.name)+'">→</button>'+
    '<button type="button" class="inline-photo-link" data-action="photo" data-id="'+v.id+'" data-index="'+i+'" aria-label="Open '+esc(v.name)+' photo gallery">View photos <span class="inline-photo-count">'+(i+1)+' / '+v.images.length+'</span> ↗</button>'+
    (isCard?'<button type="button" class="heart '+(isSaved(v.id)?'saved':'')+'" data-action="favorite" data-id="'+v.id+'" aria-label="'+(isSaved(v.id)?'Remove saved venue':'Save venue')+'">'+(isSaved(v.id)?'♥':'♡')+'</button>':'')+
    '</div>';
}
function changeInlinePhoto(id,delta){
  const v=venue(id);if(!v)return;
  photoPositions[id]=((selectedPhoto(v)+delta)%v.images.length+v.images.length)%v.images.length;
  const i=selectedPhoto(v),p=v.images[i];
  $$('[data-photo-browser][data-id="'+id+'"]').forEach(el=>{
    const visual=$('.photo-canvas img',el);
    visual.src=p[0];visual.alt=p[1];
    $$('.photo-canvas,.inline-photo-link',el).forEach(button=>button.dataset.index=String(i));
    const counter=$('.inline-photo-count',el);if(counter)counter.textContent=(i+1)+' / '+v.images.length;
    el.classList.remove('photo-failed');
  });
}

function notify(message){let t=$('#toast');t.textContent=message;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),3000)}
function fit(v,n){if(v.id==='wilsons'&&n>65&&n<=107)return 'conditional';if(v.id==='oceanstone'&&n>80&&n<=125)return 'conditional';if(v.id==='cable')return 'conditional';return n>v.capacity?'no':'good'}
function fitText(v,n){let x=fit(v,n);return x==='no'?'Exceeds published capacity':x==='conditional'?(v.id==='wilsons'?'Requires overnight occupancy':v.id==='cable'?'Wedding dinner layout unconfirmed':'Seated capacity unconfirmed'):'Fits published capacity'}
function amount(v){
let q=Number(update(v.id).quote);if(q>0)return money(q)+' quoted';
if(v.priceType==='unknown')return 'Request quote';
if(v.priceType==='historical')return '$24,000 minimum*';
return money(v.base)+(v.priceType==='venue-space'?'*':v.priceType==='tax-included'?' incl. tax':' + HST')}
function amountNote(v){if(Number(update(v.id).quote)>0)return 'Your entered venue fee';
if(v.id==='whitepoint')return 'Outdoor ceremony alone: $6,500 extra';
if(v.id==='saraguay')return 'Venue only; ceremony is $650 extra';
if(v.id==='lightfoot')return '2027 hospitality fee; catering and drinks extra';
if(v.id==='cable')return '2027 buyout and dining price unknown';
return {unknown:'2027 wedding fee unknown',historical:'Historical 2025 weekend minimum', 'venue-space':'Event-space rate, wedding unconfirmed',published:'Advertised venue rental', 'tax-included':'Package with two-night stay'}[v.priceType]}
function card(v){
let f=fit(v,state.guestCount);
return '<article class="venue-card" data-id="'+v.id+'">'+photoBrowser(v,'card')+
'<div class="card-body"><div class="card-region">'+esc(v.region.toUpperCase())+' · '+esc(v.town.toUpperCase())+'</div><h3 class="card-name">'+esc(v.name)+'</h3><p class="card-text">'+esc(v.score)+'</p>'+
'<div class="card-facts"><span class="fact">♧ Up to '+v.capacity+'*</span><span class="fact">⌂ '+(v.beds?v.beds+' stay':esc(v.stayFlag))+'</span></div>'+
'<div class="card-price"><div><small>STARTING FIGURE</small><strong>'+esc(amount(v))+'</strong><span>'+esc(amountNote(v))+'</span></div><button class="card-open" data-action="detail" data-id="'+v.id+'" aria-label="View venue">↗</button></div></div>'+
'<div class="card-footer"><span class="fit-pill '+f+'"><span class="fit-dot"></span>'+esc(fitText(v,state.guestCount))+'</span><button data-action="detail" data-id="'+v.id+'">View details</button></div></article>'}
function filtered(){
let arr=[...venues],query=$('#search').value.trim().toLowerCase(),reg=$('#region-select').value;
if(query)arr=arr.filter(v=>[v.name,v.town,v.region,v.archetype,v.style].join(' ').toLowerCase().includes(query));
if(reg)arr=arr.filter(v=>v.region===reg);
if($('#fit-only').checked)arr=arr.filter(v=>fit(v,state.guestCount)==='good');
switch($('#sort-select').value){
case 'alpha':arr.sort((a,b)=>a.name.localeCompare(b.name));break;
case 'price':arr.sort((a,b)=>(Number(update(a.id).quote)||a.base||Infinity)-(Number(update(b.id).quote)||b.base||Infinity));break;
case 'capacity':arr.sort((a,b)=>b.capacity-a.capacity);break;
default:arr.sort((a,b)=>a.rank-b.rank)}
return arr}
function renderGrid(){let arr=filtered();$('#venues-grid').innerHTML=arr.length?arr.map(card).join(''):'<div class="empty-state"><h3>No venues match</h3><p>Try another guest count or include conditional fits.</p></div>';$('#result-count').textContent=arr.length;$('#saved-count').textContent=state.favorites.length}
function go(view){
$$('.view').forEach(el=>el.classList.toggle('active',el.id===view+'-view'));
$$('.nav-link').forEach(el=>el.classList.toggle('active',el.dataset.nav===view));
$('#hero').style.display=view==='discover'?'grid':'none';$('.curation-band').style.display=view==='discover'?'block':'none';
if(view==='shortlist')renderShortlist();if(view==='compare')renderCompare();if(view==='map')renderMap();if(view==='photographers')renderPhotographers();
scrollTo({top:0,behavior:'smooth'});history.replaceState(null,'',view==='discover'?location.pathname+location.search:'#'+view)}
function list(items,type=''){return '<ul class="detail-list '+type+'">'+items.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>'}
function detailTab(){
if(!activeVenue)return;let v=activeVenue;
$$('.detail-tabnav button').forEach(el=>el.classList.toggle('active',el.dataset.tab===activeTab));
let html='';
if(activeTab==='overview')html='<div class="detail-columns"><div><section class="detail-section"><h3>Setting & atmosphere</h3><p>'+esc(v.overview)+'</p></section><section class="detail-section"><h3>Ceremony</h3><p>'+esc(v.ceremony)+'</p></section><section class="detail-section"><h3>Reception</h3><p>'+esc(v.reception)+'</p></section></div><div><section class="detail-section"><h3>Overnight experience</h3><p>'+esc(v.stay)+'</p><div class="alert">'+esc(v.stayRule)+'</div></section><section class="detail-section"><h3>What makes us cautious</h3>'+list(v.risks,'risks')+'</section></div></div>';
if(activeTab==='inclusions')html='<div class="detail-columns"><section class="detail-section"><h3>Included or advertised</h3>'+list(v.included)+'</section><section class="detail-section"><h3>Budget for separately</h3>'+list(v.extra,'risks')+'</section></div><div class="alert">Published offerings are not a September 2027 contract. Confirm every inclusion in writing.</div>';
if(activeTab==='pricing')html='<div class="detail-columns"><div><h3>What is publicly priced</h3><p style="font-size:21px;font-weight:800;color:var(--ink)">'+esc(amount(v))+'</p><p>'+esc(v.baseLabel)+'</p><div class="alert">'+esc(v.priceType==='historical'?'The 2027 wedding guide does not publish prices. This is historical 2025 pricing, not a September 2027 quotation.':v.priceType==='venue-space'?'The $4,500 figure is a venue-space package, not confirmed as the 2027 wedding fee.':'Additional guest costs or overnight obligations may apply.')+'</div></div><div><h3>What remains unknown</h3>'+list(v.extra,'risks')+'<p>Enter the actual venue fee in Your planning notes below for better comparisons.</p></div></div><button class="btn btn-ink" id="detail-budget">Open budget explorer ↗</button>';
if(activeTab==='pricing'&&v.packagePdf)html+='<div class="source-links"><a href="'+esc(v.packagePdf)+'" target="_blank" rel="noopener noreferrer">Official 2027 wedding package ↗</a><a href="assets/packages/lightfoot-wolfville-2027-official.pdf" target="_blank" rel="noopener noreferrer">Locally saved 2027 package PDF ↗</a></div><p>2027 à la carte example: $22 passed canapés, main courses from $35, standard bar $80/person or open bar $110/person. Automatic gratuity and 14% HST are additional.</p>';
if(activeTab==='gallery')html='<div class="gallery-heading"><h3>'+v.images.length+' photos of '+esc(v.name)+'</h3><span>Open a photo to browse the album</span></div><div class="gallery-grid">'+v.images.map((p,i)=>'<button class="gallery-tile" data-action="photo" data-id="'+v.id+'" data-index="'+i+'" aria-label="View photo '+(i+1)+' of '+v.images.length+': '+esc(p[1])+'">'+img(p[0],p[1])+'<span>'+esc(p[1])+' ↗</span></button>').join('')+'</div><p class="source-caption">Image credit: '+esc(v.imageCredit)+' Additional photos saved locally for private planning; source pages are linked in the full-screen viewer.</p><div class="source-links"><a href="'+esc(v.site)+'" target="_blank" rel="noopener noreferrer">Visit the full official gallery ↗</a></div>';
if(activeTab==='questions')html='<h3>Questions to ask before booking a tour</h3>'+list(v.questions,'questions')+'<div class="alert positive">Use “Draft enquiry” to email these questions for your September 2027 dates.</div>';
$('#detail-tab-content').innerHTML=html}
function openDetail(id,tab='overview'){
let v=venue(id);if(!v)return;activeVenue=v;activeTab=tab;
let u=update(id);
$('#detail-content').innerHTML=photoBrowser(v,'detail')+
'<div class="detail-inner"><div class="detail-tags"><span>'+esc(v.archetype)+'</span><span>Up to '+v.capacity+'*</span><span>'+esc(v.stayFlag)+'</span><span>'+esc(fitText(v,state.guestCount))+'</span></div>'+
'<p class="detail-intro">'+esc(v.score)+'</p><div class="detail-stat-grid">'+
'<div class="detail-stat"><small>Published capacity</small><strong>'+v.capacity+' guests*</strong><span>Confirm seated layout</span></div>'+
'<div class="detail-stat"><small>Public price</small><strong>'+esc(amount(v))+'</strong><span>'+esc(amountNote(v))+'</span></div>'+
'<div class="detail-stat"><small>Accommodation</small><strong>'+(v.beds?v.beds+' people':esc(v.stayFlag))+'</strong><span>See overnight rules</span></div>'+
'<div class="detail-stat"><small>Target date</small><strong>September 2027</strong><span>Availability unverified</span></div></div>'+
'<nav class="detail-tabnav" aria-label="Venue sections"><button data-tab="overview">The venue</button><button data-tab="inclusions">What’s included</button><button data-tab="pricing">Pricing</button><button data-tab="gallery">Photos</button><button data-tab="questions">Questions to ask</button></nav>'+
'<div class="detail-body" id="detail-tab-content"></div>'+
'<div class="detail-section"><h3>Primary sources</h3><div class="source-links">'+v.sources.map(s=>'<a href="'+esc(s[1])+'" target="_blank" rel="noopener noreferrer">'+esc(s[0])+' ↗</a>').join('')+'</div><p class="source-caption">Reviewed October 8, 2026. Venue policies and 2027 rates require confirmation.</p></div>'+
'<div class="detail-actions"><a class="btn btn-outline" href="'+esc(v.map)+'" target="_blank" rel="noopener noreferrer">Google Maps ↗</a><a class="btn btn-outline" href="'+esc(v.site)+'" target="_blank" rel="noopener noreferrer">Official website ↗</a>'+
'<button class="btn btn-outline" data-action="favorite" data-id="'+v.id+'">'+(isSaved(v.id)?'♥ Saved':'♡ Save venue')+'</button><button class="btn btn-ink" data-action="email" data-id="'+v.id+'">Draft enquiry ↗</button></div>'+
'<div class="status-tools"><h3>Your planning notes</h3><label>ENQUIRY STATUS<select data-field="status" data-id="'+v.id+'"><option value="">Not contacted</option><option>Interested</option><option>Enquiry sent</option><option>Tour scheduled</option><option>Quoted</option><option>Unavailable</option><option>Ruled out</option></select></label>'+
'<label>ACTUAL VENUE FEE QUOTE (CAD)<input type="number" min="0" inputmode="decimal" data-field="quote" data-id="'+v.id+'" placeholder="Enter quote" value="'+esc(u.quote??'')+'"></label>'+
'<label class="notes-label">YOUR NOTES<textarea data-field="notes" data-id="'+v.id+'" placeholder="Tour impressions, dates offered, room minimums, contract terms...">'+esc(u.notes||'')+'</textarea></label><button class="btn btn-ink save-status" id="save-notes">Save notes</button></div></div>';
$('select[data-field="status"]').value=u.status||'';
detailTab();$('#venue-dialog').showModal()}
function saveField(el){let id=el.dataset.id,k=el.dataset.field;if(!id||!k)return;state.updates[id] ||= {};state.updates[id][k]=el.value;persist()}
function closeDialog(id){let d=$(id);if(d?.open)d.close()}
function toggleSave(id){let was=isSaved(id);state.favorites=was?state.favorites.filter(x=>x!==id):[...state.favorites,id];persist();renderGrid();renderShortlist();if($('#compare-view').classList.contains('active'))renderCompare();if($('#venue-dialog').open){let tab=activeTab;closeDialog('#venue-dialog');openDetail(id,tab)}notify(was?'Removed from saved venues':'Added to saved venues')}
function renderPhoto(){
let v=venue(photoVenue);if(!v)return;
photoIndex=(photoIndex+v.images.length)%v.images.length;
const p=v.images[photoIndex];
$('#lightbox-img').src=p[0];$('#lightbox-img').alt=p[1];
$('#lightbox-caption').textContent=v.name+' · '+p[1];
$('#photo-counter').textContent=(photoIndex+1)+' / '+v.images.length;
$('#photo-source').href=p[2]||v.site;
$('#photo-source').setAttribute('aria-label','View original source page for '+p[1]);
}
function advancePhoto(delta){
if($('#photo-dialog').open){
  photoIndex+=delta;
  renderPhoto();
  photoPositions[photoVenue]=photoIndex;
  changeInlinePhoto(photoVenue,0);
}
}
function renderShortlist(){
let arr=venues.filter(v=>isSaved(v.id)).sort((a,b)=>a.rank-b.rank);
let photographerSaved=photographers.filter(v=>isSaved(v.id));
$('#shortlist-cards').innerHTML=(arr.length||photographerSaved.length)?arr.map(v=>{
let u=update(v.id);return '<article class="shortlist-item">'+img(v.hero,v.name)+'<div><h3>'+esc(v.name)+'</h3><p>'+esc(v.town)+' · '+esc(u.status||'Not contacted')+' · '+(u.quote?money(+u.quote)+' quoted':'No quote entered')+'</p><p>'+esc((u.notes||'').slice(0,140)||v.score)+'</p><button class="btn btn-outline" data-action="detail" data-id="'+v.id+'">Open details ↗</button> <button class="btn btn-subtle" data-action="favorite" data-id="'+v.id+'">Remove</button></div></article>'
}).join('')+photographerSaved.map(v=>'<article class="shortlist-item">'+img(v.hero,v.name)+'<div><h3>'+esc(v.name)+'</h3><p>Wedding photographer · '+esc(update(v.id).status||'Not contacted')+'</p><p>'+esc((update(v.id).notes||v.style).slice(0,145))+'</p><button class="btn btn-outline" data-nav="photographers">View photographer ↗</button> <button class="btn btn-subtle" data-action="photographer-favorite" data-id="'+v.id+'">Remove</button></div></article>').join(''):'<div class="shortlist-empty"><h3>Nothing saved yet.</h3><p>Tap a ♡ on any venue. Saved notes and real quotes will appear here.</p><button class="btn btn-ink" data-nav="discover">Explore venues ↗</button></div>'}
function renderPhotographers(){
 const host=$('#photographers-content');if(!host)return;
 host.innerHTML=photographers.map(v=>{
 const u=update(v.id);
 return '<article class="photographer-profile">'+
 '<div class="photographer-photo">'+img(v.hero,v.name+' portfolio photograph')+'<button class="btn btn-outline photographer-photo-open" data-action="photo" data-id="'+v.id+'" data-index="0">View photograph ↗</button></div>'+
 '<div class="photographer-main"><div class="eyebrow">DOCUMENTARY WEDDING PHOTOGRAPHY</div><h3>'+esc(v.name)+'</h3><p class="photographer-style">'+esc(v.style)+'</p><p>'+esc(v.overview)+'</p>'+
 '<div class="photographer-links"><a class="btn btn-ink" target="_blank" rel="noopener noreferrer" href="'+esc(v.portfolio)+'">View full portfolio ↗</a><a class="btn btn-outline" target="_blank" rel="noopener noreferrer" href="'+esc(v.contact)+'">Enquire about September 2027 ↗</a>'+
 '<button class="btn btn-outline" data-action="photographer-favorite" data-id="'+v.id+'">'+(isSaved(v.id)?'♥ Saved':'♡ Save photographer')+'</button></div></div></article>'+
 '<div class="photographer-section"><div><div class="eyebrow">OFFICIAL PUBLISHED PRICING</div><h3>Coverage packages</h3><p>Published prices only. September 2027 availability and rates are not yet confirmed. All amounts CAD before HST.</p></div><a href="'+esc(v.prices)+'" target="_blank" rel="noopener noreferrer">Official price list ↗</a></div>'+
 '<div class="photographer-packages">'+v.packages.map(pkg=>'<div class="photographer-package"><div class="eyebrow">'+pkg.hours+' HOURS OF COVERAGE</div><h4>'+esc(pkg.title)+'</h4><strong>'+money(pkg.price)+'</strong><p>'+esc(pkg.details)+'</p></div>').join('')+'</div>'+
 '<div class="photographer-detail-grid"><section><h3>Optional upgrades</h3>'+list(v.upgrades)+'</section><section><h3>Questions to ask</h3>'+list(v.questions,'questions')+'</section></div>'+
 '<div class="photographer-notes status-tools"><h3>Your photography notes</h3><label>CONTACT STATUS<select data-field="status" data-id="'+v.id+'"><option value="">Not contacted</option><option>Interested</option><option>Enquiry sent</option><option>Consultation scheduled</option><option>Quoted</option><option>Booked</option><option>Unavailable</option><option>Ruled out</option></select></label>'+
 '<label>ACTUAL QUOTE (CAD)<input type="number" min="0" data-field="quote" data-id="'+v.id+'" value="'+esc(u.quote||'')+'" placeholder="Enter quote from photographer"></label>'+
 '<label class="notes-label">YOUR NOTES<textarea data-field="notes" data-id="'+v.id+'" placeholder="Availability, consultation, delivery times, travel costs...">'+esc(u.notes||'')+'</textarea></label>'+
 '<button class="btn btn-ink" data-action="photographer-save" data-id="'+v.id+'">Save photography notes</button></div>'+
 '<p class="source-caption">Photo © '+esc(v.name)+'. <a href="'+esc(v.website)+'" target="_blank" rel="noopener noreferrer">Official website ↗</a> · <a href="'+esc(v.prices)+'" target="_blank" rel="noopener noreferrer">Pricing source ↗</a></p>';
 }).join('');
 photographers.forEach(v=>{let el=$('[data-field="status"][data-id="'+v.id+'"]',host);if(el)el.value=update(v.id).status||''});
}
function compareVenues(){let arr=compareMode==='saved'?venues.filter(v=>isSaved(v.id)):venues;if(!arr.length)arr=venues;return [...arr].sort((a,b)=>a.rank-b.rank)}
function renderCompare(){
let arr=compareVenues();
const rows=[
['Location',v=>esc(v.town+', '+v.region)],
['Design',v=>esc(v.archetype)],
['Published capacity',v=>v.capacity+' guests*<br><small>'+esc(fitText(v,state.guestCount))+'</small>'],
['Advertised price',v=>'<strong>'+esc(amount(v))+'</strong><br><small>'+esc(amountNote(v))+'</small>'],
['Accommodation',v=>esc(v.stay)],
['Accommodation obligations',v=>esc(v.stayRule)],
['Reception space',v=>esc(v.reception)],
['Food & bar',v=>esc(v.extra.filter(s=>/bar|cater|food|alcohol/i.test(s)).join(' · ')||'Request details')],
['Crucial caveat',v=>esc(v.risks[0])],
['Your status',v=>esc(update(v.id).status||'Not contacted')],
['Your actual quote',v=>update(v.id).quote?money(+update(v.id).quote):'Not entered']];
$('#comparison-table').innerHTML='<thead><tr><th>DETAIL</th>'+arr.map(v=>'<th>'+img(v.hero,v.name,'class="table-venue-thumb"')+'<button data-action="detail" data-id="'+v.id+'" style="background:none;border:0;padding:0;font-weight:800;text-align:left;color:#244335">'+esc(v.name)+' ↗</button></th>').join('')+'</tr></thead><tbody>'+
rows.map(([label,fn])=>'<tr><td>'+label+'</td>'+arr.map(v=>'<td>'+fn(v)+'</td>').join('')+'</tr>').join('')+'</tbody>'}
function renderMap(){
$('#map-list').innerHTML=venues.map(v=>'<button class="map-list-item" data-action="mapfocus" data-id="'+v.id+'">'+img(v.hero,v.name)+'<span><strong>'+esc(v.name)+'</strong><small>'+esc(v.town)+' · '+esc(v.region)+'</small></span></button>').join('');
if(!window.L)return;
if(!map){$('#venue-map').innerHTML='';map=L.map('venue-map',{scrollWheelZoom:false}).setView([44.68,-63.9],8);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'© OpenStreetMap contributors'}).addTo(map);
let bounds=[];
venues.forEach(v=>{
let icon=L.divIcon({className:'custom-map-pin',html:'<span style="display:grid;place-items:center;width:29px;height:29px;background:#2d553c;color:white;border:3px solid white;border-radius:50%;box-shadow:0 1px 9px #0005;font:bold 12px var(--sans)">'+v.rank+'</span>',iconSize:[30,30],iconAnchor:[15,15]});
let m=L.marker([v.lat,v.lng],{icon}).addTo(map);
m.bindPopup('<div class="map-popup">'+img(v.hero,v.name)+'<h3>'+esc(v.name)+'</h3><span>'+esc(v.town)+'</span><br><button data-action="detail" data-id="'+v.id+'">Explore venue ↗</button></div>');
markers[v.id]=m;bounds.push([v.lat,v.lng])});
map.fitBounds(bounds,{padding:[35,35]})}
setTimeout(()=>map.invalidateSize(),150)}
function focusMap(id){let v=venue(id);if(v&&map){map.setView([v.lat,v.lng],11);markers[id].openPopup()}}
function readBudget(){return {guests:+$('#budget-guests').value||0,food:+$('#budget-food').value||0,drink:+$('#budget-drink').value||0,extra:+$('#budget-extra').value||0,service:+$('#budget-service').value||0,tax:+$('#budget-tax').value||0}}
function estimate(v,b){
let quote=+update(v.id).quote||0,fee=quote||v.base;if(fee==null)return null;
let fb=Math.max(b.guests*(b.food+b.drink),v.minFoodBar||0),service=fb*b.service/100,subtotal=fee+fb+service+b.extra;
let taxable=(v.priceType==='tax-included'&&!quote)?(fb+service+b.extra):subtotal;
return {total:subtotal+taxable*b.tax/100,annotation:v.id==='lightfoot'?'2027 site fee plus separately charged catering and bar (standard drinks $80/person)':v.priceType==='historical'?'Historical 2025 minimum, plus lodging':v.priceType==='venue-space'?'Wedding rate unconfirmed':v.priceType==='tax-included'&&!quote?'Two-night house rental already included':'Room buyout not included'}}
function budgetResults(){
let b=readBudget();state.budget=b;persist();
$('#budget-results').innerHTML=[...venues].sort((a,b)=>a.rank-b.rank).map(v=>{
let r=estimate(v,b),f=fit(v,b.guests);
return '<div class="budget-result">'+img(v.hero,v.name)+'<div><strong>'+esc(v.name)+'</strong><small>'+esc(fitText(v,b.guests))+'</small><small>'+esc(r?r.annotation:'Enter a venue fee quote in its profile')+'</small></div><div class="result-price">'+(r?money(r.total):'TBD')+'<small>'+(f==='no'?'Above published capacity':r?'Before any extra lodging':'Price not published')+'</small></div></div>'
}).join('')}
function openBudget(){for(let [k,v] of Object.entries(state.budget)){$('#budget-'+k).value=v}budgetResults();$('#budget-dialog').showModal()}
function draftEnquiry(v){
let subject='September 2027 wedding enquiry | '+v.name;
let qs=v.questions.slice(0,5).map(x=>'- '+x).join('\n');
let body='Hello,\n\nWe are considering '+v.name+' for our wedding in September 2027 and would love to learn more. We are considering around 75 to 100 guests, depending on the venue.\n\nCould you tell us which Saturdays in September 2027 are available and share an itemized wedding package? We would particularly like to know:\n\n'+qs+'\n\nWe would also love to arrange a tour if you have suitable dates.\n\nThank you!';
if(!v.email){navigator.clipboard?.writeText('Subject: '+subject+'\n\n'+body);notify('Draft copied. Contact the venue through its website.');return}
location.href='mailto:'+encodeURIComponent(v.email)+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body)}
function download(content,name,mime){let blob=new Blob([content],{type:mime}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500)}
function exportNotes(){download(JSON.stringify({exported:new Date().toISOString(),date:'September 2027',favorites:state.favorites,updates:state.updates,budget:state.budget,photographers:photographers.map(v=>({name:v.name,packages:v.packages,website:v.website})),venues:venues.map(v=>({name:v.name,location:v.town,capacity:v.capacity,priceReference:v.baseLabel,overnightConditions:v.stayRule,site:v.site,maps:v.map}))},null,2),'wedding-venue-journal.json','application/json');notify('Journal exported')}
function exportCSV(){
let fields=[['Name',v=>v.name],['Location',v=>v.town],['Capacity',v=>v.capacity],['Published amount',v=>v.baseLabel],['Stay conditions',v=>v.stayRule],['Status',v=>update(v.id).status||''],['Quote',v=>update(v.id).quote||''],['Notes',v=>update(v.id).notes||''],['Website',v=>v.site]];
let q=x=>'"'+String(x??'').replace(/"/g,'""')+'"';
download(fields.map(f=>q(f[0])).join(',')+'\r\n'+compareVenues().map(v=>fields.map(f=>q(f[1](v))).join(',')).join('\r\n'),'wedding-venue-comparison.csv','text/csv;charset=utf-8');notify('Comparison exported')}
document.addEventListener('click',e=>{
let nav=e.target.closest('[data-nav]');if(nav){e.preventDefault();go(nav.dataset.nav);return}
let tab=e.target.closest('[data-tab]');if(tab){activeTab=tab.dataset.tab;detailTab();return}
let a=e.target.closest('[data-action]');if(a){
let id=a.dataset.id,act=a.dataset.action;
if(act==='favorite'){e.stopPropagation();toggleSave(id)}
if(act==='photographer-favorite'){
 e.stopPropagation();let was=isSaved(id);state.favorites=was?state.favorites.filter(x=>x!==id):[...state.favorites,id];persist();renderGrid();renderShortlist();renderPhotographers();notify(was?'Removed photographer from saved':'Saved photographer');
}
if(act==='photographer-save'){
 $$('[data-field][data-id="'+id+'"]',$('#photographers-view')).forEach(saveField);renderShortlist();notify('Photographer notes saved.');
}
if(act==='detail')openDetail(id);
if(act==='mapfocus')focusMap(id);
if(act==='email')draftEnquiry(venue(id));
if(act==='photo'){photoVenue=id;photoIndex=+a.dataset.index;renderPhoto();photoPositions[id]=photoIndex;changeInlinePhoto(id,0);$('#photo-dialog').showModal()}
if(act==='photo-step'){changeInlinePhoto(id,Number(a.dataset.delta))}
return}
if(e.target.id==='detail-budget'){closeDialog('#venue-dialog');openBudget()}
if(e.target.id==='save-notes'){if(activeVenue){$$('[data-field]',$('#venue-dialog')).forEach(saveField);renderGrid();notify('Notes saved on this device')}}});
// Touch users can swipe the featured photo while hover-only desktop arrows stay hidden.
let imageSwipe=null;
document.addEventListener('touchstart',e=>{
 const area=e.target.closest('.photo-browser');
 if(!area||e.touches.length!==1||e.target.closest('.heart,.inline-photo-link'))return;
 imageSwipe={id:area.dataset.id,x:e.touches[0].clientX,y:e.touches[0].clientY};
},{passive:true});
document.addEventListener('touchend',e=>{
 if(!imageSwipe||!e.changedTouches.length)return;
 const dx=e.changedTouches[0].clientX-imageSwipe.x;
 const dy=e.changedTouches[0].clientY-imageSwipe.y;
 if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.2)changeInlinePhoto(imageSwipe.id,dx<0?1:-1);
 imageSwipe=null;
},{passive:true});
document.addEventListener('touchcancel',()=>{imageSwipe=null},{passive:true});
document.addEventListener('change',e=>{
if(e.target.dataset.field){saveField(e.target);return}
if(e.target.id==='guest-select'){state.guestCount=+e.target.value;persist();renderGrid()}
if(['region-select','sort-select','fit-only'].includes(e.target.id))renderGrid();
if(e.target.closest('.budget-config'))budgetResults()});
document.addEventListener('input',e=>{if(e.target.id==='search')renderGrid();if(e.target.closest('.budget-config'))budgetResults()});
document.addEventListener('error',e=>{if(e.target?.tagName==='IMG')e.target.parentElement?.classList.add('photo-failed')},true);
$('#detail-close').onclick=()=>closeDialog('#venue-dialog');
$('#budget-close').onclick=()=>closeDialog('#budget-dialog');
$('#photo-close').onclick=()=>closeDialog('#photo-dialog');
$('#photo-prev').onclick=()=>advancePhoto(-1);
$('#photo-next').onclick=()=>advancePhoto(1);
document.addEventListener('keydown',e=>{
if(!$('#photo-dialog').open)return;
if(e.key==='ArrowLeft'){e.preventDefault();advancePhoto(-1)}
if(e.key==='ArrowRight'){e.preventDefault();advancePhoto(1)}
});
['#venue-dialog','#budget-dialog','#photo-dialog'].forEach(id=>$(id).addEventListener('click',e=>{if(e.target===e.currentTarget)e.currentTarget.close()}));
$('#budget-btn').onclick=openBudget;
$('#questions-btn').onclick=()=>openDetail('bull','questions');
$('#export-btn').onclick=exportNotes;
$('#compare-export').onclick=exportCSV;
$('#compare-all').onclick=()=>{compareMode='all';renderCompare()};
$('#compare-saved').onclick=()=>{compareMode='saved';renderCompare()};
$('#guest-select').value=String(state.guestCount||75);
renderGrid();renderShortlist();
if(['compare','map','shortlist','photographers'].includes(location.hash.slice(1)))go(location.hash.slice(1));
})();