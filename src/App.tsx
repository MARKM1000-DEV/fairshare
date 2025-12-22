import { MobileShell } from './components/layout/MobileShell';
import { SetupScreen } from './features/setup/SetupScreen';
import { ExpensesScreen } from './features/expenses/ExpensesScreen';
import { DistributionScreen } from './features/distribution/DistributionScreen';
import { SummaryScreen } from './features/summary/SummaryScreen'; // <--- Importe
import { useBillStore } from './store/useBillStore';

function App() {
  const step = useBillStore((state) => state.step);

  return (
    <MobileShell>
      {step === 'setup' && <SetupScreen />}
      {step === 'expenses' && <ExpensesScreen />}
      {step === 'distribution' && <DistributionScreen />}
      {step === 'summary' && <SummaryScreen />} {/* <--- O Fim da Jornada */}
    </MobileShell>
  );
}

export default App;