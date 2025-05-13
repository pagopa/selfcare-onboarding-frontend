import fs from 'fs/promises';
import path from 'path';

async function globalTeardown() {
  try {
    const filePath = path.resolve(__dirname, '../storageState.json');
    console.log(`GLOBAL TEARDOWN: Attempting to delete ${filePath}`);

    try {
      await fs.access(filePath);
      await fs.unlink(filePath);
      console.log(`GLOBAL TEARDOWN: ✅ ${filePath} eliminato`);
    } catch (accessError: any) {
      console.log(`GLOBAL TEARDOWN: i️ ${filePath} non trovato: ${accessError.message}`);
    }

    // Verifica anche nella directory principale del progetto
    const rootFilePath = path.resolve(process.cwd(), 'storageState.json');
    if (rootFilePath !== filePath) {
      console.log(`GLOBAL TEARDOWN: Verifica anche in ${rootFilePath}`);
      try {
        await fs.access(rootFilePath);
        await fs.unlink(rootFilePath);
        console.log(`GLOBAL TEARDOWN: ✅ ${rootFilePath} eliminato`);
      } catch (accessError: any) {
        console.log(`GLOBAL TEARDOWN: i️ ${rootFilePath} non trovato: ${accessError.message}`);
      }
    }
  } catch (err) {
    console.error('GLOBAL TEARDOWN: ❌ Errore:', err);
  }
}

export default globalTeardown;
