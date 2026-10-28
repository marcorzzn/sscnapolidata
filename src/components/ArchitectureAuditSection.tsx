import React, { useState } from 'react';
import { Copy, Check, RotateCcw, Terminal, ShieldCheck } from 'lucide-react';
import { SQL_MIGRATIONS_CODE, DN_CLI_PYTHON_CODE } from '../data/napoliVerifiedData';

interface AuditEntry {
  audit_id: number;
  ts: string;
  tabella: string;
  pk: string;
  azione: 'I' | 'U' | 'D';
  campo: string;
  vecchio: string;
  nuovo: string;
  attore: string;
  motivo: string;
  fonte_id: number | null;
  batch_id: string;
}

interface ArchitectureAuditProps {
  lang: 'it' | 'en';
}

export const ArchitectureAuditSection: React.FC<ArchitectureAuditProps> = ({ lang }) => {
  const [copiedBlock, setCopiedBlock] = useState<string | null>(null);

  // Interactive simulation of `dn.py fix` and `dn.py revert`
  const [simScoreHome, setSimScoreHome] = useState<number>(2);
  const [simVerificato, setSimVerificato] = useState<0 | 1>(0);
  const [simMotivo, setSimMotivo] = useState<string>('Risultato errato su Wikipedia IT');
  const [simFonteId, setSimFonteId] = useState<string>('57');
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([
    {
      audit_id: 8811,
      ts: '2026-10-15T14:22:10.412Z',
      tabella: 'partite',
      pk: '1234',
      azione: 'U',
      campo: 'stadio',
      vecchio: 'null',
      nuovo: '"Stadio San Paolo"',
      attore: 'marco',
      motivo: 'Integrazione tabellino storico Almanacco Panini',
      fonte_id: 12,
      batch_id: 'fix-2026-10-15-a',
    },
  ]);
  const [conflictLogs, setConflictLogs] = useState<
    { id: number; ts: string; pk: string; campo: string; dbVal: string; srcVal: string; status: string }[]
  >([
    {
      id: 1,
      ts: '2026-10-17T17:20:00Z',
      pk: 'partita:2026-10-17-venezia-napoli',
      campo: 'rigori_parati (Stanković)',
      dbVal: '0 (cronologia ufficiale)',
      srcVal: '1 (scheda giocatore Report Lega)',
      status: 'aperto (da_verificare)',
    },
  ]);

  const executeSimulatedFix = (newVal: number) => {
    if (newVal === simScoreHome) return;
    const nextAuditId = (auditLogs[0]?.audit_id || 8810) + 1;
    const fonteNum = simFonteId.trim() ? Number(simFonteId) : null;
    const newEntry: AuditEntry = {
      audit_id: nextAuditId,
      ts: new Date().toISOString(),
      tabella: 'partite',
      pk: '1234',
      azione: 'U',
      campo: 'gol_casa',
      vecchio: JSON.stringify(simScoreHome),
      nuovo: JSON.stringify(newVal),
      attore: 'marco',
      motivo: simMotivo || 'Correzione manuale da CLI dn.py',
      fonte_id: fonteNum,
      batch_id: `fix-${new Date().toISOString().slice(0, 10)}-a`,
    };
    setSimScoreHome(newVal);
    setSimVerificato(fonteNum ? 1 : 0);
    setAuditLogs([newEntry, ...auditLogs]);
  };

  const executeSimulatedRevert = (entry: AuditEntry) => {
    if (entry.tabella === 'partite' && entry.pk === '1234' && entry.campo === 'gol_casa') {
      const restoredVal = Number(JSON.parse(entry.vecchio));
      const nextAuditId = (auditLogs[0]?.audit_id || 8810) + 1;
      const revertEntry: AuditEntry = {
        audit_id: nextAuditId,
        ts: new Date().toISOString(),
        tabella: 'partite',
        pk: '1234',
        azione: 'U',
        campo: 'gol_casa',
        vecchio: JSON.stringify(simScoreHome),
        nuovo: JSON.stringify(restoredVal),
        attore: 'marco',
        motivo: `Revert di audit_id #${entry.audit_id}`,
        fonte_id: entry.fonte_id,
        batch_id: `revert-${entry.audit_id}`,
      };
      setSimScoreHome(restoredVal);
      setAuditLogs([revertEntry, ...auditLogs]);
    }
  };

  const simulateImporterRun = () => {
    if (simVerificato === 1) {
      setConflictLogs([
        {
          id: conflictLogs.length + 1,
          ts: new Date().toISOString(),
          pk: 'partite:1234',
          campo: 'gol_casa',
          dbVal: `${simScoreHome} (verificato=1, protetto)`,
          srcVal: '2 (71_run_wikipedia_all.py)',
          status: 'aperto (bloccato da verificato=1)',
        },
        ...conflictLogs,
      ]);
    } else {
      executeSimulatedFix(2);
    }
  };

  const copyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBlock(id);
    setTimeout(() => setCopiedBlock(null), 2000);
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="border-b border-[var(--border-hairline)] pb-5">
        <div className="text-xs font-mono-tabular text-[#01A0E8] tracking-widest uppercase">
          {lang === 'it'
            ? 'ARCHITETTURA DATABASE SQLITE, AUDIT TRAIL, CLI DN.PY & CONFORMITÀ LEGALE'
            : 'SQLITE DATABASE ARCHITECTURE, AUDIT TRAIL, DN.PY CLI & LEGAL COMPLIANCE'}
        </div>
        <h2 className="text-2xl md:text-3xl font-display font-extrabold tracking-tight mt-1">
          {lang === 'it'
            ? 'Manutenibilità, Copertura (ND/NA/Pending), Audit Reversibile e DDL'
            : 'Maintainability, Coverage (ND/NA/Pending), Reversible Audit & DDL'}
        </h2>
      </div>

      {/* 6 Architectural Pillars Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            num: '01',
            titleIt: 'Migrazioni SQL Numerate',
            titleEn: 'Numbered SQL Migrations',
            descIt:
              'File SQL puri in db/migrations/ con PRAGMA user_version come contatore e backup sqlite3.Connection.backup() automatico.',
            descEn:
              'Pure SQL files in db/migrations/ using PRAGMA user_version counter and automatic sqlite3.Connection.backup().',
          },
          {
            num: '02',
            titleIt: 'Assenza Dati senza Sentinelle',
            titleEn: 'Missing Data Without Sentinels',
            descIt:
              'NULL nelle colonne + tabella copertura (completo, parziale, nd, na, pending) + copertura_regole (es. xG NA prima del 2010).',
            descEn:
              'NULL in columns + copertura table (completo, parziale, nd, na, pending) + copertura_regole (e.g. xG NA pre-2010).',
          },
          {
            num: '03',
            titleIt: 'Qualità su 2 Assi & Protezione Import',
            titleEn: '2-Axis Quality & Import Guard',
            descIt:
              'confidence (alta/media/bassa) separata da verificato (0/1). Gli importer non sovrascrivono mai verificato=1 ma loggano in conflitti_import.',
            descEn:
              'confidence (alta/media/bassa) decoupled from verificato (0/1). Importers never overwrite verificato=1, logging to conflitti_import.',
          },
        ].map((item) => (
          <div
            key={item.num}
            className="p-5 bg-[var(--bg-secondary)] border border-[var(--border-hairline)]"
          >
            <div className="text-xs font-mono-tabular text-[#01A0E8] font-bold">
              SCELTA ARCHITETTURALE {item.num}
            </div>
            <h3 className="text-lg font-display font-bold mt-1">
              {lang === 'it' ? item.titleIt : item.titleEn}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">
              {lang === 'it' ? item.descIt : item.descEn}
            </p>
          </div>
        ))}
      </div>

      {/* Interactive Audit & CLI Simulator */}
      <div className="p-6 bg-[var(--bg-secondary)] border border-[#01A0E8]/35 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-hairline)] pb-4">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-5 h-5 text-[#01A0E8]" />
            <div>
              <h3 className="text-lg font-display font-bold">
                {lang === 'it'
                  ? 'Simulatore Interattivo CLI: dn.py fix, history, revert & conflitti_import'
                  : 'Interactive CLI Simulator: dn.py fix, history, revert & conflitti_import'}
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                {lang === 'it'
                  ? 'Prova la correzione reversibile di partite#1234 (da 2-1 a 1-1) e verifica come verificato=1 protegge il record dagli importer automatici.'
                  : 'Test reversible correction on partite#1234 (from 2-1 to 1-1) and see how verificato=1 protects the record from automated importers.'}
              </p>
            </div>
          </div>
          <div className="font-mono-tabular text-xs px-3 py-1.5 bg-[var(--bg-primary)] border border-[var(--border-hairline)]">
            Record: <span className="text-[#01A0E8] font-bold">partite#1234</span> · gol_casa ={' '}
            <span className="text-[#01A0E8] font-bold">{simScoreHome}</span> · gol_trasferta = 1 ·
            verificato = <span className="text-[#01A0E8] font-bold">{simVerificato}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Command Execution Panel */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-4 bg-[#08090B] border border-white/10 font-mono-tabular text-xs text-white space-y-3">
              <div className="text-[#01A0E8]">
                $ python dn.py fix partite 1234 gol_casa 1 --motivo "{simMotivo}" --fonte {simFonteId}
              </div>
              <div className="grid grid-cols-1 gap-2">
                <label className="text-[11px] text-[#9BA5B4]">
                  --motivo (obbligatorio per audit_log):
                  <input
                    type="text"
                    value={simMotivo}
                    onChange={(e) => setSimMotivo(e.target.value)}
                    className="mt-1 w-full bg-[#0E1116] border border-white/15 px-2.5 py-1.5 text-white text-xs"
                  />
                </label>
                <label className="text-[11px] text-[#9BA5B4]">
                  --fonte (ID fonte attiva verificato=1):
                  <input
                    type="text"
                    value={simFonteId}
                    onChange={(e) => setSimFonteId(e.target.value)}
                    className="mt-1 w-full bg-[#0E1116] border border-white/15 px-2.5 py-1.5 text-white text-xs"
                  />
                </label>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  onClick={() => executeSimulatedFix(1)}
                  className="px-3 py-1.5 bg-[#01A0E8] text-[#08090B] font-bold text-xs cursor-pointer"
                >
                  Esegui dn.py fix (gol_casa → 1)
                </button>
                <button
                  onClick={simulateImporterRun}
                  className="px-3 py-1.5 bg-transparent border border-[#01A0E8] text-[#01A0E8] font-bold text-xs cursor-pointer"
                >
                  Simula 71_run_wikipedia_all.py
                </button>
              </div>
            </div>

            {/* Conflitti Import Table */}
            <div className="p-4 bg-[var(--bg-primary)] border border-[var(--border-hairline)]">
              <div className="text-xs font-mono-tabular text-[#01A0E8] font-bold mb-2">
                TABELLA conflitti_import ({conflictLogs.length})
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto text-xs font-mono-tabular">
                {conflictLogs.map((c) => (
                  <div key={c.id} className="p-2.5 bg-[var(--bg-secondary)] border border-[var(--border-hairline)]">
                    <div className="text-[#01A0E8] font-bold">
                      {c.pk} · {c.campo}
                    </div>
                    <div className="text-[11px] text-[var(--text-secondary)]">
                      DB: {c.dbVal} ≠ Fonte: {c.srcVal}
                    </div>
                    <div className="text-[10px] mt-0.5">Stato: {c.status}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Live Audit Log Table with Revert Action */}
          <div className="lg:col-span-7 p-4 bg-[var(--bg-primary)] border border-[var(--border-hairline)]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono-tabular text-[#01A0E8] font-bold">
                TABELLA audit_log (Trigger AFTER UPDATE + json_quote)
              </span>
              <span className="text-[11px] font-mono-tabular text-[var(--text-secondary)]">
                Ogni revert è una normale UPDATE a sua volta loggata
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono-tabular border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border-hairline)] text-[var(--text-secondary)]">
                    <th className="py-2 pr-2">ID</th>
                    <th className="py-2 pr-2">Campo</th>
                    <th className="py-2 pr-2">Vecchio → Nuovo</th>
                    <th className="py-2 pr-2">Motivo & Fonte</th>
                    <th className="py-2 text-right">Revert</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-hairline)]">
                  {auditLogs.map((entry) => (
                    <tr key={entry.audit_id}>
                      <td className="py-2.5 pr-2 text-[#01A0E8] font-bold">#{entry.audit_id}</td>
                      <td className="py-2.5 pr-2">
                        {entry.tabella}.{entry.campo}
                      </td>
                      <td className="py-2.5 pr-2">
                        <span className="opacity-70">{entry.vecchio}</span> →{' '}
                        <span className="text-[#01A0E8] font-bold">{entry.nuovo}</span>
                      </td>
                      <td className="py-2.5 pr-2 font-sans">
                        <div>{entry.motivo}</div>
                        <div className="text-[10px] text-[var(--text-secondary)] font-mono-tabular">
                          attore: {entry.attore} · fonte_id: {entry.fonte_id ?? 'NULL'} · {entry.batch_id}
                        </div>
                      </td>
                      <td className="py-2.5 text-right">
                        {entry.campo === 'gol_casa' && (
                          <button
                            onClick={() => executeSimulatedRevert(entry)}
                            className="px-2.5 py-1 border border-[#01A0E8]/40 text-[#01A0E8] hover:bg-[#01A0E8] hover:text-[#08090B] transition-colors inline-flex items-center gap-1 cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Revert</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* SQLite Migrations & dn.py Code Blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 bg-[#0B0E13] border border-white/15 text-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
              <span className="text-xs font-mono-tabular text-[#01A0E8] font-bold">
                db/migrations/002..005_schema.sql (DDL Completo)
              </span>
              <button
                onClick={() => copyText('sql', SQL_MIGRATIONS_CODE)}
                className="px-3 py-1 text-xs font-mono-tabular border border-[#01A0E8]/40 text-[#01A0E8] hover:bg-[#01A0E8] hover:text-[#08090B] transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {copiedBlock === 'sql' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedBlock === 'sql' ? 'Copiato' : 'Copia DDL SQL'}</span>
              </button>
            </div>
            <pre className="text-[11px] font-mono-tabular text-[#D0D7E2] overflow-x-auto max-h-96 leading-relaxed">
              {SQL_MIGRATIONS_CODE}
            </pre>
          </div>
        </div>

        <div className="p-5 bg-[#0B0E13] border border-white/15 text-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
              <span className="text-xs font-mono-tabular text-[#01A0E8] font-bold">
                dn.py — Entry Point CLI Unificata (Python 3.13 stdlib)
              </span>
              <button
                onClick={() => copyText('dnpy', DN_CLI_PYTHON_CODE)}
                className="px-3 py-1 text-xs font-mono-tabular border border-[#01A0E8]/40 text-[#01A0E8] hover:bg-[#01A0E8] hover:text-[#08090B] transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {copiedBlock === 'dnpy' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedBlock === 'dnpy' ? 'Copiato' : 'Copia dn.py'}</span>
              </button>
            </div>
            <pre className="text-[11px] font-mono-tabular text-[#D0D7E2] overflow-x-auto max-h-96 leading-relaxed">
              {DN_CLI_PYTHON_CODE}
            </pre>
          </div>
        </div>
      </div>

      {/* Ethical, Open, Legal & Privacy Charter */}
      <div className="p-6 bg-[var(--bg-secondary)] border border-[var(--border-hairline)] space-y-4">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-[#01A0E8]" />
          <h3 className="text-lg font-display font-bold">
            {lang === 'it'
              ? 'Carta Etica, Legale, Open Data e Tutela Dati Utente (Zero-Tracking)'
              : 'Ethical, Legal, Open Data & User Privacy Charter (Zero-Tracking)'}
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[var(--text-secondary)] leading-relaxed">
          <div className="p-4 bg-[var(--bg-primary)] border border-[var(--border-hairline)]">
            <div className="font-bold text-[var(--text-primary)] mb-1">
              1. Licenze Fonti e Attribuzione Esplicita
            </div>
            I dati fattuali (risultati, date, marcatori) sono liberi da copyright ma sempre accompagnati da citazione della fonte (Report Ufficiale Lega Serie A, RSSSF, openfootball CC0, @kamasport_, ANSA). I testi derivati da Wikipedia rispettano la licenza CC BY-SA 4.0.
          </div>
          <div className="p-4 bg-[var(--bg-primary)] border border-[var(--border-hairline)]">
            <div className="font-bold text-[var(--text-primary)] mb-1">
              2. Conformità GDPR & Zero Profilazione
            </div>
            La piattaforma opera senza cookie di profilazione, senza tracker di terze parti e senza raccolta di dati personali. Le preferenze di lingua (IT/EN) e tema (Dark/Light) sono gestite esclusivamente in locale.
          </div>
          <div className="p-4 bg-[var(--bg-primary)] border border-[var(--border-hairline)]">
            <div className="font-bold text-[var(--text-primary)] mb-1">
              3. Trasparenza e Verificabilità (Zero Invenzioni)
            </div>
            Nessun dato mancante viene mai stimato o interpolato. Ogni lacuna delle fonti storiche è dichiarata tramite gli stati espliciti completo, parziale, nd, na, pending.
          </div>
        </div>
      </div>
    </div>
  );
};
