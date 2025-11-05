import React, { useMemo, useState } from "react";

export default function ScraperImmo() {
    const [departement, setDepartement] = useState("Rhône");
    const [site, setSite] = useState("seloger");
    const [prixMin, setPrixMin] = useState(20000);
    const [prixMax, setPrixMax] = useState(800000);
    const [piecesMin, setPiecesMin] = useState(1);
    const [piecesMax, setPiecesMax] = useState(5);
    const [surfaceMin, setSurfaceMin] = useState(20);
    const [terrain, setTerrain] = useState("indifférent");
    const [chauffage, setChauffage] = useState("indifférent");
    const [travaux, setTravaux] = useState("indifférent");

    const [annonces, setAnnonces] = useState([]);
    const [median, setMedian] = useState(null);
    const [loading, setLoading] = useState(false);
    const [tri, setTri] = useState({ key: "viabilite", dir: "desc" });
    const [error, setError] = useState(null);

    const handleScrape = async () => {
        setLoading(true);
        setAnnonces([]);
        setError(null);

        const url = `/api/recherche?departement=${encodeURIComponent(departement)}&site=${site}&prixMin=${prixMin}&prixMax=${prixMax}&piecesMin=${piecesMin}&piecesMax=${piecesMax}&surfaceMin=${surfaceMin}&terrain=${terrain}&chauffage=${chauffage}&travaux=${travaux}`;

        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error("API indisponible ou quota atteint");
            const data = await res.json();
            setAnnonces(data.annonces || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const sorted = useMemo(() => {
        const arr = [...annonces];
        const { key, dir } = tri;
        const mul = dir === "asc" ? 1 : -1;
        arr.sort((a, b) => {
            if (typeof a[key] === "string") return a[key].localeCompare(b[key]) * mul;
            return (a[key] - b[key]) * mul;
        });
        return arr;
    }, [annonces, tri]);

    const header = (label, key) => (
        <th
            style={th}
            onClick={() =>
                setTri((t) => ({
                    key,
                    dir: t.key === key && t.dir === "desc" ? "asc" : "desc",
                }))
            }
        >
            {label} {tri.key === key ? (tri.dir === "asc" ? "▲" : "▼") : ""}
        </th>
    );

    const DEPARTEMENTS = [
        "Ain", "Aisne", "Allier", "Alpes-de-Haute-Provence", "Hautes-Alpes", "Alpes-Maritimes",
        "Ardèche", "Ardennes", "Ariège", "Aube", "Aude", "Aveyron", "Bas-Rhin", "Haut-Rhin",
        "Bouches-du-Rhône", "Calvados", "Cantal", "Charente", "Charente-Maritime", "Cher",
        "Corrèze", "Corse-du-Sud", "Haute-Corse", "Côte-d'Or", "Côtes-d'Armor", "Creuse",
        "Deux-Sèvres", "Dordogne", "Doubs", "Drôme", "Eure", "Eure-et-Loir", "Finistère",
        "Gard", "Haute-Garonne", "Gers", "Gironde", "Hérault", "Ille-et-Vilaine", "Indre",
        "Indre-et-Loire", "Isère", "Jura", "Landes", "Loir-et-Cher", "Loire", "Haute-Loire",
        "Loire-Atlantique", "Loiret", "Lot", "Lot-et-Garonne", "Lozère", "Maine-et-Loire",
        "Manche", "Marne", "Haute-Marne", "Mayenne", "Meurthe-et-Moselle", "Meuse",
        "Morbihan", "Moselle", "Nièvre", "Nord", "Oise", "Orne", "Pas-de-Calais", "Puy-de-Dôme",
        "Pyrénées-Atlantiques", "Hautes-Pyrénées", "Pyrénées-Orientales", "Rhône",
        "Haute-Saône", "Saône-et-Loire", "Sarthe", "Savoie", "Haute-Savoie", "Paris",
        "Seine-Maritime", "Seine-et-Marne", "Yvelines", "Somme", "Tarn", "Tarn-et-Garonne",
        "Var", "Vaucluse", "Vendée", "Vienne", "Haute-Vienne", "Vosges", "Yonne",
        "Territoire de Belfort", "Essonne", "Hauts-de-Seine", "Seine-Saint-Denis",
        "Val-de-Marne", "Val-d'Oise"
    ];

    const SITES = [
        { label: "SeLoger", value: "seloger" },
        { label: "LeBonCoin", value: "leboncoin" },
        { label: "BienIci", value: "bienici" },
        { label: "PAP", value: "pap" },
        { label: "Logic-Immo", value: "logic-immo" }
    ];

    return (
        <div style={page}>
            <h1 style={title}>🏡 Scraper Immo Pro — France</h1>

            {/* Ligne 1 */}
            <div style={row}>
                <select value={departement} onChange={(e) => setDepartement(e.target.value)} style={select}>
                    {DEPARTEMENTS.map((dep) => (
                        <option key={dep} value={dep}>{dep}</option>
                    ))}
                </select>

                <select value={site} onChange={(e) => setSite(e.target.value)} style={select}>
                    {SITES.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                </select>

                <input type="number" value={prixMin} onChange={(e) => setPrixMin(e.target.value)} style={input} placeholder="Prix min" />
                <input type="number" value={prixMax} onChange={(e) => setPrixMax(e.target.value)} style={input} placeholder="Prix max" />
            </div>

            {/* Ligne 2 */}
            <div style={row}>
                <input type="number" value={piecesMin} onChange={(e) => setPiecesMin(e.target.value)} style={input} placeholder="Pièces min" />
                <input type="number" value={piecesMax} onChange={(e) => setPiecesMax(e.target.value)} style={input} placeholder="Pièces max" />
                <input type="number" value={surfaceMin} onChange={(e) => setSurfaceMin(e.target.value)} style={input} placeholder="Surface min m²" />

                <select value={terrain} onChange={(e) => setTerrain(e.target.value)} style={select}>
                    <option value="indifférent">Terrain ?</option>
                    <option value="oui">Oui</option>
                    <option value="non">Non</option>
                </select>

                <select value={chauffage} onChange={(e) => setChauffage(e.target.value)} style={select}>
                    <option value="indifférent">Chauffage</option>
                    <option value="gaz">Gaz</option>
                    <option value="elec">Électrique</option>
                    <option value="bois">Bois</option>
                    <option value="pac">Pompe à chaleur</option>
                </select>

                <select value={travaux} onChange={(e) => setTravaux(e.target.value)} style={select}>
                    <option value="indifférent">Travaux</option>
                    <option value="oui">Oui</option>
                    <option value="non">Non</option>
                </select>
            </div>

            <div style={{ textAlign: "center", marginTop: 15 }}>
                <button onClick={handleScrape} disabled={loading} style={btnRun}>
                    {loading ? "🔄 Analyse en cours..."
