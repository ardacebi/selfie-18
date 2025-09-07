# selfie-tw

## Questa è la repository del progetto di Tecnologie Web dell'anno 2024/2025 dell'Alma Mater Studiorum, Università di Bologna

### Authors: Alessandro D'Ambrosio (alessandro.dambrosi3@studio.unibo.it), Arda Çebi (arda.cebi@studio.unibo.it)

## Contributi:

- Tema Scuro e Chiaro: Arda Çebi
- Pagina di Login, Sign Up e Password dimenticata: Alessandro D'Ambrosio + Stilizzazione in CSS: Arda Çebi
- Backend: Alessandro D'Ambrosio (con contributi di Arda Çebi)
- Homepage: Arda Çebi (inclusa stilizzazione in CSS) + Sezione attività recenti: Alessandro D'Ambrosio (inclusa stilizzazione in CSS)
- Note: Alessandro D'Ambrosio (inclusa stilizzazione in CSS)
- Eventi: Alessandro D'Ambrosio (inclusa stilizzazione in CSS, ma con contributi di Arda Çebi)
- Attività: Alessandro D'Ambrosio (inclusa stilizzazione in CSS)
- Calendario (da visualizzazione annuale a settimanale): Alessandro D'Ambrosio + Stilizzazione in CSS: Arda Çebi
- Calendario (visualizzazione giornaliera): Arda Çebi (inclusa stilizzazione in CSS)
- Pomodoro: Arda Çebi (inclusa stilizzazione in CSS)
- Time Machine: Alessandro D'Ambrosio (inclusa stilizzazione in CSS)
- Sistema di Notifiche: Arda Çebi
- File di stilizzazione CSS-in-JS: Arda Çebi (con contributi di Alessandro D'Ambrosio)

## Scelte Implementative:

Questo progetto utilizza Node.js come backend, MongoDB come database, React come framework e Vite come build tool. L'applicazione è basata su un MERN Stack per gestire frontend, backend e database. La stilizzazione del sito è gestita da un file CSS-in-JS, per cui gli stili vengono definiti come oggetti Javascript, rendendo l'approccio modulare. Prettier è stato utilizzato per la formattazione del codice.
Il sito utilizza ssr rendering, utilizzando javascript solo nel momento in cui viene richiesto dall'utente. Una sola porta così gestisce contemporaneamente sia server che client.
La pagina di login e signup non richiede una vera mail (accetta anche email inventate, in modo da non dover creare varie mail usa e getta per la presentazione del progetto) e il nome utente deve essere diverso da tutti gli altri.
Il calendario ha quattro livelli di zoom: annuale, mensile, settimanale e giornaliero. Ha due visualizzazioni: Eventi e Attività. Gli eventi sono a loro volta divisi in due: basic (in viola) e recurring (in blu). Ogni evento può essere modificato cliccandoci sopra e può anche essere eliminato o scaricato come file .ics seguendo lo standard iCalendar.
Le Attività, invece, hanno vari colori in base al loro stato: quando sono passati meno della metà dei giorni dalla data di creazione dell'attività alla data di fine dell'attività, il colore è grigio (safe), quando si è oltre la metà il colore è giallo (risky), quando si è oltre i tre quarti o si ha superato la data di fine dell'attività (overdue), allore il colore è rosso (dangerous), infine quando si completa l'attività il colore diventa verde.
Il Pomodoro timer, permette lo studente di dividere il tempo di studio in intervalli con periodi di studio e pause. La durata delle sessioni di focus e delle pause possono essere personalizzata, e il timer supporta le funzioni di avvio, pausa e reset. L'interfaccia mostra lo stato corrente e l'avanzamento, e invia una notifica al cambio di fase.
Le Note hanno un titolo e possono avere dei tag (che possono essere utili per visualizzare nella pagina di anteprima solo certe note e rendere più veloce la ricerca), il testo è visualizzato utilizzando markdown.

## Utilizzo dell'IA generativa

L'IA generativa è stata utilizzata tramite GitHub copilot e solo come aiuto durante il bug fixing e per potenziali esempi di scelte implementative (per l'implementazione di ssr rendering e il download di file nello standard iCalendar), ma non è mai stata utilizzata per scrivere intere sezioni di codice da zero. Segnaliamo anche uso di IA generativa come aiuto in ricerche online per materiale di studio (funzionamento di un MERN stack e del plugin marked).

## Requirements

- Node.js 18.20.x (tested with 18.20.8) LTS
- npm 9–10

This repo includes an `.nvmrc` set to `v18.20.8`. If you use nvm:

```sh
nvm use
npm ci
```

If you see tarball/EBADARCH/ETIMEDOUT or EBADENGINE errors, align npm to a recent version and clear cache:

```sh
npm i -g npm@10
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

Use `npm run dev` to start the app in development (defaults to port 8000; set `NODE_PORT` in a `.env` file to change it).
Use `npm run build` to build the app and `npm run serve` to run the production build.
