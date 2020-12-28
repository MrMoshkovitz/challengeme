import React, { useState, useEffect, useContext } from "react";
import mixpanel from "mixpanel-browser";
import { Button } from "@material-ui/core";
import Rating from "@material-ui/lab/Rating";
import { makeStyles } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";
import { useParams, Link } from "react-router-dom";
import Cookies from "js-cookie";
import "../../styles/OneChallenge.css";
import ReviewsTab from "../../components/Reviews";
import SubmitModal from "../../components/Modals/SubmitModal";
import network from "../../services/network";
import Loading from "../../components/Loading";
import FilteredLabels from "../../context/FilteredLabelsContext";
import { Logged } from "../../context/LoggedInContext";
import Swal from "sweetalert2";
import Smili from '../../images/smili.svg'

const useStyles = makeStyles(() => ({
    SubmitdButton: {
        background:
            "linear-gradient(270deg, rgba(55,99,192,1) 0%, rgba(87,159,223,1) 100%)",
        color: "white",
        marginBottom: "10px",
        fontSize: "15px",
    },
    SubmitdButtonFail: {
        background:
            "linear-gradient(270deg, rgba(193,36,36,1) 0%, rgba(214,95,95,1) 100%)",
        color: "white",
        marginBottom: "10px",
        fontSize: "15px",
    },
    SubmitdButtonSuccess: {
        background:
            "linear-gradient(270deg, rgba(36,193,67,1) 0%, rgba(130,214,95,1) 100%);",
        color: "white",
        marginBottom: "10px",
        fontSize: "15px",
    },
}));

function generateTime(date) {
    let today = new Date(date);
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yyyy = today.getFullYear();
    today = `${yyyy}-${mm}-${dd}`;
    return `${today}`;
}

function ChallengePage({ darkMode }) {
    const classes = useStyles();
    const [submissions, setSubmissions] = useState();
    const [challenge, setChallenge] = useState(null);
    const { id: challengeId } = useParams();
    const [image, setImage] = useState("");
    const [submissionStatus, setSubmissionStatus] = useState();
    const [rating, setRating] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loadingReq, setLoadingReq] = useState(false);
    const [ratingCount, setRatingCount] = useState("");
    const [boilerPlate, setBoilerPlate] = useState("");

    const filteredLabels = useContext(FilteredLabels);
    const LoggedContext = useContext(Logged);

    const getBoilerPlate = async () => {
        const { data: boilerPlate } = await network.get(
            `/api/v1/challenges/boiler-plate/${challengeId}`
        );
        setBoilerPlate(boilerPlate.boilerPlate);
    };

    useEffect(() => {
        if (LoggedContext.logged) {
            const user = Cookies.get("userName");
            mixpanel.track("User On Challenge Page", {
                User: `${user}`,
                ChallengeId: `${challengeId}`,
            });
            getBoilerPlate();
        }
        // eslint-disable-next-line
    }, []);

    const getLastSubmissions = async () => {
        try {
            const { data: submission } = await network.get(
                `/api/v1/submissions/by-user/${challengeId}`
            );
            if (submission) {
                setSubmissionStatus({
                    state: submission.state,
                    createdAt: submission.createdAt,
                });
            } else {
                setSubmissionStatus(null);
            }
            setLoadingReq(true);
        } catch (error) { }
    };

    const fetchChallenge = async () => {
        try {
            const { data: challengeFromServer } = await network.get(
                `/api/v1/challenges/info/${challengeId}`
            );
            setChallenge(challengeFromServer);
            setRating(
                challengeFromServer.averageRaiting
                    ? Math.round(challengeFromServer.averageRaiting)
                    : 0
            );
            setSubmissions(challengeFromServer.submissionsCount);
            const { data: reviewsArrayFromServer } = await network.get(
                `/api/v1/reviews/${challengeId}`
            );
            setRatingCount(reviewsArrayFromServer.length);
        } catch (error) { }
    };

    const setImg = async () => {
        try {
            const { data } = await network.get(`/api/v1/images?id=${challengeId}`);
            setImage(data.img);
        } catch (error) { }
    };

    useEffect(() => {
        setImg();
        fetchChallenge();
        if (LoggedContext.logged) {
            getLastSubmissions();
        } else {
            setLoadingReq(true);
        }
        const getSubmissionInterval = setInterval(async () => {
            if (LoggedContext.logged) {
                getLastSubmissions();
            }
        }, 5000);

        return () => clearInterval(getSubmissionInterval);
        // eslint-disable-next-line
    }, [challengeId]);

    function handleModalClose() {
        setIsModalOpen(false);
    }
    const getSubmissionButton = () => {
        if (!submissionStatus) {
            return
        }

        if (submissionStatus.state === "PENDING") {
            return <CircularProgress style={{ marginBottom: "20px" }} />;
        }
        if (submissionStatus.state === "SUCCESS") {
            return (
                <Button
                    cy-test="submit-again-button"
                    className={classes.SubmitdButtonSuccess}
                    variant="contained"
                    onClick={() => setIsModalOpen(true)}
                >
                    Submit again
                </Button>
            );
        }
        return (
            <Button
                cy-test="submit-again-button"
                className={classes.SubmitdButtonFail}
                variant="contained"
                onClick={() => setIsModalOpen(true)}
            >
                Submit again
            </Button>
        );
    };

    const getSubmissionStatus = () => {
        if (!submissionStatus) {
            return (
                <div>
                    <p>
                        You have not submitted any solution to this challenge yet,
                        challenger! Prove your worth.
          </p>
                </div>
            );
        }
        if (submissionStatus.state === "SUCCESS") {
            return (
                <div style={{ textAlign: "center" }} cy-test="success-submission">
                    <p>
                        <div
                            style={{
                                fontSize: "25px",
                                fontWeight: "bold",
                                marginBottom: "5px",
                            }}
                        >
                            SUCCESS
            </div>
            You have already solved this challenge on{" "}
                        {generateTime(submissionStatus.createdAt)}
                        <br /> You can submit another solution if you’d like:
          </p>
                </div>
            );
        }
        if (submissionStatus.state === "PENDING") {
            return (
                <div cy-test="pending-submission">
                    <p>Your submission is being tested</p>
                </div>
            );
        }
        return (
            <div style={{ textAlign: "center" }} cy-test="fail-submission">
                <p>
                    <div
                        style={{
                            fontSize: "25px",
                            fontWeight: "bold",
                            marginBottom: "5px",
                        }}
                    >
                        FAIL
          </div>
          You tried to solved this challenge on{" "}
                    {generateTime(submissionStatus.createdAt)} <br /> You can try to
          submit again
        </p>
            </div>
        );
    };

    return challenge ? (
        <div className='One-Challenge-Page'>
            <section className="One-Challenge-Page-Head">
                <div
                    style={{
                        backgroundImage: `url('${image}')`,
                    }}
                    className="One-Challenge-Image-Container"
                >
                </div>
                <h1>{challenge.name}</h1>
                <h2>
                    <span>{challenge.Author.userName}</span>
                    <span>{generateTime(challenge.createdAt)}</span>
                    <span>{ratingCount} submissions</span>
                </h2>
                <p>{challenge.description}</p>
                <ul>
                    {challenge.Labels &&
                        challenge.Labels.map((label) => (
                            <Link
                                key={label.id}
                                className="remove"
                                to="/challenges"
                                onClick={() => filteredLabels.setFilteredLabels([label.id])}
                            >
                                <span>{label.name}</span>
                            </Link>
                        ))}
                </ul>
            </section>
            <section className="One-Challenge-Page-Control-Panel">
                <div className='One-Challenge-Page-Control-Panel-Rating' >
                    <img src={Smili} alt='smile' />
                    <div className='One-Challenge-Page-Control-Panel-Rating-Text' >
                        <p><b>{rating}</b>{' '} out of 5</p>
                        <p>{ratingCount}{' '}students rated this challenge</p>
                    </div>
                </div>
                <div className='One-Challenge-Page-Control-Panel-Start'>
                    {LoggedContext.logged ?
                        <a
                            className='One-Challenge-Page-Control-Panel-Start-Button'
                            onClick={async () => {
                                const user = Cookies.get('userName');
                                mixpanel.track('User Started Challenge', {
                                    User: `${user}`,
                                    ChallengeId: `${challengeId}`,
                                });
                                try {
                                    await network.post('/api/v1/webhooks/trigger-events/start-challenge', { challengeName: challenge.name });
                                } catch (error) {
                                }
                            }}
                            href={`https://github.com/${boilerPlate}`}
                            target="_blank"
                        >
                            Start Challenge
            </a> : <button
                            className='One-Challenge-Page-Control-Panel-Start-Button'
                            onClick={() => Swal.fire({
                                icon: 'error',
                                title: 'You Must Login First!',
                                showConfirmButton: true,
                            })}
                        >
                            Start Challenge
              </button>}
                </div>
                <div className="One-Challenge-Page-Control-Panel-Submit">
                    {loadingReq ? (
                        <div className="One-Challenge-Page-Control-Panel-Submit-Button">
                            {getSubmissionButton()}
                        </div>
                    ) : (
                            <div style={{ textAlign: 'center' }}>
                                <CircularProgress style={{ margin: '30px' }} />
                            </div>
                        )}
                    <SubmitModal
                        isOpen={isModalOpen}
                        handleClose={handleModalClose}
                        challengeParamId={challengeId}
                    />
                </div>

            </section>
            <section className='One-Challenge-Page-More'  >
                <h2 >You might also be interested in:</h2>
                <ul>

                </ul>
            </section>
            <section className='One-Challenge-Page-Reviews' >
                <ReviewsTab challengeId={challenge.id} setRatingCount={setRatingCount} />
            </section>
        </div>
    ) : (
            <Loading darkMode={darkMode} />
        );
}

export default ChallengePage;
