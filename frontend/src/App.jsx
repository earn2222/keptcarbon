import React from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'

// Pages
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import MapPage from './pages/MapPage'
import MapPageNew from './pages/MapPageNew'
import HistoryPage from './pages/HistoryPage'
import ResponsiveDemo from './pages/ResponsiveDemo'
import PersonalDashboardPage from './pages/PersonalDashboardPage'


// Layout
import DashboardLayout from './layouts/DashboardLayout'

function App() {
    return (
        <Switch>
            {/* Public Routes */}
            <Route exact path="/" component={LandingPage} />
            <Route path="/login" component={LoginPage} />
            <Route path="/demo" component={ResponsiveDemo} />

            {/* 3D Globe Map - Full Screen */}
            <Route path="/globe" component={MapPage} />

            {/* Direct access to Map */}
            <Route path="/map" component={MapPage} />

            {/* Dashboard Routes */}
            <Route path="/dashboard/personal" component={PersonalDashboardPage} />
            <Route exact path="/dashboard" component={DashboardPage} />
            <Route path="/dashboard/history" component={HistoryPage} />

            {/* Redirect old path to new public path */}
            <Redirect from="/dashboard/map" to="/map" />

            {/* Fallback redirect */}
            <Redirect to="/" />
        </Switch>
    )
}

export default App
