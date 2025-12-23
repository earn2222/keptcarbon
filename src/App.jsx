import React from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'

// Pages
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import MapPage from './pages/MapPage'
import HistoryPage from './pages/HistoryPage'

// Layout
import DashboardLayout from './layouts/DashboardLayout'

function App() {
    return (
        <Switch>
            {/* Public Routes */}
            <Route exact path="/" component={LandingPage} />
            <Route path="/login" component={LoginPage} />

            {/* Protected Dashboard Routes */}
            <Route path="/dashboard">
                <DashboardLayout>
                    <Switch>
                        <Route exact path="/dashboard" component={DashboardPage} />
                        <Route path="/dashboard/map" component={MapPage} />
                        <Route path="/dashboard/history" component={HistoryPage} />
                    </Switch>
                </DashboardLayout>
            </Route>

            {/* Fallback redirect */}
            <Redirect to="/" />
        </Switch>
    )
}

export default App
