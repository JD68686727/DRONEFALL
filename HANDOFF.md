# Übergabe — DRONEFALL: First Contact

Stand vom 18. November 2026

## Fertig

- Spielbarer Vertical Slice im S-Kurven-Korridor mit zehn festen Wellen, Spawn, Sperrzonen und HQ.
- Drei platzierbare Türme (MG, Raketenwerfer, Laser) und zwei Gegnertypen (Scout, Crawler). Credits aus Abschüssen und Wellenabschlüssen, HQ-Schaden durch durchkommende Gegner.
- Maus und Touch mit Reichweitenvorschau, Kaufprüfung, Pause, 1×/2×/4×, Neustart sowie Sieg- und Niederlagenanzeige.
- TypeScript, Canvas 2D und Vite. `src/data.ts` enthält Wellen und Werte, `src/game.ts` die Simulation, `src/render.ts` die Grafik und `src/main.ts` Bedienung und HUD.

- GitHub-Actions-Workflow für statische Testbuilds auf GitHub Pages bei Pushes auf `main` und manuell.

## Start und Prüfung

Im Projektordner `npm ci` und `npm run dev` ausführen. `npm run build` prüft TypeScript und erzeugt den statischen Build in `dist/`. `npm run preview` startet dessen lokale Vorschau.

Der Produktionsbuild wurde in Chromium geprüft. Der Testlauf umfasste alle zehn Wellen bis zum Sieg mit beschleunigter Testzeit, HQ-Verlust, ungültige Käufe, Pause/Fortsetzen, Neustart und Touch-Platzierung bei 390 px Viewportbreite. Zwei Aufstellungen gewannen in der Simulation.

## GitHub Pages

Der Produktionsbuild wurde mit `npm ci` und `npm run build` geprüft. Die Pages-Einstellung und das erste Deployment sind aus der Cloud-Umgebung nicht verifizierbar. Die einmalige Aktivierung und der manuelle Start stehen in [README.md](README.md).

## Offen

1. Kampagne auf 60 feste Wellen ausbauen. Gepanzerte, abgeschirmte und fliegende Gegner sowie den Boss in Welle 60 ergänzen. Den Sieg an Boss-Zerstörung, Wellenabschluss und intaktes HQ binden.
2. Freeplay ab Welle 61 mit übernommenen Türmen, Credits und HQ-Integrität, exponentieller Schwierigkeit und Spawn-Limit implementieren.
3. Turm-Upgrades, Verkauf und weitere Turmrollen mit der Wirtschaft abstimmen.
4. Rivergate und O-Ring umsetzen. Die Kartenkonzepte stehen in [README.md](README.md).
5. CrazyGames-SDK integrieren und Plattformverhalten im Embed prüfen. Der Slice läuft eigenständig im Browser.
