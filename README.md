# Spiritual Light

Annetts täglicher Begleiter fürs Android-Smartphone – eine installierbare Web-App (PWA) im hellen Boho-Stil.

## Rubriken

| Rubrik | Inhalt | Quelle |
| --- | --- | --- |
| **Spruch des Tages** | jeden Tag ein anderer spiritueller Spruch | `site/content.js` |
| **Tipp des Tages** | jeden Tag ein kleiner Impuls für Achtsamkeit und Wohlbefinden | `site/content.js` |
| **Gericht des Tages** | vegetarisches Rezept mit spiritueller Bedeutung; an Jahreskreisfesten, Vollmond und Neumond das passende Gericht | `site/content.js` |
| **Biowetter** | 8 Kategorien für Jena: Kreislauf, Kopf & Migräne, Gelenke & Rheuma, Atemwege, Schlaf, Stimmung, Pollen, Sonne & Haut – dazu die Mondphase | live von [Open-Meteo](https://open-meteo.com/) |
| **News** | Deutschland (newslichter, SEIN, Yoga Aktuell, Spirit Online) und Jena & Thüringen | RSS, täglich aktualisiert |
| **Neue Bücher** | Neuerscheinungen zu Spiritualität, Esoterik und Achtsamkeit, mit Cover | Deutsche Nationalbibliothek, täglich aktualisiert |

Das Biowetter wird in der App aus aktuellen Wetter-, Luft- und Pollendaten berechnet. Es ist eine Orientierung und kein ärztlicher Rat.

## Aktualisierung

- **Wetter und Biowetter:** beim Öffnen der App und stündlich, solange sie offen ist. Ohne Netz zeigt die App den letzten Stand vom selben Tag.
- **Spruch, Tipp und Gericht:** wechseln um Mitternacht.
- **News, Bücher und Cover:** der Workflow holt sie jeden Morgen gegen 4–5 Uhr, speichert den neuen Stand in `site/data` und veröffentlicht die App. Die Cover landen nur in der veröffentlichten Seite (`site/covers` ist nicht im Repository).

## Veröffentlichen (einmalig)

1. Diesen Stand in den Branch `main` übernehmen.
2. Auf GitHub: **Settings → Pages → Build and deployment → Source: „GitHub Actions“** wählen.
3. Der Workflow „App aktualisieren und veröffentlichen“ läuft danach bei jeder Änderung und jeden Morgen automatisch. Die Adresse der App steht anschließend unter **Settings → Pages**.

## Auf dem Handy installieren

Die Adresse in Chrome auf dem Android-Handy öffnen → Menü (⋮) → **„App installieren“** bzw. **„Zum Startbildschirm hinzufügen“**. Danach startet Spiritual Light wie eine normale App mit eigenem Symbol und funktioniert auch ohne Netz mit dem zuletzt geladenen Stand.

## Anpassen

- **Sprüche und Tipps:** in `site/content.js` Zeilen ergänzen oder ändern.
- **News-Quellen und Suchbegriffe:** oben in `scripts/update-content.mjs`.
- **Name und Ort:** `NAME` und `PLACE` oben in `site/app.js`.
- **Farben:** die Variablen am Anfang von `site/styles.css`.

## Lokal ausprobieren

```bash
node scripts/update-content.mjs      # News und Bücher neu holen
cd site && python3 -m http.server 8000   # dann http://localhost:8000 öffnen
```

Die Schriften Cormorant Garamond und Nunito liegen unter der SIL Open Font License in `site/fonts`.
