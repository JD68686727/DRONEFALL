# DRONEFALL — First Contact

Der Vertical Slice enthält zehn feste Wellen im S-Kurven-Korridor. Verteidige das HQ mit MG-Türmen, Raketenwerfern und Laserkanonen gegen Scouts und Crawler. Auf Touchgeräten zeigt das erste Tippen die Reichweite. Tippe erneut auf dieselbe Stelle, um zu bauen.

## Lokal entwickeln

Im Projektordner mit Node.js 22.12 oder neuer (mit Vite 7 kompatibel):

```sh
npm ci
npm run dev
npm run build
npm run preview
```

Der Produktionsbuild in `dist/` ist statisch hostbar. Der Slice läuft ohne CrazyGames-SDK.

## Ausbau

- **Rivergate:** Ein Fluss sperrt den direkten Weg zum HQ. Eine einzelne Brücke bündelt die Route. Baupositionen an den Brückenköpfen begünstigen Flächenschaden, während Uferpositionen mehr Reichweite erfordern.
- **O-Ring:** Die Route umrundet ein zentrales Areal und biegt anschließend zum HQ ab. Innenpositionen decken mehrere Ringabschnitte ab, Außenpositionen einzelne Kurven und den Auslauf.
- **Kampagne:** 60 feste Wellen mit gepanzerten, abgeschirmten und fliegenden Gegnern. Der Sieg in Welle 60 setzt einen zerstörten Boss und ein intaktes HQ voraus. Weitere Türme, Upgrades und Verkauf werden mit der Wirtschaft abgestimmt.
- **Freeplay:** Nach dem Kampagnensieg ab Welle 61 mit bestehenden Türmen, Credits und HQ-Integrität weiterspielen. Gegnerwerte und Zusammensetzung steigern den Druck exponentiell. Ein Spawn-Limit begrenzt die Zahl gleichzeitig aktiver Gegner. Der Modus endet mit dem Verlust des HQ.
