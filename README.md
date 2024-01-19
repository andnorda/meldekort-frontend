# Meldekort
Meldekort er et webgrensesnitt for brukere til å fylle ut og sende inn meldekort til NAV.  
Meldekort tilbyr påloggende arbeidssøkere å se sin meldekorthistorikk, samt å fylle ut og sende inn meldekort.

## Dokumentasjon
https://navikt.github.io/dp-dokumentasjon/innbyggerflate/losninger/meldeplikt  
Om Meldekort journalføring: https://confluence.adeo.no/pages/viewpage.action?pageId=431009242

## Tekster
Denne appen har en mekanisme for tekstversjonering. Dvs. appen viser gjeldende versjon av tekstene som var gyldige i
begynnelsen av meldeperioden til aktivt meldekort. Hvis meldekort ikke er valgt, viser appen den nyeste versjonen av
tekstene. Tekstene er lagret i en DB og derfor må vi gå gjennom meldekort-api og meldekortservice for å nå dem.

For å endre tekstene (eller opprette nye versjoner), må man endre fil R__recreate_texts.sql i meldekort-api og deploye
meldekort-api på nytt. Dette gir mulighet for å teste endringer i DEV/QA først og hindrer direkte endringer i prod DB.

OBS! Meldekort-frontend har også cache for tekstene (30 minutter), dvs. appen skal ikke prøve å hente tekstene med samme
språk og gyldighetstid på nytt i løpet av 30 minutter.

## Henvendelser
Spørsmål knyttet til koden eller prosjekt rettes til:

* Igor Shuliakov, igor.shuliakov@nav.no
* Mona Kjeldsrud, mona.kjeldsrud@nav.no

## For NAV-ansatte
Interne henvendelser kan sendes via Slack i kanalen #team-meldeplikt / #meldekort

## For utviklere
Appen er basert på [Remix](https://remix.run/docs)

For å starte appen lokalt:
0. Strart [meldekort-api](https://github.com/navikt/meldekort-api) lokalt
1. Kopier `.env.example` og rename til `.env`.
1. `npm install`
3. `npm run dev`
4. Åpen http://localhost:8080/send-meldekort i nettlseren

OBS! `npm run dev` starter serveren i [manual mode](https://remix.run/docs/en/main/guides/manual-mode), dvs. man må
restarte serveren hver gang man gjør endringer i server.ts (men dette skjer ikke veldig ofte)
