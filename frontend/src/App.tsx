import { Route, Switch } from "wouter";
import Home from "./pages/Home";
import Game from "./pages/Game";
import Leaderboard from "./pages/Leaderboard";
import Stats from "./pages/Stats";
import Knowledge from "./pages/Knowledge";

export default function App() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/game" component={Game} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/stats" component={Stats} />
      <Route path="/knowledge" component={Knowledge} />
    </Switch>
  );
}
