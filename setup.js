import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Hack para __dirname em ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dirs = [
  'src/components/ui',
  'src/components/layout',
  'src/components/icons',
  'src/features/setup',
  'src/features/expenses',
  'src/features/distribution',
  'src/features/summary',
  'src/lib',
  'src/store',
  'src/types'
];

const files = [
  'src/types/index.ts',
  'src/store/useBillStore.ts',
  'src/lib/utils.ts',
  'src/lib/currency.ts',
  'src/lib/constants.ts',
  'src/components/layout/MobileShell.tsx',
  'src/components/layout/Header.tsx',
  'src/components/ui/Button.tsx',
  'src/components/ui/Card.tsx',
  'src/components/ui/Input.tsx',
  'src/components/ui/Modal.tsx',
  'src/components/ui/Avatar.tsx',
  'src/components/ui/NumericKeypad.tsx', // Adicionado
  'src/components/ui/MoneyDisplay.tsx',   // Adicionado
  'src/features/setup/SetupScreen.tsx'    // Adicionado
];

console.log('🚀 Iniciando configuração da estrutura...');

// 1. Criar Pastas
dirs.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`✅ Pasta criada: ${dir}`);
  }
});

// 2. Criar Arquivos (se não existirem)
files.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (!fs.existsSync(fullPath)) {
    fs.writeFileSync(fullPath, '// Placeholder');
    console.log(`📄 Arquivo criado: ${file}`);
  }
});

// 3. Limpar CSS padrão (opcional)
fs.writeFileSync(path.join(__dirname, 'src/App.css'), '');
fs.writeFileSync(path.join(__dirname, 'src/index.css'), '@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\nhtml, body { height: 100%; overscroll-behavior: none; user-select: none; }');

console.log('🏁 Estrutura criada com sucesso! Pode apagar o setup.js agora.');