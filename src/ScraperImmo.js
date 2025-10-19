/*
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
