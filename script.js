const form = document.querySelector('#form');
const rows = document.querySelector('#rows');
const toast = document.querySelector('#toast');
const count = document.querySelector('#count');
const databaseGate = document.querySelector('#databaseGate');
const signInForm = document.querySelector('#signInForm');
const signInMessage = document.querySelector('#signInMessage');
const signOutButton = document.querySelector('#signOutButton');
const config = window.TAWSILEX_SUPABASE_CONFIG || {};
const databaseEnabled = Boolean(config.url && config.publishableKey);
let supabaseClient = null;
let nextDemoReference = 10285;
let toastTimer;

function notify(title, detail, isError = false) {
    toast.querySelector('b').textContent = title;
    toast.querySelector('small').textContent = detail;
    toast.style.background = isError ? '#8f3328' : '#164465';
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 4500);
}

function addShipmentRow(shipment, prepend = true) {
    const row = document.createElement('tr');
    const reference = document.createElement('td');
    reference.textContent = shipment.reference;
    const recipientCell = document.createElement('td');
    const recipientName = document.createElement('b');
    recipientName.textContent = shipment.recipient_name;
    const phone = document.createElement('small');
    phone.textContent = shipment.recipient_phone;
    recipientCell.append(recipientName, phone);
    const city = document.createElement('td');
    city.textContent = shipment.destination_city;
    const address = document.createElement('td');
    address.textContent = shipment.full_address;
    const statusCell = document.createElement('td');
    const status = document.createElement('i');
    status.textContent = shipment.status || 'Prêt au départ';
    statusCell.append(status);
    row.append(reference, recipientCell, city, address, statusCell);
    if (prepend) rows.prepend(row);
    else rows.append(row);
}

function setDatabaseAccess(isSignedIn) {
    databaseGate.hidden = isSignedIn;
    signOutButton.hidden = !isSignedIn;
}

async function loadShipments() {
    rows.replaceChildren();
    count.textContent = '0';
    const { data, error } = await supabaseClient
        .from('shipments')
        .select('id, reference, recipient_name, recipient_phone, destination_city, full_address, status, created_at')
        .order('created_at', { ascending: false })
        .limit(100);
    if (error) {
        notify('Chargement impossible', 'Vérifiez les règles d’accès de la base de données.', true);
        return;
    }
    data.forEach(shipment => addShipmentRow(shipment, false));
    count.textContent = String(data.length);
}

if (databaseEnabled) {
    if (!window.supabase?.createClient) {
        databaseGate.hidden = false;
        signInForm.hidden = true;
        signInMessage.textContent = 'Le service Supabase ne s’est pas chargé. Rechargez la page ou vérifiez votre connexion internet.';
    } else {
        supabaseClient = window.supabase.createClient(config.url, config.publishableKey);
        signInForm.addEventListener('submit', async event => {
            event.preventDefault();
            signInMessage.textContent = 'Connexion en cours…';
            const button = signInForm.querySelector('button[type="submit"]');
            button.disabled = true;
            const { error } = await supabaseClient.auth.signInWithPassword({
                email: document.querySelector('#agentEmail').value.trim(),
                password: document.querySelector('#agentPassword').value
            });
            button.disabled = false;
            if (error) signInMessage.textContent = 'Connexion refusée. Vérifiez votre e-mail et votre mot de passe.';
            else {
                signInForm.reset();
                signInMessage.textContent = '';
            }
        });
        signOutButton.addEventListener('click', async () => {
            const { error } = await supabaseClient.auth.signOut();
            if (error) notify('Déconnexion impossible', 'Réessayez dans un instant.', true);
        });
        supabaseClient.auth.onAuthStateChange((_event, session) => {
            setDatabaseAccess(Boolean(session));
            if (session) queueMicrotask(() => loadShipments());
            else {
                rows.replaceChildren();
                count.textContent = '0';
            }
        });
        supabaseClient.auth.getSession().then(({ data, error }) => {
            if (error) {
                signInMessage.textContent = 'Impossible de vérifier la session. Rechargez la page.';
                return;
            }
            setDatabaseAccess(Boolean(data.session));
            if (data.session) loadShipments();
            else rows.replaceChildren();
        });
    }
}

form.addEventListener('submit', async event => {
    event.preventDefault();
    const shipment = {
        recipient_name: document.querySelector('#name').value.trim(),
        recipient_phone: document.querySelector('#phone').value.trim(),
        destination_city: document.querySelector('#city').value,
        full_address: document.querySelector('#address').value.trim(),
        package_type: document.querySelector('#packageType').value,
        package_weight: document.querySelector('#packageWeight').value,
        status: 'Prêt au départ'
    };

    if (databaseEnabled) {
        if (!supabaseClient) return;
        const { data: sessionData } = await supabaseClient.auth.getSession();
        if (!sessionData.session) {
            notify('Connexion requise', 'Connectez-vous avant d’ajouter une expédition.', true);
            return;
        }
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        const { data, error } = await supabaseClient
            .from('shipments')
            .insert(shipment)
            .select('id, reference, recipient_name, recipient_phone, destination_city, full_address, status, created_at')
            .single();
        submitButton.disabled = false;
        if (error) {
            notify('Enregistrement impossible', 'Vérifiez la connexion et les droits de la base.', true);
            return;
        }
        addShipmentRow(data);
        count.textContent = String(Number(count.textContent) + 1);
        form.reset();
        notify('Expédition enregistrée', 'Les informations ont été sauvegardées dans la base.');
        return;
    }

    shipment.reference = `#TX-${nextDemoReference++}`;
    addShipmentRow(shipment);
    count.textContent = String(Number(count.textContent) + 1);
    form.reset();
    notify('Mode démonstration', 'Ajoutez la configuration Supabase pour sauvegarder les données.');
});

const rateSearch = document.querySelector('#rateSearch');
const rateResults = document.querySelector('#rateResults');
const publishedRates = [
    { price: 20, cities: ['Casablanca'] },
    { price: 35, cities: ['Ain harrouda','Marrakech','El jadida','Chellalat - Mohammedia','Mediouna','Dar bouazza','Meknes','Zenata - ain harrouda','Rabat','Errahma','Mohammedia','Bouskoura','Berrechid','Tit mellil','Tanger','Nouaceur','Kenitra','Agadir'] },
    { price: 40, cities: ['Moulay abdellah','Derouat','Dcheira','Boufakrane','Nador','Tetouan','Larache','Inezgane','Khouribga','Temara','Essaouira','Fes','Taza','Safi','Sale','Settat','Berkane','Beni mellal','Oujda'] },
    { price: 45, cities: ['Tiznit','Tinghir','Tata','Taroudant','Sidi slimane','Taourirt','Taza','Dakhla','Chefchaouen','Guelmim','Errachidia','Ouarzazate','Khenifra','Ifrane','Midelt','Saidia','Al hoceima','Youssoufia'] },
    { price: 50, cities: ['Gourrama','Mejjat - Chichaoua','Bhalil - Sefrou','Kassita - Driouch','Tamesmane - Driouch','Tounfite','Oulad Abbou','Oulad Said - Settat','Guisser','Imi Ouaddar'] }
];
rateSearch.addEventListener('input', () => {
    const query = rateSearch.value.trim().toLocaleLowerCase('fr');
    rateResults.replaceChildren();
    if (!query) return;
    const matches = publishedRates.flatMap(group => group.cities
        .filter(city => city.toLocaleLowerCase('fr').includes(query))
        .map(city => ({ city, price: group.price })));
    const message = document.createElement('p');
    message.textContent = matches.length
        ? matches.map(item => `${item.city} : ${item.price} DH`).join('　·　')
        : 'Aucun résultat dans les destinations indexées ici. Consultez la grille officielle Tawsilex pour les autres villes.';
    rateResults.append(message);
});

const settingsDialog = document.querySelector('#settingsDialog');
document.querySelectorAll('nav a[href^="#"]').forEach(link => link.addEventListener('click', () => {
    document.querySelectorAll('nav a').forEach(item => item.classList.remove('active'));
    link.classList.add('active');
}));
document.querySelector('#settingsButton').addEventListener('click', () => settingsDialog.showModal());
document.querySelector('#closeSettings').addEventListener('click', () => settingsDialog.close());
settingsDialog.addEventListener('click', event => { if (event.target === settingsDialog) settingsDialog.close(); });
