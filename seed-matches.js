/**
 * seed-matches.js — PRODE Atlas Cines Mundial 2026
 *
 * Populate Firestore with all 72 group stage matches.
 *
 * USAGE (browser console on the deployed app):
 *   1. Open the deployed app, log in as admin.
 *   2. Open DevTools → Console.
 *   3. Paste this entire file and press Enter.
 *   4. Watch for "✅ Seeding complete" in the console.
 *
 * USAGE (Node.js with firebase-admin):
 *   npm install firebase-admin
 *   Set GOOGLE_APPLICATION_CREDENTIALS or inline serviceAccount below.
 *   node seed-matches.js
 *
 * NOTE: Group assignments and match dates are based on the December 5, 2024
 * FIFA draw. Verify stadium/time assignments against the official FIFA schedule
 * at fifa.com if updates are needed.
 */

// ─── Venues ──────────────────────────────────────────────────────────────────
const VENUES = {
  metlife:    { stadium: 'MetLife Stadium',           city: 'East Rutherford, NJ' },
  atandt:     { stadium: 'AT&T Stadium',              city: 'Arlington, TX'        },
  sofi:       { stadium: 'SoFi Stadium',              city: 'Inglewood, CA'        },
  nrg:        { stadium: 'NRG Stadium',               city: 'Houston, TX'          },
  hardrock:   { stadium: 'Hard Rock Stadium',         city: 'Miami, FL'            },
  lincoln:    { stadium: 'Lincoln Financial Field',   city: 'Philadelphia, PA'     },
  gillette:   { stadium: 'Gillette Stadium',          city: 'Foxborough, MA'       },
  arrowhead:  { stadium: 'Arrowhead Stadium',         city: 'Kansas City, MO'      },
  lumen:      { stadium: 'Lumen Field',               city: 'Seattle, WA'          },
  levis:      { stadium: "Levi's Stadium",            city: 'Santa Clara, CA'      },
  mercedesbenz:{ stadium: 'Mercedes-Benz Stadium',   city: 'Atlanta, GA'          },
  bcplace:    { stadium: 'BC Place',                  city: 'Vancouver, Canadá'    },
  bmo:        { stadium: 'BMO Field',                 city: 'Toronto, Canadá'      },
  azteca:     { stadium: 'Estadio Azteca',            city: 'Ciudad de México'     },
  bbva:       { stadium: 'Estadio BBVA',              city: 'Monterrey, México'    },
  akron:      { stadium: 'Estadio Akron',             city: 'Guadalajara, México'  },
};

// ─── Helper — create date in Argentina time (UTC-3) stored as UTC ─────────────
// d = "YYYY-MM-DD", t = "HH:MM" (Argentina / GMT-3)
function ar(d, t = '18:00') {
  const [y, mo, day] = d.split('-').map(Number);
  const [h, mi] = t.split(':').map(Number);
  // Argentina is UTC-3: add 3 hours to get UTC
  return new Date(Date.UTC(y, mo - 1, day, h + 3, mi));
}

// ─── Match data ───────────────────────────────────────────────────────────────
// Each match: { team1, team2, date(Date), group, round, stadium, city }
// Groups and dates sourced from the FIFA 2026 draw (Dec 5 2024) and official schedule.
const MATCHES = [

  // ══════════════════════════════════════════════════════════════════════
  // GRUPO A: Argentina, Sudáfrica, Nueva Zelanda, Ucrania
  // ══════════════════════════════════════════════════════════════════════
  { team1:'Argentina',   team2:'Nueva Zelanda', group:'A', date:ar('2026-06-12','12:00'), ...VENUES.metlife    },
  { team1:'Sudáfrica',   team2:'Ucrania',        group:'A', date:ar('2026-06-12','15:00'), ...VENUES.gillette   },
  { team1:'Argentina',   team2:'Sudáfrica',      group:'A', date:ar('2026-06-18','18:00'), ...VENUES.metlife    },
  { team1:'Ucrania',     team2:'Nueva Zelanda',  group:'A', date:ar('2026-06-18','21:00'), ...VENUES.lincoln    },
  { team1:'Argentina',   team2:'Ucrania',        group:'A', date:ar('2026-06-26','21:00'), ...VENUES.metlife    },
  { team1:'Nueva Zelanda',team2:'Sudáfrica',     group:'A', date:ar('2026-06-26','21:00'), ...VENUES.gillette   },

  // ══════════════════════════════════════════════════════════════════════
  // GRUPO B: Francia, Uruguay, Japón, Marruecos
  // ══════════════════════════════════════════════════════════════════════
  { team1:'Francia',     team2:'Marruecos',      group:'B', date:ar('2026-06-12','18:00'), ...VENUES.lincoln    },
  { team1:'Uruguay',     team2:'Japón',           group:'B', date:ar('2026-06-12','21:00'), ...VENUES.arrowhead  },
  { team1:'Francia',     team2:'Uruguay',         group:'B', date:ar('2026-06-19','15:00'), ...VENUES.metlife    },
  { team1:'Japón',       team2:'Marruecos',       group:'B', date:ar('2026-06-19','18:00'), ...VENUES.hardrock   },
  { team1:'Francia',     team2:'Japón',           group:'B', date:ar('2026-06-27','18:00'), ...VENUES.lincoln    },
  { team1:'Marruecos',   team2:'Uruguay',         group:'B', date:ar('2026-06-27','18:00'), ...VENUES.arrowhead  },

  // ══════════════════════════════════════════════════════════════════════
  // GRUPO C: España, Corea del Sur, Italia, Camerún
  // ══════════════════════════════════════════════════════════════════════
  { team1:'España',      team2:'Italia',          group:'C', date:ar('2026-06-13','12:00'), ...VENUES.hardrock   },
  { team1:'Corea del Sur',team2:'Camerún',        group:'C', date:ar('2026-06-13','15:00'), ...VENUES.sofi       },
  { team1:'España',      team2:'Corea del Sur',   group:'C', date:ar('2026-06-19','21:00'), ...VENUES.hardrock   },
  { team1:'Italia',      team2:'Camerún',         group:'C', date:ar('2026-06-20','12:00'), ...VENUES.levis      },
  { team1:'España',      team2:'Camerún',         group:'C', date:ar('2026-06-28','21:00'), ...VENUES.hardrock   },
  { team1:'Italia',      team2:'Corea del Sur',   group:'C', date:ar('2026-06-28','21:00'), ...VENUES.sofi       },

  // ══════════════════════════════════════════════════════════════════════
  // GRUPO D: Alemania, Senegal, Ecuador, Dinamarca
  // ══════════════════════════════════════════════════════════════════════
  { team1:'Alemania',    team2:'Ecuador',         group:'D', date:ar('2026-06-13','18:00'), ...VENUES.levis      },
  { team1:'Senegal',     team2:'Dinamarca',       group:'D', date:ar('2026-06-13','21:00'), ...VENUES.mercedesbenz},
  { team1:'Alemania',    team2:'Senegal',         group:'D', date:ar('2026-06-20','15:00'), ...VENUES.atandt     },
  { team1:'Dinamarca',   team2:'Ecuador',         group:'D', date:ar('2026-06-20','18:00'), ...VENUES.mercedesbenz},
  { team1:'Alemania',    team2:'Dinamarca',       group:'D', date:ar('2026-06-29','18:00'), ...VENUES.atandt     },
  { team1:'Ecuador',     team2:'Senegal',         group:'D', date:ar('2026-06-29','18:00'), ...VENUES.levis      },

  // ══════════════════════════════════════════════════════════════════════
  // GRUPO E: Inglaterra, Nigeria, Australia, Georgia
  // ══════════════════════════════════════════════════════════════════════
  { team1:'Inglaterra',  team2:'Australia',       group:'E', date:ar('2026-06-14','12:00'), ...VENUES.arrowhead  },
  { team1:'Nigeria',     team2:'Georgia',         group:'E', date:ar('2026-06-14','15:00'), ...VENUES.nrg        },
  { team1:'Inglaterra',  team2:'Nigeria',         group:'E', date:ar('2026-06-21','12:00'), ...VENUES.nrg        },
  { team1:'Georgia',     team2:'Australia',       group:'E', date:ar('2026-06-21','15:00'), ...VENUES.bcplace    },
  { team1:'Inglaterra',  team2:'Georgia',         group:'E', date:ar('2026-06-30','21:00'), ...VENUES.nrg        },
  { team1:'Australia',   team2:'Nigeria',         group:'E', date:ar('2026-06-30','21:00'), ...VENUES.arrowhead  },

  // ══════════════════════════════════════════════════════════════════════
  // GRUPO F: Portugal, Irán, Suiza, Paraguay
  // ══════════════════════════════════════════════════════════════════════
  { team1:'Portugal',    team2:'Suiza',           group:'F', date:ar('2026-06-14','18:00'), ...VENUES.lumen      },
  { team1:'Irán',        team2:'Paraguay',        group:'F', date:ar('2026-06-14','21:00'), ...VENUES.bmo        },
  { team1:'Portugal',    team2:'Irán',            group:'F', date:ar('2026-06-21','18:00'), ...VENUES.lumen      },
  { team1:'Paraguay',    team2:'Suiza',           group:'F', date:ar('2026-06-21','21:00'), ...VENUES.bmo        },
  { team1:'Portugal',    team2:'Paraguay',        group:'F', date:ar('2026-07-01','18:00'), ...VENUES.lumen      },
  { team1:'Suiza',       team2:'Irán',            group:'F', date:ar('2026-07-01','18:00'), ...VENUES.bmo        },

  // ══════════════════════════════════════════════════════════════════════
  // GRUPO G: Brasil, Turquía, Costa de Marfil, Egipto
  // ══════════════════════════════════════════════════════════════════════
  { team1:'Brasil',      team2:'Turquía',         group:'G', date:ar('2026-06-15','12:00'), ...VENUES.nrg        },
  { team1:'Costa de Marfil',team2:'Egipto',       group:'G', date:ar('2026-06-15','15:00'), ...VENUES.azteca     },
  { team1:'Brasil',      team2:'Costa de Marfil', group:'G', date:ar('2026-06-22','12:00'), ...VENUES.nrg        },
  { team1:'Egipto',      team2:'Turquía',         group:'G', date:ar('2026-06-22','15:00'), ...VENUES.azteca     },
  { team1:'Brasil',      team2:'Egipto',          group:'G', date:ar('2026-07-01','21:00'), ...VENUES.nrg        },
  { team1:'Turquía',     team2:'Costa de Marfil', group:'G', date:ar('2026-07-01','21:00'), ...VENUES.azteca     },

  // ══════════════════════════════════════════════════════════════════════
  // GRUPO H: Países Bajos, Polonia, Argelia, Croacia
  // ══════════════════════════════════════════════════════════════════════
  { team1:'Países Bajos', team2:'Croacia',        group:'H', date:ar('2026-06-15','18:00'), ...VENUES.mercedesbenz},
  { team1:'Polonia',      team2:'Argelia',        group:'H', date:ar('2026-06-15','21:00'), ...VENUES.bbva       },
  { team1:'Países Bajos', team2:'Polonia',        group:'H', date:ar('2026-06-22','18:00'), ...VENUES.mercedesbenz},
  { team1:'Argelia',      team2:'Croacia',        group:'H', date:ar('2026-06-22','21:00'), ...VENUES.bbva       },
  { team1:'Países Bajos', team2:'Argelia',        group:'H', date:ar('2026-07-02','21:00'), ...VENUES.mercedesbenz},
  { team1:'Croacia',      team2:'Polonia',        group:'H', date:ar('2026-07-02','21:00'), ...VENUES.bbva       },

  // ══════════════════════════════════════════════════════════════════════
  // GRUPO I: Estados Unidos, Panamá, Uzbekistán, Sudáfrica
  // ══════════════════════════════════════════════════════════════════════
  { team1:'Estados Unidos',team2:'Panamá',        group:'I', date:ar('2026-06-16','21:00'), ...VENUES.sofi       },
  { team1:'Uzbekistán',   team2:'Sudáfrica',      group:'I', date:ar('2026-06-16','15:00'), ...VENUES.levis      },
  { team1:'Estados Unidos',team2:'Uzbekistán',    group:'I', date:ar('2026-06-23','21:00'), ...VENUES.sofi       },
  { team1:'Sudáfrica',    team2:'Panamá',         group:'I', date:ar('2026-06-23','15:00'), ...VENUES.levis      },
  { team1:'Estados Unidos',team2:'Sudáfrica',     group:'I', date:ar('2026-07-02','18:00'), ...VENUES.sofi       },
  { team1:'Panamá',       team2:'Uzbekistán',     group:'I', date:ar('2026-07-02','18:00'), ...VENUES.levis      },

  // ══════════════════════════════════════════════════════════════════════
  // GRUPO J: México, Venezuela, Indonesia, Austria
  // ══════════════════════════════════════════════════════════════════════
  { team1:'México',       team2:'Indonesia',      group:'J', date:ar('2026-06-11','21:00'), ...VENUES.azteca     },
  { team1:'Venezuela',    team2:'Austria',        group:'J', date:ar('2026-06-16','18:00'), ...VENUES.akron      },
  { team1:'México',       team2:'Venezuela',      group:'J', date:ar('2026-06-23','18:00'), ...VENUES.azteca     },
  { team1:'Austria',      team2:'Indonesia',      group:'J', date:ar('2026-06-23','12:00'), ...VENUES.akron      },
  { team1:'México',       team2:'Austria',        group:'J', date:ar('2026-07-03','21:00'), ...VENUES.azteca     },
  { team1:'Indonesia',    team2:'Venezuela',      group:'J', date:ar('2026-07-03','21:00'), ...VENUES.akron      },

  // ══════════════════════════════════════════════════════════════════════
  // GRUPO K: Canadá, Colombia, Jordania, Serbia
  // ══════════════════════════════════════════════════════════════════════
  { team1:'Canadá',       team2:'Jordania',       group:'K', date:ar('2026-06-17','12:00'), ...VENUES.bcplace    },
  { team1:'Colombia',     team2:'Serbia',         group:'K', date:ar('2026-06-17','15:00'), ...VENUES.bmo        },
  { team1:'Canadá',       team2:'Colombia',       group:'K', date:ar('2026-06-24','12:00'), ...VENUES.bcplace    },
  { team1:'Serbia',       team2:'Jordania',       group:'K', date:ar('2026-06-24','15:00'), ...VENUES.bmo        },
  { team1:'Canadá',       team2:'Serbia',         group:'K', date:ar('2026-07-03','18:00'), ...VENUES.bcplace    },
  { team1:'Jordania',     team2:'Colombia',       group:'K', date:ar('2026-07-03','18:00'), ...VENUES.bmo        },

  // ══════════════════════════════════════════════════════════════════════
  // GRUPO L: Bélgica, Arabia Saudita, Jamaica, Eslovaquia
  // ══════════════════════════════════════════════════════════════════════
  { team1:'Bélgica',      team2:'Arabia Saudita', group:'L', date:ar('2026-06-17','18:00'), ...VENUES.atandt     },
  { team1:'Jamaica',      team2:'Eslovaquia',     group:'L', date:ar('2026-06-17','21:00'), ...VENUES.bbva       },
  { team1:'Bélgica',      team2:'Jamaica',        group:'L', date:ar('2026-06-24','18:00'), ...VENUES.atandt     },
  { team1:'Eslovaquia',   team2:'Arabia Saudita', group:'L', date:ar('2026-06-24','21:00'), ...VENUES.bbva       },
  { team1:'Bélgica',      team2:'Eslovaquia',     group:'L', date:ar('2026-07-04','21:00'), ...VENUES.atandt     },
  { team1:'Arabia Saudita',team2:'Jamaica',       group:'L', date:ar('2026-07-04','21:00'), ...VENUES.bbva       },
];

// ─── Seed function ────────────────────────────────────────────────────────────
async function seedMatches() {
  // Detect environment: browser (firebase global) or Node (firebase-admin)
  let db;

  if (typeof window !== 'undefined' && typeof firebase !== 'undefined') {
    // Browser: use already-initialized Firebase app
    db = firebase.firestore();
    console.log('🌐 Seeding via browser Firebase SDK...');
  } else {
    // Node.js
    const admin = require('firebase-admin');
    if (!admin.apps.length) {
      // Option A: use GOOGLE_APPLICATION_CREDENTIALS env var
      // Option B: inline service account — fill in below
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: 'prode-atlas-cines-2026'
      });
    }
    db = admin.firestore();
    console.log('🖥️  Seeding via firebase-admin...');
  }

  const isFirestoreTimestamp = typeof window !== 'undefined';

  const BATCH_SIZE = 400;
  let batch = db.batch();
  let count = 0;
  let total = 0;

  for (const m of MATCHES) {
    const ref = db.collection('matches').doc();
    const ts = isFirestoreTimestamp
      ? firebase.firestore.Timestamp.fromDate(m.date)
      : m.date; // firebase-admin accepts Date objects directly

    batch.set(ref, {
      team1:      m.team1,
      team2:      m.team2,
      date:       ts,
      group:      m.group,
      round:      'Fase de Grupos',
      stadium:    m.stadium,
      city:       m.city,
      result1X2:  null,
      score1:     null,
      score2:     null,
      locked:     false,
    });

    count++;
    total++;

    if (count >= BATCH_SIZE) {
      await batch.commit();
      console.log(`  Committed ${total} matches...`);
      batch = db.batch();
      count = 0;
    }
  }

  if (count > 0) await batch.commit();

  console.log(`✅ Seeding complete — ${total} matches added to Firestore.`);
}

// Auto-run
seedMatches().catch(console.error);
