/**
 * seed-matches.js — PRODE Atlas Cines Mundial 2026
 *
 * Datos OFICIALES del sorteo FIFA (Kennedy Center, Washington D.C., 5/12/2025).
 * Horarios confirmados el 6/12/2025.
 * 72 partidos de Fase de Grupos + 32 eliminatorios = 104 en total.
 *
 * Fuentes: fifa.com · wikipedia.org · skysports.com · sportsbrackets.net
 *
 * NOTAS DE VERIFICACIÓN:
 *   [1] Brasil vs Haití (19/6) — fuentes indican 20:30 ET. Verificar en fifa.com.
 *   [2] Grupo J jornada 3 (27/6) — fuentes: 21:00 ET (Sky Sports) o 22:00 ET (Yahoo).
 *       Se usa 21:00 ET. Verificar en fifa.com.
 *
 * USAGE (consola del navegador sobre la app desplegada, logueado como admin):
 *   1. Abrí la app, iniciá sesión como sebastian.s@atlascines.com
 *   2. DevTools → Console → pegá todo este archivo → Enter
 *
 * USAGE (Node.js con firebase-admin):
 *   npm install firebase-admin
 *   export GOOGLE_APPLICATION_CREDENTIALS=/ruta/a/serviceAccount.json
 *   node seed-matches.js
 */

// ─── Conversión de horario ────────────────────────────────────────────────────
// Todos los horarios fuente están en EDT (UTC-4).
// Argentina (ART) = UTC-3 → ART = EDT + 1 hora.
// La función almacena en UTC para que Firebase lo muestre en la zona horaria correcta.
function et(dateStr, timeStr) {
  const [y, mo, day] = dateStr.split('-').map(Number);
  const [h, mi] = timeStr.split(':').map(Number);
  // EDT = UTC-4: sumar 4 horas para obtener UTC
  return new Date(Date.UTC(y, mo - 1, day, h + 4, mi || 0));
}

// ─── Estadios ─────────────────────────────────────────────────────────────────
const V = {
  azteca:   { stadium: 'Estadio Azteca',            city: 'Ciudad de México'         },
  akron:    { stadium: 'Estadio Akron',              city: 'Guadalajara, México'      },
  bbva:     { stadium: 'Estadio BBVA',               city: 'Monterrey, México'        },
  metlife:  { stadium: 'MetLife Stadium',            city: 'East Rutherford, NJ'      },
  atandt:   { stadium: 'AT&T Stadium',               city: 'Arlington, Texas'         },
  sofi:     { stadium: 'SoFi Stadium',               city: 'Inglewood, California'    },
  nrg:      { stadium: 'NRG Stadium',                city: 'Houston, Texas'           },
  mercedes: { stadium: 'Mercedes-Benz Stadium',      city: 'Atlanta, Georgia'         },
  levis:    { stadium: "Levi's Stadium",             city: 'Santa Clara, California'  },
  lumen:    { stadium: 'Lumen Field',                city: 'Seattle, Washington'      },
  gillette: { stadium: 'Gillette Stadium',           city: 'Foxborough, Massachusetts'},
  lincoln:  { stadium: 'Lincoln Financial Field',    city: 'Filadelfia, Pensilvania'  },
  hardrock: { stadium: 'Hard Rock Stadium',          city: 'Miami, Florida'           },
  arrowhead:{ stadium: 'Arrowhead Stadium',          city: 'Kansas City, Misuri'      },
  bmo:      { stadium: 'BMO Field',                  city: 'Toronto, Canadá'          },
  bcplace:  { stadium: 'BC Place',                   city: 'Vancouver, Canadá'        },
};

// ─── Banderas ─────────────────────────────────────────────────────────────────
const F = {
  'México':                      '🇲🇽',
  'Corea del Sur':               '🇰🇷',
  'Sudáfrica':                   '🇿🇦',
  'República Checa':             '🇨🇿',
  'Canadá':                      '🇨🇦',
  'Bosnia y Herzegovina':        '🇧🇦',
  'Qatar':                       '🇶🇦',
  'Suiza':                       '🇨🇭',
  'Brasil':                      '🇧🇷',
  'Marruecos':                   '🇲🇦',
  'Haití':                       '🇭🇹',
  'Escocia':                     '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'Estados Unidos':              '🇺🇸',
  'Paraguay':                    '🇵🇾',
  'Australia':                   '🇦🇺',
  'Turquía':                     '🇹🇷',
  'Alemania':                    '🇩🇪',
  'Costa de Marfil':             '🇨🇮',
  'Ecuador':                     '🇪🇨',
  'Curaçao':                     '🇨🇼',
  'Países Bajos':                '🇳🇱',
  'Japón':                       '🇯🇵',
  'Suecia':                      '🇸🇪',
  'Túnez':                       '🇹🇳',
  'Bélgica':                     '🇧🇪',
  'Egipto':                      '🇪🇬',
  'Irán':                        '🇮🇷',
  'Nueva Zelanda':               '🇳🇿',
  'España':                      '🇪🇸',
  'Arabia Saudita':              '🇸🇦',
  'Uruguay':                     '🇺🇾',
  'Cabo Verde':                  '🇨🇻',
  'Francia':                     '🇫🇷',
  'Senegal':                     '🇸🇳',
  'Noruega':                     '🇳🇴',
  'Irak':                        '🇮🇶',
  'Argentina':                   '🇦🇷',
  'Argelia':                     '🇩🇿',
  'Austria':                     '🇦🇹',
  'Jordania':                    '🇯🇴',
  'Portugal':                    '🇵🇹',
  'Colombia':                    '🇨🇴',
  'Congo DR':                    '🇨🇩',
  'Uzbekistán':                  '🇺🇿',
  'Inglaterra':                  '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'Croacia':                     '🇭🇷',
  'Ghana':                       '🇬🇭',
  'Panamá':                      '🇵🇦',
};
const flag = t => F[t] || '🏳️';

// ─── 72 partidos de Fase de Grupos ────────────────────────────────────────────
const GROUP_MATCHES = [

  // ══ GRUPO A: México · Corea del Sur · Sudáfrica · República Checa ══
  { team1:'México',           team2:'Sudáfrica',         group:'A', date:et('2026-06-11','15:00'), ...V.azteca   },
  { team1:'Corea del Sur',    team2:'República Checa',   group:'A', date:et('2026-06-11','22:00'), ...V.akron    },
  { team1:'República Checa',  team2:'Sudáfrica',         group:'A', date:et('2026-06-18','12:00'), ...V.mercedes },
  { team1:'México',           team2:'Corea del Sur',     group:'A', date:et('2026-06-18','21:00'), ...V.akron    },
  { team1:'República Checa',  team2:'México',            group:'A', date:et('2026-06-24','21:00'), ...V.azteca   }, // simultáneo
  { team1:'Sudáfrica',        team2:'Corea del Sur',     group:'A', date:et('2026-06-24','21:00'), ...V.bbva     }, // simultáneo

  // ══ GRUPO B: Canadá · Bosnia y Herzegovina · Qatar · Suiza ══
  { team1:'Canadá',           team2:'Bosnia y Herzegovina', group:'B', date:et('2026-06-12','15:00'), ...V.bmo     },
  { team1:'Qatar',            team2:'Suiza',             group:'B', date:et('2026-06-13','15:00'), ...V.levis    },
  { team1:'Suiza',            team2:'Bosnia y Herzegovina', group:'B', date:et('2026-06-18','15:00'), ...V.sofi   },
  { team1:'Canadá',           team2:'Qatar',             group:'B', date:et('2026-06-18','18:00'), ...V.bcplace  },
  { team1:'Suiza',            team2:'Canadá',            group:'B', date:et('2026-06-24','15:00'), ...V.bcplace  }, // simultáneo
  { team1:'Bosnia y Herzegovina', team2:'Qatar',         group:'B', date:et('2026-06-24','15:00'), ...V.lumen    }, // simultáneo

  // ══ GRUPO C: Brasil · Marruecos · Haití · Escocia ══
  { team1:'Brasil',           team2:'Marruecos',         group:'C', date:et('2026-06-13','18:00'), ...V.metlife  },
  { team1:'Haití',            team2:'Escocia',           group:'C', date:et('2026-06-13','21:00'), ...V.gillette },
  { team1:'Escocia',          team2:'Marruecos',         group:'C', date:et('2026-06-19','18:00'), ...V.gillette },
  { team1:'Brasil',           team2:'Haití',             group:'C', date:et('2026-06-19','20:30'), ...V.lincoln  }, // [1] VERIFICAR hora
  { team1:'Escocia',          team2:'Brasil',            group:'C', date:et('2026-06-24','18:00'), ...V.hardrock }, // simultáneo
  { team1:'Marruecos',        team2:'Haití',             group:'C', date:et('2026-06-24','18:00'), ...V.mercedes }, // simultáneo

  // ══ GRUPO D: Estados Unidos · Paraguay · Australia · Turquía ══
  { team1:'Estados Unidos',   team2:'Paraguay',          group:'D', date:et('2026-06-12','21:00'), ...V.sofi     },
  { team1:'Australia',        team2:'Turquía',           group:'D', date:et('2026-06-13','00:00'), ...V.bcplace  },
  { team1:'Estados Unidos',   team2:'Australia',         group:'D', date:et('2026-06-19','15:00'), ...V.lumen    },
  { team1:'Turquía',          team2:'Paraguay',          group:'D', date:et('2026-06-19','23:00'), ...V.levis    },
  { team1:'Turquía',          team2:'Estados Unidos',    group:'D', date:et('2026-06-25','22:00'), ...V.sofi     }, // simultáneo
  { team1:'Paraguay',         team2:'Australia',         group:'D', date:et('2026-06-25','22:00'), ...V.levis    }, // simultáneo

  // ══ GRUPO E: Alemania · Costa de Marfil · Ecuador · Curaçao ══
  { team1:'Alemania',         team2:'Curaçao',           group:'E', date:et('2026-06-14','13:00'), ...V.nrg      },
  { team1:'Costa de Marfil',  team2:'Ecuador',           group:'E', date:et('2026-06-14','19:00'), ...V.lincoln  },
  { team1:'Alemania',         team2:'Costa de Marfil',   group:'E', date:et('2026-06-20','16:00'), ...V.bmo      },
  { team1:'Ecuador',          team2:'Curaçao',           group:'E', date:et('2026-06-20','20:00'), ...V.arrowhead},
  { team1:'Curaçao',          team2:'Costa de Marfil',   group:'E', date:et('2026-06-25','16:00'), ...V.lincoln  }, // simultáneo
  { team1:'Ecuador',          team2:'Alemania',          group:'E', date:et('2026-06-25','16:00'), ...V.metlife  }, // simultáneo

  // ══ GRUPO F: Países Bajos · Japón · Suecia · Túnez ══
  { team1:'Países Bajos',     team2:'Japón',             group:'F', date:et('2026-06-14','16:00'), ...V.atandt   },
  { team1:'Suecia',           team2:'Túnez',             group:'F', date:et('2026-06-14','22:00'), ...V.bbva     },
  { team1:'Países Bajos',     team2:'Suecia',            group:'F', date:et('2026-06-20','13:00'), ...V.nrg      },
  { team1:'Túnez',            team2:'Japón',             group:'F', date:et('2026-06-20','00:00'), ...V.bbva     },
  { team1:'Japón',            team2:'Suecia',            group:'F', date:et('2026-06-25','19:00'), ...V.atandt   }, // simultáneo
  { team1:'Túnez',            team2:'Países Bajos',      group:'F', date:et('2026-06-25','19:00'), ...V.arrowhead}, // simultáneo

  // ══ GRUPO G: Bélgica · Egipto · Irán · Nueva Zelanda ══
  { team1:'Bélgica',          team2:'Egipto',            group:'G', date:et('2026-06-15','15:00'), ...V.lumen    },
  { team1:'Irán',             team2:'Nueva Zelanda',     group:'G', date:et('2026-06-15','21:00'), ...V.sofi     },
  { team1:'Bélgica',          team2:'Irán',              group:'G', date:et('2026-06-21','15:00'), ...V.sofi     },
  { team1:'Nueva Zelanda',    team2:'Egipto',            group:'G', date:et('2026-06-21','21:00'), ...V.bcplace  },
  { team1:'Egipto',           team2:'Irán',              group:'G', date:et('2026-06-26','23:00'), ...V.lumen    }, // simultáneo
  { team1:'Nueva Zelanda',    team2:'Bélgica',           group:'G', date:et('2026-06-26','23:00'), ...V.bcplace  }, // simultáneo

  // ══ GRUPO H: España · Arabia Saudita · Uruguay · Cabo Verde ══
  { team1:'España',           team2:'Cabo Verde',        group:'H', date:et('2026-06-15','12:00'), ...V.mercedes },
  { team1:'Arabia Saudita',   team2:'Uruguay',           group:'H', date:et('2026-06-15','18:00'), ...V.hardrock },
  { team1:'España',           team2:'Arabia Saudita',    group:'H', date:et('2026-06-21','12:00'), ...V.mercedes },
  { team1:'Uruguay',          team2:'Cabo Verde',        group:'H', date:et('2026-06-21','18:00'), ...V.hardrock },
  { team1:'Cabo Verde',       team2:'Arabia Saudita',    group:'H', date:et('2026-06-26','20:00'), ...V.nrg      }, // simultáneo
  { team1:'Uruguay',          team2:'España',            group:'H', date:et('2026-06-26','20:00'), ...V.akron    }, // simultáneo

  // ══ GRUPO I: Francia · Senegal · Noruega · Irak ══
  { team1:'Francia',          team2:'Senegal',           group:'I', date:et('2026-06-16','15:00'), ...V.metlife  },
  { team1:'Irak',             team2:'Noruega',           group:'I', date:et('2026-06-16','18:00'), ...V.gillette },
  { team1:'Francia',          team2:'Irak',              group:'I', date:et('2026-06-22','17:00'), ...V.lincoln  },
  { team1:'Noruega',          team2:'Senegal',           group:'I', date:et('2026-06-22','20:00'), ...V.metlife  },
  { team1:'Noruega',          team2:'Francia',           group:'I', date:et('2026-06-26','15:00'), ...V.gillette }, // simultáneo
  { team1:'Senegal',          team2:'Irak',              group:'I', date:et('2026-06-26','15:00'), ...V.bmo      }, // simultáneo

  // ══ GRUPO J: Argentina · Argelia · Austria · Jordania ══
  { team1:'Argentina',        team2:'Argelia',           group:'J', date:et('2026-06-16','21:00'), ...V.arrowhead},
  { team1:'Austria',          team2:'Jordania',          group:'J', date:et('2026-06-16','00:00'), ...V.levis    },
  { team1:'Argentina',        team2:'Austria',           group:'J', date:et('2026-06-22','13:00'), ...V.atandt   },
  { team1:'Jordania',         team2:'Argelia',           group:'J', date:et('2026-06-22','23:00'), ...V.levis    },
  { team1:'Argelia',          team2:'Austria',           group:'J', date:et('2026-06-27','21:00'), ...V.arrowhead}, // [2] VERIFICAR
  { team1:'Jordania',         team2:'Argentina',         group:'J', date:et('2026-06-27','21:00'), ...V.atandt   }, // [2] VERIFICAR

  // ══ GRUPO K: Portugal · Colombia · Congo DR · Uzbekistán ══
  { team1:'Portugal',         team2:'Congo DR',          group:'K', date:et('2026-06-17','13:00'), ...V.nrg      },
  { team1:'Uzbekistán',       team2:'Colombia',          group:'K', date:et('2026-06-17','22:00'), ...V.azteca   },
  { team1:'Portugal',         team2:'Uzbekistán',        group:'K', date:et('2026-06-23','13:00'), ...V.nrg      },
  { team1:'Colombia',         team2:'Congo DR',          group:'K', date:et('2026-06-23','22:00'), ...V.akron    },
  { team1:'Colombia',         team2:'Portugal',          group:'K', date:et('2026-06-27','19:30'), ...V.hardrock }, // simultáneo
  { team1:'Congo DR',         team2:'Uzbekistán',        group:'K', date:et('2026-06-27','19:30'), ...V.mercedes }, // simultáneo

  // ══ GRUPO L: Inglaterra · Croacia · Ghana · Panamá ══
  { team1:'Inglaterra',       team2:'Croacia',           group:'L', date:et('2026-06-17','16:00'), ...V.atandt   },
  { team1:'Ghana',            team2:'Panamá',            group:'L', date:et('2026-06-17','19:00'), ...V.bmo      },
  { team1:'Inglaterra',       team2:'Ghana',             group:'L', date:et('2026-06-23','16:00'), ...V.gillette },
  { team1:'Panamá',           team2:'Croacia',           group:'L', date:et('2026-06-23','19:00'), ...V.bmo      },
  { team1:'Panamá',           team2:'Inglaterra',        group:'L', date:et('2026-06-27','17:00'), ...V.metlife  }, // simultáneo
  { team1:'Croacia',          team2:'Ghana',             group:'L', date:et('2026-06-27','17:00'), ...V.lincoln  }, // simultáneo

];

// ─── 32 partidos eliminatorios ────────────────────────────────────────────────
// Equipos como "Por definir" — el admin los actualiza cuando avanzan los clasificados.
// Los cruces de Ronda de 32 se describen según los clasificados teóricos.

const KNOCKOUT_MATCHES = [

  // ══ RONDA DE 32 (16 partidos) — 28 jun al 3 jul ══
  { team1:'2° Grupo A',               team2:'2° Grupo B',                round:'Ronda de 32', date:et('2026-06-28','15:00'), ...V.sofi,      group:'' },
  { team1:'1° Grupo E',               team2:'Mejor 3° (A/B/C/D/F)',      round:'Ronda de 32', date:et('2026-06-29','16:30'), ...V.gillette,  group:'' },
  { team1:'1° Grupo F',               team2:'2° Grupo C',                round:'Ronda de 32', date:et('2026-06-29','21:00'), ...V.bbva,      group:'' },
  { team1:'1° Grupo C',               team2:'2° Grupo F',                round:'Ronda de 32', date:et('2026-06-29','13:00'), ...V.nrg,       group:'' },
  { team1:'1° Grupo I',               team2:'Mejor 3° (C/D/F/G/H)',      round:'Ronda de 32', date:et('2026-06-30','17:00'), ...V.metlife,   group:'' },
  { team1:'2° Grupo E',               team2:'2° Grupo I',                round:'Ronda de 32', date:et('2026-06-30','13:00'), ...V.atandt,    group:'' },
  { team1:'1° Grupo A',               team2:'Mejor 3° (C/E/F/H/I)',      round:'Ronda de 32', date:et('2026-06-30','21:00'), ...V.azteca,    group:'' },
  { team1:'1° Grupo L',               team2:'Mejor 3° (E/H/I/J/K)',      round:'Ronda de 32', date:et('2026-07-01','12:00'), ...V.mercedes,  group:'' },
  { team1:'1° Grupo D',               team2:'Mejor 3° (B/E/F/I/J)',      round:'Ronda de 32', date:et('2026-07-01','20:00'), ...V.levis,     group:'' },
  { team1:'1° Grupo G',               team2:'Mejor 3° (A/E/H/I/J)',      round:'Ronda de 32', date:et('2026-07-01','16:00'), ...V.lumen,     group:'' },
  { team1:'2° Grupo K',               team2:'2° Grupo L',                round:'Ronda de 32', date:et('2026-07-02','19:00'), ...V.bmo,       group:'' },
  { team1:'1° Grupo H',               team2:'2° Grupo J',                round:'Ronda de 32', date:et('2026-07-02','15:00'), ...V.sofi,      group:'' },
  { team1:'1° Grupo B',               team2:'Mejor 3° (E/F/G/I/J)',      round:'Ronda de 32', date:et('2026-07-02','23:00'), ...V.bcplace,   group:'' },
  { team1:'1° Grupo J',               team2:'2° Grupo H',                round:'Ronda de 32', date:et('2026-07-03','18:00'), ...V.hardrock,  group:'' },
  { team1:'1° Grupo K',               team2:'Mejor 3° (D/E/I/J/L)',      round:'Ronda de 32', date:et('2026-07-03','21:30'), ...V.arrowhead, group:'' },
  { team1:'2° Grupo D',               team2:'2° Grupo G',                round:'Ronda de 32', date:et('2026-07-03','14:00'), ...V.atandt,    group:'' },

  // ══ OCTAVOS DE FINAL (8 partidos) — 4 al 7 jul ══
  { team1:'Por definir (P74)',         team2:'Por definir (P77)',         round:'Octavos de Final', date:et('2026-07-04','17:00'), ...V.lincoln,  group:'' },
  { team1:'Por definir (P73)',         team2:'Por definir (P75)',         round:'Octavos de Final', date:et('2026-07-04','13:00'), ...V.nrg,      group:'' },
  { team1:'Por definir (P76)',         team2:'Por definir (P78)',         round:'Octavos de Final', date:et('2026-07-05','16:00'), ...V.metlife,  group:'' },
  { team1:'Por definir (P79)',         team2:'Por definir (P80)',         round:'Octavos de Final', date:et('2026-07-05','20:00'), ...V.azteca,   group:'' },
  { team1:'Por definir (P83)',         team2:'Por definir (P84)',         round:'Octavos de Final', date:et('2026-07-06','15:00'), ...V.atandt,   group:'' },
  { team1:'Por definir (P81)',         team2:'Por definir (P82)',         round:'Octavos de Final', date:et('2026-07-06','20:00'), ...V.lumen,    group:'' },
  { team1:'Por definir (P86)',         team2:'Por definir (P88)',         round:'Octavos de Final', date:et('2026-07-07','12:00'), ...V.mercedes, group:'' },
  { team1:'Por definir (P85)',         team2:'Por definir (P87)',         round:'Octavos de Final', date:et('2026-07-07','16:00'), ...V.bcplace,  group:'' },

  // ══ CUARTOS DE FINAL (4 partidos) — 9 al 11 jul ══
  { team1:'Por definir (QF1)',         team2:'Por definir (QF2)',         round:'Cuartos de Final', date:et('2026-07-09','16:00'), ...V.gillette, group:'' },
  { team1:'Por definir (QF3)',         team2:'Por definir (QF4)',         round:'Cuartos de Final', date:et('2026-07-10','15:00'), ...V.sofi,     group:'' },
  { team1:'Por definir (QF5)',         team2:'Por definir (QF6)',         round:'Cuartos de Final', date:et('2026-07-11','17:00'), ...V.hardrock, group:'' },
  { team1:'Por definir (QF7)',         team2:'Por definir (QF8)',         round:'Cuartos de Final', date:et('2026-07-11','21:00'), ...V.arrowhead,group:'' },

  // ══ SEMIFINALES (2 partidos) — 14 y 15 jul ══
  { team1:'Por definir (SF1)',         team2:'Por definir (SF2)',         round:'Semifinales',      date:et('2026-07-14','15:00'), ...V.atandt,   group:'' },
  { team1:'Por definir (SF3)',         team2:'Por definir (SF4)',         round:'Semifinales',      date:et('2026-07-15','15:00'), ...V.mercedes, group:'' },

  // ══ TERCER PUESTO ══
  { team1:'Por definir',               team2:'Por definir',              round:'Tercer Puesto',    date:et('2026-07-18','17:00'), ...V.hardrock, group:'' },

  // ══ FINAL ══
  { team1:'Por definir',               team2:'Por definir',              round:'Final',            date:et('2026-07-19','15:00'), ...V.metlife,  group:'' },
];

const ALL_MATCHES = [
  ...GROUP_MATCHES.map(m => ({ ...m, round: 'Fase de Grupos' })),
  ...KNOCKOUT_MATCHES,
];

// ─── Función de carga ─────────────────────────────────────────────────────────
async function seedMatches() {
  let db;

  if (typeof window !== 'undefined' && typeof firebase !== 'undefined') {
    db = firebase.firestore();
    console.log('🌐 Iniciando seed desde navegador...');
  } else {
    const admin = require('firebase-admin');
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: 'prode-atlas-cines-2026'
      });
    }
    db = admin.firestore();
    console.log('🖥️  Iniciando seed desde Node.js...');
  }

  const isBrowser = typeof window !== 'undefined';
  const toTimestamp = (d) => isBrowser
    ? firebase.firestore.Timestamp.fromDate(d)
    : d; // firebase-admin acepta Date directamente

  const BATCH_SIZE = 400;
  let batch = db.batch();
  let count = 0;
  let total = 0;

  for (const m of ALL_MATCHES) {
    const ref = db.collection('matches').doc();
    batch.set(ref, {
      team1:     m.team1,
      team2:     m.team2,
      flag1:     flag(m.team1),
      flag2:     flag(m.team2),
      date:      toTimestamp(m.date),
      group:     m.group || '',
      round:     m.round,
      stadium:   m.stadium,
      city:      m.city,
      result1X2: null,
      score1:    null,
      score2:    null,
      locked:    false,
    });

    count++;
    total++;

    if (count >= BATCH_SIZE) {
      await batch.commit();
      console.log(`  ✓ ${total} partidos comprometidos...`);
      batch = db.batch();
      count = 0;
    }
  }

  if (count > 0) await batch.commit();

  console.log(`✅ Seed completo — ${total} partidos agregados a Firestore.`);
  console.log(`   Fase de Grupos: ${GROUP_MATCHES.length} partidos`);
  console.log(`   Eliminatorios:  ${KNOCKOUT_MATCHES.length} partidos`);
}

seedMatches().catch(console.error);
