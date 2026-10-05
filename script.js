const form=document.querySelector('#form'),rows=document.querySelector('#rows'),toast=document.querySelector('#toast'),count=document.querySelector('#count');let n=2;form.addEventListener('submit',e=>{e.preventDefault();const name=document.querySelector('#name').value,phone=document.querySelector('#phone').value,city=document.querySelector('#city').value,address=document.querySelector('#address').value;const row=document.createElement('tr');row.innerHTML=`<td>#TX-${10285+n-2}</td><td><b>${name}</b><small>${phone}</small></td><td>${city}</td><td>${address}</td><td><i>Prêt au départ</i></td>`;rows.prepend(row);n++;count.textContent=n;form.reset();toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),3500)});

const rateSearch=document.querySelector('#rateSearch'),rateResults=document.querySelector('#rateResults');
const publishedRates=[
    {price:20,cities:['Casablanca']},
    {price:35,cities:['Ain harrouda','Marrakech','El jadida','Chellalat - Mohammedia','Mediouna','Dar bouazza','Meknes','Zenata - ain harrouda','Rabat','Errahma','Mohammedia','Bouskoura','Berrechid','Tit mellil','Tanger','Nouaceur','Kenitra','Agadir']},
    {price:40,cities:['Moulay abdellah','Derouat','Dcheira','Boufakrane','Nador','Tetouan','Larache','Inezgane','Khouribga','Temara','Essaouira','Fes','Taza','Safi','Sale','Settat','Berkane','Beni mellal','Oujda']},
    {price:45,cities:['Tiznit','Tinghir','Tata','Taroudant','Sidi slimane','Taourirt','Taza','Dakhla','Chefchaouen','Guelmim','Errachidia','Ouarzazate','Khenifra','Ifrane','Midelt','Saidia','Al hoceima','Youssoufia']},
    {price:50,cities:['Gourrama','Mejjat - Chichaoua','Bhalil - Sefrou','Kassita - Driouch','Tamesmane - Driouch','Tounfite','Oulad Abbou','Oulad Said - Settat','Guisser','Imi Ouaddar']}
];
rateSearch.addEventListener('input',()=>{
    const query=rateSearch.value.trim().toLocaleLowerCase('fr');
    rateResults.replaceChildren();
    if(!query)return;
    const matches=publishedRates.flatMap(group=>group.cities.filter(city=>city.toLocaleLowerCase('fr').includes(query)).map(city=>({city,price:group.price})));
    const message=document.createElement('p');
    if(matches.length){message.textContent=matches.map(item=>`${item.city} : ${item.price} DH`).join('　·　');}
    else{message.textContent='Aucun résultat dans les destinations indexées ici. Consultez la grille officielle Tawsilex pour les autres villes.';}
    rateResults.append(message);
});

const settingsDialog=document.querySelector('#settingsDialog');
document.querySelectorAll('nav a[href^="#"]').forEach(link=>link.addEventListener('click',()=>{
    document.querySelectorAll('nav a').forEach(item=>item.classList.remove('active'));
    link.classList.add('active');
}));
document.querySelector('#settingsButton').addEventListener('click',()=>settingsDialog.showModal());
document.querySelector('#closeSettings').addEventListener('click',()=>settingsDialog.close());
settingsDialog.addEventListener('click',event=>{if(event.target===settingsDialog)settingsDialog.close()});
