import React, { useState, useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { Logged } from "../context/LoggedInContext";
import AllChallenges from "../context/AllChallengesContext";
import FilteredLabels from "../context/FilteredLabelsContext";
import Register from "./Authentication/Register";
import Login from "./Authentication/Login";
import Cookies from "js-cookie";
import Forgot from "./Authentication/ForgotPasswordPage";
import ValidatingMail from "./Authentication/Register/ValidatingMail";
import network from "../services/network";
// import Landing from "./Authentication";
// import { AnimatePresence } from "framer-motion";
import Header from "../components/Header";
import ErrorBoundary from "../components/ErrorBoundary";
import Loading from "../components/Loading";
import "../index.css";
import NewChallengeForm from "./NewChallenge";
import UserProfile from "./UserProfile";
import Admin from "./Admin";
import Team from "./Team";
import PrivateRoute from '../Routes/privateRoute'
import PublicRoute from '../Routes/publicRoute'


const NotFound = lazy(() => import("../pages/NotFound"));
const Home = lazy(() => import("./Home"));
const LandingPage = lazy(() => import("./LandingPage"));
const ChallengePage = lazy(() => import("./OneChallenge"));

export default function Router() {
  const [darkTheme, setDarkTheme] = useState(false);
  const [logged, setLogged] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [challenges, setChallenges] = useState([]);
  const [filteredLabels, setFilteredLabels] = useState([]);

  useEffect(() => {
    if (logged) {
      const previousTheme = localStorage.getItem("darkMode"); //get previous selected theme

      if (previousTheme === "false") {
        setDarkTheme(false);
      } else if (previousTheme === "true") {
        setDarkTheme(true);
      } else {
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
          //check default theme of the user
          setDarkTheme(true);
        }
      }
    }
    (async () => {
      try {
        const { data: challengesFromServer } = await network.get("/api/v1/challenges");
        typeof challengesFromServer === "object" && setChallenges(challengesFromServer);
      } catch { }
    })();
  }, [logged]);

  useEffect(() => {
    // auth
    (async () => {
      try {
        if (Cookies.get("accessToken")) {
          const { data } = await network.get("/api/v1/auth/validate-token");
          setLogged(data);
          setIsAdmin(data.isAdmin)
          setLoading(false);
        } else if (Cookies.get("refreshToken")) {
          await network.post('/api/v1/auth/token', { token: Cookies.get('refreshToken') });
          setLoading(false);
        } else {
          setLoading(false);
        }
      } catch (error) {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <BrowserRouter>
      {!loading ? (
        <Logged.Provider value={{ logged, isAdmin, setLogged, setIsAdmin }}>
          <AllChallenges.Provider value={{ challenges, setChallenges }}>
            <FilteredLabels.Provider value={{ filteredLabels, setFilteredLabels }}>
              <Header darkMode={darkTheme} setDarkMode={setDarkTheme} />
              <div className={darkTheme ? "dark" : "light"}>
                <Suspense fallback={<Loading darkMode={darkTheme} />}>
                  <ErrorBoundary>
                    <Switch>
                      <Route exact={true} path="/" component={LandingPage} />
                      <Route exact={true} path="/challenges" component={Home} />
                      <Route exact={true} path="/challenges/:id" render={() => <ChallengePage darkMode={darkTheme} />} />
                      <PublicRoute exact={true} path="/register" component={Register} />
                      <PublicRoute exact={true} path="/login" component={Login} />
                      <PublicRoute exact={true} path="/forgot" component={Forgot} />
                      <PublicRoute exact={true} path="/auth" component={ValidatingMail} />
                      <PrivateRoute exact={true} path="/addnewchallenge" component={NewChallengeForm} darkMode={darkTheme} />
                      <PrivateRoute path="/profile" component={UserProfile} darkMode={darkTheme} />
                      <PrivateRoute path="/teams" component={Team} darkMode={darkTheme} />
                      {isAdmin && (
                        <PrivateRoute path="/admin" component={Admin} darkMode={darkTheme} />
                      )}
                      <Route path="*" component={NotFound} />
                    </Switch>
                  </ErrorBoundary>
                </Suspense>
              </div>
            </FilteredLabels.Provider>
          </AllChallenges.Provider>
        </Logged.Provider>
      ) : (
          <Loading firstLoading={true} />
        )}
    </BrowserRouter>
  );
}
