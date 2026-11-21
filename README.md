# Julekalender
En julekalender laget på vegne av tverrfaglig uke for Bleiker vgs. Man får spørsmål tildelt til hver av de 24 lukene man da svarer på for å delta i en trekning. Vinnerene av trekningen vinner premier skolen tildeler. Trekningen for premien skjer hver dag i lunsjen og navnet til brukeren blir ropt opp. Man logger inn med afk posten og navnet sitt for å kunne bli identifisert og få en premie. 


● Funksjonalitet: Hvilke funksjoner har løsningen for brukere og administratorer?
Brukeren har logg inn funksjon, registrer funksjon og har muligheten til å åpne luker hvor de svarer på spørsmål for å bli med i premie trekningen. Admin har funksjonen til å gå inn i et eget admin panel/dashboard hvor de kan rette svar, trekke vinner, se deltakere og se antall svar.

● Teknologier: Hvilke teknologier, rammeverk og verktøy har du brukt?
For dette prosjektet har jeg brukt mongodb, vs code, github, node, express, Objects, jwt og cookies, proxmox, terminal, claude, internett, Monica, youtube.

● Installasjon: Hvordan kloner og installerer man prosjektet, og hvordan installeres nødvendige dependencies?

##Installajson
u trenger [Node.js](https://nodejs.org) (v18 eller nyere) og en kjørende MongoDB-instans (lokalt eller MongoDB Atlas)
 
##klon prosjektet
git clone <repo-url>
cd Julekalender

##Pakker
npm init -y
npm install express ejs mongoose dotenv argon2 jsonwebtoken cookie-parser 

Brukes for:

express = websrver og ruting
ejs = for html sider
mongoose = Koble til mongodb server
dotenv = miljøvariabler fre .env
argon2 = hashing av passord til admin (hvis det lages)
jsonwebtoken = huske inloggingen til brukeren på en sikker måte
cookie-parser = for cookies

● Konfigurasjon: Hvilke miljøvariabler og innstillinger må være på plass?

Man må oprette en .env fil og legge til:
dotenv
PORT=4000
MONGODB_URI=mongodb://localhost:27017/Julekalender
JWT_SECRET=Tilfeldig passord

Man kan generere JWT secret_key ved å bruke lastpass

● Database: Hvordan er databasen organisert, og hvilke data lagres?

Prosjektet bruker mongodb og er organisert i:
answers = Innholder luke id, bruker, om man svarte riktig og om det er vurdert som admin.
users = Innholder navn, afk bruker og rolle.
quizzes = Er knyttet til en seed.js fil med alle spørmålene for lukene med en id som hentes utifra url iden på lukene.
winners = Innholder luke id, bruker, svar

● Oppstart: Hvordan starter man applikasjonen i utviklingsmiljøet?

Kjør prosjektet lokalt og sjekk om mongoDB er koblet til og at .env er oprettet

start:
nodemon app.js

og gå inn i local host 4000



● Utrulling: Hvordan settes løsningen opp på Linux-serveren?

Installer Node.js og MongoDB:
sudo apt update
sudo apt install -y nodejs npm git nginx

følg ofisielle guide https://www.mongodb.com/docs/v8.0/tutorial/install-mongodb-on-ubuntu/


Hent prosjekte fra git:
git clone <repo-url> /var/www/julekalender
cd /var/www/julekalender
npm install --omit=dev

Lag en .env med PORT, MONGODB_URI og en JWT_SECRET

Kjør appen med pm2 for at den starter på nytt etter krasj eller omstart:
sudo npm install -g pm2
pm2 start index.js --name julekalender
pm2 save
pm2 startup

Sette opp Nginx som proxy:
   server {
       listen 80;
       server_name julekalender.eksempel.no;

       location / {
           proxy_pass http://127.0.0.1:4000;
           proxy_set_header Host $host;
           proxy_set_header X-Forwarded-For $remote_addr;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }

Aktiver https:
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d julekalender.eksempel.no




● Brukerveiledning: Hvordan bruker man julekalenderen og eventuelle
administrasjonsfunksjoner?

## Brukerveiledning

## Deltaker

1. Gå til Lag en bruker og registrer deg med en @afk.no adresse og navnet ditt. Neste gang logger du inn med bare eposten.
2. På forsiden ser du dagens dato, hvor mange luker du har åpnet, og alle 24 luker.
3. Bare dagens luke kan åpnes. Tidligere luker kan ikke åpnes i ettertid, og fremtidige luker er låst.
4. Trykk Åpne dagens luke, svar og send inn. Spørsmålene kan være flervalg, fritekst eller en video du skal svare på.
5. Du kan svare én gang per luke. Åpnede luker vises som Åpnet .
6. Kalenderen åpner 1. desember og går til 24. desember og går alle måneder.

## Administrator

Endre rolle til admin i mongodb

Oversikt /admin: antall svar, riktige svar, ikke vurderte svar og deltakere for valgt luke, samt antall svar per luke.
Svar /svar: alle fritekstsvar med navn, e-post, svar, fasit, dato og status.
Filtrer på luke og status (Riktig, Galt, Ikke vurdert), og søk på navn, e-post eller svar.
Sorter på dato (nyeste eller eldste), riktige først, gale først eller ikke vurdert først.
Vurder svar med riktig eller galt. Fritekst kan ha andre skrivemåter enn fasiten, så gå gjennom dem før trekning.
Trekning /trekning: velg luke og trykk Trekk vinner. En tilfeldig deltaker med riktig svar velges og lagres permanent. Luker med trukket vinner er merket med ✓.
Spørsmål /sporsmal: oversikt over spørsmålene.


● Videre utvikling: Hvilke funksjoner eller forbedringer kunne vært aktuelle å
implementere senere?

Legge til en admin passord pålogging. 
Epost varsling med nodemailer om å minne på om å åpne luke.
Kunne redigere spørsmål som admin


