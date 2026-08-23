import { Route, Switch } from "wouter";
import { Shell } from "./components/shell";
import { Onboarding } from "./components/onboarding";
import { useStore } from "./lib/store";
import { useReminders } from "./hooks/use-reminders";
import Dashboard from "./pages/dashboard";
import NutritionPage from "./pages/nutrition";
import WorkoutPage from "./pages/workout";
import ProgressPage from "./pages/progress";
import GuidePage from "./pages/guide";
import SettingsPage from "./pages/settings";

function App() {
  const s = useStore();
  useReminders();

  if (!s.profile) return <Onboarding />;

  return (
    <Shell>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/nutrition" component={NutritionPage} />
        <Route path="/seance" component={WorkoutPage} />
        <Route path="/progres" component={ProgressPage} />
        <Route path="/guide" component={GuidePage} />
        <Route path="/reglages" component={SettingsPage} />
      </Switch>
    </Shell>
  );
}

export default App;
