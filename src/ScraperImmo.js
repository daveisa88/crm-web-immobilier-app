
import { useMemo, useState } from 'react';

const DEPARTEMENTS = Object.keys({
  "Ain":1,"Aisne":1,"Allier":1,"Alpes-de-Haute-Provence":1,"Hautes-Alpes":1,"Alpes-Maritimes":1,
  "Ardèche":1,"Ardennes":1,"Ariège":1,"Aube":1,"Aude":1,"Aveyron":1,"Bas-Rhin":1,"Haut-Rhin":1,
  "Bouches-du-Rhône":1,"Calvados":1,"Cantal":1,"Charente":1,"Charente-Maritime":1,"Cher":1,
  "Corrèze":1,"Corse-du-Sud":1,"Haute-Corse":1,"Côte-d'Or":1,"Côtes-d'Armor":1,"Creuse":1,
  "Deux-Sèvres":1,"Dordogne":1,"Doubs":1,"Drôme":1,"Eure":1,"Eure-et-Loir":1,"Finistère":1,
  "Gard":1,"Haute-Garonne":1,"Gers":1,"Gironde":1,"Hérault":1,"Ille-et-Vilaine":1,"Indre":1,
  "Indre-et-Loire":1,"Isère":1,"Jura":1,"Landes":1,"Loir-et-Cher":1,"Loire":1,"Haute-Loire":1,
  "Loire-Atlantique":1,"Loiret":1,"Lot":1,"Lot-et-Garonne":1,"Lozère":1,"Maine-et-Loire":1,
  "Manche":1,"Marne":1,"Haute-Marne":1,"Mayenne":1,"Meurthe-et-Moselle":1,"Meuse":1,
  "Morbihan":1,"Moselle":1,"Nièvre":1,"Nord":1,"Oise":1,"Orne":1,"Pas-de-Calais":1,"Puy-de-Dôme":1,
  "Pyrénées-Atlantiques":1,"Hautes-Pyrénées":1,"Pyrénées-Orientales":1,"Rhône":1,
  "Haute-Saône":1,"Saône-et-Loire":1,"Sarthe":1,"Savoie":1,"Haute-Savoie":1,"Paris":1,
  "Seine-Maritime":1,"Seine-et-Marne":1,"Yvelines":1,"Somme":1,"Tarn":1,"Tarn-et-Garonne":1,
  "Var":1,"Vaucluse":1,"Vendée":1,"Vienne":1,"Haute-Vienne":1,"Vosges":1,"Yonne":1,
  "Territoire de Belfort":1,"Essonne":1,"Hauts-de-Seine":1,"Seine-Saint-Denis":1,
  "Val-de-Marne":1,"Val-d'Oise":1
});

export default function Home() {
  const [departement, setDepartement] = useState('Rhône');
  const [provider, setProvider] = useState('seloger');
  const [type, setType] = useState('vente');
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');
  const [piecesMin, setPiecesMin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [sort, setSort] = useState({ key: 'viabilite', dir: 'desc' });

  const run = async () => {
    setError(null); setLoading(true); setData(null);
    const params = new URLSearchParams({ departement, provider, type });
    if (min) params.set('min', String(min));
    if (max) params.set('max', String(max));
    if (piecesMin) params.set('piecesMin', String(piecesMin));
    try {
      const r = await fetch(`/api/scrape?${params.toString()}`);
      if (!r.ok) throw new Error('API indisponible');
      const j = await r.json();
      setData(j);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const annonces = useMemo(() => {
    if (!data?.annonces) return [];
    const arr = [...data.annonces];
    const mul = sort.dir === 'asc' ? 1 : -1;
    arr.sort((a,b) => {
      const av = a[sort.key]; const bv = b[sort.key];
      if (typeof av === 'string') return av.localeCompare(bv) * mul;
      return ((av ?? -Infinity) - (bv ?? -Infinity)) * mul;
    });
    return arr;
  }, [data, sort]);

  const H = (label, key) => (
    <th style={th} onClick={() => setSort(s => ({ key, dir: s.key===key && s.dir==='desc' ? 'asc':'desc' }))}>
      {label} {sort.key===key ? (sort.dir==='asc' ? '▲':'▼') : ''}
    </th>
  );

  return (
    <div style={page}>
      <h1 style={title}>🏡 Scraper Immo Pro — France</h1>

      <div style={filters}>
        <select value={departement} onChange={e=>setDepartement(e.target.value)} style={select}>
          {DEPARTEMENTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={provider} onChange={e=>setProvider(e.target.value)} style={select}>
          <option value="seloger">SeLoger (via Apify)</option>
          <option value="bienici">Bien'ici (via Apify)</option>
        </select>
        <select value={type} onChange={e=>setType(e.target.value)} style={select}>
          <option value="vente">Vente</option>
          <option value="location">Location</option>
        </select>
        <input placeholder="Min €" value={min} onChange={e=>setMin(e.target.value)} style={input} />
        <input placeholder="Max €" value={max} onChange={e=>setMax(e.target.value)} style={input} />
        <input placeholder="Min pces" value={piecesMin} onChange={e=>setPiecesMin(e.target.value)} style={input} />
        <button onClick={run} disabled={loading} style={btnRun}>{loading? '🔄 Chargement...' : '🚀 Lancer'}</button>
      </div>

      {data?.medianRef && (
        <p style={medianBox}>📊 Prix médian DVF — <b>{data.departement}</b> : <b>{data.medianRef.toLocaleString()} €/m²</b></p>
      )}

      {error && <p style={{ color:'#ff7675', textAlign:'center' }}>❌ {error}</p>}

      {annonces.length>0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={table}>
            <thead style={thead}>
              <tr>
                {H('Titre','titre')}
                {H('Ville','ville')}
                {H('Prix','prix')}
                {H('Surface (m²)','surface')}
                {H('€/m²','prixM2')}
                {H('Viabilité','viabilite')}
                <th style={th}>Lien</th>
                <th style={th}>Source</th>
              </tr>
            </thead>
            <tbody>
              {annonces.map((a,i)=>(
                <tr key={i} style={{ background: i%2? '#2b3f66': '#334c7a' }}>
                  <td style={td}>{a.titre}</td>
                  <td style={td}>{a.ville}</td>
                  <td style={td}>{a.prix?.toLocaleString?.() || '—'}</td>
                  <td style={td}>{a.surface || '—'}</td>
                  <td style={td}>{a.prixM2?.toLocaleString?.() || '—'}</td>
                  <td style={{...td, fontWeight:'bold', color: a.viabilite>=8? '#2ecc71': a.viabilite>=5? '#f1c40f':'#e74c3c'}}>{a.viabilite ?? '—'}</td>
                  <td style={td}><a href={a.lien} target="_blank" rel="noreferrer" style={link}>🔗 Voir</a></td>
                  <td style={{...td, opacity: .8}}>{a.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && annonces.length===0 && (
        <p style={{ textAlign:'center', opacity:.8 }}>Choisissez un département puis cliquez sur "🚀 Lancer".</p>
      )}
    </div>
  );
}

// ---- Styles ----
const page = { background:'#243b55', color:'#fff', minHeight:'100vh', padding:'32px', fontFamily:'Segoe UI, system-ui'};
const title = { textAlign:'center', marginBottom:16, color:'#e91e63' };
const filters = { display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:12, marginBottom:16 };
const select = { padding:'10px 12px', borderRadius:8, border:'none', background:'#4fa3f7', color:'#fff' };
const input = { padding:'10px 12px', borderRadius:8, border:'1px solid #335' };
const btnRun = { padding:'10px 16px', borderRadius:8, border:'none', background:'#27ae60', color:'#fff', fontWeight:'bold', cursor:'pointer' };
const medianBox = { textAlign:'center', color:'#f1c40f', fontWeight:'bold' };
const table = { width:'100%', borderCollapse:'collapse', marginTop:12 };
const thead = { background:'#1a2a4f' };
const th = { padding:10, cursor:'pointer', borderBottom:'2px solid #4fa3f7', textAlign:'left' };
const td = { padding:10, borderBottom:'1px solid #3b4f7f', verticalAlign:'top' };
const link = { color:'#4fa3f7', fontWeight:'bold', textDecoration:'none' };

/* =========================================================
   3) README (quick)
   ---------------------------------------------------------
   1. Créez un compte Apify et ajoutez des Actors/Tasks pour SeLoger/Bien'ici
      - Exemple d'Actor: lexis-solutions/seloger-scraper (Store)
      - Exemple d'Actor: qpayre/bien-ici-scraper (Store)
      - Configurez les filtres (vente/location, départements) et sauvegardez en TASK.
   2. Dans Vercel > Settings > Environment Variables
      - APIFY_TOKEN
      - DEFAULT_PROVIDER = seloger (ou bienici)
      - APIFY_SELOGER_TASK_ID, APIFY_BIENICI_TASK_ID (recommandé)
      - ou bien APIFY_SELOGER_ACTOR_ID, APIFY_BIENICI_ACTOR_ID
   3. Déployez. Ouvrez /. Réglez le département, lancez.

   Conformité & ToS: Vous ne scrapez pas vous-même les portails; vous consommez une API d'une plateforme tierce (Apify) qui fournit des connecteurs.
   Les prix de marché proviennent de la DVF (open data Étalab). 
========================================================= */
