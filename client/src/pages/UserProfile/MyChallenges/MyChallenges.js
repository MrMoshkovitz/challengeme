import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import mixpanel from 'mixpanel-browser';
import Cookies from 'js-cookie';
import Button from '@material-ui/core/Button';
import network from '../../../services/network';
import './MyChallenges.css';

const UserProfileLanding = () => {
  const [allMyChallenges, setAllMyChallenges] = useState([]);

  const getMyChallenges = async () => {
    try {
      const { data: allMyChallengesFromServer } = await network.get(
        '/api/v1/challenges/userChallenges',
      );
      setAllMyChallenges(allMyChallengesFromServer);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    const username = Cookies.get('userName');
    mixpanel.track('User On My Challenges Page', { User: `${username}` });
    getMyChallenges();
  }, []);
  const statusColor = (status) => {
    if (status === 'approved') {
      return {
        background:
          'linear-gradient(270deg, rgba(36,193,67,1) 0%, rgba(130,214,95,1) 100%)',
      };
    } if (status === 'denied') {
      return {
        background: 'linear-gradient(270deg, rgba(193,36,36,1) 0%, rgba(214,95,95,1) 100%)',
      };
    }
    return {
      background:
        'linear-gradient(270deg, rgba(198,198,198,1) 0%, rgba(116,116,116,1) 100%)',
    };
  };
  return (
    <div className="user-profile-my-challenges">
      <h1 className="user-profil-my-challenges-title">This is challenges page</h1>
      <div className="user-profile-my-challenges-container">
        {allMyChallenges
          && allMyChallenges.map((challenge) => {
            console.log(challenge);
            return (
              <div
                key={challenge.name + challenge.id}
                className="user-profile-single-challenge-container"
              >
                <div className="user-profile-single-challenge-title">
                  {challenge.name}
                </div>
                <div className="user-profile-single-challenge-labels-container">
                  {challenge.Labels ? (
                    challenge.Labels.map((label) => (
                      <div
                        className="user-profile-single-challenge-single-label"
                        key={label.name}
                      >
                        {label.name}
                      </div>
                    ))
                  ) : (
                    <div>Labels Not Found</div>
                  )}
                </div>
                <div className="user-profile-single-challenge-information-container">
                  <div>
                    <b>Id Challenge:</b>
                    {' '}
                    {challenge.id}
                  </div>
                  <div>
                    <b>Boiler Plate:</b>
                    {' '}
                    {challenge.boilerPlate}
                  </div>
                  <div>
                    <b>Repository Name:</b>
                    {' '}
                    {challenge.repositoryName}
                  </div>
                  <div>
                    <b>Description:</b>
                    {' '}
                    {challenge.description}
                  </div>
                  <div>
                    <b>Type:</b>
                    {' '}
                    {challenge.type}
                  </div>
                  <div>

                    <b>Created At:</b>
                    {' '}
                    {new Date(challenge.createdAt).toString().substring(0, 24)}
                  </div>
                  <div>
                    <b>Updated At:</b>
                    {' '}
                    {new Date(challenge.updatedAt).toString().substring(0, 24)}
                  </div>
                </div>
                <div
                  className="user-profile-single-challenge-status"
                  style={statusColor(challenge.state)}
                >
                  {challenge.state}
                </div>
              </div>
            );
          })}
      </div>
      <div className="user-profile-my-challenges-button-container">
        <Link to="/profile">
          <Button
            style={{ minWidth: 150 }}
            variant="contained"
            color="default"
          >
            back to My Profile
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default UserProfileLanding;
