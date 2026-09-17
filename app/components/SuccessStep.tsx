"use client";
import { useState, useEffect } from "react";
import { Button } from "@gouvfr-lasuite/ui-components";
import { Send, Download } from "@gouvfr-lasuite/ui-components/icons";
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from "@react-pdf/renderer";

// --- STYLES DU DOCUMENT PDF ---
const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: 'Helvetica', color: '#111827' },
  header: { marginBottom: 30, borderBottom: '1px solid #e5e7eb', paddingBottom: 15 },
  mainTitle: { fontSize: 20, fontWeight: 'bold', color: '#000091', marginBottom: 15 },
  infoRow: { flexDirection: 'row', marginBottom: 5 },
  infoLabel: { width: 130, fontWeight: 'bold', color: '#4b5563' },
  infoValue: { flex: 1 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', marginTop: 25, marginBottom: 10, color: '#1f2937' },
  recipientTitle: { fontSize: 12, fontWeight: 'bold', marginTop: 15, marginBottom: 8, color: '#4338ca' },
  table: { width: '100%', border: '1px solid #e5e7eb', marginTop: 5 },
  tableRow: { flexDirection: 'row', borderBottom: '1px solid #e5e7eb', padding: 6 },
  tableHeader: { backgroundColor: '#f3f4f6', fontWeight: 'bold' },
  colPath: { flex: 1, paddingRight: 10 },
  noData: { fontStyle: 'italic', color: '#6b7280', marginTop: 10 }
});

// --- MAQUETTE DU RAPPORT ---
const HandoverReportPDF = ({ data }: { data: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* HEADER DE CERTIFICATION */}
      <View style={styles.header}>
        <Text style={styles.mainTitle}>Certificat de Passation (Audit d'Espace)</Text>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Date d'exécution :</Text><Text style={styles.infoValue}>{data.date}</Text></View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Agent Sortant :</Text><Text style={styles.infoValue}>{data.departingUserName}</Text></View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Opérateur (Audit) :</Text><Text style={styles.infoValue}>{data.auditorEmail}</Text></View>
      </View>

      {/* SECTION DES TRANSFERTS */}
      <Text style={styles.sectionTitle}>1. Historique des Transferts de Propriété</Text>
      {data.transfers.length === 0 ? (
        <Text style={styles.noData}>Aucun fichier transféré lors de cette session.</Text>
      ) : (
        data.transfers.map((transfer: any, idx: number) => (
          <View key={idx} wrap={false}>
            <Text style={styles.recipientTitle}>• Transféré à : {transfer.recipientName}</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={styles.colPath}>Chemin d'origine du fichier / dossier</Text>
              </View>
              {transfer.items.map((item: any, i: number) => (
                <View style={styles.tableRow} key={i}>
                  <Text style={styles.colPath}>{item.path}</Text>
                </View>
              ))}
            </View>
          </View>
        ))
      )}

      {/* SECTION DES SUPPRESSIONS */}
      <Text style={styles.sectionTitle}>2. Historique des Suppressions</Text>
      {data.deletions.length === 0 ? (
        <Text style={styles.noData}>Aucun fichier n'a été mis à la corbeille lors de cette session.</Text>
      ) : (
        <View style={styles.table} wrap={false}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.colPath}>Chemin d'origine du fichier / dossier supprimé</Text>
          </View>
          {data.deletions.map((item: any, i: number) => (
            <View style={styles.tableRow} key={i}>
              <Text style={styles.colPath}>{item.path}</Text>
            </View>
          ))}
        </View>
      )}
    </Page>
  </Document>
);

export default function SuccessStep({ departingUserName, reportData, onReset }: { departingUserName: string, reportData: any, onReset: () => void }) {
  // Obligatoire dans Next.js pour que le PDFDownloadLink ne déclenche pas d'erreur côté Serveur (SSR)
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);

  return (
    <div className="flex flex-col items-center text-center bg-white dark:bg-zinc-900 p-12 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 max-w-xl mx-auto animate-fade-in">
      <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
        <Send size="xl" />
      </div>

      <h2 className="text-3xl font-bold mb-4 text-zinc-900 dark:text-white">Opération réussie !</h2>
      <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-10">
        Les transferts de propriété et suppressions pour l'agent <strong>{departingUserName}</strong> ont bien été validés et appliqués au Drive.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button variant="secondary" onClick={onReset}>
          Retourner à l'accueil
        </Button>

        {isClient && reportData && (
          <PDFDownloadLink
            document={<HandoverReportPDF data={reportData} />}
            fileName={`Rapport_Passation_${departingUserName.replace(/\s+/g, '_')}.pdf`}
            className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-[#000091] hover:bg-[#1212ff] text-white font-medium rounded transition-colors"
          >
            {/* @ts-ignore : react-pdf gère le composant enfant via une fonction interne */}
            {({ loading }) => loading ? "Génération du PDF..." : <><Download /> Télécharger le rapport</>}
          </PDFDownloadLink>
        )}
      </div>
    </div>
  );
}
