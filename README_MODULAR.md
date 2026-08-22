# MeteoRisk modular frontend v1

The page is now split so new hazard groups can be added as blocks instead of rebuilding `index.html`.

## Structure

```text
web/
├─ index.html
├─ css/
│  └─ app.css
├─ js/
│  ├─ app.js
│  └─ hazards/
│     └─ temperature.js
└─ data/
```

`index.html` is the stable shell.
`app.js` contains shared map/timeline/availability/language logic.
`temperature.js` contains the Tmax module.

For the next product create another file, for example:

```text
js/hazards/heat_stress.js
```

That file should hold only the new hazard's:
- data paths/cache,
- loader,
- model/municipality overlay,
- categories,
- popup,
- impacts and recommendations.

Only a small routing/registration addition belongs in `app.js`.

## Local test

Copy these files/folders into the existing `web` directory while keeping the existing `data/` folder.

Then:

```cmd
cd C:\Users\ssovi\OneDrive\EarlyWarning\web
py -m http.server 8000
```

Open:

```text
http://localhost:8000/
```
