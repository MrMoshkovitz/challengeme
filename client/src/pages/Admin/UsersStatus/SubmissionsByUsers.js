import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import Loading from '../../../components/Loading/Loading';
import network from '../../../services/network';
import '../Admin.css';

const StyledTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  body: {
    fontSize: 14,
  },
}))(TableCell);

const StyledTableRow = withStyles((theme) => ({
  root: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
  },
}))(TableRow);

const useRowStyles = makeStyles({
  root: {
    '& > *': {
      borderBottom: 'unset',
    },
  },
});

function Row(props) {
  const { row } = props;
  const [open, setOpen] = React.useState(false);
  const classes = useRowStyles();
  return (
    <React.Fragment>
      <StyledTableRow className={classes.root}>
        <StyledTableCell>
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </StyledTableCell>
        <StyledTableCell component="th" scope="row">
          {row.userName}
        </StyledTableCell>
        <StyledTableCell align="left">{row.firstName}</StyledTableCell>
        <StyledTableCell align="left">{row.lastName}</StyledTableCell>
        <StyledTableCell align="left">{row.phoneNumber}</StyledTableCell>
        <StyledTableCell align="left">{row.email}</StyledTableCell>
      </StyledTableRow>
      <StyledTableRow>
        <StyledTableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box margin={1}>
              <Typography variant="h6" gutterBottom component="div">
                More Details
              </Typography>
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <StyledTableCell>Challenge Name</StyledTableCell>
                    <StyledTableCell align="left">Solution Repository</StyledTableCell>
                    <StyledTableCell align="left">Status</StyledTableCell>
                    <StyledTableCell align="left">Created At</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.Submissions
                    && row.Submissions.map((submission) => (
                      <StyledTableRow key={submission.Challenge.name}>
                        <StyledTableCell component="th" scope="row">
                          {submission.Challenge.name}
                        </StyledTableCell>
                        <StyledTableCell align="left">{submission.solutionRepository}</StyledTableCell>
                        <StyledTableCell color="secondary">
                          <div
                            style={
                              submission.state === 'SUCCESS'
                                ? { color: 'green' }
                                : submission.state === 'FAIL'
                                  ? { color: 'red' }
                                  : { color: 'black' }
                            }
                          >
                            {submission.state}
                          </div>
                        </StyledTableCell>
                        <StyledTableCell align="left">
                          {new Date(submission.createdAt)
                            .toString()
                            .substring(0, 24)}
                        </StyledTableCell>
                      </StyledTableRow>
                    ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </StyledTableCell>
      </StyledTableRow>
    </React.Fragment>
  );
}

const SubmissionsByUsers = () => {
  const [data, setData] = useState([]);

  async function fetchData() {
    const { data } = await network.get('/api/v1/statistics/insights/users-submissions');
    setData(data);
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="admin-page">
      <div className="align-and-margin-top">
        <h1>This is All The Submissions By Users Page</h1>
        <Button variant="contained" color="secondary">
          <Link to="/admin">
            <h2>Admin Router</h2>
          </Link>
        </Button>
        <TableContainer component={Paper}>
          <Table aria-label="collapsible table">
            <TableHead>
              <TableRow>
                <StyledTableCell />
                <StyledTableCell color="secondary">User Name</StyledTableCell>
                <StyledTableCell align="left">First Name</StyledTableCell>
                <StyledTableCell align="left">Last Name</StyledTableCell>
                <StyledTableCell align="left">Phone Number</StyledTableCell>
                <StyledTableCell align="left">Email</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.length > 0 ? (
                data.map((user) => (
                  <Row key={user.userName} color="secondary" row={user} />
                ))
              ) : (
                <Loading />
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
};

export default SubmissionsByUsers;
