import React, { lazy } from 'react';

const SuccessSubmissionsPerUsers = lazy(() => import("./Charts/SuccessSubmissionsPerUsers"));
const LastWeekSubmissions = lazy(() => import("./Charts/LastWeekSubmissions"));
const SuccessPerChallenge = lazy(() => import("./Charts/SuccessPerChallenge"));
const TeamTotalSubmission = lazy(() => import("./Charts/TeamTotalSubmission"));
const TopSuccessUsers = lazy(() => import("./Charts/TopSuccessUsers"));


function DashBoard({ darkMode, teamName }) {

    return (
        <div >
            <h1>This DashBoard Teacher For Team{' '}{teamName}{' '}Page</h1>
            <TeamTotalSubmission darkMode={darkMode} />
            <SuccessPerChallenge darkMode={darkMode} />
            <SuccessSubmissionsPerUsers darkMode={darkMode} />
            <LastWeekSubmissions darkMode={darkMode} />
            <TopSuccessUsers darkMode={darkMode} />
        </div>
    )
}

export default DashBoard;
